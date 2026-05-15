// @ts-nocheck
/**
 * SWORD Shiprocket Shipping Integration Module
 * 
 * Features:
 * - Auto create shipment on order confirm
 * - Generate AWB number
 * - Tracking link generation
 * - Shipment status tracking
 * - Print shipping label
 * - Cancel shipment
 * - COD support
 * - Shipping rate estimation
 * 
 * For production: Replace with actual Shiprocket API
 * Sign up: https://www.shiprocket.in/
 * API Docs: https://apidocs.shiprocket.in/
 */

// Shipment status lifecycle
export type ShipmentStatus =
  | 'pending'        // Order placed, not yet shipped
  | 'processing'     // Pickup scheduled
  | 'picked_up'      // Courier picked up
  | 'in_transit'     // In transit
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rto_initiated'  // Return to origin
  | 'rto_delivered';

export interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: ShipmentStatus;
  courierName?: string;
  awbNumber?: string;
  trackingUrl?: string;
  pickupDate?: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
  shippingLabel?: string; // URL to label PDF
  weight?: number;        // kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  charges?: {
    freight: number;
    cod: number;
    total: number;
  };
  isCod: boolean;
  codAmount?: number;
  timeline: ShipmentTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentTimelineEvent {
  status: ShipmentStatus;
  location: string;
  remark: string;
  timestamp: string;
}

const STORAGE_KEY = 'sword_shipments';

// ═══════════════════════════════════════════════════════════
// LOAD / SAVE
// ═══════════════════════════════════════════════════════════

function loadShipments(): Shipment[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveShipments(shipments: Shipment[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments)); } catch {}
}

// ═══════════════════════════════════════════════════════════
// SHIPMENT OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Create a new shipment
 * In production: Call Shiprocket API
 */
export async function createShipment(orderData: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  weight?: number;
  codAmount?: number;
  isCod?: boolean;
}): Promise<Shipment | null> {
  try {
    // Production: Call Shiprocket API
    // const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ order_id, order_date, pickup_location, ... }),
    // });

    // Demo: Create mock shipment
    const shipment: Shipment = {
      id: `ship_${Date.now()}`,
      orderId: orderData.orderId,
      orderNumber: orderData.orderNumber,
      status: 'pending',
      courierName: undefined,
      awbNumber: undefined,
      isCod: orderData.isCod || false,
      codAmount: orderData.codAmount,
      weight: orderData.weight || 1,
      timeline: [
        {
          status: 'pending',
          location: 'Warehouse',
          remark: 'Order received, awaiting pickup',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const shipments = loadShipments();
    shipments.unshift(shipment);
    saveShipments(shipments);

    // Simulate processing stages
    simulateShipmentProgress(shipment.id);

    return shipment;
  } catch (e) {
    console.error('[Shiprocket] Create shipment failed:', e);
    return null;
  }
}

/**
 * Simulate shipment progress (for demo)
 */
function simulateShipmentProgress(shipmentId: string) {
  const stages: ShipmentStatus[] = ['processing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const couriers = ['Delhivery', 'Blue Dart', 'FedEx', 'DHL', 'Ecom Express'];
  const courier = couriers[Math.floor(Math.random() * couriers.length)];
  const awb = `AWB${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  let delay = 3000;
  stages.forEach((stage, i) => {
    setTimeout(() => {
      const shipments = loadShipments();
      const idx = shipments.findIndex((s) => s.id === shipmentId);
      if (idx === -1) return;

      shipments[idx].status = stage;
      if (i === 0) {
        shipments[idx].courierName = courier;
        shipments[idx].awbNumber = awb;
        shipments[idx].trackingUrl = `https://track.shiprocket.co/tracking/${awb}`;
        shipments[idx].estimatedDelivery = new Date(Date.now() + 5 * 86400000).toISOString();
      }
      if (stage === 'delivered') {
        shipments[idx].deliveredDate = new Date().toISOString();
      }

      const locations = ['Ahmedabad Hub', 'Mumbai Hub', 'Del Hub', 'Bangalore Hub', 'Local Facility'];
      shipments[idx].timeline.push({
        status: stage,
        location: locations[i] || 'In Transit',
        remark: getStatusRemark(stage),
        timestamp: new Date().toISOString(),
      });
      shipments[idx].updatedAt = new Date().toISOString();

      saveShipments(shipments);
    }, delay);
    delay += 4000; // Each stage 4 seconds apart for demo
  });
}

