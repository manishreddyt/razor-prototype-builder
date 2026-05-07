import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, Link2, GraduationCap, Calendar, ShoppingBag, Heart, Monitor, Smartphone, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const categories = [
  { label: "All Templates", icon: null, value: "all" },
  { label: "Education", icon: GraduationCap, value: "education" },
  { label: "Events", icon: Calendar, value: "events" },
  { label: "E-commerce", icon: ShoppingBag, value: "e-commerce" },
  { label: "Non-Profit", icon: Heart, value: "non-profit" },
];

const templates = [
  {
    title: "School / College Fee Collection",
    category: "Education",
    desc: "A streamlined fee collection page for schools, colleges, and educational institutions.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=600&fit=crop",
    features: ["Multi-fee structure", "Student ID lookup", "Installment plans", "Receipt generation"],
  },
  {
    title: "Online Course Fee Collection",
    category: "Education",
    desc: "An enrollment page for online courses, bootcamps, certification programs, and coaching classes.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop",
    features: ["Course curriculum", "Instructor bio", "Testimonials", "Payment plans"],
  },
  {
    title: "Coaching Session Booking",
    category: "Education",
    desc: "Book 1:1 coaching sessions, mentorship calls, or consulting appointments with integrated scheduling.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=600&fit=crop",
    features: ["Calendar integration", "Session packages", "Cancellation policy", "Zoom link auto-send"],
  },
  {
    title: "E-commerce Store",
    category: "E-commerce",
    desc: "A versatile product sale page for any online store — fashion, electronics, home décor, accessories, and more.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=600&fit=crop",
    features: ["Product gallery", "Size/color variants", "Inventory tracking", "Discount codes"],
  },
  {
    title: "Event Booking",
    category: "Events",
    desc: "A professional event registration page for conferences, workshops, seminars, meetups, and community gatherings.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop",
    features: ["Ticket tiers", "Attendee details", "Schedule display", "Early-bird pricing"],
  },
  {
    title: "Non-Profit Donation",
    category: "Non-Profit",
    desc: "A heartfelt donation collection page for NGOs, charities, social causes, and community projects.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=900&h=600&fit=crop",
    features: ["Donation tiers", "Impact stories", "Tax receipt (80G)", "Recurring donations"],
  },
];

