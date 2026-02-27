import { useState, useEffect } from "react";
import { type SectionData, type TemplateData, availableSectionTypes, createDefaultSection, type SectionType } from "@/data/smartPageTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, MapPin, Clock, Play, ChevronDown, ChevronUp, Plus, Trash2, GripVertical, Pencil, ArrowUp, ArrowDown } from "lucide-react";

interface SitePreviewProps {
  template: TemplateData;
  sections: SectionData[];
  editable?: boolean;
  onUpdateSection?: (id: string, data: Record<string, any>) => void;
  onUpdateHero?: (updates: Partial<Pick<TemplateData, "heroTitle" | "heroTagline" | "heroDescription" | "heroCta" | "bannerImage">>) => void;
  onRemoveSection?: (id: string) => void;
  onMoveSection?: (index: number, dir: "up" | "down") => void;
  onAddSection?: (type: string) => void;
}

// Inline editable text
const EditableText = ({ value, onChange, className, tag: Tag = "span" }: {
  value: string; onChange: (v: string) => void; className?: string; tag?: any;
}) => (
  <Tag
    className={`${className} outline-none hover:ring-2 hover:ring-primary/30 focus:ring-2 focus:ring-primary/50 rounded px-1 cursor-text transition-shadow`}
    contentEditable
    suppressContentEditableWarning
    onBlur={(e: any) => onChange(e.currentTarget.textContent || "")}
    dangerouslySetInnerHTML={{ __html: value }}
  />
);

const ReadOnlyText = ({ value, className, tag: Tag = "span" }: { value: string; className?: string; tag?: any }) => (
  <Tag className={className}>{value}</Tag>
);

// Inline editable wrapper for items in lists (cards, FAQs, etc.)
const InlineInput = ({ value, onChange, className = "" }: { value: string; onChange: (v: string) => void; className?: string }) => (
  <span
    className={`${className} outline-none hover:ring-1 hover:ring-primary/30 focus:ring-2 focus:ring-primary/50 rounded px-0.5 cursor-text transition-shadow`}
    contentEditable
    suppressContentEditableWarning
    onBlur={(e: any) => onChange(e.currentTarget.textContent || "")}
    dangerouslySetInnerHTML={{ __html: value }}
  />
);

