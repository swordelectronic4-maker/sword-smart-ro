/**
 * Unified Data Store — Single Source of Truth
 * 
 * PRIMARY: Supabase PostgreSQL (real database)
 * FALLBACK: localStorage (works offline)
 * 
 * All admin writes go to Supabase first, then localStorage.
 * Live website reads from Supabase when connected.
 */

import { defaultProducts } from '@/data/products';
import { defaultOrders, defaultUsers } from '@/data/adminData';
import {
  initSupabaseData,
  getSupabaseStatus,
  getProducts as getSupabaseProducts,
  getProductById as getSupabaseProductById,
  getOrders as getSupabaseOrders,
  getOrderById as getSupabaseOrderById,
  saveOrder as saveSupabaseOrder,
  getUsers as getSupabaseUsers,
  getCoupons as getSupabaseCoupons,
  saveLead as saveSupabaseLead,
  adminUpdateProduct,
  adminDeleteProduct,
  adminAddProduct,
  adminUpdateOrder,
} from './supabaseData';

// ═════════════════════════════════════════════════════════════
// Initialization
// ═════════════════════════════════════════════════════════════
let initialized = false;

export async function initDataStore(): Promise<void> {
  if (initialized) return;
  await initSupabaseData();
  seedDatabase();
  initialized = true;
}

// ═════════════════════════════════════════════════════════════
// Storage Keys
// ═════════════════════════════════════════════════════════════
const KEYS = {
  products:    'sword_products',
  orders:      'sword_orders',
  users:       'sword_users',
  coupons:     'sword_coupons',
  leads:       'sword_leads',
  analytics:   'sword_analytics_events',
  cart:        'sword_cart',
  settings:    'sword_settings',
  initialized: 'sword_db_initialized',
} as const;

