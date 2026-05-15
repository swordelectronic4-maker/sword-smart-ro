/**
 * Supabase Data Layer — Primary data source
 * 
 * Reads/writes directly from Supabase PostgreSQL.
 * Falls back to localStorage if Supabase is unavailable.
 * 
 * Price conversion: Supabase stores in paise (₹27,999 = 2799900)
 * UI uses rupees (27999) — conversion happens here.
 */

import {
  supabase,
  fetchProducts as fetchProductsDB,
  fetchOrders as fetchOrdersDB,
  fetchUsers as fetchUsersDB,
  fetchCoupons as fetchCouponsDB,
  fetchLeads as fetchLeadsDB,
  insertOrder as insertOrderDB,
  insertLead as insertLeadDB,
  updateOrderDB,
  updateProductDB,
  deleteProductDB,
  insertProduct as insertProductDB,
  checkSupabaseConnection,
} from './supabase';

// ═════════════════════════════════════════════════════════════
// Connection Status
// ═════════════════════════════════════════════════════════════
let isConnected = false;

export async function initSupabaseData(): Promise<boolean> {
  isConnected = await checkSupabaseConnection();
  console.log('[SupabaseData] Connected:', isConnected);
  return isConnected;
}

export function getSupabaseStatus(): boolean {
  return isConnected;
}

// ═════════════════════════════════════════════════════════════
// Product Mappers (DB ↔ UI)
// ═════════════════════════════════════════════════════════════

// Image mapping: product slug → image path
const PRODUCT_IMAGES: Record<string, string> = {
  'sword-smart-ro': '/assets/product-hero.png',
  'pp-cotton-filter-5m': '/assets/filter-pp.png',
  'activated-carbon-filter-cb': '/assets/filter-carbon.png',
  'ro-membrane-75gpd': '/assets/membrane-ro.png',
  'nf-membrane-nano': '/assets/membrane-nf.png',
  'uf-membrane-ultra': '/assets/membrane-uf.png',
  'mineral-cartridge-ca': '/assets/filter-mineral.png',
  'tds-sensor-wifi': '/assets/tds-sensor.png',
  'annual-filter-kit-2025': '/assets/filter-kit.png',
  'amc-gold-plan-2025': '/assets/amc-service.png',
  'amc-platinum-plan-2025': '/assets/amc-service.png',
  'installation-kit-pro': '/assets/install-kit.png',
};

function mapProductFromDB(dbProduct: any) {
  const price = Math.round(dbProduct.price / 100); // paise → rupees
  const originalPrice = dbProduct.sale_price
    ? Math.round(dbProduct.sale_price / 100)
    : Math.round((dbProduct.price * 1.3) / 100); // 30% markup if no sale price
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price,
    originalPrice,
    category: dbProduct.category_id === 'cat-1' ? 'Water Purifiers' :
              dbProduct.category_id === 'cat-2' ? 'Filter Cartridges' :
              dbProduct.category_id === 'cat-3' ? 'Membranes' :
              dbProduct.category_id === 'cat-4' ? 'AMC Plans' :
              dbProduct.category_id === 'cat-5' ? 'Accessories' : 'Other',
    rating: 4.7, // Could be fetched from reviews table
    reviews: 1200,
    image: PRODUCT_IMAGES[dbProduct.slug] || '/assets/product-hero.png',
    description: dbProduct.description || dbProduct.short_description || '',
    specs: dbProduct.specifications || {},
    inStock: dbProduct.stock > 0 && dbProduct.status === 'active',
    stock: dbProduct.stock || 0,
    visible: dbProduct.status === 'active',
    slug: dbProduct.slug,
    sku: dbProduct.sku,
    featured: dbProduct.featured,
  };
}

// ═════════════════════════════════════════════════════════════
// PRODUCTS
// ═════════════════════════════════════════════════════════════
export async function getProducts(): Promise<any[]> {
  try {
    const dbProducts = await fetchProductsDB();
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(mapProductFromDB);
    }
  } catch (e) {
    console.warn('[SupabaseData] fetchProducts failed, using localStorage:', e);
  }
  // Fallback to localStorage
  return getLocalProducts();
}

