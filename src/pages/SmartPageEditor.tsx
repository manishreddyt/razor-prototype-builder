import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings, Sparkles, Send,
  X, Copy, Share2, Save, Loader2, CheckCircle2, Plus, Trash2, GripVertical,
  FileText, CreditCard, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import { templates, availableSectionTypes, createDefaultSection, createCheckoutConfig, type TemplateData, type SectionData, type PageData, type CheckoutConfig, type CheckoutFormField } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import { SmartPageCheckout } from "@/components/SmartPageCheckout";

interface PageState {
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  heroCta: string;
  bannerImage: string;
  sections: SectionData[];
}

interface EditorState {
  template: TemplateData;
  /** Per-page state. Key = page name. */
  pages: Record<string, PageState>;
  activePage: string;
  checkout: CheckoutConfig | null;
}

const buildPageState = (pd: PageData | undefined, fallback: TemplateData): PageState => {
  if (pd) {
    return {
      heroTitle: pd.heroTitle,
      heroTagline: pd.heroTagline,
      heroDescription: pd.heroDescription,
      heroCta: pd.heroCta,
      bannerImage: pd.bannerImage,
      sections: pd.sections.map((s) => ({ ...s, data: { ...s.data } })),
    };
  }
  return {
    heroTitle: fallback.heroTitle,
    heroTagline: fallback.heroTagline,
    heroDescription: fallback.heroDescription,
    heroCta: fallback.heroCta,
    bannerImage: fallback.bannerImage,
    sections: fallback.sections.map((s) => ({ ...s, data: { ...s.data } })),
  };
};

const generateFromPrompt = (prompt: string, tpl: TemplateData): TemplateData => {
  // Extract a meaningful title from the prompt
  const words = prompt.split(/\s+/).slice(0, 6).join(" ");
  const title = words.charAt(0).toUpperCase() + words.slice(1);
  
  // Pick a relevant banner image based on prompt keywords
  const lower = prompt.toLowerCase();
  let bannerImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=400&fit=crop";
  if (lower.includes("yoga") || lower.includes("fitness") || lower.includes("health")) {
    bannerImage = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=400&fit=crop";
  } else if (lower.includes("coding") || lower.includes("tech") || lower.includes("programming") || lower.includes("bootcamp")) {
    bannerImage = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&h=400&fit=crop";
  } else if (lower.includes("marketing") || lower.includes("business")) {
    bannerImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=400&fit=crop";
  } else if (lower.includes("coaching") || lower.includes("mentor") || lower.includes("consult")) {
    bannerImage = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=400&fit=crop";
  } else if (lower.includes("music") || lower.includes("art") || lower.includes("creative")) {
    bannerImage = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&h=400&fit=crop";
  } else if (lower.includes("cook") || lower.includes("food") || lower.includes("chef")) {
    bannerImage = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&h=400&fit=crop";
  } else if (lower.includes("study") || lower.includes("education") || lower.includes("learn")) {
    bannerImage = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&h=400&fit=crop";
  }

  // Generate a tagline from the prompt
  const tagline = prompt.length > 60 ? prompt.slice(0, 60) + "..." : prompt;

  return {
    ...tpl,
    heroTitle: title,
    heroTagline: tagline,
    heroDescription: `${prompt}. Join thousands of students who have transformed their careers with our expert-led programs.`,
    heroCta: lower.includes("free") ? "Get Started Free" : lower.includes("coaching") || lower.includes("1:1") ? "Book a Session" : "Enroll Now",
    bannerImage,
  };
};

