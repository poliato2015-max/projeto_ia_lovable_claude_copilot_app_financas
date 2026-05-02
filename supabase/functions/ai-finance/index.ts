// Edge function: AI for parsing transactions and giving financial advice
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function callAI(body: unknown) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Response(
      JSON.stringify({ error: text, status: res.status }),
      { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, message } = await req.json();

    // Load categories (shared)
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, icon");
    const catList = (categories ?? []).map((c) => `${c.icon} ${c.name}`).join(", ");

    if (mode === "parse_transaction") {
      const aiRes = await callAI({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              `Você extrai informações de transações financeiras em português brasileiro. ` +
              `Categorias disponíveis: ${catList}. ` +
              `IMPORTANTE: identifique se é DESPESA ou RECEITA. ` +
              `Palavras como "recebi", "ganhei", "entrada", "salário", "pagamento recebido", "freela", "rendimento", "depósito", "pix recebido", "venda" indicam RECEITA (type=income). ` +
              `Palavras como "gastei", "paguei", "comprei", "saída", "débito" indicam DESPESA (type=expense). ` +
              `Se houver ambiguidade, considere DESPESA por padrão. ` +
              `Sempre escolha a categoria que melhor descreve. Se for receita sem categoria clara, omita category_name.`,
          },
          { role: "user", content: message },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "register_transaction",
              description: "Registra uma transação (despesa ou receita) a partir do texto do usuário",
              parameters: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["expense", "income"],
                    description: "Tipo: 'expense' (despesa) ou 'income' (receita)",
                  },
                  description: { type: "string", description: "Breve descrição (ex: 'mercado', 'salário')" },
                  amount: { type: "number", description: "Valor em reais, sempre positivo" },
                  category_name: {
                    type: "string",
                    description: "Nome exato da categoria. Omita se incerto.",
                    enum: (categories ?? []).map((c) => c.name).filter((n) => n && n.length > 0),
                  },
                  payment_method: {
                    type: "string",
                    description: "Método de pagamento (pix, crédito, débito, dinheiro, boleto). Omita se não mencionado.",
                  },
                },
                required: ["type", "description", "amount"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "register_transaction" } },
      });

      const tc = aiRes.choices?.[0]?.message?.tool_calls?.[0];
      const args = tc ? JSON.parse(tc.function.arguments) : null;
      const matched = (categories ?? []).find((c) => c.name === args?.category_name);
      return new Response(
        JSON.stringify({
          type: args?.type === "income" ? "income" : "expense",
          description: args?.description ?? "",
          amount: Number(args?.amount ?? 0),
          category_id: matched?.id ?? null,
          category_name: matched?.name ?? null,
          category_icon: matched?.icon ?? null,
          payment_method: args?.payment_method ?? "",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (mode === "advisor") {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const { data: txs } = await supabase
        .from("transactions")
        .select("amount, created_at, category_id, description, type")
        .gte("created_at", since.toISOString());

      const catMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
      const expenseTotals: Record<string, number> = {};
      let incomeTotal = 0;
      for (const t of txs ?? []) {
        if ((t as any).type === "income") {
          incomeTotal += Number(t.amount);
        } else {
          const cat = catMap.get(t.category_id as string) ?? "Outros";
          expenseTotals[cat] = (expenseTotals[cat] ?? 0) + Number(t.amount);
        }
      }
      const expenseSummary = Object.entries(expenseTotals)
        .map(([k, v]) => `${k}: R$ ${v.toFixed(2)}`)
        .join("; ") || "Sem despesas registradas.";
      const summary = `Receitas totais: R$ ${incomeTotal.toFixed(2)}. Despesas por categoria: ${expenseSummary}.`;

      const aiRes = await callAI({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Você é um agente financeiro brasileiro amigável e educativo. Use tom acolhedor, evite jargões. " +
              "Sempre justifique sugestões com base nos dados reais do usuário (cite os valores). " +
              "Responda em português brasileiro, em até 4 parágrafos curtos. Use markdown leve.",
          },
          {
            role: "user",
            content: `Resumo dos meus últimos 90 dias: ${summary}\n\nMinha pergunta: ${message}`,
          },
        ],
      });
      const reply = aiRes.choices?.[0]?.message?.content ?? "Não consegui gerar uma resposta agora.";
      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "modo inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
