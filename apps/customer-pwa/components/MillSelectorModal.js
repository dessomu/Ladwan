// apps/customer-pwa/components/MillSelectorModal.js - View & Switch Nearby Chakkis
"use client";

import { Store, X, Check, Star, Clock, MapPin, Sparkles } from "lucide-react";

export default function MillSelectorModal({
  isOpen,
  onClose,
  nearbyMills,
  selectedMill,
  onSelectMill,
  lang,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-100">
                {lang === "hi" ? "आस-पास की आटा चक्की" : "Nearby Atta Chakkis"}
              </h2>
              <p className="text-[11px] text-stone-400">
                {lang === "hi"
                  ? "आपके इलाके में 100% पत्थर-पिसाई करने वाली लाइव चक्कियां"
                  : "Live cold stone grinding mills within hyper-local radius"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mills List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {nearbyMills.map((mill) => {
            const isSelected = selectedMill?.id === mill.id;
            return (
              <div
                key={mill.id}
                onClick={() => {
                  onSelectMill(mill.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40"
                    : "bg-stone-950/60 hover:bg-stone-800/60 border-stone-800 hover:border-stone-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-100 text-sm">
                        {mill.name}
                      </h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-stone-950 font-black">
                          सक्रिय / Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-400 font-medium">
                      {mill.tagline}
                    </p>
                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{mill.address || mill.area}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Badges strip */}
                <div className="mt-3 pt-3 border-t border-stone-800/60 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{mill.eta || "30-40 min"} ETA</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{mill.formattedDistance || "1.2 km"} दूर</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 font-semibold border border-emerald-900/40">
                    {mill.stoneType || "Natural Stone (ठंडी पिसाई)"}
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{mill.rating || 4.9}</span>
                    <span className="text-stone-400">({mill.totalReviews || 320})</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