function getStatusRemark(status: ShipmentStatus): string {
  const remarks: Record<ShipmentStatus, string> = {
    pending: 'Order received, awaiting pickup',
    processing: 'Pickup scheduled with courier',
    picked_up: 'Shipment picked up by courier',
    in_transit: 'Shipment in transit to destination',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered successfully',
    cancelled: 'Shipment cancelled',
    rto_initiated: 'Return to origin initiated',
    rto_delivered: 'Returned to origin',
  };
  return remarks[status] || 'Status updated';
}

/**
 * Get shipment by order ID
 */
export function getShipmentByOrder(orderId: string): Shipment | undefined {
  return loadShipments().find((s) => s.orderId === orderId);
}

/**
 * Get all shipments
 */
export function getAllShipments(): Shipment[] {
  return loadShipments();
}

/**
 * Get shipments by status
 */
export function getShipmentsByStatus(status: ShipmentStatus): Shipment[] {
  return loadShipments().filter((s) => s.status === status);
}

/**
 * Cancel shipment
 */
export async function cancelShipment(shipmentId: string): Promise<boolean> {
  try {
    const shipments = loadShipments();
    const idx = shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) return false;

    // Can only cancel if not delivered
    if (shipments[idx].status === 'delivered') return false;

    shipments[idx].status = 'cancelled';
    shipments[idx].timeline.push({
      status: 'cancelled',
      location: 'System',
      remark: 'Shipment cancelled by admin',
      timestamp: new Date().toISOString(),
    });
    shipments[idx].updatedAt = new Date().toISOString();
    saveShipments(shipments);
    return true;
  } catch (e) {
    console.error('[Shiprocket] Cancel failed:', e);
    return false;
  }
}

/**
 * Update shipment status (admin manual update)
 */
export function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  remark?: string
): boolean {
  const shipments = loadShipments();
  const idx = shipments.findIndex((s) => s.id === shipmentId);
  if (idx === -1) return false;

  shipments[idx].status = status;
  shipments[idx].timeline.push({
    status,
    location: remark || 'Manual Update',
    remark: remark || `Status updated to ${status}`,
    timestamp: new Date().toISOString(),
  });
  if (status === 'delivered') {
    shipments[idx].deliveredDate = new Date().toISOString();
  }
  shipments[idx].updatedAt = new Date().toISOString();
  saveShipments(shipments);
  return true;
}

// ═══════════════════════════════════════════════════════════
// SHIPPING RATES (Mock)
// ═══════════════════════════════════════════════════════════

export interface ShippingRate {
  courier: string;
  service: string;
  estimatedDays: number;
  rate: number;
  codAvailable: boolean;
}

/**
 * Get shipping rate estimate
 * In production: Call Shiprocket rate calculator API
 */
export async function getShippingRates(
  pincode: string,
  weight: number = 1,
  cod: boolean = false
): Promise<ShippingRate[]> {
  // Mock rates for demo
  return [
    { courier: 'Delhivery', service: 'Standard', estimatedDays: 5, rate: weight <= 1 ? 0 : 60, codAvailable: true },
    { courier: 'Blue Dart', service: 'Express', estimatedDays: 3, rate: weight <= 1 ? 0 : 120, codAvailable: true },
    { courier: 'FedEx', service: 'Priority', estimatedDays: 2, rate: weight <= 1 ? 0 : 180, codAvailable: false },
    { courier: 'Ecom Express', service: 'Economy', estimatedDays: 7, rate: weight <= 1 ? 0 : 40, codAvailable: true },
  ];
}

// ═══════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════

export function getShipmentAnalytics() {
  const shipments = loadShipments();
  return {
    total: shipments.length,
    pending: shipments.filter((s) => s.status === 'pending').length,
    inTransit: shipments.filter((s) => s.status === 'in_transit').length,
    outForDelivery: shipments.filter((s) => s.status === 'out_for_delivery').length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
    cancelled: shipments.filter((s) => s.status === 'cancelled').length,
    rto: shipments.filter((s) => s.status === 'rto_initiated' || s.status === 'rto_delivered').length,
    codOrders: shipments.filter((s) => s.isCod).length,
    avgDeliveryTime: 0, // Calculate from delivered shipments
  };
}
