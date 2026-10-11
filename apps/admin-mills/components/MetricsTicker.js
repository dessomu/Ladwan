"use client";

import {
  Wheat,
  ShoppingBag,
  IndianRupee,
  Clock,
  AlertCircle,
  Flame,
  CheckCircle2,
  Package,
} from "lucide-react";

export default function MetricsTicker({ metrics, mill, onOpenOrdersTab }) {
  return (
    <div className="space-y-3">
      {/* Closed store alert reminder */}
      {!mill.isOpen && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-3.5 flex items-center justify-between text-red-200 text-xs shadow-lg shadow-red-950/40">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-semibold text-white">दुकान बंद है — ग्राहक आर्डर नहीं दे पा रहे हैं!</p>
              <p className="text-red-300/80 text-[11px]">
                कारण: {mill.statusReason || "दुकान बंद"}. आर्डर स्वीकार करने के लिए ऊपर हरे बटन पर क्लिक करें।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Today's Milled KG */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-stone-400">आज की कुल पिसाई</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.todayTotalKg}
            </span>
            <span className="text-xs font-semibold text-amber-400">किलो (KG)</span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500">ताजा पत्थर पिसाई आटा</p>
        </div>

        {/* Card 2: Live Pending / In Grinding */}
        <div
          onClick={onOpenOrdersTab}
          className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-stone-400 group-hover:text-amber-300">
              चालू आर्डर (Active)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.pendingOrdersCount + metrics.activeGrindingCount}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              {metrics.pendingOrdersCount > 0 ? `${metrics.pendingOrdersCount} नए आर्डर!` : "पिसाई जारी"}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500">
            {metrics.activeGrindingCount} चक्की में • {metrics.readyToDispatchCount} तैयार
          </p>
        </div>

        {/* Card 3: Today's Revenue */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-stone-400">आज की कुल बिक्री</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-amber-400">₹</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.todayGrossRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500">
            {metrics.todayOrdersCount} आर्डर पूरे हुए
          </p>
        </div>

        {/* Card 4: Prep Time / Efficiency */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-stone-400">औसत पिसाई समय</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.averagePrepMinutes}
            </span>
            <span className="text-xs font-semibold text-sky-400">मिनट</span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500">आर्डर से डिलीवरी हैंडओवर तक</p>
        </div>
      </div>
    </div>
  );
}
