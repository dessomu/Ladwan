// packages/database/bridge.js
// Shared Real-Time Local Synchronization Bridge for Ladwan Ecosystem
// Bridges super-admin (3001), admin-mills (3002), delivery-boy (3003), and customer-pwa (3004)
// when running without cloud Firebase credentials.
import fs from "fs";
import path from "path";
import { INITIAL_PRODUCTS } from "./seed.js";

const BRIDGE_FILE_PATH =
  process.env.LADWAN_BRIDGE_PATH ||
  path.resolve(process.cwd(), "..", "..", ".ladwan-local-bridge.json");

// Fallback path in workspace root if cwd is already root
const RESOLVED_PATH = fs.existsSync(/*turbopackIgnore: true*/ BRIDGE_FILE_PATH)
  ? BRIDGE_FILE_PATH
  : fs.existsSync(/*turbopackIgnore: true*/ path.resolve(process.cwd(), ".ladwan-local-bridge.json"))
  ? path.resolve(process.cwd(), ".ladwan-local-bridge.json")
  : BRIDGE_FILE_PATH;

// ── Canonical Demo Profiles ───────────────────────────────────────────────────
export const DEFAULT_BRIDGE_MILL = {
  id: "mill_shree_ram_01",
  name: "श्री राम शुद्ध आटा चक्की",
  englishName: "Shree Ram Shuddh Atta Chakki",
  tagline: "100% ताज़ा पारंपरिक पत्थर-पिसा आटा (Cold Stone Ground)",
  englishTagline: "100% Fresh Traditional Stone-Ground Flour (Cold Milled)",
  ownerName: "रमेश शर्मा",
  englishOwnerName: "Ramesh Sharma",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  address: "दुकान नं. 4, मुख्य सब्जी मंडी रोड, सोनारपुर",
  englishAddress: "Shop No. 4, Main Sabzi Mandi Road, Sonarpur",
  area: "Sonarpur, Kolkata",
  city: "Kolkata",
  pincode: "700150",
  location: { lat: 22.4385, lng: 88.4022 },
  isOpen: true,
  acceptingOrders: true,
  statusReason: "चक्की चालू है • ताज़ा पत्थर पिसाई जारी है",
  openingTime: "07:30 AM",
  closingTime: "08:30 PM",
  millingCapacityPerHour: "45 kg/hr",
  stoneType: "Natural Stone (ठंडी पिसाई / Cold Stone Milled)",
  rating: 4.9,
  totalReviews: 328,
  totalOrdersFulfilled: 1420,
  deliveryRadiusKm: 6,
  upiId: "shreeramchakki@upi",
  upiQrUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=shreeramchakki@upi%26pn=Shree%20Ram%20Chakki%26cu=INR",
  bannerUrl: "/mill-hero.jpg",
  avatarUrl:
    "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80",
};

export const DEFAULT_CUSTOMER = {
  id: "cust_somnath_01",
  name: "सोमनाथ बैद्य",
  englishName: "Somnath Baidya",
  phone: "+91 98300 12345",
  address: "फ्लैट 4B, ड्रीम हाइट्स, स्टेशन रोड, सोनारपुर",
  englishAddress: "Flat 4B, Dream Heights, Station Road, Sonarpur",
  area: "Station Road, Sonarpur",
  city: "Kolkata",
  pincode: "700150",
  lat: 22.439,
  lng: 88.403,
};

export const DEFAULT_AGENT = {
  id: "delivery_boy_demo_01",
  name: "राजू डिलीवरी",
  englishName: "Raju Delivery",
  phone: "+91 98000 11111",
  vehicle: "Honda Activa (WB 02 AB 1234)",
  isOnline: true,
  currentLat: 22.4385,
  currentLng: 88.4022,
};

/**
 * Read the complete shared bridge data from disk.
 */
export function getSharedBridgeData() {
  try {
    if (fs.existsSync(RESOLVED_PATH)) {
      const raw = fs.readFileSync(RESOLVED_PATH, "utf8");
      const data = JSON.parse(raw);
      return {
        orders: Array.isArray(data.orders) ? data.orders : [],
        mill: data.mill || DEFAULT_BRIDGE_MILL,
        products: Array.isArray(data.products) && data.products.length > 0 ? data.products : INITIAL_PRODUCTS,
        customer: data.customer || DEFAULT_CUSTOMER,
        deliveryAgent: data.deliveryAgent || DEFAULT_AGENT,
        lastUpdated: data.lastUpdated || Date.now(),
      };
    }
  } catch (err) {
    console.warn("[LocalBridge] Read error, initializing fresh bridge:", err.message);
  }

  // Initialize fresh clean bridge with 0 orders
  const fresh = {
    orders: [],
    mill: DEFAULT_BRIDGE_MILL,
    products: INITIAL_PRODUCTS,
    customer: DEFAULT_CUSTOMER,
    deliveryAgent: DEFAULT_AGENT,
    lastUpdated: Date.now(),
  };
  writeSharedBridgeData(fresh);
  return fresh;
}

/**
 * Write shared bridge data atomically.
 */
