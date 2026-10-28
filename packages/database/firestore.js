// @ladwan/database - Shared Firestore CRUD Helpers & Real-time Listeners
// Used across admin-mills (mill owner), customer-pwa, delivery-boy, super-admin.
// All functions gracefully no-op when Firebase is not configured.

import { db, isFirebaseConfigured } from "./index.js";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  writeBatch,
  deleteDoc,
  or,
} from "firebase/firestore";

import { COLLECTIONS, SUBCOLLECTIONS } from "./schemas.js";

// ── MILL ────────────────────────────────────────────────────────────────────

/**
 * Save (merge) a mill document to Firestore.
 * @param {object} mill - Mill data, must contain `id` field.
 */
export async function saveMill(mill) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    await setDoc(doc(db, COLLECTIONS.MILLS, mill.id), {
      ...mill,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("[Firestore] saveMill error:", err);
    return false;
  }
}

/**
 * Get a single mill document by ID.
 * @param {string} millId
 */
export async function getMill(millId) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.MILLS, millId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error("[Firestore] getMill error:", err);
    return null;
  }
}

/**
 * Real-time listener on a mill document.
 * @param {string} millId
 * @param {function} onUpdate - Called with mill data whenever it changes.
 * @returns {function} Unsubscribe function.
 */
export function listenMill(millId, onUpdate) {
  if (!isFirebaseConfigured || !db) return () => {};
  return onSnapshot(doc(db, COLLECTIONS.MILLS, millId), (snap) => {
    if (snap.exists()) onUpdate({ id: snap.id, ...snap.data() });
  });
}

// ── INVENTORY (mills/{millId}/inventory/{productId}) ─────────────────────────

/**
 * Save (merge) a single product in a mill's live inventory subcollection.
 * Path: mills/{millId}/inventory/{product.id}
 * @param {string} millId
 * @param {object} product - Product/grain data, must contain `id` field.
 */
export async function saveInventoryItem(millId, product) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    await setDoc(
      doc(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.INVENTORY, product.id),
      {
        ...product,
        millId,
        isAvailable: product.isAvailable !== false && Number(product.stockKg || 0) > 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn("[Firestore] saveInventoryItem (deploy firestore.rules to enable):", err.message);
    return false;
  }
}

// Backward-compatible alias
export const saveProduct = saveInventoryItem;

/**
 * Real-time listener for a mill's active inventory list.
 * Path: mills/{millId}/inventory
 * @param {string} millId
 * @param {function} onUpdate - Called with array of active inventory items.
 * @returns {function} Unsubscribe function.
 */
export function listenInventory(millId, onUpdate) {
  if (!isFirebaseConfigured || !db) return () => {};
  return onSnapshot(
    collection(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.INVENTORY),
    (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ id: d.id, ...d.data() }));
      onUpdate(items);
    },
    (err) => {
      console.warn("[Firestore] listenInventory (deploy firestore.rules to enable):", err.message);
    }
  );
}

// Backward-compatible alias
export const listenProducts = listenInventory;

/**
 * Initialize / Batch register multiple selected items from Master Catalog.
 * Writes directly to mills/{millId}/inventory/{productId}.
 * @param {string} millId
 * @param {Array<object>} items - Array of product objects with assigned stockKg & prices.
 */
export async function initializeMillInventory(millId, items = []) {
  if (!isFirebaseConfigured || !db || items.length === 0) return false;
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const item of items) {
      const ref = doc(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.INVENTORY, item.id);
      batch.set(
        ref,
        {
          ...item,
          millId,
          isAvailable: item.isAvailable !== false && Number(item.stockKg || 0) > 0,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    await batch.commit();
    return true;
  } catch (err) {
    console.warn("[Firestore] initializeMillInventory (deploy firestore.rules to enable):", err.message);
    return false;
  }
}

/**
 * Quick update for live stock quantity in KG.
 * @param {string} millId
 * @param {string} productId
 * @param {number} newStockKg
 */
export async function updateInventoryStock(millId, productId, newStockKg) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const stock = Math.max(0, Number(newStockKg) || 0);
    const ref = doc(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.INVENTORY, productId);
    await updateDoc(ref, {
      stockKg: stock,
      isAvailable: stock > 0,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn("[Firestore] updateInventoryStock (deploy firestore.rules to enable):", err.message);
    return false;
  }
}

/**
 * Delete / unlist an item from mill's live inventory.
 * @param {string} millId
 * @param {string} productId
 */
export async function deleteInventoryItem(millId, productId) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.INVENTORY, productId));
    return true;
  } catch (err) {
    console.warn("[Firestore] deleteInventoryItem (deploy firestore.rules to enable):", err.message);
    return false;
  }
}

