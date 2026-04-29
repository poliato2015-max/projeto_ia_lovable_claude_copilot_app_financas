import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type Theme = "light" | "dark";

export function useTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load preference from profile when user logs in
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const t = (data?.preferences as { theme?: Theme } | null)?.theme;
        if (t && t !== theme) setTheme(t);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggle = async () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (user) {
      await supabase
        .from("profiles")
        .update({ preferences: { theme: next } })
        .eq("user_id", user.id);
    }
  };

  return { theme, toggle };
}
