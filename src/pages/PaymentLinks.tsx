import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, ExternalLink, X, Copy, Eye, Share2, MessageCircle, Mail, ChevronDown, Package, CheckCircle2, Check, FileText, Info, Trash2, Download, Send, Receipt, Wand2, Sparkles, ImagePlus, Tag, ChevronUp, Truck, MapPin, Link2, ArrowRight, Settings, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const tabs = ["All", "Created", "Partially Paid", "Paid", "Cancelled", "Expired"];

// Dummy enrichment for links that don't carry customer contact/address in their data
const DUMMY_CUSTOMER_DATA: Record<string, { phone?: string; email?: string; address?: string }> = {
  "plink_PartialEdu001":     { phone: "+91 98765 43210", email: "rohit.verma@gmail.com" },
  "plink_PartialConsult002": { phone: "+91 91234 56789", email: "divya.menon@webworks.in" },
  "demo-wj-001":             { phone: "",                email: "" },
  "plink_OnlineCourse001":   { phone: "+91 99001 22334", email: "deepak.joshi@outlook.com" },
  "plink_CoachingSession042":{ phone: "+91 88991 23456", email: "sneha.iyer@gmail.com" },
  "plink_SaaSInvoice099":    { phone: "+91 77001 98765", email: "arjun@techcorp.in" },
  "plink_EcommOrder221":     { phone: "+91 90012 34567", email: "meera.nair@gmail.com",     address: "Meera Nair · 14, Rose Garden Apts, Kottayam Road, Kochi, Kerala 682001" },
  "plink_WebDevProject33":   { phone: "+91 85001 23456", email: "vikram.bose@designstudio.in" },
  "plink_SchoolFeeQ1_07":    { phone: "+91 94001 56789", email: "ramesh.pillai@email.com" },
  "plink_ConsultationFee55": { phone: "+91 82001 34567", email: "fatima.sheikh@legalfirm.in" },
  "plink_ABcDeFgHiJkL01":    { phone: "+91 93001 45678", email: "priya.sharma@gmail.com",   address: "Priya Sharma · 42A, MG Road, Indiranagar, Bengaluru, Karnataka 560038" },
  "plink_MnOpQrStUvWx02":    { phone: "+91 87001 23456", email: "rahul.mehta@gmail.com",    address: "Rahul Mehta · Plot 7, Vasant Kunj Phase 2, New Delhi 110070" },
  "plink_YzAbCdEfGhIj03":    { phone: "+91 96001 78901", email: "ananya.gupta@outlook.com", address: "Ananya Gupta · B-12, Satellite Town, Andheri West, Mumbai 400053" },
  "plink_KlMnOpQrStUv04":    { phone: "+91 99876 54321", email: "buyer.anonymous@gmail.com" },
};

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

