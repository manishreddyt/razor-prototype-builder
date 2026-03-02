import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Sparkles, Search, ArrowRight, Eye, Monitor, Smartphone,
  Globe, Palette, Zap, Layout, Send,
  Video, BookOpen, UserCheck, Calendar, Users, GraduationCap,
  Loader2, Brain, Wand2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { categories, templates, type TemplateData } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";

// Floating decorative orbs
const FloatingOrb = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
);

// Suggestion chips
const promptSuggestions = [
  "Online yoga classes with 3 months, 6 months, yearly plans",
  "1:1 coaching session for new parents",
  "Study in US/Canada - Education consulting services",
  "Sell digital marketing course with video modules",
];

// Scaled-down live preview thumbnail
const TemplateThumb = ({ template }: { template: TemplateData }) => (
  <div className="h-52 rounded-t-lg border-b border-border overflow-hidden relative bg-background">
    <div
      className="origin-top-left absolute"
      style={{ width: 1200, transform: "scale(0.3)", transformOrigin: "top left" }}
    >
      <SitePreview template={template} sections={template.sections} />
    </div>
    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
  </div>
);

// Education purpose-driven cards
const educationPageTypes = [
  {
    id: "course",
    title: "Sell an Online Course",
    desc: "Create a full course landing page with curriculum, pricing tiers, and enrollment.",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600",
    route: "/website-builder/course/create",
  },
  {
    id: "webinar",
    title: "Host a Webinar",
    desc: "Set up a webinar with registration, Zoom/GMeet integration, and attendee tracking.",
    icon: Video,
    color: "bg-purple-500/10 text-purple-600",
    route: "/website-builder/webinar/create",
  },
  {
    id: "coaching",
    title: "Offer 1:1 Coaching",
    desc: "Build a coaching page with booking slots, packages, and payment collection.",
    icon: UserCheck,
    color: "bg-amber-500/10 text-amber-600",
    route: "/website-builder/coaching/create",
  },
  {
    id: "workshop",
    title: "Run a Workshop Series",
    desc: "Promote workshops with schedules, batch dates, and group enrollment.",
    icon: Calendar,
    color: "bg-emerald-500/10 text-emerald-600",
    templateId: "workshop",
  },
  {
    id: "membership",
    title: "Build a Membership Community",
    desc: "Create a membership site with recurring plans, resources, and community features.",
    icon: Users,
    color: "bg-rose-500/10 text-rose-600",
    templateId: "membership",
  },
];

// Prompt analysis: detect intent from keywords
const analyzePrompt = (prompt: string): { type: "course" | "webinar" | "coaching" | "generic"; label: string; route: string } => {
  const lower = prompt.toLowerCase();
  const courseKeywords = ["course", "curriculum", "module", "lesson", "bootcamp", "class", "training", "learn", "study", "tutorial", "certification"];
  const webinarKeywords = ["webinar", "live session", "live class", "workshop", "seminar", "zoom", "meet", "broadcast", "livestream", "live stream"];
  const coachingKeywords = ["coaching", "1:1", "one on one", "1 on 1", "mentor", "consultation", "consult", "counseling", "counselling", "session booking", "personal guidance", "advisory"];

  const courseScore = courseKeywords.filter(k => lower.includes(k)).length;
  const webinarScore = webinarKeywords.filter(k => lower.includes(k)).length;
  const coachingScore = coachingKeywords.filter(k => lower.includes(k)).length;

  const maxScore = Math.max(courseScore, webinarScore, coachingScore);
  if (maxScore === 0) return { type: "generic", label: "Smart Page", route: `/website-builder/editor?prompt=${encodeURIComponent(prompt)}` };
  if (courseScore === maxScore) return { type: "course", label: "Online Course", route: "/website-builder/course/create" };
  if (webinarScore === maxScore) return { type: "webinar", label: "Webinar", route: "/website-builder/webinar/create" };
  return { type: "coaching", label: "1:1 Coaching", route: "/website-builder/coaching/create" };
};

