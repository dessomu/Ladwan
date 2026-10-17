// apps/customer-pwa/components/CheckoutModal.js - Checkout & Dual Payment (COD / Dynamic UPI QR)
"use client";

import { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Truck,
  ArrowRight,
  Store,
} from "lucide-react";

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  cartSummary,
  selectedMill,
  currentLocation,
  userProfile,
  onPlaceOrder,
  lang,
}) {
  const [customerName, setCustomerName] = useState(userProfile?.name || "");
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || "");
  const [addressLine, setAddressLine] = useState(
    userProfile?.streetArea || currentLocation?.area || currentLocation?.name || ""
  );
  const [flatNumber, setFlatNumber] = useState(userProfile?.houseFlat || "");
  const [landmark, setLandmark] = useState(userProfile?.landmark || "");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (userProfile && isOpen) {
      if (userProfile.name) setCustomerName(userProfile.name);
      if (userProfile.phone) setCustomerPhone(userProfile.phone);
      if (userProfile.houseFlat) setFlatNumber(userProfile.houseFlat);
      if (userProfile.streetArea) setAddressLine(userProfile.streetArea);
      if (userProfile.landmark) setLandmark(userProfile.landmark);
    }
  }, [userProfile, isOpen]);

  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "upi"
  const [transactionRef, setTransactionRef] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const millUpiId = selectedMill?.upiId || "ladwanchakki@upi";
  const millNameEncoded = encodeURIComponent(selectedMill?.name || "Ladwan Chakki");
  const upiIntentUrl = `upi://pay?pa=${millUpiId}&pn=${millNameEncoded}&am=${cartSummary.totalAmount}&cu=INR&tn=Ladwan%20Fresh%20Atta%20Order`;
  const upiQrUrl =
    selectedMill?.upiQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      upiIntentUrl
    )}`;

  const handleCopyUpi = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(millUpiId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (!customerName.trim()) {
      setErrorMsg(
        lang === "hi"
          ? "कृपया अपना नाम दर्ज करें"
          : "Please enter your name"
      );
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      setErrorMsg(
        lang === "hi"
          ? "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें"
          : "Please enter a valid 10-digit mobile number"
      );
      return;
    }
    if (!flatNumber.trim() && !addressLine.trim()) {
      setErrorMsg(
        lang === "hi"
          ? "कृपया डिलीवरी पता दर्ज करें"
          : "Please provide a delivery address"
      );
      return;
    }

    if (paymentMethod === "upi" && !transactionRef.trim()) {
      setErrorMsg(
        lang === "hi"
          ? "कृपया UPI भुगतान का UTR / Transaction Reference ID दर्ज करें"
          : "Please enter the 12-digit UPI UTR / Transaction Reference ID"
      );
      return;
    }

    // Pre-flight check: Mill must be open and online
    if (selectedMill?.isOpen === false) {
      setErrorMsg(
        lang === "hi"
          ? "क्षमा करें, यह चक्की अभी ऑफलाइन हो गई है। कृपया किसी अन्य खुली चक्की का चयन करें।"
          : "Sorry, this mill just went offline. Please switch to an alternate open mill."
      );
      return;
    }

    setSubmitting(true);
    try {
      const fullAddress = `${flatNumber ? flatNumber + ", " : ""}${addressLine}${
        landmark ? " (Landmark: " + landmark + ")" : ""
      }`;

      await onPlaceOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        addressDetails: {
          address: fullAddress,
          area: currentLocation?.area || "",
          city: currentLocation?.city || "Kolkata",
          pincode: currentLocation?.pincode || "700150",
          instructions,
        },
        paymentMethod,
        transactionRef: transactionRef.trim(),
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-100">
                {lang === "hi" ? "ऑर्डर चेकआउट व डिलीवरी" : "Checkout & Fresh Delivery"}
              </h2>
              <div className="text-[11px] text-stone-400">
                {selectedMill?.name} • कुल देय: ₹{cartSummary.totalAmount}
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-900/60 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Contact */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. {lang === "hi" ? "ग्राहक विवरण" : "Customer Details"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === "hi" ? "पूरा नाम" : "Full Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === "hi" ? "उदा. राहुल शर्मा" : "e.g. Rahul Sharma"}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === "hi" ? "मोबाइल नंबर (10 अंक)" : "Phone Number"} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="space-y-3 pt-3 border-t border-stone-800">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              2. {lang === "hi" ? "डिलीवरी का पता" : "Delivery Address"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === "hi" ? "मकान / फ्लैट / मंजिल" : "House / Flat / Floor"} *
                </label>
                <input
                  type="text"
                  required
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder={lang === "hi" ? "उदा. फ्लैट 302, बी-ब्लॉक" : "Flat 302, B-Block"}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === "hi" ? "लैंडमार्क (पहचान)" : "Nearby Landmark"}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={lang === "hi" ? "उदा. स्टेशन के पास" : "Near Station / Park"}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {lang === "hi" ? "सड़क / इलाका" : "Street / Area"} *
              </label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder={lang === "hi" ? "सोनारपुर स्टेशन रोड, कोलकाता..." : "Station Road..."}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {lang === "hi" ? "डिलीवरी निर्देश (वैकल्पिक)" : "Delivery Instructions (Optional)"}
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={lang === "hi" ? "घंटी बजाएं, गेट पर छोड़ें..." : "Ring the bell..."}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Dual Payment Options */}
          <div className="space-y-3 pt-3 border-t border-stone-800">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>3. {lang === "hi" ? "भुगतान का तरीका चुनें" : "Payment Method"}</span>
              <span className="text-stone-300 font-extrabold text-xs">
                कुल: ₹{cartSummary.totalAmount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option A: Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  paymentMethod === "cod"
                    ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40"
                    : "bg-stone-950/70 hover:bg-stone-800/60 border-stone-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-100">
                    {lang === "hi" ? "कैश ऑन डिलीवरी (COD)" : "Cash on Delivery"}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {lang === "hi" ? "घर पहुंचने पर नकद या UPI दें" : "Pay at doorstep"}
                  </div>
                </div>
              </button>

              {/* Option B: UPI QR Code Online */}
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  paymentMethod === "upi"
                    ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40"
                    : "bg-stone-950/70 hover:bg-stone-800/60 border-stone-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  {paymentMethod === "upi" && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-100">
                    {lang === "hi" ? "चक्की मालिक का UPI QR" : "Chakki UPI QR Pay"}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {lang === "hi" ? "GPay / PhonePe / Paytm" : "Scan & Direct Pay"}
                  </div>
                </div>
              </button>
            </div>

            {/* UPI QR Display Container (if UPI selected) */}
            {paymentMethod === "upi" && (
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-200">
                    {lang === "hi"
                      ? `${selectedMill?.name} का आधिकारिक UPI QR`
                      : `Official UPI QR for ${selectedMill?.name}`}
                  </span>
                  <span className="font-black text-amber-400 text-sm">
                    देय: ₹{cartSummary.totalAmount}
                  </span>
                </div>

                {/* QR Code Graphic */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                    <img
                      src={upiQrUrl}
                      alt="Mill UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2 text-center sm:text-left min-w-0">
                    <div className="text-[11px] text-stone-400">
                      {lang === "hi"
                        ? "किसी भी UPI ऐप (GPay, PhonePe, Paytm) से स्कैन करके भुगतान करें:"
                        : "Scan using any UPI app to pay directly to mill owner:"}
                    </div>

                    {/* Copy UPI ID Pill */}
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <code className="px-2 py-1 bg-stone-950 rounded-lg text-amber-400 text-xs font-mono font-bold border border-stone-800">
                        {millUpiId}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">कॉपी हुआ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>कॉपी</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Direct App Deep Link */}
                    <a
                      href={upiIntentUrl}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline underline-offset-2 pt-1"
                    >
                      <span>UPI ऐप में खोलें (Open in UPI App)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Transaction Ref UTR input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {lang === "hi"
                      ? "12 अंकों का UTR / Transaction Reference ID *"
                      : "12-digit UTR / Transaction Reference ID *"}
                  </label>
                  <input
                    type="text"
                    required={paymentMethod === "upi"}
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="उदा. 428910284729"
                    className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                  />
                  <div className="text-[10px] text-stone-400 pt-1">
                    {lang === "hi"
                      ? "ऑर्डर स्वीकार करते समय चक्की मालिक आपके इस रेफरेंस नंबर से पेमेंट वेरिफाई करेंगे।"
                      : "The mill owner confirms receipt of this UTR before starting fresh grinding."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>{lang === "hi" ? "ऑर्डर दर्ज हो रहा है..." : "Placing Order..."}</span>
              ) : (
                <>
                  <span>
                    {lang === "hi"
                      ? `₹${cartSummary.totalAmount} का ऑर्डर कन्फर्म करें`
                      : `Confirm Order of ₹${cartSummary.totalAmount}`}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
            <div className="text-center text-[10px] text-stone-400 pt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% ताज़ा पिसाई की गारंटी • सुरक्षित हाइपर-लोकल नेटवर्क</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
