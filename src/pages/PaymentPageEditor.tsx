import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings,
  X, Copy, ExternalLink, Plus,
  Trash2, GripVertical, ChevronDown,
  Save, Loader2, CheckCircle2,
  Receipt, Image as ImageIcon, MoreVertical, Package, DollarSign,
  AlignLeft, Hash, Mail, Phone, Type, Link, CalendarDays, List,
  Share2, Sparkles, Shield, Star, Check, CreditCard, Settings2,
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
  DropdownMenuSeparator, DropdownMenuLabel,
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
    showDescription: false,
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

const AMOUNT_TYPES: { type: AmountFieldType; label: string; desc: string }[] = [
  { type: "amount-fixed",  label: "Fixed Amount",            desc: "Set a fixed price" },
  { type: "amount-custom", label: "Customer Decides Amount", desc: "Customer enters amount" },
  { type: "amount-item",   label: "Item with Quantity",      desc: "Product with qty selector" },
];

const categoryLabel = (cat: PageData["category"]) =>
  ({ education: "Online Course", services: "Professional Service", ecommerce: "Product", events: "Event" }[cat] ?? "Payment");

// ─── Main component ───────────────────────────────────────────────────────────

const PaymentPageEditor = () => {
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const [viewMode,              setViewMode]              = useState<"desktop" | "mobile">("desktop");
  const [rightPanel,            setRightPanel]            = useState<"settings" | "receipts" | null>(null);
  const [previewMode,           setPreviewMode]           = useState(false);
  const [publishDialogOpen,     setPublishDialogOpen]     = useState(false);
  const [postPublishDialogOpen, setPostPublishDialogOpen] = useState(false);
  const [shareDialogOpen,       setShareDialogOpen]       = useState(false);
  const [publishing,            setPublishing]            = useState(false);
  const [settingsTab,           setSettingsTab]           = useState("page");
  const [unsavedChanges,        setUnsavedChanges]        = useState(false);

  const [receiptDeliveryMode, setReceiptDeliveryMode] = useState<"auto" | "manual">("auto");
  const [receiptChannel,      setReceiptChannel]       = useState<"email" | "whatsapp" | "both">("email");
  const [receiptPrefix,       setReceiptPrefix]        = useState("RCP");
  const [receiptStartNumber,  setReceiptStartNumber]   = useState("001");

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

  const updatePage = (updates: Partial<PageData>) => {
    setPageData((prev) => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const updateSection = (id: string, patch: Partial<ContentSection>) =>
    updatePage({ sections: pageData.sections.map((s) => s.id === id ? { ...s, ...patch } : s) });

  const updateSectionData = (id: string, dataPatch: Record<string, any>) =>
    updatePage({ sections: pageData.sections.map((s) => s.id === id ? { ...s, data: { ...s.data, ...dataPatch } } : s) });

  const removeSection = (id: string) =>
    updatePage({ sections: pageData.sections.map((s) => s.id === id ? { ...s, visible: false } : s) });

  const updateField = (id: string, patch: Partial<FormField>) =>
    updatePage({ formFields: pageData.formFields.map((f) => f.id === id ? ({ ...f, ...patch } as FormField) : f) });

  const removeField = (id: string) =>
    updatePage({ formFields: pageData.formFields.filter((f) => f.id !== id) });

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
      showDescription: false,
      optional: false,
    };
    updatePage({ formFields: [...pageData.formFields, field] });
  };

  const handleDragStart = (index: number) => { dragIndexRef.current = index; };
  const handleDragOver  = (e: React.DragEvent, index: number) => {
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
  const handleDragEnd   = () => { dragIndexRef.current = null; };

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
  const copyLink   = () => { navigator.clipboard.writeText(pageData.pageUrl); toast.success("Link copied!"); };

  const totalAmount = pageData.formFields
    .filter((f): f is AmountField => f.fieldKind === "amount" && f.type === "amount-fixed")
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const hiddenSections = pageData.sections.filter((s) => !s.visible);

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
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className={`mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-5xl"}`}>
            <EditorCanvas pageData={pageData} editable={false} isMobile={viewMode === "mobile"} totalAmount={totalAmount} />
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
            <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back</span>
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
            <Eye className="h-4 w-4" /><span className="hidden sm:inline">Preview</span>
          </Button>
          <Button variant="outline" size="sm" className={`gap-1.5 ${rightPanel === "receipts" ? "bg-secondary" : ""}`} onClick={() => setRightPanel(rightPanel === "receipts" ? null : "receipts")}>
            <Receipt className="h-4 w-4" /><span className="hidden sm:inline">Receipts</span>
          </Button>
          <Button variant="outline" size="sm" className={`gap-1.5 ${rightPanel === "settings" ? "bg-secondary" : ""}`} onClick={() => setRightPanel(rightPanel === "settings" ? null : "settings")}>
            <Settings className="h-4 w-4" /><span className="hidden sm:inline">Settings</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className={`mx-auto transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-6xl"}`}>
            <EditorCanvas
              pageData={pageData}
              editable
              isMobile={viewMode === "mobile"}
              onUpdatePage={updatePage}
              onUpdateSectionData={updateSectionData}
              onRemoveSection={removeSection}
              hiddenSections={hiddenSections}
              onRestoreSection={(id) => updateSection(id, { visible: true })}
              onUpdateField={updateField}
              onRemoveField={removeField}
              onAddInputField={addInputField}
              onAddAmountField={addAmountField}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              totalAmount={totalAmount}
            />
          </div>
        </div>

        {/* Settings panel */}
        {rightPanel === "settings" && (
          <div className="w-80 border-l border-border flex flex-col bg-background overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold">Page Settings</span>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <Tabs value={settingsTab} onValueChange={setSettingsTab} className="flex-1">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
                <TabsTrigger value="page" className="text-xs">Page</TabsTrigger>
                <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="page" className="p-4 space-y-4">
                <div><label className="text-xs font-medium">Merchant / Business Name</label>
                  <Input value={pageData.merchantName} onChange={(e) => updatePage({ merchantName: e.target.value })} className="mt-1.5" /></div>
                <div><label className="text-xs font-medium">Logo Initial</label>
                  <Input value={pageData.logoInitial} onChange={(e) => updatePage({ logoInitial: e.target.value })} className="mt-1.5 w-20" maxLength={2} /></div>
                <div><label className="text-xs font-medium">Category</label>
                  <Select value={pageData.category} onValueChange={(v) => updatePage({ category: v as PageData["category"] })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education / Course</SelectItem>
                      <SelectItem value="services">Professional Service</SelectItem>
                      <SelectItem value="ecommerce">E-commerce / Product</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                    </SelectContent>
                  </Select></div>
                <div><label className="text-xs font-medium">Success Message</label>
                  <Textarea value={pageData.successMessage} onChange={(e) => updatePage({ successMessage: e.target.value })} rows={2} className="mt-1.5" /></div>
                <div><label className="text-xs font-medium">Redirect URL (after payment)</label>
                  <Input value={pageData.redirectUrl} onChange={(e) => updatePage({ redirectUrl: e.target.value })} placeholder="https://example.com/thank-you" className="mt-1.5" /></div>
              </TabsContent>
              <TabsContent value="payment" className="p-4 space-y-4">
                <div><label className="text-xs font-medium">Button Text</label>
                  <Input value={pageData.buttonText} onChange={(e) => updatePage({ buttonText: e.target.value })} className="mt-1.5" /></div>
              </TabsContent>
              <TabsContent value="seo" className="p-4 space-y-4">
                <div><label className="text-xs font-medium">Page Slug</label>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">rzp.io/rzp/</span>
                    <Input value={pageData.slug} onChange={(e) => updatePage({ slug: e.target.value })} className="flex-1" />
                  </div></div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Receipts panel */}
        {rightPanel === "receipts" && (
          <div className="w-80 border-l border-border flex flex-col bg-background overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2"><Receipt className="h-4 w-4" /><span className="text-sm font-semibold">Payment Receipts</span></div>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Enable receipts</p><p className="text-xs text-muted-foreground mt-0.5">Send receipt after payment</p></div>
                <Switch checked={pageData.sendReceipt} onCheckedChange={(v) => updatePage({ sendReceipt: v })} />
              </div>
              {pageData.sendReceipt && (
                <>
                  <div className="space-y-2"><p className="text-xs font-medium">Receipt Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ label: "Standard", gst: false, sub: "Basic receipt" }, { label: "GST Receipt", gst: true, sub: "GST-compliant" }].map(({ label, gst, sub }) => (
                        <button key={label} onClick={() => updatePage({ gstEnabled: gst })}
                          className={`p-3 rounded-md border text-left ${pageData.gstEnabled === gst ? "border-primary bg-primary/5" : "border-border"}`}>
                          <p className={`text-xs font-medium ${pageData.gstEnabled === gst ? "text-primary" : "text-foreground"}`}>{label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2"><p className="text-xs font-medium">Delivery</p>
                    <Select value={receiptDeliveryMode} onValueChange={(v) => setReceiptDeliveryMode(v as any)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic (on payment)</SelectItem>
                        <SelectItem value="manual">Manual (from transactions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><p className="text-xs font-medium">Send via</p>
                    <Select value={receiptChannel} onValueChange={(v) => setReceiptChannel(v as any)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email only</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp only</SelectItem>
                        <SelectItem value="both">Email + WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><p className="text-xs font-medium">Receipt Numbering</p>
                    <div className="flex gap-2">
                      <div className="flex-1"><p className="text-[10px] text-muted-foreground mb-1">Prefix</p>
                        <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())} className="h-8 text-xs font-mono" maxLength={6} /></div>
                      <div className="flex-1"><p className="text-[10px] text-muted-foreground mb-1">Start from</p>
                        <Input value={receiptStartNumber} onChange={(e) => setReceiptStartNumber(e.target.value)} className="h-8 text-xs font-mono" /></div>
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
            <div><label className="text-xs font-medium">Page URL</label>
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
              {publishing ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing...</> : "Publish Now"}
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
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-4 w-4 mr-1" />Copy</Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/payment/${pageData.slug}`, "_blank")}><ExternalLink className="h-4 w-4 mr-1" />Open</Button>
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

interface EditorCanvasProps {
  pageData: PageData;
  editable?: boolean;
  isMobile?: boolean;
  onUpdatePage?: (u: Partial<PageData>) => void;
  onUpdateSectionData?: (id: string, data: Record<string, any>) => void;
  onRemoveSection?: (id: string) => void;
  hiddenSections?: ContentSection[];
  onRestoreSection?: (id: string) => void;
  onUpdateField?: (id: string, patch: Partial<FormField>) => void;
  onRemoveField?: (id: string) => void;
  onAddInputField?: (type: InputFieldType) => void;
  onAddAmountField?: (type: AmountFieldType) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  totalAmount: number;
}

const EditorCanvas = ({
  pageData, editable = false, isMobile = false,
  onUpdatePage, onUpdateSectionData, onRemoveSection,
  hiddenSections = [], onRestoreSection,
  onUpdateField, onRemoveField, onAddInputField, onAddAmountField,
  onDragStart, onDragOver, onDragEnd, totalAmount,
}: EditorCanvasProps) => {
  const visibleSections = pageData.sections.filter((s) => s.visible);
  const [mobileStep, setMobileStep] = useState<"content" | "payment">("content");

  return (
    <div className="bg-white min-h-screen">
      {/* Merchant nav */}
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: pageData.brandColor }}>
              {pageData.logoInitial}
            </div>
            {editable ? (
              <input
                value={pageData.merchantName}
                onChange={(e) => onUpdatePage?.({ merchantName: e.target.value })}
                className="font-semibold text-sm text-gray-900 bg-transparent border-none focus:outline-none focus:bg-gray-50 rounded px-1 hover:bg-gray-50 max-w-xs"
              />
            ) : (
              <span className="font-semibold text-sm text-gray-900">{pageData.merchantName}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Secured by Razorpay
          </div>
        </div>
      </div>

      {/* Two-column grid — mobile becomes single-column with step navigation */}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 ${isMobile ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-[1fr_420px]"} gap-10 items-start`}>

        {/* ── LEFT: Content ── (hidden on mobile when on payment step) */}
        {(!isMobile || mobileStep === "content") && (
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

          {/* Restore hidden sections */}
          {editable && hiddenSections.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200">
              {hiddenSections.map((s) => (
                <button key={s.id} onClick={() => onRestoreSection?.(s.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition-colors">
                  <Plus className="h-3 w-3" />{SECTION_META[s.type]?.label}
                </button>
              ))}
            </div>
          )}

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" />100% Secure</div>
            <div className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-blue-400" />Razorpay Protected</div>
            <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="ml-0.5">4.9 / 5 rating</span></div>
          </div>

          {/* Mobile: Proceed button */}
          {isMobile && (
            <button
              onClick={() => setMobileStep("payment")}
              className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold shadow-lg shadow-primary/20"
            >
              Proceed to Payment →
            </button>
          )}
        </div>
        )}

        {/* ── RIGHT: Payment Details ── (full width on mobile payment step) */}
        {(!isMobile || mobileStep === "payment") && (
        <div className={isMobile ? "w-full" : "lg:sticky lg:top-20"}>
          {editable ? (
            /* Editor payment panel */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Heading */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                {isMobile && mobileStep === "payment" && (
                  <button onClick={() => setMobileStep("content")} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary mb-3 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to details
                  </button>
                )}
                <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                <div className="w-8 h-0.5 bg-primary mt-1.5" />
              </div>

              {/* Fields */}
              <div className="px-6 py-4 space-y-1">
                {pageData.formFields.map((field, index) => (
                  <InlineFieldRow
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={(patch) => onUpdateField?.(field.id, patch)}
                    onRemove={() => onRemoveField?.(field.id)}
                    onDragStart={() => onDragStart?.(index)}
                    onDragOver={(e) => onDragOver?.(e, index)}
                    onDragEnd={() => onDragEnd?.()}
                  />
                ))}

                {/* Add new */}
                <div className="pt-3 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">+ Add new</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-xs text-primary border border-primary/30 rounded px-2.5 py-1 hover:bg-primary/5 transition-colors font-medium">
                          Input field
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-52">
                        {INPUT_TYPES.map(({ type, label, icon: Icon }) => (
                          <DropdownMenuItem key={type} onClick={() => onAddInputField?.(type)} className="gap-2 text-sm">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />{label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-xs text-primary border border-primary/30 rounded px-2.5 py-1 hover:bg-primary/5 transition-colors font-medium">
                          Price field
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-60">
                        {AMOUNT_TYPES.map(({ type, label, desc }) => (
                          <DropdownMenuItem key={type} onClick={() => onAddAmountField?.(type)} className="flex-col items-start py-2.5">
                            <span className="text-sm font-medium text-foreground">{label}</span>
                            <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking"].map((l) => (
                    <span key={l} className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5 font-medium">{l}</span>
                  ))}
                </div>
                <button className="w-full bg-primary text-white rounded-lg py-3 text-sm font-semibold opacity-60 cursor-not-allowed" disabled>
                  {pageData.buttonText}{totalAmount > 0 ? ` — ₹${totalAmount.toLocaleString("en-IN")}` : ""}
                </button>
                <p className="text-center text-[11px] text-gray-400">
                  Powered by <span className="font-semibold" style={{ color: "#0066FF" }}>Razorpay</span>
                </p>
              </div>
            </div>
          ) : (
            /* Preview payment card */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                <div className="w-8 h-0.5 bg-primary mt-1.5" />
              </div>
              <div className="px-6 py-4 space-y-4">
                {pageData.formFields.map((field) => <PreviewField key={field.id} field={field} />)}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {["UPI", "Visa", "Mastercard", "RuPay"].map((l) => (
                    <span key={l} className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5 font-medium">{l}</span>
                  ))}
                </div>
                <button className="w-full bg-primary text-white rounded-lg py-3 text-sm font-semibold">
                  {pageData.buttonText}{totalAmount > 0 ? ` — ₹${totalAmount.toLocaleString("en-IN")}` : ""}
                </button>
                <p className="text-center text-[11px] text-gray-400">Powered by <span className="font-semibold" style={{ color: "#0066FF" }}>Razorpay</span></p>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

// ─── InlineFieldRow ───────────────────────────────────────────────────────────
// Renders each payment field as an actual inline input control, Razorpay-style.

interface InlineFieldRowProps {
  field: FormField;
  index: number;
  onUpdate: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const InlineFieldRow = ({
  field, index, onUpdate, onRemove, onDragStart, onDragOver, onDragEnd,
}: InlineFieldRowProps) => {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue,   setLabelValue]   = useState(field.label);
  const isAmount = field.fieldKind === "amount";
  const af = isAmount ? (field as AmountField) : null;
  const inf = !isAmount ? (field as InputField) : null;

  const commitLabel = () => {
    setEditingLabel(false);
    if (labelValue.trim()) onUpdate({ label: labelValue } as any);
  };

  // 3-dot menu options
  const ThreeDotMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={4}>
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-1">
          Additional Options
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="gap-2.5 py-2"
          onClick={() => onUpdate({ image: af?.image !== undefined ? undefined : "" } as any)}
        >
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <span>{af?.image !== undefined ? "Remove Image" : "Add Image"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 py-2"
          onClick={() => onUpdate({ showDescription: !af?.showDescription } as any)}
        >
          <AlignLeft className="h-4 w-4 text-gray-500" />
          <span>{af?.showDescription ? "Remove Description" : "Add Description"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 py-2"
          onClick={() => onUpdate({ optional: !af?.optional } as any)}
        >
          <Check className="h-4 w-4 text-gray-500" />
          <span>Make it Optional Item</span>
        </DropdownMenuItem>
        {af?.type === "amount-item" && (
          <DropdownMenuItem className="gap-2.5 py-2 flex-col items-start">
            <div className="flex items-center gap-2.5">
              <Settings2 className="h-4 w-4 text-gray-500" />
              <span>Advanced Options</span>
            </div>
            <span className="text-[11px] text-gray-400 pl-6">Add quantity, define rules around quantity, etc.</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2.5 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Field</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="group"
    >
      <div className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Drag handle */}
        <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Label (editable) */}
        <div className="w-28 flex-shrink-0">
          {editingLabel ? (
            <input
              autoFocus
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => e.key === "Enter" && commitLabel()}
              className="w-full text-sm font-medium text-gray-700 bg-white border border-primary/40 rounded px-1.5 py-0.5 focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingLabel(true)}
              className="text-sm font-medium text-gray-700 hover:text-primary text-left truncate w-full group/label flex items-center gap-1"
              title="Click to rename"
            >
              {field.label}
              <span className="opacity-0 group-hover/label:opacity-100 transition-opacity">
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </span>
            </button>
          )}
        </div>

        {/* Field control */}
        <div className="flex-1 min-w-0">
          {isAmount && af ? (
            <>
              {af.type === "amount-fixed" && (
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                  <span className="flex items-center gap-1 pl-3 pr-2 text-sm text-gray-600 border-r border-gray-200 bg-gray-50 self-stretch flex items-center">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={af.amount || ""}
                    onChange={(e) => onUpdate({ amount: Number(e.target.value) } as any)}
                    placeholder="0"
                    className="flex-1 px-3 py-2 text-sm text-gray-900 bg-transparent focus:outline-none min-w-0"
                  />
                </div>
              )}
              {af.type === "amount-custom" && (
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <span className="pl-3 pr-2 text-sm text-gray-400 border-r border-gray-200 self-stretch flex items-center">₹</span>
                  <span className="px-3 py-2 text-sm text-gray-400 italic">Customer enters amount</span>
                </div>
              )}
              {af.type === "amount-item" && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1 focus-within:border-primary/50">
                    <span className="pl-3 pr-2 text-sm text-gray-600 border-r border-gray-200 bg-gray-50 self-stretch flex items-center">₹</span>
                    <input
                      type="number"
                      value={af.amount || ""}
                      onChange={(e) => onUpdate({ amount: Number(e.target.value) } as any)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 text-xs text-gray-500">
                    <span>Qty: 1</span>
                  </div>
                </div>
              )}
              {/* Description sub-row */}
              {af.showDescription && (
                <input
                  value={af.description || ""}
                  onChange={(e) => onUpdate({ description: e.target.value } as any)}
                  placeholder="Item description (optional)"
                  className="mt-1.5 w-full text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/40"
                />
              )}
            </>
          ) : inf ? (
            inf.type === "textarea" ? (
              <textarea
                rows={2}
                placeholder={field.placeholder}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none text-gray-400 bg-gray-50/50"
                readOnly
              />
            ) : inf.type === "dropdown" ? (
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 gap-2">
                <span className="text-sm text-gray-400 flex-1">{field.placeholder || "Select option"}</span>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            ) : inf.type === "date" ? (
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 gap-2">
                <span className="text-sm text-gray-400 flex-1">DD / MM / YYYY</span>
                <CalendarDays className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                readOnly
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-gray-50/50 text-gray-400 cursor-default"
              />
            )
          ) : null}
        </div>

        {/* 3-dot menu */}
        <ThreeDotMenu />
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
      <div className="relative group/section">
        {children}
        <button onClick={onRemove}
          className="absolute -top-1 -right-1 p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-300 hover:text-red-500 hover:border-red-200 opacity-0 group-hover/section:opacity-100 transition-all z-10"
          title="Remove section">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ) : <>{children}</>;

  const ET = ({ value, onChange, className, tag: Tag = "p" }: { value: string; onChange: (v: string) => void; className?: string; tag?: any }) => {
    if (!editable) return <Tag className={className}>{value}</Tag>;
    return (
      <Tag
        className={`${className} focus:outline-none hover:bg-blue-50/50 focus:bg-blue-50/60 rounded-sm transition-colors cursor-text`}
        contentEditable suppressContentEditableWarning
        onBlur={(e: any) => onChange(e.currentTarget.textContent || "")}
      >{value}</Tag>
    );
  };

  if (section.type === "hero") return wrap(
    <div className="space-y-4">
      <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
        <Sparkles className="h-3 w-3" />{categoryLabel(pageData.category)}
      </span>
      <ET tag="h1" value={section.data.title} onChange={(v) => onUpdate({ title: v })} className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" />
      {section.data.tagline && <ET value={section.data.tagline} onChange={(v) => onUpdate({ tagline: v })} className="text-base font-medium text-primary" />}
      <ET value={section.data.description} onChange={(v) => onUpdate({ description: v })} className="text-gray-600 leading-relaxed max-w-xl" />
    </div>
  );

  if (section.type === "stats") return wrap(
    <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100">
      {(section.data.items as any[]).map((item, i) => (
        <div key={i} className="text-center">
          <div className="text-xl font-bold text-gray-900">{item.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );

  if (section.type === "highlights") return wrap(
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

  if (section.type === "about") return wrap(
    <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-5">
      {section.data.image && <img src={section.data.image} alt={section.data.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow" />}
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

  if (section.type === "testimonials") return wrap(
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">What people say</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(section.data.items as any[]).slice(0, 4).map((t, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">"{t.text}"</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{t.name?.charAt(0)}</div>
              <span className="text-xs font-medium text-gray-700">{t.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (section.type === "faq") return wrap(
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

  return null;
};

// ─── PreviewField ─────────────────────────────────────────────────────────────

const PreviewField = ({ field }: { field: FormField }) => {
  if (field.fieldKind === "amount") {
    const af = field as AmountField;
    return (
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {af.type === "amount-fixed" && (
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <span className="pl-3 pr-3 py-2.5 text-sm text-gray-600 border-r border-gray-200 bg-gray-50">₹</span>
            <span className="px-3 py-2.5 text-sm font-semibold text-gray-900">{af.amount.toLocaleString("en-IN")}</span>
            <span className="ml-auto mr-3 text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5">Fixed</span>
          </div>
        )}
        {af.type === "amount-custom" && (
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <span className="pl-3 pr-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 bg-gray-50">₹</span>
            <input type="number" className="flex-1 px-3 py-2.5 text-sm focus:outline-none" placeholder="Enter amount" />
          </div>
        )}
        {af.type === "amount-item" && (
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{field.label}</p>
                {af.description && <p className="text-xs text-gray-500 mt-0.5">{af.description}</p>}
              </div>
              <span className="text-sm font-bold text-gray-900 flex-shrink-0">₹{af.amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-lg leading-none">−</button>
              <span className="text-sm w-6 text-center font-medium">1</span>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-lg leading-none">+</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const inf = field as InputField;
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
        {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {inf.type === "textarea" ? (
        <textarea rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder={field.placeholder} />
      ) : inf.type === "dropdown" ? (
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 bg-white">
          <span className="text-sm text-gray-400 flex-1">{field.placeholder || "Select..."}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      ) : inf.type === "date" ? (
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
          <span className="text-sm text-gray-400 flex-1">DD / MM / YYYY</span>
          <CalendarDays className="h-4 w-4 text-gray-400" />
        </div>
      ) : (
        <input
          type={inf.type === "email" ? "email" : inf.type === "phone" || inf.type === "number" ? "tel" : "text"}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
};

export default PaymentPageEditor;
