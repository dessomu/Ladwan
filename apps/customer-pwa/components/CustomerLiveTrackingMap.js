// apps/customer-pwa/components/CustomerLiveTrackingMap.js
// Swiggy / Blinkit-style Live Delivery Tracking Map for Consumer PWA
// Renders live animated rider marker, mill pickup, customer doorstep & route polyline
"use client";

import { useEffect, useRef, useState } from "react";
import { Bike, Phone, Clock, MapPin, ShieldCheck } from "lucide-react";
import { generateRouteWaypoints } from "@ladwan/database/geo";

export default function CustomerLiveTrackingMap({
  order,
  lang = "hi",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Extract coordinates
  const millCoords = order?.millLocation ||
    order?.mill?.location || {
      lat: 22.4385,
      lng: 88.4022,
      name: order?.millName || "श्री राम आटा चक्की",
    };

  const customerCoords = {
    lat: Number(order?.deliveryAddress?.lat || order?.customer?.lat || 22.4435),
    lng: Number(order?.deliveryAddress?.lng || order?.customer?.lng || 88.4128),
    address: order?.deliveryAddress?.address || order?.customer?.address || "सोनारपुर, कोलकाता",
  };

  const live = order?.liveTracking || {};
  const riderLat = live.riderLat || millCoords.lat;
  const riderLng = live.riderLng || millCoords.lng;
  const heading = live.heading || 0;
  const formattedDistance = live.formattedDistance || (lang === "en" ? "1.2 km away" : "1.2 किमी दूर");
  const etaText = live.etaText || (lang === "en" ? "~5 mins" : "~5 मिनट");

  // Mount Leaflet map once in client
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L;
    let isCancelled = false;

    import("leaflet").then((leafletModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      L = leafletModule.default || leafletModule;

      // Fix marker icon URLs
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [riderLat, riderLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Dark Matter tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // 1. Mill Marker
      const millIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:34px;height:34px;border-radius:10px;background:#f59e0b;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(245,158,11,0.6);font-size:16px;">
              🏭
            </div>
            <div style="position:absolute;bottom:-18px;background:#1c1917;color:#fde68a;font-size:9px;font-weight:800;padding:1px 5px;border-radius:4px;border:1px solid #78350f;white-space:nowrap;">
              चक्की (Mill)
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([millCoords.lat, millCoords.lng], { icon: millIcon })
        .addTo(map)
        .bindPopup(`<b>${order?.millName || "चक्की"}</b><br/>ताज़ा पिसाई केंद्र`);

      // 2. Customer Home Marker
      const custIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:34px;height:34px;border-radius:10px;background:#10b981;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(16,185,129,0.6);font-size:16px;">
              🏠
            </div>
            <div style="position:absolute;bottom:-18px;background:#1c1917;color:#a7f3d0;font-size:9px;font-weight:800;padding:1px 5px;border-radius:4px;border:1px solid #064e3b;white-space:nowrap;">
              आपका घर (You)
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([customerCoords.lat, customerCoords.lng], { icon: custIcon })
        .addTo(map)
        .bindPopup(`<b>आपका डिलीवरी पता</b><br/>${customerCoords.address || ""}`);

      // 3. Polyline Route
      const waypoints = generateRouteWaypoints(millCoords, customerCoords, 28);
      if (waypoints.length > 0) {
        const polyPoints = waypoints.map((pt) => [pt.lat, pt.lng]);
        const polyline = L.polyline(polyPoints, {
          color: "#38bdf8",
          weight: 5,
          opacity: 0.85,
          dashArray: "6, 8",
          lineJoin: "round",
        }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [45, 45] });
      }

      // 4. Animated Rider Marker
      const riderHtml = (deg) => `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(56,189,248,0.25);animation:pulse-ring 1.8s infinite;"></div>
          <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0369a1);border:3px solid #38bdf8;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(56,189,248,0.8);transform:rotate(${deg}deg);transition:transform 0.4s ease-out;font-size:18px;">
            🛵
          </div>
        </div>
      `;

      const riderIcon = L.divIcon({
        className: "custom-rider-icon",
        html: riderHtml(heading),
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const riderMarker = L.marker([riderLat, riderLng], {
        icon: riderIcon,
        zIndexOffset: 1000,
      }).addTo(map);

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

  // Update Rider position and bearing smoothly when live coordinates stream in
  useEffect(() => {
    if (!mapLoaded || !riderMarkerRef.current || !riderLat || !riderLng) return;
    const { marker, L, createHtml } = riderMarkerRef.current;

    marker.setLatLng([riderLat, riderLng]);

    const updatedIcon = L.divIcon({
      className: "custom-rider-icon",
      html: createHtml(heading || 0),
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
    marker.setIcon(updatedIcon);

    if (mapInstanceRef.current) {
      const bounds = mapInstanceRef.current.getBounds();
      if (!bounds.contains([riderLat, riderLng])) {
        mapInstanceRef.current.panTo([riderLat, riderLng], { animate: true, duration: 0.6 });
      }
    }
  }, [riderLat, riderLng, heading, mapLoaded]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-amber-500/30 bg-stone-950 shadow-2xl mb-4">
      {/* Map View Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 z-0 bg-stone-950"
        style={{ minHeight: "250px" }}
      />

      {/* Top Floating Swiggy-style ETA Card */}
      <div className="absolute top-3 left-3 right-3 z-10 bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl border border-stone-800 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5 animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                {lang === "en" ? "Live Delivery Tracking" : "लाइव डिलीवरी ट्रैकिंग"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
              {lang === "en"
                ? `${order.deliveryBoyName || "Delivery partner"} is on the way`
                : `${order.deliveryBoyName || "डिलीवरी पार्टनर"} आपके पते की ओर रवाना हैं`}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-stone-400 block font-semibold">
            {lang === "en" ? "Estimated Arrival" : "अनुमानित समय"}
          </span>
          <span className="text-sm sm:text-base font-black text-amber-400">
            {etaText}
          </span>
          <span className="text-[10px] text-stone-400 block font-mono">
            {formattedDistance}
          </span>
        </div>
      </div>

      {/* Bottom Floating Delivery Boy Card with Direct Call */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-stone-950/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-stone-800 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Bike className="w-4 h-4" />
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-white truncate">
              {order.deliveryBoyName || (lang === "en" ? "Raju Delivery Partner" : "राजू डिलीवरी पार्टनर")}
            </p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{lang === "en" ? "Verified Chakki Rider" : "सत्यापित चक्की डिलीवरी बॉय"}</span>
            </p>
          </div>
        </div>

        {order.deliveryBoyPhone && (
          <a
            href={`tel:${order.deliveryBoyPhone}`}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/50 active:scale-95 transition-all shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Call Rider" : "कॉल करें"}</span>
          </a>
        )}
      </div>
    </div>
  );
}
