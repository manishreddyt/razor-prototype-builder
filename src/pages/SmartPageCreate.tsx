import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ArrowLeft, Sparkles, Search, Globe, GraduationCap, Briefcase, Heart,
  ShoppingBag, LayoutGrid, BookOpen, Video, UserCheck, Calendar, Users,
  Store, Gift, FileText, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Template = {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon: any;
  pages: string[];
};

const categories = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "general", label: "General", icon: Globe },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "nonprofit", label: "Non-Profit", icon: Heart },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
];

const templates: Template[] = [
  // General
  { id: "portfolio", title: "Personal Portfolio", desc: "Showcase your work, bio, and contact info.", category: "general", icon: Users, pages: ["Home", "About", "Portfolio", "Contact"] },
  { id: "business", title: "Business Website", desc: "Company website with services and team pages.", category: "general", icon: Briefcase, pages: ["Home", "About", "Services", "Team", "Contact"] },
  { id: "biolink", title: "Bio Link Page", desc: "Single-page link hub for social bios.", category: "general", icon: Globe, pages: ["Link Page"] },
  { id: "event", title: "Event Landing", desc: "Promote events with countdown and registration.", category: "general", icon: Calendar, pages: ["Home", "Schedule", "Speakers", "Register"] },

  // Education
  { id: "multi-course", title: "Online Courses (Multi)", desc: "Course catalog with multiple offerings, categories, and enrollment.", category: "education", icon: BookOpen, pages: ["Home", "Courses", "Course Detail", "Enroll", "About"] },
  { id: "single-course", title: "Single Online Course", desc: "Focused landing page for a single course with modules and pricing.", category: "education", icon: GraduationCap, pages: ["Home", "Curriculum", "Pricing", "Enroll", "FAQ"] },
  { id: "webinar", title: "Webinar", desc: "Webinar registration page with speaker bio, agenda, and countdown.", category: "education", icon: Video, pages: ["Home", "Agenda", "Register"] },
  { id: "coaching", title: "1:1 Coaching", desc: "Book personal coaching sessions with calendar and pricing.", category: "education", icon: UserCheck, pages: ["Home", "Services", "Book Session", "Testimonials", "Contact"] },
  { id: "workshop", title: "Workshop Series", desc: "Multi-session workshops with schedules and pricing tiers.", category: "education", icon: Calendar, pages: ["Home", "Workshops", "Schedule", "Enroll"] },
  { id: "membership", title: "Membership / Community", desc: "Gated community with membership tiers and content access.", category: "education", icon: Users, pages: ["Home", "Plans", "Content", "Join"] },

  // Services
  { id: "consulting", title: "Consulting Firm", desc: "Professional consulting with case studies and booking.", category: "services", icon: Briefcase, pages: ["Home", "Services", "Case Studies", "Book", "Contact"] },
  { id: "freelancer", title: "Freelancer Profile", desc: "Showcase skills, past work, and testimonials.", category: "services", icon: UserCheck, pages: ["Home", "Work", "Testimonials", "Hire Me"] },
  { id: "agency", title: "Creative Agency", desc: "Agency website with portfolio and client testimonials.", category: "services", icon: Store, pages: ["Home", "Work", "Team", "Clients", "Contact"] },

  // Non-Profit
  { id: "ngo", title: "NGO / Charity", desc: "Cause page with impact stories and donation collection.", category: "nonprofit", icon: Heart, pages: ["Home", "Our Cause", "Impact", "Donate", "Volunteer"] },
  { id: "fundraiser", title: "Fundraiser Campaign", desc: "Campaign page with progress bar and donate button.", category: "nonprofit", icon: Gift, pages: ["Campaign Page"] },

  // E-commerce
  { id: "store", title: "Online Store", desc: "Product catalog with cart and checkout.", category: "ecommerce", icon: ShoppingBag, pages: ["Home", "Products", "Product Detail", "Cart", "Checkout"] },
  { id: "digital", title: "Digital Products", desc: "Sell e-books, templates, presets with instant delivery.", category: "ecommerce", icon: FileText, pages: ["Home", "Products", "Download", "About"] },
];

const SmartPageCreate = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    navigate(`/website-builder/editor?prompt=${encodeURIComponent(aiPrompt)}`);
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(null);
    navigate(`/website-builder/editor?template=${encodeURIComponent(template.id)}&title=${encodeURIComponent(template.title)}&type=${encodeURIComponent(template.title)}`);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Create Smart Page</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Start from AI prompt or choose a template</p>
          </div>
        </div>

        {/* AI Prompt */}
        <div className="blade-card p-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Generate with AI</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Describe your business or offering and we'll generate a complete website.</p>
          <textarea
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 'I run a 12-week full stack bootcamp for beginners. ₹12,999 one-time. I need a website with course details, pricing, testimonials, and enrollment.'"
          />
          <div className="mt-3 flex justify-end">
            <Button className="gap-2" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" /> Generate Website
            </Button>
          </div>
        </div>

        {/* Category Tabs + Search */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className="blade-card p-5 text-left hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="h-28 rounded-md bg-gradient-to-br from-primary/10 via-secondary to-primary/5 mb-4 flex items-center justify-center border border-border">
                <t.icon className="h-8 w-8 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize whitespace-nowrap">
                  {t.category === "nonprofit" ? "Non-Profit" : t.category}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {t.pages.slice(0, 4).map((p) => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p}</span>
                ))}
                {t.pages.length > 4 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{t.pages.length - 4}</span>}
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No templates found.</p>
          </div>
        )}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedTemplate?.title}</DialogTitle></DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="h-40 rounded-md bg-gradient-to-br from-primary/15 via-secondary to-primary/5 flex items-center justify-center border border-border">
                <selectedTemplate.icon className="h-12 w-12 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground">{selectedTemplate.desc}</p>
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Included Pages</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.pages.map((p) => (
                    <span key={p} className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">{p}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
                <Button className="flex-1 gap-1.5" onClick={() => handleUseTemplate(selectedTemplate)}>
                  Use Template <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SmartPageCreate;
