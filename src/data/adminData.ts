// ====== Types ======

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'out_for_delivery';
export type PaymentMethod = 'UPI' | 'Card' | 'Net Banking' | 'EMI' | 'COD' | 'Wallet';
export type PaymentStatus = 'captured' | 'failed' | 'refunded' | 'partially_refunded' | 'pending';
export type UserRole = 'customer' | 'admin' | 'manager' | 'support';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type ProductStatus = 'active' | 'inactive' | 'draft';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type ShippingStatus = 'booked' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'rto';
export type CouponType = 'percentage' | 'fixed' | 'free_shipping';

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; qty: number; price: number; }[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  shipping: number;
  discount: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayId?: string;
  placedAt: string;
  deliveredAt?: string;
  trackingId?: string;
  carrier?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  orders: number;
  totalSpent: number;
  joined: string;
  city: string;
  state: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  status: ProductStatus;
  sales: number;
  image: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'expired' | 'disabled';
  firstOrderOnly: boolean;
}

export interface Subscription {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  startDate: string;
  nextDelivery: string;
  status: SubscriptionStatus;
  totalDeliveries: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  awb: string;
  status: ShippingStatus;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  actualDelivery?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  razorpayId: string;
  customer: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  settlementStatus: 'settled' | 'pending';
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export';
  module: string;
  target: string;
  details: string;
  ip: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  lastUpdated: string;
  movements: { date: string; type: string; qty: number; reason: string; user: string; }[];
}

// ====== Live Data from dataStore ======
import { getOrders, getUsers } from '@/services/dataStore';
export { getOrders as orders };
export { getUsers as users };

// ====== Helper ======
const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ====== Mock Data ======

const firstNames = ['Amit', 'Priya', 'Rajesh', 'Sunita', 'Vikram', 'Neha', 'Suresh', 'Anita', 'Rohit', 'Pooja', 'Karan', 'Deepa', 'Manish', 'Sneha', 'Anil', 'Ritu', 'Naveen', 'Kavita', 'Arjun', 'Meera'];
const lastNames = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Desai', 'Joshi', 'Mehta', 'Shah', 'Verma', 'Agarwal', 'Banerjee', 'Yadav', 'Malhotra', 'Khanna'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh', 'Indore', 'Nagpur', 'Surat'];
const states = ['MH', 'DL', 'KA', 'TS', 'TN', 'WB', 'MH', 'GJ', 'RJ', 'UP', 'KL', 'CH', 'MP', 'MH', 'GJ'];
const productNames = ['SWORD Smart RO Purifier', 'PP Cotton Sediment Filter', 'Activated Carbon Filter', 'RO Membrane', 'NF Membrane', 'UF Membrane', 'Mineral Cartridge', 'TDS Sensor Module', 'Filter Replacement Kit', 'AMC Gold Plan', 'AMC Platinum Plan', 'Installation Kit'];
const skus = ['SWD-RO-001', 'FLT-PP-001', 'FLT-AC-001', 'MEM-RO-001', 'MEM-NF-001', 'MEM-UF-001', 'CRT-MN-001', 'SNS-TD-001', 'KIT-FR-001', 'AMC-GD-001', 'AMC-PL-001', 'KIT-IN-001'];
const categories = ['Purifiers', 'Filters', 'Filters', 'Membranes', 'Membranes', 'Membranes', 'Filters', 'Accessories', 'Kits', 'Services', 'Services', 'Accessories'];

