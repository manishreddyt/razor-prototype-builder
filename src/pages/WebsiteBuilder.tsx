import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Sparkles, Globe, FileText, Link2, Plus, ExternalLink, Eye, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const pageTypes = [
  {
    icon: Link2,
    title: "Profile / Biolink Page",
    desc: "Single link for all your courses, sessions, and social links. Perfect for Instagram bio.",
    example: "razorpay.me/creator-name",
  },
  {
    icon: FileText,
    title: "Landing Page",
    desc: "High-converting page for free trials and webinars with optional lead-capture forms.",
    example: "Free trial sign-up, webinar registration",
  },
  {
    icon: Globe,
    title: "Full Website",
    desc: "Multi-page site with course catalog, testimonials, enrollment, and payment integration.",
    example: "Complete creator portfolio with payments",
  },
];

const existingSites = [
  { name: "Full Stack Bootcamp — Landing", type: "Landing Page", url: "https://rzp.io/s/bootcamp", created: "10 Feb 2026", views: 1240, conversions: 342, status: "Published" },
  { name: "Creator Portfolio", type: "Full Website", url: "https://rzp.io/s/portfolio", created: "1 Feb 2026", views: 3420, conversions: 89, status: "Published" },
  { name: "Workshop Bio Link", type: "Biolink", url: "https://rzp.io/s/workshop", created: "15 Jan 2026", views: 890, conversions: 156, status: "Published" },
  { name: "Summer Course Page", type: "Landing Page", url: "—", created: "20 Feb 2026", views: 0, conversions: 0, status: "Draft" },
];

const statusClass: Record<string, string> = {
  Published: "blade-badge-paid",
  Draft: "blade-badge-expired",
};

const WebsiteBuilder = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [showGenerated, setShowGenerated] = useState(false);

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    setShowGenerated(true);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">AI Website Builder</h1>
            <span className="blade-badge-new">new</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Describe your offering in plain language — we auto-generate a polished page with copy, layout, and payment integration.
          </p>
        </div>

        {/* AI Input */}
        <div className="blade-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Generate with AI</h2>
          </div>
          <textarea
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe your course, workshop, or coaching service... e.g., 'I teach a 12-week full stack development bootcamp for beginners. ₹12,999 one-time or ₹2,999/month installments. Includes live sessions, recorded content, and 1:1 mentorship.'"
          />
          <div className="mt-3 flex justify-end">
            <Button className="gap-2" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              Generate Page
            </Button>
          </div>
        </div>

        {/* Page Types */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Choose a page type</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {pageTypes.map((pt) => (
              <button key={pt.title} className="blade-card p-5 text-left hover:bg-secondary/50 transition-colors group">
                <pt.icon className="h-5 w-5 text-primary mb-3" />
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{pt.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{pt.desc}</p>
                <p className="text-xs text-primary mt-3 font-medium">{pt.example}</p>
              </button>
            ))}
          </div>
        </div>

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
                <th className="blade-table-header px-5 py-3 text-left">Created</th>
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
                  <td className="px-5 py-3 text-muted-foreground">{site.created}</td>
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

      {/* Generated Site Dialog */}
      <Dialog open={showGenerated} onOpenChange={setShowGenerated}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>AI Generated Page Preview</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">AI Generated from your prompt</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4 italic">"{aiPrompt}"</p>
              
              {/* Mini preview */}
              <div className="bg-background rounded-md border border-border overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">Your Course Title</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">AI-generated description based on your prompt. Includes key selling points, pricing info, and enrollment CTA.</p>
                  <div className="flex gap-2">
                    <div className="h-8 bg-primary rounded-md flex-1 flex items-center justify-center text-primary-foreground text-xs font-medium">Enroll Now</div>
                    <div className="h-8 border border-border rounded-md flex-1 flex items-center justify-center text-xs text-muted-foreground">Learn More</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Custom Domain (Optional)</label>
              <Input placeholder="e.g. courses.yourdomain.com" className="mt-1.5" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowGenerated(false)}>Edit with AI Chat</Button>
              <Button className="flex-1 gap-1.5" onClick={() => { setShowGenerated(false); toast.success("Site published!"); }}>
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
