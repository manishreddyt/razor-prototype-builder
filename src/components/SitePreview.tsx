import { useState, useEffect } from "react";
import { type SectionData, type TemplateData } from "@/data/smartPageTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Clock, Play, ChevronDown, ChevronUp, Plus, Trash2, GripVertical, Pencil } from "lucide-react";

interface SitePreviewProps {
  template: TemplateData;
  sections: SectionData[];
  editable?: boolean;
  onUpdateSection?: (id: string, data: Record<string, any>) => void;
  onUpdateHero?: (updates: Partial<Pick<TemplateData, "heroTitle" | "heroTagline" | "heroDescription" | "heroCta" | "bannerImage">>) => void;
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

export const SitePreview = ({ template, sections, editable = false, onUpdateSection, onUpdateHero }: SitePreviewProps) => {
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

      <div className="p-6 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">
            {template.heroTitle.charAt(0)}
          </div>
          <Text value={template.heroTitle} onChange={(v: string) => onUpdateHero?.({ heroTitle: v })} className="text-3xl font-bold text-foreground block" tag="h1" />
          <Text value={template.heroTagline} onChange={(v: string) => onUpdateHero?.({ heroTagline: v })} className="text-lg text-muted-foreground block" tag="p" />
          <Text value={template.heroDescription} onChange={(v: string) => onUpdateHero?.({ heroDescription: v })} className="text-sm text-muted-foreground max-w-2xl mx-auto block" tag="p" />
          <Button className="mt-4" size="lg">{template.heroCta}</Button>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-center gap-4 border-b border-border pb-4 flex-wrap">
          {template.pages.map((p) => (
            <span key={p} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{p}</span>
          ))}
        </div>

        {/* Sections */}
        {visibleSections.map((section) => (
          <SectionRenderer key={section.id} section={section} editable={editable} onUpdate={(data) => onUpdateSection?.(section.id, data)} />
        ))}

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
    case "pricing": return <PricingSection data={data} />;
    case "testimonials": return <TestimonialsSection data={data} />;
    case "google-reviews": return <GoogleReviewsSection data={data} />;
    case "faq": return <FaqSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "team": return <TeamSection data={data} />;
    case "gallery": return <GallerySection data={data} />;
    case "stats": return <StatsSection data={data} />;
    case "cta-banner": return <CtaBannerSection data={data} editable={editable} onUpdate={onUpdate} />;
    case "contact-form": return <ContactFormSection data={data} />;
    case "curriculum": return <CurriculumSection data={data} />;
    case "schedule": return <ScheduleSection data={data} />;
    case "speakers": return <SpeakersSection data={data} />;
    case "newsletter": return <NewsletterSection data={data} />;
    case "clients": return <ClientsSection data={data} />;
    case "portfolio": return <PortfolioSection data={data} />;
    case "impact": return <ImpactSection data={data} />;
    case "donation": return <DonationSection data={data} />;
    case "products": return <ProductsSection data={data} />;
    case "video-embed": return <VideoSection data={data} />;
    case "countdown": return <CountdownSection data={data} />;
    default: return null;
  }
};

// ──────────────── Individual Sections ────────────────

const SectionHeading = ({ text }: { text: string }) => (
  <h3 className="text-xl font-semibold text-foreground text-center mb-6">{text}</h3>
);

const AboutSection = ({ data, editable, onUpdate }: any) => (
  <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-6 items-center">
    {data.image && <img src={data.image} alt="About" className="w-full md:w-1/3 rounded-lg object-cover h-48" />}
    <div className="flex-1">
      <h3 className="text-xl font-semibold text-foreground mb-3">{data.heading}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{data.text}</p>
    </div>
  </div>
);

const CardsSection = ({ data, editable, onUpdate }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.items?.map((item: any, i: number) => (
        <div key={i} className="rounded-lg border border-border p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">{item.icon}</div>
          <p className="font-medium text-foreground text-sm">{item.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const PricingSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className={`grid gap-4 ${data.tiers?.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {data.tiers?.map((tier: any, i: number) => (
        <div key={i} className={`rounded-lg border p-5 text-center ${tier.highlighted ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"}`}>
          {tier.highlighted && <span className="text-[10px] font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">Most Popular</span>}
          <p className="font-medium text-foreground mt-2">{tier.name}</p>
          <p className="text-3xl font-bold text-foreground my-3">{tier.price}<span className="text-sm font-normal text-muted-foreground">{tier.period}</span></p>
          <ul className="text-xs text-muted-foreground space-y-2 mb-4 text-left">
            {tier.features?.map((f: string, j: number) => <li key={j} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">✓</span>{f}</li>)}
          </ul>
          <Button variant={tier.highlighted ? "default" : "outline"} size="sm" className="w-full">Choose {tier.name}</Button>
        </div>
      ))}
    </div>
  </div>
);

const TestimonialsSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.items?.map((t: any, i: number) => (
        <div key={i} className="rounded-lg border border-border p-5">
          <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}</div>
          <p className="text-sm text-muted-foreground italic mb-3">"{t.text}"</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">{t.avatar}</div>
            <p className="text-xs font-medium text-foreground">{t.name}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GoogleReviewsSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
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
        <div key={i} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
            <span className="text-[10px] text-muted-foreground">{r.date}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">"{r.text}"</p>
          <p className="text-xs font-medium text-foreground">{r.name}</p>
        </div>
      ))}
    </div>
  </div>
);

const FaqSection = ({ data, editable, onUpdate }: any) => (
  <div className="max-w-2xl mx-auto">
    <SectionHeading text={data.heading} />
    <div className="space-y-3">
      {data.items?.map((faq: any, i: number) => (
        <details key={i} className="rounded-lg border border-border p-4 group open:bg-secondary/30">
          <summary className="text-sm font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
            {faq.q}
            <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
          </summary>
          <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">{faq.a}</p>
        </details>
      ))}
    </div>
  </div>
);

const TeamSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.members?.map((m: any, i: number) => (
        <div key={i} className="text-center p-4 rounded-lg border border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold mx-auto mb-3">{m.avatar}</div>
          <p className="font-medium text-foreground text-sm">{m.name}</p>
          <p className="text-xs text-primary">{m.role}</p>
          <p className="text-xs text-muted-foreground mt-1">{m.bio}</p>
        </div>
      ))}
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

