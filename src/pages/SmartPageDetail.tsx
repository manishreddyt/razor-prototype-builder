import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, ExternalLink, Eye, Settings, BarChart3, Users, CreditCard,
  Mail, TrendingUp, TrendingDown, Calendar, Search, MoreHorizontal,
  Globe, Copy, Pencil, ArrowUpRight, Clock, IndianRupee, CheckCircle2,
  XCircle, AlertCircle, Send, ChevronRight, Upload, Video,
  Zap, Plus, Trash2, MessageCircle, Phone, Check, GraduationCap, Package,
  Download, Filter, ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { getStoredSites, type SmartPageSite } from "./WebsiteBuilder";
import { templates } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import WebinarLandingPreview from "@/components/WebinarLandingPreview";
import CoachingLandingPreview from "@/components/CoachingLandingPreview";
import CourseLandingPreview from "@/components/CourseLandingPreview";
import type { WebinarData } from "@/types/smartPages";
import type { CoachingData } from "./CoachingCreate";
import type { CourseData, CourseStudent } from "./CourseCreate";
import { toast } from "sonner";
import {
  type Attendee, type Workflow, type WorkflowAction,
  defaultWorkflows, pageTypeLabels, pageTypeColors,
} from "@/types/smartPages";
import { Order, OrderStatus } from "@/types/orders";
import { getOrders } from "@/lib/orderStorage";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";

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

const mockBookings = [
  { id: "bk1", clientName: "Aarav Sharma", clientEmail: "aarav@example.com", clientPhone: "+91 98765 43210", sessionDate: "2026-03-05", sessionTime: "10:00", status: "confirmed" as const, paymentStatus: "paid" as const, amount: 2999, bookedAt: "25 Feb 2026", meetingLink: "https://meet.google.com/abc-defg-hij" },
  { id: "bk2", clientName: "Priya Patel", clientEmail: "priya@example.com", sessionDate: "2026-03-07", sessionTime: "14:00", status: "confirmed" as const, paymentStatus: "paid" as const, amount: 2999, bookedAt: "22 Feb 2026" },
  { id: "bk3", clientName: "Rahul Kumar", clientEmail: "rahul@example.com", sessionDate: "2026-03-10", sessionTime: "11:00", status: "completed" as const, paymentStatus: "paid" as const, amount: 2999, bookedAt: "20 Feb 2026" },
  { id: "bk4", clientName: "Sneha Gupta", clientEmail: "sneha@example.com", sessionDate: "2026-03-12", sessionTime: "16:00", status: "confirmed" as const, paymentStatus: "pending" as const, amount: 2999, bookedAt: "18 Feb 2026" },
  { id: "bk5", clientName: "Vikram Singh", clientEmail: "vikram@example.com", sessionDate: "2026-02-28", sessionTime: "09:00", status: "cancelled" as const, paymentStatus: "paid" as const, amount: 2999, bookedAt: "15 Feb 2026" },
];

const mockStudents: CourseStudent[] = [
  { id: "std1", name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 98765 43210", enrolledAt: "25 Feb 2026", progress: 85, status: "active", paymentStatus: "paid", amount: 4999 },
  { id: "std2", name: "Priya Patel", email: "priya@example.com", phone: "+91 87654 32109", enrolledAt: "22 Feb 2026", progress: 62, status: "active", paymentStatus: "paid", amount: 4999 },
  { id: "std3", name: "Rahul Kumar", email: "rahul@example.com", phone: "+91 76543 21098", enrolledAt: "20 Feb 2026", progress: 100, status: "completed", paymentStatus: "paid", amount: 4999 },
  { id: "std4", name: "Sneha Gupta", email: "sneha@example.com", phone: "+91 65432 10987", enrolledAt: "18 Feb 2026", progress: 45, status: "active", paymentStatus: "paid", amount: 4999 },
  { id: "std5", name: "Vikram Singh", email: "vikram@example.com", phone: "+91 54321 09876", enrolledAt: "15 Feb 2026", progress: 30, status: "active", paymentStatus: "paid", amount: 4999 },
  { id: "std6", name: "Meera Joshi", email: "meera@example.com", phone: "+91 43210 98765", enrolledAt: "12 Feb 2026", progress: 15, status: "active", paymentStatus: "pending", amount: 4999 },
  { id: "std7", name: "Arjun Nair", email: "arjun@example.com", phone: "+91 32109 87654", enrolledAt: "10 Feb 2026", progress: 5, status: "dropped", paymentStatus: "paid", amount: 4999 },
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
        <SitePreview template={template} sections={template.sections} compact />
      </div>
    </div>
  );
};

const SmartPageDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [bookings, setBookings] = useState(mockBookings);
  const [students, setStudents] = useState<CourseStudent[]>(mockStudents);
  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]); // ISO date strings
  const [holidays, setHolidays] = useState<{ date: string; reason: string }[]>([
    { date: "2026-03-15", reason: "Personal day" },
    { date: "2026-04-01", reason: "Conference" },
  ]);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayReason, setNewHolidayReason] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const site = useMemo(() => {
    const sites = getStoredSites();
    return sites.find((s) => s.id === id) || null;
  }, [id]);

  const isWebinar = site?.pageType === "webinar" || site?.type?.toLowerCase() === "webinar";
  const isCoaching = site?.pageType === "coaching" || site?.type?.toLowerCase() === "coaching" || site?.type?.toLowerCase().includes("1:1") || site?.type?.toLowerCase().includes("session") || site?.templateId === "coaching";
  const isCourse = site?.pageType === "course" || site?.type?.toLowerCase() === "course";
  const isEcommerce = site?.category === "ecommerce";

  // Load orders for e-commerce sites
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Load orders when site changes
  useEffect(() => {
    if (isEcommerce && site) {
      const siteOrders = getOrders(site.id);
      setOrders(siteOrders);
    }
  }, [isEcommerce, site]);

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
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
              navigate(`/website-builder/editor?id=${site.id}`);
            }}>
              <Pencil className="h-3.5 w-3.5" /> Edit Page
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
            <TabsTrigger value="transactions" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
            {isWebinar && (
              <TabsTrigger value="attendees" className="gap-1.5 text-xs"><Video className="h-3.5 w-3.5" /> Attendees</TabsTrigger>
            )}
            {isCoaching && (
              <>
                <TabsTrigger value="bookings" className="gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" /> Bookings</TabsTrigger>
                <TabsTrigger value="availability" className="gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" /> Availability</TabsTrigger>
              </>
            )}
            {isCourse && (
              <>
                <TabsTrigger value="students" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Students</TabsTrigger>
                <TabsTrigger value="curriculum" className="gap-1.5 text-xs"><GraduationCap className="h-3.5 w-3.5" /> Curriculum</TabsTrigger>
              </>
            )}
            {isEcommerce && (
              <TabsTrigger value="orders" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" /> Orders</TabsTrigger>
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

            <div className="blade-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Site Preview</span>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => {
                    navigate(`/website-builder/editor?id=${site.id}`);
                  }}>
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

          {/* ─── Bookings (coaching only) ─── */}
          {isCoaching && (
            <TabsContent value="bookings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {bookings.length} total bookings • {bookings.filter(b => b.status === "confirmed").length} upcoming
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">{bookings.filter(b => b.status === "confirmed").length} confirmed</span>
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-muted-foreground">{bookings.filter(b => b.status === "completed").length} completed</span>
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-xs text-muted-foreground">{bookings.filter(b => b.status === "cancelled").length} cancelled</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Manual booking coming soon!")}>
                    <Plus className="h-3.5 w-3.5" /> Add Booking
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {bookings.length > 0 ? `${((bookings.filter(b => b.status === "completed").length / bookings.length) * 100).toFixed(0)}%` : "—"}
                  </p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Avg. Session Revenue</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">₹{bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length).toLocaleString() : "—"}</p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{bookings.length}</p>
                </div>
              </div>

              <div className="blade-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="blade-table-header px-5 py-3 text-left">Client</th>
                      <th className="blade-table-header px-5 py-3 text-left">Session Date</th>
                      <th className="blade-table-header px-5 py-3 text-left">Time</th>
                      <th className="blade-table-header px-5 py-3 text-left">Amount</th>
                      <th className="blade-table-header px-5 py-3 text-left">Status</th>
                      <th className="blade-table-header px-5 py-3 text-left">Payment</th>
                      <th className="blade-table-header px-5 py-3 text-left">Meeting Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">{b.clientName}</p>
                          <p className="text-xs text-muted-foreground">{b.clientEmail}</p>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {new Date(b.sessionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{b.sessionTime}</td>
                        <td className="px-5 py-3 font-medium text-foreground">₹{b.amount.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <Badge
                            variant={b.status === "confirmed" ? "default" : b.status === "completed" ? "secondary" : "destructive"}
                            className="text-[10px] capitalize"
                          >
                            {b.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant={b.paymentStatus === "paid" ? "default" : "outline"}
                            className="text-[10px] capitalize"
                          >
                            {b.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          {b.meetingLink ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 h-7 text-xs"
                              onClick={() => { navigator.clipboard.writeText(b.meetingLink!); toast.success("Link copied!"); }}
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          )}

          {/* ─── Availability Management (coaching only) ─── */}
          {isCoaching && (
            <TabsContent value="availability" className="space-y-6 mt-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Manage Your Availability</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set your working hours, block unavailable dates, and manage holidays
                </p>
              </div>

              {/* Weekly Schedule */}
              <div className="blade-card p-5 space-y-4">
                <h3 className="text-sm font-medium text-foreground">Weekly Schedule</h3>
                <div className="space-y-2">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                    <div key={day} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                      <Switch defaultChecked={["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day)} />
                      <span className="flex-1 text-sm font-medium text-foreground capitalize">{day}</span>
                      <div className="flex items-center gap-2">
                        <Input type="time" defaultValue="09:00" className="w-28 h-8 text-xs" />
                        <span className="text-xs text-muted-foreground">-</span>
                        <Input type="time" defaultValue="17:00" className="w-28 h-8 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => toast.success("Schedule updated!")}>
                  <Check className="h-3.5 w-3.5" /> Save Schedule
                </Button>
              </div>

              {/* Block Specific Dates */}
              <div className="blade-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Blocked Dates</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {unavailableDates.length} dates blocked
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="date"
                    className="flex-1 text-xs"
                    onChange={(e) => {
                      if (e.target.value && !unavailableDates.includes(e.target.value)) {
                        setUnavailableDates([...unavailableDates, e.target.value]);
                        toast.success("Date blocked");
                        e.target.value = "";
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Select a date to block")}>
                    <Plus className="h-3.5 w-3.5" /> Block Date
                  </Button>
                </div>

                {unavailableDates.length > 0 && (
                  <div className="space-y-2">
                    {unavailableDates.map((date) => (
                      <div key={date} className="flex items-center justify-between p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                        <span className="text-sm text-foreground">
                          {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1"
                          onClick={() => {
                            setUnavailableDates(unavailableDates.filter(d => d !== date));
                            toast.success("Date unblocked");
                          }}
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Holidays */}
              <div className="blade-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Holidays & Time Off</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {holidays.length} holidays
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Holiday date"
                    className="text-xs"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                  />
                  <Input
                    placeholder="Reason (optional)"
                    className="text-xs"
                    value={newHolidayReason}
                    onChange={(e) => setNewHolidayReason(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="col-span-2 gap-1.5"
                    onClick={() => {
                      if (newHolidayDate) {
                        setHolidays([...holidays, { date: newHolidayDate, reason: newHolidayReason || "Holiday" }]);
                        setNewHolidayDate("");
                        setNewHolidayReason("");
                        toast.success("Holiday added");
                      }
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Holiday
                  </Button>
                </div>

                {holidays.length > 0 && (
                  <div className="space-y-2">
                    {holidays.map((holiday, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(holiday.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <p className="text-xs text-muted-foreground">{holiday.reason}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1"
                          onClick={() => {
                            setHolidays(holidays.filter((_, i) => i !== idx));
                            toast.success("Holiday removed");
                          }}
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Session Settings */}
              <div className="blade-card p-5 space-y-4">
                <h3 className="text-sm font-medium text-foreground">Session Settings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Session Duration</Label>
                    <Select defaultValue="60">
                      <SelectTrigger className="mt-1 text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[30, 45, 60, 90, 120].map(d => (
                          <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Buffer Time</Label>
                    <Select defaultValue="15">
                      <SelectTrigger className="mt-1 text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 5, 10, 15, 30].map(d => (
                          <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Max Sessions/Day</Label>
                    <Input type="number" defaultValue={5} className="mt-1 h-9 text-xs" />
                  </div>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => toast.success("Settings saved!")}>
                  <Check className="h-3.5 w-3.5" /> Save Settings
                </Button>
              </div>
            </TabsContent>
          )}

          {/* ─── Students (course only) ─── */}
          {isCourse && (
            <TabsContent value="students" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {students.filter(s => s.status === "active").length} active students • {students.filter(s => s.status === "completed").length} completed
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Upload className="h-3 w-3" /> Import
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Plus className="h-3 w-3" /> Add Student
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search students..." className="pl-8 h-9 text-xs w-64" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">₹{students.filter(s => s.paymentStatus === "paid").reduce((sum, s) => sum + s.amount, 0).toLocaleString()}</p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Avg. Progress</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)}%</p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{Math.round((students.filter(s => s.status === "completed").length / students.length) * 100)}%</p>
                </div>
              </div>

              <div className="blade-card overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Student</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Enrolled</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Progress</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Payment</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-muted-foreground text-[10px]">{student.email}</p>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{student.enrolledAt}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-foreground w-10 text-right">{student.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={student.status === "completed" ? "default" : student.status === "active" ? "secondary" : "outline"}
                            className="text-[10px]"
                          >
                            {student.status === "completed" ? "Completed" : student.status === "active" ? "Active" : "Dropped"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={student.paymentStatus === "paid" ? "default" : "outline"}
                            className={`text-[10px] ${student.paymentStatus === "paid" ? "bg-emerald-500" : ""}`}
                          >
                            {student.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-medium text-foreground">₹{student.amount.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          )}

          {/* ─── Curriculum (course only) ─── */}
          {isCourse && (
            <TabsContent value="curriculum" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Manage your course modules and lessons
                </p>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Module
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Total Modules</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">5</p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">32</p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Video Hours</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">18h</p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Resources</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">24</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 1, title: "Introduction & Fundamentals", lessons: 5, duration: "2 hours", progress: 95 },
                  { id: 2, title: "Core Concepts", lessons: 8, duration: "4 hours", progress: 78 },
                  { id: 3, title: "Practical Applications", lessons: 10, duration: "6 hours", progress: 62 },
                  { id: 4, title: "Advanced Topics", lessons: 7, duration: "4 hours", progress: 45 },
                  { id: 5, title: "Capstone Project", lessons: 2, duration: "2 hours", progress: 12 },
                ].map(module => (
                  <div key={module.id} className="blade-card p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {module.id}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{module.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              {module.lessons} lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Avg. student progress</span>
                        <span className="font-medium text-foreground">{module.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {/* ─── Orders (ecommerce only) ─── */}
          {isEcommerce && (
            <TabsContent value="orders" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {orders.length} total orders • {orders.filter(o => o.status === "delivered").length} delivered
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-muted-foreground">{orders.filter(o => o.status === "pending" || o.status === "confirmed").length} pending</span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">{orders.filter(o => o.status === "delivered").length} delivered</span>
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-xs text-muted-foreground">{orders.filter(o => o.status === "cancelled").length} cancelled</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Download className="h-3 w-3" /> Export CSV
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    ₹{orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                  </p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    ₹{orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {orders.filter(o => o.status === "pending" || o.status === "confirmed").length}
                  </p>
                </div>
                <div className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">Fulfillment Rate</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {orders.length > 0 ? `${Math.round((orders.filter(o => o.status === "delivered").length / orders.length) * 100)}%` : "—"}
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="blade-card p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Orders from your e-commerce Smart Page will appear here.
                  </p>
                </div>
              ) : (
                <div className="blade-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="blade-table-header px-5 py-3 text-left">Order Number</th>
                        <th className="blade-table-header px-5 py-3 text-left">Customer</th>
                        <th className="blade-table-header px-5 py-3 text-left">Items</th>
                        <th className="blade-table-header px-5 py-3 text-left">Total</th>
                        <th className="blade-table-header px-5 py-3 text-left">Payment</th>
                        <th className="blade-table-header px-5 py-3 text-left">Status</th>
                        <th className="blade-table-header px-5 py-3 text-left">Created On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter((o) => {
                          const matchSearch = !searchQuery ||
                            o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
                          return matchSearch && matchPayment;
                        })
                        .map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                          >
                            <td className="px-5 py-3 font-medium text-primary">{order.orderNumber}</td>
                            <td className="px-5 py-3">
                              <div>
                                <p className="text-foreground font-medium">{order.customerName}</p>
                                <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                            <td className="px-5 py-3 text-foreground font-medium">
                              ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-5 py-3">
                              <span className={
                                order.paymentStatus === "paid" ? "blade-badge-paid" :
                                order.paymentStatus === "failed" ? "blade-badge-cancelled" :
                                order.paymentStatus === "refunded" ? "blade-badge-warning" :
                                "blade-badge"
                              }>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <OrderStatusSelect
                                order={order}
                                onStatusUpdate={() => {
                                  // Reload orders after status update
                                  const updatedOrders = getOrders(site.id);
                                  setOrders(updatedOrders);
                                }}
                                compact
                              />
                            </td>
                            <td className="px-5 py-3 text-muted-foreground text-xs">
                              {new Date(order.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
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