export const defaultOrders: AdminOrder[] = Array.from({ length: 50 }, (_, i) => {
  const fi = r(0, firstNames.length - 1);
  const li = r(0, lastNames.length - 1);
  const ci = r(0, cities.length - 1);
  const itemCount = r(1, 3);
  const items = Array.from({ length: itemCount }, () => {
    const pi = r(0, productNames.length - 1);
    return { name: productNames[pi], qty: r(1, 2), price: [45999, 1299, 1899, 3499, 4299, 2199, 1599, 2499, 7999, 4999, 8999, 1499][pi] };
  });
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const cgst = +(subtotal * 0.09).toFixed(2);
  const sgst = +(subtotal * 0.09).toFixed(2);
  const igst = +(subtotal * 0.18).toFixed(2);
  const shipping = subtotal > 50000 ? 0 : r(0, 1) === 0 ? 0 : 199;
  const discount = r(0, 5) === 0 ? Math.floor(subtotal * 0.1) : 0;
  const grandTotal = subtotal + cgst + sgst + shipping - discount;
  const statuses: OrderStatus[] = ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'out_for_delivery'];
  const status = pick(statuses);
  const paymentMethods: PaymentMethod[] = ['UPI', 'Card', 'Net Banking', 'EMI', 'COD', 'Wallet'];
  const paymentStatus: PaymentStatus = status === 'cancelled' ? pick(['refunded', 'failed']) : pick(['captured', 'captured', 'captured', 'captured', 'pending']);
  const date = new Date(2025, r(0, 4), r(1, 28), r(8, 22), r(0, 59));
  return {
    id: `ORD-2025-${String(i + 1).padStart(5, '0')}`,
    customer: `${firstNames[fi]} ${lastNames[li]}`,
    email: `${firstNames[fi].toLowerCase()}.${lastNames[li].toLowerCase()}@email.com`,
    phone: `+91 ${r(70000, 99999)} ${String(r(10000, 99999)).padStart(5, '0')}`,
    address: `${r(1, 500)} ${pick(['Lake View', 'Green Park', 'Sun City', 'Royal Heights', 'Silver Oak', 'Palm Grove'])} ${pick(['Apartments', 'Tower', 'Residency', 'Villas', 'Enclave'])}, ${pick(['Koramangala', 'Indiranagar', 'Whitefield', 'JP Nagar', 'HSR Layout', 'Bandra', 'Andheri', 'Dwarka', 'Noida'])}`,
    city: cities[ci],
    state: states[ci],
    pincode: String(r(110001, 900001)),
    items, subtotal, cgst, sgst, igst, shipping, discount, grandTotal,
    status,
    paymentMethod: pick(paymentMethods),
    paymentStatus,
    razorpayId: `pay_${Array.from({ length: 14 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[r(0, 35)]).join('')}`,
    placedAt: date.toISOString(),
    deliveredAt: status === 'delivered' ? new Date(date.getTime() + r(3, 7) * 86400000).toISOString() : undefined,
    trackingId: ['shipped', 'delivered', 'out_for_delivery'].includes(status) ? `TRK-${Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[r(0, 35)]).join('')}` : undefined,
    carrier: ['shipped', 'delivered', 'out_for_delivery'].includes(status) ? pick(['Blue Dart', 'Delhivery', 'DTDC', 'FedEx']) : undefined,
  };
});

export const defaultUsers: AdminUser[] = Array.from({ length: 30 }, (_, i) => {
  const fi = r(0, firstNames.length - 1);
  const li = r(0, lastNames.length - 1);
  const roles: UserRole[] = i < 3 ? ['admin'] : i < 6 ? ['manager'] : i < 9 ? ['support'] : ['customer'];
  const status: UserStatus = i < 3 ? 'active' : pick(['active', 'active', 'active', 'active', 'inactive', 'suspended']);
  return {
    id: `USR-${String(i + 1).padStart(4, '0')}`,
    name: `${firstNames[fi]} ${lastNames[li]}`,
    email: `${firstNames[fi].toLowerCase()}.${lastNames[li].toLowerCase()}${i > 0 ? i : ''}@email.com`,
    phone: `+91 ${r(70000, 99999)} ${String(r(10000, 99999)).padStart(5, '0')}`,
    role: roles[i % roles.length],
    status,
    orders: r(0, 15),
    totalSpent: r(0, 15) * r(2000, 50000),
    joined: new Date(2024, r(0, 11), r(1, 28)).toISOString(),
    city: cities[r(0, cities.length - 1)],
    state: states[r(0, states.length - 1)],
  };
});

export const adminOrders: AdminOrder[] = defaultOrders;
export const adminUsers: AdminUser[] = defaultUsers;

export const adminProducts: AdminProduct[] = productNames.map((name, i) => ({
  id: `PRD-${String(i + 1).padStart(4, '0')}`,
  name,
  sku: skus[i],
  category: categories[i],
  price: [45999, 1299, 1899, 3499, 4299, 2199, 1599, 2499, 7999, 4999, 8999, 1499][i],
  costPrice: [28000, 600, 900, 1800, 2400, 1100, 700, 1300, 4200, 2500, 4800, 700][i],
  stock: r(3, 100),
  reorderLevel: [10, 20, 20, 5, 5, 5, 15, 8, 8, 0, 0, 10][i],
  status: pick(['active', 'active', 'active', 'active', 'active', 'inactive', 'active', 'active', 'active', 'active', 'active', 'active']) as ProductStatus,
  sales: r(50, 1200),
  image: i === 0 ? '/assets/product-1.png' : '/filter-cartridge.png',
}));