// ═════════════════════════════════════════════════════════════
// Generic CRUD Helpers
// ═════════════════════════════════════════════════════════════
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// ═════════════════════════════════════════════════════════════
// Seed Database (first visit only)
// ═════════════════════════════════════════════════════════════
export function seedDatabase(): void {
  if (localStorage.getItem(KEYS.initialized) === 'true') return;

  if (!localStorage.getItem(KEYS.products)) {
    save(KEYS.products, defaultProducts.map(p => ({
      ...p,
      // New fields with defaults
      mrp: p.originalPrice || Math.round(p.price * 1.4),
      price: p.price,
      comparePrice: p.originalPrice || p.price,
      costPrice: Math.round(p.price * 0.5),
      gstRate: 18,
      gstInclusive: true,
      hsnCode: '8421',
      slug: p.id,
      sku: `SWR-${p.id.toUpperCase().replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      brand: 'SWORD',
      tags: [p.category, 'water purifier', 'smart'],
      images: [p.image || '/assets/product-hero.png'],
      shortDescription: p.description?.slice(0, 120) || '',
      lowStockThreshold: 5,
      allowBackorder: false,
      weightKg: 12.5,
      isDraft: false,
      visible: true,
      featured: false,
      seoTitle: p.name,
      seoDescription: p.description?.slice(0, 160) || '',
      stock: Math.floor(Math.random() * 50) + 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })));
  }

  if (!localStorage.getItem(KEYS.orders)) {
    save(KEYS.orders, defaultOrders);
  }

  if (!localStorage.getItem(KEYS.users)) {
    save(KEYS.users, defaultUsers);
  }

  if (!localStorage.getItem(KEYS.coupons)) {
    save(KEYS.coupons, [
      { id: 'c1', code: 'SWORD10', type: 'percent' as const, value: 10, minOrder: 0, usageLimit: 100, usedCount: 12, expiry: '2025-12-31', isActive: true },
      { id: 'c2', code: 'FIRSTBUY', type: 'fixed' as const, value: 500, minOrder: 5000, usageLimit: 50, usedCount: 8, expiry: '2025-12-31', isActive: true },
      { id: 'c3', code: 'DIWALI20', type: 'percent' as const, value: 20, minOrder: 20000, usageLimit: 30, usedCount: 3, expiry: '2025-11-15', isActive: false },
      { id: 'c4', code: 'FREESHIP', type: 'free_shipping' as const, value: 0, minOrder: 20000, usageLimit: 200, usedCount: 45, expiry: '2025-12-31', isActive: true },
    ]);
  }

  if (!localStorage.getItem(KEYS.settings)) {
    save(KEYS.settings, {
      storeName: 'SWORD Smart Water',
      currency: 'INR',
      gstNumber: '24ABCPJ1234Z1Z5',
      razorpayKeyId: '',
      razorpaySecret: '',
      razorpayLive: false,
      shiprocketToken: '',
      shiprocketChannelId: '',
      supportPhone: '+91 95377 97597',
      supportEmail: 'priyank.joshi@swordhome.com',
      freeShippingThreshold: 20000,
    });
  }

  localStorage.setItem(KEYS.initialized, 'true');
  console.log('[DataStore] Database seeded');
}

// ═════════════════════════════════════════════════════════════
// PRODUCTS — Supabase-backed with localStorage fallback
// ═════════════════════════════════════════════════════════════
export interface LiveProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;   // Backward compat - use mrp/comparePrice going forward
  category: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  specs: Record<string, string>;
  inStock: boolean;
  stock: number;
  visible: boolean;
  // NEW FIELDS (all optional for backward compatibility)
  slug?: string;
  sku?: string;
  mrp?: number;              // Maximum Retail Price (strikethrough)
  comparePrice?: number;     // Compare at price
  costPrice?: number;        // Cost price
  gstRate?: number;          // GST % (default 18)
  gstInclusive?: boolean;    // Price includes GST?
  hsnCode?: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  shortDescription?: string;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  weightKg?: number;
  isDraft?: boolean;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function getProducts(): LiveProduct[] {
  // Return from localStorage immediately (sync)
  // Supabase data is fetched async via getSupabaseProducts
  return load<LiveProduct[]>(KEYS.products, []);
}

export async function getProductsAsync(): Promise<LiveProduct[]> {
  try {
    const products = await getSupabaseProducts();
    if (products && products.length > 0) {
      // Cache in localStorage
      save(KEYS.products, products);
      return products;
    }
  } catch (e) {
    console.warn('[DataStore] Supabase products failed:', e);
  }
  return getProducts();
}

export function getProductById(id: string): LiveProduct | undefined {
  return getProducts().find(p => p.id === id);
}

export async function getProductByIdAsync(id: string): Promise<LiveProduct | undefined> {
  try {
    const products = await getSupabaseProducts();
    return products.find((p: any) => p.id === id);
  } catch {
    return getProductById(id);
  }
}

export function saveProducts(products: LiveProduct[]): void {
  save(KEYS.products, products);
}

export async function updateProduct(id: string, updates: Partial<LiveProduct>): Promise<void> {
  // Update Supabase first
  try {
    await adminUpdateProduct(id, updates);
  } catch (e) {
    console.warn('[DataStore] Supabase updateProduct failed:', e);
  }
  // Always update localStorage
  const products = getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
  saveProducts(products);
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await adminDeleteProduct(id);
  } catch (e) {
    console.warn('[DataStore] Supabase deleteProduct failed:', e);
  }
  saveProducts(getProducts().filter(p => p.id !== id));
}

export async function addProduct(product: LiveProduct): Promise<void> {
  try {
    await adminAddProduct(product);
  } catch (e) {
    console.warn('[DataStore] Supabase addProduct failed:', e);
  }
  saveProducts([...getProducts(), product]);
}

// ═════════════════════════════════════════════════════════════
// ORDERS — Supabase-backed with localStorage fallback
// ═════════════════════════════════════════════════════════════
export interface LiveOrder {
  id: string;
  orderNumber?: string;
  customer: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    productId: string;
    productName: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  total?: number;
  cgst: number;
  sgst: number;
  shipping: number;
  grandTotal: number;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
}

export function getOrders(): LiveOrder[] {
  const raw = load<any[]>(KEYS.orders, []);
  // Normalize from AdminOrder shape to LiveOrder shape
  return raw.map(o => ({
    id: o.id || '',
    orderNumber: o.orderNumber || o.id,
    customer: o.customer || 'Unknown',
    customerName: o.customerName || o.customer,
    customerEmail: o.customerEmail || o.email,
    customerPhone: o.customerPhone || o.phone,
    email: o.email || '',
    phone: o.phone || '',
    address: o.address || '',
    city: o.city || '',
    state: o.state || '',
    pincode: o.pincode || '',
    items: (o.items || []).map((it: any) => ({
      productId: it.productId || '',
      productName: it.productName || it.name || 'Product',
      image: it.image || '/assets/product-hero.png',
      price: it.price || 0,
      quantity: it.quantity || it.qty || 1,
    })),
    status: o.status || 'pending',
    paymentStatus: o.paymentStatus || o.payment_status || 'pending',
    paymentMethod: o.paymentMethod || o.payment_method || 'UPI',
    subtotal: o.subtotal || 0,
    cgst: o.cgst || 0,
    sgst: o.sgst || 0,
    shipping: o.shipping || 0,
    grandTotal: o.grandTotal || o.grand_total || o.subtotal || 0,
    createdAt: o.createdAt || o.placedAt || new Date().toISOString(),
    updatedAt: o.updatedAt || o.updated_at,
    notes: o.notes || '',
    trackingNumber: o.trackingNumber || o.trackingId || '',
    carrier: o.carrier || '',
  }));
}

export async function getOrdersAsync(): Promise<LiveOrder[]> {
  try {
    const orders = await getSupabaseOrders();
    if (orders && orders.length > 0) {
      save(KEYS.orders, orders);
      return orders;
    }
  } catch (e) {
    console.warn('[DataStore] Supabase orders failed:', e);
  }
  return getOrders();
}

export function getOrderById(id: string): LiveOrder | undefined {
  return getOrders().find(o => o.id === id);
}

export function saveOrders(orders: LiveOrder[]): void {
  save(KEYS.orders, orders);
}

export async function updateOrder(id: string, updates: Partial<LiveOrder>): Promise<void> {
  try {
    await adminUpdateOrder(id, updates);
  } catch (e) {
    console.warn('[DataStore] Supabase updateOrder failed:', e);
  }
  saveOrders(getOrders().map(o => o.id === id ? { ...o, ...updates } : o));
}

export function deleteOrder(id: string): void {
  saveOrders(getOrders().filter(o => o.id !== id));
}

export async function addOrder(order: LiveOrder): Promise<void> {
  try {
    await saveSupabaseOrder(order);
  } catch (e) {
    console.warn('[DataStore] Supabase addOrder failed:', e);
  }
  saveOrders([order, ...getOrders()]);
}

// ═════════════════════════════════════════════════════════════
// USERS
// ═════════════════════════════════════════════════════════════
export interface LiveUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
  avatar?: string;
}

export function getUsers(): LiveUser[] {
  const raw = load<any[]>(KEYS.users, []);
  // Normalize from AdminUser shape to LiveUser shape
  return raw.map(u => ({
    id: u.id || '',
    name: u.name || 'Unknown',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role || 'customer',
    status: u.status || 'active',
    joinDate: u.joinDate || u.joined || new Date().toISOString(),
    avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=1a365d&color=fff`,
  }));
}

export async function getUsersAsync(): Promise<LiveUser[]> {
  try {
    const users = await getSupabaseUsers();
    if (users && users.length > 0) {
      save(KEYS.users, users);
      return users;
    }
  } catch (e) {
    console.warn('[DataStore] Supabase users failed:', e);
  }
  return getUsers();
}

export function saveUsers(users: LiveUser[]): void {
  save(KEYS.users, users);
}

export function updateUser(id: string, updates: Partial<LiveUser>): void {
  saveUsers(getUsers().map(u => u.id === id ? { ...u, ...updates } : u));
}

export function deleteUser(id: string): void {
  saveUsers(getUsers().filter(u => u.id !== id));
}

export function addUser(user: LiveUser): void {
  saveUsers([...getUsers(), user]);
}

// ═════════════════════════════════════════════════════════════
// COUPONS
// ═════════════════════════════════════════════════════════════
export interface LiveCoupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  expiry: string;
  isActive: boolean;
}

export function getCoupons(): LiveCoupon[] {
  return load<LiveCoupon[]>(KEYS.coupons, []);
}

export async function getCouponsAsync(): Promise<LiveCoupon[]> {
  try {
    const coupons = await getSupabaseCoupons();
    if (coupons && coupons.length > 0) {
      save(KEYS.coupons, coupons);
      return coupons;
    }
  } catch (e) {
    console.warn('[DataStore] Supabase coupons failed:', e);
  }
  return getCoupons();
}

export function saveCoupons(coupons: LiveCoupon[]): void {
  save(KEYS.coupons, coupons);
}

export function updateCoupon(id: string, updates: Partial<LiveCoupon>): void {
  saveCoupons(getCoupons().map(c => c.id === id ? { ...c, ...updates } : c));
}

export function deleteCoupon(id: string): void {
  saveCoupons(getCoupons().filter(c => c.id !== id));
}

export function addCoupon(coupon: LiveCoupon): void {
  saveCoupons([...getCoupons(), coupon]);
}

export function validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message?: string } {
  const coupon = getCoupons().find(
    c => c.code.toUpperCase() === code.toUpperCase() && c.isActive
  );
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon' };
  if (new Date(coupon.expiry) < new Date()) return { valid: false, discount: 0, message: 'Coupon expired' };
  if (coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0, message: 'Usage limit reached' };
  if (subtotal < coupon.minOrder) return { valid: false, discount: 0, message: `Min order ₹${coupon.minOrder}` };

  let discount = 0;
  if (coupon.type === 'percent') discount = Math.round((subtotal * coupon.value) / 100);
  else if (coupon.type === 'fixed') discount = coupon.value;
  else if (coupon.type === 'free_shipping') discount = 0;

  return { valid: true, discount };
}

