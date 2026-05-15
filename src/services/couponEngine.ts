// @ts-nocheck
/**
 * SWORD Coupon & Promotion Engine
 * 
 * Coupon Types:
 * - percentage: % off (e.g., 10% off)
 * - flat: Fixed amount off (e.g., ₹500 off)
 * - free_shipping: Free shipping
 * - bogo: Buy X Get Y
 * 
 * Controls:
 * - minOrder: Minimum order value
 * - maxDiscount: Maximum discount cap
 * - usageLimit: Total usage limit
 * - perUserLimit: Usage per user
 * - firstTimeOnly: First order only
 * - autoApply: Auto-apply at checkout
 * - categorySpecific: Only for certain categories
 * - productSpecific: Only for certain products
 */

const STORAGE_KEY = 'sword_coupons';
const STORAGE_USAGE_KEY = 'sword_coupon_usage';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'flat' | 'free_shipping' | 'bogo';
  value: number; // % or flat amount
  minOrder: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount: number;
  expiry: string; // ISO date
  isActive: boolean;
  autoApply: boolean;
  firstTimeOnly: boolean;
  categoryIds?: string[];
  productIds?: string[];
  description?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════
// LOAD / SAVE
// ═══════════════════════════════════════════════════════════

function loadCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultCoupons();
  } catch { return getDefaultCoupons(); }
}

function saveCoupons(coupons: Coupon[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons)); } catch {}
}

