import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Settings, MoreHorizontal, Trash2, Copy, Globe, ExternalLink, BarChart3, Eye } from "lucide-react";
import { pageTypeLabels, pageTypeColors } from "@/types/smartPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { templates, CustomPage } from "@/data/smartPageTemplates";
import { academyTemplate, coachingTemplate, webinarTemplate } from "@/data/productTemplates";
import { ProductsConfig } from "@/types/products";
import { ContactFormConfig, Lead, ContactFormField } from "@/types/leads";
import { CategoryConfig } from "@/types/categories";
import { Order } from "@/types/orders";
import { BiolinkConfig } from "@/types/biolink";


export interface SmartPageSite {
  id: string;
  name: string;
  type: string;
  category: string;
  url: string;
  slug: string;
  templateId: string;
  created: string;
  views: number;
  conversions: number;
  status: "Published" | "Draft";
  amount?: number;
  transactions?: number;
  pageType?: "course" | "webinar" | "coaching" | "workshop" | "membership";
  /** Products configuration */
  productsConfig?: ProductsConfig;
  /** Contact form configuration */
  contactForm?: ContactFormConfig;
  /** Leads captured via contact forms */
  leads?: Lead[];
  /** Custom pages beyond template pages */
  customPages?: CustomPage[];
  /** Category configuration for e-commerce */
  categoryConfig?: CategoryConfig;
  /** Orders for e-commerce sites */
  orders?: Order[];
  /** Biolink configuration */
  biolinkConfig?: BiolinkConfig;
}

const STORAGE_KEY = "smart-pages-sites";

