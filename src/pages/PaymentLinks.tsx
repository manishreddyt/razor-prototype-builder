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
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);
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
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [itemSuggestionOpen, setItemSuggestionOpen] = useState<number | null>(null);
  const [invoiceItems, setInvoiceItems] = useState([{ id: "1", name: "", description: "", qty: "", rate: "", hsn: "", taxRate: "" }]);
  // Detail dialog receipt generation state
  const [detailReceiptGenerated, setDetailReceiptGenerated] = useState(false);
  const [detailIncludeGst, setDetailIncludeGst] = useState(false);
  const [detailGstCustomerName, setDetailGstCustomerName] = useState("");
  const [detailGstNumber, setDetailGstNumber] = useState("");
  const [detailGstPlaceOfSupply, setDetailGstPlaceOfSupply] = useState("");
  const [detailBillingAddress, setDetailBillingAddress] = useState("");
  const [detailBillingCity, setDetailBillingCity] = useState("");
  const [detailBillingState, setDetailBillingState] = useState("");
  const [detailBillingPincode, setDetailBillingPincode] = useState("");
  const [detailShippingSameAsBilling, setDetailShippingSameAsBilling] = useState(false);
  const [detailShippingAddress, setDetailShippingAddress] = useState("");
  const [detailShippingCity, setDetailShippingCity] = useState("");
  const [detailShippingState, setDetailShippingState] = useState("");
  const [detailShippingPincode, setDetailShippingPincode] = useState("");
  const [detailInvoiceItems, setDetailInvoiceItems] = useState([{ id: "1", name: "", qty: "", rate: "", hsn: "", taxRate: "" }]);
  const [showGstModal, setShowGstModal] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    customerPhone: "",
    customerEmail: "",
    referenceId: "",
  });
  // Multi-payment state
  const [collectInMultiplePayments, setCollectInMultiplePayments] = useState(false);
  const [multiPaymentMode, setMultiPaymentMode] = useState<"schedule" | "customer_choice">("schedule");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [installments, setInstallments] = useState([
    { id: "1", label: "Payment 1", amount: "", dueDate: new Date().toISOString().split('T')[0], description: "" },
    { id: "2", label: "Payment 2", amount: "", dueDate: "", description: "" },
  ]);

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
    if (stored && storedVersion === "v5") {
      setPaymentLinks(JSON.parse(stored));
    } else {
      const sampleLinks = [
        {
          id: "demo-wj-001",
          title: "Business Management Programme",
          description: "3-month intensive programme · Batch starting 1 May 2026",
          date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          amount: 12000,
          currency: "INR",
          status: "Created",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
          collectInMultiplePayments: true,
          multiPaymentMode: "schedule",
          installments: [
            { id: "1", label: "Payment 1 — Enrolment Fee", amount: 4000, dueDate: new Date().toISOString().split("T")[0], description: "" },
            { id: "2", label: "Payment 2 — Month 2", amount: 4000, dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], description: "" },
            { id: "3", label: "Payment 3 — Month 3", amount: 4000, dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0], description: "" },
          ],
        },
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
      localStorage.setItem("payment_links_version", "v5");
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
    setDetailBillingAddress("");
    setDetailBillingCity("");
    setDetailBillingState("");
    setDetailBillingPincode("");
    setDetailShippingSameAsBilling(false);
    setDetailShippingAddress("");
    setDetailShippingCity("");
    setDetailShippingState("");
    setDetailShippingPincode("");
    setDetailInvoiceItems([{ id: "1", name: "", qty: "", rate: "", hsn: "", taxRate: "" }]);
  }, [selectedLink]);

  // Auto-recalculate equal split when amount changes
  useEffect(() => {
    if (collectInMultiplePayments && splitType === "equal" && formData.amount && Number(formData.amount) > 0) {
      const target = Number(formData.amount);
      const count = installments.length;
      const baseAmt = Math.floor(target / count * 100) / 100;
      const lastAmt = Math.round((target - baseAmt * (count - 1)) * 100) / 100;
      setInstallments(prev => prev.map((inst, idx) => ({
        ...inst,
        amount: idx === count - 1 ? lastAmt.toFixed(2) : baseAmt.toFixed(2),
      })));
    }
  }, [formData.amount, splitType, collectInMultiplePayments, installments.length]);

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
    setFormData({ description: "", amount: "", customerPhone: "", customerEmail: "", referenceId: "" });
    setCollectInMultiplePayments(false);
    setMultiPaymentMode("schedule");
    setSplitType("equal");
    setInstallments([
      { id: "1", label: "Payment 1", amount: "", dueDate: new Date().toISOString().split('T')[0], description: "" },
      { id: "2", label: "Payment 2", amount: "", dueDate: "", description: "" },
    ]);
    setNotifyEmail(false);
    setNotifySMS(false);
    setNotifyWhatsApp(false);
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
    setBillingAddressLine("");
    setShippingAddressLine("");
    setShippingSameAsBilling(false);
    setShowShippingAddress(false);
    setItemSuggestionOpen(null);
    setInvoiceItems([{ id: "1", name: "", description: "", qty: "", rate: "", hsn: "", taxRate: "" }]);
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
      notifyWhatsApp: notifyWhatsApp,
      collectAddress,
      selectedProducts,
      shiprocketEnabled,
      whatsappConfirmation: whatsappConfirmationEnabled,
      collectInMultiplePayments,
      multiPaymentMode: collectInMultiplePayments ? multiPaymentMode : undefined,
      splitType: collectInMultiplePayments && multiPaymentMode === "schedule" ? splitType : undefined,
      installments: collectInMultiplePayments && multiPaymentMode === "schedule" ? installments.map(i => ({ ...i, amount: Number(i.amount) })) : undefined,
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

  const handleDownloadInvoicePdf = () => {
    const items = detailInvoiceItems.filter(i => i.name || i.rate);
    const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.rate) || 0) * (parseFloat(i.qty) || 1), 0);
    const taxAmt = items.reduce((sum, i) => {
      const lineAmt = (parseFloat(i.rate) || 0) * (parseFloat(i.qty) || 1);
      return sum + lineAmt * ((parseFloat(i.taxRate) || 0) / 100);
    }, 0);
    const total = subtotal + taxAmt;
    const invoiceNumber = `INV-${(selectedLink?.id || "000000").slice(-6).toUpperCase()}`;
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const dueDate = new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const shippingAddr = detailShippingSameAsBilling
      ? { addr: detailBillingAddress, city: detailBillingCity, state: detailBillingState, pin: detailBillingPincode }
      : { addr: detailShippingAddress, city: detailShippingCity, state: detailShippingState, pin: detailShippingPincode };

    const itemRows = items.map(i => {
      const lineAmt = (parseFloat(i.rate) || 0) * (parseFloat(i.qty) || 1);
      return `<tr>
        <td>
          <div class="item-name">${i.name || "—"}</div>
          ${i.hsn ? `<div class="item-hsn">HSN/SAC: ${i.hsn}</div>` : ""}
        </td>
        <td>₹ ${(parseFloat(i.rate) || 0).toFixed(2)}</td>
        <td>${i.qty || 1}</td>
        <td>${i.taxRate ? `${i.taxRate}%` : "—"}</td>
        <td>₹ ${lineAmt.toFixed(2)}<div class="amount-note">${(parseFloat(i.rate) || 0).toFixed(2)} × ${i.qty || 1}</div></td>
      </tr>`;
    }).join("");

    const taxBreakdownRows = items.filter(i => i.taxRate && parseFloat(i.taxRate) > 0).map(i => {
      const lineAmt = (parseFloat(i.rate) || 0) * (parseFloat(i.qty) || 1);
      const halfRate = parseFloat(i.taxRate) / 2;
      const halfTax = lineAmt * halfRate / 100;
      return `<div class="total-row tax-indent"><span>CGST ${halfRate}%${i.name ? ` (${i.name})` : ""}</span><span>₹ ${halfTax.toFixed(2)}</span></div>
      <div class="total-row tax-indent"><span>SGST ${halfRate}%${i.name ? ` (${i.name})` : ""}</span><span>₹ ${halfTax.toFixed(2)}</span></div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ebebeb; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 48px 20px; color: #000; -webkit-font-smoothing: antialiased; }
    .invoice-wrapper { width: 100%; max-width: 860px; }
    .invoice-card { background: #fff; border-radius: 6px; box-shadow: 0 2px 24px rgba(0,0,0,0.07); overflow: hidden; }
    .header { padding: 40px 52px 32px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .company-name { font-size: 18px; font-weight: 700; color: #000; letter-spacing: -0.3px; line-height: 1.2; margin-bottom: 10px; }
    .company-ids { font-size: 11px; color: #666; line-height: 1.75; }
    .company-ids b { font-weight: 600; color: #333; }
    .header-right { text-align: right; }
    .invoice-word { font-size: 32px; font-weight: 700; color: #000; letter-spacing: -0.5px; line-height: 1; margin-bottom: 14px; }
    .amount-due-block { margin-bottom: 10px; }
    .amount-due-label { font-size: 10px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
    .amount-due-value { font-size: 28px; font-weight: 700; color: #000; letter-spacing: -0.8px; line-height: 1; }
    .status-unpaid { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; color: #000; border: 1.5px solid #000; padding: 5px 14px; border-radius: 100px; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 8px; }
    .dot-unpaid { width: 6px; height: 6px; background: #000; border-radius: 50%; }
    .meta-row { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
    .meta-left { display: flex; gap: 44px; flex-wrap: wrap; }
    .meta-label { font-size: 10px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; }
    .meta-value { font-size: 13.5px; font-weight: 600; color: #000; }
    .divider { height: 1px; background: #f0f0f0; margin: 0 52px; }
    .parties-section { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 28px 52px; gap: 0; }
    .party-block { padding-right: 32px; }
    .party-block:last-child { padding-right: 0; }
    .party-label { font-size: 10px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; }
    .party-name { font-size: 14px; font-weight: 700; color: #000; margin-bottom: 4px; }
    .party-detail { font-size: 12.5px; color: #444; line-height: 1.8; }
    .table-section { padding: 0 52px; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .items-table thead tr { background: #f8f8f8; }
    .items-table th { padding: 11px 14px; font-size: 10px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1.2px; text-align: left; white-space: nowrap; }
    .items-table th:first-child { border-radius: 4px 0 0 4px; }
    .items-table th:last-child  { border-radius: 0 4px 4px 0; }
    .items-table th:not(:first-child) { text-align: right; }
    .items-table td { padding: 20px 14px; vertical-align: top; color: #222; font-size: 13px; }
    .items-table td:not(:first-child) { text-align: right; }
    .item-name { font-weight: 600; color: #000; font-size: 13.5px; margin-bottom: 3px; }
    .item-hsn  { font-size: 10.5px; color: #999; font-weight: 500; }
    .amount-note { font-size: 10px; color: #aaa; margin-top: 2px; }
    .totals-section { padding: 24px 52px 32px; display: flex; justify-content: flex-end; }
    .totals-box { width: 300px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; font-size: 13px; color: #444; }
    .total-row.subtotal-row { color: #555; }
    .total-row.tax-row { color: #555; font-size: 12.5px; }
    .total-row.tax-indent { color: #888; font-size: 12px; padding: 3px 0 3px 14px; }
    .total-row.grand { font-size: 15px; font-weight: 700; color: #000; padding-top: 14px; margin-top: 6px; border-top: 1.5px solid #000; }
    .amount-due-row { margin-top: 16px; background: #000; border-radius: 6px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
    .amount-due-row-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1.2px; }
    .amount-due-row-value { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .total-label { font-weight: 400; }
    .notes-tc-divider { height: 1px; background: #f0f0f0; margin: 0 52px 28px; }
    .footer { padding: 18px 52px; background: #f8f8f8; display: flex; align-items: center; justify-content: center; }
    .rzp-powered { display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .rzp-powered-text { font-size: 11px; color: #aaa; letter-spacing: 0.2px; }
    .rzp-logo-row { display: flex; align-items: center; gap: 7px; }
    .rzp-icon { width: 20px; height: 20px; }
    .rzp-wordmark { font-size: 14px; font-weight: 700; color: #000; letter-spacing: -0.3px; }
    .print-btn { display: block; margin: 22px auto 0; padding: 11px 28px; background: #000; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; letter-spacing: 0.2px; transition: opacity 0.15s; }
    .print-btn:hover { opacity: 0.8; }
    @media print {
      body { background: #fff; padding: 0; }
      .print-btn { display: none; }
      .invoice-card { box-shadow: none; }
    }
  </style>
</head>
<body>
<div class="invoice-wrapper">
  <div class="invoice-card">
    <div class="header">
      <div class="header-top">
        <div>
          <div class="company-name">Your Business Name</div>
          <div class="company-ids">
            ${detailGstNumber ? `<b>GSTIN</b> ${detailGstNumber}<br>` : ""}
            ${detailGstPlaceOfSupply ? `<b>Place of Supply</b> ${detailGstPlaceOfSupply}` : ""}
          </div>
        </div>
        <div class="header-right">
          <div class="invoice-word">Invoice</div>
          <div class="amount-due-block">
            <div class="amount-due-label">Amount Due</div>
            <div class="amount-due-value">₹ ${total.toFixed(2)}</div>
          </div>
          <div><span class="status-unpaid"><span class="dot-unpaid"></span> Due</span></div>
        </div>
      </div>
      <div class="meta-row">
        <div class="meta-left">
          <div><div class="meta-label">Invoice ID</div><div class="meta-value">#${invoiceNumber}</div></div>
          <div><div class="meta-label">Invoice Date</div><div class="meta-value">${today}</div></div>
          <div><div class="meta-label">Due Date</div><div class="meta-value">${dueDate}</div></div>
          ${detailGstPlaceOfSupply ? `<div><div class="meta-label">Place of Supply</div><div class="meta-value">${detailGstPlaceOfSupply}</div></div>` : ""}
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="parties-section">
      <div class="party-block">
        <div class="party-label">Customer Details</div>
        <div class="party-name">${detailGstCustomerName || "—"}</div>
        ${detailGstNumber ? `<div class="party-detail"><b>GSTIN:</b> ${detailGstNumber}</div>` : ""}
      </div>
      <div class="party-block">
        <div class="party-label">Billing Address</div>
        <div class="party-detail">
          ${detailBillingAddress ? `${detailBillingAddress}<br>` : ""}
          ${(detailBillingCity || detailBillingState) ? `${[detailBillingCity, detailBillingState].filter(Boolean).join(", ")}<br>` : ""}
          ${detailBillingPincode ? `India – ${detailBillingPincode}` : ""}
        </div>
      </div>
      <div class="party-block">
        <div class="party-label">Shipping Address</div>
        <div class="party-detail">
          ${shippingAddr.addr ? `${shippingAddr.addr}<br>` : ""}
          ${(shippingAddr.city || shippingAddr.state) ? `${[shippingAddr.city, shippingAddr.state].filter(Boolean).join(", ")}<br>` : ""}
          ${shippingAddr.pin ? `India – ${shippingAddr.pin}` : ""}
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="table-section" style="padding-top: 28px;">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:40%">Item</th>
            <th>Unit Price</th>
            <th>Qty</th>
            <th>Tax Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
    <div class="totals-section">
      <div class="totals-box">
        <div class="total-row subtotal-row"><span class="total-label">Sub Total</span><span>₹ ${subtotal.toFixed(2)}</span></div>
        ${taxAmt > 0 ? `<div class="total-row tax-row"><span class="total-label">Tax</span><span>₹ ${taxAmt.toFixed(2)}</span></div>${taxBreakdownRows}` : ""}
        <div class="total-row grand"><span>Total</span><span>₹ ${total.toFixed(2)}</span></div>
        <div class="amount-due-row">
          <span class="amount-due-row-label">Amount Due</span>
          <span class="amount-due-row-value">₹ ${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    <div class="notes-tc-divider"></div>
    <div class="footer">
      <div class="rzp-powered">
        <div class="rzp-powered-text">Invoicing and payments powered by</div>
        <div class="rzp-logo-row">
          <svg class="rzp-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 2L4 14h8l-1.5 8L20 10h-8l1.5-8z" fill="#000"/>
          </svg>
          <span class="rzp-wordmark">Razorpay</span>
        </div>
      </div>
    </div>
  </div>
  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
</div>
</body>
</html>`;

    const newWin = window.open("", "_blank");
    if (newWin) {
      newWin.document.write(html);
      newWin.document.close();
      newWin.focus();
    }
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
                      <td className="px-3 sm:px-5 py-3 font-medium text-primary cursor-pointer hover:underline text-xs sm:text-sm"
                          onClick={() => (link.collectInMultiplePayments && link.multiPaymentMode === "schedule") ? navigate(`/pay/${link.id}`) : setSelectedLink(link)}>
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
                        <button className="text-muted-foreground hover:text-primary"
                          onClick={() => (link.collectInMultiplePayments && link.multiPaymentMode === "schedule") ? navigate(`/pay/${link.id}`) : setSelectedLink(link)}>
                          <Eye className="h-4 w-4" />
                        </button>
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="notifyWhatsApp"
                      checked={notifyWhatsApp}
                      onCheckedChange={(checked) => setNotifyWhatsApp(!!checked)}
                    />
                    <label htmlFor="notifyWhatsApp" className="text-sm text-foreground cursor-pointer">
                      Notify via WhatsApp
                    </label>
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

            {/* Collect in Multiple Payments */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Collect in Multiple Payments</label>
              <div className="flex items-center gap-2 mb-3">
                <Switch
                  checked={collectInMultiplePayments}
                  onCheckedChange={setCollectInMultiplePayments}
                />
                <span className="text-sm text-foreground">Enable multiple payment collection</span>
              </div>

              {collectInMultiplePayments && (
                <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-border">
                  {/* Mode selection */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground mb-2">How should the customer pay?</p>

                    {/* Option 1: As per defined schedule */}
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${multiPaymentMode === "schedule" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-border bg-white hover:bg-secondary/30"}`}
                      onClick={() => setMultiPaymentMode("schedule")}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 ${multiPaymentMode === "schedule" ? "border-blue-500 bg-blue-500" : "border-muted-foreground"}`}>
                        {multiPaymentMode === "schedule" && <div className="h-full w-full rounded-full bg-white scale-50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">As per defined schedule</span>
                          <div className="relative group">
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-popover border border-border rounded-md shadow-lg text-xs text-muted-foreground hidden group-hover:block z-50">
                              You define the payment schedule — amounts, labels, and due dates. The customer pays each installment as per your plan.
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">You set the installment amounts and due dates</p>
                      </div>
                    </div>

                    {/* Option 2: Let customer choose */}
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${multiPaymentMode === "customer_choice" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-border bg-white hover:bg-secondary/30"}`}
                      onClick={() => setMultiPaymentMode("customer_choice")}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 ${multiPaymentMode === "customer_choice" ? "border-blue-500 bg-blue-500" : "border-muted-foreground"}`}>
                        {multiPaymentMode === "customer_choice" && <div className="h-full w-full rounded-full bg-white scale-50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">Let customer choose and pay</span>
                          <div className="relative group">
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-popover border border-border rounded-md shadow-lg text-xs text-muted-foreground hidden group-hover:block z-50">
                              The customer decides how much to pay each time. They can pay any amount up to the total, and return to pay the remainder later.
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Customer pays any amount, balance remains open</p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule builder — only shown for "schedule" mode */}
                  {multiPaymentMode === "schedule" && (
                    <div className="space-y-3">
                      <Separator />

                      {/* Split type toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${splitType === "equal" ? "bg-blue-600 text-white border-blue-600" : "border-border text-muted-foreground hover:bg-secondary/50"}`}
                          onClick={() => {
                            setSplitType("equal");
                            if (formData.amount && Number(formData.amount) > 0) {
                              const target = Number(formData.amount);
                              const count = installments.length;
                              const baseAmt = Math.floor(target / count * 100) / 100;
                              const lastAmt = Math.round((target - baseAmt * (count - 1)) * 100) / 100;
                              setInstallments(installments.map((i, idx2) => ({ ...i, amount: idx2 === count - 1 ? lastAmt.toFixed(2) : baseAmt.toFixed(2) })));
                            }
                          }}
                        >
                          Equal split
                        </button>
                        <button
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${splitType === "custom" ? "bg-blue-600 text-white border-blue-600" : "border-border text-muted-foreground hover:bg-secondary/50"}`}
                          onClick={() => setSplitType("custom")}
                        >
                          Custom split
                        </button>
                      </div>

                      {/* Installments list */}
                      <div className="space-y-3">
                        {installments.map((inst, idx) => (
                          <div key={inst.id} className="p-3 bg-white border border-border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">Payment {idx + 1}</span>
                              {installments.length > 2 && (
                                <button
                                  onClick={() => setInstallments(installments.filter(i => i.id !== inst.id))}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                                <Input
                                  placeholder="e.g. Token, Part 1"
                                  value={inst.label}
                                  onChange={(e) => setInstallments(installments.map(i => i.id === inst.id ? { ...i, label: e.target.value } : i))}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Amount (₹)</label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={inst.amount}
                                  disabled={splitType === "equal"}
                                  onChange={(e) => setInstallments(installments.map(i => i.id === inst.id ? { ...i, amount: e.target.value } : i))}
                                  className="h-8 text-xs disabled:opacity-60"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">{idx === 0 ? "Due Date" : "Due Date (optional)"}</label>
                                <Input
                                  type="date"
                                  value={inst.dueDate}
                                  onChange={(e) => setInstallments(installments.map(i => i.id === inst.id ? { ...i, dueDate: e.target.value } : i))}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Description (optional)</label>
                                <Input
                                  placeholder="e.g. First payment"
                                  value={inst.description}
                                  onChange={(e) => setInstallments(installments.map(i => i.id === inst.id ? { ...i, description: e.target.value } : i))}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Validation: total must equal amount */}
                      {formData.amount && Number(formData.amount) > 0 && (
                        (() => {
                          const total = installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
                          const target = Number(formData.amount);
                          const diff = Math.abs(total - target);
                          if (diff > 0.01) {
                            return (
                              <p className="text-xs text-destructive flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Payment total (₹{total.toFixed(2)}) must equal link amount (₹{target.toFixed(2)})
                              </p>
                            );
                          }
                          return (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Payment total matches link amount
                            </p>
                          );
                        })()
                      )}

                      {/* Add installment button */}
                      <button
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => {
                          const newId = String(Date.now());
                          const newInst = { id: newId, label: `Payment ${installments.length + 1}`, amount: "", dueDate: "", description: "" };
                          const updated = [...installments, newInst];
                          if (splitType === "equal" && formData.amount && Number(formData.amount) > 0) {
                            const target = Number(formData.amount);
                            const count = updated.length;
                            const baseAmt = Math.floor(target / count * 100) / 100;
                            const lastAmt = Math.round((target - baseAmt * (count - 1)) * 100) / 100;
                            setInstallments(updated.map((i, idx2) => ({ ...i, amount: idx2 === count - 1 ? lastAmt.toFixed(2) : baseAmt.toFixed(2) })));
                          } else {
                            setInstallments(updated);
                          }
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Payment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Notes</label>
              <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                + Add New
              </button>
            </div>

            {/* Receipt Settings */}
            <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">Receipt</p>
                {/* Receipt type — mutually exclusive checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sendReceiptAuto"
                      checked={sendReceiptAuto}
                      onCheckedChange={(checked) => {
                        setSendReceiptAuto(!!checked);
                        if (checked) setGstReceiptEnabled(false);
                      }}
                    />
                    <div>
                      <label htmlFor="sendReceiptAuto" className="text-sm font-medium text-foreground cursor-pointer">
                        Send Payment Confirmation Receipt PDF
                      </label>
                      <div className="flex items-center gap-4 mt-0.5">
                        <a href="https://razorpay.com/docs/payments/payment-pages/receipt/#pdf-receipt-to-customers" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          Sample Receipt <ExternalLink className="h-3 w-3" />
                        </a>
                        <a href="https://razorpay.com/docs/payments/payment-pages/receipt/" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          Know More <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="gstReceiptEnabled"
                      checked={gstReceiptEnabled}
                      onCheckedChange={(checked) => {
                        setGstReceiptEnabled(!!checked);
                        if (checked) setSendReceiptAuto(false);
                      }}
                    />
                    <div>
                      <label htmlFor="gstReceiptEnabled" className="text-sm font-medium text-foreground cursor-pointer">
                        Post-Payment Invoice
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">Generate GST-compliant invoice with customer &amp; tax details</p>
                    </div>
                  </div>
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
                      {!showShippingAddress ? (
                        <button
                          type="button"
                          onClick={() => setShowShippingAddress(true)}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          + Add Shipping Address
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-muted-foreground">Shipping Address</label>
                            <button
                              type="button"
                              onClick={() => { setShowShippingAddress(false); setShippingSameAsBilling(false); setShippingAddressLine(""); setShippingPincode(""); setShippingCity(""); setShippingState(""); }}
                              className="text-xs text-muted-foreground hover:text-destructive"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
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
                              Same as Billing Address
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
                                <Input
                                  placeholder="City"
                                  value={shippingCity}
                                  onChange={(e) => setShippingCity(e.target.value)}
                                />
                                <Input
                                  placeholder="State"
                                  value={shippingState}
                                  onChange={(e) => setShippingState(e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Invoice Items */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Items</label>
                      <div className="space-y-2">
                        {invoiceItems.map((item, idx) => (
                          <div key={item.id} className="border border-border rounded-md p-3 space-y-2 bg-white">
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
                            {/* Item name with suggestion dropdown */}
                            <div className="relative">
                              <Input
                                placeholder="Item name"
                                value={item.name}
                                onFocus={() => setItemSuggestionOpen(idx)}
                                onBlur={() => setTimeout(() => setItemSuggestionOpen(null), 150)}
                                onChange={(e) => {
                                  const updated = [...invoiceItems];
                                  updated[idx] = { ...item, name: e.target.value };
                                  setInvoiceItems(updated);
                                  setItemSuggestionOpen(idx);
                                }}
                              />
                              {itemSuggestionOpen === idx && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-1 border border-border rounded-md bg-white shadow-lg overflow-hidden">
                                  {SAVED_ITEMS.filter((s) =>
                                    !item.name || s.name.toLowerCase().includes(item.name.toLowerCase())
                                  ).map((s) => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-secondary/60 flex justify-between items-center gap-2"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        const updated = [...invoiceItems];
                                        updated[idx] = { ...item, name: s.name, rate: s.rate, hsn: s.hsn, taxRate: s.taxRate };
                                        setInvoiceItems(updated);
                                        setItemSuggestionOpen(null);
                                      }}
                                    >
                                      <span className="truncate">{s.name}</span>
                                      <span className="text-muted-foreground flex-shrink-0">₹{s.rate}</span>
                                    </button>
                                  ))}
                                  {SAVED_ITEMS.filter((s) =>
                                    !item.name || s.name.toLowerCase().includes(item.name.toLowerCase())
                                  ).length === 0 && (
                                    <p className="px-3 py-2 text-xs text-muted-foreground">No saved items match</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <Input
                              placeholder="Item description (optional)"
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...invoiceItems];
                                updated[idx] = { ...item, description: e.target.value };
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
                                <label className="text-xs text-muted-foreground mb-1 block">Rate (₹) incl. taxes</label>
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
                        onClick={() => setInvoiceItems([...invoiceItems, { id: Date.now().toString(), name: "", description: "", qty: "", rate: "", hsn: "", taxRate: "" }])}
                        className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>
                )}

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
                          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      </div>

                      {/* Signature Upload */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          Signature of Authorised Person{" "}
                          <span className="text-muted-foreground font-normal">(Optional)</span>
                        </label>
                        <label
                          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-white px-4 py-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0 bg-white">
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
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <code className="text-sm text-foreground flex-1 truncate block min-w-0">{createdLink}</code>
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

            {/* Payment schedule summary */}
            {collectInMultiplePayments && (
              <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                <p className="text-xs font-medium text-foreground mb-2">
                  Payment Schedule
                  {multiPaymentMode === "schedule" ? ` — ${installments.length} payments` : " — Customer chooses amount"}
                </p>
                {multiPaymentMode === "schedule" ? (
                  <div className="space-y-1.5">
                    {installments.map((inst, idx) => (
                      <div key={inst.id} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{inst.label || `Payment ${idx + 1}`}{inst.dueDate ? ` · Due ${new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}</span>
                        <span className="font-medium text-foreground">
                          {inst.amount !== "" && !isNaN(Number(inst.amount))
                            ? `₹${Number(inst.amount).toLocaleString("en-IN")}`
                            : <span className="text-muted-foreground italic">TBD</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Customer can pay any amount up to ₹{Number(formData.amount || 0).toLocaleString("en-IN")} across multiple visits.</p>
                )}
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
                      {detailIncludeGst && (
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                          onClick={() => toast.success("GST Receipt resent to customer!")}>
                          <Send className="h-3.5 w-3.5" /> Resend GST Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-border bg-white space-y-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Receipt not generated</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose the type of receipt to generate for this payment.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-8 w-full"
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
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="pb-3 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Generate GST Receipt
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left: Form */}
            <div className="w-1/2 overflow-y-auto border-r border-border p-4">
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
                      placeholder="Street address"
                      value={detailBillingAddress}
                      onChange={(e) => {
                        setDetailBillingAddress(e.target.value);
                        if (detailShippingSameAsBilling) setDetailShippingAddress(e.target.value);
                      }}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        className="h-9 text-sm"
                        placeholder="Pincode"
                        maxLength={6}
                        value={detailBillingPincode}
                        onChange={(e) => {
                          const pin = e.target.value.replace(/\D/g, "");
                          setDetailBillingPincode(pin);
                          if (detailShippingSameAsBilling) setDetailShippingPincode(pin);
                          if (pin.length === 6 && PINCODE_DB[pin]) {
                            setDetailBillingCity(PINCODE_DB[pin].city);
                            setDetailBillingState(PINCODE_DB[pin].state);
                            if (detailShippingSameAsBilling) {
                              setDetailShippingCity(PINCODE_DB[pin].city);
                              setDetailShippingState(PINCODE_DB[pin].state);
                            }
                          }
                        }}
                      />
                      <Input
                        className="h-9 text-sm"
                        placeholder="City"
                        value={detailBillingCity}
                        onChange={(e) => {
                          setDetailBillingCity(e.target.value);
                          if (detailShippingSameAsBilling) setDetailShippingCity(e.target.value);
                        }}
                      />
                      <Input
                        className="h-9 text-sm"
                        placeholder="State"
                        value={detailBillingState}
                        onChange={(e) => {
                          setDetailBillingState(e.target.value);
                          if (detailShippingSameAsBilling) setDetailShippingState(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Shipping Address</label>
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        id="detailShippingSameAsBilling"
                        checked={detailShippingSameAsBilling}
                        onCheckedChange={(checked) => {
                          setDetailShippingSameAsBilling(!!checked);
                          if (checked) {
                            setDetailShippingAddress(detailBillingAddress);
                            setDetailShippingPincode(detailBillingPincode);
                            setDetailShippingCity(detailBillingCity);
                            setDetailShippingState(detailBillingState);
                          }
                        }}
                      />
                      <label htmlFor="detailShippingSameAsBilling" className="text-xs text-muted-foreground cursor-pointer">
                        Same as Billing Address
                      </label>
                    </div>
                    {!detailShippingSameAsBilling && (
                      <div className="space-y-2">
                        <Input
                          className="h-9 text-sm"
                          placeholder="Street address"
                          value={detailShippingAddress}
                          onChange={(e) => setDetailShippingAddress(e.target.value)}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            className="h-9 text-sm"
                            placeholder="Pincode"
                            maxLength={6}
                            value={detailShippingPincode}
                            onChange={(e) => {
                              const pin = e.target.value.replace(/\D/g, "");
                              setDetailShippingPincode(pin);
                              if (pin.length === 6 && PINCODE_DB[pin]) {
                                setDetailShippingCity(PINCODE_DB[pin].city);
                                setDetailShippingState(PINCODE_DB[pin].state);
                              }
                            }}
                          />
                          <Input
                            className="h-9 text-sm"
                            placeholder="City"
                            value={detailShippingCity}
                            onChange={(e) => setDetailShippingCity(e.target.value)}
                          />
                          <Input
                            className="h-9 text-sm"
                            placeholder="State"
                            value={detailShippingState}
                            onChange={(e) => setDetailShippingState(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Invoice Items</p>
                  <div className="space-y-3">
                    {detailInvoiceItems.map((item, idx) => (
                      <div key={item.id} className="border border-border rounded-md p-3 space-y-2 bg-background">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">Item {idx + 1}</span>
                          {detailInvoiceItems.length > 1 && (
                            <button
                              onClick={() => setDetailInvoiceItems(detailInvoiceItems.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Select
                              value=""
                              onValueChange={(val) => {
                                if (val === "__new__") return;
                                const saved = SAVED_ITEMS.find((s) => s.id === val);
                                if (saved) {
                                  const updated = [...detailInvoiceItems];
                                  updated[idx] = { ...updated[idx], name: saved.name, rate: saved.rate, hsn: saved.hsn, taxRate: saved.taxRate };
                                  setDetailInvoiceItems(updated);
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs text-muted-foreground border-dashed">
                                <SelectValue placeholder="Select from saved items" />
                              </SelectTrigger>
                              <SelectContent>
                                {SAVED_ITEMS.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name} — ₹{s.rate}</SelectItem>
                                ))}
                                <SelectItem value="__new__">+ Create new item</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            className="h-8 text-sm flex-1"
                            placeholder="Item / service name"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...detailInvoiceItems];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setDetailInvoiceItems(updated);
                            }}
                          />
                          <div className="w-24">
                            <Input
                              className="h-8 text-sm"
                              placeholder="Rate (₹)"
                              type="number"
                              value={item.rate}
                              onChange={(e) => {
                                const updated = [...detailInvoiceItems];
                                updated[idx] = { ...updated[idx], rate: e.target.value };
                                setDetailInvoiceItems(updated);
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            className="h-8 text-sm text-center"
                            placeholder="Qty"
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...detailInvoiceItems];
                              updated[idx] = { ...updated[idx], qty: e.target.value };
                              setDetailInvoiceItems(updated);
                            }}
                          />
                          <Input
                            className="h-8 text-sm"
                            placeholder="HSN/SAC"
                            value={item.hsn}
                            onChange={(e) => {
                              const updated = [...detailInvoiceItems];
                              updated[idx] = { ...updated[idx], hsn: e.target.value };
                              setDetailInvoiceItems(updated);
                            }}
                          />
                          <select
                            className="h-8 text-sm border border-input rounded-md px-2 bg-background"
                            value={item.taxRate}
                            onChange={(e) => {
                              const updated = [...detailInvoiceItems];
                              updated[idx] = { ...updated[idx], taxRate: e.target.value };
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
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setDetailInvoiceItems([...detailInvoiceItems, { id: String(Date.now()), name: "", qty: "", rate: "", hsn: "", taxRate: "" }])}
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Right: PDF Preview */}
            <div className="w-1/2 overflow-y-auto bg-gray-100 p-4">
              {(() => {
                const invoiceNum = `INV-${selectedLink?.id?.slice(-6)?.toUpperCase() ?? "000001"}`;
                const invoiceDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                const subtotal = detailInvoiceItems.reduce((sum, item) => {
                  const qty = parseFloat(item.qty) || 1;
                  const rate = parseFloat(item.rate) || 0;
                  return sum + qty * rate;
                }, 0);
                const taxTotal = detailInvoiceItems.reduce((sum, item) => {
                  const qty = parseFloat(item.qty) || 1;
                  const rate = parseFloat(item.rate) || 0;
                  const taxRate = parseFloat(item.taxRate) || 0;
                  return sum + (qty * rate * taxRate) / 100;
                }, 0);
                const cgst = taxTotal / 2;
                const sgst = taxTotal / 2;
                const total = subtotal + taxTotal;
                const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                return (
                  <div className="bg-white rounded-lg shadow-sm" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
                    {/* Invoice Header */}
                    <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-start">
                      <div>
                        <p className="text-base font-bold tracking-wide">WealthJoy</p>
                        <p className="text-xs opacity-80 mt-0.5">GSTIN: 27AABCU9603R1ZX</p>
                        <p className="text-xs opacity-80">Maharashtra, India</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold tracking-widest">TAX INVOICE</p>
                        <p className="text-xs opacity-80 mt-1">{invoiceNum}</p>
                        <p className="text-xs opacity-80">{invoiceDate}</p>
                      </div>
                    </div>

                    <div className="px-6 py-4 space-y-4">
                      {/* Billed To / Ship To */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Billed To</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {detailGstCustomerName || <span className="text-gray-400 italic font-normal">Customer Name</span>}
                          </p>
                          {detailGstNumber && <p className="text-xs text-gray-600 mt-0.5">GSTIN: {detailGstNumber}</p>}
                          {detailBillingAddress && <p className="text-xs text-gray-600 mt-0.5">{detailBillingAddress}</p>}
                          {(detailBillingCity || detailBillingState || detailBillingPincode) && (
                            <p className="text-xs text-gray-600">{[detailBillingCity, detailBillingState, detailBillingPincode].filter(Boolean).join(", ")}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ship To</p>
                          {detailShippingSameAsBilling ? (
                            <p className="text-xs text-gray-500 italic">Same as billing address</p>
                          ) : (
                            <>
                              {detailShippingAddress
                                ? <p className="text-xs text-gray-600">{detailShippingAddress}</p>
                                : <p className="text-xs text-gray-400 italic">—</p>
                              }
                              {(detailShippingCity || detailShippingState || detailShippingPincode) && (
                                <p className="text-xs text-gray-600">{[detailShippingCity, detailShippingState, detailShippingPincode].filter(Boolean).join(", ")}</p>
                              )}
                            </>
                          )}
                          {detailGstPlaceOfSupply && (
                            <p className="text-xs text-gray-600 mt-1.5">
                              <span className="font-semibold">Place of Supply:</span> {detailGstPlaceOfSupply}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment reference */}
                      <div className="bg-gray-50 rounded px-3 py-2 flex justify-between items-center text-xs text-gray-600 border border-gray-100">
                        <span><span className="font-semibold">Ref:</span> {selectedLink?.title || selectedLink?.description || "Payment Link"}</span>
                        <span><span className="font-semibold">Payment ID:</span> pay_{selectedLink?.id?.slice(-12)}</span>
                      </div>

                      {/* Items Table */}
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-y border-gray-200">
                            <th className="text-left py-2 px-2 text-gray-600 font-semibold">Item / Service</th>
                            <th className="text-center py-2 px-2 text-gray-600 font-semibold">HSN</th>
                            <th className="text-center py-2 px-2 text-gray-600 font-semibold">Qty</th>
                            <th className="text-right py-2 px-2 text-gray-600 font-semibold">Rate</th>
                            <th className="text-right py-2 px-2 text-gray-600 font-semibold">Taxable</th>
                            <th className="text-right py-2 px-2 text-gray-600 font-semibold">Tax</th>
                            <th className="text-right py-2 px-2 text-gray-600 font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailInvoiceItems.map((item) => {
                            const qty = parseFloat(item.qty) || 1;
                            const rate = parseFloat(item.rate) || 0;
                            const taxRate = parseFloat(item.taxRate) || 0;
                            const taxable = qty * rate;
                            const tax = (taxable * taxRate) / 100;
                            return (
                              <tr key={item.id} className="border-b border-gray-100">
                                <td className="py-2 px-2 text-gray-800">{item.name || <span className="text-gray-400 italic">Item name</span>}</td>
                                <td className="py-2 px-2 text-center text-gray-600">{item.hsn || "—"}</td>
                                <td className="py-2 px-2 text-center text-gray-600">{item.qty || "1"}</td>
                                <td className="py-2 px-2 text-right text-gray-600">₹{fmt(rate)}</td>
                                <td className="py-2 px-2 text-right text-gray-600">₹{fmt(taxable)}</td>
                                <td className="py-2 px-2 text-right text-gray-600">{taxRate ? `${taxRate}%` : "—"}</td>
                                <td className="py-2 px-2 text-right font-medium text-gray-800">₹{fmt(taxable + tax)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Totals */}
                      <div className="flex justify-end">
                        <div className="w-52 space-y-1 text-xs">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{fmt(subtotal)}</span>
                          </div>
                          {taxTotal > 0 && (
                            <>
                              <div className="flex justify-between text-gray-600">
                                <span>CGST</span>
                                <span>₹{fmt(cgst)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>SGST</span>
                                <span>₹{fmt(sgst)}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-300 pt-1.5 text-sm">
                            <span>Total</span>
                            <span>₹{fmt(total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-200 pt-3 text-xs text-gray-400 text-center">
                        <p>This is a computer-generated invoice. No signature required.</p>
                        <p className="mt-0.5">Generated via Razorpay Payment Links · rzp.io</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 px-4 py-4 border-t border-border flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setShowGstModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={handleDownloadInvoicePdf}
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setDetailReceiptGenerated(true);
                setDetailIncludeGst(true);
                setShowGstModal(false);
                toast.success("GST Receipt generated and sent to customer!");
              }}
            >
              <Send className="h-3.5 w-3.5" /> Generate and Send to Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PaymentLinks;
