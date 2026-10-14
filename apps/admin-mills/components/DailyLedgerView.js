"use client";

import {
  Calendar,
  CreditCard,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { formatCustomerName, formatOrderItemName } from "../lib/langUtils";

export default function DailyLedgerView({
  metrics,
  orders,
  products = [],
  lang = "hi",
  t,
}) {
  const completedOrders = orders.filter((o) => o.status === "delivered");
  const onlineOrders = orders.filter((o) => o.isPaid);
  const codOrders = orders.filter((o) => !o.isPaid && o.status !== "cancelled");

  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const codRevenue = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const subtitle = (t.ledgerSubtitle || "")
    .replace("{kg}", metrics.todayTotalKg)
    .replace("{orders}", metrics.todayOrdersCount);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>{t.ledgerTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            ₹{metrics.todayGrossRevenue.toLocaleString("en-IN")}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Payout & Settlement Box */}
        <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800 self-stretch sm:self-auto">
          <div>
            <span className="text-[10px] text-stone-500 font-bold block uppercase">
              {t.settlementNotice}
            </span>
            <span className="text-sm font-bold text-emerald-400">
              ₹5,120 {t.settledBadge}
            </span>
            <span className="text-[10px] text-stone-400 ml-1 font-mono">
              (₹1,720 {t.nextDayNotice})
            </span>
          </div>
        </div>
      </div>

      {/* Payment Mode Breakup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-400 font-medium">{t.onlineUpi}</span>
              <p className="text-lg font-bold text-white">₹{onlineRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            {onlineOrders.length}
          </span>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-400 font-medium">{t.cashOnDelivery}</span>
              <p className="text-lg font-bold text-white">₹{codRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            {codOrders.length}
          </span>
        </div>
      </div>

      {/* Completed Orders List */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.deliveredHistory}</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            {completedOrders.length} {t.ordersCount}
          </span>
        </div>

        <div className="divide-y divide-stone-800/60">
          {completedOrders.map((ord) => (
            <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300">#{ord.tokenNumber}</span>
                  <span className="font-semibold text-white">
                    {formatCustomerName(ord.customer, lang)}
                  </span>
                </div>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  {ord.items
                    .map((i) => `${formatOrderItemName(i, lang, products)} (${i.weight})`)
                    .join(", ")}
                </p>
              </div>

              <div className="text-right">
                <span className="font-bold text-white block">₹{ord.totalAmount}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {t.deliveredStatus || (lang === "en" ? "Delivered" : "पूरा हुआ")}
                </span>
              </div>
            </div>
          ))}

          {completedOrders.length === 0 && (
            <p className="text-xs text-stone-500 py-4 text-center">
              {t.noDeliveredToday}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
