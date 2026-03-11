import { useState } from "react";
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

const CustomerTracker = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add customer form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStatus, setNewStatus] = useState<CustomerStatus>("Lead");
  const [newSource, setNewSource] = useState("");

  const filtered = customers.filter((c) => {
    const matchesSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Customer Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage leads, students, and customer interactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-1" />
              Upload CSV
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Total Customers", value: customers.length.toLocaleString() },
            { icon: TrendingUp, label: "Active This Month", value: String(customers.filter(c => c.status === "Active").length) },
            { icon: IndianRupee, label: "Lifetime Value (Avg)", value: "₹9,240" },
          ].map((s) => (
            <div key={s.label} className="blade-stat flex items-center gap-4">
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "Lead", "Active", "Partial", "Churned"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
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

        {/* Table */}
        <div className="blade-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="blade-table-header px-5 py-3 text-left">Name</th>
                <th className="blade-table-header px-5 py-3 text-left">Contact</th>
                <th className="blade-table-header px-5 py-3 text-left">Source</th>
                <th className="blade-table-header px-5 py-3 text-left">Courses</th>
                <th className="blade-table-header px-5 py-3 text-left">Total Paid</th>
                <th className="blade-table-header px-5 py-3 text-left">Last Payment</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
                <th className="blade-table-header px-5 py-3 text-left w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
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
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Joined {c.joinedDate}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-muted-foreground text-xs">{c.email}</p>
                      <p className="text-muted-foreground text-xs">{c.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.source}</td>
                    <td className="px-5 py-3 text-foreground">{c.courses}</td>
                    <td className="px-5 py-3 text-foreground">{c.totalPaid}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.lastPayment}</td>
                    <td className="px-5 py-3">
                      <span className={statusConfig[c.status]?.className || "blade-badge"}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
