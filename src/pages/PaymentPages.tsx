import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Sparkles } from "lucide-react";

const templates = [
  { title: "Online Course Sale", desc: "Sell courses with installment options, testimonials, and enrollment forms", category: "Course", color: "bg-accent" },
  { title: "Webinar Registration", desc: "Event page with countdown, speaker info, and payment integration", category: "Webinar", color: "bg-accent" },
  { title: "1:1 Coaching Booking", desc: "Slot booking page with pricing tiers and student intake forms", category: "Coaching", color: "bg-accent" },
];

const existingPages = [
  { title: "Full Stack Dev Bootcamp", views: 1240, conversions: 342, revenue: "₹44,51,658", status: "Live" },
  { title: "UI/UX Weekend Workshop", views: 856, conversions: 128, revenue: "₹10,87,872", status: "Live" },
  { title: "Data Science Free Trial", views: 2100, conversions: 0, revenue: "₹0", status: "Draft" },
];

const PaymentPages = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Payment Pages</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-assisted builder with education-specific templates</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            Create Page
          </button>
        </div>

        {/* Templates */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Education Templates</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {templates.map((t) => (
              <button key={t.title} className="blade-card p-5 text-left hover:bg-secondary/50 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="blade-badge-info">{t.category}</span>
                </div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Pages */}
        <div className="blade-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Your Pages</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="blade-table-header px-5 py-3 text-left">Page</th>
                <th className="blade-table-header px-5 py-3 text-left">Views</th>
                <th className="blade-table-header px-5 py-3 text-left">Conversions</th>
                <th className="blade-table-header px-5 py-3 text-left">Revenue</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {existingPages.map((p) => (
                <tr key={p.title} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary cursor-pointer hover:underline">{p.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.views.toLocaleString()}</td>
                  <td className="px-5 py-3 text-foreground">{p.conversions}</td>
                  <td className="px-5 py-3 text-foreground">{p.revenue}</td>
                  <td className="px-5 py-3">
                    <span className={p.status === "Live" ? "blade-badge-success" : "blade-badge-expired"}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPages;
