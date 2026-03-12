import { SmartPageSite } from "@/pages/WebsiteBuilder";
import { getStoredSites, storeSites } from "@/pages/WebsiteBuilder";

/**
 * Seed a demo e-commerce store for orders demo
 */
export const seedDemoStore = () => {
  const sites = getStoredSites();

  // Check if demo store already exists
  const existingStore = sites.find((s) => s.id === "demo_store");
  if (existingStore) {
    console.log("✓ Demo store already exists - skipping");
    return existingStore;
  }

  console.log("🏪 Creating demo e-commerce store...");

  const demoStore: SmartPageSite = {
    id: "demo_store",
    name: "Fashion Paradise Store",
    type: "E-commerce Store",
    category: "ecommerce",
    slug: "fashion-paradise",
    templateId: "ecommerce-store",
    url: "/s/fashion-paradise",
    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    views: 5420,
    conversions: 328,
    status: "Published",
    amount: 3500,
    transactions: 328,
    productsConfig: {
      enabled: true,
      products: [
        {
          id: "prod_tshirt_001",
          name: "Premium Cotton T-Shirt",
          description: "Soft, breathable cotton t-shirt perfect for everyday wear",
          category: "Clothing",
          type: "physical",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
          pricingModels: [
            {
              id: "pm_001",
              type: "one-time",
              price: 799,
              currency: "INR",
              label: "One Time",
            },
          ],
          inventory: {
            trackInventory: true,
            stock: 150,
            lowStockThreshold: 10,
          },
          variants: [
            { id: "var_001", name: "Blue, L", stock: 50 },
            { id: "var_002", name: "Blue, M", stock: 50 },
            { id: "var_003", name: "Black, L", stock: 50 },
          ],
        },
        {
          id: "prod_jeans_001",
          name: "Slim Fit Denim Jeans",
          description: "Classic denim jeans with modern slim fit",
          category: "Clothing",
          type: "physical",
          images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
          pricingModels: [
            {
              id: "pm_002",
              type: "one-time",
              price: 2499,
              currency: "INR",
              label: "One Time",
            },
          ],
          inventory: {
            trackInventory: true,
            stock: 80,
            lowStockThreshold: 10,
          },
        },
        {
          id: "prod_sneakers_001",
          name: "Sports Running Shoes",
          description: "Lightweight and comfortable running shoes",
          category: "Footwear",
          type: "physical",
          images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
          pricingModels: [
            {
              id: "pm_003",
              type: "one-time",
              price: 3999,
              currency: "INR",
              label: "One Time",
            },
          ],
          inventory: {
            trackInventory: true,
            stock: 60,
            lowStockThreshold: 5,
          },
        },
      ],
      displayMode: "grid",
      showPricing: true,
      categoriesEnabled: true,
    },
    contactForm: {
      enabled: true,
      title: "Contact Us",
      description: "Have questions? We'd love to hear from you.",
      fields: [
        {
          id: "name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Your name",
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "your.email@example.com",
        },
        {
          id: "message",
          label: "Message",
          type: "textarea",
          required: true,
          placeholder: "How can we help?",
        },
      ],
      includeInterests: false,
      autoReply: false,
      successMessage: "Thank you! We'll be in touch soon.",
    },
    leads: [],
    customPages: [],
    categoryConfig: {
      enabled: true,
      categories: [
        { id: "cat_001", name: "Clothing", slug: "clothing", productCount: 2 },
        { id: "cat_002", name: "Footwear", slug: "footwear", productCount: 1 },
        { id: "cat_003", name: "Accessories", slug: "accessories", productCount: 0 },
      ],
      allowCustomCategories: true,
      displayMode: "tabs",
    },
    orders: [],
    biolinkConfig: {
      enabled: false,
      slug: "fashion-paradise-bio",
      profile: {
        enabled: false,
        displayName: "",
        bio: "",
        theme: "light",
        socialLinks: [],
        showContactButton: false,
        showProductsSection: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  // Add to existing sites
  sites.unshift(demoStore);
  storeSites(sites);

  console.log("✅ Demo e-commerce store created successfully");

  // Return the store for verification
  return demoStore;
};

/**
 * Seed a demo biolink shop for social commerce demo
 */
export const seedBiolinkShop = () => {
  const sites = getStoredSites();

  // Check if biolink shop already exists
  const existingShop = sites.find((s) => s.id === "biolink_shop_demo");
  if (existingShop) {
    console.log("✓ Biolink shop already exists - skipping");
    return existingShop;
  }

  console.log("🔗 Creating demo biolink shop...");

  const biolinkShop: SmartPageSite = {
    id: "biolink_shop_demo",
    name: "Dohful Cookies - Biolink Shop",
    type: "Biolink Shop",
    category: "ecommerce",
    slug: "biolink-shop",
    templateId: "biolink-shop",
    url: "/s/biolink-shop",
    created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    views: 2840,
    conversions: 156,
    status: "Published",
    amount: 1200,
    transactions: 156,
    productsConfig: {
      enabled: true,
      products: [
        {
          id: "p1",
          type: "physical-product",
          title: "Choco Chunk Cookies",
          description: "Classic chocolate chunk cookies with Belgian chocolate",
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
          pricingModels: [
            {
              id: "pm1",
              type: "one-time",
              amount: 299,
              currency: "INR",
              label: "Buy Now",
            },
          ],
          featured: true,
          badge: "Bestseller",
          status: "published",
          category: "Cookies",
        },
        {
          id: "p2",
          type: "physical-product",
          title: "Nutella Lust Cookies",
          description: "Gooey Nutella-filled cookies",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
          pricingModels: [
            {
              id: "pm2",
              type: "one-time",
              amount: 349,
              currency: "INR",
              label: "Buy Now",
            },
          ],
          featured: true,
          badge: "",
          status: "published",
          category: "Cookies",
        },
        {
          id: "p3",
          type: "physical-product",
          title: "Biscoff Bliss Cookies",
          description: "Lotus Biscoff spread cookies with crunchy bits",
          image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop",
          pricingModels: [
            {
              id: "pm3",
              type: "one-time",
              amount: 329,
              currency: "INR",
              label: "Buy Now",
            },
          ],
          featured: true,
          badge: "New",
          status: "published",
          category: "Cookies",
        },
        {
          id: "p4",
          type: "physical-product",
          title: "Red Velvet Cookies",
          description: "Soft red velvet cookies with cream cheese frosting",
          image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop",
          pricingModels: [
            {
              id: "pm4",
              type: "one-time",
              amount: 379,
              currency: "INR",
              label: "Buy Now",
            },
          ],
          featured: false,
          badge: "",
          status: "published",
          category: "Cookies",
        },
      ],
      displayMode: "grid",
      showPricing: true,
      categoriesEnabled: false,
    },
    contactForm: {
      enabled: true,
      title: "Contact Us",
      description: "Questions about custom orders or bulk inquiries?",
      fields: [
        {
          id: "name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Your name",
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "your.email@example.com",
        },
        {
          id: "message",
          label: "Message",
          type: "textarea",
          required: true,
          placeholder: "Tell us about your order",
        },
      ],
      includeInterests: false,
      autoReply: false,
      successMessage: "Thank you! We'll get back to you within 24 hours.",
    },
    leads: [],
    customPages: [],
    categoryConfig: {
      enabled: false,
      categories: [],
      allowCustomCategories: false,
      displayMode: "tabs",
    },
    orders: [],
    biolinkConfig: {
      enabled: true,
      slug: "biolink-shop",
      profile: {
        enabled: true,
        displayName: "@dohfulcookies",
        bio: "Gooey cookies for the Guilty!\nBaked on Order | Shipping PAN India 🍪",
        theme: "light",
        socialLinks: [
          { id: "s1", platform: "instagram", url: "https://instagram.com/dohfulcookies", label: "", icon: "", enabled: true, order: 1 },
          { id: "s2", platform: "youtube", url: "https://youtube.com/@dohfulcookies", label: "", icon: "", enabled: true, order: 2 },
          { id: "s3", platform: "custom", url: "mailto:hello@dohful.com", label: "Email", icon: "✉️", enabled: true, order: 3 },
          { id: "s4", platform: "whatsapp", url: "https://wa.me/919876543210", label: "", icon: "", enabled: true, order: 4 },
          { id: "s5", platform: "custom", url: "https://dohfulcookies.com", label: "Website", icon: "🌐", enabled: true, order: 5 },
        ],
        showContactButton: false,
        showProductsSection: true,
        profileImage: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  // Add to existing sites
  sites.unshift(biolinkShop);
  storeSites(sites);

  console.log("✅ Demo biolink shop created successfully");

  // Return the shop for verification
  return biolinkShop;
};
