import type { WorkoutType } from "@/src/lib/plan-templates";

export type { WorkoutType };

export type DemoExercise = {
  id: string;
  name: string;
  sets: number;
  working_sets?: number; // if set, first (sets - working_sets) are warmup
  reps_range: string;
  exercise_order: number;
};

export type DemoDay = {
  id: string;
  name: string;
  short_name: string;
  day_order: number;
  is_rest_day: boolean;
  color: string; // tailwind bg class
  exercises: DemoExercise[];
};

export const DEMO_DAYS: DemoDay[] = [
  {
    id: "demo-day-1",
    name: "DIA 1 – UPPER (FOCO PEITO + FORÇA)",
    short_name: "Upper · Peito",
    day_order: 1,
    is_rest_day: false,
    color: "bg-red-500",
    exercises: [
      { id: "d1-ex1", name: "Crucifixo (máquina ou polia)", sets: 4, reps_range: "10-15", exercise_order: 1 },
      { id: "d1-ex2", name: "Supino inclinado máquina", sets: 3, reps_range: "8-10", exercise_order: 2 },
      { id: "d1-ex3", name: "Puxada na frente", sets: 3, reps_range: "8-10", exercise_order: 3 },
      { id: "d1-ex4", name: "Remada máquina", sets: 3, reps_range: "8-10", exercise_order: 4 },
      { id: "d1-ex5", name: "Elevação lateral (HALTER)", sets: 4, reps_range: "12-15", exercise_order: 5 },
      { id: "d1-ex6", name: "Tríceps corda", sets: 3, reps_range: "10-12", exercise_order: 6 },
      { id: "d1-ex7", name: "Rosca direta", sets: 3, reps_range: "10-12", exercise_order: 7 },
    ],
  },
  {
    id: "demo-day-2",
    name: "DIA 2 – LOWER (FOCO QUADRÍCEPS)",
    short_name: "Lower · Quad",
    day_order: 2,
    is_rest_day: false,
    color: "bg-blue-500",
    exercises: [
      { id: "d2-ex1", name: "Hack machine", sets: 4, reps_range: "6-10", exercise_order: 1 },
      { id: "d2-ex2", name: "Leg press", sets: 3, reps_range: "10-12", exercise_order: 2 },
      { id: "d2-ex3", name: "Cadeira extensora", sets: 3, reps_range: "12-15", exercise_order: 3 },
      { id: "d2-ex4", name: "Mesa flexora", sets: 3, reps_range: "10-12", exercise_order: 4 },
      { id: "d2-ex5", name: "Cadeira flexora", sets: 3, reps_range: "12-15", exercise_order: 5 },
      { id: "d2-ex6", name: "Panturrilha", sets: 4, reps_range: "12-15", exercise_order: 6 },
    ],
  },
  {
    id: "demo-day-3",
    name: "DIA 3 – DESCANSO / CARDIO LEVE",
    short_name: "Descanso",
    day_order: 3,
    is_rest_day: true,
    color: "bg-emerald-500",
    exercises: [],
  },
  {
    id: "demo-day-4",
    name: "DIA 4 – UPPER (FOCO COSTAS + OMBRO)",
    short_name: "Upper · Costas",
    day_order: 4,
    is_rest_day: false,
    color: "bg-purple-500",
    exercises: [
      { id: "d4-ex1", name: "Puxada na frente", sets: 4, reps_range: "8-10", exercise_order: 1 },
      { id: "d4-ex2", name: "Remada máquina", sets: 4, reps_range: "8-10", exercise_order: 2 },
      { id: "d4-ex3", name: "Supino inclinado máquina", sets: 3, reps_range: "10-12", exercise_order: 3 },
      { id: "d4-ex4", name: "Crucifixo inverso", sets: 3, reps_range: "12-15", exercise_order: 4 },
      { id: "d4-ex5", name: "Elevação lateral (HALTER)", sets: 4, reps_range: "12-15", exercise_order: 5 },
      { id: "d4-ex6", name: "Rosca Scott", sets: 3, reps_range: "10-12", exercise_order: 6 },
      { id: "d4-ex7", name: "LATERAL (tríceps com chifre)", sets: 3, reps_range: "10-12", exercise_order: 7 },
    ],
  },
  {
    id: "demo-day-5",
    name: "DIA 5 – LOWER (POSTERIOR)",
    short_name: "Lower · Posterior",
    day_order: 5,
    is_rest_day: false,
    color: "bg-yellow-500",
    exercises: [
      { id: "d5-ex1", name: "Mesa flexora", sets: 4, reps_range: "8-10", exercise_order: 1 },
      { id: "d5-ex2", name: "Cadeira flexora", sets: 3, reps_range: "10-12", exercise_order: 2 },
      { id: "d5-ex3", name: "Hack machine (leve)", sets: 3, reps_range: "10-12", exercise_order: 3 },
      { id: "d5-ex4", name: "Leg press (pé mais baixo)", sets: 3, reps_range: "10-12", exercise_order: 4 },
      { id: "d5-ex5", name: "Panturrilha", sets: 4, reps_range: "12-15", exercise_order: 5 },
    ],
  },
];

