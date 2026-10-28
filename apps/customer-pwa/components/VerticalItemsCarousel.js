// apps/customer-pwa/components/VerticalItemsCarousel.js - Trending Attas Slideshow (Super Compact, 5kg Only)
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Flame,
} from "lucide-react";

const STAPLE_ITEMS = [
  {
    id: "prod_sharbati_01",
    name: "MP सिहोर शरबती गेहूं आटा",
    englishName: "MP Sehore Sharbati Wheat Atta",
    category: "Wheat Atta",
    badge: "सबसे लोकप्रिय",
    englishBadge: "Bestseller",
    highlightHi: "100% साबुत गेहूं • दिन भर नर्म व मीठी रोटियां",
    highlightEn: "100% Whole Wheat • Natural Sweetness & Soft Rotis",
    weight: "5kg",
    price: 235,
    unitPrice: "₹47/kg",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    themeColor: "from-amber-500/20 via-amber-950/20 to-stone-900",
    borderColor: "border-amber-500/40",
    badgeColor: "bg-amber-500 text-stone-950",
  },
  {
    id: "prod_chana_sattu_04",
    name: "देसी भुना चना सत्तू",
    englishName: "Desi Roasted Chana Sattu",
    category: "Sattu & Besan",
    badge: "हाई प्रोटीन सुपरफूड",
    englishBadge: "High Protein",
    highlightHi: "पारंपरिक रोस्टेड चना • 26g शुद्ध प्राकृतिक प्रोटीन",
    highlightEn: "Traditional Bihar Style • 26g Natural Plant Protein",
    weight: "5kg",
    price: 540,
    unitPrice: "₹108/kg",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    themeColor: "from-yellow-500/20 via-yellow-950/20 to-stone-900",
    borderColor: "border-yellow-500/40",
    badgeColor: "bg-yellow-400 text-stone-950",
  },
  {
    id: "prod_chana_besan_05",
    name: "100% शुद्ध ताज़ा चना बेसन",
    englishName: "100% Pure Fresh Chana Besan",
    category: "Sattu & Besan",
    badge: "शून्य मिलावट",
    englishBadge: "Zero Preservatives",
    highlightHi: "बिना किसी रंग या पॉलिश के • हल्की खुशबूदार पिसाई",
    highlightEn: "Zero chemical polish • Fresh aroma & light texture",
    weight: "5kg",
    price: 460,
    unitPrice: "₹92/kg",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    themeColor: "from-orange-500/20 via-orange-950/20 to-stone-900",
    borderColor: "border-orange-500/40",
    badgeColor: "bg-orange-400 text-stone-950",
  },
  {
    id: "prod_ragi_11",
    name: "हिमालयी रागी आटा (Finger Millet)",
    englishName: "Himalayan Ragi Millet Atta",
    category: "Millet Atta",
    badge: "कैल्शियम रिच",
    englishBadge: "Calcium Rich",
    highlightHi: "ग्लूटेन-फ्रेंडली • दूध से 3 गुना अधिक प्राकृतिक कैल्शियम",
    highlightEn: "Gluten-conscious • 3x calcium for bones and vitality",
    weight: "5kg",
    price: 290,
    unitPrice: "₹58/kg",
    imageUrl:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    themeColor: "from-red-500/20 via-red-950/20 to-stone-900",
    borderColor: "border-red-500/40",
    badgeColor: "bg-red-400 text-stone-950",
  },
  {
    id: "prod_fresh_chakki_00",
    name: "ताजा पत्थर-पिसा चक्की आटा",
    englishName: "Daily Fresh Stone Chakki Atta",
    category: "Wheat Atta",
    badge: "रोज़ाना पसंद",
    englishBadge: "Daily Staple",
    highlightHi: "100% शुद्ध संपूर्ण गेहूं • शून्य मैदा • फूली रोटियां",
    highlightEn: "100% Whole Wheat • Zero Maida • Perfect Soft Rotis",
    weight: "5kg",
    price: 185,
    unitPrice: "₹37/kg",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    themeColor: "from-emerald-500/20 via-emerald-950/20 to-stone-900",
    borderColor: "border-emerald-500/40",
    badgeColor: "bg-emerald-400 text-stone-950",
  },
];

