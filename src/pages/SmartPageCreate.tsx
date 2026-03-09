import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Sparkles, Search, ArrowRight, Eye, Monitor, Smartphone,
  Send, Video, BookOpen, UserCheck,
  Brain, Wand2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { categories, templates, type TemplateData } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";

const promptSuggestions = [
  "Online yoga classes with 3 months, 6 months, yearly plans",
  "1:1 coaching session for new parents",
];

const TemplateThumb = ({ template }: { template: TemplateData }) => (
  <div className="h-52 rounded-t-lg border-b border-border overflow-hidden relative bg-background">
    <div className="origin-top-left absolute" style={{ width: 1200, transform: "scale(0.3)", transformOrigin: "top left" }}>
      <SitePreview template={template} sections={template.sections} />
    </div>
    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
  </div>
);

const educationPageTypes = [
  { id: "course", title: "Sell an Online Course", desc: "Course landing page with curriculum, pricing & enrollment.", icon: BookOpen, directRoute: "/website-builder/editor?template=single-course&title=Online%20Course&type=Online%20Course" },
  { id: "webinar", title: "Host a Webinar", desc: "Webinar with registration, integrations & attendee tracking.", icon: Video, configRoute: "/website-builder/webinar/chat" },
  { id: "coaching", title: "Offer 1:1 Coaching", desc: "Coaching page with booking slots, packages & payments.", icon: UserCheck, configRoute: "/website-builder/coaching/create" },
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

  // Route courses to editor, webinar/coaching to chat UI
  if (max === 0) return { type: "generic", label: "Smart Page", route: `/website-builder/editor?prompt=${encodeURIComponent(prompt)}` };
  if (cs === max) return { type: "course", label: "Online Course", route: `/website-builder/editor?template=single-course&title=${encodeURIComponent(prompt)}&type=Online%20Course&aiPrompt=${encodeURIComponent(prompt)}` };
  if (ws === max) return { type: "webinar", label: "Webinar", route: `/website-builder/webinar/chat` };
  return { type: "coaching", label: "1:1 Coaching", route: `/website-builder/coaching/create` };
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [detectedType, setDetectedType] = useState("");

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
    // Webinar and coaching templates go to chat UI, others go to editor
    if (template.id === "webinar") {
      navigate("/website-builder/webinar/chat");
    } else if (template.id === "coaching") {
      navigate("/website-builder/coaching/create");
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
                What would you like to sell?
              </h1>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Describe your website and AI will design it for you — or pick a template below.
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
                  placeholder="e.g. 'A website for my 12-week coding bootcamp with pricing, curriculum, and enrollment...'"
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

              {/* Suggestion chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl">
                {promptSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setAiPrompt(s)}
                    className="text-xs px-3.5 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
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
                {/* Purpose-driven cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {educationPageTypes.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleEducationCard(card)}
                      className="text-left p-5 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
                        <card.icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                      <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Get started <ArrowRight className="h-3 w-3" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Templates */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Or start from a template</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((t) => (
                      <div key={t.id} className="rounded-lg border border-border bg-card overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all">
                        <div className="relative cursor-pointer" onClick={() => setPreviewTemplate(t)}>
                          <TemplateThumb template={t} />
                          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="secondary" className="gap-1.5 shadow-md text-xs" onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }}>
                              <Eye className="h-3.5 w-3.5" /> Preview
                            </Button>
                            <Button size="sm" className="gap-1.5 shadow-md text-xs" onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }}>
                              Use Template
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="font-medium text-foreground text-sm">{t.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <div key={t.id} className="rounded-lg border border-border bg-card overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all">
                      <div className="relative cursor-pointer" onClick={() => setPreviewTemplate(t)}>
                        <TemplateThumb template={t} />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button size="sm" variant="secondary" className="gap-1.5 shadow-md text-xs" onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }}>
                            <Eye className="h-3.5 w-3.5" /> Preview
                          </Button>
                          <Button size="sm" className="gap-1.5 shadow-md text-xs" onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }}>
                            Use Template
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
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
        <Dialog open={!!previewTemplate} onOpenChange={() => { setPreviewTemplate(null); setPreviewActivePage("Home"); }}>
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
                  <SitePreview template={previewPageTemplate} sections={previewPageTemplate.sections} activePage={previewActivePage} onPageChange={(page) => setPreviewActivePage(page)} />
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
