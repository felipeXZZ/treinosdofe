/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, isDemoMode } from "./lib/supabase";
import { Layout } from "./components/layout";
import { Login } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { WorkoutList } from "./pages/workout-list";
import { Workout } from "./pages/workout";
import { History } from "./pages/history";
import { Profile } from "./pages/profile";
import { Onboarding } from "./pages/onboarding";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setSession({ user: { id: "demo-user" } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Carregando...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isDemoMode && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 text-blue-400 text-xs text-center py-1.5 fixed top-0 w-full z-50 backdrop-blur-md">
          Modo de Demonstração — configure Supabase para salvar dados
        </div>
      )}
      <div className={isDemoMode ? "pt-6" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/onboarding" element={session ? <Onboarding /> : <Navigate to="/login" />} />

          <Route path="/" element={session ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="workout" element={<WorkoutList />} />
            <Route path="workout/:dayId" element={<Workout />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
