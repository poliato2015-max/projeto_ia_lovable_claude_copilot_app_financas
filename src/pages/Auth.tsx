import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, Loader2, Check, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { capitalizeName } from "@/lib/format";
import { cn } from "@/lib/utils";

const passwordRules = {
  length: (s: string) => s.length >= 8,
  upper: (s: string) => /[A-Z]/.test(s),
  lower: (s: string) => /[a-z]/.test(s),
  number: (s: string) => /\d/.test(s),
  symbol: (s: string) => /[^A-Za-z0-9]/.test(s),
};

const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(1, "Informe a senha").max(72),
});

const traduzErroAuth = (msg: string) => {
  const m = msg.toLowerCase();
  if (m.includes("already") || m.includes("registered")) return "Esse e-mail já está cadastrado.";
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("password")) return "A senha não atende aos requisitos.";
  if (m.includes("email")) return "E-mail inválido.";
  return msg;
};

type SignupErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3.5 h-3.5" /> {msg}
    </p>
  ) : null;

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const checks = useMemo(() => ({
    length: passwordRules.length(password),
    upper: passwordRules.upper(password),
    lower: passwordRules.lower(password),
    number: passwordRules.number(password),
    symbol: passwordRules.symbol(password),
  }), [password]);

  const allValid = Object.values(checks).every(Boolean);

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = fullName.trim().replace(/\s+/g, " ");
    const newErrors: SignupErrors = {};
    if (trimmedName.split(" ").length < 2 || trimmedName.length < 3) {
      newErrors.fullName = "Por favor, informe seu nome e sobrenome";
    }
    const emailOk = z.string().trim().email().safeParse(email).success;
    if (!emailOk) newErrors.email = "Informe um e-mail válido";
    if (!allValid) newErrors.password = "A senha não atende aos requisitos";
    if (password !== confirm) newErrors.confirm = "As senhas não coincidem";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const fullNameNorm = capitalizeName(trimmedName);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: fullNameNorm },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(traduzErroAuth(error.message));
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

  const RuleItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? "text-success" : "text-muted-foreground"}`}>
      {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {label}
    </li>
  );

  const errCls = "border-destructive focus-visible:ring-destructive";

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
            <form onSubmit={onSignUp} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="name-up">Nome completo</Label>
                <Input
                  id="name-up"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined })); }}
                  required
                  placeholder="Maria Silva"
                  className={cn("capitalize", errors.fullName && errCls)}
                  aria-invalid={!!errors.fullName}
                />
                <FieldError msg={errors.fullName} />
              </div>
              <div>
                <Label htmlFor="email-up">E-mail</Label>
                <Input
                  id="email-up"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                  className={cn(errors.email && errCls)}
                  aria-invalid={!!errors.email}
                />
                <FieldError msg={errors.email} />
              </div>
              <div>
                <Label htmlFor="pass-up">Senha</Label>
                <Input
                  id="pass-up"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                  className={cn(errors.password && errCls)}
                  aria-invalid={!!errors.password}
                />
                <FieldError msg={errors.password} />
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                  <RuleItem ok={checks.length} label="Mínimo 8 caracteres" />
                  <RuleItem ok={checks.upper} label="Uma letra maiúscula" />
                  <RuleItem ok={checks.lower} label="Uma letra minúscula" />
                  <RuleItem ok={checks.number} label="Um número" />
                  <RuleItem ok={checks.symbol} label="Um símbolo" />
                </ul>
              </div>
              <div>
                <Label htmlFor="pass-confirm">Confirmar senha</Label>
                <Input
                  id="pass-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined })); }}
                  className={cn(((confirm.length > 0 && confirm !== password) || errors.confirm) && errCls)}
                  aria-invalid={!!errors.confirm || (confirm.length > 0 && confirm !== password)}
                />
                <FieldError msg={errors.confirm || (confirm.length > 0 && confirm !== password ? "As senhas não coincidem" : undefined)} />
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