export const inventory: InventoryItem[] = adminProducts.map((p) => ({
  id: p.id,
  sku: p.sku,
  productName: p.name,
  currentStock: p.stock,
  reorderLevel: p.reorderLevel,
  lastUpdated: new Date(2025, r(0, 4), r(1, 28)).toISOString(),
  movements: [
    { date: new Date(2025, r(0, 2), r(1, 28)).toISOString(), type: pick(['in', 'out']), qty: r(5, 50), reason: pick(['Received', 'Sale', 'Damaged', 'Return', 'Correction']), user: pick(['Admin', 'Manager', 'System']) },
    { date: new Date(2025, r(2, 4), r(1, 28)).toISOString(), type: pick(['in', 'out']), qty: r(5, 50), reason: pick(['Received', 'Sale', 'Damaged', 'Return', 'Correction']), user: pick(['Admin', 'Manager', 'System']) },
  ],
}));

export const coupons: Coupon[] = [
  { id: 'CP-001', code: 'SWORD10', description: '10% off on all products', type: 'percentage', value: 10, minOrder: 5000, maxDiscount: 5000, usageLimit: 100, usageCount: 45, validFrom: '2025-01-01', validUntil: '2025-06-30', status: 'active', firstOrderOnly: false },
  { id: 'CP-002', code: 'WELCOME500', description: 'Flat \u20B9500 off for new customers', type: 'fixed', value: 500, minOrder: 10000, usageLimit: 200, usageCount: 128, validFrom: '2025-01-01', validUntil: '2025-12-31', status: 'active', firstOrderOnly: true },
  { id: 'CP-003', code: 'FREESHIP', description: 'Free shipping on all orders', type: 'free_shipping', value: 0, minOrder: 25000, usageLimit: 500, usageCount: 312, validFrom: '2025-02-01', validUntil: '2025-05-31', status: 'active', firstOrderOnly: false },
  { id: 'CP-004', code: 'DIWALI25', description: '25% off Diwali special', type: 'percentage', value: 25, minOrder: 20000, maxDiscount: 10000, usageLimit: 50, usageCount: 50, validFrom: '2024-10-01', validUntil: '2024-11-15', status: 'expired', firstOrderOnly: false },
  { id: 'CP-005', code: 'AMC15', description: '15% off on AMC plans', type: 'percentage', value: 15, minOrder: 0, maxDiscount: 1500, usageLimit: 100, usageCount: 23, validFrom: '2025-03-01', validUntil: '2025-08-31', status: 'active', firstOrderOnly: false },
  { id: 'CP-006', code: 'SUMMER2025', description: 'Summer sale - 20% off', type: 'percentage', value: 20, minOrder: 15000, maxDiscount: 8000, usageLimit: 150, usageCount: 0, validFrom: '2025-05-01', validUntil: '2025-07-31', status: 'active', firstOrderOnly: false },
  { id: 'CP-007', code: 'LOYAL2000', description: '\u20B92000 off for loyal customers', type: 'fixed', value: 2000, minOrder: 40000, usageLimit: 50, usageCount: 12, validFrom: '2025-01-01', validUntil: '2025-12-31', status: 'active', firstOrderOnly: false },
  { id: 'CP-008', code: 'BLACKFRIDAY', description: 'Black Friday mega sale', type: 'percentage', value: 30, minOrder: 10000, maxDiscount: 15000, usageLimit: 30, usageCount: 0, validFrom: '2025-11-28', validUntil: '2025-11-30', status: 'disabled', firstOrderOnly: false },
];

export const subscriptions: Subscription[] = Array.from({ length: 20 }, (_, i) => {
  const fi = r(0, firstNames.length - 1);
  const li = r(0, lastNames.length - 1);
  const plans = ['Quarterly Filter', 'Bi-Annual Filter', 'Annual Filter', 'AMC Gold', 'AMC Platinum'];
  const plan = pick(plans);
  const amount = plan === 'Quarterly Filter' ? 2499 : plan === 'Bi-Annual Filter' ? 4499 : plan === 'Annual Filter' ? 7999 : plan === 'AMC Gold' ? 4999 : 8999;
  return {
    id: `SUB-${String(i + 1).padStart(5, '0')}`,
    customer: `${firstNames[fi]} ${lastNames[li]}`,
    email: `${firstNames[fi].toLowerCase()}.${lastNames[li].toLowerCase()}@email.com`,
    plan,
    amount,
    startDate: new Date(2024, r(0, 11), r(1, 28)).toISOString(),
    nextDelivery: new Date(2025, r(5, 11), r(1, 28)).toISOString(),
    status: pick(['active', 'active', 'active', 'active', 'paused', 'cancelled', 'expired']) as SubscriptionStatus,
    totalDeliveries: r(1, 12),
  };
});

