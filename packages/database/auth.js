// @ladwan/database - Unified Auth Layer for All Ladwan Apps
// Supports: Firebase Email/Password Auth, Phone OTP Auth (future), and Demo Session.
// "use client" is NOT added here — apps add it in their wrappers.

import { auth, db, isFirebaseConfigured } from "./index.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { getUser, saveUser, saveMill, saveProduct } from "./firestore.js";
import { ROLES, DEMO_MILL_IDS, DEMO_USER_IDS } from "./schemas.js";
import { INITIAL_PRODUCTS } from "./seed.js";

// ── Auth Storage (for Demo / LocalStorage Mode) ───────────────────────────────
export const AUTH_STORAGE_KEY = "ladwan_auth_session_v1";
export const AUTH_EVENT = "ladwan:auth-changed";

// ── Real / Primary Mill Owner Account in Firestore ───────────────────────────
export const DEMO_USERS = {
  mill_owner_1: {
    uid: "tlP6RYfzBsfjaIaVoTLI9ZOdmsa2",
    email: "somnathbaidya82@gmail.com",
    displayName: "Hemu",
    englishDisplayName: "Hemu",
    phoneNumber: "+91 89181 19210",
    role: ROLES.MILL_OWNER,
    millId: "mill_mv99nb48",
    millName: "लाडवां शुद्ध आटा चक्की",
    millEnglishName: "Ladwan Fresh Atta Chakki",
    status: "active",
  },
};

// ── Helper: Persist demo session in localStorage ──────────────────────────────
function persistDemoSession(user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
}

function clearDemoSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
}

export function getDemoSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Subscribe to auth state (works in both Firebase and Demo mode) ─────────────
/**
 * Subscribes to auth state changes.
 * In Firebase mode: uses onAuthStateChanged + Firestore user lookup.
 * In Demo mode: reads localStorage on mount, listens for AUTH_EVENT.
 *
 * @param {function} onUser   - Called with user object or null.
 * @returns {function}        - Unsubscribe / cleanup function.
 */
export function subscribeToAuthState(onUser) {
  if (isFirebaseConfigured && auth) {
    const unsubFirebase = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { onUser(null); return; }
      try {
        const profile = await getUser(fbUser.uid);
        onUser(profile ? { ...profile } : {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          role: ROLES.MILL_OWNER,
          millId: DEMO_MILL_IDS.SHREE_RAM,
        });
      } catch {
        onUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName });
      }
    });
    return unsubFirebase;
  }

  // Demo mode: read current session and listen for changes
  const session = getDemoSession() || DEMO_USERS.mill_owner_1;
  onUser(session);
  const handler = (e) => onUser(e.detail || DEMO_USERS.mill_owner_1);
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
}

