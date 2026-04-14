import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Copy, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
      <div>
        {/* Top-level tabs + actions */}
        <div className="flex items-center justify-between border-b pb-0">
          <div className="flex">
            {(["payment-pages", "products"] as TopTab[]).map((tab) => (
              <button
                key={tab}
                className="bg-transparent border-none cursor-pointer px-4 py-3"
                onClick={() => setTopTab(tab)}
              >
                <span
                  className={`text-sm font-medium pb-3 border-b-2 ${
                    topTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                  }`}
                >
                  {tab === "payment-pages" ? "Payment Pages" : "Products"}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Button variant="ghost" size="sm">Need help? Take a tour</Button>
            <Button variant="ghost" size="sm">Documentation</Button>
            <Button size="sm" onClick={() => navigate("/payment-pages-current/select")}>
              <Plus className="h-4 w-4 mr-1" />
              Create Payment Page
            </Button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-3 mb-1">
          <div className="inline-flex items-center bg-muted rounded-md p-1">
            {(["payment-pages", "webstore"] as SubTab[]).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md text-sm font-medium border-none cursor-pointer ${
                  subTab === tab ? "bg-background text-foreground" : "bg-transparent text-muted-foreground"
                }`}
                onClick={() => setSubTab(tab)}
              >
                {tab === "payment-pages" ? "Payment Pages" : "Razorpay Webstore"}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter + Search */}
        <div className="mt-4 flex justify-between items-center">
          <div className="inline-flex items-center bg-muted rounded-md p-1">
            {(["all", "active", "inactive"] as StatusTab[]).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md text-sm font-medium border-none cursor-pointer ${
                  statusTab === tab ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"
                }`}
                onClick={() => setStatusTab(tab)}
              >
                {tab === "all" ? "All" : tab === "active" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
          <div className="w-60 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Sales</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Units Sold</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Page URL</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created On</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <RouterLink to={`/payment-pages-current/details/${row.id}`} className="text-primary hover:underline">
                      {row.title}
                    </RouterLink>
                  </td>
                  <td className="px-4 py-3">{row.totalSales}</td>
                  <td className="px-4 py-3">
                    <div>{row.itemName}</div>
                    <div className="text-xs text-muted-foreground">{row.itemPrice}</div>
                  </td>
                  <td className="px-4 py-3">{row.unitsSold}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary truncate max-w-[180px]">{row.pageUrl}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyLink(row.pageUrl)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.createdOn}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.status === "Active" ? "default" : "secondary"} className={row.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t flex justify-end">
            <span className="text-xs text-muted-foreground">Showing 1 - {filtered.length}</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPagesCurrent;
