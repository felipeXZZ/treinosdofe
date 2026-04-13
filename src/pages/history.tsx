import React, { useEffect, useState, useMemo, type ReactNode } from "react";
import { supabase, isDemoMode } from "@/src/lib/supabase";
import {
  format,
  parseISO,
  subDays,
  startOfWeek,
  addDays,
  isAfter,
  differenceInCalendarWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dumbbell, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Award, BarChart2, MessageSquare } from "lucide-react";
import { cn } from "@/src/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type SetEntry = {
  set_number: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
};

type ExerciseEntry = {
  id: string;
  name: string;
  sets: SetEntry[];
};

type Session = {
  id: string;
  date: string; // yyyy-MM-dd
  dayName: string;
  isRestDay: boolean;
  completed: boolean;
  exercises: ExerciseEntry[];
  notes?: string;
};

type ProgressEntry = {
  name: string;
  lastDate: string;
  lastBestWeight: number | null;
  prevBestWeight: number | null;
  trend: "up" | "down" | "same" | "first";
};

type Period = "7d" | "30d" | "all";

// ── Demo data ─────────────────────────────────────────────────────────────────

function mkEx(name: string, id: string, ws: number[], rs: number[]): ExerciseEntry {
  return {
    id,
    name,
    sets: ws.map((w, i) => ({
      set_number: i + 1,
      weight: w,
      reps: rs[i] ?? rs[0],
      completed: true,
    })),
  };
}

