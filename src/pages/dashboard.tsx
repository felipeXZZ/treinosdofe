import { useEffect, useState } from "react";
import * as React from "react";
import { supabase, isDemoMode } from "@/src/lib/supabase";
import { migrateUpperLowerExercises, migratePacholokDay1 } from "@/src/lib/plan-templates";
import { getDemoActiveDays, getCurrentDemoDay, resetDemoDay } from "@/src/lib/demo-data";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Play, Flame, Activity, Dumbbell, RotateCcw, Moon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
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

// ── Consistency helpers ────────────────────────────────────────────────────────
// Storage format: Record<number, ConsistencyEntry> keyed by JS getDay() value
type ConsistencyEntry = {
  dayId: string;
  dayName: string;
  isRestDay: boolean;
  color?: string;
};

function getConsistencyKey() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return `consistency_v2_${format(weekStart, "yyyy-MM-dd")}`;
}

function loadConsistencyData(): Record<number, ConsistencyEntry> {
  try {
    const raw = localStorage.getItem(getConsistencyKey());
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, ConsistencyEntry>;
  } catch {
    return {};
  }
}

function saveConsistencyData(data: Record<number, ConsistencyEntry>) {
  localStorage.setItem(getConsistencyKey(), JSON.stringify(data));
}

function getDayAbbreviation(name: string, isRestDay: boolean): string {
  if (isRestDay) return "DSC";
  const u = name.toUpperCase();
  if (u.includes("PULL")) return "PULL";
  if (u.includes("PUSH")) return "PUSH";
  if (u.includes("LEGS") || (u.includes("LEG") && !u.includes("LEVE"))) return "LEGS";
  if (u.includes("UPPER") && u.includes("PEITO")) return "UP·P";
  if (u.includes("UPPER") && u.includes("COSTAS")) return "UP·C";
  if (u.includes("UPPER") && u.includes("ESTET")) return "UP·E";
  if (u.includes("UPPER")) return "UP";
  if (u.includes("LOWER") && u.includes("QUAD")) return "LW·Q";
  if (u.includes("LOWER") || u.includes("POSTERIOR")) return "LW·P";
  if (u.includes("LOWER")) return "LW";
  if (u.includes("ANTERIOR")) return "ANT";
  if (u.includes("CARDIO")) return "CARD";
  return name.substring(0, 4).toUpperCase();
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
  const [consistencyData, setConsistencyData] = useState<Record<number, ConsistencyEntry>>(
    () => loadConsistencyData()
  );
  const [weeklyCardioMinutes, setWeeklyCardioMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  // Modal state — select workout
  const [modalDayValue, setModalDayValue] = useState<number | null>(null);
  const [savingLog, setSavingLog] = useState(false);
  // Modal state — confirm removal
  const [confirmRemoveDayValue, setConfirmRemoveDayValue] = useState<number | null>(null);
  const [removingLog, setRemovingLog] = useState(false);
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

      migrateUpperLowerExercises(user.id);
      migratePacholokDay1(user.id);

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");

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

  const handleConsistencyDayTap = (dayValue: number) => {
    if (consistencyData[dayValue]) {
      // Already trained — ask confirmation before removing
      setConfirmRemoveDayValue(dayValue);
    } else {
      // Open modal to ask what was trained
      setModalDayValue(dayValue);
    }
  };

  const handleConfirmRemove = async () => {
    if (confirmRemoveDayValue === null) return;
    setRemovingLog(true);
    const entry = consistencyData[confirmRemoveDayValue];

    // Remove from localStorage first
    const next = { ...consistencyData };
    delete next[confirmRemoveDayValue];
    setConsistencyData(next);
    saveConsistencyData(next);

    // Delete workout_log from Supabase if it was created by this system
    if (!isDemoMode && entry) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
          const offset = confirmRemoveDayValue === 0 ? 6 : confirmRemoveDayValue - 1;
          const dateForDay = format(addDays(weekStart, offset), "yyyy-MM-dd");

          await supabase
            .from("workout_logs")
            .delete()
            .eq("user_id", user.id)
            .eq("day_id", entry.dayId)
            .eq("date", dateForDay);
        }
      } catch (e) {
        console.error("Error deleting workout log:", e);
      }
    }

    setRemovingLog(false);
    setConfirmRemoveDayValue(null);
  };

  const handleSelectWorkout = async (planDay: PlanDay) => {
    if (modalDayValue === null) return;
    setSavingLog(true);

    const entry: ConsistencyEntry = {
      dayId: planDay.id,
      dayName: planDay.name,
      isRestDay: planDay.is_rest_day,
      color: (planDay as any).color,
    };

    const next = { ...consistencyData, [modalDayValue]: entry };
    setConsistencyData(next);
    saveConsistencyData(next);

    // Create workout_log so it appears in history (real users only)
    if (!isDemoMode) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
          const offset = modalDayValue === 0 ? 6 : modalDayValue - 1;
          const dateForDay = format(addDays(weekStart, offset), "yyyy-MM-dd");

          const { data: existing } = await supabase
            .from("workout_logs")
            .select("id")
            .eq("user_id", user.id)
            .eq("day_id", planDay.id)
            .eq("date", dateForDay)
            .maybeSingle();

          if (!existing) {
            await supabase.from("workout_logs").insert({
              user_id: user.id,
              day_id: planDay.id,
              date: dateForDay,
              completed_at: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error("Error creating workout log:", e);
      }
    }

    setSavingLog(false);
    setModalDayValue(null);
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
  const trainedCount = Object.keys(consistencyData).length;

  return (
    <div className="p-5 space-y-7 max-w-md mx-auto">
      {/* Header */}
      <header className="pt-4 animate-slide-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {firstName}</h1>
        <p className="text-zinc-400 text-sm capitalize mt-0.5">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </header>

      {/* Today's Workout */}
      {todayWorkout && (
        <section className="animate-slide-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-widest">
            Próximo treino
          </h2>
          <div className="glass glass-strong rounded-2xl border overflow-hidden shadow-xl shadow-black/40">
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full mt-2 shrink-0",
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
          <span className="text-2xl font-bold text-zinc-100">{trainedCount}</span>
          <span className="text-xs text-zinc-500 mt-0.5">Treinos na semana</span>
        </div>
        <div className="bg-zinc-900/80 rounded-2xl border border-white/[0.07] p-4 flex flex-col items-center justify-center text-center">
          <Activity className="w-5 h-5 text-blue-400 mb-2" />
          <span className="text-2xl font-bold text-zinc-100">{weeklyCardioMinutes}</span>
          <span className="text-xs text-zinc-500 mt-0.5">Min. de cardio</span>
        </div>
      </section>

      {/* Consistency dots */}
      <section className="animate-slide-up" style={{ animationDelay: "180ms" }}>
        <h2 className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-widest">
          Consistência semanal
        </h2>
        <div className="glass rounded-2xl border p-4">
          <p className="text-[11px] text-zinc-600 mb-4 text-center">
            Toque no dia para registrar o treino
          </p>
          <div className="flex justify-between items-end">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((label, i) => {
              const dayValue = (i + 1) % 7;
              const entry = consistencyData[dayValue];
              const trained = !!entry;
              const isToday = new Date().getDay() === dayValue;
              const abbrev = trained
                ? getDayAbbreviation(entry.dayName, entry.isRestDay)
                : null;
              const dotColor = trained
                ? entry.color ?? DAY_COLORS[0]
                : null;

              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      isToday ? "text-zinc-300" : "text-zinc-600"
                    )}
                  >
                    {label}
                  </span>
                  <button
                    onClick={() => handleConsistencyDayTap(dayValue)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 relative",
                      trained
                        ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-100/20"
                        : isToday
                        ? "bg-zinc-800 text-zinc-400 ring-1 ring-zinc-600"
                        : "bg-zinc-800/40 text-zinc-600 hover:bg-zinc-800"
                    )}
                  >
                    {trained ? (
                      <CheckIcon className="w-4 h-4 animate-check-pop" />
                    ) : null}
                  </button>
                  {/* Trained label below circle */}
                  <span
                    className={cn(
                      "text-[8px] font-bold tracking-wide leading-none",
                      trained ? "text-zinc-300" : "text-transparent"
                    )}
                  >
                    {abbrev ?? "···"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plan — all days */}
      {allDays.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: "240ms" }}>
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

      {/* Modal — Select what was trained */}
      {modalDayValue !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModalDayValue(null)}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl p-5 pb-8 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100">O que você treinou?</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Selecione o treino realizado</p>
              </div>
              <button
                onClick={() => setModalDayValue(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plan day options */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {allDays.map((day, idx) => {
                const color = (day as any).color ?? DAY_COLORS[idx % DAY_COLORS.length];
                return (
                  <button
                    key={day.id}
                    onClick={() => handleSelectWorkout(day)}
                    disabled={savingLog}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-white/[0.07] bg-zinc-800/50 hover:bg-zinc-800 hover:border-white/15 text-left transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 leading-tight truncate">
                        {day.name}
                      </p>
                    </div>
                    {day.is_rest_day ? (
                      <Moon className="w-4 h-4 text-zinc-500 shrink-0" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {savingLog && (
              <p className="text-center text-xs text-zinc-500">Salvando...</p>
            )}
          </div>
        </div>
      )}

      {/* Modal — Confirm removal */}
      {confirmRemoveDayValue !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => !removingLog && setConfirmRemoveDayValue(null)}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl p-5 pb-8 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Remover treino?</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {consistencyData[confirmRemoveDayValue]
                    ? consistencyData[confirmRemoveDayValue].dayName
                    : "Este treino"}{" "}
                  será removido do histórico.
                </p>
              </div>
              <button
                onClick={() => setConfirmRemoveDayValue(null)}
                disabled={removingLog}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemoveDayValue(null)}
                disabled={removingLog}
                className="flex-1 py-3 rounded-2xl border border-white/10 bg-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removingLog}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              >
                {removingLog ? "Removendo..." : "Sim, remover"}
              </button>
            </div>
          </div>
        </div>
      )}
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