// ─── Section Toolbar (appears on hover) ───
const SectionToolbar = ({ label, index, total, onRemove, onMove }: {
  label: string; index: number; total: number;
  onRemove: () => void; onMove: (dir: "up" | "down") => void;
}) => (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/section:opacity-100 transition-opacity">
    <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg px-2 py-1">
      <span className="text-[10px] font-medium text-muted-foreground px-1.5">{label}</span>
      <div className="w-px h-4 bg-border" />
      <button onClick={() => onMove("up")} disabled={index === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
      <button onClick={() => onMove("down")} disabled={index === total - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
      <div className="w-px h-4 bg-border" />
      <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
    </div>
  </div>
);

// ─── Add Section Divider ───
const AddSectionDivider = ({ onAdd }: { onAdd: (type: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="relative py-2 group/add flex items-center justify-center">
        <div className="absolute inset-x-0 top-1/2 h-px bg-transparent group-hover/add:bg-border transition-colors" />
        <button
          onClick={() => setOpen(true)}
          className="relative z-10 opacity-0 group-hover/add:opacity-100 transition-opacity flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 shadow-sm"
        >
          <Plus className="h-3 w-3" /> Add section
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader><DialogTitle>Add Section</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-2 pr-4">
              {availableSectionTypes.map((st) => (
                <button
                  key={st.type}
                  onClick={() => { onAdd(st.type); setOpen(false); }}
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
    </>
  );
};

export const SitePreview = ({ template, sections, editable = false, onUpdateSection, onUpdateHero, onRemoveSection, onMoveSection, onAddSection }: SitePreviewProps) => {
  const Text = editable ? EditableText : ({ value, className, tag }: any) => <ReadOnlyText value={value} className={className} tag={tag} />;
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div className="font-sans">
      {/* Banner */}
      <div className="relative group">
        <img src={template.bannerImage} alt="Banner" className="w-full h-56 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=300&fit=crop"; }} />
        {editable && (
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-md shadow-sm">Click to change banner</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-2">
        {/* Hero */}
        <div className="text-center space-y-3 pb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">
            {template.heroTitle.charAt(0)}
          </div>
          <Text value={template.heroTitle} onChange={(v: string) => onUpdateHero?.({ heroTitle: v })} className="text-3xl font-bold text-foreground block" tag="h1" />
          <Text value={template.heroTagline} onChange={(v: string) => onUpdateHero?.({ heroTagline: v })} className="text-lg text-muted-foreground block" tag="p" />
          <Text value={template.heroDescription} onChange={(v: string) => onUpdateHero?.({ heroDescription: v })} className="text-sm text-muted-foreground max-w-2xl mx-auto block" tag="p" />
          {editable ? (
            <div className="inline-flex items-center gap-1">
              <Button className="mt-4" size="lg">
                <InlineInput value={template.heroCta} onChange={(v) => onUpdateHero?.({ heroCta: v })} />
              </Button>
            </div>
          ) : (
            <Button className="mt-4" size="lg">{template.heroCta}</Button>
          )}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-center gap-4 border-b border-border pb-4 flex-wrap">
          {template.pages.map((p) => (
            <span key={p} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{p}</span>
          ))}
        </div>

        {/* Sections with inline controls */}
        {editable && onAddSection && <AddSectionDivider onAdd={onAddSection} />}
        {visibleSections.map((section, idx) => {
          const sectionIndex = sections.findIndex(s => s.id === section.id);
          return (
            <div key={section.id}>
              <div className="relative group/section py-4">
                {editable && onRemoveSection && onMoveSection && (
                  <SectionToolbar
                    label={section.label}
                    index={sectionIndex}
                    total={sections.length}
                    onRemove={() => onRemoveSection(section.id)}
                    onMove={(dir) => onMoveSection(sectionIndex, dir)}
                  />
                )}
                <div className={editable ? "ring-0 hover:ring-1 hover:ring-primary/20 rounded-lg transition-shadow p-1" : ""}>
                  <SectionRenderer section={section} editable={editable} onUpdate={(data) => onUpdateSection?.(section.id, data)} />
                </div>
              </div>
              {editable && onAddSection && <AddSectionDivider onAdd={onAddSection} />}
            </div>
          );
        })}

        {/* Footer */}
        <div className="text-center border-t border-border pt-6 mt-8">
          <p className="text-xs text-muted-foreground">Built with Smart Pages • Powered by Razorpay</p>
        </div>
      </div>
    </div>
  );
};

// ──────────────── Section Renderer ────────────────

const SectionRenderer = ({ section, editable, onUpdate }: { section: SectionData; editable: boolean; onUpdate: (data: Record<string, any>) => void }) => {
  const { type, data } = section;
  switch (type) {
    case "about": return <AboutSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "services": return <CardsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "features": return <CardsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "pricing": return <PricingSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "testimonials": return <TestimonialsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "google-reviews": return <GoogleReviewsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "faq": return <FaqSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "team": return <TeamSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "gallery": return <GallerySection data={data} />;
    case "stats": return <StatsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "cta-banner": return <CtaBannerSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "contact-form": return <ContactFormSection data={data} />;
    case "curriculum": return <CurriculumSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "schedule": return <ScheduleSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "speakers": return <SpeakersSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "newsletter": return <NewsletterSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "clients": return <ClientsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "portfolio": return <PortfolioSection data={data} />;
    case "impact": return <ImpactSection data={data} />;
    case "donation": return <DonationSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "products": return <ProductsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "video-embed": return <VideoSection data={data} />;
    case "countdown": return <CountdownSection data={data} />;
    default: return null;
  }
};

// ──────────────── Helper ────────────────

const SectionHeading = ({ text, editable, onChange }: { text: string; editable?: boolean; onChange?: (v: string) => void }) => {
  if (editable && onChange) {
    return <InlineInput value={text} onChange={onChange} className="text-xl font-semibold text-foreground text-center mb-6 block" />;
  }
  return <h3 className="text-xl font-semibold text-foreground text-center mb-6">{text}</h3>;
};

const ItemAddButton = ({ onClick, label = "Add item" }: { onClick: () => void; label?: string }) => (
  <button onClick={onClick} className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors w-full">
    <Plus className="h-3 w-3" /> {label}
  </button>
);

const ItemRemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="absolute -top-1.5 -right-1.5 z-10 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm">
    <Trash2 className="h-3 w-3" />
  </button>
);

// Helper to update an item in a list
const updateItem = (items: any[], index: number, field: string, value: string) => {
  const updated = [...items];
  updated[index] = { ...updated[index], [field]: value };
  return updated;
};

// ──────────────── Individual Sections ────────────────

const AboutSection = ({ data, editable, onUpdate }: any) => (
  <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-6 items-center">
    {data.image && <img src={data.image} alt="About" className="w-full md:w-1/3 rounded-lg object-cover h-48" />}
    <div className="flex-1">
      {editable ? (
        <>
          <InlineInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} className="text-xl font-semibold text-foreground mb-3 block" />
          <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-muted-foreground leading-relaxed block" />
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-3">{data.heading}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.text}</p>
        </>
      )}
    </div>
  </div>
);

const CardsSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.items?.map((item: any, i: number) => (
        <div key={i} className="relative group/item rounded-lg border border-border p-4 text-center hover:shadow-md transition-shadow">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
          <div className="text-2xl mb-2">{item.icon}</div>
          {editable ? (
            <>
              <InlineInput value={item.title} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "title", v) })} className="font-medium text-foreground text-sm block" />
              <InlineInput value={item.desc} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "desc", v) })} className="text-xs text-muted-foreground mt-1 block" />
            </>
          ) : (
            <>
              <p className="font-medium text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { icon: "✨", title: "New Item", desc: "Description" }] })} /></div>}
    </div>
  </div>
);

const PricingSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className={`grid gap-4 ${data.tiers?.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {data.tiers?.map((tier: any, i: number) => (
        <div key={i} className={`relative group/item rounded-lg border p-5 text-center ${tier.highlighted ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"}`}>
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ tiers: data.tiers.filter((_: any, j: number) => j !== i) })} />}
          {tier.highlighted && <span className="text-[10px] font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">Most Popular</span>}
          {editable ? (
            <>
              <InlineInput value={tier.name} onChange={(v) => onUpdate({ tiers: updateItem(data.tiers, i, "name", v) })} className="font-medium text-foreground mt-2 block" />
              <InlineInput value={tier.price} onChange={(v) => onUpdate({ tiers: updateItem(data.tiers, i, "price", v) })} className="text-3xl font-bold text-foreground my-3 block" />
            </>
          ) : (
            <>
              <p className="font-medium text-foreground mt-2">{tier.name}</p>
              <p className="text-3xl font-bold text-foreground my-3">{tier.price}<span className="text-sm font-normal text-muted-foreground">{tier.period}</span></p>
            </>
          )}
          <ul className="text-xs text-muted-foreground space-y-2 mb-4 text-left">
            {tier.features?.map((f: string, j: number) => <li key={j} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">✓</span>{f}</li>)}
          </ul>
          <Button variant={tier.highlighted ? "default" : "outline"} size="sm" className="w-full">Choose {tier.name}</Button>
        </div>
      ))}
    </div>
    {editable && <div className="mt-4"><ItemAddButton onClick={() => onUpdate({ tiers: [...(data.tiers || []), { name: "New Plan", price: "$0", period: "/mo", features: ["Feature 1"], highlighted: false }] })} label="Add pricing tier" /></div>}
  </div>
);

const TestimonialsSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.items?.map((t: any, i: number) => (
        <div key={i} className="relative group/item rounded-lg border border-border p-5">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
          <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}</div>
          {editable ? (
            <>
              <InlineInput value={t.text} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "text", v) })} className="text-sm text-muted-foreground italic mb-3 block" />
              <InlineInput value={t.name} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "name", v) })} className="text-xs font-medium text-foreground block" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground italic mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">{t.avatar}</div>
                <p className="text-xs font-medium text-foreground">{t.name}</p>
              </div>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { name: "New User", text: "Great experience!", rating: 5, avatar: "N" }] })} label="Add testimonial" /></div>}
    </div>
  </div>
);

const GoogleReviewsSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="text-center mb-4">
      <div className="flex items-center justify-center gap-1 mb-1">
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
        <span className="text-2xl font-bold text-foreground">{data.overallRating}</span>
        <div className="flex gap-0.5 ml-1">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-4 w-4 ${j < Math.floor(data.overallRating) ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />)}</div>
      </div>
      <p className="text-xs text-muted-foreground">{data.totalReviews} reviews on Google</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.reviews?.map((r: any, i: number) => (
        <div key={i} className="relative group/item rounded-lg border border-border p-4">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ reviews: data.reviews.filter((_: any, j: number) => j !== i) })} />}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
            <span className="text-[10px] text-muted-foreground">{r.date}</span>
          </div>
          {editable ? (
            <>
              <InlineInput value={r.text} onChange={(v) => onUpdate({ reviews: updateItem(data.reviews, i, "text", v) })} className="text-sm text-muted-foreground mb-2 block" />
              <InlineInput value={r.name} onChange={(v) => onUpdate({ reviews: updateItem(data.reviews, i, "name", v) })} className="text-xs font-medium text-foreground block" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">"{r.text}"</p>
              <p className="text-xs font-medium text-foreground">{r.name}</p>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ reviews: [...(data.reviews || []), { name: "New Reviewer", text: "Amazing!", rating: 5, date: "Recently" }] })} label="Add review" /></div>}
    </div>
  </div>
);