// ── ORDERS ───────────────────────────────────────────────────────────────────

/**
 * Real-time listener for all orders assigned to a specific mill.
 * Sorted by createdAt descending (newest first).
 * @param {string} millId
 * @param {function} onUpdate - Called with array of orders.
 * @returns {function} Unsubscribe function.
 */
export function listenOrders(millId, onUpdate) {
  if (!isFirebaseConfigured || !db) return () => {};
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("millId", "==", millId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = [];
      snapshot.forEach((d) => orders.push({ id: d.id, ...d.data() }));
      // Sort client-side by createdAt descending so no composite index is needed in Firestore
      orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(orders);
    },
    (err) => {
      console.warn("[Firestore] listenOrders (deploy firestore.rules in Firebase Console):", err.message);
    }
  );
}

/**
 * Update an order's status in Firestore.
 * @param {string} orderId
 * @param {string} status - One of ORDER_STATUS values.
 * @param {object} [extra] - Optional additional fields to update (e.g. deliveredAt).
 */
export async function updateOrderStatus(orderId, status, extra = {}) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
      status,
      updatedAt: new Date().toISOString(),
      ...extra,
    });
    return true;
  } catch (err) {
    console.warn("[Firestore] updateOrderStatus (deploy firestore.rules to enable):", err.message);
    return false;
  }
}

/**
 * Create or update an order document.
 * @param {object} order - Order data, must contain `id` field.
 */
export async function saveOrder(order) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    await setDoc(
      doc(db, COLLECTIONS.ORDERS, order.id),
      { ...order, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn("[Firestore] saveOrder (deploy firestore.rules to enable):", err.message);
    return false;
  }
}

// ── USER PROFILE ─────────────────────────────────────────────────────────────

/**
 * Save (merge) a user document in the /users collection.
 * @param {string} uid - Firebase Auth UID.
 * @param {object} data - User profile data.
 */
export async function saveUser(uid, data) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("[Firestore] saveUser error:", err);
    return false;
  }
}

/**
 * Get a user document by UID.
 * @param {string} uid
 */
export async function getUser(uid) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error("[Firestore] getUser error:", err);
    return null;
  }
}

// ── INITIAL SEED ──────────────────────────────────────────────────────────────

/**
 * Seeds a new mill's data into Firestore with products and sample orders.
 * Only runs if Firebase is configured. Safe to call multiple times (uses merge).
 * @param {string} millId
 * @param {object} millData
 * @param {Array} products
 * @param {Array} [orders=[]]
 */
export async function seedMillToFirestore(millId, millData, products, orders = []) {
  if (!isFirebaseConfigured || !db) {
    console.warn("[Firestore] Cannot seed — Firebase not configured.");
    return false;
  }
  try {
    await setDoc(doc(db, COLLECTIONS.MILLS, millId), millData, { merge: true });

    for (const prod of products) {
      await setDoc(
        doc(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.PRODUCTS, prod.id),
        { ...prod, millId },
        { merge: true }
      );
    }

    for (const ord of orders) {
      await setDoc(
        doc(db, COLLECTIONS.ORDERS, ord.id),
        { ...ord, millId },
        { merge: true }
      );
    }

    console.log("[Firestore] ✅ Successfully seeded mill data:", millId);
    return true;
  } catch (err) {
    console.error("[Firestore] Seed error:", err);
    return false;
  }
}

// ── CUSTOMER & DISCOVERY HELPERS ─────────────────────────────────────────────

/**
 * Real-time listener for all active mills.
 * @param {function} onUpdate - Called with array of active mill documents.
 * @returns {function} Unsubscribe function.
 */
export function listenActiveMills(onUpdate) {
  if (!isFirebaseConfigured || !db) return () => {};
  return onSnapshot(
    collection(db, COLLECTIONS.MILLS),
    (snapshot) => {
      const mills = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.isOpen !== false) {
          mills.push({ id: d.id, ...data });
        }
      });
      onUpdate(mills);
    },
    (err) => {
      console.warn("[Firestore] listenActiveMills warning:", err.message);
    }
  );
}

/**
 * Get all active mills once.
 */
