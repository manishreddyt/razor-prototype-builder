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
