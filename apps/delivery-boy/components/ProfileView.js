// apps/delivery-boy/components/ProfileView.js
// Agent profile — editable name/phone, stats, demo order injector
"use client";

import { useState, useCallback } from "react";
import {
  User,
  Phone,
  Save,
  Bike,
  CheckCircle2,
  TrendingUp,
  Info,
  Zap,
  Globe,
} from "lucide-react";

function StatBadge({ icon: Icon, value, label }) {
  return (
    <div className="flex-1 bg-slate-900/60 rounded-2xl border border-slate-800/40 p-3 flex flex-col items-center gap-1 text-center">
      <Icon className="w-4 h-4 text-blue-400" />
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[9px] text-slate-500 font-medium">{label}</p>
    </div>
  );
}

export default function ProfileView({ store }) {
  const { lang, toggleLang, agentProfile, toggleOnlineStatus, orders, earningsToday, completedToday, isFirebase } = store;

  const [name, setName] = useState(agentProfile?.name || "");
  const [englishName, setEnglishName] = useState(agentProfile?.englishName || "");
  const [phone, setPhone] = useState(agentProfile?.phone || "");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate total stats
  const totalDeliveries = (orders || []).filter((o) => o.status === "delivered").length;
  const totalEarnings = (orders || []).reduce(
    (sum, o) => (o.status === "delivered" ? sum + (o.deliveryFee || 25) : sum),
    0
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const updated = {
      ...agentProfile,
      name: name.trim() || agentProfile?.name,
      englishName: englishName.trim() || agentProfile?.englishName,
      phone: phone.trim() || agentProfile?.phone,
    };
    try {
      localStorage.setItem("ladwan_delivery_agent_v1", JSON.stringify(updated));
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [name, englishName, phone, agentProfile]);

  const isOnline = agentProfile?.isOnline !== false;

  return (
    <div className="space-y-4 pt-2">

      {/* Stats row */}
      <div className="flex gap-2.5">
        <StatBadge icon={Bike} value={totalDeliveries} label={lang === "hi" ? "कुल डिलीवरी" : "Total"} />
        <StatBadge icon={TrendingUp} value={`₹${totalEarnings}`} label={lang === "hi" ? "कुल कमाई" : "Earnings"} />
        <StatBadge icon={CheckCircle2} value={completedToday.length} label={lang === "hi" ? "आज" : "Today"} />
      </div>

      {/* Profile edit */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 p-4 space-y-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" suppressHydrationWarning>
          {lang === "hi" ? "प्रोफाइल संपादित करें" : "Edit Profile"}
        </p>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/30 to-blue-900/30 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Bike className="w-7 h-7 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-white truncate" suppressHydrationWarning>
              {lang === "hi" ? (agentProfile?.name || "डिलीवरी एजेंट") : (agentProfile?.englishName || agentProfile?.name || "Delivery Agent")}
            </p>
            <p className="text-xs text-slate-500">{agentProfile?.phone || "—"}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400 animate-blink" : "bg-slate-600"}`} />
              <span className={`text-[10px] font-semibold ${isOnline ? "text-emerald-400" : "text-slate-500"}`} suppressHydrationWarning>
                {isOnline ? (lang === "hi" ? "ऑनलाइन" : "Online") : (lang === "hi" ? "ऑफलाइन" : "Offline")}
              </span>
            </div>
          </div>
        </div>

        {/* Name fields */}
        <div className="space-y-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1" suppressHydrationWarning>
              {lang === "hi" ? "नाम (हिन्दी)" : "Name (Hindi)"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                placeholder="डिलीवरी एजेंट का नाम"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Name (English)</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                placeholder="Delivery Agent Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1" suppressHydrationWarning>
              {lang === "hi" ? "फ़ोन नंबर" : "Phone Number"}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                placeholder="+91 98000 00000"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            saved
              ? "bg-emerald-600/80 text-white border border-emerald-500/40"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
          } disabled:opacity-60`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span suppressHydrationWarning>{lang === "hi" ? "सहेजा गया!" : "Saved!"}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span suppressHydrationWarning>{lang === "hi" ? "प्रोफाइल सहेजें" : "Save Profile"}</span>
            </>
          )}
        </button>
      </div>

      {/* Quick toggles */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/40 p-3.5 space-y-2.5">
        {/* Language toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-300" suppressHydrationWarning>
              {lang === "hi" ? "भाषा: हिन्दी" : "Language: English"}
            </p>
          </div>
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 active:scale-90 transition-all"
            suppressHydrationWarning
          >
            {lang === "hi" ? "Switch to English" : "हिन्दी में बदलें"}
          </button>
        </div>

        {/* Online toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-emerald-400" : "bg-slate-600"}`} />
            <p className="text-sm font-semibold text-slate-300" suppressHydrationWarning>
              {isOnline ? (lang === "hi" ? "ऑनलाइन" : "Online") : (lang === "hi" ? "ऑफलाइन" : "Offline")}
            </p>
          </div>
          <button
            onClick={toggleOnlineStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border active:scale-90 transition-all ${
              isOnline
                ? "bg-red-950/40 text-red-400 border-red-900/40"
                : "bg-emerald-950/40 text-emerald-400 border-emerald-900/40"
            }`}
            suppressHydrationWarning
          >
            {isOnline ? (lang === "hi" ? "ऑफलाइन जाएं" : "Go Offline") : (lang === "hi" ? "ऑनलाइन जाएं" : "Go Online")}
          </button>
        </div>
      </div>



      {/* App info */}
      <div className="flex items-start gap-2 text-[11px] text-slate-700 pb-4">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p suppressHydrationWarning>
          {lang === "hi"
            ? "लाडवां डिलीवरी PWA v1.0 • हाइपर-लोकल आटा चक्की नेटवर्क"
            : "Ladwan Delivery PWA v1.0 • Hyperlocal fresh atta mill network"}
        </p>
      </div>
    </div>
  );
}
