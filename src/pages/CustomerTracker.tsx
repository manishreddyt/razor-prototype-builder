import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Users, TrendingUp, IndianRupee, Plus, Upload, Search,
  X, Phone, Mail, ExternalLink, ChevronRight, FileText,
  MessageCircle, ShoppingCart, Calendar, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type CustomerStatus = "Lead" | "Active" | "Partial" | "Churned";

type CustomerSegment =
  | "New"           // 1 order, <30 days since first purchase
  | "Repeat"        // 2-3 orders within 60-90 days
  | "Loyal"         // 4+ orders or top 20% frequency
  | "High Value"    // Top 20% by GMV/LTV
  | "VIP"           // Top 5% on both frequency + spend
  | "At Risk"       // Was loyal, now inactive 60-90 days
  | "Lapsed"        // Inactive >120-180 days
  | "One-time";     // 1 order, >90 days inactive

interface RFMScore {
  recency: number;        // Days since last transaction
  frequency: number;      // Total number of successful transactions
  monetary: number;       // Total successful transaction value (numeric)
  rfmScore: number;       // Combined RFM score (1-5)
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "Success" | "Failed" | "Pending" | "Refunded";
}

interface CustomerNote {
  id: string;
  date: string;
  content: string;
  type: "call" | "email" | "ticket" | "note";
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  courses: number;
  totalPaid: string;
  lastPayment: string;
  status: CustomerStatus;
  source: string;
  joinedDate: string;
  transactions: Transaction[];
  notes: CustomerNote[];
  segment?: CustomerSegment;      // Auto-calculated segment
  rfm?: RFMScore;                // RFM analysis data
  lifetimeValue?: number;        // Numeric LTV for calculations
}

