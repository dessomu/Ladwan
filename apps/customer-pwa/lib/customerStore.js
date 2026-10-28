// apps/customer-pwa/lib/customerStore.js - Reactive Customer Store & Marketplace Orchestrator
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { isFirebaseConfigured } from "@ladwan/database";
import {
  listenActiveMills,
  createCustomerOrder,
  listenOrder,
  cancelCustomerOrder,
  submitReview,
  listenInventory,
} from "@ladwan/database/firestore";
import {
  ORDER_STATUS,
  PRESET_LOCALITIES,
} from "@ladwan/database/schemas";

import {
  ALL_SEED_MILLS,
  INITIAL_PRODUCTS,
} from "@ladwan/database/seed";

import {
  calculateDistanceKm,
  formatDistance,
  calculateDeliveryFee,
  estimateDeliveryMinutes,
  DEFAULT_LOCATION,
} from "./geo.js";
import { soundManager } from "./sound.js";
import { translations } from "./translations.js";

const STORAGE_KEYS = {
  LOCATION: "ladwan_customer_location_v1",
  CART: "ladwan_customer_cart_v1",
  SELECTED_MILL_ID: "ladwan_customer_mill_v1",
  ACTIVE_ORDER_ID: "ladwan_customer_active_order_v1",
  ORDER_HISTORY: "ladwan_customer_orders_v1",
  LANG: "ladwan_customer_lang_v1",
  PROFILE: "ladwan_customer_profile_v1",
};

