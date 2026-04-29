import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, MessageSquare, Target, FileText, Moon, Sun, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const navItems = [
  { to: "/app", label: "Início", icon: Home, end: true },
  { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/app/chat", label: "Registrar", icon: MessageSquare },
  { to: "/app/metas", label: "Metas", icon: Target },
  { to: "/app/relatorios", label: "Relatórios", icon: FileText },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-xl p-5 gap-2">
        <Link to="/app" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold gradient-text">Bolsa</span>
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <item.icon className="w-4 h-4" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            className="justify-start"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Tema claro" : "Tema escuro"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <Link to="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-extrabold gradient-text text-lg">Bolsa</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-20 md:pb-8 px-4 md:px-8 pt-4 md:pt-8 max-w-6xl w-full mx-auto" key={location.pathname}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-card/90 backdrop-blur-xl border-t border-border z-40"
        aria-label="Navegação inferior"
      >
        <ul className="grid grid-cols-5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5" aria-hidden />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
