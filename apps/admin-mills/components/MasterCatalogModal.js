"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  Check,
  Wheat,
  Sparkles,
  Layers,
  Scale,
  IndianRupee,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import {
  formatProductDescription,
  formatProductBadge,
} from "../lib/langUtils";
import { MASTER_CATALOG as DEFAULT_MASTER_CATALOG } from "../lib/seedData";

export default function MasterCatalogModal({
  isOpen,
  onClose,
  masterCatalog = [],
  currentProducts = [],
  onSaveInventory,
  lang = "hi",
  t,
}) {
  // Robust fallback to ensure full catalog is always available
  const catalogItems =
    Array.isArray(masterCatalog) && masterCatalog.length > 0
      ? masterCatalog
      : DEFAULT_MASTER_CATALOG;

  // Build a lookup map of currently active products
  const activeProductMap = useMemo(() => {
    const map = new Map();
    (currentProducts || []).forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [currentProducts]);

  // Track selection state: Map<productId, { checked: boolean, stockKg: number, pricePerKg: number }>
  const [selections, setSelections] = useState(() => {
    const initial = {};
    catalogItems.forEach((item) => {
      const existing = activeProductMap.get(item.id);
      if (existing) {
        initial[item.id] = {
          checked: true,
          stockKg: existing.stockKg ?? 50,
          pricePerKg: existing.prices?.["1kg"] ?? item.prices?.["1kg"] ?? 50,
        };
      } else {
        const isDefaultSuggested = [
          "prod_fresh_chakki_00",
          "prod_sharbati_01",
          "prod_lokwan_02",
          "prod_chana_04",
          "prod_besan_05",
        ].includes(item.id);

        initial[item.id] = {
          checked: isDefaultSuggested && currentProducts.length === 0,
          stockKg: item.stockKg || 50,
          pricePerKg: item.prices?.["1kg"] || 50,
        };
      }
    });
    return initial;
  });

  // Re-synchronize selections whenever the modal opens or active products change
  useEffect(() => {
    if (!isOpen) return;
    const initial = {};
    catalogItems.forEach((item) => {
      const existing = activeProductMap.get(item.id);
      if (existing) {
        initial[item.id] = {
          checked: true,
          stockKg: existing.stockKg ?? 50,
          pricePerKg: existing.prices?.["1kg"] ?? item.prices?.["1kg"] ?? 50,
        };
      } else {
        const isDefaultSuggested = [
          "prod_fresh_chakki_00",
          "prod_sharbati_01",
          "prod_lokwan_02",
          "prod_chana_04",
          "prod_besan_05",
        ].includes(item.id);

        initial[item.id] = {
          checked: isDefaultSuggested && currentProducts.length === 0,
          stockKg: item.stockKg || 50,
          pricePerKg: item.prices?.["1kg"] || 50,
        };
      }
    });
    setSelections(initial);
  }, [isOpen, catalogItems, activeProductMap, currentProducts.length]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "all", label: t.allCategories },
    { id: "Wheat Atta", label: t.catWheat },
    { id: "Specialty Flour", label: t.catMultigrain },
    { id: "Sattu & Besan", label: t.catSattuBesan },
    { id: "Millet Atta", label: t.catMillets },
    { id: "Services", label: t.catServices },
  ];

  // Filter master catalog items
  const filteredCatalog = useMemo(() => {
    return catalogItems.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.englishName && item.englishName.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [catalogItems, selectedCategory, searchQuery]);

  // Toggle selection for a single item
  const toggleItem = (productId) => {
    setSelections((prev) => {
      const current = prev[productId] || {
        checked: false,
        stockKg: 50,
        pricePerKg: 50,
      };
      return {
        ...prev,
        [productId]: {
          ...current,
          checked: !current.checked,
        },
      };
    });
  };

  // Update stockKg for an item
  const handleStockChange = (productId, val) => {
    const num = Math.max(0, Number(val) || 0);
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { checked: true, pricePerKg: 50 }),
        stockKg: num,
      },
    }));
  };

  // Update pricePerKg for an item
  const handlePriceChange = (productId, val) => {
    const num = Math.max(0, Number(val) || 0);
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { checked: true, stockKg: 50 }),
        pricePerKg: num,
      },
    }));
  };

  // Select all visible or clear all
  const selectAllVisible = () => {
    setSelections((prev) => {
      const next = { ...prev };
      filteredCatalog.forEach((it) => {
        next[it.id] = {
          ...(next[it.id] || { stockKg: 50, pricePerKg: it.prices?.["1kg"] || 50 }),
          checked: true,
        };
      });
      return next;
    });
  };

  const deselectAllVisible = () => {
    setSelections((prev) => {
      const next = { ...prev };
      filteredCatalog.forEach((it) => {
        if (next[it.id]) {
          next[it.id] = {
            ...next[it.id],
            checked: false,
          };
        }
      });
      return next;
    });
  };

  const selectedCount = Object.values(selections).filter((s) => s?.checked).length;

  // Handle final submission to mill inventory
  const handleSave = async () => {
    if (selectedCount === 0) return;
    setIsSubmitting(true);

    try {
      const selectedProducts = [];

      catalogItems.forEach((item) => {
        const state = selections[item.id];
        if (state && state.checked) {
          const price1kg = Number(state.pricePerKg) || item.prices?.["1kg"] || 50;
          const isService = item.category === "Services";

          const prices = isService
            ? {
                "1kg": price1kg,
                "5kg": price1kg * 5,
                "10kg": price1kg * 10,
              }
            : {
                "1kg": price1kg,
                "5kg": Math.round(price1kg * 5 * 0.98), // subtle standard 5kg bundle perk
                "10kg": Math.round(price1kg * 10 * 0.96), // subtle 10kg sack bundle perk
              };

          selectedProducts.push({
            ...item,
            stockKg: Number(state.stockKg) || 0,
            isAvailable: Number(state.stockKg) > 0,
            prices,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      await onSaveInventory(selectedProducts);
      onClose();
    } catch (err) {
      console.error("[MasterCatalogModal] save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800/80 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                  {t.setupCatalogTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  {selectedCount} {t.selectedCount}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {t.setupCatalogSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 bg-stone-950/50 border-b border-stone-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Bulk Select Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={selectAllVisible}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.selectAll}</span>
              </button>
              <button
                type="button"
                onClick={deselectAllVisible}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>{t.deselectAll}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master Catalog List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          {filteredCatalog.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-stone-600" />
              <p className="text-sm font-medium">{t.noProductsFound}</p>
            </div>
          ) : (
            filteredCatalog.map((item) => {
              const state = selections[item.id] || {
                checked: false,
                stockKg: 50,
                pricePerKg: item.prices?.["1kg"] || 50,
              };
              const isChecked = state.checked;
              const displayTitle =
                lang === "en" && item.englishName ? item.englishName : item.name;
              const subtitle = lang === "en" ? item.name : (item.englishName || "");
              const displayDescription = formatProductDescription(item, lang);
              const displayBadge = formatProductBadge(item, lang);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`cursor-pointer rounded-2xl p-3.5 sm:p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    isChecked
                      ? "bg-stone-900/90 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30"
                      : "bg-stone-950/50 border-stone-800/80 hover:border-stone-700 opacity-75 hover:opacity-100"
                  }`}
                >
                  {/* Left: Checkbox, Image, Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-amber-500 text-stone-950 font-bold"
                            : "border-2 border-stone-700 bg-stone-900"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-800 flex-shrink-0 border border-stone-700">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {displayBadge && (
                        <span className="absolute bottom-0 inset-x-0 bg-stone-950/90 text-amber-300 text-[8px] font-bold text-center py-0.5 truncate px-0.5">
                          {displayBadge}
                        </span>
                      )}
                    </div>

                    {/* Titles & Description */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug truncate">
                        {displayTitle}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-medium">
                        {subtitle}
                      </p>
                      <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                        {displayDescription}
                      </p>

                      {/* Grind Pill Tags */}
                      {item.grindOptions && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {item.grindOptions.slice(0, 2).map((grind, gIdx) => (
                            <span
                              key={gIdx}
                              className="px-1.5 py-0.5 rounded bg-stone-800 text-[9px] text-stone-300 font-medium border border-stone-700/60"
                            >
                              {grind}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Stock (KG) & Price (₹/kg) inputs */}
                  <div
                    className="flex items-center gap-3 self-end sm:self-center pl-8 sm:pl-0"
                    onClick={(e) => e.stopPropagation()} // Prevent toggling row when typing in inputs
                  >
                    {/* Stock Input */}
                    <div className="flex flex-col items-start">
                      <label className="text-[10px] text-stone-400 font-semibold mb-1 flex items-center gap-1">
                        <Scale className="w-3 h-3 text-amber-400" />
                        <span>{t.stockInKg}</span>
                      </label>
                      <div className="flex items-center bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1 focus-within:border-amber-500">
                        <input
                          type="number"
                          min="0"
                          value={state.stockKg}
                          onChange={(e) => handleStockChange(item.id, e.target.value)}
                          className="w-16 bg-transparent text-sm font-bold text-white focus:outline-none text-right font-mono"
                        />
                        <span className="text-xs font-semibold text-stone-400 ml-1">kg</span>
                      </div>
                    </div>

                    {/* Price Input */}
                    <div className="flex flex-col items-start">
                      <label className="text-[10px] text-stone-400 font-semibold mb-1 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-amber-400" />
                        <span>{t.pricePerKg}</span>
                      </label>
                      <div className="flex items-center bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1 focus-within:border-amber-500">
                        <span className="text-xs font-bold text-amber-400 mr-1">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={state.pricePerKg}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          className="w-14 bg-transparent text-sm font-bold text-white focus:outline-none text-right font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-stone-950 to-stone-900 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-400">
            <span className="font-semibold text-white">{selectedCount}</span> {t.selectedCount}
            <span className="mx-2 text-stone-600">•</span>
            <span className="text-stone-400">{t.activeInventoryNotice}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs sm:text-sm transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={selectedCount === 0 || isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t.setupCatalogSaving}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t.setupCatalogSaveBtn} ({selectedCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
