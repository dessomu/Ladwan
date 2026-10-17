// apps/customer-pwa/components/Header.js - Blinkit & Flipkart Inspired E-Commerce Header with Personalization
"use client";

import {
  MapPin,
  ChevronDown,
  ShoppingCart,
  Store,
  Clock,
  User,
  Search,
  X,
  Zap,
  Sparkles,
} from "lucide-react";

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
  // Extract user first name for personalized touch
  const rawName = userProfile?.name?.trim();
  const firstName = rawName
    ? rawName.split(" ")[0]
    : lang === "hi"
    ? "अतिथि"
    : "Guest";
  const userInitial = rawName ? rawName.charAt(0).toUpperCase() : "L";

  const etaMinutes = selectedMill?.eta || "30-40 min";

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-xl border-b border-stone-800 shadow-2xl transition-all">
      {/* 1. Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* LEFT COLUMN: Brand Logo + Delivery ETA & Address Widget */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* Logo Block */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex flex-col items-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 group hover:scale-105 transition-transform cursor-pointer">
                <span className="text-stone-950 font-black text-lg sm:text-xl tracking-tighter">
                  ला
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="font-black text-stone-100 text-sm sm:text-lg tracking-tight leading-tight flex items-center gap-1">
                <span>{lang === "hi" ? "लाडवां" : "LADWAN"}</span>
                <span className="hidden sm:inline-block text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {lang === "hi" ? "ताज़ा चक्की" : "FRESH CHAKKI"}
                </span>
              </div>
              <div className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase hidden sm:block">
                {lang === "hi" ? "पारंपरिक पत्थर पिसाई" : "100% Cold Stone Milled"}
              </div>
            </div>
          </div>

          <div className="h-7 w-px bg-stone-800 hidden md:block"></div>

          {/* Blinkit-Style Delivery Time & Address Pill (Clickable) */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-left transition-all group min-w-0 shadow-sm active:scale-95 cursor-pointer"
            title={location?.name || "Sonarpur, Kolkata"}
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              {/* Delivery ETA with live pulsing beacon */}
              <div className="flex items-center gap-1.5 leading-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                </span>
                <span
                  className="text-[10px] sm:text-[11px] font-black text-emerald-400 tracking-tight"
                  suppressHydrationWarning
                >
                  {lang === "hi"
                    ? `${etaMinutes} में डिलीवरी`
                    : `Delivery in ${etaMinutes}`}
                </span>
              </div>

              {/* Pinned Address */}
              <div className="flex items-center gap-0.5 mt-0.5">
                <span
                  className="text-xs sm:text-xs font-bold text-stone-200 truncate max-w-[85px] xs:max-w-[125px] sm:max-w-[170px]"
                  suppressHydrationWarning
                >
                  {location?.name || "Sonarpur, Kolkata"}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-amber-400 shrink-0 transition-colors" />
              </div>
            </div>
          </button>
        </div>

        {/* CENTER COLUMN (DESKTOP): Integrated Global Search Bar (Blinkit & Flipkart Style) */}
        {onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-xl mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  lang === "hi"
                    ? browseMode === "flours"
                      ? "शरबती आटा, सत्तू, बेसन, रागी, या चक्की खोजें..."
                      : "निकटतम चक्की का नाम, इलाका या पत्थर का प्रकार खोजें..."
                    : browseMode === "flours"
                    ? "Search 'Sharbati Atta', 'Chana Sattu', 'Besan', 'Ragi'..."
                    : "Search chakki name, area, or stone type..."
                }
                className="w-full bg-stone-950/90 border border-stone-800 focus:border-amber-500/70 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 shadow-inner"
              />
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
              title={selectedMill.name}
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="text-left text-xs min-w-0">
                <div className="text-[10px] text-stone-400 flex items-center gap-1">
                  <span>{selectedMill.formattedDistance || "1.2 km"}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold underline">
                    {lang === "hi" ? "बदलें" : "Change"}
                  </span>
                </div>
                <div className="font-bold text-stone-200 truncate max-w-[130px]">
                  {selectedMill.name}
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
            <div className="w-7 h-7 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-stone-950 font-black text-xs flex items-center justify-center shadow-sm shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
              {userInitial}
            </div>

            {/* Personalized Greeting (Desktop) */}
            <div className="text-left hidden lg:block leading-tight min-w-0">
              <div className="text-[10px] text-stone-400 font-medium">
                {lang === "hi" ? "नमस्ते," : "Hello,"}
              </div>
              <div className="text-xs font-bold text-stone-100 truncate max-w-[90px]">
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

      {/* 2. MOBILE INTEGRATED STICKY SEARCH BAR (Blinkit Mobile App Style) */}
      {onSearchChange && (
        <div className="md:hidden px-3 pb-2.5 pt-0">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                lang === "hi"
                  ? browseMode === "flours"
                    ? "आटा, सत्तू, बेसन, रागी या चक्की खोजें..."
                    : "निकटतम चक्की, इलाका या पत्थर खोजें..."
                  : browseMode === "flours"
                  ? "Search flour, sattu, besan, ragi, or chakki..."
                  : "Search chakki name, area, or stone type..."
              }
              className="w-full bg-stone-950 border border-stone-800/90 focus:border-amber-500/70 rounded-2xl pl-9 pr-8 py-2 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all shadow-inner"
            />
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
