// apps/delivery-boy/app/page.js - Ladwan Delivery Agent PWA
"use client";

import { useEffect } from "react";
import DeliveryApp from "../components/DeliveryApp";

export default function DeliveryPage() {
  // Register service worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <DeliveryApp />;
}
