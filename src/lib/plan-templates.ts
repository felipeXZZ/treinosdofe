import { supabase } from "@/src/lib/supabase";

export type WorkoutType = "upper_lower" | "anterior_posterior" | "pacholok";

type ExerciseTemplate = {
  name: string;
  sets: number;
  working_sets?: number; // if set, the first (sets - working_sets) are warmup
  reps_range: string;
  exercise_order: number;
};

type DayTemplate = {
  name: string;
  short_name: string;
  day_order: number;
  is_rest_day: boolean;
  exercises: ExerciseTemplate[];
};

export const UPPER_LOWER_DAYS: DayTemplate[] = [
  {
    name: "DIA 1 – UPPER (FOCO PEITO + FORÇA)",
    short_name: "Upper · Peito",
    day_order: 1,
    is_rest_day: false,
    exercises: [
      { name: "Supino máquina", sets: 4, reps_range: "6-8", exercise_order: 1 },
      { name: "Supino inclinado máquina", sets: 3, reps_range: "8-10", exercise_order: 2 },
      { name: "Puxada na frente", sets: 3, reps_range: "8-10", exercise_order: 3 },
      { name: "Remada máquina", sets: 3, reps_range: "8-10", exercise_order: 4 },
      { name: "Elevação lateral halter", sets: 4, reps_range: "12-15", exercise_order: 5 },
      { name: "Tríceps francês na polia (chifre)", sets: 3, reps_range: "10-12", exercise_order: 6 },
      { name: "Rosca direta", sets: 3, reps_range: "8-12", exercise_order: 7 },
    ],
  },
  {
    name: "DIA 2 – LOWER (FOCO QUADRÍCEPS)",
    short_name: "Lower · Quad",
    day_order: 2,
    is_rest_day: false,
    exercises: [
      { name: "Hack machine", sets: 4, reps_range: "6-10", exercise_order: 1 },
      { name: "Leg press", sets: 3, reps_range: "10-12", exercise_order: 2 },
      { name: "Cadeira extensora", sets: 3, reps_range: "12-15", exercise_order: 3 },
      { name: "Mesa flexora", sets: 3, reps_range: "10-12", exercise_order: 4 },
      { name: "Cadeira flexora", sets: 3, reps_range: "12-15", exercise_order: 5 },
      { name: "Panturrilha", sets: 4, reps_range: "12-15", exercise_order: 6 },
    ],
  },
  {
    name: "DIA 3 – DESCANSO / CARDIO LEVE",
    short_name: "Descanso",
    day_order: 3,
    is_rest_day: true,
    exercises: [],
  },
  {
    name: "DIA 4 – UPPER (FOCO COSTAS + OMBRO)",
    short_name: "Upper · Costas",
    day_order: 4,
    is_rest_day: false,
    exercises: [
      { name: "Puxada na frente", sets: 4, reps_range: "8-10", exercise_order: 1 },
      { name: "Remada máquina", sets: 4, reps_range: "8-10", exercise_order: 2 },
      { name: "Crucifixo inverso", sets: 3, reps_range: "12-15", exercise_order: 3 },
      { name: "Elevação lateral halter", sets: 4, reps_range: "12-15", exercise_order: 4 },
      { name: "Supino inclinado máquina", sets: 3, reps_range: "10-12", exercise_order: 5 },
      { name: "Rosca Scott", sets: 3, reps_range: "10-12", exercise_order: 6 },
      { name: "Tríceps francês na polia (chifre)", sets: 3, reps_range: "10-12", exercise_order: 7 },
    ],
  },
  {
    name: "DIA 5 – LOWER (POSTERIOR)",
    short_name: "Lower · Posterior",
    day_order: 5,
    is_rest_day: false,
    exercises: [
      { name: "Mesa flexora", sets: 4, reps_range: "8-10", exercise_order: 1 },
      { name: "Cadeira flexora", sets: 3, reps_range: "10-12", exercise_order: 2 },
      { name: "Hack machine (leve)", sets: 3, reps_range: "10-12", exercise_order: 3 },
      { name: "Leg press (pé mais baixo)", sets: 3, reps_range: "10-12", exercise_order: 4 },
      { name: "Panturrilha", sets: 4, reps_range: "12-15", exercise_order: 5 },
    ],
  },
];