const analysisSteps = [
  { icon: Brain, text: "Understanding your idea..." },
  { icon: Wand2, text: "Detecting page type..." },
  { icon: CheckCircle2, text: "" }, // filled dynamically
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

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [detectedType, setDetectedType] = useState<string>("");

  const isEducation = activeCategory === "education";

  // Compute preview template/sections for the active page
  const previewPageTemplate = (() => {
    if (!previewTemplate) return null;
    if (previewActivePage === "Home" || previewActivePage === previewTemplate.pages[0]) {
      return previewTemplate;
    }
    const pageData = previewTemplate.pagesData?.[previewActivePage];
    if (!pageData) return previewTemplate;
    return {
      ...previewTemplate,
      heroTitle: pageData.heroTitle,
      heroTagline: pageData.heroTagline,
      heroDescription: pageData.heroDescription || previewTemplate.heroDescription,
      heroCta: pageData.heroCta || previewTemplate.heroCta,
      sections: pageData.sections,
    };
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

    // Step through animation phases
    setTimeout(() => setAnalysisStep(1), 1000);
    setTimeout(() => setAnalysisStep(2), 2200);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate(result.route);
    }, 3400);
  };

  const handleUseTemplate = (template: TemplateData) => {
    setPreviewTemplate(null);
    navigate(`/website-builder/editor?template=${encodeURIComponent(template.id)}&title=${encodeURIComponent(template.title)}&type=${encodeURIComponent(template.title)}`);
  };

  const handleEducationCard = (card: typeof educationPageTypes[0]) => {
    if (card.route) {
      navigate(card.route);
    } else if (card.templateId) {
      const tpl = templates.find((t) => t.id === card.templateId);
      if (tpl) handleUseTemplate(tpl);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(280 80% 70% / 0.08), hsl(var(--primary) / 0.04), hsl(340 80% 70% / 0.06))" }}>
      {/* Analysis Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-4 w-full">
              {analysisSteps.map((step, i) => {
                const isActive = analysisStep === i;
                const isDone = analysisStep > i;
                const StepIcon = step.icon;
                const displayText = i === 2 ? `Perfect! Building your ${detectedType} page...` : step.text;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 ${
                      isActive ? "bg-primary/10 border border-primary/20 scale-105" :
                      isDone ? "bg-muted/50 opacity-60" : "opacity-20"
                    }`}
                  >
                    <StepIcon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary animate-pulse" : isDone ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {displayText}
                    </span>
                    {isDone && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <ScrollArea className="flex-1">
      <div className="animate-fade-in max-w-6xl mx-auto px-6 py-6">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2 bg-background/80 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* ─── Hero AI Section ─── */}
        <div className="relative overflow-hidden rounded-2xl mb-10">
          <FloatingOrb className="w-32 h-32 bg-primary/10 top-4 -left-8 animate-float" />
          <FloatingOrb className="w-24 h-24 bg-accent/30 bottom-8 right-12 animate-float-slow" />
          <FloatingOrb className="w-16 h-16 bg-primary/15 top-12 right-1/4 animate-pulse-soft" />

          <div className="absolute top-8 left-12 animate-float opacity-20">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div className="absolute bottom-12 left-1/4 animate-float-slow opacity-20" style={{ animationDelay: "1s" }}>
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div className="absolute top-10 right-16 animate-float opacity-15" style={{ animationDelay: "2s" }}>
            <Layout className="h-5 w-5 text-primary" />
          </div>
          <div className="absolute bottom-8 right-1/3 animate-pulse-soft opacity-20" style={{ animationDelay: "0.5s" }}>
            <Zap className="h-5 w-5 text-primary" />
          </div>

          <div className="relative z-10 py-14 px-6 flex flex-col items-center">
            <div className="text-center mb-8 space-y-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                What would you like to sell?
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Describe your website and AI will design it for you — or pick a template below.
              </p>
            </div>

            <div className={`w-full max-w-2xl transition-all duration-300 ${isFocused ? "scale-[1.01]" : ""}`}>
              <div className={`relative rounded-xl bg-card border shadow-sm transition-all duration-300 ${isFocused ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"}`}>
                {isFocused && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.06), transparent)" }} />
                  </div>
                )}
                <textarea
                  className="w-full bg-transparent px-5 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none rounded-xl"
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                  placeholder="e.g. 'A website for my 12-week coding bootcamp with pricing, curriculum, and enrollment...'"
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse-soft" />
                    <span className="text-[11px] text-muted-foreground">AI-powered</span>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-lg h-8 px-4"
                    onClick={handleGenerate}
                    disabled={!aiPrompt.trim()}
                  >
                    Generate <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl">
              {promptSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setAiPrompt(s)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border bg-card/80 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent/50 transition-all duration-200"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Templates / Education Cards Section ─── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>
            {!isEducation && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            )}
          </div>

          {/* ─── Education: Purpose-driven cards ─── */}
          {isEducation && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">What do you want to build?</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose a page type to get started with a tailored creation flow.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {educationPageTypes.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleEducationCard(card)}
                    className="text-left p-5 rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{card.desc}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Get started <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Also show education templates below */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Or start from a template</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg border border-border bg-background overflow-hidden group hover:border-primary/40 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative cursor-pointer" onClick={() => setPreviewTemplate(t)}>
                        <TemplateThumb template={t} />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/60 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                          <Button size="sm" variant="secondary" className="gap-1.5 shadow-lg" onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }}>
                            <Eye className="h-3.5 w-3.5" /> Preview
                          </Button>
                          <Button size="sm" className="gap-1.5 shadow-lg" onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }}>
                            Use Template
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-foreground text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Non-education: Template Grid ─── */}
          {!isEducation && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-border bg-background overflow-hidden group hover:border-primary/40 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="relative cursor-pointer" onClick={() => setPreviewTemplate(t)}>
                      <TemplateThumb template={t} />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/60 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <Button size="sm" variant="secondary" className="gap-1.5 shadow-lg" onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }}>
                          <Eye className="h-3.5 w-3.5" /> Live Preview
                        </Button>
                        <Button size="sm" className="gap-1.5 shadow-lg" onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }}>
                          Use Template
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{t.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize whitespace-nowrap flex-shrink-0">
                          {t.category === "nonprofit" ? "Non-Profit" : t.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {t.pages.slice(0, 4).map((p) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p}</span>
                        ))}
                        {t.pages.length > 4 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{t.pages.length - 4}</span>}
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
      <Dialog open={!!previewTemplate} onOpenChange={() => { setPreviewTemplate(null); setPreviewActivePage("Home"); }}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col [&>button]:z-50 [&>button]:bg-background [&>button]:border [&>button]:border-border [&>button]:rounded-full [&>button]:shadow-md [&>button]:h-8 [&>button]:w-8 [&>button]:-top-3 [&>button]:-right-3">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
            <div>
              <h2 className="font-semibold text-foreground">{previewTemplate?.title}</h2>
              <p className="text-xs text-muted-foreground">{previewTemplate?.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 ${previewDevice === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Monitor className="h-4 w-4" /></button>
                <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 ${previewDevice === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}><Smartphone className="h-4 w-4" /></button>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => previewTemplate && handleUseTemplate(previewTemplate)}>
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
