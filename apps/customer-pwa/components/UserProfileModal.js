// apps/customer-pwa/components/UserProfileModal.js - Customer Profile, Address & Preferences Management
"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Languages,
  Check,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function UserProfileModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  location,
  onOpenLocationModal,
  lang,
  onToggleLang,
  onResetData,
}) {
  const isDefaultName =
    !userProfile?.name ||
    userProfile?.name === "सोमनाथ बैद्य" ||
    userProfile?.name === "Somnath Baidya";
  const initialDisplayName = isDefaultName
    ? (lang === "hi" ? "सोमनाथ बैद्य" : "Somnath Baidya")
    : (lang === "hi" ? userProfile?.name : (userProfile?.englishName || userProfile?.name));

  const [formData, setFormData] = useState({
    name: initialDisplayName || "",
    phone: userProfile?.phone || "",
    houseFlat: userProfile?.houseFlat || "",
    streetArea: userProfile?.streetArea || "",
    landmark: userProfile?.landmark || "",
    defaultGrind: userProfile?.defaultGrind || "बारीक (रोटी)",
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const isDefault =
        !userProfile.name ||
        userProfile.name === "सोमनाथ बैद्य" ||
        userProfile.name === "Somnath Baidya";
      const displayName = isDefault
        ? (lang === "hi" ? "सोमनाथ बैद्य" : "Somnath Baidya")
        : (lang === "hi" ? userProfile.name : (userProfile.englishName || userProfile.name));

      setFormData({
        name: displayName,
        phone: userProfile.phone || "",
        houseFlat:
          lang === "hi"
            ? (userProfile.houseFlat || "फ्लैट 3B, शांति निकेतन")
            : (userProfile.englishHouseFlat || "Flat 3B, Shanti Niketan"),
        streetArea:
          lang === "hi"
            ? (userProfile.streetArea || "स्टेशन रोड, सोनारपुर")
            : (userProfile.englishStreetArea || "Station Road, Sonarpur"),
        landmark:
          lang === "hi"
            ? (userProfile.landmark || "सोनारपुर रेलवे स्टेशन के निकट")
            : (userProfile.englishLandmark || "Near Sonarpur Railway Station"),
        defaultGrind: userProfile.defaultGrind || "बारीक (रोटी)",
      });
    }
  }, [userProfile, isOpen, lang]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      if (lang === "hi") {
        onUpdateProfile({
          ...formData,
          name: formData.name,
        });
      } else {
        onUpdateProfile({
          ...formData,
          englishName: formData.name,
          name:
            userProfile?.name && userProfile?.name !== "Somnath Baidya"
              ? userProfile.name
              : formData.name,
        });
      }
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 font-black text-base shadow-md shadow-amber-500/20">
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-1.5" suppressHydrationWarning>
                <span>{lang === "hi" ? "ग्राहक प्रोफाइल व सेटिंग्स" : "Profile & Preferences"}</span>
              </h2>
              <p className="text-[11px] text-stone-400" suppressHydrationWarning>
                {lang === "hi"
                  ? "डिलीवरी का पता, संपर्क एवं भाषा प्राथमिकताएं"
                  : "Manage your address, contact & preferences"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors active:scale-90"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Success Banner */}
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span suppressHydrationWarning>
                {lang === "hi"
                  ? "प्रोफाइल सफलतापूर्वक अपडेट हो गई!"
                  : "Profile updated successfully!"}
              </span>
            </div>
          )}

          {/* 1. Language Preference Selector */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5" suppressHydrationWarning>
                <Languages className="w-4 h-4 text-amber-400" />
                <span>{lang === "hi" ? "भाषा का चयन (Language)" : "Language Preference"}</span>
              </label>
              <span className="text-[10px] text-amber-400/90 font-mono font-semibold">
                {lang === "hi" ? "हिंदी सक्रिय" : "English Active"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (lang !== "hi") onToggleLang();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  lang === "hi"
                    ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                    : "bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800"
                }`}
              >
                <span>🇮🇳 हिंदी</span>
                {lang === "hi" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (lang !== "en") onToggleLang();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  lang === "en"
                    ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                    : "bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800"
                }`}
              >
                <span>🇬🇧 English</span>
                {lang === "en" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* 2. Personal Contact Information */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
            <h3 className="text-xs font-bold text-stone-200 flex items-center gap-1.5" suppressHydrationWarning>
              <User className="w-4 h-4 text-amber-400" />
              <span>{lang === "hi" ? "व्यक्तिगत जानकारी" : "Personal Information"}</span>
            </h3>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1" suppressHydrationWarning>
                  {lang === "hi" ? "पूरा नाम *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={lang === "hi" ? "जैसे: सोमनाथ बैद्य" : "e.g., Somnath Baidya"}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1" suppressHydrationWarning>
                  {lang === "hi" ? "मोबाइल नंबर (10 अंक) *" : "Phone Number (10 digits) *"}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 font-mono font-bold">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="98765 43210"
                    className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl pl-11 pr-3 py-2 text-xs text-stone-100 font-mono placeholder-stone-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Delivery Address Details */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-200 flex items-center gap-1.5" suppressHydrationWarning>
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{lang === "hi" ? "डिफ़ॉल्ट डिलीवरी पता" : "Default Delivery Address"}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenLocationModal) onOpenLocationModal();
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold"
                suppressHydrationWarning
              >
                {lang === "hi" ? "इलाका बदलें" : "Change Area"}
              </button>
            </div>

            {/* Current Pinned Locality Tag */}
            <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-stone-300 font-semibold truncate">
                  {location?.name || "Sonarpur, Kolkata"}
                </span>
              </div>
              <span className="text-[10px] text-stone-500 shrink-0">
                {location?.pincode || "700150"}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1" suppressHydrationWarning>
                  {lang === "hi" ? "मकान / फ्लैट / मंजिल *" : "House / Flat / Floor *"}
                </label>
                <input
                  type="text"
                  value={formData.houseFlat}
                  onChange={(e) => setFormData({ ...formData, houseFlat: e.target.value })}
                  placeholder={lang === "hi" ? "जैसे: फ्लैट 3B, शांति निकेतन" : "e.g., Flat 3B, Shanti Niketan"}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1" suppressHydrationWarning>
                  {lang === "hi" ? "सड़क / इलाका" : "Street / Area"}
                </label>
                <input
                  type="text"
                  value={formData.streetArea}
                  onChange={(e) => setFormData({ ...formData, streetArea: e.target.value })}
                  placeholder={lang === "hi" ? "जैसे: स्टेशन रोड" : "e.g., Station Road"}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1" suppressHydrationWarning>
                  {lang === "hi" ? "लैंडमार्क (पहचान)" : "Nearby Landmark"}
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder={lang === "hi" ? "जैसे: शिव मंदिर के पास" : "e.g., Near Shiva Temple"}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* 4. Flour Texture Preference */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2.5">
            <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5" suppressHydrationWarning>
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>{lang === "hi" ? "पसंदीदा पिसाई की मोटाई (Grind Preference)" : "Preferred Flour Coarseness"}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { hi: "बारीक (रोटी)", en: "Fine (Roti)" },
                { hi: "मध्यम", en: "Medium" },
                { hi: "चोकर युक्त", en: "High Bran" },
              ].map((grind) => {
                const label = lang === "hi" ? grind.hi : grind.en;
                const isSelected = formData.defaultGrind === grind.hi || formData.defaultGrind === grind.en;
                return (
                  <button
                    key={grind.hi}
                    type="button"
                    onClick={() => setFormData({ ...formData, defaultGrind: lang === "hi" ? grind.hi : grind.en })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-amber-500 text-stone-950 shadow-sm"
                        : "bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Clear / Reset App Data Action */}
          {onResetData && (
            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onResetData}
                className="text-stone-400 hover:text-red-400 flex items-center gap-1.5 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>
                  {lang === "hi" ? "ऐप डेटा व कार्ट रीसेट करें" : "Reset App & Cart Data"}
                </span>
              </button>
              <span className="text-[10px] text-stone-600 font-mono">
                Ladwan PWA v1.2
              </span>
            </div>
          )}

          {/* Modal Footer Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span suppressHydrationWarning>
                {lang === "hi" ? "प्रोफाइल सेव करें" : "Save Profile & Settings"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
