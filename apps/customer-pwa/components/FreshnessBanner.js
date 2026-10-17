// apps/customer-pwa/components/FreshnessBanner.js - Blinkit-Style Freshness Assurance
"use client";

import { Sparkles, ShieldCheck, Zap, Wheat, Store } from "lucide-react";

export default function FreshnessBanner({ selectedMill, onOpenMillModal, lang }) {
  if (!selectedMill) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/20 p-5 sm:p-6 shadow-xl mb-6">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Story copy */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === "hi"
                ? "गोदाम का पुराना पैकेट नहीं • केवल लाइव ताज़ा पिसाई"
                : "No Warehousing • Ground Fresh On-Demand"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight leading-tight">
            {lang === "hi" ? (
              <>
                पारंपरिक पत्थर-पिसा आटा,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                  ऑर्डर पर ही ताज़ा पिसा जाएगा
                </span>
              </>
            ) : (
              <>
                Traditional Stone-Ground Atta,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                  Milled Fresh Only After You Order
                </span>
              </>
            )}
          </h1>

          <p className="text-xs text-stone-300 leading-relaxed">
            {lang === "hi"
              ? "मशीनी फैक्ट्री का पुराना पैक्ड आटा छोड़ें। लाडवां आपके निकटतम स्थानीय चक्की से 100% शुद्ध, प्राकृतिक चोकर युक्त आटा 30-45 मिनट में आपके घर पहुंचाता है।"
              : "Skip stale factory-packaged flour. Ladwan connects you to your hyper-local stone mill for 100% pure, natural fiber-rich atta delivered warm in 30-45 mins."}
          </p>

          {/* Key Value Props */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-stone-300 font-semibold">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Zero Maida</span>
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Wheat className="w-3.5 h-3.5" />
              <span>ठंडी पत्थर पिसाई (Cold Stone Milled)</span>
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-3.5 h-3.5" />
              <span>30-45 मिनट डिलीवरी</span>
            </span>
          </div>
        </div>

        {/* Assigned Mill Live Card */}
        <div className="w-full md:w-auto shrink-0 bg-stone-950/80 border border-stone-800 p-4 rounded-2xl flex items-center justify-between md:flex-col md:items-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                {lang === "hi" ? "सक्रिय स्थानीय चक्की" : "Assigned Hyper-local Chakki"}
              </div>
              <div className="text-xs font-bold text-stone-100 truncate max-w-[180px]">
                {selectedMill.name}
              </div>
              <div className="text-[11px] text-amber-400 font-medium">
                {selectedMill.formattedDistance || "1.2 km"} दूर • {selectedMill.eta || "30-40 min"}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenMillModal}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700/60 transition-colors whitespace-nowrap"
          >
            {lang === "hi" ? "चक्की बदलें" : "Switch Mill"}
          </button>
        </div>
      </div>
    </div>
  );
}
