import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

      const { data, error } = await supabase.functions.invoke("ai-page-builder", {
        body: { prompt, pageType, currentData },
      });

      if (error) {
        throw new Error(error.message || "AI service error");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const updates = data?.updates || {};
      const message = updates.message || "Changes applied!";
      const { message: _, ...contentUpdates } = updates;

      if (Object.keys(contentUpdates).length > 0) {
        onUpdates(contentUpdates);
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
