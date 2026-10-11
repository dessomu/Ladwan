"use client";

import { useState } from "react";
import {
  Bell,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  Flame,
  Package,
  Bike,
  Sparkles,
  ArrowRight,
  FileText,
} from "lucide-react";

export default function LiveOrdersView({
  orders,
  onUpdateStatus,
  onSimulateOrder,
  lang = "hi",
  t,
}) {
  const [statusFilter, setStatusFilter] = useState("active");

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "active") {
      return ["pending", "grinding", "packed"].includes(order.status);
    }
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          label: t.badgeNew,
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse",
          icon: Bell,
        };
      case "grinding":
        return {
          label: t.badgeGrinding,
          bg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          icon: Flame,
        };
      case "packed":
        return {
          label: t.badgePacked,
          bg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          icon: Package,
        };
      case "out_for_delivery":
        return {
          label: t.badgeOutForDelivery,
          bg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
          icon: Bike,
        };
      case "delivered":
        return {
          label: t.badgeDelivered,
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2,
        };
      default:
        return { label: status, bg: "bg-stone-800 text-stone-300", icon: Clock };
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs & Test Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "active", label: t.filterActive, count: orders.filter((o) => ["pending", "grinding", "packed"].includes(o.status)).length },
            { id: "pending", label: t.filterNew, count: orders.filter((o) => o.status === "pending").length },
            { id: "grinding", label: t.filterGrinding, count: orders.filter((o) => o.status === "grinding").length },
            { id: "packed", label: t.filterPacked, count: orders.filter((o) => o.status === "packed").length },
            { id: "delivered", label: t.filterDelivered, count: orders.filter((o) => o.status === "delivered").length },
            { id: "all", label: t.filterAll, count: orders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-600/20 font-bold"
                  : "bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === tab.id
                      ? "bg-stone-950 text-amber-400"
                      : "bg-stone-800 text-stone-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onSimulateOrder}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-amber-900/30 self-stretch sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.simulateOrder}</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3.5">
        {filteredOrders.map((order) => {
          const badge = getStatusBadge(order.status);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={order.id}
              className={`bg-stone-900/90 rounded-2xl border transition-all overflow-hidden ${
                order.status === "pending"
                  ? "border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30"
                  : "border-stone-800 hover:border-stone-700 shadow-sm"
              }`}
            >
              {/* Order Header: Token, Status, Time */}
              <div className="p-3.5 sm:p-4 bg-stone-950/60 border-b border-stone-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-extrabold text-sm font-mono">
                    #{order.tokenNumber || "01"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {order.id}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-300">
                      {order.customer.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>
              </div>

              {/* Order Details Body */}
              <div className="p-3.5 sm:p-4 space-y-3">
                {/* Items List */}
                <div className="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800/60">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {t.itemsOrdered}
                  </span>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs sm:text-sm text-stone-200 py-1 border-b border-stone-800/40 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-stone-800 text-stone-300 flex items-center justify-center text-[10px] font-bold">
                          {item.quantity}x
                        </span>
                        <span className="font-semibold text-white">
                          {lang === "en" && item.englishName ? item.englishName : item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[11px] font-bold border border-amber-500/20">
                          {item.weight}
                        </span>
                        {item.grind && (
                          <span className="text-[11px] text-stone-400">
                            ({item.grind})
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-white">
                        ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Customer Address & Special Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                  <div className="flex items-start gap-2 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/40">
                    <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-stone-300 font-medium leading-relaxed">
                        {order.customer.address}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {t.distanceLabel || (lang === "en" ? "Distance:" : "दूरी:")}{" "}
                        {order.customer.distanceKm || "2 km"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/40">
                    <FileText className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block">
                        {t.customerNoteLabel}
                      </span>
                      <p className="text-stone-200 italic text-[11px] mt-0.5">
                        "{order.specialInstructions || t.specialNotesPlaceholder || (lang === "en" ? "Fresh ground flour, please pack carefully." : "ताज़ा पिसा हुआ आटा, कृपया ध्यान से पैक करें।")}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment & Total Amount Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">{t.paymentLabel}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                        order.isPaid
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {order.isPaid
                        ? t.upiPaidLabel || "Online UPI (Paid)"
                        : t.codLabel || "Cash on Delivery"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-stone-400 text-xs">{t.totalAmountLabel}</span>
                    <span className="text-base sm:text-lg font-extrabold text-amber-400">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* WORKFLOW ACTION BUTTONS */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, "cancelled")}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 border border-red-900/40"
                      >
                        {t.btnDecline}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, "grinding")}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 active:scale-95 transition-all"
                      >
                        <span>{t.btnAcceptGrind}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {order.status === "grinding" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, "packed")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 active:scale-95 transition-all"
                    >
                      <Package className="w-4 h-4" />
                      <span>{t.btnMarkPacked}</span>
                    </button>
                  )}

                  {order.status === "packed" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, "out_for_delivery")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-900/30 active:scale-95 transition-all"
                    >
                      <Bike className="w-4 h-4" />
                      <span>{t.btnDispatch}</span>
                    </button>
                  )}

                  {order.status === "out_for_delivery" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, "delivered")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.btnConfirmDelivered}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-stone-900/60 rounded-2xl border border-stone-800 p-6">
            <CheckCircle2 className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-300">{t.noOrdersQueue}</h3>
            <p className="text-xs text-stone-500 mt-1">{t.noOrdersDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
