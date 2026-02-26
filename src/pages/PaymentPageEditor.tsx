import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings, Sparkles, Camera, Send,
  X, Copy, ExternalLink, Globe, Palette, Type, Image, Layout, Plus,
  Trash2, GripVertical, Check, Undo2, Redo2, Code, Share2, ChevronDown,
  Save, Loader2, CheckCircle2, Link2
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

// --- Page data model ---
interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "textarea";
  required: boolean;
  placeholder: string;
}

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
  amount: number;
  amountType: "fixed" | "custom";
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

const defaultFormFields: FormField[] = [
  { id: "f1", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
  { id: "f2", label: "Email", type: "email", required: true, placeholder: "Enter your email" },
  { id: "f3", label: "Phone", type: "phone", required: false, placeholder: "Enter your phone number" },
];

const defaultSections: PageSection[] = [
  { id: "s1", type: "banner", visible: true, content: { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop" } },
  { id: "s2", type: "heading", visible: true, content: { title: "Event Booking — My Page", subtitle: "EVENT BOOKING" } },
  { id: "s3", type: "text", visible: true, content: { text: "A professional event registration page for conferences, workshops, seminars, meetups, concerts, and community gatherings. Collect attendee details, offer multiple ticket tiers, and share your event schedule." } },
  { id: "s4", type: "features", visible: true, content: { title: "Why Students Love This", subtitle: "Here's what makes us different", items: ["Curated Experience", "Expert Speakers", "Networking Opportunities", "Hands-on Workshops"] } },
  { id: "s5", type: "testimonials", visible: true, content: { items: [{ name: "Priya S.", text: "Absolutely loved the event! The speakers were incredible.", rating: 5 }, { name: "Rahul M.", text: "Great networking and well-organized sessions.", rating: 5 }, { name: "Ananya G.", text: "Worth every rupee. Signed up for the next one!", rating: 4 }] } },
  { id: "s6", type: "faq", visible: true, content: { items: [{ q: "What is included in the registration?", a: "Full access to all sessions, workshop materials, lunch, and networking events." }, { q: "Can I get a refund?", a: "Yes, full refund up to 7 days before the event. 50% refund within 7 days." }, { q: "Is there a group discount?", a: "Yes! Groups of 5+ get 15% off. Use code GROUP15 at checkout." }] } },
];

const suggestedActions = [
  "Add a countdown timer for early-bird pricing",
  "Generate a professional header banner image",
  "Change the color theme to match my brand",
  "Add a testimonials section with star ratings",
  "Add a new form field to collect more details",
  "Create a FAQ section about the course",
];

interface ChatMsg {
  role: "assistant" | "user";
  content: string;
  time: string;
}

const PaymentPageEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // View state
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [rightPanel, setRightPanel] = useState<"ai" | "settings" | null>("ai");
  const [previewMode, setPreviewMode] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState("page");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Page data
  const [pageData, setPageData] = useState<PageData>({
    title: searchParams.get("title") || "Event Booking — My Page",
    subtitle: "EVENT BOOKING",
    description: "A professional event registration page for conferences, workshops, seminars, meetups, concerts, and community gatherings.",
    bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop",
    logoInitial: "E",
    amount: 2999,
    amountType: "fixed",
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

  // AI Chat
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! I'm your Razorpay AI page builder. I can edit your page content, add sections, change styling, update pricing, and more. What would you like to change?", time: "1m ago" },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updatePage = (updates: Partial<PageData>) => {
    setPageData((prev) => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    updatePage({
      sections: pageData.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    });
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMsg = { role: "user", content: text, time: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    // Simulate AI response with actual page modifications
    setTimeout(() => {
      let response = "";
      const lower = text.toLowerCase();

      if (lower.includes("testimonial") || lower.includes("review")) {
        updatePage({ sections: pageData.sections.map((s) => s.type === "testimonials" ? { ...s, visible: true } : s) });
        response = "I've enabled the testimonials section on your page. You can see 3 reviews from happy students. Click on any testimonial to edit it.";
      } else if (lower.includes("faq")) {
        updatePage({ sections: pageData.sections.map((s) => s.type === "faq" ? { ...s, visible: true } : s) });
        response = "I've added a FAQ section to your page with 3 common questions. You can edit or add more FAQs in the settings panel.";
      } else if (lower.includes("color") || lower.includes("theme") || lower.includes("brand")) {
        response = "I've updated the page to use your brand colors. You can further customize colors in Settings → Branding.";
      } else if (lower.includes("price") || lower.includes("amount") || lower.includes("pricing")) {
        updatePage({ amount: 4999 });
        response = "I've updated the price to ₹4,999. You can change it anytime in the payment form on the right, or tell me a different amount.";
      } else if (lower.includes("banner") || lower.includes("image") || lower.includes("header")) {
        updatePage({ bannerImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&h=300&fit=crop" });
        response = "I've changed the banner image to a vibrant event photo. Want me to try a different style?";
      } else if (lower.includes("title") || lower.includes("heading") || lower.includes("name")) {
        updatePage({ title: "Premium Tech Conference 2026" });
        response = "I've updated the page title to 'Premium Tech Conference 2026'. Feel free to click on it in the preview to edit directly.";
      } else if (lower.includes("field") || lower.includes("form")) {
        const newField: FormField = { id: `f${Date.now()}`, label: "Organization", type: "text", required: false, placeholder: "Enter your company/org name" };
        updatePage({ formFields: [...pageData.formFields, newField] });
        response = "I've added an 'Organization' field to the registration form. You can rename it or change its type in Settings → Form Fields.";
      } else if (lower.includes("button") || lower.includes("cta")) {
        updatePage({ buttonText: "Register Now — ₹" + pageData.amount.toLocaleString("en-IN") });
        response = "I've updated the CTA button text. You can customize it further in the settings panel.";
      } else if (lower.includes("countdown") || lower.includes("timer") || lower.includes("early")) {
        response = "I've noted your request for a countdown timer. In the full version, this would add a live countdown section above the payment form. For now, you can mention early-bird pricing in the description.";
      } else {
        response = `I'll help you with "${text}". I've made note of this change. You can also use the Settings panel on the right to make detailed adjustments to any part of your page.`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response, time: "Just now" }]);
    }, 800);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      updatePage({ status: "published" });
      setPublishDialogOpen(false);
      setUnsavedChanges(false);
      toast.success("Payment page published successfully!");
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

  // Full preview mode
  if (previewMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Exit Preview
            </Button>
            <span className="text-sm text-muted-foreground">Previewing as your customers will see it</span>
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
        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-lg border border-border overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-3xl"}`}>
            <PagePreviewContent pageData={pageData} viewMode={viewMode} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => updatePage({ title: e.target.value })}
              className="font-semibold text-foreground text-sm bg-transparent border-none focus:outline-none focus:ring-0 hover:bg-secondary/50 rounded px-2 py-1 -ml-2"
            />
            {unsavedChanges && <span className="w-2 h-2 rounded-full bg-warning" />}
            <span className={pageData.status === "published" ? "blade-badge-paid text-[10px]" : "blade-badge-expired text-[10px]"}>
              {pageData.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleSave}>
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
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "settings" ? null : "settings")}>
            <Settings className="h-4 w-4" /> Settings
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "ai" ? null : "ai")}>
            <Sparkles className="h-4 w-4" />
            AI
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Page preview */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-sm border border-border overflow-hidden transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            <PagePreviewContent pageData={pageData} viewMode={viewMode} editable onUpdatePage={updatePage} editingSection={editingSection} onEditSection={setEditingSection} />
          </div>
        </div>

        {/* Right Panel: AI Chat or Settings */}
        {rightPanel === "ai" && (
          <div className="w-80 border-l border-border flex flex-col bg-background">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-[10px]">R</span>
                </div>
                <span className="text-sm font-semibold text-foreground">AI Builder</span>
              </div>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`${msg.role === "user" ? "ml-8" : "mr-4"}`}>
                  <div className={`text-sm p-3 rounded-lg ${msg.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="px-4 pb-2 space-y-1.5">
              {suggestedActions.slice(0, 3).map((action) => (
                <button key={action} onClick={() => sendMessage(action)} className="w-full text-left text-xs px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  {action}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
                  placeholder="Ask AI to edit your page..."
                  className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button onClick={() => sendMessage(chatInput)} className="text-primary hover:text-primary/80 p-1">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {rightPanel === "settings" && (
          <div className="w-96 border-l border-border flex flex-col bg-background overflow-y-auto">
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
                <TabsTrigger value="form" className="text-xs">Form Fields</TabsTrigger>
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
                  <label className="text-xs font-medium text-foreground">Amount Type</label>
                  <Select value={pageData.amountType} onValueChange={(v) => updatePage({ amountType: v as "fixed" | "custom" })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="custom">Customer Enters Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Amount (₹)</label>
                  <Input type="number" value={pageData.amount} onChange={(e) => updatePage({ amount: Number(e.target.value) })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Button Text</label>
                  <Input value={pageData.buttonText} onChange={(e) => updatePage({ buttonText: e.target.value })} className="mt-1.5" />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Send payment receipt</span>
                    <Switch checked={pageData.sendReceipt} onCheckedChange={(v) => updatePage({ sendReceipt: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Enable GST</span>
                    <Switch checked={pageData.gstEnabled} onCheckedChange={(v) => updatePage({ gstEnabled: v })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="form" className="p-4 space-y-4">
                <p className="text-xs text-muted-foreground">Drag fields to reorder. Toggle required status.</p>
                {pageData.formFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2 p-3 rounded-md border border-border bg-secondary/30">
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <Input value={field.label} onChange={(e) => {
                        const updated = [...pageData.formFields];
                        updated[idx] = { ...field, label: e.target.value };
                        updatePage({ formFields: updated });
                      }} className="h-8 text-xs" />
                    </div>
                    <Select value={field.type} onValueChange={(v) => {
                      const updated = [...pageData.formFields];
                      updated[idx] = { ...field, type: v as FormField["type"] };
                      updatePage({ formFields: updated });
                    }}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">Req</span>
                      <Switch checked={field.required} onCheckedChange={(v) => {
                        const updated = [...pageData.formFields];
                        updated[idx] = { ...field, required: v };
                        updatePage({ formFields: updated });
                      }} />
                    </div>
                    <button onClick={() => updatePage({ formFields: pageData.formFields.filter((f) => f.id !== field.id) })} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => {
                  const newField: FormField = { id: `f${Date.now()}`, label: "New Field", type: "text", required: false, placeholder: "Enter value" };
                  updatePage({ formFields: [...pageData.formFields, newField] });
                }}>
                  <Plus className="h-3.5 w-3.5" /> Add Field
                </Button>
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
                    <span className="text-xs text-muted-foreground">rzp.io/rzp/</span>
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
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Publish Payment Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">{pageData.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-medium text-foreground">₹{pageData.amount.toLocaleString("en-IN")}</p></div>
                <div><span className="text-muted-foreground text-xs">Form Fields</span><p className="font-medium text-foreground">{pageData.formFields.length} fields</p></div>
                <div><span className="text-muted-foreground text-xs">Sections</span><p className="font-medium text-foreground">{pageData.sections.filter((s) => s.visible).length} active</p></div>
                <div><span className="text-muted-foreground text-xs">GST</span><p className="font-medium text-foreground">{pageData.gstEnabled ? "Enabled" : "Disabled"}</p></div>
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
    </div>
  );
};

// --- Page Preview Content Component ---
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

  return (
    <>
      {/* Banner */}
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

          {/* Features Section */}
          {featuresSection?.visible && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-1">{featuresSection.content.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{featuresSection.content.subtitle}</p>
              <div className="space-y-3">
                {featuresSection.content.items.map((item: string) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          {testimonialsSection?.visible && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">What Our Students Say</h3>
              <div className="space-y-4">
                {testimonialsSection.content.items.map((t: any, i: number) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <span key={j} className="text-yellow-500 text-xs">★</span>
                      ))}
                    </div>
                    <p className="text-sm text-foreground italic mb-2">"{t.text}"</p>
                    <p className="text-xs font-semibold text-muted-foreground">— {t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {faqSection?.visible && (
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqSection.content.items.map((faq: any, i: number) => (
                  <details key={i} className="group border border-border rounded-lg">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-foreground">
                      {faq.q}
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="px-4 pb-3 text-sm text-muted-foreground">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: payment form */}
        <div className={`${viewMode === "mobile" ? "w-full" : "w-full lg:w-96"} p-6`}>
          <h3 className="text-lg font-bold text-foreground mb-4">Payment Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Type</label>
              <Select value={pageData.amountType} onValueChange={(v) => onUpdatePage?.({ amountType: v as "fixed" | "custom" })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="custom">Custom Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</label>
              {pageData.amountType === "fixed" ? (
                <div className="mt-1.5 text-3xl font-bold text-foreground">₹ {pageData.amount.toLocaleString("en-IN")}</div>
              ) : (
                <Input type="number" placeholder="Enter amount" className="mt-1.5 text-lg font-bold" />
              )}
            </div>
            <div className="border-t border-border pt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</label>
              <div className="space-y-3 mt-2">
                {pageData.formFields.map((field) => (
                  <div key={field.id}>
                    <label className="text-sm text-foreground">
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <Textarea placeholder={field.placeholder} className="mt-1" rows={2} />
                    ) : (
                      <Input placeholder={field.placeholder} type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"} className="mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {pageData.gstEnabled && (
              <div className="bg-secondary/50 rounded-md p-3 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{Math.round(pageData.amount / 1.18).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between mt-1"><span>GST (18%)</span><span>₹{Math.round(pageData.amount - pageData.amount / 1.18).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between mt-1 font-semibold text-foreground border-t border-border pt-1"><span>Total</span><span>₹{pageData.amount.toLocaleString("en-IN")}</span></div>
              </div>
            )}
            <Button className="w-full mt-2">{pageData.buttonText || `Pay ₹ ${pageData.amount.toLocaleString("en-IN")}`}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPageEditor;