export const shipments: Shipment[] = adminOrders.filter(o => o.trackingId).slice(0, 25).map((o, i) => ({
  id: `SHP-${String(i + 1).padStart(5, '0')}`,
  orderId: o.id,
  carrier: o.carrier || 'Delhivery',
  awb: `AWB${String(r(1000000000, 9999999999))}`,
  status: pick(['booked', 'picked_up', 'in_transit', 'in_transit', 'out_for_delivery', 'delivered', 'delivered']) as ShippingStatus,
  origin: pick(['Mumbai WH', 'Delhi WH', 'Bangalore WH']),
  destination: `${o.city}, ${o.state}`,
  estimatedDelivery: new Date(new Date(o.placedAt).getTime() + r(3, 7) * 86400000).toISOString(),
  actualDelivery: Math.random() > 0.5 ? new Date(new Date(o.placedAt).getTime() + r(3, 6) * 86400000).toISOString() : undefined,
}));

export const transactions: Transaction[] = adminOrders.slice(0, 40).map((o, i) => ({
  id: `TXN-${String(i + 1).padStart(5, '0')}`,
  orderId: o.id,
  razorpayId: o.razorpayId || `pay_${Array.from({ length: 14 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[r(0, 35)]).join('')}`,
  customer: o.customer,
  amount: o.grandTotal,
  method: o.paymentMethod,
  status: o.paymentStatus,
  settlementStatus: pick(['settled', 'settled', 'settled', 'pending']) as 'settled' | 'pending',
  date: o.placedAt,
}));

export const auditLogs: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2025-04-15T09:30:22Z', user: 'Priyank Joshi', role: 'admin', action: 'update', module: 'Orders', target: 'ORD-2025-00042', details: 'Status changed from Processing to Shipped', ip: '103.21.45.67' },
  { id: 'LOG-002', timestamp: '2025-04-15T08:45:10Z', user: 'System', role: 'admin', action: 'create', module: 'Orders', target: 'ORD-2025-00050', details: 'New order placed by customer', ip: '10.0.1.5' },
  { id: 'LOG-003', timestamp: '2025-04-14T17:20:00Z', user: 'Rahul Mehta', role: 'manager', action: 'update', module: 'Products', target: 'PRD-0001', details: 'Stock updated from 45 to 52', ip: '103.45.67.89' },
  { id: 'LOG-004', timestamp: '2025-04-14T14:10:33Z', user: 'Sneha Kapoor', role: 'support', action: 'update', module: 'Orders', target: 'ORD-2025-00038', details: 'Added tracking number TRK-BD-7829341', ip: '103.67.89.12' },
  { id: 'LOG-005', timestamp: '2025-04-14T11:05:15Z', user: 'Priyank Joshi', role: 'admin', action: 'create', module: 'Coupons', target: 'CP-009', details: 'Created new coupon SUMMER2025', ip: '103.21.45.67' },
  { id: 'LOG-006', timestamp: '2025-04-13T19:45:00Z', user: 'System', role: 'admin', action: 'export', module: 'GST Reports', target: 'GSTR-1', details: 'April 2025 GSTR-1 exported as JSON', ip: '10.0.1.5' },
  { id: 'LOG-007', timestamp: '2025-04-13T16:30:45Z', user: 'Rahul Mehta', role: 'manager', action: 'update', module: 'Inventory', target: 'FLT-PP-001', details: 'Stock adjusted: +25 units (Received)', ip: '103.45.67.89' },
  { id: 'LOG-008', timestamp: '2025-04-13T10:15:20Z', user: 'Sneha Kapoor', role: 'support', action: 'login', module: 'System', target: 'Auth', details: 'Support login from IP 103.67.89.12', ip: '103.67.89.12' },
  { id: 'LOG-009', timestamp: '2025-04-12T22:00:00Z', user: 'System', role: 'admin', action: 'create', module: 'Subscriptions', target: 'SUB-00021', details: 'New AMC Platinum subscription by Deepak R.', ip: '10.0.1.5' },
  { id: 'LOG-010', timestamp: '2025-04-12T15:30:10Z', user: 'Priyank Joshi', role: 'admin', action: 'delete', module: 'Coupons', target: 'CP-004', details: 'Expired coupon DIWALI25 deleted', ip: '103.21.45.67' },
  { id: 'LOG-011', timestamp: '2025-04-12T09:00:00Z', user: 'Rahul Mehta', role: 'manager', action: 'update', module: 'Shipping', target: 'SHP-00015', details: 'Carrier updated from DTDC to Blue Dart', ip: '103.45.67.89' },
  { id: 'LOG-012', timestamp: '2025-04-11T18:20:30Z', user: 'Sneha Kapoor', role: 'support', action: 'update', module: 'Orders', target: 'ORD-2025-00035', details: 'Refund processed: \u20B915,450', ip: '103.67.89.12' },
  { id: 'LOG-013', timestamp: '2025-04-11T12:00:00Z', user: 'System', role: 'admin', action: 'export', module: 'Audit Logs', target: 'Logs', details: 'Audit log export for Q1 2025', ip: '10.0.1.5' },
  { id: 'LOG-014', timestamp: '2025-04-10T08:30:15Z', user: 'Priyank Joshi', role: 'admin', action: 'login', module: 'System', target: 'Auth', details: 'Admin login successful', ip: '103.21.45.67' },
  { id: 'LOG-015', timestamp: '2025-04-10T07:15:00Z', user: 'Rahul Mehta', role: 'manager', action: 'logout', module: 'System', target: 'Auth', details: 'Manager logout', ip: '103.45.67.89' },
];