export async function getActiveMills() {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.MILLS));
    const mills = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.isOpen !== false) {
        mills.push({ id: d.id, ...data });
      }
    });
    return mills;
  } catch (err) {
    console.error("[Firestore] getActiveMills error:", err);
    return [];
  }
}

/**
 * Real-time listener for a single order (Customer Live Order Tracking).
 * @param {string} orderId
 * @param {function} onUpdate - Called with order data or null.
 * @returns {function} Unsubscribe function.
 */
export function listenOrder(orderId, onUpdate) {
  if (!isFirebaseConfigured || !db || !orderId) return () => {};
  return onSnapshot(
    doc(db, COLLECTIONS.ORDERS, orderId),
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn("[Firestore] listenOrder error:", err.message);
    }
  );
}

/**
 * Get a single order document once.
 * @param {string} orderId
 */
export async function getOrder(orderId) {
  if (!isFirebaseConfigured || !db || !orderId) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error("[Firestore] getOrder error:", err);
    return null;
  }
}

/**
 * Create a new customer order in Firestore.
 * @param {object} order
 */
export async function createCustomerOrder(order) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const now = new Date().toISOString();
    const finalOrder = {
      ...order,
      orderStatus: order.orderStatus || "placed",
      status: order.orderStatus || "placed",
      paymentStatus: order.paymentMethod === "upi" ? "payment_verification_pending" : (order.paymentStatus || "pending"),
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, COLLECTIONS.ORDERS, finalOrder.id), finalOrder);
    return finalOrder;
  } catch (err) {
    console.error("[Firestore] createCustomerOrder error:", err);
    return null;
  }
}

/**
 * Cancel an order if it is in 'placed' or 'accepted' state.
 * Refuses cancellation once grinding has started to prevent raw material waste.
 * @param {string} orderId
 * @param {string} reason
 */
