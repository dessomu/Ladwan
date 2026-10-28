// apps/delivery-boy/components/HistoryView.js
// Delivery history — completed and cancelled orders with earnings summary
"use client";

import { CheckCircle2, Clock, Package, MapPin, Banknote, CalendarDays, TrendingUp } from "lucide-react";

function HistoryCard({ order, lang }) {
  const customer = order.customer || {};
  const deliveredAt = order.deliveredAt || order.updatedAt;
  const timeStr = deliveredAt
    ? new Date(deliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";
  const dateStr = deliveredAt
    ? new Date(deliveredAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
        day: "numeric",
        month: "short",
      })
    : "—";
  const isCancelled = order.status === "cancelled";

  return (
    <div className={`bg-slate-900/70 rounded-2xl border ${isCancelled ? "border-red-900/30" : "border-slate-800/50"} overflow-hidden`}>
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-extrabold font-mono ${
              isCancelled
                ? "bg-red-900/30 border border-red-800/40 text-red-400"
                : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            }`}
          >
            {isCancelled ? "✕" : "✓"}
          </div>
          <div>
            <p className="text-[11px] font-mono font-bold text-white">{order.orderNumber || order.id?.slice(-8)}</p>
            <p className="text-[10px] text-slate-500">{dateStr} · {timeStr}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold text-white">₹{order.totalAmount?.toLocaleString("en-IN") || "–"}</p>
          <p className={`text-[10px] font-bold ${isCancelled ? "text-red-400" : "text-emerald-400"}`} suppressHydrationWarning>
            {isCancelled
              ? (lang === "hi" ? "रद्द" : "Cancelled")
              : (lang === "hi" ? `+₹${order.deliveryFee || 25} कमाई` : `+₹${order.deliveryFee || 25} earned`)}
          </p>
        </div>
      </div>

      <div className="px-3.5 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Package className="w-3 h-3 shrink-0" />
          <span className="truncate" suppressHydrationWarning>
            {(order.items || []).map((i) =>
              lang === "hi" ? i.name : (i.englishName || i.name)
            ).join(", ") || "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate" suppressHydrationWarning>
            {lang === "hi"
              ? (customer.name || "ग्राहक")
              : (customer.englishName || customer.name || "Customer")}
            {customer.distanceKm ? ` · ${customer.distanceKm}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HistoryView({ store }) {
  const { lang, orders, earningsToday, completedToday } = store;

  const historyOrders = [...(orders || [])]
    .filter((o) => o.status === "delivered" || o.status === "cancelled")
    .sort((a, b) => new Date(b.deliveredAt || b.updatedAt || 0) - new Date(a.deliveredAt || a.updatedAt || 0));

  // Group by date
  const grouped = {};
  historyOrders.forEach((o) => {
    const d = new Date(o.deliveredAt || o.updatedAt || 0);
    const key = d.toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(o);
  });

  const todayKey = new Date().toDateString();

  return (
    <div className="space-y-4 pt-2">
      {/* Today summary */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-2xl border border-slate-800/60 p-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3" suppressHydrationWarning>
          {lang === "hi" ? "आज का सारांश" : "Today's Summary"}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-white">{completedToday.length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5" suppressHydrationWarning>
              {lang === "hi" ? "डिलीवरी" : "Deliveries"}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-emerald-400">₹{earningsToday}</p>
            <p className="text-[10px] text-slate-500 mt-0.5" suppressHydrationWarning>
              {lang === "hi" ? "कमाई" : "Earnings"}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-blue-400">
              {completedToday.length > 0 ? Math.round(earningsToday / completedToday.length) : 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5" suppressHydrationWarning>
              {lang === "hi" ? "औसत" : "Avg/order"}
            </p>
          </div>
        </div>
      </div>

      {/* History list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/40">
          <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500" suppressHydrationWarning>
            {lang === "hi" ? "कोई डिलीवरी इतिहास नहीं" : "No delivery history yet"}
          </p>
          <p className="text-xs text-slate-700 mt-1" suppressHydrationWarning>
            {lang === "hi" ? "पहली डिलीवरी पूर्ण करने पर यहाँ दिखेगा।" : "Complete your first delivery to see history here."}
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateKey, dayOrders]) => {
          const dayLabel =
            dateKey === todayKey
              ? (lang === "hi" ? "आज" : "Today")
              : new Date(dateKey).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
          const dayEarnings = dayOrders.reduce((sum, o) => sum + (o.status === "delivered" ? (o.deliveryFee || 25) : 0), 0);

          return (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-xs font-bold text-slate-400" suppressHydrationWarning>{dayLabel}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">+₹{dayEarnings}</span>
              </div>
              {dayOrders.map((order) => (
                <HistoryCard key={order.id} order={order} lang={lang} />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
