"use client";

import { Tag, Bell, BookOpen, Store, Wheat } from "lucide-react";

export default function BottomNavigation({ activeTab, setActiveTab, ordersCount }) {
  const tabs = [
    {
      id: "rates",
      label: "रेट लिस्ट (Rates)",
      icon: Tag,
    },
    {
      id: "orders",
      label: "लाइव आर्डर (Orders)",
      icon: Bell,
      badge: ordersCount,
    },
    {
      id: "ledger",
      label: "दैनिक खाता (Ledger)",
      icon: BookOpen,
    },
    {
      id: "profile",
      label: "चक्की प्रोफाइल",
      icon: Store,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-lg border-t border-stone-800/80 px-2 py-1.5 sm:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? "text-amber-400 font-bold"
                  : "text-stone-400 hover:text-stone-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-400 scale-110" : "text-stone-400"}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full bg-red-500 text-white font-mono text-[9px] font-extrabold animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {tab.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
