import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, ExternalLink, X, Copy, Eye, Share2, MessageCircle, Mail, ChevronDown, ChevronUp, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

const availableProducts = [
  { id: "prod_1", name: "Full Stack Dev Bootcamp", price: 12999 },
  { id: "prod_2", name: "UI/UX Design Masterclass", price: 8499 },
  { id: "prod_3", name: "Data Science Fundamentals", price: 15999 },
  { id: "prod_4", name: "Digital Marketing 101", price: 4999 },
];

const PaymentLinks = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLink, setCreatedLink] = useState("");
  const [selectedLink, setSelectedLink] = useState<typeof paymentLinks[0] | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [collectAddress, setCollectAddress] = useState(false);
  const [shiprocketEnabled, setShiprocketEnabled] = useState(false);
  const [whatsappConfirmationEnabled, setWhatsappConfirmationEnabled] = useState(false);

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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Payment Link</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Amount - Primary Field */}
            <div>
              <label className="text-sm font-medium text-foreground">Amount (₹) <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. 12999" type="number" className="mt-1.5" />
            </div>

            {/* Description - Secondary Field */}
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea placeholder="e.g. Course Fee for Full Stack Bootcamp" className="mt-1.5" rows={3} />
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Customer Name (Optional)</label>
                <Input placeholder="e.g. Priya Sharma" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Mobile Number (Optional)</label>
                <Input placeholder="+91 98765 43210" className="mt-1.5" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Email Address (Optional)</label>
              <Input placeholder="priya@example.com" type="email" className="mt-1.5" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Reference ID (Optional)</label>
              <Input placeholder="e.g. COURSE-001" className="mt-1.5" />
            </div>

            {/* Collect Address During Checkout */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Collect Address</label>
                  <p className="text-xs text-muted-foreground mt-1">Customer will provide address, city, and pincode</p>
                </div>
                <Switch
                  checked={collectAddress}
                  onCheckedChange={setCollectAddress}
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Advanced Settings
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-6 p-4 bg-secondary/30 rounded-lg">
                  {/* Product Selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Select Products (Optional)</label>
                    <div className="space-y-2">
                      {availableProducts.map((product) => (
                        <div key={product.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={product.id}
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts([...selectedProducts, product.id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(p => p !== product.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={product.id}
                            className="text-sm text-foreground cursor-pointer flex-1"
                          >
                            {product.name} — ₹{product.price.toLocaleString('en-IN')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shiprocket Integration */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-primary" />
                          <label className="text-sm font-medium text-foreground">Shiprocket Integration</label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Automatically send order details to Shiprocket for seamless shipping and logistics management
                        </p>
                      </div>
                      <Switch
                        checked={shiprocketEnabled}
                        onCheckedChange={setShiprocketEnabled}
                      />
                    </div>
                    {shiprocketEnabled && (
                      <div className="mt-3 p-3 bg-background/50 rounded-md border border-border">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Order details will be sent to Shiprocket upon successful payment
                        </p>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Order Confirmation */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-4 w-4 text-green-600" />
                          <label className="text-sm font-medium text-foreground">WhatsApp Order Confirmation</label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Send automated order confirmation message to customer via WhatsApp after successful payment
                        </p>
                      </div>
                      <Switch
                        checked={whatsappConfirmationEnabled}
                        onCheckedChange={setWhatsappConfirmationEnabled}
                      />
                    </div>
                    {whatsappConfirmationEnabled && (
                      <div className="mt-3 p-3 bg-background/50 rounded-md border border-border">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Customer will receive order confirmation on WhatsApp
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => {
                const newLink = `https://rzp.io/rzp/${Math.random().toString(36).substring(7)}`;
                setCreatedLink(newLink);
                setShowCreate(false);
                setShowSuccessModal(true);
              }}
            >
              Create Payment Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal - Post Payment Link Creation */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Payment Link Created Successfully!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Your Payment Link</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-foreground flex-1 truncate">{createdLink}</code>
              </div>
            </div>

            {/* Show enabled integrations */}
            {(shiprocketEnabled || whatsappConfirmationEnabled) && (
              <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                <p className="text-xs font-medium text-foreground mb-2">Enabled Integrations</p>
                <div className="space-y-1.5">
                  {shiprocketEnabled && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Package className="h-3.5 w-3.5 text-primary" />
                      <span>Shiprocket - Order details will be sent automatically</span>
                    </div>
                  )}
                  {whatsappConfirmationEnabled && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                      <span>WhatsApp - Order confirmation will be sent to customer</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(createdLink);
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  window.open(createdLink, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-foreground mb-3">Share via</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const message = encodeURIComponent(`Pay using this link: ${createdLink}`);
                    window.open(`https://wa.me/?text=${message}`, '_blank');
                    toast.success("Shared via WhatsApp");
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const subject = encodeURIComponent("Payment Link");
                    const body = encodeURIComponent(`Please use this link to make payment: ${createdLink}`);
                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                    toast.success("Opened email client");
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const message = encodeURIComponent(`Pay using this link: ${createdLink}`);
                    window.open(`sms:?&body=${message}`, '_blank');
                    toast.success("Opened SMS app");
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  SMS
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Payment Link',
                        text: 'Pay using this link',
                        url: createdLink,
                      }).then(() => toast.success("Shared successfully"))
                        .catch(() => {});
                    } else {
                      toast.info("Share feature not supported");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  More
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false);
                setCreatedLink("");
                setSelectedProducts([]);
                setSelectedAdditionalFields([]);
                setShiprocketEnabled(false);
                setWhatsappConfirmationEnabled(false);
                setShowAdvanced(false);
              }}
            >
              Done
            </Button>
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