// Revenue data (30 days)
export const revenueData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2025, 3, i + 1);
  return {
    date: date.toISOString().split('T')[0],
    revenue: r(15000, 85000),
    orders: r(5, 25),
    customers: r(3, 18),
  };
});

// Sales trend (6 months)
export const salesTrendData = [
  { month: 'Nov 2024', revenue: 1850000, orders: 142, customers: 98 },
  { month: 'Dec 2024', revenue: 2240000, orders: 168, customers: 115 },
  { month: 'Jan 2025', revenue: 1980000, orders: 151, customers: 102 },
  { month: 'Feb 2025', revenue: 2150000, orders: 162, customers: 110 },
  { month: 'Mar 2025', revenue: 2458390, orders: 186, customers: 124 },
  { month: 'Apr 2025', revenue: 1890000, orders: 143, customers: 95 },
];

// Revenue by category
export const revenueByCategory = [
  { name: 'Purifiers', value: 1845000 },
  { name: 'Filters', value: 892000 },
  { name: 'Membranes', value: 1245000 },
  { name: 'Accessories', value: 456000 },
  { name: 'Kits', value: 678000 },
  { name: 'Services', value: 945000 },
];

// Orders by status
export const ordersByStatus = [
  { name: 'Placed', count: defaultOrders.filter(o => o.status === 'placed').length },
  { name: 'Processing', count: defaultOrders.filter(o => o.status === 'processing').length },
  { name: 'Shipped', count: defaultOrders.filter(o => o.status === 'shipped').length },
  { name: 'Delivered', count: defaultOrders.filter(o => o.status === 'delivered').length },
  { name: 'Cancelled', count: defaultOrders.filter(o => o.status === 'cancelled').length },
  { name: 'Out for Delivery', count: defaultOrders.filter(o => o.status === 'out_for_delivery').length },
];

// User acquisition data
export const userAcquisitionData = [
  { month: 'Nov 2024', newUsers: 45, returning: 120 },
  { month: 'Dec 2024', newUsers: 62, returning: 138 },
  { month: 'Jan 2025', newUsers: 38, returning: 125 },
  { month: 'Feb 2025', newUsers: 55, returning: 142 },
  { month: 'Mar 2025', newUsers: 71, returning: 156 },
  { month: 'Apr 2025', newUsers: 48, returning: 130 },
];

