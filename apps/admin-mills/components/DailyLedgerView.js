"use client";

import {
  IndianRupee,
  Wheat,
  CheckCircle2,
  Calendar,
  CreditCard,
  Banknote,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function DailyLedgerView({ metrics, orders }) {
  const completedOrders = orders.filter((o) => o.status === "delivered");
  const onlineOrders = orders.filter((o) => o.isPaid);
  const codOrders = orders.filter((o) => !o.isPaid && o.status !== "cancelled");

  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const codRevenue = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>आज का दैनिक बही-खाता (Today's Ledger)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            ₹{metrics.todayGrossRevenue.toLocaleString("en-IN")}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            आज कुल {metrics.todayTotalKg} किलो आटा पीसा गया और {metrics.todayOrdersCount} आर्डर पूरे हुए।
          </p>
        </div>

        {/* Payout & Settlement Box */}
        <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800 self-stretch sm:self-auto">
          <div>
            <span className="text-[10px] text-stone-500 font-bold block uppercase">
              लाडवां सेटलमेंट (खाते में ट्रांसफ़र)
            </span>
            <span className="text-sm font-bold text-emerald-400">
              ₹5,120 सेटल्ड
            </span>
            <span className="text-[10px] text-stone-400 ml-1 font-mono">
              (₹1,720 कल सुबह 8 बजे)
            </span>
          </div>
        </div>
      </div>

      {/* Payment Mode Breakup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-400 font-medium">ऑनलाइन यूपीआई भुगतान</span>
              <p className="text-lg font-bold text-white">₹{onlineRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            {onlineOrders.length} आर्डर
          </span>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-400 font-medium">नकद (Cash on Delivery)</span>
              <p className="text-lg font-bold text-white">₹{codRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            {codOrders.length} आर्डर
          </span>
        </div>
      </div>

      {/* Completed Orders List */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>आज पूर्ण हुए आर्डर (Delivered History)</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            {completedOrders.length} पूर्ण
          </span>
        </div>

        <div className="divide-y divide-stone-800/60">
          {completedOrders.map((ord) => (
            <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300">#{ord.tokenNumber}</span>
                  <span className="font-semibold text-white">{ord.customer.name}</span>
                </div>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  {ord.items.map((i) => `${i.name} (${i.weight})`).join(", ")}
                </p>
              </div>

              <div className="text-right">
                <span className="font-bold text-white block">₹{ord.totalAmount}</span>
                <span className="text-[10px] text-emerald-400">सफल डिलीवरी</span>
              </div>
            </div>
          ))}

          {completedOrders.length === 0 && (
            <p className="text-xs text-stone-500 py-4 text-center">
              आज अभी तक कोई आर्डर डिलीवर नहीं हुआ है।
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