// Helper to translate Firebase Auth errors into clear, actionable messages
function formatAuthError(err) {
  if (!err) return "Authentication failed";
  if (err.code === "auth/configuration-not-found") {
    return "Firebase Auth provider not enabled. In Firebase Console, go to Authentication > Sign-in method, click 'Get started' (if shown), enable 'Email/Password', and click Save.";
  }
  if (err.code === "auth/email-already-in-use") {
    return "This email is already registered. Please sign in instead.";
  }
  if (
    err.code === "auth/invalid-credential" ||
    err.code === "auth/user-not-found" ||
    err.code === "auth/wrong-password"
  ) {
    return "Invalid email or password. Please try again.";
  }
  if (err.code === "auth/weak-password") {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (err.code === "auth/network-request-failed") {
    return "Network connection error. Please check your internet connection.";
  }
  return err.message || "Authentication failed";
}

// ── Sign In with Email / Password ─────────────────────────────────────────────
/**
 * @param {string} email
 * @param {string} password
 * @param {Array} [seedProducts=[]] - Optional: seed products after first login (for new mills)
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export async function loginWithEmail(email, password, seedProducts = []) {
  if (isFirebaseConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await getUser(cred.user.uid);
      return { success: true, user: profile || { uid: cred.user.uid, email: cred.user.email } };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  }

  // Demo mode: accept any email, map to a preset if it matches
  await new Promise((r) => setTimeout(r, 350));
  const presetKey = Object.keys(DEMO_USERS).find(
    (k) => DEMO_USERS[k].email.toLowerCase() === email.trim().toLowerCase()
  );
  const demoUser = presetKey ? DEMO_USERS[presetKey] : {
    uid: "usr_" + Math.random().toString(36).substring(2, 8),
    email: email.trim(),
    displayName: email.split("@")[0],
    role: ROLES.MILL_OWNER,
    millId: DEMO_MILL_IDS.SHREE_RAM,
    millName: "श्री राम शुद्ध आटा चक्की",
    millEnglishName: "Shree Ram Shuddh Atta Chakki",
    status: "active",
  };

  persistDemoSession(demoUser);
  return { success: true, user: demoUser };
}

// ── Register New Mill Owner ────────────────────────────────────────────────────
/**
 * Creates Firebase Auth user, Firestore user doc, and a new mill document.
 * In Demo mode, writes to localStorage only.
 *
 * @param {object} data
 * @param {string} data.ownerName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.phone
 * @param {string} data.millName         - Hindi mill name
 * @param {string} data.millEnglishName  - English mill name
 * @param {string} data.address
 * @param {string} data.area
 * @param {string} data.city
 * @param {object} data.initialMillData  - Full mill object to persist
 * @param {Array}  data.initialProducts  - Products to seed into new mill subcollection
 * @returns {{ success: boolean, user?: object, mill?: object, error?: string }}
 */
export async function registerMillOwner(data) {
  const {
    ownerName, email, password, phone,
    millName, millEnglishName,
    address, area, city,
    initialMillData = {},
    initialProducts = [],
  } = data;

  const productsToSeed = initialProducts || [];

  const newMillId = "mill_" + Date.now().toString(36);
  const newMillObj = {
    ...initialMillData,
    id: newMillId,
    name: millName || "ताजा आटा चक्की",
    englishName: millEnglishName || millName || "Fresh Atta Chakki",
    address: address || "मेन मार्केट",
    area: area || city || "Station Road",
    city: city || "Kolkata",
    phone: phone || "+91 98000 00000",
    ownerName,
    isOpen: true,
    acceptingOrders: true,
    location: initialMillData.location || { lat: 22.4385, lng: 88.4022 },
    deliveryRadiusKm: initialMillData.deliveryRadiusKm || 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: ownerName });

      const userDoc = {
        uid: cred.user.uid,
        email: email.trim(),
        phoneNumber: phone || "",
        displayName: ownerName,
        role: ROLES.MILL_OWNER,
        millId: newMillId,
        millName: newMillObj.name,
        millEnglishName: newMillObj.englishName,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      await saveUser(cred.user.uid, userDoc);
      await saveMill({ ...newMillObj, ownerUid: cred.user.uid });

      for (const prod of productsToSeed) {
        await saveProduct(newMillId, { ...prod, millId: newMillId });
      }

      return { success: true, user: userDoc, mill: newMillObj };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  }

  // Demo mode
  await new Promise((r) => setTimeout(r, 400));
  const uid = "usr_" + Date.now().toString(36);
  const demoUser = {
    uid, email: email.trim(), displayName: ownerName,
    phoneNumber: phone, role: ROLES.MILL_OWNER,
    millId: newMillId, millName: newMillObj.name,
    millEnglishName: newMillObj.englishName, status: "active",
  };
  persistDemoSession(demoUser);

  if (typeof window !== "undefined") {
    localStorage.setItem("ladwan_admin_mill_v2", JSON.stringify(newMillObj));
    window.dispatchEvent(new CustomEvent("ladwan:admin-store-updated", { detail: { newMill: true } }));
  }

  return { success: true, user: demoUser, mill: newMillObj };
}

// ── 1-Click Demo Login ────────────────────────────────────────────────────────
/**
 * Instantly logs into a preset demo account without credentials.
 * Perfect for testing, showcases, and onboarding.
 * @param {"mill_owner_1" | "mill_owner_2"} [demoKey="mill_owner_1"]
 */
export async function loginWithDemo(demoKey = "mill_owner_1") {
  await new Promise((r) => setTimeout(r, 200));
  const demoUser = DEMO_USERS[demoKey] || DEMO_USERS.mill_owner_1;
  persistDemoSession(demoUser);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ladwan:admin-store-updated", { detail: { reset: true } }));
  }

  return { success: true, user: demoUser };
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
/**
 * Signs out from Firebase (if configured) and clears local demo session.
 */
export async function logout() {
  if (isFirebaseConfigured && auth) {
    try { await firebaseSignOut(auth); } catch {}
  }
  clearDemoSession();
  return { success: true };
}
