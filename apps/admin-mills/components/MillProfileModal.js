"use client";

import { useState, useEffect } from "react";
import { Store, X, Save, Languages } from "lucide-react";
import { translations } from "../lib/translations";

export default function MillProfileModal({
  isOpen,
  onClose,
  mill,
  onSave,
  lang = "hi",
  onSelectLang,
  t,
}) {
  const [selectedLang, setSelectedLang] = useState(lang);
  const [formData, setFormData] = useState({
    name: mill.name || "",
    englishName: mill.englishName || "",
    tagline: mill.tagline || "",
    ownerName: mill.ownerName || "",
    phone: mill.phone || "",
    whatsapp: mill.whatsapp || "",
    address: mill.address || "",
    area: mill.area || "",
    pincode: mill.pincode || "",
    openingTime: mill.openingTime || "07:30 AM",
    closingTime: mill.closingTime || "08:30 PM",
    millingCapacityPerHour: mill.millingCapacityPerHour || "45 kg/hr",
    deliveryRadiusKm: mill.deliveryRadiusKm || 5,
  });

  useEffect(() => {
    setSelectedLang(lang);
  }, [lang]);

  if (!isOpen) return null;

  const activeLang = selectedLang || lang || "hi";
  const activeT = translations[activeLang] || t || translations.hi;

  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
    if (onSelectLang) {
      onSelectLang(newLang);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSelectLang && selectedLang !== lang) {
      onSelectLang(selectedLang);
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header with Title and Quick Language Toggle */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur-md px-5 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{activeT.settingsTitle}</h2>
              <p className="text-xs text-stone-400">{activeT.settingsSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLanguageChange(activeLang === "hi" ? "en" : "hi")}
              className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-stone-700/60 transition-colors shadow-sm"
              title={activeLang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeLang === "hi" ? "English" : "हिंदी"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* LANGUAGE PREFERENCE OPTION */}
          <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
              <Languages className="w-4 h-4" />
              <span>{activeT.langPrefLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLanguageChange("hi")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  activeLang === "hi"
                    ? "bg-amber-500/15 border-amber-500 text-white font-bold ring-1 ring-amber-500/40"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                <div>
                  <p className="text-sm">🇮🇳 हिंदी (Hindi)</p>
                  {/* <span className="text-[10px] text-stone-400">आसान हिंदी भाषा</span> */}
                </div>
                {activeLang === "hi" && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  activeLang === "en"
                    ? "bg-amber-500/15 border-amber-500 text-white font-bold ring-1 ring-amber-500/40"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                <div>
                  <p className="text-sm">🇬🇧 English</p>
                  {/* <span className="text-[10px] text-stone-400">English Language</span> */}
                </div>
                {activeLang === "en" && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              {activeT.millNameLabel}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              {activeT.millEnglishNameLabel || "English Name (e.g. Shree Ram Flour Mill)"}
            </label>
            <input
              type="text"
              value={formData.englishName}
              placeholder={activeT.millEnglishNamePlaceholder || "e.g. Shree Ram Flour Mill"}
              onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              {activeT.taglineLabel}
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.ownerNameLabel}
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.phoneLabel}
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              {activeT.addressLabel}
            </label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.areaLabel}
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.pincodeLabel}
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">
                {activeT.openTimeLabel}
              </label>
              <input
                type="text"
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">
                {activeT.closeTimeLabel}
              </label>
              <input
                type="text"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.capacityLabel}
              </label>
              <input
                type="text"
                value={formData.millingCapacityPerHour}
                onChange={(e) =>
                  setFormData({ ...formData, millingCapacityPerHour: e.target.value })
                }
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.radiusLabel}
              </label>
              <input
                type="number"
                value={formData.deliveryRadiusKm}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryRadiusKm: Number(e.target.value) })
                }
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition-colors"
            >
              {activeT.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-900/40 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{activeT.saveProfileBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