const FaqSection = ({ data, editable, onUpdate }: any) => (
  <div className="max-w-2xl mx-auto">
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="space-y-3">
      {data.items?.map((faq: any, i: number) => (
        <div key={i} className="relative group/item">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
          <details className="rounded-lg border border-border p-4 group open:bg-secondary/30">
            <summary className="text-sm font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
              {editable ? <InlineInput value={faq.q} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "q", v) })} className="flex-1" /> : faq.q}
              <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
            </summary>
            {editable ? (
              <InlineInput value={faq.a} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "a", v) })} className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border block" />
            ) : (
              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">{faq.a}</p>
            )}
          </details>
        </div>
      ))}
      {editable && <ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { q: "New Question?", a: "Answer here." }] })} label="Add FAQ" />}
    </div>
  </div>
);

const TeamSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.members?.map((m: any, i: number) => (
        <div key={i} className="relative group/item text-center p-4 rounded-lg border border-border">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ members: data.members.filter((_: any, j: number) => j !== i) })} />}
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold mx-auto mb-3">{m.avatar}</div>
          {editable ? (
            <>
              <InlineInput value={m.name} onChange={(v) => onUpdate({ members: updateItem(data.members, i, "name", v) })} className="font-medium text-foreground text-sm block" />
              <InlineInput value={m.role} onChange={(v) => onUpdate({ members: updateItem(data.members, i, "role", v) })} className="text-xs text-primary block" />
              <InlineInput value={m.bio} onChange={(v) => onUpdate({ members: updateItem(data.members, i, "bio", v) })} className="text-xs text-muted-foreground mt-1 block" />
            </>
          ) : (
            <>
              <p className="font-medium text-foreground text-sm">{m.name}</p>
              <p className="text-xs text-primary">{m.role}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.bio}</p>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ members: [...(data.members || []), { name: "New Member", role: "Role", bio: "Bio", avatar: "N" }] })} label="Add member" /></div>}
    </div>
  </div>
);

const GallerySection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {data.images?.map((img: string, i: number) => (
        <img key={i} src={img} alt={`Gallery ${i + 1}`} className="rounded-lg object-cover h-40 w-full" />
      ))}
    </div>
  </div>
);

const StatsSection = ({ data, editable, onUpdate }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {data.items?.map((s: any, i: number) => (
      <div key={i} className="relative group/item text-center p-4 rounded-lg bg-secondary/50">
        {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
        {editable ? (
          <>
            <InlineInput value={s.value} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "value", v) })} className="text-2xl font-bold text-foreground block" />
            <InlineInput value={s.label} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "label", v) })} className="text-xs text-muted-foreground mt-1 block" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </>
        )}
      </div>
    ))}
    {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { value: "0", label: "New Stat" }] })} label="Add stat" /></div>}
  </div>
);

const CtaBannerSection = ({ data, editable, onUpdate }: any) => (
  <div className="rounded-lg bg-primary p-8 text-center">
    {editable ? (
      <>
        <InlineInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} className="text-xl font-bold text-primary-foreground mb-2 block" />
        <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-primary-foreground/80 mb-4 block" />
        <Button variant="secondary" size="lg">
          <InlineInput value={data.buttonText} onChange={(v) => onUpdate({ buttonText: v })} />
        </Button>
      </>
    ) : (
      <>
        <h3 className="text-xl font-bold text-primary-foreground mb-2">{data.heading}</h3>
        <p className="text-sm text-primary-foreground/80 mb-4">{data.text}</p>
        <Button variant="secondary" size="lg">{data.buttonText}</Button>
      </>
    )}
  </div>
);

