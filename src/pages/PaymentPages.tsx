import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, ExternalLink, CheckCircle2, Sparkles, ArrowRight, Eye, Copy, MoreHorizontal, BarChart3, Trash2, Pause, Play, TrendingUp, Users, IndianRupee, Calendar, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const existingPages = [
  {
    id: "pp_001",
    title: "Annual Tuition Fee — Academy",
    totalSales: "₹ 3,75,000.00",
    itemName: "Tuition Fee",
    itemPrice: "₹ 25,000.00",
    unitsSold: 15,
    pageUrl: "https://rzp.io/rzp/tuition-fee",
    createdOn: "10 Feb 2026",
    status: "Active" as const,
    views: 1240,
    conversion: "12.1%",
  },
  {
    id: "pp_002",
    title: "Annual Tech Conference 2026",
    totalSales: "₹ 89,970.00",
    itemName: "Registration Fee",
    itemPrice: "₹ 2,999.00",
    unitsSold: 30,
    pageUrl: "https://rzp.io/rzp/tech-conf",
    createdOn: "5 Feb 2026",
    status: "Active" as const,
    views: 3420,
    conversion: "8.8%",
  },
  {
    id: "pp_003",
    title: "Summer Collection — Fashion",
    totalSales: "₹ 0.00",
    itemName: "Product Price",
    itemPrice: "₹ 1,999.00",
    unitsSold: 0,
    pageUrl: "https://rzp.io/rzp/summer-col",
    createdOn: "16 Feb 2026",
    status: "Disabled" as const,
    views: 45,
    conversion: "0%",
  },
  {
    id: "pp_004",
    title: "Full Stack Dev Bootcamp",
    totalSales: "₹ 44,51,658.00",
    itemName: "Course Fee",
    itemPrice: "₹ 12,999.00",
    unitsSold: 342,
    pageUrl: "https://rzp.io/rzp/bootcamp",
    createdOn: "1 Jan 2026",
    status: "Active" as const,
    views: 28500,
    conversion: "15.2%",
  },
  {
    id: "pp_005",
    title: "UI/UX Weekend Workshop",
    totalSales: "₹ 10,87,872.00",
    itemName: "Workshop Fee",
    itemPrice: "₹ 8,499.00",
    unitsSold: 128,
    pageUrl: "https://rzp.io/rzp/uiux-ws",
    createdOn: "15 Jan 2026",
    status: "Active" as const,
    views: 9800,
    conversion: "13.1%",
  },
];

