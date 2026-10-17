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
  const [selectedGrind, setSelectedGrind] = useState(
    product.popularGrind || product.grindOptions?.[0] || "बारीक (रोटी)"
  );
  const [showGrindOptions, setShowGrindOptions] = useState(false);

  // Compute live price for selected weight
  const currentKg =
    selectedWeight === "1kg"
      ? 1
      : selectedWeight === "2kg"
      ? 2
      : selectedWeight === "5kg"
      ? 5
      : 10;

  const currentPrice =
    product.prices?.[selectedWeight] ||
    (product.prices?.["1kg"]
      ? product.prices["1kg"] * currentKg
      : 45 * currentKg);

  const perKgRate = Math.round(currentPrice / currentKg);

  // Find if this specific variant is already in cart
  const cartItemId = `${product.id}_${selectedWeight}_${selectedGrind}`;
  const existingCartItem = cartItems.find((item) => item.id === cartItemId);
  const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;

  const grindList =
    lang === "hi"
      ? product.grindOptions || ["बारीक (रोटी)", "मध्यम", "चोकर युक्त"]
      : product.englishGrindOptions || ["Fine (Roti)", "Medium", "High Bran"];

  return (
    <div className="group rounded-3xl bg-stone-900/80 border border-stone-800/80 hover:border-amber-500/40 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col justify-between">
      {/* Top Part: Image, Badges & Titles */}
      <div>
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-stone-950 mb-3 border border-stone-800/60">
          <img
            src={product.imageUrl}
            alt={product.englishName || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {product.badge && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-lg">
                {product.badge}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              100% पत्थर-पिसा
            </span>
          </div>

          {/* Live stock indicator */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-stone-950/85 backdrop-blur-md text-stone-300 text-[10px] font-semibold border border-stone-800">
            {product.stockKg || 450} kg उपलब्ध
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1 mb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-stone-100 text-sm sm:text-base leading-snug group-hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="text-[11px] font-medium text-stone-400">
            {product.englishName}
          </div>
        </div>

        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3">
          {lang === "hi" ? product.description : product.englishDescription}
        </p>

        {/* Weight Selector Pills */}
        <div className="mb-3">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-400" />
              <span>{lang === "hi" ? "वज़न चुनें" : "Select Weight"}</span>
            </span>
            <span className="text-amber-400 font-semibold">
              ₹{perKgRate}/kg
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
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
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
              <span>{lang === "hi" ? "पिसाई की मोटाई" : "Grind Texture"}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowGrindOptions(!showGrindOptions)}
              className="text-amber-400 underline underline-offset-2"
            >
              {selectedGrind}
            </button>
          </div>

          {showGrindOptions ? (
            <div className="grid grid-cols-3 gap-1 pt-1 animate-in fade-in duration-150">
              {grindList.map((g) => {
                const isSelected = selectedGrind === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setSelectedGrind(g);
                      setShowGrindOptions(false);
                    }}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold truncate transition-all ${
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
              <span className="text-[10px] text-emerald-400 font-semibold">
                100% ताज़ा
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Part: Price & Cart Button */}
      <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-black text-emerald-400 leading-tight">
            ₹{currentPrice}
          </div>
          <div className="text-[10px] text-stone-400 font-medium">
            {selectedWeight} • ₹{perKgRate}/kg
          </div>
        </div>

        {/* Add / Quantity Stepper Button */}
        <button
          type="button"
          onClick={() => onAddToCart(product, selectedWeight, selectedGrind)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
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