const initialCustomers: Customer[] = [
  {
    id: "c1", name: "Priya Sharma", email: "priya@example.com", phone: "+91-98765-43210",
    courses: 2, totalPaid: "₹25,998", lastPayment: "26 Feb 2026", status: "Active",
    source: "Webinar", joinedDate: "12 Jan 2026",
    transactions: [
      { id: "t1", date: "26 Feb 2026", description: "Advanced Python Course", amount: "₹12,999", status: "Success" },
      { id: "t2", date: "15 Jan 2026", description: "Python Basics Course", amount: "₹8,499", status: "Success" },
      { id: "t3", date: "12 Jan 2026", description: "Python Basics Course (Attempt 1)", amount: "₹8,499", status: "Failed" },
    ],
    notes: [
      { id: "n1", date: "26 Feb 2026", content: "Upgraded to Advanced Python. Very enthusiastic about the course.", type: "note" },
      { id: "n2", date: "20 Feb 2026", content: "Called to discuss advanced course options. Interested in Python + Data Science bundle.", type: "call" },
      { id: "n3", date: "16 Jan 2026", content: "Ticket #1023: Couldn't access Module 3 videos. Resolved — browser cache issue.", type: "ticket" },
    ],
  },
  {
    id: "c2", name: "Rahul Mehta", email: "rahul@example.com", phone: "+91-87654-32109",
    courses: 1, totalPaid: "₹8,499", lastPayment: "25 Feb 2026", status: "Active",
    source: "Google Ads", joinedDate: "25 Feb 2026",
    transactions: [
      { id: "t4", date: "25 Feb 2026", description: "Web Development Bootcamp", amount: "₹8,499", status: "Success" },
    ],
    notes: [
      { id: "n4", date: "25 Feb 2026", content: "New enrollment via Google Ads campaign. Sent welcome email.", type: "email" },
    ],
  },
  {
    id: "c3", name: "Ananya Gupta", email: "ananya@example.com", phone: "+91-76543-21098",
    courses: 1, totalPaid: "₹8,000", lastPayment: "20 Feb 2026", status: "Partial",
    source: "Referral", joinedDate: "10 Feb 2026",
    transactions: [
      { id: "t5", date: "20 Feb 2026", description: "Data Science Masterclass (EMI 1/3)", amount: "₹8,000", status: "Success" },
      { id: "t6", date: "20 Mar 2026", description: "Data Science Masterclass (EMI 2/3)", amount: "₹8,000", status: "Pending" },
    ],
    notes: [
      { id: "n5", date: "15 Feb 2026", content: "Requested EMI option. Set up 3-month payment plan.", type: "call" },
    ],
  },
  {
    id: "c4", name: "Vikram Singh", email: "vikram@example.com", phone: "+91-65432-10987",
    courses: 0, totalPaid: "₹0", lastPayment: "—", status: "Lead",
    source: "Free Webinar", joinedDate: "28 Feb 2026",
    transactions: [],
    notes: [
      { id: "n6", date: "28 Feb 2026", content: "Attended 'Intro to Python' free webinar. Showed interest in paid course.", type: "note" },
      { id: "n7", date: "1 Mar 2026", content: "Sales agent called. Said will decide by weekend.", type: "call" },
    ],
  },
  {
    id: "c5", name: "Sneha Patel", email: "sneha@example.com", phone: "+91-54321-09876",
    courses: 1, totalPaid: "₹2,999", lastPayment: "24 Feb 2026", status: "Active",
    source: "Instagram", joinedDate: "24 Feb 2026",
    transactions: [
      { id: "t7", date: "24 Feb 2026", description: "UI/UX Design Fundamentals", amount: "₹2,999", status: "Success" },
    ],
    notes: [
      { id: "n8", date: "24 Feb 2026", content: "Enrolled via Instagram bio link. Sent onboarding email.", type: "email" },
    ],
  },
  {
    id: "c6", name: "Arjun Reddy", email: "arjun@example.com", phone: "+91-43210-98765",
    courses: 3, totalPaid: "₹34,497", lastPayment: "18 Feb 2026", status: "Active",
    source: "Organic", joinedDate: "5 Nov 2025",
    transactions: [
      { id: "t8", date: "18 Feb 2026", description: "Machine Learning Advanced", amount: "₹14,999", status: "Success" },
      { id: "t9", date: "10 Dec 2025", description: "Data Science Masterclass", amount: "₹12,499", status: "Success" },
      { id: "t10", date: "5 Nov 2025", description: "Python Basics", amount: "₹6,999", status: "Success" },
    ],
    notes: [
      { id: "n9", date: "18 Feb 2026", content: "Power user — enrolled in 3rd course. Potential brand ambassador.", type: "note" },
    ],
  },
  {
    id: "c7", name: "Meera Iyer", email: "meera@example.com", phone: "+91-32109-87654",
    courses: 1, totalPaid: "₹6,999", lastPayment: "1 Jan 2026", status: "Churned",
    source: "Webinar", joinedDate: "1 Jan 2026",
    transactions: [
      { id: "t11", date: "1 Jan 2026", description: "Python Basics Course", amount: "₹6,999", status: "Success" },
      { id: "t12", date: "1 Feb 2026", description: "Refund — Python Basics Course", amount: "-₹6,999", status: "Refunded" },
    ],
    notes: [
      { id: "n10", date: "25 Jan 2026", content: "Ticket #1089: Requested refund. Reason: Course too basic for her level.", type: "ticket" },
      { id: "n11", date: "1 Feb 2026", content: "Refund processed. Offered free access to Advanced course — declined.", type: "email" },
    ],
  },
];

const statusConfig: Record<CustomerStatus, { className: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  Active: { className: "blade-badge-paid", variant: "default" },
  Partial: { className: "blade-badge-warning", variant: "secondary" },
  Lead: { className: "blade-badge-info", variant: "outline" },
  Churned: { className: "blade-badge-cancelled", variant: "destructive" },
};

const segmentConfig: Record<CustomerSegment, {
  className: string;
  color: string;
  icon: string;
  description: string;
}> = {
  "VIP": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200",
    color: "hsl(280, 70%, 50%)",
    icon: "👑",
    description: "Top 5% - highest value and frequency"
  },
  "High Value": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200",
    color: "hsl(152, 69%, 41%)",
    icon: "💎",
    description: "Top 20% by total spend"
  },
  "Loyal": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200",
    color: "hsl(227, 100%, 59%)",
    icon: "⭐",
    description: "4+ orders or frequent purchaser"
  },
  "Repeat": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200",
    color: "hsl(142, 71%, 45%)",
    icon: "🔄",
    description: "2-3 orders, active"
  },
  "New": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200",
    color: "hsl(189, 94%, 43%)",
    icon: "✨",
    description: "First purchase within 30 days"
  },
  "At Risk": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200",
    color: "hsl(38, 92%, 50%)",
    icon: "⚠️",
    description: "Loyal customer, recently inactive"
  },
  "Lapsed": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200",
    color: "hsl(0, 72%, 51%)",
    icon: "💔",
    description: "Inactive >120 days"
  },
  "One-time": {
    className: "px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200",
    color: "hsl(220, 10%, 46%)",
    icon: "1️⃣",
    description: "Single purchase, inactive"
  },
};

