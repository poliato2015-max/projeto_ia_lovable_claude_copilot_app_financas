import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles, MessageSquare, Target, BarChart3, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();
  const cta = user ? "/app" : "/auth";

  return (
    <div className="min-h-screen">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold gradient-text">Bolsa</span>
        </div>
        <Link to={cta}>
          <Button variant="outline" size="sm">
            {user ? "Abrir app" : "Entrar"}
          </Button>
        </Link>
      </header>

      <main>
        <section className="px-6 md:px-10 pt-10 md:pt-20 pb-16 max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Finanças com inteligência artificial
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Controle seus gastos <br />
            <span className="gradient-text">conversando</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Diga "gastei R$ 50 no mercado" e pronto. A IA categoriza, organiza e ainda te ajuda a economizar — sem planilha, sem complicação.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={cta}>
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Começar grátis
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="px-6 md:px-10 pb-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: "Registro por chat", desc: "Linguagem natural em português. A IA categoriza para você." },
              { icon: Target, title: "Metas claras", desc: "Defina limites por categoria e veja seu progresso em tempo real." },
              { icon: BarChart3, title: "Insights reais", desc: "Gráficos por período e um agente que sugere onde economizar." },
              { icon: ShieldCheck, title: "Privado e seguro", desc: "Seus dados ficam só com você, criptografados em nuvem." },
              { icon: Sparkles, title: "Tudo no celular", desc: "Funciona lindo no mobile e no desktop, com modo escuro." },
              { icon: Wallet, title: "Exporte quando quiser", desc: "Baixe seu extrato em CSV para usar onde precisar." },
            ].map((f) => (
              <article key={f.title} className="kpi-card text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 md:px-10 py-8 text-center text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Bolsa. Feito com 💚 no Brasil.
      </footer>
    </div>
  );
};

export default Landing;
