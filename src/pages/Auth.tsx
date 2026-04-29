import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});
const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(1, "Informe a senha").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: parsed.data.full_name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Esse e-mail já está cadastrado." : error.message);
      return;
    }
    toast.success("Conta criada! Bem-vindo(a) ao Bolsa.");
    navigate("/app");
  };

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    toast.success("Bem-vindo(a) de volta!");
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-glow)]">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-extrabold gradient-text">Bolsa</span>
      </Link>

      <div className="w-full max-w-md glass-card rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-1 text-center">
          {tab === "signin" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {tab === "signin" ? "Acesse seu painel financeiro" : "Comece em menos de 1 minuto"}
        </p>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={onSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email-in">E-mail</Label>
                <Input id="email-in" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
              </div>
              <div>
                <Label htmlFor="pass-in">Senha</Label>
                <Input id="pass-in" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={onSignUp} className="space-y-4">
              <div>
                <Label htmlFor="name-up">Nome completo</Label>
                <Input id="name-up" name="full_name" required placeholder="Maria Silva" />
              </div>
              <div>
                <Label htmlFor="email-up">E-mail</Label>
                <Input id="email-up" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
              </div>
              <div>
                <Label htmlFor="pass-up">Senha</Label>
                <Input id="pass-up" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Mínimo 8 caracteres" />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar conta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