const AP_DIA_A_EXERCISES_DEMO: DemoExercise[] = [
  { id: "ap-a-ex1", name: "Supino inclinado máquina", sets: 4, reps_range: "6-10", exercise_order: 1 },
  { id: "ap-a-ex2", name: "Crucifixo (máquina ou polia)", sets: 3, reps_range: "10-15", exercise_order: 2 },
  { id: "ap-a-ex3", name: "Desenvolvimento ombro máquina", sets: 3, reps_range: "8-12", exercise_order: 3 },
  { id: "ap-a-ex4", name: "Elevação lateral (halter)", sets: 4, reps_range: "12-15", exercise_order: 4 },
  { id: "ap-a-ex5", name: "Hack machine", sets: 4, reps_range: "6-10", exercise_order: 5 },
  { id: "ap-a-ex6", name: "Leg press", sets: 3, reps_range: "10-12", exercise_order: 6 },
  { id: "ap-a-ex7", name: "Cadeira extensora", sets: 3, reps_range: "12-15", exercise_order: 7 },
  { id: "ap-a-ex8", name: "Tríceps corda", sets: 3, reps_range: "10-12", exercise_order: 8 },
  { id: "ap-a-ex9", name: "Tríceps crossover (chifre)", sets: 3, reps_range: "10-12", exercise_order: 9 },
];

const AP_DIA_B_EXERCISES_DEMO: DemoExercise[] = [
  { id: "ap-b-ex1", name: "Puxada na frente", sets: 4, reps_range: "8-10", exercise_order: 1 },
  { id: "ap-b-ex2", name: "Remada máquina", sets: 4, reps_range: "8-10", exercise_order: 2 },
  { id: "ap-b-ex3", name: "Crucifixo inverso", sets: 3, reps_range: "12-15", exercise_order: 3 },
  { id: "ap-b-ex4", name: "Mesa flexora", sets: 4, reps_range: "8-10", exercise_order: 4 },
  { id: "ap-b-ex5", name: "Cadeira flexora", sets: 3, reps_range: "10-12", exercise_order: 5 },
  { id: "ap-b-ex6", name: "Rosca Scott", sets: 3, reps_range: "10-12", exercise_order: 6 },
  { id: "ap-b-ex7", name: "Elevação lateral (leve)", sets: 3, reps_range: "12-15", exercise_order: 7 },
];

