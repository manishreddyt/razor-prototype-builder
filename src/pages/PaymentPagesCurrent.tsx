import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, ExternalLink, Copy, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const existingPages = [
  {
    id: "pp_c01",
    title: "Online Course",
    totalSales: "₹ 1,080.00",
    itemName: "Online Course",
    itemPrice: "Amount",
    unitsSold: 1,
    pageUrl: "https://rzp.io/rzp/z4NuPQgY",
    createdOn: "13 Apr 2026",
    status: "Active" as const,
  },
  {
    id: "pp_c02",
    title: "Online Course",
    totalSales: "₹ 0.00",
    itemName: "Online Course",
    itemPrice: "Amount",
    unitsSold: 0,
    pageUrl: "https://rzp.io/rzp/80FLNRG",
    createdOn: "28 Mar 2026",
    status: "Active" as const,
  },
];

type TopTab = "payment-pages" | "products";
type SubTab = "payment-pages" | "webstore";
type StatusTab = "all" | "active" | "inactive";

const PaymentPagesCurrent = () => {
  const navigate = useNavigate();
  const [topTab, setTopTab] = useState<TopTab>("payment-pages");
  const [subTab, setSubTab] = useState<SubTab>("payment-pages");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [showStatusChip, setShowStatusChip] = useState(true);

  const filtered = existingPages.filter((p) => {
    const matchTitle = p.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchStatus =
      statusTab === "all" ||
      (statusTab === "active" && p.status === "Active") ||
      (statusTab === "inactive" && p.status !== "Active");
    return matchTitle && matchStatus;
  });

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Top-level tabs + actions row */}
        <div className="flex items-center justify-between border-b border-border pb-0">
          <div className="flex items-center gap-0">
            <button
              onClick={() => setTopTab("payment-pages")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                topTab === "payment-pages"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Payment Pages
            </button>
            <button
              onClick={() => setTopTab("products")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                topTab === "products"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Products
            </button>
          </div>
          <div className="flex items-center gap-3 pb-2">
            <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <span className="text-xs">💡</span> Need help? Take a tour
            </button>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Documentation <ExternalLink className="h-3 w-3" />
            </button>
            <Button
              onClick={() => navigate("/payment-pages-current/select")}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-sm h-9"
            >
              <Plus className="h-4 w-4" />
              Create Payment Page
            </Button>
          </div>
        </div>

        {/* Sub-tabs: Payment Pages / Razorpay Webstore (toggle style) */}
        <div className="mt-3 mb-1">
          <div className="inline-flex items-center bg-muted/50 rounded-md p-0.5 border border-border/50">
            <button
              onClick={() => setSubTab("payment-pages")}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                subTab === "payment-pages"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Payment Pages
            </button>
            <button
              onClick={() => setSubTab("webstore")}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                subTab === "webstore"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Razorpay Webstore
            </button>
          </div>
        </div>

        {/* Status filter tabs + Search */}
        <div className="mt-4 space-y-3">
          {/* Filter tabs row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 bg-muted/50 rounded-md p-0.5">
              {(["all", "active", "inactive"] as StatusTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-colors capitalize ${
                    statusTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "all" ? "All" : tab === "active" ? "Active" : "Inactive"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Title"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="pl-9 pr-3 w-56 h-9 text-sm rounded-r-none border-r-0"
                />
              </div>
              <button className="h-9 px-3 border border-border rounded-r-md bg-background text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 whitespace-nowrap">
                in {searchField === "title" ? "Title" : "All"} <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Status chip */}
          {showStatusChip && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/60 rounded text-sm text-muted-foreground border border-border/50">
                Status: {statusTab === "all" ? "All" : statusTab === "active" ? "Active" : "Inactive"}
                <button
                  onClick={() => {
                    setStatusTab("all");
                    setShowStatusChip(false);
                  }}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="mt-4 border border-border rounded-md bg-background overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sales</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Units Sold</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Page Url</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created On</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                      idx % 2 === 1 ? "bg-muted/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-primary font-medium cursor-pointer hover:underline text-sm"
                        onClick={() => toast.info(`Details for "${p.title}" coming soon`)}
                      >
                        {p.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">{p.totalSales}</td>
                    <td className="px-4 py-3">
                      <div className="text-foreground text-sm">{p.itemName}</div>
                      <div className="text-muted-foreground text-xs">{p.itemPrice}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">{p.unitsSold}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={p.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate max-w-[200px]"
                        >
                          {p.pageUrl}
                        </a>
                        <button
                          onClick={() => copyLink(p.pageUrl)}
                          className="text-muted-foreground hover:text-primary flex-shrink-0"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm whitespace-nowrap">{p.createdOn}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === "Active"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      No payment pages found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination footer */}
          <div className="px-4 py-2.5 border-t border-border flex items-center justify-end">
            <span className="text-xs text-muted-foreground">
              Showing 1 - {filtered.length}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPagesCurrent;
