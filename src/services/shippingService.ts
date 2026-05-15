/**
 * Shiprocket Shipping Integration Service
 *
 * To activate real shipping:
 * 1. Sign up at https://shiprocket.in
 * 2. Get your API token from Dashboard → Settings → API
 * 3. Enter token in Admin → Settings → Shipping
 * 4. Token is stored in localStorage and read dynamically
 */

import { getSettings } from './dataStore';

function isConfigured(): boolean {
  const s = getSettings();
  return !!s.shiprocketToken && s.shiprocketToken.length > 5;
}

function getApiHeaders(): Record<string, string> {
  const s = getSettings();
  return {
    'Content-Type': 'application/json',
    'Authorization': s.shiprocketToken ? `Bearer ${s.shiprocketToken}` : '',
  };
}

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════
export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
}

export interface ShipmentItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

export interface CourierOption {
  id: number;
  courier_name: string;
  rating: number;
  charge: number;
  estimated_delivery: string;
}

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  activity: string;
}

// ═══════════════════════════════════════════════
// Authentication
// ═══════════════════════════════════════════════
const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...getApiHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Shiprocket API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════
// Courier & Rate Calculation
// ═══════════════════════════════════════════════
export async function getCourierRates(
  pickupPin: string,
  deliveryPin: string,
  weight: number,
  cod: boolean = false
): Promise<CourierOption[]> {
  if (!isConfigured()) {
    // Return mock rates for demo
    return [
      {
        id: 1,
        courier_name: 'Delhivery',
        rating: 4.5,
        charge: cod ? 89 : 69,
        estimated_delivery: '3-5 days',
      },
      {
        id: 2,
        courier_name: 'Blue Dart',
        rating: 4.8,
        charge: cod ? 129 : 99,
        estimated_delivery: '2-3 days',
      },
      {
        id: 3,
        courier_name: 'FedEx',
        rating: 4.7,
        charge: cod ? 149 : 119,
        estimated_delivery: '2-4 days',
      },
      {
        id: 4,
        courier_name: 'DHL',
        rating: 4.9,
        charge: cod ? 199 : 159,
        estimated_delivery: '1-2 days',
      },
    ];
  }

  // Real API call
  const response = await apiCall('/courier/serviceability/', {
    method: 'GET',
  });
  return response.data?.available_courier_companies || [];
}

// ═══════════════════════════════════════════════
// Create Shipment / AWB
// ═══════════════════════════════════════════════
export async function createShipment(
  orderId: string,
  address: ShippingAddress,
  items: ShipmentItem[],
  weight: number = 1.5,
  courierId?: number
): Promise<{
  success: boolean;
  awb?: string;
  shipmentId?: string;
  labelUrl?: string;
  trackingUrl?: string;
  error?: string;
}> {
  if (!isConfigured()) {
    // Generate mock AWB for demo
    const mockAwb = `SWORD${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return {
      success: true,
      awb: mockAwb,
      shipmentId: `SHIP${Date.now()}`,
      labelUrl: `#/label/${mockAwb}`,
      trackingUrl: `https://shiprocket.co/tracking/${mockAwb}`,
    };
  }

  try {
    const payload = {
      order_id: orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: '362120', // Junagadh, Gujarat
      billing_customer_name: address.name,
      billing_address: address.address,
      billing_city: address.city,
      billing_pincode: address.pincode,
      billing_state: address.state,
      billing_country: 'India',
      billing_email: address.email || 'customer@sword.com',
      billing_phone: address.phone,
      shipping_is_billing: true,
      order_items: items,
      payment_method: 'Prepaid',
      sub_total: items.reduce((sum, i) => sum + i.selling_price * i.units, 0),
      length: 30,
      breadth: 25,
      height: 45,
      weight: weight,
    };

    const response = await apiCall('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      awb: response.awb_code,
      shipmentId: response.shipment_id?.toString(),
      labelUrl: response.label_url,
      trackingUrl: `https://shiprocket.co/tracking/${response.awb_code}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create shipment',
    };
  }
}

// ═══════════════════════════════════════════════
// Track Shipment
// ═══════════════════════════════════════════════
export async function trackShipment(awb: string): Promise<{
  success: boolean;
  currentStatus?: string;
  estimatedDelivery?: string;
  events?: TrackingEvent[];
  error?: string;
}> {
  if (!isConfigured()) {
    // Return mock tracking for demo
    const statuses = [
      { date: '2025-05-15 09:30', status: 'PICKED_UP', location: 'Junagadh, Gujarat', activity: 'Shipment picked up' },
      { date: '2025-05-15 14:20', status: 'IN_TRANSIT', location: 'Rajkot Hub', activity: 'In transit to destination' },
      { date: '2025-05-16 08:15', status: 'IN_TRANSIT', location: 'Ahmedabad Hub', activity: 'Reached sorting facility' },
      { date: '2025-05-17 06:45', status: 'OUT_FOR_DELIVERY', location: 'Destination City', activity: 'Out for delivery' },
    ];
    return {
      success: true,
      currentStatus: 'OUT_FOR_DELIVERY',
      estimatedDelivery: '2025-05-17',
      events: statuses,
    };
  }

  try {
    const response = await apiCall(`/courier/track/awb/${awb}`, {
      method: 'GET',
    });

    const trackingData = response.tracking_data;
    return {
      success: true,
      currentStatus: trackingData?.shipment_status,
      estimatedDelivery: trackingData?.etd,
      events: trackingData?.track_activities?.map((a: any) => ({
        date: a.date,
        status: a.status,
        location: a.location,
        activity: a.activity,
      })),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to track shipment',
    };
  }
}

// ═══════════════════════════════════════════════
// Cancel Shipment
// ═══════════════════════════════════════════════
export async function cancelShipment(awb: string): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: true };
  }

  try {
    await apiCall('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ awbs: [awb] }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════
// Generate Invoice
// ═══════════════════════════════════════════════
export async function generateInvoice(
  orderIds: string[]
): Promise<{ success: boolean; invoiceUrl?: string; error?: string }> {
  if (!isConfigured()) {
    return {
      success: true,
      invoiceUrl: `#/invoice/${orderIds[0]}`,
    };
  }

  try {
    const response = await apiCall('/orders/invoice', {
      method: 'POST',
      body: JSON.stringify({ ids: orderIds }),
    });
    return {
      success: true,
      invoiceUrl: response.invoice_url,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export { isConfigured as isShiprocketConfigured };
