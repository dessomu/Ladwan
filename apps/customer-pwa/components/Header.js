// apps/customer-pwa/components/Header.js - Blinkit & Flipkart Inspired E-Commerce Header with Personalization & Vertical Search Ticker
"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  ShoppingCart,
  Store,
  Clock,
  User,
  Search,
  X,
  Sparkles,
} from "lucide-react";

const SEARCH_TICKER_ITEMS = [
  { hi: "ताज़ा चक्की आटा", en: "Fresh Stone Chakki Atta" },
  { hi: "MP सिहोर शरबती आटा", en: "MP Sehore Sharbati Atta" },
  { hi: "MP लोकवान गेहूं आटा", en: "MP Lokwan Whole Wheat Atta" },
  { hi: "देसी काठिया लाल गेहूं आटा", en: "Desi Kathiya Heritage Atta" },
  { hi: "खापली प्राचीन गेहूं आटा", en: "Khapli Ancient Emmer Atta" },
  { hi: "7-ग्रेन मल्टीग्रेन आटा", en: "7-Grain Multigrain Atta" },
  { hi: "देसी भुना चना सत्तू", en: "Pure Desi Chana Sattu" },
  { hi: "100% शुद्ध चना दाल बेसन", en: "100% Pure Chana Dal Besan" },
  { hi: "देसी ज्वार का ताज़ा आटा", en: "Gluten-Free Jowar Atta" },
  { hi: "सर्दियों का ताजा बाजरा आटा", en: "Winter Special Bajra Atta" },
  { hi: "ऑर्गेनिक रागी मडुआ आटा", en: "Calcium-Rich Ragi Millet Atta" },
  { hi: "देसी पीली मक्का आटा", en: "Desi Yellow Makka Atta" },
  { hi: "शुद्ध ठंडा जौ का आटा", en: "Cooling Barley Jau Atta" },
];

const ALL_TICKER_ITEMS = [
  ...SEARCH_TICKER_ITEMS,
  SEARCH_TICKER_ITEMS[0], // Duplicate first item at end for seamless infinite loop
];

