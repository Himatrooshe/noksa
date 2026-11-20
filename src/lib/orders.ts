// Client-safe order/customer types and helpers. DB access is in
// src/lib/orders-server.ts.

export type OrderStatus = "open" | "archived" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded" | "voided";
export type FulfillmentStatus = "unfulfilled" | "fulfilled" | "delivered";
export type PaymentMethod = "cod" | "bkash" | "nagad" | "bank_transfer" | "cash" | "card" | "other";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on delivery" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash (in person)" },
  { value: "card", label: "Card (Stripe)" },
  { value: "other", label: "Other" },
];

export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  refunded: "Refunded",
  voided: "Voided",
};

export const FULFILLMENT_STATUS_LABEL: Record<FulfillmentStatus, string> = {
  unfulfilled: "Unfulfilled",
  fulfilled: "Shipped",
  delivered: "Delivered",
};

export type OrderLine = {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
};

export type OrderEvent = { id: string; message: string; createdAt: string };

export type OrderSummary = {
  id: string;
  orderNumber: number;
  createdAt: string;
  customerName: string;
  customerPhone: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  itemCount: number;
};

export type OrderDetail = OrderSummary & {
  customerId: string | null;
  customerEmail: string | null;
  shippingAddress: string | null;
  transactionId: string | null;
  subtotal: number;
  shippingFee: number;
  discount: number;
  note: string;
  courier: string | null;
  trackingNumber: string | null;
  paidAt: string | null;
  fulfilledAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  lines: OrderLine[];
  events: OrderEvent[];
};

export type CustomerSummary = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  orderCount: number;
  amountSpent: number;
  createdAt: string;
};

export type CustomerDetail = CustomerSummary & {
  address: string | null;
  note: string;
  orders: OrderSummary[];
};

/**
 * Normalizes Bangladeshi mobile numbers to the local 11-digit form
 * (01XXXXXXXXX), so "+880 1712-345678" and "01712345678" are the same
 * customer. Other numbers are kept as digits (with a leading + if given).
 * Returns null if there aren't enough digits to be a phone number.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 6) return null;
  if (/^8801[3-9]\d{8}$/.test(digits)) return digits.slice(2);
  if (/^01[3-9]\d{8}$/.test(digits)) return digits;
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

/** Dates render in the shop's local time, not the server's (often UTC). */
export const STORE_TIME_ZONE = "Asia/Dhaka";

export function formatOrderNumber(n: number): string {
  return `#${n}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: STORE_TIME_ZONE,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: STORE_TIME_ZONE,
  });
}