function loadUsage(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveUsage(usage: Record<string, string[]>) {
  try { localStorage.setItem(STORAGE_USAGE_KEY, JSON.stringify(usage)); } catch {}
}

// ═══════════════════════════════════════════════════════════
// DEFAULT COUPONS
// ═══════════════════════════════════════════════════════════

function getDefaultCoupons(): Coupon[] {
  return [
    {
      id: 'c1',
      code: 'SWORD10',
      type: 'percentage',
      value: 10,
      minOrder: 0,
      maxDiscount: 2000,
      usageLimit: 100,
      perUserLimit: 1,
      usedCount: 12,
      expiry: '2025-12-31',
      isActive: true,
      autoApply: false,
      firstTimeOnly: false,
      description: '10% off on all products (max ₹2,000)',
    },
    {
      id: 'c2',
      code: 'FIRSTBUY',
      type: 'flat',
      value: 500,
      minOrder: 5000,
      usageLimit: 50,
      perUserLimit: 1,
      usedCount: 8,
      expiry: '2025-12-31',
      isActive: true,
      autoApply: false,
      firstTimeOnly: true,
      description: '₹500 off on first order (min ₹5,000)',
    },
    {
      id: 'c3',
      code: 'FREESHIP',
      type: 'free_shipping',
      value: 0,
      minOrder: 20000,
      usageLimit: 200,
      usedCount: 45,
      expiry: '2025-12-31',
      isActive: true,
      autoApply: true,
      firstTimeOnly: false,
      description: 'Free shipping on orders above ₹20,000',
    },
    {
      id: 'c4',
      code: 'DIWALI20',
      type: 'percentage',
      value: 20,
      minOrder: 20000,
      maxDiscount: 5000,
      usageLimit: 30,
      perUserLimit: 1,
      usedCount: 3,
      expiry: '2025-11-15',
      isActive: false,
      autoApply: false,
      firstTimeOnly: false,
      description: 'Diwali special: 20% off (max ₹5,000)',
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════

export function getCoupons(): Coupon[] {
  return loadCoupons();
}

export function getActiveCoupons(): Coupon[] {
  const now = new Date().toISOString().split('T')[0];
  return loadCoupons().filter(
    (c) => c.isActive && c.expiry >= now && (c.usageLimit === undefined || c.usedCount < c.usageLimit)
  );
}

export function getCouponById(id: string): Coupon | undefined {
  return loadCoupons().find((c) => c.id === id);
}

export function addCoupon(coupon: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Coupon {
  const coupons = loadCoupons();
  const newCoupon: Coupon = {
    ...coupon,
    id: `coupon_${Date.now()}`,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };
  coupons.push(newCoupon);
  saveCoupons(coupons);
  return newCoupon;
}

export function updateCoupon(id: string, updates: Partial<Coupon>): boolean {
  const coupons = loadCoupons();
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  coupons[idx] = { ...coupons[idx], ...updates };
  saveCoupons(coupons);
  return true;
}

export function deleteCoupon(id: string): boolean {
  const coupons = loadCoupons();
  const filtered = coupons.filter((c) => c.id !== id);
  if (filtered.length === coupons.length) return false;
  saveCoupons(filtered);
  return true;
}

// ═══════════════════════════════════════════════════════════
// VALIDATION & APPLICATION
// ═══════════════════════════════════════════════════════════

export interface CouponResult {
  valid: boolean;
  coupon?: Coupon;
  discount: number;
  message: string;
  freeShipping?: boolean;
}

export function validateCoupon(
  code: string,
  subtotal: number,
  userId?: string,
  isFirstOrder: boolean = false,
  cartItems?: Array<{ productId: string; categoryId?: string }>
): CouponResult {
  const coupons = loadCoupons();
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
  );

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid coupon code' };
  }

  // Check expiry
  const today = new Date().toISOString().split('T')[0];
  if (coupon.expiry < today) {
    return { valid: false, coupon, discount: 0, message: 'Coupon has expired' };
  }

  // Check usage limit
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, coupon, discount: 0, message: 'Coupon usage limit reached' };
  }

  // Check per-user limit
  if (userId && coupon.perUserLimit) {
    const usage = loadUsage();
    const userUsage = usage[coupon.id]?.filter((uid) => uid === userId).length || 0;
    if (userUsage >= coupon.perUserLimit) {
      return { valid: false, coupon, discount: 0, message: 'You have already used this coupon' };
    }
  }

  // Check first-time only
  if (coupon.firstTimeOnly && !isFirstOrder) {
    return { valid: false, coupon, discount: 0, message: 'For first-time customers only' };
  }

  // Check minimum order
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      coupon,
      discount: 0,
      message: `Minimum order value ₹${coupon.minOrder} required`,
    };
  }

  // Check category/product restrictions
  if (coupon.categoryIds?.length && cartItems) {
    const hasValidItem = cartItems.some((item) =>
      coupon.categoryIds?.includes(item.categoryId || '')
    );
    if (!hasValidItem) {
      return { valid: false, coupon, discount: 0, message: 'Not valid for items in your cart' };
    }
  }

  if (coupon.productIds?.length && cartItems) {
    const hasValidItem = cartItems.some((item) =>
      coupon.productIds?.includes(item.productId)
    );
    if (!hasValidItem) {
      return { valid: false, coupon, discount: 0, message: 'Not valid for items in your cart' };
    }
  }

  // Calculate discount
  let discount = 0;
  let freeShipping = false;

  switch (coupon.type) {
    case 'percentage':
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      break;
    case 'flat':
      discount = coupon.value;
      if (discount > subtotal) discount = subtotal;
      break;
    case 'free_shipping':
      freeShipping = true;
      discount = 0;
      break;
    case 'bogo':
      // Simple BOGO: discount = cheapest item price
      discount = 0; // Complex calculation needed
      break;
  }

  return {
    valid: true,
    coupon,
    discount: Math.round(discount * 100) / 100,
    message: `${coupon.code} applied successfully!`,
    freeShipping,
  };
}

/** Mark a coupon as used */
export function markCouponUsed(couponId: string, userId: string) {
  const coupons = loadCoupons();
  const idx = coupons.findIndex((c) => c.id === couponId);
  if (idx !== -1) {
    coupons[idx].usedCount += 1;
    saveCoupons(coupons);
  }

  const usage = loadUsage();
  if (!usage[couponId]) usage[couponId] = [];
  usage[couponId].push(userId);
  saveUsage(usage);
}

/** Get auto-apply coupons for a given subtotal */
export function getAutoApplyCoupons(subtotal: number): Coupon[] {
  return getActiveCoupons().filter(
    (c) => c.autoApply && subtotal >= c.minOrder
  );
}

/** Get coupon performance analytics */
export function getCouponAnalytics() {
  const coupons = loadCoupons();
  return coupons.map((c) => ({
    ...c,
    utilizationRate: c.usageLimit ? (c.usedCount / c.usageLimit) * 100 : 0,
    isExpired: c.expiry < new Date().toISOString().split('T')[0],
    status: c.isActive
      ? c.expiry >= new Date().toISOString().split('T')[0]
        ? 'active'
        : 'expired'
      : 'inactive',
  }));
}
