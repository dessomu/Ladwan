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
import { Tag, Bell, BookOpen, Store, Wheat, Sparkles } from "lucide-react";

export default function ChakkiAdminHome() {
  const {
    isClient,
    isFirebase,
    mill,
    products,
    orders,
    metrics,
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

  const [activeTab, setActiveTab] = useState("rates"); // "rates" | "orders" | "ledger"
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
      {/* 1. Header with Master Dukan Chalu/Band Switch */}
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
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-5">
        {/* Metrics Bar */}
        <MetricsTicker
          metrics={metrics}
          mill={mill}
          onOpenOrdersTab={() => setActiveTab("orders")}
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
            <span>दैनिक रेट लिस्ट व स्टॉक (Rate Board & Stock)</span>
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
            <span>लाइव आर्डर कतार (Orders Pipeline)</span>
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
            <span>दैनिक बही-खाता (Daily Ledger)</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "rates" && (
          <RateBoard
            products={products}
            onUpdatePrice={updateProductPrice}
            onToggleStock={toggleProductStock}
            onOpenAddModal={() => setIsAddProductOpen(true)}
          />
        )}

        {activeTab === "orders" && (
          <LiveOrdersView
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            onSimulateOrder={simulateIncomingOrder}
          />
        )}

        {activeTab === "ledger" && (
          <DailyLedgerView metrics={metrics} orders={orders} />
        )}

        {activeTab === "profile" && (
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <span>चक्की प्रोफाइल विवरण</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">चक्की नाम:</span>
                <span className="font-bold text-white text-sm">{mill.name}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">मालिक:</span>
                <span className="font-bold text-white text-sm">{mill.ownerName}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">फोन नंबर:</span>
                <span className="font-bold text-white text-sm">{mill.phone}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 block">समय:</span>
                <span className="font-bold text-white text-sm">
                  {mill.openingTime} से {mill.closingTime}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
            >
              प्रोफाइल एडिट करें
            </button>
          </div>
        )}
      </main>

      {/* 3. Mobile Bottom Sticky Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={activeOrdersCount}
      />

      {/* 4. Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={addProduct}
      />

      <MillProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        mill={mill}
        onSave={(updates) => updateMill(updates)}
      />
    </div>
  );
}
