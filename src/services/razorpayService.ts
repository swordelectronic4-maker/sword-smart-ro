// @ts-nocheck
/**
 * SWORD Razorpay Payment Integration Module
 * 
 * Features:
 * - Order creation via Razorpay API
 * - Payment verification with signature
 * - Refund processing
 * - Payment status tracking
 * - Test mode / Live mode toggle
 * 
 * For production: Replace mock implementations with actual Razorpay SDK
 * npm install razorpay
 * 
 * Test credentials: 
 *   Key: rzp_test_xxxxxxxxxxxx (get from Razorpay Dashboard)
 *   Secret: xxxxxxxxxxxxxxxxx (store server-side only)
 */

import { getSettings } from './dataStore';

// Payment configuration
interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  isLive: boolean;
  webhookSecret: string;
}

// Payment order
export interface PaymentOrder {
  id: string;
  razorpayOrderId?: string;
  amount: number; // in rupees
  currency: string;
  receipt: string;
  status: 'created' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentId?: string;
  signature?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Refund
export interface PaymentRefund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: string;
}

const STORAGE_ORDERS = 'sword_payment_orders';
const STORAGE_REFUNDS = 'sword_payment_refunds';

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

function getConfig(): RazorpayConfig {
  try {
    const settings = getSettings();
    return {
      keyId: settings.razorpayKeyId || '',
      keySecret: '', // Never store in frontend - use environment variable
      isLive: settings.razorpayLive || false,
      webhookSecret: '',
    };
  } catch {
    return { keyId: '', keySecret: '', isLive: false, webhookSecret: '' };
  }
}

export function isRazorpayConfigured(): boolean {
  const config = getConfig();
  return !!config.keyId;
}

export function isTestMode(): boolean {
  return !getConfig().isLive;
}

// ═══════════════════════════════════════════════════════════
// ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════════

function loadOrders(): PaymentOrder[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_ORDERS) || '[]'); } catch { return []; }
}

function saveOrders(orders: PaymentOrder[]) {
  try { localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders)); } catch {}
}

/**
 * Create a Razorpay order
 * In production: Call Razorpay API server-side
 */
export async function createOrder(
  amount: number,
  receipt: string,
  metadata?: Record<string, any>
): Promise<PaymentOrder | null> {
  try {
    const config = getConfig();
    if (!config.keyId) {
      console.warn('[Razorpay] Not configured - using mock order');
      return createMockOrder(amount, receipt, metadata);
    }

    // Production: Call your backend API which calls Razorpay
    // const response = await fetch('/api/payments/create-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount: amount * 100, receipt, notes: metadata }),
    // });
    // const data = await response.json();
    // return data.order;

    // Mock for demo
    return createMockOrder(amount, receipt, metadata);
  } catch (e) {
    console.error('[Razorpay] Create order failed:', e);
    return null;
  }
}

function createMockOrder(amount: number, receipt: string, metadata?: Record<string, any>): PaymentOrder {
  const order: PaymentOrder = {
    id: `order_${Date.now()}`,
    razorpayOrderId: `order_${Math.random().toString(36).substring(2, 10)}`,
    amount,
    currency: 'INR',
    receipt,
    status: 'created',
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

/**
 * Verify payment signature (server-side in production)
 */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    // Production: Verify server-side using HMAC
    // const generatedSignature = crypto
    //   .createHmac('sha256', keySecret)
    //   .update(`${orderId}|${paymentId}`)
    //   .digest('hex');
    // return generatedSignature === signature;

    // Mock: Always succeed for demo
    const orders = loadOrders();
    const idx = orders.findIndex((o) => o.razorpayOrderId === orderId || o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = 'paid';
      orders[idx].paymentId = paymentId;
      orders[idx].signature = signature;
      orders[idx].updatedAt = new Date().toISOString();
      saveOrders(orders);
    }
    return true;
  } catch (e) {
    console.error('[Razorpay] Verification failed:', e);
    return false;
  }
}

/**
 * Get order by ID
 */
export function getOrder(orderId: string): PaymentOrder | undefined {
  return loadOrders().find((o) => o.id === orderId || o.razorpayOrderId === orderId);
}

