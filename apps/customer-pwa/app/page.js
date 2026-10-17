// apps/customer-pwa/app/page.js - Consumer PWA Main Application
"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import LocationModal from "../components/LocationModal";
import MillSelectorModal from "../components/MillSelectorModal";
import FreshnessBanner from "../components/FreshnessBanner";
import CategoryTabs from "../components/CategoryTabs";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import OrderTrackingView from "../components/OrderTrackingView";
import RatingModal from "../components/RatingModal";
import PWAInstallBanner from "../components/PWAInstallBanner";
import { useCustomerStore } from "../lib/customerStore";
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Wheat,
} from "lucide-react";

export default function ConsumerPwaHome() {
  const {
    isClient,
    lang,
    toggleLang,
    location,
    setLocation,
    nearbyMills,
    selectedMill,
    selectMill,
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSummary,
    activeOrder,
    placeOrder,
    cancelOrder,
    advanceOrderStatus,
    submitOrderReview,
  } = useCustomerStore();

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMillModalOpen, setIsMillModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* Sticky Header with Location, Mill & Cart */}
      <Header
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        selectedMill={selectedMill}
        onOpenMillModal={() => setIsMillModalOpen(true)}
        cartCount={cartSummary.totalItems}
        cartTotal={cartSummary.totalAmount}
        onOpenCart={() => setIsCartOpen(true)}
        activeOrder={activeOrder}
        onOpenTracking={() => setIsTrackingOpen(true)}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 pb-28 sm:pb-16">
        {/* Freshness & On-Demand Milling Banner */}
        <FreshnessBanner
          selectedMill={selectedMill}
          onOpenMillModal={() => setIsMillModalOpen(true)}
          lang={lang}
        />

        {/* Live Active Order Notification Pill (if order exists & not closed) */}
        {activeOrder &&
          activeOrder.orderStatus !== "cancelled" &&
          activeOrder.orderStatus !== "delivered" && (
            <div
              onClick={() => setIsTrackingOpen(true)}
              className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-500/10 border border-amber-500/40 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-lg shadow-amber-500/5 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  {activeOrder.orderStatus === "grinding" ? (
                    <RotateCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Truck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                    <span>
                      {activeOrder.orderStatus === "placed" && "ऑर्डर प्राप्त हुआ • पुष्टि जारी"}
                      {activeOrder.orderStatus === "accepted" && "चक्की द्वारा स्वीकार हुआ"}
                      {activeOrder.orderStatus === "grinding" &&
                        "ताज़ा पत्थर पिसाई चालू है (Grinding)"}
                      {activeOrder.orderStatus === "packed" && "ताज़ा पैक हुआ • रवाना होने को तैयार"}
                      {activeOrder.orderStatus === "out_for_delivery" &&
                        "डिलीवरी पार्टनर रास्ते में है"}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 text-[10px] font-bold">
                      लाइव
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {activeOrder.millName} • #{activeOrder.orderNumber} • ETA:{" "}
                    {activeOrder.estimatedDeliveryMinutes || "30-40 min"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                <span>ट्रैक करें</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}

        {/* Category Tabs */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <CategoryTabs
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            lang={lang}
          />
        </div>

        {/* Product Catalog Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-100 flex items-center gap-2">
                <span>
                  {lang === "hi"
                    ? "ताज़ा पिसा आटा, सत्तू व अनाज"
                    : "Fresh Stone-Ground Atta & Grains"}
                </span>
                <span className="text-xs font-normal text-stone-400">
                  ({filteredProducts.length} विकल्प)
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                {lang === "hi"
                  ? `${selectedMill?.name || "स्थानीय चक्की"} से 100% शुद्ध ताजी पिसाई`
                  : `Ground fresh on order from ${selectedMill?.name || "hyper-local chakki"}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                cartItems={cart}
                lang={lang}
              />
            ))}
          </div>
        </section>

        {/* Value Proposition & Quality Seal */}
        <section className="mt-12 p-6 rounded-3xl bg-stone-900/60 border border-stone-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">
                {lang === "hi" ? "100% प्राकृतिक पत्थर पिसाई" : "Cold Stone Grinding"}
              </div>
              <div className="text-[11px] text-stone-400">
                {lang === "hi"
                  ? "धीमी गति की ठंडी पिसाई से पोषक तत्व व प्राकृतिक फाइबर सुरक्षित रहते हैं।"
                  : "Natural slow milling preserves vital nutrients, vitamins & dietary fiber."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">
                {lang === "hi" ? "शून्य मैदा • शून्य प्रिजर्वेटिव" : "Zero Maida • 0 Preservatives"}
              </div>
              <div className="text-[11px] text-stone-400">
                {lang === "hi"
                  ? "कोई कृत्रिम रसायन या ब्लीचिंग नहीं। 100% संपूर्ण चोकर युक्त आटा।"
                  : "No bleaching or preservatives. Pure wholesome whole wheat flour."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">
                {lang === "hi" ? "30-45 मिनट में द्वार तक" : "30-45 Mins Hyper-local"}
              </div>
              <div className="text-[11px] text-stone-400">
                {lang === "hi"
                  ? "हाइपर-लोकल डिलीवरी फ्लीट से ताज़ा गर्म आटा सीधे आपकी रसोई तक।"
                  : "Hyper-local fleet delivers fresh flour straight to your doorstep."}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Cart Bar (Mobile-first Blinkit Style) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-stone-950/90 backdrop-blur-md border-t border-stone-800 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                {cartSummary.totalItems}
              </div>
              <div>
                <div className="text-sm font-black text-stone-100">
                  ₹{cartSummary.totalAmount}
                </div>
                <div className="text-[10px] text-stone-400">
                  {cartSummary.totalKg} kg •{" "}
                  {cartSummary.isFreeDelivery ? "मुफ़्त डिलीवरी" : "+₹25 डिलीवरी"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>{lang === "hi" ? "टोकरी देखें" : "View Cart"}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 text-stone-500 py-6 px-4 text-center text-xs">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-semibold text-stone-400">
            लाडवां पारंपरिक पत्थर-पिसा आटा नेटवर्क • Ladwan Chakki Ecosystem
          </div>
          <p className="text-[11px] text-stone-600 max-w-md mx-auto">
            सोनारपुर (कोलकाता), गुरुग्राम एवं दिल्ली-एनसीआर के स्थानीय चक्की मालिकों और ग्राहकों को
            सीधा जोड़ने वाला हाइपर-लोकल डिलीवरी प्लेटफॉर्म।
          </p>
          <div className="text-[10px] text-stone-600 pt-1">
            © 2026 Ladwan. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={setLocation}
        lang={lang}
      />

      <MillSelectorModal
        isOpen={isMillModalOpen}
        onClose={() => setIsMillModalOpen(false)}
        nearbyMills={nearbyMills}
        selectedMill={selectedMill}
        onSelectMill={selectMill}
        lang={lang}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartSummary={cartSummary}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        selectedMill={selectedMill}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        lang={lang}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        cartSummary={cartSummary}
        selectedMill={selectedMill}
        currentLocation={location}
        onPlaceOrder={placeOrder}
        lang={lang}
      />

      <OrderTrackingView
        order={activeOrder}
        onClose={() => setIsTrackingOpen(false)}
        onCancelOrder={cancelOrder}
        onAdvanceStatus={advanceOrderStatus}
        onOpenRating={() => {
          setIsTrackingOpen(false);
          setIsRatingOpen(true);
        }}
        lang={lang}
      />

      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        order={activeOrder}
        onSubmitReview={submitOrderReview}
        lang={lang}
      />

      {/* PWA Mobile Home Screen Install Prompt */}
      <PWAInstallBanner lang={lang} />
    </div>
  );
}