export function useCoupon(code: string): void {
  const coupons = getCoupons().map(c =>
    c.code.toUpperCase() === code.toUpperCase() ? { ...c, usedCount: c.usedCount + 1 } : c
  );
  saveCoupons(coupons);
}

// ═════════════════════════════════════════════════════════════
// SETTINGS
// ═════════════════════════════════════════════════════════════
export interface AppSettings {
  storeName: string;
  currency: string;
  gstNumber: string;
  razorpayKeyId: string;
  razorpaySecret: string;
  razorpayLive: boolean;
  shiprocketToken: string;
  shiprocketChannelId: string;
  supportPhone: string;
  supportEmail: string;
  freeShippingThreshold: number;
}

export function getSettings(): AppSettings {
  return load<AppSettings>(KEYS.settings, {
    storeName: 'SWORD Smart Water',
    currency: 'INR',
    gstNumber: '24ABCPJ1234Z1Z5',
    razorpayKeyId: '',
    razorpaySecret: '',
    razorpayLive: false,
    shiprocketToken: '',
    shiprocketChannelId: '',
    supportPhone: '+91 95377 97597',
    supportEmail: 'priyank.joshi@swordhome.com',
    freeShippingThreshold: 20000,
  });
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  save(KEYS.settings, { ...current, ...settings });
}

