import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, formatDate } from "@/lib/format";

type Category = { id: string; name: string; icon: string };
type Tx = {
  id: string;
  description: string;
  amount: number;
  category_id: string | null;
  payment_method: string | null;
  created_at: string;
};

const Reports = () => {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  const load = async () => {
    if (!user) return;
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("categories").select("id, name, icon"),
    ]);
    setTxs((t ?? []) as Tx[]);
    setCats((c ?? []) as Category[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const catName = (id: string | null) => {
    const c = cats.find((x) => x.id === id);
    return c ? `${c.icon} ${c.name}` : "Sem categoria";
  };

  const exportCSV = () => {
    if (txs.length === 0) {
      toast.info("Nada para exportar ainda.");
      return;
    }
    const header = ["data", "descricao", "categoria", "valor", "metodo_pagamento"];
    const rows = txs.map((t) => [
      new Date(t.created_at).toISOString(),
      `"${(t.description ?? "").replace(/"/g, '""')}"`,
      `"${catName(t.category_id).replace(/"/g, '""')}"`,
      Number(t.amount).toFixed(2).replace(".", ","),
      `"${(t.payment_method ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bolsa-extrato-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  const onDelete = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) toast.error("Erro ao remover.");
    else {
      setTxs((p) => p.filter((t) => t.id !== id));
      toast.success("Transação removida.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Seu extrato completo (últimas 500).</p>
        </div>
        <Button variant="hero" onClick={exportCSV}>
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </header>

      {txs.length === 0 ? (
        <div className="kpi-card text-center py-12 text-muted-foreground">
          Nenhuma transação registrada ainda.
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-border">
            {txs.map((t) => (
              <li key={t.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{t.description}</div>
                  <div className="text-xs text-muted-foreground">{catName(t.category_id)} · {formatDate(t.created_at)}</div>
                  {t.payment_method && <div className="text-xs text-muted-foreground capitalize">{t.payment_method}</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-bold text-destructive">- {formatBRL(Number(t.amount))}</span>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} aria-label="Remover">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Descrição</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Pagamento</th>
                <th className="px-4 py-3 font-semibold text-right">Valor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/40">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(t.created_at)}</td>
                  <td className="px-4 py-3">{t.description}</td>
                  <td className="px-4 py-3">{catName(t.category_id)}</td>
                  <td className="px-4 py-3 capitalize">{t.payment_method || "—"}</td>
                  <td className="px-4 py-3 text-right font-bold text-destructive">- {formatBRL(Number(t.amount))}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} aria-label="Remover">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
