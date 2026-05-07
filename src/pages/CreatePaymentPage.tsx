import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, Link2, GraduationCap, Calendar, ShoppingBag, Heart, Monitor, Smartphone } from "lucide-react";
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
    categoryColor: "text-primary",
    desc: "A streamlined fee collection page for schools, colleges, and educational institutions.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=600&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=700&fit=crop",
    price: "₹25,000",
    features: ["Multi-fee structure", "Student ID lookup", "Installment plans", "Receipt generation"],
  },
  {
    title: "Online Course Fee Collection",
    category: "Education",
    categoryColor: "text-primary",
    desc: "An enrollment page for online courses, bootcamps, certification programs, and coaching classes.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=700&fit=crop",
    price: "₹12,999",
    features: ["Course curriculum", "Instructor bio", "Testimonials", "Payment plans"],
  },
  {
    title: "Coaching Session Booking",
    category: "Education",
    categoryColor: "text-primary",
    desc: "Book 1:1 coaching sessions, mentorship calls, or consulting appointments with integrated scheduling.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=600&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=700&fit=crop",
    price: "₹3,999",
    features: ["Calendar integration", "Session packages", "Cancellation policy", "Zoom link auto-send"],
  },
  {
    title: "E-commerce Store",
    category: "E-commerce",
    categoryColor: "text-orange-600",
    desc: "A versatile product sale page for any online store — fashion, electronics, home décor, accessories, and more.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=600&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=700&fit=crop",
    price: "₹1,999",
    features: ["Product gallery", "Size/color variants", "Inventory tracking", "Discount codes"],
  },
  {
    title: "Event Booking",
    category: "Events",
    categoryColor: "text-primary",
    desc: "A professional event registration page for conferences, workshops, seminars, meetups, and community gatherings.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=700&fit=crop",
    price: "₹2,999",
    features: ["Ticket tiers", "Attendee details", "Schedule display", "Early-bird pricing"],
  },
  {
    title: "Non-Profit Donation",
    category: "Non-Profit",
    categoryColor: "text-pink-600",
    desc: "A heartfelt donation collection page for NGOs, charities, social causes, and community projects.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=900&h=600&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=700&fit=crop",
    price: "Custom",
    features: ["Donation tiers", "Impact stories", "Tax receipt (80G)", "Recurring donations"],
  },
];

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category.toLowerCase() === activeCategory);

  const openPreview = (t: typeof templates[0]) => {
    setPreviewDevice("desktop");
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
            <div key={t.title} className="blade-card overflow-hidden group">
              <div className="h-44 overflow-hidden relative">
                <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2">
                  <span className="bg-background/90 text-foreground text-xs font-semibold px-2 py-1 rounded">{t.price}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                  <span className={`text-xs font-semibold ${t.categoryColor}`}>{t.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.desc}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => openPreview(t)}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs" onClick={() => navigate(`/payment-pages/editor?template=${encodeURIComponent(t.title)}`)}>
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
              <p className="text-xs text-muted-foreground">{previewTemplate?.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop / Mobile toggle */}
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 transition-colors ${previewDevice === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
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
          <div className="flex-1 bg-muted/30 overflow-auto flex items-start justify-center py-6 px-4">
            {previewTemplate && (
              previewDevice === "desktop" ? (
                <div className="w-full max-w-3xl bg-background rounded-xl border border-border shadow-lg overflow-hidden">
                  {/* Mock browser chrome */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/60 border-b border-border">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="flex-1 mx-3 bg-background rounded text-[10px] text-muted-foreground px-2 py-0.5 text-center truncate">
                      rzp.io/l/payment-page
                    </div>
                  </div>
                  {/* Page content mockup */}
                  <div>
                    <img src={previewTemplate.image} alt={previewTemplate.title} className="w-full object-cover" style={{ maxHeight: 480 }} />
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-foreground">{previewTemplate.title}</h2>
                          <p className="text-sm text-muted-foreground mt-1">{previewTemplate.desc}</p>
                        </div>
                        <span className="text-xl font-bold text-foreground ml-4 flex-shrink-0">{previewTemplate.price}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {previewTemplate.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-[9px] font-bold">✓</span>
                            </div>
                            {f}
                          </div>
                        ))}
                      </div>
                      <div className="pt-2">
                        <div className="h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold">
                          Pay {previewTemplate.price}
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-2">Secured by Razorpay</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[320px] bg-background rounded-[2rem] border-4 border-foreground/20 shadow-xl overflow-hidden flex flex-col">
                  {/* Mock phone notch */}
                  <div className="bg-foreground/10 h-6 flex items-center justify-center">
                    <div className="w-16 h-1.5 rounded-full bg-foreground/30" />
                  </div>
                  <div className="overflow-y-auto flex-1" style={{ maxHeight: 560 }}>
                    <img src={previewTemplate.mobileImage} alt={previewTemplate.title} className="w-full object-cover h-48" />
                    <div className="p-4 space-y-3">
                      <div>
                        <h2 className="text-base font-bold text-foreground">{previewTemplate.title}</h2>
                        <p className="text-xs text-muted-foreground mt-1">{previewTemplate.desc}</p>
                      </div>
                      <span className="text-lg font-bold text-foreground block">{previewTemplate.price}</span>
                      <div className="space-y-1.5">
                        {previewTemplate.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                            <span className="text-primary font-bold">✓</span>
                            {f}
                          </div>
                        ))}
                      </div>
                      <div className="h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        Pay {previewTemplate.price}
                      </div>
                      <p className="text-[10px] text-center text-muted-foreground">Secured by Razorpay</p>
                    </div>
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