function getDemoSessions(): Session[] {
  const t = new Date();
  const d = (n: number) => format(subDays(t, n), "yyyy-MM-dd");
  const raw: Omit<Session, "isRestDay">[] = [
    {
      id: "dh1", date: d(1), dayName: "DIA 4 – UPPER (FOCO COSTAS + OMBRO)", completed: true,
      exercises: [
        mkEx("Puxada na frente", "e1", [52.5, 52.5, 50, 50], [9, 8, 10, 10]),
        mkEx("Remada máquina", "e2", [62.5, 62.5, 60, 60], [9, 8, 9, 10]),
        mkEx("Elevação lateral (HALTER)", "e3", [12, 12, 12, 10], [13, 12, 14, 13]),
        mkEx("Supino inclinado máquina", "e4", [67.5, 67.5, 65], [10, 9, 11]),
        mkEx("Rosca alternada", "e5", [15, 15, 12.5], [10, 10, 11]),
        mkEx("LATERAL (tríceps com chifre)", "e6", [22.5, 22.5, 20], [10, 10, 12]),
      ],
    },
    {
      id: "dh2", date: d(3), dayName: "DIA 2 – LOWER (FOCO QUADRÍCEPS)", completed: true,
      exercises: [
        mkEx("Hack machine", "e7", [90, 90, 85, 85], [8, 7, 10, 9]),
        mkEx("Leg press", "e8", [150, 150, 145], [11, 10, 12]),
        mkEx("Cadeira extensora", "e9", [55, 55, 52.5], [13, 12, 14]),
        mkEx("Mesa flexora", "e10", [47.5, 47.5, 45], [11, 10, 11]),
        mkEx("Panturrilha", "e11", [80, 80, 80, 80], [13, 14, 13, 12]),
      ],
    },
    {
      id: "dh3", date: d(7), dayName: "DIA 5 – LOWER (POSTERIOR)", completed: true,
      exercises: [
        mkEx("Mesa flexora", "e10", [45, 45, 42.5, 42.5], [9, 8, 10, 10]),
        mkEx("Cadeira flexora", "e12", [40, 40, 37.5], [11, 10, 12]),
        mkEx("Hack machine (leve)", "e13", [72.5, 72.5, 70], [11, 10, 12]),
        mkEx("Leg press (pé mais baixo)", "e14", [137.5, 137.5, 132.5], [11, 10, 12]),
        mkEx("Panturrilha", "e11", [80, 80, 77.5, 77.5], [13, 12, 14, 13]),
      ],
    },
    {
      id: "dh4", date: d(9), dayName: "DIA 1 – UPPER (FOCO PEITO + FORÇA)", completed: true,
      exercises: [
        mkEx("Supino máquina", "e15", [77.5, 77.5, 75, 75], [7, 6, 8, 8]),
        mkEx("Supino inclinado máquina", "e4", [65, 65, 62.5], [9, 9, 10]),
        mkEx("Puxada na frente", "e1", [50, 50, 47.5], [9, 8, 10]),
        mkEx("Remada máquina", "e2", [60, 60, 57.5], [9, 8, 9]),
        mkEx("Elevação lateral (HALTER)", "e3", [11, 11, 10, 10], [13, 12, 14, 13]),
        mkEx("Tríceps corda", "e16", [30, 30, 27.5], [11, 10, 12]),
        mkEx("Rosca direta", "e17", [27.5, 27.5, 25], [11, 10, 12]),
      ],
    },
    {
      id: "dh5", date: d(11), dayName: "DIA 4 – UPPER (FOCO COSTAS + OMBRO)", completed: true,
      exercises: [
        mkEx("Puxada na frente", "e1", [50, 50, 47.5, 47.5], [9, 8, 10, 10]),
        mkEx("Remada máquina", "e2", [60, 60, 57.5, 57.5], [9, 8, 9, 10]),
        mkEx("Elevação lateral (HALTER)", "e3", [11, 11, 10, 10], [13, 12, 14, 13]),
        mkEx("Supino inclinado máquina", "e4", [65, 65, 62.5], [10, 9, 11]),
        mkEx("Rosca alternada", "e5", [14, 14, 12.5], [10, 10, 11]),
        mkEx("LATERAL (tríceps com chifre)", "e6", [21, 21, 20], [10, 10, 12]),
      ],
    },
    {
      id: "dh6", date: d(14), dayName: "DIA 2 – LOWER (FOCO QUADRÍCEPS)", completed: true,
      exercises: [
        mkEx("Hack machine", "e7", [87.5, 87.5, 82.5, 82.5], [8, 7, 10, 9]),
        mkEx("Leg press", "e8", [145, 145, 140], [11, 10, 12]),
        mkEx("Cadeira extensora", "e9", [52.5, 52.5, 50], [13, 12, 14]),
        mkEx("Mesa flexora", "e10", [45, 45, 42.5], [11, 10, 11]),
        mkEx("Panturrilha", "e11", [77.5, 77.5, 77.5, 77.5], [13, 14, 13, 12]),
      ],
    },
    {
      id: "dh7", date: d(16), dayName: "DIA 1 – UPPER (FOCO PEITO + FORÇA)", completed: true,
      exercises: [
        mkEx("Supino máquina", "e15", [75, 75, 72.5, 72.5], [7, 6, 8, 8]),
        mkEx("Supino inclinado máquina", "e4", [62.5, 62.5, 60], [9, 9, 10]),
        mkEx("Puxada na frente", "e1", [47.5, 47.5, 45], [9, 8, 10]),
        mkEx("Remada máquina", "e2", [57.5, 57.5, 55], [9, 8, 9]),
        mkEx("Elevação lateral (HALTER)", "e3", [10, 10, 9, 9], [13, 12, 14, 13]),
        mkEx("Tríceps corda", "e16", [27.5, 27.5, 25], [11, 10, 12]),
        mkEx("Rosca direta", "e17", [25, 25, 22.5], [11, 10, 12]),
      ],
    },
    {
      id: "dh8", date: d(21), dayName: "DIA 4 – UPPER (FOCO COSTAS + OMBRO)", completed: true,
      exercises: [
        mkEx("Puxada na frente", "e1", [47.5, 47.5, 45, 45], [9, 8, 10, 10]),
        mkEx("Remada máquina", "e2", [57.5, 57.5, 55, 55], [9, 8, 9, 10]),
        mkEx("Elevação lateral (HALTER)", "e3", [10, 10, 9, 9], [13, 12, 14, 13]),
        mkEx("Supino inclinado máquina", "e4", [62.5, 62.5, 60], [10, 9, 11]),
        mkEx("Rosca alternada", "e5", [13, 13, 12], [10, 10, 11]),
        mkEx("LATERAL (tríceps com chifre)", "e6", [20, 20, 18], [10, 10, 12]),
      ],
    },
    {
      id: "dh9", date: d(23), dayName: "DIA 5 – LOWER (POSTERIOR)", completed: true,
      exercises: [
        mkEx("Mesa flexora", "e10", [42.5, 42.5, 40, 40], [9, 8, 10, 10]),
        mkEx("Cadeira flexora", "e12", [37.5, 37.5, 35], [11, 10, 12]),
        mkEx("Hack machine (leve)", "e13", [70, 70, 67.5], [11, 10, 12]),
        mkEx("Leg press (pé mais baixo)", "e14", [132.5, 132.5, 127.5], [11, 10, 12]),
        mkEx("Panturrilha", "e11", [75, 75, 75, 75], [13, 12, 14, 13]),
      ],
    },
    {
      id: "dh10", date: d(28), dayName: "DIA 1 – UPPER (FOCO PEITO + FORÇA)", completed: true,
      exercises: [
        mkEx("Supino máquina", "e15", [72.5, 72.5, 70, 70], [7, 6, 8, 8]),
        mkEx("Supino inclinado máquina", "e4", [60, 60, 57.5], [9, 9, 10]),
        mkEx("Puxada na frente", "e1", [45, 45, 42.5], [9, 8, 10]),
        mkEx("Remada máquina", "e2", [55, 55, 52.5], [9, 8, 9]),
        mkEx("Elevação lateral (HALTER)", "e3", [9, 9, 8, 8], [13, 12, 14, 13]),
        mkEx("Tríceps corda", "e16", [25, 25, 22.5], [11, 10, 12]),
        mkEx("Rosca direta", "e17", [22.5, 22.5, 20], [11, 10, 12]),
      ],
    },
  ];
  return raw.map((s) => ({ ...s, isRestDay: false }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function transformRawLog(raw: any): Session {
  const byExercise: Record<string, { name: string; sets: SetEntry[] }> = {};
  (raw.set_logs || []).forEach((sl: any) => {
    const key = sl.exercise_id ?? sl.id;
    if (!byExercise[key]) {
      byExercise[key] = { name: sl.exercises?.name ?? "Exercício", sets: [] };
    }
    byExercise[key].sets.push({
      set_number: sl.set_number,
      weight: sl.weight,
      reps: sl.reps,
      completed: sl.completed,
    });
  });
  const exercises = Object.entries(byExercise).map(([id, data]) => ({
    id,
    name: data.name,
    sets: data.sets.sort((a, b) => a.set_number - b.set_number),
  }));
  return {
    id: raw.id,
    date: raw.date,
    dayName: raw.workout_days?.name ?? "Treino",
    isRestDay: raw.workout_days?.is_rest_day ?? false,
    completed: !!raw.completed_at,
    exercises,
    notes: raw.notes ?? undefined,
  };
}

function computeStats(sessions: Session[], allSessions: Session[]) {
  const total = sessions.length;
  if (total === 0)
    return { total: 0, perWeekAvg: 0, totalSets: 0, activeWeeks: 0, totalAll: allSessions.length };

  const totalSets = sessions.reduce(
    (acc, s) =>
      acc + s.exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.completed).length, 0),
    0
  );

  const oldest = parseISO(sessions[sessions.length - 1].date);
  const weeksSpan = Math.max(
    1,
    differenceInCalendarWeeks(new Date(), oldest, { weekStartsOn: 1 }) + 1
  );
  const perWeekAvg = total / weeksSpan;

  const weekSet = new Set(
    sessions.map((s) =>
      format(startOfWeek(parseISO(s.date), { weekStartsOn: 1 }), "yyyy-MM-dd")
    )
  );
  const activeWeeks = weekSet.size;

  return { total, perWeekAvg, totalSets, activeWeeks, totalAll: allSessions.length };
}

function computeProgression(sessions: Session[]): ProgressEntry[] {
  // Build timeline per exercise (oldest first)
  const map: Record<string, { date: string; maxWeight: number | null }[]> = {};
  [...sessions].reverse().forEach((s) => {
    s.exercises.forEach((ex) => {
      const weights = ex.sets
        .filter((set) => set.completed && set.weight != null)
        .map((set) => set.weight!);
      const maxWeight = weights.length > 0 ? Math.max(...weights) : null;
      if (!map[ex.name]) map[ex.name] = [];
      map[ex.name].push({ date: s.date, maxWeight });
    });
  });

  return Object.entries(map)
    .map(([name, entries]) => {
      const last = entries[entries.length - 1];
      const prev = entries.length >= 2 ? entries[entries.length - 2] : null;
      let trend: ProgressEntry["trend"] = "first";
      if (prev) {
        if (last.maxWeight == null || prev.maxWeight == null) trend = "same";
        else if (last.maxWeight > prev.maxWeight) trend = "up";
        else if (last.maxWeight < prev.maxWeight) trend = "down";
        else trend = "same";
      }
      return {
        name,
        lastDate: last.date,
        lastBestWeight: last.maxWeight,
        prevBestWeight: prev?.maxWeight ?? null,
        trend,
      };
    })
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}

function groupByWeek(sessions: Session[]): [string, Session[]][] {
  const groups: [string, Session[]][] = [];
  const seen: Record<string, number> = {};
  sessions.forEach((s) => {
    const key = format(startOfWeek(parseISO(s.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
    if (seen[key] === undefined) {
      seen[key] = groups.length;
      groups.push([key, []]);
    }
    groups[seen[key]][1].push(s);
  });
  return groups;
}

function weekLabel(weekStartStr: string) {
  const ws = parseISO(weekStartStr);
  const now = new Date();
  if (isAfter(ws, subDays(now, 7))) return "Esta semana";
  if (isAfter(ws, subDays(now, 14))) return "Semana passada";
  return `Semana de ${format(ws, "d 'de' MMM", { locale: ptBR })}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function History() {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "progression">("history");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      if (isDemoMode) {
        setAllSessions(getDemoSessions());
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("workout_logs")
        .select(
          `id, date, completed_at, notes,
           workout_days ( name, is_rest_day ),
           set_logs ( id, set_number, weight, reps, completed, exercise_id, exercises ( name ) )`
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(200);

      setAllSessions((data || []).map(transformRawLog).filter((s) => !s.isRestDay));
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    const cutoff =
      period === "7d"
        ? subDays(new Date(), 7)
        : period === "30d"
        ? subDays(new Date(), 30)
        : null;
    if (!cutoff) return allSessions;
    return allSessions.filter((s) => isAfter(parseISO(s.date), cutoff));
  }, [allSessions, period]);

  const stats = useMemo(
    () => computeStats(filteredSessions, allSessions),
    [filteredSessions, allSessions]
  );

  const progression = useMemo(
    () => computeProgression(filteredSessions),
    [filteredSessions]
  );

  const grouped = useMemo(() => groupByWeek(filteredSessions), [filteredSessions]);

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
    <div className="p-5 space-y-5 max-w-md mx-auto">
      {/* Header */}
      <header className="pt-4 animate-slide-up">
        <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          {stats.totalAll} treinos registrados no total
        </p>
      </header>

      {/* Period filter */}
      <div
        className="flex gap-2 animate-slide-up"
        style={{ animationDelay: "40ms" }}
      >
        {(["7d", "30d", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              period === p
                ? "bg-zinc-100 text-zinc-900"
                : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800"
            )}
          >
            {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "Tudo"}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 gap-3 animate-slide-up"
        style={{ animationDelay: "80ms" }}
      >
        <StatCard
          label="Treinos"
          value={stats.total}
          sub={period === "all" ? "no total" : `nos últimos ${period === "7d" ? "7" : "30"} dias`}
          icon={<Dumbbell className="w-4 h-4 text-zinc-400" />}
        />
        <StatCard
          label="Séries completas"
          value={stats.totalSets}
          sub="sets finalizados"
          icon={<Award className="w-4 h-4 text-orange-400" />}
        />
        <StatCard
          label="Freq. semanal"
          value={`${stats.perWeekAvg.toFixed(1)}×`}
          sub="treinos por semana"
          icon={<BarChart2 className="w-4 h-4 text-blue-400" />}
        />
        <StatCard
          label="Semanas ativas"
          value={stats.activeWeeks}
          sub="semanas com treino"
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      {/* Tab switcher */}
      <div
        className="glass rounded-2xl border border-white/[0.06] p-1 flex gap-1 animate-slide-up"
        style={{ animationDelay: "120ms" }}
      >
        <button
          onClick={() => { setActiveTab("history"); window.scrollTo({ top: 0, behavior: "instant" }); }}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all",
            activeTab === "history"
              ? "bg-zinc-700 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Sessões
        </button>
        <button
          onClick={() => { setActiveTab("progression"); window.scrollTo({ top: 0, behavior: "instant" }); }}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all",
            activeTab === "progression"
              ? "bg-zinc-700 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Evolução
        </button>
      </div>

      {/* Session list */}
      {activeTab === "history" && (
        <div className="space-y-5 animate-fade-in">
          {grouped.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl border border-white/[0.05]">
              <Dumbbell className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Nenhum treino neste período</p>
            </div>
          ) : (
            grouped.map(([weekKey, sessions]) => (
              <div key={weekKey}>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                  {weekLabel(weekKey)}
                  <span className="text-zinc-700 ml-2 normal-case font-normal">
                    · {sessions.length} treino{sessions.length > 1 ? "s" : ""}
                  </span>
                </p>
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      expanded={expandedId === s.id}
                      onToggle={() =>
                        setExpandedId(expandedId === s.id ? null : s.id)
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Progression tab */}
      {activeTab === "progression" && (
        <div className="space-y-3 animate-fade-in">
          {progression.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl border border-white/[0.05]">
              <TrendingUp className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Sem dados suficientes ainda</p>
              <p className="text-zinc-600 text-xs mt-1">
                Complete sessões com pesos registrados
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-600">
                Comparando última sessão vs anterior de cada exercício
              </p>
              {progression.map((p) => (
                <ProgressionRow key={p.name} entry={p} />
              ))}
            </>
          )}
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>
    </div>
  );
}

function SessionCard({
  session,
  expanded,
  onToggle,
}: {
  session: Session;
  expanded: boolean;
  onToggle: () => void;
}) {
  const totalSets = session.exercises.reduce(
    (a, ex) => a + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className={cn("glass rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-200")}>
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100 leading-tight">
            {session.dayName}
          </p>
          <p className="text-xs text-zinc-500 mt-1 capitalize">
            {format(parseISO(session.date), "EEEE, d 'de' MMM", { locale: ptBR })}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-zinc-600">
              {totalSets} séries
            </span>
            {session.completed && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Concluído
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-zinc-600">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {expanded && (session.exercises.length > 0 || session.notes) && (
        <div className="border-t border-white/[0.05] px-4 pb-4 pt-3 space-y-3 animate-fade-in">
          {session.exercises.map((ex) => {
            const completedSets = ex.sets.filter((s) => s.completed);
            const maxWeight = completedSets.length
              ? Math.max(...completedSets.map((s) => s.weight ?? 0))
              : null;
            const avgReps =
              completedSets.length > 0
                ? Math.round(
                    completedSets.reduce((a, s) => a + (s.reps ?? 0), 0) /
                      completedSets.length
                  )
                : null;

            return (
              <div key={ex.id} className="flex items-center justify-between">
                <p className="text-sm text-zinc-300 flex-1 truncate pr-3">
                  {ex.name}
                </p>
                <div className="flex items-center gap-2 shrink-0 text-xs text-zinc-500">
                  {maxWeight != null && (
                    <span className="text-zinc-300 font-medium">
                      {maxWeight}kg
                    </span>
                  )}
                  {avgReps != null && (
                    <span>× ~{avgReps} reps</span>
                  )}
                  <span className="text-zinc-700">
                    {completedSets.length}/{ex.sets.length}×
                  </span>
                </div>
              </div>
            );
          })}
          {session.notes && (
            <div className="flex items-start gap-2 pt-1 border-t border-white/[0.05] mt-1">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-500 leading-relaxed">{session.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressionRow({ entry }: { entry: ProgressEntry }) {
  const { name, lastBestWeight, prevBestWeight, trend } = entry;

  const trendIcon =
    trend === "up" ? (
      <TrendingUp className="w-4 h-4 text-emerald-400" />
    ) : trend === "down" ? (
      <TrendingDown className="w-4 h-4 text-red-400" />
    ) : trend === "same" ? (
      <Minus className="w-4 h-4 text-zinc-500" />
    ) : (
      <TrendingUp className="w-4 h-4 text-blue-400" />
    );

  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
      ? "text-red-400"
      : "text-zinc-500";

  const weightLabel = () => {
    if (trend === "first") {
      return lastBestWeight != null
        ? `Primeira vez: ${lastBestWeight}kg`
        : "Primeiro registro";
    }
    const prev = prevBestWeight != null ? `${prevBestWeight}kg` : "–";
    const last = lastBestWeight != null ? `${lastBestWeight}kg` : "–";
    const diff =
      lastBestWeight != null && prevBestWeight != null
        ? lastBestWeight - prevBestWeight
        : null;
    return (
      <span>
        {prev}
        <span className="text-zinc-600 mx-1">→</span>
        <span className={trendColor}>{last}</span>
        {diff !== null && diff !== 0 && (
          <span className={cn("ml-1 text-xs", trendColor)}>
            ({diff > 0 ? "+" : ""}{diff}kg)
          </span>
        )}
      </span>
    );
  };

  const suggestion =
    trend === "same" && lastBestWeight != null
      ? `Tente ${lastBestWeight + 2.5}kg na próxima`
      : trend === "down"
      ? "Foco na técnica antes de aumentar"
      : null;

  return (
    <div className="glass rounded-xl border border-white/[0.06] p-3.5">
      <div className="flex items-center gap-2 mb-1">
        {trendIcon}
        <p className="text-sm font-medium text-zinc-200 flex-1 truncate">{name}</p>
      </div>
      <p className="text-xs text-zinc-500 ml-6">{weightLabel()}</p>
      {suggestion && (
        <p className="text-[11px] text-zinc-600 ml-6 mt-1">{suggestion}</p>
      )}
    </div>
  );
}
