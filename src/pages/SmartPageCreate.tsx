import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Sparkles, Search, ArrowRight, Eye, Monitor, Smartphone,
  Globe, Palette, Zap, Layout, Send,
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

const SmartPageCreate = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    navigate(`/website-builder/editor?prompt=${encodeURIComponent(aiPrompt)}`);
  };

  const handleUseTemplate = (template: TemplateData) => {
    setPreviewTemplate(null);
    navigate(`/website-builder/editor?template=${encodeURIComponent(template.id)}&title=${encodeURIComponent(template.title)}&type=${encodeURIComponent(template.title)}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <ScrollArea className="flex-1">
      <div className="animate-fade-in max-w-6xl mx-auto px-6 py-6">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* ─── Hero AI Section ─── */}
        <div className="relative overflow-hidden rounded-2xl mb-10">
          {/* Animated gradient background */}
          <div
            className="absolute inset-0 animate-gradient-shift opacity-60"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(280 80% 70% / 0.1), hsl(var(--primary) / 0.06), hsl(340 80% 70% / 0.08))",
              backgroundSize: "300% 300%",
            }}
          />

          {/* Floating orbs */}
          <FloatingOrb className="w-32 h-32 bg-primary/10 top-4 -left-8 animate-float" />
          <FloatingOrb className="w-24 h-24 bg-accent/30 bottom-8 right-12 animate-float-slow" />
          <FloatingOrb className="w-16 h-16 bg-primary/15 top-12 right-1/4 animate-pulse-soft" />

          {/* Decorative floating icons */}
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
            {/* Heading */}
            <div className="text-center mb-8 space-y-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                What would you like to build?
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Describe your website and AI will design it for you — or pick a template below.
              </p>
            </div>

            {/* Prompt input */}
            <div className={`w-full max-w-2xl transition-all duration-300 ${isFocused ? "scale-[1.01]" : ""}`}>
              <div className={`relative rounded-xl bg-card border shadow-sm transition-all duration-300 ${isFocused ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"}`}>
                {/* Shimmer effect on border */}
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

            {/* Suggestion chips */}
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

        {/* ─── Templates Section ─── */}
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
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>

          {/* Template Grid */}
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
        </div>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
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
              {previewTemplate && (
                <SitePreview template={previewTemplate} sections={previewTemplate.sections} />
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
