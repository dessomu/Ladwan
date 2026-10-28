// apps/delivery-boy/lib/deliveryStore.js
// Reactive store for the Ladwan Delivery Agent PWA.
// Handles order listening, status updates, and local fallback for demo mode.
// Dual-mode: Live Firestore when configured, localStorage demo when not.
"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import { isFirebaseConfigured } from "@ladwan/database";
import {
  listenDeliveryOrders,
  listenOrder,
  markOrderDelivered,
  updateOrderStatus,
  updateOrderLiveTracking,
} from "@ladwan/database/firestore";
import {
  calculateBearing,
  calculateDistanceKm,
  formatDistance,
  formatEta,
  generateRouteWaypoints,
} from "@ladwan/database/geo";
import {
  ORDER_STATUS,
  ORDER_TRACKING_STEPS,
} from "@ladwan/database/schemas";

// ── Storage Keys ──────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  AGENT_PROFILE: "ladwan_delivery_agent_v1",
  ACTIVE_ORDER_ID: "ladwan_delivery_active_order_v1",
  ORDER_HISTORY: "ladwan_delivery_orders_v1",
  LANG: "ladwan_delivery_lang_v1",
};

// ── Default agent profile (Sonarpur Delivery Hub ~0.3 km from mill) ───────────
const DEFAULT_AGENT = {
  id: "delivery_boy_sonarpur_01",
  name: "राजू डिलीवरी",
  englishName: "Raju Delivery",
  phone: "+91 98000 11111",
  isOnline: true,
  currentLat: 22.4395,
  currentLng: 88.4050,
};

function getStoredJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredJson(key, val) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ── Main Reactive Hook ────────────────────────────────────────────────────────

/**
 * useDeliveryStore()
 *
 * Core hook for the delivery-boy app. Provides:
 *  - `orders`      – real-time list of orders assigned to this agent (or pool)
 *  - `activeOrder` – the order the agent is currently delivering
 *  - `agentProfile`– agent identity and online status
 *  - `markDelivered(orderId, extra)` – mark an order as delivered in Firestore
 *  - `acceptOrder(orderId)` – claim an unassigned pool order
 *  - `lang` / `toggleLang` – bilingual support
 *
 * @returns {object}
 */
