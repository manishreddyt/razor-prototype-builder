import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  GraduationCap,
  Heart,
  BookOpen,
  Layers,
  Box,
  MessageCircle,
  Mail,
  BarChart3,
  Zap,
  Star,
  Download,
  TrendingUp,
} from "lucide-react";

const categories = ["All", "LMS", "AI & Builder", "Communication", "Email Marketing", "Analytics", "Automation"];

export interface MarketplaceApp {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  logo?: string;
  featured?: boolean;
  recommended?: boolean;
  installs: string;
  rating: number;
  pricing?: { monthly: number; yearly: number } | null; // null = free
}

export const marketplaceApps: MarketplaceApp[] = [
  {
    id: "simple-lms",
    name: "Simple LMS",
    category: "LMS",
    description: "Full course hosting platform with student management, certificates, and analytics.",
    icon: GraduationCap,
    iconBg: "bg-blue-100 text-blue-600",
    featured: true,
    recommended: true,
    installs: "3,200+",
    rating: 4.8,
    pricing: { monthly: 2999, yearly: 29990 },
  },
  {
    id: "graphy",
    name: "Graphy",
    category: "LMS",
    description: "All-in-one creator platform. Sell courses, webinars, digital products & memberships with branded mobile app.",
    icon: GraduationCap,
    iconBg: "bg-indigo-100 text-indigo-600",
    featured: true,
    recommended: true,
    installs: "4,500+",
    rating: 4.7,
    pricing: { monthly: 4999, yearly: 49990 },
  },
  {
    id: "emergent",
    name: "Emergent",
    category: "AI & Builder",
    description: "Build full-stack web apps with AI. Generate landing pages, dashboards, and tools in minutes.",
    icon: Heart,
    iconBg: "bg-pink-100 text-pink-600",
    featured: true,
    recommended: true,
    installs: "5,800+",
    rating: 4.9,
    pricing: { monthly: 1999, yearly: 19990 },
  },
  {
    id: "teachable",
    name: "Teachable",
    category: "LMS",
    description: "Create and sell beautiful online courses with built-in marketing tools.",
    icon: BookOpen,
    iconBg: "bg-orange-100 text-orange-600",
    installs: "2,100+",
    rating: 4.6,
    pricing: { monthly: 3499, yearly: 34990 },
  },
  {
    id: "thinkific",
    name: "Thinkific",
    category: "LMS",
    description: "Build, market, and sell online courses and memberships from your own website.",
    icon: Layers,
    iconBg: "bg-emerald-100 text-emerald-600",
    recommended: true,
    installs: "1,800+",
    rating: 4.5,
    pricing: null,
  },
  {
    id: "podia",
    name: "Podia",
    category: "LMS",
    description: "All-in-one platform for courses, memberships, and digital downloads.",
    icon: Box,
    iconBg: "bg-purple-100 text-purple-600",
    installs: "950+",
    rating: 4.4,
    pricing: null,
  },
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    category: "Communication",
    description: "Send student notifications, reminders, and updates via WhatsApp.",
    icon: MessageCircle,
    iconBg: "bg-green-100 text-green-600",
    recommended: true,
    installs: "4,500+",
    rating: 4.7,
    pricing: null,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Email Marketing",
    description: "Email campaigns, automations, and audience management for your students.",
    icon: Mail,
    iconBg: "bg-yellow-100 text-yellow-600",
    installs: "3,800+",
    rating: 4.5,
    pricing: null,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    category: "Analytics",
    description: "Track user behavior, page views, and conversions across your pages.",
    icon: BarChart3,
    iconBg: "bg-red-100 text-red-600",
    installs: "6,200+",
    rating: 4.6,
    pricing: null,
  },
  {
    id: "zapier",
    name: "Zapier — Workflow Builder",
    category: "Automation",
    description: "Connect 6,000+ apps and build powerful automated workflows — no code required. Trigger Zaps from Razorpay events.",
    icon: Zap,
    iconBg: "bg-amber-100 text-amber-600",
    featured: true,
    recommended: true,
    installs: "2,900+",
    rating: 4.7,
    pricing: null,
  },
];

const AppMarketplace = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const installed: string[] = JSON.parse(localStorage.getItem("marketplace-installed-apps") || "[]");

  const filtered = marketplaceApps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Featured apps for hero section
  const featuredApps = marketplaceApps.filter((a) => a.featured);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">App Marketplace</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Discover powerful apps to automate your business, manage students, and grow your revenue — all from your dashboard.
            </p>
          </div>
          {/* Search */}
          <div className="relative max-w-md mt-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background/80 backdrop-blur-sm border-border/60"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Banner — only when "All" is selected */}
        {activeCategory === "All" && !search && featuredApps.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Featured Apps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredApps.map((app) => {
                const isInstalled = installed.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => navigate(`/app-marketplace/${app.id}`)}
                    className="group relative flex gap-4 rounded-2xl border bg-card p-5 text-left transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
                  >
                    <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border bg-background">
                      {app.logo ? (
                        <img src={app.logo} alt={app.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full flex items-center justify-center ${app.iconBg}`}>
                          <app.icon className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-foreground">{app.name}</h3>
                        {isInstalled && <Badge variant="secondary" className="text-[10px]">Installed</Badge>}
                        <Badge className="text-[10px] bg-primary/10 text-primary border-0">Featured</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{app.description}</p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-foreground">{app.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="h-3 w-3" /> {app.installs}
                        </span>
                        {app.pricing ? (
                          <span className="text-xs font-medium text-primary">₹{app.pricing.monthly}/mo</span>
                        ) : (
                          <span className="text-xs font-medium text-primary">Free</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All Apps Grid */}
        <div>
          {activeCategory === "All" && !search && (
            <h2 className="text-sm font-semibold text-foreground mb-3">All Apps</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app) => {
              const isInstalled = installed.includes(app.id);
              return (
                <button
                  key={app.id}
                  onClick={() => navigate(`/app-marketplace/${app.id}`)}
                  className="group relative flex flex-col rounded-xl border bg-card text-left transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* Card top bar */}
                  <div className="flex items-start gap-3.5 p-5 pb-3">
                    <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0 border bg-background">
                      {app.logo ? (
                        <img src={app.logo} alt={app.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full flex items-center justify-center ${app.iconBg}`}>
                          <app.icon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground">{app.name}</h3>
                        {isInstalled && <Badge variant="secondary" className="text-[9px] px-1.5">Installed</Badge>}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{app.category}</span>
                    </div>
                    {app.recommended && (
                      <Badge className="text-[9px] bg-primary/10 text-primary border-0 shrink-0">
                        Recommended
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed px-5 pb-3 flex-1 line-clamp-2">
                    {app.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-medium text-foreground">{app.rating}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <Download className="h-2.5 w-2.5" /> {app.installs}
                      </span>
                    </div>
                    {app.pricing ? (
                      <span className="text-[11px] font-semibold text-primary">₹{app.pricing.monthly}/mo</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-primary">Free</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No apps found matching your search.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AppMarketplace;