export async function getProductById(id: string): Promise<any | undefined> {
  const products = await getProducts();
  return products.find(p => p.id === id);
}

export async function getProductBySlug(slug: string): Promise<any | undefined> {
  const products = await getProducts();
  return products.find(p => p.slug === slug);
}

// ═════════════════════════════════════════════════════════════
// ORDERS
// ═════════════════════════════════════════════════════════════
function mapOrderFromDB(dbOrder: any) {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customer: dbOrder.guest_name || dbOrder.guest_email || 'Unknown',
    customerName: dbOrder.guest_name,
    customerEmail: dbOrder.guest_email,
    customerPhone: dbOrder.guest_phone,
    email: dbOrder.guest_email || '',
    phone: dbOrder.guest_phone || '',
    address: dbOrder.shipping_address || '',
    city: '',
    state: '',
    pincode: '',
    items: [], // Would need order_items table join
    status: dbOrder.order_status,
    paymentStatus: dbOrder.payment_status,
    paymentMethod: dbOrder.payment_method || 'razorpay',
    subtotal: Math.round((dbOrder.subtotal || 0) / 100),
    cgst: Math.round((dbOrder.cgst || 0) / 100),
    sgst: Math.round((dbOrder.sgst || 0) / 100),
    shipping: Math.round((dbOrder.shipping || 0) / 100),
    grandTotal: Math.round((dbOrder.grand_total || 0) / 100),
    createdAt: dbOrder.created_at,
    trackingNumber: dbOrder.tracking_number,
    carrier: dbOrder.courier_name,
    notes: dbOrder.notes,
  };
}

export async function getOrders(): Promise<any[]> {
  try {
    const dbOrders = await fetchOrdersDB();
    if (dbOrders && dbOrders.length > 0) {
      return dbOrders.map(mapOrderFromDB);
    }
  } catch (e) {
    console.warn('[SupabaseData] fetchOrders failed, using localStorage:', e);
  }
  return getLocalOrders();
}

export async function getOrderById(id: string): Promise<any | undefined> {
  const orders = await getOrders();
  return orders.find(o => o.id === id);
}

export async function saveOrder(order: any): Promise<void> {
  try {
    // Convert to DB format (rupees → paise)
    const dbOrder = {
      ...order,
      subtotal: (order.subtotal || 0) * 100,
      cgst: (order.cgst || 0) * 100,
      sgst: (order.sgst || 0) * 100,
      shipping: (order.shipping || 0) * 100,
      grand_total: (order.grandTotal || 0) * 100,
    };
    await insertOrderDB(dbOrder);
  } catch (e) {
    console.warn('[SupabaseData] saveOrder failed, using localStorage:', e);
    saveLocalOrder(order);
  }
}

// ═════════════════════════════════════════════════════════════
// USERS
// ═════════════════════════════════════════════════════════════
function mapUserFromDB(dbUser: any) {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone || '',
    role: dbUser.role || 'customer',
    status: dbUser.status || 'active',
    joinDate: dbUser.created_at,
    avatar: dbUser.avatar,
  };
}

export async function getUsers(): Promise<any[]> {
  try {
    const dbUsers = await fetchUsersDB();
    if (dbUsers && dbUsers.length > 0) {
      return dbUsers.map(mapUserFromDB);
    }
  } catch (e) {
    console.warn('[SupabaseData] fetchUsers failed, using localStorage:', e);
  }
  return getLocalUsers();
}

// ═════════════════════════════════════════════════════════════
// COUPONS
// ═════════════════════════════════════════════════════════════
function mapCouponFromDB(dbCoupon: any) {
  return {
    id: dbCoupon.id,
    code: dbCoupon.code,
    type: dbCoupon.type === 'percent' ? 'percent' : dbCoupon.type === 'fixed' ? 'fixed' : 'free_shipping',
    value: dbCoupon.value || 0,
    minOrder: dbCoupon.min_order || 0,
    maxDiscount: dbCoupon.max_discount,
    usageLimit: dbCoupon.usage_limit || 0,
    usedCount: dbCoupon.used_count || 0,
    expiry: dbCoupon.expiry_date ? dbCoupon.expiry_date.split('T')[0] : '2025-12-31',
    isActive: dbCoupon.is_active || false,
  };
}

