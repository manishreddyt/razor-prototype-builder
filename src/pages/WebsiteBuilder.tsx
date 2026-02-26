import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Sparkles, Globe, FileText, Link2 } from "lucide-react";

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

const WebsiteBuilder = () => {
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
            placeholder="Describe your course, workshop, or coaching service... e.g., 'I teach a 12-week full stack development bootcamp for beginners. ₹12,999 one-time or ₹2,999/month installments. Includes live sessions, recorded content, and 1:1 mentorship.'"
          />
          <div className="mt-3 flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <Sparkles className="h-4 w-4" />
              Generate Page
            </button>
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

        {/* Recent Sites */}
        <div className="blade-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Your Sites</h2>
          </div>
          <div className="p-8 text-center text-muted-foreground text-sm">
            No sites created yet. Use AI or pick a template to get started.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WebsiteBuilder;
