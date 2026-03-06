export type ProductType = "online-course" | "1-1-session" | "webinar";

export interface PricingModel {
  id: string;
  name: string; // "Self-paced", "With Mentorship", "Monthly"
  price: number;
  currency: "INR"; // Hardcoded for MVP
  interval?: "one_time" | "monthly" | "yearly";
  features: string[];
  highlighted: boolean;
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
