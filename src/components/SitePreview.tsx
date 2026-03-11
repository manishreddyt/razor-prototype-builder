import { useState, useEffect } from "react";
import { type SectionData, type TemplateData, type CustomPage, availableSectionTypes, createDefaultSection, type SectionType } from "@/data/smartPageTemplates";
import { ProductsConfig } from "@/types/products";
import { ContactFormConfig, Lead } from "@/types/leads";
import { BiolinkConfig } from "@/types/biolink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, MapPin, Clock, Play, ChevronDown, ChevronUp, Plus, Trash2, GripVertical, Pencil, ArrowUp, ArrowDown, CheckCircle2, Check, Users, Award, BookOpen, Home, FileText, Users as UsersIcon, Briefcase, Mail, Info, Settings as SettingsIcon, Star as StarIcon, Package as PackageIcon } from "lucide-react";
import { ContactFormSection as ContactFormSectionComponent } from "@/components/ContactFormSection";
import { BiolinkMobileView } from "@/components/BiolinkMobileView";

interface SitePreviewProps {
  template: TemplateData;
  sections: SectionData[];
  editable?: boolean;
  activePage?: string;
  onPageChange?: (page: string) => void;
  onUpdateSection?: (id: string, data: Record<string, any>) => void;
  onUpdateHero?: (updates: Partial<Pick<TemplateData, "heroTitle" | "heroTagline" | "heroDescription" | "heroCta" | "bannerImage">>) => void;
  onRemoveSection?: (id: string) => void;
  onMoveSection?: (index: number, dir: "up" | "down") => void;
  onAddSection?: (type: string) => void;
  onCtaClick?: () => void;
  onProductClick?: (index: number) => void;
  productsConfig?: ProductsConfig;
  contactForm?: ContactFormConfig;
  siteId?: string;
  onLeadCreated?: (lead: Lead) => void;
  customPages?: CustomPage[];
  onOpenProductModal?: () => void;
  biolinkConfig?: BiolinkConfig;
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

export const SitePreview = ({ template, sections, editable = false, activePage, onPageChange, onUpdateSection, onUpdateHero, onRemoveSection, onMoveSection, onAddSection, onCtaClick, onProductClick, productsConfig, contactForm, siteId, onLeadCreated, customPages = [], onOpenProductModal, biolinkConfig }: SitePreviewProps) => {
  const templateId = template.id;
  const category = template.category;
  const Text = editable ? EditableText : ({ value, className, tag }: any) => <ReadOnlyText value={value} className={className} tag={tag} />;
  const visibleSections = sections.filter((s) => s.visible);

  // Check if this is a biolink-only template
  const isBiolinkOnly = visibleSections.length === 1 && visibleSections[0]?.type === "biolink";

  // Get icon component for custom pages
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      home: Home,
      file: FileText,
      users: UsersIcon,
      briefcase: Briefcase,
      mail: Mail,
      info: Info,
      settings: SettingsIcon,
      star: StarIcon,
      package: PackageIcon,
    };
    return icons[iconName] || FileText;
  };

  // If this is a biolink-only template, render only the biolink section
  if (isBiolinkOnly) {
    const profile = biolinkConfig?.profile || biolinkConfig;
    return profile ? (
      <BiolinkMobileView
        profile={profile as any}
        products={productsConfig?.products || []}
        onProductClick={(productId) => {
          const index = (productsConfig?.products || []).findIndex(p => p.id === productId);
          if (index >= 0 && onProductClick) onProductClick(index);
        }}
        onLinkClick={(linkId) => {
          // Handle link click
        }}
      />
    ) : null;
  }

  return (
    <div className="font-sans">
      {/* ─── TOP NAVIGATION ─── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {template.heroTitle.charAt(0)}
              </div>
              <span className="text-lg font-bold text-gray-900">
                {template.heroTitle.split(' ').slice(0, 3).join(' ')}
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {template.pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activePage === page
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              {customPages?.map((page) => (
                <button
                  key={page.slug}
                  onClick={() => onPageChange?.(page.slug)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activePage === page.slug
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  {page.name}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ─── SPLIT HERO (Razorpay Style) ─── */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {editable && (
          <div className="absolute top-6 right-6 z-20">
            <span className="bg-white px-4 py-2 text-sm font-medium rounded-full shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">Change Image</span>
          </div>
        )}

        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[85vh] py-16">
            {/* LEFT: Text Content */}
            <div className="space-y-8 lg:pr-12">
              {/* Premium badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 px-5 py-2 rounded-full border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <Text
                  value={template.heroTagline}
                  onChange={(v: string) => onUpdateHero?.({ heroTagline: v })}
                  className="text-xs font-semibold text-blue-700 uppercase tracking-wider"
                  tag="span"
                />
              </div>

              {/* Headline */}
              <div className="space-y-6">
                <Text
                  value={template.heroTitle}
                  onChange={(v: string) => onUpdateHero?.({ heroTitle: v })}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight"
                  tag="h1"
                />

                <Text
                  value={template.heroDescription}
                  onChange={(v: string) => onUpdateHero?.({ heroDescription: v })}
                  className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl"
                  tag="p"
                />
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-4 flex-wrap">
                {editable ? (
                  <Button size="lg" className="text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold">
                    <InlineInput value={template.heroCta} onChange={(v) => onUpdateHero?.({ heroCta: v })} />
                  </Button>
                ) : (
                  <Button size="lg" className="text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold" onClick={() => onCtaClick?.()}>
                    {template.heroCta}
                  </Button>
                )}
                <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-full border-2 border-gray-300 font-semibold hover:bg-gray-50 hover:scale-105 transition-all">
                  Learn More
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["https://i.pravatar.cc/150?img=1", "https://i.pravatar.cc/150?img=2", "https://i.pravatar.cc/150?img=3", "https://i.pravatar.cc/150?img=4"].map((img, i) => (
                      <img key={i} src={img} alt="User" className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover" />
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">30,000+</div>
                    <div className="text-xs text-gray-600">Happy Students</div>
                  </div>
                </div>

                <div className="h-12 w-px bg-gray-300" />

                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">4.9/5</div>
                    <div className="text-xs text-gray-600">2,500+ reviews</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Image/Visual */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />
                <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />

                {/* Main image */}
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-premium-lg">
                  <img
                    src={template.bannerImage}
                    alt="Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop"; }}
                  />
                </div>

                {/* Floating badge (optional) */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-premium p-6 z-20 hidden lg:block">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">100%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-center gap-6 px-6 py-3 flex-wrap max-w-4xl mx-auto">
          {/* Template Pages */}
          {template.pages.map((p) => (
            <span
              key={p}
              onClick={() => onPageChange?.(p)}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                activePage === p ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >{p}</span>
          ))}

          {/* Custom Pages */}
          {customPages.sort((a, b) => a.order - b.order).map((page) => {
            const Icon = getIconComponent(page.icon || "file");
            return (
              <span
                key={page.id}
                onClick={() => onPageChange?.(page.slug)}
                className={`text-sm font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activePage === page.slug ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {page.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-0">
        {editable && onAddSection && <AddSectionDivider onAdd={onAddSection} />}
        {visibleSections.map((section, idx) => {
          const sectionIndex = sections.findIndex(s => s.id === section.id);
          return (
            <div key={section.id}>
              <div className="relative group/section">
                {editable && onRemoveSection && onMoveSection && (
                  <SectionToolbar
                    label={section.label}
                    index={sectionIndex}
                    total={sections.length}
                    onRemove={() => onRemoveSection(section.id)}
                    onMove={(dir) => onMoveSection(sectionIndex, dir)}
                  />
                )}
                <div className={editable ? "ring-0 hover:ring-1 hover:ring-primary/20 rounded-lg transition-shadow" : ""}>
                  <SectionRenderer section={section} editable={editable} onUpdate={(data) => onUpdateSection?.(section.id, data)} templateId={templateId} category={category} onCtaClick={onCtaClick} onProductClick={onProductClick} productsConfig={productsConfig} contactForm={contactForm} siteId={siteId} onLeadCreated={onLeadCreated} onOpenProductModal={onOpenProductModal} biolinkConfig={biolinkConfig} />
                </div>
              </div>
              {editable && onAddSection && <AddSectionDivider onAdd={onAddSection} />}
            </div>
          );
        })}

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border">
          <div className="max-w-4xl mx-auto px-8 py-10 text-center">
            <p className="text-xs text-muted-foreground">Built with Smart Pages • Powered by Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────── Section Renderer ────────────────

const SectionRenderer = ({ section, editable, onUpdate, templateId, category, onCtaClick, onProductClick, productsConfig, contactForm, siteId, onLeadCreated, onOpenProductModal, biolinkConfig }: { section: SectionData; editable: boolean; onUpdate: (data: Record<string, any>) => void; templateId?: string; category?: string; onCtaClick?: () => void; onProductClick?: (index: number) => void; productsConfig?: ProductsConfig; contactForm?: ContactFormConfig; siteId?: string; onLeadCreated?: (lead: Lead) => void; onOpenProductModal?: () => void; biolinkConfig?: BiolinkConfig }) => {
  const { type, data } = section;
  switch (type) {
    case "about": return <AboutSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "services": return <CardsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "features": return <CardsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "pricing": return <PricingSection data={data} editable={editable} onUpdate={onUpdate} onCtaClick={onCtaClick} />;
    case "testimonials": return <TestimonialsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "google-reviews": return <GoogleReviewsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "faq": return <FaqSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "team": return <TeamSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "gallery": return <GallerySection data={data} />;
    case "stats": return <StatsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "cta-banner": return <CtaBannerSection data={data} editable={editable} onUpdate={onUpdate} onCtaClick={onCtaClick} />;
    case "contact-form": return contactForm ? <ContactFormSectionComponent config={contactForm} products={productsConfig?.products || []} siteId={siteId || ""} onLeadCreated={onLeadCreated} /> : <ContactFormSection data={data} />;
    case "curriculum": return <CurriculumSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "schedule": return <ScheduleSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "speakers": return <SpeakersSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "newsletter": return <NewsletterSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "clients": return <ClientsSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "portfolio": return <PortfolioSection data={data} />;
    case "impact": return <ImpactSection data={data} />;
    case "donation": return <DonationSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "products": return <ProductsSection data={data} editable={editable} onUpdate={onUpdate} templateId={templateId} category={category} onProductClick={onProductClick} productsConfig={productsConfig} onOpenProductModal={onOpenProductModal} />;
    case "video-embed": return <VideoSection data={data} />;
    case "countdown": return <CountdownSection data={data} />;
    case "biolink": {
      // Support both BiolinkConfig (with profile field) and direct BiolinkProfile
      const profile = biolinkConfig?.profile || biolinkConfig;
      return profile ? (
        <BiolinkMobileView
          profile={profile as any}
          products={productsConfig?.products || []}
          onProductClick={(productId) => {
            const index = (productsConfig?.products || []).findIndex(p => p.id === productId);
            if (index >= 0 && onProductClick) onProductClick(index);
          }}
        />
      ) : null;
    }
    default: return null;
  }
};

// ──────────────── Helpers ────────────────

const SectionWrapper = ({ children, className = "", alternate = false }: { children: React.ReactNode; className?: string; alternate?: boolean }) => (
  <div className={`px-8 py-14 ${alternate ? "bg-muted/30" : ""} ${className}`}>
    <div className="max-w-4xl mx-auto">{children}</div>
  </div>
);

const SectionHeading = ({ text, subtitle, editable, onChange }: { text: string; subtitle?: string; editable?: boolean; onChange?: (v: string) => void }) => {
  if (editable && onChange) {
    return (
      <div className="text-center mb-10">
        <InlineInput value={text} onChange={onChange} className="text-2xl md:text-3xl font-bold text-foreground block" />
        {subtitle && <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">{subtitle}</p>}
      </div>
    );
  }
  return (
    <div className="text-center mb-10">
      <h3 className="text-2xl md:text-3xl font-bold text-foreground">{text}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">{subtitle}</p>}
      <div className="mt-3 mx-auto w-12 h-1 rounded-full bg-primary/60" />
    </div>
  );
};

const ItemAddButton = ({ onClick, label = "Add item" }: { onClick: () => void; label?: string }) => (
  <button onClick={onClick} className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors w-full">
    <Plus className="h-3 w-3" /> {label}
  </button>
);

const ItemRemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="absolute -top-1.5 -right-1.5 z-10 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm">
    <Trash2 className="h-3 w-3" />
  </button>
);

const updateItem = (items: any[], index: number, field: string, value: string) => {
  const updated = [...items];
  updated[index] = { ...updated[index], [field]: value };
  return updated;
};

// ──────────────── Individual Sections ────────────────

const AboutSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper>
    <div className="grid md:grid-cols-2 gap-10 items-center">
      {data.image && (
        <div className="relative">
          <img src={data.image} alt="About" className="w-full rounded-2xl object-cover h-72 shadow-xl" />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-primary/10 -z-10" />
        </div>
      )}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 text-xs font-medium text-primary mb-2">About Us</div>
        {editable ? (
          <>
            <InlineInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} className="text-2xl font-bold text-foreground block" />
            <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-muted-foreground leading-relaxed block" />
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-foreground">{data.heading}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.text}</p>
          </>
        )}
        <Button className="mt-2">Get Started</Button>
      </div>
    </div>
  </SectionWrapper>
);

const CardsSection = ({ data, editable, onUpdate }: any) => {
  const iconBgs = ["bg-blue-500/10 text-blue-600", "bg-emerald-500/10 text-emerald-600", "bg-amber-500/10 text-amber-600", "bg-purple-500/10 text-purple-600", "bg-rose-500/10 text-rose-600", "bg-cyan-500/10 text-cyan-600"];
  return (
    <SectionWrapper alternate>
      <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {data.items?.map((item: any, i: number) => (
          <div key={i} className="relative group/item rounded-2xl border border-border bg-background p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${iconBgs[i % iconBgs.length]}`}>
              {item.icon}
            </div>
            {editable ? (
              <>
                <InlineInput value={item.title} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "title", v) })} className="font-semibold text-foreground text-sm block mb-2" />
                <InlineInput value={item.desc} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "desc", v) })} className="text-xs text-muted-foreground leading-relaxed block" />
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground text-sm mb-2">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </>
            )}
          </div>
        ))}
        {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { icon: "✨", title: "New Item", desc: "Description" }] })} /></div>}
      </div>
    </SectionWrapper>
  );
};

