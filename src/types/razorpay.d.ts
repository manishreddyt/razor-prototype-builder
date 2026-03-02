// Type declarations for Razorpay Checkout

interface RazorpayOptions {
  key: string;
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
    confirm_close?: boolean;
  };
  subscription_id?: string;
  subscription_card_change?: boolean;
  recurring?: string;
  callback_url?: string;
  redirect?: boolean;
  customer_id?: string;
  remember_customer?: boolean;
  timeout?: number;
  readonly?: {
    email?: boolean;
    contact?: boolean;
    name?: boolean;
  };
  hidden?: {
    email?: boolean;
    contact?: boolean;
  };
  send_sms_hash?: boolean;
  allow_rotation?: boolean;
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  config?: {
    display?: {
      language?: string;
    };
  };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: "payment.failed", handler: (response: RazorpayErrorResponse) => void): void;
}

interface RazorpayStatic {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface Window {
  Razorpay: RazorpayStatic;
}
