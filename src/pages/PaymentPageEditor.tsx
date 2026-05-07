import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings,
  X, Copy, ExternalLink, Plus,
  Trash2, GripVertical, ChevronDown, ChevronUp,
  Save, Loader2, CheckCircle2, Link2, QrCode, Download, BarChart3,
  Receipt, Image as ImageIcon, MoreVertical, Package, DollarSign,
  AlignLeft, Hash, Mail, Phone, Type, Link, CalendarDays, List,
  Share2, Code, Sparkles, Shield, Star, Check, CreditCard,
  Pencil,
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputFieldType =
  | "text" | "alpha" | "alphanum" | "number" | "email" | "phone"
  | "url" | "textarea" | "pan" | "pincode" | "dropdown" | "date";

type AmountFieldType = "amount-fixed" | "amount-custom" | "amount-item";

interface BaseField {
  id: string;
  label: string;
  required: boolean;
  placeholder: string;
}

interface InputField extends BaseField {
  fieldKind: "input";
  type: InputFieldType;
  options?: string[];
}

interface AmountField extends BaseField {
  fieldKind: "amount";
  type: AmountFieldType;
  amount: number;
  description?: string;
  image?: string;
  optional?: boolean;
  showDescription?: boolean;
  minQty?: number;
  maxQty?: number;
}

type FormField = InputField | AmountField;

type SectionType = "hero" | "stats" | "highlights" | "about" | "testimonials" | "faq";

interface ContentSection {
  id: string;
  type: SectionType;
  visible: boolean;
  data: Record<string, any>;
}

interface PageData {
  merchantName: string;
  logoInitial: string;
  brandColor: string;
  category: "education" | "services" | "ecommerce" | "events";
  buttonText: string;
  successMessage: string;
  redirectUrl: string;
  sendReceipt: boolean;
  gstEnabled: boolean;
  sections: ContentSection[];
  formFields: FormField[];
  status: "draft" | "published";
  slug: string;
  pageUrl: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

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

const defaultSections: ContentSection[] = [
  {
    id: "s_hero",
    type: "hero",
    visible: true,
    data: {
      title: "Full-Stack Development Bootcamp",
      tagline: "From beginner to job-ready in 12 weeks",
      description: "A comprehensive bootcamp designed for aspiring developers. Learn React, Node.js, databases, and deployment from industry veterans.",
    },
  },
  {
    id: "s_stats",
    type: "stats",
    visible: true,
    data: {
      items: [
        { value: "1,200+", label: "Students enrolled" },
        { value: "4.9★", label: "Average rating" },
        { value: "12 wks", label: "Duration" },
        { value: "94%", label: "Placement rate" },
      ],
    },
  },
  {
    id: "s_highlights",
    type: "highlights",
    visible: true,
    data: {
      title: "What's included",
      items: [
        "Lifetime access to all course materials",
        "Certificate on completion",
        "1:1 mentorship sessions",
        "Community access & peer learning",
        "Hands-on projects & portfolio",
        "Job placement support",
      ],
    },
  },
  {
    id: "s_about",
    type: "about",
    visible: true,
    data: {
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      name: "Rahul Sharma",
      role: "Lead Instructor",
      bio: "Senior engineer with 12 years of experience at Flipkart and Razorpay. Has trained 3,000+ developers.",
    },
  },
  {
    id: "s_testimonials",
    type: "testimonials",
    visible: true,
    data: {
      items: [
        { name: "Priya S.", rating: 5, text: "This bootcamp completely changed my career. Got a job within 3 weeks of completing it!" },
        { name: "Arjun M.", rating: 5, text: "Best investment I've made. The mentorship and community are incredible." },
        { name: "Neha K.", rating: 5, text: "Very structured curriculum. The hands-on projects made all the difference." },
        { name: "Vikram P.", rating: 4, text: "Excellent content and instructor support. Highly recommended." },
      ],
    },
  },
  {
    id: "s_faq",
    type: "faq",
    visible: false,
    data: {
      items: [
        { q: "Do I need prior experience?", a: "No prior experience needed. We start from the very basics." },
        { q: "Can I get a refund?", a: "Full refund within 7 days of joining. No questions asked." },
        { q: "Is the certificate recognized?", a: "Yes, our certificate is recognized by 200+ partner companies." },
      ],
    },
  },
];

const SECTION_META: Record<SectionType, { label: string }> = {
  hero:         { label: "Hero / Title" },
  stats:        { label: "Stats Bar" },
  highlights:   { label: "What's Included" },
  about:        { label: "Instructor / About" },
  testimonials: { label: "Testimonials" },
  faq:          { label: "FAQs" },
};

// ─── Input / Amount type maps ─────────────────────────────────────────────────

const INPUT_TYPES: { type: InputFieldType; label: string; icon: React.ElementType }[] = [
  { type: "text",      label: "Single Line Text",  icon: Type },
  { type: "alpha",     label: "Alphabets",          icon: Type },
  { type: "alphanum",  label: "Alphanumeric",        icon: Hash },
  { type: "number",    label: "Number",              icon: Hash },
  { type: "email",     label: "Email",               icon: Mail },
  { type: "phone",     label: "Phone No.",           icon: Phone },
  { type: "url",       label: "Link / URL",          icon: Link },
  { type: "textarea",  label: "Large Textarea",      icon: AlignLeft },
  { type: "pan",       label: "PAN Number",          icon: Hash },
  { type: "pincode",   label: "Pincode",             icon: Hash },
  { type: "dropdown",  label: "Dropdown",            icon: List },
  { type: "date",      label: "Date Picker",         icon: CalendarDays },
];

const AMOUNT_TYPES: { type: AmountFieldType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: "amount-fixed",  label: "Fixed Amount",              desc: "Customers pay a set amount", icon: DollarSign },
  { type: "amount-custom", label: "Customers Decide Amount",   desc: "Customers enter any amount", icon: DollarSign },
  { type: "amount-item",   label: "Item with Quantity",        desc: "Product with quantity selector", icon: Package },
];

