import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ArrowLeft, Sparkles, Search, ArrowRight, Eye, Monitor, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categories, templates, type TemplateData } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";

// Scaled-down live preview thumbnail
const TemplateThumb = ({ template }: { template: TemplateData }) => (
  <div className="h-52 rounded-t-lg border-b border-border overflow-hidden relative bg-background">
    <div
      className="origin-top-left absolute"
      style={{ width: 1200, transform: "scale(0.3)", transformOrigin: "top left" }}
    >
      <SitePreview template={template} sections={template.sections} />
    </div>
    {/* Fade-out at bottom */}
    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
  </div>
);

const SmartPageCreate = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
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
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Create Smart Page</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Start from AI prompt or choose a template</p>
          </div>
        </div>

        {/* AI Prompt */}
        <div className="blade-card p-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Generate with AI</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Describe your business or offering and we'll generate a complete website.</p>
          <textarea
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 'I run a 12-week full stack bootcamp for beginners. ₹12,999 one-time. I need a website with course details, pricing, testimonials, and enrollment.'"
          />
          <div className="mt-3 flex justify-end">
            <Button className="gap-2" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" /> Generate Website
            </Button>
          </div>
        </div>

        {/* Category Tabs + Search */}
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

        {/* Template Grid — WordPress-style cards with live previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-border bg-background overflow-hidden group hover:border-primary/40 hover:shadow-lg transition-all"
            >
              {/* Live scaled preview */}
              <div className="relative cursor-pointer" onClick={() => setPreviewTemplate(t)}>
                <TemplateThumb template={t} />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/60 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary" className="gap-1.5 shadow-lg" onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }}>
                    <Eye className="h-3.5 w-3.5" /> Live Preview
                  </Button>
                  <Button size="sm" className="gap-1.5 shadow-lg" onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }}>
                    Use Template
                  </Button>
                </div>
              </div>

              {/* Info */}
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

      {/* Template Preview Dialog — Full rendered preview */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col [&>button]:z-50 [&>button]:bg-background [&>button]:border [&>button]:border-border [&>button]:rounded-full [&>button]:shadow-md [&>button]:h-8 [&>button]:w-8 [&>button]:-top-3 [&>button]:-right-3">
          {/* Header */}
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
          {/* Preview body */}
          <ScrollArea className="flex-1 bg-muted/30">
            <div className={`mx-auto bg-background ${previewDevice === "mobile" ? "max-w-sm border-x border-border" : ""}`}>
              {previewTemplate && (
                <SitePreview template={previewTemplate} sections={previewTemplate.sections} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SmartPageCreate;
