import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";
import { z } from "zod";

type Category = { id: string; name: string; icon: string };
type Goal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category_id: string | null;
  deadline: string | null;
};

const schema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(100),
  target_amount: z.number().positive("Valor deve ser maior que zero"),
  category_id: z.string().nullable(),
  deadline: z.string().nullable(),
});

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: gs }, { data: cs }] = await Promise.all([
      supabase.from("goals").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, icon").order("name"),
    ]);
    setGoals((gs ?? []) as Goal[]);
    setCategories((cs ?? []) as Category[]);
    // Recompute current_amount for category goals from transactions
    if (gs && gs.length > 0) {
      const updates = await Promise.all(
        (gs as Goal[]).map(async (g) => {
          if (!g.category_id) return null;
          const { data: txs } = await supabase
            .from("transactions")
            .select("amount")
            .eq("category_id", g.category_id);
          const sum = (txs ?? []).reduce((s, t) => s + Number(t.amount), 0);
          if (Number(g.current_amount) !== sum) {
            await supabase.from("goals").update({ current_amount: sum }).eq("id", g.id);
            return { id: g.id, sum };
          }
          return null;
        })
      );
      setGoals((prev) =>
        prev.map((g) => {
          const u = updates.find((x) => x && x.id === g.id);
          return u ? { ...g, current_amount: u.sum } : g;
        })
      );
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: fd.get("title"),
      target_amount: Number(fd.get("target_amount")),
      category_id: (fd.get("category_id") as string) || null,
      deadline: (fd.get("deadline") as string) || null,
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
      category_id: parsed.data.category_id === "none" ? null : parsed.data.category_id,
      deadline: parsed.data.deadline,
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao criar meta.");
      return;
    }
    toast.success("Meta criada! 🎯");
    setOpen(false);
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
                <Label>Categoria (opcional)</Label>
                <Select name="category_id" defaultValue="none">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geral (sem categoria)</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Prazo (opcional)</Label>
                <Input id="deadline" name="deadline" type="date" />
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
          <Target className="w-10 h-10 mx-auto text-primary mb-3" />
          <p className="text-muted-foreground">Você ainda não tem metas. Crie a primeira!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const cat = categories.find((c) => c.id === g.category_id);
            const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
            const over = pct >= 100;
            return (
              <article key={g.id} className="kpi-card">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden>{cat?.icon ?? "🎯"}</span>
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
                  <span className={`font-semibold ${over ? "text-destructive" : "text-primary"}`}>{pct.toFixed(0)}%</span>
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
