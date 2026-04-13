import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, ExternalLink, X, Copy, Eye, Share2, MessageCircle, Mail, ChevronDown, Package, CheckCircle2, FileText, Info, Trash2, Download, Send, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const PINCODE_DB: Record<string, { city: string; state: string }> = {
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "400051": { city: "Mumbai", state: "Maharashtra" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "560037": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "600006": { city: "Chennai", state: "Tamil Nadu" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "110020": { city: "New Delhi", state: "Delhi" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "800001": { city: "Patna", state: "Bihar" },
  "682001": { city: "Kochi", state: "Kerala" },
  "641001": { city: "Coimbatore", state: "Tamil Nadu" },
  "440001": { city: "Nagpur", state: "Maharashtra" },
  "530001": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "160017": { city: "Chandigarh", state: "Chandigarh" },
  "248001": { city: "Dehradun", state: "Uttarakhand" },
  "462001": { city: "Bhopal", state: "Madhya Pradesh" },
  "492001": { city: "Raipur", state: "Chhattisgarh" },
  "781001": { city: "Guwahati", state: "Assam" },
  "452001": { city: "Indore", state: "Madhya Pradesh" },
  "395001": { city: "Surat", state: "Gujarat" },
  "201301": { city: "Noida", state: "Uttar Pradesh" },
  "122001": { city: "Gurugram", state: "Haryana" },
  "131001": { city: "Sonipat", state: "Haryana" },
  "834001": { city: "Ranchi", state: "Jharkhand" },
};

const SAVED_ITEMS = [
  { id: "item_1", name: "Online Course - Full Stack Development", rate: "4999", hsn: "999294", taxRate: "18" },
  { id: "item_2", name: "Monthly Coaching Session", rate: "1500", hsn: "999412", taxRate: "18" },
  { id: "item_3", name: "Annual Software License", rate: "12000", hsn: "997331", taxRate: "18" },
  { id: "item_4", name: "Web Development Services", rate: "25000", hsn: "998313", taxRate: "18" },
  { id: "item_5", name: "E-commerce Product Bundle", rate: "2499", hsn: "621120", taxRate: "5" },
  { id: "item_6", name: "Design Consultation (hourly)", rate: "2000", hsn: "998312", taxRate: "18" },
  { id: "item_7", name: "GST Filing Service", rate: "1499", hsn: "998214", taxRate: "18" },
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
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [collectAddress, setCollectAddress] = useState(false);
  const [shiprocketEnabled, setShiprocketEnabled] = useState(false);
  const [whatsappConfirmationEnabled, setWhatsappConfirmationEnabled] = useState(false);
  // New form state
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySMS, setNotifySMS] = useState(false);
  const [noExpiry, setNoExpiry] = useState(true);
  const [sendReminders, setSendReminders] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  // Receipt state
  const [sendReceiptAuto, setSendReceiptAuto] = useState(true);
  const [show80gDetails, setShow80gDetails] = useState(false);
  const [g80Description, setG80Description] = useState("");
  const [g80SignatureFile, setG80SignatureFile] = useState<File | null>(null);
  const [gstReceiptEnabled, setGstReceiptEnabled] = useState(false);
  const [gstCustomerName, setGstCustomerName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [billingAddressLine, setBillingAddressLine] = useState("");
  const [billingPincode, setBillingPincode] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [shippingAddressLine, setShippingAddressLine] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([{ id: "1", name: "", qty: "", rate: "", hsn: "", taxRate: "" }]);
  // Detail dialog receipt generation state
  const [detailReceiptGenerated, setDetailReceiptGenerated] = useState(false);
  const [detailIncludeGst, setDetailIncludeGst] = useState(false);
  const [detailGstCustomerName, setDetailGstCustomerName] = useState("");
  const [detailGstNumber, setDetailGstNumber] = useState("");
  const [detailGstPlaceOfSupply, setDetailGstPlaceOfSupply] = useState("");
  const [detailGstBillingAddress, setDetailGstBillingAddress] = useState("");
  const [detailInvoiceItems, setDetailInvoiceItems] = useState([{ id: "1", name: "", qty: "", hsn: "", taxRate: "" }]);
  const [showGstModal, setShowGstModal] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    customerPhone: "",
    customerEmail: "",
    referenceId: "",
    acceptPartialPayment: false,
  });

  // Initialize localStorage with sample data and load existing links
  useEffect(() => {
    // Initialize sample products
    const existingProducts = localStorage.getItem("available_products");
    if (!existingProducts) {
      localStorage.setItem("available_products", JSON.stringify(availableProducts));
    }

    // Load existing payment links or create sample ones (v3 forces refresh with paid examples)
    const stored = localStorage.getItem("payment_links");
    const storedVersion = localStorage.getItem("payment_links_version");
    if (stored && storedVersion === "v4") {
      setPaymentLinks(JSON.parse(stored));
    } else {
      const sampleLinks = [
        {
          id: "plink_OnlineCourse001",
          title: "Online Course Payment",
          description: "Advanced React & TypeScript Masterclass",
          date: "10 Apr 2026, 11:20:00 am",
          amount: 4999,
          currency: "INR",
          refId: "COURSE-ADV-2026",
          customer: "Deepak Joshi",
          status: "Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
        },
        {
          id: "plink_CoachingSession042",
          title: "1:1 Strategy Coaching Session",
          description: "60-minute growth strategy coaching session",
          date: "11 Apr 2026, 03:00:00 pm",
          amount: 2500,
          currency: "INR",
          refId: "COACH-042",
          customer: "Sneha Iyer",
          status: "Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: true,
        },
        {
          id: "plink_SaaSInvoice099",
          title: "SaaS Platform Annual Subscription",
          description: "Annual plan for project management tool — Team of 5",
          date: "09 Apr 2026, 10:45:00 am",
          amount: 14999,
          currency: "INR",
          refId: "SAAS-INV-099",
          customer: "Arjun Kapoor",
          status: "Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
        },
        {
          id: "plink_EcommOrder221",
          title: "Floral Kurta Set — Instagram DM",
          description: "Floral print cotton kurta set (M, Pink) — Instagram order #IG221",
          date: "08 Apr 2026, 06:15:00 pm",
          amount: 1299,
          currency: "INR",
          refId: "IG-KUR-221",
          customer: "Meera Nair",
          status: "Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: true,
          shiprocketEnabled: true,
          sendReceiptAuto: true,
        },
        {
          id: "plink_WebDevProject33",
          title: "Website Development — Milestone 2",
          description: "Payment for frontend development milestone (Design + Coding)",
          date: "07 Apr 2026, 02:30:00 pm",
          amount: 35000,
          currency: "INR",
          refId: "WEB-M2-VIKRAM",
          customer: "Vikram Bose",
          status: "Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
        },
        {
          id: "plink_SchoolFeeQ1_07",
          title: "School Fee — Q1 Term",
          description: "Term fee for Q1 2026 — Class 8B",
          date: "05 Apr 2026, 09:00:00 am",
          amount: 18500,
          currency: "INR",
          refId: "SCH-FEE-Q1-07",
          customer: "Ramesh Pillai",
          status: "Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
        },
        {
          id: "plink_ConsultationFee55",
          title: "Legal Consultation Fee",
          description: "2-hour IP rights consultation",
          date: "04 Apr 2026, 05:00:00 pm",
          amount: 8000,
          currency: "INR",
          refId: "LEGAL-CONSULT-55",
          customer: "Fatima Sheikh",
          status: "Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
        },
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
      localStorage.setItem("payment_links_version", "v4");
      setPaymentLinks(sampleLinks);
    }
  }, []);

  // Reset receipt form state when selected link changes
  useEffect(() => {
    setShowGstModal(false);
    setDetailReceiptGenerated(false);
    setDetailIncludeGst(false);
    setDetailGstCustomerName("");
    setDetailGstNumber("");
    setDetailGstPlaceOfSupply("");
    setDetailGstBillingAddress("");
    setDetailInvoiceItems([{ id: "1", name: "", qty: "", hsn: "", taxRate: "" }]);
  }, [selectedLink]);

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

  const getProductById = (id: string) => availableProducts.find((p) => p.id === id);

  const resetCreateForm = () => {
    setFormData({ description: "", amount: "", customerPhone: "", customerEmail: "", referenceId: "", acceptPartialPayment: false });
    setNotifyEmail(false);
    setNotifySMS(false);
    setNoExpiry(true);
    setSendReminders(false);
    setExpiryDate("");
    setSelectedProducts([]);
    setShiprocketEnabled(false);
    setWhatsappConfirmationEnabled(false);
    setCollectAddress(false);
    setSendReceiptAuto(true);
    setShow80gDetails(false);
    setG80Description("");
    setG80SignatureFile(null);
    setGstReceiptEnabled(false);
    setGstCustomerName("");
    setGstNumber("");
    setPlaceOfSupply("");
    setBillingAddress("");
    setShippingAddress("");
    setShippingSameAsBilling(false);
    setInvoiceItems([{ id: "1", name: "", qty: "", hsn: "", taxRate: "" }]);
  };

  const handleCreateLink = () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const linkId = `plink_${Math.random().toString(36).substring(2, 15)}`;
    const linkUrl = `${window.location.origin}/pay/${linkId}`;
    const newPaymentLink = {
      id: linkId,
      title: formData.description || `Payment for ₹${formData.amount}`,
      description: formData.description || "",
      date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      amount: Number(formData.amount),
      currency: "INR",
      refId: formData.referenceId || "",
      customer: "",
      status: "active",
      createdAt: new Date().toISOString(),
      collectPhone: notifySMS,
      collectEmail: notifyEmail,
      collectAddress,
      selectedProducts,
      shiprocketEnabled,
      whatsappConfirmation: whatsappConfirmationEnabled,
      acceptPartialPayment: formData.acceptPartialPayment,
      sendReceiptAuto,
    };
    const stored = localStorage.getItem("payment_links");
    const existingLinks = stored ? JSON.parse(stored) : [];
    const updatedLinks = [newPaymentLink, ...existingLinks];
    localStorage.setItem("payment_links", JSON.stringify(updatedLinks));
    setPaymentLinks(updatedLinks);
    setCreatedLink(linkUrl);
    setCreatedLinkId(linkId);
    setShowCreate(false);
    setShowSuccessModal(true);
    toast.success("Payment link created successfully!");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Payment Links</h1>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Create Payment Link</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-4 sm:gap-6 border-b border-border min-w-max">
            <span className="blade-tab-active whitespace-nowrap">Payment Links</span>
            <span className="blade-tab whitespace-nowrap hidden sm:inline-flex">Reminder Settings</span>
            <span className="blade-tab whitespace-nowrap hidden md:inline-flex items-center gap-1">Need help? Take a tour</span>
            <span className="blade-tab whitespace-nowrap hidden lg:inline-flex items-center gap-1">Documentation <span className="blade-badge-new ml-1">new</span></span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 min-w-max">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "blade-filter-chip-active" : "blade-filter-chip"}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex ml-auto items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </div>
        </div>

        {/* Active Filters */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 text-sm min-w-max">
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
              Status: All <X className="h-3 w-3 cursor-pointer hover:text-foreground" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
              Duration: 19/02/26 - 26/02/26 <X className="h-3 w-3 cursor-pointer hover:text-foreground" />
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="blade-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Payment Link Id</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Created At</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Amount</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden md:table-cell">Reference Id</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden lg:table-cell">Customer</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Payment Link</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link) => {
                  const displayStatus = getDisplayStatus(link);
                  const linkUrl = `${window.location.origin}/pay/${link.id}`;
                  return (
                    <tr key={link.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-3 sm:px-5 py-3 font-medium text-primary cursor-pointer hover:underline text-xs sm:text-sm" onClick={() => setSelectedLink(link)}>
                        <span className="block max-w-[100px] truncate">{link.id}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm whitespace-nowrap">{link.date}</td>
                      <td className="px-3 sm:px-5 py-3 text-foreground text-xs sm:text-sm whitespace-nowrap">₹{link.amount.toLocaleString('en-IN')}</td>
                      <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden md:table-cell">{link.refId || "—"}</td>
                      <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{link.customer || "—"}</td>
                      <td className="px-3 sm:px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/pay/${link.id}`)}
                            className="text-xs sm:text-sm text-primary hover:underline cursor-pointer truncate max-w-[120px] sm:max-w-[200px]"
                          >
                            {linkUrl}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(linkUrl);
                            }}
                            className="hover:text-primary text-muted-foreground flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/pay/${link.id}`, '_blank');
                            }}
                            className="hover:text-primary text-muted-foreground flex-shrink-0 hidden sm:block"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <span className={`${statusBadgeClass[displayStatus] || "blade-badge"} text-xs whitespace-nowrap`}>{displayStatus}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <button className="text-muted-foreground hover:text-primary" onClick={() => setSelectedLink(link)}><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-3 sm:px-5 py-3 text-center text-xs sm:text-sm text-muted-foreground">
            Showing 1 - {filtered.length}
          </div>
        </div>
      </div>

      {/* Create Payment Link Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">Standard Payment Link</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Amount */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Amount <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg bg-muted/30 text-sm text-muted-foreground whitespace-nowrap select-none">
                  ₹ (INR) <X className="h-3.5 w-3.5 cursor-pointer hover:text-foreground" />
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Payment For */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Payment For</label>
              <Input
                placeholder="Payment description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="text-base font-bold text-foreground mb-3">Customer Details</h3>

              {/* Email */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="john@example.com"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notifyEmail"
                    checked={notifyEmail}
                    onCheckedChange={(checked) => setNotifyEmail(!!checked)}
                  />
                  <label htmlFor="notifyEmail" className="text-sm text-foreground cursor-pointer">
                    Notify via Email
                  </label>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center border border-input rounded-lg overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-r border-input bg-muted/20 text-sm whitespace-nowrap cursor-pointer hover:bg-muted/40 transition-colors select-none">
                    🇮🇳 India <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="px-3 py-2 text-sm text-muted-foreground border-r border-input select-none">+91</span>
                  <Input
                    placeholder="1234 567890"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notifySMS"
                    checked={notifySMS}
                    onCheckedChange={(checked) => setNotifySMS(!!checked)}
                  />
                  <label htmlFor="notifySMS" className="text-sm text-foreground cursor-pointer">
                    Notify via SMS
                  </label>
                </div>
              </div>

              {/* More ways to notify */}
              <button className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1">
                More ways to notify <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Reference Id */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Reference Id</label>
              <Input
                placeholder="123456"
                value={formData.referenceId}
                onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              />
            </div>

            {/* Link Expiry */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Link Expiry</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="noExpiry"
                    checked={noExpiry}
                    onCheckedChange={(checked) => setNoExpiry(!!checked)}
                  />
                  <label htmlFor="noExpiry" className="text-sm text-foreground cursor-pointer">
                    No Expiry
                  </label>
                </div>
                {!noExpiry && (
                  <Input
                    placeholder="DD/MM/YYYY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Reminders */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Reminders</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch checked={sendReminders} onCheckedChange={setSendReminders} />
                  <span className="text-sm text-foreground">Send auto reminders</span>
                </div>
                {sendReminders && (
                  <p className="text-xs text-muted-foreground pl-1">
                    1 auto reminders will be sent to this customer based on the reminder settings
                  </p>
                )}
              </div>
            </div>

            {/* Partial Payment */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Partial Payment</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.acceptPartialPayment}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptPartialPayment: checked })}
                />
                <span className="text-sm text-foreground">Enable Partial Payment</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Notes</label>
              <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                + Add New
              </button>
            </div>

            {/* Receipt Settings */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/30 border-b border-border">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Payment Receipts Settings</span>
              </div>

              <div className="px-4 py-4 space-y-4">
                {/* Single checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sendReceiptAuto"
                    checked={sendReceiptAuto}
                    onCheckedChange={(checked) => setSendReceiptAuto(!!checked)}
                  />
                  <label htmlFor="sendReceiptAuto" className="text-sm font-medium text-foreground cursor-pointer">
                    Send Payment Confirmation Receipt PDF
                  </label>
                </div>

                {/* Links */}
                <div className="flex items-center gap-4">
                  <a href="https://razorpay.com/docs/payments/payment-pages/receipt/#pdf-receipt-to-customers" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    Sample Receipt <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a href="https://razorpay.com/docs/payments/payment-pages/receipt/" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    Know More <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <Separator />

                {/* GST Receipt Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">GST Receipt</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Generate GST-compliant invoice with customer &amp; tax details</p>
                  </div>
                  <Switch checked={gstReceiptEnabled} onCheckedChange={setGstReceiptEnabled} />
                </div>

                {/* GST Invoice Details Form */}
                {gstReceiptEnabled && (
                  <div className="border border-border rounded-lg p-4 space-y-4 bg-secondary/10">
                    <p className="text-sm font-semibold text-foreground">Add Details for Invoice</p>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Customer Name</label>
                      <Input placeholder="Enter customer name" value={gstCustomerName} onChange={(e) => setGstCustomerName(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">GST <span className="text-muted-foreground/60">(Optional)</span></label>
                      <Input placeholder="22AAAAA0000A1Z5" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Place of Supply</label>
                      <Select value={placeOfSupply} onValueChange={setPlaceOfSupply}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Billing Address</label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Street address"
                          value={billingAddressLine}
                          onChange={(e) => {
                            setBillingAddressLine(e.target.value);
                            if (shippingSameAsBilling) setShippingAddressLine(e.target.value);
                          }}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Input
                              placeholder="Pincode"
                              maxLength={6}
                              value={billingPincode}
                              onChange={(e) => {
                                const pin = e.target.value.replace(/\D/g, "");
                                setBillingPincode(pin);
                                if (shippingSameAsBilling) setShippingPincode(pin);
                                if (pin.length === 6 && PINCODE_DB[pin]) {
                                  setBillingCity(PINCODE_DB[pin].city);
                                  setBillingState(PINCODE_DB[pin].state);
                                  if (shippingSameAsBilling) {
                                    setShippingCity(PINCODE_DB[pin].city);
                                    setShippingState(PINCODE_DB[pin].state);
                                  }
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="City"
                              value={billingCity}
                              onChange={(e) => {
                                setBillingCity(e.target.value);
                                if (shippingSameAsBilling) setShippingCity(e.target.value);
                              }}
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="State"
                              value={billingState}
                              onChange={(e) => {
                                setBillingState(e.target.value);
                                if (shippingSameAsBilling) setShippingState(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Shipping Address</label>
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          id="shippingSameAsBilling"
                          checked={shippingSameAsBilling}
                          onCheckedChange={(checked) => {
                            setShippingSameAsBilling(!!checked);
                            if (checked) {
                              setShippingAddressLine(billingAddressLine);
                              setShippingPincode(billingPincode);
                              setShippingCity(billingCity);
                              setShippingState(billingState);
                            }
                          }}
                        />
                        <label htmlFor="shippingSameAsBilling" className="text-xs text-muted-foreground cursor-pointer">
                          Same as billing address
                        </label>
                      </div>
                      {!shippingSameAsBilling && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Street address"
                            value={shippingAddressLine}
                            onChange={(e) => setShippingAddressLine(e.target.value)}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Input
                                placeholder="Pincode"
                                maxLength={6}
                                value={shippingPincode}
                                onChange={(e) => {
                                  const pin = e.target.value.replace(/\D/g, "");
                                  setShippingPincode(pin);
                                  if (pin.length === 6 && PINCODE_DB[pin]) {
                                    setShippingCity(PINCODE_DB[pin].city);
                                    setShippingState(PINCODE_DB[pin].state);
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <Input
                                placeholder="City"
                                value={shippingCity}
                                onChange={(e) => setShippingCity(e.target.value)}
                              />
                            </div>
                            <div>
                              <Input
                                placeholder="State"
                                value={shippingState}
                                onChange={(e) => setShippingState(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Invoice Items */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Items</label>
                      <div className="space-y-2">
                        {invoiceItems.map((item, idx) => (
                          <div key={item.id} className="border border-border rounded-md p-3 space-y-2 bg-background">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">Item {idx + 1}</span>
                              {invoiceItems.length > 1 && (
                                <button
                                  onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <Select
                              value=""
                              onValueChange={(val) => {
                                if (val === "__new__") return;
                                const saved = SAVED_ITEMS.find((s) => s.id === val);
                                if (saved) {
                                  const updated = [...invoiceItems];
                                  updated[idx] = { ...item, name: saved.name, rate: saved.rate, hsn: saved.hsn, taxRate: saved.taxRate };
                                  setInvoiceItems(updated);
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs text-muted-foreground border-dashed">
                                <SelectValue placeholder="Select from saved items or fill below" />
                              </SelectTrigger>
                              <SelectContent>
                                {SAVED_ITEMS.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name} — ₹{s.rate}</SelectItem>
                                ))}
                                <SelectItem value="__new__">+ Create new item</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...invoiceItems];
                                updated[idx] = { ...item, name: e.target.value };
                                setInvoiceItems(updated);
                              }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const updated = [...invoiceItems];
                                    updated[idx] = { ...item, qty: e.target.value };
                                    setInvoiceItems(updated);
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Rate (₹)</label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.rate}
                                  onChange={(e) => {
                                    const updated = [...invoiceItems];
                                    updated[idx] = { ...item, rate: e.target.value };
                                    setInvoiceItems(updated);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">HSN/SAC Code</label>
                                <Input
                                  placeholder="e.g. 998313"
                                  value={item.hsn}
                                  onChange={(e) => {
                                    const updated = [...invoiceItems];
                                    updated[idx] = { ...item, hsn: e.target.value };
                                    setInvoiceItems(updated);
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Tax Rate</label>
                                <Select
                                  value={item.taxRate}
                                  onValueChange={(val) => {
                                    const updated = [...invoiceItems];
                                    updated[idx] = { ...item, taxRate: val };
                                    setInvoiceItems(updated);
                                  }}
                                >
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Select rate" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">0% (Exempt)</SelectItem>
                                    <SelectItem value="5">5%</SelectItem>
                                    <SelectItem value="12">12%</SelectItem>
                                    <SelectItem value="18">18%</SelectItem>
                                    <SelectItem value="28">28%</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setInvoiceItems([...invoiceItems, { id: Date.now().toString(), name: "", qty: "", rate: "", hsn: "", taxRate: "" }])}
                        className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>
                )}

                <Separator />

                {/* 80g Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show80g"
                      checked={show80gDetails}
                      onCheckedChange={(checked) => setShow80gDetails(!!checked)}
                    />
                    <label htmlFor="show80g" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                      Show 80g Details on Receipt
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                  </div>

                  {show80gDetails && (
                    <div className="ml-6 space-y-4 mt-2 p-4 rounded-lg border border-border bg-muted/30">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">80g Details</p>

                      {/* 80g Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">80g Description</label>
                          <a
                            href="https://razorpay.com/docs/payments/payment-pages/80g-receipt/#pdf-receipt-to-customers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Sample 80g Receipt
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <textarea
                          value={g80Description}
                          onChange={(e) => setG80Description(e.target.value)}
                          placeholder="All donations made to us are eligible for tax exemption under 80G of IT act"
                          rows={3}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      </div>

                      {/* Signature Upload */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          Signature of Authorised Person{" "}
                          <span className="text-muted-foreground font-normal">(Optional)</span>
                        </label>
                        <label
                          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                        >
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              if (file && file.size > 500 * 1024) {
                                toast.error("File size must be under 500 KB");
                                return;
                              }
                              setG80SignatureFile(file);
                            }}
                          />
                          {g80SignatureFile ? (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{g80SignatureFile.name}</span>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive ml-1"
                                onClick={(e) => { e.preventDefault(); setG80SignatureFile(null); }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <span>Drag file here or</span>
                                <span className="text-blue-600 font-medium underline-offset-2 hover:underline">Upload</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Upload .png, .jpg or .jpeg file | 500 KB Max</p>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { setShow80gDetails(false); setG80Description(""); setG80SignatureFile(null); }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => toast.success("80g details saved")}
                        >
                          Save details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0 bg-background">
            <Button variant="outline" className="px-6" onClick={() => { setShowCreate(false); resetCreateForm(); }}>
              Cancel
            </Button>
            <Button className="px-6 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateLink}>
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
                resetCreateForm();
              }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Detail Panel — slides in from the right */}
      <Dialog open={!!selectedLink} onOpenChange={() => setSelectedLink(null)}>
        <DialogContent className="!fixed !left-auto !right-0 !top-0 !translate-x-0 !translate-y-0 !h-screen !max-h-screen w-[480px] !rounded-none border-l border-border shadow-xl flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Payment Link Details</span>
            </DialogTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-mono text-xs text-muted-foreground">{selectedLink?.id}</span>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => copyLink(selectedLink?.id || "")}
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </DialogHeader>
          {selectedLink && (
            <div className="overflow-y-auto flex-1 divide-y divide-border px-5">
              {/* Link Type */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Link Type</span>
                <span className="text-sm font-medium text-right">Standard Payment Link</span>
              </div>

              {/* Payment For */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Payment For</span>
                <span className="text-sm font-medium text-right">{selectedLink.title || selectedLink.description || "—"}</span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Status</span>
                <span className={statusBadgeClass[getDisplayStatus(selectedLink)] || "blade-badge"}>{getDisplayStatus(selectedLink)}</span>
              </div>

              {/* Partial Payment */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Partial Payment</span>
                <span className="text-sm font-medium">{selectedLink.acceptPartialPayment ? "Enabled" : "Disabled"}</span>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Amount</span>
                <span className="text-sm font-medium">₹ {selectedLink.amount.toLocaleString('en-IN')}</span>
              </div>

              {/* Amount Paid — only when Paid */}
              {getDisplayStatus(selectedLink) === "Paid" && (
                <div className="flex justify-between items-start py-3">
                  <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Amount Paid</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-700">₹ {selectedLink.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-blue-600 mt-0.5">pay_{selectedLink.id.slice(-12)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Paid on {selectedLink.date}</p>
                  </div>
                </div>
              )}

              {/* Link URL */}
              <div className="flex justify-between items-center py-3 gap-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Link Url</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs text-blue-600 truncate max-w-[170px]">rzp.io/l/{selectedLink.id.slice(-8)}</span>
                  <button
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => copyLink(`${window.location.origin}/pay/${selectedLink.id}`)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Notify At */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Notify At</span>
                <div className="flex items-center gap-1.5 text-sm font-medium flex-wrap justify-end">
                  {selectedLink.collectPhone !== false && <span>• Sms</span>}
                  {selectedLink.collectEmail !== false && <span>• Email</span>}
                  {selectedLink.whatsappConfirmation && <span>• WhatsApp</span>}
                </div>
              </div>

              {/* Customer Details */}
              <div className="flex justify-between items-start py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Customer Details</span>
                <div className="text-right">
                  {selectedLink.customer
                    ? <p className="text-sm font-medium">{selectedLink.customer}</p>
                    : <span className="text-sm text-muted-foreground">—</span>
                  }
                </div>
              </div>

              {/* Reminders */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Reminders</span>
                <div className="flex items-center gap-2 opacity-50 pointer-events-none">
                  <span className="text-sm">Send auto reminders</span>
                  <Switch checked={false} />
                </div>
              </div>

              {/* Reference Id */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Reference Id</span>
                <span className="text-sm font-medium">{selectedLink.refId || "—"}</span>
              </div>

              {/* Created By */}
              <div className="flex justify-between items-start py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Created By</span>
                <div className="text-right">
                  <p className="text-sm font-medium">Manish R.</p>
                  <p className="text-xs text-muted-foreground">manishreddy.t@razorpay.com</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap py-3">
                <Button variant="outline" size="sm" onClick={() => navigate(`/pay/${selectedLink.id}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview
                </Button>
                {["WhatsApp", "SMS", "Email"].map((m) => (
                  <Button key={m} variant="outline" size="sm" onClick={() => toast.success(`Shared via ${m}`)}>{m}</Button>
                ))}
              </div>

              {/* Receipt Section */}
              <div className="space-y-3 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Receipt</span>
                </div>

                {getDisplayStatus(selectedLink) !== "Paid" ? (
                  <p className="text-xs text-muted-foreground">Receipt will be available once payment is completed.</p>
                ) : selectedLink.sendReceiptAuto === true && !detailReceiptGenerated ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Receipt was automatically sent to the customer after payment.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"
                      onClick={() => toast.success("Receipt downloaded!")}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                ) : detailReceiptGenerated ? (
                  <div className="space-y-3">
                    <p className="text-xs flex items-center gap-1.5 text-green-700 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {detailIncludeGst ? "GST Receipt" : "Receipt"} generated successfully.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"
                        onClick={() => toast.success("Receipt downloaded!")}>
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                      <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                        onClick={() => toast.success("Receipt sent via WhatsApp!")}>
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                        onClick={() => toast.success("Receipt sent via Email!")}>
                        <Mail className="h-3.5 w-3.5" /> Email
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                        onClick={() => toast.success("Receipt sent via SMS!")}>
                        <Send className="h-3.5 w-3.5" /> SMS
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 space-y-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Receipt not generated</p>
                        <p className="text-xs text-amber-700 mt-0.5">Choose the type of receipt to generate for this payment.</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-8 w-full border-amber-300 bg-white hover:bg-amber-50"
                      onClick={() => {
                        setDetailReceiptGenerated(true);
                        setDetailIncludeGst(false);
                        toast.success("Payment receipt generated and downloaded!");
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" /> Generate Payment Receipt
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 w-full"
                      onClick={() => setShowGstModal(true)}
                    >
                      <Receipt className="h-3.5 w-3.5" /> Generate Receipt with GST &amp; Tax Details
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* GST Receipt Modal */}
      <Dialog open={showGstModal} onOpenChange={setShowGstModal}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="pb-3 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Generate GST Receipt
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 p-1">
            <div className="space-y-4">
              {/* Customer Details */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Customer Details</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Customer Name *</label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. Acme Pvt Ltd"
                    value={detailGstCustomerName}
                    onChange={(e) => setDetailGstCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    GST Number <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    value={detailGstNumber}
                    onChange={(e) => setDetailGstNumber(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Place of Supply *</label>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      value={detailGstPlaceOfSupply}
                      onChange={(e) => setDetailGstPlaceOfSupply(e.target.value)}
                    >
                      <option value="">Select state</option>
                      {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Billing Address *</label>
                    <Input
                      className="h-9 text-sm"
                      placeholder="Street, City, PIN"
                      value={detailGstBillingAddress}
                      onChange={(e) => setDetailGstBillingAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Invoice Items</p>
                <div className="space-y-2">
                  {detailInvoiceItems.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-[1fr_60px_80px_90px_24px] gap-2 items-center">
                      <Input
                        className="h-8 text-sm"
                        placeholder="Item / service name"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...detailInvoiceItems];
                          updated[idx].name = e.target.value;
                          setDetailInvoiceItems(updated);
                        }}
                      />
                      <Input
                        className="h-8 text-sm text-center"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...detailInvoiceItems];
                          updated[idx].qty = e.target.value;
                          setDetailInvoiceItems(updated);
                        }}
                      />
                      <Input
                        className="h-8 text-sm"
                        placeholder="HSN/SAC"
                        value={item.hsn}
                        onChange={(e) => {
                          const updated = [...detailInvoiceItems];
                          updated[idx].hsn = e.target.value;
                          setDetailInvoiceItems(updated);
                        }}
                      />
                      <select
                        className="h-8 text-sm border border-input rounded-md px-2 bg-background"
                        value={item.taxRate}
                        onChange={(e) => {
                          const updated = [...detailInvoiceItems];
                          updated[idx].taxRate = e.target.value;
                          setDetailInvoiceItems(updated);
                        }}
                      >
                        <option value="">Tax %</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                      {detailInvoiceItems.length > 1 && (
                        <button
                          onClick={() => setDetailInvoiceItems(detailInvoiceItems.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setDetailInvoiceItems([...detailInvoiceItems, { id: String(Date.now()), name: "", qty: "", hsn: "", taxRate: "" }])}
                >
                  + Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 px-4 py-4 border-t border-border flex-shrink-0">
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setDetailReceiptGenerated(true);
                setDetailIncludeGst(true);
                setShowGstModal(false);
                toast.success("GST Receipt generated and downloaded!");
              }}
            >
              <Download className="h-3.5 w-3.5" /> Generate &amp; Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => {
                setDetailReceiptGenerated(true);
                setDetailIncludeGst(true);
                setShowGstModal(false);
                toast.success("GST Receipt generated and sent to customer!");
              }}
            >
              <Send className="h-3.5 w-3.5" /> Generate &amp; Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PaymentLinks;
