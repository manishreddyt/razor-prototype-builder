import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, pageType, currentData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert web page content builder. The user is editing a ${pageType || "landing"} page and wants to make changes based on their request.

Current page data:
${JSON.stringify(currentData, null, 2)}

IMPORTANT: Always call the update_page_content function with the specific fields to update. Only include fields that need to change based on the user's request. Generate professional, compelling, modern marketing copy. Use relevant emojis sparingly. Be specific and detailed.

For banner images, pick highly relevant Unsplash images using this format: https://images.unsplash.com/photo-{ID}?w=900&h=400&fit=crop

Popular image IDs by category:
- Business/Corporate: 1497366216548-37526070297c, 1542744173-8e7e53415bb0
- Education/Learning: 1523050854058-8df90110c9f1, 1503676260728-1c00da094a0b
- Technology/Coding: 1461749280684-dccba630e2f6, 1498050108023-c5249f4df085
- Yoga/Wellness: 1544367567-0f2fcb009e0b, 1506126613332-22ea5c48b3a3
- Coaching/Consulting: 1573497019940-1c28c88b4f3e, 1552664730-d307ca884978
- Marketing: 1460925895917-afdab827c52f, 1432888498266-38ffec3eaf0a
- Food/Cooking: 1556910103-1c02745aae4d, 1466637574441-749b8f19452f
- Music/Art: 1511379938547-c1f69419868d, 1513364776144-60967b0f800f
- Finance: 1554224155-6726b3ff858f, 1559526324-593bc073d938
- Healthcare: 1576091160399-112ba8d25d1d, 1559757175-5700dde675bc
- Real Estate: 1560518883-ce09059eeffa, 1582407947304-fd86f028f716
- Photography: 1452587925148-ce544e77e70d, 1554080353-a576cf803bda
- E-commerce/Products: 1521572163474-6864f9cf17ab (t-shirt), 1542744094-3a31f272c490 (ebook)

For sections like testimonials, features, FAQ - generate realistic, specific content relevant to the page topic.

**E-commerce Context:**
- For physical products: Set productType to "physical-product", enable inventory tracking with trackInventory:true, set reasonable stock levels (50-500), and configure shipping with requiresShipping:true, weight in grams (100-1000), shippingCost (50-100), freeShippingThreshold (999).
- For digital products: Set productType to "digital-product", shipping.requiresShipping to false, set downloadUrl like "/downloads/product-name.pdf", inventory.trackInventory to false.
- Product categories: fashion-apparel, grocery-consumables, general-merchandise, home-electronics, health-beauty, books-stationery, custom.
- Variants: For clothing/apparel, create size/color combinations with proper SKUs (e.g., "TSH-BLK-S" for T-Shirt Black Small). Each variant needs name, sku, stock, and attributes object.
- Discounts: When user mentions discount percentage, calculate compareAtPrice from amount. Example: "20% off ₹999" means amount=799 (discounted), compareAtPrice=999 (original).

