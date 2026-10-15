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
  writeBatch,
  deleteDoc,
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
