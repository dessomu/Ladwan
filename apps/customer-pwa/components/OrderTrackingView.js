// apps/customer-pwa/components/OrderTrackingView.js - Real-Time 6-Stage Tracking & Order Pipeline
"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Phone,
  Store,
  Truck,
  RotateCw,
  AlertTriangle,
  Sparkles,
  PackageCheck,
  ChevronRight,
  ShieldCheck,
  Ban,
  Star,
} from "lucide-react";
import { ORDER_TRACKING_STEPS } from "@ladwan/firebase/schemas";

export default function OrderTrackingView({
  order,
  onClose,
  onCancelOrder,
  onAdvanceStatus,
  onOpenRating,
  lang,
}) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelError, setCancelError] = useState("");

  if (!order) return null;

  const currentStatus = order.orderStatus || order.status || "placed";
  const isCancelled = currentStatus === "cancelled";
  const isDelivered = currentStatus === "delivered";

  // Find step index in 6-stage pipeline
  const currentStepIndex = ORDER_TRACKING_STEPS.findIndex(
    (s) => s.key === currentStatus
  );
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  // Cancellation rule: only allowed in placed or accepted stages
  const canCancel =
    !isCancelled && !isDelivered && (currentStatus === "placed" || currentStatus === "accepted");

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      await onCancelOrder(order.id, cancelReason || "Customer cancelled before grinding started");
      setShowCancelPrompt(false);
    } catch (err) {
      setCancelError(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-100">
                  {lang === "hi" ? "लाइव ऑर्डर ट्रैकिंग" : "Live Order Pipeline"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 font-mono text-[10px] font-bold">
                  #{order.orderNumber || order.id?.substring(0, 8)}
                </span>
              </div>
              <div className="text-[11px] text-stone-400">
                {order.millName} • कुल देय: ₹{order.totalAmount}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Cancelled Banner */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-900/50 text-red-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-300">
                <Ban className="w-4 h-4" />
                <span>यह ऑर्डर रद्द कर दिया गया है (Order Cancelled)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                कारण: {order.cancellationReason || "Customer cancelled"}
              </p>
            </div>
          )}

          {/* Delivered Banner & Feedback Prompt */}
          {isDelivered && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-900/50 text-emerald-200 text-xs space-y-2">
              <div className="font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {lang === "hi"
                      ? "ताज़ा आटा सफलतापूर्वक डिलीवर हो गया!"
                      : "Fresh Atta Delivered Successfully!"}
                  </span>
                </span>
                <span className="text-[11px] text-emerald-400 font-normal">
                  Enjoy hot rotis
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                {lang === "hi"
                  ? "कृपया चक्की मालिक और ताजे आटे की गुणवत्ता के लिए अपनी रेटिंग दें।"
                  : "Please leave your rating and review for the fresh stone-ground atta quality."}
              </p>
              <button
                onClick={onOpenRating}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-stone-950" />
                <span>
                  {order.isReviewed
                    ? lang === "hi"
                      ? "समीक्षा दी जा चुकी है ★ (View/Update)"
                      : "Reviewed ★"
                    : lang === "hi"
                    ? "आटे की गुणवत्ता रेट करें (Rate Quality)"
                    : "Rate Quality & Taste"}
                </span>
              </button>
            </div>
          )}

          {/* Real-Time Linear 6-Stage Progression Stepper */}
          {!isCancelled && (
            <div className="p-4 rounded-3xl bg-stone-950/80 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px]">
                  {lang === "hi" ? "लाइव पिसाई व डिलीवरी स्थिति" : "Milling & Delivery Progression"}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ETA: {order.estimatedDeliveryMinutes || "30-40 min"}</span>
                </span>
              </div>

              {/* Linear Stepper */}
              <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
                {ORDER_TRACKING_STEPS.map((step, idx) => {
                  const isCompleted = idx < activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <div
                      key={step.key}
                      className={`relative flex items-start gap-3 pl-1 transition-all ${
                        isCurrent
                          ? "opacity-100 scale-[1.01]"
                          : isCompleted
                          ? "opacity-90"
                          : "opacity-40"
                      }`}
                    >
                      {/* Step Indicator Dot */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                          isCompleted
                            ? "bg-emerald-500 text-stone-950"
                            : isCurrent
                            ? "bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 animate-pulse"
                            : "bg-stone-800 text-stone-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        ) : isCurrent && step.key === "grinding" ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Step Text */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs font-bold leading-tight ${
                              isCurrent
                                ? "text-amber-400"
                                : isCompleted
                                ? "text-stone-200"
                                : "text-stone-500"
                            }`}
                          >
                            {lang === "hi" ? step.label : step.englishLabel}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                लाइव / Active
                              </span>
                            )}
                          </h4>
                        </div>
                        <p className="text-[10px] text-stone-400 pt-0.5">
                          {step.key === "placed" && "ग्राहक द्वारा ऑर्डर प्राप्त हुआ"}
                          {step.key === "accepted" && "चक्की मालिक ने ऑर्डर स्वीकार किया"}
                          {step.key === "grinding" &&
                            "पारंपरिक ठंडे पत्थर पर ताज़ा गेहूं की पिसाई जारी है (Stone Grinding)"}
                          {step.key === "packed" &&
                            "ताज़ा आटा सुरक्षित इको-फ्रेंडली बैग में पैक व सील"}
                          {step.key === "out_for_delivery" &&
                            "डिलीवरी पार्टनर गरम आटा लेकर आपके पते की ओर रवाना"}
                          {step.key === "delivered" && "ताज़ा आटा आपके द्वार पर प्राप्त हुआ"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dev Simulation Button (helpful for testing status transitions) */}
              {onAdvanceStatus && !isDelivered && (
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">टेस्टिंग हेतु स्थिति आगे बढ़ाएं:</span>
                  <button
                    onClick={() => onAdvanceStatus(order.id)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>अगला स्टेटस (Simulate)</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Assigned Mill Details */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                  {lang === "hi" ? "चक्की का विवरण" : "Milling Partner"}
                </div>
                <div className="text-xs font-bold text-stone-100 truncate">
                  {order.millName}
                </div>
                <div className="text-[11px] text-stone-400">
                  {order.millPhone || "+91 98765 43210"}
                </div>
              </div>
            </div>

            {order.millPhone && (
              <a
                href={`tel:${order.millPhone}`}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>कॉल करें</span>
              </a>
            )}
          </div>

          {/* Delivery Partner Details (Pre-wired for Upcoming Delivery Boy App) */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                  {lang === "hi" ? "डिलीवरी फ्लीट पार्टनर" : "Delivery Partner (Fleet)"}
                </div>
                <div className="text-xs font-bold text-stone-100 truncate">
                  {order.deliveryBoyName || "लाडवां हाइपर-लोकल फ्लीट (असाइन हो रहा है)"}
                </div>
                <div className="text-[11px] text-stone-400">
                  {order.deliveryBoyPhone || "चक्की से आपके घर सीधा ताज़ा आटा"}
                </div>
              </div>
            </div>
            {order.deliveryBoyPhone && (
              <a
                href={`tel:${order.deliveryBoyPhone}`}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>कॉल</span>
              </a>
            )}
          </div>

          {/* Items Summary & Payment Status */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === "hi" ? "ऑर्डर किए गए उत्पाद" : "Order Items"}</span>
              <span className="text-amber-400 font-bold">
                {order.paymentMethod?.toUpperCase()} • {order.paymentStatus === "payment_verification_pending" ? "UPI सत्यापन जारी" : "भुगतान स्थिति: " + order.paymentStatus}
              </span>
            </div>

            <div className="space-y-1.5">
              {order.items?.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-950/50 border border-stone-800 flex items-center justify-between text-xs text-stone-200"
                >
                  <div>
                    <div className="font-bold">{it.name}</div>
                    <div className="text-[10px] text-stone-400">
                      {it.weightKey || it.quantityKg + " kg"} • {it.grindOption}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-400">₹{it.totalPrice}</div>
                    <div className="text-[10px] text-stone-400">x{it.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="pt-2 text-[11px] text-stone-400">
              <span className="font-bold text-stone-300">डिलीवरी का पता: </span>
              <span>{order.deliveryAddress?.address || "Address"}</span>
            </div>
          </div>

          {/* Cancellation Control (Use Case 3 Rule) */}
          {!isCancelled && !isDelivered && (
            <div className="pt-2 border-t border-stone-800">
              {canCancel ? (
                <div>
                  {!showCancelPrompt ? (
                    <button
                      onClick={() => setShowCancelPrompt(true)}
                      className="text-xs text-stone-400 hover:text-red-400 underline underline-offset-2 transition-colors"
                    >
                      {lang === "hi" ? "ऑर्डर रद्द करें" : "Cancel Order"}
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/50 space-y-2.5 animate-in fade-in duration-150">
                      <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>क्या आप वाकई यह ऑर्डर रद्द करना चाहते हैं?</span>
                      </div>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="रद्द करने का कारण..."
                        className="w-full px-3 py-2 bg-stone-950 border border-red-900/60 rounded-xl text-stone-200 text-xs focus:outline-none"
                      />
                      {cancelError && (
                        <div className="text-[11px] text-red-300">{cancelError}</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmCancel}
                          disabled={cancelling}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
                        >
                          {cancelling ? "रद्द हो रहा है..." : "हाँ, रद्द करें (Confirm Cancel)"}
                        </button>
                        <button
                          onClick={() => setShowCancelPrompt(false)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl"
                        >
                          नहीं
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {lang === "hi"
                      ? "चक्की में गेहूं की ताज़ा पिसाई शुरू हो चुकी है। अनाज की बर्बादी रोकने के लिए अब ऑर्डर रद्द नहीं किया जा सकता।"
                      : "Fresh milling is already underway. Order cancellation is locked to prevent grain wastage."}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