const txnStatusClass: Record<string, string> = {
  Success: "blade-badge-success",
  Failed: "blade-badge-cancelled",
  Pending: "blade-badge-warning",
  Refunded: "blade-badge-info",
};

const noteTypeIcon: Record<string, any> = {
  call: Phone,
  email: Mail,
  ticket: FileText,
  note: MessageCircle,
};

// Parse Indian currency format to number
const parseIndianCurrency = (amount: string): number => {
  return Number(amount.replace(/[₹,]/g, ''));
};

// Calculate days between two dates
const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
};

// Calculate RFM score for a customer
const calculateRFM = (customer: Customer, today: Date): RFMScore => {
  const successfulTxns = customer.transactions.filter(t => t.status === "Success");

  const recency = successfulTxns.length > 0
    ? daysBetween(successfulTxns[0].date, today.toLocaleDateString("en-IN"))
    : 999;

  const frequency = successfulTxns.length;

  const monetary = successfulTxns.reduce((sum, txn) =>
    sum + parseIndianCurrency(txn.amount), 0
  );

  // Simplified RFM score (1-5 scale)
  const rfmScore = Math.min(5, Math.max(1,
    Math.floor(((frequency > 0 ? 1 : 0) + (recency < 60 ? 1 : 0) + (monetary > 10000 ? 1 : 0)) * 1.67)
  ));

  return { recency, frequency, monetary, rfmScore };
};

// Assign segment based on RFM analysis
const assignSegment = (
  customer: Customer,
  rfm: RFMScore,
  allCustomers: Customer[]
): CustomerSegment => {
  const { recency, frequency, monetary } = rfm;

  // Calculate percentile thresholds
  const monetaryValues = allCustomers
    .map(c => c.transactions
      .filter(t => t.status === "Success")
      .reduce((sum, t) => sum + parseIndianCurrency(t.amount), 0)
    )
    .sort((a, b) => b - a);

  const top20Threshold = monetaryValues[Math.floor(monetaryValues.length * 0.2)] || 10000;
  const top5Threshold = monetaryValues[Math.floor(monetaryValues.length * 0.05)] || 30000;

  const frequencyValues = allCustomers
    .map(c => c.transactions.filter(t => t.status === "Success").length)
    .sort((a, b) => b - a);
  const top20FreqThreshold = frequencyValues[Math.floor(frequencyValues.length * 0.2)] || 3;

  // VIP: Top 5% spend + high frequency + good RFM
  if (monetary >= top5Threshold && frequency >= top20FreqThreshold && rfm.rfmScore >= 4) {
    return "VIP";
  }

  // High Value: Top 20% by spend
  if (monetary >= top20Threshold) {
    return "High Value";
  }

  // Loyal: 4+ orders or top 20% frequency
  if (frequency >= 4 || frequency >= top20FreqThreshold) {
    if (recency >= 60 && recency <= 90) return "At Risk";
    if (recency > 120) return "Lapsed";
    return "Loyal";
  }

  // Repeat: 2-3 orders, recently active
  if (frequency >= 2 && frequency <= 3 && recency <= 90) {
    return "Repeat";
  }

  // New: 1 order, very recent
  if (frequency === 1 && recency <= 30) {
    return "New";
  }

  // One-time: 1 order, inactive
  if (frequency === 1 && recency > 90) {
    return "One-time";
  }

  // Lapsed: Inactive >120 days
  if (recency > 120) {
    return "Lapsed";
  }

  return "Repeat";
};

// Enrich customers with RFM and segments
const enrichCustomersWithSegments = (customers: Customer[]): Customer[] => {
  const today = new Date();

  return customers.map(customer => {
    const lifetimeValue = customer.transactions
      .filter(t => t.status === "Success")
      .reduce((sum, t) => sum + parseIndianCurrency(t.amount), 0);

    const rfm = calculateRFM(customer, today);
    const segment = assignSegment({ ...customer, lifetimeValue }, rfm, customers);

    return { ...customer, lifetimeValue, rfm, segment };
  });
};

