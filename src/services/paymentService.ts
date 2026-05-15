/**
 * Razorpay Payment Integration Service
 *
 * To activate real payments:
 * 1. Sign up at https://razorpay.com
 * 2. Get your API keys from Dashboard → Settings → API Keys
 * 3. Enter keys in Admin → Settings → Payment Gateway
 * 4. Keys are stored in localStorage and read dynamically
 */

import { getSettings, saveSettings } from './dataStore';

function getKeyId(): string {
  const s = getSettings();
  if (s.razorpayLive && s.razorpayKeyId) return s.razorpayKeyId;
  if (!s.razorpayLive && s.razorpayKeyId) return s.razorpayKeyId;
  return 'rzp_test_NOT_CONFIGURED';
}

function getKeySecret(): string {
  const s = getSettings();
  return s.razorpaySecret || '';
}

function isConfigured(): boolean {
  const s = getSettings();
  return !!s.razorpayKeyId && s.razorpayKeyId.length > 10 && !s.razorpayKeyId.includes('NOT_CONFIGURED');
}

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentOptions {
  amount: number; // in paise (₹1 = 100 paise)
  currency?: string;
  name: string;
  description?: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

// ═══════════════════════════════════════════════
// Mock Order Creation (Replace with real API call)
// ═══════════════════════════════════════════════
export async function createOrder(
  amountInPaise: number,
  receipt: string,
  notes?: Record<string, string>
): Promise<RazorpayOrder> {
  // TODO: Replace with actual Razorpay API call:
  // const response = await fetch('https://api.razorpay.com/v1/orders', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Basic ' + btoa(getKeyId() + ':' + getKeySecret()),
  //   },
  //   body: JSON.stringify({
  //     amount: amountInPaise,
  //     currency: 'INR',
  //     receipt,
  //     notes,
  //   }),
  // });
  // return response.json();

  // Mock response for demo
  return {
    id: `order_${Date.now()}`,
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    status: 'created',
  };
}

// ═══════════════════════════════════════════════
// Payment Handler
// ═══════════════════════════════════════════════
export async function initiatePayment(options: PaymentOptions): Promise<PaymentResult> {
  return new Promise((resolve) => {
    const keyId = getKeyId();

    if (!isConfigured()) {
      // Simulate payment flow for demo
      console.log('[RAZORPAY DEMO] Payment initiated:', {
        amount: options.amount,
        name: options.name,
        keyId: 'NOT_CONFIGURED - Using demo mode',
      });

      // Simulate success after 2 seconds
      setTimeout(() => {
        const mockPaymentId = `pay_${Date.now()}`;
        const mockOrderId = options.orderId || `order_${Date.now()}`;
        resolve({
          success: true,
          paymentId: mockPaymentId,
          orderId: mockOrderId,
          signature: `sig_${Math.random().toString(36).substring(2)}`,
        });
      }, 1500);
      return;
    }

    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const razorpayOptions = {
        key: keyId,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name,
        description: options.description || 'SWORD Smart RO Purchase',
        order_id: options.orderId,
        handler: function (response: any) {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: options.prefill?.name || '',
          email: options.prefill?.email || '',
          contact: options.prefill?.contact || '',
        },
        notes: options.notes || {},
        theme: {
          color: options.theme?.color || '#D4AF37',
        },
        modal: {
          ondismiss: function () {
            resolve({
              success: false,
              error: 'Payment cancelled by user',
            });
          },
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    };
    script.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to load Razorpay SDK',
      });
    };
    document.body.appendChild(script);
  });
}

// ═══════════════════════════════════════════════
// Verify Payment (Webhook + Signature)
// ═══════════════════════════════════════════════
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  // TODO: On backend, verify using HMAC:
  // crypto.createHmac('sha256', RAZORPAY_SECRET)
  //   .update(orderId + '|' + paymentId)
  //   .digest('hex') === signature

  // For demo, always return true
  return true;
}

// ═══════════════════════════════════════════════
// Refund
// ═══════════════════════════════════════════════
export async function processRefund(
  paymentId: string,
  amountInPaise?: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  // TODO: Replace with actual Razorpay refund API:
  // const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Basic ' + btoa(getKeyId() + ':' + getKeySecret()),
  //   },
  //   body: JSON.stringify({ amount: amountInPaise }),
  // });

  // Mock refund
  return {
    success: true,
    refundId: `refund_${Date.now()}`,
  };
}

// ═══════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════
export function convertToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function convertToRupees(paise: number): number {
  return paise / 100;
}

export { isConfigured as isRazorpayConfigured };
