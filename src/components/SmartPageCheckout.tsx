import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Shield, CreditCard, Sparkles, Star, Lock } from "lucide-react";
import { toast } from "sonner";
import { type CheckoutConfig, type TemplateData } from "@/data/smartPageTemplates";

interface SmartPageCheckoutProps {
  template: TemplateData;
  checkout: CheckoutConfig;
  viewMode?: "desktop" | "mobile";
  editable?: boolean;
  onUpdateCheckout?: (updates: Partial<CheckoutConfig>) => void;
}

export const SmartPageCheckout = ({
  template,
  checkout,
  viewMode = "desktop",
  editable = false,
  onUpdateCheckout,
}: SmartPageCheckoutProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Validate required fields
    const missing = checkout.formFields.filter(
      (f) => f.required && !formData[f.id]?.trim()
    );
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    // Calculate final amount
    const finalAmount = checkout.amountType === "custom" && formData._amount
      ? parseInt(formData._amount)
      : checkout.amount;

    if (checkout.amountType === "custom" && (!formData._amount || finalAmount <= 0)) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if Razorpay is loaded
    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    setProcessing(true);

    // Razorpay checkout options
    const options = {
      key: "rzp_test_1234567890", // Test key - replace with actual key in production
      amount: finalAmount * 100, // Amount in paise
      currency: checkout.currency || "INR",
      name: template.heroTitle,
      description: template.heroDescription?.slice(0, 100) || "Payment for " + template.heroTitle,
      image: template.bannerImage,
      handler: function (response: any) {
        console.log("Payment Success:", response);
        toast.success(checkout.successMessage || "Payment successful! 🎉", {
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        setProcessing(false);

        // Reset form
        setFormData({});

        // Redirect if URL provided
        if (checkout.redirectUrl) {
          setTimeout(() => {
            window.location.href = checkout.redirectUrl!;
          }, 2000);
        }
      },
      prefill: {
        name: formData.f_name || "",
        email: formData.f_email || "",
        contact: formData.f_phone || "",
      },
      notes: {
        ...formData,
        product: template.heroTitle,
        category: template.category,
      },
      theme: {
        color: "#0066FF",
      },
      modal: {
        ondismiss: function () {
          console.log("Payment cancelled");
          toast.info("Payment cancelled");
          setProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response: any) {
      console.error("Payment Failed:", response.error);
      toast.error("Payment failed!", {
        description: response.error.description || "Please try again",
      });
      setProcessing(false);
    });

    rzp.open();
  };

  const isMobile = viewMode === "mobile";

  return (
    <div className="font-sans bg-background min-h-screen">
      {/* Banner */}
      <div className="relative">
        <img
          src={template.bannerImage}
          alt="Banner"
          className="w-full h-48 md:h-56 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=300&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className={`max-w-5xl mx-auto px-6 -mt-8 relative z-10 ${isMobile ? "flex flex-col" : "flex flex-col lg:flex-row"} gap-8 pb-12`}>
        {/* Left: Product Overview */}
        <div className="flex-1 min-w-0">
          {/* Logo + Category */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
              {template.heroTitle.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {template.heroTagline?.split("•")[0]?.trim() || template.category} —
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {template.heroTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-lg">
            {template.heroDescription}
          </p>

          {/* Highlights */}
          {checkout.highlights.length > 0 && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-base font-semibold text-foreground mb-1">
                What's Included
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Here's what you get with your purchase
              </p>
              <div className="space-y-3">
                {checkout.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Razorpay Protected</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span>4.9 rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Form */}
        <div className={`${isMobile ? "w-full" : "w-full lg:w-[400px]"} flex-shrink-0`}>
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-bold text-foreground mb-5">Payment Details</h3>

            <div className="space-y-4">
              {/* Amount Type */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount Type
                </label>
                {editable ? (
                  <Select
                    value={checkout.amountType}
                    onValueChange={(v) =>
                      onUpdateCheckout?.({ amountType: v as "fixed" | "custom" })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="custom">Custom Amount</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1.5 px-3 py-2 rounded-md border border-border bg-secondary/30 text-sm text-foreground">
                    {checkout.amountType === "fixed" ? "Fixed Amount" : "Custom Amount"}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </label>
                {checkout.amountType === "fixed" ? (
                  <div className="mt-1.5 text-3xl font-bold text-foreground">
                    ₹ {checkout.amount.toLocaleString("en-IN")}
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="mt-1.5 text-lg font-bold"
                    value={formData._amount || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, _amount: e.target.value }))
                    }
                  />
                )}
              </div>

              {/* Form Fields */}
              <div className="border-t border-border pt-4">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact Info
                </label>
                <div className="space-y-3 mt-3">
                  {checkout.formFields.map((field) => (
                    <div key={field.id}>
                      <label className="text-sm text-foreground">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-destructive">*</span>
                        )}
                      </label>
                      {field.type === "textarea" ? (
                        <Textarea
                          placeholder={field.placeholder}
                          className="mt-1"
                          rows={2}
                          value={formData[field.id] || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [field.id]: e.target.value,
                            }))
                          }
                        />
                      ) : field.type === "select" && field.options ? (
                        <Select
                          value={formData[field.id] || ""}
                          onValueChange={(v) =>
                            setFormData((prev) => ({ ...prev, [field.id]: v }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder={field.placeholder}
                          type={
                            field.type === "email"
                              ? "email"
                              : field.type === "phone"
                              ? "tel"
                              : field.type === "number"
                              ? "number"
                              : "text"
                          }
                          className="mt-1"
                          value={formData[field.id] || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [field.id]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GST Breakdown */}
              {checkout.gstEnabled && checkout.amountType === "fixed" && (
                <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      ₹{Math.round(checkout.amount / 1.18).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>GST (18%)</span>
                    <span>
                      ₹
                      {Math.round(
                        checkout.amount - checkout.amount / 1.18
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1 font-semibold text-foreground border-t border-border pt-1">
                    <span>Total</span>
                    <span>₹{checkout.amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <Button
                className="w-full mt-2 gap-2 h-11"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {checkout.buttonText ||
                      `Pay ₹${checkout.amount.toLocaleString("en-IN")}`}
                  </>
                )}
              </Button>

              {/* Powered by */}
              <div className="text-center pt-2">
                <span className="text-[10px] text-muted-foreground">
                  Powered by{" "}
                  <span className="font-semibold text-primary">Razorpay</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
