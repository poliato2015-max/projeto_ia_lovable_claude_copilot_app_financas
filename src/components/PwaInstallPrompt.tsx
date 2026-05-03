import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "bolsa_pwa_dismissed_at";
const DISMISS_DAYS = 7;

export const PwaInstallPrompt = () => {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const expired = !dismissedAt || Date.now() - dismissedAt > DISMISS_DAYS * 86400000;

    const onBIP = (e: Event) => {
      e.preventDefault();
      if (!expired) return;
      setEvt(e as BIPEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  if (!visible || !evt) return null;

  const onInstall = async () => {
    await evt.prompt();
    await evt.userChoice;
    setVisible(false);
  };
  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 inset-x-4 md:left-auto md:right-4 md:w-80 z-50 glass-card rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Instalar o Bolsa</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adicione o Bolsa à sua tela inicial e acesse suas finanças rapidamente, sem precisar da Play Store.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="hero" onClick={onInstall}>Instalar</Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>Agora não</Button>
          </div>
        </div>
        <button onClick={onDismiss} aria-label="Fechar" className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
