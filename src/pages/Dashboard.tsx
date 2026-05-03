import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRL } from "@/lib/format";

type Period = "day" | "week" | "month" | "year";
type Category = { id: string; name: string; icon: string; color: string };
type Tx = { id: string; amount: number; category_id: string | null; created_at: string; type: string };

const periodStart = (p: Period): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (p === "day") return d;
  if (p === "week") {
    const dow = d.getDay();
    d.setDate(d.getDate() - dow);
    return d;
  }
  if (p === "month") return new Date(d.getFullYear(), d.getMonth(), 1);
  return new Date(d.getFullYear(), 0, 1);
};

const tooltipStyle: React.CSSProperties = {
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  boxShadow: "var(--shadow-md)",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!user) return;
    const since = periodStart(period);
    Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("transactions").select("id, amount, category_id, created_at, type")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
    ]).then(([c, t]) => {
      setCategories((c.data ?? []) as Category[]);
      setTxs((t.data ?? []) as Tx[]);
    });
  }, [user, period]);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const totals = useMemo(() => {
    let exp = 0, inc = 0;
    for (const t of txs) {
      if (t.type === "income") inc += Number(t.amount);
      else exp += Number(t.amount);
    }
    return { exp, inc, balance: inc - exp };
  }, [txs]);

  const expensesByCategory = useMemo(() => {
    const m: Record<string, number> = {};
    let total = 0;
    for (const t of txs) {
      if (t.type === "income") continue;
      const key = t.category_id ?? "none";
      const v = Number(t.amount);
      m[key] = (m[key] ?? 0) + v;
      total += v;
    }
    return Object.entries(m).map(([id, value]) => {
      const cat = catMap.get(id);
      return {
        name: cat ? `${cat.icon} ${cat.name}` : "Sem categoria",
        rawName: cat?.name ?? "Sem categoria",
        value,
        pct: total > 0 ? (value / total) * 100 : 0,
        color: cat?.color ? `hsl(${cat.color})` : "hsl(var(--muted-foreground))",
      };
    }).sort((a, b) => b.value - a.value);
  }, [txs, catMap]);

  const overTime = useMemo(() => {
    const m: Record<string, { name: string; despesas: number; receitas: number; ord: number }> = {};
    for (const t of txs) {
      const d = new Date(t.created_at);
      let key: string;
      let ord: number;
      if (period === "year") {
        key = d.toLocaleDateString("pt-BR", { month: "short" });
        ord = d.getMonth();
      } else {
        const day = d.getDate().toString().padStart(2, "0");
        const mo = (d.getMonth() + 1).toString().padStart(2, "0");
        key = `${day}/${mo}`;
        ord = d.getMonth() * 100 + d.getDate();
      }
      if (!m[key]) m[key] = { name: key, despesas: 0, receitas: 0, ord };
      if (t.type === "income") m[key].receitas += Number(t.amount);
      else m[key].despesas += Number(t.amount);
    }
    return Object.values(m).sort((a, b) => a.ord - b.ord);
  }, [txs, period]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Despesas: <strong className="text-destructive">{formatBRL(totals.exp)}</strong> ·
            Receitas: <strong className="text-success"> {formatBRL(totals.inc)}</strong> ·
            Saldo: <strong className="text-primary"> {formatBRL(totals.balance)}</strong>
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {txs.length === 0 ? (
        <div className="kpi-card text-center py-12 text-muted-foreground">
          Nenhuma transação no período. Vá em <strong>Registrar</strong> para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <article className="kpi-card">
            <h2 className="font-bold mb-4">Despesas por categoria</h2>
            {expensesByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma despesa no período.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {expensesByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                      labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                      formatter={(v: number) => formatBRL(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-4 space-y-2 text-sm">
                  {expensesByCategory.map((c) => (
                    <li key={c.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-semibold">{formatBRL(c.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>

          <article className="kpi-card">
            <h2 className="font-bold mb-4">Receitas vs Despesas no período</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>

          <article className="kpi-card lg:col-span-2">
            <h2 className="font-bold mb-4">Comparativo de gastos por categoria</h2>
            {expensesByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma despesa no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, expensesByCategory.length * 40)}>
                <BarChart data={expensesByCategory} layout="vertical" margin={{ left: 16, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                    formatter={(v: number) => formatBRL(v)}
                  />
                  <Bar dataKey="value" name="Total" radius={[0, 8, 8, 0]}>
                    {expensesByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </article>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
