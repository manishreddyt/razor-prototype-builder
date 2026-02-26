import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, ExternalLink, X, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const tabs = ["All", "Created", "Partially Paid", "Paid", "Cancelled", "Expired"];

const paymentLinks = [
  { id: "plink_SJYQQ1EkgT1K12", date: "23 Feb 2026, 03:58:41 pm", amount: "₹2.00", refId: "", customer: "", link: "https://rzp.io/rzp/qe4lB7B5", status: "Created" },
  { id: "plink_ABcDeFgHiJkL01", date: "22 Feb 2026, 11:30:00 am", amount: "₹12,999.00", refId: "COURSE-001", customer: "Priya Sharma", link: "https://rzp.io/rzp/abc123", status: "Paid" },
  { id: "plink_MnOpQrStUvWx02", date: "21 Feb 2026, 09:15:22 am", amount: "₹8,499.00", refId: "WEBINAR-042", customer: "Rahul Mehta", link: "https://rzp.io/rzp/def456", status: "Paid" },
  { id: "plink_YzAbCdEfGhIj03", date: "20 Feb 2026, 04:45:10 pm", amount: "₹15,999.00", refId: "BOOT-007", customer: "Ananya Gupta", link: "https://rzp.io/rzp/ghi789", status: "Partially Paid" },
  { id: "plink_KlMnOpQrStUv04", date: "19 Feb 2026, 02:20:33 pm", amount: "₹4,999.00", refId: "MKTG-101", customer: "", link: "https://rzp.io/rzp/jkl012", status: "Expired" },
];

const statusBadgeClass: Record<string, string> = {
  "Paid": "blade-badge-paid",
  "Created": "blade-badge-created",
  "Partially Paid": "blade-badge-warning",
  "Cancelled": "blade-badge-cancelled",
  "Expired": "blade-badge-expired",
};

const PaymentLinks = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLink, setSelectedLink] = useState<typeof paymentLinks[0] | null>(null);

  const filtered = activeTab === "All" ? paymentLinks : paymentLinks.filter((l) => l.status === activeTab);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Payment Links</h1>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Create Payment Link
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-border">
          <span className="blade-tab-active">Payment Links</span>
          <span className="blade-tab">Reminder Settings</span>
          <span className="blade-tab flex items-center gap-1">Need help? Take a tour</span>
          <span className="blade-tab flex items-center gap-1">Documentation <span className="blade-badge-new ml-1">new</span></span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "blade-filter-chip-active" : "blade-filter-chip"}>
              {tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-muted-foreground">
            Payment Link Status: All <X className="h-3 w-3 cursor-pointer hover:text-foreground" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-muted-foreground">
            Duration: 19/02/2026 - 26/02/2026 <X className="h-3 w-3 cursor-pointer hover:text-foreground" />
          </span>
        </div>

        {/* Table */}
        <div className="blade-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-5 py-3 text-left">Payment Link Id</th>
                  <th className="blade-table-header px-5 py-3 text-left">Created At</th>
                  <th className="blade-table-header px-5 py-3 text-left">Amount</th>
                  <th className="blade-table-header px-5 py-3 text-left">Reference Id</th>
                  <th className="blade-table-header px-5 py-3 text-left">Customer</th>
                  <th className="blade-table-header px-5 py-3 text-left">Payment Link</th>
                  <th className="blade-table-header px-5 py-3 text-left">Status</th>
                  <th className="blade-table-header px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link) => (
                  <tr key={link.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-primary cursor-pointer hover:underline" onClick={() => setSelectedLink(link)}>{link.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{link.date}</td>
                    <td className="px-5 py-3 text-foreground">{link.amount}</td>
                    <td className="px-5 py-3 text-muted-foreground">{link.refId || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{link.customer || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        {link.link}
                        <button onClick={() => copyLink(link.link)} className="hover:text-primary"><Copy className="h-3 w-3" /></button>
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={statusBadgeClass[link.status] || "blade-badge"}>{link.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-muted-foreground hover:text-primary" onClick={() => setSelectedLink(link)}><Eye className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-3 text-center text-sm text-muted-foreground">
            Showing 1 - {filtered.length}
          </div>
        </div>
      </div>

      {/* Create Payment Link Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Payment Link</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Purpose</label>
              <Input placeholder="e.g. Course Fee — Full Stack Bootcamp" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Amount (₹)</label>
              <Input placeholder="e.g. 12999" type="number" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Customer Name (Optional)</label>
              <Input placeholder="e.g. Priya Sharma" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Customer Phone / Email</label>
              <Input placeholder="+91 98765 43210 or priya@example.com" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Course</label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bootcamp">Full Stack Dev Bootcamp — ₹12,999</SelectItem>
                  <SelectItem value="uiux">UI/UX Design Masterclass — ₹8,499</SelectItem>
                  <SelectItem value="datascience">Data Science Fundamentals — ₹15,999</SelectItem>
                  <SelectItem value="marketing">Digital Marketing 101 — ₹4,999</SelectItem>
                  <SelectItem value="custom">Custom Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Reference ID (Optional)</label>
              <Input placeholder="e.g. COURSE-001" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Share Via</label>
              <div className="flex gap-2 mt-1.5">
                {["WhatsApp", "SMS", "Email", "Copy Link"].map((m) => (
                  <button key={m} className="blade-filter-chip text-xs">{m}</button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => { setShowCreate(false); toast.success("Payment link created!"); }}>Create & Share</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Detail Dialog */}
      <Dialog open={!!selectedLink} onOpenChange={() => setSelectedLink(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Payment Link Details</DialogTitle></DialogHeader>
          {selectedLink && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">{selectedLink.amount}</span>
                <span className={statusBadgeClass[selectedLink.status] || "blade-badge"}>{selectedLink.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Link ID", selectedLink.id],
                  ["Created", selectedLink.date],
                  ["Customer", selectedLink.customer || "—"],
                  ["Reference ID", selectedLink.refId || "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-foreground font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate mr-2">{selectedLink.link}</span>
                <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => copyLink(selectedLink.link)}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <div className="flex gap-2">
                {["WhatsApp", "SMS", "Email"].map((m) => (
                  <Button key={m} variant="outline" size="sm" onClick={() => toast.success(`Shared via ${m}`)}>{m}</Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PaymentLinks;
