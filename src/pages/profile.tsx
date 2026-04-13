import { useEffect, useState } from "react";
import * as React from "react";
import { supabase, isDemoMode } from "@/src/lib/supabase";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Dumbbell, ChevronRight } from "lucide-react";
import { type WorkoutType, PLAN_META } from "@/src/lib/plan-templates";
import { getDemoPlanType } from "@/src/lib/demo-data";

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (isDemoMode) {
        setProfile({ name: "Visitante", email: "demo@treino.app", body_weight: "75", goal: "Hipertrofia", workout_type: getDemoPlanType() });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const [{ data }, { data: plans }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("workout_plans").select("name").eq("user_id", user.id).limit(1),
      ]);

      let profileData = data;
      if (profileData && !profileData.workout_type && plans?.length) {
        const inferredType: WorkoutType = plans[0].name.includes("Anterior")
          ? "anterior_posterior"
          : "upper_lower";
        profileData = { ...profileData, workout_type: inferredType };
        supabase.from("profiles").update({ workout_type: inferredType }).eq("id", user.id);
      }

      setProfile(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isDemoMode) {
        alert("Perfil atualizado (Modo Demo)!");
        setSaving(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          name: profile.name,
          body_weight: profile.body_weight ? parseFloat(profile.body_weight) : null,
          goal: profile.goal
        })
        .eq("id", user.id);
      
      alert("Perfil atualizado!");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isDemoMode) {
      navigate("/login");
      return;
    }
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) return <div className="p-6 text-zinc-400">Carregando perfil...</div>;

  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <header className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
          <p className="text-zinc-400 text-sm mt-1">Suas informações</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-zinc-400" />
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Nome</label>
          <Input
            value={profile?.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Email</label>
          <Input
            value={profile?.email || ""}
            disabled
            className="opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Peso Corporal (kg)</label>
          <Input
            type="number"
            step="0.1"
            value={profile?.body_weight || ""}
            onChange={(e) => setProfile({ ...profile, body_weight: e.target.value })}
            placeholder="Ex: 75.5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Meta Principal</label>
          <Input
            value={profile?.goal || ""}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            placeholder="Ex: Hipertrofia, Perda de peso..."
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>

      {/* Workout type section */}
      <div className="pt-6 border-t border-zinc-800 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">Plano de Treino</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Estilo de divisão semanal ativo</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/onboarding?change=true")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-zinc-100">
              {PLAN_META[(profile?.workout_type as WorkoutType) ?? "upper_lower"].name}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {PLAN_META[(profile?.workout_type as WorkoutType) ?? "upper_lower"].frequency}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
        </button>
      </div>

      <div className="pt-2 border-t border-zinc-800">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair do aplicativo
        </Button>
      </div>
    </div>
  );
}