export default function Header({
  location,
  onOpenLocationModal,
  selectedMill,
  onOpenMillModal,
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  activeOrder,
  onOpenTracking,
  userProfile,
  onOpenProfile,
  searchQuery = "",
  onSearchChange,
  browseMode = "flours",
  lang = "hi",
}) {
  // Extract user first name for personalized touch with bilingual support
  const isHindi = lang === "hi";
  const rawName = isHindi
    ? (userProfile?.name || "सोमनाथ बैद्य")
    : (userProfile?.englishName ||
        (userProfile?.name === "सोमनाथ बैद्य"
          ? "Somnath Baidya"
          : userProfile?.name) ||
        "Somnath Baidya");
  const trimmedName = rawName?.trim();
  const firstName = trimmedName
    ? trimmedName.split(" ")[0]
    : isHindi
    ? "अतिथि"
    : "Guest";
  const userInitial = isHindi
    ? (firstName ? firstName.charAt(0) : "स")
    : (firstName ? firstName.charAt(0).toUpperCase() : "S");

  // Continuous vertical column ticker - Myntra style
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Auto-advance ticker index every 2800ms
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => prev + 1);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // When we reach the duplicate item at the end, snap back to index 0 invisibly
  useEffect(() => {
    if (tickerIndex >= SEARCH_TICKER_ITEMS.length) {
      const snapTimer = setTimeout(() => {
        setIsTransitioning(false);
        setTickerIndex(0);

        // Re-enable smooth transition for subsequent slides
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsTransitioning(true);
          }, 40);
        });
      }, 500); // 500ms matches slide transition duration

      return () => clearTimeout(snapTimer);
    }
  }, [tickerIndex]);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-xl border-b border-stone-800 shadow-2xl transition-all">
      {/* 1. Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* LEFT COLUMN: Brand Block with Location directly below it (no delivery time) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          {/* Logo Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 group hover:scale-105 transition-transform cursor-pointer">
            <span className="text-stone-950 font-black text-lg sm:text-xl tracking-tighter">
              ला
            </span>
          </div>

          {/* Brand Name & Location below it */}
          <div className="flex flex-col justify-center min-w-0">
            {/* Brand Title Row */}
            <div className="font-black text-stone-100 text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5">
              <span>{lang === "hi" ? "लाडवां" : "LADWAN"}</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                {lang === "hi" ? "ताज़ा चक्की" : "FRESH CHAKKI"}
              </span>
            </div>

            {/* Location selector directly below brand (No delivery time) */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-1 mt-0.5 group/loc text-left cursor-pointer active:scale-95 transition-all min-w-0"
              title={location?.name || "Sonarpur, Kolkata"}
            >
              <MapPin className="w-3 h-3 text-amber-400 shrink-0 group-hover/loc:scale-110 transition-transform" />
              <span
                className="text-[11px] sm:text-xs font-bold text-stone-300 group-hover/loc:text-amber-300 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[200px]"
                suppressHydrationWarning
              >
                {location?.name || "Sonarpur, Kolkata"}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 group-hover/loc:text-amber-400 shrink-0 transition-colors" />
            </button>
          </div>
        </div>

        {/* CENTER COLUMN (DESKTOP): Integrated Global Search Bar with Increased py & Vertical Carousel Ticker */}
        {onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-xl mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-stone-950/90 border border-stone-800 focus:border-amber-500/70 rounded-2xl pl-10 pr-9 py-3 sm:py-3.5 text-xs sm:text-sm text-stone-100 placeholder-transparent outline-none transition-all focus:ring-2 focus:ring-amber-500/20 shadow-inner"
              />

              {/* Vertical Animated Carousel Placeholder when search query is empty */}
              {!searchQuery && (
                <div className="absolute left-10 right-9 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 text-xs sm:text-sm select-none">
                  {/* STATIC search label - stays completely static */}
                  <span
                    className="text-amber-400/95 font-semibold shrink-0"
                    suppressHydrationWarning
                  >
                    {lang === "hi" ? "सर्च करें" : "Search"}
                  </span>

                  {/* VERTICAL SLIDING TICKER - Myntra style continuous column */}
                  <div className="relative h-5 overflow-hidden flex-1 min-w-0">
                    <div
                      className="flex flex-col will-change-transform"
                      style={{
                        transform: `translateY(-${tickerIndex * 1.25}rem)`,
                        transition: isTransitioning
                          ? "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
                          : "none",
                      }}
                    >
                      {ALL_TICKER_ITEMS.map((item, idx) => (
                        <div
                          key={idx}
                          className="h-5 flex items-center min-w-0 shrink-0"
                        >
                          <span
                            className="text-stone-300 font-medium truncate"
                            suppressHydrationWarning
                          >
                            &ldquo;{lang === "hi" ? item.hi : item.en}&rdquo;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5 rounded-full hover:bg-stone-800"
                  aria-label="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Assigned Mill, Live Order, Personalized Profile & Blinkit Cart Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Assigned Mill Quick Pill (Desktop / Tablet) */}
          {selectedMill && (
            <button
              type="button"
              onClick={onOpenMillModal}
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/30 text-left transition-colors cursor-pointer group"
              title={
                lang === "hi"
                  ? selectedMill.name
                  : selectedMill.englishName || selectedMill.name
              }
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="text-left text-xs min-w-0">
                <div className="text-[10px] text-stone-400 flex items-center gap-1">
                  <span>{selectedMill.formattedDistance || "1.2 km"}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold underline" suppressHydrationWarning>
                    {lang === "hi" ? "बदलें" : "Change"}
                  </span>
                </div>
                <div
                  className="font-bold text-stone-200 truncate max-w-[130px]"
                  suppressHydrationWarning
                >
                  {lang === "hi"
                    ? selectedMill.name
                    : selectedMill.englishName || selectedMill.name}
                </div>
              </div>
            </button>
          )}

          {/* Live Order Tracking Pill (Desktop / Tablet) */}
          {activeOrder &&
            activeOrder.orderStatus !== "delivered" &&
            activeOrder.orderStatus !== "cancelled" && (
              <button
                type="button"
                onClick={onOpenTracking}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all animate-pulse cursor-pointer shadow-sm"
              >
                <Clock className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>
                  {lang === "hi" ? "लाइव ऑर्डर" : "Track Order"}
                </span>
              </button>
            )}

          {/* Personalized User Profile Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-200 transition-all active:scale-95 shadow-sm group cursor-pointer"
            title={lang === "hi" ? "आपकी प्रोफाइल व सेटिंग्स" : "Profile & Preferences"}
            aria-label="Profile"
          >
            {/* Avatar Circle with initial */}
            <div
              className="w-7 h-7 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-stone-950 font-black text-xs flex items-center justify-center shadow-sm shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0"
              suppressHydrationWarning
            >
              {userInitial}
            </div>

            {/* Personalized Greeting (Desktop) */}
            <div className="text-left hidden lg:block leading-tight min-w-0">
              <div
                className="text-[10px] text-stone-400 font-medium"
                suppressHydrationWarning
              >
                {lang === "hi" ? "नमस्ते," : "Hello,"}
              </div>
              <div
                className="text-xs font-bold text-stone-100 truncate max-w-[90px]"
                suppressHydrationWarning
              >
                {firstName}
              </div>
            </div>
          </button>

          {/* Blinkit-Style Cart Action Button (Desktop & Tablet) */}
          <button
            type="button"
            onClick={onOpenCart}
            className={`relative hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-black text-xs transition-all shadow-xl active:scale-95 cursor-pointer ${
              cartCount > 0
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 shadow-emerald-500/20"
                : "bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800"
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 rounded-full bg-stone-950 text-emerald-400 text-[9px] font-black">
                  {cartCount}
                </span>
              )}
            </div>

            <div className="text-left leading-tight">
              {cartCount > 0 ? (
                <>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">
                    {cartCount} {lang === "hi" ? "आइटम" : "Items"}
                  </div>
                  <div className="text-xs font-black">₹{cartTotal}</div>
                </>
              ) : (
                <span suppressHydrationWarning>
                  {lang === "hi" ? "टोकरी (0)" : "My Cart"}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 2. MOBILE INTEGRATED STICKY SEARCH BAR with Increased py & Vertical Carousel Ticker */}
      {onSearchChange && (
        <div className="md:hidden px-3 pb-2.5 pt-0">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800/90 focus:border-amber-500/70 rounded-2xl pl-9 pr-8 py-2.5 sm:py-3 text-xs text-stone-100 placeholder-transparent outline-none transition-all shadow-inner"
            />

            {/* Mobile Vertical Animated Carousel Ticker */}
            {!searchQuery && (
              <div className="absolute left-9 right-8 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 text-xs select-none">
                {/* STATIC search label - stays completely static */}
                <span
                  className="text-amber-400/95 font-semibold shrink-0"
                  suppressHydrationWarning
                >
                  {lang === "hi" ? "सर्च करें" : "Search"}
                </span>

                {/* VERTICAL SLIDING TICKER - Myntra style continuous column */}
                <div className="relative h-5 overflow-hidden flex-1 min-w-0">
                  <div
                    className="flex flex-col will-change-transform"
                    style={{
                      transform: `translateY(-${tickerIndex * 1.25}rem)`,
                      transition: isTransitioning
                        ? "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
                        : "none",
                    }}
                  >
                    {ALL_TICKER_ITEMS.map((item, idx) => (
                      <div
                        key={idx}
                        className="h-5 flex items-center min-w-0 shrink-0"
                      >
                        <span
                          className="text-stone-300 font-medium truncate"
                          suppressHydrationWarning
                        >
                          &ldquo;{lang === "hi" ? item.hi : item.en}&rdquo;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5 rounded-full hover:bg-stone-800"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
