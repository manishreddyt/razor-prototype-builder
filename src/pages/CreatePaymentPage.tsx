import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Eye, Link2, GraduationCap, Calendar, ShoppingBag, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const categories = [
  { label: "All Templates", icon: null, value: "all" },
  { label: "Education", icon: GraduationCap, value: "education" },
  { label: "Events", icon: Calendar, value: "events" },
  { label: "E-commerce", icon: ShoppingBag, value: "e-commerce" },
  { label: "Non-Profit", icon: Heart, value: "non-profit" },
];

const templates = [
  {
    title: "E-commerce Store",
    category: "E-commerce",
    categoryColor: "text-orange-600",
    desc: "A versatile product sale page for any online store — fashion, electronics, home décor, accessories, and more.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
    price: "₹1,999",
    features: ["Product gallery", "Size/color variants", "Inventory tracking", "Discount codes"],
  },
  {
    title: "Event Booking",
    category: "Events",
    categoryColor: "text-primary",
    desc: "A professional event registration page for conferences, workshops, seminars, meetups, and community gatherings.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
    price: "₹2,999",
    features: ["Ticket tiers", "Attendee details", "Schedule display", "Early-bird pricing"],
  },
  {
    title: "School / College Fee Collection",
    category: "Education",
    categoryColor: "text-primary",
    desc: "A streamlined fee collection page for schools, colleges, and educational institutions.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
    price: "₹25,000",
    features: ["Multi-fee structure", "Student ID lookup", "Installment plans", "Receipt generation"],
  },
  {
    title: "Online Course Fee Collection",
    category: "Education",
    categoryColor: "text-primary",
    desc: "An enrollment page for online courses, bootcamps, certification programs, and coaching classes.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
    price: "₹12,999",
    features: ["Course curriculum", "Instructor bio", "Testimonials", "Payment plans"],
  },
  {
    title: "Non-Profit Donation",
    category: "Non-Profit",
    categoryColor: "text-pink-600",
    desc: "A heartfelt donation collection page for NGOs, charities, social causes, and community projects.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=250&fit=crop",
    price: "Custom",
    features: ["Donation tiers", "Impact stories", "Tax receipt (80G)", "Recurring donations"],
  },
  {
    title: "Coaching Session Booking",
    category: "Education",
    categoryColor: "text-primary",
    desc: "Book 1:1 coaching sessions, mentorship calls, or consulting appointments with integrated scheduling.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
    price: "₹3,999",
    features: ["Calendar integration", "Session packages", "Cancellation policy", "Zoom link auto-send"],
  },
];

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [aiPrompt, setAiPrompt] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category.toLowerCase() === activeCategory);

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
          <p className="text-sm text-muted-foreground mt-1">Build with AI, start from a template, or create a blank page.</p>
        </div>

        {/* AI Builder */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Razorpay AI Builder
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aiPrompt.trim() && navigate(`/payment-pages/editor?prompt=${encodeURIComponent(aiPrompt)}`)}
              placeholder="e.g. 'Music workshop enrollment with session timings and early-bird pricing'"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              size="sm"
              className="rounded-full gap-1"
              onClick={() => aiPrompt.trim() && navigate(`/payment-pages/editor?prompt=${encodeURIComponent(aiPrompt)}`)}
            >
              Generate
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {["12-week bootcamp ₹12,999", "Photography workshop ₹2,999", "Coaching sessions ₹3,999/hr"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setAiPrompt(suggestion)}
                className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Or start from a template</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Category filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
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
          <span className="text-sm text-muted-foreground">{filtered.length} templates</span>
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
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setPreviewTemplate(t)}>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.title}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <img src={previewTemplate.image} alt={previewTemplate.title} className="w-full h-48 object-cover rounded-lg" />
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${previewTemplate.categoryColor}`}>{previewTemplate.category}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm font-semibold text-foreground">{previewTemplate.price}</span>
              </div>
              <p className="text-sm text-muted-foreground">{previewTemplate.desc}</p>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Included Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {previewTemplate.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Live Preview</h4>
                <div className="bg-background rounded-md border border-border overflow-hidden">
                  <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${previewTemplate.image})` }} />
                  <div className="p-4">
                    <h3 className="font-bold text-foreground text-sm">{previewTemplate.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{previewTemplate.desc}</p>
                    <div className="flex gap-2 mt-3">
                      <div className="h-8 bg-primary rounded-md flex-1 flex items-center justify-center text-primary-foreground text-xs font-medium">
                        Pay {previewTemplate.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setPreviewTemplate(null)}>Close</Button>
                <Button className="flex-1 gap-1.5" onClick={() => { setPreviewTemplate(null); navigate(`/payment-pages/editor?template=${encodeURIComponent(previewTemplate.title)}`); }}>
                  Use This Template <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePaymentPage;
