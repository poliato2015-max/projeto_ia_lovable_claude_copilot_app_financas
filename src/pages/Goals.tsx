import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Trash2, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; icon: string; type: string };
type GoalType = "expense" | "income";
type Goal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category_id: string | null;
  deadline: string | null;
  type: GoalType;
};

const schema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(100),
  target_amount: z.number().positive("Valor deve ser maior que zero"),
});

const EmptyGoalsIllustration = () => (
  <svg viewBox="0 0 240 180" className="w-48 h-36 mx-auto mb-4" aria-hidden>
    <defs>
      <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
      </linearGradient>
      <linearGradient id="goalGradSoft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary) / 0.15)" />
        <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="160" rx="90" ry="10" fill="url(#goalGradSoft)" />
    <circle cx="120" cy="85" r="55" fill="url(#goalGrad)" opacity="0.15" />
    <circle cx="120" cy="85" r="42" fill="none" stroke="url(#goalGrad)" strokeWidth="6" />
    <circle cx="120" cy="85" r="28" fill="none" stroke="url(#goalGrad)" strokeWidth="4" opacity="0.7" />
    <circle cx="120" cy="85" r="10" fill="url(#goalGrad)" />
    <path d="M120 25 L120 145" stroke="url(#goalGrad)" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
    <path d="M60 85 L180 85" stroke="url(#goalGrad)" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
    <path d="M155 60 L175 50 L170 70 Z" fill="url(#goalGrad)" />
  </svg>
);

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [goalType, setGoalType] = useState<GoalType>("expense");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((c) => (c.type || "expense") === goalType),
    [categories, goalType]
  );

  const load = async () => {
    if (!user) return;
    const [{ data: gs }, { data: cs }] = await Promise.all([
      supabase.from("goals").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, icon, type").order("name"),
    ]);
    const goalsList = (gs ?? []) as Goal[];
    setCategories((cs ?? []) as Category[]);

    if (goalsList.length > 0) {
      const updates = await Promise.all(
        goalsList.map(async (g) => {
          // Soma transações do mesmo tipo da meta (income ou expense)
          let q = supabase.from("transactions").select("amount").eq("type", g.type || "expense");
          if (g.category_id) q = q.eq("category_id", g.category_id);
          const { data: txs } = await q;
          const sum = (txs ?? []).reduce((s, t) => s + Number(t.amount), 0);
          if (Number(g.current_amount) !== sum) {
            await supabase.from("goals").update({ current_amount: sum }).eq("id", g.id);
          }
          return { id: g.id, sum };
        })
      );
      setGoals(goalsList.map((g) => {
        const u = updates.find((x) => x.id === g.id);
        return u ? { ...g, current_amount: u.sum } : g;
      }));
    } else {
      setGoals([]);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  // Reseta categoria ao trocar tipo
  useEffect(() => { setCategoryId("none"); }, [goalType]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: fd.get("title"),
      target_amount: Number(fd.get("target_amount")),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: parsed.data.title,
      target_amount: parsed.data.target_amount,
      type: goalType,
      category_id: categoryId === "none" ? null : categoryId,
      deadline: deadline ? format(deadline, "yyyy-MM-dd") : null,
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao criar meta.");
      return;
    }
    toast.success("Meta criada! 🎯");
    setOpen(false);
    setGoalType("expense");
    setCategoryId("none");
    setDeadline(undefined);
    load();
  };

  const onDelete = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) toast.error("Erro ao remover.");
    else {
      toast.success("Meta removida.");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Metas</h1>
          <p className="text-sm text-muted-foreground">Defina limites e acompanhe seu progresso.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="w-4 h-4" /> Nova meta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required placeholder="Ex: Gastar até R$ 300 em alimentação" />
              </div>
              <div>
                <Label htmlFor="target_amount">Valor alvo (R$)</Label>
                <Input id="target_amount" name="target_amount" type="number" min="1" step="0.01" required placeholder="300" />
              </div>
              <div>
                <Label>Tipo</Label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl mt-1" role="radiogroup">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={goalType === "expense"}
                    onClick={() => setGoalType("expense")}
                    className={cn(
                      "py-2 rounded-lg text-sm font-semibold transition-all",
                      goalType === "expense"
                        ? "bg-destructive text-destructive-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    💸 Despesa
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={goalType === "income"}
                    onClick={() => setGoalType("income")}
                    className={cn(
                      "py-2 rounded-lg text-sm font-semibold transition-all",
                      goalType === "income"
                        ? "bg-success text-success-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    💰 Receita
                  </button>
                </div>
              </div>
              <div>
                <Label>Categoria (opcional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Geral (todas as {goalType === "income" ? "receitas" : "despesas"})
                    </SelectItem>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prazo (opcional)</Label>
                <Popover open={calOpen} onOpenChange={setCalOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP", { locale: ptBR }) : "Escolher data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={(d) => { setDeadline(d); setCalOpen(false); }}
                      initialFocus
                      locale={ptBR}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Criar meta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {goals.length === 0 ? (
        <div className="kpi-card text-center py-12">
          <EmptyGoalsIllustration />
          <p className="text-muted-foreground">Você ainda não tem metas. Crie a primeira!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const cat = categories.find((c) => c.id === g.category_id);
            const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
            const reached = pct >= 100;
            const isIncome = g.type === "income";
            const icon = cat?.icon ?? "🎯";
            const reachedColor = isIncome ? "text-success" : "text-destructive";
            return (
              <article key={g.id} className="kpi-card">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden>{icon}</span>
                    <h2 className="font-bold">{g.title}</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(g.id)} aria-label="Remover meta">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <Progress value={pct} aria-label={`${pct.toFixed(0)}%`} />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">
                    {formatBRL(Number(g.current_amount))} de {formatBRL(Number(g.target_amount))}
                  </span>
                  <span className={`font-semibold ${reached ? reachedColor : "text-primary"}`}>{pct.toFixed(0)}%</span>
                </div>
                {g.deadline && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Prazo: {new Date(g.deadline).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