export default function VerticalItemsCarousel({
  onAddToCart,
  cartItems = [],
  onSelectCategory,
  lang = "hi",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  // Auto-slide smoothly every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STAPLE_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeItem = STAPLE_ITEMS[activeIndex];

  const handleAdd = (item) => {
    if (onAddToCart) {
      onAddToCart(
        {
          id: item.id,
          name: item.name,
          englishName: item.englishName,
          category: item.category,
          imageUrl: item.imageUrl,
          popularGrind: "बारीक (रोटी)",
        },
        "5kg",
        "बारीक (रोटी)",
        item.price
      );
      setAddedItem(item.id);
      setTimeout(() => setAddedItem(null), 1800);
    }
  };

  return (
    <div
      className="mb-3 sm:mb-4 relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-stone-900/90 to-stone-950/95 border border-stone-800 shadow-xl p-2.5 sm:p-4 overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Clean Heading Bar only */}
      <div className="flex items-center justify-between gap-3 mb-2 sm:mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h2
              className="text-xs sm:text-sm font-black text-stone-100 flex items-center gap-1.5"
              suppressHydrationWarning
            >
              {lang === "hi"
                ? "ट्रेंडिंग आटा व स्टेपल्स • 5kg पैक्स"
                : "Trending Attas & Staples • 5kg Packs"}
            </h2>
          </div>
        </div>

        {/* Minimal dot progress indicators */}
        <div className="flex items-center gap-1">
          {STAPLE_ITEMS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-4 bg-amber-400 shadow-sm shadow-amber-400/40"
                  : "w-1.5 bg-stone-800 hover:bg-stone-700"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Super Compact Main Featured Item Card Slideshow (5kg Only) */}
      <div
        className={`relative rounded-xl sm:rounded-2xl bg-gradient-to-r ${activeItem.themeColor} border ${activeItem.borderColor} p-2 sm:p-3 transition-all duration-300 shadow-lg`}
      >
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Item Image with Badge */}
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden bg-stone-950 shrink-0 border border-stone-800/80 shadow-md">
            <img
              src={activeItem.imageUrl}
              alt={activeItem.englishName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <span
              className={`absolute top-1 left-1 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase ${activeItem.badgeColor} shadow-sm`}
              suppressHydrationWarning
            >
              {lang === "hi" ? activeItem.badge : activeItem.englishBadge}
            </span>
          </div>

          {/* Details & Price / Add */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <span>{activeItem.category}</span>
              <span>•</span>
              <span className="text-stone-400">{activeItem.unitPrice}</span>
            </div>

            <h3
              className="text-xs sm:text-sm font-black text-stone-100 truncate mt-0.2"
              suppressHydrationWarning
            >
              {lang === "hi" ? activeItem.name : activeItem.englishName}
            </h3>

            <p
              className="text-[10px] sm:text-xs text-stone-300 line-clamp-1 mt-0.2"
              suppressHydrationWarning
            >
              {lang === "hi" ? activeItem.highlightHi : activeItem.highlightEn}
            </p>

            {/* Price & Add to Cart Button (No price on button, 5kg locked) */}
            <div className="flex items-center justify-between gap-2.5 mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-black text-amber-400">
                  ₹{activeItem.price}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-400 font-bold">
                  / {activeItem.weight}
                </span>
                <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium hidden sm:inline">
                  ({activeItem.unitPrice})
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(activeItem)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-md cursor-pointer ${
                  addedItem === activeItem.id
                    ? "bg-emerald-500 text-stone-950 font-black"
                    : "bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20"
                }`}
              >
                {addedItem === activeItem.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span suppressHydrationWarning>
                      {lang === "hi" ? "जोड़ा गया!" : "Added!"}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span suppressHydrationWarning>
                      {lang === "hi" ? "जोड़ें" : "ADD"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
