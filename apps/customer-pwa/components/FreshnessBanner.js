// apps/customer-pwa/components/FreshnessBanner.js - Ultra Compact Hero & Downward Sliding Carousel on Mobile
"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  Wheat,
  CheckCircle2,
} from "lucide-react";

export default function FreshnessBanner({ selectedMill, onOpenMillModal, lang }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const usps = [
    {
      id: "zero_maida",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15 border-emerald-500/30",
      gradient: "from-emerald-950/40 via-stone-900/70 to-stone-950/90 border-emerald-900/40",
      titleHi: "100% Zero Maida",
      titleEn: "100% Zero Maida",
      hasBadge: true,
      descHi: "शून्य मिलावट • 100% साबुत गेहूं • प्राकृतिक चोकर",
      descEn: "Zero preservatives, zero bleaching, pure natural bran",
    },
    {
      id: "stone_milled",
      icon: Wheat,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15 border-amber-500/30",
      gradient: "from-amber-950/40 via-stone-900/70 to-stone-950/90 border-amber-500/30",
      titleHi: "धीमी ठंडी पत्थर पिसाई",
      titleEn: "Cold Stone Milled",
      hasBadge: false,
      descHi: "विटामिन, मिनरल्स व फाइबर 100% सुरक्षित",
      descEn: "Slow cold friction preserves essential nutrients",
    },
    {
      id: "on_demand",
      icon: Zap,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/15 border-yellow-500/30",
      gradient: "from-yellow-950/40 via-stone-900/70 to-stone-950/90 border-yellow-500/30",
      titleHi: "30-45 मिनट में डिलीवरी",
      titleEn: "30-45 Mins Hyperlocal",
      hasBadge: false,
      descHi: "ऑर्डर के बाद ताज़ा पिसा आटा सीधे आपकी रसोई में",
      descEn: "Ground fresh on order from local neighborhood chakki",
    },
  ];

  // Auto-cycle through benefits every 3.2s with downward sliding transition
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % usps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [usps.length]);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % usps.length);
  };

  const prevIdx = (activeIdx - 1 + usps.length) % usps.length;

  return (
    <section className="relative mb-3.5 sm:mb-6 pt-0 sm:pt-2">
      {/* Ambient background aura - warm golden glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-4xl h-28 sm:h-44 bg-gradient-to-b from-amber-500/10 via-amber-950/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Hero Headline & Crisp Narrative (Compact on mobile) */}
      <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
        <h1
          className="text-base xs:text-lg sm:text-3xl lg:text-4xl font-black text-stone-100 tracking-tight leading-snug sm:leading-[1.15]"
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

        {/* Description: Hidden on mobile for extreme compactness, visible on desktop */}
        <p
          className="hidden sm:block text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed"
          suppressHydrationWarning
        >
          {lang === "hi"
            ? "मशीनी फैक्ट्री का महीनों पुराना पैकेट बंद आटा छोड़ें। लाडवां आपके निकटतम स्थानीय चक्की से 100% शुद्ध, प्राकृतिक चोकर युक्त आटा 30-45 मिनट में सीधे आपकी रसोई तक पहुंचाता है।"
            : "Skip stale factory-packaged warehouse flour. Ladwan connects you to your neighborhood stone chakki for 100% wholesome fiber-rich atta delivered warm in 30-45 minutes."}
        </p>
      </div>

      {/* 1. MOBILE ONLY: Downward Sliding Carousel (One benefit at a time, slides down smoothly) */}
      <div className="block sm:hidden pt-0.5">
        <div
          onClick={handleNext}
          role="region"
          aria-label="Freshness benefits carousel"
          className="relative h-[52px] w-full overflow-hidden rounded-xl bg-stone-900/90 border border-stone-800 shadow-md cursor-pointer select-none active:scale-[0.99] transition-transform"
        >
          {usps.map((usp, idx) => {
            const Icon = usp.icon;
            const isCurrent = idx === activeIdx;
            const isPrevious = idx === prevIdx;

            // Downward transition logic:
            // isCurrent: slides in from top (-translate-y-full) down to translate-y-0
            // isPrevious: slides out from translate-y-0 down to translate-y-full
            // other: silently resets at -translate-y-full (top) ready for next cycle
            let positionClasses = "";
            if (isCurrent) {
              positionClasses =
                "translate-y-0 opacity-100 scale-100 z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform";
            } else if (isPrevious) {
              positionClasses =
                "translate-y-full opacity-0 scale-[0.98] z-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none will-change-transform";
            } else {
              positionClasses =
                "-translate-y-full opacity-0 scale-[0.98] z-0 pointer-events-none transition-none";
            }

            return (
              <div
                key={usp.id}
                className={`absolute inset-0 px-3.5 py-2 flex items-center gap-2.5 bg-gradient-to-r ${usp.gradient} ${positionClasses}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg ${usp.iconBg} border ${usp.iconColor} flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-stone-100 flex items-center gap-1.5 leading-tight">
                      <span suppressHydrationWarning>
                        {lang === "hi" ? usp.titleHi : usp.titleEn}
                      </span>
                      {usp.hasBadge && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div
                      className="text-[10px] text-stone-300 truncate mt-0.5 leading-tight font-medium"
                      suppressHydrationWarning
                    >
                      {lang === "hi" ? usp.descHi : usp.descEn}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DESKTOP / TABLET ONLY: The 3 Freshness Pillars (Static 3-Column Grid) */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
        {usps.map((usp) => {
          const Icon = usp.icon;
          return (
            <div
              key={usp.id}
              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${usp.gradient} border flex items-center gap-2.5 sm:gap-3 shadow-md hover:border-amber-500/40 transition-all`}
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${usp.iconBg} border ${usp.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-stone-100 flex items-center gap-1">
                  <span suppressHydrationWarning>
                    {lang === "hi" ? usp.titleHi : usp.titleEn}
                  </span>
                  {usp.hasBadge && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div
                  className="text-[10px] sm:text-[11px] text-stone-400 truncate mt-0.5"
                  suppressHydrationWarning
                >
                  {lang === "hi" ? usp.descHi : usp.descEn}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

