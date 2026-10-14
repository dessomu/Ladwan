// @ladwan/firebase - Shared Firestore Collection Names, Role Constants & Status Enums
// Used by all 4 Ladwan apps: admin-mills, customer-pwa, delivery-boy, super-admin

// ── Firestore Collection Names ──────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: "users",
  MILLS: "mills",
  ORDERS: "orders",
  NOTIFICATIONS: "notifications",
};

// ── Firestore Subcollection Names (under mills/{millId}/) ───────────────────
export const SUBCOLLECTIONS = {
  PRODUCTS: "products",
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

// ── Order Status Flow ───────────────────────────────────────────────────────
// pending → in_milling → packed → out_for_delivery → delivered
// Any state → cancelled
export const ORDER_STATUS = {
  PENDING: "pending",
  IN_MILLING: "in_milling",      // alias used in code: "grinding"
  PACKED: "packed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Alias map for legacy code using "grinding" as status value
export const ORDER_STATUS_ALIAS = {
  grinding: ORDER_STATUS.IN_MILLING,
  in_milling: "grinding", // reverse alias for display compatibility
};

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

// ── Product Categories (matches admin-mills filter tabs) ────────────────────
export const PRODUCT_CATEGORIES = {
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

// ── Demo Mill IDs (for development without a live Firebase project) ──────────
export const DEMO_MILL_IDS = {
  SHREE_RAM: "mill_shree_ram_01",
  KRISHNA: "mill_krishna_02",
};

export const DEMO_USER_IDS = {
  SHREE_RAM_OWNER: "usr_shree_ram_01",
  KRISHNA_OWNER: "usr_krishna_02",
};
