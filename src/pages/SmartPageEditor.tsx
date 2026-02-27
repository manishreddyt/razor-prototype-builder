import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings, Sparkles, Send,
  X, Copy, Share2, Save, Loader2, CheckCircle2, Globe, Plus, Trash2, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";

interface SitePageData {
  title: string;
  tagline: string;
  description: string;
  bannerImage: string;
  logoInitial: string;
  ctaText: string;
  ctaLink: string;
  pages: SitePage[];
  showTestimonials: boolean;
  showFaq: boolean;
  showPricing: boolean;
  testimonials: { name: string; text: string; rating: number }[];
  faqs: { q: string; a: string }[];
  pricingTiers: { name: string; price: string; features: string[] }[];
  status: "draft" | "published";
  slug: string;
  templateType: string;
}

interface SitePage {
  id: string;
  name: string;
  visible: boolean;
}

interface ChatMsg {
  role: "assistant" | "user";
  content: string;
}

const buildInitialData = (searchParams: URLSearchParams): SitePageData => {
  const title = searchParams.get("title") || "My Smart Page";
  const templateId = searchParams.get("template") || "";
  const prompt = searchParams.get("prompt") || "";

  const templatePages: Record<string, string[]> = {
    "multi-course": ["Home", "Courses", "Course Detail", "Enroll", "About"],
    "single-course": ["Home", "Curriculum", "Pricing", "Enroll", "FAQ"],
    "webinar": ["Home", "Agenda", "Register"],
    "coaching": ["Home", "Services", "Book Session", "Testimonials", "Contact"],
    "workshop": ["Home", "Workshops", "Schedule", "Enroll"],
    "membership": ["Home", "Plans", "Content", "Join"],
    "portfolio": ["Home", "About", "Portfolio", "Contact"],
    "business": ["Home", "About", "Services", "Team", "Contact"],
    "biolink": ["Link Page"],
    "event": ["Home", "Schedule", "Speakers", "Register"],
    "consulting": ["Home", "Services", "Case Studies", "Book", "Contact"],
    "freelancer": ["Home", "Work", "Testimonials", "Hire Me"],
    "agency": ["Home", "Work", "Team", "Clients", "Contact"],
    "ngo": ["Home", "Our Cause", "Impact", "Donate", "Volunteer"],
    "fundraiser": ["Campaign Page"],
    "store": ["Home", "Products", "Product Detail", "Cart", "Checkout"],
    "digital": ["Home", "Products", "Download", "About"],
  };

  const pageNames = templatePages[templateId] || ["Home", "About", "Contact"];
  const pages: SitePage[] = pageNames.map((name, i) => ({ id: `p${i}`, name, visible: true }));

  return {
    title: prompt ? "AI Generated Site" : title,
    tagline: prompt || "Welcome to our website",
    description: prompt || "A professional website built with Smart Pages.",
    bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=300&fit=crop",
    logoInitial: title.charAt(0).toUpperCase(),
    ctaText: "Get Started",
    ctaLink: "#",
    pages,
    showTestimonials: true,
    showFaq: true,
    showPricing: ["single-course", "multi-course", "coaching", "membership", "workshop"].includes(templateId),
    testimonials: [
      { name: "Priya S.", text: "Amazing experience! Highly recommended.", rating: 5 },
      { name: "Rahul M.", text: "Professional and well-organized.", rating: 5 },
      { name: "Ananya G.", text: "Worth every penny. Will come back!", rating: 4 },
    ],
    faqs: [
      { q: "How do I get started?", a: "Simply click the Get Started button and follow the steps." },
      { q: "Is there a refund policy?", a: "Yes, we offer a full refund within 7 days." },
      { q: "Do you offer support?", a: "Yes, 24/7 support via email and chat." },
    ],
    pricingTiers: [
      { name: "Basic", price: "₹999", features: ["Access to content", "Email support", "1 month access"] },
      { name: "Pro", price: "₹2,999", features: ["Everything in Basic", "1:1 mentorship", "Certificate", "Lifetime access"] },
      { name: "Premium", price: "₹4,999", features: ["Everything in Pro", "Priority support", "Community access", "Bonus materials"] },
    ],
    status: "draft",
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
    templateType: searchParams.get("type") || title,
  };
};