export async function cancelCustomerOrder(orderId, reason = "Customer requested cancellation") {
  if (!isFirebaseConfigured || !db) return { success: true };
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
    if (!snap.exists()) return { success: false, error: "Order not found" };

    const data = snap.data();
    const currentStatus = data.orderStatus || data.status || "placed";

    // Only allow cancellation in early pre-processing stages
    const cancellableStatuses = ["placed", "accepted", "pending"];
    if (!cancellableStatuses.includes(currentStatus)) {
      return {
        success: false,
        error: "ताज़ा गेहूं की पिसाई शुरू हो चुकी है, अब ऑर्डर रद्द नहीं किया जा सकता (Fresh milling is already underway).",
      };
    }

    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
      orderStatus: "cancelled",
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (err) {
    console.error("[Firestore] cancelCustomerOrder error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Submit post-delivery customer feedback & rating.
 * Writes to reviews/{reviewId} and recalculates mill rating average.
 * @param {object} review
 */
export async function submitReview(review) {
  if (!isFirebaseConfigured || !db) return true;
  try {
    const reviewId = review.id || `rev_${Date.now()}`;
    const now = new Date().toISOString();
    const reviewData = {
      ...review,
      id: reviewId,
      createdAt: now,
    };

    await setDoc(doc(db, COLLECTIONS.REVIEWS, reviewId), reviewData);

    // Increment mill review count and update rating if millId provided
    if (review.millId) {
      try {
        const millRef = doc(db, COLLECTIONS.MILLS, review.millId);
        const millSnap = await getDoc(millRef);
        if (millSnap.exists()) {
          const m = millSnap.data();
          const currentCount = Number(m.totalReviews || m.reviewCount || 0);
          const currentRating = Number(m.rating || 5.0);
          const newRating = Number(review.rating || 5);
          const updatedAverage = ((currentRating * currentCount) + newRating) / (currentCount + 1);

          await updateDoc(millRef, {
            rating: Math.round(updatedAverage * 10) / 10,
            totalReviews: currentCount + 1,
            reviewCount: currentCount + 1,
            updatedAt: now,
          });
        }
      } catch (e) {
        console.warn("[Firestore] Unable to update mill rating aggregate:", e.message);
      }
    }

    return true;
  } catch (err) {
    console.error("[Firestore] submitReview error:", err);
    return false;
  }
}

/**
 * Real-time listener for customer order history.
 * @param {string} customerId
 * @param {function} onUpdate
 */
export function listenCustomerOrders(customerId, onUpdate) {
  if (!isFirebaseConfigured || !db || !customerId) return () => {};
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("customerId", "==", customerId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = [];
      snapshot.forEach((d) => orders.push({ id: d.id, ...d.data() }));
      orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(orders);
    },
    (err) => {
      console.warn("[Firestore] listenCustomerOrders warning:", err.message);
    }
  );
}

// ── DELIVERY BOY ──────────────────────────────────────────────────────────────

/**
 * Real-time listener for orders assigned to a specific delivery boy.
 * Falls back to listening to all `out_for_delivery` orders when no deliveryBoyId is set
 * (useful during the brief window before assignment).
 *
 * Priority query: deliveryBoyId == uid.
 * Returns orders sorted by createdAt descending.
 *
 * @param {string} deliveryBoyId - The UID of the logged-in delivery agent.
 * @param {function} onUpdate - Called with array of delivery orders.
 * @returns {function} Unsubscribe function.
 */
export function listenDeliveryOrders(deliveryBoyId, onUpdate) {
  if (!isFirebaseConfigured || !db) return () => {};

  // Primary: orders explicitly assigned to this delivery boy
  const qAssigned = query(
    collection(db, COLLECTIONS.ORDERS),
    where("deliveryBoyId", "==", deliveryBoyId)
  );

  // Fleet dispatch loop: listen to packed and out_for_delivery orders (unassigned pool)
  const qPool = query(
    collection(db, COLLECTIONS.ORDERS),
    where("status", "in", ["packed", "out_for_delivery"])
  );

  const mergeAndEmit = (assignedSnap, poolSnap) => {
    const seen = new Set();
    const orders = [];

    const add = (snap) => {
      snap.forEach((d) => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          orders.push({ id: d.id, ...d.data() });
        }
      });
    };

    if (assignedSnap) add(assignedSnap);
    if (poolSnap) add(poolSnap);

    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    onUpdate(orders);
  };

  let latestAssignedSnap = null;
  let latestPoolSnap = null;

  const unsubAssigned = onSnapshot(
    qAssigned,
    (snap) => {
      latestAssignedSnap = snap;
      mergeAndEmit(latestAssignedSnap, latestPoolSnap);
    },
    (err) => console.warn("[Firestore] listenDeliveryOrders (assigned):", err.message)
  );

  const unsubPool = onSnapshot(
    qPool,
    (snap) => {
      latestPoolSnap = snap;
      mergeAndEmit(latestAssignedSnap, latestPoolSnap);
    },
    (err) => console.warn("[Firestore] listenDeliveryOrders (pool):", err.message)
  );

  return () => {
    unsubAssigned();
    unsubPool();
  };
}

/**
 * Assign a delivery boy to an order.
 * Called by admin when dispatching (status: out_for_delivery).
 * Writes deliveryBoyId, deliveryBoyName, deliveryBoyPhone, and dispatchedAt.
 *
 * @param {string} orderId
 * @param {object} deliveryBoyData - { id, name, phone }
 */
export async function assignDeliveryBoy(orderId, deliveryBoyData = {}) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
      deliveryBoyId: deliveryBoyData.id || null,
      deliveryBoyName: deliveryBoyData.name || null,
      deliveryBoyPhone: deliveryBoyData.phone || null,
      dispatchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn("[Firestore] assignDeliveryBoy error:", err.message);
    return false;
  }
}

/**
 * Delivery boy marks an order as delivered.
 * Also marks paymentStatus as paid for COD orders.
 * @param {string} orderId
 * @param {object} [extra] - Optional extra fields (e.g. deliveryNotes, photoUrl)
 */
export async function markOrderDelivered(orderId, extra = {}) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
      status: "delivered",
      orderStatus: "delivered",
      paymentStatus: "paid",
      isPaid: true,
      deliveredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...extra,
    });
    return true;
  } catch (err) {
    console.warn("[Firestore] markOrderDelivered error:", err.message);
    return false;
  }
}

/**
 * Update live GPS coordinates of the delivery rider for an active order.
 * Broadcasts riderLat, riderLng, heading, speed, and timestamp to customer in real-time.
 * @param {string} orderId
 * @param {object} trackingData - { riderLat, riderLng, heading, speed, accuracy, isSharing }
 */
export async function updateOrderLiveTracking(orderId, trackingData = {}) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
      liveTracking: {
        ...trackingData,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn("[Firestore] updateOrderLiveTracking error:", err.message);
    return false;
  }
}

