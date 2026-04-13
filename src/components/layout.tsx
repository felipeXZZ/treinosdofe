import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Dumbbell, History, User } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Dumbbell, label: "Treino", path: "/workout" },
    { icon: History, label: "Histórico", path: "/history" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl pb-safe">
        <div className="flex h-16 items-center justify-around px-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
                  isActive ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "fill-zinc-100/20")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
