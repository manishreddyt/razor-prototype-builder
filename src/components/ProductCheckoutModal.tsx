import { useState, useEffect } from "react";
import { Product, PricingModel } from "@/types/products";
import { Lead } from "@/types/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Razorpay type is declared in src/types/razorpay.d.ts

interface ProductCheckoutModalProps {
  product: Product;
  pricingModel: PricingModel;
  siteId: string;
  siteName: string;
  onClose: () => void;
}

export const ProductCheckoutModal = ({
  product,
  pricingModel,
  siteId,
  siteName,
  onClose,
}: ProductCheckoutModalProps) => {
  const [step, setStep] = useState<"details" | "success">("details");
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    // Product-specific fields
    preferredDate: "",
    preferredTime: "",
    topic: "",
    company: "",
  });

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveLead = (paymentId: string) => {
    // Create lead record
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      websiteId: siteId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      interests: [product.id],
      source: "checkout",
      productId: product.id,
      metadata: {
        pricingModel: pricingModel.name,
        amount: pricingModel.price,
        paymentId: paymentId,
        ...formData,
      },
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // Save lead to localStorage
    try {
      const sitesKey = "website-builder-sites";
      const stored = localStorage.getItem(sitesKey);
      if (stored) {
        const sites = JSON.parse(stored);
        const siteIndex = sites.findIndex((s: any) => s.id === siteId);
        if (siteIndex >= 0) {
          if (!sites[siteIndex].leads) {
            sites[siteIndex].leads = [];
          }
          sites[siteIndex].leads.push(lead);
          localStorage.setItem(sitesKey, JSON.stringify(sites));
        }
      }
    } catch (error) {
      console.error("Failed to save lead:", error);
    }
  };

  const handleProceedToPay = async () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    setProcessing(true);

    // Razorpay checkout options
    const options = {
      key: "rzp_live_SFFFdBjmPbTKZL", // Replace with your Razorpay key
      amount: pricingModel.price * 100, // Amount in paise
      currency: pricingModel.currency || "INR",
      name: product.title,
      description: `${pricingModel.name} - ${product.description.slice(0, 100)}`,
      image: product.image,
      handler: function (response: any) {
        console.log("Payment Success:", response);

        // Save lead with payment ID
        saveLead(response.razorpay_payment_id);

        toast.success("Payment successful! 🎉", {
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });

        setProcessing(false);
        setStep("success");
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#3b82f6",
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
          toast.info("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold">
                {step === "details" && "Checkout"}
                {step === "success" && "Order Confirmed!"}
              </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Secure checkout powered by Razorpay
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Product Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
              <div>
                <div className="font-semibold">{product.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {product.description}
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-medium">{pricingModel.name}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{pricingModel.price.toLocaleString()}</span>
                </div>
              </div>
              {pricingModel.features.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Includes:</div>
                  <ul className="space-y-1 text-sm">
                    {pricingModel.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            {step === "details" && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  {/* Course-specific fields */}
                  {product.type === "online-course" && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-3">
                        We'll send your access details to the email above
                      </p>
                    </div>
                  )}

                  {/* Session-specific fields */}
                  {product.type === "1-1-session" && (
                    <>
                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium mb-3">Session Preferences</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="preferredDate">Preferred Date</Label>
                          <Input
                            id="preferredDate"
                            type="date"
                            value={formData.preferredDate}
                            onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferredTime">Preferred Time</Label>
                          <Input
                            id="preferredTime"
                            type="time"
                            value={formData.preferredTime}
                            onChange={(e) => handleInputChange("preferredTime", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="topic">What would you like to discuss?</Label>
                        <Textarea
                          id="topic"
                          value={formData.topic}
                          onChange={(e) => handleInputChange("topic", e.target.value)}
                          placeholder="Brief description of your goals or questions"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {/* Webinar-specific fields */}
                  {product.type === "webinar" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="Your company name"
                        />
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          You'll receive a confirmation email with the webinar join link
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  className="w-full h-12 text-base font-medium"
                  onClick={handleProceedToPay}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Proceed to Pay ₹${pricingModel.price.toLocaleString()}`
                  )}
                </Button>
              </>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {product.type === "online-course" && "Welcome to the Course!"}
                  {product.type === "1-1-session" && "Session Booked!"}
                  {product.type === "webinar" && "You're Registered!"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {product.type === "online-course" &&
                    "Access link has been sent to your email"}
                  {product.type === "1-1-session" &&
                    "Calendar invite sent. We'll confirm your preferred time within 24 hours"}
                  {product.type === "webinar" &&
                    "Confirmation email with join link has been sent"}
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg text-left">
                    <div className="text-sm text-muted-foreground mb-1">Confirmation sent to</div>
                    <div className="font-medium">{formData.email}</div>
                  </div>
                  <Button className="w-full" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
