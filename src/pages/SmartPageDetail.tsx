import { useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, ExternalLink, Eye, Settings, BarChart3, Users, CreditCard,
  Mail, TrendingUp, TrendingDown, Calendar, Search, MoreHorizontal,
  Globe, Copy, Pencil, ArrowUpRight, Clock, IndianRupee, CheckCircle2,
  XCircle, AlertCircle, Send, ChevronRight, Upload, Video,
  Zap, Plus, Trash2, MessageCircle, Phone,
} from "lucide-react";
import { getStoredSites, type SmartPageSite } from "./WebsiteBuilder";
import { templates } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import WebinarLandingPreview from "@/components/WebinarLandingPreview";
import type { WebinarData } from "@/types/smartPages";
import { toast } from "sonner";
import {
  type Attendee, type Workflow, type WorkflowAction,
  defaultWorkflows, pageTypeLabels, pageTypeColors,
} from "@/types/smartPages";

// ─── Mock data ───

const mockCustomers = [
  { id: "c1", name: "Aarav Sharma", email: "aarav@example.com", amount: 4999, date: "25 Feb 2026", status: "Active", phone: "+91 98765 43210", experience: "Intermediate" },
  { id: "c2", name: "Priya Patel", email: "priya@example.com", amount: 2999, date: "22 Feb 2026", status: "Active", phone: "+91 87654 32109", experience: "Beginner" },
  { id: "c3", name: "Rahul Kumar", email: "rahul@example.com", amount: 4999, date: "20 Feb 2026", status: "Churned", phone: "+91 76543 21098", experience: "Advanced" },
  { id: "c4", name: "Sneha Gupta", email: "sneha@example.com", amount: 1999, date: "18 Feb 2026", status: "Active", phone: "+91 65432 10987", experience: "Beginner" },
  { id: "c5", name: "Vikram Singh", email: "vikram@example.com", amount: 4999, date: "15 Feb 2026", status: "Active", phone: "+91 54321 09876", experience: "Intermediate" },
  { id: "c6", name: "Meera Joshi", email: "meera@example.com", amount: 2999, date: "12 Feb 2026", status: "Active", phone: "+91 43210 98765", experience: "Advanced" },
];

const mockTransactions = [
  { id: "txn_1a2b3c", customer: "Aarav Sharma", amount: 4999, date: "25 Feb 2026, 2:15 PM", method: "UPI", status: "Success" },
  { id: "txn_4d5e6f", customer: "Priya Patel", amount: 2999, date: "22 Feb 2026, 11:30 AM", method: "Card", status: "Success" },
  { id: "txn_7g8h9i", customer: "Rahul Kumar", amount: 4999, date: "20 Feb 2026, 4:45 PM", method: "UPI", status: "Refunded" },
  { id: "txn_0j1k2l", customer: "Sneha Gupta", amount: 1999, date: "18 Feb 2026, 9:00 AM", method: "Netbanking", status: "Success" },
  { id: "txn_3m4n5o", customer: "Vikram Singh", amount: 4999, date: "15 Feb 2026, 6:20 PM", method: "Card", status: "Success" },
  { id: "txn_6p7q8r", customer: "Meera Joshi", amount: 2999, date: "12 Feb 2026, 1:10 PM", method: "UPI", status: "Failed" },
];

const mockCommunications = [
  { id: "em1", subject: "Welcome to Full Stack Bootcamp!", type: "Automated", sent: 342, opened: 289, clicked: 156, date: "25 Feb 2026" },
  { id: "em2", subject: "Week 1 Assignment Reminder", type: "Automated", sent: 320, opened: 264, clicked: 98, date: "22 Feb 2026" },
  { id: "em3", subject: "Early Bird Offer - 30% Off", type: "Campaign", sent: 1240, opened: 876, clicked: 342, date: "18 Feb 2026" },
  { id: "em4", subject: "New Module Released: React Advanced", type: "Automated", sent: 280, opened: 231, clicked: 178, date: "15 Feb 2026" },
  { id: "em5", subject: "February Newsletter", type: "Campaign", sent: 3420, opened: 1890, clicked: 456, date: "10 Feb 2026" },
];

