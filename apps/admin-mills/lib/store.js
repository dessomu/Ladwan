"use client";

// Reactive Store & Data Layer for Ladwan Admin PWA
// Seamlessly operates in dual modes:
// 1. Live Firebase Firestore (when env vars are present)
// 2. Interactive LocalStorage / In-Memory Demo Store (pre-seeded with authentic Chakki data)

import { useState, useEffect, useRef } from "react";
import { isFirebaseConfigured, db } from "./firebase";
import {
  saveMill,
  listenMill,
  saveProduct,
  listenProducts,
  listenOrders,
  updateOrderStatus as firestoreUpdateOrderStatus,
  saveOrder,
  initializeMillInventory,
  updateInventoryStock,
  deleteInventoryItem,
} from "@ladwan/firebase/firestore";
import {
  INITIAL_MILL,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_METRICS,
  MASTER_CATALOG,
} from "./seedData";
import { soundManager } from "./audioAlert";
import { translations } from "./translations";

const STORAGE_KEYS = {
  MILL: "ladwan_admin_mill_v2",
  PRODUCTS: "ladwan_admin_products_v2",
  ORDERS: "ladwan_admin_orders_v2",
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

// Helper to calculate metrics from any orders array
function calculateMetrics(orders = []) {
  const pending = orders.filter((o) => o.status === "pending").length;
  const grinding = orders.filter((o) => o.status === "grinding" || o.status === "in_milling").length;
  const packed = orders.filter((o) => o.status === "packed").length;
  const delivered = orders.filter((o) => o.status === "delivered");
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalKg = orders.reduce((sum, o) => {
    const itemsKg = (o.items || []).reduce((iSum, it) => {
      const match = String(it.weight || "").match(/(\d+)/);
      const kg = match ? Number(match[1]) : 5;
      return iSum + kg * (it.quantity || 1);
    }, 0);
    return sum + itemsKg;
  }, 0);

  return {
    todayTotalKg: totalKg,
    todayOrdersCount: orders.length,
    todayGrossRevenue: totalRevenue,
    pendingOrdersCount: pending,
    activeGrindingCount: grinding,
    readyToDispatchCount: packed,
    completedOrdersCount: delivered.length,
    averagePrepMinutes: 18,
  };
}

function isDemoId(millId) {
  return !millId || millId === "mill_shree_ram_01" || millId === "mill_krishna_02";
}

// -------------------------------------------------------------
// CORE REPOSITORY API (Unified interface for Mill, Products & Orders)
// -------------------------------------------------------------

export const millRepository = {
  isLiveFirebase() {
    return isFirebaseConfigured;
  },

  getMill(millId = "mill_shree_ram_01") {
    const isDemo = isDemoId(millId);
    const storageKey = isDemo ? STORAGE_KEYS.MILL : `${STORAGE_KEYS.MILL}_${millId}`;
    const fallback = isDemo ? INITIAL_MILL : { id: millId, name: "लोड हो रहा है...", isOpen: true };
    return getStoredJson(storageKey, fallback);
  },

  updateMill(updates, millId = "mill_shree_ram_01") {
    const current = this.getMill(millId);
    const updated = {
      ...current,
      ...updates,
      id: millId || current.id || INITIAL_MILL.id,
      updatedAt: new Date().toISOString(),
    };
    const storageKey = isDemoId(millId) ? STORAGE_KEYS.MILL : `${STORAGE_KEYS.MILL}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured) {
      saveMill(updated).catch((err) => console.error("[Firestore] saveMill error:", err));
    }

    return updated;
  },

  toggleStoreStatus(millId = "mill_shree_ram_01") {
    const current = this.getMill(millId);
    const nextIsOpen = !current.isOpen;
    return this.updateMill(
      {
        isOpen: nextIsOpen,
        acceptingOrders: nextIsOpen,
        statusReason: nextIsOpen
          ? "चक्की चालू है • ताजा पिसाई जारी है"
          : "चक्की अभी बंद है (Currently Closed)",
      },
      millId
    );
  },

  getProducts(millId = "mill_shree_ram_01") {
    const isDemo = isDemoId(millId);
    const storageKey = isDemo ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    const fallback = isDemo ? INITIAL_PRODUCTS : [];
    const stored = getStoredJson(storageKey, fallback);

    if (isDemo) {
      return stored.map((p) => {
        const initial = INITIAL_PRODUCTS.find((init) => init.id === p.id);
        if (initial) {
          return {
            ...p,
            englishDescription: p.englishDescription || initial.englishDescription,
            englishBadge: p.englishBadge || initial.englishBadge,
            englishGrindOptions: p.englishGrindOptions || initial.englishGrindOptions,
          };
        }
        return p;
      });
    }

    return stored;
  },

  updateProduct(id, updates, millId = "mill_shree_ram_01") {
    const products = this.getProducts(millId);
    let updatedItem = null;
    const updated = products.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });

    const storageKey = isDemoId(millId) ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured && updatedItem) {
      saveProduct(millId, updatedItem).catch((err) =>
        console.error("[Firestore] saveProduct error:", err)
      );
    }

    return updated;
  },

  updateProductPrice(id, weightKey, newPrice, millId = "mill_shree_ram_01") {
    const products = this.getProducts(millId);
    let updatedItem = null;
    const updated = products.map((item) => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          prices: {
            ...item.prices,
            [weightKey]: Number(newPrice),
          },
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    });

    const storageKey = isDemoId(millId) ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured && updatedItem) {
      saveProduct(millId, updatedItem).catch((err) =>
        console.error("[Firestore] saveProduct error:", err)
      );
    }

    return updated;
  },

  toggleProductStock(id, millId = "mill_shree_ram_01") {
    const products = this.getProducts(millId);
    let updatedItem = null;
    const updated = products.map((item) => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          isAvailable: !item.isAvailable,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    });

    const storageKey = isDemoId(millId) ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured && updatedItem) {
      saveProduct(millId, updatedItem).catch((err) =>
        console.error("[Firestore] saveProduct error:", err)
      );
    }

    return updated;
  },

  addProduct(newProduct, millId = "mill_shree_ram_01") {
    const products = this.getProducts(millId);
    const product = {
      id: `prod_${Date.now()}`,
      badge: "नया विकल्प (New)",
      isAvailable: true,
      stockKg: 100,
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
      ...newProduct,
      updatedAt: new Date().toISOString(),
    };
    const updated = [product, ...products];
    const storageKey = isDemoId(millId) ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured) {
      saveProduct(millId, product).catch((err) =>
        console.error("[Firestore] addProduct error:", err)
      );
    }

    return product;
  },

  initializeInventory(items, millId = "mill_shree_ram_01") {
    const formatted = items.map((it) => ({
      ...it,
      millId,
      stockKg: Number(it.stockKg || 0),
      isAvailable: Number(it.stockKg || 0) > 0 && it.isAvailable !== false,
      updatedAt: new Date().toISOString(),
    }));

    const storageKey = isDemoId(millId) ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    setStoredJson(storageKey, formatted);
    soundManager.playSuccessTone();

    // Live Firestore batch write to mills/{millId}/inventory/{productId}
    if (isFirebaseConfigured) {
      initializeMillInventory(millId, formatted).catch((err) =>
        console.error("[Firestore] initializeMillInventory error:", err)
      );
    }

    return formatted;
  },

  updateStockKg(productId, newStockKg, millId = "mill_shree_ram_01") {
    const products = this.getProducts(millId);
    const validStock = Math.max(0, Number(newStockKg) || 0);
    let updatedItem = null;

    const updated = products.map((item) => {
      if (item.id === productId) {
        updatedItem = {
          ...item,
          stockKg: validStock,
          isAvailable: validStock > 0,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    });

    const storageKey = isDemoId(millId) ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured && updatedItem) {
      updateInventoryStock(millId, productId, validStock).catch((err) =>
        console.error("[Firestore] updateInventoryStock error:", err)
      );
    }

    return updated;
  },

  deleteInventoryItem(productId, millId = "mill_shree_ram_01") {
    const products = this.getProducts(millId);
    const updated = products.filter((item) => item.id !== productId);

    const storageKey = isDemoId(millId) ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured) {
      deleteInventoryItem(millId, productId).catch((err) =>
        console.error("[Firestore] deleteInventoryItem error:", err)
      );
    }

    return updated;
  },

  getOrders(millId = "mill_shree_ram_01") {
    const isDemo = isDemoId(millId);
    const storageKey = isDemo ? STORAGE_KEYS.ORDERS : `${STORAGE_KEYS.ORDERS}_${millId}`;
    const fallback = isDemo ? INITIAL_ORDERS : [];
    const stored = getStoredJson(storageKey, fallback);

    if (isDemo) {
      return stored.map((o) => {
        const initial = INITIAL_ORDERS.find((init) => init.id === o.id);
        if (initial) {
          return {
            ...o,
            customer: {
              ...o.customer,
              englishName: o.customer?.englishName || initial.customer?.englishName,
              englishAddress: o.customer?.englishAddress || initial.customer?.englishAddress,
            },
            items: (o.items || []).map((item, idx) => {
              const initialItem = initial.items?.[idx];
              return {
                ...item,
                englishName: item.englishName || initialItem?.englishName,
                englishGrind: item.englishGrind || initialItem?.englishGrind,
              };
            }),
            englishSpecialInstructions:
              o.englishSpecialInstructions || initial.englishSpecialInstructions,
          };
        }
        return o;
      });
    }

    return stored;
  },

  updateOrderStatus(orderId, newStatus, millId = "mill_shree_ram_01") {
    const orders = this.getOrders(millId);
    let orderUpdates = null;
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        orderUpdates = {
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

    const storageKey = isDemoId(millId) ? STORAGE_KEYS.ORDERS : `${STORAGE_KEYS.ORDERS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playSuccessTone();

    // Live Firestore sync
    if (isFirebaseConfigured && orderUpdates) {
      firestoreUpdateOrderStatus(orderId, newStatus, {
        ...(orderUpdates.grindingStartedAt ? { grindingStartedAt: orderUpdates.grindingStartedAt } : {}),
        ...(orderUpdates.deliveredAt ? { deliveredAt: orderUpdates.deliveredAt } : {}),
      }).catch((err) => console.error("[Firestore] updateOrderStatus error:", err));
    }

    return updated;
  },

  // Simulate an incoming live customer order (triggers audio chime!)
  simulateIncomingOrder(millId = "mill_shree_ram_01") {
    const orders = this.getOrders(millId);
    const sampleTokens = ["43", "44", "45", "46"];
    const randomToken = sampleTokens[Math.floor(Math.random() * sampleTokens.length)];
    const newId = `LDW-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newId,
      tokenNumber: randomToken,
      createdAt: new Date().toISOString(),
      status: "pending",
      urgency: "high",
      millId: millId || "mill_shree_ram_01",
      customer: {
        name: "अमित कुमार",
        englishName: "Amit Kumar",
        phone: "+91 98711 55667",
        address: "मकान नं. 56, गली 4, रेलवे रोड कॉलोनी",
        englishAddress: "House No. 56, Street 4, Railway Road Colony",
        distanceKm: "1.2 km",
      },
      items: [
        {
          productId: "prod_sample_01",
          name: "MP सिहोर शरबती गेहूं आटा",
          englishName: "MP Sehore Sharbati Wheat Atta",
          weight: "5kg",
          grind: "बारीक (रोटी)",
          englishGrind: "Fine (Roti)",
          unitPrice: 235,
          quantity: 1,
        },
      ],
      totalAmount: 235,
      paymentMethod: "Online UPI (Paid)",
      isPaid: true,
      specialInstructions: "चक्की से गरम-गरम आटा चाहिए, जल्दी भेजें।",
      englishSpecialInstructions: "Need freshly milled warm flour, please dispatch quickly.",
      prepTimeMinutes: 15,
    };

    const updated = [newOrder, ...orders];
    const storageKey = isDemoId(millId) ? STORAGE_KEYS.ORDERS : `${STORAGE_KEYS.ORDERS}_${millId}`;
    setStoredJson(storageKey, updated);
    soundManager.playOrderBell();

    // Live Firestore sync
    if (isFirebaseConfigured) {
      saveOrder(newOrder).catch((err) => console.error("[Firestore] saveOrder error:", err));
    }

    return newOrder;
  },

  getMetrics(millId = "mill_shree_ram_01") {
    const orders = this.getOrders(millId);
    return calculateMetrics(orders);
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
// REACTIVE CUSTOM HOOK: useChakkiStore(millId)
// -------------------------------------------------------------
export function useChakkiStore(activeMillId) {
  const isDemoMill = isDemoId(activeMillId);
  const effectiveMillId = activeMillId || "mill_shree_ram_01";

  const [mill, setMill] = useState(() => millRepository.getMill(effectiveMillId));
  const [products, setProducts] = useState(() => millRepository.getProducts(effectiveMillId));
  const [orders, setOrders] = useState(() => millRepository.getOrders(effectiveMillId));
  const [metrics, setMetrics] = useState(() => calculateMetrics(millRepository.getOrders(effectiveMillId)));
  const [lang, setLangState] = useState("hi");
  const [isClient, setIsClient] = useState(false);

  const previousOrderIdsRef = useRef(new Set());

  const refreshFromLocalStorage = () => {
    setMill(millRepository.getMill(effectiveMillId));
    setProducts(millRepository.getProducts(effectiveMillId));
    const currentOrders = millRepository.getOrders(effectiveMillId);
    setOrders(currentOrders);
    setMetrics(calculateMetrics(currentOrders));
    setLangState(millRepository.getLang());
  };

  useEffect(() => {
    setIsClient(true);
    refreshFromLocalStorage();

    // 1. Local / Custom Event Listeners
    const handleUpdate = () => {
      refreshFromLocalStorage();
    };

    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // 2. Real-time Cloud Firestore Listeners (when Live Firebase is active)
    let unsubMill = null;
    let unsubProducts = null;
    let unsubOrders = null;

    if (isFirebaseConfigured && effectiveMillId) {
      console.log(`[Ladwan Store] ⚡ Attaching live Firestore listeners for mill: ${effectiveMillId}`);

      // Listen to Mill document changes
      unsubMill = listenMill(effectiveMillId, (cloudMill) => {
        if (cloudMill) {
          setMill(cloudMill);
          const storageKey = isDemoMill ? STORAGE_KEYS.MILL : `${STORAGE_KEYS.MILL}_${effectiveMillId}`;
          setStoredJson(storageKey, cloudMill);
        }
      });

      // Listen to Products subcollection (clean array, even if 0 products)
      unsubProducts = listenProducts(effectiveMillId, (cloudProducts) => {
        if (cloudProducts) {
          setProducts(cloudProducts);
          const storageKey = isDemoMill ? STORAGE_KEYS.PRODUCTS : `${STORAGE_KEYS.PRODUCTS}_${effectiveMillId}`;
          setStoredJson(storageKey, cloudProducts);
        }
      });

      // Listen to Orders collection for this mill (real-time live orders)
      unsubOrders = listenOrders(effectiveMillId, (cloudOrders) => {
        if (cloudOrders) {
          // Detect new incoming order to trigger audio chime
          const prevIds = previousOrderIdsRef.current;
          const hasNewPending = cloudOrders.some(
            (o) => !prevIds.has(o.id) && o.status === "pending"
          );
          if (hasNewPending && prevIds.size > 0) {
            soundManager.playOrderBell();
          }

          previousOrderIdsRef.current = new Set(cloudOrders.map((o) => o.id));
          setOrders(cloudOrders);
          setMetrics(calculateMetrics(cloudOrders));
          const storageKey = isDemoMill ? STORAGE_KEYS.ORDERS : `${STORAGE_KEYS.ORDERS}_${effectiveMillId}`;
          setStoredJson(storageKey, cloudOrders);
        }
      });
    }

    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      if (typeof unsubMill === "function") unsubMill();
      if (typeof unsubProducts === "function") unsubProducts();
      if (typeof unsubOrders === "function") unsubOrders();
    };
  }, [effectiveMillId, isDemoMill]);

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
    // Actions wired with effectiveMillId
    toggleStoreStatus: () => millRepository.toggleStoreStatus(effectiveMillId),
    updateMill: (updates) => millRepository.updateMill(updates, effectiveMillId),
    updateProduct: (id, updates) => millRepository.updateProduct(id, updates, effectiveMillId),
    updateProductPrice: (id, weight, price) =>
      millRepository.updateProductPrice(id, weight, price, effectiveMillId),
    toggleProductStock: (id) => millRepository.toggleProductStock(id, effectiveMillId),
    addProduct: (prod) => millRepository.addProduct(prod, effectiveMillId),
    initializeInventory: (items) =>
      millRepository.initializeInventory(items, effectiveMillId),
    updateStockKg: (productId, newStockKg) =>
      millRepository.updateStockKg(productId, newStockKg, effectiveMillId),
    deleteInventoryItem: (productId) =>
      millRepository.deleteInventoryItem(productId, effectiveMillId),
    masterCatalog: MASTER_CATALOG,
    updateOrderStatus: (id, status) =>
      millRepository.updateOrderStatus(id, status, effectiveMillId),
    simulateIncomingOrder: () => millRepository.simulateIncomingOrder(effectiveMillId),
    resetAllData: () => millRepository.resetAllData(),
    playChime: () => soundManager.playOrderBell(),
  };
}
