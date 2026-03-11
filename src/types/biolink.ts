export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "whatsapp"
  | "telegram"
  | "custom";

export interface BiolinkSocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  label?: string; // For custom links
  icon?: string; // For custom links
  enabled: boolean;
  order: number;
}

export interface BiolinkCustomLink {
  id: string;
  title: string;
  subtitle?: string; // For events: date/time
  url: string;
  icon?: string; // Emoji or icon
  image?: string; // Optional thumbnail
  enabled: boolean;
  order: number;
  type: "link" | "event" | "product"; // Type of link
}

export interface BiolinkProfile {
  enabled: boolean;
  profileImage?: string;
  displayName: string;
  bio: string;
  location?: string;
  theme: "light" | "dark" | "custom";
  accentColor?: string; // For custom theme
  backgroundImage?: string;
  socialLinks: BiolinkSocialLink[];
  customLinks?: BiolinkCustomLink[]; // Link/event cards
  showContactButton: boolean;
  contactButtonText?: string;
  contactEmail?: string;
  contactPhone?: string;
  showProductsSection: boolean;
  productsTitle?: string;
  viewMode?: "links" | "shop" | "both"; // Toggle between links and shop
  customHtml?: string; // For advanced customization
}

export interface BiolinkConfig {
  enabled: boolean;
  slug: string; // Unique biolink URL slug
  profile: BiolinkProfile;
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
  analytics?: {
    views: number;
    clicks: number;
    linkClicks: Record<string, number>; // Social link ID -> click count
  };
  createdAt: string;
  updatedAt: string;
}
