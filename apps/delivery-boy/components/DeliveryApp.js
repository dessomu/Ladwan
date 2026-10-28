// apps/delivery-boy/components/DeliveryApp.js
// Full Ladwan Delivery Agent PWA — bilingual (Hi/En), dual-mode (Firebase/Demo)
"use client";

import { useState } from "react";
import { useDeliveryStore } from "../lib/deliveryStore";
import Header from "./Header";
import DashboardView from "./DashboardView";
import ActiveDeliveryView from "./ActiveDeliveryView";
import HistoryView from "./HistoryView";
import ProfileView from "./ProfileView";
import BottomNav from "./BottomNav";

export default function DeliveryApp() {
  const store = useDeliveryStore();
  const [view, setView] = useState("dashboard"); // dashboard | active | history | profile

  // If there's an active delivery in progress, force active view
  const effectiveView =
    store.activeOrder && store.activeOrder.status === "out_for_delivery" && view === "dashboard"
      ? "active"
      : view;

  if (!store.isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-slate-400 font-medium">लाड्वान डिलीवरी लोड हो रही है…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto relative sm:border-x sm:border-slate-800/80 sm:shadow-2xl sm:shadow-black">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-gradient-to-b from-blue-600/10 via-blue-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <Header store={store} />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-2 pb-10">
        {effectiveView === "dashboard" && (
          <DashboardView store={store} onStartDelivery={() => setView("active")} />
        )}
        {effectiveView === "active" && (
          <ActiveDeliveryView
            store={store}
            onDelivered={() => setView("dashboard")}
            onBack={() => setView("dashboard")}
          />
        )}
        {view === "history" && <HistoryView store={store} />}
        {view === "profile" && <ProfileView store={store} />}
      </main>

      {/* Responsive Informational Footer for Desktop / Large screens */}
      <footer className="border-t border-slate-800/60 bg-slate-950/90 pt-6 pb-28 px-4 sm:px-6 text-center sm:text-left text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-semibold" suppressHydrationWarning>
              {store.lang === "hi" ? "लाडवां डिलीवरी पार्टनर नेटवर्क" : "Ladwan Delivery Partner Network"}
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">PWA v1.0</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400" suppressHydrationWarning>
            <span>{store.lang === "hi" ? "हेल्पलाइन: 1800-LADWAN" : "Partner Helpline: 1800-LADWAN"}</span>
            <span className="text-slate-700">•</span>
            <span>{store.lang === "hi" ? "सोनारपुर हब" : "Sonarpur Hub"}</span>
          </div>
        </div>
      </footer>

      <BottomNav view={view} setView={setView} store={store} />
    </div>
  );
}