const buildInitialState = (searchParams: URLSearchParams): EditorState => {
  const templateId = searchParams.get("template") || "";
  const prompt = searchParams.get("prompt") || "";
  const title = searchParams.get("title") || "My Smart Page";

  const found = templates.find((t) => t.id === templateId);
  const tpl = found || templates[0];
  const base = found ? { ...tpl } : prompt ? generateFromPrompt(prompt, tpl) : {
    ...tpl,
    heroTitle: title,
    heroTagline: "Welcome to our website",
    heroDescription: "A professional website built with Smart Pages.",
  };

  // Build per-page state
  const pages: Record<string, PageState> = {};
  const pageNames = base.pages;
  const homePage = pageNames[0] || "Home";

  // Home page uses top-level hero/sections
  pages[homePage] = {
    heroTitle: base.heroTitle,
    heroTagline: base.heroTagline,
    heroDescription: base.heroDescription,
    heroCta: base.heroCta,
    bannerImage: base.bannerImage,
    sections: base.sections.map((s) => ({ ...s, data: { ...s.data } })),
  };

  // Other pages from pagesData
  for (const pageName of pageNames) {
    if (pageName === homePage) continue;
    const pd = base.pagesData?.[pageName];
    pages[pageName] = buildPageState(pd, base);
  }

  return { template: base, pages, activePage: homePage, checkout: base.checkout || null };
};

interface ChatMsg {
  role: "assistant" | "user";
  content: string;
}

