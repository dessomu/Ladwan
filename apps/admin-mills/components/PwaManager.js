"use client";

import { useState, useEffect } from "react";
import { Download, WifiOff, CheckCircle2, X, Smartphone } from "lucide-react";

export default function PwaManager({ lang = "hi" }) {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.warn("[PWA] Service Worker registration failed:", error);
        });
    }

    // 2. Online / Offline network listeners
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 3. Capture beforeinstallprompt for Android / Chrome / Edge
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        setInstallPrompt(e);
      };

      // 4. Check if already running as installed standalone app
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      window.addEventListener("appinstalled", () => {
        setIsInstalled(true);
        setInstallPrompt(null);
      });

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  return (
    <>
      {/* 1. Offline Mode Indicator Pill */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse text-red-200" />
            <span>
              {lang === "en"
                ? "Offline Mode Active — Internet disconnected, but all mill data is cached locally."
                : "📡 ऑफलाइन मोड — इंटरनेट बंद है, लेकिन आपका डेटा फोन पर सुरक्षित है।"}
            </span>
          </div>
          <span className="text-[10px] bg-red-800/80 px-2 py-0.5 rounded font-mono">
            {lang === "en" ? "OFFLINE" : "ऑफ़लाइन"}
          </span>
        </div>
      )}

      {/* 2. Download / Install App Banner (When browser triggers installability) */}
      {installPrompt && !isInstalled && !dismissed && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 px-3.5 py-2 flex items-center justify-between shadow-lg sticky z-40 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-stone-950/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-stone-950" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight truncate">
                {lang === "en" ? "Install Ladwan Chakki App" : "लाडवां चक्की ऐप इंस्टॉल करें"}
              </p>
              <p className="text-[10px] text-amber-950/80 truncate">
                {lang === "en"
                  ? "Fast access from home screen & works offline"
                  : "होम स्क्रीन पर डाउनलोड करें • ऑफलाइन भी चलेगा"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 rounded-lg bg-stone-950 hover:bg-stone-900 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "Install App" : "ऐप डाउनलोड करें"}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-amber-950/70 hover:text-amber-950 rounded"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
