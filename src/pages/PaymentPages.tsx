import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, ExternalLink, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const existingPages = [
  {
    title: "Annual Tuition Fee — A...",
    totalSales: "₹ 3,75,000.00",
    itemName: "Tuition Fee",
    itemPrice: "₹ 25,000.00",
    unitsSold: 15,
    pageUrl: "https://rzp.io/rzp/dHVpdG...",
    createdOn: "10 Feb 2026",
    status: "Active" as const,
  },
  {
    title: "Annual Tech Conferen...",
    totalSales: "₹ 89,970.00",
    itemName: "Registration Fee",
    itemPrice: "₹ 2,999.00",
    unitsSold: 30,
    pageUrl: "https://rzp.io/rzp/dGVjaC...",
    createdOn: "5 Feb 2026",
    status: "Active" as const,
  },
  {
    title: "Summer Collection —",
    totalSales: "₹ 0.00",
    itemName: "Product Price",
    itemPrice: "₹ 1,999.00",
    unitsSold: 0,
    pageUrl: "https://rzp.io/rzp/c3VtbW...",
    createdOn: "16 Feb 2026",
    status: "Disabled" as const,
  },
  {
    title: "Full Stack Dev Bootcamp",
    totalSales: "₹ 44,51,658.00",
    itemName: "Course Fee",
    itemPrice: "₹ 12,999.00",
    unitsSold: 342,
    pageUrl: "https://rzp.io/rzp/ZnVsbF...",
    createdOn: "1 Jan 2026",
    status: "Active" as const,
  },
  {
    title: "UI/UX Weekend Workshop",
    totalSales: "₹ 10,87,872.00",
    itemName: "Workshop Fee",
    itemPrice: "₹ 8,499.00",
    unitsSold: 128,
    pageUrl: "https://rzp.io/rzp/dWkvdX...",
    createdOn: "15 Jan 2026",
    status: "Active" as const,
  },
];

const PaymentPages = () => {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countFilter, setCountFilter] = useState("25");
  const [showBanner, setShowBanner] = useState(true);

  const filtered = existingPages.filter((p) => {
    const matchTitle = p.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter;
    return matchTitle && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Payment Pages</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-primary hover:underline font-medium">Need help? Take a tour</button>
            <button className="text-sm text-primary hover:underline font-medium">Documentation</button>
            <Button onClick={() => navigate("/payment-pages/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Payment Page
            </Button>
          </div>
        </div>

        {/* Smart AI Page Builder Banner */}
        {showBanner && (
          <div className="blade-card p-6 relative">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-6">
              <div className="w-32 h-24 rounded-md bg-[hsl(var(--primary)/0.15)] flex-shrink-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Smart AI Page Builder</h2>
                  <span className="blade-badge-new">New</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Build professional payment pages in minutes with AI assistance. Describe what you need and our AI builder creates a fully customized page — complete with forms, branding, and payment integration.
                </p>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Category-specific templates for Education, Events & E-commerce
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    AI chat assistant to refine your page in real-time
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Click-to-edit text, drag-and-drop form fields
                  </div>
                </div>
                <Button onClick={() => navigate("/payment-pages/create")} className="gap-2">
                  Try Smart Builder
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Title</label>
            <Input
              placeholder="Search by title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" onClick={() => { setSearchTitle(""); setStatusFilter("all"); }}>
            Clear
          </Button>
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.title} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3">
                    <span
                      className="font-medium text-primary cursor-pointer hover:underline"
                      onClick={() => navigate("/payment-pages/editor")}
                    >
                      {p.title}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground">{p.totalSales}</td>
                  <td className="px-5 py-3">
                    <div className="text-foreground">{p.itemName}</div>
                    <div className="text-muted-foreground text-xs">{p.itemPrice}</div>
                  </td>
                  <td className="px-5 py-3 text-foreground">{p.unitsSold}</td>
                  <td className="px-5 py-3">
                    <a href="#" className="text-primary hover:underline text-xs flex items-center gap-1">
                      {p.pageUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.createdOn}</td>
                  <td className="px-5 py-3">
                    <span className={p.status === "Active" ? "blade-badge-success" : "blade-badge-expired"}>
                      {p.status}
                    </span>
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
    </DashboardLayout>
  );
};

export default PaymentPages;
