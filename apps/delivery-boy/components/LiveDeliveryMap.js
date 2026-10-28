// apps/delivery-boy/components/LiveDeliveryMap.js
// Interactive Dark-Mode Live Leaflet Map for Active Delivery
// Features dynamic rotating bike marker, mill/customer pins, polyline route & live HUD
"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, Play, Pause, RotateCcw, FastForward, ShieldAlert } from "lucide-react";

export default function LiveDeliveryMap({
  riderCoords,
  heading = 0,
  speedKmh = 24,
  millCoords,
  customerCoords,
  waypoints = [],
  formattedDistance,
  etaText,
  isSimulating,
  onToggleSimulating,
  onStepForward,
  onReset,
  lang = "hi",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L;
    let isCancelled = false;

    // Dynamically import Leaflet in browser only
    import("leaflet").then((leafletModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      L = leafletModule.default || leafletModule;

      // Fix default marker icon asset paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Avoid re-initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialCenter = [
        riderCoords?.lat || millCoords?.lat || 22.4385,
        riderCoords?.lng || millCoords?.lng || 88.4022,
      ];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Dark Matter tile layer for premium dark UI
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // ── 1. Mill Marker (Pickup Point) ──────────────────────────────────────
      const millIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:36px;height:36px;border-radius:12px;background:#f59e0b;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(245,158,11,0.6);font-size:16px;">
              🏭
            </div>
            <div style="position:absolute;bottom:-20px;background:#1c1917;color:#fde68a;font-size:10px;font-weight:800;padding:2px 6px;border-radius:6px;border:1px solid #78350f;white-space:nowrap;">
              चक्की (Mill)
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (millCoords?.lat && millCoords?.lng) {
        L.marker([millCoords.lat, millCoords.lng], { icon: millIcon })
          .addTo(map)
          .bindPopup(`<b>${millCoords.name || "चक्की"}</b><br/>पिकअप पॉइंट`);
      }

      // ── 2. Customer Destination Marker ────────────────────────────────────
      const custIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:36px;height:36px;border-radius:12px;background:#10b981;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(16,185,129,0.6);font-size:16px;">
              🏠
            </div>
            <div style="position:absolute;bottom:-20px;background:#1c1917;color:#a7f3d0;font-size:10px;font-weight:800;padding:2px 6px;border-radius:6px;border:1px solid #064e3b;white-space:nowrap;">
              ग्राहक (Drop-off)
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (customerCoords?.lat && customerCoords?.lng) {
        L.marker([customerCoords.lat, customerCoords.lng], { icon: custIcon })
          .addTo(map)
          .bindPopup(`<b>डिलीवरी पता</b><br/>${customerCoords.address || ""}`);
      }

      // ── 3. Route Polyline ──────────────────────────────────────────────────
      if (waypoints.length > 0) {
        const polyPoints = waypoints.map((pt) => [pt.lat, pt.lng]);
        const polyline = L.polyline(polyPoints, {
          color: "#38bdf8",
          weight: 5,
          opacity: 0.85,
          dashArray: "8, 10",
          lineJoin: "round",
        }).addTo(map);

        routePolylineRef.current = polyline;

        // Auto-fit bounds comfortably
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }

      // ── 4. Live Rider Bike Marker (Rotated by bearing) ──────────────────────
      const riderHtml = (deg) => `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(56,189,248,0.25);animation:pulse-ring 1.8s infinite;"></div>
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0369a1);border:3px solid #38bdf8;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(56,189,248,0.8);transform:rotate(${deg}deg);transition:transform 0.5s ease-out;font-size:18px;">
            🛵
          </div>
        </div>
      `;

      const riderIcon = L.divIcon({
        className: "custom-rider-icon",
        html: riderHtml(heading),
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const riderMarker = L.marker(
        [riderCoords?.lat || initialCenter[0], riderCoords?.lng || initialCenter[1]],
        { icon: riderIcon, zIndexOffset: 1000 }
      ).addTo(map);

      riderMarkerRef.current = { marker: riderMarker, L, createHtml: riderHtml };
      mapInstanceRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Rider position and heading dynamically on map
  useEffect(() => {
    if (!mapLoaded || !riderMarkerRef.current || !riderCoords) return;
    const { marker, L, createHtml } = riderMarkerRef.current;

    marker.setLatLng([riderCoords.lat, riderCoords.lng]);

    // Update icon rotation with smooth bearing transform
    const updatedIcon = L.divIcon({
      className: "custom-rider-icon",
      html: createHtml(heading || 0),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
    marker.setIcon(updatedIcon);

    // Gently pan if rider moves out of view
    if (mapInstanceRef.current) {
      const bounds = mapInstanceRef.current.getBounds();
      if (!bounds.contains([riderCoords.lat, riderCoords.lng])) {
        mapInstanceRef.current.panTo([riderCoords.lat, riderCoords.lng], { animate: true, duration: 0.8 });
      }
    }
  }, [riderCoords, heading, mapLoaded]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-stone-950 shadow-2xl">
      {/* Interactive Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-72 sm:h-80 z-0 bg-stone-950"
        style={{ minHeight: "280px" }}
      />

      {/* Top Floating Telemetry Overlay (Blinkit style HUD) */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">
            {lang === "en" ? "GPS Live: Broadcasting" : "लाइव GPS: प्रसारण चालू"}
          </span>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 pointer-events-auto">
          <span className="text-xs font-black text-amber-400 font-mono">{speedKmh} km/h</span>
        </div>
      </div>

      {/* Bottom Floating Stats Bar */}
      <div className="absolute bottom-3 left-3 right-14 z-10 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              {lang === "en" ? "Distance to Customer" : "ग्राहक से दूरी"}
            </span>
            <span className="text-sm font-extrabold text-white truncate">
              {formattedDistance} • <span className="text-blue-400 font-bold">{etaText}</span>
            </span>
          </div>
        </div>

        {/* Simulation Controls for testing on Laptop/Desktop */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleSimulating}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              isSimulating
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : "bg-blue-600 text-white border-blue-500 hover:bg-blue-500"
            }`}
            title={isSimulating ? "Pause Simulation" : "Start Live Simulation"}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{isSimulating ? "Pause" : "Simulate"}</span>
          </button>

          <button
            type="button"
            onClick={onStepForward}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="Step next waypoint"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="Reset to Mill"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
