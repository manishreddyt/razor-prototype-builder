import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, Users, IndianRupee, Eye, Copy, ExternalLink,
  Download, Calendar, CheckCircle2, Edit, BarChart3, Receipt, FileText,
  Building2, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
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

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const PaymentPageManage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get("id") || "pp_001";
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7days");

  // Receipt settings state
  const [receiptEnabled, setReceiptEnabled] = useState(false);
  const [gstReceiptEnabled, setGstReceiptEnabled] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"auto" | "manual">("auto");
  const [deliveryChannel, setDeliveryChannel] = useState<"email" | "whatsapp" | "both">("email");
  const [receiptPrefix, setReceiptPrefix] = useState("RCP");
  const [receiptStartNumber, setReceiptStartNumber] = useState("001");
  const [termsText, setTermsText] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedCustomerFields, setSelectedCustomerFields] = useState<string[]>(["name", "email"]);

  // GST mandatory fields
  const [gstHsnCode, setGstHsnCode] = useState("");
  const [gstTaxRate, setGstTaxRate] = useState("");
  const [gstPlaceOfSupply, setGstPlaceOfSupply] = useState("");

  // Publish dialog
  const [showGstDialog, setShowGstDialog] = useState(false);

  // Mock merchant KYC data (non-editable, auto-populated)
  const merchantDetails = {
    businessName: "Academy of Excellence Pvt. Ltd.",
    gstin: "29ABCDE1234F1Z5",
    address: "12, Learning Hub, MG Road, Bengaluru — 560001, Karnataka",
    isGstRegistered: true,
  };

  // In real app, fetch page data based on pageId
  const pageData = mockPageData;

  const copyLink = () => {
    navigator.clipboard.writeText(pageData.pageUrl);
    toast.success("Link copied to clipboard!");
  };

  const anyReceiptEnabled = receiptEnabled || gstReceiptEnabled;

  const toggleCustomerField = (field: string) => {
    if (field === "email") return; // always required
    setSelectedCustomerFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSaveReceipts = () => {
    if (gstReceiptEnabled && (gstHsnCode === "" || gstTaxRate === "" || gstPlaceOfSupply === "")) {
      setShowGstDialog(true);
    } else {
      toast.success("Receipt settings saved!");
    }
  };

  const handleSaveGst = () => {
    if (!gstHsnCode || !gstTaxRate || !gstPlaceOfSupply) {
      toast.error("Please fill all mandatory GST fields.");
      return;
    }
    setShowGstDialog(false);
    toast.success("GST Receipt activated!");
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
            <TabsTrigger value="receipts">Payment Receipts</TabsTrigger>
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

          {/* Payment Receipts Tab */}
          <TabsContent value="receipts" className="space-y-6">

            {/* Section 1: Receipt Type */}
            <div className="blade-card p-6 space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Receipt Type
              </h2>

              {/* Non-GST Receipt */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Payment Receipt (non-GST)</p>
                  <p className="text-xs text-muted-foreground">Customers receive a PDF receipt after payment</p>
                </div>
                <Switch
                  checked={receiptEnabled}
                  onCheckedChange={setReceiptEnabled}
                />
              </div>

              {/* GST Receipt — visible only if merchant is GST registered */}
              {merchantDetails.isGstRegistered && (
                <div className="flex items-center justify-between py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">GST Receipt</p>
                      <span className="blade-badge-success text-[10px] px-2 py-0.5 rounded-full font-medium">
                        GST Registered · {merchantDetails.gstin}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Issue GST-compliant receipts with tax breakdowns</p>
                  </div>
                  <Switch
                    checked={gstReceiptEnabled}
                    onCheckedChange={setGstReceiptEnabled}
                  />
                </div>
              )}
            </div>

            {/* Section 2: Delivery Preferences — visible only when any receipt is enabled */}
            {anyReceiptEnabled && (
              <div className="blade-card p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Delivery Preferences
                </h2>

                {/* Delivery Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Delivery Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Auto-send: delivered within 60s of payment. Manual: send from Dashboard.
                    </p>
                  </div>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(["auto", "manual"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setDeliveryMode(mode)}
                        className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                          deliveryMode === mode
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {mode === "auto" ? "Auto-send" : "Manual"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Send Via */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Send via</p>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(["email", "whatsapp", "both"] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setDeliveryChannel(ch)}
                        className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                          deliveryChannel === ch
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {ch === "both" ? "Both" : ch === "email" ? "Email" : "WhatsApp"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Receipt Numbering — visible only when any receipt is enabled */}
            {anyReceiptEnabled && (
              <div className="blade-card p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Receipt Numbering
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="receipt-prefix" className="text-sm">Prefix</Label>
                    <Input
                      id="receipt-prefix"
                      value={receiptPrefix}
                      onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
                      placeholder="e.g., RCP"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="receipt-start" className="text-sm">Starting Number</Label>
                    <Input
                      id="receipt-start"
                      value={receiptStartNumber}
                      onChange={(e) => setReceiptStartNumber(e.target.value)}
                      placeholder="e.g., 001"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Next receipt: <span className="font-medium text-foreground">{receiptPrefix}-{receiptStartNumber}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Section 4: Customer Fields — visible only when any receipt is enabled */}
            {anyReceiptEnabled && (
              <div className="blade-card p-6 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Customer Fields
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email auto-included · Select up to 3 more fields
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "name", label: "Name" },
                    { id: "email", label: "Email", disabled: true },
                    { id: "phone", label: "Phone" },
                    { id: "pan", label: "PAN" },
                    { id: "billing_address", label: "Billing Address" },
                  ].map((field) => (
                    <label
                      key={field.id}
                      className={`flex items-center gap-2.5 cursor-pointer ${field.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomerFields.includes(field.id)}
                        onChange={() => toggleCustomerField(field.id)}
                        disabled={field.disabled}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-foreground">{field.label}</span>
                      {field.disabled && (
                        <span className="text-[10px] text-muted-foreground">(required)</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Terms & Conditions */}
            {anyReceiptEnabled && (
              <div className="blade-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Terms & Conditions</h2>
                  <span className="text-xs text-muted-foreground">{termsText.length}/1000</span>
                </div>
                <Textarea
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value.slice(0, 1000))}
                  placeholder="Enter terms and conditions to include on the receipt..."
                  className="min-h-[100px] resize-none text-sm"
                />
              </div>
            )}

            {/* Section 6: Customer Notes */}
            {anyReceiptEnabled && (
              <div className="blade-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Customer Notes</h2>
                  <span className="text-xs text-muted-foreground">{customerNotes.length}/500</span>
                </div>
                <Textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value.slice(0, 500))}
                  placeholder="Add a personal note or instructions for your customers..."
                  className="min-h-[80px] resize-none text-sm"
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end">
              <Button onClick={handleSaveReceipts}>
                Save Receipt Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* GST Configuration Dialog */}
        <Dialog open={showGstDialog} onOpenChange={setShowGstDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Complete GST Receipt Configuration
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                The following mandatory fields are required before GST Receipts can be activated.
              </p>
            </DialogHeader>

            <div className="space-y-5">
              {/* Merchant Details — non-editable */}
              <div className="rounded-lg bg-secondary/40 border border-border p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Merchant Details
                </p>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">{merchantDetails.businessName}</p>
                  <p className="text-muted-foreground">GSTIN: {merchantDetails.gstin}</p>
                  <p className="text-muted-foreground">{merchantDetails.address}</p>
                </div>
                <button className="text-xs text-primary hover:underline mt-1">
                  Edit in Account Settings →
                </button>
              </div>

              {/* Line Item GST Mapping */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Line Item GST Mapping</p>
                <div className="rounded-md border border-border p-3 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    {pageData.itemName} ({pageData.itemPrice})
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">HSN/SAC Code</Label>
                      <Input
                        value={gstHsnCode}
                        onChange={(e) => setGstHsnCode(e.target.value)}
                        placeholder="e.g., 999300"
                        className="h-9 text-sm"
                        maxLength={8}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tax Rate</Label>
                      <Select value={gstTaxRate} onValueChange={setGstTaxRate}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="28">28%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place of Supply */}
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-semibold">Place of Supply</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Determines CGST+SGST (intra-state) vs IGST (inter-state)
                  </p>
                </div>
                <Select value={gstPlaceOfSupply} onValueChange={setGstPlaceOfSupply}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {gstPlaceOfSupply && (
                  <p className="text-xs text-muted-foreground">
                    {gstPlaceOfSupply === "Karnataka"
                      ? "Intra-state → CGST 9% + SGST 9%"
                      : "Inter-state → IGST applies"}
                    {gstTaxRate ? ` at ${gstTaxRate}%` : ""}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGstDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGst}>
                Save & Activate GST Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPageManage;