const AP_DIA_A_EXERCISES: ExerciseTemplate[] = [
  { name: "Supino inclinado máquina", sets: 4, reps_range: "6-10", exercise_order: 1 },
  { name: "Crucifixo (máquina ou polia)", sets: 3, reps_range: "10-15", exercise_order: 2 },
  { name: "Desenvolvimento ombro máquina", sets: 3, reps_range: "8-12", exercise_order: 3 },
  { name: "Elevação lateral (halter)", sets: 4, reps_range: "12-15", exercise_order: 4 },
  { name: "Hack machine", sets: 4, reps_range: "6-10", exercise_order: 5 },
  { name: "Leg press", sets: 3, reps_range: "10-12", exercise_order: 6 },
  { name: "Cadeira extensora", sets: 3, reps_range: "12-15", exercise_order: 7 },
  { name: "Tríceps corda", sets: 3, reps_range: "10-12", exercise_order: 8 },
  { name: "Tríceps crossover (chifre)", sets: 3, reps_range: "10-12", exercise_order: 9 },
];

const AP_DIA_B_EXERCISES: ExerciseTemplate[] = [
  { name: "Puxada na frente", sets: 4, reps_range: "8-10", exercise_order: 1 },
  { name: "Remada máquina", sets: 4, reps_range: "8-10", exercise_order: 2 },
  { name: "Crucifixo inverso", sets: 3, reps_range: "12-15", exercise_order: 3 },
  { name: "Mesa flexora", sets: 4, reps_range: "8-10", exercise_order: 4 },
  { name: "Cadeira flexora", sets: 3, reps_range: "10-12", exercise_order: 5 },
  { name: "Rosca Scott", sets: 3, reps_range: "10-12", exercise_order: 6 },
  { name: "Elevação lateral (leve)", sets: 3, reps_range: "12-15", exercise_order: 7 },
];

export const ANTERIOR_POSTERIOR_DAYS: DayTemplate[] = [
  {
    name: "DIA 1 – ANTERIORES (PEITO + OMBRO + QUAD)",
    short_name: "Dia A · Anteriores",
    day_order: 1,
    is_rest_day: false,
    exercises: AP_DIA_A_EXERCISES,
  },
  {
    name: "DIA 2 – POSTERIORES (COSTAS + POST. + BÍCEPS)",
    short_name: "Dia B · Posteriores",
    day_order: 2,
    is_rest_day: false,
    exercises: AP_DIA_B_EXERCISES,
  },
  {
    name: "DIA 3 – DESCANSO",
    short_name: "Descanso",
    day_order: 3,
    is_rest_day: true,
    exercises: [],
  },
  {
    name: "DIA 4 – ANTERIORES (PEITO + OMBRO + QUAD)",
    short_name: "Dia A · Anteriores",
    day_order: 4,
    is_rest_day: false,
    exercises: AP_DIA_A_EXERCISES,
  },
  {
    name: "DIA 5 – POSTERIORES (COSTAS + POST. + BÍCEPS)",
    short_name: "Dia B · Posteriores",
    day_order: 5,
    is_rest_day: false,
    exercises: AP_DIA_B_EXERCISES,
  },
];

