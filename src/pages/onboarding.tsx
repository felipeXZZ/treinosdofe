import { useState } from "react";
import * as React from "react";
import { supabase, isDemoMode } from "@/src/lib/supabase";
import { Button } from "@/src/components/ui/button";
import { Dumbbell, ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import {
  type WorkoutType,
  PLAN_META,
  createPlan,
  deleteUserPlans,
} from "@/src/lib/plan-templates";
import { setDemoPlanType, getDemoPlanType } from "@/src/lib/demo-data";

export function Onboarding() {
  const [selected, setSelected] = useState<WorkoutType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isChanging = searchParams.get("change") === "true";

  // Pre-select current type when changing
  React.useEffect(() => {
    if (isChanging) {
      if (isDemoMode) {
        setSelected(getDemoPlanType());
      } else {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase
            .from("profiles")
            .select("workout_type")
            .eq("id", user.id)
            .single()
            .then(({ data }) => {
              if (data?.workout_type) setSelected(data.workout_type as WorkoutType);
            });
        });
      }
    }
  }, [isChanging]);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        setDemoPlanType(selected);
        navigate("/");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Delete existing plans before creating the new one
      await deleteUserPlans(user.id);
      await createPlan(selected, user.id);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Ocorreu um erro ao criar o plano");
    } finally {
      setLoading(false);
    }
  };

  const planTypes: WorkoutType[] = ["upper_lower", "anterior_posterior"];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-1 animate-slide-up">
          {isChanging && (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
              <Dumbbell className="w-5 h-5 text-zinc-100" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isChanging ? "Alterar Plano" : "Escolha seu Treino"}
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {isChanging
              ? "Selecione o novo estilo de divisão. O plano atual será substituído."
              : "Selecione o estilo de divisão semanal que melhor se encaixa em seus objetivos."}
          </p>
        </div>

        {/* Plan cards */}
        <div className="space-y-4">
          {planTypes.map((type, idx) => {
            const meta = PLAN_META[type];
            const isSelected = selected === type;

            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                style={{ animationDelay: `${idx * 60}ms` }}
                className={cn(
                  "w-full text-left rounded-2xl border p-5 transition-all duration-200 active:scale-[0.98] animate-slide-up",
                  isSelected
                    ? "border-zinc-400 bg-zinc-800/80 shadow-lg shadow-black/40"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-zinc-100">
                        {meta.name}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-zinc-600/80 text-zinc-200 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {meta.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700/60 px-2.5 py-1 rounded-full">
                        {meta.frequency}
                      </span>
                      <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700/60 px-2.5 py-1 rounded-full">
                        {meta.focus}
                      </span>
                    </div>
                    <PlanPreview type={type} />
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-zinc-100 bg-zinc-100"
                        : "border-zinc-600"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-zinc-900" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Confirm button */}
        <div className="pt-2 animate-slide-up" style={{ animationDelay: "160ms" }}>
          <Button
            className="w-full"
            size="lg"
            disabled={!selected || loading}
            onClick={handleConfirm}
          >
            {loading
              ? "Criando plano..."
              : isChanging
              ? "Aplicar Plano"
              : "Começar"}
          </Button>
          {!isChanging && (
            <p className="text-center text-xs text-zinc-600 mt-3">
              Você pode alterar o plano depois nas configurações.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanPreview({ type }: { type: WorkoutType }) {
  const schedules: Record<WorkoutType, { label: string; tag: string; color: string }[]> = {
    upper_lower: [
      { label: "Seg", tag: "Upper", color: "text-red-400" },
      { label: "Ter", tag: "Lower", color: "text-blue-400" },
      { label: "Qua", tag: "Desc.", color: "text-emerald-400" },
      { label: "Qui", tag: "Upper", color: "text-purple-400" },
      { label: "Sex", tag: "Lower", color: "text-yellow-400" },
    ],
    anterior_posterior: [
      { label: "Seg", tag: "Ant.", color: "text-orange-400" },
      { label: "Ter", tag: "Post.", color: "text-cyan-400" },
      { label: "Qua", tag: "Desc.", color: "text-emerald-400" },
      { label: "Qui", tag: "Ant.", color: "text-orange-400" },
      { label: "Sex", tag: "Post.", color: "text-cyan-400" },
    ],
  };

  return (
    <div className="flex gap-1.5 pt-1">
      {schedules[type].map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-zinc-600 font-medium">{item.label}</span>
          <span className={cn("text-[9px] font-bold", item.color)}>{item.tag}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-1 ml-0.5">
        <span className="text-[9px] text-zinc-600 font-medium">Sáb</span>
        <span className="text-[9px] font-bold text-zinc-600">—</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] text-zinc-600 font-medium">Dom</span>
        <span className="text-[9px] font-bold text-zinc-600">—</span>
      </div>
    </div>
  );
}
