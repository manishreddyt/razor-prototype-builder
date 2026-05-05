import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings, Sparkles, Send,
  X, Copy, Share2, Save, Loader2, CheckCircle2, Plus, Trash2, GripVertical,
  FileText, CreditCard, ShoppingCart, Star, Users, Clock, BookOpen, Shield, Award,
  Megaphone, Package, Mail, MessageSquare, Tag, ArrowRight,
  Calendar, Video, Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addSite, getStoredSites, storeSites, type SmartPageSite } from "./WebsiteBuilder";
import { templates, availableSectionTypes, createDefaultSection, createCheckoutConfig, type TemplateData, type SectionData, type PageData, type CheckoutConfig, type CheckoutFormField, type CustomPage } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import { SmartPageCheckout } from "@/components/SmartPageCheckout";
import { useAIPageBuilder, type AIPageUpdates } from "@/hooks/useAIPageBuilder";
import { ProductManager } from "@/components/products/ProductManager";
import { LeadsManager } from "@/components/leads/LeadsManager";
import { ContactFormBuilder } from "@/components/leads/ContactFormBuilder";
import { CustomPagesManager } from "@/components/CustomPagesManager";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { ProductCheckoutModal } from "@/components/ProductCheckoutModal";
import { Product, ProductsConfig, PricingModel } from "@/types/products";
import { Lead, ContactFormConfig } from "@/types/leads";
import { BiolinkEditor } from "@/components/BiolinkEditor";
import { BiolinkProfile } from "@/types/biolink";
import { ProductCategory } from "@/types/categories";
import { getCategories, saveCategories } from "@/lib/categoryStorage";
import { supabase } from "@/integrations/supabase/client";

interface PageState {
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  heroCta: string;
  bannerImage: string;
  sections: SectionData[];
}

interface EditorState {
  /** Unique site ID for this draft/published site */
  siteId: string;
  template: TemplateData;
  /** Per-page state. Key = page name. */
  pages: Record<string, PageState>;
  activePage: string;
  checkout: CheckoutConfig | null;
  /** Products configuration */
  productsConfig: ProductsConfig;
  /** Contact form configuration */
  contactForm: ContactFormConfig;
  /** Captured leads */
  leads: Lead[];
  /** Custom pages beyond template pages */
  customPages: CustomPage[];
  /** Biolink configuration */
  biolinkConfig?: any;
  /** Raw HTML content for biolink templates (for direct HTML/CSS editing) */
  htmlContent?: string;
}

const buildPageState = (pd: PageData | undefined, fallback: TemplateData): PageState => {
  if (pd) {
    return {
      heroTitle: pd.heroTitle,
      heroTagline: pd.heroTagline,
      heroDescription: pd.heroDescription,
      heroCta: pd.heroCta,
      bannerImage: pd.bannerImage,
      sections: pd.sections.map((s) => ({ ...s, data: { ...s.data } })),
    };
  }
  return {
    heroTitle: fallback.heroTitle,
    heroTagline: fallback.heroTagline,
    heroDescription: fallback.heroDescription,
    heroCta: fallback.heroCta,
    bannerImage: fallback.bannerImage,
    sections: fallback.sections.map((s) => ({ ...s, data: { ...s.data } })),
  };
};

const generateFromPrompt = (prompt: string, tpl: TemplateData, generatedData?: any): TemplateData => {
  // If we have AI-generated content, use it
  if (generatedData?.content) {
    const content = generatedData.content;
    const image = generatedData.image;
    const sectionData = generatedData.sections || {};

    // Update sections with AI-generated content
    const updatedSections = tpl.sections.map(section => {
      if (section.type === "features" && sectionData.features) {
        return {
          ...section,
          data: {
            ...section.data,
            title: "What You'll Learn",
            items: sectionData.features.map((feature: string, idx: number) => ({
              icon: section.data.items?.[idx]?.icon || "✓",
              title: feature,
              desc: "",
            })),
          },
        };
      }
      if (section.type === "about" && sectionData.about) {
        return {
          ...section,
          data: {
            ...section.data,
            text: sectionData.about,
          },
        };
      }
      if (section.type === "testimonials" && sectionData.testimonials) {
        return {
          ...section,
          data: {
            ...section.data,
            items: sectionData.testimonials,
          },
        };
      }
      if (section.type === "faq" && sectionData.faqs) {
        return {
          ...section,
          data: {
            ...section.data,
            items: sectionData.faqs.map((faq: any) => ({
              question: faq.question,
              answer: faq.answer,
            })),
          },
        };
      }
      return section;
    });

    return {
      ...tpl,
      heroTitle: content.heroTitle,
      heroTagline: content.heroTagline,
      heroDescription: content.heroDescription,
      heroCta: content.heroCta,
      bannerImage: image || tpl.bannerImage,
      sections: updatedSections,
    };
  }

  // Fallback to basic generation
  const words = prompt.split(/\s+/).slice(0, 6).join(" ");
  const title = words.charAt(0).toUpperCase() + words.slice(1);

  const lower = prompt.toLowerCase();

  let bannerImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=400&fit=crop";

  if (lower.includes("yoga") || lower.includes("fitness") || lower.includes("health")) {
    bannerImage = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=400&fit=crop";
  } else if (lower.includes("coding") || lower.includes("tech") || lower.includes("programming") || lower.includes("bootcamp")) {
    bannerImage = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&h=400&fit=crop";
  } else if (lower.includes("marketing") || lower.includes("business")) {
    bannerImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=400&fit=crop";
  } else if (lower.includes("coaching") || lower.includes("mentor") || lower.includes("consult")) {
    bannerImage = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=400&fit=crop";
  } else if (lower.includes("music") || lower.includes("art") || lower.includes("creative")) {
    bannerImage = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&h=400&fit=crop";
  } else if (lower.includes("cook") || lower.includes("food") || lower.includes("chef")) {
    bannerImage = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&h=400&fit=crop";
  } else if (lower.includes("study") || lower.includes("education") || lower.includes("learn")) {
    bannerImage = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&h=400&fit=crop";
  } else if (lower.includes("webinar") || lower.includes("workshop")) {
    bannerImage = "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&h=400&fit=crop";
  }

  let tagline = "Professional • Expert-Led • Results-Driven";
  if (lower.includes("webinar")) {
    tagline = "Live Learning • Interactive • Expert Speakers";
  } else if (lower.includes("coaching") || lower.includes("1:1")) {
    tagline = "Personal Growth • One-on-One • Transformation";
  } else if (lower.includes("course") || lower.includes("bootcamp")) {
    tagline = "Comprehensive • Self-Paced • Certificate Included";
  }

  let description = `${prompt}. Join thousands who have transformed their careers with our expert-led programs.`;
  if (lower.includes("webinar")) {
    description = `${title}. Register now for this exclusive live webinar and learn from industry experts.`;
  } else if (lower.includes("coaching")) {
    description = `${title}. Get personalized guidance and accelerate your growth with one-on-one coaching.`;
  }

  return {
    ...tpl,
    heroTitle: title,
    heroTagline: tagline,
    heroDescription: description,
    heroCta: lower.includes("free") ? "Get Started Free" : lower.includes("coaching") || lower.includes("1:1") ? "Book a Session" : lower.includes("webinar") ? "Register Now" : "Enroll Now",
    bannerImage,
  };
};

