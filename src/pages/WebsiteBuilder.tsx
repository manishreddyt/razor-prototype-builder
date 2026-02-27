import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Sparkles, Globe, ExternalLink, Eye, Settings, ArrowRight, Search, BookOpen, Users, ShoppingBag, Heart, LayoutGrid, GraduationCap, Video, UserCheck, Briefcase, Calendar, Store, Gift, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Template = {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon: any;
  pages: string[];
  preview: string;
};

const categories = [
  { id: "all", label: "All Templates", icon: LayoutGrid },
  { id: "general", label: "General", icon: Globe },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "nonprofit", label: "Non-Profit", icon: Heart },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
];

const templates: Template[] = [
  // General
  { id: "portfolio", title: "Personal Portfolio", desc: "Showcase your work, bio, and contact info with a clean personal site.", category: "general", icon: Users, pages: ["Home", "About", "Portfolio", "Contact"], preview: "Professional portfolio with project gallery" },
  { id: "business", title: "Business Website", desc: "Company website with services, team, and contact pages.", category: "general", icon: Briefcase, pages: ["Home", "About", "Services", "Team", "Contact"], preview: "Corporate site with service listings" },
  { id: "biolink", title: "Bio Link Page", desc: "Single-page link hub for social media bios.", category: "general", icon: Globe, pages: ["Link Page"], preview: "Link-in-bio with all your important links" },
  { id: "event", title: "Event Landing Page", desc: "Promote events with countdown, speakers, and registration.", category: "general", icon: Calendar, pages: ["Home", "Schedule", "Speakers", "Register"], preview: "Event page with registration form" },

  // Education
  { id: "multi-course", title: "Online Courses (Multi)", desc: "Course catalog with multiple offerings, categories, and enrollment.", category: "education", icon: BookOpen, pages: ["Home", "Courses", "Course Detail", "Enroll", "About"], preview: "Course marketplace with catalog" },
  { id: "single-course", title: "Single Online Course", desc: "Focused landing page for a single course with modules and pricing.", category: "education", icon: GraduationCap, pages: ["Home", "Curriculum", "Pricing", "Enroll", "FAQ"], preview: "High-converting single course page" },
  { id: "webinar", title: "Webinar", desc: "Webinar registration page with speaker bio, agenda, and countdown.", category: "education", icon: Video, pages: ["Home", "Agenda", "Register"], preview: "Webinar registration with countdown" },
  { id: "coaching", title: "1:1 Coaching", desc: "Book personal coaching sessions with calendar integration and pricing.", category: "education", icon: UserCheck, pages: ["Home", "Services", "Book Session", "Testimonials", "Contact"], preview: "Coaching page with booking" },
  { id: "workshop", title: "Workshop Series", desc: "Multi-session workshops with schedules, pricing tiers, and materials.", category: "education", icon: Calendar, pages: ["Home", "Workshops", "Schedule", "Enroll"], preview: "Workshop series with schedule" },
  { id: "membership", title: "Membership / Community", desc: "Gated community with membership tiers, content access, and forum.", category: "education", icon: Users, pages: ["Home", "Plans", "Content", "Join"], preview: "Membership site with tier pricing" },

  // Services
  { id: "consulting", title: "Consulting Firm", desc: "Professional consulting site with case studies and booking.", category: "services", icon: Briefcase, pages: ["Home", "Services", "Case Studies", "Book", "Contact"], preview: "Consulting site with case studies" },
  { id: "freelancer", title: "Freelancer Profile", desc: "Showcase skills, past work, testimonials, and contact form.", category: "services", icon: UserCheck, pages: ["Home", "Work", "Testimonials", "Hire Me"], preview: "Freelancer portfolio with hire CTA" },
  { id: "agency", title: "Creative Agency", desc: "Agency website with portfolio, team, and client testimonials.", category: "services", icon: Store, pages: ["Home", "Work", "Team", "Clients", "Contact"], preview: "Agency site with portfolio grid" },

  // Non-Profit
  { id: "ngo", title: "NGO / Charity", desc: "Cause page with impact stories, donation collection, and volunteer sign-up.", category: "nonprofit", icon: Heart, pages: ["Home", "Our Cause", "Impact", "Donate", "Volunteer"], preview: "Charity site with donation integration" },
  { id: "fundraiser", title: "Fundraiser Campaign", desc: "Single campaign page with progress bar, story, and donate button.", category: "nonprofit", icon: Gift, pages: ["Campaign Page"], preview: "Fundraiser with progress tracking" },

  // E-commerce
  { id: "store", title: "Online Store", desc: "Product catalog with cart, checkout, and order management.", category: "ecommerce", icon: ShoppingBag, pages: ["Home", "Products", "Product Detail", "Cart", "Checkout"], preview: "E-commerce store with product catalog" },
  { id: "digital", title: "Digital Products", desc: "Sell e-books, templates, presets with instant delivery.", category: "ecommerce", icon: FileText, pages: ["Home", "Products", "Download", "About"], preview: "Digital download store" },
];

