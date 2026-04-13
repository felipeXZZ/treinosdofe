import { supabase } from "@/src/lib/supabase";

export type WorkoutType = "upper_lower" | "anterior_posterior";

type ExerciseTemplate = {
  name: string;
  sets: number;
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
      { name: "Tríceps corda", sets: 3, reps_range: "10-12", exercise_order: 6 },
      { name: "Rosca direta", sets: 3, reps_range: "10-12", exercise_order: 7 },
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
      { name: "Rosca alternada", sets: 3, reps_range: "10-12", exercise_order: 6 },
      { name: "Lateral (tríceps com chifre)", sets: 3, reps_range: "10-12", exercise_order: 7 },
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
};

export async function createPlan(type: WorkoutType, userId: string): Promise<void> {
  const days = type === "upper_lower" ? UPPER_LOWER_DAYS : ANTERIOR_POSTERIOR_DAYS;
  const planName = type === "upper_lower" ? "Upper / Lower (5 Dias)" : "Anterior / Posterior (5 Dias)";

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
          reps_range: ex.reps_range,
          exercise_order: ex.exercise_order,
        }))
      );
      if (exError) throw exError;
    }
  }

  await supabase.from("profiles").update({ workout_type: type }).eq("id", userId);
}

export async function deleteUserPlans(userId: string): Promise<void> {
  await supabase.from("workout_plans").delete().eq("user_id", userId);
}
