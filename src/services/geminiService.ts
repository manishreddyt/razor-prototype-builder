/**
 * Google Gemini API Service
 * Handles text generation (chat) and image generation using Gemini models
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_TEXT_MODEL = "gemini-1.5-flash"; // Stable flash model for chat
const GEMINI_IMAGE_MODEL = "imagen-3.0-fast-generate-001"; // Fast image generation

/**
 * Generate text content using Gemini chat model
 */
export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody: any = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    // Add system instruction if provided
    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [
          {
            text: systemInstruction,
          },
        ],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini");
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    return generatedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

/**
 * Generate chat response (streaming or non-streaming)
 */
export async function generateChatResponse(
  messages: Array<{ role: "user" | "model"; text: string }>,
  systemInstruction?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured.");
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const requestBody: any = {
      contents,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error in chat generation:", error);
    throw error;
  }
}

/**
 * Generate image using Imagen model
 */
export async function generateImage(
  prompt: string,
  aspectRatio: string = "16:9"
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured.");
  }

  try {
    // Imagen 3 API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:predict?key=${GEMINI_API_KEY}`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio, // "16:9", "9:16", "1:1", "4:3", "3:4"
        personGeneration: "allow_adult", // or "dont_allow"
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Imagen API error:", errorData);

      // Fallback to using text-to-image via different endpoint if Imagen fails
      return await generateImageFallback(prompt);
    }

    const data = await response.json();

    if (data.predictions && data.predictions.length > 0) {
      // The image is returned as base64
      const base64Image = data.predictions[0].bytesBase64Encoded;
      return `data:image/png;base64,${base64Image}`;
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    // Return fallback image
    return getFallbackImageUrl(prompt);
  }
}

/**
 * Fallback image generation using Gemini Pro Vision
 */
async function generateImageFallback(prompt: string): Promise<string> {
  // For now, return a fallback URL
  // In production, you might want to use a different service or generate via Gemini Vision
  return getFallbackImageUrl(prompt);
}

/**
 * Get fallback image URL from Unsplash based on prompt keywords
 */
function getFallbackImageUrl(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("yoga") || lower.includes("fitness") || lower.includes("health")) {
    return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&h=900&fit=crop";
  } else if (lower.includes("coding") || lower.includes("tech") || lower.includes("programming") || lower.includes("software")) {
    return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop";
  } else if (lower.includes("marketing") || lower.includes("business")) {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop";
  } else if (lower.includes("coaching") || lower.includes("mentor")) {
    return "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop";
  } else if (lower.includes("webinar") || lower.includes("workshop") || lower.includes("seminar")) {
    return "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1600&h=900&fit=crop";
  } else if (lower.includes("course") || lower.includes("education") || lower.includes("learning")) {
    return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop";
  } else if (lower.includes("conference") || lower.includes("event")) {
    return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&h=900&fit=crop";
  }

  // Default professional image
  return "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop";
}

/**
 * Generate structured JSON content using Gemini
 */
export async function generateStructuredContent<T>(
  prompt: string,
  schema: string,
  systemInstruction?: string
): Promise<T> {
  const fullPrompt = `${prompt}\n\nReturn ONLY valid JSON that matches this schema:\n${schema}\n\nDo not include any markdown formatting or explanation, just the JSON.`;

  const response = await generateText(fullPrompt, systemInstruction);

  // Clean markdown formatting if present
  let cleanResponse = response.trim();
  if (cleanResponse.startsWith("```json")) {
    cleanResponse = cleanResponse.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (cleanResponse.startsWith("```")) {
    cleanResponse = cleanResponse.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  try {
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("Failed to parse JSON response:", cleanResponse);
    throw new Error("Invalid JSON response from Gemini");
  }
}
