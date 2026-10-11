"use client";

import { useState } from "react";
import { useChakkiStore } from "../lib/store";
import Header from "../components/Header";
import MetricsTicker from "../components/MetricsTicker";
import RateBoard from "../components/RateBoard";
import LiveOrdersView from "../components/LiveOrdersView";
import DailyLedgerView from "../components/DailyLedgerView";
import AddProductModal from "../components/AddProductModal";
import MillProfileModal from "../components/MillProfileModal";
import BottomNavigation from "../components/BottomNavigation";
import PwaManager from "../components/PwaManager";
import { Tag, Bell, BookOpen, Store, Wheat, Languages } from "lucide-react";

export default function ChakkiAdminHome() {
  const {
    isClient,
    isFirebase,
    mill,
    products,
    orders,
    metrics,
    lang,
    t,
    setLang,
    toggleLang,
    toggleStoreStatus,
    updateMill,
    updateProductPrice,
    toggleProductStock,
    addProduct,
    updateOrderStatus,
    simulateIncomingOrder,
    resetAllData,
    playChime,
  } = useChakkiStore();

  const [activeTab, setActiveTab] = useState("rates"); // "rates" | "orders" | "ledger" | "profile"
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-400 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-spin">
          <Wheat className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-stone-300">
          लाडवां चक्की पोर्टल लोड हो रहा है...
        </p>
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) =>
    ["pending", "grinding", "packed"].includes(o.status)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 pb-20 sm:pb-8">
      {/* PWA Network & Mobile Install Controller */}
      <PwaManager lang={lang} />

      {/* 1. Header with Master Duty Toggle and Language Switch */}
      <Header
        mill={mill}
        onToggleStatus={toggleStoreStatus}
        onUpdateStatusReason={(reason, open) => {
          updateMill({
            isOpen: open,
            acceptingOrders: open,
            statusReason: reason,
          });
        }}
        onSimulateOrder={simulateIncomingOrder}
        onPlayChime={playChime}
        onOpenProfile={() => setIsProfileOpen(true)}
        onResetData={resetAllData}
        isFirebase={isFirebase}
        lang={lang}
        toggleLang={toggleLang}
        t={t}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-5">
        {/* Metrics Bar */}
        <MetricsTicker
          metrics={metrics}
          mill={mill}
          onOpenOrdersTab={() => setActiveTab("orders")}
          lang={lang}
          t={t}
        />

        {/* Desktop Navigation Tabs */}
        <div className="hidden sm:flex items-center gap-2 border-b border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab("rates")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "rates"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-600/20"
                : "text-stone-400 hover:text-stone-100 hover:bg-stone-900"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{t.tabRates}</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all relative ${
              activeTab === "orders"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-600/20"
                : "text-stone-400 hover:text-stone-100 hover:bg-stone-900"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{t.tabOrders}</span>
            {activeOrdersCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                  activeTab === "orders"
                    ? "bg-stone-950 text-amber-400"
                    : "bg-red-500 text-white animate-pulse"
                }`}
              >
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "ledger"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-600/20"
                : "text-stone-400 hover:text-stone-100 hover:bg-stone-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.tabLedger}</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "rates" && (
          <RateBoard
            products={products}
            onUpdatePrice={updateProductPrice}
            onToggleStock={toggleProductStock}
            onOpenAddModal={() => setIsAddProductOpen(true)}
            lang={lang}
            t={t}
          />
        )}

        {activeTab === "orders" && (
          <LiveOrdersView
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            onSimulateOrder={simulateIncomingOrder}
            lang={lang}
            t={t}
          />
        )}

        {activeTab === "ledger" && (
          <DailyLedgerView
            metrics={metrics}
            orders={orders}
            lang={lang}
            t={t}
          />
        )}

        {activeTab === "profile" && (
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <span>{t.settingsTitle}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">{t.millNameLabel}</span>
                <span className="font-bold text-white text-sm">
                  {lang === "en" && mill.englishName ? mill.englishName : mill.name}
                </span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">{t.ownerNameLabel}</span>
                <span className="font-bold text-white text-sm">{mill.ownerName}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">{t.phoneLabel}</span>
                <span className="font-bold text-white text-sm">{mill.phone}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">{t.timings}</span>
                <span className="font-bold text-white text-sm">
                  {mill.openingTime} - {mill.closingTime}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                {t.editProfile}
              </button>
              <button
                onClick={toggleLang}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 border border-stone-700"
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Mobile Bottom Sticky Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={activeOrdersCount}
        t={t}
      />

      {/* 4. Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={addProduct}
        lang={lang}
        toggleLang={toggleLang}
        t={t}
      />

      <MillProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        mill={mill}
        onSave={(updates) => updateMill(updates)}
        lang={lang}
        onSelectLang={setLang}
        t={t}
      />
    </div>
  );
}
