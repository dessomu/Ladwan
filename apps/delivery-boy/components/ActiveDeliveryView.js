// apps/delivery-boy/components/ActiveDeliveryView.js
// Live active delivery screen — shows full order, navigation CTA, and delivered confirmation
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Phone,
  Package,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  Navigation,
  Clock,
  User,
  MessageSquare,
  AlertTriangle,
  Star,
  Wheat,
} from "lucide-react";
import { useLiveLocationPublisher } from "../lib/useLiveLocationPublisher";

const LiveDeliveryMap = dynamic(() => import("./LiveDeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl bg-stone-900 border border-slate-800 flex items-center justify-center text-xs text-slate-400 animate-pulse">
      लाइव नेविगेशन मैप लोड हो रहा है (Loading Live Map)...
    </div>
  ),
});

function StatusStep({ step, label, isActive, isDone }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 transition-all ${
          isDone
            ? "bg-emerald-500 border-emerald-400 text-white"
            : isActive
            ? "bg-blue-500 border-blue-400 text-white scale-110 shadow-lg shadow-blue-900/40"
            : "bg-slate-800 border-slate-700 text-slate-500"
        }`}
      >
        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
      </div>
      <p
        className={`text-[9px] font-semibold text-center leading-tight max-w-[52px] ${
          isActive ? "text-blue-400" : isDone ? "text-emerald-400" : "text-slate-600"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export default function ActiveDeliveryView({ store, onDelivered, onBack }) {
  const { lang, activeOrder, markDelivered, agentProfile } = store;
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");

  // Live GPS Tracking & Broadcasting Engine
  const publisher = useLiveLocationPublisher({
    orderId: activeOrder?.id,
    activeOrder,
    isFirebase: store.isFirebase,
    enabled: Boolean(activeOrder && !isDelivered),
  });

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
          <Navigation className="w-8 h-8 text-slate-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-400" suppressHydrationWarning>
            {lang === "hi" ? "कोई सक्रिय डिलीवरी नहीं" : "No active delivery"}
          </p>
          <p className="text-xs text-slate-600 mt-1" suppressHydrationWarning>
            {lang === "hi" ? "डैशबोर्ड से ऑर्डर स्वीकार करें।" : "Accept an order from the dashboard."}
          </p>
        </div>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-700 active:scale-95 transition-all"
        >
          {lang === "hi" ? "← डैशबोर्ड" : "← Dashboard"}
        </button>
      </div>
    );
  }

  const customer = activeOrder.customer || {};
  const paymentMethod = activeOrder.paymentMethod || "cod";
  const isUpiPaid = paymentMethod === "upi" && (activeOrder.paymentStatus === "paid" || activeOrder.isPaid);
  const isCod = paymentMethod === "cod";
  const totalAmount = activeOrder.totalAmount || 0;

  // Build Google Maps directions URL
  const lat = activeOrder.deliveryAddress?.lat || customer.lat;
  const lng = activeOrder.deliveryAddress?.lng || customer.lng;
  const mapsQuery = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        customer.address || activeOrder.deliveryAddress?.address || "delivery location"
      )}`;

  const handleMarkDelivered = async () => {
    setIsMarkingDelivered(true);
    try {
      await markDelivered(activeOrder.id, {
        deliveryNote: deliveryNote.trim() || null,
        deliveredByName: agentProfile?.name,
      });
      setIsDelivered(true);
      setTimeout(() => {
        onDelivered();
      }, 2800);
    } catch (e) {
      console.error("[ActiveDelivery] markDelivered error:", e);
    } finally {
      setIsMarkingDelivered(false);
      setShowConfirmModal(false);
    }
  };

  // Delivered success screen
  if (isDelivered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 animate-slide-up">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600/30 to-emerald-900/30 border-2 border-emerald-500/40 flex items-center justify-center shadow-2xl shadow-emerald-900/40">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white" suppressHydrationWarning>
            {lang === "hi" ? "🎉 डिलीवरी पूर्ण!" : "🎉 Delivered!"}
          </h2>
          <p className="text-sm text-slate-400" suppressHydrationWarning>
            {lang === "hi"
              ? `${customer.name || "ग्राहक"} को सफलतापूर्वक डिलीवर किया।`
              : `Successfully delivered to ${customer.englishName || customer.name || "the customer"}.`}
          </p>
          {isCod && (
            <p className="text-sm font-bold text-amber-400" suppressHydrationWarning>
              {lang === "hi" ? `₹${totalAmount} नकद प्राप्त करें` : `Collect ₹${totalAmount} cash`}
            </p>
          )}
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
          <p className="text-xs text-emerald-400 font-medium" suppressHydrationWarning>
            {lang === "hi" ? "डैशबोर्ड पर वापस जा रहे हैं…" : "Returning to dashboard…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2" suppressHydrationWarning>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-blink" />
            {lang === "hi" ? "सक्रिय डिलीवरी" : "Active Delivery"}
          </h2>
          <p className="text-[11px] text-slate-500 font-mono">{activeOrder.orderNumber || activeOrder.id?.slice(-12)}</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 p-3.5">
        <div className="flex items-center justify-between">
          {[
            { step: 1, labelHi: "स्वीकृत", labelEn: "Accepted" },
            { step: 2, labelHi: "पिक अप", labelEn: "Picked Up" },
            { step: 3, labelHi: "रास्ते में", labelEn: "En Route" },
            { step: 4, labelHi: "डिलीवर", labelEn: "Delivered" },
          ].map(({ step, labelHi, labelEn }, idx) => (
            <div key={step} className="flex items-center flex-1">
              <StatusStep
                step={step}
                label={lang === "hi" ? labelHi : labelEn}
                isActive={step === 3}
                isDone={step < 3}
              />
              {idx < 3 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full ${step < 3 ? "bg-emerald-500/60" : step === 3 ? "bg-blue-500/40" : "bg-slate-800"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Dark-Mode Live Tracking Map */}
      <LiveDeliveryMap
        riderCoords={publisher.riderCoords}
        heading={publisher.heading}
        speedKmh={publisher.speedKmh}
        millCoords={publisher.millCoords}
        customerCoords={publisher.customerCoords}
        waypoints={publisher.waypoints}
        formattedDistance={publisher.formattedDistance}
        etaText={publisher.etaText}
        isSimulating={publisher.isSimulating}
        onToggleSimulating={() => publisher.setIsSimulating(!publisher.isSimulating)}
        onStepForward={publisher.stepForward}
        onReset={publisher.resetToMill}
        lang={lang}
      />

      {/* Navigate CTA */}
      <a
        href={mapsQuery}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 text-blue-400 font-bold text-xs active:scale-[0.98] transition-all"
      >
        <Navigation className="w-4 h-4 text-blue-400" />
        <span suppressHydrationWarning>{lang === "hi" ? "बाहरी Google Maps में खोलें" : "Open in External Google Maps"}</span>
      </a>

      {/* Customer card */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 p-3.5 space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" suppressHydrationWarning>
          {lang === "hi" ? "ग्राहक विवरण" : "Customer Details"}
        </p>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white" suppressHydrationWarning>
              {lang === "hi" ? customer.name : (customer.englishName || customer.name)}
            </p>
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-0.5"
            >
              <Phone className="w-3 h-3" />
              <span>{customer.phone}</span>
            </a>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-slate-950/50 rounded-xl px-3 py-2.5 border border-slate-800/40">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs text-slate-200 font-medium leading-relaxed" suppressHydrationWarning>
              {lang === "hi"
                ? (customer.address || activeOrder.deliveryAddress?.address || "पता उपलब्ध नहीं")
                : (customer.englishAddress || customer.address || activeOrder.deliveryAddress?.address || "Address unavailable")}
            </p>
            {(activeOrder.deliveryAddress?.landmark || customer.landmark) && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                🏷️ {activeOrder.deliveryAddress?.landmark || customer.landmark}
              </p>
            )}
            {customer.distanceKm && (
              <p className="text-[10px] text-slate-500 mt-0.5">📍 {customer.distanceKm}</p>
            )}
          </div>
        </div>

        {activeOrder.customer?.instructions && (
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <p suppressHydrationWarning>
              {lang === "hi"
                ? activeOrder.customer.instructions
                : activeOrder.customer.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Items summary */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 p-3.5 space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" suppressHydrationWarning>
          {lang === "hi" ? "ऑर्डर आइटम" : "Order Items"}
        </p>
        {(activeOrder.items || []).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <Wheat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-200 truncate" suppressHydrationWarning>
                {lang === "hi" ? item.name : (item.englishName || item.name)}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold shrink-0">
                {item.weight || item.weightKey}
              </span>
            </div>
            <span className="font-bold text-white shrink-0 ml-2">₹{item.totalPrice || item.unitPrice}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1 text-sm">
          <span className="text-slate-400" suppressHydrationWarning>{lang === "hi" ? "कुल राशि" : "Total"}</span>
          <span className="font-extrabold text-white">₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Payment status */}
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
        isUpiPaid
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-amber-500/10 border-amber-500/30"
      }`}>
        {isUpiPaid ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300 font-semibold" suppressHydrationWarning>
              {lang === "hi" ? "UPI भुगतान सत्यापित — कोई नकद नहीं लेना" : "UPI payment verified — no cash to collect"}
            </p>
          </>
        ) : isCod ? (
          <>
            <Banknote className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm text-amber-300 font-extrabold" suppressHydrationWarning>
                {lang === "hi" ? `₹${totalAmount} नकद लें (COD)` : `Collect ₹${totalAmount} cash (COD)`}
              </p>
              <p className="text-[11px] text-amber-500" suppressHydrationWarning>
                {lang === "hi" ? "ग्राहक को नकद या UPI से भुगतान करने दें" : "Accept cash or let customer pay via UPI"}
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300" suppressHydrationWarning>
              {lang === "hi" ? "UPI भुगतान सत्यापन प्रतीक्षित" : "UPI payment verification pending"}
            </p>
          </>
        )}
      </div>

      {/* Delivery note input */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/40 p-3.5">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2" suppressHydrationWarning>
          {lang === "hi" ? "डिलीवरी नोट (वैकल्पिक)" : "Delivery Note (Optional)"}
        </label>
        <textarea
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          rows={2}
          className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none"
          placeholder={lang === "hi" ? "कोई नोट जोड़ें जैसे — 'दरवाजे पर छोड़ा'" : "e.g. Left at door, handed to security"}
        />
      </div>

      {/* Mark Delivered CTA */}
      <button
        onClick={() => setShowConfirmModal(true)}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-emerald-900/50 active:scale-[0.98] transition-all"
      >
        <CheckCircle2 className="w-5 h-5" />
        <span suppressHydrationWarning>{lang === "hi" ? "✓ डिलीवरी पूर्ण करें" : "✓ Mark as Delivered"}</span>
      </button>

      {/* ETA reminder */}
      {activeOrder.estimatedDeliveryMinutes && (
        <div className="flex items-center gap-2 text-center justify-center text-xs text-slate-600">
          <Clock className="w-3 h-3" />
          <span suppressHydrationWarning>
            {lang === "hi"
              ? `अनुमानित डिलीवरी: ${activeOrder.estimatedDeliveryMinutes}`
              : `ETA: ${activeOrder.estimatedDeliveryMinutes}`}
          </span>
        </div>
      )}

      {/* Confirm Delivered Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white" suppressHydrationWarning>
                  {lang === "hi" ? "डिलीवरी पूर्ण हो गई?" : "Confirm Delivery?"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5" suppressHydrationWarning>
                  {lang === "hi" ? "यह क्रिया पूर्ववत नहीं होगी" : "This action cannot be undone"}
                </p>
              </div>
            </div>

            {isCod && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300 font-bold" suppressHydrationWarning>
                  {lang === "hi"
                    ? `क्या आपने ₹${totalAmount} नकद ले लिया?`
                    : `Have you collected ₹${totalAmount} cash?`}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-700 active:scale-95 transition-all"
                suppressHydrationWarning
              >
                {lang === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={isMarkingDelivered}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all"
              >
                {isMarkingDelivered ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span suppressHydrationWarning>{lang === "hi" ? "हाँ, पूर्ण!" : "Yes, Done!"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
