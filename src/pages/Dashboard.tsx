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
type Tx = { id: string; amount: number; category_id: string | null; created_at: string };

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
      supabase.from("transactions").select("id, amount, category_id, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
    ]).then(([c, t]) => {
      setCategories((c.data ?? []) as Category[]);
      setTxs((t.data ?? []) as Tx[]);
    });
  }, [user, period]);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const total = useMemo(() => txs.reduce((s, t) => s + Number(t.amount), 0), [txs]);

  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of txs) {
      const key = t.category_id ?? "none";
      m[key] = (m[key] ?? 0) + Number(t.amount);
    }
    return Object.entries(m).map(([id, value]) => {
      const cat = catMap.get(id);
      return {
        name: cat ? `${cat.icon} ${cat.name}` : "Sem categoria",
        value,
        color: cat?.color ? `hsl(${cat.color})` : "hsl(var(--muted-foreground))",
      };
    }).sort((a, b) => b.value - a.value);
  }, [txs, catMap]);

  const overTime = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of txs) {
      const d = new Date(t.created_at);
      const key = period === "year"
        ? `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`
        : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      m[key] = (m[key] ?? 0) + Number(t.amount);
    }
    return Object.entries(m).map(([name, total]) => ({ name, total }));
  }, [txs, period]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Total no período: <strong className="text-foreground">{formatBRL(total)}</strong></p>
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
          Nenhum gasto registrado no período. Vá em <strong>Registrar</strong> para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <article className="kpi-card">
            <h2 className="font-bold mb-4">Gastos por categoria</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                  formatter={(v: number) => formatBRL(v)}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="mt-4 space-y-2 text-sm">
              {byCategory.map((c) => (
                <li key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold">{formatBRL(c.value)}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="kpi-card">
            <h2 className="font-bold mb-4">Evolução no período</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Legend />
                <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
