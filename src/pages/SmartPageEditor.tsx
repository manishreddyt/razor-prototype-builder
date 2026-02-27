import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings, Sparkles, Send,
  X, Copy, Share2, Save, Loader2, CheckCircle2, Plus, Trash2, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import { templates, availableSectionTypes, createDefaultSection, type TemplateData, type SectionData } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";

interface EditorState {
  template: TemplateData;
  sections: SectionData[];
}

const buildInitialState = (searchParams: URLSearchParams): EditorState => {
  const templateId = searchParams.get("template") || "";
  const prompt = searchParams.get("prompt") || "";
  const title = searchParams.get("title") || "My Smart Page";

  const found = templates.find((t) => t.id === templateId);

  if (found) {
    return {
      template: { ...found },
      sections: found.sections.map((s) => ({ ...s, data: { ...s.data } })),
    };
  }

  // AI-generated fallback
  const fallback = templates[0];
  return {
    template: {
      ...fallback,
      heroTitle: prompt ? "AI Generated Site" : title,
      heroTagline: prompt || "Welcome to our website",
      heroDescription: prompt || "A professional website built with Smart Pages.",
    },
    sections: fallback.sections.map((s) => ({ ...s, data: { ...s.data } })),
  };
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

  const updateTemplate = (updates: Partial<TemplateData>) => {
    setState((prev) => ({ ...prev, template: { ...prev.template, ...updates } }));
    setUnsavedChanges(true);
  };

  const updateSections = (sections: SectionData[]) => {
    setState((prev) => ({ ...prev, sections }));
    setUnsavedChanges(true);
  };

  const toggleSection = (id: string) => {
    updateSections(state.sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const removeSection = (id: string) => {
    updateSections(state.sections.filter((s) => s.id !== id));
  };

  const addSection = (type: string) => {
    const newSection = createDefaultSection(type as any);
    updateSections([...state.sections, newSection]);
    setAddSectionOpen(false);
    toast.success(`${newSection.label} section added`);
  };

  const moveSection = (index: number, dir: "up" | "down") => {
    const arr = [...state.sections];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    updateSections(arr);
  };

  const updateSectionData = (id: string, data: Record<string, any>) => {
    updateSections(state.sections.map((s) => s.id === id ? { ...s, data: { ...s.data, ...data } } : s));
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");

    setTimeout(() => {
      let response = "";
      const lower = text.toLowerCase();
      if (lower.includes("testimonial") || lower.includes("review")) {
        const ts = state.sections.find((s) => s.type === "testimonials");
        if (ts) { toggleSection(ts.id); response = `Testimonials section is now ${ts.visible ? "hidden" : "visible"}.`; }
        else { addSection("testimonials"); response = "Added a testimonials section!"; }
      } else if (lower.includes("google review")) {
        const gr = state.sections.find((s) => s.type === "google-reviews");
        if (gr) { toggleSection(gr.id); response = `Google Reviews section is now ${gr.visible ? "hidden" : "visible"}.`; }
        else { addSection("google-reviews"); response = "Added Google Reviews section!"; }
      } else if (lower.includes("faq")) {
        const faq = state.sections.find((s) => s.type === "faq");
        if (faq) { toggleSection(faq.id); response = `FAQ section is now ${faq.visible ? "hidden" : "visible"}.`; }
        else { addSection("faq"); response = "Added an FAQ section!"; }
      } else if (lower.includes("pricing")) {
        const p = state.sections.find((s) => s.type === "pricing");
        if (p) { toggleSection(p.id); response = `Pricing section is now ${p.visible ? "hidden" : "visible"}.`; }
        else { addSection("pricing"); response = "Added a pricing section!"; }
      } else if (lower.includes("banner") || lower.includes("image")) {
        updateTemplate({ bannerImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&h=300&fit=crop" });
        response = "Banner image updated!";
      } else if (lower.includes("title") || lower.includes("headline")) {
        updateTemplate({ heroTitle: "Premium " + state.template.heroTitle });
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

      const newSite: SmartPageSite = {
        id: `sp_${Date.now()}`,
        name: state.template.heroTitle,
        type: state.template.title,
        category: state.template.category,
        url: `https://rzp.io/s/${slug}`,
        created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        views: 0, conversions: 0, status: "Published",
      };
      addSite(newSite);
      toast.success("Website published!");
      setTimeout(() => navigate("/website-builder"), 1200);
    }, 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://rzp.io/s/${slug}`);
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
            <SitePreview template={state.template} sections={state.sections} />
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
          <input type="text" value={state.template.heroTitle} onChange={(e) => updateTemplate({ heroTitle: e.target.value })} className="font-semibold text-foreground text-sm bg-transparent border-none focus:outline-none hover:bg-secondary/50 rounded px-2 py-1" />
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

      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <ScrollArea className="flex-1 bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-sm border border-border overflow-hidden transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            <SitePreview
              template={state.template}
              sections={state.sections}
              editable
              onUpdateHero={(updates) => updateTemplate(updates)}
              onUpdateSection={(id, data) => updateSectionData(id, data)}
              onRemoveSection={removeSection}
              onMoveSection={moveSection}
              onAddSection={addSection}
            />
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
                <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="page" className="p-4 space-y-4">
                  <div><label className="text-xs font-medium text-foreground">Site Title</label><Input value={state.template.heroTitle} onChange={(e) => updateTemplate({ heroTitle: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Tagline</label><Input value={state.template.heroTagline} onChange={(e) => updateTemplate({ heroTagline: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Description</label><Textarea value={state.template.heroDescription} onChange={(e) => updateTemplate({ heroDescription: e.target.value })} rows={3} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">Banner Image URL</label><Input value={state.template.bannerImage} onChange={(e) => updateTemplate({ bannerImage: e.target.value })} className="mt-1.5" /></div>
                  <div><label className="text-xs font-medium text-foreground">CTA Button Text</label><Input value={state.template.heroCta} onChange={(e) => updateTemplate({ heroCta: e.target.value })} className="mt-1.5" /></div>
                </TabsContent>

                <TabsContent value="sections" className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">Toggle, reorder, or remove sections. Click + to add new ones.</p>
                  {state.sections.map((section, i) => (
                    <div key={section.id} className={`flex items-center gap-2 p-2.5 rounded-md border transition-colors ${section.visible ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"}`}>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"><GripVertical className="h-3 w-3 rotate-180" /></button>
                        <button onClick={() => moveSection(i, "down")} disabled={i === state.sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"><GripVertical className="h-3 w-3" /></button>
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

                <TabsContent value="seo" className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground">URL Slug</label>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-xs text-muted-foreground">rzp.io/s/</span>
                      <Input value={slug} onChange={(e) => { setSlug(e.target.value); setUnsavedChanges(true); }} className="flex-1" />
                    </div>
                  </div>
                  <div><label className="text-xs font-medium text-foreground">Meta Title</label><Input value={state.template.heroTitle} onChange={(e) => updateTemplate({ heroTitle: e.target.value })} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{state.template.heroTitle.length}/60</p></div>
                  <div><label className="text-xs font-medium text-foreground">Meta Description</label><Textarea value={state.template.heroDescription} onChange={(e) => updateTemplate({ heroDescription: e.target.value })} rows={2} className="mt-1.5" /><p className="text-[10px] text-muted-foreground mt-1">{state.template.heroDescription.length}/160</p></div>
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
              <h3 className="font-semibold text-foreground text-sm mb-2">{state.template.heroTitle}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Sections</span><p className="font-medium text-foreground">{state.sections.filter((s) => s.visible).length} visible</p></div>
                <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium text-foreground">{state.template.title}</p></div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Site URL</label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input value={`https://rzp.io/s/${slug}`} readOnly className="flex-1 text-xs" />
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
              <span className="text-sm text-muted-foreground truncate mr-2">https://rzp.io/s/{slug}</span>
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

const ViewToggle = ({ viewMode, setViewMode }: { viewMode: string; setViewMode: (v: "desktop" | "mobile") => void }) => (
  <div className="flex items-center border border-border rounded-md overflow-hidden">
    <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Monitor className="h-4 w-4" /></button>
    <button onClick={() => setViewMode("mobile")} className={`p-2 ${viewMode === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Smartphone className="h-4 w-4" /></button>
  </div>
);

export default SmartPageEditor;