// Migration: ensure old sites have all required fields
const migrateSite = (s: any): SmartPageSite => {
  // Legacy migration: ensure slug/templateId exist
  if (!s.slug) {
    const tpl = templates.find(t => t.title.toLowerCase() === s.type?.toLowerCase() || t.id === s.type);
    s.templateId = tpl?.id || s.type || "";
    s.slug = s.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `page-${s.id}`;
    s.url = `/s/${s.slug}`;
  }
  if (!s.amount && s.amount !== 0) s.amount = 0;
  if (!s.transactions && s.transactions !== 0) s.transactions = 0;

  // Phase 8 migration: add products/leads/contactForm defaults
  if (!s.productsConfig) {
    s.productsConfig = {
      enabled: false,
      products: [],
      displayMode: "grid",
      showPricing: true,
      categoriesEnabled: false
    };
  }

  if (!s.contactForm) {
    s.contactForm = {
      enabled: false,
      title: "Get in Touch",
      description: "Have questions? We'd love to hear from you.",
      fields: [
        { id: "name", label: "Full Name", type: "text" as const, required: true, placeholder: "Your name" },
        { id: "email", label: "Email", type: "email" as const, required: true, placeholder: "your.email@example.com" },
        { id: "message", label: "Message", type: "textarea" as const, required: true, placeholder: "How can we help?" }
      ] as ContactFormField[],
      includeInterests: false,
      autoReply: false,
      successMessage: "Thank you! We'll be in touch soon."
    };
  }

  if (!s.leads) {
    s.leads = [];
  }

  if (!s.customPages) {
    s.customPages = [];
  }

  // Social Commerce migration: add category/orders/biolink defaults
  if (!s.categoryConfig) {
    s.categoryConfig = {
      enabled: false,
      categories: [],
      allowCustomCategories: true,
      displayMode: "tabs"
    };
  }

  if (!s.orders) {
    s.orders = [];
  }

  if (!s.biolinkConfig) {
    s.biolinkConfig = {
      enabled: false,
      slug: s.slug || `bio-${s.id}`,
      profile: {
        enabled: false,
        displayName: "",
        bio: "",
        theme: "light",
        socialLinks: [],
        showContactButton: false,
        showProductsSection: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  return s as SmartPageSite;
};

export const getStoredSites = (): SmartPageSite[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const migrated = parsed.map(migrateSite);
      // Persist migration
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {}
  // Create sample sites from NEW product templates
  const defaults: SmartPageSite[] = [
    {
      id: "demo_academy",
      name: academyTemplate.heroTitle,
      type: academyTemplate.title,
      category: academyTemplate.category,
      slug: "online-academy-demo",
      templateId: academyTemplate.id,
      url: "/s/online-academy-demo",
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 1240,
      conversions: 142,
      status: "Published",
      amount: academyTemplate.productsConfig?.products[0]?.pricingModels[0]?.price || 4999,
      transactions: 142,
      pageType: "course",
      productsConfig: academyTemplate.productsConfig,
      contactForm: academyTemplate.contactForm,
      leads: [],
      customPages: [],
      categoryConfig: {
        enabled: false,
        categories: [],
        allowCustomCategories: true,
        displayMode: "tabs"
      },
      orders: [],
      biolinkConfig: {
        enabled: false,
        slug: "online-academy-demo-bio",
        profile: {
          enabled: false,
          displayName: "",
          bio: "",
          theme: "light",
          socialLinks: [],
          showContactButton: false,
          showProductsSection: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: "demo_coaching",
      name: coachingTemplate.heroTitle,
      type: coachingTemplate.title,
      category: coachingTemplate.category,
      slug: "coaching-demo",
      templateId: coachingTemplate.id,
      url: "/s/coaching-demo",
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 890,
      conversions: 78,
      status: "Published",
      amount: coachingTemplate.productsConfig?.products[0]?.pricingModels[0]?.price || 2999,
      transactions: 78,
      productsConfig: coachingTemplate.productsConfig,
      contactForm: coachingTemplate.contactForm,
      leads: [],
      customPages: [],
      categoryConfig: {
        enabled: false,
        categories: [],
        allowCustomCategories: true,
        displayMode: "tabs"
      },
      orders: [],
      biolinkConfig: {
        enabled: false,
        slug: "coaching-demo-bio",
        profile: {
          enabled: false,
          displayName: "",
          bio: "",
          theme: "light",
          socialLinks: [],
          showContactButton: false,
          showProductsSection: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: "demo_webinar",
      name: webinarTemplate.heroTitle,
      type: webinarTemplate.title,
      category: webinarTemplate.category,
      slug: "webinar-demo",
      templateId: webinarTemplate.id,
      url: "/s/webinar-demo",
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 560,
      conversions: 234,
      status: "Published",
      amount: webinarTemplate.productsConfig?.products[0]?.pricingModels[0]?.price || 499,
      transactions: 234,
      pageType: "webinar",
      productsConfig: webinarTemplate.productsConfig,
      contactForm: webinarTemplate.contactForm,
      leads: [],
      customPages: [],
      categoryConfig: {
        enabled: false,
        categories: [],
        allowCustomCategories: true,
        displayMode: "tabs"
      },
      orders: [],
      biolinkConfig: {
        enabled: false,
        slug: "webinar-demo-bio",
        profile: {
          enabled: false,
          displayName: "",
          bio: "",
          theme: "light",
          socialLinks: [],
          showContactButton: false,
          showProductsSection: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const storeSites = (sites: SmartPageSite[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
};

export const addSite = (site: SmartPageSite) => {
  const sites = getStoredSites();
  sites.unshift(site);
  storeSites(sites);
};

const WebsiteBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sites, setSites] = useState<SmartPageSite[]>(getStoredSites());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Handle Education Co-pilot handoff
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source');

    if (source === 'education-copilot') {
      const copilotData = localStorage.getItem('educationCopilotData');

      if (copilotData) {
        try {
          const data = JSON.parse(copilotData);

          // Store data for the create page to pick up
          localStorage.setItem('websiteBuilderPrefill', copilotData);

          // Show success toast
          toast.success("Pre-filled from Education Co-pilot! Let's create your page.");

          // Navigate to create page with template parameter
          navigate(`/website-builder/create?source=education-copilot&template=${data.template || 'academy-platform'}`);

        } catch (error) {
          console.error('Failed to parse Education copilot data:', error);
          toast.error("Failed to load pre-filled data. Please try again.");
        }
      } else {
        // No data found, just navigate to create page
        navigate('/website-builder/create');
      }
    }
  }, [location.search, navigate]);

  const filtered = sites.filter((s) => {
    const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const deleteSite = (id: string) => {
    const updated = sites.filter((s) => s.id !== id);
    setSites(updated);
    storeSites(updated);
    toast.success("Site deleted");
    if (location.pathname.includes(id)) navigate("/website-builder", { replace: true });
  };

  const duplicateSite = (site: SmartPageSite) => {
    const newSlug = `${site.slug}-copy-${Date.now()}`;
    const dup: SmartPageSite = { ...site, id: `sp_${Date.now()}`, name: `${site.name} (Copy)`, status: "Draft", slug: newSlug, url: `/s/${newSlug}`, views: 0, conversions: 0, amount: 0, transactions: 0, created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) };
    const updated = [dup, ...sites];
    setSites(updated);
    storeSites(updated);
    toast.success("Site duplicated as draft");
  };

  const getFullUrl = (site: SmartPageSite) => {
    return `${window.location.origin}${site.url}`;
  };

  const copyUrl = (site: SmartPageSite, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = getFullUrl(site);
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(site.id);
    toast.success("URL copied");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const totalRevenue = sites.reduce((a, s) => a + (s.amount || 0) * (s.transactions || 0), 0);
  const totalTxns = sites.reduce((a, s) => a + (s.transactions || 0), 0);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Pages</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Build pages, landing pages, and storefronts — powered by AI.</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto flex-shrink-0" onClick={() => navigate("/website-builder/create")}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Page</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Sites", value: sites.length.toString() },
            { label: "Published", value: sites.filter((s) => s.status === "Published").length.toString() },
            { label: "Transactions", value: totalTxns.toLocaleString() },
            { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}` },
          ].map((s) => (
            <div key={s.label} className="blade-stat">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{s.label}</p>
              <p className="text-lg sm:text-2xl font-semibold text-foreground mt-1 truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Input placeholder="Search sites..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "Published", "Draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* List View */}
        {filtered.length > 0 ? (
          <div className="blade-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="blade-table-header px-3 sm:px-4 py-3 text-left whitespace-nowrap">Page</th>
                    <th className="blade-table-header px-3 sm:px-4 py-3 text-left whitespace-nowrap hidden sm:table-cell">URL</th>
                    <th className="blade-table-header px-3 sm:px-4 py-3 text-left whitespace-nowrap">Status</th>
                    <th className="blade-table-header px-3 sm:px-4 py-3 text-left whitespace-nowrap hidden md:table-cell">Created</th>
                    <th className="blade-table-header px-3 sm:px-4 py-3 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
              <tbody>
                {filtered.map((site) => {
                  const tpl = templates.find(
                    (t) => t.id === site.templateId || t.title.toLowerCase() === site.type.toLowerCase()
                  );
                  return (
                    <tr
                      key={site.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/website-builder/${site.id}`)}
                    >
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-12 h-8 sm:w-16 sm:h-10 rounded-md border border-border overflow-hidden flex-shrink-0 bg-muted/30 relative">
                            {(() => {
                              // Use banner image from template or webinar data as thumbnail
                              let imgSrc: string | null = null;
                              if (site.pageType === "webinar") {
                                try {
                                  const wd = localStorage.getItem(`webinar_${site.id}`);
                                  if (wd) imgSrc = JSON.parse(wd).bannerImage;
                                } catch {}
                              }
                              if (!imgSrc && tpl?.bannerImage) imgSrc = tpl.bannerImage;
                              
                              if (imgSrc) {
                                return <img src={imgSrc} alt={site.name} className="w-full h-full object-cover" />;
                              }
                              return (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Globe className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                              );
                            })()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="font-medium text-foreground truncate block max-w-[120px] sm:max-w-[180px] text-xs sm:text-sm">{site.name}</span>
                              {site.pageType && (
                                <span className={`text-[8px] sm:text-[9px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full ${pageTypeColors[site.pageType]}`}>
                                  {pageTypeLabels[site.pageType]}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                              <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                                {site.amount ? `₹${site.amount.toLocaleString()}` : "₹0"}
                              </span>
                              <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                                {site.transactions || 0} txns
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                        {site.status === "Published" ? (
                          <div className="group/url flex items-center gap-1.5 max-w-[220px]">
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline truncate"
                            >
                              {site.url}
                            </a>
                            <button
                              onClick={(e) => copyUrl(site, e)}
                              className="opacity-0 group-hover/url:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary flex-shrink-0"
                              title="Copy URL"
                            >
                              {copiedUrl === site.id ? (
                                <span className="text-[10px] text-primary font-medium">Copied!</span>
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={site.status === "Published" ? "blade-badge-paid" : "blade-badge-expired"}>{site.status}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">{site.created}</td>
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] sm:text-xs h-6 sm:h-7 gap-1 px-2 sm:px-3"
                            onClick={(e) => { e.stopPropagation(); navigate(`/website-builder/${site.id}`); }}
                          >
                            <span className="hidden sm:inline">Manage</span>
                            <Eye className="h-3 w-3 sm:hidden" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/website-builder/editor?id=${site.id}`)}>
                                <Settings className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              {site.status === "Published" && (
                                <DropdownMenuItem onClick={() => window.open(site.url, "_blank")}>
                                  <ExternalLink className="h-4 w-4 mr-2" /> View Live
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => duplicateSite(site)}>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteSite(site.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <div className="blade-card p-12 text-center">
            <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No sites found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first Smart Page to get started.</p>
            <Button className="mt-4 gap-2" onClick={() => navigate("/website-builder/create")}>
              <Plus className="h-4 w-4" /> Create Page
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WebsiteBuilder;