const existingSites = [
  { name: "Full Stack Bootcamp", type: "Single Course", url: "https://rzp.io/s/bootcamp", created: "10 Feb 2026", views: 1240, conversions: 342, status: "Published" },
  { name: "Creator Portfolio", type: "Portfolio", url: "https://rzp.io/s/portfolio", created: "1 Feb 2026", views: 3420, conversions: 89, status: "Published" },
  { name: "Weekend Workshop", type: "Webinar", url: "https://rzp.io/s/workshop", created: "15 Jan 2026", views: 890, conversions: 156, status: "Published" },
  { name: "Summer Course Page", type: "Multi-Course", url: "—", created: "20 Feb 2026", views: 0, conversions: 0, status: "Draft" },
];

const statusClass: Record<string, string> = {
  Published: "blade-badge-paid",
  Draft: "blade-badge-expired",
};

const WebsiteBuilder = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showGenerated, setShowGenerated] = useState(false);

  const filtered = templates.filter((t) => {
    const matchCategory = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    setShowGenerated(true);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Smart Pages</h1>
            <span className="blade-badge-new">new</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build websites, landing pages, and storefronts for your business — powered by AI.
          </p>
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
            placeholder="e.g. 'I run a 12-week full stack bootcamp for beginners. ₹12,999 one-time. Includes live sessions, recorded content, and 1:1 mentorship. I need a website with course details, pricing, testimonials, and enrollment.'"
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
              {/* Mini preview strip */}
              <div className="h-28 rounded-md bg-gradient-to-br from-primary/10 via-secondary to-primary/5 mb-4 flex items-center justify-center border border-border">
                <t.icon className="h-8 w-8 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize whitespace-nowrap">{t.category === "nonprofit" ? "Non-Profit" : t.category}</span>
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
            <p className="text-sm">No templates found. Try a different category or search term.</p>
          </div>
        )}

        {/* Your Sites */}
        <div className="blade-card overflow-hidden">
          <div className="border-b border-border px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Your Sites</h2>
            <span className="text-sm text-muted-foreground">{existingSites.length} sites</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="blade-table-header px-5 py-3 text-left">Site Name</th>
                <th className="blade-table-header px-5 py-3 text-left">Type</th>
                <th className="blade-table-header px-5 py-3 text-left">URL</th>
                <th className="blade-table-header px-5 py-3 text-left">Views</th>
                <th className="blade-table-header px-5 py-3 text-left">Conversions</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
                <th className="blade-table-header px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingSites.map((site) => (
                <tr key={site.name} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{site.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{site.type}</td>
                  <td className="px-5 py-3">
                    {site.url !== "—" ? (
                      <span className="flex items-center gap-1 text-primary text-xs">
                        {site.url} <ExternalLink className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-foreground">{site.views.toLocaleString()}</td>
                  <td className="px-5 py-3 text-foreground">{site.conversions}</td>
                  <td className="px-5 py-3"><span className={statusClass[site.status] || "blade-badge"}>{site.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></button>
                      <button className="text-muted-foreground hover:text-primary"><Settings className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <div className="bg-secondary/50 rounded-md p-3">
                <p className="text-xs text-muted-foreground">{selectedTemplate.preview}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
                <Button className="flex-1 gap-1.5" onClick={() => { setSelectedTemplate(null); toast.success("Template selected! Redirecting to editor..."); }}>
                  Use Template <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Generated Dialog */}
      <Dialog open={showGenerated} onOpenChange={setShowGenerated}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>AI Generated Website Preview</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Generated from your prompt</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4 italic">"{aiPrompt}"</p>
              <div className="bg-background rounded-md border border-border overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">Your Website</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">AI-generated multi-page website with Home, About, and Contact pages. Includes payment integration and lead capture.</p>
                  <div className="flex gap-2">
                    <div className="h-8 bg-primary rounded-md flex-1 flex items-center justify-center text-primary-foreground text-xs font-medium">Get Started</div>
                    <div className="h-8 border border-border rounded-md flex-1 flex items-center justify-center text-xs text-muted-foreground">Learn More</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowGenerated(false)}>Customize in Editor</Button>
              <Button className="flex-1 gap-1.5" onClick={() => { setShowGenerated(false); toast.success("Website published!"); }}>
                Publish <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WebsiteBuilder;
