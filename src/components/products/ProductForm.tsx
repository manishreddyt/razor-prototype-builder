import { useState } from "react";
import { Product, ProductType, PricingModel } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, GraduationCap, Video, Calendar, Sparkles, Package, Download } from "lucide-react";
import { PricingModelBuilder } from "./PricingModelBuilder";
import { CourseDetailsForm } from "./CourseDetailsForm";
import { SessionDetailsForm } from "./SessionDetailsForm";
import { WebinarDetailsForm } from "./WebinarDetailsForm";
import { EcommerceDetailsForm } from "./EcommerceDetailsForm";
import { toast } from "sonner";

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const productTypes: { value: ProductType; label: string; icon: any; description: string }[] = [
  {
    value: "online-course",
    label: "Online Course",
    icon: GraduationCap,
    description: "Sell self-paced or instructor-led courses with modules and curriculum",
  },
  {
    value: "1-1-session",
    label: "1:1 Session",
    icon: Calendar,
    description: "Offer personalized coaching or consulting sessions with calendar booking",
  },
  {
    value: "webinar",
    label: "Webinar",
    icon: Video,
    description: "Host live webinars with speakers, agenda, and registration",
  },
  {
    value: "physical-product",
    label: "Physical Product",
    icon: Package,
    description: "Sell physical goods with inventory tracking, shipping, and variants",
  },
  {
    value: "digital-product",
    label: "Digital Product",
    icon: Download,
    description: "Sell digital downloads like ebooks, templates, or software",
  },
];

