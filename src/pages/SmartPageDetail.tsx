import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ExternalLink, Eye, BarChart3, CreditCard,
  TrendingUp, TrendingDown, Globe, Pencil, IndianRupee,
  CheckCircle2, XCircle, AlertCircle, Search,
} from "lucide-react";
import { getStoredSites } from "./WebsiteBuilder";
import { templates } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import WebinarLandingPreview from "@/components/WebinarLandingPreview";
import CoachingLandingPreview from "@/components/CoachingLandingPreview";
import CourseLandingPreview from "@/components/CourseLandingPreview";
import type { WebinarData } from "@/types/smartPages";
import type { CoachingData } from "./CoachingCreate";
import type { CourseData } from "./CourseCreate";
import { toast } from "sonner";
import { pageTypeLabels, pageTypeColors } from "@/types/smartPages";

const mockTransactions = [
  { id: "txn_1a2b3c", customer: "Aarav Sharma", amount: 4999, date: "25 Feb 2026, 2:15 PM", method: "UPI", status: "Success" },
  { id: "txn_4d5e6f", customer: "Priya Patel", amount: 2999, date: "22 Feb 2026, 11:30 AM", method: "Card", status: "Success" },
  { id: "txn_7g8h9i", customer: "Rahul Kumar", amount: 4999, date: "20 Feb 2026, 4:45 PM", method: "UPI", status: "Refunded" },
  { id: "txn_0j1k2l", customer: "Sneha Gupta", amount: 1999, date: "18 Feb 2026, 9:00 AM", method: "Netbanking", status: "Success" },
  { id: "txn_3m4n5o", customer: "Vikram Singh", amount: 4999, date: "15 Feb 2026, 6:20 PM", method: "Card", status: "Success" },
  { id: "txn_6p7q8r", customer: "Meera Joshi", amount: 2999, date: "12 Feb 2026, 1:10 PM", method: "UPI", status: "Failed" },
];

const statusIcon = (status: string) => {
  switch (status) {
    case "Success": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "Failed": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "Refunded": return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    default: return null;
  }
};

const SmartPageDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const site = useMemo(() => {
    const sites = getStoredSites();
    return sites.find((s) => s.id === id) || null;
  }, [id]);

  useEffect(() => {
    if (!site) navigate("/website-builder", { replace: true });
  }, [site, navigate]);

  if (!site) return null;

  const conversionRate = site.views > 0 ? ((site.conversions / site.views) * 100).toFixed(1) : "0";
  const totalRevenue = mockTransactions.filter(t => t.status === "Success").reduce((a, t) => a + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground truncate">{site.name}</h1>
              <span className={site.status === "Published" ? "blade-badge-paid" : "blade-badge-expired"}>{site.status}</span>
              {site.pageType && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pageTypeColors[site.pageType]}`}>
                  {pageTypeLabels[site.pageType]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{site.type}</span>
              <span>•</span>
              <span>Created {site.created}</span>
              {site.url !== "—" && site.status === "Published" && (
                <>
                  <span>•</span>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">{site.url} <ExternalLink className="h-3 w-3" /></a>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/website-builder/editor?id=${site.id}`)}>
              <Pencil className="h-3.5 w-3.5" /> Edit Page
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => { if (site.url && site.url !== "—") window.open(site.url, "_blank"); }}>
              <Eye className="h-3.5 w-3.5" /> View Live
            </Button>
          </div>
        </div>

        {/* ─── Overview ─── */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Page Views", value: site.views.toLocaleString(), icon: Eye, trend: "+12.3%", up: true },
              { label: "Conversions", value: site.conversions.toLocaleString(), icon: CheckCircle2, trend: "+8.1%", up: true },
              { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, trend: "+15.7%", up: true },
              { label: "Conv. Rate", value: `${conversionRate}%`, icon: TrendingUp, trend: "-2.1%", up: false },
            ].map((s) => (
              <div key={s.label} className="blade-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${s.up ? "text-emerald-600" : "text-destructive"}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.trend} vs last month
                </div>
              </div>
            ))}
          </div>

          <div className="blade-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Site Preview</span>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate(`/website-builder/editor?id=${site.id}`)}>
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            </div>
            <div className="h-[480px] overflow-hidden relative bg-muted/30">
              {(() => {
                if (site.pageType === "webinar") {
                  try {
                    const stored = localStorage.getItem(`webinar_${site.id}`);
                    if (stored) {
                      const wd: WebinarData = JSON.parse(stored);
                      return (
                        <div className="origin-top-left absolute" style={{ width: 900, transform: "scale(0.73)", transformOrigin: "top left" }}>
                          <WebinarLandingPreview data={wd} />
                        </div>
                      );
                    }
                  } catch {}
                }
                if (site.pageType === "coaching") {
                  try {
                    const stored = localStorage.getItem(`coaching_${site.id}`);
                    if (stored) {
                      const cd: CoachingData = JSON.parse(stored);
                      return (
                        <div className="origin-top-left absolute" style={{ width: 900, transform: "scale(0.73)", transformOrigin: "top left" }}>
                          <CoachingLandingPreview data={cd} />
                        </div>
                      );
                    }
                  } catch {}
                }
                if (site.pageType === "course") {
                  try {
                    const stored = localStorage.getItem(`course_${site.id}`);
                    if (stored) {
                      const cd: CourseData = JSON.parse(stored);
                      return (
                        <div className="origin-top-left absolute" style={{ width: 1000, transform: "scale(0.66)", transformOrigin: "top left" }}>
                          <CourseLandingPreview data={cd} />
                        </div>
                      );
                    }
                  } catch {}
                }
                const t = templates.find(tpl => tpl.id === site.templateId || tpl.title.toLowerCase() === site.type.toLowerCase());
                return (
                  <div className="origin-top-left absolute" style={{ width: 1200, transform: "scale(0.55)", transformOrigin: "top left" }}>
                    {t ? <SitePreview template={t} sections={t.sections} compact /> : (
                      <div className="w-full h-96 flex items-center justify-center text-muted-foreground">
                        <Globe className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ─── Transactions ─── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{mockTransactions.length} transactions</p>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-9" />
            </div>
          </div>
          <div className="blade-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-5 py-3 text-left">Transaction ID</th>
                  <th className="blade-table-header px-5 py-3 text-left">Customer</th>
                  <th className="blade-table-header px-5 py-3 text-left">Amount</th>
                  <th className="blade-table-header px-5 py-3 text-left">Method</th>
                  <th className="blade-table-header px-5 py-3 text-left">Date</th>
                  <th className="blade-table-header px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-foreground">{t.id}</td>
                    <td className="px-5 py-3 text-foreground">{t.customer}</td>
                    <td className="px-5 py-3 font-medium text-foreground">₹{t.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.method}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{t.date}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5">
                        {statusIcon(t.status)}
                        <span className="text-xs">{t.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartPageDetail;
