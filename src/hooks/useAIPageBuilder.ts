import { useState, useCallback } from "react";
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

// Local AI implementation using Claude API (Anthropic)
async function callClaudeAI(prompt: string, pageType: string, currentData: Record<string, any>): Promise<{ updates: AIPageUpdates; message: string }> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

  console.log('API Key check:', {
    exists: !!apiKey,
    length: apiKey.length,
    startsCorrect: apiKey.startsWith('sk-ant'),
    envVars: Object.keys(import.meta.env)
  });

  if (!apiKey || apiKey.includes('your_')) {
    throw new Error("Claude API key not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file.");
  }

  const systemPrompt = `You are an AI assistant helping users build ${pageType} pages.
Analyze the user's request and return JSON with updates to apply.

Current page data:
${JSON.stringify(currentData, null, 2)}

Return JSON in this format:
{
  "updates": {
    "heroTitle": "new title if requested",
    "heroDescription": "new description if requested",
    "sections": [{"type": "testimonials", "action": "add"}] // if adding/removing sections
  },
  "message": "A friendly response explaining what you did"
}

Only include fields that should be updated. Be concise and helpful.`;

  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [{
          role: "user",
          content: `${systemPrompt}\n\nUser request: ${prompt}`
        }],
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Claude API error response:', errorData);
    throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('Claude API response:', data);

  if (!data.content || !data.content[0]) {
    throw new Error('Invalid response from Claude API');
  }

  let content = data.content[0].text.trim();

  // Clean markdown formatting
  if (content.startsWith("```json")) {
    content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (content.startsWith("```")) {
    content = content.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  const result = JSON.parse(content);
  return {
    updates: result.updates || {},
    message: result.message || "Changes applied!"
  };
}

export function useAIPageBuilder({ pageType, getCurrentData, onUpdates }: UseAIPageBuilderOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const sendPrompt = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    try {
      const currentData = getCurrentData();

      // Use local Claude AI instead of Supabase Edge Function
      const { updates, message } = await callClaudeAI(prompt, pageType, currentData);

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
        return "Please check that your Claude API key is configured in .env file";
      } else if (errorMessage.includes('400')) {
        return "Invalid request to AI. Please try a different prompt.";
      } else if (errorMessage.includes('401')) {
        return "API key is invalid. Please check your Claude API key.";
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