const generateDummyContent = (type: ProductType): Partial<Product> => {
  const baseData = {
    featured: true,
    status: "draft" as const,
    category: "",
    tags: [],
  };

  if (type === "online-course") {
    return {
      ...baseData,
      type: "online-course",
      title: "Complete Web Development Bootcamp 2027",
      description: "Master modern web development with React, Node.js, and TypeScript. Build real-world projects and launch your tech career.",
      longDescription: "Transform your career with our comprehensive web development bootcamp. Learn industry-standard technologies including React, Node.js, TypeScript, and MongoDB. Build 5+ real-world projects, receive expert code reviews, and get job placement support. Perfect for beginners and career switchers.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      images: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800",
      ],
      category: "Web Development",
      badge: "Bestseller",
      duration: "12 weeks",
      format: "video" as const,
      level: "beginner" as const,
      modules: [
        { id: "m1", title: "HTML & CSS Fundamentals", description: "Build beautiful, responsive websites", lessons: 15, duration: "8 hours", order: 1 },
        { id: "m2", title: "JavaScript Mastery", description: "Learn modern JavaScript ES6+", lessons: 20, duration: "12 hours", order: 2 },
        { id: "m3", title: "React Framework", description: "Build dynamic UIs with React", lessons: 18, duration: "10 hours", order: 3 },
        { id: "m4", title: "Backend with Node.js", description: "Create APIs and server-side apps", lessons: 16, duration: "9 hours", order: 4 },
      ],
      whatYouWillLearn: [
        "Build responsive websites from scratch with HTML/CSS",
        "Master JavaScript and modern ES6+ features",
        "Create interactive UIs with React and hooks",
        "Build full-stack apps with Node.js and Express",
        "Work with databases using MongoDB",
        "Deploy applications to production",
      ],
      courseIncludes: [
        "50+ hours of HD video content",
        "Downloadable resources and code samples",
        "Lifetime access to all materials",
        "Certificate of completion",
        "Access on mobile and desktop",
        "Priority support via Discord",
      ],
      pricingModels: [
        {
          id: "pm1",
          name: "Self-Paced Learning",
          price: 4999,
          currency: "INR",
          interval: "one_time",
          features: [
            "Lifetime access to course",
            "50+ hours of video",
            "Downloadable resources",
            "Community forum access",
            "Certificate on completion",
          ],
          highlighted: false,
          description: "Learn at your own pace",
        },
        {
          id: "pm2",
          name: "With Mentorship",
          price: 12999,
          currency: "INR",
          interval: "one_time",
          features: [
            "Everything in Self-Paced",
            "4 × 1:1 mentor sessions",
            "Code review & feedback",
            "Career guidance",
            "Job placement support",
            "LinkedIn profile review",
          ],
          highlighted: true,
          description: "Best for career switchers",
        },
      ],
    };
  }

  if (type === "1-1-session") {
    return {
      ...baseData,
      type: "1-1-session",
      title: "Career Coaching Session",
      description: "Get personalized career guidance from an experienced tech leader. Navigate transitions, salary negotiations, and growth strategies.",
      longDescription: "Book a 1:1 session with an experienced tech leader who has helped 100+ professionals advance their careers. Whether you're preparing for interviews, negotiating offers, or planning your next move, get actionable advice tailored to your situation.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
      category: "Career Coaching",
      badge: "Popular",
      sessionDuration: 60,
      calendarConnected: false,
      calendarProvider: "google",
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00", enabled: true },
        { day: "Tuesday", startTime: "09:00", endTime: "17:00", enabled: true },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00", enabled: true },
        { day: "Thursday", startTime: "09:00", endTime: "17:00", enabled: true },
        { day: "Friday", startTime: "09:00", endTime: "15:00", enabled: true },
        { day: "Saturday", startTime: "10:00", endTime: "14:00", enabled: false },
        { day: "Sunday", startTime: "10:00", endTime: "14:00", enabled: false },
      ],
      pricingModels: [
        {
          id: "pm1",
          name: "Single Session",
          price: 2999,
          currency: "INR",
          interval: "one_time",
          features: [
            "60-minute 1:1 video call",
            "Session recording",
            "Follow-up email summary",
            "Career resources",
          ],
          highlighted: false,
        },
        {
          id: "pm2",
          name: "4-Session Package",
          price: 9999,
          currency: "INR",
          interval: "one_time",
          features: [
            "4 × 60-minute calls",
            "Priority scheduling",
            "Email support between sessions",
            "Custom action plan",
            "LinkedIn review",
          ],
          highlighted: true,
          description: "Save ₹2,000",
        },
      ],
    };
  }

  if (type === "physical-product") {
    return {
      ...baseData,
      type: "physical-product",
      title: "Premium Organic Cotton T-Shirt",
      description: "Sustainable, eco-friendly t-shirt made from 100% organic cotton. Soft, breathable, and perfect for everyday wear.",
      longDescription: "Experience ultimate comfort with our premium organic cotton t-shirt. Ethically sourced and manufactured with care for the environment. Features include breathable fabric, pre-shrunk for perfect fit, and reinforced stitching for durability. Available in multiple colors and sizes.",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
      ],
      category: "Fashion",
      tags: ["organic", "sustainable", "cotton", "casual"],
      badge: "Bestseller",
      compareAtPrice: 999,
      inventory: {
        trackInventory: true,
        stock: 150,
        lowStockThreshold: 20,
        allowBackorder: false,
        sku: "ORG-TSHIRT-001",
      },
      shipping: {
        requiresShipping: true,
        weight: 200,
        dimensions: { length: 30, width: 25, height: 2 },
        shippingCost: 50,
        freeShippingThreshold: 500,
      },
      pricingModels: [
        {
          id: "pm1",
          name: "Single",
          price: 699,
          currency: "INR",
          interval: "one_time",
          features: [
            "100% organic cotton",
            "Eco-friendly packaging",
            "Free shipping above ₹500",
            "Easy returns within 7 days",
          ],
          highlighted: false,
        },
        {
          id: "pm2",
          name: "Pack of 3",
          price: 1899,
          currency: "INR",
          interval: "one_time",
          features: [
            "3 t-shirts (mix & match sizes)",
            "Save ₹198",
            "Free shipping",
            "Premium gift packaging",
            "Extended 15-day returns",
          ],
          highlighted: true,
          description: "Save 10%",
        },
      ],
    };
  }

  if (type === "digital-product") {
    return {
      ...baseData,
      type: "digital-product",
      title: "Complete UI/UX Design System Template",
      description: "Professional Figma design system with 200+ components, design tokens, and comprehensive documentation for rapid product design.",
      longDescription: "Accelerate your design workflow with our battle-tested design system. Includes 200+ pre-built components, comprehensive color palettes, typography scales, spacing system, and detailed documentation. Perfect for startups and design teams building consistent, scalable products.",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      images: [
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800",
      ],
      category: "Design Resources",
      tags: ["figma", "design-system", "ui-kit", "templates"],
      badge: "New",
      compareAtPrice: 4999,
      downloadUrl: "https://example.com/downloads/design-system.fig",
      pricingModels: [
        {
          id: "pm1",
          name: "Personal License",
          price: 2999,
          currency: "INR",
          interval: "one_time",
          features: [
            "200+ Figma components",
            "Design tokens library",
            "Complete documentation",
            "Free lifetime updates",
            "Personal use only",
          ],
          highlighted: false,
        },
        {
          id: "pm2",
          name: "Team License",
          price: 8999,
          currency: "INR",
          interval: "one_time",
          features: [
            "Everything in Personal",
            "Use in unlimited projects",
            "Team sharing (up to 10)",
            "Priority support",
            "Custom component requests",
            "Commercial use allowed",
          ],
          highlighted: true,
          description: "Best for teams",
        },
      ],
    };
  }

  // Webinar
  return {
    ...baseData,
    type: "webinar",
    title: "Mastering AI-Driven Product Management in 2027",
    description: "Join industry experts for an exclusive 90-minute webinar on leveraging AI tools to build better products faster.",
    longDescription: "Discover how leading product teams are using AI to accelerate research, prioritize features, and ship faster. Learn frameworks, tools, and real-world case studies from companies like Notion, Linear, and Stripe.",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800",
    category: "Product Management",
    badge: "Live Event",
    webinarDate: "2027-04-20",
    webinarTime: "18:00",
    webinarDuration: 90,
    webinarPlatform: "zoom",
    webinarConnected: false,
    webinarUrl: "",
    speakers: [
      {
        id: "s1",
        name: "Priya Sharma",
        title: "VP of Product, TechCorp",
        bio: "15 years building products at scale. Former PM at Google and Meta.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        social: { linkedin: "https://linkedin.com/in/priyasharma", twitter: "https://twitter.com/priyapm" },
      },
      {
        id: "s2",
        name: "Rahul Verma",
        title: "Head of AI, StartupXYZ",
        bio: "AI researcher turned product leader. Building the future of work.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        social: { linkedin: "https://linkedin.com/in/rahulverma" },
      },
    ],
    agenda: [
      { id: "a1", time: "18:00", title: "Welcome & Introduction", description: "Set the stage for AI in product management", duration: 10 },
      { id: "a2", time: "18:10", title: "AI Tools for Product Discovery", description: "Research, synthesis, and insights", speaker: "s1", duration: 25 },
      { id: "a3", time: "18:35", title: "Building AI-First Products", description: "Architecture, ethics, and UX considerations", speaker: "s2", duration: 25 },
      { id: "a4", time: "19:00", title: "Case Studies", description: "Real-world examples from top companies", speaker: "s1", duration: 20 },
      { id: "a5", time: "19:20", title: "Live Q&A", description: "Audience questions", duration: 10 },
    ],
    pricingModels: [
      {
        id: "pm1",
        name: "Live Webinar",
        price: 499,
        currency: "INR",
        interval: "one_time",
        features: [
          "Live session access",
          "Q&A participation",
          "Certificate of attendance",
        ],
        highlighted: false,
      },
      {
        id: "pm2",
        name: "VIP Access",
        price: 1499,
        currency: "INR",
        interval: "one_time",
        features: [
          "Everything in Live",
          "Recording access (30 days)",
          "Exclusive 1:1 Q&A slot",
          "Bonus AI tools guide (PDF)",
          "Private Slack community",
        ],
        highlighted: true,
        description: "Best value",
      },
    ],
  };
};

