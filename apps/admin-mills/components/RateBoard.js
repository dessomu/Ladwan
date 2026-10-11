"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Wheat,
  SlidersHorizontal,
  Check,
  X,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
  Package,
} from "lucide-react";

export default function RateBoard({
  products,
  onUpdatePrice,
  onToggleStock,
  onOpenAddModal,
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPriceId, setEditingPriceId] = useState(null); // { id, weightKey }

  const categories = [
    { id: "all", label: "सभी (All Items)" },
    { id: "Wheat Atta", label: "गेहूं आटा (Wheat)" },
    { id: "Specialty Flour", label: "मल्टीग्रेन (Multigrain)" },
    { id: "Sattu & Besan", label: "सत्तू व बेसन" },
    { id: "Millet Atta", label: "मोटे अनाज (Millets)" },
    { id: "Services", label: "पिसाई सेवा (Services)" },
  ];

  const filteredProducts = products.filter((item) => {
    const matchesCat =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePriceStep = (productId, weightKey, currentPrice, delta) => {
    const newPrice = Math.max(1, (Number(currentPrice) || 0) + delta);
    onUpdatePrice(productId, weightKey, newPrice);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="आटा या अनाज खोजें (उदा. शरबती, सत्तू, बेसन, बाजरा)..."
            className="w-full bg-stone-950/70 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ नया आटा / अनाज जोड़ें</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-600/20"
                : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rate Board Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>दैनिक रेट बोर्ड (Daily Rate Board):</strong> मंडी के अनुसार रोज भाव बदलें। मूल्य पर क्लिक करें या <strong>+ / -</strong> बटन से 1 सेकंड में अपडेट करें।
          </span>
        </div>
        <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px]">
          {filteredProducts.length} उपलब्ध किस्में
        </span>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredProducts.map((product) => {
          const isAvailable = product.isAvailable;

          return (
            <div
              key={product.id}
              className={`relative bg-stone-900/90 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isAvailable
                  ? "border-stone-800 hover:border-amber-500/40 shadow-sm"
                  : "border-red-900/40 bg-stone-950/60 opacity-80"
              }`}
            >
              {/* Card Top: Image, Titles & Stock Switch */}
              <div className="p-3.5 sm:p-4">
                <div className="flex items-start gap-3">
                  {/* Grain Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-800 flex-shrink-0 border border-stone-700/60">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <span className="absolute bottom-0 left-0 right-0 bg-stone-950/90 text-amber-300 text-[9px] font-bold text-center py-0.5 truncate px-1">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Info and Stock Toggle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-stone-400 font-medium">
                          {product.englishName}
                        </p>
                      </div>

                      {/* 1-Tap Stock Switch */}
                      <button
                        type="button"
                        onClick={() => onToggleStock(product.id)}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all border ${
                          isAvailable
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/25"
                        }`}
                      >
                        {isAvailable ? "🟢 उपलब्ध (In Stock)" : "🔴 खत्म (Out of Stock)"}
                      </button>
                    </div>

                    <p className="mt-1.5 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Grind Coarseness Chips */}
                    {product.grindOptions && product.grindOptions.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-stone-500 font-medium">पिसाई:</span>
                        {product.grindOptions.map((grind, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[10px] border border-stone-700/60 font-medium"
                          >
                            {grind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Bottom: Daily Rate Board (1kg, 5kg, 10kg Price Editor) */}
              <div className="bg-stone-950/80 border-t border-stone-800/80 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                    <Wheat className="w-3.5 h-3.5" />
                    दैनिक रेट बोर्ड (Daily Selling Price)
                  </span>
                  <span className="text-[10px] text-stone-500">
                    स्टॉक: ~{product.stockKg} kg
                  </span>
                </div>

                {/* 3 Size Price Tiles */}
                <div className="grid grid-cols-3 gap-2">
                  {["1kg", "5kg", "10kg"].map((weightKey) => {
                    const price = product.prices?.[weightKey] ?? 0;
                    const isMillingService = product.category === "Services";
                    const perKgRate =
                      weightKey === "1kg"
                        ? price
                        : weightKey === "5kg"
                        ? Math.round(price / 5)
                        : Math.round(price / 10);

                    return (
                      <div
                        key={weightKey}
                        className="bg-stone-900 border border-stone-800 rounded-xl p-2 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
                          <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-200">
                            {weightKey}
                          </span>
                          {!isMillingService && (
                            <span className="text-[9px] text-stone-500 font-mono">
                              ₹{perKgRate}/kg
                            </span>
                          )}
                        </div>

                        {/* Price Display and Direct Steppers */}
                        <div className="my-1.5 text-center">
                          <div className="flex items-baseline justify-center gap-0.5">
                            <span className="text-xs font-bold text-amber-400">₹</span>
                            <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                              {price}
                            </span>
                          </div>
                        </div>

                        {/* Quick 1-Tap Adjuster Steppers */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-800/80">
                          <button
                            type="button"
                            onClick={() => handlePriceStep(product.id, weightKey, price, -5)}
                            title="-₹5"
                            className="px-1.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-[10px] font-bold active:scale-95 transition-all"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePriceStep(product.id, weightKey, price, -1)}
                            title="-₹1"
                            className="px-1.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-[10px] font-bold active:scale-95 transition-all"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePriceStep(product.id, weightKey, price, +1)}
                            title="+₹1"
                            className="px-1.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold active:scale-95 transition-all border border-amber-500/30"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePriceStep(product.id, weightKey, price, +5)}
                            title="+₹5"
                            className="px-1.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold active:scale-95 transition-all border border-amber-500/30"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-stone-900/60 rounded-2xl border border-stone-800 p-6">
          <Wheat className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-300">कोई आटा या अनाज नहीं मिला</h3>
          <p className="text-xs text-stone-500 mt-1">
            कृपया सर्च शब्द बदलें या ऊपर दिए बटन से नया आइटम जोड़ें।
          </p>
        </div>
      )}
    </div>
  );
}