const StatsSection = ({ data }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {data.items?.map((s: any, i: number) => (
      <div key={i} className="text-center p-4 rounded-lg bg-secondary/50">
        <p className="text-2xl font-bold text-foreground">{s.value}</p>
        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
      </div>
    ))}
  </div>
);

const CtaBannerSection = ({ data, editable, onUpdate }: any) => (
  <div className="rounded-lg bg-primary p-8 text-center">
    <h3 className="text-xl font-bold text-primary-foreground mb-2">{data.heading}</h3>
    <p className="text-sm text-primary-foreground/80 mb-4">{data.text}</p>
    <Button variant="secondary" size="lg">{data.buttonText}</Button>
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

const CurriculumSection = ({ data }: any) => (
  <div className="max-w-2xl mx-auto">
    <SectionHeading text={data.heading} />
    <div className="space-y-3">
      {data.modules?.map((m: any, i: number) => (
        <details key={i} className="rounded-lg border border-border p-4 group">
          <summary className="font-medium text-foreground text-sm cursor-pointer list-none flex items-center justify-between">
            <span>{m.title}</span>
            <span className="text-xs text-muted-foreground">{m.duration}</span>
          </summary>
          <ul className="mt-3 space-y-1.5 pl-4">
            {m.lessons?.map((l: string, j: number) => (
              <li key={j} className="text-sm text-muted-foreground flex items-center gap-2"><Play className="h-3 w-3 text-primary" />{l}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  </div>
);

const ScheduleSection = ({ data }: any) => (
  <div className="max-w-2xl mx-auto">
    <SectionHeading text={data.heading} />
    <div className="space-y-2">
      {data.events?.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
          <div className="text-xs font-semibold text-primary w-20 flex-shrink-0 flex items-center gap-1"><Clock className="h-3 w-3" />{e.time}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{e.title}</p>
            {e.speaker && <p className="text-xs text-muted-foreground">{e.speaker}</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SpeakersSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.speakers?.map((s: any, i: number) => (
        <div key={i} className="text-center p-5 rounded-lg border border-border">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold mx-auto mb-3">{s.avatar}</div>
          <p className="font-medium text-foreground">{s.name}</p>
          <p className="text-xs text-primary">{s.title}</p>
          <p className="text-xs text-muted-foreground mt-2">{s.bio}</p>
        </div>
      ))}
    </div>
  </div>
);

const NewsletterSection = ({ data }: any) => (
  <div className="max-w-md mx-auto text-center rounded-lg border border-border p-6 bg-secondary/30">
    <h3 className="text-lg font-semibold text-foreground mb-1">{data.heading}</h3>
    <p className="text-sm text-muted-foreground mb-4">{data.text}</p>
    <div className="flex gap-2">
      <Input placeholder="your@email.com" className="flex-1" />
      <Button>{data.buttonText}</Button>
    </div>
  </div>
);

const ClientsSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="flex items-center justify-center gap-8 flex-wrap">
      {data.names?.map((name: string, i: number) => (
        <div key={i} className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors">{name}</div>
      ))}
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

const DonationSection = ({ data }: any) => {
  const percent = parseInt(data.raised?.replace(/[^0-9]/g, "") || "0") / parseInt(data.goal?.replace(/[^0-9]/g, "") || "1") * 100;
  return (
    <div className="max-w-lg mx-auto text-center">
      <SectionHeading text={data.heading} />
      <p className="text-sm text-muted-foreground mb-4">{data.text}</p>
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

const ProductsSection = ({ data }: any) => (
  <div>
    <SectionHeading text={data.heading} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.items?.map((item: any, i: number) => (
        <div key={i} className="rounded-lg border border-border overflow-hidden group hover:shadow-md transition-shadow">
          <div className="relative">
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
            {item.badge && <span className="absolute top-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{item.badge}</span>}
          </div>
          <div className="p-3">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-sm font-bold text-primary mt-1">{item.price}</p>
            <Button size="sm" variant="outline" className="w-full mt-2">Add to Cart</Button>
          </div>
        </div>
      ))}
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
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
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
