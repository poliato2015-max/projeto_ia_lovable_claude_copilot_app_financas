import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mic, Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";

type Category = { id: string; name: string; icon: string; color: string };
type ParsedTx = {
  description: string;
  amount: number;
  category_id: string | null;
  category_name: string | null;
  category_icon: string | null;
  payment_method: string;
};
type ChatMsg = { role: "user" | "assistant"; content: string };

const Chat = () => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialTab = params.get("advisor") ? "advisor" : "register";
  const [tab, setTab] = useState<"register" | "advisor">(initialTab as "register" | "advisor");

  const [categories, setCategories] = useState<Category[]>([]);
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedTx | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [overrideCategoryId, setOverrideCategoryId] = useState<string | null>(null);

  const [advisorMessages, setAdvisorMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Oi! Eu sou seu agente financeiro. Pergunte algo como _\"onde posso economizar?\"_ ou _\"como estão meus gastos com lazer?\"_." },
  ]);
  const [advisorInput, setAdvisorInput] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const advisorEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories((data ?? []) as Category[]);
    });
  }, []);

  useEffect(() => {
    advisorEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [advisorMessages]);

  const handleParse = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-finance", {
        body: { mode: "parse_transaction", message: input },
      });
      if (error) throw error;
      const result = data as ParsedTx;
      if (!result.amount || result.amount <= 0) {
        toast.error("Não consegui identificar o valor. Tente: \"gastei R$ 50 no mercado\".");
        return;
      }
      setParsed(result);
      setOverrideCategoryId(result.category_id);
      setPaymentMethod(result.payment_method ?? "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar.";
      if (msg.includes("429")) toast.error("Muitas requisições. Aguarde um instante.");
      else if (msg.includes("402")) toast.error("Limite de IA atingido. Adicione créditos no Lovable.");
      else toast.error(msg);
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!parsed || !user) return;
    if (!overrideCategoryId) {
      toast.error("Escolha uma categoria.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      description: parsed.description || input,
      amount: parsed.amount,
      category_id: overrideCategoryId,
      payment_method: paymentMethod || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success("Transação registrada! 💚");
    setInput("");
    setParsed(null);
    setOverrideCategoryId(null);
    setPaymentMethod("");
  };

  const handleVoice = () => {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition; SpeechRecognition?: new () => SpeechRecognition })
      .webkitSpeechRecognition || (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
    if (!SR) {
      toast.info("Ditado por voz não disponível neste navegador.");
      return;
    }
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      setInput((p) => (p ? `${p} ${text}` : text));
    };
    rec.onerror = () => toast.error("Não consegui ouvir, tente de novo.");
    rec.start();
  };

  const sendAdvisor = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!advisorInput.trim() || advisorLoading) return;
    const userMsg: ChatMsg = { role: "user", content: advisorInput };
    setAdvisorMessages((p) => [...p, userMsg]);
    setAdvisorInput("");
    setAdvisorLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-finance", {
        body: { mode: "advisor", message: userMsg.content },
      });
      if (error) throw error;
      setAdvisorMessages((p) => [...p, { role: "assistant", content: (data as { reply: string }).reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao consultar.";
      if (msg.includes("429")) toast.error("Muitas requisições. Aguarde um instante.");
      else if (msg.includes("402")) toast.error("Limite de IA atingido.");
      else toast.error(msg);
    } finally {
      setAdvisorLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-extrabold">Conversar</h1>
        <p className="text-sm text-muted-foreground">Registre gastos ou peça conselhos à IA.</p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="register">Registrar</TabsTrigger>
          <TabsTrigger value="advisor">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Agente IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-4">
          <form onSubmit={handleParse} className="glass-card rounded-2xl p-4 space-y-3">
            <label htmlFor="tx-input" className="text-sm font-medium">
              Descreva seu gasto em linguagem natural
            </label>
            <div className="flex gap-2">
              <Input
                id="tx-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ex: "gastei R$ 50 no mercado com pix"'
                aria-label="Descrição do gasto"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleVoice} aria-label="Ditar por voz">
                <Mic className="w-4 h-4" />
              </Button>
              <Button type="submit" variant="hero" disabled={parsing || !input.trim()}>
                {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Exemplos: "almoço 35 reais no débito", "uber 22,50", "mercado 187 no crédito".
            </p>
          </form>

          {parsed && (
            <article className="glass-card rounded-2xl p-5 space-y-4 border-primary/30">
              <h2 className="font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Confirme os dados
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Valor</div>
                  <div className="text-2xl font-bold">{formatBRL(parsed.amount)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Descrição</div>
                  <div className="font-medium line-clamp-2">{parsed.description}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <Select value={overrideCategoryId ?? ""} onValueChange={(v) => setOverrideCategoryId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Pagamento</label>
                  <Select value={paymentMethod || "none"} onValueChange={(v) => setPaymentMethod(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— não informar —</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="débito">Débito</SelectItem>
                      <SelectItem value="crédito">Crédito</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setParsed(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="hero" onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Salvar
                </Button>
              </div>
            </article>
          )}
        </TabsContent>

        <TabsContent value="advisor" className="space-y-4">
          <div className="glass-card rounded-2xl p-4 h-[60vh] overflow-y-auto space-y-3 flex flex-col">
            {advisorMessages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground self-end rounded-br-sm"
                    : "bg-secondary text-secondary-foreground self-start rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {advisorLoading && (
              <div className="self-start flex items-center gap-2 text-muted-foreground text-sm px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin" /> pensando...
              </div>
            )}
            <div ref={advisorEndRef} />
          </div>
          <form onSubmit={sendAdvisor} className="flex gap-2">
            <Input
              value={advisorInput}
              onChange={(e) => setAdvisorInput(e.target.value)}
              placeholder="Pergunte algo..."
              aria-label="Mensagem para o agente"
            />
            <Button type="submit" variant="hero" disabled={advisorLoading || !advisorInput.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chat;