const mockAttendees: Attendee[] = [
  { id: "att1", name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 98765 43210", registeredAt: "25 Feb 2026", attended: true, duration: "58 min", source: "zoom" },
  { id: "att2", name: "Priya Patel", email: "priya@example.com", registeredAt: "22 Feb 2026", attended: true, duration: "45 min", source: "zoom" },
  { id: "att3", name: "Rahul Kumar", email: "rahul@example.com", registeredAt: "20 Feb 2026", attended: false, source: "manual" },
  { id: "att4", name: "Sneha Gupta", email: "sneha@example.com", registeredAt: "18 Feb 2026", attended: true, duration: "60 min", source: "zoom" },
  { id: "att5", name: "Vikram Singh", email: "vikram@example.com", registeredAt: "15 Feb 2026", attended: false, source: "manual" },
];

const statusIcon = (status: string) => {
  switch (status) {
    case "Success": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "Failed": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "Refunded": return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    default: return null;
  }
};

const triggerLabels: Record<string, { icon: any; color: string }> = {
  on_registration: { icon: Users, color: "bg-blue-100 text-blue-700" },
  post_event: { icon: Calendar, color: "bg-purple-100 text-purple-700" },
  payment_success: { icon: CreditCard, color: "bg-emerald-100 text-emerald-700" },
  payment_failed: { icon: XCircle, color: "bg-red-100 text-red-700" },
};

const actionIcons: Record<string, any> = {
  send_email: Mail,
  send_whatsapp: MessageCircle,
  send_sms: Phone,
  enroll_course: CheckCircle2,
};

// ─── Mini thumbnail ───
const SiteThumbnail = ({ site }: { site: SmartPageSite }) => {
  const template = useMemo(() => {
    return templates.find(
      (t) => t.title.toLowerCase() === site.type.toLowerCase() || t.id === site.type || t.id === site.templateId
    );
  }, [site.type, site.templateId]);

  if (!template) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <Globe className="h-8 w-8 text-primary/30" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div className="origin-top-left absolute" style={{ width: 1200, transform: "scale(0.15)", transformOrigin: "top left" }}>
        <SitePreview template={template} sections={template.sections} />
      </div>
    </div>
  );
};

const SmartPageDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const site = useMemo(() => {
    const sites = getStoredSites();
    return sites.find((s) => s.id === id) || null;
  }, [id]);

  const isWebinar = site?.pageType === "webinar" || site?.type?.toLowerCase() === "webinar";

  if (!site) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Site not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/website-builder")}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const conversionRate = site.views > 0 ? ((site.conversions / site.views) * 100).toFixed(1) : "0";
  const totalRevenue = mockTransactions.filter(t => t.status === "Success").reduce((a, t) => a + t.amount, 0);
  const attendedCount = attendees.filter(a => a.attended).length;

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) { toast.error("Invalid CSV file"); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes("name"));
      const emailIdx = headers.findIndex(h => h.includes("email"));
      const attendedIdx = headers.findIndex(h => h.includes("attended") || h.includes("present"));

      const newAttendees: Attendee[] = lines.slice(1).map((line, i) => {
        const cols = line.split(",").map(c => c.trim());
        return {
          id: `csv_${Date.now()}_${i}`,
          name: cols[nameIdx] || `Attendee ${i + 1}`,
          email: cols[emailIdx] || "",
          registeredAt: "Imported",
          attended: attendedIdx >= 0 ? cols[attendedIdx]?.toLowerCase() === "yes" : true,
          source: "csv" as const,
        };
      });
      setAttendees(prev => [...prev, ...newAttendees]);
      toast.success(`${newAttendees.length} attendees imported from CSV`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleWorkflow = (wfId: string) => {
    setWorkflows(wfs => wfs.map(w => w.id === wfId ? { ...w, enabled: !w.enabled } : w));
  };

  const toggleAction = (wfId: string, actionId: string) => {
    setWorkflows(wfs => wfs.map(w => {
      if (w.id !== wfId) return w;
      return { ...w, actions: w.actions.map(a => a.id === actionId ? { ...a, enabled: !a.enabled } : a) };
    }));
  };

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
              <Pencil className="h-3.5 w-3.5" /> Edit Site
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => { if (site.url && site.url !== "—") window.open(site.url, "_blank"); }}>
              <Eye className="h-3.5 w-3.5" /> View Live
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="customers" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Customers</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
            {isWebinar && (
              <TabsTrigger value="attendees" className="gap-1.5 text-xs"><Video className="h-3.5 w-3.5" /> Attendees</TabsTrigger>
            )}
            <TabsTrigger value="workflows" className="gap-1.5 text-xs"><Zap className="h-3.5 w-3.5" /> Workflows</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
            <TabsTrigger value="communications" className="gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" /> Communications</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
          </TabsList>

          {/* ─── Overview ─── */}
          <TabsContent value="overview" className="space-y-6 mt-4">
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

            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2 blade-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Site Preview</span>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate(`/website-builder/editor?id=${site.id}`)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                </div>
                <div className="h-72 overflow-hidden relative bg-muted/30">
                  {(() => {
                    // For webinar pages, render the actual WebinarLandingPreview
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
                    const t = templates.find(tpl => tpl.id === site.templateId || tpl.title.toLowerCase() === site.type.toLowerCase());
                    return (
                      <div className="origin-top-left absolute" style={{ width: 1200, transform: "scale(0.55)", transformOrigin: "top left" }}>
                        {t ? <SitePreview template={t} sections={t.sections} /> : (
                          <div className="w-full h-96 flex items-center justify-center text-muted-foreground">
                            <Globe className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="blade-card">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium text-foreground">Recent Activity</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { text: "New signup from Aarav Sharma", time: "2 hours ago", icon: Users },
                    { text: "Payment received ₹4,999", time: "5 hours ago", icon: IndianRupee },
                    { text: "Welcome email sent", time: "5 hours ago", icon: Send },
                    { text: "Page visited from Google", time: "8 hours ago", icon: Globe },
                    { text: "New signup from Priya Patel", time: "1 day ago", icon: Users },
                    { text: "Payment received ₹2,999", time: "1 day ago", icon: IndianRupee },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1.5 rounded-md bg-secondary">
                        <a.icon className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{a.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── Customers ─── */}
          <TabsContent value="customers" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{mockCustomers.length} customers</p>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search customers..." className="pl-9" />
              </div>
            </div>
            <div className="blade-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="blade-table-header px-5 py-3 text-left">Customer</th>
                    <th className="blade-table-header px-5 py-3 text-left">Email</th>
                    <th className="blade-table-header px-5 py-3 text-left">Phone</th>
                    <th className="blade-table-header px-5 py-3 text-left">Amount Paid</th>
                    <th className="blade-table-header px-5 py-3 text-left">Joined</th>
                    <th className="blade-table-header px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCustomers.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{c.phone}</td>
                      <td className="px-5 py-3 text-foreground">₹{c.amount.toLocaleString()}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.date}</td>
                      <td className="px-5 py-3">
                        <span className={c.status === "Active" ? "blade-badge-paid" : "blade-badge-expired"}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ─── Transactions ─── */}
          <TabsContent value="transactions" className="space-y-4 mt-4">
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
          </TabsContent>

          {/* ─── Attendees (webinar only) ─── */}
          {isWebinar && (
            <TabsContent value="attendees" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">{attendees.length} registrants • {attendedCount} attended</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">{attendedCount} present</span>
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-xs text-muted-foreground">{attendees.length - attendedCount} absent</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Fetching from Zoom... (mock)")}>
                    <Video className="h-3.5 w-3.5" /> Import from Zoom
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Upload CSV
                  </Button>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {attendees.length > 0 ? `${((attendedCount / attendees.length) * 100).toFixed(0)}%` : "—"}
                  </p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Avg. Duration</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">52 min</p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Data Source</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">Zoom + CSV</p>
                </div>
              </div>

              <div className="blade-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="blade-table-header px-5 py-3 text-left">Name</th>
                      <th className="blade-table-header px-5 py-3 text-left">Email</th>
                      <th className="blade-table-header px-5 py-3 text-left">Registered</th>
                      <th className="blade-table-header px-5 py-3 text-left">Attended</th>
                      <th className="blade-table-header px-5 py-3 text-left">Duration</th>
                      <th className="blade-table-header px-5 py-3 text-left">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-foreground">{a.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{a.email}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{a.registeredAt}</td>
                        <td className="px-5 py-3">
                          {a.attended ? (
                            <span className="flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Present
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-destructive">
                              <XCircle className="h-3.5 w-3.5" /> Absent
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{a.duration || "—"}</td>
                        <td className="px-5 py-3">
                          <Badge variant="secondary" className="text-[10px] capitalize">{a.source}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          )}

          {/* ─── Workflows ─── */}
          <TabsContent value="workflows" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Automation Workflows</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Define triggers and actions to automate your merchant operations.</p>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => toast.info("Workflow builder coming soon!")}>
                <Plus className="h-3.5 w-3.5" /> New Workflow
              </Button>
            </div>

            <div className="space-y-4">
              {workflows.map((wf) => {
                const triggerMeta = triggerLabels[wf.trigger.type];
                const TriggerIcon = triggerMeta?.icon || Zap;
                return (
                  <div
                    key={wf.id}
                    className={`blade-card p-5 transition-all ${wf.enabled ? "border-primary/20" : "opacity-60"}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${triggerMeta?.color || "bg-secondary text-foreground"}`}>
                          <TriggerIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{wf.name}</p>
                          <p className="text-xs text-muted-foreground">Trigger: {wf.trigger.label}</p>
                        </div>
                      </div>
                      <Switch checked={wf.enabled} onCheckedChange={() => toggleWorkflow(wf.id)} />
                    </div>

                    {/* Trigger → Actions chain */}
                    <div className="ml-5 border-l-2 border-border pl-5 space-y-3">
                      {wf.actions.map((action) => {
                        const ActionIcon = actionIcons[action.type] || Zap;
                        const isComingSoon = action.type === "send_whatsapp" || action.type === "send_sms";
                        return (
                          <div
                            key={action.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              action.enabled ? "border-border bg-secondary/30" : "border-border/50 bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <ActionIcon className={`h-4 w-4 ${action.enabled ? "text-foreground" : "text-muted-foreground"}`} />
                              <div>
                                <p className={`text-sm ${action.enabled ? "text-foreground" : "text-muted-foreground"}`}>{action.label}</p>
                                {isComingSoon && (
                                  <span className="text-[10px] text-amber-600 font-medium">Coming Soon</span>
                                )}
                              </div>
                            </div>
                            <Switch
                              checked={action.enabled}
                              onCheckedChange={() => toggleAction(wf.id, action.id)}
                              disabled={isComingSoon}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ─── Analytics ─── */}
          <TabsContent value="analytics" className="space-y-5 mt-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Avg. Time on Page", value: "3m 42s", change: "+18s", up: true },
                { label: "Bounce Rate", value: "34.2%", change: "-2.8%", up: true },
                { label: "Top Source", value: "Google", change: "62% of traffic", up: true },
              ].map((s) => (
                <div key={s.label} className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{s.value}</p>
                  <p className={`text-xs mt-1 ${s.up ? "text-emerald-600" : "text-destructive"}`}>{s.change}</p>
                </div>
              ))}
            </div>

            <div className="blade-card p-5">
              <h3 className="text-sm font-medium text-foreground mb-4">Traffic by Source</h3>
              <div className="space-y-3">
                {[
                  { source: "Google Search", pct: 62 },
                  { source: "Direct", pct: 18 },
                  { source: "Social Media", pct: 12 },
                  { source: "Referral", pct: 5 },
                  { source: "Email", pct: 3 },
                ].map((s) => (
                  <div key={s.source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{s.source}</span>
                      <span className="text-muted-foreground">{s.pct}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="blade-card p-5">
              <h3 className="text-sm font-medium text-foreground mb-4">Top Pages</h3>
              <div className="space-y-2">
                {[
                  { page: "/", views: 4250, bounce: "28%" },
                  { page: "/pricing", views: 1890, bounce: "22%" },
                  { page: "/curriculum", views: 1560, bounce: "35%" },
                  { page: "/enroll", views: 980, bounce: "18%" },
                  { page: "/faq", views: 620, bounce: "42%" },
                ].map((p) => (
                  <div key={p.page} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground font-mono">{p.page}</span>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span>{p.views.toLocaleString()} views</span>
                      <span>{p.bounce} bounce</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ─── Communications ─── */}
          <TabsContent value="communications" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{mockCommunications.length} emails sent</p>
              <Button size="sm" className="gap-1.5"><Send className="h-3.5 w-3.5" /> New Campaign</Button>
            </div>
            <div className="blade-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="blade-table-header px-5 py-3 text-left">Subject</th>
                    <th className="blade-table-header px-5 py-3 text-left">Type</th>
                    <th className="blade-table-header px-5 py-3 text-left">Sent</th>
                    <th className="blade-table-header px-5 py-3 text-left">Opened</th>
                    <th className="blade-table-header px-5 py-3 text-left">Clicked</th>
                    <th className="blade-table-header px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCommunications.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{e.subject}</td>
                      <td className="px-5 py-3">
                        <Badge variant={e.type === "Campaign" ? "default" : "secondary"} className="text-[10px]">{e.type}</Badge>
                      </td>
                      <td className="px-5 py-3 text-foreground">{e.sent}</td>
                      <td className="px-5 py-3 text-foreground">{e.opened} <span className="text-muted-foreground text-xs">({((e.opened / e.sent) * 100).toFixed(0)}%)</span></td>
                      <td className="px-5 py-3 text-foreground">{e.clicked} <span className="text-muted-foreground text-xs">({((e.clicked / e.sent) * 100).toFixed(0)}%)</span></td>
                      <td className="px-5 py-3 text-muted-foreground">{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ─── Settings ─── */}
          <TabsContent value="settings" className="space-y-5 mt-4">
            <div className="blade-card p-5 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">General Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Site Name</label>
                  <Input value={site.name} className="mt-1.5" readOnly />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Site Type</label>
                  <Input value={site.type} className="mt-1.5" readOnly />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Custom Domain</label>
                  <Input placeholder="e.g. courses.yourbrand.com" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Favicon URL</label>
                  <Input placeholder="https://..." className="mt-1.5" />
                </div>
              </div>
            </div>

            <div className="blade-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Meta Title</label>
                  <Input defaultValue={site.name} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Meta Description</label>
                  <Input defaultValue={`Welcome to ${site.name}. Get started today.`} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Open Graph Image URL</label>
                  <Input placeholder="https://..." className="mt-1.5" />
                </div>
              </div>
            </div>

            <div className="blade-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
              <div className="space-y-2">
                {["Google Analytics", "Facebook Pixel", "Custom Head Script"].map((label) => (
                  <div key={label}>
                    <label className="text-xs font-medium text-foreground">{label}</label>
                    <Input placeholder={`Paste ${label.toLowerCase()} code...`} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="gap-1.5"><CheckCircle2 className="h-4 w-4" /> Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SmartPageDetail;
