// apps/customer-pwa/app/page.js - Consumer PWA Main Application with Dual Browsing
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
import UserProfileModal from "../components/UserProfileModal";
import PWAInstallBanner from "../components/PWAInstallBanner";
import BottomNavigation from "../components/BottomNavigation";
import { useCustomerStore } from "../lib/customerStore";

import {
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Clock,
  RotateCw,
  Truck,
  ShieldCheck,
  Wheat,
  Store,
  MapPin,
  Star,
  Search,
  X,
  Check,
} from "lucide-react";

export default function ConsumerPwaHome() {
  const {
    isClient,
    lang,
    t,
    toggleLang,
    userProfile,
    updateProfile,
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("store");

  // Dual Browsing Mode: "flours" | "mills"
  const [browseMode, setBrowseMode] = useState("flours");

  // Search & Category filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter products by category AND search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let list = products;
    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.englishName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  // Filter nearby mills by search query
  const filteredMills = useMemo(() => {
    if (!nearbyMills) return [];
    if (!searchQuery.trim()) return nearbyMills;
    const q = searchQuery.toLowerCase();
    return nearbyMills.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.tagline?.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q) ||
        m.area?.toLowerCase().includes(q) ||
        m.stoneType?.toLowerCase().includes(q)
    );
  }, [nearbyMills, searchQuery]);

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
        onOpenProfile={() => setIsProfileOpen(true)}
        lang={lang}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 pb-28 sm:pb-16">
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
              className="mb-5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-500/10 border border-amber-500/40 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-lg shadow-amber-500/5 group"
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
                  <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5" suppressHydrationWarning>
                    <span>
                      {activeOrder.orderStatus === "placed" &&
                        (lang === "hi" ? "ऑर्डर प्राप्त हुआ • पुष्टि जारी" : "Order Placed • Awaiting Confirmation")}
                      {activeOrder.orderStatus === "accepted" &&
                        (lang === "hi" ? "चक्की द्वारा स्वीकार हुआ" : "Accepted by Chakki")}
                      {activeOrder.orderStatus === "grinding" &&
                        (lang === "hi" ? "ताज़ा पत्थर पिसाई चालू है (Grinding)" : "Live Cold Grinding in Progress")}
                      {activeOrder.orderStatus === "packed" &&
                        (lang === "hi" ? "ताज़ा पैक हुआ • रवाना होने को तैयार" : "Packed Fresh • Ready for Delivery")}
                      {activeOrder.orderStatus === "out_for_delivery" &&
                        (lang === "hi" ? "डिलीवरी पार्टनर रास्ते में है" : "Out for Delivery • On the Way")}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 text-[10px] font-bold">
                      {lang === "hi" ? "लाइव" : "LIVE"}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {activeOrder.millName} • #{activeOrder.orderNumber} • ETA:{" "}
                    {activeOrder.estimatedDeliveryMinutes || "30-40 min"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                <span suppressHydrationWarning>{lang === "hi" ? "ट्रैक करें" : "Track"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}

        {/* Search Bar + Dual Browsing Mode Strip */}
        <div className="space-y-3 mb-6">
          {/* 1. Smart Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "hi"
                  ? browseMode === "flours"
                    ? "आटा, सत्तू, बेसन, रागी या ज्वार खोजें..."
                    : "निकटतम चक्की, इलाका या पत्थर का प्रकार खोजें..."
                  : browseMode === "flours"
                  ? "Search flour, sattu, besan, ragi, or millets..."
                  : "Search chakki name, area, or stone type..."
              }
              className="w-full bg-stone-900/90 border border-stone-800 focus:border-amber-500/60 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all focus:ring-1 focus:ring-amber-500/30 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Dual Mode Switcher Bar */}
          <div className="flex items-center p-1 rounded-2xl bg-stone-900/80 border border-stone-800">
            {/* Mode 1: Atta & Grains */}
            <button
              type="button"
              onClick={() => {
                setBrowseMode("flours");
                setActiveMobileTab("store");
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                browseMode === "flours"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/40"
              }`}
            >
              <Wheat className="w-4 h-4" />
              <span suppressHydrationWarning>
                {lang === "hi" ? "ताज़ा आटा व अनाज" : "Fresh Atta & Grains"}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  browseMode === "flours"
                    ? "bg-stone-950/20 text-stone-950"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {filteredProducts.length}
              </span>
            </button>

            {/* Mode 2: Nearby Mills */}
            <button
              type="button"
              onClick={() => {
                setBrowseMode("mills");
                setActiveMobileTab("chakkis");
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                browseMode === "mills"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/40"
              }`}
            >
              <Store className="w-4 h-4" />
              <span suppressHydrationWarning>
                {lang === "hi" ? "आस-पास की चक्कियां" : "Nearby Chakkis"}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  browseMode === "mills"
                    ? "bg-stone-950/20 text-stone-950"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {filteredMills.length}
              </span>
            </button>
          </div>
        </div>

        {/* VIEW 1: FLOURS & GRAINS BROWSE MODE */}
        {browseMode === "flours" && (
          <div>
            {/* Category Tabs */}
            <CategoryTabs
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              lang={lang}
            />

            {/* Product Catalog Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-stone-100 flex items-center gap-2">
                    <span suppressHydrationWarning>
                      {lang === "hi"
                        ? "ताज़ा पिसा आटा, सत्तू व अनाज"
                        : "Fresh Stone-Ground Atta & Grains"}
                    </span>
                    <span className="text-xs font-normal text-stone-400">
                      ({filteredProducts.length} {lang === "hi" ? "विकल्प" : "items"})
                    </span>
                  </h2>
                  <p className="text-xs text-stone-400" suppressHydrationWarning>
                    {lang === "hi"
                      ? `${selectedMill?.name || "स्थानीय चक्की"} से 100% शुद्ध ताजी पिसाई`
                      : `Ground fresh on order from ${selectedMill?.name || "hyper-local chakki"}`}
                  </p>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>{lang === "hi" ? "सर्च हटाएं" : "Clear search"}</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-stone-900/40 rounded-3xl border border-stone-800">
                  <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-stone-200">
                    {lang === "hi" ? "कोई आटा नहीं मिला" : "No flours found"}
                  </div>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    {lang === "hi"
                      ? `"${searchQuery}" से मिलता-जुलता कोई उत्पाद नहीं मिला। कृपया दूसरा शब्द खोजें।`
                      : `No products matching "${searchQuery}". Please try another keyword.`}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    {lang === "hi" ? "सभी आटा देखें" : "View All Flours"}
                  </button>
                </div>
              ) : (
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
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: NEARBY CHAKKIS / MILLS BROWSE MODE */}
        {browseMode === "mills" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-stone-100 flex items-center gap-2">
                  <span suppressHydrationWarning>
                    {lang === "hi"
                      ? "निकटतम सक्रिय आटा चक्कियां"
                      : "Nearby Active Atta Chakkis"}
                  </span>
                  <span className="text-xs font-normal text-stone-400">
                    ({filteredMills.length} {lang === "hi" ? "चक्कियां" : "mills"})
                  </span>
                </h2>
                <p className="text-xs text-stone-400" suppressHydrationWarning>
                  {lang === "hi"
                    ? `${location?.name || "सोनारपुर"} के 5 km दायरे में 100% पारंपरिक पत्थर पिसाई`
                    : `100% cold stone grinders within 5 km of ${location?.name || "your location"}`}
                </p>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>{lang === "hi" ? "सर्च हटाएं" : "Clear search"}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {filteredMills.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-stone-900/40 rounded-3xl border border-stone-800">
                <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-stone-200">
                  {lang === "hi" ? "कोई चक्की नहीं मिली" : "No chakkis found"}
                </div>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  {lang === "hi"
                    ? `"${searchQuery}" के नाम से कोई चक्की नहीं मिली।`
                    : `No chakkis found matching "${searchQuery}".`}
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                >
                  {lang === "hi" ? "सभी चक्कियां देखें" : "View All Chakkis"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMills.map((mill) => {
                  const isSelected = selectedMill?.id === mill.id;
                  return (
                    <div
                      key={mill.id}
                      className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/40"
                          : "bg-stone-900/80 hover:bg-stone-900 border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      <div>
                        {/* Top row: Name & Active badge */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-stone-100 text-base leading-snug">
                                {mill.name}
                              </h3>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-stone-950 font-black">
                                  {lang === "hi" ? "सक्रिय चक्की" : "Active Mill"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-amber-400 font-medium mt-0.5">
                              {mill.tagline}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/15 text-amber-300 text-xs font-black shrink-0 border border-amber-500/30">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{mill.rating || 4.9}</span>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="text-xs text-stone-400 flex items-center gap-1.5 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span className="truncate">{mill.address || mill.area}</span>
                        </div>

                        {/* Key badges strip */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] mb-4">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 text-stone-300 font-semibold border border-stone-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{mill.eta || "30-40 min"} ETA</span>
                          </span>

                          <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 text-stone-300 font-semibold border border-stone-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{mill.formattedDistance || "1.2 km"} दूर</span>
                          </span>

                          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-400 font-semibold border border-emerald-900/40">
                            {mill.stoneType || "Natural Stone (ठंडी पिसाई)"}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3">
                        <div className="text-[11px] text-stone-400 font-medium">
                          {mill.isOpen !== false ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>{lang === "hi" ? "चक्की खुली है" : "Open & Grinding"}</span>
                            </span>
                          ) : (
                            <span className="text-stone-500">
                              {lang === "hi" ? "अभी बंद है" : "Currently Closed"}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            selectMill(mill.id);
                            setBrowseMode("flours");
                            window.scrollTo({ top: 380, behavior: "smooth" });
                          }}
                          className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                            isSelected
                              ? "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Wheat className="w-3.5 h-3.5 text-amber-400" />
                              <span>{lang === "hi" ? "ताज़ा आटा देखें" : "View Fresh Atta"}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{lang === "hi" ? "यह चक्की चुनें" : "Select This Mill"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Desktop / Tablet only — on mobile, the native bottom navigation bar handles the cart) */}
      {cart.length > 0 && (
        <div className="hidden sm:block fixed sm:bottom-4 sm:right-6 sm:w-96 z-30 p-3 bg-stone-900/95 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs">
                <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-sm font-black text-stone-100">
                  ₹{cartSummary.totalAmount}
                </div>
                <div className="text-[10px] text-stone-400" suppressHydrationWarning>
                  {cartSummary.totalItems} {lang === "hi" ? "आइटम" : "items"} • {cartSummary.totalKg} kg •{" "}
                  {cartSummary.isFreeDelivery
                    ? lang === "hi"
                      ? "मुफ़्त डिलीवरी"
                      : "FREE Delivery"
                    : "+₹25"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span suppressHydrationWarning>{lang === "hi" ? "टोकरी देखें" : "View Cart"}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 text-stone-500 py-6 px-4 text-center text-xs">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-semibold text-stone-400" suppressHydrationWarning>
            {lang === "hi"
              ? "लाडवां पारंपरिक पत्थर-पिसा आटा नेटवर्क • Ladwan Chakki Ecosystem"
              : "Ladwan Traditional Stone-Ground Atta Network"}
          </div>
          <p className="text-[11px] text-stone-600 max-w-md mx-auto" suppressHydrationWarning>
            {lang === "hi"
              ? "सोनारपुर (कोलकाता), गुरुग्राम एवं दिल्ली-एनसीआर के स्थानीय चक्की मालिकों और ग्राहकों को सीधा जोड़ने वाला हाइपर-लोकल डिलीवरी प्लेटफॉर्म।"
              : "Hyper-local milling platform directly connecting local chakki owners to families in Sonarpur, Kolkata & Delhi-NCR."}
          </p>
          <div className="text-[10px] text-stone-600 pt-1">
            © 2026 Ladwan. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Native Mobile Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeMobileTab}
        onSelectTab={(tab) => {
          setActiveMobileTab(tab);
          if (tab === "store") {
            setBrowseMode("flours");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (tab === "chakkis") {
            setBrowseMode("mills");
            window.scrollTo({ top: 380, behavior: "smooth" });
          }
        }}
        onOpenMillModal={() => {
          setBrowseMode("mills");
          window.scrollTo({ top: 380, behavior: "smooth" });
        }}
        onOpenTracking={() => {
          if (activeOrder) {
            setIsTrackingOpen(true);
          } else {
            setIsCartOpen(true);
          }
        }}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartSummary.totalItems}
        cartTotal={cartSummary.totalAmount}
        hasActiveOrder={Boolean(
          activeOrder &&
            activeOrder.orderStatus !== "delivered" &&
            activeOrder.orderStatus !== "cancelled"
        )}
        lang={lang}
      />

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
        onSelectMill={(id) => {
          selectMill(id);
          setBrowseMode("flours");
        }}
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
        userProfile={userProfile}
        onPlaceOrder={async (orderData) => {
          await placeOrder(orderData);
          setIsCheckoutOpen(false);
          setIsTrackingOpen(true);
        }}
        lang={lang}
      />

      <OrderTrackingView
        isOpen={isTrackingOpen}
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

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={updateProfile}
        location={location}
        onOpenLocationModal={() => {
          setIsProfileOpen(false);
          setIsLocationModalOpen(true);
        }}
        lang={lang}
        onToggleLang={toggleLang}
        onResetData={() => {
          if (
            window.confirm(
              lang === "hi"
                ? "क्या आप ऐप डेटा और कार्ट रीसेट करना चाहते हैं?"
                : "Reset cart and app data?"
            )
          ) {
            clearCart();
            if (typeof window !== "undefined") {
              localStorage.clear();
              window.location.reload();
            }
          }
        }}
      />

      {/* PWA Mobile Home Screen Install Prompt */}
      <PWAInstallBanner lang={lang} />
    </div>
  );
}
