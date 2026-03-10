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
  message?: string;
}

interface UseAIPageBuilderOptions {
  pageType: string;
  getCurrentData: () => Record<string, any>;
  onUpdates: (updates: AIPageUpdates) => void;
}

// AI implementation using Google Gemini API
async function callGeminiAI(prompt: string, pageType: string, currentData: Record<string, any>): Promise<{ updates: AIPageUpdates; message: string }> {
  const schema = `{
  "updates": {
    "heroTitle": "new title if requested (string, optional)",
    "heroDescription": "new description if requested (string, optional)",
    "heroTagline": "new tagline if requested (string, optional)",
    "heroCta": "new CTA button text if requested (string, optional)",
    "sections": [{"type": "testimonials", "action": "add"}]
  },
  "message": "A friendly response explaining what you did"
}`;

  const systemInstruction = `You are an AI assistant helping users build ${pageType} pages.
Analyze the user's request and return JSON with updates to apply.

Current page data:
${JSON.stringify(currentData, null, 2)}

Only include fields in "updates" that should be changed based on the user's request.
The "message" should be a friendly explanation of what you changed.
Be concise and helpful.`;

  const fullPrompt = `User request: ${prompt}`;

  try {
    const result = await generateStructuredContent<{ updates: AIPageUpdates; message: string }>(
      fullPrompt,
      schema,
      systemInstruction
    );

    console.log('Gemini AI response:', result);

    return {
      updates: result.updates || {},
      message: result.message || "Changes applied!"
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export function useAIPageBuilder({ pageType, getCurrentData, onUpdates }: UseAIPageBuilderOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const sendPrompt = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    try {
      const currentData = getCurrentData();

      // Use Gemini AI for page updates
      const { updates, message } = await callGeminiAI(prompt, pageType, currentData);

      // Remove the message field before passing to handler
      const { message: _, ...contentUpdates } = updates;

      // Only call onUpdates if there are actual content changes
      if (Object.keys(contentUpdates).length > 0) {
        onUpdates(contentUpdates);
      }

      return message;
    } catch (err) {
      console.error("AI builder error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to AI";
      toast.error(errorMessage);

      // Return more specific error message
      if (errorMessage.includes('API key')) {
        return "Please check that your Gemini API key is configured in .env file";
      } else if (errorMessage.includes('400')) {
        return "Invalid request to AI. Please try a different prompt.";
      } else if (errorMessage.includes('401')) {
        return "API key is invalid. Please check your Gemini API key.";
      } else if (errorMessage.includes('429')) {
        return "Rate limit exceeded. Please try again in a moment.";
      } else {
        return `AI Error: ${errorMessage}`;
      }
    } finally {
      setIsLoading(false);
    }
  }, [pageType, getCurrentData, onUpdates]);

  return { sendPrompt, isLoading };
}
