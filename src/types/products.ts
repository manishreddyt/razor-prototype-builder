export type ProductType = "online-course" | "1-1-session" | "webinar" | "physical-product" | "digital-product" | "physical";

export interface PricingModel {
  id: string;
  name?: string; // "Self-paced", "With Mentorship", "Monthly"
  price?: number;
  amount?: number; // Alias for price
  currency?: "INR" | string;
  interval?: "one_time" | "monthly" | "yearly";
  type?: string; // "one-time", "subscription", etc.
  label?: string; // Display label
  features?: string[];
  highlighted?: boolean;
  description?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  order: number;
}

export interface AvailabilitySlot {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  enabled: boolean;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  social?: { linkedin?: string; twitter?: string; };
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  description: string;
  speaker?: string; // Speaker ID
  duration: number; // minutes
}

export interface Product {
  id: string;
  type: ProductType;
  title?: string;
  name?: string; // Alias for title
  description: string;
  longDescription?: string;
  image?: string;
  images?: string[];
  pricingModels: PricingModel[];
  category?: string;
  tags?: string[];
  featured?: boolean;
  badge?: string;

  // Course-specific
  duration?: string;
  modules?: CourseModule[];
  format?: "video" | "text" | "mixed";
  level?: "beginner" | "intermediate" | "advanced";
  whatYouWillLearn?: string[];
  courseIncludes?: string[];

  // Session-specific
  sessionDuration?: number; // minutes
  sessionBuffer?: number; // minutes between sessions (default: 15)
  maxSessionsPerDay?: number; // maximum bookings per day (default: 8)
  calendarConnected?: boolean;
  calendarProvider?: "google" | "microsoft" | "calendly";
  calendarUrl?: string;
  availability?: AvailabilitySlot[];
  // TODO: Backend integration - bookedSlots will be fetched from API
  // bookedSlots?: Array<{ date: string; time: string }>;

  // Webinar-specific
  webinarDate?: string;
  webinarTime?: string;
  webinarDuration?: number;
  webinarPlatform?: "zoom" | "gmeet" | "custom";
  webinarConnected?: boolean;
  webinarUrl?: string;
  speakers?: Speaker[];
  agenda?: AgendaItem[];

  // E-commerce specific
  sku?: string;
  productCategory?: string;
  variants?: ProductVariant[];
  inventory?: InventoryConfig;
  shipping?: ShippingConfig;
  compareAtPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  downloadUrl?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  status?: "draft" | "published" | "archived";
  metadata?: Record<string, any>;
}

export interface ProductsConfig {
  enabled: boolean;
  products: Product[];
  displayMode: "grid" | "list" | "carousel";
  showPricing: boolean;
  categoriesEnabled: boolean;
  categories?: string[];
}

// E-commerce extensions
export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  image?: string;
  attributes?: Record<string, string>;
  enabled?: boolean;
}

export interface InventoryConfig {
  trackInventory: boolean;
  stock: number;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  sku?: string;
}

export interface ShippingConfig {
  requiresShipping: boolean;
  weight?: number; // in grams
  dimensions?: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
  };
  shippingCost?: number; // Fixed shipping cost
  freeShippingThreshold?: number; // Free shipping above this order value
}
