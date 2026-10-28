"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  subscribeToAuthState,
  loginWithEmail as sharedLoginWithEmail,
  loginWithDemo as sharedLoginWithDemo,
  registerMillOwner as sharedRegisterMillOwner,
  logout as sharedLogout,
  DEMO_USERS,
} from "@ladwan/database/auth";
import { isFirebaseConfigured } from "@ladwan/database";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to auth state (works seamlessly with Firebase Auth & Demo session)
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await sharedLoginWithEmail(email, password);
      if (!res.success) {
        setError(res.error || "Login failed");
        return res;
      }
      setUser(res.user);
      return res;
    } catch (err) {
      const msg = err.message || "An unexpected error occurred";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemo = async (demoKey = "mill_owner_1") => {
    setError(null);
    setLoading(true);
    try {
      const res = await sharedLoginWithDemo(demoKey);
      if (res.success) {
        setUser(res.user);
      }
      return res;
    } catch (err) {
      const msg = err.message || "Demo login failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const registerMillOwner = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const res = await sharedRegisterMillOwner(data);
      if (!res.success) {
        setError(res.error || "Registration failed");
        return res;
      }
      setUser(res.user);
      return res;
    } catch (err) {
      const msg = err.message || "Registration failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await sharedLogout();
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    isFirebaseConfigured,
    DEMO_USERS,
    loginWithEmail,
    loginWithDemo,
    registerMillOwner,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
