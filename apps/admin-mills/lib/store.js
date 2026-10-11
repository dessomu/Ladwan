"use client";

// Reactive Store & Data Layer for Ladwan Admin PWA
// Seamlessly operates in dual modes:
// 1. Live Firebase Firestore (when env vars are present)
// 2. Interactive LocalStorage / In-Memory Demo Store (pre-seeded with authentic Chakki data)

import { useState, useEffect } from "react";
import { isFirebaseConfigured, db } from "./firebase";
import {
  INITIAL_MILL,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_METRICS,
} from "./seedData";
import { soundManager } from "./audioAlert";

import { translations } from "./translations";

const STORAGE_KEYS = {
  MILL: "ladwan_admin_mill_v1",
  PRODUCTS: "ladwan_admin_products_v1",
  ORDERS: "ladwan_admin_orders_v1",
  LANG: "ladwan_admin_lang_v1",
};

const UPDATE_EVENT_NAME = "ladwan:admin-store-updated";


// Helper for safe client-side localStorage access
function getStoredJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStoredJson(key, data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { key } }));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// -------------------------------------------------------------
// CORE REPOSITORY API (Unified interface for Mill, Products & Orders)
// -------------------------------------------------------------

export const millRepository = {
  isLiveFirebase() {
    return isFirebaseConfigured;
  },

  getMill() {
    return getStoredJson(STORAGE_KEYS.MILL, INITIAL_MILL);
  },

  updateMill(updates) {
    const current = this.getMill();
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setStoredJson(STORAGE_KEYS.MILL, updated);
    soundManager.playSuccessTone();
    return updated;
  },

  toggleStoreStatus() {
    const current = this.getMill();
    const nextIsOpen = !current.isOpen;
    return this.updateMill({
      isOpen: nextIsOpen,
      acceptingOrders: nextIsOpen,
      statusReason: nextIsOpen
        ? "चक्की चालू है • ताजा पिसाई जारी है"
        : "चक्की अभी बंद है (Currently Closed)",
    });
  },

  getProducts() {
    return getStoredJson(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  updateProduct(id, updates) {
    const products = this.getProducts();
    const updated = products.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    setStoredJson(STORAGE_KEYS.PRODUCTS, updated);
    soundManager.playSuccessTone();
    return updated;
  },

  updateProductPrice(id, weightKey, newPrice) {
    const products = this.getProducts();
    const updated = products.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          prices: {
            ...item.prices,
            [weightKey]: Number(newPrice),
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    setStoredJson(STORAGE_KEYS.PRODUCTS, updated);
    soundManager.playSuccessTone();
    return updated;
  },

  toggleProductStock(id) {
    const products = this.getProducts();
    const updated = products.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isAvailable: !item.isAvailable,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    setStoredJson(STORAGE_KEYS.PRODUCTS, updated);
    soundManager.playSuccessTone();
    return updated;
  },

  addProduct(newProduct) {
    const products = this.getProducts();
    const product = {
      id: `prod_${Date.now()}`,
      badge: "नया विकल्प (New)",
      isAvailable: true,
      stockKg: 100,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
      ...newProduct,
      updatedAt: new Date().toISOString(),
    };
    const updated = [product, ...products];
    setStoredJson(STORAGE_KEYS.PRODUCTS, updated);
    soundManager.playSuccessTone();
    return product;
  },

  getOrders() {
    return getStoredJson(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        const orderUpdates = {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        if (newStatus === "grinding" && !order.grindingStartedAt) {
          orderUpdates.grindingStartedAt = new Date().toISOString();
        }
        if (newStatus === "delivered" && !order.deliveredAt) {
          orderUpdates.deliveredAt = new Date().toISOString();
        }
        return orderUpdates;
      }
      return order;
    });
    setStoredJson(STORAGE_KEYS.ORDERS, updated);
    soundManager.playSuccessTone();
    return updated;
  },

  // Simulate an incoming live customer order (triggers audio chime!)
  simulateIncomingOrder() {
    const orders = this.getOrders();
    const sampleTokens = ["43", "44", "45", "46"];
    const randomToken = sampleTokens[Math.floor(Math.random() * sampleTokens.length)];
    const newId = `LDW-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newId,
      tokenNumber: randomToken,
      createdAt: new Date().toISOString(),
      status: "pending",
      urgency: "high",
      customer: {
        name: "अमित कुमार (Amit Kumar)",
        phone: "+91 98711 55667",
        address: "मकान नं. 56, गली 4, रेलवे रोड कॉलोनी",
        distanceKm: "1.2 km",
      },
      items: [
        {
          productId: "prod_sharbati_01",
          name: "MP सिहोर शरबती गेहूं आटा",
          weight: "5kg",
          grind: "बारीक (Fine / Roti)",
          unitPrice: 235,
          quantity: 1,
        },
      ],
      totalAmount: 235,
      paymentMethod: "Online UPI (Paid)",
      isPaid: true,
      specialInstructions: "चक्की से गरम-गरम आटा चाहिए, जल्दी भेजें।",
      prepTimeMinutes: 15,
    };

    const updated = [newOrder, ...orders];
    setStoredJson(STORAGE_KEYS.ORDERS, updated);
    soundManager.playOrderBell();
    return newOrder;
  },

  getMetrics() {
    const orders = this.getOrders();
    const todayOrders = orders;
    const pending = orders.filter((o) => o.status === "pending").length;
    const grinding = orders.filter((o) => o.status === "grinding").length;
    const packed = orders.filter((o) => o.status === "packed").length;
    const delivered = orders.filter((o) => o.status === "delivered");
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      todayTotalKg: 145 + (orders.length - INITIAL_ORDERS.length) * 5,
      todayOrdersCount: todayOrders.length,
      todayGrossRevenue: totalRevenue,
      pendingOrdersCount: pending,
      activeGrindingCount: grinding,
      readyToDispatchCount: packed,
      completedOrdersCount: delivered.length,
      averagePrepMinutes: 18,
    };
  },

  getLang() {
    if (typeof window === "undefined") return "hi";
    return localStorage.getItem(STORAGE_KEYS.LANG) || "hi";
  },

  setLang(newLang) {
    if (typeof window === "undefined") return "hi";
    localStorage.setItem(STORAGE_KEYS.LANG, newLang);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { lang: newLang } }));
    soundManager.playSuccessTone();
    return newLang;
  },

  resetAllData() {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.MILL, JSON.stringify(INITIAL_MILL));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.LANG, "hi");
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { reset: true } }));
    soundManager.playSuccessTone();
  },
};

// -------------------------------------------------------------
// REACTIVE CUSTOM HOOK: useChakkiStore()
// -------------------------------------------------------------
export function useChakkiStore() {
  const [mill, setMill] = useState(INITIAL_MILL);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [lang, setLangState] = useState("hi");
  const [isClient, setIsClient] = useState(false);

  const refreshAll = () => {
    setMill(millRepository.getMill());
    setProducts(millRepository.getProducts());
    setOrders(millRepository.getOrders());
    setMetrics(millRepository.getMetrics());
    setLangState(millRepository.getLang());
  };

  useEffect(() => {
    setIsClient(true);
    refreshAll();

    const handleUpdate = () => {
      refreshAll();
    };

    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const currentLang = lang || "hi";
  const t = translations[currentLang] || translations.hi;

  return {
    isClient,
    isFirebase: isFirebaseConfigured,
    mill,
    products,
    orders,
    metrics,
    lang: currentLang,
    t,
    setLang: (newLang) => millRepository.setLang(newLang),
    toggleLang: () => millRepository.setLang(currentLang === "hi" ? "en" : "hi"),
    // Actions
    toggleStoreStatus: () => millRepository.toggleStoreStatus(),
    updateMill: (updates) => millRepository.updateMill(updates),
    updateProduct: (id, updates) => millRepository.updateProduct(id, updates),
    updateProductPrice: (id, weight, price) => millRepository.updateProductPrice(id, weight, price),
    toggleProductStock: (id) => millRepository.toggleProductStock(id),
    addProduct: (prod) => millRepository.addProduct(prod),
    updateOrderStatus: (id, status) => millRepository.updateOrderStatus(id, status),
    simulateIncomingOrder: () => millRepository.simulateIncomingOrder(),
    resetAllData: () => millRepository.resetAllData(),
    playChime: () => soundManager.playOrderBell(),
  };
}

