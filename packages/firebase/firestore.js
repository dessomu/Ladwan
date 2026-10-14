// @ladwan/firebase - Shared Firestore CRUD Helpers & Real-time Listeners
// Used across admin-mills (mill owner), customer-pwa, delivery-boy, super-admin.
// All functions gracefully no-op when Firebase is not configured.

import { db, isFirebaseConfigured } from "./index.js";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
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

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

/**
 * Save (merge) a single product in a mill's products subcollection.
 * @param {string} millId
 * @param {object} product - Product data, must contain `id` field.
 */
export async function saveProduct(millId, product) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    await setDoc(
      doc(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.PRODUCTS, product.id),
      { ...product, millId, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("[Firestore] saveProduct error:", err);
    return false;
  }
}

/**
 * Real-time listener for a mill's product list.
 * @param {string} millId
 * @param {function} onUpdate - Called with array of products.
 * @returns {function} Unsubscribe function.
 */
export function listenProducts(millId, onUpdate) {
  if (!isFirebaseConfigured || !db) return () => {};
  return onSnapshot(
    collection(db, COLLECTIONS.MILLS, millId, SUBCOLLECTIONS.PRODUCTS),
    (snapshot) => {
      const products = [];
      snapshot.forEach((d) => products.push({ id: d.id, ...d.data() }));
      onUpdate(products);
    }
  );
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
    where("millId", "==", millId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const orders = [];
    snapshot.forEach((d) => orders.push({ id: d.id, ...d.data() }));
    onUpdate(orders);
  });
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
    console.error("[Firestore] updateOrderStatus error:", err);
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
    console.error("[Firestore] saveOrder error:", err);
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
