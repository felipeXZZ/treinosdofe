import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isDemoMode } from "@/src/lib/supabase";
import { getDemoActiveDays, getCurrentDemoDay } from "@/src/lib/demo-data";
import { Play, Moon, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type PlanDay = {
  id: string;
  name: string;
  day_order: number;
  is_rest_day: boolean;
  color?: string;
};

const DAY_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-yellow-500",
];

const DAY_GLOW = [
  "shadow-red-500/10",
  "shadow-blue-500/10",
  "shadow-emerald-500/10",
  "shadow-purple-500/10",
  "shadow-yellow-500/10",
];

export function WorkoutList() {
  const navigate = useNavigate();
  const [days, setDays] = useState<PlanDay[]>([]);
  const [nextDayId, setNextDayId] = useState<string | null>(null);
  const [lastDoneByDay, setLastDoneByDay] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      if (isDemoMode) {
        setDays(getDemoActiveDays());
        setNextDayId(getCurrentDemoDay().id);
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

      const { data: plans } = await supabase
        .from("workout_plans")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!plans?.length) {
        setLoading(false);
        return;
      }

      const [daysRes, logsRes] = await Promise.all([
        supabase
          .from("workout_days")
          .select("id, name, day_order, is_rest_day")
          .eq("plan_id", plans[0].id)
          .order("day_order"),
        supabase
          .from("workout_logs")
          .select("day_id, date")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(50),
      ]);

      const planDays = daysRes.data || [];
      setDays(planDays);

      const lastDone: Record<string, string> = {};
      (logsRes.data || []).forEach((l) => {
        if (l.day_id && !lastDone[l.day_id]) lastDone[l.day_id] = l.date;
      });
      setLastDoneByDay(lastDone);

      const latestLog = logsRes.data?.[0];
      let nextOrder = 1;
      if (latestLog?.day_id) {
        const lastDay = planDays.find((d) => d.id === latestLog.day_id);
        if (lastDay)
          nextOrder = (lastDay.day_order % planDays.length) + 1;
      }
      const nextDay =
        planDays.find((d) => d.day_order === nextOrder) ?? planDays[0];
      setNextDayId(nextDay?.id ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  return (
    <div className="p-5 space-y-6 max-w-md mx-auto">
      <header className="pt-4 animate-slide-up">
        <h1 className="text-2xl font-bold tracking-tight">Treino</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Escolha o dia para começar</p>
      </header>

      <div className="space-y-3">
        {days.map((day, idx) => {
          const isNext = day.id === nextDayId;
          const color = day.color ?? DAY_COLORS[idx % DAY_COLORS.length];
          const glow = DAY_GLOW[idx % DAY_GLOW.length];
          const lastDate = lastDoneByDay[day.id];
          const lastDoneText = lastDate
            ? formatDistanceToNow(parseISO(lastDate), {
                locale: ptBR,
                addSuffix: true,
              })
            : "Nunca feito";

          return (
            <button
              key={day.id}
              onClick={() => navigate(`/workout/${day.id}`)}
              style={{ animationDelay: `${40 + idx * 55}ms` }}
              className={cn(
                "w-full text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] animate-slide-up",
                isNext
                  ? `glass-strong border-white/10 shadow-xl ${glow}`
                  : "glass border-white/[0.05] hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Color dot */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isNext ? `${color} shadow-lg` : "bg-zinc-800/60"
                  )}
                >
                  {day.is_rest_day ? (
                    <Moon
                      className={cn(
                        "w-4 h-4",
                        isNext ? "text-white" : "text-zinc-500"
                      )}
                    />
                  ) : (
                    <Play
                      className={cn(
                        "w-4 h-4 fill-current",
                        isNext ? "text-white" : "text-zinc-600"
                      )}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-tight",
                        isNext ? "text-zinc-100" : "text-zinc-300"
                      )}
                    >
                      {day.name}
                    </p>
                    {isNext && (
                      <span className="text-[10px] font-bold bg-zinc-700/80 text-zinc-200 px-2 py-0.5 rounded-full shrink-0">
                        PRÓXIMO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <p className="text-xs text-zinc-600">{lastDoneText}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
