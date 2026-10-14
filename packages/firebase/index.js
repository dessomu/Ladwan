// @ladwan/firebase - Centralized Firebase App Initialization
// Single point of truth for all 4 Ladwan apps.
// Apps should import db, auth, storage from this package, NOT initialize their own.
//
// Environment variables required (set in each app's .env.local):
//   NEXT_PUBLIC_FIREBASE_API_KEY
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID
//   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
//   NEXT_PUBLIC_FIREBASE_APP_ID

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * isFirebaseConfigured
 * True when valid env vars are present and the app can connect to live Firebase.
 * When false, all 4 apps fall back to Demo / LocalStorage mode automatically.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "YOUR_API_KEY"
);

let _app = null;
let _db  = null;
let _auth = null;

if (isFirebaseConfigured) {
  try {
    _app  = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    _db   = getFirestore(_app);
    _auth = getAuth(_app);
    console.log("[Ladwan Firebase] ✅ Connected to project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("[Ladwan Firebase] ⚠️  Init failed, falling back to Demo Mode:", err.message);
  }
} else {
  console.info("[Ladwan Firebase] ℹ️  No credentials found — running in Demo / LocalStorage Mode.");
}

export const app  = _app;
export const db   = _db;
export const auth = _auth;

// Re-export commonly needed helpers for convenience
export { isFirebaseConfigured as isLive };