**Biolink Context:**
- Biolink profiles are for influencers, content creators, or personal brands who want a single link for all their social media.
- Profile: Set displayName (creator name), bio (2-3 engaging sentences about them), theme (light/dark/custom), profileImage (use Unsplash portrait).
- Social links: Common platforms are instagram, youtube, twitter, linkedin, tiktok. Set platform, url, enabled:true.
- Contact: If they want contact option, set showContactButton:true, contactEmail or contactPhone.
- Products: If showing products/merchandise, set showProductsSection:true, productsTitle like "My Products" or "Shop"
- Example biolink: {"enabled": true, "displayName": "Jane Doe", "bio": "Fashion influencer & content creator. Sharing daily style tips and honest reviews.", "theme": "light", "showContactButton": true, "contactEmail": "jane@example.com", "showProductsSection": true, "productsTitle": "My Favorites"}
- Example biolink links: [{"platform": "instagram", "url": "https://instagram.com/janedoe", "enabled": true}, {"platform": "youtube", "url": "https://youtube.com/janedoe", "enabled": true}]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "update_page_content",
              description: "Update the page content with new values. Only include fields that should change.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Page/service name or title" },
                  tagline: { type: "string", description: "Short tagline or subtitle" },
                  description: { type: "string", description: "Full description paragraph" },
                  bannerImage: { type: "string", description: "Banner image URL (use Unsplash)" },
                  heroTitle: { type: "string", description: "Hero section main title" },
                  heroTagline: { type: "string", description: "Hero section tagline" },
                  heroDescription: { type: "string", description: "Hero section description" },
                  heroCta: { type: "string", description: "Call-to-action button text" },
                  isPaid: { type: "boolean", description: "Whether the offering is paid" },
                  amount: { type: "number", description: "Price amount in INR" },
                  pricingModel: { type: "string", description: "Pricing model type" },
                  sessionDuration: { type: "number", description: "Session duration in minutes" },
                  courseDuration: { type: "string", description: "Course duration string" },
                  courseFormat: { type: "string", enum: ["self-paced", "cohort-based", "live-sessions"] },
                  coachName: { type: "string", description: "Coach/instructor name" },
                  coachTitle: { type: "string", description: "Coach/instructor title/role" },
                  coachBio: { type: "string", description: "Coach/instructor biography" },
                  whatYouWillLearn: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of learning outcomes"
                  },
                  courseIncludes: {
                    type: "array",
                    items: { type: "string" },
                    description: "What the course includes"
                  },
                  testimonials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        text: { type: "string" },
                        rating: { type: "number" },
                      },
                      required: ["name", "text"],
                    },
                    description: "Customer testimonials"
                  },
                  faqItems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        q: { type: "string" },
                        a: { type: "string" },
                      },
                      required: ["q", "a"],
                    },
                    description: "FAQ items"
                  },
                  features: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        desc: { type: "string" },
                        icon: { type: "string" },
                      },
                      required: ["title", "desc"],
                    },
                    description: "Feature/service cards"
                  },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        action: { type: "string", enum: ["add", "remove", "toggle"] },
                      },
                      required: ["type", "action"],
                    },
                    description: "Section operations (add/remove/toggle)"
                  },
                  enableWeekends: { type: "boolean", description: "Enable weekend availability" },
                  productCategory: { type: "string", description: "E-commerce product category (fashion-apparel, books-stationery, etc.)" },
                  productType: { type: "string", enum: ["physical-product", "digital-product"], description: "Type of product" },
                  variants: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Variant name like 'Small / Black'" },
                        sku: { type: "string", description: "SKU code like 'TSH-BLK-S'" },
                        price: { type: "number", description: "Variant price override" },
                        stock: { type: "number", description: "Available stock" },
                        attributes: { type: "object", description: "Variant attributes like {size: 'S', color: 'Black'}" },
                      },
                    },
                    description: "Product variants for different sizes/colors"
                  },
                  inventory: {
                    type: "object",
                    properties: {
                      trackInventory: { type: "boolean", description: "Whether to track inventory" },
                      stock: { type: "number", description: "Total available stock" },
                      lowStockThreshold: { type: "number", description: "Low stock alert threshold" },
                      allowBackorder: { type: "boolean", description: "Allow orders when out of stock" },
                    },
                    description: "Inventory configuration"
                  },
                  shipping: {
                    type: "object",
                    properties: {
                      requiresShipping: { type: "boolean", description: "Whether product needs shipping" },
                      weight: { type: "number", description: "Product weight in grams" },
                      shippingCost: { type: "number", description: "Shipping cost in INR" },
                      freeShippingThreshold: { type: "number", description: "Free shipping above this amount" },
                    },
                    description: "Shipping configuration"
                  },
                  compareAtPrice: { type: "number", description: "Original price before discount" },
                  downloadUrl: { type: "string", description: "Download URL for digital products" },
                  biolinkProfile: {
                    type: "object",
                    properties: {
                      enabled: { type: "boolean", description: "Enable biolink profile" },
                      displayName: { type: "string", description: "Display name for biolink" },
                      bio: { type: "string", description: "Short bio (2-3 sentences)" },
                      profileImage: { type: "string", description: "Profile image URL" },
                      location: { type: "string", description: "Location" },
                      theme: { type: "string", enum: ["light", "dark", "custom"], description: "Theme" },
                      accentColor: { type: "string", description: "Accent color for custom theme" },
                      showContactButton: { type: "boolean", description: "Show contact button" },
                      contactButtonText: { type: "string", description: "Contact button text" },
                      contactEmail: { type: "string", description: "Contact email" },
                      contactPhone: { type: "string", description: "Contact phone" },
                      showProductsSection: { type: "boolean", description: "Show products section" },
                      productsTitle: { type: "string", description: "Products section title" },
                    },
                    description: "Biolink profile configuration"
                  },
                  biolinkLinks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        platform: { type: "string", description: "Platform: instagram, youtube, twitter, linkedin, etc." },
                        url: { type: "string", description: "Social media URL" },
                        label: { type: "string", description: "Custom label for link" },
                        enabled: { type: "boolean", description: "Whether link is enabled" },
                      },
                    },
                    description: "Biolink social media links"
                  },
                  message: { type: "string", description: "Message to display to the user about what was changed" },
                },
                required: ["message"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "update_page_content" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      // Fallback: try to extract from content
      const content = result.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ 
        updates: { message: content || "I've noted your request. Try being more specific about what you'd like to change." },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify({ updates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-page-builder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
