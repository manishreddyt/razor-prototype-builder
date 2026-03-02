import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        console.error("AI builder error:", error);
        toast.error("AI service error. Please try again.");
        return "Sorry, I couldn't process that request. Please try again.";
      }

      if (data?.error) {
        toast.error(data.error);
        return data.error;
      }

      const updates: AIPageUpdates = data?.updates || {};
      const message = updates.message || "Changes applied!";
      
      // Remove the message field before passing to handler
      const { message: _, ...contentUpdates } = updates;
      
      // Only call onUpdates if there are actual content changes
      if (Object.keys(contentUpdates).length > 0) {
        onUpdates(contentUpdates);
      }

      return message;
    } catch (err) {
      console.error("AI builder error:", err);
      toast.error("Failed to connect to AI. Please try again.");
      return "Sorry, something went wrong. Please try again.";
    } finally {
      setIsLoading(false);
    }
  }, [pageType, getCurrentData, onUpdates]);

  return { sendPrompt, isLoading };
}
