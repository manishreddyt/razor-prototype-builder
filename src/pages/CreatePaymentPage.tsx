import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Eye, Link2, GraduationCap, Calendar, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    desc: "A versatile product sale page for any online store — fashion, electronics, home décor, accessories, and...",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
  },
  {
    title: "Event Booking",
    category: "Events",
    categoryColor: "text-primary",
    desc: "A professional event registration page for conferences, workshops, seminars, meetups,...",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
  },
  {
    title: "School / College Fee Collection",
    category: "Education",
    categoryColor: "text-primary",
    desc: "A streamlined fee collection page for schools, colleges, and educational institutions. Collect tuitio...",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
  },
  {
    title: "Online Course Fee Collection",
    category: "Education",
    categoryColor: "text-primary",
    desc: "An enrollment page for online courses, bootcamps, certification programs, coaching classes, and skill-...",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
  },
  {
    title: "Non-Profit Donation",
    category: "Non-Profit",
    categoryColor: "text-pink-600",
    desc: "A heartfelt donation collection page for NGOs, charities, social causes, relief funds, and communit...",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=250&fit=crop",
  },
];

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [aiPrompt, setAiPrompt] = useState("");

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category.toLowerCase() === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages/editor")} className="gap-2">
          <Link2 className="h-4 w-4" />
          Skip & create
        </Button>
      </div>

      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Payment Page</h1>
          <p className="text-sm text-muted-foreground mt-1">Build with AI, start from a template, or create a simple payment link.</p>
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
              placeholder="e.g. 'Music workshop enrollment with session timings'"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              size="sm"
              className="rounded-full gap-1"
              onClick={() => navigate("/payment-pages/editor")}
            >
              Generate
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
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
                    ? "border-primary text-primary bg-[hsl(var(--primary)/0.05)]"
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
              <div className="h-44 overflow-hidden">
                <img
                  src={t.image}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                  <span className={`text-xs font-semibold ${t.categoryColor}`}>{t.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.desc}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => navigate("/payment-pages/editor")}
                  >
                    Use Template
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentPage;