// ═════════════════════════════════════════════════════════════
// CART
// ═════════════════════════════════════════════════════════════
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export function getCart(): CartItem[] {
  return load<CartItem[]>(KEYS.cart, []);
}

export function saveCart(items: CartItem[]): void {
  save(KEYS.cart, items);
}

// ═════════════════════════════════════════════════════════════
// LEADS
// ═════════════════════════════════════════════════════════════
export interface InterestedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'chatbot' | 'contact_form' | 'callback_request';
  message?: string;
  timestamp: string;
  pageViewed?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
}

export async function captureLead(lead: Omit<InterestedCustomer, 'id' | 'timestamp'>): Promise<void> {
  const fullLead: InterestedCustomer = {
    ...lead,
    id: `lead_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  
  // Save to Supabase
  try {
    await saveSupabaseLead(fullLead);
  } catch (e) {
    console.warn('[DataStore] Supabase lead save failed:', e);
  }
  
  // Always save to localStorage
  const leads = getInterestedCustomers();
  leads.push(fullLead);
  localStorage.setItem('sword_interested_customers', JSON.stringify(leads));
}

export function getInterestedCustomers(): InterestedCustomer[] {
  try {
    return JSON.parse(localStorage.getItem('sword_interested_customers') || '[]');
  } catch {
    return [];
  }
}

export function updateLeadStatus(id: string, status: InterestedCustomer['status']): void {
  const customers = getInterestedCustomers().map(c =>
    c.id === id ? { ...c, status } : c
  );
  localStorage.setItem('sword_interested_customers', JSON.stringify(customers));
}

export function exportLeadsCSV(): string {
  const customers = getInterestedCustomers();
  if (customers.length === 0) return '';
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Message', 'Date', 'Status', 'Page Viewed'];
  const rows = customers.map(c => [
    c.id, c.name, c.email, c.phone, c.source, c.message || '', c.timestamp, c.status, c.pageViewed || ''
  ]);
  return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
}

// ═════════════════════════════════════════════════════════════
// ANALYTICS
// ═════════════════════════════════════════════════════════════
export function getAnalyticsEvents(): any[] {
  return load<any[]>(KEYS.analytics, []);
}

export function getAnalyticsSummary() {
  const events = getAnalyticsEvents();
  const customers = getInterestedCustomers();
  const sessions = new Set(events.map((e: any) => e.sessionId));
  return {
    totalPageViews: events.filter((e: any) => e.type === 'page_view').length,
    uniqueSessions: sessions.size,
    totalCartAdds: events.filter((e: any) => e.type === 'add_to_cart').length,
    totalCheckouts: events.filter((e: any) => e.type === 'checkout_start').length,
    totalPurchases: events.filter((e: any) => e.type === 'purchase').length,
    totalLeads: customers.length,
    newLeads: customers.filter((c: any) => c.status === 'new').length,
    topProducts: [] as any[],
  };
}

// ═════════════════════════════════════════════════════════════
// RESET
// ═════════════════════════════════════════════════════════════
export function resetDatabase(): void {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  seedDatabase();
}

// Auto-init on import (browser only)
if (typeof window !== 'undefined') {
  initDataStore();
}

console.log('[DataStore] Unified store loaded — Supabase primary, localStorage fallback');
