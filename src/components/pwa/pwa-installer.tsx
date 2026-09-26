"use client";

import { useState, useEffect } from "react";
import { Download, X, WifiOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Track Online/Offline Status
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 3. Listen for PWA Install Prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);

        // Check if previously dismissed in this session
        const dismissed = sessionStorage.getItem("pustakakita_pwa_dismissed");
        if (!dismissed) {
          setShowInstallBanner(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[PWA] User response to install prompt:", outcome);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pustakakita_pwa_dismissed", "true");
  };

  return (
    <>
      {/* Offline Status Floating Pill */}
      {isOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-500/95 dark:bg-amber-600/95 px-4 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
            <span>Mode Offline — Kartu Digital Tetap Aktif</span>
          </div>
        </div>
      )}

      {/* Sleek PWA Install Prompt Banner */}
      {showInstallBanner && (
        <aside
          aria-label="Install Aplikasi PustakaKita"
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-foreground">
                    Pasang Aplikasi PustakaKita
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Akses instan dari layar utama & kartu anggota tetap bisa dibuka saat offline!
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="w-full text-xs font-bold gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Pasang ke Layar Utama
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground"
              >
                Nanti
              </Button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