type Template = typeof templates[0];

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileStep, setMobileStep] = useState<"details" | "payment">("details");

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category.toLowerCase() === activeCategory);

  const openPreview = (t: Template) => {
    setPreviewDevice("desktop");
    setMobileStep("details");
    setPreviewTemplate(t);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages/editor")} className="gap-2">
          <Link2 className="h-4 w-4" /> Skip & create blank
        </Button>
      </div>

      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Payment Page</h1>
          <p className="text-sm text-muted-foreground mt-1">Start from a template or create a blank page.</p>
        </div>

        {/* Category filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat.value
                    ? "border-primary text-primary bg-accent"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat.icon && <cat.icon className="h-3.5 w-3.5" />}
                {cat.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground flex-shrink-0">{filtered.length} templates</span>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div key={t.title} className="blade-card overflow-hidden group flex flex-col">
              <div className="h-44 overflow-hidden flex-shrink-0">
                <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t.category}</span>
                  <h3 className="font-semibold text-foreground text-sm mt-0.5">{t.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">{t.desc}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1" onClick={() => openPreview(t)}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs flex-1" onClick={() => navigate(`/payment-pages/editor?template=${encodeURIComponent(t.title)}`)}>
                    Use Template <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col [&>button]:z-50 [&>button]:bg-card [&>button]:border [&>button]:border-border [&>button]:rounded-full [&>button]:shadow-sm [&>button]:h-8 [&>button]:w-8 [&>button]:-top-3 [&>button]:-right-3">
          {/* Dialog header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
            <div>
              <h2 className="font-semibold text-foreground text-sm">{previewTemplate?.title}</h2>
              <p className="text-xs text-muted-foreground">{previewTemplate?.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 transition-colors ${previewDevice === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setPreviewDevice("mobile"); setMobileStep("details"); }}
                  className={`p-1.5 transition-colors ${previewDevice === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => { setPreviewTemplate(null); navigate(`/payment-pages/editor?template=${encodeURIComponent(previewTemplate!.title)}`); }}
              >
                Use Template <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Preview area */}
          <div className={`flex-1 overflow-auto ${previewDevice === "mobile" ? "bg-muted/30 flex items-start justify-center py-6" : "bg-background"}`}>
            {previewTemplate && (
              previewDevice === "desktop" ? (
                /* ── Desktop: full-width two-column ── */
                <div className="w-full bg-background min-h-full flex flex-col">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-secondary/60 border-b border-border flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="w-48 mx-auto bg-background rounded text-[10px] text-muted-foreground px-3 py-0.5 text-center">
                      rzp.io/l/payment-page
                    </div>
                  </div>
                  {/* Two-column layout */}
                  <div className="grid grid-cols-2 flex-1">
                    {/* Left — product details */}
                    <div className="border-r border-border overflow-y-auto">
                      <img src={previewTemplate.image} alt={previewTemplate.title} className="w-full h-52 object-cover" />
                      <div className="p-7 space-y-5">
                        <div>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{previewTemplate.category}</span>
                          <h2 className="text-xl font-bold text-foreground mt-1">{previewTemplate.title}</h2>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{previewTemplate.desc}</p>
                        </div>
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">What's included</p>
                          {previewTemplate.features.map((f) => (
                            <div key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary text-[10px] font-bold">✓</span>
                              </div>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Right — payment form */}
                    <div className="p-7 space-y-5 overflow-y-auto">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Payment Details</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Fill in your details to complete the payment</p>
                      </div>
                      <div className="space-y-4">
                        {["Full Name", "Email Address", "Phone Number"].map((label) => (
                          <div key={label} className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">{label}</label>
                            <div className="h-9 rounded-md border border-border bg-secondary/30 px-3 flex items-center">
                              <span className="text-xs text-muted-foreground/60">—</span>
                            </div>
                          </div>
                        ))}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-foreground">Amount</label>
                          <div className="h-9 rounded-md border border-primary bg-primary/5 px-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">Enter amount</span>
                            <span className="text-xs text-muted-foreground">INR</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">Pay via</p>
                        <div className="grid grid-cols-3 gap-2">
                          {["UPI", "Card", "Net Banking"].map((m) => (
                            <div key={m} className="h-8 rounded-md border border-border bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground font-medium">{m}</div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-1 space-y-2">
                        <div className="h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                          Proceed to Pay
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-[7px]">✓</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">100% secure · Powered by Razorpay</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Mobile: phone frame with two-step flow ── */
                <div className="w-[340px] bg-background rounded-[2.5rem] border-[5px] border-foreground/20 shadow-2xl overflow-hidden flex flex-col">
                  {/* Notch */}
                  <div className="bg-foreground/10 h-7 flex items-center justify-center flex-shrink-0">
                    <div className="w-20 h-1.5 rounded-full bg-foreground/30" />
                  </div>

                  <div className="overflow-y-auto flex-1" style={{ maxHeight: 620 }}>
                    {mobileStep === "details" ? (
                      /* Step 1 — product details */
                      <div>
                        <img src={previewTemplate.image} alt={previewTemplate.title} className="w-full h-48 object-cover" />
                        <div className="p-5 space-y-4">
                          <div>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{previewTemplate.category}</span>
                            <h2 className="text-base font-bold text-foreground mt-0.5">{previewTemplate.title}</h2>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{previewTemplate.desc}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">What's included</p>
                            {previewTemplate.features.map((f) => (
                              <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary text-[9px] font-bold">✓</span>
                                </div>
                                {f}
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 space-y-2">
                            <button
                              onClick={() => setMobileStep("payment")}
                              className="w-full h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-sm font-semibold gap-2"
                            >
                              Proceed to Pay <ArrowRight className="h-4 w-4" />
                            </button>
                            <p className="text-[9px] text-center text-muted-foreground">100% secure · Powered by Razorpay</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Step 2 — payment form */
                      <div className="p-5 space-y-4">
                        <button
                          onClick={() => setMobileStep("details")}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">Payment Details</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Fill in your details to complete</p>
                        </div>
                        <div className="space-y-3">
                          {["Full Name", "Email Address", "Phone Number"].map((label) => (
                            <div key={label} className="space-y-1">
                              <label className="text-[10px] font-medium text-foreground">{label}</label>
                              <div className="h-8 rounded-md border border-border bg-secondary/30 px-2.5 flex items-center">
                                <span className="text-[10px] text-muted-foreground/50">—</span>
                              </div>
                            </div>
                          ))}
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-foreground">Amount</label>
                            <div className="h-8 rounded-md border border-primary bg-primary/5 px-2.5 flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground">Enter amount</span>
                              <span className="text-[10px] text-muted-foreground">INR</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-medium text-foreground">Pay via</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["UPI", "Card", "Net Banking"].map((m) => (
                              <div key={m} className="h-7 rounded-md border border-border bg-secondary/30 flex items-center justify-center text-[10px] text-muted-foreground font-medium">{m}</div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 pt-1">
                          <div className="h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs font-semibold">
                            Proceed to Pay
                          </div>
                          <p className="text-[9px] text-center text-muted-foreground">100% secure · Powered by Razorpay</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Home bar */}
                  <div className="h-5 bg-background flex items-center justify-center flex-shrink-0">
                    <div className="w-24 h-1 rounded-full bg-foreground/20" />
                  </div>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePaymentPage;