export const DEMO_DAYS_AP: DemoDay[] = [
  {
    id: "ap-day-1",
    name: "DIA 1 – ANTERIORES (PEITO + OMBRO + QUAD)",
    short_name: "Dia A · Anteriores",
    day_order: 1,
    is_rest_day: false,
    color: "bg-orange-500",
    exercises: AP_DIA_A_EXERCISES_DEMO,
  },
  {
    id: "ap-day-2",
    name: "DIA 2 – POSTERIORES (COSTAS + POST. + BÍCEPS)",
    short_name: "Dia B · Posteriores",
    day_order: 2,
    is_rest_day: false,
    color: "bg-cyan-500",
    exercises: AP_DIA_B_EXERCISES_DEMO,
  },
  {
    id: "ap-day-3",
    name: "DIA 3 – DESCANSO",
    short_name: "Descanso",
    day_order: 3,
    is_rest_day: true,
    color: "bg-emerald-500",
    exercises: [],
  },
  {
    id: "ap-day-4",
    name: "DIA 4 – ANTERIORES (PEITO + OMBRO + QUAD)",
    short_name: "Dia A · Anteriores",
    day_order: 4,
    is_rest_day: false,
    color: "bg-orange-500",
    exercises: AP_DIA_A_EXERCISES_DEMO.map((e) => ({ ...e, id: e.id + "-2" })),
  },
  {
    id: "ap-day-5",
    name: "DIA 5 – POSTERIORES (COSTAS + POST. + BÍCEPS)",
    short_name: "Dia B · Posteriores",
    day_order: 5,
    is_rest_day: false,
    color: "bg-cyan-500",
    exercises: AP_DIA_B_EXERCISES_DEMO.map((e) => ({ ...e, id: e.id + "-2" })),
  },
];

export const DEMO_DAYS_PACHOLOK: DemoDay[] = [
  {
    id: "pk-day-1",
    name: "DIA 1 – PULL (COSTAS + BÍCEPS)",
    short_name: "Pull",
    day_order: 1,
    is_rest_day: false,
    color: "bg-blue-500",
    exercises: [
      { id: "pk-1-ex1", name: "Puxada na frente", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 1 },
      { id: "pk-1-ex2", name: "Remada máquina", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 2 },
      { id: "pk-1-ex3", name: "Pulley triângulo", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 3 },
      { id: "pk-1-ex4", name: "Crucifixo inverso", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 4 },
      { id: "pk-1-ex5", name: "Rosca Scott", sets: 5, working_sets: 3, reps_range: "10-12", exercise_order: 5 },
    ],
  },
  {
    id: "pk-day-2",
    name: "DIA 2 – PUSH (PEITO + OMBRO + TRÍCEPS)",
    short_name: "Push",
    day_order: 2,
    is_rest_day: false,
    color: "bg-red-500",
    exercises: [
      { id: "pk-2-ex1", name: "Supino inclinado máquina", sets: 4, working_sets: 2, reps_range: "6-10", exercise_order: 1 },
      { id: "pk-2-ex2", name: "Supino reto máquina", sets: 4, working_sets: 2, reps_range: "8-12", exercise_order: 2 },
      { id: "pk-2-ex3", name: "Crucifixo polia", sets: 4, working_sets: 2, reps_range: "10-15", exercise_order: 3 },
      { id: "pk-2-ex4", name: "Desenvolvimento máquina", sets: 4, working_sets: 2, reps_range: "8-12", exercise_order: 4 },
      { id: "pk-2-ex5", name: "Elevação lateral halter", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 5 },
      { id: "pk-2-ex6", name: "Tríceps corda", sets: 5, working_sets: 3, reps_range: "10-12", exercise_order: 6 },
    ],
  },
  {
    id: "pk-day-3",
    name: "DIA 3 – LEGS",
    short_name: "Legs",
    day_order: 3,
    is_rest_day: false,
    color: "bg-green-500",
    exercises: [
      { id: "pk-3-ex1", name: "Mesa flexora", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 1 },
      { id: "pk-3-ex2", name: "Hack machine", sets: 4, working_sets: 2, reps_range: "6-10", exercise_order: 2 },
      { id: "pk-3-ex3", name: "Leg press", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 3 },
      { id: "pk-3-ex4", name: "Cadeira extensora", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 4 },
      { id: "pk-3-ex5", name: "Panturrilha", sets: 5, working_sets: 3, reps_range: "12-15", exercise_order: 5 },
    ],
  },
  {
    id: "pk-day-4",
    name: "DIA 4 – DESCANSO",
    short_name: "Descanso",
    day_order: 4,
    is_rest_day: true,
    color: "bg-emerald-500",
    exercises: [],
  },
  {
    id: "pk-day-5",
    name: "DIA 5 – UPPER (FOCO ESTÉTICO)",
    short_name: "Upper",
    day_order: 5,
    is_rest_day: false,
    color: "bg-purple-500",
    exercises: [
      { id: "pk-5-ex1", name: "Supino inclinado máquina", sets: 4, working_sets: 2, reps_range: "8-12", exercise_order: 1 },
      { id: "pk-5-ex2", name: "Puxada na frente", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 2 },
      { id: "pk-5-ex3", name: "Remada máquina", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 3 },
      { id: "pk-5-ex4", name: "Elevação lateral halter", sets: 5, working_sets: 3, reps_range: "12-15", exercise_order: 4 },
      { id: "pk-5-ex5", name: "Crucifixo inverso", sets: 4, working_sets: 2, reps_range: "12-15", exercise_order: 5 },
      { id: "pk-5-ex6", name: "Rosca direta", sets: 5, working_sets: 3, reps_range: "8-12", exercise_order: 6 },
      { id: "pk-5-ex7", name: "Tríceps crossover (chifre)", sets: 5, working_sets: 3, reps_range: "10-12", exercise_order: 7 },
    ],
  },
  {
    id: "pk-day-6",
    name: "DIA 6 – LOWER (POSTERIOR)",
    short_name: "Lower",
    day_order: 6,
    is_rest_day: false,
    color: "bg-yellow-500",
    exercises: [
      { id: "pk-6-ex1", name: "Cadeira flexora", sets: 4, working_sets: 2, reps_range: "8-10", exercise_order: 1 },
      { id: "pk-6-ex2", name: "Hack machine (leve)", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 2 },
      { id: "pk-6-ex3", name: "Leg press (pé baixo)", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 3 },
      { id: "pk-6-ex4", name: "Mesa flexora", sets: 4, working_sets: 2, reps_range: "10-12", exercise_order: 4 },
      { id: "pk-6-ex5", name: "Panturrilha", sets: 5, working_sets: 3, reps_range: "12-15", exercise_order: 5 },
    ],
  },
  {
    id: "pk-day-7",
    name: "DIA 7 – DESCANSO",
    short_name: "Descanso",
    day_order: 7,
    is_rest_day: true,
    color: "bg-emerald-500",
    exercises: [],
  },
];

