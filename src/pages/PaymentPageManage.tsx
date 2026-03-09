import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, Users, IndianRupee, Eye, Copy, ExternalLink,
  Download, Calendar, CheckCircle2, Edit, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

// Mock data - in real app, this would come from API based on page ID
const mockPageData = {
  id: "pp_001",
  title: "Annual Tuition Fee — Academy",
  slug: "tuition-fee",
  totalSales: "₹ 3,75,000.00",
  itemName: "Tuition Fee",
  itemPrice: "₹ 25,000.00",
  unitsSold: 15,
  pageUrl: "https://rzp.io/rzp/tuition-fee",
  createdOn: "10 Feb 2026",
  status: "Active" as const,
  views: 1240,
  conversion: "12.1%",
};

const PaymentPageManage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get("id") || "pp_001";
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7days");

  // In real app, fetch page data based on pageId
  const pageData = mockPageData;

  const copyLink = () => {
    navigator.clipboard.writeText(pageData.pageUrl);
    toast.success("Link copied to clipboard!");
  };

  const recentTransactions = [
    { name: "Priya Sharma", email: "priya.s@email.com", amount: pageData.itemPrice, date: "9 Mar 2026, 2:45 PM", status: "Paid" },
    { name: "Rahul Mehta", email: "rahul.m@email.com", amount: pageData.itemPrice, date: "8 Mar 2026, 11:30 AM", status: "Paid" },
    { name: "Ananya Gupta", email: "ananya.g@email.com", amount: pageData.itemPrice, date: "7 Mar 2026, 4:15 PM", status: "Paid" },
    { name: "Vikram Singh", email: "vikram.s@email.com", amount: pageData.itemPrice, date: "6 Mar 2026, 9:20 AM", status: "Pending" },
    { name: "Sneha Patel", email: "sneha.p@email.com", amount: pageData.itemPrice, date: "5 Mar 2026, 3:50 PM", status: "Paid" },
    { name: "Arjun Kumar", email: "arjun.k@email.com", amount: pageData.itemPrice, date: "4 Mar 2026, 10:15 AM", status: "Paid" },
    { name: "Meera Iyer", email: "meera.i@email.com", amount: pageData.itemPrice, date: "3 Mar 2026, 1:20 PM", status: "Paid" },
    { name: "Rohan Nair", email: "rohan.n@email.com", amount: pageData.itemPrice, date: "2 Mar 2026, 5:30 PM", status: "Failed" },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{pageData.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your payment page analytics and transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-1" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/payment/${pageData.slug}`, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-1" /> Open Page
            </Button>
            <Button size="sm" onClick={() => navigate(`/payment-pages/editor?title=${encodeURIComponent(pageData.title)}`)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Page
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: pageData.totalSales, icon: IndianRupee, color: "text-emerald-600" },
                { label: "Units Sold", value: pageData.unitsSold.toString(), icon: CheckCircle2, color: "text-blue-600" },
                { label: "Page Views", value: pageData.views.toLocaleString(), icon: Eye, color: "text-purple-600" },
                { label: "Conversion", value: pageData.conversion, icon: TrendingUp, color: "text-orange-600" },
              ].map((stat) => (
                <div key={stat.label} className="blade-stat">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue Trend */}
            <div className="blade-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Revenue Trend
                </h2>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 h-48">
                {[35, 52, 48, 72, 68, 85, 92, 78, 95, 88, 102, 115, 98, 120].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-muted rounded-t relative" style={{ height: "100%" }}>
                      <div
                        className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t absolute bottom-0"
                        style={{ height: `${(val / 120) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Avg. Order Value", value: pageData.itemPrice, change: "+8.2%", up: true },
                { label: "Repeat Customers", value: "23%", change: "+4.1%", up: true },
                { label: "Cart Abandonment", value: "12.4%", change: "-2.3%", up: false },
              ].map((metric) => (
                <div key={metric.label} className="blade-card p-4">
                  <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-semibold text-foreground">{metric.value}</p>
                    <span className={`text-xs font-medium ${metric.up ? "text-[hsl(152,69%,41%)]" : "text-destructive"}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Transactions Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Recent Transactions
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("transactions")}>
                  View All
                </Button>
              </div>
              <div className="blade-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="blade-table-header px-4 py-3 text-left">Customer</th>
                      <th className="blade-table-header px-4 py-3 text-left">Amount</th>
                      <th className="blade-table-header px-4 py-3 text-left">Date</th>
                      <th className="blade-table-header px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.slice(0, 5).map((txn, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-semibold text-primary">
                                {txn.name.split(" ").map(n => n[0]).join("")}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">{txn.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">{txn.amount}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{txn.date}</td>
                        <td className="px-4 py-3">
                          <span className={txn.status === "Paid" ? "blade-badge-paid" : txn.status === "Pending" ? "blade-badge-pending" : "blade-badge-expired"}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">All Transactions</h2>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>

            <div className="blade-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="blade-table-header px-4 py-3 text-left">Customer</th>
                    <th className="blade-table-header px-4 py-3 text-left">Email</th>
                    <th className="blade-table-header px-4 py-3 text-left">Amount</th>
                    <th className="blade-table-header px-4 py-3 text-left">Date</th>
                    <th className="blade-table-header px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((txn, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-primary">
                              {txn.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{txn.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{txn.email}</td>
                      <td className="px-4 py-3 text-foreground font-medium">{txn.amount}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{txn.date}</td>
                      <td className="px-4 py-3">
                        <span className={txn.status === "Paid" ? "blade-badge-paid" : txn.status === "Pending" ? "blade-badge-pending" : "blade-badge-expired"}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
                Showing {recentTransactions.length} transactions
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div className="blade-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Traffic Sources</h3>
                <div className="space-y-3">
                  {[
                    { source: "Direct", visits: 456, percent: 37 },
                    { source: "Social Media", visits: 342, percent: 28 },
                    { source: "Email", visits: 234, percent: 19 },
                    { source: "Referral", visits: 198, percent: 16 },
                  ].map((item) => (
                    <div key={item.source}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{item.source}</span>
                        <span className="text-muted-foreground">{item.visits} visits</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="blade-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Device Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { device: "Mobile", visits: 678, percent: 55 },
                    { device: "Desktop", visits: 432, percent: 35 },
                    { device: "Tablet", visits: 123, percent: 10 },
                  ].map((item) => (
                    <div key={item.device}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{item.device}</span>
                        <span className="text-muted-foreground">{item.visits} visits</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPageManage;
