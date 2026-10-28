// apps/customer-pwa/components/CategoryTabs.js - Product Category Filter Pills
"use client";

import { PRODUCT_CATEGORIES } from "@ladwan/database/schemas";

const CATEGORIES = [
  { key: "All", label: "सभी आटा", englishLabel: "All Flours", icon: "🌾" },
  { key: "Wheat Atta", label: "गेहूं आटा", englishLabel: "Wheat Atta", icon: "🥖" },
  { key: "Sattu & Besan", label: "सत्तू व बेसन", englishLabel: "Sattu & Besan", icon: "🥣" },
  { key: "Millet Atta", label: "मोटे अनाज (Millets)", englishLabel: "Millet Atta", icon: "🌾" },
  { key: "Specialty Flour", label: "स्पेशल आटा", englishLabel: "Specialty", icon: "✨" },
];

export default function CategoryTabs({ activeCategory, onSelectCategory, lang }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none mb-3.5 sm:mb-6">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              isActive
                ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20"
                : "bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800 hover:border-stone-700"
            }`}
          >
            <span>{cat.icon}</span>
            <span suppressHydrationWarning>{lang === "hi" ? cat.label : cat.englishLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