export const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      type: "online-course",
      title: "",
      description: "",
      longDescription: "",
      image: "",
      images: [],
      pricingModels: [],
      category: "",
      tags: [],
      featured: false,
      status: "draft",
    }
  );

  const updateFormData = (updates: Partial<Product>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleGenerateAIContent = () => {
    const dummyData = generateDummyContent(formData.type || "online-course");
    setFormData((prev) => ({ ...prev, ...dummyData }));
    toast.success("AI content generated! Review and customize as needed.");
  };

  const handleSave = () => {
    // Validation
    if (!formData.type) {
      toast.error("Please select a product type");
      return;
    }
    if (!formData.title?.trim()) {
      toast.error("Please enter a product title");
      return;
    }
    if (!formData.description?.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!formData.image?.trim()) {
      toast.error("Please add a product image");
      return;
    }
    if (!formData.pricingModels || formData.pricingModels.length === 0) {
      toast.error("Please add at least one pricing model");
      return;
    }

    const now = new Date().toISOString();
    const savedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      type: formData.type!,
      title: formData.title!,
      description: formData.description!,
      longDescription: formData.longDescription,
      image: formData.image!,
      images: formData.images || [],
      pricingModels: formData.pricingModels || [],
      category: formData.category,
      tags: formData.tags || [],
      featured: formData.featured || false,
      badge: formData.badge,
      status: formData.status || "draft",
      createdAt: product?.createdAt || now,
      updatedAt: now,
      // Type-specific fields
      duration: formData.duration,
      modules: formData.modules,
      format: formData.format,
      level: formData.level,
      whatYouWillLearn: formData.whatYouWillLearn,
      courseIncludes: formData.courseIncludes,
      sessionDuration: formData.sessionDuration,
      calendarConnected: formData.calendarConnected,
      calendarProvider: formData.calendarProvider,
      calendarUrl: formData.calendarUrl,
      availability: formData.availability,
      webinarDate: formData.webinarDate,
      webinarTime: formData.webinarTime,
      webinarDuration: formData.webinarDuration,
      webinarPlatform: formData.webinarPlatform,
      webinarConnected: formData.webinarConnected,
      webinarUrl: formData.webinarUrl,
      speakers: formData.speakers,
      agenda: formData.agenda,
      // E-commerce specific fields
      variants: formData.variants,
      inventory: formData.inventory,
      shipping: formData.shipping,
      compareAtPrice: formData.compareAtPrice,
      downloadUrl: formData.downloadUrl,
    };

    onSave(savedProduct);
    toast.success(product ? "Product updated" : "Product created");
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {/* Header */}
      <div className="flex items-start justify-between sticky top-0 bg-white z-10 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">{product ? "Edit Product" : "Create New Product"}</h2>
          <p className="text-sm text-muted-foreground mt-1">Fill in the details below</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAIContent}
            className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
          >
            <Sparkles className="h-4 w-4" />
            Generate AI Content
          </Button>
        </div>
      </div>

      {/* Single Form - All Sections */}
      <div className="space-y-8">
        {/* Section 1: Product Type */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">1. Product Type *</h3>
            <p className="text-sm text-muted-foreground">Choose the type of product you're creating</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {productTypes.map((type) => {
              const Icon = type.icon;
              const selected = formData.type === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => updateFormData({ type: type.value })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${selected ? "text-primary" : "text-gray-400"}`} />
                  <h4 className="font-semibold text-sm mb-1">{type.label}</h4>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Basic Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">2. Basic Details *</h3>
            <p className="text-sm text-muted-foreground">Add title, description, and images</p>
          </div>
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete Web Development Bootcamp"
                value={formData.title || ""}
                onChange={(e) => updateFormData({ title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                placeholder="A brief description that appears in product cards (1-2 sentences)"
                value={formData.description || ""}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                placeholder="Detailed description shown on the product page"
                value={formData.longDescription || ""}
                onChange={(e) => updateFormData({ longDescription: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image URL *</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image || ""}
                onChange={(e) => updateFormData({ image: e.target.value })}
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded border mt-2"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Web Development"
                  value={formData.category || ""}
                  onChange={(e) => updateFormData({ category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  placeholder="e.g., Bestseller, New"
                  value={formData.badge || ""}
                  onChange={(e) => updateFormData({ badge: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Product Configuration (Type-specific) */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">3. Product Configuration</h3>
            <p className="text-sm text-muted-foreground">
              {formData.type === "online-course" && "Add course modules and learning outcomes"}
              {formData.type === "1-1-session" && "Set availability and session details"}
              {formData.type === "webinar" && "Add speakers, agenda, and event details"}
              {(formData.type === "physical-product" || formData.type === "digital-product") &&
                "Configure inventory, shipping, and product variants"}
            </p>
          </div>

          {formData.type === "online-course" && (
            <CourseDetailsForm formData={formData} updateFormData={updateFormData} />
          )}

          {formData.type === "1-1-session" && (
            <SessionDetailsForm formData={formData} updateFormData={updateFormData} />
          )}

          {formData.type === "webinar" && (
            <WebinarDetailsForm formData={formData} updateFormData={updateFormData} />
          )}

          {(formData.type === "physical-product" || formData.type === "digital-product") && (
            <EcommerceDetailsForm formData={formData} updateFormData={updateFormData} />
          )}
        </div>

        {/* Section 4: Pricing */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">4. Pricing Models *</h3>
            <p className="text-sm text-muted-foreground">Add one or more pricing options</p>
          </div>
          <PricingModelBuilder
            pricingModels={formData.pricingModels || []}
            onUpdate={(models) => updateFormData({ pricingModels: models })}
          />
        </div>

        {/* Section 5: Publish Settings */}
        <div className="space-y-4 pb-6">
          <div>
            <h3 className="font-semibold text-lg">5. Publish Settings</h3>
            <p className="text-sm text-muted-foreground">Choose how to save your product</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={formData.status === "draft" ? "default" : "outline"}
              onClick={() => updateFormData({ status: "draft" })}
            >
              Save as Draft
            </Button>
            <Button
              variant={formData.status === "published" ? "default" : "outline"}
              onClick={() => updateFormData({ status: "published" })}
            >
              Publish Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Actions - Sticky */}
      <div className="sticky bottom-0 bg-white border-t pt-4 flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} size="lg">
          <Check className="w-4 h-4 mr-2" />
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
};
