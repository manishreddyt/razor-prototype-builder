import { useState, useCallback } from "react";
import { toast } from "sonner";
import { generateStructuredContent } from "@/services/geminiService";

export interface AIPageUpdates {
  name?: string;
  tagline?: string;
  description?: string;
  bannerImage?: string;
  heroTitle?: string;
  heroTagline?: string;
  heroDescription?: string;
  heroCta?: string;
  isPaid?: boolean;
  amount?: number;
  pricingModel?: string;
  sessionDuration?: number;
  courseDuration?: string;
  courseFormat?: string;
  coachName?: string;
  coachTitle?: string;
  coachBio?: string;
  whatYouWillLearn?: string[];
  courseIncludes?: string[];
  testimonials?: { name: string; text: string; rating?: number }[];
  faqItems?: { q: string; a: string }[];
  features?: { title: string; desc: string; icon?: string }[];
  sections?: { type: string; action: "add" | "remove" | "toggle" }[];
  enableWeekends?: boolean;

  // E-commerce fields
  productCategory?: string; // Category name or ID
  variants?: { name: string; sku?: string; price?: number; stock?: number; attributes: Record<string, string> }[];
  inventory?: { trackInventory: boolean; stock: number; lowStockThreshold?: number; allowBackorder: boolean };
  shipping?: { requiresShipping: boolean; weight?: number; shippingCost?: number; freeShippingThreshold?: number };
  compareAtPrice?: number; // Original price for showing discounts
  downloadUrl?: string; // For digital products
  productType?: "physical-product" | "digital-product";

  // Biolink fields
  biolinkProfile?: {
    enabled?: boolean;
    displayName?: string;
    bio?: string;
    profileImage?: string;
    location?: string;
    theme?: "light" | "dark" | "custom";
    accentColor?: string;
    showContactButton?: boolean;
    contactButtonText?: string;
    contactEmail?: string;
    contactPhone?: string;
    showProductsSection?: boolean;
    productsTitle?: string;
  };
  biolinkLinks?: { platform: string; url: string; label?: string; enabled?: boolean }[];

  // Raw HTML/CSS editing for full control
  htmlContent?: string; // Complete HTML file content
  cssUpdates?: { selector: string; properties: Record<string, string> }[]; // CSS changes

  message?: string;
}

interface UseAIPageBuilderOptions {
  pageType: string;
  getCurrentData: () => Record<string, any>;
  onUpdates: (updates: AIPageUpdates) => void;
}

export function useAIPageBuilder({ pageType, getCurrentData, onUpdates }: UseAIPageBuilderOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const sendPrompt = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    try {
      const currentData = getCurrentData();

      const systemInstruction = `You are an AI page builder assistant for a ${pageType} page. Current page data: ${JSON.stringify(currentData)}. Return ONLY a JSON object with fields from AIPageUpdates that should be updated. Include a "message" field describing what you changed.`;
      const schema = `AIPageUpdates JSON object with optional fields matching the AIPageUpdates interface`;
      const updates = await generateStructuredContent<AIPageUpdates & { message?: string }>(prompt, schema, systemInstruction);
      const message = updates.message || "Changes applied!";
      const { message: _, ...contentUpdates } = updates;

      if (Object.keys(contentUpdates).length > 0) {
        onUpdates(contentUpdates as AIPageUpdates);
      }

      return message;
    } catch (err) {
      console.error("AI builder error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to AI";
      toast.error(errorMessage);
      return `AI Error: ${errorMessage}`;
    } finally {
      setIsLoading(false);
    }
  }, [pageType, getCurrentData, onUpdates]);

  return { sendPrompt, isLoading };
}
