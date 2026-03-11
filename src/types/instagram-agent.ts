// Instagram Agent Type Definitions

export interface InstagramProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  description: string;
  sizes: string[];
  colors?: string[];
  inStock: boolean;
}

export interface InstagramMessage {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  timestamp: string;
  attachment?: {
    type: 'payment_link' | 'product' | 'image' | 'tracking';
    data?: any;
    amount?: number;
    url?: string;
    product?: InstagramProduct;
  };
}

export interface InstagramConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerHandle: string;
  customerAvatar: string;
  messages: InstagramMessage[];
  status: 'active' | 'completed' | 'pending';
  leadSource: 'dm' | 'comment' | 'story_reply';
  lastMessageTime: string;
  lastMessagePreview: string;
}

export interface InstagramActivity {
  id: string;
  timestamp: string;
  action: string;
  outcome: 'success' | 'pending' | 'failed';
  details: string;
  instagramAction: 'dm_replied' | 'comment_converted' | 'order_tracked' | 'cart_reminder' | 'product_inquiry';
  revenue?: number;
}

export interface InstagramMetrics {
  dmsHandled: number;
  commentsConverted: number;
  revenue: number;
  averageResponseTime: string;
  conversionRate: number;
}