export function writeSharedBridgeData(data) {
  try {
    const dir = path.dirname(RESOLVED_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = JSON.stringify(
      {
        orders: data.orders || [],
        mill: data.mill || DEFAULT_BRIDGE_MILL,
        products: data.products || INITIAL_PRODUCTS,
        customer: data.customer || DEFAULT_CUSTOMER,
        deliveryAgent: data.deliveryAgent || DEFAULT_AGENT,
        lastUpdated: Date.now(),
      },
      null,
      2
    );
    fs.writeFileSync(RESOLVED_PATH, payload, "utf8");
    return true;
  } catch (err) {
    console.error("[LocalBridge] Write error:", err.message);
    return false;
  }
}

/**
 * Backward-compatible helper for reading orders.
 */
export function getSharedOrders() {
  return getSharedBridgeData().orders;
}

/**
 * Backward-compatible helper for writing orders.
 */
export function writeSharedOrders(orders) {
  const current = getSharedBridgeData();
  current.orders = orders;
  return writeSharedBridgeData(current);
}

/**
 * Prepend a new customer order to the shared store.
 */
export function createSharedOrder(newOrder) {
  const bridge = getSharedBridgeData();
  const filtered = bridge.orders.filter((o) => o.id !== newOrder.id);
  bridge.orders = [newOrder, ...filtered];
  writeSharedBridgeData(bridge);
  return newOrder;
}

/**
 * Update an existing order status and metadata.
 */
export function updateSharedOrder(orderId, status, extraFields = {}) {
  const bridge = getSharedBridgeData();
  let updatedOrder = null;

  bridge.orders = bridge.orders.map((order) => {
    if (order.id === orderId || order.orderNumber === orderId) {
      updatedOrder = {
        ...order,
        ...extraFields,
        status: status || order.status,
        orderStatus: status || order.orderStatus,
        updatedAt: new Date().toISOString(),
      };
      return updatedOrder;
    }
    return order;
  });

  if (updatedOrder) {
    writeSharedBridgeData(bridge);
  }
  return updatedOrder;
}

/**
 * Update shared mill details (e.g. open/closed status, pricing, details).
 */
export function updateSharedMill(millUpdates) {
  const bridge = getSharedBridgeData();
  bridge.mill = {
    ...bridge.mill,
    ...millUpdates,
    updatedAt: new Date().toISOString(),
  };
  writeSharedBridgeData(bridge);
  return bridge.mill;
}

/**
 * Update shared products catalog.
 */
export function updateSharedProducts(products) {
  const bridge = getSharedBridgeData();
  bridge.products = products;
  writeSharedBridgeData(bridge);
  return bridge.products;
}

/**
 * Reset shared bridge to clean state with 0 orders.
 */
export function resetSharedBridgeData() {
  const cleanState = {
    orders: [],
    mill: DEFAULT_BRIDGE_MILL,
    products: INITIAL_PRODUCTS,
    customer: DEFAULT_CUSTOMER,
    deliveryAgent: DEFAULT_AGENT,
    lastUpdated: Date.now(),
  };
  writeSharedBridgeData(cleanState);
  return cleanState;
}

/**
 * Shared Next.js App Router Request Handler
 */
export async function handleBridgeRequest(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === "GET") {
    const bridge = getSharedBridgeData();
    return Response.json(
      {
        success: true,
        orders: bridge.orders,
        mill: bridge.mill,
        products: bridge.products,
        customer: bridge.customer,
        deliveryAgent: bridge.deliveryAgent,
        timestamp: Date.now(),
      },
      { headers: corsHeaders }
    );
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { action, order, orderId, status, extraFields, mill, products } = body;

      if (action === "create" && order) {
        const created = createSharedOrder(order);
        return Response.json(
          { success: true, order: created },
          { headers: corsHeaders }
        );
      }

      if (action === "update" && orderId) {
        const updated = updateSharedOrder(orderId, status, extraFields);
        return Response.json(
          { success: true, order: updated },
          { headers: corsHeaders }
        );
      }

      if (action === "updateTracking" && orderId) {
        const { trackingData } = body;
        const updated = updateSharedOrder(orderId, null, {
          liveTracking: {
            ...trackingData,
            updatedAt: new Date().toISOString(),
          },
        });
        return Response.json(
          { success: true, order: updated },
          { headers: corsHeaders }
        );
      }

      if (action === "updateMill" && mill) {
        const updatedMill = updateSharedMill(mill);
        return Response.json(
          { success: true, mill: updatedMill },
          { headers: corsHeaders }
        );
      }

      if (action === "updateProducts" && Array.isArray(products)) {
        const updatedProducts = updateSharedProducts(products);
        return Response.json(
          { success: true, products: updatedProducts },
          { headers: corsHeaders }
        );
      }

      if (action === "reset" || action === "clear") {
        const cleanState = resetSharedBridgeData();
        return Response.json(
          {
            success: true,
            message: "Previous data wiped. Clean state initialized.",
            ...cleanState,
          },
          { headers: corsHeaders }
        );
      }

      return Response.json(
        { success: false, error: "Invalid action" },
        { status: 400, headers: corsHeaders }
      );
    } catch (err) {
      return Response.json(
        { success: false, error: err.message },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
}