// ── Demo plan type helpers ──────────────────────────────────────────────────
export function getDemoPlanType(): WorkoutType {
  return (localStorage.getItem("demo_plan_type") as WorkoutType) ?? "upper_lower";
}

export function setDemoPlanType(type: WorkoutType) {
  localStorage.setItem("demo_plan_type", type);
  localStorage.setItem("demo_day", "1");
}

export function getDemoActiveDays(): DemoDay[] {
  const type = getDemoPlanType();
  if (type === "anterior_posterior") return DEMO_DAYS_AP;
  if (type === "pacholok") return DEMO_DAYS_PACHOLOK;
  return DEMO_DAYS;
}

export function getDemoCurrentDayOrder(): number {
  return parseInt(localStorage.getItem("demo_day") || "1");
}

export function getCurrentDemoDay(): DemoDay {
  const order = getDemoCurrentDayOrder();
  const days = getDemoActiveDays();
  return days.find((d) => d.day_order === order) ?? days[0];
}

export function advanceDemoDay(currentDayId: string) {
  const days = getDemoActiveDays();
  const current = days.find((d) => d.id === currentDayId);
  const nextOrder = current ? (current.day_order % days.length) + 1 : 1;
  localStorage.setItem("demo_day", nextOrder.toString());
}

export function resetDemoDay() {
  localStorage.setItem("demo_day", "1");
}