const ContactFormSection = ({ data }: any) => (
  <div className="max-w-lg mx-auto">
    <SectionHeading text={data.heading} />
    <div className="space-y-3">
      {data.fields?.map((f: any, i: number) => (
        <div key={i}>
          <label className="text-xs font-medium text-foreground">{f.label}{f.required && <span className="text-destructive"> *</span>}</label>
          {f.type === "textarea" ? (
            <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder={f.label} />
          ) : (
            <Input type={f.type} placeholder={f.label} className="mt-1" />
          )}
        </div>
      ))}
      <Button className="w-full">{data.submitText}</Button>
    </div>
  </div>
);

const CurriculumSection = ({ data, editable, onUpdate }: any) => (
  <div className="max-w-2xl mx-auto">
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="space-y-3">
      {data.modules?.map((m: any, i: number) => (
        <div key={i} className="relative group/item">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ modules: data.modules.filter((_: any, j: number) => j !== i) })} />}
          <details className="rounded-lg border border-border p-4 group">
            <summary className="font-medium text-foreground text-sm cursor-pointer list-none flex items-center justify-between">
              {editable ? <InlineInput value={m.title} onChange={(v) => onUpdate({ modules: updateItem(data.modules, i, "title", v) })} /> : <span>{m.title}</span>}
              <span className="text-xs text-muted-foreground">{m.duration}</span>
            </summary>
            <ul className="mt-3 space-y-1.5 pl-4">
              {m.lessons?.map((l: string, j: number) => (
                <li key={j} className="text-sm text-muted-foreground flex items-center gap-2"><Play className="h-3 w-3 text-primary" />{l}</li>
              ))}
            </ul>
          </details>
        </div>
      ))}
      {editable && <ItemAddButton onClick={() => onUpdate({ modules: [...(data.modules || []), { title: "New Module", duration: "1h", lessons: ["Lesson 1"] }] })} label="Add module" />}
    </div>
  </div>
);

const ScheduleSection = ({ data, editable, onUpdate }: any) => (
  <div className="max-w-2xl mx-auto">
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="space-y-2">
      {data.events?.map((e: any, i: number) => (
        <div key={i} className="relative group/item flex items-center gap-4 p-3 rounded-lg border border-border">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ events: data.events.filter((_: any, j: number) => j !== i) })} />}
          <div className="text-xs font-semibold text-primary w-20 flex-shrink-0 flex items-center gap-1"><Clock className="h-3 w-3" />{e.time}</div>
          <div className="flex-1">
            {editable ? (
              <InlineInput value={e.title} onChange={(v) => onUpdate({ events: updateItem(data.events, i, "title", v) })} className="text-sm font-medium text-foreground block" />
            ) : (
              <p className="text-sm font-medium text-foreground">{e.title}</p>
            )}
            {e.speaker && <p className="text-xs text-muted-foreground">{e.speaker}</p>}
          </div>
        </div>
      ))}
      {editable && <ItemAddButton onClick={() => onUpdate({ events: [...(data.events || []), { time: "TBD", title: "New Event", speaker: "" }] })} label="Add event" />}
    </div>
  </div>
);

const SpeakersSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.speakers?.map((s: any, i: number) => (
        <div key={i} className="relative group/item text-center p-5 rounded-lg border border-border">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ speakers: data.speakers.filter((_: any, j: number) => j !== i) })} />}
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold mx-auto mb-3">{s.avatar}</div>
          {editable ? (
            <>
              <InlineInput value={s.name} onChange={(v) => onUpdate({ speakers: updateItem(data.speakers, i, "name", v) })} className="font-medium text-foreground block" />
              <InlineInput value={s.title} onChange={(v) => onUpdate({ speakers: updateItem(data.speakers, i, "title", v) })} className="text-xs text-primary block" />
              <InlineInput value={s.bio} onChange={(v) => onUpdate({ speakers: updateItem(data.speakers, i, "bio", v) })} className="text-xs text-muted-foreground mt-2 block" />
            </>
          ) : (
            <>
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-primary">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-2">{s.bio}</p>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ speakers: [...(data.speakers || []), { name: "New Speaker", title: "Title", bio: "Bio", avatar: "N" }] })} label="Add speaker" /></div>}
    </div>
  </div>
);

