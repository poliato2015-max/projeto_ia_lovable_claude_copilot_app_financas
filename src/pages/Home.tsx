import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatBRL, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowDownRight, Plus, Sparkles, Target, Wallet } from "lucide-react";

type Tx = { id: string; amount: number; description: string; created_at: string; category_id: string | null };
type Goal = { id: string; title: string; target_amount: number; current_amount: number };

const Home = () => {
  const { user } = useAuth();
  const [todaySpent, setTodaySpent] = useState(0);
  const [monthSpent, setMonthSpent] = useState(0);
  const [lastTx, setLastTx] = useState<Tx | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);

    Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
      supabase.from("transactions").select("amount").gte("created_at", start.toISOString()),
      supabase.from("transactions").select("amount").gte("created_at", monthStart.toISOString()),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("goals").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]).then(([p, today, month, last, g]) => {
      setName((p.data?.full_name as string)?.split(" ")[0] ?? "");
      setTodaySpent((today.data ?? []).reduce((s, t) => s + Number(t.amount), 0));
      setMonthSpent((month.data ?? []).reduce((s, t) => s + Number(t.amount), 0));
      setLastTx((last.data as Tx) ?? null);
      setGoal((g.data as Goal) ?? null);
    });
  }, [user]);

  const goalPct = goal ? Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100) : 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Olá{name ? `, ${name}` : ""} 👋</p>
        <h1 className="text-2xl md:text-3xl font-extrabold">Seu resumo de hoje</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="kpi-card md:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-90" />
          <div className="relative text-primary-foreground">
            <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
              <Wallet className="w-4 h-4" /> Gasto este mês
            </div>
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight">{formatBRL(monthSpent)}</div>
            <div className="text-sm opacity-90 mt-2">Hoje: {formatBRL(todaySpent)}</div>
          </div>
        </article>

        <article className="kpi-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowDownRight className="w-4 h-4" /> Último gasto
          </div>
          {lastTx ? (
            <>
              <div className="text-2xl font-bold">{formatBRL(Number(lastTx.amount))}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">{lastTx.description}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatDate(lastTx.created_at)}</div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum gasto ainda. Registre o primeiro!</p>
          )}
        </article>
      </div>

      <article className="kpi-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="font-bold">{goal ? goal.title : "Crie sua primeira meta"}</h2>
          </div>
          <Link to="/app/metas">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </div>
        {goal ? (
          <>
            <Progress value={goalPct} aria-label={`Progresso ${goalPct.toFixed(0)}%`} />
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">
                {formatBRL(Number(goal.current_amount))} de {formatBRL(Number(goal.target_amount))}
              </span>
              <span className="font-semibold text-primary">{goalPct.toFixed(0)}%</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Defina um limite e acompanhe seu progresso em tempo real.
          </p>
        )}
      </article>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/app/chat">
          <article className="kpi-card group cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-glow)] group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold">Nova transação</h3>
                <p className="text-sm text-muted-foreground">Registre por chat com IA</p>
              </div>
            </div>
          </article>
        </Link>
        <Link to="/app/chat?advisor=1">
          <article className="kpi-card group cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[image:var(--gradient-accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold">Falar com agente IA</h3>
                <p className="text-sm text-muted-foreground">Receba dicas personalizadas</p>
              </div>
            </div>
          </article>
        </Link>
      </div>
    </div>
  );
};

export default Home;
