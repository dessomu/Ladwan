// apps/customer-pwa/components/ProductCard.js - Hyperlocal Atta Product Card
"use client";

import { useState } from "react";

import {
  Plus,
  Minus,
  Check,
  Sparkles,
  Scale,
  SlidersHorizontal,
} from "lucide-react";
import { calculatePrice } from "../lib/customerStore";

const WEIGHT_OPTIONS = [
  { key: "1kg", label: "1 kg", multiplier: 1 },
  { key: "2kg", label: "2 kg", multiplier: 2 },
  { key: "5kg", label: "5 kg", multiplier: 5, isPopular: true },
  { key: "10kg", label: "10 kg", multiplier: 10 },
];

export default function ProductCard({
  product,
  onAddToCart,
  cartItems = [],
  lang,
}) {
  const [selectedWeight, setSelectedWeight] = useState(
    product.defaultWeight || "5kg"
  );
  const [selectedGrindIndex, setSelectedGrindIndex] = useState(0);
  const [showGrindOptions, setShowGrindOptions] = useState(false);

  const hiGrinds = product.grindOptions || ["बारीक (रोटी)", "मध्यम", "चोकर युक्त"];
  const enGrinds = product.englishGrindOptions || ["Fine (Roti)", "Medium", "High Bran"];
  const grindList = lang === "hi" ? hiGrinds : enGrinds;
  const selectedGrind = grindList[selectedGrindIndex] || grindList[0];

  // Compute live price for selected weight using calculatePrice
  const currentKg =
    selectedWeight === "1kg"
      ? 1
      : selectedWeight === "2kg"
      ? 2
      : selectedWeight === "5kg"
      ? 5
      : 10;

  const currentPrice = calculatePrice(product.prices || product, selectedWeight);
  const perKgRate = Math.round(currentPrice / currentKg);

  // Find if this specific variant is already in cart
  const existingCartItem = cartItems.find((item) => {
    if (item.productId !== product.id || item.weightKey !== selectedWeight) return false;
    return (
      item.grindOption === selectedGrind ||
      item.grindOption === hiGrinds[selectedGrindIndex] ||
      item.grindOption === enGrinds[selectedGrindIndex]
    );
  });
  const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;

  return (
    <div className="group rounded-3xl bg-stone-900/80 border border-stone-800/80 hover:border-amber-500/40 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col justify-between">
      {/* Top Part: Image, Badges & Titles */}
      <div>
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-stone-950 mb-3 border border-stone-800/60">
          <img
            src={product.imageUrl}
            alt={lang === "hi" ? product.name : (product.englishName || product.name)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {product.badge && (
              <span
                className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-lg"
                suppressHydrationWarning
              >
                {lang === "hi" ? product.badge : (product.englishBadge || product.badge)}
              </span>
            )}
            <span
              className="px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold border border-emerald-500/20"
              suppressHydrationWarning
            >
              {lang === "hi" ? "100% पत्थर-पिसा" : "100% Cold Stone Milled"}
            </span>
          </div>

          {/* Live stock indicator */}
          <div
            className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-stone-950/85 backdrop-blur-md text-stone-300 text-[10px] font-semibold border border-stone-800"
            suppressHydrationWarning
          >
            {product.stockKg || 450} {lang === "hi" ? "kg उपलब्ध" : "kg in stock"}
          </div>
        </div>

        {/* Title & Tagline: Proper bilingual heading switch */}
        <div className="space-y-1 mb-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-extrabold text-stone-100 text-sm sm:text-base leading-snug group-hover:text-amber-400 transition-colors"
              suppressHydrationWarning
            >
              {lang === "hi"
                ? product.name
                : product.englishName || product.name}
            </h3>
          </div>
          <div
            className="text-[11px] font-medium text-stone-400 truncate"
            suppressHydrationWarning
          >
            {lang === "hi"
              ? product.englishName || product.category
              : product.name || product.category}
          </div>
        </div>

        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3" suppressHydrationWarning>
          {lang === "hi" ? product.description : product.englishDescription}
        </p>

        {/* Weight Selector Pills - Clean with no confusing per/kg label in header */}
        <div className="mb-3">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-400" />
              <span suppressHydrationWarning>{lang === "hi" ? "वज़न चुनें" : "Select Weight"}</span>
            </span>
            <span className="text-stone-400 font-semibold text-[11px]" suppressHydrationWarning>
              {selectedWeight} {lang === "hi" ? "पैक" : "pack"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {WEIGHT_OPTIONS.map((opt) => {
              const isSelected = selectedWeight === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedWeight(opt.key)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-extrabold"
                      : "bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grind Texture Selector Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              <span suppressHydrationWarning>{lang === "hi" ? "पिसाई की मोटाई" : "Grind Texture"}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowGrindOptions(!showGrindOptions)}
              className="text-amber-400 underline underline-offset-2 cursor-pointer"
            >
              {selectedGrind}
            </button>
          </div>

          {showGrindOptions ? (
            <div className="grid grid-cols-3 gap-1 pt-1 animate-in fade-in duration-150">
              {grindList.map((g, idx) => {
                const isSelected = selectedGrindIndex === idx;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setSelectedGrindIndex(idx);
                      setShowGrindOptions(false);
                    }}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold truncate transition-all cursor-pointer ${
                      isSelected
                        ? "bg-stone-100 text-stone-950"
                        : "bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-stone-400 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="truncate">{selectedGrind}</span>
              <span className="text-[10px] text-emerald-400 font-semibold" suppressHydrationWarning>
                {lang === "hi" ? "100% ताज़ा" : "100% Fresh"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Part: Dynamic Emerald Price Badge & Add to Cart Button */}
      <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-black text-emerald-400 leading-tight flex items-baseline gap-1">
            <span>₹{currentPrice}</span>
            <span className="text-xs font-bold text-emerald-400/80">
              / {selectedWeight}
            </span>
          </div>
          <div className="text-[10px] text-stone-400 font-medium" suppressHydrationWarning>
            ₹{perKgRate}/kg • {lang === "hi" ? "ताज़ा पिसाई" : "Fresh Milled"}
          </div>
        </div>

        {/* Add / Quantity Stepper Button (No price on button) */}
        <button
          type="button"
          onClick={() => onAddToCart(product, selectedWeight, selectedGrind, currentPrice)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span suppressHydrationWarning>
            {quantityInCart > 0
              ? `${
                  lang === "hi" ? "और जोड़ें" : "Add More"
                } (${quantityInCart})`
              : lang === "hi"
              ? "टोकरी में जोड़ें"
              : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  );
}
