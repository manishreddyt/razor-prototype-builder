import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings, Camera,
  X, Copy, ExternalLink, Globe, Plus,
  Trash2, GripVertical, Check, Code, Share2, ChevronDown,
  Save, Loader2, CheckCircle2, Link2, QrCode, Download, BarChart3, ChevronRight, Receipt,
  Image as ImageIcon, MoreVertical, ChevronUp, Package, DollarSign, AlignLeft,
  Hash, Mail, Phone, Type, Link, CalendarDays, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type InputFieldType =
  | "text" | "alpha" | "alphanum" | "number" | "email" | "phone"
  | "url" | "textarea" | "pan" | "pincode" | "dropdown" | "date";

type AmountFieldType = "amount-fixed" | "amount-custom" | "amount-item";

type FieldType = InputFieldType | AmountFieldType;

interface BaseField {
  id: string;
  label: string;
  required: boolean;
  placeholder: string;
}

interface InputField extends BaseField {
  fieldKind: "input";
  type: InputFieldType;
  options?: string[]; // for dropdown
}

interface AmountField extends BaseField {
  fieldKind: "amount";
  type: AmountFieldType;
  amount: number;
  // item-with-quantity extras
  description?: string;
  image?: string;
  optional?: boolean;
  minQty?: number;
  maxQty?: number;
  // UI state
  showDescription?: boolean;
}

type FormField = InputField | AmountField;

interface PageSection {
  id: string;
  type: "banner" | "heading" | "text" | "features" | "testimonials" | "faq" | "cta";
  visible: boolean;
  content: Record<string, any>;
}

