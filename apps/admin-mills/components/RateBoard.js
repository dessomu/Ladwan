"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Wheat,
  TrendingUp,
  Check,
  Edit2,
  X,
  Power,
  Scale,
  ClipboardList,
  Trash2,
} from "lucide-react";
import {
  formatProductDescription,
  formatProductBadge,
  formatGrindOption,
} from "../lib/langUtils";

export default function RateBoard({
  products = [],
  onUpdatePrice,
  onToggleStock,
  onUpdateStockKg,
  onDeleteProduct,
  onOpenAddModal,
  onOpenMasterCatalog,
  lang = "hi",
  t,
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Price editing state: `${productId}_${weightKey}`
  const [editingItem, setEditingItem] = useState(null);
  const [draftPrice, setDraftPrice] = useState("");

  // Direct KG stock editing state: `${productId}`
  const [editingStockId, setEditingStockId] = useState(null);
  const [draftStockKg, setDraftStockKg] = useState("");

  const categories = [
    { id: "all", label: t.allCategories },
    { id: "Wheat Atta", label: t.catWheat },
    { id: "Specialty Flour", label: t.catMultigrain },
    { id: "Sattu & Besan", label: t.catSattuBesan },
    { id: "Millet Atta", label: t.catMillets },
    { id: "Services", label: t.catServices },
  ];

  const filteredProducts = products.filter((item) => {
    const matchesCat =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.englishName && item.englishName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleStartPriceEdit = (productId, weightKey, currentPrice) => {
    setEditingItem(`${productId}_${weightKey}`);
    setDraftPrice(String(currentPrice));
  };

  const handleSavePrice = (productId, weightKey) => {
    const numericPrice = Number(draftPrice);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      onUpdatePrice(productId, weightKey, numericPrice);
    }
    setEditingItem(null);
    setDraftPrice("");
  };

  const handleCancelPriceEdit = () => {
    setEditingItem(null);
    setDraftPrice("");
  };

  const handleStartStockEdit = (product) => {
    setEditingStockId(product.id);
    setDraftStockKg(String(product.stockKg ?? 0));
  };

  const handleSaveStock = (productId) => {
    const num = Math.max(0, Number(draftStockKg) || 0);
    if (onUpdateStockKg) {
      onUpdateStockKg(productId, num);
    }
    setEditingStockId(null);
    setDraftStockKg("");
  };

  const handleQuickStockDelta = (productId, currentStock, delta) => {
    const next = Math.max(0, (Number(currentStock) || 0) + delta);
    if (onUpdateStockKg) {
      onUpdateStockKg(productId, next);
    }
  };

  // If mill has zero active products (Fresh Onboarding State)
  if (products.length === 0) {
    return (
      <div className="bg-stone-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Wheat className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t.emptyActiveInventoryTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            {t.emptyActiveInventoryDesc}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenMasterCatalog}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 mx-auto shadow-xl shadow-amber-950/40 active:scale-95 transition-all"
          >
            <ClipboardList className="w-5 h-5 stroke-[2.5]" />
            <span>{t.openCatalogSetupBtn}</span>
          </button>
        </div>
      </div>
    );
  }

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
            placeholder={t.searchPlaceholder}
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

        <div className="flex items-center gap-2">
          {/* Master Catalog Onboarding/Expansion Button */}
          <button
            type="button"
            onClick={onOpenMasterCatalog}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <ClipboardList className="w-4 h-4 text-amber-400" />
            <span>{t.masterCatalogBtn}</span>
          </button>

          {/* Add Custom Item Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addNewItem}</span>
            <span className="sm:hidden">{t.addNewItem.split(" ")[0]}</span>
          </button>
        </div>
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
          <span>{t.dailyRateBoardNotice}</span>
        </div>
        <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px]">
          {filteredProducts.length} {t.availableVarieties}
        </span>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredProducts.map((product) => {
          const isAvailable = product.isAvailable !== false && Number(product.stockKg || 0) > 0;
          const currentStock = Number(product.stockKg ?? 0);
          const isEditingStock = editingStockId === product.id;

          const displayTitle =
            lang === "en" && product.englishName ? product.englishName : product.name;
          const subtitle = lang === "en" ? product.name : (product.englishName || "");
          const displayDescription = formatProductDescription(product, lang);
          const displayBadge = formatProductBadge(product, lang);
          const grindsToDisplay =
            lang === "en" &&
            product.englishGrindOptions &&
            product.englishGrindOptions.length > 0
              ? product.englishGrindOptions
              : (product.grindOptions || []).map((g) => formatGrindOption(g, lang));

          return (
            <div
              key={product.id}
              className={`relative bg-stone-900/90 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isAvailable
                  ? "border-stone-800 hover:border-amber-500/40 shadow-sm"
                  : "border-red-900/50 bg-stone-950/90 opacity-90"
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
                    {displayBadge && (
                      <span className="absolute bottom-0 left-0 right-0 bg-stone-950/90 text-amber-300 text-[9px] font-bold text-center py-0.5 truncate px-1">
                        {displayBadge}
                      </span>
                    )}
                  </div>

                  {/* Info and Stock Toggle Button */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                          {displayTitle}
                        </h3>
                        <p className="text-[11px] text-stone-400 font-medium">
                          {subtitle}
                        </p>
                      </div>

                      {/* Stock Switch Toggle */}
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[10px] text-stone-400 font-semibold mb-1 flex items-center gap-1">
                          <Power className="w-2.5 h-2.5 text-stone-400" />
                          {t.stockSwitchLabel}
                        </span>

                        <button
                          type="button"
                          onClick={() => onToggleStock(product.id)}
                          title={`${t.clickToSwitch}: ${isAvailable ? t.outOfStockBtn : t.inStockBtn}`}
                          className={`relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-md border ${
                            isAvailable
                              ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/80 ring-1 ring-emerald-500/20"
                              : "bg-red-950/70 border-red-500/50 text-red-200 hover:bg-red-900/80 ring-1 ring-red-500/20"
                          }`}
                        >
                          <span
                            className={`w-6 h-3.5 rounded-full flex items-center p-0.5 transition-colors ${
                              isAvailable ? "bg-emerald-500 justify-end" : "bg-red-500 justify-start"
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm"></span>
                          </span>

                          <span className="tracking-tight text-[11px]">
                            {isAvailable ? t.inStockBtn : t.outOfStockBtn}
                          </span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-1.5 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {displayDescription}
                    </p>

                    {/* Grind Coarseness Chips */}
                    {grindsToDisplay && grindsToDisplay.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-stone-500 font-medium">
                          {t.grindOptionsLabel}
                        </span>
                        {grindsToDisplay.map((grind, idx) => (
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

              {/* Card Middle: Real-Time Stock in KG Controller */}
              <div className="px-3.5 py-2.5 bg-stone-950/70 border-t border-stone-800/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-400 font-semibold flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.stockKgLabel}</span>
                  </span>

                  {isEditingStock ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={draftStockKg}
                        onChange={(e) => setDraftStockKg(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveStock(product.id);
                          if (e.key === "Escape") setEditingStockId(null);
                        }}
                        className="w-16 bg-stone-900 border border-amber-500 text-white font-bold text-xs rounded-lg px-2 py-0.5 text-right"
                      />
                      <span className="text-xs text-stone-400 font-medium">kg</span>
                      <button
                        type="button"
                        onClick={() => handleSaveStock(product.id)}
                        className="p-1 rounded-lg bg-emerald-500 text-stone-950"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingStockId(null)}
                        className="p-1 rounded-lg bg-stone-800 text-stone-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartStockEdit(product)}
                      className={`px-2 py-0.5 rounded-lg font-mono text-xs font-bold border transition-colors flex items-center gap-1 ${
                        currentStock > 0
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400"
                          : "bg-red-500/10 text-red-300 border-red-500/30 hover:border-red-400"
                      }`}
                    >
                      <span>{currentStock} kg</span>
                      <Edit2 className="w-2.5 h-2.5 text-stone-400 ml-0.5" />
                    </button>
                  )}
                </div>

                {/* Quick Stock Modifiers (+10kg, +25kg, -5kg) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickStockDelta(product.id, currentStock, 10)}
                    className="px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors border border-stone-700/60"
                  >
                    {t.quickAddStock10}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStockDelta(product.id, currentStock, 25)}
                    className="px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors border border-stone-700/60"
                  >
                    {t.quickAddStock25}
                  </button>
                  {currentStock >= 5 && (
                    <button
                      type="button"
                      onClick={() => handleQuickStockDelta(product.id, currentStock, -5)}
                      className="px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-bold text-stone-400 hover:text-red-300 transition-colors border border-stone-700/60"
                    >
                      {t.quickSubStock5}
                    </button>
                  )}
                  {onDeleteProduct && (
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product.id)}
                      title={t.removeFromInventory}
                      className="p-1 rounded-lg hover:bg-red-950 text-stone-600 hover:text-red-400 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Bottom: Daily Rate Board with "Edit Price" -> "OK" Button Pattern */}
              <div className="bg-stone-950/90 border-t border-stone-800/80 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                    <Wheat className="w-3.5 h-3.5" />
                    {t.dailySellingPrice}
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {t.activeInventoryNotice.split(":")[0]}
                  </span>
                </div>

                {/* 3 Size Price Tiles with Edit Price / OK Toggle */}
                <div className="grid grid-cols-3 gap-2">
                  {["1kg", "5kg", "10kg"].map((weightKey) => {
                    const price = product.prices?.[weightKey] ?? 0;
                    const isMillingService = product.category === "Services";
                    const isEditing = editingItem === `${product.id}_${weightKey}`;

                    const perKgRate =
                      weightKey === "1kg"
                        ? price
                        : weightKey === "5kg"
                        ? Math.round(price / 5)
                        : Math.round(price / 10);

                    return (
                      <div
                        key={weightKey}
                        className={`bg-stone-900 border rounded-xl p-2.5 flex flex-col justify-between transition-all ${
                          isEditing
                            ? "border-amber-500 ring-2 ring-amber-500/20 bg-stone-950"
                            : "border-stone-800 hover:border-amber-500/30"
                        }`}
                      >
                        {/* Weight Header */}
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200">
                            {weightKey}
                          </span>
                          {!isMillingService && !isEditing && (
                            <span className="text-[9px] text-stone-500 font-mono">
                              ₹{perKgRate}/kg
                            </span>
                          )}
                        </div>

                        {/* Price Display OR Active Input Box */}
                        <div className="my-2 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs font-bold text-amber-400">₹</span>
                              <input
                                type="number"
                                autoFocus
                                value={draftPrice}
                                onChange={(e) => setDraftPrice(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSavePrice(product.id, weightKey);
                                  } else if (e.key === "Escape") {
                                    handleCancelPriceEdit();
                                  }
                                }}
                                className="w-16 text-center text-lg font-black text-white bg-stone-900 border border-amber-500/80 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                              />
                            </div>
                          ) : (
                            <div className="flex items-baseline justify-center gap-0.5">
                              <span className="text-xs font-bold text-amber-400">₹</span>
                              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                {price}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* EDIT PRICE <-> OK BUTTON */}
                        <div className="pt-1.5 border-t border-stone-800/80">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSavePrice(product.id, weightKey)}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>{t.okBtn}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelPriceEdit}
                                title={t.cancelPriceBtn}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartPriceEdit(product.id, weightKey, price)}
                              className="w-full py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700/90 text-stone-300 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all border border-stone-700/50"
                            >
                              <Edit2 className="w-3 h-3 text-amber-400" />
                              <span>{t.editPriceBtn}</span>
                            </button>
                          )}
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
          <h3 className="text-base font-bold text-stone-300">{t.noProductsFound}</h3>
          <p className="text-xs text-stone-500 mt-1">{t.noProductsDesc}</p>
        </div>
      )}
    </div>
  );
}