export function useDeliveryStore() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [lang, setLangState] = useState("hi");
  const [agentProfile, setAgentProfile] = useState(DEFAULT_AGENT);

  // Live orders from Firestore or local fallback
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderIdState] = useState(null);
  const [firebaseActiveOrder, setFirebaseActiveOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  const previousOrderIdsRef = useRef(new Set());

  // ── Client hydration ──────────────────────────────────────────────────────
  useEffect(() => {
    queueMicrotask(() => {
      const savedLang = localStorage.getItem(STORAGE_KEYS.LANG) || "hi";
      if (savedLang) setLangState(savedLang);

      const savedAgent = getStoredJson(STORAGE_KEYS.AGENT_PROFILE, null);
      if (savedAgent) setAgentProfile({ ...DEFAULT_AGENT, ...savedAgent });

      const savedActiveId = getStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, null);
      if (savedActiveId) setActiveOrderIdState(savedActiveId);

      const savedHistory = getStoredJson(STORAGE_KEYS.ORDER_HISTORY, []);
      setOrderHistory(savedHistory);
    });
  }, []);

  // ── Language toggle ───────────────────────────────────────────────────────
  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "hi" ? "en" : "hi";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.LANG, next);
      }
      return next;
    });
  }, []);

  // ── Toggle online/offline status ──────────────────────────────────────────
  const toggleOnlineStatus = useCallback(() => {
    setAgentProfile((prev) => {
      const updated = { ...prev, isOnline: !prev.isOnline };
      setStoredJson(STORAGE_KEYS.AGENT_PROFILE, updated);
      return updated;
    });
  }, []);

  // ── Subscribe to delivery orders ──────────────────────────────────────────
  useEffect(() => {
    const agentId = agentProfile?.id || DEFAULT_AGENT.id;

    if (isFirebaseConfigured) {
      // Live Firestore: listen to assigned orders + unassigned out_for_delivery / packed pool
      const unsub = listenDeliveryOrders(agentId, (liveOrders) => {
        const prevIds = previousOrderIdsRef.current;
        const hasNew = liveOrders.some(
          (o) =>
            !prevIds.has(o.id) &&
            (o.status === "out_for_delivery" || o.status === "packed" || o.deliveryBoyId === agentId)
        );
        if (hasNew && prevIds.size > 0) {
          // Play notification sound when new delivery appears
          if (typeof window !== "undefined") {
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 880;
              gain.gain.value = 0.1;
              osc.start();
              setTimeout(() => { osc.frequency.value = 1100; }, 100);
              setTimeout(() => { osc.stop(); ctx.close(); }, 350);
            } catch {}
          }
        }
        previousOrderIdsRef.current = new Set(liveOrders.map((o) => o.id));
        setOrders(liveOrders);

        // Persist delivery pool locally
        setStoredJson(STORAGE_KEYS.ORDER_HISTORY, liveOrders);
      });

      return () => unsub();
    }
  }, [agentProfile?.id]);

  // ── Auto-resume active delivery or clear stale active order ───────────────
  useEffect(() => {
    const agentId = agentProfile?.id || DEFAULT_AGENT.id;
    if (activeOrderId) {
      // If activeOrderId no longer exists in current orders (e.g. after reset or delivered), clear it
      const exists = orders.some(
        (o) => o.id === activeOrderId && o.status === "out_for_delivery"
      );
      if (!exists) {
        setActiveOrderIdState(null);
        setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, null);
      }
    } else if (orders.length > 0) {
      const claimedActive = orders.find(
        (o) => o.status === "out_for_delivery" && o.deliveryBoyId === agentId
      );
      if (claimedActive) {
        setActiveOrderIdState(claimedActive.id);
        setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, claimedActive.id);
      }
    }
  }, [activeOrderId, orders, agentProfile]);

  // ── Track active order ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeOrderId || !isFirebaseConfigured) {
      return;
    }

    const unsub = listenOrder(activeOrderId, (orderData) => {
      setFirebaseActiveOrder(orderData);
    });
    return () => {
      unsub();
      setFirebaseActiveOrder(null);
    };
  }, [activeOrderId]);

  const activeOrder = useMemo(() => {
    if (!activeOrderId) return null;
    if (isFirebaseConfigured) return firebaseActiveOrder;
    return orders.find((o) => o.id === activeOrderId) || null;
  }, [activeOrderId, firebaseActiveOrder, orders]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Accept (claim) an unassigned pool order.
   * Writes deliveryBoyId to the order document so it disappears from the pool
   * and becomes "owned" by this agent.
   */
  const acceptOrder = useCallback(
    async (orderId) => {
      const agentId = agentProfile?.id || DEFAULT_AGENT.id;

      if (isFirebaseConfigured) {
        const agentName = agentProfile?.name || DEFAULT_AGENT.name;
        const agentEnglishName = agentProfile?.englishName || DEFAULT_AGENT.englishName;
        const agentPhone = agentProfile?.phone || DEFAULT_AGENT.phone;
        await updateOrderStatus(orderId, "out_for_delivery", {
          deliveryBoyId: agentId,
          deliveryBoyName: agentName,
          deliveryBoyPhone: agentPhone,
          deliveryPartner: {
            name: agentName,
            englishName: agentEnglishName,
            phone: agentPhone,
          },
          dispatchedAt: new Date().toISOString(),
        });
      }

      setActiveOrderIdState(orderId);
      setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, orderId);
    },
    [agentProfile]
  );

  /**
   * Mark an order as delivered.
   * Writes status: "delivered", paymentStatus: "paid", deliveredAt timestamp.
   * @param {string} orderId
   * @param {object} [extra] - Optional delivery notes, photoUrl, etc.
   */
  const markDelivered = useCallback(
    async (orderId, extra = {}) => {
      if (isFirebaseConfigured) {
        await markOrderDelivered(orderId, extra);
      }

      // Move out of active
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: "delivered", orderStatus: "delivered", isPaid: true }
            : o
        )
      );

      if (activeOrderId === orderId) {
        setActiveOrderIdState(null);
        setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, null);
      }

      return true;
    },
    [activeOrderId]
  );

  // ── Derived metrics ───────────────────────────────────────────────────────
  const pendingDeliveries = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === "out_for_delivery" &&
        !o.deliveryBoyId &&
        o.id !== activeOrderId
    );
  }, [orders, activeOrderId]);

  const completedToday = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== "delivered") return false;
      const d = new Date(o.deliveredAt || o.updatedAt || 0);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    });
  }, [orders]);

  const earningsToday = useMemo(() => {
    return completedToday.reduce(
      (sum, o) => sum + (o.deliveryFee || 25),
      0
    );
  }, [completedToday]);

  return {
    isClient,
    lang,
    toggleLang,
    agentProfile,
    toggleOnlineStatus,
    orders,
    pendingDeliveries,
    completedToday,
    earningsToday,
    activeOrder,
    activeOrderId,
    setActiveOrderId: (id) => {
      setActiveOrderIdState(id);
      setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, id);
    },
    acceptOrder,
    markDelivered,
    isFirebase: isFirebaseConfigured,
  };
}
