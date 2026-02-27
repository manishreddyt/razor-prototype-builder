import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Settings, MoreHorizontal, Trash2, Copy, Globe, ExternalLink, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  created: string;
  views: number;
  conversions: number;
  status: "Published" | "Draft";
  amount?: number;
  transactions?: number;
}

const STORAGE_KEY = "smart-pages-sites";

export const getStoredSites = (): SmartPageSite[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: "sp_1", name: "Full Stack Bootcamp", type: "Single Online Course", category: "education", url: "https://rzp.io/s/bootcamp", created: "10 Feb 2026", views: 1240, conversions: 342, status: "Published", amount: 12999, transactions: 342 },
    { id: "sp_2", name: "Creator Portfolio", type: "Personal Portfolio", category: "general", url: "https://rzp.io/s/portfolio", created: "1 Feb 2026", views: 3420, conversions: 89, status: "Published", amount: 0, transactions: 0 },
    { id: "sp_3", name: "Weekend Workshop", type: "Webinar", category: "education", url: "https://rzp.io/s/workshop", created: "15 Jan 2026", views: 890, conversions: 156, status: "Published", amount: 1999, transactions: 156 },
  ];
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
    const dup: SmartPageSite = { ...site, id: `sp_${Date.now()}`, name: `${site.name} (Copy)`, status: "Draft", url: "—", views: 0, conversions: 0, amount: 0, transactions: 0, created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) };
    const updated = [dup, ...sites];
    setSites(updated);
    storeSites(updated);
    toast.success("Site duplicated as draft");
  };

  const copyUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
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
                  <th className="blade-table-header px-4 py-3 text-left">Type</th>
                  <th className="blade-table-header px-4 py-3 text-left">URL</th>
                  <th className="blade-table-header px-4 py-3 text-left">Status</th>
                  <th className="blade-table-header px-4 py-3 text-right">Amount</th>
                  <th className="blade-table-header px-4 py-3 text-right">Transactions</th>
                  <th className="blade-table-header px-4 py-3 text-left">Created</th>
                  <th className="blade-table-header px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((site) => {
                  const tpl = templates.find(
                    (t) => t.title.toLowerCase() === site.type.toLowerCase() || t.id === site.type
                  );
                  return (
                    <tr
                      key={site.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/website-builder/${site.id}`)}
                    >
                      {/* Thumbnail + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 rounded-md border border-border overflow-hidden flex-shrink-0 bg-muted/30">
                            {tpl ? (
                              <div className="origin-top-left relative" style={{ width: 1200, height: 800, transform: "scale(0.0133)", transformOrigin: "top left" }}>
                                <SitePreview template={tpl} sections={tpl.sections} />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Globe className="h-4 w-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[180px]">{site.name}</span>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3 text-muted-foreground text-xs">{site.type}</td>
                      {/* URL with copy */}
                      <td className="px-4 py-3">
                        {site.url !== "—" ? (
                          <div className="group/url flex items-center gap-1.5 max-w-[200px]">
                            <span className="text-xs text-muted-foreground truncate">{site.url}</span>
                            <button
                              onClick={(e) => copyUrl(site.url, e)}
                              className="opacity-0 group-hover/url:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary flex-shrink-0"
                              title="Copy URL"
                            >
                              {copiedUrl === site.url ? (
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
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={site.status === "Published" ? "blade-badge-paid" : "blade-badge-expired"}>{site.status}</span>
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {site.amount ? `₹${site.amount.toLocaleString()}` : "—"}
                      </td>
                      {/* Transactions */}
                      <td className="px-4 py-3 text-right text-foreground">
                        {site.transactions || 0}
                      </td>
                      {/* Created */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">{site.created}</td>
                      {/* Actions */}
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
