"use client";

import { useState } from "react";
import { Plus, X, Wheat, Sparkles, Languages } from "lucide-react";
import { translations } from "../lib/translations";

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  lang = "hi",
  toggleLang,
  t,
}) {
  const activeT = t || translations[lang] || translations.hi;

  const [name, setName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [category, setCategory] = useState("Wheat Atta");
  const [description, setDescription] = useState("");
  const [price1kg, setPrice1kg] = useState("45");
  const [price5kg, setPrice5kg] = useState("220");
  const [price10kg, setPrice10kg] = useState("430");
  const [stockKg, setStockKg] = useState("200");
  const [grindOptions, setGrindOptions] = useState(
    lang === "en" ? "Fine, Medium, Coarse" : "बारीक (Fine), मध्यम (Medium)"
  );

  if (!isOpen) return null;

  const quickPresets = [
    {
      name: "देसी मक्का का आटा (Makka Atta)",
      english: "Desi Makka / Corn Flour",
      cat: "Millet Atta",
      p1: "42",
      p5: "200",
      p10: "390",
      descHi: "ताजी पीली मक्का की पिसाई। सर्दियों में सरसों के साग के साथ बेहद स्वादिष्ट।",
      descEn: "Fresh stone-ground yellow maize flour. Traditional winter staple, perfect with Sarson Saag.",
    },
    {
      name: "रागी / नाचनी का आटा (Ragi Flour)",
      english: "Pure Ragi / Finger Millet Atta",
      cat: "Millet Atta",
      p1: "58",
      p5: "280",
      p10: "550",
      descHi: "कैल्शियम से भरपूर, बच्चों और बुजुर्गों की हड्डियों के लिए उत्तम अनाज।",
      descEn: "High calcium & natural iron. Gluten-free wholesome grain for nutritious daily rotis.",
    },
    {
      name: "जौ का शुद्ध आटा (Barley / Jau Atta)",
      english: "Pure Barley / Jau Atta",
      cat: "Specialty Flour",
      p1: "48",
      p5: "230",
      p10: "450",
      descHi: "ठंडी तासीर का आटा। वजन घटाने और कोलेस्ट्रॉल कम करने में मददगार।",
      descEn: "Cooling natural properties. Highly recommended for blood sugar balance and digestion.",
    },
    {
      name: "गेहूं का ताजा चोकर (Wheat Bran / Choker)",
      english: "Natural Wheat Bran / Choker",
      cat: "Wheat Atta",
      p1: "25",
      p5: "120",
      p10: "230",
      descHi: "कब्ज और पाचन के लिए शुद्ध गेहूं का चोकर। आटे में मिलाकर खाने योग्य।",
      descEn: "100% natural wheat bran, high in dietary fiber for gastrointestinal and gut wellness.",
    },
  ];

  const applyPreset = (preset) => {
    setName(preset.name);
    setEnglishName(preset.english);
    setCategory(preset.cat);
    setPrice1kg(preset.p1);
    setPrice5kg(preset.p5);
    setPrice10kg(preset.p10);
    setDescription(lang === "en" ? preset.descEn : preset.descHi);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check primary field based on active language
    const finalName = lang === "en" ? (name.trim() || englishName.trim()) : name.trim();
    const finalEnglishName = englishName.trim() || finalName;

    if (!finalName && !finalEnglishName) return;

    const grinds = grindOptions
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    onAddProduct({
      name: finalName || finalEnglishName,
      englishName: finalEnglishName,
      category,
      description:
        description.trim() ||
        (lang === "en"
          ? "Fresh cold stone-ground 100% pure whole flour."
          : "ताजा पत्थर-पिसा शुद्ध आटा।"),
      prices: {
        "1kg": Number(price1kg) || 0,
        "5kg": Number(price5kg) || 0,
        "10kg": Number(price10kg) || 0,
      },
      stockKg: Number(stockKg) || 100,
      grindOptions:
        grinds.length > 0
          ? grinds
          : lang === "en"
          ? ["Fine", "Medium"]
          : ["बारीक (Fine)", "मध्यम (Medium)"],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header with Title and Language Toggle */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur-md px-5 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {activeT.addGrainModalTitle}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {activeT.addGrainModalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Modal-embedded Language Toggle */}
            {toggleLang && (
              <button
                type="button"
                onClick={toggleLang}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-stone-700/60 transition-colors shadow-sm"
                title={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "hi" ? "English" : "हिंदी"}</span>
              </button>
            )}

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
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {activeT.quickPresetsLabel}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="text-left p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-xs transition-colors hover:bg-stone-800/60"
                >
                  <p className="font-semibold text-amber-300 truncate">
                    {lang === "en" ? preset.english : preset.name}
                  </p>
                  <span className="text-[10px] text-stone-500 font-mono">
                    ₹{preset.p1}/kg • {preset.cat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Name Field (Swaps order & requirement based on language) */}
          {lang === "en" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {activeT.grainNamePrimaryLabel}
                </label>
                <input
                  type="text"
                  required
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  placeholder={activeT.grainNamePlaceholder}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  {activeT.grainNameSecondaryLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={activeT.grainNameSecondaryPlaceholder}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {activeT.grainNamePrimaryLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={activeT.grainNamePlaceholder}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  {activeT.grainNameSecondaryLabel}
                </label>
                <input
                  type="text"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  placeholder={activeT.grainNameSecondaryPlaceholder}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              {activeT.categoryLabel}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Wheat Atta">{activeT.catWheatOption}</option>
              <option value="Specialty Flour">{activeT.catSpecialtyOption}</option>
              <option value="Sattu & Besan">{activeT.catSattuOption}</option>
              <option value="Millet Atta">{activeT.catMilletsOption}</option>
              <option value="Services">{activeT.catServicesOption}</option>
            </select>
          </div>

          {/* Daily Price Board (1kg, 5kg, 10kg) */}
          <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
            <label className="block text-xs font-bold text-amber-400 mb-2">
              {activeT.dailyRatesLabel}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">1 kg (₹)</span>
                <input
                  type="number"
                  required
                  value={price1kg}
                  onChange={(e) => setPrice1kg(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white text-center focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">5 kg (₹)</span>
                <input
                  type="number"
                  required
                  value={price5kg}
                  onChange={(e) => setPrice5kg(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white text-center focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">10 kg (₹)</span>
                <input
                  type="number"
                  required
                  value={price10kg}
                  onChange={(e) => setPrice10kg(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white text-center focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Stock in KG & Grind Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.stockInitialLabel}
              </label>
              <input
                type="number"
                value={stockKg}
                onChange={(e) => setStockKg(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                {activeT.grindOptionsModalLabel}
              </label>
              <input
                type="text"
                value={grindOptions}
                onChange={(e) => setGrindOptions(e.target.value)}
                placeholder={activeT.grindOptionsPlaceholder}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              {activeT.descLabel}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={activeT.descPlaceholder}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition-colors"
            >
              {activeT.cancelBtnModal}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-900/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{activeT.submitAddGrainBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
