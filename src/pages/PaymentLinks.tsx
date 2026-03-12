import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const statusBadgeClass: Record<string, string> = {
  "Paid": "blade-badge-paid",
  "Created": "blade-badge-created",
  "Partially Paid": "blade-badge-warning",
  "Cancelled": "blade-badge-cancelled",
  "Expired": "blade-badge-expired",
};

const availableProducts = [
  { id: "prod_1", name: "Premium Cotton T-Shirt", price: 799, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800" },
  { id: "prod_2", name: "Denim Jeans - Slim Fit", price: 1499, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800" },
  { id: "prod_3", name: "Running Shoes - Sports", price: 2499, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { id: "prod_4", name: "Leather Handbag", price: 3999, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800" },
  { id: "prod_5", name: "Wireless Earbuds", price: 1999, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800" },
  { id: "prod_6", name: "Smart Watch", price: 4999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
];

const PaymentLinks = () => {
  const navigate = useNavigate();
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLink, setCreatedLink] = useState("");
  const [createdLinkId, setCreatedLinkId] = useState("");
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [collectAddress, setCollectAddress] = useState(false);
  const [collectEmail, setCollectEmail] = useState(false);
  const [collectPhone, setCollectPhone] = useState(false);
  const [shiprocketEnabled, setShiprocketEnabled] = useState(false);
  const [whatsappConfirmationEnabled, setWhatsappConfirmationEnabled] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    referenceId: "",
    acceptPartialPayment: false,
    minPartialAmount: "",
  });

  // Initialize localStorage with sample data and load existing links
  useEffect(() => {
    // Initialize sample products
    const existingProducts = localStorage.getItem("available_products");
    if (!existingProducts) {
      localStorage.setItem("available_products", JSON.stringify(availableProducts));
    }

    // Load existing payment links or create sample ones
    const stored = localStorage.getItem("payment_links");
    if (stored) {
      setPaymentLinks(JSON.parse(stored));
    } else {
      const sampleLinks = [
        {
          id: "plink_SJYQQ1EkgT1K12",
          title: "Sample Payment",
          description: "Sample payment link",
          date: "23 Feb 2026, 03:58:41 pm",
          amount: 2,
          currency: "INR",
          refId: "",
          customer: "",
          status: "active",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
        },
        {
          id: "plink_ABcDeFgHiJkL01",
          title: "Premium T-Shirt - Instagram Order",
          description: "Payment for Premium Cotton T-Shirt (Blue, Size L)",
          date: "22 Feb 2026, 11:30:00 am",
          amount: 799,
          currency: "INR",
          refId: "IG-TSH-001",
          customer: "Priya Sharma",
          status: "active",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: true,
          shiprocketEnabled: true,
          selectedProducts: ["prod_1"],
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        },
        {
          id: "plink_MnOpQrStUvWx02",
          title: "Denim Jeans - WhatsApp Order",
          description: "Payment for Denim Jeans Slim Fit (Size 32)",
          date: "21 Feb 2026, 09:15:22 am",
          amount: 1499,
          currency: "INR",
          refId: "WA-DNM-042",
          customer: "Rahul Mehta",
          status: "active",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: true,
          shiprocketEnabled: true,
          whatsappConfirmationEnabled: true,
          selectedProducts: ["prod_2"],
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        },
        {
          id: "plink_YzAbCdEfGhIj03",
          title: "Running Shoes - COD Alternative",
          description: "Payment for Running Shoes Sports Edition with partial payment option",
          date: "20 Feb 2026, 04:45:10 pm",
          amount: 2499,
          currency: "INR",
          refId: "SHOE-007",
          customer: "Ananya Gupta",
          status: "active",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: true,
          acceptPartialPayment: true,
          minPartialAmount: 500,
          shiprocketEnabled: true,
          selectedProducts: ["prod_3"],
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        },
        {
          id: "plink_KlMnOpQrStUv04",
          title: "Leather Handbag - DM Order",
          description: "Payment for Premium Leather Handbag (Brown)",
          date: "19 Feb 2026, 02:20:33 pm",
          amount: 3999,
          currency: "INR",
          refId: "BAG-101",
          customer: "",
          status: "active",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: true,
          shiprocketEnabled: true,
          selectedProducts: ["prod_4"],
          image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
        },
      ];
      localStorage.setItem("payment_links", JSON.stringify(sampleLinks));
      setPaymentLinks(sampleLinks);
    }
  }, []);

  // Map link status to display status
  const getDisplayStatus = (link: any) => {
    if (link.status === "active") return "Created";
    return link.status;
  };

  const filtered = activeTab === "All" ? paymentLinks : paymentLinks.filter((l) => getDisplayStatus(l) === activeTab);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  // Product search and selection helpers
  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const addProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
      setProductSearchQuery(""); // Clear search after adding
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  const getProductById = (id: string) => availableProducts.find((p) => p.id === id);

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
                {filtered.map((link) => {
                  const displayStatus = getDisplayStatus(link);
                  const linkUrl = `${window.location.origin}/pay/${link.id}`;
                  return (
                    <tr key={link.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-primary cursor-pointer hover:underline" onClick={() => setSelectedLink(link)}>{link.id}</td>
                      <td className="px-5 py-3 text-muted-foreground">{link.date}</td>
                      <td className="px-5 py-3 text-foreground">₹{link.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-muted-foreground">{link.refId || "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{link.customer || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/pay/${link.id}`)}
                            className="text-sm text-primary hover:underline cursor-pointer truncate max-w-[200px]"
                          >
                            {linkUrl}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(linkUrl);
                            }}
                            className="hover:text-primary text-muted-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/pay/${link.id}`, '_blank');
                            }}
                            className="hover:text-primary text-muted-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={statusBadgeClass[displayStatus] || "blade-badge"}>{displayStatus}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button className="text-muted-foreground hover:text-primary" onClick={() => setSelectedLink(link)}><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  );
                })}
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
              <Input
                placeholder="e.g. 12999"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1.5"
              />
            </div>

            {/* Description - Secondary Field */}
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                placeholder="e.g. Payment for Full Stack Development Bootcamp"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Customer Name (Optional)</label>
                <Input
                  placeholder="e.g. Priya Sharma"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Mobile Number (Optional)</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Email Address (Optional)</label>
              <Input
                placeholder="priya@example.com"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Reference ID (Optional)</label>
              <Input
                placeholder="e.g. COURSE-001"
                value={formData.referenceId}
                onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                className="mt-1.5"
              />
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
                  {/* Shiprocket Integration - Moved to top */}
                  <div>
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

                  {/* Product Selection with Chips UI */}
                  <div className="border-t border-border pt-4">
                    <label className="text-sm font-medium text-foreground mb-1 block">Tag Products (Optional)</label>
                    <p className="text-xs text-muted-foreground mb-3">Select which products from your catalog the customer is buying</p>

                    {/* Selected Products as Chips */}
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedProducts.map((productId) => {
                          const product = getProductById(productId);
                          if (!product) return null;
                          return (
                            <div
                              key={productId}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                            >
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs opacity-70">₹{product.price.toLocaleString('en-IN')}</span>
                              <button
                                onClick={() => removeProduct(productId)}
                                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Search Input */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products from your catalog..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>

                    {/* Product List - Show when searching or no products selected */}
                    {(productSearchQuery || selectedProducts.length === 0) && (
                      <div className="border border-border rounded-md max-h-40 overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          <div className="divide-y divide-border">
                            {filteredProducts.map((product) => {
                              const isSelected = selectedProducts.includes(product.id);
                              return (
                                <button
                                  key={product.id}
                                  onClick={() => !isSelected && addProduct(product.id)}
                                  disabled={isSelected}
                                  className={`w-full px-3 py-2 text-left hover:bg-secondary/50 transition-colors flex items-center justify-between ${
                                    isSelected ? 'opacity-50 cursor-not-allowed bg-secondary/30' : 'cursor-pointer'
                                  }`}
                                >
                                  <span className="text-sm text-foreground">{product.name}</span>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    ₹{product.price.toLocaleString('en-IN')}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            No products found
                          </div>
                        )}
                      </div>
                    )}

                    {selectedProducts.length === 0 && !productSearchQuery && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Start typing to search and add products
                      </p>
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
                // Validation
                if (!formData.amount || Number(formData.amount) <= 0) {
                  toast.error("Please enter a valid amount");
                  return;
                }

                // Generate unique link ID
                const linkId = `plink_${Math.random().toString(36).substring(2, 15)}`;
                const linkUrl = `${window.location.origin}/pay/${linkId}`;

                // Create new payment link object
                const newPaymentLink = {
                  id: linkId,
                  title: formData.description || `Payment for ₹${formData.amount}`,
                  description: formData.description || "",
                  date: new Date().toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  }),
                  amount: Number(formData.amount),
                  currency: "INR",
                  refId: formData.referenceId || "",
                  customer: formData.customerName || "",
                  status: "active",
                  createdAt: new Date().toISOString(),
                  collectPhone: collectPhone,
                  collectEmail: collectEmail,
                  collectAddress: collectAddress,
                  selectedProducts: selectedProducts,
                  shiprocketEnabled: shiprocketEnabled,
                  whatsappConfirmation: whatsappConfirmationEnabled,
                  acceptPartialPayment: formData.acceptPartialPayment,
                  minPartialAmount: formData.minPartialAmount ? Number(formData.minPartialAmount) : undefined,
                };

                // Save to localStorage
                const stored = localStorage.getItem("payment_links");
                const existingLinks = stored ? JSON.parse(stored) : [];
                const updatedLinks = [newPaymentLink, ...existingLinks];
                localStorage.setItem("payment_links", JSON.stringify(updatedLinks));

                // Update state
                setPaymentLinks(updatedLinks);
                setCreatedLink(linkUrl);
                setCreatedLinkId(linkId);
                setShowCreate(false);
                setShowSuccessModal(true);

                toast.success("Payment link created successfully!");
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
                  window.open(`/pay/${createdLinkId}`, '_blank');
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
                setCreatedLinkId("");
                setSelectedProducts([]);
                setCollectAddress(false);
                setCollectEmail(false);
                setCollectPhone(false);
                setShiprocketEnabled(false);
                setWhatsappConfirmationEnabled(false);
                setShowAdvanced(false);
                setFormData({
                  description: "",
                  amount: "",
                  customerName: "",
                  customerPhone: "",
                  customerEmail: "",
                  referenceId: "",
                  acceptPartialPayment: false,
                  minPartialAmount: "",
                });
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
                <span className="text-2xl font-bold text-foreground">₹{selectedLink.amount.toLocaleString('en-IN')}</span>
                <span className={statusBadgeClass[getDisplayStatus(selectedLink)] || "blade-badge"}>{getDisplayStatus(selectedLink)}</span>
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
                <span className="text-sm text-muted-foreground truncate mr-2">
                  {window.location.origin}/pay/{selectedLink.id}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-shrink-0"
                  onClick={() => copyLink(`${window.location.origin}/pay/${selectedLink.id}`)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/pay/${selectedLink.id}`)}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Preview
                </Button>
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
