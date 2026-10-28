// packages/firebase/geo.js
// Shared Geolocation, distance, bearing, and route simulation utilities for Ladwan Ecosystem

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in km.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Calculate bearing angle in degrees (0 - 360) from point A to point B.
 * Used to orient the delivery scooter icon on the live map.
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const theta = Math.atan2(y, x);
  const brng = (theta * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Format distance in human-friendly Indian English/Hindi format (m or km).
 */
export function formatDistance(km) {
  if (km == null) return "--";
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimate arrival time string based on remaining distance and average city speed.
 */
export function formatEta(distanceKm, speedKmh = 22) {
  if (!distanceKm || distanceKm <= 0.05) return "पहुंचने वाले हैं (Arriving)";
  const hours = distanceKm / Math.max(speedKmh, 10);
  const minutes = Math.max(1, Math.round(hours * 60));
  if (minutes <= 1) return "~1 min (Arriving)";
  return `~${minutes} mins`;
}

/**
 * Generates an array of intermediate street-like GPS waypoints between start and end.
 * Adds slight natural curvature/offsets so the route follows realistic road bends.
 */
export function generateRouteWaypoints(start, end, steps = 24) {
  if (!start || !end) return [];
  const waypoints = [];
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;

  // Midpoint lateral offset vector perpendicular to direction of motion
  const perpLat = -dLng * 0.18;
  const perpLng = dLat * 0.18;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve parameter for slight road curve
    const curve = 4 * t * (1 - t);
    const lat = start.lat + dLat * t + perpLat * curve;
    const lng = start.lng + dLng * t + perpLng * curve;
    waypoints.push({ lat, lng });
  }

  return waypoints;
}
