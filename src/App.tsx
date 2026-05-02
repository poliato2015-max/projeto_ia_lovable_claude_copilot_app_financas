import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import { useEffect } from "react";

const queryClient = new QueryClient();

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname.includes("lovable.app"));

const useServiceWorker = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (isPreviewHost || isInIframe) {
      // Limpa SWs em preview/iframe para evitar cache problemático
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => { /* silencioso */ });
  }, []);
};

const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => {
  useServiceWorker();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PwaInstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<Protected><Home /></Protected>} />
          <Route path="/app/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/app/chat" element={<Protected><Chat /></Protected>} />
          <Route path="/app/metas" element={<Protected><Goals /></Protected>} />
          <Route path="/app/relatorios" element={<Protected><Reports /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
