// apps/customer-pwa/lib/customerStore.js - Reactive Customer Store & Marketplace Orchestrator
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { isFirebaseConfigured } from "@ladwan/firebase";
import {
  listenActiveMills,
  createCustomerOrder,
  listenOrder,
  cancelCustomerOrder,
  submitReview,
} from "@ladwan/firebase/firestore";
import {
  ORDER_STATUS,
  PRESET_LOCALITIES,
} from "@ladwan/firebase/schemas";

import {
  ALL_SEED_MILLS,
  INITIAL_PRODUCTS,
} from "@ladwan/firebase/seed";

import {
  calculateDistanceKm,
  formatDistance,
  calculateDeliveryFee,
  estimateDeliveryMinutes,
  DEFAULT_LOCATION,
} from "./geo.js";
import { soundManager } from "./sound.js";

const STORAGE_KEYS = {
  LOCATION: "ladwan_customer_location_v1",
  CART: "ladwan_customer_cart_v1",
  SELECTED_MILL_ID: "ladwan_customer_mill_v1",
  ACTIVE_ORDER_ID: "ladwan_customer_active_order_v1",
  ORDER_HISTORY: "ladwan_customer_orders_v1",
  LANG: "ladwan_customer_lang_v1",
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

export function useCustomerStore() {
  const [isClient, setIsClient] = useState(false);
  const [lang, setLang] = useState("hi");

  // Location state (defaults to Sonarpur, Kolkata)
  const [location, setLocationState] = useState(() =>
    getStoredJson(STORAGE_KEYS.LOCATION, DEFAULT_LOCATION)
  );

  // Mills state
  const [allMills, setAllMills] = useState(ALL_SEED_MILLS);
  const [selectedMillId, setSelectedMillIdState] = useState(() =>
    getStoredJson(STORAGE_KEYS.SELECTED_MILL_ID, "mill_annapurna_sonarpur_01")
  );

  // Cart state
  const [cart, setCartState] = useState(() =>
    getStoredJson(STORAGE_KEYS.CART, [])
  );

  // Active tracking order ID
  const [activeOrderId, setActiveOrderIdState] = useState(() =>
    getStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, null)
  );
  const [activeOrder, setActiveOrder] = useState(null);

  // Local order history
  const [orderHistory, setOrderHistory] = useState(() =>
    getStoredJson(STORAGE_KEYS.ORDER_HISTORY, [])
  );

  // Client hydration
  useEffect(() => {
    setIsClient(true);
    const savedLang = localStorage.getItem(STORAGE_KEYS.LANG);
    if (savedLang) setLang(savedLang);
  }, []);

  // Sync lang change
  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "hi" ? "en" : "hi";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.LANG, next);
      }
      return next;
    });
  }, []);

  // Set Location
  const setLocation = useCallback((newLoc) => {
    setLocationState(newLoc);
    setStoredJson(STORAGE_KEYS.LOCATION, newLoc);
  }, []);

  // 1. Subscribe to active mills (Live Firestore or Fallback)
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = listenActiveMills((liveMills) => {
        if (liveMills && liveMills.length > 0) {
          setAllMills(liveMills);
        }
      });
      return () => unsub();
    }
  }, []);

  // 2. Compute nearby mills with distances from customer location
  const millsWithDistance = useMemo(() => {
    const custLat = location?.lat ?? DEFAULT_LOCATION.lat;
    const custLng = location?.lng ?? DEFAULT_LOCATION.lng;

    return allMills.map((mill) => {
      const millLat = mill.location?.lat ?? 22.4385;
      const millLng = mill.location?.lng ?? 88.4022;
      const distance = calculateDistanceKm(custLat, custLng, millLat, millLng);
      const radius = mill.deliveryRadiusKm || 5;
      const isWithinRadius = distance <= radius;

      return {
        ...mill,
        distanceKm: distance,
        formattedDistance: formatDistance(distance),
        isWithinRadius,
        eta: estimateDeliveryMinutes(distance),
      };
    });
  }, [allMills, location]);

  // Filter mills that are currently OPEN and within radius
  const nearbyMills = useMemo(() => {
    const withinRadius = millsWithDistance.filter(
      (m) => m.isOpen !== false && m.isWithinRadius
    );
    if (withinRadius.length > 0) {
      return withinRadius.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    // If no mill within strict radius, return closest open mill with a tag
    return millsWithDistance
      .filter((m) => m.isOpen !== false)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [millsWithDistance]);

  // 3. Resolve selected mill
  const selectedMill = useMemo(() => {
    if (!selectedMillId && nearbyMills.length > 0) {
      return nearbyMills[0];
    }
    const found = millsWithDistance.find((m) => m.id === selectedMillId);
    if (found) return found;
    return nearbyMills[0] || millsWithDistance[0];
  }, [selectedMillId, nearbyMills, millsWithDistance]);

  const selectMill = useCallback((millId) => {
    setSelectedMillIdState(millId);
    setStoredJson(STORAGE_KEYS.SELECTED_MILL_ID, millId);
  }, []);

  // 4. Products list (derived from mill inventory or default catalog)
  const products = useMemo(() => {
    // If mill has an active inventory array, use it; otherwise provide rich catalog
    return INITIAL_PRODUCTS.map((p) => {
      // Calculate dynamic price based on mill's pricing or defaults
      return {
        ...p,
        millId: selectedMill?.id,
      };
    });
  }, [selectedMill]);

  // 5. Cart Management
  const addToCart = useCallback(
    (product, weightKey = "5kg", grindOption = "बारीक (रोटी)") => {
      soundManager.playAddCart();
      setCartState((prev) => {
        // Multiplier from weightKey
        const kg =
          weightKey === "1kg"
            ? 1
            : weightKey === "2kg"
            ? 2
            : weightKey === "5kg"
            ? 5
            : weightKey === "10kg"
            ? 10
            : 5;

        const unitPrice =
          product.prices?.[weightKey] ||
          (product.prices?.["1kg"] ? product.prices["1kg"] * kg : 45 * kg);

        const cartItemId = `${product.id}_${weightKey}_${grindOption}`;

        const existingIndex = prev.findIndex((item) => item.id === cartItemId);
        let updated;
        if (existingIndex > -1) {
          updated = [...prev];
          const cur = updated[existingIndex];
          updated[existingIndex] = {
            ...cur,
            quantity: cur.quantity + 1,
            totalKg: (cur.quantity + 1) * kg,
            totalPrice: (cur.quantity + 1) * unitPrice,
          };
        } else {
          const newItem = {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            englishName: product.englishName,
            category: product.category,
            badge: product.badge,
            weightKey,
            kgPerUnit: kg,
            grindOption,
            quantity: 1,
            totalKg: kg,
            unitPrice,
            totalPrice: unitPrice,
            imageUrl: product.imageUrl,
            millId: selectedMill?.id,
            millName: selectedMill?.name,
          };
          updated = [...prev, newItem];
        }

        setStoredJson(STORAGE_KEYS.CART, updated);
        return updated;
      });
    },
    [selectedMill]
  );

  const updateCartQuantity = useCallback((cartItemId, delta) => {
    setCartState((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              totalKg: nextQty * item.kgPerUnit,
              totalPrice: nextQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean);

      setStoredJson(STORAGE_KEYS.CART, updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCartState((prev) => {
      const updated = prev.filter((item) => item.id !== cartItemId);
      setStoredJson(STORAGE_KEYS.CART, updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartState([]);
    setStoredJson(STORAGE_KEYS.CART, []);
  }, []);

  // Cart calculations
  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalKg = cart.reduce((sum, item) => sum + item.totalKg, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const delivery = calculateDeliveryFee(subtotal);

    return {
      subtotal,
      totalKg,
      totalItems,
      deliveryFee: delivery.fee,
      isFreeDelivery: delivery.isFree,
      amountNeededForFree: delivery.amountNeededForFree,
      totalAmount: subtotal + delivery.fee,
    };
  }, [cart]);

  // 6. Live Order Subscription
  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrder(null);
      return;
    }

    if (isFirebaseConfigured) {
      const unsub = listenOrder(activeOrderId, (orderData) => {
        if (orderData) {
          setActiveOrder((prev) => {
            // Ding if status changed
            if (prev && prev.orderStatus !== orderData.orderStatus) {
              soundManager.playStatusDing();
            }
            return orderData;
          });
        }
      });
      return () => unsub();
    } else {
      // Demo mode fallback: read from local order history
      const local = orderHistory.find((o) => o.id === activeOrderId);
      if (local) setActiveOrder(local);
    }
  }, [activeOrderId, orderHistory]);

  // Place Order Action
  const placeOrder = useCallback(
    async ({ customerName, customerPhone, addressDetails, paymentMethod, transactionRef }) => {
      // Validate Mill status & cart
      if (!selectedMill || selectedMill.isOpen === false) {
        throw new Error(
          "चक्की फिलहाल बंद है। कृपया किसी अन्य खुली चक्की का चयन करें। (Selected mill is currently closed. Please select an alternate mill.)"
        );
      }

      if (cart.length === 0) {
        throw new Error("आपकी टोकरी खाली है (Cart is empty).");
      }

      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orderNumber = `LDW-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        id: orderId,
        orderNumber,
        customerId: "cust_" + (customerPhone ? customerPhone.replace(/\D/g, "") : Date.now()),
        customerName: customerName || "ग्राहक (Customer)",
        customerPhone: customerPhone || "+91 98000 00000",
        deliveryAddress: {
          address: addressDetails.address || location.name,
          area: addressDetails.area || location.area || "",
          city: addressDetails.city || location.city || "Kolkata",
          pincode: addressDetails.pincode || location.pincode || "",
          instructions: addressDetails.instructions || "",
          lat: location.lat,
          lng: location.lng,
        },
        millId: selectedMill.id,
        millName: selectedMill.name,
        millEnglishName: selectedMill.englishName,
        millPhone: selectedMill.phone,
        items: cart.map((it) => ({
          productId: it.productId,
          name: it.name,
          englishName: it.englishName,
          category: it.category,
          weightKey: it.weightKey,
          quantity: it.quantity,
          quantityKg: it.totalKg,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          grindOption: it.grindOption,
          imageUrl: it.imageUrl,
        })),
        subtotal: cartSummary.subtotal,
        deliveryFee: cartSummary.deliveryFee,
        totalAmount: cartSummary.totalAmount,
        totalKg: cartSummary.totalKg,
        paymentMethod: paymentMethod || "cod",
        paymentStatus:
          paymentMethod === "upi" ? "payment_verification_pending" : "pending",
        orderStatus: "placed",
        transactionRef: transactionRef || "",
        deliveryBoyId: null,
        deliveryBoyName: null,
        deliveryBoyPhone: null,
        estimatedDeliveryMinutes: selectedMill.eta || "30-45 मिनट",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Live Firestore write
      if (isFirebaseConfigured) {
        await createCustomerOrder(newOrder);
      }

      // Update local history
      const updatedHistory = [newOrder, ...orderHistory];
      setOrderHistory(updatedHistory);
      setStoredJson(STORAGE_KEYS.ORDER_HISTORY, updatedHistory);

      // Set active tracking order
      setActiveOrderIdState(orderId);
      setActiveOrder(newOrder);
      setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, orderId);

      // Play celebration sound & clear cart
      soundManager.playOrderConfirmed();
      clearCart();

      return newOrder;
    },
    [cart, cartSummary, selectedMill, location, orderHistory, clearCart]
  );

  // Cancel Order Action
  const cancelOrder = useCallback(
    async (orderId, reason = "Customer cancelled order") => {
      if (isFirebaseConfigured) {
        const res = await cancelCustomerOrder(orderId, reason);
        if (!res.success) {
          throw new Error(res.error || "Order cancellation failed");
        }
      }

      // Local state update
      const now = new Date().toISOString();
      const updatedHistory = orderHistory.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: "cancelled",
            status: "cancelled",
            cancellationReason: reason,
            cancelledAt: now,
          };
        }
        return ord;
      });

      setOrderHistory(updatedHistory);
      setStoredJson(STORAGE_KEYS.ORDER_HISTORY, updatedHistory);

      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder((prev) => ({
          ...prev,
          orderStatus: "cancelled",
          status: "cancelled",
          cancellationReason: reason,
          cancelledAt: now,
        }));
      }

      return true;
    },
    [orderHistory, activeOrder]
  );

  // Advance Order Status (for simulation / testing)
  const advanceOrderStatus = useCallback(
    (orderId) => {
      const flow = [
        "placed",
        "accepted",
        "grinding",
        "packed",
        "out_for_delivery",
        "delivered",
      ];

      setOrderHistory((prev) => {
        const updated = prev.map((ord) => {
          if (ord.id === orderId) {
            const curIdx = flow.indexOf(ord.orderStatus || "placed");
            const nextIdx = Math.min(flow.length - 1, curIdx + 1);
            const nextStatus = flow[nextIdx];
            return {
              ...ord,
              orderStatus: nextStatus,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return ord;
        });
        setStoredJson(STORAGE_KEYS.ORDER_HISTORY, updated);
        return updated;
      });

      setActiveOrder((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        const curIdx = flow.indexOf(prev.orderStatus || "placed");
        const nextIdx = Math.min(flow.length - 1, curIdx + 1);
        const nextStatus = flow[nextIdx];
        soundManager.playStatusDing();
        return {
          ...prev,
          orderStatus: nextStatus,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // Submit Review
  const submitOrderReview = useCallback(
    async ({ orderId, millId, rating, comment, tags }) => {
      const reviewObj = {
        id: `rev_${Date.now()}`,
        orderId,
        millId,
        rating: Number(rating) || 5,
        comment: comment || "",
        tags: tags || [],
        createdAt: new Date().toISOString(),
      };

      if (isFirebaseConfigured) {
        await submitReview(reviewObj);
      }

      // Mark order as reviewed locally
      setOrderHistory((prev) => {
        const updated = prev.map((o) =>
          o.id === orderId ? { ...o, isReviewed: true, rating } : o
        );
        setStoredJson(STORAGE_KEYS.ORDER_HISTORY, updated);
        return updated;
      });

      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder((prev) => ({ ...prev, isReviewed: true, rating }));
      }

      return true;
    },
    [activeOrder]
  );

  return {
    isClient,
    lang,
    setLang,
    toggleLang,
    location,
    setLocation,
    allMills,
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
    activeOrderId,
    activeOrder,
    setActiveOrderId: (id) => {
      setActiveOrderIdState(id);
      setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, id);
    },
    orderHistory,
    placeOrder,
    cancelOrder,
    advanceOrderStatus,
    submitOrderReview,
  };
}
