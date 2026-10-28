// apps/delivery-boy/lib/useLiveLocationPublisher.js
// Live GPS Tracking & Broadcasting Engine for Ladwan Delivery Fleet
// Seamlessly streams rider coordinates, bearing, speed, and ETA to Cloud Firestore
// Features high-fidelity road waypoint simulation fallback for desktop and testing.
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  calculateBearing,
  calculateDistanceKm,
  formatDistance,
  formatEta,
  generateRouteWaypoints,
} from "@ladwan/database/geo";
import { updateOrderLiveTracking } from "@ladwan/database/firestore";

// Canonical Kolkata/Sonarpur coordinates for fallback
const DEFAULT_MILL_COORDS = { lat: 22.4385, lng: 88.4022, name: "श्री राम आटा चक्की" };
const DEFAULT_CUST_COORDS = { lat: 22.4435, lng: 88.4128, address: "स्टेशन रोड, सोनारपुर" };

export function useLiveLocationPublisher({
  orderId,
  activeOrder,
  isFirebase = false,
  enabled = true,
}) {
  // Resolve Start (Mill) and Destination (Customer) coordinates
  const millCoords = activeOrder?.millLocation ||
    activeOrder?.mill?.location ||
    DEFAULT_MILL_COORDS;

  const customerCoords = {
    lat: Number(activeOrder?.deliveryAddress?.lat || activeOrder?.customer?.lat || DEFAULT_CUST_COORDS.lat),
    lng: Number(activeOrder?.deliveryAddress?.lng || activeOrder?.customer?.lng || DEFAULT_CUST_COORDS.lng),
    address: activeOrder?.deliveryAddress?.address || activeOrder?.customer?.address || DEFAULT_CUST_COORDS.address,
  };

  // Generate 32 realistic road waypoints between Mill and Customer
  const waypoints = useRef(generateRouteWaypoints(millCoords, customerCoords, 32)).current;

  // Tracking state
  const [waypointIndex, setWaypointIndex] = useState(1);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [speedKmh, setSpeedKmh] = useState(24);
  const [riderCoords, setRiderCoords] = useState(waypoints[0] || millCoords);
  const [heading, setHeading] = useState(0);

  const watchIdRef = useRef(null);
  const lastBroadcastRef = useRef(0);

  // Compute remaining distance & ETA to customer
  const distanceRemainingKm = calculateDistanceKm(
    riderCoords.lat,
    riderCoords.lng,
    customerCoords.lat,
    customerCoords.lng
  );
  const formattedDistance = formatDistance(distanceRemainingKm);
  const etaText = formatEta(distanceRemainingKm, speedKmh);
  const progressPercent = Math.min(
    100,
    Math.round((waypointIndex / Math.max(waypoints.length - 1, 1)) * 100)
  );

  // Broadcast current rider telemetry to Firestore and Bridge
  const broadcastLocation = useCallback(
    async (coords, currentHeading, currentSpeed) => {
      if (!orderId) return;

      const trackingPayload = {
        riderLat: coords.lat,
        riderLng: coords.lng,
        heading: currentHeading || 0,
        speed: currentSpeed || 20,
        distanceRemainingKm,
        formattedDistance,
        etaText,
        progressPercent,
        isSharing: true,
        updatedAt: new Date().toISOString(),
      };

      // 1. Cloud Firestore live sync
      if (isFirebase) {
        try {
          await updateOrderLiveTracking(orderId, trackingPayload);
        } catch (e) {
          console.warn("[LiveTracking] Firestore update warning:", e.message);
        }
      }

      // 3. Mirror directly to local storage for instant multi-window reflection
      if (typeof window !== "undefined") {
        try {
          ["ladwan_admin_orders_v2", "ladwan_customer_orders_v1"].forEach((storageKey) => {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const orders = JSON.parse(raw);
            const updated = orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    liveTracking: trackingPayload,
                  }
                : o
            );
            localStorage.setItem(storageKey, JSON.stringify(updated));
          });
          window.dispatchEvent(new Event("ladwan:order-updated"));
          window.dispatchEvent(new Event("storage"));
        } catch {}
      }
    },
    [orderId, isFirebase, distanceRemainingKm, formattedDistance, etaText, progressPercent]
  );

  // ── 1. Simulation Loop (Smooth waypoints along the delivery route) ─────────
  useEffect(() => {
    if (!enabled || !isSimulating || waypoints.length === 0) return;

    const timer = setInterval(() => {
      setWaypointIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % waypoints.length;
        const curPt = waypoints[prevIdx] || millCoords;
        const nextPt = waypoints[nextIdx] || customerCoords;

        const newHeading = calculateBearing(curPt.lat, curPt.lng, nextPt.lat, nextPt.lng);
        const randomSpeed = Math.floor(20 + Math.random() * 8); // 20 - 28 km/h realistic city scooter speed

        setRiderCoords(nextPt);
        setHeading(newHeading);
        setSpeedKmh(randomSpeed);

        const now = Date.now();
        if (now - lastBroadcastRef.current >= 1800) {
          lastBroadcastRef.current = now;
          broadcastLocation(nextPt, newHeading, randomSpeed);
        }

        return nextIdx;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [enabled, isSimulating, waypoints, millCoords, customerCoords, broadcastLocation]);

  // ── 2. Real Hardware GPS Watcher (`navigator.geolocation.watchPosition`) ──
  useEffect(() => {
    if (!enabled || isSimulating || typeof window === "undefined" || !navigator.geolocation) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsGpsActive(false);
      }
      return;
    }

    setIsGpsActive(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading: realHeading, speed: realSpeed } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };

        const currentHeading = realHeading != null && !isNaN(realHeading)
          ? Math.round(realHeading)
          : calculateBearing(riderCoords.lat, riderCoords.lng, latitude, longitude) || heading;

        const currentSpeed = realSpeed != null && realSpeed > 0
          ? Math.round(realSpeed * 3.6) // m/s to km/h
          : 22;

        setRiderCoords(newCoords);
        setHeading(currentHeading);
        setSpeedKmh(currentSpeed);

        const now = Date.now();
        if (now - lastBroadcastRef.current >= 2000) {
          lastBroadcastRef.current = now;
          broadcastLocation(newCoords, currentHeading, currentSpeed);
        }
      },
      (err) => {
        console.warn("[GPS] Location watch error, falling back to simulated route:", err.message);
        setIsSimulating(true);
        setIsGpsActive(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsGpsActive(false);
    };
  }, [enabled, isSimulating, riderCoords, heading, broadcastLocation]);

  // Manual trip controls for testing
  const stepForward = () => {
    setWaypointIndex((prev) => {
      const nextIdx = Math.min(waypoints.length - 1, prev + 1);
      const nextPt = waypoints[nextIdx];
      const curPt = waypoints[prev];
      const newHeading = calculateBearing(curPt.lat, curPt.lng, nextPt.lat, nextPt.lng);
      setRiderCoords(nextPt);
      setHeading(newHeading);
      broadcastLocation(nextPt, newHeading, 24);
      return nextIdx;
    });
  };

  const resetToMill = () => {
    setWaypointIndex(0);
    const startPt = waypoints[0] || millCoords;
    setRiderCoords(startPt);
    broadcastLocation(startPt, 0, 0);
  };

  return {
    riderCoords,
    heading,
    speedKmh,
    millCoords,
    customerCoords,
    waypoints,
    distanceRemainingKm,
    formattedDistance,
    etaText,
    progressPercent,
    isSimulating,
    setIsSimulating,
    isGpsActive,
    stepForward,
    resetToMill,
  };
}