const inputTypeLabel  = (t: InputFieldType)  => INPUT_TYPES.find(x => x.type === t)?.label  ?? t;
const amountTypeLabel = (t: AmountFieldType) => AMOUNT_TYPES.find(x => x.type === t)?.label ?? t;

const categoryLabel = (cat: PageData["category"]) => {
  const map = { education: "Online Course", services: "Professional Service", ecommerce: "Product", events: "Event" };
  return map[cat] ?? "Payment";
};

// ─── Main component ───────────────────────────────────────────────────────────

const PaymentPageEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [viewMode,             setViewMode]             = useState<"desktop" | "mobile">("desktop");
  const [rightPanel,           setRightPanel]           = useState<"settings" | "receipts" | null>(null);
  const [previewMode,          setPreviewMode]          = useState(false);
  const [publishDialogOpen,    setPublishDialogOpen]    = useState(false);
  const [postPublishDialogOpen,setPostPublishDialogOpen]= useState(false);
  const [shareDialogOpen,      setShareDialogOpen]      = useState(false);
  const [publishing,           setPublishing]           = useState(false);
  const [settingsTab,          setSettingsTab]          = useState("page");
  const [unsavedChanges,       setUnsavedChanges]       = useState(false);
  const [expandedFieldId,      setExpandedFieldId]      = useState<string | null>(null);

  // Receipt settings
  const [receiptDeliveryMode, setReceiptDeliveryMode] = useState<"auto" | "manual">("auto");
  const [receiptChannel,      setReceiptChannel]       = useState<"email" | "whatsapp" | "both">("email");
  const [receiptPrefix,       setReceiptPrefix]        = useState("RCP");
  const [receiptStartNumber,  setReceiptStartNumber]   = useState("001");

  // DnD
  const dragIndexRef = useRef<number | null>(null);

  const [pageData, setPageData] = useState<PageData>({
    merchantName: searchParams.get("title") || searchParams.get("template") || "WealthJoy Technologies",
    logoInitial: "W",
    brandColor: "#0066FF",
    category: "education",
    buttonText: "Enroll Now",
    successMessage: "Thank you! You'll receive a confirmation email shortly.",
    redirectUrl: "",
    sendReceipt: true,
    gstEnabled: true,
    sections: defaultSections,
    formFields: defaultFormFields,
    status: "draft",
    slug: "fullstack-bootcamp",
    pageUrl: "https://rzp.io/rzp/fullstack-bootcamp",
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const updatePage = (updates: Partial<PageData>) => {
    setPageData((prev) => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const updateSection = (id: string, patch: Partial<ContentSection>) => {
    updatePage({
      sections: pageData.sections.map((s) => s.id === id ? { ...s, ...patch } : s),
    });
  };

  const updateSectionData = (id: string, dataPatch: Record<string, any>) => {
    updatePage({
      sections: pageData.sections.map((s) =>
        s.id === id ? { ...s, data: { ...s.data, ...dataPatch } } : s
      ),
    });
  };

  const removeSection = (id: string) => {
    updatePage({ sections: pageData.sections.map((s) => s.id === id ? { ...s, visible: false } : s) });
  };

  const hiddenSections = pageData.sections.filter((s) => !s.visible);

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

  // ─── DnD ──────────────────────────────────────────────────────────────────

  const handleDragStart = (index: number) => { dragIndexRef.current = index; };

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

  const handleDragEnd = () => { dragIndexRef.current = null; };

  // ─── Publish / misc ───────────────────────────────────────────────────────

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

  const handleSave = () => { setUnsavedChanges(false); toast.success("Saved as draft"); };

  const copyLink = () => { navigator.clipboard.writeText(pageData.pageUrl); toast.success("Link copied!"); };

  const totalAmount = pageData.formFields
    .filter((f): f is AmountField => f.fieldKind === "amount" && f.type === "amount-fixed")
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  // ─── Preview mode ─────────────────────────────────────────────────────────

  if (previewMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Exit Preview
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">Previewing as customers see it</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Monitor className="h-4 w-4" /></button>
              <button onClick={() => setViewMode("mobile")}  className={`p-2 ${viewMode === "mobile"  ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Smartphone className="h-4 w-4" /></button>
            </div>
            <Button size="sm" onClick={() => { setPreviewMode(false); setPublishDialogOpen(true); }}>Publish</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6">
          <div className={`mx-auto bg-white rounded-xl shadow-lg border border-border overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-5xl"}`}>
            <EditorCanvas pageData={pageData} editable={false} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Editor ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-background">

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3 sm:px-4 py-2.5 bg-background z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-1.5 flex-shrink-0">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-foreground text-sm truncate max-w-[120px] sm:max-w-xs">{pageData.merchantName}</span>
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
            <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Monitor className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("mobile")}  className={`p-2 ${viewMode === "mobile"  ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Smartphone className="h-4 w-4" /></button>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button variant="outline" size="sm" className={`gap-1.5 ${rightPanel === "receipts" ? "bg-secondary" : ""}`} onClick={() => setRightPanel(rightPanel === "receipts" ? null : "receipts")}>
            <Receipt className="h-4 w-4" /> <span className="hidden sm:inline">Receipts</span>
          </Button>
          <Button variant="outline" size="sm" className={`gap-1.5 ${rightPanel === "settings" ? "bg-secondary" : ""}`} onClick={() => setRightPanel(rightPanel === "settings" ? null : "settings")}>
            <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className={`mx-auto transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-6xl"}`}>
            <EditorCanvas
              pageData={pageData}
              editable
              onUpdateSectionData={updateSectionData}
              onRemoveSection={removeSection}
              hiddenSections={hiddenSections}
              onRestoreSection={(id) => updateSection(id, { visible: true })}
              formFields={pageData.formFields}
              expandedFieldId={expandedFieldId}
              onToggleFieldExpand={(id) => setExpandedFieldId(expandedFieldId === id ? null : id)}
              onUpdateField={updateField}
              onRemoveField={removeField}
              onAddInputField={addInputField}
              onAddAmountField={addAmountField}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              totalAmount={totalAmount}
              onUpdatePage={updatePage}
            />
          </div>
        </div>

        {/* Right panel: Settings */}
        {rightPanel === "settings" && (
          <div className="w-80 border-l border-border flex flex-col bg-background overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Page Settings</span>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <Tabs value={settingsTab} onValueChange={setSettingsTab} className="flex-1">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
                <TabsTrigger value="page" className="text-xs">Page</TabsTrigger>
                <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="page" className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Merchant / Business Name</label>
                  <Input value={pageData.merchantName} onChange={(e) => updatePage({ merchantName: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Logo Initial</label>
                  <Input value={pageData.logoInitial} onChange={(e) => updatePage({ logoInitial: e.target.value })} className="mt-1.5 w-20" maxLength={2} />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Category</label>
                  <Select value={pageData.category} onValueChange={(v) => updatePage({ category: v as PageData["category"] })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education / Course</SelectItem>
                      <SelectItem value="services">Professional Service</SelectItem>
                      <SelectItem value="ecommerce">E-commerce / Product</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <p className="text-xs font-medium text-foreground">Collect Address</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Page Slug</label>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">rzp.io/rzp/</span>
                    <Input value={pageData.slug} onChange={(e) => updatePage({ slug: e.target.value })} className="flex-1" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Right panel: Receipts */}
        {rightPanel === "receipts" && (
          <div className="w-80 border-l border-border flex flex-col bg-background overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="text-sm font-semibold text-foreground">Payment Receipts</span>
              </div>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable receipts</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Send receipt after payment</p>
                </div>
                <Switch checked={pageData.sendReceipt} onCheckedChange={(v) => updatePage({ sendReceipt: v })} />
              </div>
              {pageData.sendReceipt && (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Receipt Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ label: "Standard", gst: false, sub: "Basic receipt" }, { label: "GST Receipt", gst: true, sub: "GST-compliant invoice" }].map(({ label, gst, sub }) => (
                        <button key={label} onClick={() => updatePage({ gstEnabled: gst })}
                          className={`p-3 rounded-md border text-left transition-colors ${pageData.gstEnabled === gst ? "border-primary bg-primary/5" : "border-border"}`}>
                          <p className={`text-xs font-medium ${pageData.gstEnabled === gst ? "text-primary" : "text-foreground"}`}>{label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Delivery</p>
                    <Select value={receiptDeliveryMode} onValueChange={(v) => setReceiptDeliveryMode(v as "auto" | "manual")}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic (on payment)</SelectItem>
                        <SelectItem value="manual">Manual (from transactions)</SelectItem>
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
                        <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())} className="h-8 text-xs font-mono" maxLength={6} placeholder="RCP" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground mb-1">Start from</p>
                        <Input value={receiptStartNumber} onChange={(e) => setReceiptStartNumber(e.target.value)} className="h-8 text-xs font-mono" placeholder="001" />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Preview: <span className="font-mono text-foreground">{receiptPrefix}-{receiptStartNumber}</span></p>
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
              <h3 className="font-semibold text-sm mb-2">{pageData.merchantName}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Fields</span><p className="font-medium">{pageData.formFields.length} fields</p></div>
                <div><span className="text-muted-foreground text-xs">Total</span><p className="font-medium">₹{totalAmount.toLocaleString("en-IN")}</p></div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Page URL</label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input value={pageData.pageUrl} readOnly className="flex-1 text-xs" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {["Payment integration active", "SSL-secured checkout", pageData.gstEnabled ? "GST-compliant receipts" : "Receipts enabled"].map((t) => (
                <div key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t}</div>
              ))}
            </div>
            <Button className="w-full gap-2" onClick={handlePublish} disabled={publishing}>
              {publishing ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : "Publish Now"}
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
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={copyLink}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["WhatsApp", "Email", "SMS", "Twitter"].map((c) => (
                <Button key={c} variant="outline" onClick={() => toast.success(`Shared via ${c}`)}>{c}</Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Publish Dialog */}
      <Dialog open={postPublishDialogOpen} onOpenChange={setPostPublishDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-[hsl(152,69%,91%)] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[hsl(152,69%,30%)]" />
              </div>
              <div>
                <DialogTitle className="text-xl">Payment Page Published!</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Your page is live and ready to accept payments</p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="blade-card p-4">
              <label className="text-xs font-semibold mb-2 block">Your Payment Page URL</label>
              <div className="flex items-center gap-2">
                <Input value={`https://rzp.io/rzp/${pageData.slug}`} readOnly className="flex-1 text-sm font-mono" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/payment/${pageData.slug}`, "_blank")}><ExternalLink className="h-4 w-4 mr-1" /> Open</Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPostPublishDialogOpen(false)}>Done</Button>
              <Button className="flex-1" onClick={() => { setPostPublishDialogOpen(false); navigate("/payment-pages"); }}>View All Pages</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── EditorCanvas ─────────────────────────────────────────────────────────────
// The two-column layout that serves as both editable canvas and preview.

interface EditorCanvasProps {
  pageData: PageData;
  editable?: boolean;
  onUpdateSectionData?: (id: string, data: Record<string, any>) => void;
  onRemoveSection?: (id: string) => void;
  hiddenSections?: ContentSection[];
  onRestoreSection?: (id: string) => void;
  formFields?: FormField[];
  expandedFieldId?: string | null;
  onToggleFieldExpand?: (id: string) => void;
  onUpdateField?: (id: string, patch: Partial<FormField>) => void;
  onRemoveField?: (id: string) => void;
  onAddInputField?: (type: InputFieldType) => void;
  onAddAmountField?: (type: AmountFieldType) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  totalAmount?: number;
  onUpdatePage?: (updates: Partial<PageData>) => void;
}

const EditorCanvas = ({
  pageData, editable = false,
  onUpdateSectionData, onRemoveSection, hiddenSections = [], onRestoreSection,
  formFields, expandedFieldId, onToggleFieldExpand,
  onUpdateField, onRemoveField, onAddInputField, onAddAmountField,
  onDragStart, onDragOver, onDragEnd, totalAmount = 0, onUpdatePage,
}: EditorCanvasProps) => {

  const visibleSections = pageData.sections.filter((s) => s.visible);
  const heroSection = visibleSections.find((s) => s.type === "hero");
  const fields = formFields ?? pageData.formFields;
  const amount = totalAmount;

  return (
    <div className="bg-white min-h-screen">
      {/* ── Merchant nav bar ── */}
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {editable ? (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90"
                style={{ backgroundColor: pageData.brandColor }}
              >
                {pageData.logoInitial}
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: pageData.brandColor }}
              >
                {pageData.logoInitial}
              </div>
            )}
            {editable ? (
              <input
                value={pageData.merchantName}
                onChange={(e) => onUpdatePage?.({ merchantName: e.target.value })}
                className="font-semibold text-sm text-gray-900 bg-transparent border-none focus:outline-none focus:bg-gray-50 rounded px-1 hover:bg-gray-50"
              />
            ) : (
              <span className="font-semibold text-sm text-gray-900">{pageData.merchantName}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Secured by Razorpay
          </div>
        </div>
      </div>

      {/* ── Two-column content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">

        {/* ── LEFT: Content sections ── */}
        <div className="space-y-8">

          {visibleSections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              pageData={pageData}
              editable={editable}
              onUpdate={(data) => onUpdateSectionData?.(section.id, data)}
              onRemove={() => onRemoveSection?.(section.id)}
            />
          ))}

          {/* Add / restore section */}
          {editable && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200">
              {hiddenSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onRestoreSection?.(s.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {SECTION_META[s.type]?.label}
                </button>
              ))}
            </div>
          )}

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" />100% Secure</div>
            <div className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-blue-500" />Razorpay Protected</div>
            <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="ml-0.5">4.9 / 5 rating</span></div>
          </div>
        </div>

        {/* ── RIGHT: Payment card ── */}
        <div className="lg:sticky lg:top-20">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

            {/* Price header */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 pt-6 pb-5 border-b border-gray-100">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                {categoryLabel(pageData.category)}
              </p>
              {fields.some((f) => f.fieldKind === "amount" && (f as AmountField).type === "amount-fixed") ? (
                <div className="text-4xl font-bold text-gray-900">
                  ₹{amount.toLocaleString("en-IN")}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">Amount set by customer</div>
              )}
            </div>

            {/* Form fields */}
            <div className="px-5 py-5 space-y-3">
              {editable ? (
                // Editable field list
                <>
                  {fields.map((field, index) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      index={index}
                      expanded={expandedFieldId === field.id}
                      onToggleExpand={() => onToggleFieldExpand?.(field.id)}
                      onUpdate={(patch) => onUpdateField?.(field.id, patch)}
                      onRemove={() => onRemoveField?.(field.id)}
                      onDragStart={() => onDragStart?.(index)}
                      onDragOver={(e) => onDragOver?.(e, index)}
                      onDragEnd={() => onDragEnd?.()}
                    />
                  ))}

                  {/* Add field buttons */}
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 flex-1 text-xs">
                          <Plus className="h-3.5 w-3.5" /> Add input field
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-52">
                        {INPUT_TYPES.map(({ type, label, icon: Icon }) => (
                          <DropdownMenuItem key={type} onClick={() => onAddInputField?.(type)} className="gap-2 text-xs">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />{label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 flex-1 text-xs">
                          <Plus className="h-3.5 w-3.5" /> Add amount field
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-60">
                        {AMOUNT_TYPES.map(({ type, label, desc, icon: Icon }) => (
                          <DropdownMenuItem key={type} onClick={() => onAddAmountField?.(type)} className="flex-col items-start gap-0 py-2">
                            <div className="flex items-center gap-2 w-full">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs font-medium">{label}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground pl-5">{desc}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                // Preview mode: render as customer-facing form
                fields.map((field) => <PreviewField key={field.id} field={field} />)
              )}

              {/* Payment methods */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {["UPI", "Visa", "MC", "RuPay", "Net Banking"].map((l) => (
                  <span key={l} className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 font-medium">{l}</span>
                ))}
              </div>

              {/* CTA */}
              <Button
                className="w-full rounded-xl py-5 text-sm font-semibold shadow-md shadow-primary/20"
                disabled={editable}
              >
                {pageData.buttonText} {amount > 0 ? `— ₹${amount.toLocaleString("en-IN")}` : ""}
              </Button>

              <p className="text-center text-[11px] text-gray-400">
                Secured by <span className="font-semibold text-primary">Razorpay</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SectionBlock ─────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: ContentSection;
  pageData: PageData;
  editable: boolean;
  onUpdate: (data: Record<string, any>) => void;
  onRemove: () => void;
}

const SectionBlock = ({ section, pageData, editable, onUpdate, onRemove }: SectionBlockProps) => {
  const wrap = (children: React.ReactNode) =>
    editable ? (
      <div className="relative group">
        {children}
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Remove section"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ) : <>{children}</>;

  const EditableText = ({
    value, onChange, className, as: Tag = "p",
  }: { value: string; onChange: (v: string) => void; className?: string; as?: any }) => {
    if (!editable) return <Tag className={className}>{value}</Tag>;
    return (
      <Tag
        className={`${className} focus:outline-none focus:bg-blue-50/50 rounded px-0.5 -mx-0.5 cursor-text hover:bg-gray-50 transition-colors`}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e: any) => onChange(e.currentTarget.textContent || "")}
      >
        {value}
      </Tag>
    );
  };

  if (section.type === "hero") {
    return wrap(
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          <Sparkles className="h-3 w-3" />
          {categoryLabel(pageData.category)}
        </span>
        <EditableText
          as="h1"
          value={section.data.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
        />
        {section.data.tagline && (
          <EditableText
            value={section.data.tagline}
            onChange={(v) => onUpdate({ tagline: v })}
            className="text-base font-medium text-primary"
          />
        )}
        <EditableText
          value={section.data.description}
          onChange={(v) => onUpdate({ description: v })}
          className="text-gray-600 leading-relaxed max-w-xl"
        />
      </div>
    );
  }

  if (section.type === "stats") {
    return wrap(
      <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100">
        {(section.data.items as any[]).map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-xl font-bold text-gray-900">{item.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "highlights") {
    return wrap(
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{section.data.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(section.data.items as string[]).map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-700">{h}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "about") {
    return wrap(
      <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-5">
        {section.data.image && (
          <img src={section.data.image} alt={section.data.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow" />
        )}
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            {pageData.category === "education" ? "Your Instructor" : "Your Provider"}
          </p>
          <h3 className="text-base font-semibold text-gray-900">{section.data.name}</h3>
          <p className="text-xs text-gray-500 mb-1">{section.data.role}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{section.data.bio}</p>
        </div>
      </div>
    );
  }

  if (section.type === "testimonials") {
    return wrap(
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">What people say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(section.data.items as any[]).slice(0, 4).map((t, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {t.name?.charAt(0)}
                </div>
                <span className="text-xs font-medium text-gray-700">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "faq") {
    return wrap(
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
        {(section.data.items as any[]).map((faq, i) => (
          <details key={i} className="border border-gray-200 rounded-xl">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer">
              <span className="text-sm font-medium text-gray-900">{faq.q}</span>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </summary>
            <p className="px-5 pb-4 text-sm text-gray-600">{faq.a}</p>
          </details>
        ))}
      </div>
    );
  }

  return null;
};

// ─── PreviewField ─────────────────────────────────────────────────────────────

const PreviewField = ({ field }: { field: FormField }) => {
  if (field.fieldKind === "amount") {
    const af = field as AmountField;
    if (af.type === "amount-fixed") {
      return (
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            {field.label}<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
            <span className="text-sm font-bold text-gray-900">₹{af.amount.toLocaleString("en-IN")}</span>
            <span className="ml-auto text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5">Fixed</span>
          </div>
        </div>
      );
    }
    if (af.type === "amount-custom") {
      return (
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">{field.label}</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
            <span className="text-sm text-gray-400">₹</span>
            <input className="flex-1 text-sm bg-transparent focus:outline-none" placeholder="Enter amount" />
          </div>
        </div>
      );
    }
    if (af.type === "amount-item") {
      return (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            {af.image && <img src={af.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{field.label}</p>
              {af.showDescription && af.description && <p className="text-xs text-gray-500 mt-0.5">{af.description}</p>}
            </div>
            <span className="text-sm font-bold text-gray-900">₹{af.amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">−</button>
            <span className="text-sm w-6 text-center font-medium">1</span>
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
          </div>
        </div>
      );
    }
  }

  const inf = field as InputField;
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {inf.type === "textarea" ? (
        <textarea rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder={field.placeholder} />
      ) : inf.type === "dropdown" ? (
        <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">{field.placeholder || "Select..."}</option>
          {(inf.options || []).map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : inf.type === "date" ? (
        <input type="date" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary" />
      ) : (
        <input
          type={inf.type === "email" ? "email" : inf.type === "phone" || inf.type === "number" || inf.type === "pincode" ? "tel" : "text"}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder={field.placeholder}
        />
      )}
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
  const FieldIcon = isAmount
    ? ((field as AmountField).type === "amount-item" ? Package : DollarSign)
    : (INPUT_TYPES.find(x => x.type === (field as InputField).type)?.icon ?? Type);
  const typeLabel = isAmount ? amountTypeLabel((field as AmountField).type) : inputTypeLabel((field as InputField).type);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="border border-gray-200 rounded-xl bg-white overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
        <FieldIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-800 truncate block">{field.label}</span>
          <span className="text-[10px] text-gray-400">{typeLabel}{field.required ? " · Required" : " · Optional"}</span>
        </div>
        <button onClick={onToggleExpand} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button onClick={onRemove} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Label</label>
            <Input value={field.label} onChange={(e) => onUpdate({ label: e.target.value } as any)} className="h-8 text-xs" />
          </div>

          {isAmount && amountField && (
            <>
              {(amountField.type === "amount-fixed" || amountField.type === "amount-item") && (
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">
                    {amountField.type === "amount-item" ? "Price per item (₹)" : "Amount (₹)"}
                  </label>
                  <Input type="number" value={amountField.amount || ""} onChange={(e) => onUpdate({ amount: Number(e.target.value) } as any)} className="h-8 text-xs" placeholder="0" />
                </div>
              )}
              {amountField.type === "amount-item" && amountField.showDescription && (
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Description</label>
                  <Input value={amountField.description || ""} onChange={(e) => onUpdate({ description: e.target.value } as any)} className="h-8 text-xs" placeholder="Item description" />
                </div>
              )}

              {/* Options */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Options</p>

                <button onClick={() => onUpdate({ image: amountField.image !== undefined ? undefined : "" } as any)}
                  className="flex items-center gap-2 w-full text-left text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="flex-1 text-gray-700">Add Image</span>
                  {amountField.image !== undefined && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
                {amountField.image !== undefined && (
                  <Input value={amountField.image || ""} onChange={(e) => onUpdate({ image: e.target.value } as any)} className="h-8 text-xs" placeholder="Image URL" />
                )}

                {amountField.type === "amount-item" && (
                  <button onClick={() => onUpdate({ showDescription: !amountField.showDescription } as any)}
                    className="flex items-center gap-2 w-full text-left text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <AlignLeft className="h-3.5 w-3.5 text-gray-400" />
                    <span className="flex-1 text-gray-700">{amountField.showDescription ? "Remove Description" : "Add Description"}</span>
                    {amountField.showDescription && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                )}

                <button onClick={() => onUpdate({ optional: !amountField.optional } as any)}
                  className="flex items-center gap-2 w-full text-left text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Check className="h-3.5 w-3.5 text-gray-400" />
                  <span className="flex-1 text-gray-700">Optional Item</span>
                  {amountField.optional && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>

                {amountField.type === "amount-item" && (
                  <details className="text-xs">
                    <summary className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer list-none">
                      <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
                      <span className="flex-1 text-gray-700">Advanced Options</span>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </summary>
                    <div className="pt-2 flex gap-2">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 mb-1">Min Qty</p>
                        <Input type="number" value={amountField.minQty ?? 1} onChange={(e) => onUpdate({ minQty: Number(e.target.value) } as any)} className="h-8 text-xs" min={0} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 mb-1">Max Qty</p>
                        <Input type="number" value={amountField.maxQty ?? 99} onChange={(e) => onUpdate({ maxQty: Number(e.target.value) } as any)} className="h-8 text-xs" min={1} />
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </>
          )}

          {!isAmount && (
            <>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Placeholder</label>
                <Input value={field.placeholder} onChange={(e) => onUpdate({ placeholder: e.target.value } as any)} className="h-8 text-xs" placeholder="Placeholder text" />
              </div>
              {(field as InputField).type === "dropdown" && (
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Options (one per line)</label>
                  <Textarea value={((field as InputField).options || []).join("\n")} onChange={(e) => onUpdate({ options: e.target.value.split("\n") } as any)} className="text-xs min-h-[60px] resize-none" rows={3} placeholder={"Option 1\nOption 2\nOption 3"} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-700">Required</label>
                <Switch checked={field.required} onCheckedChange={(v) => onUpdate({ required: v } as any)} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPageEditor;