export async function getCoupons(): Promise<any[]> {
  try {
    const dbCoupons = await fetchCouponsDB();
    if (dbCoupons && dbCoupons.length > 0) {
      return dbCoupons.map(mapCouponFromDB);
    }
  } catch (e) {
    console.warn('[SupabaseData] fetchCoupons failed, using localStorage:', e);
  }
  return getLocalCoupons();
}

// ═════════════════════════════════════════════════════════════
// LEADS
// ═════════════════════════════════════════════════════════════
export async function saveLead(lead: any): Promise<void> {
  try {
    await insertLeadDB({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source || 'chatbot',
      message: lead.message,
      page_viewed: lead.pageViewed,
      status: 'new',
    });
  } catch (e) {
    console.warn('[SupabaseData] saveLead failed, using localStorage:', e);
    saveLocalLead(lead);
  }
}

// ═════════════════════════════════════════════════════════════
// ADMIN CRUD OPERATIONS
// ═════════════════════════════════════════════════════════════
export async function adminUpdateProduct(id: string, updates: Partial<any>): Promise<void> {
  try {
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price * 100; // rupees → paise
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.visible !== undefined) dbUpdates.status = updates.visible ? 'active' : 'inactive';
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    dbUpdates.updated_at = new Date().toISOString();
    
    await updateProductDB(id, dbUpdates);
  } catch (e) {
    console.warn('[SupabaseData] adminUpdateProduct failed:', e);
    throw e;
  }
}

export async function adminDeleteProduct(id: string): Promise<void> {
  try {
    await deleteProductDB(id);
  } catch (e) {
    console.warn('[SupabaseData] adminDeleteProduct failed:', e);
    throw e;
  }
}

export async function adminAddProduct(product: any): Promise<void> {
  try {
    const dbProduct = {
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
      sku: product.sku || `SWORD-${Date.now()}`,
      description: product.description,
      short_description: product.description?.slice(0, 100),
      price: (product.price || 0) * 100,
      cost_price: (product.price || 0) * 60, // 60% cost
      stock: product.stock || 0,
      low_stock_threshold: 5,
      weight: product.weight || 0,
      length: 0, width: 0, height: 0,
      category_id: 'cat-1',
      brand_id: 'brand-1',
      status: product.visible !== false ? 'active' : 'inactive',
      featured: product.featured || false,
    };
    await insertProductDB(dbProduct);
  } catch (e) {
    console.warn('[SupabaseData] adminAddProduct failed:', e);
    throw e;
  }
}

export async function adminUpdateOrder(id: string, updates: Partial<any>): Promise<void> {
  try {
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.order_status = updates.status;
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.trackingNumber !== undefined) dbUpdates.tracking_number = updates.trackingNumber;
    if (updates.carrier !== undefined) dbUpdates.courier_name = updates.carrier;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    dbUpdates.updated_at = new Date().toISOString();
    
    await updateOrderDB(id, dbUpdates);
  } catch (e) {
    console.warn('[SupabaseData] adminUpdateOrder failed:', e);
    throw e;
  }
}

// ═════════════════════════════════════════════════════════════
// LOCALSTORAGE FALLBACKS (private)
// ═════════════════════════════════════════════════════════════

const LOCAL_KEYS = {
  products: 'sword_products',
  orders: 'sword_orders',
  users: 'sword_users',
  coupons: 'sword_coupons',
  leads: 'sword_leads',
};

function getLocalProducts(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.products);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getLocalOrders(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.orders);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getLocalUsers(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.users);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getLocalCoupons(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.coupons);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalOrder(order: any): void {
  try {
    const orders = getLocalOrders();
    orders.unshift(order);
    localStorage.setItem(LOCAL_KEYS.orders, JSON.stringify(orders));
  } catch (e) { console.error(e); }
}

function saveLocalLead(lead: any): void {
  try {
    const leads = JSON.parse(localStorage.getItem('sword_interested_customers') || '[]');
    leads.push(lead);
    localStorage.setItem('sword_interested_customers', JSON.stringify(leads));
  } catch (e) { console.error(e); }
}

console.log('[SupabaseData] Module loaded');