const suggestedActions = [
  "Change the banner image",
  "Update the headline and tagline",
  "Add a Google Reviews section",
  "Toggle the testimonials section",
  "Add a pricing section",
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
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [settingsTab, setSettingsTab] = useState("page");

  const [state, setState] = useState<EditorState>(() => buildInitialState(searchParams));
  const [slug, setSlug] = useState(() => (searchParams.get("title") || "my-page").toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: `I've set up "${state.template.heroTitle}" for you. Ask me to change anything — content, sections, images, and more.` },
  ]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Current page helpers
  const activePage = state.activePage;
  const isCheckoutPage = activePage === "__checkout__";
  const currentPage = isCheckoutPage ? state.pages[state.template.pages[0]] : state.pages[activePage];
  const pageNames = state.template.pages;
  const hasCheckout = !!state.checkout?.enabled;

  const setActivePage = (pageName: string) => {
    setState((prev) => ({ ...prev, activePage: pageName }));
  };

  const updateCheckout = (updates: Partial<CheckoutConfig>) => {
    setState((prev) => ({
      ...prev,
      checkout: prev.checkout ? { ...prev.checkout, ...updates } : null,
    }));
    setUnsavedChanges(true);
  };

  const updateCheckoutField = (fieldId: string, updates: Partial<CheckoutFormField>) => {
    if (!state.checkout) return;
    updateCheckout({
      formFields: state.checkout.formFields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const addCheckoutField = () => {
    if (!state.checkout) return;
    const newField: CheckoutFormField = {
      id: `f_${Date.now()}`, label: "New Field", type: "text", required: false, placeholder: "Enter value",
    };
    updateCheckout({ formFields: [...state.checkout.formFields, newField] });
  };

  const removeCheckoutField = (fieldId: string) => {
    if (!state.checkout) return;
    updateCheckout({ formFields: state.checkout.formFields.filter((f) => f.id !== fieldId) });
  };

  // Build a virtual TemplateData for the current page to pass to SitePreview
  const currentTemplate: TemplateData = {
    ...state.template,
    heroTitle: currentPage.heroTitle,
    heroTagline: currentPage.heroTagline,
    heroDescription: currentPage.heroDescription,
    heroCta: currentPage.heroCta,
    bannerImage: currentPage.bannerImage,
  };

  const updatePageHero = (updates: Partial<Pick<TemplateData, "heroTitle" | "heroTagline" | "heroDescription" | "heroCta" | "bannerImage">>) => {
    setState((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [prev.activePage]: { ...prev.pages[prev.activePage], ...updates },
      },
    }));
    setUnsavedChanges(true);
  };

  const updatePageSections = (sections: SectionData[]) => {
    setState((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [prev.activePage]: { ...prev.pages[prev.activePage], sections },
      },
    }));
    setUnsavedChanges(true);
  };

  const toggleSection = (id: string) => {
    updatePageSections(currentPage.sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const removeSection = (id: string) => {
    updatePageSections(currentPage.sections.filter((s) => s.id !== id));
  };

  const addSection = (type: string) => {
    const newSection = createDefaultSection(type as any);
    updatePageSections([...currentPage.sections, newSection]);
    setAddSectionOpen(false);
    toast.success(`${newSection.label} section added`);
  };

  const moveSection = (index: number, dir: "up" | "down") => {
    const arr = [...currentPage.sections];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    updatePageSections(arr);
  };

  const updateSectionData = (id: string, data: Record<string, any>) => {
    updatePageSections(currentPage.sections.map((s) => s.id === id ? { ...s, data: { ...s.data, ...data } } : s));
  };

  // Add a new page
  const addPage = (name: string) => {
    if (state.pages[name]) return;
    setState((prev) => ({
      ...prev,
      template: { ...prev.template, pages: [...prev.template.pages, name] },
      pages: {
        ...prev.pages,
        [name]: {
          heroTitle: name,
          heroTagline: `Welcome to ${name}`,
          heroDescription: `Content for the ${name} page.`,
          heroCta: "Learn More",
          bannerImage: prev.pages[prev.activePage].bannerImage,
          sections: [createDefaultSection("about")],
        },
      },
      activePage: name,
    }));
    setUnsavedChanges(true);
    toast.success(`"${name}" page added`);
  };

  const removePage = (name: string) => {
    if (pageNames.length <= 1) return;
    if (name === pageNames[0]) { toast.error("Can't remove the home page"); return; }
    setState((prev) => {
      const newPages = { ...prev.pages };
      delete newPages[name];
      return {
        ...prev,
        template: { ...prev.template, pages: prev.template.pages.filter((p) => p !== name) },
        pages: newPages,
        activePage: prev.activePage === name ? prev.template.pages[0] : prev.activePage,
      };
    });
    setUnsavedChanges(true);
    toast.success(`"${name}" page removed`);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");

    setTimeout(() => {
      let response = "";
      const lower = text.toLowerCase();
      if (lower.includes("testimonial") || lower.includes("review")) {
        const ts = currentPage.sections.find((s) => s.type === "testimonials");
        if (ts) { toggleSection(ts.id); response = `Testimonials section is now ${ts.visible ? "hidden" : "visible"}.`; }
        else { addSection("testimonials"); response = "Added a testimonials section!"; }
      } else if (lower.includes("google review")) {
        const gr = currentPage.sections.find((s) => s.type === "google-reviews");
        if (gr) { toggleSection(gr.id); response = `Google Reviews section is now ${gr.visible ? "hidden" : "visible"}.`; }
        else { addSection("google-reviews"); response = "Added Google Reviews section!"; }
      } else if (lower.includes("faq")) {
        const faq = currentPage.sections.find((s) => s.type === "faq");
        if (faq) { toggleSection(faq.id); response = `FAQ section is now ${faq.visible ? "hidden" : "visible"}.`; }
        else { addSection("faq"); response = "Added an FAQ section!"; }
      } else if (lower.includes("pricing")) {
        const p = currentPage.sections.find((s) => s.type === "pricing");
        if (p) { toggleSection(p.id); response = `Pricing section is now ${p.visible ? "hidden" : "visible"}.`; }
        else { addSection("pricing"); response = "Added a pricing section!"; }
      } else if (lower.includes("banner") || lower.includes("image")) {
        updatePageHero({ bannerImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&h=300&fit=crop" });
        response = "Banner image updated!";
      } else if (lower.includes("title") || lower.includes("headline")) {
        updatePageHero({ heroTitle: "Premium " + currentPage.heroTitle });
        response = `Title updated. You can also edit directly in the preview.`;
      } else {
        response = `Noted! I'll apply "${text}" to your page. Use Settings for detailed edits.`;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 500);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setStatus("published");
      setPublishDialogOpen(false);
      setUnsavedChanges(false);

      const homePage = state.pages[pageNames[0]];
      const newSite: SmartPageSite = {
        id: `sp_${Date.now()}`,
        name: homePage.heroTitle,
        type: state.template.title,
        category: state.template.category,
        slug,
        templateId: state.template.id,
        url: `/s/${slug}`,
        created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        views: 0, conversions: 0, status: "Published",
        amount: state.checkout?.amount || 0,
        transactions: 0,
      };
      addSite(newSite);
      toast.success("Website published!");
      setTimeout(() => navigate("/website-builder"), 1200);
    }, 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`);
    toast.success("Link copied!");
  };

  // ─── Full Preview Mode ───
  if (previewMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Exit Preview</Button>
            <span className="text-sm text-muted-foreground">Preview as visitors see it</span>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <Button size="sm" onClick={() => { setPreviewMode(false); setPublishDialogOpen(true); }}>Publish</Button>
          </div>
        </div>
        <ScrollArea className="flex-1 bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-lg border border-border overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            <SitePreview
              template={currentTemplate}
              sections={currentPage.sections}
              activePage={activePage}
              onPageChange={setActivePage}
            />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          <input type="text" value={currentPage.heroTitle} onChange={(e) => updatePageHero({ heroTitle: e.target.value })} className="font-semibold text-foreground text-sm bg-transparent border-none focus:outline-none hover:bg-secondary/50 rounded px-2 py-1" />
          {unsavedChanges && <span className="w-2 h-2 rounded-full bg-orange-400" />}
          <span className={status === "published" ? "blade-badge-paid text-[10px]" : "blade-badge-expired text-[10px]"}>{status === "published" ? "Published" : "Draft"}</span>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => { setUnsavedChanges(false); toast.success("Draft saved"); }}><Save className="h-3.5 w-3.5" /> Save</Button>}
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewMode(true)}><Eye className="h-4 w-4" /> Preview</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "settings" ? null : "settings")}><Settings className="h-4 w-4" /> Settings</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShareDialogOpen(true)}><Share2 className="h-4 w-4" /> Share</Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRightPanel(rightPanel === "ai" ? null : "ai")}><Sparkles className="h-4 w-4" /> AI</Button>
        </div>
      </div>

      {/* Page Tabs Bar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border bg-muted/30 overflow-x-auto">
        {pageNames.map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activePage === page && !isCheckoutPage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <FileText className="h-3 w-3" />
            {page}
          </button>
        ))}
        {hasCheckout && (
          <button
            onClick={() => setActivePage("__checkout__")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              isCheckoutPage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <ShoppingCart className="h-3 w-3" />
            Checkout
          </button>
        )}
        <AddPageButton onAdd={addPage} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <ScrollArea className="flex-1 bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-sm border border-border overflow-hidden transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            {isCheckoutPage && state.checkout ? (
              <SmartPageCheckout
                template={currentTemplate}
                checkout={state.checkout}
                viewMode={viewMode}
                editable
                onUpdateCheckout={updateCheckout}
              />
            ) : (
              <SitePreview
                template={currentTemplate}
                sections={currentPage.sections}
                editable
                activePage={activePage}
                onPageChange={setActivePage}
                onUpdateHero={(updates) => updatePageHero(updates)}
                onUpdateSection={(id, data) => updateSectionData(id, data)}
                onRemoveSection={removeSection}
                onMoveSection={moveSection}
                onAddSection={addSection}
              />
            )}
          </div>
        </ScrollArea>

        {/* AI Panel */}
        {rightPanel === "ai" && (
          <div className="w-80 border-l border-border flex flex-col bg-background">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-semibold text-foreground">AI Builder</span></div>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={msg.role === "user" ? "ml-8" : "mr-4"}>
                    <div className={`text-sm p-3 rounded-lg ${msg.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>{msg.content}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <div className="px-4 pb-2 space-y-1.5">
              {suggestedActions.slice(0, 3).map((action) => (
                <button key={action} onClick={() => sendMessage(action)} className="w-full text-left text-xs px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">{action}</button>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)} placeholder="Ask AI to edit your site..." className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none" />
                <button onClick={() => sendMessage(chatInput)} className="text-primary hover:text-primary/80 p-1"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {rightPanel === "settings" && (
          <div className="w-96 border-l border-border flex flex-col bg-background">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Site Settings</span>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <Tabs value={settingsTab} onValueChange={setSettingsTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
                <TabsTrigger value="page" className="text-xs">Page</TabsTrigger>
                <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
                {hasCheckout && <TabsTrigger value="checkout" className="text-xs">Checkout</TabsTrigger>}
                <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="page" className="p-4 space-y-4">
                  <div className="text-xs text-muted-foreground mb-2">Editing: <span className="font-semibold text-foreground">{activePage}</span></div>
                  <div><label className="text-xs font-medium text-foreground">Page Title</label><Input value={currentPage.heroTitle} onChange={(e) => updatePageHero({ heroTitle: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Tagline</label><Input value={currentPage.heroTagline} onChange={(e) => updatePageHero({ heroTagline: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Description</label><Textarea value={currentPage.heroDescription} onChange={(e) => updatePageHero({ heroDescription: e.target.value })} rows={3} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Banner Image URL</label><Input value={currentPage.bannerImage} onChange={(e) => updatePageHero({ bannerImage: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">CTA Button Text</label><Input value={currentPage.heroCta} onChange={(e) => updatePageHero({ heroCta: e.target.value })} className="mt-1.5" /></div>
                </TabsContent>

                <TabsContent value="pages" className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">Manage the pages in your website. Click a page to edit it.</p>
                  {pageNames.map((page, i) => (
                    <div
                      key={page}
                      onClick={() => setActivePage(page)}
                      className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors ${
                        activePage === page ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground flex-1">{page}</span>
                      {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Home</span>}
                      {i > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); removePage(page); }} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <AddPageButton onAdd={addPage} fullWidth />
                </TabsContent>

                <TabsContent value="sections" className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-1">Sections for: <span className="font-semibold text-foreground">{activePage}</span></p>
                  <p className="text-xs text-muted-foreground mb-3">Toggle, reorder, or remove sections. Click + to add new ones.</p>
                  {currentPage.sections.map((section, i) => (
                    <div key={section.id} className={`flex items-center gap-2 p-2.5 rounded-md border transition-colors ${section.visible ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"}`}>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"><GripVertical className="h-3 w-3 rotate-180" /></button>
                        <button onClick={() => moveSection(i, "down")} disabled={i === currentPage.sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"><GripVertical className="h-3 w-3" /></button>
                      </div>
                      <span className="text-sm text-foreground flex-1">{section.label}</span>
                      <Switch checked={section.visible} onCheckedChange={() => toggleSection(section.id)} />
                      <button onClick={() => removeSection(section.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full gap-1.5 mt-3" onClick={() => setAddSectionOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add Section
                  </Button>
                </TabsContent>

                {hasCheckout && state.checkout && (
                  <TabsContent value="checkout" className="p-4 space-y-4">
                    <p className="text-xs text-muted-foreground mb-2">Configure the checkout page for your product/service.</p>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Payment</h4>
                      <div>
                        <label className="text-xs font-medium text-foreground">Amount Type</label>
                        <Select value={state.checkout.amountType} onValueChange={(v) => updateCheckout({ amountType: v as "fixed" | "custom" })}>
                          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="custom">Customer Enters Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Amount (₹)</label>
                        <Input type="number" value={state.checkout.amount} onChange={(e) => updateCheckout({ amount: Number(e.target.value) })} className="mt-1.5" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Button Text</label>
                        <Input value={state.checkout.buttonText} onChange={(e) => updateCheckout({ buttonText: e.target.value })} className="mt-1.5" />
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Send receipt</span>
                          <Switch checked={state.checkout.sendReceipt} onCheckedChange={(v) => updateCheckout({ sendReceipt: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Enable GST</span>
                          <Switch checked={state.checkout.gstEnabled} onCheckedChange={(v) => updateCheckout({ gstEnabled: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Collect Address</span>
                          <Switch checked={state.checkout.collectAddress} onCheckedChange={(v) => updateCheckout({ collectAddress: v })} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Form Fields</h4>
                      <p className="text-xs text-muted-foreground">Customize what information you collect.</p>
                      {state.checkout.formFields.map((field) => (
                        <div key={field.id} className="flex items-center gap-2 p-2.5 rounded-md border border-border bg-secondary/30">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <Input value={field.label} onChange={(e) => updateCheckoutField(field.id, { label: e.target.value })} className="h-7 text-xs" />
                          </div>
                          <Select value={field.type} onValueChange={(v) => updateCheckoutField(field.id, { type: v as CheckoutFormField["type"] })}>
                            <SelectTrigger className="w-20 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">Req</span>
                            <Switch checked={field.required} onCheckedChange={(v) => updateCheckoutField(field.id, { required: v })} />
                          </div>
                          <button onClick={() => removeCheckoutField(field.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={addCheckoutField}>
                        <Plus className="h-3.5 w-3.5" /> Add Field
                      </Button>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Product Highlights</h4>
                      <p className="text-xs text-muted-foreground">Shown on the left side of checkout.</p>
                      {state.checkout.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input value={h} onChange={(e) => { const u = [...state.checkout!.highlights]; u[i] = e.target.value; updateCheckout({ highlights: u }); }} className="flex-1 h-7 text-xs" />
                          <button onClick={() => updateCheckout({ highlights: state.checkout!.highlights.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => updateCheckout({ highlights: [...state.checkout!.highlights, "New highlight"] })}>
                        <Plus className="h-3.5 w-3.5" /> Add Highlight
                      </Button>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Post-Payment</h4>
                      <div><label className="text-xs font-medium text-foreground">Success Message</label><Textarea value={state.checkout.successMessage} onChange={(e) => updateCheckout({ successMessage: e.target.value })} rows={2} className="mt-1.5" /></div>
                      <div><label className="text-xs font-medium text-foreground">Redirect URL</label><Input value={state.checkout.redirectUrl} onChange={(e) => updateCheckout({ redirectUrl: e.target.value })} placeholder="https://..." className="mt-1.5" /></div>
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="seo" className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground">URL Slug</label>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-xs text-muted-foreground">/s/</span>
                      <Input value={slug} onChange={(e) => { setSlug(e.target.value); setUnsavedChanges(true); }} className="flex-1" />
                    </div>
                  </div>
                  <div><label className="text-xs font-medium text-foreground">Meta Title</label><Input value={currentPage.heroTitle} onChange={(e) => updatePageHero({ heroTitle: e.target.value })} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{currentPage.heroTitle.length}/60</p></div>
                  <div><label className="text-xs font-medium text-foreground">Meta Description</label><Textarea value={currentPage.heroDescription} onChange={(e) => updatePageHero({ heroDescription: e.target.value })} rows={2} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{currentPage.heroDescription.length}/160</p></div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>

      {/* Add Section Dialog */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader><DialogTitle>Add Section</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-2 pr-4">
              {availableSectionTypes.map((st) => (
                <button
                  key={st.type}
                  onClick={() => addSection(st.type)}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{st.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{st.description}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Publish Website</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">{state.pages[pageNames[0]]?.heroTitle}</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Pages</span><p className="font-medium text-foreground">{pageNames.length}</p></div>
                <div><span className="text-muted-foreground text-xs">Sections</span><p className="font-medium text-foreground">{currentPage.sections.filter((s) => s.visible).length}</p></div>
                <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium text-foreground">{state.template.title}</p></div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Site URL</label>
              <div className="flex items-center gap-2 mt-1.5">
              <Input value={`${window.location.origin}/s/${slug}`} readOnly className="flex-1 text-xs" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> SSL-secured</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Mobile responsive</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> SEO optimized</div>
              <div className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> {pageNames.length} pages</div>
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
              <span className="text-sm text-muted-foreground truncate mr-2">/s/{slug}</span>
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

// ─── Add Page Button ───
const AddPageButton = ({ onAdd, fullWidth = false }: { onAdd: (name: string) => void; fullWidth?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${fullWidth ? "w-full justify-center border border-dashed border-border mt-2" : ""}`}
      >
        <Plus className="h-3 w-3" /> Add Page
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${fullWidth ? "mt-2" : ""}`}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Page name..."
        className="h-7 text-xs w-32"
        autoFocus
      />
      <Button size="sm" className="h-7 px-2 text-xs" onClick={handleAdd}>Add</Button>
      <Button size="sm" variant="ghost" className="h-7 px-1.5" onClick={() => { setOpen(false); setName(""); }}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const ViewToggle = ({ viewMode, setViewMode }: { viewMode: string; setViewMode: (v: "desktop" | "mobile") => void }) => (
  <div className="flex items-center border border-border rounded-md overflow-hidden">
    <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Monitor className="h-4 w-4" /></button>
    <button onClick={() => setViewMode("mobile")} className={`p-2 ${viewMode === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Smartphone className="h-4 w-4" /></button>
  </div>
);

export default SmartPageEditor;