const buildInitialState = (searchParams: URLSearchParams): EditorState => {
  const templateId = searchParams.get("template") || "";
  const prompt = searchParams.get("prompt") || "";
  const aiPrompt = searchParams.get("aiPrompt") || "";  // AI prompt from config pages
  const title = searchParams.get("title") || "My Website";

  const found = templates.find((t) => t.id === templateId);
  const tpl = found || templates[0];

  // Load AI-generated content from localStorage if available
  let generatedData = null;
  try {
    const stored = localStorage.getItem("ai-generated-content");
    if (stored) {
      generatedData = JSON.parse(stored);
      // Clear after use
      localStorage.removeItem("ai-generated-content");
    }
  } catch (error) {
    console.error("Error loading generated content:", error);
  }

  // If aiPrompt exists, use it to customize the template
  let base: TemplateData;
  if (aiPrompt) {
    base = generateFromPrompt(aiPrompt, found || tpl, generatedData);
  } else if (prompt) {
    base = generateFromPrompt(prompt, tpl, generatedData);
  } else if (found) {
    base = { ...tpl };
  } else {
    base = {
      ...tpl,
      heroTitle: title,
      heroTagline: "Welcome to our website",
      heroDescription: "A professional website built with AI.",
    };
  }

  // Check if this is a coaching template with session config in URL
  const sessionName = searchParams.get("sessionName");
  const isCoachingWithConfig = templateId === "coaching" && sessionName;

  if (isCoachingWithConfig && base.productsConfig) {
    // Extract session config from URL params
    const sessionConfig = {
      sessionName: sessionName || "1:1 Coaching Session",
      isGMeetConnected: searchParams.get("isGMeetConnected") === "true",
      isFree: searchParams.get("isFree") === "true",
      price: parseInt(searchParams.get("price") || "2999"),
      sessionDuration: parseInt(searchParams.get("sessionDuration") || "60"),
      managementTool: (searchParams.get("managementTool") || "gmeet") as "gmeet" | "zoom" | "calendly" | "other",
      otherToolName: searchParams.get("otherToolName") || undefined,
      otherToolUrl: searchParams.get("otherToolUrl") || undefined,
    };

    // Update the first product (session) with the config
    if (base.productsConfig.products && base.productsConfig.products.length > 0) {
      const sessionProduct = base.productsConfig.products[0];
      sessionProduct.title = sessionConfig.sessionName;
      sessionProduct.sessionDuration = sessionConfig.sessionDuration;

      // Update pricing
      sessionProduct.pricingModels = sessionConfig.isFree
        ? [{
            id: "pm-free",
            name: "Free Session",
            price: 0,
            currency: "INR",
            interval: "one_time",
            features: [
              `${sessionConfig.sessionDuration}-minute 1:1 call`,
              "Video session",
              "Follow-up email"
            ],
            highlighted: true,
          }]
        : [{
            id: "pm-paid",
            name: "Single Session",
            price: sessionConfig.price,
            currency: "INR",
            interval: "one_time",
            features: [
              `${sessionConfig.sessionDuration}-minute 1:1 call`,
              "Session recording",
              "Follow-up email",
              "Action items document"
            ],
            highlighted: true,
          }];

      // Customize product description using AI-generated content or prompt
      if (generatedData?.content?.productDescription) {
        sessionProduct.description = generatedData.content.productDescription;
        sessionProduct.longDescription = generatedData.content.aboutSection;
      } else if (aiPrompt) {
        const lower = aiPrompt.toLowerCase();
        if (lower.includes("career")) {
          sessionProduct.description = "Navigate your career path with expert guidance and personalized coaching strategies.";
        } else if (lower.includes("life") || lower.includes("personal")) {
          sessionProduct.description = "Transform your life with one-on-one coaching focused on personal growth and development.";
        } else if (lower.includes("business") || lower.includes("entrepreneur")) {
          sessionProduct.description = "Accelerate your business success with strategic coaching and actionable insights.";
        } else {
          sessionProduct.description = `${sessionConfig.sessionName} - Personalized coaching to help you achieve your goals.`;
        }
      }

      // Store session config in product metadata for editing later
      sessionProduct.metadata = {
        sessionConfig,
      };
    }
  }

  // Check if this is a webinar template with webinar config in URL
  const webinarTitle = searchParams.get("webinarTitle");
  const isWebinarWithConfig = templateId === "webinar" && webinarTitle;

  if (isWebinarWithConfig && base.productsConfig) {
    // Extract webinar config from URL params
    const webinarConfig = {
      webinarTitle: webinarTitle || "Live Webinar",
      webinarDate: searchParams.get("webinarDate") || "",
      webinarTime: searchParams.get("webinarTime") || "18:00",
      webinarDuration: parseInt(searchParams.get("webinarDuration") || "90"),
      isFree: searchParams.get("isFree") === "true",
      price: parseInt(searchParams.get("price") || "499"),
      platform: (searchParams.get("platform") || "zoom") as "zoom" | "gmeet" | "custom",
      customPlatformUrl: searchParams.get("customPlatformUrl") || undefined,
    };

    // Update the first product (webinar) with the config
    if (base.productsConfig.products && base.productsConfig.products.length > 0) {
      const webinarProduct = base.productsConfig.products[0];
      webinarProduct.title = webinarConfig.webinarTitle;
      webinarProduct.webinarDate = webinarConfig.webinarDate;
      webinarProduct.webinarTime = webinarConfig.webinarTime;
      webinarProduct.webinarDuration = webinarConfig.webinarDuration;
      webinarProduct.webinarPlatform = webinarConfig.platform;
      if (webinarConfig.customPlatformUrl) {
        webinarProduct.webinarUrl = webinarConfig.customPlatformUrl;
      }

      // Update pricing
      webinarProduct.pricingModels = webinarConfig.isFree
        ? [{
            id: "pm-free",
            name: "Free Registration",
            price: 0,
            currency: "INR",
            interval: "one_time",
            features: [
              "Live session access",
              "Q&A participation",
              "Certificate of attendance"
            ],
            highlighted: true,
          }]
        : [{
            id: "pm-paid",
            name: "Registration",
            price: webinarConfig.price,
            currency: "INR",
            interval: "one_time",
            features: [
              "Live session access",
              "Q&A participation",
              "Recording access",
              "Certificate of attendance",
              "Bonus resources"
            ],
            highlighted: true,
          }];

      // Customize product description using AI-generated content or prompt
      if (generatedData?.content?.productDescription) {
        webinarProduct.description = generatedData.content.productDescription;
        webinarProduct.longDescription = generatedData.content.aboutSection;
      } else if (aiPrompt) {
        const lower = aiPrompt.toLowerCase();
        if (lower.includes("marketing") || lower.includes("digital")) {
          webinarProduct.description = "Join industry experts for an interactive session on cutting-edge marketing strategies and digital transformation.";
        } else if (lower.includes("tech") || lower.includes("coding") || lower.includes("programming")) {
          webinarProduct.description = "Learn the latest technologies and best practices from experienced developers in this live interactive session.";
        } else if (lower.includes("business") || lower.includes("entrepreneur")) {
          webinarProduct.description = "Discover proven strategies for business growth and entrepreneurial success in this exclusive webinar.";
        } else {
          webinarProduct.description = `${webinarConfig.webinarTitle} - Join us for an insightful live session with industry experts.`;
        }
      }

      // Store webinar config in product metadata for editing later
      webinarProduct.metadata = {
        webinarConfig,
      };
    }
  }

  // Build per-page state
  const pages: Record<string, PageState> = {};
  const pageNames = base.pages;
  const homePage = pageNames[0] || "Home";

  // Home page uses top-level hero/sections
  pages[homePage] = {
    heroTitle: base.heroTitle,
    heroTagline: base.heroTagline,
    heroDescription: base.heroDescription,
    heroCta: base.heroCta,
    bannerImage: base.bannerImage,
    sections: base.sections.map((s) => ({ ...s, data: { ...s.data } })),
  };

  // Other pages from pagesData
  for (const pageName of pageNames) {
    if (pageName === homePage) continue;
    const pd = base.pagesData?.[pageName];
    pages[pageName] = buildPageState(pd, base);
  }

  return {
    siteId: `draft_${Date.now()}`,
    template: base,
    pages,
    activePage: homePage,
    checkout: base.checkout || null,
    productsConfig: base.productsConfig || {
      enabled: false,
      products: [],
      displayMode: "grid",
      showPricing: true,
      categoriesEnabled: false
    },
    contactForm: base.contactForm || {
      enabled: false,
      title: "Get in Touch",
      description: "Have questions? We'd love to hear from you.",
      fields: [
        { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Your name" },
        { id: "email", label: "Email", type: "email", required: true, placeholder: "your.email@example.com" },
        { id: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help?" }
      ],
      includeInterests: false,
      autoReply: false,
      successMessage: "Thank you! We'll be in touch soon."
    },
    leads: [],
    customPages: base.customPages || [],
    biolinkConfig: base.biolinkConfig
  };
};

interface ChatMsg {
  role: "assistant" | "user";
  content: string;
}

const suggestedActions = [
  "Change the banner image",
  "Update the headline and tagline",
  "Add a Google Reviews section",
  "Toggle the testimonials section",
  "Add a pricing section",
];

const getProductByIndex = (productsConfig: ProductsConfig, index: number): Product | null => {
  if (productsConfig.products && productsConfig.products[index]) {
    return productsConfig.products[index];
  }
  return null;
};


const SmartPageEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<EditorState>(() => buildInitialState(searchParams));

  // Check if this is a biolink template to default to mobile view
  const isBiolinkTemplate = state.template.id.startsWith("biolink");

  const [viewMode, setViewMode] = useState<"desktop" | "mobile">(isBiolinkTemplate ? "mobile" : "desktop");
  const [rightPanel, setRightPanel] = useState<"ai" | "settings" | null>("ai");
  const [previewMode, setPreviewMode] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [settingsTab, setSettingsTab] = useState("page");
  const [publishedPageData, setPublishedPageData] = useState<any>(null);
  const [editorView, setEditorView] = useState<"editor" | "products" | "leads">("editor");
  const [slug, setSlug] = useState(() => (searchParams.get("title") || "my-page").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").replace(/^-+/, ""));
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{
    product: Product;
    pricingModel: PricingModel;
  } | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>(() => getCategories(state.siteId));

  const pageType = searchParams.get("type") || "";
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: pageType
      ? `I've set up your **${pageType}** page — "${state.template.heroTitle}". You can customize the content, sections, images, and more. What would you like to change?`
      : `I've set up "${state.template.heroTitle}" for you. Ask me to change anything — content, sections, images, and more.`
    },
  ]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Load HTML template for templates that have static HTML files
  useEffect(() => {
    const loadHtmlTemplate = async () => {
      if (!state.htmlContent) {
        try {
          // Map template IDs to their HTML files
          const htmlTemplateMap: Record<string, string> = {
            "biolink-profile": "/biolink-event-template.html",
            "biolink-shop": "/biolink-shop-template.html",
            // Add more templates with HTML files here as needed
          };

          const templateFile = htmlTemplateMap[state.template.id];

          if (templateFile) {
            const response = await fetch(templateFile);
            if (response.ok) {
              const htmlContent = await response.text();
              setState(prev => ({ ...prev, htmlContent }));
            }
          }
        } catch (error) {
          console.error("Failed to load HTML template:", error);
        }
      }
    };

    loadHtmlTemplate();
  }, [state.template.id, state.htmlContent]);

  // Current page helpers
  const activePage = state.activePage;
  const isCheckoutPage = activePage === "__checkout__";

  // Check if activePage is a custom page
  const customPage = state.customPages.find(p => p.slug === activePage);
  const isCustomPage = !!customPage;

  // Get current page data (from template pages or custom pages)
  const currentPage = isCheckoutPage
    ? state.pages[state.template.pages[0]]
    : isCustomPage && customPage
      ? {
          heroTitle: customPage.name,
          heroTagline: "",
          heroDescription: "",
          heroCta: "",
          bannerImage: "",
          sections: customPage.sections
        }
      : state.pages[activePage];

  const pageNames = state.template.pages;
  const hasCheckout = !!state.checkout?.enabled;

  // Check if this is a coaching template with 1:1 session product
  const isCoachingTemplate = state.productsConfig?.products?.some(p => p.type === "1-1-session");
  const sessionProduct = state.productsConfig?.products?.find(p => p.type === "1-1-session");

  // Check if this is a webinar template with webinar product
  const isWebinarTemplate = state.productsConfig?.products?.some(p => p.type === "webinar");
  const webinarProduct = state.productsConfig?.products?.find(p => p.type === "webinar");

  const setActivePage = (pageName: string) => {
    setState((prev) => ({ ...prev, activePage: pageName }));
  };

  const updateCheckout = (updates: Partial<CheckoutConfig>) => {
    setState((prev) => ({
      ...prev,
      checkout: prev.checkout ? { ...prev.checkout, ...updates } : null,
    }));
    setUnsavedChanges(true);
  };

  const handleBuyNow = (product: Product, pricingModel: PricingModel) => {
    setCheckoutModal({ product, pricingModel });
  };

  const handleCloseCheckout = () => {
    setCheckoutModal(null);
  };

  // Auto-save to localStorage when changes are made
  const saveToLocalStorage = () => {
    try {
      const sites = getStoredSites();
      const existingIndex = sites.findIndex(s => s.id === state.siteId);

      const homePage = state.pages[pageNames[0]];
      const updatedSite: SmartPageSite = {
        id: state.siteId,
        name: homePage.heroTitle,
        type: state.template.title,
        category: state.template.category,
        slug,
        templateId: state.template.id,
        url: `/s/${slug}`,
        created: existingIndex >= 0 ? sites[existingIndex].created : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        views: existingIndex >= 0 ? sites[existingIndex].views : 0,
        conversions: existingIndex >= 0 ? sites[existingIndex].conversions : 0,
        status: existingIndex >= 0 ? sites[existingIndex].status : "Draft",
        amount: state.checkout?.amount || 0,
        transactions: existingIndex >= 0 ? sites[existingIndex].transactions : 0,
        productsConfig: state.productsConfig,
        contactForm: state.contactForm,
        leads: state.leads,
        customPages: state.customPages
      };

      if (existingIndex >= 0) {
        sites[existingIndex] = updatedSite;
      } else {
        sites.unshift(updatedSite);
      }

      storeSites(sites);
      console.log("Auto-saved to localStorage");
    } catch (error) {
      console.error("Failed to auto-save:", error);
    }
  };

  // Auto-save effect: save 2 seconds after last change
  useEffect(() => {
    if (unsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage();
        setUnsavedChanges(false);
        toast.success("Auto-saved", { duration: 1500 });
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [unsavedChanges, state, slug]);

  const updateCheckoutField = (fieldId: string, updates: Partial<CheckoutFormField>) => {
    if (!state.checkout) return;
    updateCheckout({
      formFields: state.checkout.formFields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const addCheckoutField = () => {
    if (!state.checkout) return;
    const newField: CheckoutFormField = {
      id: `f_${Date.now()}`, label: "New Field", type: "text", required: false, placeholder: "Enter value",
    };
    updateCheckout({ formFields: [...state.checkout.formFields, newField] });
  };

  const removeCheckoutField = (fieldId: string) => {
    if (!state.checkout) return;
    updateCheckout({ formFields: state.checkout.formFields.filter((f) => f.id !== fieldId) });
  };

  // Handle lead creation from contact form
  const handleLeadCreated = (lead: Lead) => {
    setState((prev) => ({
      ...prev,
      leads: [...prev.leads, lead]
    }));
    setUnsavedChanges(true);
  };

  // Build a virtual TemplateData for the current page to pass to SitePreview
  const currentTemplate: TemplateData = {
    ...state.template,
    heroTitle: currentPage.heroTitle,
    heroTagline: currentPage.heroTagline,
    heroDescription: currentPage.heroDescription,
    heroCta: currentPage.heroCta,
    bannerImage: currentPage.bannerImage,
  };

  const updatePageHero = (updates: Partial<Pick<TemplateData, "heroTitle" | "heroTagline" | "heroDescription" | "heroCta" | "bannerImage">>) => {
    // Check if we're updating a custom page
    const customPageToUpdate = state.customPages.find(p => p.slug === state.activePage);

    if (customPageToUpdate) {
      // Update custom page name from heroTitle
      setState((prev) => ({
        ...prev,
        customPages: prev.customPages.map(p =>
          p.slug === prev.activePage
            ? { ...p, name: updates.heroTitle || p.name }
            : p
        ),
      }));
    } else {
      // Update template page hero data
      setState((prev) => ({
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePage]: { ...prev.pages[prev.activePage], ...updates },
        },
      }));
    }
    setUnsavedChanges(true);
  };

  const updatePageSections = (sections: SectionData[]) => {
    // Check if we're updating a custom page
    const customPageToUpdate = state.customPages.find(p => p.slug === state.activePage);

    if (customPageToUpdate) {
      // Update custom page sections
      setState((prev) => ({
        ...prev,
        customPages: prev.customPages.map(p =>
          p.slug === prev.activePage ? { ...p, sections } : p
        ),
      }));
    } else {
      // Update template page sections
      setState((prev) => ({
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePage]: { ...prev.pages[prev.activePage], sections },
        },
      }));
    }
    setUnsavedChanges(true);
  };

  const handleOpenProductModal = () => {
    setEditorView("products");
    toast.info("Switched to Products. Click 'Add Product' to create a new product.");
  };

  const toggleSection = (id: string) => {
    updatePageSections(currentPage.sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const removeSection = (id: string) => {
    updatePageSections(currentPage.sections.filter((s) => s.id !== id));
  };

  const addSection = (type: string) => {
    const newSection = createDefaultSection(type as any);
    updatePageSections([...currentPage.sections, newSection]);
    setAddSectionOpen(false);
    toast.success(`${newSection.label} section added`);
  };

  const moveSection = (index: number, dir: "up" | "down") => {
    const arr = [...currentPage.sections];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    updatePageSections(arr);
  };

  const updateSectionData = (id: string, data: Record<string, any>) => {
    updatePageSections(currentPage.sections.map((s) => s.id === id ? { ...s, data: { ...s.data, ...data } } : s));
  };

  // Add a new page
  const addPage = (name: string) => {
    if (state.pages[name]) return;
    setState((prev) => ({
      ...prev,
      template: { ...prev.template, pages: [...prev.template.pages, name] },
      pages: {
        ...prev.pages,
        [name]: {
          heroTitle: name,
          heroTagline: `Welcome to ${name}`,
          heroDescription: `Content for the ${name} page.`,
          heroCta: "Learn More",
          bannerImage: prev.pages[prev.activePage].bannerImage,
          sections: [createDefaultSection("about")],
        },
      },
      activePage: name,
    }));
    setUnsavedChanges(true);
    toast.success(`"${name}" page added`);
  };

  const removePage = (name: string) => {
    if (pageNames.length <= 1) return;
    if (name === pageNames[0]) { toast.error("Can't remove the home page"); return; }
    setState((prev) => {
      const newPages = { ...prev.pages };
      delete newPages[name];
      return {
        ...prev,
        template: { ...prev.template, pages: prev.template.pages.filter((p) => p !== name) },
        pages: newPages,
        activePage: prev.activePage === name ? prev.template.pages[0] : prev.activePage,
      };
    });
    setUnsavedChanges(true);
    toast.success(`"${name}" page removed`);
  };

  const { sendPrompt, isLoading: aiLoading } = useAIPageBuilder({
    pageType: state.template.category || "landing",
    getCurrentData: () => ({
      template: state.template,
      htmlContent: state.htmlContent,
      heroTitle: currentPage.heroTitle,
      heroTagline: currentPage.heroTagline,
      heroDescription: currentPage.heroDescription,
      heroCta: currentPage.heroCta,
      bannerImage: currentPage.bannerImage,
      sections: currentPage.sections.map(s => ({ type: s.type, label: s.label, visible: s.visible })),
    }),
    onUpdates: (updates: AIPageUpdates) => {
      // Handle HTML content updates (for templates with HTML files)
      if (updates.htmlContent) {
        setState(prev => ({ ...prev, htmlContent: updates.htmlContent }));
        setUnsavedChanges(true);
        return;
      }

      // Extract message field separately
      const { message, sections, testimonials, faqItems, features, biolinkProfile, biolinkLinks, ...directUpdates } = updates;

      // Apply all direct field updates to page hero/state
      const heroUpdates: Partial<PageState> = {};

      // Map common aliases to hero fields
      if (updates.name) heroUpdates.heroTitle = updates.name;
      if (updates.tagline) heroUpdates.heroTagline = updates.tagline;
      if (updates.description) heroUpdates.heroDescription = updates.description;

      // Apply direct hero field updates
      if (updates.heroTitle) heroUpdates.heroTitle = updates.heroTitle;
      if (updates.heroTagline) heroUpdates.heroTagline = updates.heroTagline;
      if (updates.heroDescription) heroUpdates.heroDescription = updates.heroDescription;
      if (updates.heroCta) heroUpdates.heroCta = updates.heroCta;
      if (updates.bannerImage) heroUpdates.bannerImage = updates.bannerImage;

      if (Object.keys(heroUpdates).length > 0) {
        updatePageHero(heroUpdates);
      }

      // Handle section operations
      if (sections) {
        sections.forEach(op => {
          const existing = currentPage.sections.find(s => s.type === op.type);
          if (op.action === "add" && !existing) addSection(op.type);
          else if (op.action === "remove" && existing) removeSection(existing.id);
          else if (op.action === "toggle" && existing) toggleSection(existing.id);
        });
      }

      // Handle section data updates
      if (testimonials) {
        const ts = currentPage.sections.find(s => s.type === "testimonials");
        if (ts) {
          updateSectionData(ts.id, { items: testimonials.map(t => ({ ...t, avatar: t.name.split(" ").map(n => n[0]).join("") })) });
        }
      }
      if (faqItems) {
        const faq = currentPage.sections.find(s => s.type === "faq");
        if (faq) updateSectionData(faq.id, { items: faqItems });
      }
      if (features) {
        const feat = currentPage.sections.find(s => s.type === "features" || s.type === "services");
        if (feat) updateSectionData(feat.id, { items: features });
      }

      // Handle biolink profile updates
      if (biolinkProfile || biolinkLinks) {
        setState(prev => ({
          ...prev,
          biolinkConfig: {
            ...prev.biolinkConfig,
            profile: biolinkProfile ? { ...prev.biolinkConfig?.profile, ...biolinkProfile } : prev.biolinkConfig?.profile,
            links: biolinkLinks || prev.biolinkConfig?.links,
          }
        }));
      }

      // Handle any other fields by merging into template data
      // This allows AI to update fields like isPaid, amount, coachName, etc.
      if (Object.keys(directUpdates).length > 0) {
        setState(prev => ({
          ...prev,
          template: {
            ...prev.template,
            ...directUpdates
          }
        }));
      }

      setUnsavedChanges(true);
    },
  });

  const sendMessage = async (text: string) => {
    if (!text.trim() || aiLoading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");

    try {
      const response = await sendPrompt(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I encountered an error. Please check your API key configuration and try again."
      }]);
    }
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setStatus("published");
      setUnsavedChanges(false);

      const homePage = state.pages[pageNames[0]];
      const newSite: SmartPageSite = {
        id: `sp_${Date.now()}`,
        name: homePage.heroTitle,
        type: state.template.title,
        category: state.template.category,
        slug,
        templateId: state.template.id,
        url: `/s/${slug}`,
        created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        views: 0, conversions: 0, status: "Published",
        amount: state.checkout?.amount || 0,
        transactions: 0,
        // Add new fields
        productsConfig: state.productsConfig,
        contactForm: state.contactForm,
        leads: state.leads,
        customPages: state.customPages,
      };
      addSite(newSite);
      toast.success("Website published successfully!");

      // Store published page data for next steps
      setPublishedPageData({
        id: newSite.id,
        type: pageType,
        name: homePage.heroTitle,
        url: `/s/${slug}`,
      });

      // Keep dialog open to show success state
      // Don't close: setPublishDialogOpen(false);
    }, 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`);
    toast.success("Link copied!");
  };

  // ─── Full Preview Mode ───
  if (previewMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Exit Preview</Button>
            <span className="text-sm text-muted-foreground">Preview as visitors see it</span>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <Button size="sm" onClick={() => { setPreviewMode(false); setPublishDialogOpen(true); }}>Publish</Button>
          </div>
        </div>
        <ScrollArea className="flex-1 bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-lg border border-border overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            {selectedProduct !== null ? (
              <ProductDetailPage
                product={getProductByIndex(state.productsConfig, selectedProduct)!}
                onBack={() => setSelectedProduct(null)}
                onBuyNow={handleBuyNow}
              />
            ) : (
              <SitePreview
                template={currentTemplate}
                sections={currentPage.sections}
                compact
                activePage={activePage}
                onPageChange={setActivePage}
                onCtaClick={() => {
                  if (state.checkout?.enabled) setActivePage("__checkout__");
                }}
                onProductClick={(i) => setSelectedProduct(i)}
                productsConfig={state.productsConfig}
                contactForm={state.contactForm}
                siteId={state.siteId}
                onLeadCreated={handleLeadCreated}
                customPages={state.customPages}
                onOpenProductModal={handleOpenProductModal}
                biolinkConfig={state.biolinkConfig}
                htmlContent={state.htmlContent}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <Button
              variant={editorView === "editor" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setEditorView("editor")}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Editor
            </Button>
            <Button
              variant={editorView === "products" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setEditorView("products")}
            >
              <Package className="h-3.5 w-3.5 mr-1.5" />
              Products
              {state.productsConfig.products.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[10px] bg-green-100 text-green-700">
                  {state.productsConfig.products.length}
                </Badge>
              )}
            </Button>
          </div>
          <div className="h-6 w-px bg-border" />
          <input type="text" value={currentPage.heroTitle} onChange={(e) => updatePageHero({ heroTitle: e.target.value })} className="font-semibold text-foreground text-sm bg-transparent border-none focus:outline-none hover:bg-secondary/50 rounded px-2 py-1" />
          {unsavedChanges && <span className="w-2 h-2 rounded-full bg-orange-400" />}
          <span className={status === "published" ? "blade-badge-paid text-[10px]" : "blade-badge-expired text-[10px]"}>{status === "published" ? "Published" : "Draft"}</span>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => { setUnsavedChanges(false); toast.success("Draft saved"); }}><Save className="h-3.5 w-3.5" /> Save</Button>}
          {editorView === "editor" && <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />}
          {editorView === "editor" && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewMode(true)}><Eye className="h-4 w-4" /> Preview</Button>}
          {editorView === "editor" && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "settings" ? null : "settings")}><Settings className="h-4 w-4" /> Settings</Button>}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShareDialogOpen(true)}><Share2 className="h-4 w-4" /> Share</Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
          {editorView === "editor" && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "ai" ? null : "ai")}><Sparkles className="h-4 w-4" /> AI</Button>}
        </div>
      </div>

      {/* Products View */}
      {editorView === "products" && (
        <div className="flex-1 overflow-hidden bg-background">
          <ScrollArea className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <ProductManager
                websiteId={state.siteId}
                products={state.productsConfig.products}
                categories={categories}
                onUpdateProducts={(products) => {
                  setState((prev) => ({
                    ...prev,
                    productsConfig: { ...prev.productsConfig, products },
                  }));
                  setUnsavedChanges(true);
                }}
                onUpdateCategories={(updatedCategories) => {
                  setCategories(updatedCategories);
                  saveCategories(state.siteId, updatedCategories);
                  setUnsavedChanges(true);
                }}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Leads View */}
      {editorView === "leads" && (
        <div className="flex-1 overflow-hidden bg-background">
          <ScrollArea className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <LeadsManager
                leads={state.leads}
                products={state.productsConfig.products}
                onUpdateLeads={(leads) => {
                  setState((prev) => ({ ...prev, leads }));
                  setUnsavedChanges(true);
                }}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Editor View */}
      {editorView === "editor" && (
        <>
      {/* Page Tabs Bar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border bg-muted/30 overflow-x-auto">
        {pageNames.map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activePage === page && !isCheckoutPage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <FileText className="h-3 w-3" />
            {page}
          </button>
        ))}
        {hasCheckout && (
          <button
            onClick={() => setActivePage("__checkout__")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              isCheckoutPage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <ShoppingCart className="h-3 w-3" />
            Checkout
          </button>
        )}
        <AddPageButton onAdd={addPage} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <ScrollArea className="flex-1 bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-sm border border-border overflow-hidden transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            {isCheckoutPage && state.checkout ? (
              <SmartPageCheckout
                template={currentTemplate}
                checkout={state.checkout}
                viewMode={viewMode}
                editable
                onUpdateCheckout={updateCheckout}
              />
            ) : selectedProduct !== null ? (
              <ProductDetailPage
                product={getProductByIndex(state.productsConfig, selectedProduct)!}
                onBack={() => setSelectedProduct(null)}
                onBuyNow={handleBuyNow}
              />
            ) : (
              <SitePreview
                template={currentTemplate}
                sections={currentPage.sections}
                editable
                activePage={activePage}
                onPageChange={(p) => { setSelectedProduct(null); setActivePage(p); }}
                onUpdateHero={(updates) => updatePageHero(updates)}
                onUpdateSection={(id, data) => updateSectionData(id, data)}
                onRemoveSection={removeSection}
                onMoveSection={moveSection}
                onAddSection={addSection}
                htmlContent={state.htmlContent}
                onCtaClick={() => {
                  if (state.checkout?.enabled) setActivePage("__checkout__");
                }}
                onProductClick={(i) => setSelectedProduct(i)}
                productsConfig={state.productsConfig}
                contactForm={state.contactForm}
                siteId={state.siteId}
                onLeadCreated={handleLeadCreated}
                customPages={state.customPages}
                onOpenProductModal={handleOpenProductModal}
                biolinkConfig={state.biolinkConfig}
              />
            )}
          </div>
        </ScrollArea>

        {/* AI Panel - Professional Redesign */}
        {rightPanel === "ai" && (
          <div className="w-96 border-l border-border flex flex-col bg-gradient-to-b from-background to-muted/20">
            {/* Header with gradient */}
            <div className="px-5 py-4 border-b border-border/60 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">AI Assistant</div>
                    <div className="text-[10px] text-muted-foreground">Powered by {supabase ? "Claude" : "Gemini"}</div>
                  </div>
                </div>
                <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Welcome message when no messages */}
            {messages.length === 0 && !aiLoading && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">How can I help you today?</h3>
                  <p className="text-xs text-muted-foreground">I can help you customize your website, add sections, modify content, and more.</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-1">Quick actions:</p>
                  {suggestedActions.slice(0, 4).map((action, i) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      className="w-full text-left text-xs px-3.5 py-3 rounded-lg border border-border/60 bg-background/50 hover:bg-accent hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <span className="text-[10px] font-semibold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-foreground leading-relaxed">{action}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] text-sm p-3.5 rounded-xl shadow-sm ${
                      msg.role === "assistant"
                        ? "bg-background border border-border/60 text-foreground"
                        : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-background border border-border/60 text-sm p-3.5 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions (only show when there are messages) */}
            {messages.length > 0 && suggestedActions.length > 0 && (
              <div className="px-4 pb-3 space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground px-1 mb-1">Suggested:</p>
                {suggestedActions.slice(0, 2).map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    disabled={aiLoading}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-border/60 bg-background/80 backdrop-blur-sm">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(chatInput);
                      }
                    }}
                    placeholder="Describe what you'd like to change..."
                    rows={2}
                    className="w-full text-sm bg-background border border-border/60 rounded-lg px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none transition-all"
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                    ↵ Send
                  </div>
                </div>
                <button
                  onClick={() => sendMessage(chatInput)}
                  disabled={!chatInput.trim() || aiLoading}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {rightPanel === "settings" && (
          <div className="w-96 border-l border-border flex flex-col bg-background">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Site Settings</span>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <Tabs value={settingsTab} onValueChange={setSettingsTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 overflow-x-auto">
                <TabsTrigger value="page" className="text-xs">Page</TabsTrigger>
                <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
                {isCoachingTemplate && (
                  <TabsTrigger value="session" className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Session
                  </TabsTrigger>
                )}
                {isWebinarTemplate && (
                  <TabsTrigger value="webinar" className="text-xs flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Webinar
                  </TabsTrigger>
                )}
                <TabsTrigger value="contact-form" className="text-xs flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Contact
                </TabsTrigger>
                <TabsTrigger value="products" className="text-xs flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="biolink" className="text-xs flex items-center gap-1">
                  <Link className="h-3 w-3" />
                  Biolink
                </TabsTrigger>
                {hasCheckout && <TabsTrigger value="checkout" className="text-xs">Checkout</TabsTrigger>}
                <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="page" className="p-4 space-y-4">
                  <div className="text-xs text-muted-foreground mb-2">Editing: <span className="font-semibold text-foreground">{activePage}</span></div>
                  <div><label className="text-xs font-medium text-foreground">Page Title</label><Input value={currentPage.heroTitle} onChange={(e) => updatePageHero({ heroTitle: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Tagline</label><Input value={currentPage.heroTagline} onChange={(e) => updatePageHero({ heroTagline: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Description</label><Textarea value={currentPage.heroDescription} onChange={(e) => updatePageHero({ heroDescription: e.target.value })} rows={3} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Banner Image URL</label><Input value={currentPage.bannerImage} onChange={(e) => updatePageHero({ bannerImage: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">CTA Button Text</label><Input value={currentPage.heroCta} onChange={(e) => updatePageHero({ heroCta: e.target.value })} className="mt-1.5" /></div>
                </TabsContent>

                <TabsContent value="pages" className="p-0 m-0">
                  <CustomPagesManager
                    templatePages={pageNames}
                    customPages={state.customPages}
                    onUpdateCustomPages={(pages) => {
                      setState((prev) => ({ ...prev, customPages: pages }));
                      setUnsavedChanges(true);
                    }}
                  />
                </TabsContent>

                <TabsContent value="sections" className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-1">Sections for: <span className="font-semibold text-foreground">{activePage}</span></p>
                  <p className="text-xs text-muted-foreground mb-3">Toggle, reorder, or remove sections. Click + to add new ones.</p>
                  {currentPage.sections.map((section, i) => (
                    <div key={section.id} className={`flex items-center gap-2 p-2.5 rounded-md border transition-colors ${section.visible ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"}`}>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"><GripVertical className="h-3 w-3 rotate-180" /></button>
                        <button onClick={() => moveSection(i, "down")} disabled={i === currentPage.sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"><GripVertical className="h-3 w-3" /></button>
                      </div>
                      <span className="text-sm text-foreground flex-1">{section.label}</span>
                      <Switch checked={section.visible} onCheckedChange={() => toggleSection(section.id)} />
                      <button onClick={() => removeSection(section.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full gap-1.5 mt-3" onClick={() => setAddSectionOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add Section
                  </Button>
                </TabsContent>

                {hasCheckout && state.checkout && (
                  <TabsContent value="checkout" className="p-4 space-y-4">
                    <p className="text-xs text-muted-foreground mb-2">Configure the checkout page for your product/service.</p>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Payment</h4>
                      <div>
                        <label className="text-xs font-medium text-foreground">Amount Type</label>
                        <Select value={state.checkout.amountType} onValueChange={(v) => updateCheckout({ amountType: v as "fixed" | "custom" })}>
                          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="custom">Customer Enters Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Amount (₹)</label>
                        <Input type="number" value={state.checkout.amount} onChange={(e) => updateCheckout({ amount: Number(e.target.value) })} className="mt-1.5" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Button Text</label>
                        <Input value={state.checkout.buttonText} onChange={(e) => updateCheckout({ buttonText: e.target.value })} className="mt-1.5" />
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Send receipt</span>
                          <Switch checked={state.checkout.sendReceipt} onCheckedChange={(v) => updateCheckout({ sendReceipt: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Enable GST</span>
                          <Switch checked={state.checkout.gstEnabled} onCheckedChange={(v) => updateCheckout({ gstEnabled: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Collect Address</span>
                          <Switch checked={state.checkout.collectAddress} onCheckedChange={(v) => updateCheckout({ collectAddress: v })} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Form Fields</h4>
                      <p className="text-xs text-muted-foreground">Customize what information you collect.</p>
                      {state.checkout.formFields.map((field) => (
                        <div key={field.id} className="flex items-center gap-2 p-2.5 rounded-md border border-border bg-secondary/30">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <Input value={field.label} onChange={(e) => updateCheckoutField(field.id, { label: e.target.value })} className="h-7 text-xs" />
                          </div>
                          <Select value={field.type} onValueChange={(v) => updateCheckoutField(field.id, { type: v as CheckoutFormField["type"] })}>
                            <SelectTrigger className="w-20 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">Req</span>
                            <Switch checked={field.required} onCheckedChange={(v) => updateCheckoutField(field.id, { required: v })} />
                          </div>
                          <button onClick={() => removeCheckoutField(field.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={addCheckoutField}>
                        <Plus className="h-3.5 w-3.5" /> Add Field
                      </Button>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Product Highlights</h4>
                      <p className="text-xs text-muted-foreground">Shown on the left side of checkout.</p>
                      {state.checkout.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input value={h} onChange={(e) => { const u = [...state.checkout!.highlights]; u[i] = e.target.value; updateCheckout({ highlights: u }); }} className="flex-1 h-7 text-xs" />
                          <button onClick={() => updateCheckout({ highlights: state.checkout!.highlights.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => updateCheckout({ highlights: [...state.checkout!.highlights, "New highlight"] })}>
                        <Plus className="h-3.5 w-3.5" /> Add Highlight
                      </Button>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Post-Payment</h4>
                      <div><label className="text-xs font-medium text-foreground">Success Message</label><Textarea value={state.checkout.successMessage} onChange={(e) => updateCheckout({ successMessage: e.target.value })} rows={2} className="mt-1.5" /></div>
                      <div><label className="text-xs font-medium text-foreground">Redirect URL</label><Input value={state.checkout.redirectUrl} onChange={(e) => updateCheckout({ redirectUrl: e.target.value })} placeholder="https://..." className="mt-1.5" /></div>
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="seo" className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground">URL Slug</label>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-xs text-muted-foreground">/s/</span>
                      <Input value={slug} onChange={(e) => { setSlug(e.target.value); setUnsavedChanges(true); }} className="flex-1" />
                    </div>
                  </div>
                  <div><label className="text-xs font-medium text-foreground">Meta Title</label><Input value={currentPage.heroTitle} onChange={(e) => updatePageHero({ heroTitle: e.target.value })} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{currentPage.heroTitle.length}/60</p></div>
                  <div><label className="text-xs font-medium text-foreground">Meta Description</label><Textarea value={currentPage.heroDescription} onChange={(e) => updatePageHero({ heroDescription: e.target.value })} rows={2} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{currentPage.heroDescription.length}/160</p></div>
                </TabsContent>

                {/* Session Configuration Tab */}
                {isCoachingTemplate && sessionProduct && (
                  <TabsContent value="session" className="p-0 m-0">
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Session Name</label>
                        <Input
                          value={sessionProduct.title}
                          onChange={(e) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p =>
                                  p.type === "1-1-session" ? { ...p, title: e.target.value } : p
                                ),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="e.g. 1:1 Career Coaching"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Session Duration</label>
                        <Select
                          value={String(sessionProduct.sessionDuration || 60)}
                          onValueChange={(v) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p =>
                                  p.type === "1-1-session" ? { ...p, sessionDuration: Number(v) } : p
                                ),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Free Session</label>
                        <Switch
                          checked={sessionProduct.pricingModels[0]?.price === 0}
                          onCheckedChange={(checked) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p => {
                                  if (p.type === "1-1-session") {
                                    return {
                                      ...p,
                                      pricingModels: [{
                                        ...p.pricingModels[0],
                                        price: checked ? 0 : 2999,
                                        name: checked ? "Free Session" : "Single Session",
                                      }],
                                    };
                                  }
                                  return p;
                                }),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>

                      {sessionProduct.pricingModels[0]?.price > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price (₹)</label>
                          <Input
                            type="number"
                            value={sessionProduct.pricingModels[0]?.price || 0}
                            onChange={(e) => {
                              setState((prev) => ({
                                ...prev,
                                productsConfig: {
                                  ...prev.productsConfig,
                                  products: prev.productsConfig.products.map(p => {
                                    if (p.type === "1-1-session") {
                                      return {
                                        ...p,
                                        pricingModels: [{
                                          ...p.pricingModels[0],
                                          price: Number(e.target.value),
                                        }],
                                      };
                                    }
                                    return p;
                                  }),
                                },
                              }));
                              setUnsavedChanges(true);
                            }}
                            placeholder="2999"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Platform</label>
                        <Select
                          value={sessionProduct.calendarProvider || "gmeet"}
                          onValueChange={(v) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p =>
                                  p.type === "1-1-session" ? { ...p, calendarProvider: v as any } : p
                                ),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gmeet">Google Meet</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="calendly">Calendly</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={() => {
                          toast.success("Session configuration saved!");
                        }}
                        className="w-full"
                      >
                        Save Configuration
                      </Button>
                    </div>
                  </TabsContent>
                )}

                {/* Webinar Configuration Tab */}
                {isWebinarTemplate && webinarProduct && (
                  <TabsContent value="webinar" className="p-0 m-0">
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Webinar Title</label>
                        <Input
                          value={webinarProduct.title}
                          onChange={(e) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p =>
                                  p.type === "webinar" ? { ...p, title: e.target.value } : p
                                ),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="e.g. How to Build a Successful Business"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date</label>
                          <Input
                            type="date"
                            value={webinarProduct.webinarDate || ""}
                            onChange={(e) => {
                              setState((prev) => ({
                                ...prev,
                                productsConfig: {
                                  ...prev.productsConfig,
                                  products: prev.productsConfig.products.map(p =>
                                    p.type === "webinar" ? { ...p, webinarDate: e.target.value } : p
                                  ),
                                },
                              }));
                              setUnsavedChanges(true);
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Time</label>
                          <Input
                            type="time"
                            value={webinarProduct.webinarTime || "18:00"}
                            onChange={(e) => {
                              setState((prev) => ({
                                ...prev,
                                productsConfig: {
                                  ...prev.productsConfig,
                                  products: prev.productsConfig.products.map(p =>
                                    p.type === "webinar" ? { ...p, webinarTime: e.target.value } : p
                                  ),
                                },
                              }));
                              setUnsavedChanges(true);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration</label>
                        <Select
                          value={String(webinarProduct.webinarDuration || 90)}
                          onValueChange={(v) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p =>
                                  p.type === "webinar" ? { ...p, webinarDuration: Number(v) } : p
                                ),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120 minutes</SelectItem>
                            <SelectItem value="180">180 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Free Registration</label>
                        <Switch
                          checked={webinarProduct.pricingModels[0]?.price === 0}
                          onCheckedChange={(checked) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p => {
                                  if (p.type === "webinar") {
                                    return {
                                      ...p,
                                      pricingModels: [{
                                        ...p.pricingModels[0],
                                        price: checked ? 0 : 499,
                                        name: checked ? "Free Registration" : "Registration",
                                      }],
                                    };
                                  }
                                  return p;
                                }),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>

                      {webinarProduct.pricingModels[0]?.price > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Registration Fee (₹)</label>
                          <Input
                            type="number"
                            value={webinarProduct.pricingModels[0]?.price || 0}
                            onChange={(e) => {
                              setState((prev) => ({
                                ...prev,
                                productsConfig: {
                                  ...prev.productsConfig,
                                  products: prev.productsConfig.products.map(p => {
                                    if (p.type === "webinar") {
                                      return {
                                        ...p,
                                        pricingModels: [{
                                          ...p.pricingModels[0],
                                          price: Number(e.target.value),
                                        }],
                                      };
                                    }
                                    return p;
                                  }),
                                },
                              }));
                              setUnsavedChanges(true);
                            }}
                            placeholder="499"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Platform</label>
                        <Select
                          value={webinarProduct.webinarPlatform || "zoom"}
                          onValueChange={(v) => {
                            setState((prev) => ({
                              ...prev,
                              productsConfig: {
                                ...prev.productsConfig,
                                products: prev.productsConfig.products.map(p =>
                                  p.type === "webinar" ? { ...p, webinarPlatform: v as any } : p
                                ),
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="gmeet">Google Meet</SelectItem>
                            <SelectItem value="custom">Custom Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {webinarProduct.webinarPlatform === "custom" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Custom Platform URL</label>
                          <Input
                            value={webinarProduct.webinarUrl || ""}
                            onChange={(e) => {
                              setState((prev) => ({
                                ...prev,
                                productsConfig: {
                                  ...prev.productsConfig,
                                  products: prev.productsConfig.products.map(p =>
                                    p.type === "webinar" ? { ...p, webinarUrl: e.target.value } : p
                                  ),
                                },
                              }));
                              setUnsavedChanges(true);
                            }}
                            placeholder="https://your-platform.com/webinar"
                          />
                        </div>
                      )}

                      <Button
                        onClick={() => {
                          toast.success("Webinar configuration saved!");
                        }}
                        className="w-full"
                      >
                        Save Configuration
                      </Button>
                    </div>
                  </TabsContent>
                )}

                {/* Contact Form Tab */}
                <TabsContent value="contact-form" className="p-0 m-0">
                  <ContactFormBuilder
                    contactForm={state.contactForm}
                    products={state.productsConfig.products}
                    onUpdate={(contactForm) => {
                      setState((prev) => ({ ...prev, contactForm }));
                      setUnsavedChanges(true);
                    }}
                  />
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="p-0 m-0">
                  <ProductManager
                    websiteId={state.siteId}
                    products={state.productsConfig.products}
                    categories={categories}
                    onUpdateProducts={(products) => {
                      setState((prev) => ({
                        ...prev,
                        productsConfig: { ...prev.productsConfig, products },
                      }));
                      setUnsavedChanges(true);
                    }}
                    onUpdateCategories={(updatedCategories) => {
                      setCategories(updatedCategories);
                      saveCategories(state.siteId, updatedCategories);
                      setUnsavedChanges(true);
                    }}
                  />
                </TabsContent>

                <TabsContent value="biolink" className="p-4 space-y-4">
                  {state.biolinkConfig?.profile && (
                    <BiolinkEditor
                      profile={state.biolinkConfig.profile}
                      onUpdate={(updatedProfile) => {
                        setState((prev) => ({
                          ...prev,
                          biolinkConfig: prev.biolinkConfig
                            ? {
                                ...prev.biolinkConfig,
                                profile: updatedProfile,
                                updatedAt: new Date().toISOString(),
                              }
                            : prev.biolinkConfig,
                        }));
                        setUnsavedChanges(true);
                      }}
                    />
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>

      {/* Add Section Dialog */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader><DialogTitle>Add Section</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-2 pr-4">
              {availableSectionTypes.map((st) => (
                <button
                  key={st.type}
                  onClick={() => addSection(st.type)}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{st.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{st.description}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-2xl">
          {status !== "published" ? (
            // Pre-publish state
            <>
              <DialogHeader><DialogTitle>Publish Website</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground text-sm mb-2">{state.pages[pageNames[0]]?.heroTitle}</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-muted-foreground text-xs">Pages</span><p className="font-medium text-foreground">{pageNames.length}</p></div>
                    <div><span className="text-muted-foreground text-xs">Sections</span><p className="font-medium text-foreground">{currentPage.sections.filter((s) => s.visible).length}</p></div>
                    <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium text-foreground">{state.template.title}</p></div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Site URL</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input value={`${window.location.origin}/s/${slug}`} readOnly className="flex-1 text-xs" />
                    <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> SSL-secured</div>
                  <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Mobile responsive</div>
                  <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> SEO optimized</div>
                  <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> {pageNames.length} pages</div>
                </div>
                <Button className="w-full gap-2" onClick={handlePublish} disabled={publishing}>
                  {publishing ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : "Publish Now"}
                </Button>
              </div>
            </>
          ) : (
            // Post-publish success state
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Website Published Successfully!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* URL Section */}
                <div className="space-y-3">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-2">{publishedPageData?.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={`${window.location.origin}${publishedPageData?.url}`}
                        readOnly
                        className="flex-1 text-sm font-mono"
                      />
                      <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 justify-start"
                      onClick={() => window.open(publishedPageData?.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" /> View Live Site
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 justify-start"
                      onClick={() => {
                        setShareDialogOpen(true);
                        setPublishDialogOpen(false);
                      }}
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>

                {/* Next Steps Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Next Steps</h4>
                  <div className="space-y-2">
                    {/* Campaign Setup */}
                    {(() => {
                      const campaignRecommendations: Record<string, { icon: React.ElementType; title: string; description: string; type: string }> = {
                        webinar: {
                          icon: Megaphone,
                          title: "Setup Webinar Nurture Campaign",
                          description: "Convert free webinar attendees to paid course customers",
                          type: "webinar_nurture",
                        },
                        course: {
                          icon: Megaphone,
                          title: "Setup Upsell Campaign",
                          description: "Promote advanced courses to existing students",
                          type: "upsell",
                        },
                        coaching: {
                          icon: Megaphone,
                          title: "Setup Booking Reminders",
                          description: "Send confirmations and reduce no-shows",
                          type: "generic",
                        },
                      };
                      const rec = campaignRecommendations[publishedPageData?.type] || campaignRecommendations.course;

                      return (
                        <button
                          onClick={() => {
                            navigate(`/marketing-campaigns?type=${rec.type}&product=${publishedPageData?.id}`);
                            setPublishDialogOpen(false);
                          }}
                          className="w-full text-left p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <rec.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm mb-1">{rec.title}</h5>
                              <p className="text-xs text-muted-foreground">{rec.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </button>
                      );
                    })()}

                    {/* Additional Next Steps */}
                    <button
                      onClick={() => {
                        navigate("/customers");
                        setPublishDialogOpen(false);
                      }}
                      className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Users className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm mb-1">Track Customer Activity</h5>
                          <p className="text-xs text-muted-foreground">Monitor registrations, payments, and engagement</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/offers");
                        setPublishDialogOpen(false);
                      }}
                      className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Tag className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm mb-1">Create Launch Offers</h5>
                          <p className="text-xs text-muted-foreground">Setup early bird discounts and limited-time deals</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setPublishDialogOpen(false);
                      navigate("/website-builder");
                    }}
                  >
                    Back to Sites
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => {
                      setPublishDialogOpen(false);
                      setRightPanel("settings");
                    }}
                  >
                    <Settings className="h-4 w-4" /> Manage Site
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Share Website</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate mr-2">/s/{slug}</span>
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={copyLink}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["WhatsApp", "Email", "SMS", "Twitter"].map((ch) => (
                <Button key={ch} variant="outline" onClick={() => toast.success(`Shared via ${ch}`)}>{ch}</Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
      )}

      {/* Checkout Modal */}
      {checkoutModal && (
        <ProductCheckoutModal
          product={checkoutModal.product}
          pricingModel={checkoutModal.pricingModel}
          siteId={state.siteId}
          siteName={state.pages[pageNames[0]].heroTitle}
          onClose={handleCloseCheckout}
        />
      )}
    </div>
  );
};

// ─── Add Page Button ───
const AddPageButton = ({ onAdd, fullWidth = false }: { onAdd: (name: string) => void; fullWidth?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${fullWidth ? "w-full justify-center border border-dashed border-border mt-2" : ""}`}
      >
        <Plus className="h-3 w-3" /> Add Page
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${fullWidth ? "mt-2" : ""}`}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Page name..."
        className="h-7 text-xs w-32"
        autoFocus
      />
      <Button size="sm" className="h-7 px-2 text-xs" onClick={handleAdd}>Add</Button>
      <Button size="sm" variant="ghost" className="h-7 px-1.5" onClick={() => { setOpen(false); setName(""); }}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const ViewToggle = ({ viewMode, setViewMode }: { viewMode: string; setViewMode: (v: "desktop" | "mobile") => void }) => (
  <div className="flex items-center border border-border rounded-md overflow-hidden">
    <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Monitor className="h-4 w-4" /></button>
    <button onClick={() => setViewMode("mobile")} className={`p-2 ${viewMode === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Smartphone className="h-4 w-4" /></button>
  </div>
);

export default SmartPageEditor;
