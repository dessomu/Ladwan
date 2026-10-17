// apps/customer-pwa/components/PWAInstallBanner.js - Mobile Home Screen Install Prompt
"use client";

import { useState, useEffect } from "react";
import { Download, X, Sparkles, Smartphone } from "lucide-react";

export default function PWAInstallBanner({ lang }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed previously in this session
      const dismissed = sessionStorage.getItem("ladwan_pwa_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("ladwan_pwa_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-40 bg-stone-900 border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 font-black text-lg shrink-0 shadow-md">
            ला
          </div>
          <div>
            <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
              <span>{lang === "hi" ? "लाडवां ऐप इंस्टॉल करें" : "Install Ladwan App"}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                PWA
              </span>
            </div>
            <div className="text-[11px] text-stone-400">
              {lang === "hi"
                ? "होम स्क्रीन पर जोड़ें और 1-क्लिक में ताज़ा आटा मंगवाएं"
                : "Add to Home Screen for instant fresh flour orders"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === "hi" ? "जोड़ें" : "Install"}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
