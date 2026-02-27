import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { templates } from "@/data/smartPageTemplates";
import { SmartPageCheckout } from "@/components/SmartPageCheckout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, CheckCircle2, Users, Clock, BookOpen, Shield, Award } from "lucide-react";

const SmartPageProductDetail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const templateId = params.get("template") || "";
  const productIndex = parseInt(params.get("product") || "0", 10);
  const siteId = params.get("siteId") || "";

  const template = useMemo(() => templates.find((t) => t.id === templateId), [templateId]);

  // Find the product from template's products section
  const product = useMemo(() => {
    if (!template) return null;
    const productsSection = template.sections.find((s) => s.type === "products");
    if (!productsSection?.data?.items?.[productIndex]) return null;
    return productsSection.data.items[productIndex];
  }, [template, productIndex]);

  const [showCheckout, setShowCheckout] = useState(false);

  if (!template || !product) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Product not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const priceNum = parseInt(product.price?.replace(/[^0-9]/g, "") || "0", 10);

  // Build a checkout config from the product
  const productCheckout = template.checkout
    ? { ...template.checkout, amount: priceNum, buttonText: `Enroll Now — ${product.price}`, highlights: template.checkout.highlights }
    : {
        enabled: true, amount: priceNum, amountType: "fixed" as const, currency: "INR",
        buttonText: `Buy Now — ${product.price}`, successMessage: "Payment successful!",
        redirectUrl: "", collectAddress: false, sendReceipt: true, gstEnabled: true,
        formFields: [
          { id: "f_name", label: "Full Name", type: "text" as const, required: true, placeholder: "Enter your full name" },
          { id: "f_email", label: "Email", type: "email" as const, required: true, placeholder: "Enter your email" },
          { id: "f_phone", label: "Phone", type: "phone" as const, required: false, placeholder: "Enter your phone number" },
        ],
        highlights: ["Access to all course materials", "Certificate on completion", "Community access"],
      };

  if (showCheckout) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4" onClick={() => setShowCheckout(false)}>
            <ArrowLeft className="h-4 w-4" /> Back to details
          </Button>
          <SmartPageCheckout template={{ ...template, heroTitle: product.title, heroDescription: product.desc || template.heroDescription }} checkout={productCheckout} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Product Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <img src={product.image} alt={product.title} className="w-full h-80 object-cover" />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">{product.badge}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {product.badge && (
              <span className="inline-block text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{product.badge}</span>
            )}
            <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
            <p className="text-muted-foreground leading-relaxed">
              {product.desc || `Comprehensive ${product.title} program designed to take you from beginner to professional. Learn with hands-on projects, expert mentorship, and industry-recognized certification.`}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">4.9</span>
              <span className="text-xs text-muted-foreground">(2,340 ratings)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">{product.price}</span>
              <span className="text-lg text-muted-foreground line-through">₹{(priceNum * 1.5).toLocaleString()}</span>
              <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">33% off</span>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 2,340 enrolled</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 40+ hours</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> 12 modules</span>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <Button size="lg" className="flex-1 text-base py-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => setShowCheckout(true)}>
                {template.checkout?.buttonText || `Enroll Now — ${product.price}`}
              </Button>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> 7-day refund</span>
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Certificate included</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Lifetime access</span>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="blade-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">What's Included</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(productCheckout.highlights || []).map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum preview (if education) */}
        {template.category === "education" && (
          <div className="blade-card p-6">
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

        {/* Bottom CTA */}
        <div className="text-center pb-8">
          <Button size="lg" className="text-base px-12 py-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => setShowCheckout(true)}>
            {template.checkout?.buttonText || `Enroll Now — ${product.price}`}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Secure payment powered by Razorpay</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartPageProductDetail;
