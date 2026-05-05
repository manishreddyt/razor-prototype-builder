import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { templates, type TemplateData } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import { SmartPageCheckout } from "@/components/SmartPageCheckout";
import { PaymentPageView } from "@/components/PaymentPageView";
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

  // Normalise price from either pricingModels (number) or legacy price string ("₹4,999")
  const getProductPrice = (p: any): { display: string; num: number } => {
    if (p?.pricingModels?.[0]?.price != null) {
      const num = Number(p.pricingModels[0].price);
      return { display: `₹${num.toLocaleString("en-IN")}`, num };
    }
    const str: string = p?.price || "₹0";
    const num = parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
    return { display: str.startsWith("₹") ? str : `₹${num.toLocaleString("en-IN")}`, num };
  };

  // Get product — prefer productsConfig (editor-created sites), fall back to template sections
  const product = useMemo(() => {
    if (selectedProduct < 0) return null;
    if (site?.productsConfig?.products?.[selectedProduct]) {
      return site.productsConfig.products[selectedProduct];
    }
    if (!template) return null;
    const productsSection = template.sections.find((s) => s.type === "products");
    return productsSection?.data?.items?.[selectedProduct] || null;
  }, [template, selectedProduct, site]);

  // Build checkout config
  const productCheckout = useMemo(() => {
    if (!template) return null;
    if (!product) return template.checkout || null;
    const { num: priceNum } = getProductPrice(product);
    if (template.checkout) {
      return { ...template.checkout, amount: priceNum, buttonText: `Pay ₹${priceNum.toLocaleString("en-IN")}` };
    }
    return {
      enabled: true, amount: priceNum, amountType: "fixed" as const, currency: "INR",
      buttonText: `Pay ₹${priceNum.toLocaleString("en-IN")}`,
      successMessage: "Payment successful! You'll receive a confirmation email shortly.",
      redirectUrl: "", collectAddress: false, sendReceipt: true, gstEnabled: true,
      formFields: [
        { id: "f_name", label: "Full Name", type: "text" as const, required: true, placeholder: "Enter your full name" },
        { id: "f_email", label: "Email", type: "email" as const, required: true, placeholder: "Enter your email" },
        { id: "f_phone", label: "Phone", type: "phone" as const, required: false, placeholder: "Enter your phone number" },
      ],
      highlights: product.pricingModels
        ? ["Lifetime access", "Certificate on completion", "Expert-led content", "Community access", "Hands-on projects"]
        : ["Access to all materials", "Certificate on completion", "Community access"],
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
          <p className="text-muted-foreground">This page doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // ─── Payment Page Layout ───
  if (template.layout === "payment-page" && template.checkout) {
    return (
      <div className="min-h-screen bg-white">
        <PaymentPageView
          template={template}
          checkout={template.checkout}
          onBack={() => navigate("/")}
        />
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
    const { display: priceDisplay, num: priceNum } = getProductPrice(product);
    const productDesc = product.description || product.desc || `Comprehensive ${product.title} program designed to take you from beginner to professional.`;
    const isEducation = template.category === "education" || product.type === "course";

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 space-y-8 max-w-4xl">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setCurrentView("site"); setSelectedProduct(-1); }}>
            <ArrowLeft className="h-4 w-4" /> Back
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
              <p className="text-muted-foreground leading-relaxed">{productDesc}</p>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400">★</span>)}
                </div>
                <span className="text-sm font-medium text-foreground">4.9</span>
                <span className="text-xs text-muted-foreground">(2,340 ratings)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">{priceDisplay}</span>
                {priceNum > 0 && <span className="text-lg text-muted-foreground line-through">₹{Math.round(priceNum * 1.5).toLocaleString("en-IN")}</span>}
              </div>

              <Button size="lg" className="w-full text-base py-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => setCurrentView("checkout")}>
                {isEducation ? `Enroll Now — ${priceDisplay}` : `Buy Now — ${priceDisplay}`}
              </Button>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>🔒 Secure payment</span>
                <span>🏆 Certificate included</span>
                <span>♾️ Lifetime access</span>
              </div>
            </div>
          </div>

          {productCheckout?.highlights && (
            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">What's Included</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {productCheckout.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span className="text-sm text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEducation && (
            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Course Overview</h3>
              <div className="space-y-3">
                {[
                  { module: "Module 1: Getting Started", lessons: 5, duration: "3 hrs" },
                  { module: "Module 2: Core Concepts", lessons: 8, duration: "5 hrs" },
                  { module: "Module 3: Hands-on Projects", lessons: 6, duration: "8 hrs" },
                  { module: "Module 4: Advanced Topics", lessons: 7, duration: "6 hrs" },
                  { module: "Module 5: Capstone & Certification", lessons: 4, duration: "4 hrs" },
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
              {isEducation ? `Enroll Now — ${priceDisplay}` : `Buy Now — ${priceDisplay}`}
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