const CustomerTracker = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add customer form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStatus, setNewStatus] = useState<CustomerStatus>("Lead");
  const [newSource, setNewSource] = useState("");

  const enrichedCustomers = useMemo(() =>
    enrichCustomersWithSegments(customers),
    [customers]
  );

  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedCustomers.forEach(c => {
      counts[c.segment || "New"] = (counts[c.segment || "New"] || 0) + 1;
    });
    return counts;
  }, [enrichedCustomers]);

  const filtered = enrichedCustomers.filter((c) => {
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSegment = segmentFilter === "all" || c.segment === segmentFilter;

    return matchesSearch && matchesStatus && matchesSegment;
  });

  const handleAddCustomer = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || "—",
      courses: 0,
      totalPaid: "₹0",
      lastPayment: "—",
      status: newStatus,
      source: newSource.trim() || "Manual",
      joinedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      transactions: [],
      notes: [],
      lifetimeValue: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setShowAdd(false);
    setNewName(""); setNewEmail(""); setNewPhone(""); setNewStatus("Lead"); setNewSource("");
    toast({ title: "Customer added successfully" });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) {
        toast({ title: "CSV must have a header row and at least one data row", variant: "destructive" });
        return;
      }

      const header = lines[0].toLowerCase();
      const hasName = header.includes("name");
      const hasEmail = header.includes("email");

      if (!hasName || !hasEmail) {
        toast({ title: "CSV must contain 'name' and 'email' columns", variant: "destructive" });
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const phoneIdx = headers.indexOf("phone");
      const statusIdx = headers.indexOf("status");

      const newCustomers: Customer[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim());
        if (!cols[nameIdx] || !cols[emailIdx]) continue;
        newCustomers.push({
          id: `c${Date.now()}-${i}`,
          name: cols[nameIdx],
          email: cols[emailIdx],
          phone: phoneIdx >= 0 ? cols[phoneIdx] || "—" : "—",
          courses: 0,
          totalPaid: "₹0",
          lastPayment: "—",
          status: (statusIdx >= 0 && ["Lead", "Active", "Partial", "Churned"].includes(cols[statusIdx])
            ? cols[statusIdx] as CustomerStatus : "Lead"),
          source: "CSV Import",
          joinedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          transactions: [],
          notes: [],
          lifetimeValue: 0,
        });
      }

      setCustomers((prev) => [...newCustomers, ...prev]);
      setShowUpload(false);
      toast({ title: `${newCustomers.length} customers imported from CSV` });
    };
    reader.readAsText(file);
  };

  const statusCounts = {
    all: customers.length,
    Lead: customers.filter(c => c.status === "Lead").length,
    Active: customers.filter(c => c.status === "Active").length,
    Partial: customers.filter(c => c.status === "Partial").length,
    Churned: customers.filter(c => c.status === "Churned").length,
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Customer Tracker</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage leads, students, and customer interactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUpload(true)} className="flex-1 sm:flex-none">
              <Upload className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Upload CSV</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: Users, label: "Total Customers", value: customers.length.toLocaleString() },
            { icon: TrendingUp, label: "Active This Month", value: String(customers.filter(c => c.status === "Active").length) },
            { icon: IndianRupee, label: "Lifetime Value (Avg)", value: "₹9,240" },
          ].map((s) => (
            <div key={s.label} className="blade-stat flex items-center gap-3 sm:gap-4">
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Segment Distribution */}
        <div className="blade-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Customer Segments</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["VIP", "High Value", "Loyal", "Repeat", "New", "At Risk", "Lapsed", "One-time"] as const).map((seg) => {
              const config = segmentConfig[seg];
              const count = segmentCounts[seg] || 0;
              const percentage = customers.length > 0 ? ((count / customers.length) * 100).toFixed(1) : "0";

              return (
                <div
                  key={seg}
                  className="p-3 rounded-lg border border-border hover:shadow-sm transition-all cursor-pointer hover:border-primary/50"
                  onClick={() => setSegmentFilter(seg)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{seg}</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{count}</p>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: config.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-1.5 min-w-max">
                {(["all", "Lead", "Active", "Partial", "Churned"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                      statusFilter === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === "all" ? "All" : s} ({statusCounts[s]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Segment Filters */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 min-w-max">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Segment:</span>
              <button
                onClick={() => setSegmentFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  segmentFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>

              {(["VIP", "High Value", "Loyal", "Repeat", "New", "At Risk", "Lapsed", "One-time"] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setSegmentFilter(seg)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                    segmentFilter === seg
                      ? segmentConfig[seg].className
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{segmentConfig[seg].icon}</span>
                  {seg} ({segmentCounts[seg] || 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="blade-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Name</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden md:table-cell">Contact</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden lg:table-cell">Source</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden sm:table-cell">Courses</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Total Paid</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden lg:table-cell">Last Payment</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden md:table-cell">Segment</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                      No customers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="px-3 sm:px-5 py-3">
                        <p className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{c.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Joined {c.joinedDate}</p>
                      </td>
                      <td className="px-3 sm:px-5 py-3 hidden md:table-cell">
                        <p className="text-muted-foreground text-xs truncate max-w-[150px]">{c.email}</p>
                        <p className="text-muted-foreground text-xs">{c.phone}</p>
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{c.source}</td>
                      <td className="px-3 sm:px-5 py-3 text-foreground text-xs sm:text-sm hidden sm:table-cell">{c.courses}</td>
                      <td className="px-3 sm:px-5 py-3 text-foreground text-xs sm:text-sm whitespace-nowrap">{c.totalPaid}</td>
                      <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{c.lastPayment}</td>
                      <td className="px-3 sm:px-5 py-3 hidden md:table-cell">
                        <span className={segmentConfig[c.segment || "New"].className}>
                          {segmentConfig[c.segment || "New"].icon} {c.segment || "New"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <span className={statusConfig[c.status]?.className || "blade-badge"}>{c.status}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91-XXXXX-XXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as CustomerStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Active">Active (Paying)</SelectItem>
                  <SelectItem value="Partial">Partial Payment</SelectItem>
                  <SelectItem value="Churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Input value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="e.g. Webinar, Google Ads, Referral" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Customer CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with columns: <span className="font-medium text-foreground">name</span>, <span className="font-medium text-foreground">email</span>, phone (optional), status (optional).
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Drag and drop or click to browse</p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="max-w-xs mx-auto"
              />
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs font-medium text-foreground mb-1">Example CSV format:</p>
              <pre className="text-[11px] text-muted-foreground">name,email,phone,status{"\n"}John Doe,john@example.com,+91-99999-00000,Lead{"\n"}Jane Smith,jane@example.com,,Active</pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Sheet */}
      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between pr-4">
                  <div>
                    <SheetTitle className="text-xl">{selectedCustomer.name}</SheetTitle>
                    <span className={cn("mt-1", statusConfig[selectedCustomer.status]?.className || "blade-badge")}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>
              </SheetHeader>

              {/* Contact info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined {selectedCustomer.joinedDate}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">via {selectedCustomer.source}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Courses", value: selectedCustomer.courses },
                  { label: "Total Paid", value: selectedCustomer.totalPaid },
                  { label: "Last Payment", value: selectedCustomer.lastPayment },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* RFM Analysis */}
              {selectedCustomer.rfm && (
                <div className="blade-card p-4 mt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">RFM Analysis</h3>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Recency</p>
                      <p className="text-lg font-bold text-foreground">{selectedCustomer.rfm.recency}</p>
                      <p className="text-xs text-muted-foreground">days ago</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Frequency</p>
                      <p className="text-lg font-bold text-foreground">{selectedCustomer.rfm.frequency}</p>
                      <p className="text-xs text-muted-foreground">orders</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Monetary</p>
                      <p className="text-lg font-bold text-foreground">
                        ₹{(selectedCustomer.rfm.monetary / 1000).toFixed(1)}k
                      </p>
                      <p className="text-xs text-muted-foreground">lifetime</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{segmentConfig[selectedCustomer.segment || "New"].icon}</span>
                      <span className={segmentConfig[selectedCustomer.segment || "New"].className}>
                        {selectedCustomer.segment || "New"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {segmentConfig[selectedCustomer.segment || "New"].description}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" /> Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              </div>

              {/* Transactions */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Transactions ({selectedCustomer.transactions.length})
                </h3>
                <div className="space-y-2">
                  {selectedCustomer.transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No transactions yet.</p>
                  ) : (
                    selectedCustomer.transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">{txn.date}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-foreground">{txn.amount}</p>
                          <span className={cn("text-[10px]", txnStatusClass[txn.status] || "blade-badge")}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default CustomerTracker;