interface PageData {
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  logoInitial: string;
  currency: string;
  buttonText: string;
  buttonColor: string;
  brandColor: string;
  successMessage: string;
  redirectUrl: string;
  collectPhone: boolean;
  collectAddress: boolean;
  sendReceipt: boolean;
  gstEnabled: boolean;
  sections: PageSection[];
  formFields: FormField[];
  status: "draft" | "published";
  slug: string;
  pageUrl: string;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultFormFields: FormField[] = [
  {
    id: "f_amt",
    fieldKind: "amount",
    type: "amount-fixed",
    label: "Amount",
    required: true,
    placeholder: "",
    amount: 2999,
    showDescription: true,
    description: "Event registration fee",
  },
  {
    id: "f_email",
    fieldKind: "input",
    type: "email",
    label: "Email",
    required: true,
    placeholder: "Enter your email",
  },
  {
    id: "f_phone",
    fieldKind: "input",
    type: "phone",
    label: "Phone",
    required: false,
    placeholder: "Enter your phone number",
  },
];

const defaultSections: PageSection[] = [
  { id: "s1", type: "banner", visible: true, content: { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop" } },
  { id: "s2", type: "heading", visible: true, content: { title: "Event Booking — My Page", subtitle: "EVENT BOOKING" } },
  { id: "s3", type: "text", visible: true, content: { text: "A professional event registration page for conferences, workshops, seminars, meetups, concerts, and community gatherings. Collect attendee details, offer multiple ticket tiers, and share your event schedule." } },
  { id: "s4", type: "features", visible: true, content: { title: "Why Students Love This", subtitle: "Here's what makes us different", items: ["Curated Experience", "Expert Speakers", "Networking Opportunities", "Hands-on Workshops"] } },
  { id: "s5", type: "testimonials", visible: true, content: { items: [{ name: "Priya S.", text: "Absolutely loved the event! The speakers were incredible.", rating: 5 }, { name: "Rahul M.", text: "Great networking and well-organized sessions.", rating: 5 }, { name: "Ananya G.", text: "Worth every rupee. Signed up for the next one!", rating: 4 }] } },
  { id: "s6", type: "faq", visible: true, content: { items: [{ q: "What is included in the registration?", a: "Full access to all sessions, workshop materials, lunch, and networking events." }, { q: "Can I get a refund?", a: "Yes, full refund up to 7 days before the event. 50% refund within 7 days." }, { q: "Is there a group discount?", a: "Yes! Groups of 5+ get 15% off. Use code GROUP15 at checkout." }] } },
];

// ─── Label/icon maps ──────────────────────────────────────────────────────────

const INPUT_TYPES: { type: InputFieldType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Single Line Text", icon: Type },
  { type: "alpha", label: "Alphabets", icon: Type },
  { type: "alphanum", label: "Alphanumeric", icon: Hash },
  { type: "number", label: "Number", icon: Hash },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Phone No.", icon: Phone },
  { type: "url", label: "Link / URL", icon: Link },
  { type: "textarea", label: "Large Textarea", icon: AlignLeft },
  { type: "pan", label: "PAN Number", icon: Hash },
  { type: "pincode", label: "Pincode", icon: Hash },
  { type: "dropdown", label: "Dropdown", icon: List },
  { type: "date", label: "Date Picker", icon: CalendarDays },
];

const AMOUNT_TYPES: { type: AmountFieldType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: "amount-fixed", label: "Fixed Amount", desc: "Customers pay a set amount", icon: DollarSign },
  { type: "amount-custom", label: "Customers Decide Amount", desc: "Customers enter any amount", icon: DollarSign },
  { type: "amount-item", label: "Item with Quantity", desc: "Product with quantity selector", icon: Package },
];

const inputTypeLabel = (t: InputFieldType) => INPUT_TYPES.find(x => x.type === t)?.label ?? t;
const amountTypeLabel = (t: AmountFieldType) => AMOUNT_TYPES.find(x => x.type === t)?.label ?? t;

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentPageEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [rightPanel, setRightPanel] = useState<"settings" | "receipts" | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [postPublishDialogOpen, setPostPublishDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState("page");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);

  // DnD
  const dragIndexRef = useRef<number | null>(null);

  // Receipt settings
  const [receiptDeliveryMode, setReceiptDeliveryMode] = useState<"auto" | "manual">("auto");
  const [receiptChannel, setReceiptChannel] = useState<"email" | "whatsapp" | "both">("email");
  const [receiptPrefix, setReceiptPrefix] = useState("RCP");
  const [receiptStartNumber, setReceiptStartNumber] = useState("001");

  const [pageData, setPageData] = useState<PageData>({
    title: searchParams.get("title") || searchParams.get("template") || "Event Booking — My Page",
    subtitle: "EVENT BOOKING",
    description: "A professional event registration page for conferences, workshops, seminars, meetups, concerts, and community gatherings.",
    bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop",
    logoInitial: "E",
    currency: "INR",
    buttonText: "Pay Now",
    buttonColor: "primary",
    brandColor: "#2E5BFF",
    successMessage: "Thank you for your registration! You'll receive a confirmation email shortly.",
    redirectUrl: "",
    collectPhone: true,
    collectAddress: false,
    sendReceipt: true,
    gstEnabled: true,
    sections: defaultSections,
    formFields: defaultFormFields,
    status: "draft",
    slug: "event-booking",
    pageUrl: "https://rzp.io/rzp/event-booking",
  });

  const updatePage = (updates: Partial<PageData>) => {
    setPageData((prev) => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    updatePage({
      formFields: pageData.formFields.map((f) =>
        f.id === id ? ({ ...f, ...patch } as FormField) : f
      ),
    });
  };

  const removeField = (id: string) => {
    updatePage({ formFields: pageData.formFields.filter((f) => f.id !== id) });
    if (expandedFieldId === id) setExpandedFieldId(null);
  };

  const addInputField = (type: InputFieldType) => {
    const field: InputField = {
      id: `f_${Date.now()}`,
      fieldKind: "input",
      type,
      label: INPUT_TYPES.find(x => x.type === type)?.label ?? "New Field",
      required: false,
      placeholder: "Enter value",
    };
    updatePage({ formFields: [...pageData.formFields, field] });
    setExpandedFieldId(field.id);
  };

  const addAmountField = (type: AmountFieldType) => {
    const field: AmountField = {
      id: `f_${Date.now()}`,
      fieldKind: "amount",
      type,
      label: AMOUNT_TYPES.find(x => x.type === type)?.label ?? "Amount",
      required: true,
      placeholder: "",
      amount: 0,
      showDescription: true,
      description: "",
      optional: false,
    };
    updatePage({ formFields: [...pageData.formFields, field] });
    setExpandedFieldId(field.id);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    updatePage({
      sections: pageData.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    });
  };

  // ─── Drag and drop ───────────────────────────────────────────────────────────

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    const fields = [...pageData.formFields];
    const [moved] = fields.splice(from, 1);
    fields.splice(index, 0, moved);
    dragIndexRef.current = index;
    setPageData((prev) => ({ ...prev, formFields: fields }));
    setUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  // ─── Publish ─────────────────────────────────────────────────────────────────

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      updatePage({ status: "published" });
      setPublishDialogOpen(false);
      setPostPublishDialogOpen(true);
      setUnsavedChanges(false);
    }, 2000);
  };

  const handleSave = () => {
    setUnsavedChanges(false);
    toast.success("Changes saved as draft");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pageData.pageUrl);
    toast.success("Link copied to clipboard!");
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const totalAmount = pageData.formFields
    .filter((f): f is AmountField => f.fieldKind === "amount" && f.type === "amount-fixed")
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  // ─── Preview mode ─────────────────────────────────────────────────────────────

  if (previewMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Exit Preview
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">Previewing as your customers will see it</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                <Monitor className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("mobile")} className={`p-2 ${viewMode === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <Button size="sm" onClick={() => { setPreviewMode(false); setPublishDialogOpen(true); }}>Publish</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-lg border border-border overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-3xl"}`}>
            <PagePreviewContent pageData={pageData} viewMode={viewMode} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Editor ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3 sm:px-4 py-2.5 bg-background z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-1.5 flex-shrink-0">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => updatePage({ title: e.target.value })}
              className="font-semibold text-foreground text-sm bg-transparent border-none focus:outline-none focus:ring-0 hover:bg-secondary/50 rounded px-2 py-1 -ml-2 min-w-0 max-w-[140px] sm:max-w-xs truncate"
            />
            {unsavedChanges && <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />}
            <span className={`${pageData.status === "published" ? "blade-badge-paid" : "blade-badge-expired"} text-[10px] flex-shrink-0`}>
              {pageData.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {unsavedChanges && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hidden sm:flex" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" /> Save Draft
            </Button>
          )}
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Monitor className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("mobile")} className={`p-2 ${viewMode === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            variant="outline" size="sm"
            className={`gap-1.5 ${rightPanel === "receipts" ? "bg-secondary" : ""}`}
            onClick={() => setRightPanel(rightPanel === "receipts" ? null : "receipts")}
          >
            <Receipt className="h-4 w-4" /> <span className="hidden sm:inline">Receipts</span>
          </Button>
          <Button
            variant="outline" size="sm"
            className={`gap-1.5 ${rightPanel === "settings" ? "bg-secondary" : ""}`}
            onClick={() => setRightPanel(rightPanel === "settings" ? null : "settings")}
          >
            <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: description editor */}
        <div className="flex-1 overflow-y-auto border-r border-border bg-background min-w-0">
          <div className="p-4 sm:p-8 max-w-2xl">
            {/* Branding */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border border-border flex-shrink-0">
                <span className="text-sm font-bold text-foreground">{pageData.logoInitial}</span>
              </div>
              <span className="text-xs font-semibold text-foreground/60 uppercase tracking-widest truncate">WEALTHJOY TECHNOLOGIES</span>
            </div>

            {/* Page title */}
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => updatePage({ title: e.target.value })}
              placeholder="Enter page title here"
              className="w-full text-xl text-foreground bg-transparent border-b border-border focus:outline-none focus:border-primary pb-2 mb-1 placeholder:text-muted-foreground/40"
            />
            <div className="w-10 h-0.5 bg-primary mb-5" />

            <button className="flex items-center gap-1.5 text-sm text-primary mb-5 hover:underline">
              <Plus className="h-3.5 w-3.5" />
              Add a Goal Tracker
              <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold ml-0.5">NEW</span>
            </button>

            {/* Description */}
            <div className="border border-border rounded-md overflow-hidden mb-3">
              <div className="border-b border-border bg-muted/30 px-3 py-1.5 flex items-center gap-2 flex-wrap">
                <Select defaultValue="normal">
                  <SelectTrigger className="h-6 text-xs border-0 bg-transparent w-20 focus:ring-0 p-0 px-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-px h-4 bg-border mx-1" />
                <button className="text-xs font-black text-muted-foreground hover:text-foreground px-1 py-0.5 rounded hover:bg-secondary">B</button>
                <button className="text-xs italic text-muted-foreground hover:text-foreground px-1 py-0.5 rounded hover:bg-secondary">I</button>
                <button className="text-xs underline text-muted-foreground hover:text-foreground px-1 py-0.5 rounded hover:bg-secondary">U</button>
                <div className="w-px h-4 bg-border mx-1" />
                <button className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded hover:bg-secondary">1.</button>
                <button className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded hover:bg-secondary">•</button>
              </div>
              <Textarea
                value={pageData.description}
                onChange={(e) => updatePage({ description: e.target.value })}
                placeholder="Enter page description"
                className="border-0 rounded-none focus-visible:ring-0 text-sm min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            <button className="flex items-center gap-1.5 text-sm text-primary mb-6 hover:underline">
              <Plus className="h-3.5 w-3.5" />
              Add social media share icons
            </button>

            <div className="border-t border-border pt-5">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Contact Us:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1.5 text-xs text-muted-foreground flex-shrink-0">
                  🇮🇳 +91 (IN)
                </div>
                <Input placeholder="Your support phone" className="text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Payment Details */}
        {!rightPanel && (
          <div className="w-80 lg:w-96 overflow-y-auto bg-background border-l border-border flex-shrink-0">
            <div className="p-4 sm:p-6">
              <h3 className="text-xl font-bold text-foreground mb-1">Payment Details</h3>
              <div className="w-8 h-0.5 bg-primary mb-6" />

              {/* Field list */}
              <div className="space-y-2 mb-4">
                {pageData.formFields.map((field, index) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    index={index}
                    expanded={expandedFieldId === field.id}
                    onToggleExpand={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
                    onUpdate={(patch) => updateField(field.id, patch)}
                    onRemove={() => removeField(field.id)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>

              {/* Add field buttons */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {/* Add Input Field */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 flex-1">
                      <Plus className="h-3.5 w-3.5" /> Add input field
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    {INPUT_TYPES.map(({ type, label, icon: Icon }) => (
                      <DropdownMenuItem key={type} onClick={() => addInputField(type)} className="gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Add Amount Field */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 flex-1">
                      <Plus className="h-3.5 w-3.5" /> Add amount field
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-60">
                    {AMOUNT_TYPES.map(({ type, label, desc, icon: Icon }) => (
                      <DropdownMenuItem key={type} onClick={() => addAmountField(type)} className="flex-col items-start gap-0.5 py-2">
                        <div className="flex items-center gap-2 w-full">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-xs">{label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground pl-5">{desc}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Payment methods */}
              <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                {["UPI", "Visa", "MC", "RuPay", "PhonePe"].map((logo) => (
                  <span key={logo} className="text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 font-medium">{logo}</span>
                ))}
              </div>

              {/* Pay button preview */}
              <Button className="w-full">
                Pay ₹{totalAmount ? totalAmount.toLocaleString("en-IN") : "—"}
              </Button>
            </div>
          </div>
        )}

        {/* Right panel: Settings */}
        {rightPanel === "settings" && (
          <div className="w-80 lg:w-96 border-l border-border flex flex-col bg-background overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Page Settings</span>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Tabs value={settingsTab} onValueChange={setSettingsTab} className="flex-1">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
                <TabsTrigger value="page" className="text-xs">Page</TabsTrigger>
                <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="page" className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Page Title</label>
                  <Input value={pageData.title} onChange={(e) => updatePage({ title: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Subtitle / Category</label>
                  <Input value={pageData.subtitle} onChange={(e) => updatePage({ subtitle: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <Textarea value={pageData.description} onChange={(e) => updatePage({ description: e.target.value })} rows={3} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Banner Image URL</label>
                  <Input value={pageData.bannerImage} onChange={(e) => updatePage({ bannerImage: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Logo Initial</label>
                  <Input value={pageData.logoInitial} onChange={(e) => updatePage({ logoInitial: e.target.value })} className="mt-1.5 w-20" maxLength={2} />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Success Message</label>
                  <Textarea value={pageData.successMessage} onChange={(e) => updatePage({ successMessage: e.target.value })} rows={2} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Redirect URL (after payment)</label>
                  <Input value={pageData.redirectUrl} onChange={(e) => updatePage({ redirectUrl: e.target.value })} placeholder="https://example.com/thank-you" className="mt-1.5" />
                </div>
              </TabsContent>

              <TabsContent value="payment" className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Button Text</label>
                  <Input value={pageData.buttonText} onChange={(e) => updatePage({ buttonText: e.target.value })} className="mt-1.5" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">Collect GST</p>
                    <p className="text-[10px] text-muted-foreground">Add 18% GST to the total</p>
                  </div>
                  <Switch checked={pageData.gstEnabled} onCheckedChange={(v) => updatePage({ gstEnabled: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">Collect Address</p>
                  </div>
                  <Switch checked={pageData.collectAddress} onCheckedChange={(v) => updatePage({ collectAddress: v })} />
                </div>
              </TabsContent>

              <TabsContent value="sections" className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">Toggle sections on/off to customize your page layout.</p>
                {pageData.sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground capitalize">{section.type}</span>
                    </div>
                    <Switch checked={section.visible} onCheckedChange={() => toggleSectionVisibility(section.id)} />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="seo" className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Page Slug</label>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">rzp.io/rzp/</span>
                    <Input value={pageData.slug} onChange={(e) => updatePage({ slug: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Meta Title</label>
                  <Input value={pageData.title} onChange={(e) => updatePage({ title: e.target.value })} className="mt-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{pageData.title.length}/60 characters</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Meta Description</label>
                  <Textarea value={pageData.description} onChange={(e) => updatePage({ description: e.target.value })} rows={2} className="mt-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{pageData.description.length}/160 characters</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Right panel: Receipts */}
        {rightPanel === "receipts" && (
          <div className="w-80 lg:w-96 border-l border-border flex flex-col bg-background overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-foreground" />
                <span className="text-sm font-semibold text-foreground">Payment Receipts</span>
              </div>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable payment receipts</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Send a receipt to customers after payment</p>
                </div>
                <Switch checked={pageData.sendReceipt} onCheckedChange={(v) => updatePage({ sendReceipt: v })} />
              </div>

              {pageData.sendReceipt && (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Receipt Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updatePage({ gstEnabled: false })}
                        className={`p-3 rounded-md border text-left transition-colors ${!pageData.gstEnabled ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                      >
                        <p className={`text-xs font-medium ${!pageData.gstEnabled ? "text-primary" : "text-foreground"}`}>Standard</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Basic payment receipt</p>
                      </button>
                      <button
                        onClick={() => updatePage({ gstEnabled: true })}
                        className={`p-3 rounded-md border text-left transition-colors ${pageData.gstEnabled ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                      >
                        <p className={`text-xs font-medium ${pageData.gstEnabled ? "text-primary" : "text-foreground"}`}>GST Receipt</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">GST-compliant invoice</p>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Delivery</p>
                    <Select value={receiptDeliveryMode} onValueChange={(v) => setReceiptDeliveryMode(v as "auto" | "manual")}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic (sent on payment)</SelectItem>
                        <SelectItem value="manual">Manual (send from transactions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Send via</p>
                    <Select value={receiptChannel} onValueChange={(v) => setReceiptChannel(v as "email" | "whatsapp" | "both")}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email only</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp only</SelectItem>
                        <SelectItem value="both">Email + WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Receipt Numbering</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground mb-1">Prefix</p>
                        <Input
                          value={receiptPrefix}
                          onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
                          className="h-8 text-xs font-mono"
                          maxLength={6}
                          placeholder="RCP"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground mb-1">Start from</p>
                        <Input
                          value={receiptStartNumber}
                          onChange={(e) => setReceiptStartNumber(e.target.value)}
                          className="h-8 text-xs font-mono"
                          placeholder="001"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Preview: <span className="font-mono text-foreground">{receiptPrefix}-{receiptStartNumber}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Publish Payment Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">{pageData.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Fields</span><p className="font-medium text-foreground">{pageData.formFields.length} fields</p></div>
                <div><span className="text-muted-foreground text-xs">Sections</span><p className="font-medium text-foreground">{pageData.sections.filter((s) => s.visible).length} active</p></div>
                <div><span className="text-muted-foreground text-xs">GST</span><p className="font-medium text-foreground">{pageData.gstEnabled ? "Enabled" : "Disabled"}</p></div>
                <div><span className="text-muted-foreground text-xs">Total</span><p className="font-medium text-foreground">₹{totalAmount.toLocaleString("en-IN")}</p></div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Page URL</label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input value={pageData.pageUrl} readOnly className="flex-1 text-xs" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Payment integration active
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> SSL-secured checkout
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {pageData.gstEnabled ? "GST-compliant receipts" : "Receipts enabled"}
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handlePublish} disabled={publishing}>
              {publishing ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : <>Publish Now</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Share Payment Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate mr-2">{pageData.pageUrl}</span>
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["WhatsApp", "Email", "SMS", "Twitter"].map((channel) => (
                <Button key={channel} variant="outline" className="gap-1.5" onClick={() => toast.success(`Shared via ${channel}`)}>
                  {channel}
                </Button>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Embed Code</label>
              <div className="mt-1.5 p-3 bg-secondary rounded-md">
                <code className="text-xs text-muted-foreground break-all">
                  {`<script src="https://checkout.razorpay.com/v1/payment-button.js" data-payment_button_id="pl_${pageData.slug}" async></script>`}
                </code>
              </div>
              <Button variant="ghost" size="sm" className="mt-1 gap-1.5 text-xs" onClick={() => { navigator.clipboard.writeText(`<script src="..."></script>`); toast.success("Embed code copied"); }}>
                <Copy className="h-3 w-3" /> Copy embed code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Publish Dialog */}
      <Dialog open={postPublishDialogOpen} onOpenChange={setPostPublishDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-[hsl(152,69%,91%)] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[hsl(152,69%,30%)]" />
              </div>
              <div>
                <DialogTitle className="text-xl">Payment Page Published Successfully!</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Your page is now live and ready to accept payments</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="blade-stat">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold text-foreground mt-0.5">₹{totalAmount.toLocaleString("en-IN")}</p>
              </div>
              <div className="blade-stat">
                <p className="text-xs text-muted-foreground">Form Fields</p>
                <p className="text-lg font-semibold text-foreground mt-0.5">{pageData.formFields.length} fields</p>
              </div>
              <div className="blade-stat">
                <p className="text-xs text-muted-foreground">Active Sections</p>
                <p className="text-lg font-semibold text-foreground mt-0.5">{pageData.sections.filter((s) => s.visible).length}</p>
              </div>
            </div>

            <div className="blade-card p-4">
              <label className="text-xs font-semibold text-foreground mb-2 block">Your Payment Page URL</label>
              <div className="flex items-center gap-2">
                <Input value={`http://localhost:8080/payment/${pageData.slug}`} readOnly className="flex-1 text-sm font-mono" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/payment/${pageData.slug}`, "_blank")}><ExternalLink className="h-4 w-4 mr-1" /> Open</Button>
              </div>
            </div>

            <div className="flex items-center gap-3 blade-card p-3">
              <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-1">Share via QR Code</h4>
                <p className="text-xs text-muted-foreground">Scan to access on mobile</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Download</Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Next Steps
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Share2, label: "Share Link", action: () => setShareDialogOpen(true) },
                  { icon: Code, label: "Embed on Website", action: () => { setPostPublishDialogOpen(false); setShareDialogOpen(true); } },
                  { icon: BarChart3, label: "View Analytics", action: () => navigate("/payment-pages") },
                  { icon: Sparkles, label: "Create New Page", action: () => navigate("/payment-pages/create") },
                ].map((step, i) => (
                  <button key={i} onClick={step.action} className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-secondary/30 transition-colors text-left group">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <step.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs text-foreground flex-1">{step.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPostPublishDialogOpen(false)}>Done</Button>
              <Button className="flex-1" onClick={() => { setPostPublishDialogOpen(false); navigate("/payment-pages"); }}>View All Pages</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── FieldCard ────────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: FormField;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const FieldCard = ({
  field, index, expanded, onToggleExpand, onUpdate, onRemove,
  onDragStart, onDragOver, onDragEnd,
}: FieldCardProps) => {
  const isAmount = field.fieldKind === "amount";
  const amountField = isAmount ? (field as AmountField) : null;

  const fieldIcon = isAmount
    ? (field as AmountField).type === "amount-item" ? Package : DollarSign
    : INPUT_TYPES.find(x => x.type === (field as InputField).type)?.icon ?? Type;

  const FieldIcon = fieldIcon;

  const typeLabel = isAmount
    ? amountTypeLabel((field as AmountField).type)
    : inputTypeLabel((field as InputField).type);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="border border-border rounded-lg bg-background overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing" />
        <FieldIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate block">{field.label}</span>
          <span className="text-[10px] text-muted-foreground">{typeLabel}{field.required ? " · Required" : " · Optional"}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleExpand}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button onClick={onRemove} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded editing */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border space-y-3">
          {/* Label */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Label</label>
            <Input
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value } as Partial<FormField>)}
              className="h-8 text-xs"
            />
          </div>

          {/* Amount fields */}
          {isAmount && amountField && (
            <>
              {amountField.type === "amount-fixed" && (
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Amount (₹)</label>
                  <Input
                    type="number"
                    value={amountField.amount || ""}
                    onChange={(e) => onUpdate({ amount: Number(e.target.value) } as Partial<FormField>)}
                    className="h-8 text-xs"
                    placeholder="0"
                  />
                </div>
              )}

              {amountField.type === "amount-item" && (
                <>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Price per item (₹)</label>
                    <Input
                      type="number"
                      value={amountField.amount || ""}
                      onChange={(e) => onUpdate({ amount: Number(e.target.value) } as Partial<FormField>)}
                      className="h-8 text-xs"
                      placeholder="0"
                    />
                  </div>
                  {amountField.showDescription && (
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Description</label>
                      <Input
                        value={amountField.description || ""}
                        onChange={(e) => onUpdate({ description: e.target.value } as Partial<FormField>)}
                        className="h-8 text-xs"
                        placeholder="Item description"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Amount field additional options */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Options</p>

                {/* Add Image */}
                <button
                  onClick={() => onUpdate({ image: amountField.image ? undefined : "" } as Partial<FormField>)}
                  className="flex items-center gap-2 w-full text-left text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary/40 transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 text-foreground">Add Image</span>
                  {amountField.image !== undefined && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
                {amountField.image !== undefined && (
                  <Input
                    value={amountField.image || ""}
                    onChange={(e) => onUpdate({ image: e.target.value } as Partial<FormField>)}
                    className="h-8 text-xs"
                    placeholder="Image URL"
                  />
                )}

                {/* Remove/Add Description (item only) */}
                {amountField.type === "amount-item" && (
                  <button
                    onClick={() => onUpdate({ showDescription: !amountField.showDescription } as Partial<FormField>)}
                    className="flex items-center gap-2 w-full text-left text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary/40 transition-colors"
                  >
                    <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 text-foreground">
                      {amountField.showDescription ? "Remove Description" : "Add Description"}
                    </span>
                    {amountField.showDescription && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                )}

                {/* Optional Item */}
                <button
                  onClick={() => onUpdate({ optional: !amountField.optional } as Partial<FormField>)}
                  className="flex items-center gap-2 w-full text-left text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary/40 transition-colors"
                >
                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 text-foreground">Optional Item</span>
                  {amountField.optional && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>

                {/* Advanced Options (item) */}
                {amountField.type === "amount-item" && (
                  <details className="text-xs">
                    <summary className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary/40 transition-colors cursor-pointer list-none">
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 text-foreground">Advanced Options</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </summary>
                    <div className="pt-2 space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground mb-1 block">Min Qty</label>
                          <Input
                            type="number"
                            value={amountField.minQty ?? 1}
                            onChange={(e) => onUpdate({ minQty: Number(e.target.value) } as Partial<FormField>)}
                            className="h-8 text-xs"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground mb-1 block">Max Qty</label>
                          <Input
                            type="number"
                            value={amountField.maxQty ?? 99}
                            onChange={(e) => onUpdate({ maxQty: Number(e.target.value) } as Partial<FormField>)}
                            className="h-8 text-xs"
                            min={1}
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </>
          )}

          {/* Input field options */}
          {!isAmount && (
            <>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Placeholder</label>
                <Input
                  value={field.placeholder}
                  onChange={(e) => onUpdate({ placeholder: e.target.value } as Partial<FormField>)}
                  className="h-8 text-xs"
                  placeholder="Placeholder text"
                />
              </div>
              {(field as InputField).type === "dropdown" && (
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Options (one per line)</label>
                  <Textarea
                    value={((field as InputField).options || []).join("\n")}
                    onChange={(e) => onUpdate({ options: e.target.value.split("\n") } as Partial<FormField>)}
                    className="text-xs min-h-[60px] resize-none"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="text-xs text-foreground">Required</label>
                <Switch
                  checked={field.required}
                  onCheckedChange={(v) => onUpdate({ required: v } as Partial<FormField>)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Page Preview Content ─────────────────────────────────────────────────────

interface PagePreviewProps {
  pageData: PageData;
  viewMode: "desktop" | "mobile";
  editable?: boolean;
  onUpdatePage?: (updates: Partial<PageData>) => void;
  editingSection?: string | null;
  onEditSection?: (id: string | null) => void;
}

const PagePreviewContent = ({ pageData, viewMode, editable, onUpdatePage, editingSection, onEditSection }: PagePreviewProps) => {
  const bannerSection = pageData.sections.find((s) => s.type === "banner");
  const featuresSection = pageData.sections.find((s) => s.type === "features");
  const testimonialsSection = pageData.sections.find((s) => s.type === "testimonials");
  const faqSection = pageData.sections.find((s) => s.type === "faq");

  const fixedAmounts = pageData.formFields.filter(
    (f): f is AmountField => f.fieldKind === "amount" && f.type === "amount-fixed"
  );
  const totalAmount = fixedAmounts.reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <>
      {bannerSection?.visible && (
        <div className="relative group">
          <img src={pageData.bannerImage} alt="Banner" className="w-full h-52 object-cover" />
          {editable && (
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-md">Click to change banner</span>
            </div>
          )}
        </div>
      )}

      <div className={`flex ${viewMode === "mobile" ? "flex-col" : "flex-col lg:flex-row"}`}>
        {/* Left: page content */}
        <div className="flex-1 p-6 border-r border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {pageData.logoInitial}
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{pageData.subtitle} —</span>
          </div>

          {editable ? (
            <h2
              className="text-2xl font-bold text-foreground mb-3 hover:bg-secondary/50 rounded px-1 -mx-1 cursor-text"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdatePage?.({ title: e.currentTarget.textContent || "" })}
            >
              {pageData.title}
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-foreground mb-3">{pageData.title}</h2>
          )}

          {editable ? (
            <p
              className="text-sm text-muted-foreground leading-relaxed mb-6 hover:bg-secondary/50 rounded px-1 -mx-1 cursor-text"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdatePage?.({ description: e.currentTarget.textContent || "" })}
            >
              {pageData.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{pageData.description}</p>
          )}

          {featuresSection?.visible && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-1">{featuresSection.content.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{featuresSection.content.subtitle}</p>
              <div className="space-y-3">
                {featuresSection.content.items.map((item: string) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testimonialsSection?.visible && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">What people say</h3>
              <div className="space-y-3">
                {testimonialsSection.content.items.map((t: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
                    </div>
                    <p className="text-sm text-foreground mb-2">"{t.text}"</p>
                    <p className="text-xs font-semibold text-muted-foreground">— {t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {faqSection?.visible && (
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">FAQs</h3>
              <div className="space-y-3">
                {faqSection.content.items.map((faq: any, i: number) => (
                  <details key={i} className="border border-border rounded-lg">
                    <summary className="flex items-center justify-between p-4 cursor-pointer">
                      <span className="text-sm font-medium text-foreground">{faq.q}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </summary>
                    <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: payment form */}
        <div className="w-full lg:w-72 p-6">
          <div className="space-y-4">
            {pageData.formFields.map((field) => (
              <div key={field.id}>
                {field.fieldKind === "amount" ? (
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      {field.label}
                      {(field as AmountField).type === "amount-custom" && <span className="text-muted-foreground ml-1">(you decide)</span>}
                    </label>
                    {(field as AmountField).type === "amount-fixed" && (
                      <div className="flex items-center border border-border rounded-md px-3 py-2">
                        <span className="text-sm font-semibold text-foreground">₹ {(field as AmountField).amount.toLocaleString("en-IN")}</span>
                        <span className="ml-auto text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5">Fixed</span>
                      </div>
                    )}
                    {(field as AmountField).type === "amount-custom" && (
                      <div className="flex items-center border border-border rounded-md px-3 py-2 gap-2">
                        <span className="text-sm text-muted-foreground">₹</span>
                        <input className="flex-1 text-sm bg-transparent focus:outline-none" placeholder="Enter amount" />
                      </div>
                    )}
                    {(field as AmountField).type === "amount-item" && (
                      <div className="border border-border rounded-md p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          {(field as AmountField).image && (
                            <img src={(field as AmountField).image} alt="" className="w-10 h-10 rounded object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{field.label}</p>
                            {(field as AmountField).showDescription && (field as AmountField).description && (
                              <p className="text-xs text-muted-foreground">{(field as AmountField).description}</p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-foreground">₹{(field as AmountField).amount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-secondary">−</button>
                          <span className="text-sm w-6 text-center">1</span>
                          <button className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-secondary">+</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                    </label>
                    {(field as InputField).type === "textarea" ? (
                      <textarea rows={3} className="w-full text-sm border border-border rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder={field.placeholder} />
                    ) : (field as InputField).type === "dropdown" ? (
                      <select className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="">{field.placeholder || "Select..."}</option>
                        {((field as InputField).options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (field as InputField).type === "date" ? (
                      <input type="date" className="w-full text-sm border border-border rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
                    ) : (
                      <input
                        type={(field as InputField).type === "email" ? "email" : (field as InputField).type === "phone" || (field as InputField).type === "number" || (field as InputField).type === "pincode" ? "tel" : "text"}
                        className="w-full text-sm border border-border rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {["UPI", "Visa", "MC", "RuPay"].map((l) => (
                <span key={l} className="text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">{l}</span>
              ))}
            </div>

            <Button className="w-full">
              {pageData.buttonText} {totalAmount > 0 ? `₹${totalAmount.toLocaleString("en-IN")}` : ""}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPageEditor;