const NewsletterSection = ({ data, editable, onUpdate }: any) => (
  <div className="max-w-md mx-auto text-center rounded-lg border border-border p-6 bg-secondary/30">
    {editable ? (
      <>
        <InlineInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} className="text-lg font-semibold text-foreground mb-1 block" />
        <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-muted-foreground mb-4 block" />
      </>
    ) : (
      <>
        <h3 className="text-lg font-semibold text-foreground mb-1">{data.heading}</h3>
        <p className="text-sm text-muted-foreground mb-4">{data.text}</p>
      </>
    )}
    <div className="flex gap-2">
      <Input placeholder="your@email.com" className="flex-1" />
      <Button>{data.buttonText}</Button>
    </div>
  </div>
);

const ClientsSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="flex items-center justify-center gap-8 flex-wrap">
      {data.names?.map((name: string, i: number) => (
        <div key={i} className="relative group/item">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ names: data.names.filter((_: any, j: number) => j !== i) })} />}
          {editable ? (
            <InlineInput value={name} onChange={(v) => { const updated = [...data.names]; updated[i] = v; onUpdate({ names: updated }); }} className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground" />
          ) : (
            <div className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors">{name}</div>
          )}
        </div>
      ))}
      {editable && <button onClick={() => onUpdate({ names: [...(data.names || []), "New Client"] })} className="text-muted-foreground hover:text-foreground"><Plus className="h-5 w-5" /></button>}
    </div>
  </div>
);

const PortfolioSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.items?.map((item: any, i: number) => (
        <div key={i} className="rounded-lg border border-border overflow-hidden group hover:shadow-md transition-shadow">
          <img src={item.image} alt={item.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
          <div className="p-3">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-primary">{item.category}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ImpactSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.stories?.map((story: any, i: number) => (
        <div key={i} className="rounded-lg border border-border overflow-hidden">
          <img src={story.image} alt={story.title} className="w-full h-40 object-cover" />
          <div className="p-4">
            <p className="font-medium text-foreground mb-1">{story.title}</p>
            <p className="text-sm text-muted-foreground">{story.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DonationSection = ({ data, editable, onUpdate }: any) => {
  const percent = parseInt(data.raised?.replace(/[^0-9]/g, "") || "0") / parseInt(data.goal?.replace(/[^0-9]/g, "") || "1") * 100;
  return (
    <div className="max-w-lg mx-auto text-center">
      <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
      {editable ? (
        <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-muted-foreground mb-4 block" />
      ) : (
        <p className="text-sm text-muted-foreground mb-4">{data.text}</p>
      )}
      <div className="w-full bg-secondary rounded-full h-3 mb-3">
        <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      <p className="text-sm text-foreground mb-4"><span className="font-bold">{data.raised}</span> raised of {data.goal} goal</p>
      <div className="flex gap-2 justify-center flex-wrap">
        {data.amounts?.map((amt: string, i: number) => (
          <Button key={i} variant="outline" size="sm">{amt}</Button>
        ))}
        <Button size="sm">Custom Amount</Button>
      </div>
    </div>
  );
};

const ProductsSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.items?.map((item: any, i: number) => (
        <div key={i} className="relative group/item rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
          <div className="relative">
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
            {item.badge && <span className="absolute top-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{item.badge}</span>}
          </div>
          <div className="p-3">
            {editable ? (
              <>
                <InlineInput value={item.title} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "title", v) })} className="text-sm font-medium text-foreground block" />
                <InlineInput value={item.price} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "price", v) })} className="text-sm font-bold text-primary mt-1 block" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-sm font-bold text-primary mt-1">{item.price}</p>
              </>
            )}
            <Button size="sm" variant="outline" className="w-full mt-2">Add to Cart</Button>
          </div>
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { title: "New Product", price: "$0", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" }] })} label="Add product" /></div>}
    </div>
  </div>
);

const VideoSection = ({ data }: any) => (
  <div className="max-w-2xl mx-auto">
    <SectionHeading text={data.heading} />
    <div className="aspect-video rounded-lg overflow-hidden border border-border bg-secondary flex items-center justify-center">
      <div className="text-center">
        <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Video preview</p>
      </div>
    </div>
  </div>
);

const CountdownSection = ({ data }: any) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(data.targetDate).getTime() - Date.now());
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [data.targetDate]);

  return (
    <div className="text-center">
      <SectionHeading text={data.heading} />
      <div className="flex items-center justify-center gap-4">
        {Object.entries(timeLeft).map(([label, val]) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-bold text-foreground bg-secondary rounded-lg w-20 h-20 flex items-center justify-center">{val}</div>
            <p className="text-xs text-muted-foreground mt-1.5 capitalize">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SitePreview;
