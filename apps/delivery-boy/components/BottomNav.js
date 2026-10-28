// apps/delivery-boy/components/BottomNav.js
"use client";

import { LayoutDashboard, Navigation, Clock, UserCircle } from "lucide-react";

export default function BottomNav({ view, setView, store }) {
  const { pendingDeliveries, lang } = store;
  const pendingCount = pendingDeliveries?.length || 0;

  const tabs = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      labelHi: "डैशबोर्ड",
      labelEn: "Dashboard",
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: "active",
      icon: Navigation,
      labelHi: "डिलीवरी",
      labelEn: "Delivery",
      badge: null,
    },
    {
      id: "history",
      icon: Clock,
      labelHi: "इतिहास",
      labelEn: "History",
      badge: null,
    },
    {
      id: "profile",
      icon: UserCircle,
      labelHi: "प्रोफाइल",
      labelEn: "Profile",
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
      <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-around sm:justify-center sm:gap-2 md:gap-4 px-2 sm:px-6 py-2 sm:py-2.5 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-1.5 sm:py-2 px-1 sm:px-4 sm:rounded-2xl relative transition-all active:scale-95 ${
                isActive
                  ? "text-blue-400 sm:bg-blue-600/15 sm:border sm:border-blue-500/30 sm:shadow-sm sm:shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-300 sm:text-slate-400 sm:hover:text-slate-200 sm:hover:bg-slate-850/60 sm:border sm:border-transparent"
              }`}
            >
              {/* Active indicator bar for mobile */}
              {isActive && (
                <span className="sm:hidden absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-400" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform ${isActive ? "scale-110" : ""}`}
                />
                {tab.badge !== null && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 sm:-top-1 sm:-right-2.5 min-w-[16px] h-4 px-1 bg-blue-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] sm:text-xs font-semibold tracking-tight ${
                  isActive ? "font-bold" : ""
                }`}
                suppressHydrationWarning
              >
                {lang === "hi" ? tab.labelHi : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