/**
 * Get all payment orders
 */
export function getAllOrders(): PaymentOrder[] {
  return loadOrders();
}

// ═══════════════════════════════════════════════════════════
// REFUNDS
// ═══════════════════════════════════════════════════════════

function loadRefunds(): PaymentRefund[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_REFUNDS) || '[]'); } catch { return []; }
}

function saveRefunds(refunds: PaymentRefund[]) {
  try { localStorage.setItem(STORAGE_REFUNDS, JSON.stringify(refunds)); } catch {}
}

/**
 * Process refund
 */
export async function processRefund(
  orderId: string,
  amount: number,
  reason: string
): Promise<PaymentRefund | null> {
  try {
    const orders = loadOrders();
    const orderIdx = orders.findIndex((o) => o.id === orderId || o.razorpayOrderId === orderId);
    if (orderIdx === -1) return null;

    const refund: PaymentRefund = {
      id: `refund_${Date.now()}`,
      orderId,
      amount,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const refunds = loadRefunds();
    refunds.unshift(refund);
    saveRefunds(refunds);

    // Update order status
    if (amount >= orders[orderIdx].amount) {
      orders[orderIdx].status = 'refunded';
    } else {
      orders[orderIdx].status = 'partially_refunded';
    }
    orders[orderIdx].updatedAt = new Date().toISOString();
    saveOrders(orders);

    // Simulate processing
    setTimeout(() => {
      refund.status = 'processed';
      saveRefunds(loadRefunds().map((r) => r.id === refund.id ? refund : r));
    }, 2000);

    return refund;
  } catch (e) {
    console.error('[Razorpay] Refund failed:', e);
    return null;
  }
}

export function getRefunds(orderId?: string): PaymentRefund[] {
  const refunds = loadRefunds();
  return orderId ? refunds.filter((r) => r.orderId === orderId) : refunds;
}

// ═══════════════════════════════════════════════════════════
// PAYMENT STATUS
// ═══════════════════════════════════════════════════════════

export function getPaymentStatusCounts() {
  const orders = loadOrders();
  return {
    total: orders.length,
    created: orders.filter((o) => o.status === 'created').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    failed: orders.filter((o) => o.status === 'failed').length,
    refunded: orders.filter((o) => o.status === 'refunded').length,
    partiallyRefunded: orders.filter((o) => o.status === 'partially_refunded').length,
    totalRevenue: orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0),
    totalRefunded: loadRefunds()
      .filter((r) => r.status === 'processed')
      .reduce((sum, r) => sum + r.amount, 0),
  };
}

// ═══════════════════════════════════════════════════════════
// INITIALIZE PAYMENT (Frontend Integration)
// ═══════════════════════════════════════════════════════════

/**
 * Open Razorpay checkout
 * Call this after creating order to show payment popup
 */
export function openRazorpayCheckout(
  order: PaymentOrder,
  userDetails: {
    name: string;
    email: string;
    phone: string;
  },
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
): void {
  const config = getConfig();

  if (!config.keyId) {
    // Demo mode - simulate success
    setTimeout(() => {
      onSuccess({
        razorpay_payment_id: `pay_${Math.random().toString(36).substring(2)}`,
        razorpay_order_id: order.razorpayOrderId,
        razorpay_signature: `sig_${Math.random().toString(36).substring(2)}`,
      });
    }, 1500);
    return;
  }

  // Production: Use Razorpay checkout.js
  // const options = {
  //   key: config.keyId,
  //   amount: order.amount * 100,
  //   currency: 'INR',
  //   name: 'SWORD Smart Water',
  //   description: order.metadata?.productName || 'Order Payment',
  //   order_id: order.razorpayOrderId,
  //   handler: onSuccess,
  //   prefill: {
  //     name: userDetails.name,
  //     email: userDetails.email,
  //     contact: userDetails.phone,
  //   },
  //   theme: { color: '#D4AF37' },
  //   modal: {
  //     ondismiss: onFailure,
  //   },
  // };
  // const rzp = new (window as any).Razorpay(options);
  // rzp.open();
}
