// apps/customer-pwa/lib/geo.js - Hyperlocal Geolocation & Distance Helpers
// Calculates accurate Haversine distance, travel time, and manages preset localities.

import { PRESET_LOCALITIES, DELIVERY_POLICY } from "@ladwan/firebase/schemas";

/**
 * Calculates Haversine great-circle distance between two GPS coordinates in kilometers.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in km
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return 1.5; // fallback safe default
  }

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance into a friendly display string (e.g. "1.4 km").
 * @param {number} distanceKm
 */
export function formatDistance(distanceKm) {
  if (distanceKm === undefined || distanceKm === null) return "1.2 km";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates delivery time based on fresh stone milling time + delivery distance.
 * Base milling time = 20-30 mins; transit = 8 mins per km.
 * @param {number} distanceKm
 * @returns {string} Estimated ETA (e.g. "30-40 मिनट")
 */
export function estimateDeliveryMinutes(distanceKm = 1.5) {
  const transitMinutes = Math.max(10, Math.round(distanceKm * 7));
  const minTime = 20 + transitMinutes;
  const maxTime = minTime + 15;
  return `${minTime}-${maxTime} मिनट (${minTime}-${maxTime} mins)`;
}

/**
 * Calculates delivery fee based on user-selected policy:
 * ₹25 flat fee, FREE delivery on orders ₹499 or higher.
 * @param {number} subtotal
 * @returns {{ fee: number, isFree: boolean, amountNeededForFree: number }}
 */
export function calculateDeliveryFee(subtotal = 0) {
  const threshold = DELIVERY_POLICY.FREE_DELIVERY_THRESHOLD || 499;
  const flatFee = DELIVERY_POLICY.FLAT_FEE || 25;

  if (subtotal >= threshold) {
    return {
      fee: 0,
      isFree: true,
      amountNeededForFree: 0,
    };
  }

  return {
    fee: flatFee,
    isFree: false,
    amountNeededForFree: Math.max(0, threshold - subtotal),
  };
}

/**
 * Default pinned location: Sonarpur, Kolkata
 */
export const DEFAULT_LOCATION = PRESET_LOCALITIES[0] || {
  id: "sonarpur_kolkata",
  name: "Sonarpur, Kolkata",
  hindiName: "सोनारपुर, कोलकाता",
  area: "Station Road, Sonarpur",
  city: "Kolkata",
  pincode: "700150",
  lat: 22.4385,
  lng: 88.4022,
};

/**
 * Request real GPS position from browser Geolocation API
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export function getCurrentGpsPosition() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