const suggestedActions = [
  "Change the banner image to something more vibrant",
  "Update the headline and tagline",
  "Add a pricing section with 3 tiers",
  "Toggle the testimonials section",
  "Change the CTA button text",
];

const SmartPageEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [rightPanel, setRightPanel] = useState<"ai" | "settings" | null>("ai");
  const [previewMode, setPreviewMode] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [settingsTab, setSettingsTab] = useState("page");

  const [pageData, setPageData] = useState<SitePageData>(() => buildInitialData(searchParams));
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: `Hi! I'm your Smart Pages AI builder. I've set up a "${pageData.templateType}" website for you. Ask me to change anything — title, colors, sections, pricing, content, and more.` },
  ]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const updatePage = (updates: Partial<SitePageData>) => {
    setPageData((prev) => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");

    setTimeout(() => {
      let response = "";
      const lower = text.toLowerCase();
      if (lower.includes("testimonial") || lower.includes("review")) {
        updatePage({ showTestimonials: !pageData.showTestimonials });
        response = `Testimonials section is now ${!pageData.showTestimonials ? "visible" : "hidden"}.`;
      } else if (lower.includes("faq")) {
        updatePage({ showFaq: !pageData.showFaq });
        response = `FAQ section is now ${!pageData.showFaq ? "visible" : "hidden"}.`;
      } else if (lower.includes("pricing")) {
        updatePage({ showPricing: !pageData.showPricing });
        response = `Pricing section is now ${!pageData.showPricing ? "visible" : "hidden"}.`;
      } else if (lower.includes("banner") || lower.includes("image")) {
        updatePage({ bannerImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&h=300&fit=crop" });
        response = "Banner image updated! Want me to try another style?";
      } else if (lower.includes("title") || lower.includes("headline")) {
        updatePage({ title: "Premium " + pageData.templateType });
        response = `Title updated to "Premium ${pageData.templateType}". You can also click the title in the preview to edit directly.`;
      } else if (lower.includes("cta") || lower.includes("button")) {
        updatePage({ ctaText: "Enroll Now" });
        response = "CTA button updated to 'Enroll Now'.";
      } else {
        response = `Noted! I'll apply "${text}" to your page. You can also use the Settings panel for detailed edits.`;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 600);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      updatePage({ status: "published" });
      setPublishDialogOpen(false);
      setUnsavedChanges(false);

      const newSite: SmartPageSite = {
        id: `sp_${Date.now()}`,
        name: pageData.title,
        type: pageData.templateType,
        category: searchParams.get("template") || "general",
        url: `https://rzp.io/s/${pageData.slug}`,
        created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        views: 0,
        conversions: 0,
        status: "Published",
      };
      addSite(newSite);
      toast.success("Website published! Redirecting to list...");
      setTimeout(() => navigate("/website-builder"), 1500);
    }, 2000);
  };

  const handleSave = () => {
    setUnsavedChanges(false);
    toast.success("Draft saved");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://rzp.io/s/${pageData.slug}`);
    toast.success("Link copied!");
  };

  // Preview mode (full screen)
  if (previewMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Exit Preview
            </Button>
            <span className="text-sm text-muted-foreground">Previewing as visitors will see it</span>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <Button size="sm" onClick={() => { setPreviewMode(false); setPublishDialogOpen(true); }}>Publish</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-lg border border-border overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            <SitePreview data={pageData} />
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
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <input
            type="text"
            value={pageData.title}
            onChange={(e) => updatePage({ title: e.target.value })}
            className="font-semibold text-foreground text-sm bg-transparent border-none focus:outline-none hover:bg-secondary/50 rounded px-2 py-1"
          />
          {unsavedChanges && <span className="w-2 h-2 rounded-full bg-orange-400" />}
          <span className={pageData.status === "published" ? "blade-badge-paid text-[10px]" : "blade-badge-expired text-[10px]"}>
            {pageData.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
          )}
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewMode(true)}><Eye className="h-4 w-4" /> Preview</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "settings" ? null : "settings")}><Settings className="h-4 w-4" /> Settings</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShareDialogOpen(true)}><Share2 className="h-4 w-4" /> Share</Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "ai" ? null : "ai")}><Sparkles className="h-4 w-4" /> AI</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-sm border border-border overflow-hidden transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            <SitePreview data={pageData} editable onUpdate={updatePage} />
          </div>
        </div>

        {/* AI Panel */}
        {rightPanel === "ai" && (
          <div className="w-80 border-l border-border flex flex-col bg-background">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">AI Builder</span>
              </div>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "ml-8" : "mr-4"}>
                  <div className={`text-sm p-3 rounded-lg ${msg.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                    {msg.content}
                  </div>
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
                  placeholder="Ask AI to edit your site..."
                  className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button onClick={() => sendMessage(chatInput)} className="text-primary hover:text-primary/80 p-1"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {rightPanel === "settings" && (
          <div className="w-96 border-l border-border flex flex-col bg-background overflow-y-auto">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Site Settings</span>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <Tabs value={settingsTab} onValueChange={setSettingsTab} className="flex-1">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
                <TabsTrigger value="page" className="text-xs">Page</TabsTrigger>
                <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="page" className="p-4 space-y-4">
                <div><label className="text-xs font-medium text-foreground">Site Title</label><Input value={pageData.title} onChange={(e) => updatePage({ title: e.target.value })} className="mt-1.5" /></div>
                <div><label className="text-xs font-medium text-foreground">Tagline</label><Input value={pageData.tagline} onChange={(e) => updatePage({ tagline: e.target.value })} className="mt-1.5" /></div>
                <div><label className="text-xs font-medium text-foreground">Description</label><Textarea value={pageData.description} onChange={(e) => updatePage({ description: e.target.value })} rows={3} className="mt-1.5" /></div>
                <div><label className="text-xs font-medium text-foreground">Banner Image URL</label><Input value={pageData.bannerImage} onChange={(e) => updatePage({ bannerImage: e.target.value })} className="mt-1.5" /></div>
                <div><label className="text-xs font-medium text-foreground">CTA Button Text</label><Input value={pageData.ctaText} onChange={(e) => updatePage({ ctaText: e.target.value })} className="mt-1.5" /></div>
              </TabsContent>

              <TabsContent value="pages" className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">Toggle pages on/off.</p>
                {pageData.pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{page.name}</span>
                    </div>
                    <Switch checked={page.visible} onCheckedChange={() => {
                      updatePage({ pages: pageData.pages.map((p) => p.id === page.id ? { ...p, visible: !p.visible } : p) });
                    }} />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => {
                  const newPage: SitePage = { id: `p${Date.now()}`, name: "New Page", visible: true };
                  updatePage({ pages: [...pageData.pages, newPage] });
                }}><Plus className="h-3.5 w-3.5" /> Add Page</Button>
              </TabsContent>

              <TabsContent value="sections" className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md border border-border">
                  <span className="text-sm text-foreground">Testimonials</span>
                  <Switch checked={pageData.showTestimonials} onCheckedChange={(v) => updatePage({ showTestimonials: v })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-md border border-border">
                  <span className="text-sm text-foreground">FAQ</span>
                  <Switch checked={pageData.showFaq} onCheckedChange={(v) => updatePage({ showFaq: v })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-md border border-border">
                  <span className="text-sm text-foreground">Pricing</span>
                  <Switch checked={pageData.showPricing} onCheckedChange={(v) => updatePage({ showPricing: v })} />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">URL Slug</label>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs text-muted-foreground">rzp.io/s/</span>
                    <Input value={pageData.slug} onChange={(e) => updatePage({ slug: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div><label className="text-xs font-medium text-foreground">Meta Title</label><Input value={pageData.title} onChange={(e) => updatePage({ title: e.target.value })} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{pageData.title.length}/60</p></div>
                <div><label className="text-xs font-medium text-foreground">Meta Description</label><Textarea value={pageData.description} onChange={(e) => updatePage({ description: e.target.value })} rows={2} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{pageData.description.length}/160</p></div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Publish Website</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">{pageData.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Pages</span><p className="font-medium text-foreground">{pageData.pages.filter((p) => p.visible).length} pages</p></div>
                <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium text-foreground">{pageData.templateType}</p></div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Site URL</label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input value={`https://rzp.io/s/${pageData.slug}`} readOnly className="flex-1 text-xs" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> SSL-secured</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Mobile responsive</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> SEO optimized</div>
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
          <DialogHeader><DialogTitle>Share Website</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate mr-2">https://rzp.io/s/{pageData.slug}</span>
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={copyLink}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["WhatsApp", "Email", "SMS", "Twitter"].map((ch) => (
                <Button key={ch} variant="outline" onClick={() => toast.success(`Shared via ${ch}`)}>{ch}</Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Helper Components ---
const ViewToggle = ({ viewMode, setViewMode }: { viewMode: string; setViewMode: (v: "desktop" | "mobile") => void }) => (
  <div className="flex items-center border border-border rounded-md overflow-hidden">
    <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Monitor className="h-4 w-4" /></button>
    <button onClick={() => setViewMode("mobile")} className={`p-2 ${viewMode === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Smartphone className="h-4 w-4" /></button>
  </div>
);

// --- Site Preview ---
const SitePreview = ({ data, editable, onUpdate }: { data: SitePageData; editable?: boolean; onUpdate?: (u: Partial<SitePageData>) => void }) => (
  <div>
    {/* Banner */}
    <div className="relative group">
      <img src={data.bannerImage} alt="Banner" className="w-full h-52 object-cover" />
      {editable && (
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-md">Click to change banner</span>
        </div>
      )}
    </div>

    <div className="p-6 space-y-8">
      {/* Hero */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">{data.logoInitial}</div>
        {editable ? (
          <h1 className="text-3xl font-bold text-foreground mb-2 hover:bg-secondary/50 rounded px-2 cursor-text inline-block" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate?.({ title: e.currentTarget.textContent || "" })}>{data.title}</h1>
        ) : (
          <h1 className="text-3xl font-bold text-foreground mb-2">{data.title}</h1>
        )}
        <p className="text-muted-foreground max-w-lg mx-auto">{data.tagline}</p>
        <Button className="mt-4" size="lg">{data.ctaText}</Button>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-center gap-4 border-b border-border pb-4">
        {data.pages.filter((p) => p.visible).map((p) => (
          <span key={p.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{p.name}</span>
        ))}
      </div>

      {/* Description */}
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
      </div>

      {/* Pricing */}
      {data.showPricing && (
        <div>
          <h3 className="text-lg font-semibold text-foreground text-center mb-4">Pricing</h3>
          <div className="grid grid-cols-3 gap-4">
            {data.pricingTiers.map((tier, i) => (
              <div key={i} className={`rounded-lg border p-5 text-center ${i === 1 ? "border-primary bg-primary/5" : "border-border"}`}>
                <p className="font-medium text-foreground">{tier.name}</p>
                <p className="text-2xl font-bold text-foreground my-2">{tier.price}</p>
                <ul className="text-xs text-muted-foreground space-y-1.5 mb-4">
                  {tier.features.map((f, j) => <li key={j}>✓ {f}</li>)}
                </ul>
                <Button variant={i === 1 ? "default" : "outline"} size="sm" className="w-full">Choose {tier.name}</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {data.showTestimonials && (
        <div>
          <h3 className="text-lg font-semibold text-foreground text-center mb-4">What People Say</h3>
          <div className="grid grid-cols-3 gap-4">
            {data.testimonials.map((t, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="flex gap-0.5 mb-2">{Array.from({ length: t.rating }).map((_, j) => <span key={j} className="text-yellow-500 text-xs">★</span>)}</div>
                <p className="text-sm text-muted-foreground italic mb-2">"{t.text}"</p>
                <p className="text-xs font-medium text-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {data.showFaq && (
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground text-center mb-4">FAQ</h3>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <details key={i} className="rounded-md border border-border p-4 group">
                <summary className="text-sm font-medium text-foreground cursor-pointer">{faq.q}</summary>
                <p className="text-sm text-muted-foreground mt-2">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center border-t border-border pt-6 mt-8">
        <p className="text-xs text-muted-foreground">Built with Smart Pages • Powered by Razorpay</p>
      </div>
    </div>
  </div>
);

export default SmartPageEditor;
