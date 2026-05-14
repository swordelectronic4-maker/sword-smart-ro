export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  shipping: number;
  grandTotal: number;
  status: "placed" | "confirmed" | "shipped" | "delivered";
  trackingId: string;
  address: string;
  pincode: string;
  placedAt: string;
  estimatedDelivery: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-2025-0001",
    userId: "user-1",
    items: [
      { productId: "sword-smart-ro", productName: "SWORD Smart RO Purifier", quantity: 1, price: 45999 },
      { productId: "installation-kit", productName: "Installation Kit", quantity: 1, price: 1499 },
    ],
    subtotal: 47498,
    cgst: 4274.82,
    sgst: 4274.82,
    shipping: 0,
    grandTotal: 56047.64,
    status: "delivered",
    trackingId: "TRK-SWORD-782345",
    address: "42 Lake View Apartments, Koramangala",
    pincode: "560034",
    placedAt: "2025-01-15T10:30:00Z",
    estimatedDelivery: "2025-01-20",
  },
  {
    id: "ORD-2025-0042",
    userId: "user-1",
    items: [
      { productId: "filter-replacement-kit", productName: "Filter Replacement Kit", quantity: 1, price: 7999 },
      { productId: "amc-gold", productName: "Annual Maintenance Contract - Gold", quantity: 1, price: 4999 },
    ],
    subtotal: 12998,
    cgst: 1169.82,
    sgst: 1169.82,
    shipping: 0,
    grandTotal: 15337.64,
    status: "shipped",
    trackingId: "TRK-SWORD-891234",
    address: "42 Lake View Apartments, Koramangala",
    pincode: "560034",
    placedAt: "2025-03-10T14:15:00Z",
    estimatedDelivery: "2025-03-15",
  },
  {
    id: "ORD-2025-0087",
    userId: "user-1",
    items: [
      { productId: "tds-sensor", productName: "TDS Sensor Module", quantity: 2, price: 2499 },
    ],
    subtotal: 4998,
    cgst: 449.82,
    sgst: 449.82,
    shipping: 199,
    grandTotal: 6096.64,
    status: "confirmed",
    trackingId: "TRK-SWORD-903456",
    address: "42 Lake View Apartments, Koramangala",
    pincode: "560034",
    placedAt: "2025-04-01T09:00:00Z",
    estimatedDelivery: "2025-04-06",
  },
];
