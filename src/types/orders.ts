export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number; // Price at time of purchase
  subtotal: number; // price * quantity
}

export interface Order {
  id: string;
  websiteId: string;
  orderNumber: string; // Human-readable order number (e.g., "ORD-2024-001")
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: "INR"; // Hardcoded for MVP
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string; // Razorpay payment ID
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  trackingNumber?: string;
  courierPartner?: string;
  notes?: string; // Customer notes
  internalNotes?: string; // Merchant notes
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  metadata?: Record<string, any>;
}
