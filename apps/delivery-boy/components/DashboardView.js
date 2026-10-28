// apps/delivery-boy/components/DashboardView.js
// Main delivery dashboard — metrics strip + order pool queue
"use client";

import { useState } from "react";
import {
  Package,
  MapPin,
  Phone,
  Banknote,
  CheckCircle2,
  Bike,
  TrendingUp,
  Zap,
  AlertCircle,
  Navigation,
} from "lucide-react";

function MetricCard({ icon: Icon, value, label, color }) {
  return (
    <div className={`flex-1 bg-slate-900/80 rounded-2xl border border-slate-800/60 p-3 flex flex-col gap-1 min-w-0`}>
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <p className="text-lg font-black text-white leading-none">{value}</p>
      <p className="text-[10px] text-slate-500 font-medium leading-tight">{label}</p>
    </div>
  );
}

function OrderPoolCard({ order, lang, onAccept, isAccepting }) {
  const customer = order.customer || {};
  const firstItem = (order.items || [])[0];
  const paymentMethod = order.paymentMethod || "cod";

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-950/30 overflow-hidden animate-slide-up animate-glow-ring">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-slate-900 border-b border-slate-800/60 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-extrabold text-sm font-mono">
            #{order.tokenNumber || "–"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">{order.orderNumber || order.id?.slice(-8)}</span>
              <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                {lang === "hi" ? "डिलीवरी हेतु" : "TO DELIVER"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === "hi"
                ? (customer.name || "ग्राहक")
                : (customer.englishName || customer.name || "Customer")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-extrabold text-white">₹{order.totalAmount?.toLocaleString("en-IN")}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            paymentMethod === "upi"
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-amber-400 bg-amber-500/10"
          }`}>
            {paymentMethod === "upi" ? (lang === "hi" ? "UPI भुगतान" : "UPI Paid") : (lang === "hi" ? "COD नकद लें" : "COD — Collect")}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Items */}
        {firstItem && (
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/50 rounded-xl px-3 py-2 border border-slate-800/40">
            <Package className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-semibold truncate">
              {lang === "hi" ? firstItem.name : (firstItem.englishName || firstItem.name)}
            </span>
            <span className="shrink-0 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
              {firstItem.weight || firstItem.weightKey}
            </span>
            {order.items?.length > 1 && (
              <span className="shrink-0 text-slate-500 text-[10px]">+{order.items.length - 1} {lang === "hi" ? "और" : "more"}</span>
            )}
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-200 leading-snug line-clamp-2">
              {lang === "hi"
                ? (customer.address || order.deliveryAddress?.address || "पता उपलब्ध नहीं")
                : (customer.englishAddress || customer.address || order.deliveryAddress?.address || "Address unavailable")}
            </p>
            {(customer.distanceKm || order.distance) && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                📍 {customer.distanceKm || order.distance}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <a
          href={`tel:${customer.phone}`}
          className="flex items-center gap-2 text-xs text-slate-300 hover:text-blue-300 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-medium">{customer.phone}</span>
        </a>

        {/* COD reminder */}
        {paymentMethod === "cod" && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
            <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-300 font-semibold">
              {lang === "hi"
                ? `ग्राहक से ₹${order.totalAmount} नकद लें`
                : `Collect ₹${order.totalAmount} cash from customer`}
            </p>
          </div>
        )}

        {/* Accept button */}
        <button
          onClick={() => onAccept(order.id)}
          disabled={isAccepting}
          className="w-full mt-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-900/40 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isAccepting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{lang === "hi" ? "स्वीकार हो रहा है…" : "Accepting…"}</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>{lang === "hi" ? "डिलीवरी स्वीकार करें" : "Accept & Start Delivery"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DashboardView({ store, onStartDelivery }) {
  const {
    lang,
    agentProfile,
    pendingDeliveries,
    completedToday,
    earningsToday,
    orders,
    acceptOrder,
    activeOrder,
  } = store;

  const [acceptingId, setAcceptingId] = useState(null);
  const isOnline = agentProfile?.isOnline !== false;

  const handleAccept = async (orderId) => {
    setAcceptingId(orderId);
    try {
      await acceptOrder(orderId);
      onStartDelivery();
    } catch (e) {
      console.error("[DeliveryApp] acceptOrder failed:", e);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-4 pt-2">

      {/* Metrics Row */}
      <div className="flex gap-2.5">
        <MetricCard
          icon={Bike}
          value={pendingDeliveries.length}
          label={lang === "hi" ? "प्रतीक्षित" : "Pending"}
          color="bg-blue-500/20 text-blue-400"
        />
        <MetricCard
          icon={CheckCircle2}
          value={completedToday.length}
          label={lang === "hi" ? "आज पूर्ण" : "Done Today"}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <MetricCard
          icon={TrendingUp}
          value={`₹${earningsToday}`}
          label={lang === "hi" ? "आज की कमाई" : "Today's Earnings"}
          color="bg-amber-500/20 text-amber-400"
        />
      </div>

      {/* Online/Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-sm text-slate-400" suppressHydrationWarning>
            {lang === "hi"
              ? "आप ऑफलाइन हैं। ऑर्डर प्राप्त करने के लिए ऑनलाइन हों।"
              : "You are offline. Go online to receive delivery orders."}
          </p>
        </div>
      )}

      {/* Active order quick resume banner */}
      {activeOrder && activeOrder.status === "out_for_delivery" && (
        <button
          onClick={onStartDelivery}
          className="w-full bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/60 border border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-glow-ring active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-xl border border-blue-500/30 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-blue-300" suppressHydrationWarning>
                {lang === "hi" ? "🔵 डिलीवरी जारी है" : "🔵 Delivery In Progress"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeOrder.orderNumber || activeOrder.id?.slice(-8)} • {activeOrder.customer?.name || "Customer"}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-400" suppressHydrationWarning>
            {lang === "hi" ? "जारी रखें →" : "Resume →"}
          </span>
        </button>
      )}

      {/* Pending Delivery Queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-200 flex items-center gap-2" suppressHydrationWarning>
            <Zap className="w-4 h-4 text-blue-400" />
            {lang === "hi" ? "डिलीवरी पूल" : "Delivery Pool"}
          </h2>
          {pendingDeliveries.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {pendingDeliveries.length} {lang === "hi" ? "ऑर्डर" : "orders"}
            </span>
          )}
        </div>

        {pendingDeliveries.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/40">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-3">
              <Bike className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-400" suppressHydrationWarning>
              {isOnline
                ? (lang === "hi" ? "अभी कोई डिलीवरी नहीं" : "No deliveries right now")
                : (lang === "hi" ? "ऑफलाइन मोड में ऑर्डर नहीं" : "Go online to see orders")}
            </p>
            <p className="text-xs text-slate-600 mt-1" suppressHydrationWarning>
              {lang === "hi"
                ? "जैसे ही मिल मालिक ऑर्डर डिस्पैच करेंगे, यहाँ दिखेगा।"
                : "Orders appear here once a mill owner dispatches them."}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {pendingDeliveries.map((order) => (
              <OrderPoolCard
                key={order.id}
                order={order}
                lang={lang}
                onAccept={handleAccept}
                isAccepting={acceptingId === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
