import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, isDemoMode } from "@/src/lib/supabase";
import { getDemoActiveDays, advanceDemoDay } from "@/src/lib/demo-data";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ArrowLeft, Check, Timer, X, Activity, PlayCircle, MessageSquare, Flame } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { format, startOfWeek } from "date-fns";
import { getExerciseGif } from "@/src/lib/exercise-gifs";

// ── Set type helper ───────────────────────────────────────────────────────────
function getSetType(
  setNumber: number,
  totalSets: number,
  workingSets?: number | null
): "warmup" | "working" {
  if (!workingSets || workingSets >= totalSets) return "working";
  const warmupCount = totalSets - workingSets;
  return setNumber <= warmupCount ? "warmup" : "working";
}

// ── Mark today as trained in the weekly consistency key ──────────────────────
function markTodayConsistency(day?: { id: string; name: string; is_rest_day: boolean; color?: string }) {
  try {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const v2Key = `consistency_v2_${format(weekStart, "yyyy-MM-dd")}`;
    const existing: Record<number, unknown> = JSON.parse(localStorage.getItem(v2Key) || "{}");
    const dayValue = new Date().getDay();
    existing[dayValue] = day
      ? { dayId: day.id, dayName: day.name, isRestDay: day.is_rest_day, color: day.color }
      : { dayId: "", dayName: "Treino", isRestDay: false };
    localStorage.setItem(v2Key, JSON.stringify(existing));
  } catch {}
}