const PaymentPages = () => {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countFilter, setCountFilter] = useState("25");
  const [showBanner, setShowBanner] = useState(true);
  const [selectedPage, setSelectedPage] = useState<typeof existingPages[0] | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [managePage, setManagePage] = useState<typeof existingPages[0] | null>(null);

  const filtered = existingPages.filter((p) => {
    const matchTitle = p.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter;
    return matchTitle && matchStatus;
  });

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Payment Pages</h1>
          <div className="flex items-center gap-3">
            <button className="text-sm text-primary hover:underline font-medium">Need help? Take a tour</button>
            <button className="text-sm text-primary hover:underline font-medium">Documentation</button>
            <Button onClick={() => navigate("/payment-pages/create")} className="gap-2">
              <Plus className="h-4 w-4" /> Create Payment Page
            </Button>
          </div>
        </div>

        {/* Smart AI Banner */}
        {showBanner && (
          <div className="blade-card p-6 relative">
            <button onClick={() => setShowBanner(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-6">
              <div className="w-32 h-24 rounded-md bg-accent flex-shrink-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Smart AI Page Builder</h2>
                  <span className="blade-badge-new">New</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Build professional payment pages in minutes with AI assistance. Describe what you need and our AI builder creates a fully customized page.
                </p>
                <div className="space-y-1.5 mb-4">
                  {["Category-specific templates for Education, Events & E-commerce", "AI chat assistant to refine your page in real-time", "Click-to-edit text, drag-and-drop form fields"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                    </div>
                  ))}
                </div>
                <Button onClick={() => navigate("/payment-pages/create")} className="gap-2">
                  Try Smart Builder <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Title</label>
            <Input placeholder="Search by title" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} className="w-48" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Count</label>
            <Select value={countFilter} onValueChange={setCountFilter}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2"><Search className="h-4 w-4" /> Search</Button>
          <Button variant="outline" onClick={() => { setSearchTitle(""); setStatusFilter("all"); }}>Clear</Button>
        </div>

        {/* Table */}
        <div className="blade-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="blade-table-header px-5 py-3 text-left">Title</th>
                <th className="blade-table-header px-5 py-3 text-left">Total Sales</th>
                <th className="blade-table-header px-5 py-3 text-left">Item Name</th>
                <th className="blade-table-header px-5 py-3 text-left">Units Sold</th>
                <th className="blade-table-header px-5 py-3 text-left">Page Url</th>
                <th className="blade-table-header px-5 py-3 text-left">Created On</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
                <th className="blade-table-header px-5 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate(`/payment-pages/editor?title=${encodeURIComponent(p.title)}`)}>
                      {p.title}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground font-medium">{p.totalSales}</td>
                  <td className="px-5 py-3">
                    <div className="text-foreground">{p.itemName}</div>
                    <div className="text-muted-foreground text-xs">{p.itemPrice}</div>
                  </td>
                  <td className="px-5 py-3 text-foreground">{p.unitsSold}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <a href="#" className="text-primary hover:underline text-xs flex items-center gap-1">
                        {p.pageUrl.substring(0, 28)}... <ExternalLink className="h-3 w-3" />
                      </a>
                      <button onClick={() => copyLink(p.pageUrl)} className="text-muted-foreground hover:text-primary">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.createdOn}</td>
                  <td className="px-5 py-3">
                    <span className={p.status === "Active" ? "blade-badge-success" : "blade-badge-expired"}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setManagePage(p); setManageDialogOpen(true); }}>
                          <BarChart3 className="h-4 w-4 mr-2" /> Manage Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/payment-pages/editor?title=${encodeURIComponent(p.title)}`)}>
                          <Eye className="h-4 w-4 mr-2" /> Edit Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPage(p)}>
                          <TrendingUp className="h-4 w-4 mr-2" /> Quick Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(p.pageUrl)}>
                          <Copy className="h-4 w-4 mr-2" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {p.status === "Active" ? <><Pause className="h-4 w-4 mr-2" /> Disable</> : <><Play className="h-4 w-4 mr-2" /> Enable</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 text-xs text-muted-foreground border-t border-border">
            Showing 1 - {filtered.length} of {filtered.length}
          </div>
        </div>
      </div>

      {/* Quick Analytics Dialog */}
      <Dialog open={!!selectedPage} onOpenChange={() => setSelectedPage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedPage?.title} — Quick Analytics</DialogTitle></DialogHeader>
          {selectedPage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Sales", value: selectedPage.totalSales },
                  { label: "Units Sold", value: selectedPage.unitsSold.toString() },
                  { label: "Page Views", value: selectedPage.views.toLocaleString() },
                  { label: "Conversion Rate", value: selectedPage.conversion },
                ].map((s) => (
                  <div key={s.label} className="blade-stat">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-semibold text-foreground mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="blade-card p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Sales Trend (Last 7 Days)</h4>
                <div className="flex items-end gap-1 h-24">
                  {[35, 52, 48, 72, 68, 85, 92].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/20 rounded-t" style={{ height: `${val}%` }}>
                        <div className="w-full bg-primary rounded-t" style={{ height: `${Math.min(val + 10, 100)}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => copyLink(selectedPage.pageUrl)}>Copy Link</Button>
                <Button className="flex-1" onClick={() => { setSelectedPage(null); navigate(`/payment-pages/editor?title=${encodeURIComponent(selectedPage.title)}`); }}>Edit Page</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Page Dialog - Comprehensive Overview */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{managePage?.title} — Manage</DialogTitle>
            <p className="text-sm text-muted-foreground">Overview, transactions, and analytics for this payment page</p>
          </DialogHeader>

          {managePage && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Overview
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Revenue", value: managePage.totalSales, icon: IndianRupee, color: "text-emerald-600" },
                    { label: "Units Sold", value: managePage.unitsSold.toString(), icon: CheckCircle2, color: "text-blue-600" },
                    { label: "Page Views", value: managePage.views.toLocaleString(), icon: Eye, color: "text-purple-600" },
                    { label: "Conversion", value: managePage.conversion, icon: TrendingUp, color: "text-orange-600" },
                  ].map((stat) => (
                    <div key={stat.label} className="blade-stat">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      </div>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="blade-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {[35, 52, 48, 72, 68, 85, 92, 78, 95, 88, 102, 115, 98, 120].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-muted rounded-t relative" style={{ height: "100%" }}>
                        <div
                          className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t absolute bottom-0"
                          style={{ height: `${(val / 120) * 100}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-muted-foreground">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Recent Transactions
                  </h3>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" /> Export
                  </Button>
                </div>
                <div className="blade-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="blade-table-header px-4 py-2.5 text-left">Customer</th>
                        <th className="blade-table-header px-4 py-2.5 text-left">Email</th>
                        <th className="blade-table-header px-4 py-2.5 text-left">Amount</th>
                        <th className="blade-table-header px-4 py-2.5 text-left">Date</th>
                        <th className="blade-table-header px-4 py-2.5 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Priya Sharma", email: "priya.s@email.com", amount: managePage.itemPrice, date: "9 Mar 2026, 2:45 PM", status: "Paid" },
                        { name: "Rahul Mehta", email: "rahul.m@email.com", amount: managePage.itemPrice, date: "8 Mar 2026, 11:30 AM", status: "Paid" },
                        { name: "Ananya Gupta", email: "ananya.g@email.com", amount: managePage.itemPrice, date: "7 Mar 2026, 4:15 PM", status: "Paid" },
                        { name: "Vikram Singh", email: "vikram.s@email.com", amount: managePage.itemPrice, date: "6 Mar 2026, 9:20 AM", status: "Pending" },
                        { name: "Sneha Patel", email: "sneha.p@email.com", amount: managePage.itemPrice, date: "5 Mar 2026, 3:50 PM", status: "Paid" },
                      ].map((txn, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-semibold text-primary">
                                  {txn.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <span className="font-medium text-foreground text-xs">{txn.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{txn.email}</td>
                          <td className="px-4 py-2.5 text-foreground font-medium text-xs">{txn.amount}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{txn.date}</td>
                          <td className="px-4 py-2.5">
                            <span className={txn.status === "Paid" ? "blade-badge-paid" : "blade-badge-pending"}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-2.5 text-xs text-muted-foreground border-t border-border">
                    Showing 5 most recent transactions
                  </div>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Avg. Order Value", value: managePage.itemPrice, change: "+8.2%", up: true },
                  { label: "Repeat Customers", value: "23%", change: "+4.1%", up: true },
                  { label: "Cart Abandonment", value: "12.4%", change: "-2.3%", up: false },
                ].map((metric) => (
                  <div key={metric.label} className="blade-card p-3">
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-base font-semibold text-foreground">{metric.value}</p>
                      <span className={`text-[10px] font-medium ${metric.up ? "text-[hsl(152,69%,41%)]" : "text-destructive"}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" className="flex-1" onClick={() => copyLink(managePage.pageUrl)}>
                  <Copy className="h-4 w-4 mr-1" /> Copy Link
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open(`/payment/${managePage.id.replace("pp_00", "")}`, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-1" /> Open Page
                </Button>
                <Button className="flex-1" onClick={() => { setManageDialogOpen(false); navigate(`/payment-pages/editor?title=${encodeURIComponent(managePage.title)}`); }}>
                  <Eye className="h-4 w-4 mr-1" /> Edit Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PaymentPages;
