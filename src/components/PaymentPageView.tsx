import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Shield, CreditCard, Star, Lock, Sparkles, ArrowLeft, Download, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { type CheckoutConfig, type TemplateData } from "@/data/smartPageTemplates";

interface PaymentPageViewProps {
  template: TemplateData;
  checkout: CheckoutConfig;
  editable?: boolean;
  onUpdateCheckout?: (updates: Partial<CheckoutConfig>) => void;
  onBack?: () => void;
}

interface PaidState {
  paymentId: string;
  amount: number;
  name: string;
  email: string;
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const PaymentPageView = ({
  template,
  checkout,
  editable = false,
  onUpdateCheckout,
  onBack,
}: PaymentPageViewProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState<PaidState | null>(null);

  // Extract rich content from template sections for left column
  const testimonialsSection = template.sections.find((s) => s.type === "testimonials");
  const statsSection = template.sections.find((s) => s.type === "stats");
  const aboutSection = template.sections.find((s) => s.type === "about");

  const finalAmount =
    checkout.amountType === "custom" && formData._amount
      ? parseInt(formData._amount)
      : checkout.amount;

  const handlePayment = async () => {
    const missing = checkout.formFields.filter((f) => f.required && !formData[f.id]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    if (checkout.amountType === "custom" && (!formData._amount || finalAmount <= 0)) {
      toast.error("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    await loadRazorpayScript();

    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment gateway not loaded. Please refresh.");
      setProcessing(false);
      return;
    }

    const options = {
      key: "rzp_live_SFFFdBjmPbTKZL",
      amount: finalAmount * 100,
      currency: checkout.currency || "INR",
      name: template.heroTitle,
      description: template.heroDescription?.slice(0, 100) || "",
      handler: (response: any) => {
        setProcessing(false);
        setPaid({
          paymentId: response.razorpay_payment_id,
          amount: finalAmount,
          name: formData.f_name || "",
          email: formData.f_email || "",
        });
      },
      prefill: {
        name: formData.f_name || "",
        email: formData.f_email || "",
        contact: formData.f_phone || "",
      },
      notes: { ...formData, product: template.heroTitle },
      theme: { color: "#0066FF" },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled");
          setProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      toast.error("Payment failed!", { description: response.error.description });
      setProcessing(false);
    });
    rzp.open();
  };

  const categoryLabel = template.category === "education"
    ? "Online Course"
    : template.category === "services"
      ? "Professional Service"
      : template.category === "ecommerce"
        ? "Product"
        : "Payment";

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Minimal nav */}
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-2">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {template.heroTitle.charAt(0)}
            </div>
            <span className="font-semibold text-sm text-gray-900 hidden sm:block">
              {template.heroTitle.split(" ").slice(0, 4).join(" ")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Secured by Razorpay
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">

        {/* ── LEFT: Content ── */}
        <div className="space-y-8">

          {/* Hero */}
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="h-3 w-3" />
              {categoryLabel}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {template.heroTitle}
            </h1>
            {template.heroTagline && (
              <p className="text-base font-medium text-primary">{template.heroTagline}</p>
            )}
            <p className="text-gray-600 leading-relaxed max-w-xl">
              {template.heroDescription}
            </p>
          </div>

          {/* Stats row */}
          {statsSection?.data?.items && (
            <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100">
              {statsSection.data.items.map((item: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* What's Included */}
          {checkout.highlights.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">What's included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checkout.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-700">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructor / About */}
          {aboutSection?.data && (
            <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-5">
              {aboutSection.data.image && (
                <img
                  src={aboutSection.data.image}
                  alt={aboutSection.data.heading}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow"
                />
              )}
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {template.category === "education" ? "Your Instructor" : "Your Provider"}
                </p>
                <h3 className="text-base font-semibold text-gray-900">{aboutSection.data.heading}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{aboutSection.data.text}</p>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {testimonialsSection?.data?.items?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">What people say</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {testimonialsSection.data.items.slice(0, 4).map((t: any, i: number) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: t.rating || 5 }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">"{t.text}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {t.avatar || t.name?.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{t.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust footer */}
          <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              100% Secure Payment
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" />
              Razorpay Protected
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
              </div>
              4.9 / 5 rating
            </div>
            <span>7-day money-back guarantee</span>
          </div>
        </div>

        {/* ── RIGHT: Payment card (sticky) ── */}
        <div className="lg:sticky lg:top-20">
          {paid ? (
            /* ── Confirmation screen ── */
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Thank you{paid.name ? `, ${paid.name.split(" ")[0]}` : ""}! Your payment has been confirmed.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount paid</span>
                  <span className="font-semibold text-gray-900">₹{paid.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-xs text-gray-700 truncate max-w-[160px]">{paid.paymentId}</span>
                </div>
                {paid.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Receipt sent to</span>
                    <span className="text-gray-700 truncate max-w-[160px]">{paid.email}</span>
                  </div>
                )}
              </div>

              <div className="text-left space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What happens next</p>
                {[
                  "You'll receive a confirmation email within 5 minutes",
                  template.category === "education"
                    ? "Access to course materials will be activated immediately"
                    : "Our team will contact you within 24 hours to schedule",
                  "Check your spam folder if you don't see our email",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600">{step}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 gap-2 text-sm" onClick={() => {
                  navigator.clipboard.writeText(paid.paymentId);
                  toast.success("Payment ID copied!");
                }}>
                  <Download className="h-4 w-4" />
                  Copy Receipt ID
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-sm" onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `Payment for ${template.heroTitle}`, text: `Payment ID: ${paid.paymentId}` });
                  } else {
                    navigator.clipboard.writeText(`Payment for ${template.heroTitle} — ID: ${paid.paymentId}`);
                    toast.success("Copied to clipboard!");
                  }
                }}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              <p className="text-[11px] text-gray-400">
                Powered by <span className="font-semibold text-primary">Razorpay</span>
              </p>
            </div>
          ) : (
            /* ── Payment form card ── */
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              {/* Card header with price */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 pt-6 pb-5 border-b border-gray-100">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {checkout.amountType === "fixed" ? "Price" : "Pay what you want"}
                </p>
                {checkout.amountType === "fixed" ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{checkout.amount.toLocaleString("en-IN")}
                    </span>
                    {checkout.gstEnabled && (
                      <span className="text-xs text-gray-500">incl. 18% GST</span>
                    )}
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="Enter amount (₹)"
                    className="text-2xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 h-auto"
                    value={formData._amount || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, _amount: e.target.value }))}
                  />
                )}
                {checkout.gstEnabled && checkout.amountType === "fixed" && (
                  <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{Math.round(checkout.amount / 1.18).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{Math.round(checkout.amount - checkout.amount / 1.18).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-700 border-t border-gray-200 pt-1 mt-1">
                      <span>Total</span>
                      <span>₹{checkout.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form fields */}
              <div className="px-6 py-5 space-y-4">
                {checkout.formFields.map((field) => (
                  <div key={field.id}>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <Textarea
                        placeholder={field.placeholder}
                        rows={3}
                        value={formData[field.id] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.id]: e.target.value }))}
                        className="text-sm resize-none"
                      />
                    ) : field.type === "select" && field.options ? (
                      <Select
                        value={formData[field.id] || ""}
                        onValueChange={(v) => setFormData((p) => ({ ...p, [field.id]: v }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={field.placeholder}
                        type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "number" ? "number" : "text"}
                        value={formData[field.id] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.id]: e.target.value }))}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}

                <Button
                  className="w-full h-12 gap-2 text-base font-semibold mt-2 shadow-md shadow-primary/20"
                  onClick={handlePayment}
                  disabled={processing || editable}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {checkout.buttonText || `Pay ₹${checkout.amount.toLocaleString("en-IN")}`}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-emerald-500" /> Secure</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> UPI / Cards / Wallets</span>
                  <span>•</span>
                  <span>7-day refund</span>
                </div>

                <p className="text-center text-[11px] text-gray-400 pt-1">
                  Powered by <span className="font-semibold text-primary">Razorpay</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPageView;
