// Ready-to-use Firestore synchronization layer
// Activates automatically as soon as Firebase environment variables are supplied

import { db, isFirebaseConfigured } from "./firebase";
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
} from "firebase/firestore";
import { INITIAL_MILL, INITIAL_PRODUCTS, INITIAL_ORDERS } from "./seedData";

export const firestoreSync = {
  // Sync Mill Profile to Firestore
  async saveMill(mill) {
    if (!isFirebaseConfigured || !db) return null;
    try {
      const millRef = doc(db, "mills", mill.id);
      await setDoc(millRef, mill, { merge: true });
      return true;
    } catch (err) {
      console.error("[Firestore] Error saving mill:", err);
      return false;
    }
  },

  // Real-time listener for Mill status
  listenMill(millId, onUpdate) {
    if (!isFirebaseConfigured || !db) return () => {};
    const millRef = doc(db, "mills", millId);
    return onSnapshot(millRef, (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    });
  },

  // Real-time listener for incoming orders
  listenOrders(millId, onUpdate) {
    if (!isFirebaseConfigured || !db) return () => {};
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("millId", "==", millId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach((d) => orders.push({ id: d.id, ...d.data() }));
      onUpdate(orders);
    });
  },

  // Update order status in Firestore
  async updateOrderStatus(orderId, status) {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error("[Firestore] Error updating order status:", err);
      return false;
    }
  },

  // Seed live Firestore database on first setup
  async seedInitialDataToFirestore(millId = "mill_shree_ram_01") {
    if (!isFirebaseConfigured || !db) {
      console.warn("[Firestore] Cannot seed: Firebase not configured yet.");
      return false;
    }
    try {
      // 1. Create Mill doc
      await setDoc(doc(db, "mills", millId), INITIAL_MILL, { merge: true });

      // 2. Add products subcollection
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, "mills", millId, "products", prod.id), prod, {
          merge: true,
        });
      }

      // 3. Add initial orders
      for (const ord of INITIAL_ORDERS) {
        await setDoc(
          doc(db, "orders", ord.id),
          { ...ord, millId },
          { merge: true }
        );
      }

      console.log("[Firestore] Successfully seeded initial Chakki data to Firestore!");
      return true;
    } catch (err) {
      console.error("[Firestore] Error seeding data:", err);
      return false;
    }
  },
};