const DEFAULT_PROFILE = {
  name: "सोमनाथ बैद्य",
  englishName: "Somnath Baidya",
  phone: "8918119210",
  houseFlat: "फ्लैट 4B, ग्रीनफील्ड सिटी",
  englishHouseFlat: "Flat 4B, Greenfield City",
  streetArea: "स्टेशन रोड, सोनारपुर",
  englishStreetArea: "Station Road, Sonarpur",
  landmark: "सोनारपुर रेलवे स्टेशन के निकट",
  englishLandmark: "Near Sonarpur Railway Station",
  defaultGrind: "बारीक (रोटी)",
  englishDefaultGrind: "Fine (Roti)",
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

export function calculatePrice(pricesOrProduct, weightKey = "5kg") {
  const kg =
    weightKey === "1kg"
      ? 1
      : weightKey === "2kg"
      ? 2
      : weightKey === "5kg"
      ? 5
      : weightKey === "10kg"
      ? 10
      : 1;

  if (!pricesOrProduct) return 45 * kg;

  let prices = pricesOrProduct;
  let singlePrice = 0;

  if (typeof pricesOrProduct === "object") {
    if (pricesOrProduct.prices && typeof pricesOrProduct.prices === "object") {
      prices = pricesOrProduct.prices;
    }
    if (pricesOrProduct.price != null && Number(pricesOrProduct.price) > 0) {
      singlePrice = Number(pricesOrProduct.price);
    }
  } else if (typeof pricesOrProduct === "number" && pricesOrProduct > 0) {
    singlePrice = pricesOrProduct;
  }

  // 1. Direct match in prices object
  if (prices && typeof prices === "object") {
    if (prices[weightKey] != null && Number(prices[weightKey]) > 0) {
      return Number(prices[weightKey]);
    }
    if (prices["1kg"] != null && Number(prices["1kg"]) > 0) {
      return Math.round(Number(prices["1kg"]) * kg);
    }
    if (prices["5kg"] != null && Number(prices["5kg"]) > 0) {
      return Math.round((Number(prices["5kg"]) / 5) * kg);
    }
    if (prices["10kg"] != null && Number(prices["10kg"]) > 0) {
      return Math.round((Number(prices["10kg"]) / 10) * kg);
    }
    if (prices["2kg"] != null && Number(prices["2kg"]) > 0) {
      return Math.round((Number(prices["2kg"]) / 2) * kg);
    }
  }

  // 2. Single price fallback
  if (singlePrice > 0) {
    return Math.round((singlePrice / 5) * kg);
  }

  // 3. Absolute fallback
  return 45 * kg;
}

export function useCustomerStore() {
  const [isClient, setIsClient] = useState(false);
  const [lang, setLang] = useState("hi");

  // Predictable initial states identical on SSR and initial client render
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [allMills, setAllMills] = useState([]);
  const [selectedMillId, setSelectedMillIdState] = useState(null);
  const [cart, setCartState] = useState([]);
  const [activeOrderId, setActiveOrderIdState] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [userProfile, setUserProfileState] = useState(DEFAULT_PROFILE);
  const [adminProducts, setAdminProducts] = useState(null);

  // Client hydration safely executed after initial mount
  useEffect(() => {
    setIsClient(true);
    const loadLocalAdminProducts = () => {
      try {
        const raw = localStorage.getItem("ladwan_admin_products_v2");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAdminProducts(parsed);
          }
        }
      } catch (e) {}
    };
    loadLocalAdminProducts();

    const handleStorage = (e) => {
      if (e.key === "ladwan_admin_products_v2") {
        loadLocalAdminProducts();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("ladwan:admin-store-updated", loadLocalAdminProducts);
    const savedLoc = getStoredJson(STORAGE_KEYS.LOCATION, null);
    if (savedLoc) setLocationState(savedLoc);

    const savedMill = getStoredJson(STORAGE_KEYS.SELECTED_MILL_ID, null);
    if (savedMill) setSelectedMillIdState(savedMill);

    const savedCart = getStoredJson(STORAGE_KEYS.CART, null);
    if (savedCart && Array.isArray(savedCart)) setCartState(savedCart);

    const savedOrderId = getStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, null);
    if (savedOrderId) setActiveOrderIdState(savedOrderId);

    const savedOrders = getStoredJson(STORAGE_KEYS.ORDER_HISTORY, null);
    if (savedOrders && Array.isArray(savedOrders)) setOrderHistory(savedOrders);

    const savedLang = localStorage.getItem(STORAGE_KEYS.LANG);
    if (savedLang) setLang(savedLang);

    const savedProfile = getStoredJson(STORAGE_KEYS.PROFILE, null);
    if (savedProfile) {
      setUserProfileState({
        ...DEFAULT_PROFILE,
        ...savedProfile,
        englishName:
          savedProfile.englishName ||
          (savedProfile.name === "सोमनाथ बैद्य"
            ? "Somnath Baidya"
            : savedProfile.name) ||
          "Somnath Baidya",
      });
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("ladwan:admin-store-updated", loadLocalAdminProducts);
    };
  }, []);

  // Update profile callback
  const updateProfile = useCallback((newProfile) => {
    setUserProfileState((prev) => {
      const merged = { ...prev, ...newProfile };
      setStoredJson(STORAGE_KEYS.PROFILE, merged);
      return merged;
    });
  }, []);

  // Multilingual dictionary
  const t = useMemo(() => translations[lang] || translations.hi, [lang]);

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

  // 1. Subscribe to active mills (Live Firestore)
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = listenActiveMills((liveMills) => {
        if (Array.isArray(liveMills)) {
          setAllMills(liveMills);
          if (liveMills.length > 0 && !selectedMillId) {
            setSelectedMillIdState(liveMills[0].id);
          }
        }
      });
      return () => unsub();
    }
  }, [selectedMillId]);

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
    if (nearbyMills.length > 0) {
      if (selectedMillId) {
        const found = nearbyMills.find((m) => m.id === selectedMillId);
        if (found) return found;
      }
      return nearbyMills[0];
    }
    if (millsWithDistance.length > 0) {
      return millsWithDistance[0];
    }
    return null;
  }, [selectedMillId, nearbyMills, millsWithDistance]);

  const selectMill = useCallback((millId) => {
    setSelectedMillIdState(millId);
    setStoredJson(STORAGE_KEYS.SELECTED_MILL_ID, millId);
  }, []);

  // 3b. Subscribe to live mill inventory in Firestore mode
  useEffect(() => {
    if (isFirebaseConfigured && selectedMill?.id) {
      const unsub = listenInventory(selectedMill.id, (liveItems) => {
        if (Array.isArray(liveItems)) {
          setAdminProducts(liveItems);
        }
      });
      return () => unsub();
    }
  }, [selectedMill?.id]);

  // 4. Products list (derived from mill live inventory)
  const products = useMemo(() => {
    const catalog =
      adminProducts && adminProducts.length > 0 ? adminProducts : [];
    return catalog.map((p) => {
      return {
        ...p,
        millId: selectedMill?.id,
      };
    });
  }, [selectedMill, adminProducts]);

  // 5. Cart Management
  const addToCart = useCallback(
    (product, weightKey = "5kg", grindOption = "बारीक (रोटी)", explicitPrice = null) => {
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
          explicitPrice != null
            ? Number(explicitPrice)
            : calculatePrice(product.prices, weightKey);

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

  // 6. Live Order, Mill & Products Subscription
  useEffect(() => {
    if (isFirebaseConfigured) {
      if (!activeOrderId) {
        setActiveOrder(null);
        return;
      }
      const unsub = listenOrder(activeOrderId, (orderData) => {
        if (orderData) {
          setActiveOrder((prev) => {
            if (prev && prev.orderStatus !== orderData.orderStatus) {
              soundManager.playStatusDing();
            }
            return orderData;
          });
        }
      });
      return () => unsub();
    } else {
      // Demo mode: sync with shared bridge and localStorage
      let isMounted = true;
      const syncWithBridge = async () => {
        try {
          const res = await fetch("/api/bridge/orders", { cache: "no-store" });
          if (!res.ok) return;
          const data = await res.json();
          if (data.success && isMounted) {
            // 1. Live Mill Sync from Bridge (e.g. status open/closed, name, UPI QR)
            if (data.mill) {
              setAllMills((prev) => {
                const filtered = prev.filter((m) => m.id !== data.mill.id);
                return [data.mill, ...filtered];
              });
            }

            // 2. Live Products Catalog Sync from Bridge (e.g. price updates)
            if (Array.isArray(data.products) && data.products.length > 0) {
              setAdminProducts(data.products);
            }

            // 3. Live Active Order Tracking
            if (Array.isArray(data.orders)) {
              if (activeOrderId) {
                const found = data.orders.find((o) => o.id === activeOrderId);
                if (found) {
                  setActiveOrder((prev) => {
                    const prevStatus = prev?.orderStatus || prev?.status;
                    const newStatus = found.orderStatus || found.status;
                    if (prev && prevStatus !== newStatus) {
                      soundManager.playStatusDing();
                    }
                    return found;
                  });

                  setOrderHistory((prevHistory) => {
                    const updated = prevHistory.map((h) => (h.id === activeOrderId ? found : h));
                    if (!prevHistory.some((h) => h.id === activeOrderId)) {
                      updated.unshift(found);
                    }
                    setStoredJson(STORAGE_KEYS.ORDER_HISTORY, updated);
                    return updated;
                  });
                } else {
                  setActiveOrder(null);
                  setActiveOrderIdState(null);
                  setStoredJson(STORAGE_KEYS.ACTIVE_ORDER_ID, null);
                }
              }
            }
          }
        } catch {
          // Fallback to localStorage if bridge route is unreachable
          try {
            const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDER_HISTORY);
            if (rawOrders && isMounted && activeOrderId) {
              const parsed = JSON.parse(rawOrders);
              const found = parsed.find((o) => o.id === activeOrderId);
              if (found) {
                setActiveOrder((prev) => {
                  const prevStatus = prev?.orderStatus || prev?.status;
                  const newStatus = found.orderStatus || found.status;
                  if (prev && prevStatus !== newStatus) {
                    soundManager.playStatusDing();
                  }
                  return found;
                });
              }
            }
          } catch {}
        }
      };

      syncWithBridge();
      const interval = setInterval(syncWithBridge, 1200);

      const handleOrderUpdate = () => syncWithBridge();
      window.addEventListener("ladwan:order-updated", handleOrderUpdate);
      window.addEventListener("storage", handleOrderUpdate);

      return () => {
        isMounted = false;
        clearInterval(interval);
        window.removeEventListener("ladwan:order-updated", handleOrderUpdate);
        window.removeEventListener("storage", handleOrderUpdate);
      };
    }
  }, [activeOrderId]);

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
      const tokenNumber = `${Math.floor(10 + Math.random() * 89)}`;
      const fullAddress = addressDetails.address || location.name;
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const distanceString = selectedMill.distance || (selectedMill.distanceKm ? `${selectedMill.distanceKm} km` : "1.2 km");
      const distanceKmVal = typeof selectedMill.distanceKm === "number" ? `${selectedMill.distanceKm} km` : (selectedMill.distance || "1.2 km");

      const newOrder = {
        id: orderId,
        orderNumber,
        tokenNumber,
        customerId: "cust_" + (customerPhone ? customerPhone.replace(/\D/g, "") : Date.now()),
        customerName: customerName || "ग्राहक (Customer)",
        customerPhone: customerPhone || "+91 98000 00000",
        customer: {
          name: customerName || "ग्राहक (Customer)",
          englishName: customerName || "Customer",
          phone: customerPhone || "+91 98000 00000",
          address: fullAddress,
          englishAddress: fullAddress,
          distanceKm: distanceKmVal,
          instructions: addressDetails.instructions || "",
        },
        deliveryAddress: {
          address: fullAddress,
          houseFlat: addressDetails.flatNumber || "",
          landmark: addressDetails.landmark || "",
          area: addressDetails.area || location.area || "",
          city: addressDetails.city || location.city || "Kolkata",
          pincode: addressDetails.pincode || location.pincode || "700150",
          instructions: addressDetails.instructions || "",
          lat: location.lat,
          lng: location.lng,
        },
        currentTime,
        distance: distanceString,
        distanceKm: distanceKmVal,
        millId: selectedMill.id,
        millName: selectedMill.name,
        millEnglishName: selectedMill.englishName,
        millPhone: selectedMill.phone,
        millUpiQrUrl: selectedMill.upiQrUrl || null,
        items: cart.map((it) => ({
          productId: it.productId,
          name: it.name,
          englishName: it.englishName || it.name,
          category: it.category,
          weight: it.weightKey,
          weightKey: it.weightKey,
          quantity: it.quantity,
          kgPerUnit: it.kgPerUnit,
          quantityKg: it.totalKg,
          totalKg: it.totalKg,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          grind: it.grindOption,
          englishGrind: it.grindOption,
          grindOption: it.grindOption,
          imageUrl: it.imageUrl,
        })),
        subtotal: cartSummary.subtotal,
        deliveryFee: cartSummary.deliveryFee,
        totalAmount: cartSummary.totalAmount,
        totalKg: cartSummary.totalKg,
        paymentMethod: paymentMethod || "cod",
        paymentStatus:
          paymentMethod === "upi" ? "payment_verification_pending" : "cod_pending",
        isPaid: false,
        orderStatus: "placed",
        status: "placed",
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
    t,
    setLang,
    toggleLang,
    userProfile,
    updateProfile,
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
