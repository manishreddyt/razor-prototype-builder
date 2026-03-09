/**
 * AI Content Generator Service
 * Generates page content, images, and styling using Claude API (Anthropic)
 */

interface GeneratedContent {
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  heroCta: string;
  productDescription: string;
  productFeatures: string[];
  aboutSection: string;
  testimonials: Array<{
    name: string;
    text: string;
    role: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface GeneratedAssets {
  heroImage: string;
  productImages: string[];
}

export async function generatePageContent(
  prompt: string,
  pageType: "webinar" | "coaching" | "course"
): Promise<GeneratedContent> {
  try {
    // Call Claude API to generate structured content
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

    if (!apiKey || apiKey.includes('your_')) {
      throw new Error("Claude API key not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file.");
    }

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
          max_tokens: 2048,
          temperature: 0.7,
          messages: [
            {
              role: "user",
              content: `Generate professional website content for: "${prompt}"

Page type: ${pageType}

Return a JSON object with this exact structure:
{
  "heroTitle": "compelling 3-7 word title",
  "heroTagline": "short tagline with bullet points using •",
  "heroDescription": "2-3 sentence description that converts",
  "heroCta": "action-oriented CTA button text",
  "productDescription": "2-3 sentences about the ${pageType}",
  "productFeatures": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "aboutSection": "paragraph about the instructor/expert",
  "testimonials": [
    {"name": "Full Name", "text": "testimonial quote", "role": "Job Title/Role"},
    {"name": "Full Name", "text": "testimonial quote", "role": "Job Title/Role"}
  ],
  "faqs": [
    {"question": "relevant question", "answer": "helpful answer"},
    {"question": "relevant question", "answer": "helpful answer"}
  ]
}

Make it professional, persuasive, and specific to the prompt. Return ONLY the JSON, no markdown formatting.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error:", errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Clean markdown formatting if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    // Parse JSON response
    const generated = JSON.parse(cleanContent);
    return generated;
  } catch (error) {
    console.error("Error generating content:", error);

    // Fallback to basic generated content
    return generateFallbackContent(prompt, pageType);
  }
}

export async function generateHeroImage(prompt: string, pageType: string): Promise<string> {
  try {
    // Determine image style based on page type
    let imagePrompt = "";
    const lower = prompt.toLowerCase();

    if (pageType === "webinar") {
      imagePrompt = `Professional webinar hero image for "${prompt}", modern minimalist design with gradient background in blue and purple tones, abstract geometric shapes suggesting connectivity and learning, wide cinematic composition for website header, 16:9 aspect ratio, high quality, professional`;
    } else if (pageType === "coaching") {
      imagePrompt = `Professional coaching hero image for "${prompt}", warm welcoming atmosphere, abstract illustration of personal growth and guidance, soft gradient background in calming colors, modern professional aesthetic, wide composition for website header, 16:9 aspect ratio, high quality`;
    } else if (pageType === "course") {
      imagePrompt = `Online learning hero image for "${prompt}", modern 3D illustration style, inspiring and professional atmosphere, gradient background with relevant thematic elements, wide cinematic composition for website header, 16:9 aspect ratio, high quality`;
    }

    // Call media-pipeline to generate image
    const result = await generateAIImage(imagePrompt, "16:9");
    return result.filePath;
  } catch (error) {
    console.error("Error generating hero image:", error);
    // Return fallback image
    return getFallbackImage(prompt);
  }
}

async function generateAIImage(
  prompt: string,
  aspectRatio: string = "16:9"
): Promise<{ success: boolean; filePath: string }> {
  // Use Node.js child_process to call the media-pipeline CLI
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  const outputPath = `/tmp/generated-${Date.now()}.png`;

  try {
    const cliPath = "/Users/manishreddy.t/.claude/plugins/cache/media-pipeline-marketplace/media-pipeline/1.0.0/mcp-server/build/cli.bundle.js";

    const command = `node "${cliPath}" --prompt "${prompt}" --output "${outputPath}" --aspect-ratio "${aspectRatio}"`;

    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);

    if (result.success) {
      // Convert local file to base64 data URL for embedding
      const fs = await import("fs");
      const imageBuffer = fs.readFileSync(result.filePath);
      const base64 = imageBuffer.toString("base64");
      return {
        success: true,
        filePath: `data:image/png;base64,${base64}`,
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error calling media-pipeline:", error);
    throw error;
  }
}

function generateFallbackContent(prompt: string, pageType: string): GeneratedContent {
  const title = prompt.split(/\s+/).slice(0, 6).join(" ");
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    heroTitle: capitalizedTitle,
    heroTagline:
      pageType === "webinar"
        ? "Live Learning • Interactive • Expert Speakers"
        : pageType === "coaching"
        ? "Personal Growth • One-on-One • Transformation"
        : "Comprehensive • Self-Paced • Certificate Included",
    heroDescription: `${capitalizedTitle}. Join us for an transformative experience with industry experts.`,
    heroCta:
      pageType === "webinar"
        ? "Register Now"
        : pageType === "coaching"
        ? "Book a Session"
        : "Enroll Now",
    productDescription: `${capitalizedTitle} - Learn from experienced professionals and achieve your goals.`,
    productFeatures: [
      "Expert-led sessions",
      "Comprehensive materials",
      "Certificate of completion",
      "Lifetime access",
    ],
    aboutSection:
      "Learn from industry experts with years of experience. Our instructors are passionate about helping you succeed.",
    testimonials: [
      {
        name: "Sarah Johnson",
        text: "This completely transformed my career. Highly recommended!",
        role: "Marketing Manager",
      },
      {
        name: "Michael Chen",
        text: "The best investment I've made in my professional development.",
        role: "Software Engineer",
      },
    ],
    faqs: [
      {
        question: "What will I learn?",
        answer: "You'll gain comprehensive knowledge and practical skills to excel in your field.",
      },
      {
        question: "Do I get a certificate?",
        answer: "Yes, you'll receive a certificate of completion upon finishing the program.",
      },
    ],
  };
}

function getFallbackImage(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("yoga") || lower.includes("fitness") || lower.includes("health")) {
    return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=400&fit=crop";
  } else if (
    lower.includes("coding") ||
    lower.includes("tech") ||
    lower.includes("programming")
  ) {
    return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&h=400&fit=crop";
  } else if (lower.includes("marketing") || lower.includes("business")) {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=400&fit=crop";
  } else if (lower.includes("coaching") || lower.includes("mentor")) {
    return "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=400&fit=crop";
  } else if (lower.includes("webinar") || lower.includes("workshop")) {
    return "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&h=400&fit=crop";
  }

  return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=400&fit=crop";
}
