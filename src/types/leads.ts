export interface Lead {
  id: string;
  websiteId: string;
  name: string;
  email: string;
  phone?: string;
  interests?: string[]; // Product IDs or categories
  source: "contact-form" | "product-inquiry" | "checkout";
  message?: string;
  productId?: string; // If from product inquiry
  metadata: Record<string, any>;
  createdAt: string;
  status: "new" | "contacted" | "converted" | "archived";
}

export interface ContactFormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox";
  required: boolean;
  placeholder: string;
  options?: string[]; // For select/checkbox
}

export interface ContactFormConfig {
  enabled: boolean;
  title: string;
  description: string;
  fields: ContactFormField[];
  includeInterests: boolean; // Show product interest checkboxes
  autoReply: boolean;
  autoReplyMessage?: string;
  notificationEmail?: string;
  successMessage: string;
}
