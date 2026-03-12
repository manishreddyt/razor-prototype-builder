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
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  images?: string[]; // Gallery
  pricingModels: PricingModel[];
  category?: string;
  tags?: string[];
  featured: boolean;
  badge?: string; // "Bestseller", "New", "Limited"

  // Course-specific
  duration?: string; // "12 weeks", "40 hours"
  modules?: CourseModule[];
  format?: "video" | "text" | "mixed";
  level?: "beginner" | "intermediate" | "advanced";
  whatYouWillLearn?: string[];
  courseIncludes?: string[];

  // Session-specific
  sessionDuration?: number; // minutes
  calendarConnected?: boolean;
  calendarProvider?: "google" | "microsoft" | "calendly";
  calendarUrl?: string; // Fallback URL
  availability?: AvailabilitySlot[];

  // Webinar-specific
  webinarDate?: string;
  webinarTime?: string;
  webinarDuration?: number; // minutes
  webinarPlatform?: "zoom" | "gmeet" | "custom";
  webinarConnected?: boolean;
  webinarUrl?: string; // Fallback or custom URL
  speakers?: Speaker[];
  agenda?: AgendaItem[];

  // E-commerce specific
  sku?: string; // Stock Keeping Unit
  productCategory?: string; // Category ID reference
  variants?: ProductVariant[];
  inventory?: InventoryConfig;
  shipping?: ShippingConfig;
  compareAtPrice?: number; // Original price for discount display
  discountedPrice?: number; // Calculated discounted price
  discountPercentage?: number; // Discount percentage (0-100)
  downloadUrl?: string; // For digital products

  // Metadata
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published" | "archived";
  metadata?: Record<string, any>; // For storing additional config like session settings
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
  name: string; // "Small", "Medium", "Large" or "Red", "Blue"
  sku?: string;
  price?: number; // Override base price if set
  compareAtPrice?: number; // Original price for discount display
  stock?: number; // Override inventory if tracking per variant
  image?: string; // Variant-specific image
  attributes: Record<string, string>; // { "size": "M", "color": "Red" }
  enabled: boolean;
}

export interface InventoryConfig {
  trackInventory: boolean;
  stock: number;
  lowStockThreshold?: number;
  allowBackorder: boolean;
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
