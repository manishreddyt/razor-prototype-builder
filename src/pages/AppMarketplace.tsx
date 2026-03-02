import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Layers,
  Box,
  MessageCircle,
  Mail,
  BarChart3,
  Zap,
} from "lucide-react";

const categories = ["All", "LMS", "Communication", "Email Marketing", "Analytics", "Automation"];

export interface MarketplaceApp {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  featured?: boolean;
}

export const marketplaceApps: MarketplaceApp[] = [
  {
    id: "course-graphy",
    name: "Course Graphy",
    category: "LMS",
    description: "Full course hosting platform with student management, certificates, and analytics.",
    icon: GraduationCap,
    iconBg: "bg-blue-100 text-blue-600",
    featured: true,
  },
  {
    id: "teachable",
    name: "Teachable",
    category: "LMS",
    description: "Create and sell beautiful online courses with built-in marketing tools.",
    icon: BookOpen,
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    id: "thinkific",
    name: "Thinkific",
    category: "LMS",
    description: "Build, market, and sell online courses and memberships from your own website.",
    icon: Layers,
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "podia",
    name: "Podia",
    category: "LMS",
    description: "All-in-one platform for courses, memberships, and digital downloads.",
    icon: Box,
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    category: "Communication",
    description: "Send student notifications, reminders, and updates via WhatsApp.",
    icon: MessageCircle,
    iconBg: "bg-green-100 text-green-600",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Email Marketing",
    description: "Email campaigns, automations, and audience management for your students.",
    icon: Mail,
    iconBg: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    category: "Analytics",
    description: "Track user behavior, page views, and conversions across your pages.",
    icon: BarChart3,
    iconBg: "bg-red-100 text-red-600",
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Automation",
    description: "Connect your apps and automate workflows without writing code.",
    icon: Zap,
    iconBg: "bg-amber-100 text-amber-600",
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

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover and install apps to supercharge your dashboard
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => {
            const isInstalled = installed.includes(app.id);
            return (
              <button
                key={app.id}
                onClick={() => navigate(`/app-marketplace/${app.id}`)}
                className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${app.iconBg}`}>
                    <app.icon className="h-5 w-5" />
                  </div>
                  {isInstalled && (
                    <Badge variant="secondary" className="text-[10px]">
                      Installed
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">{app.name}</h3>
                    {app.featured && (
                      <Badge className="text-[10px] bg-primary/10 text-primary border-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{app.category}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {app.description}
                </p>
                <div className="flex items-center text-xs text-primary font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View details <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
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