export function Workout() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const today = useRef(new Date().toISOString().split("T")[0]).current;

  // Cardio state
  const [cardioType, setCardioType] = useState("");
  const [cardioDuration, setCardioDuration] = useState("");

  // Which exercise card has the GIF open
  const [openGifId, setOpenGifId] = useState<string | null>(null);

  // Workout notes / observations
  const [workoutNotes, setWorkoutNotes] = useState("");

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dayId) loadWorkout();
  }, [dayId]);

  // Timer countdown
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const loadWorkout = async () => {
    try {
      if (isDemoMode) {
        const activeDays = getDemoActiveDays();
        const demoDay = activeDays.find((d) => d.id === dayId) ?? activeDays[0];
        setDay({ name: demoDay.name, is_rest_day: demoDay.is_rest_day });
        setExercises(
          demoDay.exercises.map((ex) => ({
            ...ex,
            setsState: Array.from({ length: ex.sets }, (_, i) => ({
              set_number: i + 1,
              weight: "",
              reps: "",
              completed: false,
              id: null,
              type: getSetType(i + 1, ex.sets, ex.working_sets),
            })),
          }))
        );
        setWorkoutLogId(`demo-log-${dayId}`);
        const savedDemoNotes = localStorage.getItem(`workout_notes_${dayId}_${today}`);
        if (savedDemoNotes) setWorkoutNotes(savedDemoNotes);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userIdRef.current = user.id;

      // Round 1: fetch day data, exercises, and check for existing log — all in parallel
      const [{ data: dayData }, { data: exercisesData }, { data: existingLog }] =
        await Promise.all([
          supabase.from("workout_days").select("*").eq("id", dayId).single(),
          supabase
            .from("exercises")
            .select("*")
            .eq("day_id", dayId)
            .order("exercise_order", { ascending: true }),
          supabase
            .from("workout_logs")
            .select("id, notes")
            .eq("user_id", user.id)
            .eq("day_id", dayId)
            .eq("date", today)
            .maybeSingle(),
        ]);

      setDay(dayData);

      // Only load set_logs if a log already exists (don't create one yet)
      const logId = existingLog?.id ?? null;
      setWorkoutLogId(logId);
      if (existingLog?.notes) setWorkoutNotes(existingLog.notes);

      let setLogs: any[] = [];
      if (logId) {
        const { data } = await supabase
          .from("set_logs")
          .select("*")
          .eq("workout_log_id", logId);
        setLogs = data || [];
      }

      const exercisesWithSets =
        exercisesData?.map((ex) => {
          const sets = [];
          for (let i = 1; i <= ex.sets; i++) {
            const existing = setLogs.find(
              (s) => s.exercise_id === ex.id && s.set_number === i
            );
            sets.push({
              set_number: i,
              weight: existing?.weight?.toString() || "",
              reps: existing?.reps?.toString() || "",
              completed: existing?.completed || false,
              id: existing?.id || null,
              type: (existing?.set_type as "warmup" | "working" | undefined) ??
                getSetType(i, ex.sets, ex.working_sets),
            });
          }
          return { ...ex, setsState: sets };
        }) || [];

      setExercises(exercisesWithSets);

      if (logId) {
        const { data: cardioLog } = await supabase
          .from("cardio_logs")
          .select("*")
          .eq("workout_log_id", logId)
          .maybeSingle();
        if (cardioLog) {
          setCardioType(cardioLog.type);
          setCardioDuration(cardioLog.duration_minutes.toString());
        }
      }
    } catch (error) {
      console.error("Error loading workout:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lazily create the workout_log on first set completed
  const ensureLogExists = async (): Promise<string | null> => {
    if (workoutLogId) return workoutLogId;
    if (!userIdRef.current) return null;
    const { data: newLog } = await supabase
      .from("workout_logs")
      .insert({ user_id: userIdRef.current, day_id: dayId, date: today })
      .select("id")
      .single();
    if (newLog) {
      setWorkoutLogId(newLog.id);
      return newLog.id;
    }
    return null;
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].setsState[setIndex][field] = value;
    setExercises(newExercises);
  };

  const toggleSetComplete = async (exerciseIndex: number, setIndex: number) => {
    const exercise = exercises[exerciseIndex];
    const set = exercise.setsState[setIndex];
    const isCompleting = !set.completed;

    // Optimistic update
    const updated = exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return {
        ...ex,
        setsState: ex.setsState.map((s: any, j: number) =>
          j === setIndex ? { ...s, completed: isCompleting } : s
        ),
      };
    });
    setExercises(updated);

    if (isCompleting) startTimer(90);
    if (isDemoMode) return;

    try {
      const logId = await ensureLogExists();
      if (!logId) throw new Error("Could not create workout log");

      if (set.id) {
        await supabase
          .from("set_logs")
          .update({
            weight: set.weight ? parseFloat(set.weight) : null,
            reps: set.reps ? parseInt(set.reps) : null,
            completed: isCompleting,
          })
          .eq("id", set.id);
      } else {
        const { data } = await supabase
          .from("set_logs")
          .insert({
            workout_log_id: logId,
            exercise_id: exercise.id,
            set_number: set.set_number,
            weight: set.weight ? parseFloat(set.weight) : null,
            reps: set.reps ? parseInt(set.reps) : null,
            completed: isCompleting,
            ...(set.type ? { set_type: set.type } : {}),
          })
          .select("id")
          .single();

        if (data) {
          setExercises((prev) =>
            prev.map((ex, i) => {
              if (i !== exerciseIndex) return ex;
              return {
                ...ex,
                setsState: ex.setsState.map((s: any, j: number) =>
                  j === setIndex ? { ...s, id: data.id } : s
                ),
              };
            })
          );
        }
      }
    } catch (error) {
      console.error("Error saving set:", error);
      // Revert
      setExercises(
        exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex;
          return {
            ...ex,
            setsState: ex.setsState.map((s: any, j: number) =>
              j === setIndex ? { ...s, completed: !isCompleting } : s
            ),
          };
        })
      );
    }
  };

  const finishWorkout = async () => {
    // Always mark today in localStorage consistency
    markTodayConsistency(day);

    try {
      if (isDemoMode) {
        if (workoutNotes.trim()) {
          localStorage.setItem(`workout_notes_${dayId}_${today}`, workoutNotes.trim());
        }
        if (dayId) advanceDemoDay(dayId);
        navigate("/");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Track log ID across saves (state update from ensureLogExists is async)
      let savedLogId: string | null = workoutLogId;

      // Save cardio if provided
      if (cardioType && cardioDuration) {
        const logId = await ensureLogExists();
        if (logId) {
          savedLogId = logId;
          const { data: existingCardio } = await supabase
            .from("cardio_logs")
            .select("id")
            .eq("workout_log_id", logId)
            .maybeSingle();

          if (existingCardio) {
            await supabase
              .from("cardio_logs")
              .update({ type: cardioType, duration_minutes: parseInt(cardioDuration) })
              .eq("id", existingCardio.id);
          } else {
            await supabase.from("cardio_logs").insert({
              user_id: user.id,
              workout_log_id: logId,
              type: cardioType,
              duration_minutes: parseInt(cardioDuration),
            });
          }
        }
      }

      // Create log for notes-only session (no sets, no cardio)
      if (!savedLogId && workoutNotes.trim()) {
        savedLogId = await ensureLogExists();
      }

      // Only mark completed if there was real activity (sets, cardio, or notes)
      // This prevents creating an empty log when the user taps Finalizar without doing anything
      if (savedLogId) {
        await supabase
          .from("workout_logs")
          .update({
            completed_at: new Date().toISOString(),
            ...(workoutNotes.trim() ? { notes: workoutNotes.trim() } : {}),
          })
          .eq("id", savedLogId);
      }

      navigate("/");
    } catch (error) {
      console.error("Error finishing workout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin" />
          <span className="text-zinc-500 text-sm">Preparando treino...</span>
        </div>
      </div>
    );
  }

  const TIMER_PRESETS = [60, 90, 120];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/[0.06] px-4 py-4 flex items-center justify-between animate-fade-in">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-base font-bold leading-tight">{day?.name}</h1>
            <p className="text-xs text-zinc-500">Treino em andamento</p>
          </div>
        </div>
        <Button size="sm" onClick={finishWorkout} className="transition-all active:scale-95">
          Finalizar
        </Button>
      </header>

      {/* Rest Timer Quick-Start Bar */}
      <div className="glass border-b border-white/[0.04] px-4 py-2.5 animate-fade-in" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-1.5 text-zinc-500">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Descanso</span>
          </div>
          <div className="flex space-x-2">
            {TIMER_PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => startTimer(s)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-90",
                  timerActive && timeLeft > 0 && timeLeft <= s && timeLeft > s - 31
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                )}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Active Timer */}
      {timerActive && (
        <div className="fixed bottom-24 left-4 right-4 z-30 glass-strong rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center justify-between animate-scale-in animate-timer-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center">
              <Timer className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Descansando</p>
              <p className="text-2xl font-bold font-mono tabular-nums">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeLeft((t) => t + 30)}
            >
              +30s
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTimerActive(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="p-4 space-y-5 max-w-md mx-auto">
        {exercises.map((exercise, exIdx) => {
          const allCompleted = exercise.setsState.every((s: any) => s.completed);
          const gifUrl = getExerciseGif(exercise.name);
          const gifOpen = openGifId === exercise.id;
          return (
            <div
              key={exercise.id}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all duration-300 animate-slide-up",
                allCompleted
                  ? "glass border-white/[0.06] opacity-70"
                  : "glass-strong border-white/[0.08] shadow-lg shadow-black/30"
              )}
              style={{ animationDelay: `${80 + exIdx * 50}ms` }}
            >
              <div
                className={cn(
                  "p-4 border-b border-white/[0.06] flex items-center justify-between",
                  allCompleted && "opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight">{exercise.name}</h3>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {exercise.working_sets && exercise.working_sets < exercise.sets
                      ? `${exercise.sets} séries (${exercise.working_sets} válidas) · ${exercise.reps_range} reps`
                      : `${exercise.sets} séries · ${exercise.reps_range} reps`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {gifUrl && (
                    <button
                      onClick={() => setOpenGifId(gifOpen ? null : exercise.id)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-90",
                        gifOpen
                          ? "bg-zinc-100 text-zinc-900"
                          : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700"
                      )}
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {gifOpen ? "Fechar" : "Ver"}
                    </button>
                  )}
                  {allCompleted && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center animate-check-pop">
                      <Check className="w-4 h-4 text-zinc-900" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              {/* GIF demonstrativo */}
              {gifUrl && gifOpen && (
                <div className="border-b border-white/[0.06] bg-zinc-900/60 flex justify-center p-4 animate-fade-in">
                  <img
                    src={gifUrl}
                    alt={`Demonstração: ${exercise.name}`}
                    className="rounded-xl max-h-52 object-contain"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-2">
                <div className="grid grid-cols-[3rem_1fr_1fr_3rem] gap-2 px-2 py-2 text-xs font-medium text-zinc-600 text-center">
                  <div>Série</div>
                  <div>Carga (kg)</div>
                  <div>Reps</div>
                  <div></div>
                </div>

                <div className="space-y-1">
                  {exercise.setsState.map((set: any, setIdx: number) => (
                    <div
                      key={setIdx}
                      className={cn(
                        "grid grid-cols-[3rem_1fr_1fr_3rem] gap-2 items-center p-2 rounded-xl transition-all duration-200",
                        set.completed
                          ? "bg-white/[0.03]"
                          : (exercise.working_sets && exercise.working_sets < exercise.sets && set.type === "working")
                          ? "bg-amber-950/20"
                          : "bg-transparent"
                      )}
                    >
                      {/* Coluna de número da série — indicadores visuais só no Pacholok (working_sets definido) */}
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className={cn(
                          "text-sm font-medium",
                          (exercise.working_sets && exercise.working_sets < exercise.sets)
                            ? set.type === "working" ? "text-amber-400" : "text-zinc-500"
                            : "text-zinc-400"
                        )}>
                          {set.set_number}
                        </span>
                        {exercise.working_sets && exercise.working_sets < exercise.sets ? (
                          set.type === "working" ? (
                            <Flame className="w-3 h-3 text-amber-500" strokeWidth={1.75} />
                          ) : (
                            <span className="text-[8px] font-semibold leading-none text-zinc-600">
                              Aquec.
                            </span>
                          )
                        ) : null}
                      </div>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="–"
                        className={cn(
                          "h-10 text-center bg-zinc-950/60 border-zinc-800/80",
                          set.completed && "opacity-30"
                        )}
                        value={set.weight}
                        onChange={(e) =>
                          handleSetChange(exIdx, setIdx, "weight", e.target.value)
                        }
                        disabled={set.completed}
                      />
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="–"
                        className={cn(
                          "h-10 text-center bg-zinc-950/60 border-zinc-800/80",
                          set.completed && "opacity-30"
                        )}
                        value={set.reps}
                        onChange={(e) =>
                          handleSetChange(exIdx, setIdx, "reps", e.target.value)
                        }
                        disabled={set.completed}
                      />
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleSetComplete(exIdx, setIdx)}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90",
                            set.completed
                              ? "bg-zinc-100 text-zinc-900"
                              : "bg-zinc-800/80 text-zinc-500 hover:bg-zinc-700"
                          )}
                        >
                          <Check
                            className={cn("w-4 h-4 transition-all", set.completed && "animate-check-pop")}
                            strokeWidth={set.completed ? 3 : 2}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Cardio */}
        <div
          className="glass-strong rounded-2xl border border-white/[0.08] overflow-hidden animate-slide-up"
          style={{ animationDelay: `${80 + exercises.length * 50}ms` }}
        >
          <div className="p-4 border-b border-white/[0.06] flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-base">Cardio</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Tipo</label>
              <Input
                placeholder="Ex: Esteira, Bicicleta, Elíptico..."
                value={cardioType}
                onChange={(e) => setCardioType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">
                Duração (min)
              </label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 15"
                value={cardioDuration}
                onChange={(e) => setCardioDuration(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notes / Observations */}
        <div
          className="glass-strong rounded-2xl border border-white/[0.08] overflow-hidden animate-slide-up"
          style={{ animationDelay: `${80 + (exercises.length + 1) * 50}ms` }}
        >
          <div className="p-4 border-b border-white/[0.06] flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-zinc-400" />
            <h3 className="font-semibold text-base">Observações</h3>
          </div>
          <div className="p-4">
            <textarea
              placeholder="Como foi o treino? Algo que queira lembrar..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              rows={3}
              className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
            />
          </div>
        </div>

        {/* Finish Button */}
        <Button
          size="lg"
          className="w-full transition-all active:scale-[0.98]"
          onClick={finishWorkout}
          style={{ animationDelay: `${100 + exercises.length * 50}ms` }}
        >
          Finalizar Treino
        </Button>
      </div>
    </div>
  );
}
