"use client";

import { useState } from "react";
import { Plus, X, Wheat, Sparkles } from "lucide-react";

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [name, setName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [category, setCategory] = useState("Wheat Atta");
  const [description, setDescription] = useState("");
  const [price1kg, setPrice1kg] = useState("45");
  const [price5kg, setPrice5kg] = useState("220");
  const [price10kg, setPrice10kg] = useState("430");
  const [stockKg, setStockKg] = useState("200");
  const [grindOptions, setGrindOptions] = useState("बारीक (Fine), मध्यम (Medium)");

  if (!isOpen) return null;

  const quickPresets = [
    {
      name: "देसी मक्का का आटा (Makka Atta)",
      english: "Desi Makka / Corn Flour",
      cat: "Millet Atta",
      p1: "42",
      p5: "200",
      p10: "390",
      desc: "ताजी पीली मक्का की पिसाई। सर्दियों में सरसों के साग के साथ बेहद स्वादिष्ट।",
    },
    {
      name: "रागी / नाचनी का आटा (Ragi Flour)",
      english: "Pure Ragi / Finger Millet Atta",
      cat: "Millet Atta",
      p1: "58",
      p5: "280",
      p10: "550",
      desc: "कैल्शियम से भरपूर, बच्चों और बुजुर्गों की हड्डियों के लिए उत्तम अनाज।",
    },
    {
      name: "जौ का शुद्ध आटा (Barley / Jau Atta)",
      english: "Pure Barley / Jau Atta",
      cat: "Specialty Flour",
      p1: "48",
      p5: "230",
      p10: "450",
      desc: "ठंडी तासीर का आटा। वजन घटाने और कोलेस्ट्रॉल कम करने में मददगार।",
    },
    {
      name: "गेहूं का ताजा चोकर (Wheat Bran / Choker)",
      english: "Natural Wheat Bran / Choker",
      cat: "Wheat Atta",
      p1: "25",
      p5: "120",
      p10: "230",
      desc: "कब्ज और पाचन के लिए शुद्ध गेहूं का चोकर। आटे में मिलाकर खाने योग्य।",
    },
  ];

  const applyPreset = (preset) => {
    setName(preset.name);
    setEnglishName(preset.english);
    setCategory(preset.cat);
    setPrice1kg(preset.p1);
    setPrice5kg(preset.p5);
    setPrice10kg(preset.p10);
    setDescription(preset.desc);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const grinds = grindOptions
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    onAddProduct({
      name,
      englishName: englishName || name,
      category,
      description: description || "ताजा पत्थर-पिसा शुद्ध आटा।",
      prices: {
        "1kg": Number(price1kg) || 0,
        "5kg": Number(price5kg) || 0,
        "10kg": Number(price10kg) || 0,
      },
      stockKg: Number(stockKg) || 100,
      grindOptions: grinds.length > 0 ? grinds : ["बारीक (Fine)", "मध्यम (Medium)"],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur-md px-5 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">नया आटा या अनाज जोड़ें</h2>
              <p className="text-xs text-stone-400">दुकान के दैनिक रेट बोर्ड में नई किस्म शामिल करें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-क्लिक टेम्पलेट चुनें (Quick Preset):
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="text-left p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-xs transition-colors hover:bg-stone-800/60"
                >
                  <p className="font-semibold text-amber-300 truncate">{preset.name}</p>
                  <span className="text-[10px] text-stone-500">₹{preset.p1}/kg</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hindi Name */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              अनाज/आटे का नाम (हिंदी) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. एमपी शरबती गेहूं आटा"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* English Name */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              English Name (वैकल्पिक)
            </label>
            <input
              type="text"
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              placeholder="e.g. MP Sharbati Wheat Flour"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              श्रेणी (Category)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Wheat Atta">गेहूं आटा (Wheat Atta)</option>
              <option value="Specialty Flour">मल्टीग्रेन / स्पेशल (Specialty Flour)</option>
              <option value="Sattu & Besan">सत्तू व बेसन (Sattu & Besan)</option>
              <option value="Millet Atta">मोटे अनाज (Millet Atta: Jowar, Bajra, Ragi, Makka)</option>
              <option value="Services">पिसाई सेवा (Milling Service)</option>
            </select>
          </div>

          {/* Daily Price Board (1kg, 5kg, 10kg) */}
          <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
            <label className="block text-xs font-bold text-amber-400 mb-2">
              दैनिक मूल्य दरें (Daily Selling Rates) *
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

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              विवरण व खासियत (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="उदा. 100% शुद्ध देशी अनाज, चोकर युक्त, जीरो मिलावट..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-900/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>रेट बोर्ड में शामिल करें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