export const PACHOLOK_DAYS: DayTemplate[] = [
  {
    name: "DIA 1 – PULL (COSTAS + BÍCEPS)",
    short_name: "Pull",
    day_order: 1,
    is_rest_day: false,
    exercises: [
      { name: "Puxada na frente", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 1 },
      { name: "Remada máquina", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 2 },
      { name: "Pulley triângulo", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 3 },
      { name: "Crucifixo inverso", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 4 },
      { name: "Rosca Scott", sets: 5, working_sets: 3, reps_range: "10-12", exercise_order: 5 },
      { name: "Rosca direta (barra ou W)", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 6 },
    ],
  },
  {
    name: "DIA 2 – PUSH (PEITO + OMBRO + TRÍCEPS)",
    short_name: "Push",
    day_order: 2,
    is_rest_day: false,
    exercises: [
      { name: "Supino inclinado máquina", sets: 4, working_sets: 2, reps_range: "6-10", exercise_order: 1 },
      { name: "Supino reto máquina", sets: 4, working_sets: 2, reps_range: "8-12", exercise_order: 2 },
      { name: "Crucifixo polia", sets: 4, working_sets: 2, reps_range: "10-15", exercise_order: 3 },
      { name: "Desenvolvimento máquina", sets: 4, working_sets: 2, reps_range: "8-12", exercise_order: 4 },
      { name: "Elevação lateral halter", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 5 },
      { name: "Tríceps corda", sets: 5, working_sets: 3, reps_range: "10-12", exercise_order: 6 },
    ],
  },
  {
    name: "DIA 3 – LEGS",
    short_name: "Legs",
    day_order: 3,
    is_rest_day: false,
    exercises: [
      { name: "Mesa flexora", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 1 },
      { name: "Hack machine", sets: 4, working_sets: 2, reps_range: "6-10", exercise_order: 2 },
      { name: "Leg press", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 3 },
      { name: "Cadeira extensora", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 4 },
      { name: "Panturrilha", sets: 5, working_sets: 3, reps_range: "12-15", exercise_order: 5 },
    ],
  },
  {
    name: "DIA 4 – DESCANSO",
    short_name: "Descanso",
    day_order: 4,
    is_rest_day: true,
    exercises: [],
  },
  {
    name: "DIA 5 – UPPER (FOCO ESTÉTICO)",
    short_name: "Upper",
    day_order: 5,
    is_rest_day: false,
    exercises: [
      { name: "Supino inclinado máquina", sets: 4, working_sets: 2, reps_range: "8-12", exercise_order: 1 },
      { name: "Puxada na frente", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 2 },
      { name: "Remada máquina", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 3 },
      { name: "Elevação lateral halter", sets: 5, working_sets: 3, reps_range: "12-15", exercise_order: 4 },
      { name: "Crucifixo inverso", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 5 },
      { name: "Rosca direta", sets: 5, working_sets: 3, reps_range: "8-12", exercise_order: 6 },
      { name: "Tríceps crossover (chifre)", sets: 5, working_sets: 3, reps_range: "10-12", exercise_order: 7 },
    ],
  },
  {
    name: "DIA 6 – LOWER (POSTERIOR)",
    short_name: "Lower",
    day_order: 6,
    is_rest_day: false,
    exercises: [
      { name: "Cadeira flexora", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 1 },
      { name: "Hack machine (leve)", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 2 },
      { name: "Leg press (pé baixo)", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 3 },
      { name: "Mesa flexora", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 4 },
      { name: "Panturrilha", sets: 5, working_sets: 3, reps_range: "12-15", exercise_order: 5 },
    ],
  },
  {
    name: "DIA 7 – DESCANSO",
    short_name: "Descanso",
    day_order: 7,
    is_rest_day: true,
    exercises: [],
  },
];

export const PLAN_META: Record<WorkoutType, { name: string; description: string; frequency: string; focus: string }> = {
  upper_lower: {
    name: "Upper / Lower",
    description: "Divisão clássica equilibrada entre membros superiores e inferiores.",
    frequency: "5x por semana",
    focus: "Peito · Costas · Ombro · Pernas",
  },
  anterior_posterior: {
    name: "Anterior / Posterior",
    description: "Divisão frente/trás com alta eficiência muscular e recuperação otimizada.",
    frequency: "5x por semana",
    focus: "Frente do corpo · Trás do corpo",
  },
  pacholok: {
    name: "Treino Pacholok",
    description: "Divisão híbrida com foco em intensidade, poucas séries válidas e máxima eficiência para estética muscular.",
    frequency: "5x por semana",
    focus: "Pull · Push · Legs · Upper · Lower",
  },
};

