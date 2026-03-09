import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ChevronDown, ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";

// Extend window type for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Mock function to get published page data
const getPublishedPage = (slug: string) => {
  // In a real app, this would fetch from API/database
  const mockPages: Record<string, any> = {
    "event-booking": {
      title: "Tech Conference 2026",
      subtitle: "ANNUAL CONFERENCE",
      description: "Join industry leaders for 2 days of workshops, networking, and insights on the latest in technology.",
      bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop",
      logoInitial: "TC",
      amount: 2999,
      amountType: "fixed",
      buttonText: "Register Now",
      gstEnabled: true,
      formFields: [
        { id: "f1", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
        { id: "f2", label: "Email", type: "email", required: true, placeholder: "Enter your email" },
        { id: "f3", label: "Phone", type: "phone", required: true, placeholder: "Enter your phone number" },
        { id: "f4", label: "Company/Organization", type: "text", required: false, placeholder: "Enter your company name" },
      ],
      sections: {
        features: {
          visible: true,
          title: "What's Included",
          items: ["Full access to all sessions", "Networking opportunities", "Workshop materials", "Lunch & refreshments"],
        },
        testimonials: {
          visible: true,
          items: [
            { name: "Priya S.", text: "Best tech conference I've attended!", rating: 5 },
            { name: "Rahul M.", text: "Great speakers and networking.", rating: 5 },
          ],
        },
        faq: {
          visible: true,
          items: [
            { q: "What is included in the registration?", a: "Full access to all sessions, workshop materials, lunch, and networking events." },
            { q: "Can I get a refund?", a: "Yes, full refund up to 7 days before the event." },
          ],
        },
      },
    },
    "tuition-fee": {
      title: "Annual Tuition Fee — Academy",
      subtitle: "SCHOOL FEE",
      description: "Pay your annual tuition fee securely online. Available for all grades.",
      bannerImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=300&fit=crop",
      logoInitial: "A",
      amount: 25000,
      amountType: "fixed",
      buttonText: "Pay Tuition Fee",
      gstEnabled: false,
      formFields: [
        { id: "f1", label: "Student Name", type: "text", required: true, placeholder: "Enter student name" },
        { id: "f2", label: "Parent Email", type: "email", required: true, placeholder: "Enter parent email" },
        { id: "f3", label: "Student ID", type: "text", required: true, placeholder: "Enter student ID" },
        { id: "f4", label: "Grade/Class", type: "text", required: true, placeholder: "Enter grade" },
      ],
      sections: {
        features: { visible: false },
        testimonials: { visible: false },
        faq: {
          visible: true,
          items: [
            { q: "Can I pay in installments?", a: "Yes, please contact the school office for installment plans." },
            { q: "Is there a late payment fee?", a: "A 5% late fee applies after the due date." },
          ],
        },
      },
    },
  };

  return mockPages[slug] || null;
};

const PaymentPagePublic = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const pageData = getPublishedPage(slug || "");

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise<boolean>((resolve) => {
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

    loadRazorpayScript();
  }, []);

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">This payment page doesn't exist or has been unpublished.</p>
          <Button className="mt-4" onClick={() => navigate("/")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = pageData.formFields.filter(
      (field) => field.required && !formData[field.id]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.map((f) => f.label).join(", ")}`);
      return;
    }

    // Calculate final amount
    const finalAmount = pageData.amountType === "custom" && customAmount
      ? Number(customAmount)
      : pageData.amount;

    if (pageData.amountType === "custom" && (!customAmount || finalAmount <= 0)) {
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
      key: "rzp_live_SFFFdBjmPbTKZL", // Razorpay key
      amount: finalAmount * 100, // Amount in paise
      currency: pageData.currency || "INR",
      name: pageData.title,
      description: pageData.description?.slice(0, 100) || "Payment for " + pageData.title,
      image: pageData.bannerImage,
      handler: function (response: any) {
        console.log("Payment Success:", response);
        toast.success(pageData.successMessage || "Payment successful! 🎉", {
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        setProcessing(false);

        // Reset form
        setFormData({});
        setCustomAmount("");

        // Redirect if URL provided
        if (pageData.redirectUrl) {
          setTimeout(() => {
            window.location.href = pageData.redirectUrl;
          }, 2000);
        }
      },
      prefill: {
        name: formData.f1 || "", // Full Name field
        email: formData.f2 || "", // Email field
        contact: formData.f3 || "", // Phone field
      },
      notes: {
        ...formData,
        page_title: pageData.title,
        page_slug: pageData.slug,
        amount: finalAmount,
      },
      theme: {
        color: pageData.brandColor || "#0066FF",
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

  const finalAmount = pageData.amountType === "custom" && customAmount ? Number(customAmount) : pageData.amount;

  return (
    <div className="min-h-screen bg-background">
      {/* Dev Mode Banner */}
      <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-warning-foreground">
            <strong>Preview Mode</strong> — This is how customers see your page. Payments are simulated.
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="h-7 text-xs gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Banner */}
      {pageData.bannerImage && (
        <div className="h-52 overflow-hidden">
          <img src={pageData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left: Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {pageData.logoInitial}
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{pageData.subtitle}</span>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-foreground mb-3">{pageData.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{pageData.description}</p>
            </div>

            {/* Features */}
            {pageData.sections.features?.visible && (
              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{pageData.sections.features.title}</h2>
                <div className="space-y-3">
                  {pageData.sections.features.items.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {pageData.sections.testimonials?.visible && (
              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-bold text-foreground mb-4">What People Say</h2>
                <div className="space-y-4">
                  {pageData.sections.testimonials.items.map((t: any, i: number) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <span key={j} className="text-yellow-500">★</span>
                        ))}
                      </div>
                      <p className="text-sm text-foreground italic mb-2">"{t.text}"</p>
                      <p className="text-xs font-semibold text-muted-foreground">— {t.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {pageData.sections.faq?.visible && (
              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-bold text-foreground mb-4">FAQs</h2>
                <div className="space-y-3">
                  {pageData.sections.faq.items.map((faq: any, i: number) => (
                    <details key={i} className="group border border-border rounded-lg">
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-foreground">
                        {faq.q}
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="px-4 pb-3 text-sm text-muted-foreground">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Payment Form */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="blade-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Complete Payment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</label>
                  {pageData.amountType === "fixed" ? (
                    <div className="mt-2 text-3xl font-bold text-foreground">₹{pageData.amount.toLocaleString("en-IN")}</div>
                  ) : (
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="mt-2 text-lg font-bold"
                      required
                    />
                  )}
                </div>

                {/* Form Fields */}
                <div className="border-t border-border pt-4">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Your Details</label>
                  <div className="space-y-3">
                    {pageData.formFields.map((field: any) => (
                      <div key={field.id}>
                        <label className="text-sm text-foreground block mb-1">
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </label>
                        {field.type === "textarea" ? (
                          <Textarea
                            placeholder={field.placeholder}
                            value={formData[field.id] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            required={field.required}
                            rows={2}
                          />
                        ) : (
                          <Input
                            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* GST Breakdown */}
                {pageData.gstEnabled && (
                  <div className="bg-secondary/50 rounded-md p-3 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{Math.round(finalAmount / 1.18).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground mt-1">
                      <span>GST (18%)</span>
                      <span>₹{Math.round(finalAmount - finalAmount / 1.18).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2 mt-2">
                      <span>Total</span>
                      <span>₹{finalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full gap-2 h-11" disabled={processing}>
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {pageData.buttonText || `Pay ₹${finalAmount.toLocaleString("en-IN")}`}
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-muted-foreground">
                    Powered by <span className="font-semibold text-primary">Razorpay</span>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPagePublic;