const PricingSection = ({ data, editable, onUpdate, onCtaClick }: any) => (
  <SectionWrapper>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className={`grid gap-6 ${data.tiers?.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-3"}`}>
      {data.tiers?.map((tier: any, i: number) => (
        <div key={i} className={`relative group/item rounded-2xl border-2 p-7 transition-all duration-300 hover:shadow-xl ${tier.highlighted ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/10 scale-[1.03]" : "border-border hover:-translate-y-1"}`}>
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ tiers: data.tiers.filter((_: any, j: number) => j !== i) })} />}
          {tier.highlighted && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="text-[11px] font-bold uppercase text-primary-foreground bg-primary px-4 py-1 rounded-full shadow-lg">Most Popular</span>
            </div>
          )}
          <div className="text-center">
            {editable ? (
              <>
                <InlineInput value={tier.name} onChange={(v) => onUpdate({ tiers: updateItem(data.tiers, i, "name", v) })} className="font-semibold text-foreground text-lg block" />
                <InlineInput value={tier.price} onChange={(v) => onUpdate({ tiers: updateItem(data.tiers, i, "price", v) })} className="text-4xl font-extrabold text-foreground my-4 block" />
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground text-lg">{tier.name}</p>
                <p className="text-4xl font-extrabold text-foreground my-4">{tier.price}<span className="text-sm font-normal text-muted-foreground">{tier.period}</span></p>
              </>
            )}
          </div>
          <ul className="text-sm text-muted-foreground space-y-3 mb-6">
            {tier.features?.map((f: string, j: number) => (
              <li key={j} className="flex items-start gap-2.5">
                <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? "text-primary" : "text-muted-foreground/60"}`} />
                {f}
              </li>
            ))}
          </ul>
          <Button variant={tier.highlighted ? "default" : "outline"} className={`w-full rounded-xl py-5 ${tier.highlighted ? "shadow-md shadow-primary/20" : ""}`} onClick={() => !editable && onCtaClick?.()}>
            Choose {tier.name}
          </Button>
        </div>
      ))}
    </div>
    {editable && <div className="mt-4"><ItemAddButton onClick={() => onUpdate({ tiers: [...(data.tiers || []), { name: "New Plan", price: "$0", period: "/mo", features: ["Feature 1"], highlighted: false }] })} label="Add pricing tier" /></div>}
  </SectionWrapper>
);

const TestimonialsSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper alternate>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {data.items?.map((t: any, i: number) => (
        <div key={i} className="relative group/item rounded-2xl border border-border bg-background p-6 hover:shadow-lg transition-all">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
          <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
          {editable ? (
            <>
              <InlineInput value={t.text} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "text", v) })} className="text-sm text-muted-foreground leading-relaxed mb-5 block" />
              <InlineInput value={t.name} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "name", v) })} className="text-sm font-semibold text-foreground block" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-bold">{t.avatar}</div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
              </div>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { name: "New User", text: "Great experience!", rating: 5, avatar: "N" }] })} label="Add testimonial" /></div>}
    </div>
  </SectionWrapper>
);

const GoogleReviewsSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-6 w-6" />
        <span className="text-3xl font-bold text-foreground">{data.overallRating}</span>
        <div className="flex gap-0.5 ml-1">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-5 w-5 ${j < Math.floor(data.overallRating) ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />)}</div>
      </div>
      <p className="text-sm text-muted-foreground">{data.totalReviews} reviews on Google</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {data.reviews?.map((r: any, i: number) => (
        <div key={i} className="relative group/item rounded-2xl border border-border bg-background p-5">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ reviews: data.reviews.filter((_: any, j: number) => j !== i) })} />}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}</div>
            <span className="text-[10px] text-muted-foreground">{r.date}</span>
          </div>
          {editable ? (
            <>
              <InlineInput value={r.text} onChange={(v) => onUpdate({ reviews: updateItem(data.reviews, i, "text", v) })} className="text-sm text-muted-foreground mb-3 block" />
              <InlineInput value={r.name} onChange={(v) => onUpdate({ reviews: updateItem(data.reviews, i, "name", v) })} className="text-sm font-medium text-foreground block" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">"{r.text}"</p>
              <p className="text-sm font-medium text-foreground">{r.name}</p>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ reviews: [...(data.reviews || []), { name: "New Reviewer", text: "Amazing!", rating: 5, date: "Recently" }] })} label="Add review" /></div>}
    </div>
  </SectionWrapper>
);

const FaqSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="max-w-2xl mx-auto space-y-3">
      {data.items?.map((faq: any, i: number) => (
        <div key={i} className="relative group/item">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
          <details className="rounded-xl border border-border p-5 group open:bg-primary/[0.02] open:border-primary/20 transition-colors">
            <summary className="text-sm font-semibold text-foreground cursor-pointer list-none flex items-center justify-between gap-2">
              {editable ? <InlineInput value={faq.q} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "q", v) })} className="flex-1" /> : faq.q}
              <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0" />
            </summary>
            {editable ? (
              <InlineInput value={faq.a} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "a", v) })} className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed block" />
            ) : (
              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">{faq.a}</p>
            )}
          </details>
        </div>
      ))}
      {editable && <ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { q: "New Question?", a: "Answer here." }] })} label="Add FAQ" />}
    </div>
  </SectionWrapper>
);

const TeamSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper alternate>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {data.members?.map((m: any, i: number) => (
        <div key={i} className="relative group/item text-center p-6 rounded-2xl border border-border bg-background hover:shadow-lg transition-all">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ members: data.members.filter((_: any, j: number) => j !== i) })} />}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4 ring-4 ring-primary/10">{m.avatar}</div>
          {editable ? (
            <>
              <InlineInput value={m.name} onChange={(v) => onUpdate({ members: updateItem(data.members, i, "name", v) })} className="font-semibold text-foreground block" />
              <InlineInput value={m.role} onChange={(v) => onUpdate({ members: updateItem(data.members, i, "role", v) })} className="text-xs text-primary font-medium block mt-1" />
              <InlineInput value={m.bio} onChange={(v) => onUpdate({ members: updateItem(data.members, i, "bio", v) })} className="text-xs text-muted-foreground mt-2 block" />
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">{m.name}</p>
              <p className="text-xs text-primary font-medium mt-1">{m.role}</p>
              <p className="text-xs text-muted-foreground mt-2">{m.bio}</p>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ members: [...(data.members || []), { name: "New Member", role: "Role", bio: "Bio", avatar: "N" }] })} label="Add member" /></div>}
    </div>
  </SectionWrapper>
);

const GallerySection = ({ data }: any) => (
  <SectionWrapper alternate>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.images?.map((img: string, i: number) => (
        <img key={i} src={img} alt={`Gallery ${i + 1}`} className="rounded-2xl object-cover h-48 w-full hover:scale-[1.02] transition-transform shadow-md" />
      ))}
    </div>
  </SectionWrapper>
);

const StatsSection = ({ data, editable, onUpdate }: any) => (
  <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-12">
    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
      {data.items?.map((s: any, i: number) => (
        <div key={i} className="relative group/item text-center">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ items: data.items.filter((_: any, j: number) => j !== i) })} />}
          {editable ? (
            <>
              <InlineInput value={s.value} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "value", v) })} className="text-3xl md:text-4xl font-extrabold text-primary-foreground block" />
              <InlineInput value={s.label} onChange={(v) => onUpdate({ items: updateItem(data.items, i, "label", v) })} className="text-sm text-primary-foreground/70 mt-1 block" />
            </>
          ) : (
            <>
              <p className="text-3xl md:text-4xl font-extrabold text-primary-foreground">{s.value}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">{s.label}</p>
            </>
          )}
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ items: [...(data.items || []), { value: "0", label: "New Stat" }] })} label="Add stat" /></div>}
    </div>
  </div>
);

const CtaBannerSection = ({ data, editable, onUpdate, onCtaClick }: any) => (
  <div className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-foreground/5 -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-foreground/5 translate-y-1/2 -translate-x-1/2" />
    <div className="relative z-10 px-8 py-16 text-center max-w-2xl mx-auto">
      {editable ? (
        <>
          <InlineInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3 block" />
          <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-primary-foreground/80 mb-6 block" />
          <Button variant="secondary" size="lg" className="rounded-xl px-8 py-5 shadow-lg">
            <InlineInput value={data.buttonText} onChange={(v) => onUpdate({ buttonText: v })} />
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">{data.heading}</h3>
          <p className="text-sm text-primary-foreground/80 mb-6">{data.text}</p>
          <Button variant="secondary" size="lg" className="rounded-xl px-8 py-5 shadow-lg" onClick={() => onCtaClick?.()}>{data.buttonText}</Button>
        </>
      )}
    </div>
  </div>
);

const ContactFormSection = ({ data }: any) => (
  <SectionWrapper alternate>
    <SectionHeading text={data.heading} />
    <div className="max-w-lg mx-auto bg-background rounded-2xl border border-border p-8 shadow-sm">
      <div className="space-y-4">
        {data.fields?.map((f: any, i: number) => (
          <div key={i}>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">{f.label}{f.required && <span className="text-destructive"> *</span>}</label>
            {f.type === "textarea" ? (
              <textarea className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all" placeholder={f.label} />
            ) : (
              <Input type={f.type} placeholder={f.label} className="rounded-xl py-5" />
            )}
          </div>
        ))}
        <Button className="w-full rounded-xl py-5 text-base">{data.submitText}</Button>
      </div>
    </div>
  </SectionWrapper>
);

const CurriculumSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper alternate>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="max-w-2xl mx-auto space-y-3">
      {data.modules?.map((m: any, i: number) => (
        <div key={i} className="relative group/item">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ modules: data.modules.filter((_: any, j: number) => j !== i) })} />}
          <details className="rounded-xl border border-border bg-background p-5 group open:border-primary/20 open:shadow-md transition-all">
            <summary className="font-semibold text-foreground text-sm cursor-pointer list-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                {editable ? <InlineInput value={m.title} onChange={(v) => onUpdate({ modules: updateItem(data.modules, i, "title", v) })} /> : <span>{m.title}</span>}
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{m.duration}</span>
            </summary>
            <ul className="mt-4 space-y-2 pl-11">
              {m.lessons?.map((l: string, j: number) => (
                <li key={j} className="text-sm text-muted-foreground flex items-center gap-2.5">
                  <Play className="h-3.5 w-3.5 text-primary flex-shrink-0" />{l}
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}
      {editable && <ItemAddButton onClick={() => onUpdate({ modules: [...(data.modules || []), { title: "New Module", duration: "1h", lessons: ["Lesson 1"] }] })} label="Add module" />}
    </div>
  </SectionWrapper>
);

const ScheduleSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="max-w-2xl mx-auto space-y-3">
      {data.events?.map((e: any, i: number) => (
        <div key={i} className="relative group/item flex items-center gap-5 p-4 rounded-xl border border-border bg-background hover:border-primary/20 hover:shadow-sm transition-all">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ events: data.events.filter((_: any, j: number) => j !== i) })} />}
          <div className="text-xs font-bold text-primary bg-primary/10 rounded-lg px-3 py-2 flex-shrink-0 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />{e.time}
          </div>
          <div className="flex-1">
            {editable ? (
              <InlineInput value={e.title} onChange={(v) => onUpdate({ events: updateItem(data.events, i, "title", v) })} className="text-sm font-semibold text-foreground block" />
            ) : (
              <p className="text-sm font-semibold text-foreground">{e.title}</p>
            )}
            {e.speaker && <p className="text-xs text-muted-foreground mt-0.5">{e.speaker}</p>}
          </div>
        </div>
      ))}
      {editable && <ItemAddButton onClick={() => onUpdate({ events: [...(data.events || []), { time: "TBD", title: "New Event", speaker: "" }] })} label="Add event" />}
    </div>
  </SectionWrapper>
);

const SpeakersSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper alternate>
    <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.speakers?.map((s: any, i: number) => (
        <div key={i} className="relative group/item flex gap-5 p-6 rounded-2xl border border-border bg-background hover:shadow-lg transition-all">
          {editable && <ItemRemoveBtn onClick={() => onUpdate({ speakers: data.speakers.filter((_: any, j: number) => j !== i) })} />}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-2xl font-bold flex-shrink-0">{s.avatar}</div>
          <div>
            {editable ? (
              <>
                <InlineInput value={s.name} onChange={(v) => onUpdate({ speakers: updateItem(data.speakers, i, "name", v) })} className="font-bold text-foreground text-lg block" />
                <InlineInput value={s.title} onChange={(v) => onUpdate({ speakers: updateItem(data.speakers, i, "title", v) })} className="text-xs text-primary font-medium block mt-0.5" />
                <InlineInput value={s.bio} onChange={(v) => onUpdate({ speakers: updateItem(data.speakers, i, "bio", v) })} className="text-sm text-muted-foreground mt-2 leading-relaxed block" />
              </>
            ) : (
              <>
                <p className="font-bold text-foreground text-lg">{s.name}</p>
                <p className="text-xs text-primary font-medium mt-0.5">{s.title}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.bio}</p>
              </>
            )}
          </div>
        </div>
      ))}
      {editable && <div className="flex items-center"><ItemAddButton onClick={() => onUpdate({ speakers: [...(data.speakers || []), { name: "New Speaker", title: "Title", bio: "Bio", avatar: "N" }] })} label="Add speaker" /></div>}
    </div>
  </SectionWrapper>
);

const NewsletterSection = ({ data, editable, onUpdate }: any) => (
  <SectionWrapper>
    <div className="max-w-md mx-auto text-center rounded-2xl border border-border p-8 bg-gradient-to-br from-muted/50 to-muted/20">
      {editable ? (
        <>
          <InlineInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} className="text-lg font-bold text-foreground mb-2 block" />
          <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-muted-foreground mb-5 block" />
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-foreground mb-2">{data.heading}</h3>
          <p className="text-sm text-muted-foreground mb-5">{data.text}</p>
        </>
      )}
      <div className="flex gap-2">
        <Input placeholder="your@email.com" className="flex-1 rounded-xl py-5" />
        <Button className="rounded-xl px-6">{data.buttonText}</Button>
      </div>
    </div>
  </SectionWrapper>
);

const ClientsSection = ({ data, editable, onUpdate }: any) => (
  <div className="px-8 py-10 border-y border-border bg-muted/20">
    <div className="max-w-4xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-center text-muted-foreground mb-6">{data.heading}</p>
      <div className="flex items-center justify-center gap-10 flex-wrap">
        {data.names?.map((name: string, i: number) => (
          <div key={i} className="relative group/item">
            {editable && <ItemRemoveBtn onClick={() => onUpdate({ names: data.names.filter((_: any, j: number) => j !== i) })} />}
            {editable ? (
              <InlineInput value={name} onChange={(v) => { const updated = [...data.names]; updated[i] = v; onUpdate({ names: updated }); }} className="text-xl font-bold text-muted-foreground/30 hover:text-muted-foreground transition-colors" />
            ) : (
              <div className="text-xl font-bold text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-default">{name}</div>
            )}
          </div>
        ))}
        {editable && <button onClick={() => onUpdate({ names: [...(data.names || []), "New Client"] })} className="text-muted-foreground hover:text-foreground"><Plus className="h-5 w-5" /></button>}
      </div>
    </div>
  </div>
);

const PortfolioSection = ({ data }: any) => (
  <SectionWrapper>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {data.items?.map((item: any, i: number) => (
        <div key={i} className="rounded-2xl border border-border overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="overflow-hidden">
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-primary font-medium">{item.category}</p>
          </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

const ImpactSection = ({ data }: any) => (
  <SectionWrapper>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.stories?.map((story: any, i: number) => (
        <div key={i} className="rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group">
          <div className="overflow-hidden">
            <img src={story.image} alt={story.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-5">
            <p className="font-semibold text-foreground mb-2">{story.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{story.text}</p>
          </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

const DonationSection = ({ data, editable, onUpdate }: any) => {
  const percent = parseInt(data.raised?.replace(/[^0-9]/g, "") || "0") / parseInt(data.goal?.replace(/[^0-9]/g, "") || "1") * 100;
  return (
    <SectionWrapper>
      <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
      <div className="max-w-lg mx-auto text-center">
        {editable ? (
          <InlineInput value={data.text} onChange={(v) => onUpdate({ text: v })} className="text-sm text-muted-foreground mb-6 block" />
        ) : (
          <p className="text-sm text-muted-foreground mb-6">{data.text}</p>
        )}
        <div className="w-full bg-muted rounded-full h-4 mb-3 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/70 h-4 rounded-full transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
        <p className="text-sm text-foreground mb-6"><span className="font-bold text-lg">{data.raised}</span> raised of {data.goal} goal</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {data.amounts?.map((amt: string, i: number) => (
            <Button key={i} variant="outline" className="rounded-xl px-6">{amt}</Button>
          ))}
          <Button className="rounded-xl px-6">Custom Amount</Button>
        </div>
      </div>
    </SectionWrapper>
  );
};

const ProductsSection = ({ data, editable, onUpdate, templateId, category, onProductClick, productsConfig, onOpenProductModal }: any) => {
  const isEducation = category === "education";

  // Use productsConfig.products if available, otherwise fall back to data.items
  const products = productsConfig?.products || data.items || [];

  // Helper to get price display for a product
  const getPriceDisplay = (item: any) => {
    if (item.price) return item.price; // Legacy format
    if (item.pricingModels && item.pricingModels.length > 0) {
      const prices = item.pricingModels.map((pm: any) => pm.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === max) {
        return `₹${min.toLocaleString()}`;
      }
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    }
    return "Price not set";
  };

  return (
    <SectionWrapper>
      <SectionHeading text={data.heading} editable={editable} onChange={(v) => onUpdate({ heading: v })} />
      {products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
          <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {editable ? "No products yet. Add your first product to get started!" : "No products available at the moment."}
          </p>
          {editable && onOpenProductModal && (
            <Button onClick={onOpenProductModal} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((item: any, i: number) => {
            const description = item.description || item.desc || "";
            return (
              <div key={item.id || i} className="relative group/item rounded-2xl border border-border bg-background overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="cursor-pointer" onClick={() => !editable && onProductClick?.(i)}>
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-44 object-cover group-hover/item:scale-110 transition-transform duration-500" />
                    {item.badge && <span className="absolute top-3 left-3 text-[10px] font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-lg">{item.badge}</span>}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</p>
                    {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="text-lg font-bold text-primary">{getPriceDisplay(item)}</p>
                    </div>
                    {!editable && (
                      <Button size="sm" className="w-full mt-3 rounded-xl font-semibold">
                        {isEducation ? `Buy Course for ${getPriceDisplay(item)}` : `Buy Now - ${getPriceDisplay(item)}`}
                      </Button>
                    )}
                    {editable && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        Edit in Products Tab →
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {editable && onOpenProductModal && (
            <div
              onClick={onOpenProductModal}
              className="rounded-2xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[320px] group"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Add Product</p>
              <p className="text-xs text-muted-foreground mt-1">Click to create</p>
            </div>
          )}
        </div>
      )}
    </SectionWrapper>
  );
};

const VideoSection = ({ data }: any) => (
  <SectionWrapper>
    <SectionHeading text={data.heading} />
    <div className="max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-xl cursor-pointer group hover:shadow-2xl transition-all">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
          <Play className="h-7 w-7 ml-1" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Click to play</p>
      </div>
    </div>
  </SectionWrapper>
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
    <div className="bg-gradient-to-r from-muted/50 to-muted/30 px-8 py-14">
      <div className="max-w-4xl mx-auto text-center">
        <SectionHeading text={data.heading} />
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {Object.entries(timeLeft).map(([label, val]) => (
            <div key={label} className="text-center">
              <div className="text-3xl md:text-5xl font-extrabold text-foreground bg-background rounded-2xl w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shadow-lg border border-border">{val}</div>
              <p className="text-xs text-muted-foreground mt-2 capitalize font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitePreview;