export async function createPlan(type: WorkoutType, userId: string): Promise<void> {
  const days =
    type === "upper_lower"
      ? UPPER_LOWER_DAYS
      : type === "anterior_posterior"
      ? ANTERIOR_POSTERIOR_DAYS
      : PACHOLOK_DAYS;
  const planName =
    type === "upper_lower"
      ? "Upper / Lower (5 Dias)"
      : type === "anterior_posterior"
      ? "Anterior / Posterior (5 Dias)"
      : "Treino Pacholok (7 Dias)";

  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert({ user_id: userId, name: planName })
    .select("id")
    .single();

  if (planError || !plan) throw planError ?? new Error("Falha ao criar plano");

  for (const dayTemplate of days) {
    const { data: day, error: dayError } = await supabase
      .from("workout_days")
      .insert({
        plan_id: plan.id,
        name: dayTemplate.name,
        day_order: dayTemplate.day_order,
        is_rest_day: dayTemplate.is_rest_day,
      })
      .select("id")
      .single();

    if (dayError || !day) throw dayError ?? new Error("Falha ao criar dia");

    if (dayTemplate.exercises.length > 0) {
      const { error: exError } = await supabase.from("exercises").insert(
        dayTemplate.exercises.map((ex) => ({
          day_id: day.id,
          name: ex.name,
          sets: ex.sets,
          ...(ex.working_sets != null ? { working_sets: ex.working_sets } : {}),
          reps_range: ex.reps_range,
          exercise_order: ex.exercise_order,
        }))
      );
      if (exError) throw exError;
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ workout_type: type })
    .eq("id", userId);
  if (profileError) throw profileError;
}

export async function migrateUpperLowerExercises(userId: string): Promise<void> {
  const { data: plans } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("name", "Upper / Lower (5 Dias)");

  if (!plans || plans.length === 0) return;

  const planIds = plans.map((p: { id: string }) => p.id);

  const { data: days } = await supabase
    .from("workout_days")
    .select("id, day_order")
    .in("plan_id", planIds)
    .in("day_order", [1, 4]);

  if (!days || days.length === 0) return;

  const day1Ids = days.filter((d: any) => d.day_order === 1).map((d: any) => d.id);
  const day4Ids = days.filter((d: any) => d.day_order === 4).map((d: any) => d.id);

  if (day1Ids.length > 0) {
    await supabase
      .from("exercises")
      .update({ name: "Tríceps francês na polia (chifre)" })
      .in("day_id", day1Ids)
      .eq("exercise_order", 6)
      .eq("name", "Tríceps corda");

    await supabase
      .from("exercises")
      .update({ reps_range: "8-12" })
      .in("day_id", day1Ids)
      .eq("exercise_order", 7)
      .eq("name", "Rosca direta");
  }

  if (day4Ids.length > 0) {
    await supabase
      .from("exercises")
      .update({ name: "Rosca Scott" })
      .in("day_id", day4Ids)
      .eq("exercise_order", 6)
      .eq("name", "Rosca alternada");

    await supabase
      .from("exercises")
      .update({ name: "Tríceps francês na polia (chifre)" })
      .in("day_id", day4Ids)
      .eq("exercise_order", 7)
      .eq("name", "Lateral (tríceps com chifre)");
  }
}

export async function migratePacholokDay1(userId: string): Promise<void> {
  const { data: plans } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("name", "Treino Pacholok (7 Dias)");

  if (!plans || plans.length === 0) return;

  const planIds = plans.map((p: { id: string }) => p.id);

  const { data: days } = await supabase
    .from("workout_days")
    .select("id")
    .in("plan_id", planIds)
    .eq("day_order", 1);

  if (!days || days.length === 0) return;

  for (const day of days) {
    const { data: existing } = await supabase
      .from("exercises")
      .select("id")
      .eq("day_id", day.id)
      .eq("name", "Rosca direta (barra ou W)")
      .order("id", { ascending: true });

    if (!existing || existing.length === 0) {
      await supabase.from("exercises").insert({
        day_id: day.id,
        name: "Rosca direta (barra ou W)",
        sets: 4,
        working_sets: 2,
        reps_range: "8-10",
        exercise_order: 6,
      });
    } else if (existing.length > 1) {
      // Remove duplicatas, mantém apenas o primeiro
      const idsToDelete = existing.slice(1).map((e: any) => e.id);
      await supabase.from("exercises").delete().in("id", idsToDelete);
    }
  }
}

// Deletes all plans except the most recently created one.
// Call this AFTER createPlan so the user is never left with zero plans.
export async function deleteOldPlans(userId: string): Promise<void> {
  const { data: plans } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!plans || plans.length <= 1) return;

  const idsToDelete = plans.slice(1).map((p: { id: string }) => p.id);
  await supabase.from("workout_plans").delete().in("id", idsToDelete);
}