const MERCHANT_INFO = {
  name: "Acme Corp",
  gstin: "22AAAAA0000A1Z5",
  address: "123 Business Park, Andheri East",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400069",
  phone: "+91 98765 43210",
  email: "billing@acmecorp.com",
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

const PRODUCT_CATEGORIES = [
  "Electronics", "Fashion & Apparel", "Home & Living", "Food & Beverages",
  "Books & Stationery", "Health & Wellness", "Software & SaaS", "Education & Courses",
  "Services", "Consulting", "Digital Downloads", "Other",
];

const PaymentLinks = () => {
  const navigate = useNavigate();
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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
  const [postPaymentConfirmation, setPostPaymentConfirmation] = useState(false);
  const [postPaymentMode, setPostPaymentMode] = useState<"receipt" | "invoice">("receipt");
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
  const [detailShippingSameAsBilling, setDetailShippingSameAsBilling] = useState(true);
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
    customerName: "",
  });
  const [autoSendInvoice, setAutoSendInvoice] = useState(false);
  const [invoiceConfigured, setInvoiceConfigured] = useState(false);

  // ── Create dialog: Standard / Smart tab ──────────────────────────────────────
  const [createLinkTab, setCreateLinkTab] = useState<"standard" | "smart">("standard");
  const [deliveryFreeShipping, setDeliveryFreeShipping] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState("");

  // Smart link — product catalogue (seeded from availableProducts)
  const [smartCatalogue, setSmartCatalogue] = useState(
    availableProducts.map((p) => ({
      id: p.id, name: p.name, price: p.price,
      discountedPrice: undefined as number | undefined,
      qty: undefined as number | undefined,
      category: "", description: "", images: [] as string[],
    }))
  );
  const [smartSelectedIds, setSmartSelectedIds] = useState<string[]>([]);
  const [smartSelectedItems, setSmartSelectedItems] = useState<Array<{ id: string; price: number; qty: number }>>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [smartInlineItems, setSmartInlineItems] = useState<Array<{ rowId: string; name: string; price: number; qty: number }>>([{ rowId: "1", name: "", price: 0, qty: 1 }]);

  // Logistics / Advanced Settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [editingPickupAddress, setEditingPickupAddress] = useState(false);
  const [savedPickupLabel, setSavedPickupLabel] = useState("");
  // Per-partner connection state (synced with pl_logistics_connections in localStorage)
  const loadPartnerConnections = () => {
    try {
      const stored = localStorage.getItem("pl_logistics_connections");
      if (stored) return JSON.parse(stored) as Record<string, { connected: boolean; accountEmail: string }>;
    } catch {}
    return { shiprocket: { connected: false, accountEmail: "" }, delhivery: { connected: false, accountEmail: "" } };
  };
  const [partnerConnections, setPartnerConnections] = useState(loadPartnerConnections);
  // Which partner's inline connect form is open (null = none)
  const [expandedConnectPartner, setExpandedConnectPartner] = useState<"shiprocket" | "delhivery" | null>(null);
  const [logisticsEmail, setLogisticsEmail] = useState("");
  const [logisticsPassword, setLogisticsPassword] = useState("");
  // Legacy: keep for save logic
  const [logisticsEnabled, setLogisticsEnabled] = useState(false);
  const [logisticsPartner, setLogisticsPartner] = useState<"shiprocket" | "delhivery">("shiprocket");
  const logisticsConnected = partnerConnections.shiprocket?.connected || partnerConnections.delhivery?.connected || false;
  const [lsAddress, setLsAddress] = useState("5th Cross, Koramangala 4th Block");
  const [lsCity, setLsCity] = useState("Bengaluru");
  const [lsState, setLsState] = useState("Karnataka");
  const [lsPin, setLsPin] = useState("560034");
  const [lsProducts, setLsProducts] = useState([{ id: "1", name: "", price: 0, qty: 1, discount: 0, taxRate: 0 }]);
  const [lsShipping, setLsShipping] = useState(0);
  const [lsGiftWrap, setLsGiftWrap] = useState(0);
  const [lsTxnCharges, setLsTxnCharges] = useState(0);
  const [lsTotalDiscount, setLsTotalDiscount] = useState(0);
  const [lsDeadWeight, setLsDeadWeight] = useState("");
  const [lsDimL, setLsDimL] = useState("");
  const [lsDimB, setLsDimB] = useState("");
  const [lsDimH, setLsDimH] = useState("");

  // Create-product modal
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [cpName, setCpName] = useState("");
  const [cpPrice, setCpPrice] = useState("");
  const [cpDiscountedPrice, setCpDiscountedPrice] = useState("");
  const [cpQty, setCpQty] = useState("");
  const [cpCategory, setCpCategory] = useState("");
  const [cpDescription, setCpDescription] = useState("");
  const [cpImages, setCpImages] = useState<string[]>([]);
  const cpImageRef = useRef<HTMLInputElement>(null);
  const [cpWeight, setCpWeight] = useState("");
  const [cpDimL, setCpDimL] = useState("");
  const [cpDimW, setCpDimW] = useState("");
  const [cpDimH, setCpDimH] = useState("");

  // Invoice creation dialog state
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invActiveTab, setInvActiveTab] = useState<"details" | "customer" | "items">("details");
  // Invoice header
  const [invNumber, setInvNumber] = useState("");
  const [invCurrency, setInvCurrency] = useState("INR");
  const [invDate, setInvDate] = useState("");
  const [invDesc, setInvDesc] = useState("");
  // Invoice customer
  const [invCustName, setInvCustName] = useState("");
  const [invCustEmail, setInvCustEmail] = useState("");
  const [invCustPhone, setInvCustPhone] = useState("");
  const [invCustGSTIN, setInvCustGSTIN] = useState("");
  const [invBillLine1, setInvBillLine1] = useState("");
  const [invBillLine2, setInvBillLine2] = useState("");
  const [invBillCity, setInvBillCity] = useState("");
  const [invBillState, setInvBillState] = useState("");
  const [invBillPin, setInvBillPin] = useState("");
  const [invBillCountry, setInvBillCountry] = useState("India");
  const [invShipSameAsBill, setInvShipSameAsBill] = useState(false);
  const [invShipLine1, setInvShipLine1] = useState("");
  const [invShipLine2, setInvShipLine2] = useState("");
  const [invShipCity, setInvShipCity] = useState("");
  const [invShipState, setInvShipState] = useState("");
  const [invShipPin, setInvShipPin] = useState("");
  const [invPlaceOfSupply, setInvPlaceOfSupply] = useState("");
  // Invoice line items
  const [invItems, setInvItems] = useState([{ id: "1", name: "", description: "", qty: "1", rate: "", discount: "", taxRate: "", taxType: "exclusive" as "inclusive" | "exclusive", hsnCode: "", sacCode: "", cess: "" }]);
  const [savedItemsLib, setSavedItemsLib] = useState<Array<{ id: string; name: string; description: string; rate: string; taxRate: string; taxType: string; hsnCode: string; sacCode: string; cess: string }>>(() => {
    try { return JSON.parse(localStorage.getItem("rzp_saved_items") || "[]"); } catch { return []; }
  });
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", rate: "", taxRate: "", taxType: "exclusive", hsnCode: "", sacCode: "", cess: "" });
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

    // Auto-refresh list when another tab (e.g. checkout) writes payment data
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "payment_links" && e.newValue) {
        try { setPaymentLinks(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Load existing payment links or create sample ones (v3 forces refresh with paid examples)
    const stored = localStorage.getItem("payment_links");
    const storedVersion = localStorage.getItem("payment_links_version");
    if (stored && storedVersion === "v6") {
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
      // Partially paid links
      sampleLinks.unshift(
        {
          id: "plink_PartialEdu001",
          title: "Full Stack Bootcamp — 3-Month Fee Plan",
          description: "Partial payment plan for Full Stack Web Dev Bootcamp",
          date: "02 May 2026, 10:00:00 am",
          amount: 15000,
          amountPaid: 5000,
          currency: "INR",
          refId: "BOOT-2026-001",
          customer: "Rohit Verma",
          status: "Partially Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
          collectInMultiplePayments: true,
          multiPaymentMode: "schedule",
          installments: [
            {
              id: "i1", label: "Enrolment Fee", amount: 5000,
              dueDate: "2026-05-02", status: "Paid",
              transactions: [
                { id: "pay_boot001a", amount: 5000, status: "Success", date: "02 May 2026, 10:14:32 am", method: "UPI" },
              ],
            },
            {
              id: "i2", label: "Month 2 Fee", amount: 5000,
              dueDate: "2026-06-02", status: "Pending",
              transactions: [
                { id: "pay_boot002a", amount: 5000, status: "Failed", date: "02 Jun 2026, 09:45:10 am", method: "Card" },
              ],
            },
            {
              id: "i3", label: "Month 3 Fee", amount: 5000,
              dueDate: "2026-07-02", status: "Upcoming",
              transactions: [],
            },
          ],
        } as any,
        {
          id: "plink_PartialConsult002",
          title: "Website Redesign Project",
          description: "Milestone-based payment for full website redesign",
          date: "28 Apr 2026, 03:30:00 pm",
          amount: 40000,
          amountPaid: 20000,
          currency: "INR",
          refId: "WEB-REDESIGN-042",
          customer: "Divya Menon",
          status: "Partially Paid",
          createdAt: new Date().toISOString(),
          collectPhone: true,
          collectEmail: true,
          collectAddress: false,
          sendReceiptAuto: false,
          collectInMultiplePayments: true,
          multiPaymentMode: "schedule",
          installments: [
            {
              id: "i1", label: "Advance / Token", amount: 10000,
              dueDate: "2026-04-28", status: "Paid",
              transactions: [
                { id: "pay_web001a", amount: 5000, status: "Failed", date: "28 Apr 2026, 03:12:00 pm", method: "NetBanking" },
                { id: "pay_web001b", amount: 10000, status: "Success", date: "28 Apr 2026, 03:35:44 pm", method: "UPI" },
              ],
            },
            {
              id: "i2", label: "Design Milestone", amount: 10000,
              dueDate: "2026-05-15", status: "Paid",
              transactions: [
                { id: "pay_web002a", amount: 10000, status: "Success", date: "15 May 2026, 11:02:17 am", method: "UPI" },
              ],
            },
            {
              id: "i3", label: "Development Milestone", amount: 15000,
              dueDate: "2026-06-10", status: "Pending",
              transactions: [
                { id: "pay_web003a", amount: 15000, status: "Failed", date: "10 Jun 2026, 10:20:05 am", method: "Card" },
                { id: "pay_web003b", amount: 15000, status: "Failed", date: "11 Jun 2026, 08:55:30 am", method: "Card" },
              ],
            },
            {
              id: "i4", label: "Final Delivery", amount: 5000,
              dueDate: "2026-07-01", status: "Upcoming",
              transactions: [],
            },
          ],
        } as any
      );
      localStorage.setItem("payment_links", JSON.stringify(sampleLinks));
      localStorage.setItem("payment_links_version", "v6");
      setPaymentLinks(sampleLinks);
    }
    // Load default pickup address from saved addresses
    try {
      const savedAddrs = JSON.parse(localStorage.getItem("pl_pickup_addresses") || "[]");
      const def = savedAddrs.find((a: any) => a.isDefault) || savedAddrs[0];
      if (def) {
        setLsAddress(def.addressLine || "");
        setLsCity(def.city || "");
        setLsState(def.state || "");
        setLsPin(def.pincode || "");
        setSavedPickupLabel(def.label || "");
      }
    } catch {}

    return () => window.removeEventListener("storage", handleStorageChange);
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
    // If a partial amount has been paid but not the full amount, force "Partially Paid"
    if (link.amountPaid != null && link.amountPaid > 0 && link.amountPaid < link.amount) {
      return "Partially Paid";
    }
    return link.status;
  };

  const hasOverdueInstallment = (link: any) => {
    const insts: any[] = link.installments || [];
    const now = new Date();
    return insts.some((i) => (i.status === "Pending" || i.status === "Upcoming") && i.dueDate && new Date(i.dueDate) < now);
  };

  const filtered = (activeTab === "All" ? paymentLinks : paymentLinks.filter((l) => getDisplayStatus(l) === activeTab))
    .filter((l) => !showOverdueOnly || hasOverdueInstallment(l));

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const getProductById = (id: string) => availableProducts.find((p) => p.id === id);

  const openInvoiceDialog = () => {
    setInvCustName(formData.customerName || "");
    setInvCustEmail(formData.customerEmail || "");
    setInvCustPhone(formData.customerPhone || "");
    setInvDate(new Date().toISOString().split("T")[0]);
    setInvActiveTab("details");
    setShowInvoiceDialog(true);
  };

  const handleSaveInvoice = () => {
    if (!invCustName.trim()) { toast.error("Customer name is required"); setInvActiveTab("customer"); return; }
    if (!invItems.some(i => i.name && i.rate)) { toast.error("Add at least one line item with name and rate"); setInvActiveTab("items"); return; }
    setInvoiceConfigured(true);
    setShowInvoiceDialog(false);
    toast.success("Invoice configuration saved");
  };

  const resetCreateForm = () => {
    setCreateLinkTab("standard");
    setSmartSelectedIds([]);
    setSmartSelectedItems([]);
    setProductSearch("");
    setShowProductDropdown(false);
    setSmartInlineItems([{ rowId: "1", name: "", price: 0, qty: 1 }]);
    setFormData({ description: "", amount: "", customerPhone: "", customerEmail: "", referenceId: "", customerName: "" });
    setAutoSendInvoice(false);
    setInvoiceConfigured(false);
    setInvItems([{ id: "1", name: "", description: "", qty: "1", rate: "", discount: "", taxRate: "", taxType: "exclusive" as const, hsnCode: "", sacCode: "", cess: "" }]);
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
    setDeliveryFreeShipping(true);
    setDeliveryFee("");
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
      multiPaymentMode: collectInMultiplePayments ? "schedule" : undefined,
      splitType: collectInMultiplePayments ? splitType : undefined,
      installments: collectInMultiplePayments ? installments.map(i => ({ ...i, amount: Number(i.amount) })) : undefined,
      sendReceiptAuto,
      // Smart link data
      isSmartLink: collectAddress,
      smartProducts: undefined,
      deliveryFee: 0,
      logistics: collectAddress && (partnerConnections.shiprocket?.connected || partnerConnections.delhivery?.connected)
        ? {
            partner: partnerConnections.shiprocket?.connected ? "shiprocket" : "delhivery",
            enabled: true,
            pickupAddress: { line: lsAddress, city: lsCity, state: lsState, pincode: lsPin },
            deadWeight: lsDeadWeight,
            dimL: lsDimL, dimB: lsDimB, dimH: lsDimH,
          }
        : undefined,
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button className="gap-2 flex-1 sm:flex-none" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              <span className="whitespace-nowrap">Create Payment Link</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center border-b border-border min-w-max">
            <div className="flex items-center gap-4 sm:gap-6 flex-1">
              <span className="blade-tab-active whitespace-nowrap">Payment Links</span>
              <span className="blade-tab whitespace-nowrap hidden sm:inline-flex">Reminder Settings</span>
            </div>
            <div className="flex items-center gap-4 pb-2.5">
              <button className="text-sm text-primary hover:underline whitespace-nowrap" onClick={() => setShowSettingsModal(true)}>Settings</button>
              <button className="text-sm text-primary hover:underline whitespace-nowrap flex items-center gap-1" onClick={() => toast.info("Documentation coming soon")}>
                Documentation <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide leading-none">New</span>
              </button>
            </div>
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
            <button
              onClick={() => setShowOverdueOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs sm:text-sm whitespace-nowrap border transition-colors ${
                showOverdueOnly
                  ? "bg-red-50 border-red-300 text-red-700 font-medium"
                  : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${showOverdueOnly ? "bg-red-500" : "bg-muted-foreground/50"}`} />
              Installment Due
              {showOverdueOnly && <X className="h-3 w-3 ml-0.5" onClick={(e) => { e.stopPropagation(); setShowOverdueOnly(false); }} />}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="blade-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1400px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Payment Link ID</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Created At</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Amount</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Customer</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Payment Link</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Installments</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Due Date</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Reference ID</th>
                  <th className="blade-table-header px-4 py-3 text-left whitespace-nowrap">Address</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link) => {
                  const displayStatus = getDisplayStatus(link);
                  const linkUrl = `${window.location.origin}/pay/${link.id}`;
                  const dummy = DUMMY_CUSTOMER_DATA[link.id] || {};
                  const customerEmail = (link as any).customerEmail || dummy.email || "";
                  const customerPhone = (link as any).customerPhone || dummy.phone || "";
                  const rawAddr = (link as any).customerAddress;
                  const customerAddress = rawAddr
                    ? [rawAddr.name, rawAddr.addressLine, rawAddr.cityState].filter(Boolean).join(", ")
                    : dummy.address || "";
                  const insts: any[] = (link as any).installments || [];
                  const paidCount = insts.filter((i) => i.status === "Paid").length;
                  const totalCount = insts.length;
                  const remainingCount = totalCount - paidCount;
                  const nextPending = insts.find((i) => i.status === "Pending" || i.status === "Upcoming");
                  const nextDueDate = nextPending?.dueDate
                    ? new Date(nextPending.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : null;
                  const amountPaid =
                    link.amountPaid != null
                      ? link.amountPaid
                      : link.status === "Paid"
                      ? link.amount
                      : null;
                  // Only show the paid sub-line when partially paid (not when fully paid)
                  const isPartiallyPaid = amountPaid != null && amountPaid < link.amount;
                  return (
                    <tr key={link.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      {/* Payment Link ID */}
                      <td className="px-4 py-3 font-medium text-primary cursor-pointer hover:underline text-xs"
                          onClick={() => setSelectedLink(link)}>
                        <span className="block max-w-[110px] truncate">{link.id}</span>
                      </td>
                      {/* Created At */}
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{link.date}</td>
                      {/* Amount — show paid sub-line only when partially paid */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className="font-medium text-foreground">₹{link.amount.toLocaleString('en-IN')}</span>
                        {isPartiallyPaid && (
                          <span className="block text-[11px] text-green-700 mt-0.5">
                            ₹{amountPaid!.toLocaleString('en-IN')} paid
                          </span>
                        )}
                      </td>
                      {/* Customer — email + phone stacked */}
                      <td className="px-4 py-3 text-xs">
                        {customerEmail ? (
                          <span className="block text-foreground truncate max-w-[160px]">{customerEmail}</span>
                        ) : null}
                        {customerPhone ? (
                          <span className="block text-muted-foreground mt-0.5">{customerPhone}</span>
                        ) : null}
                        {!customerEmail && !customerPhone && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      {/* Payment Link with copy */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 max-w-[180px]">
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`/pay/${link.id}`, '_blank'); }}
                            className="text-xs text-primary hover:underline truncate"
                          >
                            {linkUrl}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyLink(linkUrl); }}
                            className="hover:text-primary text-muted-foreground flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`${statusBadgeClass[displayStatus] || "blade-badge"} text-xs whitespace-nowrap`}>{displayStatus}</span>
                      </td>
                      {/* Installments — X of Y paid only */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {totalCount > 0 ? (
                          <span className="font-medium text-foreground">{paidCount} of {totalCount} paid</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      {/* Due Date — with overdue flag */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {nextPending?.dueDate ? (() => {
                          const due = new Date(nextPending.dueDate);
                          const isOverdue = due < new Date();
                          return (
                            <div>
                              <span className={isOverdue ? "text-red-600 font-medium" : "text-foreground"}>{nextDueDate}</span>
                              {isOverdue && (
                                <span className="block mt-0.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-1 py-px w-fit">DUE</span>
                              )}
                            </div>
                          );
                        })() : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      {/* Reference ID */}
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {link.refId || "—"}
                      </td>
                      {/* Address with copy + hover tooltip */}
                      <td className="px-4 py-3 text-xs">
                        {customerAddress ? (
                          <div className="relative group flex items-start gap-1.5 max-w-[180px]">
                            <span className="text-foreground line-clamp-2 leading-relaxed cursor-default">{customerAddress}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(customerAddress); }}
                              className="hover:text-primary text-muted-foreground flex-shrink-0 mt-0.5"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            {/* Full address tooltip on hover */}
                            <div className="absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover:block w-64 rounded-lg border border-border bg-popover shadow-lg px-3 py-2.5">
                              <p className="text-xs text-popover-foreground leading-relaxed whitespace-normal">{customerAddress}</p>
                              <div className="absolute top-full left-4 -translate-y-px w-2 h-2 rotate-45 border-r border-b border-border bg-popover" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
          </DialogHeader>
          <div className="px-4 py-3 space-y-1">
            {[
              {
                icon: "🔔",
                label: "Reminders",
                description: "Configure auto-reminder schedules",
                path: "/payment-links/settings",
              },
              {
                icon: "🧾",
                label: "Receipts & Tax Invoice",
                description: "Templates, GST details, branding",
                path: "/account-settings/receipts",
              },
              {
                icon: "🚚",
                label: "Logistics",
                description: "Connect Shiprocket, Delhivery & more",
                path: "/account-settings/logistics",
              },
            ].map(({ icon, label, description, path }) => (
              <button
                key={label}
                onClick={() => { setShowSettingsModal(false); navigate(path); }}
                className="w-full flex items-center gap-4 px-3 py-3.5 rounded-lg hover:bg-secondary/60 transition-colors text-left group"
              >
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={() => setShowSettingsModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Payment Link Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden max-h-[82vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">New Payment Link</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Amount + description */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Amount <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg bg-muted/30 text-sm text-muted-foreground whitespace-nowrap select-none">
                  ₹ (INR) <X className="h-3.5 w-3.5 cursor-pointer hover:text-foreground" />
                </div>
                <Input type="number" placeholder="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Payment For</label>
              <Input placeholder="Payment description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            {/* Accept payment in parts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox id="collectInMultiplePayments" checked={collectInMultiplePayments} onCheckedChange={(v) => setCollectInMultiplePayments(!!v)} />
                <label htmlFor="collectInMultiplePayments" className="text-sm text-foreground cursor-pointer">Accept payment in parts</label>
              </div>

              {collectInMultiplePayments && (
                <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-border">
                  {/* Schedule builder */}
                  <div className="space-y-3">
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
                </div>
              )}
            </div>

            {/* Magic Link: Products — inline rows (removed) */}
            {false && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Products <span className="text-destructive">*</span>
                </label>

                {/* datalist for autocomplete from previously created products */}
                <datalist id="product-name-suggestions">
                  {smartCatalogue.map((p) => <option key={p.id} value={p.name} />)}
                </datalist>

                <div className="space-y-2">
                  {/* Column headers */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="flex-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Item name</span>
                    <span className="w-24 text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex-shrink-0">Price</span>
                    <span className="w-20 text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex-shrink-0 text-center">Qty</span>
                    <span className="w-7 flex-shrink-0" />
                  </div>

                  {smartInlineItems.map((item, idx) => {
                    const recalcInline = (next: typeof smartInlineItems) => {
                      const t = next.reduce((s, i) => s + i.price * i.qty, 0);
                      const fee = deliveryFreeShipping ? 0 : (Number(deliveryFee) || 0);
                      setFormData((f) => ({ ...f, amount: String(t + fee) }));
                    };
                    return (
                      <div key={item.rowId} className="flex items-center gap-2">
                        {/* Name input with autocomplete */}
                        <input
                          list="product-name-suggestions"
                          placeholder="Product name"
                          value={item.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const match = smartCatalogue.find((p) => p.name.toLowerCase() === name.toLowerCase());
                            const next = smartInlineItems.map((si, i) =>
                              i === idx ? { ...si, name, price: match ? (match.discountedPrice ?? match.price) : si.price } : si
                            );
                            setSmartInlineItems(next);
                            recalcInline(next);
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                        />
                        {/* Price */}
                        <div className="relative w-24 flex-shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">₹</span>
                          <input
                            type="number" min={0} placeholder="0"
                            value={item.price || ""}
                            onChange={(e) => {
                              const next = smartInlineItems.map((si, i) => i === idx ? { ...si, price: Number(e.target.value) || 0 } : si);
                              setSmartInlineItems(next); recalcInline(next);
                            }}
                            className="w-full pl-6 pr-2 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                          />
                        </div>
                        {/* Qty */}
                        <div className="flex items-center gap-1 w-20 flex-shrink-0 justify-center">
                          <button type="button"
                            className="h-8 w-8 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-muted text-base leading-none"
                            onClick={() => {
                              const next = smartInlineItems.map((si, i) => i === idx ? { ...si, qty: Math.max(1, si.qty - 1) } : si);
                              setSmartInlineItems(next); recalcInline(next);
                            }}>−</button>
                          <span className="w-5 text-center text-sm font-medium">{item.qty}</span>
                          <button type="button"
                            className="h-8 w-8 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-muted text-base leading-none"
                            onClick={() => {
                              const next = smartInlineItems.map((si, i) => i === idx ? { ...si, qty: si.qty + 1 } : si);
                              setSmartInlineItems(next); recalcInline(next);
                            }}>+</button>
                        </div>
                        {/* Remove */}
                        <button type="button"
                          className="w-7 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md transition-colors flex-shrink-0"
                          onClick={() => {
                            const next = smartInlineItems.filter((_, i) => i !== idx);
                            const safe = next.length ? next : [{ rowId: Date.now().toString(), name: "", price: 0, qty: 1 }];
                            setSmartInlineItems(safe);
                            const t = safe.reduce((s, i) => s + i.price * i.qty, 0);
                            const fee = deliveryFreeShipping ? 0 : (Number(deliveryFee) || 0);
                            setFormData((f) => ({ ...f, amount: String(t + fee) }));
                          }}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer: Add item + running total */}
                <div className="flex items-center justify-between mt-2.5">
                  <button type="button"
                    className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline"
                    onClick={() => setSmartInlineItems(prev => [...prev, { rowId: Date.now().toString(), name: "", price: 0, qty: 1 }])}>
                    <Plus className="h-3.5 w-3.5" /> Add item
                  </button>
                  {smartInlineItems.some((i) => i.name.trim()) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Total</span>
                      <span className="text-sm font-semibold text-foreground">
                        ₹{smartInlineItems.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

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


              {/* Customer Name */}
              <div className="space-y-1.5 mt-3">
                <label className="text-sm text-muted-foreground block">Customer Name</label>
                <Input
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              {/* Collect address from customer */}
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Collect address from customer</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Customer will be asked to provide their delivery address at checkout</p>
                </div>
                <Switch checked={collectAddress} onCheckedChange={setCollectAddress} />
              </div>
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
                  <Checkbox id="sendReminders" checked={sendReminders} onCheckedChange={(v) => setSendReminders(!!v)} />
                  <label htmlFor="sendReminders" className="text-sm text-foreground cursor-pointer">Send auto reminders</label>
                </div>
                {sendReminders && (
                  <p className="text-xs text-muted-foreground pl-1">
                    1 auto reminders will be sent to this customer based on the reminder settings
                  </p>
                )}
              </div>
            </div>

            {/* Post-payment confirmation */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Send post-payment confirmation</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Send a confirmation to the customer after payment</p>
                </div>
                <Switch checked={postPaymentConfirmation} onCheckedChange={setPostPaymentConfirmation} />
              </div>
              {postPaymentConfirmation && (
                <div className="mt-3 rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Payment Confirmation Mode</p>
                  <p className="text-xs text-muted-foreground -mt-1">Select what gets sent to customers after a successful payment. Only one can be active.</p>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {/* Receipt option */}
                    <button
                      type="button"
                      onClick={() => setPostPaymentMode("receipt")}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${postPaymentMode === "receipt" ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-secondary/30"}`}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${postPaymentMode === "receipt" ? "border-primary" : "border-muted-foreground"}`}>
                        {postPaymentMode === "receipt" && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${postPaymentMode === "receipt" ? "text-primary" : "text-foreground"}`}>Receipt</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Simple payment acknowledgment. No tax details added.</p>
                      </div>
                    </button>
                    {/* Tax Invoice option */}
                    <button
                      type="button"
                      onClick={() => setPostPaymentMode("invoice")}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${postPaymentMode === "invoice" ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-secondary/30"}`}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${postPaymentMode === "invoice" ? "border-primary" : "border-muted-foreground"}`}>
                        {postPaymentMode === "invoice" && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${postPaymentMode === "invoice" ? "text-primary" : "text-foreground"}`}>Tax Invoice</p>
                        <p className="text-xs text-muted-foreground mt-0.5">GST-compliant invoice with CGST/SGST breakdown.</p>
                      </div>
                    </button>
                  </div>
                  <button className="text-xs text-primary hover:underline mt-1" onClick={() => navigate("/account-settings/receipts")}>
                    Configure settings →
                  </button>
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

            {/* Send order to logistics partner — shown when collect address is on */}
            {collectAddress && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Send order to logistics partner</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically push order after payment is completed</p>
                  </div>
                  <Switch checked={logisticsEnabled} onCheckedChange={setLogisticsEnabled} />
                </div>

                {logisticsEnabled && (
                  <div className="space-y-2">
                    {[
                      { id: "shiprocket", label: "Shiprocket", icon: "🚀" },
                      { id: "delhivery", label: "Delhivery", icon: "📦" },
                    ].map(({ id, label, icon }) => {
                      const isConnected = partnerConnections[id as "shiprocket" | "delhivery"]?.connected;
                      const isSelected = logisticsPartner === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setLogisticsPartner(id as "shiprocket" | "delhivery")}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border text-left transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-secondary/30"}`}
                        >
                          <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "border-primary" : "border-muted-foreground"}`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <span className="text-lg flex-shrink-0">{icon}</span>
                          <span className={`text-sm font-medium flex-1 ${isSelected ? "text-primary" : "text-foreground"}`}>{label}</span>
                          {isConnected && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Connected
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline mt-1"
                      onClick={() => navigate("/account-settings/logistics")}
                    >
                      Manage connectors →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Receipt section removed — configured globally in Receipt Settings */}
            {false && (
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
          {/* Old logistics block removed — now inside collectAddress toggle above */}
          {false && (
            <div className="space-y-4 pt-2">

              {/* Section header */}
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Logistics</span>
              </div>

              {/* Toggle row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">Send order to logistics partner</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Automatically push order after payment is completed</p>
                </div>
                <Switch checked={logisticsEnabled} onCheckedChange={setLogisticsEnabled} />
              </div>

              {/* Rest of logistics — only when toggle is on */}
              {logisticsEnabled && (
                <div className="space-y-4">

                  {/* Partner selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Logistics Partner</label>
                    <Select
                      value={logisticsPartner}
                      onValueChange={(v) => {
                        setLogisticsPartner(v as "shiprocket" | "delhivery");
                        setExpandedConnectPartner(null);
                        setLogisticsEmail("");
                        setLogisticsPassword("");
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select a logistics partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shiprocket">🚀 Shiprocket</SelectItem>
                        <SelectItem value="delhivery">📦 Delhivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected partner: connected state */}
                  {partnerConnections[logisticsPartner]?.connected ? (
                    <div className="space-y-4">
                      {/* Connected badge */}
                      <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Connected
                          {partnerConnections[logisticsPartner].accountEmail && (
                            <span className="font-normal text-emerald-600">· {partnerConnections[logisticsPartner].accountEmail}</span>
                          )}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors"
                          onClick={() => {
                            const updated = { ...partnerConnections, [logisticsPartner]: { connected: false, accountEmail: "" } };
                            setPartnerConnections(updated);
                            try { localStorage.setItem("pl_logistics_connections", JSON.stringify(updated)); } catch {}
                            toast.success(`${logisticsPartner === "shiprocket" ? "Shiprocket" : "Delhivery"} disconnected`);
                          }}
                        >
                          Disconnect
                        </button>
                      </div>

                      {/* Pickup Address */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Pickup Address</span>
                          </div>
                          <button type="button" onClick={() => setEditingPickupAddress(v => !v)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <Edit2 className="h-3 w-3" /> {editingPickupAddress ? "Done" : "Edit"}
                          </button>
                        </div>
                        {!editingPickupAddress ? (
                          <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2.5 space-y-0.5">
                            {savedPickupLabel && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{savedPickupLabel}</p>}
                            <p className="text-xs text-foreground">{lsAddress || "—"}</p>
                            <p className="text-xs text-muted-foreground">{[lsCity, lsState, lsPin].filter(Boolean).join(", ")}</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <Input placeholder="Full address" value={lsAddress} onChange={(e) => setLsAddress(e.target.value)} className="text-xs h-8" />
                            <div className="grid grid-cols-3 gap-1.5">
                              <Input placeholder="City" value={lsCity} onChange={(e) => setLsCity(e.target.value)} className="text-xs h-8" />
                              <Input placeholder="State" value={lsState} onChange={(e) => setLsState(e.target.value)} className="text-xs h-8" />
                              <Input placeholder="Pincode" value={lsPin} onChange={(e) => setLsPin(e.target.value)} className="text-xs h-8" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Details — mirror from above */}
                      {smartInlineItems.some(i => i.name.trim()) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Products in this order</span>
                          </div>
                          <div className="rounded-lg bg-secondary/40 border border-border overflow-hidden divide-y divide-border">
                            {smartInlineItems.filter(i => i.name.trim()).map((item) => (
                              <div key={item.rowId} className="flex items-center justify-between px-3 py-2">
                                <span className="text-xs text-foreground flex-1 truncate">{item.name}</span>
                                <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">×{item.qty}</span>
                                <span className="text-xs font-medium ml-3 flex-shrink-0">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                              </div>
                            ))}
                            {!deliveryFreeShipping && Number(deliveryFee) > 0 && (
                              <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-xs text-muted-foreground flex-1">Delivery fee</span>
                                <span className="text-xs font-medium">₹{Number(deliveryFee).toLocaleString("en-IN")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Package Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Package Details</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Weight and dimensions of the packed shipment.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Dead Weight (kg)</label>
                            <input type="number" min={0} step={0.01} placeholder="0.00"
                              value={lsDeadWeight}
                              onChange={(e) => setLsDeadWeight(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                            <p className="text-[10px] text-muted-foreground mt-0.5">Min chargeable: 0.5 kg</p>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Volumetric Weight (kg)</label>
                            <div className="px-3 py-2 text-xs border border-input rounded-lg bg-muted/30 text-muted-foreground">
                              {lsDimL && lsDimB && lsDimH
                                ? `${((Number(lsDimL) * Number(lsDimB) * Number(lsDimH)) / 5000).toFixed(2)} kg`
                                : "0 kg (auto-calculated)"}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Dimensions (cm) — L × B × H</label>
                          <div className="grid grid-cols-3 gap-2">
                            {([["Length", lsDimL, setLsDimL], ["Breadth", lsDimB, setLsDimB], ["Height", lsDimH, setLsDimH]] as const).map(([ph, val, set]) => (
                              <input key={ph} type="number" min={0} step={0.1} placeholder={ph}
                                value={val}
                                onChange={(e) => set(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                            ))}
                          </div>
                        </div>
                        {lsDeadWeight && (
                          <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                            <p className="text-xs text-blue-700">
                              <span className="font-semibold">Applicable weight:</span>{" "}
                              {Math.max(Number(lsDeadWeight), lsDimL && lsDimB && lsDimH ? (Number(lsDimL) * Number(lsDimB) * Number(lsDimH)) / 5000 : 0).toFixed(2)} kg
                              {" "}— higher of dead or volumetric
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                  ) : (
                    /* Not connected — show inline connect form for selected partner */
                    <div className="rounded-xl border border-border overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center gap-3 px-3.5 py-3 bg-secondary/30 border-b border-border">
                        <span className="text-xl flex-shrink-0">{logisticsPartner === "shiprocket" ? "🚀" : "📦"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            Connect {logisticsPartner === "shiprocket" ? "Shiprocket" : "Delhivery"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">Account not connected yet</p>
                        </div>
                      </div>

                      {/* Steps + credentials */}
                      <div className="px-3.5 py-4 space-y-4 bg-white">
                        <div className="space-y-2.5">
                          {(logisticsPartner === "shiprocket" ? [
                            "Visit shiprocket.in and create a free seller account",
                            "Verify your email and complete your store profile",
                            "Enter your Shiprocket email & password below — Razorpay connects via their secure API",
                          ] : [
                            "Visit business.delhivery.com and register as a business",
                            "Get your account approved by the Delhivery team (usually 1–2 business days)",
                            "Enter your Delhivery email & password below to authorise the connection",
                          ]).map((step, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                              <p className="text-xs text-muted-foreground leading-snug">{step}</p>
                            </div>
                          ))}
                        </div>

                        <div className="h-px bg-border" />

                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-foreground">
                            {logisticsPartner === "shiprocket" ? "Shiprocket" : "Delhivery"} account credentials
                          </p>
                          <Input type="email"
                            placeholder={`Email address`}
                            value={logisticsEmail}
                            onChange={(e) => setLogisticsEmail(e.target.value)}
                            className="text-sm h-9" />
                          <Input type="password"
                            placeholder="Password"
                            value={logisticsPassword}
                            onChange={(e) => setLogisticsPassword(e.target.value)}
                            className="text-sm h-9" />
                          <p className="text-[10px] text-muted-foreground">
                            By connecting, you authorise Razorpay to push orders on your behalf.
                          </p>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={!logisticsEmail.trim() || !logisticsPassword.trim()}
                          onClick={() => {
                            const updated = {
                              ...partnerConnections,
                              [logisticsPartner]: { connected: true, accountEmail: logisticsEmail },
                            };
                            setPartnerConnections(updated);
                            try {
                              const existing = JSON.parse(localStorage.getItem("pl_logistics_connections") || "{}");
                              existing[logisticsPartner] = {
                                connected: true,
                                accountEmail: logisticsEmail,
                                connectedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                              };
                              localStorage.setItem("pl_logistics_connections", JSON.stringify(existing));
                            } catch {}
                            setLogisticsEmail("");
                            setLogisticsPassword("");
                            toast.success(`${logisticsPartner === "shiprocket" ? "Shiprocket" : "Delhivery"} connected successfully!`);
                          }}
                        >
                          Connect {logisticsPartner === "shiprocket" ? "Shiprocket" : "Delhivery"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </div>{/* ← closes overflow-y-auto scrollable div */}

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

      {/* ── Create Product Modal ─────────────────────────────────────────────── */}
      <Dialog open={showCreateProduct} onOpenChange={(open) => {
        if (!open) {
          setShowCreateProduct(false);
          setCpName(""); setCpPrice(""); setCpDiscountedPrice(""); setCpImages([]);
          setCpWeight(""); setCpDimL(""); setCpDimW(""); setCpDimH("");
        }
      }}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-lg font-semibold">Create Product</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Product name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                Product name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Add product name"
                value={cpName}
                maxLength={100}
                onChange={(e) => setCpName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">{cpName.length}/100</p>
            </div>

            {/* Price + Discounted price side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  Price <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">₹</span>
                  <Input type="number" placeholder="0.00" value={cpPrice} onChange={(e) => setCpPrice(e.target.value)} className="pl-7" min={0} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex gap-1 items-center">
                  Discounted <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">₹</span>
                  <Input type="number" placeholder="0.00" value={cpDiscountedPrice} onChange={(e) => setCpDiscountedPrice(e.target.value)} className="pl-7" min={0} />
                </div>
              </div>
            </div>

            {/* Upload image — single */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex gap-1">
                Upload image <span className="text-muted-foreground font-normal text-xs self-center">(optional)</span>
              </label>
              {cpImages.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                  onClick={() => cpImageRef.current?.click()}
                >
                  <input
                    ref={cpImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCpImages([URL.createObjectURL(file)]);
                    }}
                  />
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload product image</p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img src={cpImages[0]} alt="" className="w-24 h-24 object-cover rounded-xl border border-border" />
                  <button
                    type="button"
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center"
                    onClick={() => setCpImages([])}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Shipping Details */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Shipping Details <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </label>
              {/* Weight */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Weight</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={cpWeight}
                    onChange={(e) => setCpWeight(e.target.value)}
                    className="pr-14"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium select-none">gms</span>
                </div>
              </div>
              {/* Dimensions */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Dimensions (L × W × H)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: cpDimL, set: setCpDimL, ph: "L" },
                    { val: cpDimW, set: setCpDimW, ph: "W" },
                    { val: cpDimH, set: setCpDimH, ph: "H" },
                  ].map(({ val, set, ph }) => (
                    <div key={ph} className="relative">
                      <Input type="number" placeholder={ph} value={val} onChange={(e) => set(e.target.value)} className="pr-10" min={0} />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">cm</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0 bg-white">
            <Button variant="outline" onClick={() => setShowCreateProduct(false)}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!cpName.trim() || !cpPrice || Number(cpPrice) <= 0}
              onClick={() => {
                const newProduct = {
                  id: `prod_custom_${Date.now()}`,
                  name: cpName.trim(),
                  price: Number(cpPrice),
                  discountedPrice: cpDiscountedPrice ? Number(cpDiscountedPrice) : undefined,
                  qty: undefined,
                  category: "",
                  description: "",
                  images: cpImages,
                };
                const effectivePrice = newProduct.discountedPrice ?? newProduct.price;
                setSmartCatalogue((prev) => [...prev, newProduct]);
                setSmartSelectedIds((prev) => [...prev, newProduct.id]);
                setSmartSelectedItems((prev) => {
                  const next = [...prev, { id: newProduct.id, price: effectivePrice, qty: 1 }];
                  const t = next.reduce((s, si) => s + si.price * si.qty, 0);
                  const fee = deliveryFreeShipping ? 0 : (Number(deliveryFee) || 0);
                  setFormData((f) => ({ ...f, amount: String(t + fee) }));
                  return next;
                });
                setShowCreateProduct(false);
                setCpName(""); setCpPrice(""); setCpDiscountedPrice(""); setCpImages([]);
                setCpWeight(""); setCpDimL(""); setCpDimW(""); setCpDimH("");
                toast.success(`"${newProduct.name}" added to catalogue and selected`);
              }}
            >
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal - Post Payment Link Creation */}
      <Dialog open={showSuccessModal} onOpenChange={(open) => { if (!open) { setShowSuccessModal(false); setCreatedLink(""); setCreatedLinkId(""); resetCreateForm(); } }}>
        <DialogContent className="w-[min(420px,calc(100vw-32px))] p-0 gap-0 [&>button.absolute]:hidden rounded-xl">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground text-sm leading-tight">Payment Link Created!</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Your link is ready to accept payments.</p>
            </div>
            <button
              onClick={() => { setShowSuccessModal(false); setCreatedLink(""); setCreatedLinkId(""); resetCreateForm(); }}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            {/* Link box */}
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground mb-1">Your Payment Link</p>
              <p className="text-xs text-foreground font-mono break-all leading-relaxed">{createdLink}</p>
            </div>

            {/* Copy + Preview */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(createdLink); toast.success("Link copied!"); }}>
                <Copy className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Copy Link</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`/pay/${createdLinkId}`, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Preview</span>
              </Button>
            </div>

            {/* Enabled integrations */}
            {(shiprocketEnabled || whatsappConfirmationEnabled) && (
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 space-y-1.5">
                <p className="text-xs font-medium text-foreground">Enabled Integrations</p>
                {shiprocketEnabled && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span>Shiprocket — Order details sent automatically</span>
                  </div>
                )}
                {whatsappConfirmationEnabled && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span>WhatsApp — Confirmation sent to customer</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment schedule summary */}
            {collectInMultiplePayments && (
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <p className="text-xs font-medium text-foreground mb-2">
                  Payment Schedule{multiPaymentMode === "schedule" ? ` — ${installments.length} payments` : " — Customer chooses amount"}
                </p>
                {multiPaymentMode === "schedule" ? (
                  <div className="space-y-1.5">
                    {installments.map((inst, idx) => (
                      <div key={inst.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="min-w-0 truncate">{inst.label || `Payment ${idx + 1}`}{inst.dueDate ? ` · Due ${new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}</span>
                        <span className="font-medium text-foreground flex-shrink-0">
                          {inst.amount !== "" && !isNaN(Number(inst.amount)) ? `₹${Number(inst.amount).toLocaleString("en-IN")}` : <span className="italic">TBD</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Customer can pay any amount up to ₹{Number(formData.amount || 0).toLocaleString("en-IN")} across multiple visits.</p>
                )}
              </div>
            )}

            {/* Post-payment invoice option */}
            <div className="rounded-lg border border-border bg-background">
              <div className="flex items-start gap-3 px-3 pt-3 pb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-foreground">Send invoice post payment automatically</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary text-white leading-none flex-shrink-0">New</span>
                  </div>
                  {invoiceConfigured ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Configured
                    </span>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">GST-compliant invoice will be sent to the customer on payment.</p>
                  )}
                  {autoSendInvoice && invoiceConfigured && (
                    <button onClick={() => { setShowSuccessModal(false); setShowGstModal(true); }} className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Edit invoice details
                    </button>
                  )}
                </div>
                <Switch
                  checked={autoSendInvoice}
                  onCheckedChange={(checked) => {
                    setAutoSendInvoice(checked);
                    if (checked) {
                      setShowSuccessModal(false);
                      setShowGstModal(true);
                    } else {
                      setInvoiceConfigured(false);
                    }
                  }}
                  className="flex-shrink-0 mt-0.5"
                />
              </div>
              <p className="text-xs text-muted-foreground px-3 pb-3 leading-relaxed">
                You can create the invoice later post payment confirmation too from the{" "}
                <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => setShowSuccessModal(false)}>
                  payment link details
                </span>{" "}section.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4">
            <Button
              className="w-full"
              onClick={() => { setShowSuccessModal(false); setCreatedLink(""); setCreatedLinkId(""); resetCreateForm(); }}
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
              <div className="flex justify-between items-start py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Partial Payment</span>
                <span className="text-sm font-medium">{selectedLink.collectInMultiplePayments ? "Enabled" : "Disabled"}</span>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Amount</span>
                <span className="text-sm font-medium">₹ {selectedLink.amount.toLocaleString('en-IN')}</span>
              </div>

              {/* Amount Paid */}
              {(selectedLink.amountPaid != null || getDisplayStatus(selectedLink) === "Paid") && (
                <div className="flex justify-between items-start py-3">
                  <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Amount Paid</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-700">₹ {(selectedLink.amountPaid ?? selectedLink.amount).toLocaleString('en-IN')}</p>
                    {getDisplayStatus(selectedLink) === "Paid" && <p className="text-xs text-blue-600 mt-0.5">pay_{selectedLink.id.slice(-12)}</p>}
                    {getDisplayStatus(selectedLink) === "Paid" && <p className="text-xs text-muted-foreground mt-0.5">Paid on {selectedLink.date}</p>}
                  </div>
                </div>
              )}

              {/* Amount Paid (legacy full-paid block kept for non-partial paid links) */}
              {getDisplayStatus(selectedLink) === "Paid" && selectedLink.amountPaid == null && (
                <div className="flex justify-between items-start py-3">
                  <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Amount Paid</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-700">₹ {selectedLink.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-blue-600 mt-0.5">pay_{selectedLink.id.slice(-12)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Paid on {selectedLink.date}</p>
                  </div>
                </div>
              )}

              {/* Payment Schedule — shown below Amount */}
              {selectedLink.collectInMultiplePayments && selectedLink.multiPaymentMode === "schedule" && selectedLink.installments?.length > 0 && (
                <div className="py-3 space-y-2.5">
                  <span className="text-xs font-medium text-foreground block">Payment Schedule</span>
                  {selectedLink.installments.map((inst: any, idx: number) => {
                    const instStatusColor: Record<string, string> = {
                      Paid: "bg-green-100 text-green-700",
                      Pending: "bg-yellow-100 text-yellow-700",
                      Upcoming: "bg-secondary text-muted-foreground",
                      Failed: "bg-red-100 text-red-700",
                    };
                    return (
                      <div key={inst.id || idx} className="rounded-lg border border-border overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2.5 bg-secondary/30">
                          <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">{idx + 1}</div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{inst.label || `Payment ${idx + 1}`}</p>
                              {inst.dueDate && <p className="text-[10px] text-muted-foreground">Due: {new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-semibold text-foreground">{inst.amount ? `₹${Number(inst.amount).toLocaleString("en-IN")}` : "—"}</span>
                            {inst.status && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${instStatusColor[inst.status] || "bg-secondary text-muted-foreground"}`}>{inst.status}</span>}
                          </div>
                        </div>
                        {inst.transactions?.filter((tx: any) => tx.status === "Success").length > 0 && (
                          <div className="divide-y divide-border">
                            {inst.transactions.filter((tx: any) => tx.status === "Success").map((tx: any) => (
                              <div key={tx.id} className="flex items-center justify-between px-3 py-2 bg-white">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-500" />
                                  <div>
                                    <p className="text-[10px] font-mono text-muted-foreground">{tx.id}</p>
                                    <p className="text-[10px] text-muted-foreground">{tx.date} · {tx.method}</p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-medium text-green-600">₹{Number(tx.amount).toLocaleString("en-IN")}</p>
                                  <p className="text-[10px] text-green-600">Success</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

              {/* Delivery Address — Magic Links only, shown once payment is made */}
              {selectedLink.isSmartLink && selectedLink.customerAddress && ["Paid", "Partially Paid"].includes(getDisplayStatus(selectedLink)) && (() => {
                const addr = selectedLink.customerAddress;
                const fullAddrText = [addr.name, addr.addressLine, addr.cityState].filter(Boolean).join(", ");
                return (
                  <div className="py-3 space-y-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Delivery Address</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(fullAddrText);
                          toast.success("Address copied to clipboard");
                        }}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/5"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </button>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/20 px-3 py-2.5 space-y-0.5">
                      {addr.tag && (
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mb-1">
                          {addr.tag}
                        </span>
                      )}
                      {addr.name && (
                        <p className="text-sm font-medium text-foreground">{addr.name}</p>
                      )}
                      <p className="text-sm text-foreground leading-snug">{addr.addressLine}</p>
                      <p className="text-xs text-muted-foreground">{addr.cityState}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Magic Link Order Details */}
              {selectedLink.isSmartLink && selectedLink.smartProducts?.length > 0 && (
                <div className="space-y-3 py-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Order Details</span>
                  </div>

                  {/* Product rows */}
                  <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                    {selectedLink.smartProducts.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">×{p.qty} · ₹{p.price.toLocaleString("en-IN")} each</p>
                        </div>
                        <span className="text-sm font-medium ml-3 flex-shrink-0">₹{(p.price * p.qty).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    {selectedLink.deliveryFee > 0 && (
                      <div className="flex items-center justify-between px-3 py-2.5 bg-secondary/20">
                        <span className="text-sm text-muted-foreground">Delivery fee</span>
                        <span className="text-sm font-medium">₹{Number(selectedLink.deliveryFee).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-secondary/30">
                      <span className="text-xs font-semibold text-foreground">Total</span>
                      <span className="text-sm font-bold text-foreground">
                        ₹{(
                          selectedLink.smartProducts.reduce((s: number, p: any) => s + p.price * p.qty, 0) +
                          (selectedLink.deliveryFee || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Logistics card — shown only if logistics was configured */}
                  {selectedLink.logistics?.enabled && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/20 border-b border-border">
                        <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Logistics</span>
                        <span className="ml-auto text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full capitalize">
                          {selectedLink.logistics.partner === "shiprocket" ? "Shiprocket" : "Delhivery"}
                        </span>
                      </div>
                      <div className="px-3 py-3 space-y-2.5">
                        {/* Pickup address */}
                        {selectedLink.logistics.pickupAddress && (
                          <div className="flex gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Pickup Address</p>
                              <p className="text-xs text-foreground">{selectedLink.logistics.pickupAddress.line}</p>
                              <p className="text-xs text-muted-foreground">
                                {[selectedLink.logistics.pickupAddress.city, selectedLink.logistics.pickupAddress.state, selectedLink.logistics.pickupAddress.pincode].filter(Boolean).join(", ")}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Weight / dimensions */}
                        {selectedLink.logistics.deadWeight && (
                          <div className="flex gap-2">
                            <Package className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Package</p>
                              <p className="text-xs text-foreground">Dead weight: {selectedLink.logistics.deadWeight} kg</p>
                              {selectedLink.logistics.dimL && selectedLink.logistics.dimB && selectedLink.logistics.dimH && (
                                <p className="text-xs text-muted-foreground">
                                  {selectedLink.logistics.dimL} × {selectedLink.logistics.dimB} × {selectedLink.logistics.dimH} cm
                                  {" · "}
                                  {((Number(selectedLink.logistics.dimL) * Number(selectedLink.logistics.dimB) * Number(selectedLink.logistics.dimH)) / 5000).toFixed(2)} kg vol.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Shipment status */}
                        <div className="flex gap-2">
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-1.5 ${getDisplayStatus(selectedLink) === "Paid" ? "bg-emerald-500" : "bg-amber-400"}`} />
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Shipment Status</p>
                            {getDisplayStatus(selectedLink) === "Paid" ? (
                              <>
                                <p className="text-xs font-semibold text-emerald-700">Order pushed to {selectedLink.logistics.partner === "shiprocket" ? "Shiprocket" : "Delhivery"}</p>
                                <p className="text-xs text-muted-foreground">Sent on {selectedLink.date}</p>
                              </>
                            ) : (
                              <p className="text-xs text-amber-700">Pending payment — order will be pushed after payment is completed</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                        // Build and open the wealthjoy-style receipt
                        const link = selectedLink!;
                        const merchantInitials = "MR";
                        const merchantBrandName = "Manish Reddy";
                        const brandColor = "#0066FF";
                        const paidOn = link.date ? new Date(link.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                        const amount = link.amount ? Number(link.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00";
                        const paymentFor = link.title || link.description || "Payment";
                        const txnRef = `pay_${link.id?.slice(-8) || "000000"}`;
                        const customerName = link.customer || "Customer";
                        const customerEmail = link.customerEmail || "";
                        const customerPhone = link.customerPhone || "";

                        const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Receipt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #d0d0d0; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
    .receipt-card { width: 794px; min-height: 1123px; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.13); display: flex; flex-direction: column; position: relative; }
    .receipt-body { flex: 1; padding: 56px 60px 32px; display: flex; flex-direction: column; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0; }
    .receipt-title { font-size: 38px; font-weight: 700; color: #000; letter-spacing: -0.5px; line-height: 1; margin-bottom: 20px; }
    .meta-grid { display: grid; grid-template-columns: auto 1fr; gap: 6px 18px; align-items: baseline; }
    .meta-key { font-size: 13px; color: #888; font-weight: 400; white-space: nowrap; }
    .meta-val { font-size: 13px; color: #1a1a1a; font-weight: 500; }
    .header-right { display: flex; flex-direction: column; align-items: center; gap: 9px; }
    .logo-box { width: 88px; height: 88px; background: ${brandColor}; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .logo-mark { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; line-height: 1; }
    .logo-name { font-size: 13.5px; font-weight: 600; color: #333; letter-spacing: 0.2px; }
    .divider { height: 1px; background: #e8e8e8; margin: 30px 0; }
    .parties-row { display: grid; grid-template-columns: 1fr 1fr; margin-top: 32px; }
    .party-label { font-size: 12px; color: #888; font-weight: 600; margin-bottom: 10px; }
    .party-name { font-size: 15px; font-weight: 700; color: #000; margin-bottom: 6px; }
    .party-detail { font-size: 13px; color: #444; line-height: 1.9; }
    .party-detail a { color: #444; text-decoration: none; }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table thead tr { border-bottom: 1px solid #e8e8e8; }
    .items-table th { padding: 11px 10px; font-size: 12.5px; font-weight: 500; color: #aaa; text-align: left; white-space: nowrap; }
    .items-table th:not(:first-child) { text-align: right; }
    .items-table tbody tr { border-bottom: 1px solid #f0f0f0; }
    .items-table td { padding: 20px 10px; vertical-align: middle; color: #1a1a1a; font-size: 14px; }
    .items-table td:not(:first-child) { text-align: right; }
    .item-name { font-weight: 500; }
    .totals-area { display: flex; justify-content: flex-end; margin-top: 6px; }
    .totals-box { width: 290px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 10px; font-size: 13.5px; color: #555; }
    .total-row.grand { font-size: 19px; font-weight: 700; color: #000; padding-top: 12px; border-top: 1.5px solid #ccc; margin-top: 4px; }
    .total-row.amount-paid { font-size: 13.5px; font-weight: 500; color: #444; padding-top: 6px; }
    .spacer { flex: 1; }
    .footer { border-top: 1px solid #e8e8e8; padding: 18px 60px; display: flex; align-items: center; justify-content: space-between; background: #fff; }
    .rzp-row { display: flex; align-items: center; gap: 6px; }
    .rzp-text { font-size: 12px; color: #888; }
    .rzp-wordmark { font-size: 14px; font-weight: 700; color: #000; letter-spacing: -0.3px; }
    .footer-page { font-size: 12px; color: #aaa; }
    .print-btn { display: block; margin: 20px auto 0; padding: 10px 30px; background: #000; color: #fff; border: none; border-radius: 5px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; letter-spacing: 0.2px; }
    .print-btn:hover { opacity: 0.75; }
    @media print { body { background: #fff; padding: 0; } .print-btn { display: none; } .receipt-card { width: 210mm; min-height: 297mm; box-shadow: none; } }
  </style>
</head>
<body>
<div class="receipt-card">
  <div class="receipt-body">
    <div class="header">
      <div class="header-left">
        <div class="receipt-title">Payment Receipt</div>
        <div class="meta-grid">
          <span class="meta-key">Transaction Reference:</span>
          <span class="meta-val">${txnRef}</span>
          <span class="meta-key">Paid On:</span>
          <span class="meta-val">${paidOn}</span>
          <span class="meta-key">Payment For:</span>
          <span class="meta-val">${paymentFor}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="logo-box"><div class="logo-mark">${merchantInitials}</div></div>
        <div class="logo-name">${merchantBrandName}</div>
      </div>
    </div>
    <div class="parties-row">
      <div class="party-block">
        <div class="party-label">Bill From</div>
        <div class="party-name">${merchantBrandName}</div>
        <div class="party-detail">billing@${merchantBrandName.toLowerCase().replace(/\s+/g, "")}.in</div>
      </div>
      <div class="party-block">
        <div class="party-label">Bill To</div>
        <div class="party-name">${customerName}</div>
        <div class="party-detail">
          ${customerEmail ? `<a href="mailto:${customerEmail}">${customerEmail}</a><br>` : ""}
          ${customerPhone || ""}
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:50%">Description</th>
          <th>Unit Price</th>
          <th>Qty</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="item-name">${paymentFor}</span></td>
          <td>₹ ${amount}</td>
          <td>1</td>
          <td>₹ ${amount}</td>
        </tr>
      </tbody>
    </table>
    <div class="totals-area">
      <div class="totals-box">
        <div class="total-row grand"><span>Total</span><span>₹ ${amount}</span></div>
        <div class="total-row amount-paid"><span>Amount Paid</span><span>₹ ${amount}</span></div>
      </div>
    </div>
    <div class="spacer"></div>
  </div>
  <div class="footer">
    <div class="rzp-row">
      <span class="rzp-text">Invoicing and payments powered by</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-left:6px">
        <path d="M13.5 2L4 14h8l-1.5 8L20 10h-8l1.5-8z" fill="#000"/>
      </svg>
      <span class="rzp-wordmark">Razorpay</span>
    </div>
    <div class="footer-page">Page 1 of 1</div>
  </div>
</div>
<button class="print-btn" onclick="window.print()">Download / Print PDF</button>
</body>
</html>`;

                        const blob = new Blob([receiptHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        toast.success("Receipt opened — use Print to save as PDF");
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
              Generate Tax Invoice
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">Customer Name *</label>
                      {selectedLink?.customer && (
                        <button
                          type="button"
                          onClick={() => setDetailGstCustomerName(selectedLink.customer)}
                          className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Wand2 className="h-3 w-3" /> Prefill from payment
                        </button>
                      )}
                    </div>
                    <Input
                      className="h-9 text-sm"
                      placeholder="e.g. Acme Pvt Ltd"
                      value={detailGstCustomerName}
                      onChange={(e) => setDetailGstCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Customer GST Number <span className="text-muted-foreground font-normal">(Optional)</span>
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
                    <label className="text-xs font-medium text-foreground">Billing Address <span className="text-muted-foreground font-normal">(Optional)</span></label>
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
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground">Item / Service Name</label>
                            <Input
                              className="h-8 text-sm"
                              placeholder="e.g. Online Course"
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...detailInvoiceItems];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setDetailInvoiceItems(updated);
                              }}
                            />
                          </div>
                          <div className="w-24 space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground">Rate (₹)</label>
                            <Input
                              className="h-8 text-sm"
                              placeholder="0.00"
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
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground">Quantity</label>
                            <Input
                              className="h-8 text-sm text-center"
                              placeholder="1"
                              value={item.qty}
                              onChange={(e) => {
                                const updated = [...detailInvoiceItems];
                                updated[idx] = { ...updated[idx], qty: e.target.value };
                                setDetailInvoiceItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground">HSN / SAC</label>
                            <Input
                              className="h-8 text-sm"
                              placeholder="e.g. 9983"
                              value={item.hsn}
                              onChange={(e) => {
                                const updated = [...detailInvoiceItems];
                                updated[idx] = { ...updated[idx], hsn: e.target.value };
                                setDetailInvoiceItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground">Tax Rate</label>
                            <select
                              className="h-8 w-full text-sm border border-input rounded-md px-2 bg-background"
                              value={item.taxRate}
                              onChange={(e) => {
                                const updated = [...detailInvoiceItems];
                                updated[idx] = { ...updated[idx], taxRate: e.target.value };
                                setDetailInvoiceItems(updated);
                              }}
                            >
                              <option value="">None</option>
                              <option value="0">0% (Exempt)</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
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

                      {/* Notes */}
                      <div className="border-t border-gray-100 pt-3 space-y-1">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
                        <p className="text-xs text-gray-500 italic">Thank you for your business. Please reach out to us for any queries.</p>
                      </div>

                      {/* Terms & Conditions */}
                      <div className="border-t border-gray-100 pt-3 space-y-1">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Terms & Conditions</p>
                        <ol className="text-[10px] text-gray-400 space-y-0.5 list-decimal list-inside leading-relaxed">
                          <li>Payment is due within 14 days of invoice date.</li>
                          <li>All sales are final. Refunds subject to policy.</li>
                          <li>Disputes must be raised within 7 days of receipt.</li>
                        </ol>
                      </div>

                      {/* Authorised Signatory */}
                      <div className="border-t border-gray-100 pt-3 flex justify-end">
                        <div className="text-right space-y-6">
                          <div>
                            <div className="w-32 h-12 border border-dashed border-gray-200 rounded flex items-center justify-center ml-auto">
                              <span className="text-[9px] text-gray-300 italic">Signature</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-700">Authorised Signatory</p>
                            <p className="text-[10px] text-gray-400">WealthJoy</p>
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
              className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setDetailReceiptGenerated(true);
                setDetailIncludeGst(true);
                setInvoiceConfigured(true);
                setShowGstModal(false);
                toast.success("Invoice details saved! The tax invoice will be automatically generated and sent to the customer once payment is completed.", { duration: 5000 });
              }}
            >
              <Check className="h-3.5 w-3.5" /> Save Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Invoice Creation Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-3xl h-[90vh] p-0 flex flex-col gap-0 overflow-hidden [&>button.absolute]:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
            <div>
              <h2 className="text-base font-semibold text-foreground">Create Invoice</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sent automatically to the customer after payment is received</p>
            </div>
            <button onClick={() => setShowInvoiceDialog(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Merchant info strip (read-only, fetched from account) */}
          <div className="px-6 py-3 bg-muted/30 border-b flex items-center gap-3 flex-shrink-0">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {MERCHANT_INFO.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{MERCHANT_INFO.name}</p>
              <p className="text-xs text-muted-foreground truncate">GSTIN: {MERCHANT_INFO.gstin} · {MERCHANT_INFO.city}, {MERCHANT_INFO.state}</p>
            </div>
            <span className="text-xs text-muted-foreground bg-white border border-border rounded px-2 py-0.5 flex-shrink-0">From your account</span>
          </div>

          {/* Tab nav */}
          <div className="flex border-b flex-shrink-0 bg-white">
            {(["details", "customer", "items"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setInvActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  invActiveTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "details" ? "Invoice Details" : tab === "customer" ? "Customer" : "Line Items"}
              </button>
            ))}
          </div>

          {/* Scrollable tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Details tab ── */}
            {invActiveTab === "details" && (
              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Invoice # <span className="font-normal">(Optional)</span></label>
                    <Input placeholder="e.g. INV-2025-001" value={invNumber} onChange={e => setInvNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Currency <span className="text-destructive">*</span></label>
                    <Select value={invCurrency} onValueChange={setInvCurrency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["INR", "USD", "EUR", "GBP", "AED", "SGD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="max-w-xs">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Issue Date <span className="text-destructive">*</span></label>
                  <Input type="date" value={invDate} onChange={e => setInvDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description <span className="font-normal">(Optional, max 2048 chars)</span></label>
                  <textarea
                    rows={3}
                    maxLength={2048}
                    value={invDesc}
                    onChange={e => setInvDesc(e.target.value)}
                    placeholder="Brief summary of this invoice..."
                    className="w-full border border-input rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-white"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{invDesc.length}/2048</p>
                </div>
                {invCurrency !== "INR" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    Tax rates cannot be added for invoices created using international currencies.
                  </div>
                )}
              </div>
            )}

            {/* ── Customer tab ── */}
            {invActiveTab === "customer" && (
              <div className="px-6 py-5 space-y-5">
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  Customer details pre-filled from payment link — edit if needed.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name (Company / Individual) <span className="text-destructive">*</span></label>
                    <Input placeholder="Customer name" value={invCustName} onChange={e => setInvCustName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Customer GSTIN <span className="font-normal">(GST invoices only)</span></label>
                    <Input placeholder="22AAAAA0000A1Z5" value={invCustGSTIN} onChange={e => setInvCustGSTIN(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                    <Input type="email" placeholder="customer@example.com" value={invCustEmail} onChange={e => setInvCustEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact No.</label>
                    <Input placeholder="+91 98765 43210" value={invCustPhone} onChange={e => setInvCustPhone(e.target.value)} />
                  </div>
                </div>

                {!invCustGSTIN && (
                  <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    If GSTIN is not provided, the option to display Tax Rate as per HSN/SAC code will not be available.
                  </div>
                )}

                {/* Billing address */}
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Billing Address</p>
                  <Input placeholder="Address Line 1" value={invBillLine1} onChange={e => setInvBillLine1(e.target.value)} />
                  <Input placeholder="Address Line 2" value={invBillLine2} onChange={e => setInvBillLine2(e.target.value)} />
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="City" value={invBillCity} onChange={e => setInvBillCity(e.target.value)} />
                    <Select value={invBillState} onValueChange={setInvBillState}>
                      <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                      <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="PIN Code" maxLength={6} value={invBillPin} onChange={e => setInvBillPin(e.target.value)} />
                  </div>
                  <Input placeholder="Country" value={invBillCountry} onChange={e => setInvBillCountry(e.target.value)} />
                </div>

                {/* Shipping address */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Shipping Address</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox id="invShipSame" checked={invShipSameAsBill} onCheckedChange={c => setInvShipSameAsBill(!!c)} />
                      <span className="text-xs text-muted-foreground">Same as billing</span>
                    </label>
                  </div>
                  {!invShipSameAsBill && (
                    <>
                      <Input placeholder="Address Line 1" value={invShipLine1} onChange={e => setInvShipLine1(e.target.value)} />
                      <Input placeholder="Address Line 2" value={invShipLine2} onChange={e => setInvShipLine2(e.target.value)} />
                      <div className="grid grid-cols-3 gap-3">
                        <Input placeholder="City" value={invShipCity} onChange={e => setInvShipCity(e.target.value)} />
                        <Select value={invShipState} onValueChange={setInvShipState}>
                          <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                          <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input placeholder="PIN Code" maxLength={6} value={invShipPin} onChange={e => setInvShipPin(e.target.value)} />
                      </div>
                    </>
                  )}
                </div>

                {/* Place of supply — GST only */}
                {invCustGSTIN && (
                  <div className="border-t pt-4">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Place of Supply <span className="text-destructive">*</span> <span className="font-normal">(GST invoices only)</span>
                    </label>
                    <Select value={invPlaceOfSupply} onValueChange={setInvPlaceOfSupply}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    {invPlaceOfSupply && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Tax computed as <strong>{invPlaceOfSupply === MERCHANT_INFO.state ? "CGST + SGST" : "IGST"}</strong>
                        {" "}({invPlaceOfSupply === MERCHANT_INFO.state ? "same state as merchant" : "different state"})
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Items tab ── */}
            {invActiveTab === "items" && (
              <div className="px-6 py-5 space-y-5">
                {/* Saved items library */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">Saved Items</p>
                    <button onClick={() => setShowAddItemForm(v => !v)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Create new item
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...SAVED_ITEMS, ...savedItemsLib].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setInvItems(prev => {
                          const filtered = prev.filter(i => i.name || i.rate);
                          return [...filtered, { id: Date.now().toString(), name: item.name, description: "", qty: "1", rate: item.rate, discount: "", taxRate: (item as any).taxRate || "", taxType: "exclusive" as const, hsnCode: (item as any).hsn || (item as any).hsnCode || "", sacCode: "", cess: "" }];
                        })}
                        className="px-3 py-1.5 text-xs bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create new item form */}
                {showAddItemForm && (
                  <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">New Item</p>
                      <button onClick={() => setShowAddItemForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Item Name *</label>
                        <Input placeholder="e.g. Web Development Services" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Rate per unit *</label>
                        <Input placeholder="0.00" type="number" value={newItem.rate} onChange={e => setNewItem({ ...newItem, rate: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                      <Input placeholder="Brief description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Tax Rate</label>
                        <Select value={newItem.taxRate} onValueChange={v => setNewItem({ ...newItem, taxRate: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="0%" /></SelectTrigger>
                          <SelectContent>{["0", "5", "12", "18", "28"].map(r => <SelectItem key={r} value={r}>{r}%</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Tax Type</label>
                        <Select value={newItem.taxType} onValueChange={v => setNewItem({ ...newItem, taxType: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exclusive">Exclusive</SelectItem>
                            <SelectItem value="inclusive">Inclusive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">HSN Code</label>
                        <Input placeholder="e.g. 998313" value={newItem.hsnCode} onChange={e => setNewItem({ ...newItem, hsnCode: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">SAC Code</label>
                        <Input placeholder="e.g. 9983" value={newItem.sacCode} onChange={e => setNewItem({ ...newItem, sacCode: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={() => { setShowAddItemForm(false); setNewItem({ name: "", description: "", rate: "", taxRate: "", taxType: "exclusive", hsnCode: "", sacCode: "", cess: "" }); }}>Cancel</Button>
                      <Button size="sm" onClick={() => {
                        if (!newItem.name || !newItem.rate) { toast.error("Item name and rate are required"); return; }
                        const saved = { ...newItem, id: `item_${Date.now()}` };
                        const updated = [...savedItemsLib, saved];
                        setSavedItemsLib(updated);
                        try { localStorage.setItem("rzp_saved_items", JSON.stringify(updated)); } catch {}
                        setInvItems(prev => [...prev.filter(i => i.name || i.rate), { id: Date.now().toString(), name: newItem.name, description: newItem.description, qty: "1", rate: newItem.rate, discount: "", taxRate: newItem.taxRate, taxType: "exclusive" as const, hsnCode: newItem.hsnCode, sacCode: newItem.sacCode, cess: "" }]);
                        setShowAddItemForm(false);
                        setNewItem({ name: "", description: "", rate: "", taxRate: "", taxType: "exclusive", hsnCode: "", sacCode: "", cess: "" });
                        toast.success("Item saved to your library");
                      }}>Save & Add</Button>
                    </div>
                  </div>
                )}

                {/* Line items list */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Line Items <span className="text-xs font-normal text-muted-foreground">(up to 50)</span></p>
                  {invItems.map((item, idx) => (
                    <div key={item.id} className="border border-border rounded-lg p-3 space-y-3 bg-white">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4 flex-shrink-0">{idx + 1}.</span>
                        <Input placeholder="Item name *" value={item.name} onChange={e => { const u = [...invItems]; u[idx] = { ...u[idx], name: e.target.value }; setInvItems(u); }} className="flex-1" />
                        {invItems.length > 1 && (
                          <button onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Input placeholder="Description (optional)" value={item.description} onChange={e => { const u = [...invItems]; u[idx] = { ...u[idx], description: e.target.value }; setInvItems(u); }} />
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Qty *</label>
                          <Input placeholder="1" type="number" min="1" value={item.qty} onChange={e => { const u = [...invItems]; u[idx] = { ...u[idx], qty: e.target.value }; setInvItems(u); }} />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Rate *</label>
                          <Input placeholder="0.00" type="number" value={item.rate} onChange={e => { const u = [...invItems]; u[idx] = { ...u[idx], rate: e.target.value }; setInvItems(u); }} />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Discount %</label>
                          <Input placeholder="0" type="number" min="0" max="100" value={item.discount} onChange={e => { const u = [...invItems]; u[idx] = { ...u[idx], discount: e.target.value }; setInvItems(u); }} />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Tax Rate</label>
                          <Select value={item.taxRate} onValueChange={v => { const u = [...invItems]; u[idx] = { ...u[idx], taxRate: v }; setInvItems(u); }}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="0%" /></SelectTrigger>
                            <SelectContent>{["0", "5", "12", "18", "28"].map(r => <SelectItem key={r} value={r}>{r}%</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      {invCurrency === "INR" && item.taxRate && item.taxRate !== "0" && (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Tax Type</label>
                            <Select value={item.taxType} onValueChange={v => { const u = [...invItems]; u[idx] = { ...u[idx], taxType: v as "inclusive" | "exclusive" }; setInvItems(u); }}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                                <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">HSN Code</label>
                            <Input placeholder="6–8 digits" value={item.hsnCode} onChange={e => { const u = [...invItems]; u[idx] = { ...u[idx], hsnCode: e.target.value }; setInvItems(u); }} />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Cess %</label>
                            <Input placeholder="0" type="number" value={item.cess} onChange={e => { const u = [...invItems]; u[idx] = { ...u[idx], cess: e.target.value }; setInvItems(u); }} />
                          </div>
                        </div>
                      )}
                      {item.name && item.rate && (() => {
                        const qty = parseFloat(item.qty) || 1;
                        const rate = parseFloat(item.rate) || 0;
                        const disc = parseFloat(item.discount) || 0;
                        const taxRate = parseFloat(item.taxRate) || 0;
                        const base = qty * rate * (1 - disc / 100);
                        const tax = item.taxType === "exclusive" ? base * taxRate / 100 : 0;
                        return <div className="flex justify-end text-xs font-semibold text-foreground">₹{(base + tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>;
                      })()}
                    </div>
                  ))}
                  <button onClick={() => setInvItems(prev => [...prev, { id: Date.now().toString(), name: "", description: "", qty: "1", rate: "", discount: "", taxRate: "", taxType: "exclusive" as const, hsnCode: "", sacCode: "", cess: "" }])} className="mt-1 text-sm text-primary hover:underline flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add row
                  </button>
                </div>

                {/* Totals */}
                {(() => {
                  let subtotal = 0, totalTax = 0;
                  invItems.forEach(item => {
                    const qty = parseFloat(item.qty) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    const disc = parseFloat(item.discount) || 0;
                    const taxRate = parseFloat(item.taxRate) || 0;
                    const base = qty * rate * (1 - disc / 100);
                    if (item.taxType === "exclusive") { subtotal += base; totalTax += base * taxRate / 100; }
                    else { const tax = base * taxRate / (100 + taxRate); subtotal += base - tax; totalTax += tax; }
                  });
                  const total = subtotal + totalTax;
                  if (total === 0) return null;
                  return (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                      {totalTax > 0 && <div className="flex justify-between text-sm text-muted-foreground"><span>Tax</span><span>₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>}
                      <div className="flex justify-between text-base font-bold text-foreground border-t pt-2"><span>Total</span><span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer with next/back/save */}
          <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0 bg-white">
            <div>
              {invActiveTab !== "details" && (
                <Button variant="ghost" size="sm" onClick={() => setInvActiveTab(invActiveTab === "customer" ? "details" : "customer")}>
                  ← Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
              {invActiveTab !== "items" ? (
                <Button onClick={() => setInvActiveTab(invActiveTab === "details" ? "customer" : "items")}>
                  Next →
                </Button>
              ) : (
                <Button onClick={handleSaveInvoice}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Save Invoice Config
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default PaymentLinks;
