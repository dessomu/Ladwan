// @ladwan/firebase - Shared Firestore Collection Names, Role Constants & Status Enums
// Used by all 4 Ladwan apps: admin-mills, customer-pwa, delivery-boy, super-admin

// ── Firestore Collection Names ──────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: "users",
  MILLS: "mills",
  ORDERS: "orders",
  NOTIFICATIONS: "notifications",
  REVIEWS: "reviews",
};

// ── Firestore Subcollection Names (under mills/{millId}/) ───────────────────
export const SUBCOLLECTIONS = {
  INVENTORY: "inventory",
  PRODUCTS: "inventory", // aliased to inventory for backward compatibility
  DAILY_LEDGER: "daily_ledger",
};

// ── User Roles ──────────────────────────────────────────────────────────────
export const ROLES = {
  MILL_OWNER: "mill_owner",
  MILL_STAFF: "mill_staff",
  DELIVERY_BOY: "delivery_boy",
  CUSTOMER: "customer",
  SUPER_ADMIN: "super_admin",
};

// ── Order Status Flow (Linear 6-Stage Pipeline) ─────────────────────────────
// placed → accepted → grinding → packed → out_for_delivery → delivered
// Any valid pre-grinding state → cancelled
export const ORDER_STATUS = {
  PLACED: "placed",
  PENDING: "placed", // backward compatibility alias
  ACCEPTED: "accepted",
  GRINDING: "grinding",
  IN_MILLING: "grinding", // backward compatibility alias
  PACKED: "packed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Alias map for status normalization across admin-mills, customer-pwa, delivery-boy
export const ORDER_STATUS_ALIAS = {
  pending: "placed",
  placed: "placed",
  accepted: "accepted",
  grinding: "grinding",
  in_milling: "grinding",
  packed: "packed",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled",
};

// Status labels & steps
export const ORDER_TRACKING_STEPS = [
  { key: "placed", label: "ऑर्डर मिला", englishLabel: "Order Placed", step: 1 },
  { key: "accepted", label: "स्वीकार किया", englishLabel: "Accepted", step: 2 },
  { key: "grinding", label: "ताज़ा पिसाई चालू", englishLabel: "Fresh Grinding", step: 3 },
  { key: "packed", label: "ताज़ा पैक हुआ", englishLabel: "Packed & Sealed", step: 4 },
  { key: "out_for_delivery", label: "डिलीवरी रास्ते में", englishLabel: "Out for Delivery", step: 5 },
  { key: "delivered", label: "सफलतापूर्वक डिलीवर", englishLabel: "Delivered", step: 6 },
];

// ── User Account Status ─────────────────────────────────────────────────────
export const USER_STATUS = {
  ACTIVE: "active",
  PENDING_APPROVAL: "pending_approval",
  SUSPENDED: "suspended",
};

// ── Mill Verification Status ────────────────────────────────────────────────
export const MILL_STATUS = {
  VERIFIED: "verified",
  PENDING: "pending_verification",
  REJECTED: "rejected",
};

// ── Payment Methods ─────────────────────────────────────────────────────────
export const PAYMENT_METHODS = {
  UPI: "upi",
  COD: "cod",
};

// ── Payment Status ──────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: "pending",
  VERIFICATION_PENDING: "payment_verification_pending",
  PAID: "paid",
  FAILED: "failed",
};

// ── Delivery Fee Policy ─────────────────────────────────────────────────────
export const DELIVERY_POLICY = {
  FLAT_FEE: 25,
  FREE_DELIVERY_THRESHOLD: 499,
  DEFAULT_RADIUS_KM: 5,
};

// ── Product Categories (matches admin-mills filter tabs) ────────────────────
export const PRODUCT_CATEGORIES = {
  ALL: "All",
  WHEAT_ATTA: "Wheat Atta",
  SPECIALTY_FLOUR: "Specialty Flour",
  SATTU_BESAN: "Sattu & Besan",
  MILLET_ATTA: "Millet Atta",
  SERVICES: "Services",
};

// ── Settlement Status ───────────────────────────────────────────────────────
export const SETTLEMENT_STATUS = {
  PENDING: "pending",
  SETTLED: "settled",
};

// ── Demo Mill IDs (for development and multi-city discovery) ───────────────
export const DEMO_MILL_IDS = {
  ANNAPURNA_KOLKATA: "mill_annapurna_sonarpur_01",
  SHREE_RAM: "mill_shree_ram_01",
  KRISHNA: "mill_krishna_02",
};

export const DEMO_USER_IDS = {
  ANNAPURNA_OWNER: "usr_annapurna_sonarpur_01",
  SHREE_RAM_OWNER: "usr_shree_ram_01",
  KRISHNA_OWNER: "usr_krishna_02",
  DEMO_CUSTOMER: "usr_demo_customer_01",
};

// ── Default Preset Localities for Testing / Pinning ────────────────────────
export const PRESET_LOCALITIES = [
  {
    id: "sonarpur_kolkata",
    name: "Sonarpur, Kolkata",
    hindiName: "सोनारपुर, कोलकाता",
    area: "Station Road, Sonarpur",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700150",
    lat: 22.4385,
    lng: 88.4022,
    isDefault: true,
  },
  {
    id: "garia_kolkata",
    name: "Garia, Kolkata",
    hindiName: "गड़िया, कोलकाता",
    area: "Mahamayatala, Garia",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700084",
    lat: 22.4646,
    lng: 88.3831,
  },
  {
    id: "sec14_gurugram",
    name: "Sector 14, Gurugram",
    hindiName: "सेक्टर 14, गुरुग्राम",
    area: "Main Market, Sector 14",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    lat: 28.4715,
    lng: 77.0345,
  },
  {
    id: "dlf3_gurugram",
    name: "DLF Phase 3, Gurugram",
    hindiName: "डीएलएफ फेज़ 3, गुरुग्राम",
    area: "Cyber City Belt",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    lat: 28.4947,
    lng: 77.0988,
  },
];

