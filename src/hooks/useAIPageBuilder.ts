import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateStructuredContent, generateText } from "@/services/geminiService";

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

      // Try Supabase first, fallback to Gemini
      if (supabase) {
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
      } else {
        // Fallback to Gemini API

        // Prefer HTML/CSS editing mode when HTML content is available (all templates)
        if (currentData.htmlContent) {
          // For all templates with HTML content, let AI edit the HTML/CSS directly
          const systemInstruction = `You are an expert web developer helping to edit an HTML/CSS template.
The user will provide the current HTML content and request changes.
You should return the COMPLETE modified HTML file with all changes applied.
Make sure to:
- Preserve the overall structure
- Keep all inline CSS in the <style> tag
- Update content, styles, colors, layouts as requested
- Maintain responsive design and existing breakpoints
- Return valid HTML
- Apply any requested changes without restrictions`;

          const geminiPrompt = `Current HTML template:
\`\`\`html
${currentData.htmlContent}
\`\`\`

Template type: ${pageType}
Current page data context: ${JSON.stringify(currentData, null, 2)}

User request: ${prompt}

Return the complete modified HTML file with the requested changes applied. Include ONLY the HTML, no explanations.`;

          const modifiedHtml = await generateText(geminiPrompt, systemInstruction);

          // Extract HTML if it's wrapped in markdown code blocks
          let cleanHtml = modifiedHtml.trim();
          if (cleanHtml.startsWith('```html')) {
            cleanHtml = cleanHtml.replace(/^```html\n/, '').replace(/\n```$/, '');
          } else if (cleanHtml.startsWith('```')) {
            cleanHtml = cleanHtml.replace(/^```\n/, '').replace(/\n```$/, '');
          }

          onUpdates({ htmlContent: cleanHtml });
          return "HTML template updated! Check the preview to see your changes.";

        } else {
          // For templates without HTML content, use structured field updates
          const systemInstruction = `You are an AI assistant helping to build ${pageType} pages.
Analyze the user's request and current page data, then return ONLY a JSON object with the updates to apply.
You can update ANY field in the page data structure without restrictions.
Include a message field explaining what you changed.`;

          const geminiPrompt = `Current page data: ${JSON.stringify(currentData, null, 2)}

User request: ${prompt}

Return a JSON object with the fields to update and a message explaining the changes.
You can update any field you see in the current page data. Common fields include:
- heroTitle, heroTagline, heroDescription, heroCta, bannerImage
- sections (array of section objects)
- name, tagline, description
- isPaid, amount, pricingModel
- coachName, coachTitle, coachBio
- whatYouWillLearn, courseIncludes (arrays)
- testimonials, faqItems, features (arrays of objects)
- biolinkProfile, biolinkLinks
- productCategory, variants, inventory, shipping
And any other fields present in the current data.`;

          const response = await generateStructuredContent<AIPageUpdates & { message: string }>(
            geminiPrompt,
            JSON.stringify({
              // Accept any fields - don't restrict the schema
              message: "string (required - explain what you changed)",
              note: "You can include any other fields from the current page data to update them"
            }),
            systemInstruction
          );

          const { message, ...contentUpdates } = response;

          if (Object.keys(contentUpdates).length > 0) {
            onUpdates(contentUpdates);
          }

          return message || "Changes applied!";
        }
      }
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