// GST data
export const gstData = {
  totalTaxable: 5463200,
  totalCGST: 491688,
  totalSGST: 491688,
  totalIGST: 34200,
  invoices: Array.from({ length: 20 }, (_, i) => {
    const fi = r(0, firstNames.length - 1);
    const li = r(0, lastNames.length - 1);
    const taxable = r(5000, 100000);
    return {
      id: `INV-${String(i + 1).padStart(5, '0')}`,
      date: new Date(2025, r(0, 4), r(1, 28)).toISOString(),
      customer: `${firstNames[fi]} ${lastNames[li]}`,
      gstin: i % 3 === 0 ? `27${String(r(100000, 999999))}A${String.fromCharCode(65 + r(0, 25))}${String.fromCharCode(65 + r(0, 25))}1Z5` : '',
      hsn: '8421',
      taxableValue: taxable,
      cgst: +(taxable * 0.09).toFixed(2),
      sgst: +(taxable * 0.09).toFixed(2),
      igst: i % 5 === 0 ? +(taxable * 0.18).toFixed(2) : 0,
      total: +(taxable * (i % 5 === 0 ? 1.18 : 1.18)).toFixed(2),
    };
  }),
};

// Payment methods breakdown
export const paymentMethodData = [
  { method: 'UPI', count: 186, amount: 1845000 },
  { method: 'Card', count: 98, amount: 1234000 },
  { method: 'Net Banking', count: 45, amount: 890000 },
  { method: 'EMI', count: 32, amount: 1567000 },
  { method: 'COD', count: 28, amount: 412000 },
  { method: 'Wallet', count: 15, amount: 186000 },
];

// Top products
export const topProducts = adminProducts.map(p => ({
  ...p,
  salesCount: p.sales,
  revenue: p.sales * p.price,
})).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

// Notifications
export const notifications = [
  { id: 1, message: 'New order ORD-2025-00050 placed', type: 'order', time: '5 min ago', read: false },
  { id: 2, message: 'Low stock alert: RO Membrane (3 left)', type: 'inventory', time: '15 min ago', read: false },
  { id: 3, message: 'Refund request for ORD-2025-00035', type: 'payment', time: '1 hour ago', read: false },
  { id: 4, message: 'New subscription: AMC Platinum by Deepak R.', type: 'subscription', time: '2 hours ago', read: true },
  { id: 5, message: 'Shipment SHP-00022 delivered successfully', type: 'shipping', time: '3 hours ago', read: true },
];

// Settings data
export const settingsData = {
  storeName: 'SWORD Smart Water',
  tagline: 'India\'s First AI-Powered Dual-Membrane Smart RO',
  contactEmail: 'support@sword.com',
  contactPhone: '+91 1800-123-4567',
  gstin: '27AABCS1234C1Z5',
  pan: 'AABCS1234C',
  cin: 'U31900MH2024PTC123456',
  address: 'Plot 42, Tech Park Phase 3, Mumbai - 400001',
  razorpayKeyId: 'rzp_test_xxxxxxxxxxxx',
  razorpaySecret: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
  stripeKey: 'pk_test_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
  freeShippingThreshold: 50000,
  flatShippingRate: 199,
};

// Role permissions matrix
export const rolePermissions = [
  { module: 'Dashboard', admin: ['view', 'edit'], manager: ['view'], support: ['view'] },
  { module: 'Analytics', admin: ['view', 'edit', 'export'], manager: ['view'], support: [] },
  { module: 'Orders', admin: ['view', 'create', 'edit', 'delete'], manager: ['view', 'create', 'edit'], support: ['view', 'edit'] },
  { module: 'Users', admin: ['view', 'create', 'edit', 'delete'], manager: ['view'], support: ['view'] },
  { module: 'Products', admin: ['view', 'create', 'edit', 'delete'], manager: ['view', 'create', 'edit'], support: [] },
  { module: 'Inventory', admin: ['view', 'create', 'edit', 'delete'], manager: ['view', 'create', 'edit'], support: ['view'] },
  { module: 'Coupons', admin: ['view', 'create', 'edit', 'delete'], manager: ['view', 'create'], support: [] },
  { module: 'Subscriptions', admin: ['view', 'create', 'edit', 'delete'], manager: ['view', 'edit'], support: ['view'] },
  { module: 'Shipping', admin: ['view', 'create', 'edit', 'delete'], manager: ['view', 'edit'], support: ['view'] },
  { module: 'Payments', admin: ['view', 'edit', 'export', 'refund'], manager: ['view'], support: [] },
  { module: 'GST Reports', admin: ['view', 'edit', 'export'], manager: ['view', 'export'], support: [] },
  { module: 'Audit Logs', admin: ['view', 'export'], manager: [], support: [] },
  { module: 'Settings', admin: ['view', 'edit'], manager: ['view'], support: [] },
];
