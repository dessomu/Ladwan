// apps/customer-pwa/components/BottomNavigation.js - Native Mobile App Bottom Sticky Navigation Bar
"use client";

import { Wheat, Store, Clock, ShoppingBag, MapPin, Sparkles } from "lucide-react";

export default function BottomNavigation({
  activeTab = "store",
  onSelectTab,
  onOpenMillModal,
  onOpenTracking,
  onOpenCart,
  cartCount = 0,
  cartTotal = 0,
  hasActiveOrder = false,
  activeOrderStatus,
  lang = "hi",
}) {
  const tabs = [
    {
      id: "store",
      label: lang === "hi" ? "आटा स्टोर" : "Store",
      icon: Wheat,
      onClick: () => onSelectTab("store"),
    },
    {
      id: "chakkis",
      label: lang === "hi" ? "चक्कियां" : "Chakkis",
      icon: Store,
      onClick: () => {
        onSelectTab("chakkis");
        if (onOpenMillModal) onOpenMillModal();
      },
    },
    {
      id: "tracking",
      label: lang === "hi" ? "ऑर्डर" : "Orders",
      icon: Clock,
      badge: hasActiveOrder ? 1 : 0,
      badgeColor: "bg-amber-500",
      isPulsing: hasActiveOrder,
      onClick: () => {
        onSelectTab("tracking");
        if (onOpenTracking) onOpenTracking();
      },
    },
    {
      id: "cart",
      label: lang === "hi" ? "टोकरी" : "Cart",
      icon: ShoppingBag,
      badge: cartCount,
      badgeColor: "bg-red-500",
      amount: cartCount > 0 ? `₹${cartTotal}` : null,
      onClick: () => {
        onSelectTab("cart");
        if (onOpenCart) onOpenCart();
      },
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-stone-800/90 px-2 py-1.5 sm:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onClick}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all active:scale-90 ${
                isActive
                  ? "text-amber-400 font-extrabold"
                  : "text-stone-400 hover:text-stone-200 font-medium"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-stone-400"
                  }`}
                />

                {/* Badge indicator */}
                {tab.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-3 px-1.5 py-0.2 rounded-full text-white font-mono text-[9px] font-black ${
                      tab.badgeColor || "bg-red-500"
                    } ${tab.isPulsing ? "animate-pulse ring-2 ring-amber-500/30" : ""}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 tracking-tight flex items-center gap-0.5">
                <span>{tab.label}</span>
                {tab.amount && (
                  <span className="text-amber-300 font-black">({tab.amount})</span>
                )}
              </span>

              {/* Active Pill Indicator */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
