import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Star, Download, Shield, Zap, TrendingUp } from "lucide-react";
import { marketplaceApps } from "./AppMarketplace";
import { useState } from "react";

interface AppFeatureDetail {
  features: string[];
  screenshots: { label: string; image?: string }[];
  pricing: string;
}

const appFeatures: Record<string, AppFeatureDetail> = {
  "course-graphy": {
    features: [
      "Create unlimited courses with modules & lessons",
      "Student enrollment & access management",
      "Progress tracking & completion certificates",
      "Built-in analytics dashboard",
      "Drip content scheduling",
      "Quiz & assignment builder",
    ],
    screenshots: [
      { label: "Course dashboard with analytics overview", image: "/images/graphy-dashboard.png" },
      { label: "Course builder with drag-and-drop modules", image: "/images/graphy-courses.png" },
      { label: "Student management with access controls", image: "/images/graphy-students.png" },
    ],
    pricing: "₹2,999/month or ₹29,990/year",
  },
  "lovable-ai": {
    features: [
      "Generate full-stack web apps with AI prompts",
      "React + Tailwind + TypeScript stack",
      "Real-time preview & editing",
      "One-click deploy to production",
      "Database & auth integration",
      "Custom domain support",
    ],
    screenshots: [
      { label: "AI chat interface for building apps" },
      { label: "Live code preview with hot reload" },
      { label: "Deploy & publish workflow" },
    ],
    pricing: "₹1,999/month or ₹19,990/year",
  },
  teachable: {
    features: ["Drag-and-drop course builder", "Custom landing pages", "Integrated payment processing", "Student quizzes"],
    screenshots: [{ label: "Course editor" }, { label: "Sales page builder" }],
    pricing: "₹3,499/month or ₹34,990/year",
  },
  thinkific: {
    features: ["White-label platform", "Community features", "Bulk student enrollment", "App integrations"],
    screenshots: [{ label: "Dashboard overview" }, { label: "Course catalog" }],
    pricing: "Free plan available, Pro at ₹3,499/month",
  },
  podia: {
    features: ["Courses + memberships + downloads", "Email marketing built-in", "Affiliate marketing", "Live chat"],
    screenshots: [{ label: "Product overview" }, { label: "Membership area" }],
    pricing: "Starts at ₹2,499/month",
  },
  "whatsapp-business": {
    features: ["Automated notifications", "Bulk messaging", "Template messages", "Chat support"],
    screenshots: [{ label: "Message templates" }, { label: "Chat dashboard" }],
    pricing: "Pay per message — starts at ₹0.50/msg",
  },
  mailchimp: {
    features: ["Email automation", "Audience segmentation", "A/B testing", "Landing pages"],
    screenshots: [{ label: "Campaign builder" }, { label: "Analytics" }],
    pricing: "Free up to 500 contacts",
  },
  "google-analytics": {
    features: ["Real-time tracking", "Conversion funnels", "Audience insights", "Custom reports"],
    screenshots: [{ label: "Traffic overview" }, { label: "Behavior flow" }],
    pricing: "Free",
  },
  zapier: {
    features: ["5,000+ app connections", "Multi-step workflows", "Filters & formatters", "Scheduled triggers"],
    screenshots: [{ label: "Workflow builder" }, { label: "App connections" }],
    pricing: "Free plan — 100 tasks/month",
  },
};

const AppDetail = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const app = marketplaceApps.find((a) => a.id === appId);
  const details = appFeatures[appId || ""] || { features: [], screenshots: [], pricing: "Contact for pricing" };

  const [installed, setInstalled] = useState<string[]>(
    JSON.parse(localStorage.getItem("marketplace-installed-apps") || "[]")
  );
  const isInstalled = installed.includes(appId || "");

  if (!app) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-muted-foreground">App not found.</div>
      </DashboardLayout>
    );
  }

  const handleInstall = () => {
    const updated = [...installed, app.id];
    localStorage.setItem("marketplace-installed-apps", JSON.stringify(updated));
    setInstalled(updated);
    toast({
      title: `${app.name} installed!`,
      description: "You can now access it from the sidebar.",
    });
    // Dispatch storage event so sidebar updates
    window.dispatchEvent(new Event("storage"));
  };

  const handleUninstall = () => {
    const updated = installed.filter((id) => id !== app.id);
    localStorage.setItem("marketplace-installed-apps", JSON.stringify(updated));
    setInstalled(updated);
    toast({ title: `${app.name} uninstalled.` });
    window.dispatchEvent(new Event("storage"));
  };

  const handleOpen = () => {
    if (app.id === "course-graphy") {
      navigate("/apps/course-graphy");
    } else {
      toast({ title: "Coming soon", description: `${app.name} app UI is not yet available.` });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate("/app-marketplace")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </button>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border bg-background">
            {app.logo ? (
              <img src={app.logo} alt={app.name} className="h-full w-full object-cover" />
            ) : (
              <div className={`h-full w-full flex items-center justify-center ${app.iconBg}`}>
                <app.icon className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{app.name}</h1>
              <Badge variant="outline">{app.category}</Badge>
              {app.featured && <Badge className="bg-primary/10 text-primary border-0">Featured</Badge>}
              {app.recommended && <Badge className="bg-primary/10 text-primary border-0">Recommended</Badge>}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{app.rating}</span>
              </div>
              <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {app.installs} installs</span>
              {app.pricing ? (
                <span className="font-medium text-primary">₹{app.pricing.monthly}/mo · ₹{app.pricing.yearly}/yr</span>
              ) : (
                <span className="font-medium text-primary">Free</span>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              {isInstalled ? (
                <>
                  <Button onClick={handleOpen}>Open App</Button>
                  <Button variant="outline" onClick={handleUninstall}>
                    Uninstall
                  </Button>
                </>
              ) : (
                <Button onClick={handleInstall}>
                  <Download className="h-4 w-4 mr-1" /> Install App
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Screenshots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {details.screenshots.map((shot, i) => (
              <div key={i} className="rounded-lg border overflow-hidden bg-muted">
                {shot.image ? (
                  <img src={shot.image} alt={shot.label} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-xs text-muted-foreground">
                    {shot.label}
                  </div>
                )}
                <div className="px-3 py-2 text-xs text-muted-foreground border-t">{shot.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features + Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="sm:col-span-2">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Features</h2>
              <ul className="space-y-2">
                {details.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Pricing</h2>
              <p className="text-sm text-muted-foreground">{details.pricing}</p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary" /> Secure & verified
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Instant setup
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppDetail;
