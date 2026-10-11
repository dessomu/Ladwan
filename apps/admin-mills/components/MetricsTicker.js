"use client";

import {
  Wheat,
  ShoppingBag,
  IndianRupee,
  Clock,
  AlertCircle,
  Flame,
} from "lucide-react";

export default function MetricsTicker({
  metrics,
  mill,
  onOpenOrdersTab,
  lang = "hi",
  t,
}) {
  const getLocalizedReason = (reason) => {
    if (!reason) return lang === "en" ? "Closed" : "बंद";
    if (lang === "en") {
      if (reason.includes("बिजली") || reason.includes("Power")) return t.statusPowerCut;
      if (reason.includes("स्टॉक") || reason.includes("Stock")) return t.statusStockOut;
      if (reason.includes("सर्विस") || reason.includes("Maintenance")) return t.statusMaintenance;
      if (reason.includes("लंच") || reason.includes("Lunch")) return t.statusLunchBreak;
      if (reason.includes("समाप्त") || reason.includes("Day")) return t.statusDayEnd;
      if (reason.includes("चालू") || reason.includes("Running")) return t.statusRunning;
    }
    return reason;
  };

  return (
    <div className="space-y-3">
      {/* Closed store alert reminder */}
      {!mill.isOpen && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-3.5 flex items-center justify-between text-red-200 text-xs shadow-lg shadow-red-950/40">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-semibold text-white">{t.closedAlertTitle}</p>
              <p className="text-red-300/80 text-[11px]">
                {getLocalizedReason(mill.statusReason)}. {t.closedAlertDesc}
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
            <span className="text-[11px] sm:text-xs font-medium text-stone-400">{t.metricTotalMilled}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.todayTotalKg}
            </span>
            <span className="text-xs font-semibold text-amber-400">{t.metricKg}</span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500">{t.metricColdStone}</p>
        </div>

        {/* Card 2: Live Pending / In Grinding */}
        <div
          onClick={onOpenOrdersTab}
          className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-stone-400 group-hover:text-amber-300">
              {t.metricActiveOrders}
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
              {metrics.pendingOrdersCount > 0 ? `${metrics.pendingOrdersCount} ${t.metricNewOrders}` : t.metricInGrinding}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500">
            {metrics.activeGrindingCount} {t.metricInGrinding} • {metrics.readyToDispatchCount} {t.metricReady}
          </p>
        </div>

        {/* Card 3: Today's Revenue */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-stone-400">{t.metricTotalSales}</span>
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
            {metrics.todayOrdersCount} {t.metricOrdersCompleted}
          </p>
        </div>

        {/* Card 4: Prep Time / Efficiency */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-stone-400">{t.metricAvgTime}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.averagePrepMinutes}
            </span>
            <span className="text-xs font-semibold text-sky-400">{t.metricMinutes}</span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500">{t.metricHandoverTime}</p>
        </div>
      </div>
    </div>
  );
}
