// apps/customer-pwa/components/CartDrawer.js - Slide-over Cart & Dynamic Billing
"use client";

import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Store,
} from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  cartSummary,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedMill,
  onProceedToCheckout,
  lang,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border-l border-stone-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <span>{lang === "hi" ? "आपकी टोकरी" : "Your Fresh Cart"}</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-bold">
                  {cartSummary.totalItems} आइटम ({cartSummary.totalKg} kg)
                </span>
              </h2>
              <div className="text-[11px] text-stone-400">
                {selectedMill ? selectedMill.name : "स्थानीय आटा चक्की"}
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

        {/* Free Delivery Banner / Progress Bar */}
        <div className="px-5 py-3 bg-gradient-to-r from-amber-950/30 via-stone-900 to-amber-950/20 border-b border-stone-800/80">
          {cartSummary.isFreeDelivery ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === "hi"
                  ? "बधाई! आपके ऑर्डर पर मुफ़्त डिलीवरी लागू हो गई है।"
                  : "Congratulations! Free delivery applied to your order."}
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-300 font-semibold">
                <span>
                  {lang === "hi"
                    ? `मुफ़्त डिलीवरी के लिए ₹${cartSummary.amountNeededForFree} और जोड़ें`
                    : `Add ₹${cartSummary.amountNeededForFree} more for FREE delivery`}
                </span>
                <span className="text-amber-400">₹499 लक्ष्य</span>
              </div>
              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (cartSummary.subtotal / 499) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-stone-800/60 border border-stone-800 text-stone-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-stone-200">
                {lang === "hi" ? "आपकी टोकरी खाली है" : "Your cart is empty"}
              </div>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                {lang === "hi"
                  ? "चक्की से शुद्ध ताजा पिसा आटा या सत्तू चुनें और ताजी रोटियों का आनंद लें।"
                  : "Pick fresh whole wheat flour or millets to enjoy nutritious hot rotis."}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 overflow-hidden shrink-0 border border-stone-800">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-stone-100 truncate">
                      {item.name}
                    </h4>
                    <div className="text-[11px] text-amber-400 font-semibold">
                      {item.weightKey} ({item.kgPerUnit} kg) • {item.grindOption}
                    </div>
                    <div className="text-xs font-black text-stone-100">
                      ₹{item.totalPrice}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0 bg-stone-900 border border-stone-800 rounded-xl p-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors active:scale-90"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="w-6 text-center text-xs font-black text-stone-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold transition-colors active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-800 bg-stone-950/80 space-y-3">
            {/* Bill details */}
            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>{lang === "hi" ? "आइटम योग (Subtotal)" : "Items Subtotal"}</span>
                <span className="text-stone-200 font-semibold">
                  ₹{cartSummary.subtotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "hi" ? "डिलीवरी शुल्क" : "Delivery Fee"}</span>
                {cartSummary.isFreeDelivery ? (
                  <span className="text-emerald-400 font-bold">
                    {lang === "hi" ? "मुफ़्त (FREE)" : "FREE"}
                  </span>
                ) : (
                  <span className="text-stone-200 font-semibold">
                    ₹{cartSummary.deliveryFee}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span>{lang === "hi" ? "ताज़ा पत्थर पिसाई व पैकिंग" : "Fresh Milling & Packing"}</span>
                <span className="text-emerald-400 font-bold">
                  {lang === "hi" ? "मुफ़्त" : "FREE"}
                </span>
              </div>

              <div className="h-px bg-stone-800 pt-1"></div>

              <div className="flex justify-between text-sm font-black text-stone-100 pt-1">
                <span>{lang === "hi" ? "कुल देय राशि" : "Grand Total"}</span>
                <span className="text-amber-400 text-base">
                  ₹{cartSummary.totalAmount}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-between"
            >
              <div className="text-left">
                <div className="text-[10px] text-stone-900 uppercase tracking-wider font-extrabold">
                  {cartSummary.totalItems} आइटम • {cartSummary.totalKg} kg
                </div>
                <div className="text-base font-black">₹{cartSummary.totalAmount}</div>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span>{lang === "hi" ? "चेकआउट करें" : "Proceed to Checkout"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
