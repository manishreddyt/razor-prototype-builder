import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { templates, type TemplateData } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import { SmartPageCheckout } from "@/components/SmartPageCheckout";
import { getStoredSites } from "@/pages/WebsiteBuilder";
import { ArrowLeft } from "lucide-react";
import WebinarLandingPreview from "@/components/WebinarLandingPreview";
import CoachingLandingPreview from "@/components/CoachingLandingPreview";
import CourseLandingPreview from "@/components/CourseLandingPreview";
import type { WebinarData } from "@/types/smartPages";
import type { CoachingData } from "@/pages/CoachingCreate";
import type { CourseData } from "@/pages/CourseCreate";

type PublicView = "site" | "checkout" | "product-detail";

const SmartPagePublic = () => {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = (searchParams.get("view") as PublicView) || "site";
  const productIdx = parseInt(searchParams.get("product") || "-1", 10);

  const [activePage, setActivePage] = useState<string>(pageSlug || "Home");
  const [currentView, setCurrentView] = useState<PublicView>(initialView);
  const [selectedProduct, setSelectedProduct] = useState<number>(productIdx);

  // Find the site by slug
  const site = useMemo(() => {
    const sites = getStoredSites();
    return sites.find((s) => s.slug === slug) || null;
  }, [slug]);

  // Check if this is a webinar page and load webinar data
  const webinarData = useMemo<WebinarData | null>(() => {
    if (!site || site.pageType !== "webinar") return null;
    try {
      const stored = localStorage.getItem(`webinar_${site.id}`);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, [site]);

  // Check if this is a coaching page and load coaching data
  const coachingData = useMemo<CoachingData | null>(() => {
    if (!site || site.pageType !== "coaching") return null;
    try {
      const stored = localStorage.getItem(`coaching_${site.id}`);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, [site]);

  // Check if this is a course page and load course data
  const courseData = useMemo<CourseData | null>(() => {
    if (!site || site.pageType !== "course") return null;
    try {
      const stored = localStorage.getItem(`course_${site.id}`);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, [site]);

  // Find matching template
  const template = useMemo(() => {
    if (!site) return null;
    return templates.find(
      (t) => t.id === site.templateId || t.title.toLowerCase() === site.type.toLowerCase()
    ) || null;
  }, [site]);

  // Build the template for the active page — always computed
  const pageTemplate: TemplateData | null = useMemo(() => {
    if (!template) return null;

    // Check if activePage is a custom page
    const customPage = site?.customPages?.find(p => p.slug === activePage);
    if (customPage) {
      // Build template from custom page data
      return {
        ...template,
        heroTitle: customPage.name,
        heroTagline: "",
        heroDescription: "",
        heroCta: "",
        bannerImage: "",
        pages: [customPage.name],
        sections: customPage.sections,
      };
    }

    // Default to home page
    if (activePage === "Home" || activePage === template.pages[0]) {
      return template;
    }

    // Check template pages data
    const pageData = template.pagesData?.[activePage];
    if (!pageData) return template;
    return {
      ...template,
      heroTitle: pageData.heroTitle,
      heroTagline: pageData.heroTagline,
      heroDescription: pageData.heroDescription || template.heroDescription,
      heroCta: pageData.heroCta || template.heroCta,
      bannerImage: pageData.bannerImage || template.bannerImage,
      sections: pageData.sections,
    };
  }, [template, activePage, site]);

  // Get product if viewing product detail
  const product = useMemo(() => {
    if (!template || selectedProduct < 0) return null;
    const productsSection = template.sections.find((s) => s.type === "products");
    return productsSection?.data?.items?.[selectedProduct] || null;
  }, [template, selectedProduct]);

  // Build checkout config
  const productCheckout = useMemo(() => {
    if (!template) return null;
    if (!product) return template.checkout || null;
    const priceNum = parseInt(product.price?.replace(/[^0-9]/g, "") || "0", 10);
    if (template.checkout) {
      return { ...template.checkout, amount: priceNum, buttonText: `Pay ₹${priceNum.toLocaleString()}` };
    }
    return {
      enabled: true, amount: priceNum, amountType: "fixed" as const, currency: "INR",
      buttonText: `Pay ₹${priceNum.toLocaleString()}`, successMessage: "Payment successful! You'll receive a confirmation email shortly.",
      redirectUrl: "", collectAddress: false, sendReceipt: true, gstEnabled: true,
      formFields: [
        { id: "f_name", label: "Full Name", type: "text" as const, required: true, placeholder: "Enter your full name" },
        { id: "f_email", label: "Email", type: "email" as const, required: true, placeholder: "Enter your email" },
        { id: "f_phone", label: "Phone", type: "phone" as const, required: false, placeholder: "Enter your phone number" },
      ],
      highlights: ["Access to all materials", "Certificate on completion", "Community access"],
    };
  }, [product, template]);

  // ─── Webinar Page ───
  if (site && site.pageType === "webinar" && webinarData) {
    return (
      <div className="min-h-screen bg-background">
        <WebinarLandingPreview data={webinarData} interactive />
      </div>
    );
  }

  // ─── Coaching Page ───
  if (site && site.pageType === "coaching" && coachingData) {
    return (
      <div className="min-h-screen bg-background">
        <CoachingLandingPreview data={coachingData} interactive />
      </div>
    );
  }

  // ─── Course Page ───
  if (site && site.pageType === "course" && courseData) {
    return (
      <div className="min-h-screen bg-background">
        <CourseLandingPreview data={courseData} interactive />
      </div>
    );
  }

  // Not found
  if (!site || !template || !pageTemplate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground">This Smart Page doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Handle CTA click from SitePreview
  const handleCtaClick = () => {
    if (template.checkout?.enabled) {
      setCurrentView("checkout");
    }
  };

  // Handle product click from SitePreview
  const handleProductClick = (index: number) => {
    setSelectedProduct(index);
    setCurrentView("product-detail");
  };

  // ─── Checkout View ───
  if (currentView === "checkout") {
    const checkoutConfig = selectedProduct >= 0 && productCheckout ? productCheckout : template.checkout;
    if (!checkoutConfig) {
      setCurrentView("site");
      return null;
    }
    const checkoutTemplate = product
      ? { ...template, heroTitle: product.title, heroDescription: product.desc || template.heroDescription }
      : template;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 mb-4"
            onClick={() => {
              if (selectedProduct >= 0) {
                setCurrentView("product-detail");
              } else {
                setCurrentView("site");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <SmartPageCheckout template={checkoutTemplate} checkout={checkoutConfig} />
        </div>
      </div>
    );
  }

  // ─── Product Detail View ───
  if (currentView === "product-detail" && product) {
    const priceNum = parseInt(product.price?.replace(/[^0-9]/g, "") || "0", 10);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 space-y-8">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setCurrentView("site"); setSelectedProduct(-1); }}>
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg relative">
              <img src={product.image} alt={product.title} className="w-full h-80 object-cover" />
              {product.badge && (
                <span className="absolute top-4 left-4 text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">{product.badge}</span>
              )}
            </div>

            <div className="space-y-5">
              {product.badge && (
                <span className="inline-block text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{product.badge}</span>
              )}
              <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
              <p className="text-muted-foreground leading-relaxed">
                {product.desc || `Comprehensive ${product.title} program designed to take you from beginner to professional.`}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400">★</span>)}
                </div>
                <span className="text-sm font-medium text-foreground">4.9</span>
                <span className="text-xs text-muted-foreground">(2,340 ratings)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">{product.price}</span>
                {priceNum > 0 && <span className="text-lg text-muted-foreground line-through">₹{Math.round(priceNum * 1.5).toLocaleString()}</span>}
              </div>

              <Button size="lg" className="w-full text-base py-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => setCurrentView("checkout")}>
                {template.category === "education" ? `Enroll Now — ${product.price}` : `Buy Now — ${product.price}`}
              </Button>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>🔒 Secure payment</span>
                <span>🏆 Certificate included</span>
                <span>♾️ Lifetime access</span>
              </div>
            </div>
          </div>

          {productCheckout && productCheckout.highlights && (
            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">What's Included</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {productCheckout.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-sm text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {template.category === "education" && (
            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Course Overview</h3>
              <div className="space-y-3">
                {[
                  { module: "Module 1: Getting Started", lessons: 5, duration: "3 hours" },
                  { module: "Module 2: Core Concepts", lessons: 8, duration: "5 hours" },
                  { module: "Module 3: Hands-on Projects", lessons: 6, duration: "8 hours" },
                  { module: "Module 4: Advanced Topics", lessons: 7, duration: "6 hours" },
                  { module: "Module 5: Capstone & Certification", lessons: 4, duration: "4 hours" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{m.module}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{m.lessons} lessons</span>
                      <span>{m.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pb-8">
            <Button size="lg" className="text-base px-12 py-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => setCurrentView("checkout")}>
              {template.category === "education" ? `Enroll Now — ${product.price}` : `Buy Now — ${product.price}`}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Secure payment powered by Razorpay</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Site View ───
  return (
    <div className="min-h-screen bg-background">
      <SitePreview
        template={pageTemplate}
        sections={pageTemplate.sections}
        activePage={activePage}
        onPageChange={(page) => setActivePage(page)}
        onCtaClick={handleCtaClick}
        onProductClick={handleProductClick}
        productsConfig={site?.productsConfig}
        contactForm={site?.contactForm}
        siteId={site?.id}
        customPages={site?.customPages || []}
      />
    </div>
  );
};

export default SmartPagePublic;
