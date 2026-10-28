// apps/customer-pwa/components/LocationModal.js - Pin Delivery Location
"use client";

import { useState } from "react";
import {
  MapPin,
  Crosshair,
  X,
  Check,
  Search,
  Building,
  Navigation,
} from "lucide-react";
import { PRESET_LOCALITIES } from "@ladwan/database/schemas";
import { getCurrentGpsPosition } from "../lib/geo";

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  lang,
}) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  if (!isOpen) return null;

  const handleGpsDetect = async () => {
    setIsDetecting(true);
    setGpsError("");
    try {
      const coords = await getCurrentGpsPosition();
      const detected = {
        id: `gps_${Date.now()}`,
        name: "मेरा वर्तमान स्थान (Current GPS Location)",
        hindiName: "वर्तमान जीपीएस स्थान",
        area: "Detected via GPS",
        city: "Nearby",
        lat: coords.lat,
        lng: coords.lng,
        isGps: true,
      };
      onSelectLocation(detected);
      onClose();
    } catch (err) {
      setGpsError(
        lang === "hi"
          ? "जीपीएस सिग्नल नहीं मिला। कृपया नीचे दी गई सूची से इलाका चुनें।"
          : "Unable to detect GPS. Please pick a preset locality below."
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customAddress.trim()) return;
    const manualLoc = {
      id: `custom_${Date.now()}`,
      name: customAddress.trim(),
      hindiName: customAddress.trim(),
      area: customAddress.trim(),
      city: "Kolkata",
      lat: currentLocation?.lat || 22.4385,
      lng: currentLocation?.lng || 88.4022,
    };
    onSelectLocation(manualLoc);
    onClose();
  };

  const filteredPresets = PRESET_LOCALITIES.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.hindiName.includes(q) ||
      item.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-100">
                {lang === "hi" ? "डिलीवरी स्थान चुनें" : "Select Delivery Location"}
              </h2>
              <p className="text-[11px] text-stone-400">
                {lang === "hi"
                  ? "निकटतम ऑनलाइन चक्की से ताजा आटा मंगवाने के लिए"
                  : "To match fresh stone-grinding chakki within 3-5 km"}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* GPS Auto-detect Button */}
          <button
            onClick={handleGpsDetect}
            disabled={isDetecting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 hover:border-amber-500/60 text-amber-400 flex items-center justify-between font-bold text-xs transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Crosshair
                  className={`w-4 h-4 ${isDetecting ? "animate-spin text-amber-300" : ""}`}
                />
              </div>
              <div className="text-left">
                <div>
                  {isDetecting
                    ? lang === "hi"
                      ? "जीपीएस ढूँढ रहे हैं..."
                      : "Detecting GPS location..."
                    : lang === "hi"
                    ? "वर्तमान स्थान का उपयोग करें (GPS)"
                    : "Use Current Location (GPS)"}
                </div>
                <div className="text-[10px] text-stone-400 font-normal">
                  {lang === "hi"
                    ? "सटीक चक्की मैचिंग के लिए"
                    : "For accurate hyper-local matching"}
                </div>
              </div>
            </div>
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {gpsError && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs">
              {gpsError}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "इलाका, शहर या पिनकोड खोजें..."
                  : "Search locality, city or pincode..."
              }
              className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Preset Popular Localities */}
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "hi" ? "लोकप्रिय टेस्ट इलाके" : "Quick Test Localities"}</span>
            </div>
            <div className="space-y-2">
              {filteredPresets.map((item) => {
                const isSelected = currentLocation?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectLocation(item);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/5"
                        : "bg-stone-950/70 hover:bg-stone-800/60 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-amber-500 text-stone-950 font-bold"
                            : "bg-stone-800 text-stone-400"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isDefault && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              अनुशंसित / Default
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {item.area} • {item.city} ({item.pincode})
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Address Input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-stone-800">
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              {lang === "hi" ? "कस्टम पता दर्ज करें" : "Or Enter Custom Address"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder={
                  lang === "hi"
                    ? "उदा. सोनारपुर बाज़ार, कोलकाता..."
                    : "e.g. Sonarpur Station Road..."
                }
                className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!customAddress.trim()}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-xl transition-all"
              >
                {lang === "hi" ? "सेट करें" : "Set"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
