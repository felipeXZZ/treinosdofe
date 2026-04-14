import { useEffect, useState } from "react";
import * as React from "react";
import { supabase, isDemoMode } from "@/src/lib/supabase";
import { getDemoActiveDays, getCurrentDemoDay, resetDemoDay } from "@/src/lib/demo-data";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Play, Flame, Activity, Dumbbell, RotateCcw, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/src/lib/utils";

type PlanDay = {
  id: string;
  name: string;
  short_name?: string;
  day_order: number;
  is_rest_day: boolean;
  color?: string;
};

// ── Consistency helpers (localStorage, resets each calendar week) ────────────
function getConsistencyKey() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return `consistency_${format(weekStart, "yyyy-MM-dd")}`;
}
function loadConsistency(): Set<number> {
  try {
    const raw = localStorage.getItem(getConsistencyKey());
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}
function saveConsistency(days: Set<number>) {
  localStorage.setItem(getConsistencyKey(), JSON.stringify([...days]));
}

const DAY_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-yellow-500",
];

export function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [todayWorkout, setTodayWorkout] = useState<PlanDay | null>(null);
  const [allDays, setAllDays] = useState<PlanDay[]>([]);
  const [firstDayId, setFirstDayId] = useState<string | null>(null);
  const [trainedDays, setTrainedDays] = useState<Set<number>>(() => loadConsistency());
  const [weeklyCardioMinutes, setWeeklyCardioMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (isDemoMode) {
        const currentDay = getCurrentDemoDay();
        const activeDays = getDemoActiveDays();
        setProfile({ name: "Visitante (Demo)" });
        setTodayWorkout(currentDay);
        setAllDays(activeDays);
        setFirstDayId(activeDays[0].id);
        setWeeklyCardioMinutes(0);
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");

      // Round 1 – three independent queries in parallel
      const [profileRes, plansRes, cardioRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("workout_plans")
          .select("id, name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("cardio_logs")
          .select("duration_minutes")
          .eq("user_id", user.id)
          .gte("date", weekStartStr)
          .lte("date", weekEndStr),
      ]);

      setProfile(profileRes.data);
      if (cardioRes.data) {
        setWeeklyCardioMinutes(
          cardioRes.data.reduce((a: number, l: { duration_minutes: number }) => a + l.duration_minutes, 0)
        );
      }

      if (!plansRes.data || plansRes.data.length === 0) {
        navigate("/onboarding");
        return;
      }

      if (plansRes.data && plansRes.data.length > 0) {
        // Pick the plan that matches the profile's workout_type.
        // Fallback to the most recently created plan if none matches.
        const workoutType = profileRes.data?.workout_type ?? "upper_lower";
        const typeKeyMap: Record<string, string> = {
          upper_lower: "Upper",
          anterior_posterior: "Anterior",
          pacholok: "Pacholok",
        };
        const typeKey = typeKeyMap[workoutType] ?? "Upper";
        const activePlan =
          plansRes.data.find((p: { id: string; name: string }) => p.name.includes(typeKey)) ??
          plansRes.data[0];
        const planId = activePlan.id;

        // Round 2 – days list + last log (with day_order via join) in parallel
        const [daysRes, lastLogRes] = await Promise.all([
          supabase
            .from("workout_days")
            .select("id, name, day_order, is_rest_day")
            .eq("plan_id", planId)
            .order("day_order", { ascending: true }),
          supabase
            .from("workout_logs")
            .select("day_id, workout_days(day_order)")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(1),
        ]);

        const days = daysRes.data || [];
        setAllDays(days);
        if (days.length > 0) setFirstDayId(days[0].id);

        let nextDayOrder = 1;
        if (lastLogRes.data && lastLogRes.data.length > 0) {
          const last = lastLogRes.data[0] as any;
          if (last.workout_days?.day_order) {
            nextDayOrder = last.workout_days.day_order + 1;
          }
        }

        let nextDay = days.find((d: { day_order: number }) => d.day_order === nextDayOrder);
        if (!nextDay) nextDay = days[0];
        setTodayWorkout(nextDay ?? null);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConsistencyDay = (dayIndex: number) => {
    setTrainedDays((prev) => {
      const next = new Set<number>(prev);
      if (next.has(dayIndex)) next.delete(dayIndex);
      else next.add(dayIndex);
      saveConsistency(next);
      return next;
    });
  };

  const handleReset = () => {
    if (isDemoMode) {
      resetDemoDay();
      loadDashboardData();
    } else if (firstDayId) {
      navigate(`/workout/${firstDayId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin" />
          <span className="text-zinc-500 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  const firstName = profile?.name ? profile.name.split(" ")[0] : "Atleta";

  return (
    <div className="p-5 space-y-7 max-w-md mx-auto">
      {/* Header */}
      <header
        className="pt-4 animate-slide-up"
        style={{ animationDelay: "0ms" }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Olá, {firstName}</h1>
        <p className="text-zinc-400 text-sm capitalize mt-0.5">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </header>

      {/* Today's Workout */}
      {todayWorkout && (
        <section
          className="animate-slide-up"
          style={{ animationDelay: "60ms" }}
        >
          <h2 className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-widest">
            Próximo treino
          </h2>
          <div className="glass glass-strong rounded-2xl border overflow-hidden shadow-xl shadow-black/40">
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full mt-2 shrink-0 shadow-lg",
                    (todayWorkout as any).color ??
                      DAY_COLORS[(todayWorkout.day_order - 1) % DAY_COLORS.length]
                  )}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-zinc-100 leading-snug">
                    {todayWorkout.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {todayWorkout.is_rest_day
                      ? "Dia de descanso ou cardio leve"
                      : "Siga o plano e registre suas cargas"}
                  </p>
                </div>
              </div>
              <Button
                className="w-full transition-all active:scale-[0.98]"
                size="lg"
                onClick={() => navigate(`/workout/${todayWorkout.id}`)}
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                {todayWorkout.is_rest_day ? "Registrar Cardio" : "Iniciar Treino"}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section
        className="grid grid-cols-2 gap-3 animate-slide-up"
        style={{ animationDelay: "120ms" }}
      >
        <div className="bg-zinc-900/80 rounded-2xl border border-white/[0.07] p-4 flex flex-col items-center justify-center text-center">
          <Flame className="w-5 h-5 text-orange-400 mb-2" />
          <span className="text-2xl font-bold text-zinc-100">
            {trainedDays.size}
          </span>
          <span className="text-xs text-zinc-500 mt-0.5">Treinos na semana</span>
        </div>
        <div className="bg-zinc-900/80 rounded-2xl border border-white/[0.07] p-4 flex flex-col items-center justify-center text-center">
          <Activity className="w-5 h-5 text-blue-400 mb-2" />
          <span className="text-2xl font-bold text-zinc-100">
            {weeklyCardioMinutes}
          </span>
          <span className="text-xs text-zinc-500 mt-0.5">Min. de cardio</span>
        </div>
      </section>

      {/* Consistency dots — manual, tap to mark */}
      <section
        className="animate-slide-up"
        style={{ animationDelay: "180ms" }}
      >
        <h2 className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-widest">
          Consistência semanal
        </h2>
        <div className="glass rounded-2xl border p-4">
          <p className="text-[11px] text-zinc-600 mb-4 text-center">
            Toque no dia para marcar
          </p>
          <div className="flex justify-between items-center">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((label, i) => {
              // Display starts Monday (i=0) → getDay()=1, ..., Sunday (i=6) → getDay()=0
              const dayValue = (i + 1) % 7;
              const trained = trainedDays.has(dayValue);
              const isToday = new Date().getDay() === dayValue;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      isToday ? "text-zinc-300" : "text-zinc-600"
                    )}
                  >
                    {label}
                  </span>
                  <button
                    onClick={() => toggleConsistencyDay(dayValue)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90",
                      trained
                        ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-100/20"
                        : isToday
                        ? "bg-zinc-800 text-zinc-400 ring-1 ring-zinc-600"
                        : "bg-zinc-800/40 text-zinc-600 hover:bg-zinc-800"
                    )}
                  >
                    {trained && (
                      <CheckIcon className="w-4 h-4 animate-check-pop" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plan — all days */}
      {allDays.length > 0 && (
        <section
          className="animate-slide-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Plano de treino
            </h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Resetar sequência
            </button>
          </div>

          <div className="space-y-2">
            {allDays.map((day, idx) => {
              const isNext = day.id === todayWorkout?.id;
              const color =
                (day as any).color ?? DAY_COLORS[idx % DAY_COLORS.length];

              return (
                <button
                  key={day.id}
                  onClick={() => navigate(`/workout/${day.id}`)}
                  style={{ animationDelay: `${260 + idx * 40}ms` }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] animate-slide-up",
                    isNext
                      ? "glass-strong border-white/10 shadow-lg"
                      : "glass border-white/[0.05] hover:border-white/10"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight truncate",
                        isNext ? "text-zinc-100" : "text-zinc-400"
                      )}
                    >
                      {day.name}
                    </p>
                    {day.is_rest_day && (
                      <p className="text-xs text-zinc-600 mt-0.5">Descanso</p>
                    )}
                  </div>
                  {day.is_rest_day ? (
                    <Moon className="w-4 h-4 text-zinc-600 shrink-0" />
                  ) : (
                    <Dumbbell className="w-4 h-4 text-zinc-600 shrink-0" />
                  )}
                  {isNext && (
                    <span className="text-[10px] font-semibold bg-zinc-700/80 text-zinc-200 px-2 py-0.5 rounded-full shrink-0">
                      PRÓXIMO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="h-2" />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
