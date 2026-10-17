// apps/customer-pwa/components/FreshnessBanner.js - Elevated Visual Hierarchy Hero & Freshness Guarantee
"use client";

import { Sparkles, ShieldCheck, Zap, Wheat, Store, ChevronRight, CheckCircle2 } from "lucide-react";

export default function FreshnessBanner({ selectedMill, onOpenMillModal, lang }) {
  if (!selectedMill) return null;

  return (
    <section className="relative mb-6 pt-1 sm:pt-2">
      {/* Ambient background aura - warm golden glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-4xl h-56 bg-gradient-to-b from-amber-500/10 via-amber-950/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* 1. Top Utility Row: Live Network Pill & Assigned Chakki Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
        {/* Live Network Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold tracking-tight shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span suppressHydrationWarning>
            {lang === "hi"
              ? "जीरो वेयरहाउसिंग • लाइव ऑन-डिमांड पिसाई"
              : "Zero Warehousing • Live On-Demand Milling"}
          </span>
        </div>

        {/* Assigned Chakki Quick Pill (Interactive & Compact) */}
        <button
          type="button"
          onClick={onOpenMillModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/40 text-stone-200 text-xs font-semibold transition-all group shadow-sm active:scale-95"
          title={selectedMill.name}
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Store className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-stone-400 text-[11px] hidden xs:inline" suppressHydrationWarning>
              {lang === "hi" ? "चक्की:" : "Mill:"}
            </span>
            <span className="font-bold text-stone-100 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[200px]">
              {selectedMill.name}
            </span>
            <span className="text-amber-400 font-mono text-[11px] font-bold shrink-0">
              {selectedMill.formattedDistance || "1.2 km"}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 group-hover:text-amber-300 underline font-semibold shrink-0 ml-0.5" suppressHydrationWarning>
            {lang === "hi" ? "बदलें" : "Change"}
          </span>
        </button>
      </div>

      {/* 2. Hero Headline & Crisp Narrative */}
      <div className="space-y-2 mb-4">
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-100 tracking-tight leading-[1.15]"
          suppressHydrationWarning
        >
          {lang === "hi" ? (
            <>
              पारंपरिक पत्थर-पिसा शुद्ध आटा,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                ऑर्डर पर ही ताज़ा पिसाई
              </span>
            </>
          ) : (
            <>
              Fresh Stone-Ground Atta,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                Milled Fresh Only After You Order
              </span>
            </>
          )}
        </h1>

        <p
          className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed"
          suppressHydrationWarning
        >
          {lang === "hi"
            ? "मशीनी फैक्ट्री का महीनों पुराना पैकेट बंद आटा छोड़ें। लाडवां आपके निकटतम स्थानीय चक्की से 100% शुद्ध, प्राकृतिक चोकर युक्त आटा 30-45 मिनट में सीधे आपकी रसोई तक पहुंचाता है।"
            : "Skip stale factory-packaged warehouse flour. Ladwan connects you to your neighborhood stone chakki for 100% wholesome fiber-rich atta delivered warm in 30-45 minutes."}
        </p>
      </div>

      {/* 3. The 3 Refactored Freshness Pillars (Integrated Hero Matrix) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        {/* Pillar 1: Zero Maida */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-stone-900/60 to-stone-950/80 border border-emerald-900/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-stone-100 flex items-center gap-1">
              <span>100% Zero Maida</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-[11px] text-stone-400 truncate" suppressHydrationWarning>
              {lang === "hi" ? "शून्य मिलावट • प्राकृतिक चोकर" : "Zero preservatives & bleaching"}
            </div>
          </div>
        </div>

        {/* Pillar 2: Cold Stone Milled */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-stone-900/60 to-stone-950/80 border border-amber-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Wheat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-amber-300" suppressHydrationWarning>
              {lang === "hi" ? "धीमी ठंडी पत्थर पिसाई" : "Cold Stone Milled"}
            </div>
            <div className="text-[11px] text-stone-400 truncate" suppressHydrationWarning>
              {lang === "hi" ? "पोषक तत्व व फाइबर 100% सुरक्षित" : "Preserves nutrients & fiber"}
            </div>
          </div>
        </div>

        {/* Pillar 3: Fast Local Delivery */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-yellow-950/30 via-stone-900/60 to-stone-950/80 border border-yellow-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-yellow-300" suppressHydrationWarning>
              {lang === "hi" ? "30-45 मिनट में डिलीवरी" : "30-45 Mins Hyperlocal"}
            </div>
            <div className="text-[11px] text-stone-400 truncate" suppressHydrationWarning>
              {lang === "hi" ? "गरम ताज़ा आटा सीधे आपके द्वार" : "Fresh atta straight to your doorstep"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
