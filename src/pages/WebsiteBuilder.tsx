import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Settings, MoreHorizontal, Trash2, Copy, Globe, ExternalLink, BarChart3 } from "lucide-react";
import { pageTypeLabels, pageTypeColors } from "@/types/smartPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { templates } from "@/data/smartPageTemplates";
import { SitePreview } from "@/components/SitePreview";

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
}

const STORAGE_KEY = "smart-pages-sites";

// Migration: ensure old sites have slug/templateId
const migrateSite = (s: any): SmartPageSite => {
  if (!s.slug) {
    const tpl = templates.find(t => t.title.toLowerCase() === s.type?.toLowerCase() || t.id === s.type);
    s.templateId = tpl?.id || s.type || "";
    s.slug = s.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `page-${s.id}`;
    s.url = `/s/${s.slug}`;
  }
  if (!s.amount && s.amount !== 0) s.amount = 0;
  if (!s.transactions && s.transactions !== 0) s.transactions = 0;
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
  const defaults: SmartPageSite[] = [
    { id: "sp_1", name: "Full Stack Bootcamp", type: "Single Online Course", category: "education", slug: "full-stack-bootcamp", templateId: "single-course", url: "/s/full-stack-bootcamp", created: "10 Feb 2026", views: 1240, conversions: 342, status: "Published", amount: 12999, transactions: 342, pageType: "course" },
    { id: "sp_2", name: "Creator Portfolio", type: "Personal Portfolio", category: "general", slug: "creator-portfolio", templateId: "portfolio", url: "/s/creator-portfolio", created: "1 Feb 2026", views: 3420, conversions: 89, status: "Published", amount: 0, transactions: 0 },
    { id: "sp_3", name: "Weekend Workshop", type: "Webinar", category: "education", slug: "weekend-workshop", templateId: "webinar", url: "/s/weekend-workshop", created: "15 Jan 2026", views: 890, conversions: 156, status: "Published", amount: 1999, transactions: 156, pageType: "webinar" },
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
  const [sites, setSites] = useState<SmartPageSite[]>(getStoredSites());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">Smart Pages</h1>
              <span className="blade-badge-new">new</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Build websites, landing pages, and storefronts — powered by AI.</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/website-builder/create")}>
            <Plus className="h-4 w-4" /> Create Page
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Sites", value: sites.length.toString() },
            { label: "Published", value: sites.filter((s) => s.status === "Published").length.toString() },
            { label: "Transactions", value: totalTxns.toLocaleString() },
            { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}` },
          ].map((s) => (
            <div key={s.label} className="blade-stat">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Input placeholder="Search sites..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "Published", "Draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* List View */}
        {filtered.length > 0 ? (
          <div className="blade-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-4 py-3 text-left">Page</th>
                  <th className="blade-table-header px-4 py-3 text-left">URL</th>
                  <th className="blade-table-header px-4 py-3 text-left">Status</th>
                  <th className="blade-table-header px-4 py-3 text-left">Created</th>
                  <th className="blade-table-header px-4 py-3 text-right">Actions</th>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 rounded-md border border-border overflow-hidden flex-shrink-0 bg-muted/30 relative">
                            {tpl ? (
                              <div className="absolute inset-0 overflow-hidden">
                                <div
                                  style={{
                                    width: 1200,
                                    height: 800,
                                    transform: "scale(0.0133)",
                                    transformOrigin: "top left",
                                    pointerEvents: "none",
                                  }}
                                >
                                  <SitePreview template={tpl} sections={tpl.sections} />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Globe className="h-4 w-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate block max-w-[180px]">{site.name}</span>
                              {site.pageType && (
                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${pageTypeColors[site.pageType]}`}>
                                  {pageTypeLabels[site.pageType]}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-muted-foreground">
                                {site.amount ? `₹${site.amount.toLocaleString()}` : "₹0"}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {site.transactions || 0} txns
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3">
                        <span className={site.status === "Published" ? "blade-badge-paid" : "blade-badge-expired"}>{site.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{site.created}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 gap-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/website-builder/${site.id}`); }}
                          >
                            Manage
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
