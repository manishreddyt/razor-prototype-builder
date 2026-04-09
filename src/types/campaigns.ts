export type CampaignType =
  | "upsell"              // Promote premium products to existing customers
  | "retarget_dropoff"    // Re-engage payment failures/cart abandonment
  | "webinar_nurture"     // Automated webinar follow-ups
  | "generic";            // Custom automation

export type TriggerEvent =
  | "webinar_registration"
  | "webinar_ended"
  | "payment_success"
  | "payment_failed"
  | "cart_abandoned"
  | "course_purchased";

// Product references from Websites
export interface ProductReference {
  id: string;
  type: "webinar" | "course" | "coaching" | "workshop";
  name: string;
  pageUrl?: string;
}

// Workflow Action (reused from existing structure)
export interface WorkflowAction {
  id: string;
  type: "email" | "sms" | "whatsapp" | "lms" | "tag" | "wait" | "certificate";
  label: string;
  config: Record<string, string>;
  enabled: boolean;
}

// Marketing Campaign structure
export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  description: string;

  // Event-based triggering
  trigger: TriggerEvent;
  triggerConditions?: Record<string, any>; // Additional filters

  // Product & Offer Integration
  targetProducts?: ProductReference[]; // What we're promoting
  offerCodes?: string[]; // From Offers.tsx

  // Workflow Actions (reuse existing structure)
  actions: WorkflowAction[];

  // Campaign Settings
  enabled: boolean;
  category: "webinar_specific" | "generic";

  // Analytics
  createdAt: string;
  stats: {
    triggered: number;    // How many times campaign ran
    sent: number;         // Total messages sent
    opened: number;       // Email/WhatsApp opens
    clicked: number;      // Link clicks
    converted: number;    // Completed purchase
    revenue: number;      // Revenue attributed
  };
}
