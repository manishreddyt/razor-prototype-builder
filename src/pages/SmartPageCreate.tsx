import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Sparkles, Search, ArrowRight, Monitor, Smartphone,
  Send, Video, BookOpen, UserCheck,
  Brain, Wand2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { categories, templates, type TemplateData } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";
import { SmartPageCheckout } from "@/components/SmartPageCheckout";

const placeholderExamples = [
  "I teach Mandarin to adults — 3 pricing tiers, free trial class, and a batch calendar",
  "12-week full-stack bootcamp with curriculum, batch dates, and an early-bird discount",
  "Monthly yoga membership with live & recorded classes, and a free 7-day trial",
  "1:1 financial planning sessions — 45 min at ₹2,500 with a booking calendar",
  "Annual photography masterclass with early-bird pricing and alumni testimonials",
  "Online Kathak dance classes for kids — monthly batches and WhatsApp enrolment",
  "SaaS product launch page with a waitlist form, feature highlights, and pricing",
  "Webinar on Instagram growth for small businesses — free registration, limited seats",
];

const TemplateThumb = ({ template }: { template: TemplateData }) => {
  // Biolink templates: keep live mobile preview
  if (template.id.startsWith("biolink")) {
    return (
      <div className="h-52 rounded-t-lg border-b border-border overflow-hidden relative bg-background">
        <div className="origin-top-left absolute left-1/2 -translate-x-1/2" style={{ width: 400, transform: "scale(0.9) translateX(-50%)", transformOrigin: "top center" }}>
          <SitePreview template={template} sections={template.sections} compact biolinkConfig={template.biolinkConfig as any} productsConfig={template.productsConfig} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>
    );
  }

  // All other templates: show bannerImage with branded overlay
  const brandName = template.heroTagline.includes("—")
    ? template.heroTagline.split("—")[0].trim()
    : template.heroTagline.split("|")[0].trim();

  return (
    <div className="h-52 rounded-t-lg overflow-hidden relative bg-muted">
      <img
        src={template.bannerImage}
        alt={template.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=416&fit=crop";
        }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {/* Brand badge top-left */}
      {brandName && (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-gray-800 px-2.5 py-1 rounded-full shadow-sm">
            {brandName}
          </span>
        </div>
      )}
      {/* Title + CTA bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <p className="text-white font-bold text-sm leading-tight line-clamp-1">{template.heroTitle}</p>
        <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{template.heroCta} →</p>
      </div>
    </div>
  );
};

const educationPageTypes = [
  { id: "course", title: "Sell an Online Course", desc: "Course landing page with curriculum, pricing & enrollment.", icon: BookOpen, directRoute: "/website-builder/editor?template=single-course&title=Online%20Course&type=Online%20Course" },
  { id: "webinar", title: "Host a Webinar", desc: "Webinar with registration, integrations & attendee tracking.", icon: Video, configRoute: "/website-builder/webinar/chat" },
  { id: "coaching", title: "Offer 1:1 Coaching", desc: "Coaching page with booking slots, packages & payments.", icon: UserCheck, directRoute: "/website-builder/editor?template=coaching&title=Coaching&type=Coaching" },
];

const analyzePrompt = (prompt: string): { type: string; label: string; route: string } => {
  const lower = prompt.toLowerCase();
  const courseKw = ["course", "curriculum", "module", "lesson", "bootcamp", "class", "training", "learn", "tutorial", "certification"];
  const webinarKw = ["webinar", "live session", "workshop", "seminar", "zoom", "meet", "broadcast", "livestream"];
  const coachingKw = ["coaching", "1:1", "one on one", "mentor", "consultation", "counseling", "session booking", "advisory"];
  const cs = courseKw.filter(k => lower.includes(k)).length;
  const ws = webinarKw.filter(k => lower.includes(k)).length;
  const cos = coachingKw.filter(k => lower.includes(k)).length;
  const max = Math.max(cs, ws, cos);

  // Route all to editor directly
  if (max === 0) return { type: "generic", label: "Website", route: `/website-builder/editor?prompt=${encodeURIComponent(prompt)}` };
  if (cs === max) return { type: "course", label: "Online Course", route: `/website-builder/editor?template=single-course&title=${encodeURIComponent(prompt)}&type=Online%20Course&aiPrompt=${encodeURIComponent(prompt)}` };
  if (ws === max) return { type: "webinar", label: "Webinar", route: `/website-builder/webinar/chat` };
  return { type: "coaching", label: "1:1 Coaching", route: `/website-builder/editor?template=coaching&title=${encodeURIComponent(prompt)}&type=Coaching&aiPrompt=${encodeURIComponent(prompt)}` };
};

const analysisSteps = [
  { icon: Brain, text: "Understanding your idea..." },
  { icon: Wand2, text: "Detecting page type..." },
  { icon: CheckCircle2, text: "" },
];

const SmartPageCreate = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("education");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewActivePage, setPreviewActivePage] = useState<string>("Home");
  const [previewView, setPreviewView] = useState<"site" | "product-detail" | "checkout">("site");
  const [previewSelectedProduct, setPreviewSelectedProduct] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [detectedType, setDetectedType] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholderExamples.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const isEducation = activeCategory === "education";

  const previewPageTemplate = (() => {
    if (!previewTemplate) return null;
    if (previewActivePage === "Home" || previewActivePage === previewTemplate.pages[0]) return previewTemplate;
    const pageData = previewTemplate.pagesData?.[previewActivePage];
    if (!pageData) return previewTemplate;
    return { ...previewTemplate, heroTitle: pageData.heroTitle, heroTagline: pageData.heroTagline, heroDescription: pageData.heroDescription || previewTemplate.heroDescription, heroCta: pageData.heroCta || previewTemplate.heroCta, sections: pageData.sections };
  })();

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleGenerate = () => {
    if (!aiPrompt.trim() || isAnalyzing) return;
    const result = analyzePrompt(aiPrompt);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setDetectedType(result.label);
    setTimeout(() => setAnalysisStep(1), 1000);
    setTimeout(() => setAnalysisStep(2), 2200);
    setTimeout(() => { setIsAnalyzing(false); navigate(result.route); }, 3400);
  };

  const handleUseTemplate = (template: TemplateData) => {
    setPreviewTemplate(null);
    // Webinar template goes to chat UI, others go to editor
    if (template.id === "webinar") {
      navigate("/website-builder/webinar/chat");
    } else {
      navigate(`/website-builder/editor?template=${encodeURIComponent(template.id)}&title=${encodeURIComponent(template.title)}&type=${encodeURIComponent(template.title)}`);
    }
  };

  const handleEducationCard = (card: typeof educationPageTypes[0]) => {
    // Course goes directly to editor, webinar/coaching go to chat UI first
    const route = ("directRoute" in card && card.directRoute) || ("configRoute" in card && card.configRoute);
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Analysis Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-[3px] border-border" />
              <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-3 w-full">
              {analysisSteps.map((step, i) => {
                const isActive = analysisStep === i;
                const isDone = analysisStep > i;
                const StepIcon = step.icon;
                const displayText = i === 2 ? `Building your ${detectedType} page...` : step.text;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${isActive ? "bg-accent border border-primary/20" : isDone ? "opacity-50" : "opacity-20"}`}>
                    <StepIcon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary animate-pulse" : isDone ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{displayText}</span>
                    {isDone && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="animate-fade-in">
          {/* Top bar */}
          <div className="px-6 py-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>

          {/* Hero Section — Razorpay clean style */}
          <div className="relative pb-10">
            {/* Subtle gradient bg */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }} />
            </div>

            <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-4">
              <h1 className="text-[28px] font-semibold text-foreground tracking-tight text-center">
                Let's start collecting payments
              </h1>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Describe what you want to collect payments for and AI will design it for you — or start with a template below.
              </p>

              {/* Prompt Input — Clean card */}
              <div className={`w-full max-w-2xl mt-8 rounded-xl border bg-card transition-all duration-200 ${isFocused ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" : "border-border shadow-sm"}`}>
                <textarea
                  className="w-full bg-transparent px-5 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                  placeholder={placeholderExamples[placeholderIdx]}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs">AI-powered</span>
                  </div>
                  <Button size="sm" className="gap-2 rounded-lg px-5" onClick={handleGenerate} disabled={!aiPrompt.trim()}>
                    Generate <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Zap icon accent */}
              <div className="mt-3 text-primary/30">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Category Tabs — Bottom anchored like reference */}
          <div className="sticky top-0 z-20 bg-background border-b border-border">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-center gap-1 py-2 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <cat.icon className="h-4 w-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-5xl mx-auto px-6 py-8">
            {isEducation && (
              <div className="space-y-8">
                {/* Templates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((t) => (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => { setPreviewTemplate(t); setPreviewActivePage("Home"); setPreviewView("site"); setPreviewSelectedProduct(-1); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPreviewTemplate(t); setPreviewActivePage("Home"); setPreviewView("site"); setPreviewSelectedProduct(-1); } }}
                      className="cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.99] select-none"
                    >
                      <TemplateThumb template={t} />
                      <div className="p-4">
                        <p className="font-medium text-foreground text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isEducation && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Templates</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((t) => (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => { setPreviewTemplate(t); setPreviewActivePage("Home"); setPreviewView("site"); setPreviewSelectedProduct(-1); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPreviewTemplate(t); setPreviewActivePage("Home"); setPreviewView("site"); setPreviewSelectedProduct(-1); } }}
                      className="cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.99] select-none"
                    >
                      <TemplateThumb template={t} />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm">{t.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize whitespace-nowrap flex-shrink-0">
                            {t.category === "nonprofit" ? "Non-Profit" : t.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No templates found.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Template Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => { setPreviewTemplate(null); setPreviewActivePage("Home"); setPreviewView("site"); setPreviewSelectedProduct(-1); }}>
          <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col [&>button]:z-50 [&>button]:bg-card [&>button]:border [&>button]:border-border [&>button]:rounded-full [&>button]:shadow-sm [&>button]:h-8 [&>button]:w-8 [&>button]:-top-3 [&>button]:-right-3">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <div>
                <h2 className="font-semibold text-foreground text-sm">{previewTemplate?.title}</h2>
                <p className="text-xs text-muted-foreground">{previewTemplate?.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 ${previewDevice === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}><Monitor className="h-4 w-4" /></button>
                  <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 ${previewDevice === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}><Smartphone className="h-4 w-4" /></button>
                </div>
                <Button size="sm" className="gap-1.5 text-xs" onClick={() => previewTemplate && handleUseTemplate(previewTemplate)}>
                  Use Template <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 bg-muted/30">
              <div className={`mx-auto bg-background ${previewDevice === "mobile" ? "max-w-sm border-x border-border" : ""}`}>
                {previewPageTemplate && (
                  <SitePreview
                    template={previewPageTemplate}
                    sections={previewPageTemplate.sections}
                    activePage={previewActivePage}
                    onPageChange={(page) => setPreviewActivePage(page)}
                    onCtaClick={() => previewTemplate && handleUseTemplate(previewTemplate)}
                    biolinkConfig={previewPageTemplate.biolinkConfig as any}
                    productsConfig={previewPageTemplate.productsConfig}
                  />
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </ScrollArea>
    </div>
  );
};

export default SmartPageCreate;
