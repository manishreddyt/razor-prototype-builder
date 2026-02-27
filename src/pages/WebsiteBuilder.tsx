import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, ExternalLink, Eye, Settings, MoreHorizontal, BarChart3, Trash2, Copy, Globe } from "lucide-react";
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
}

// Shared state via localStorage for demo persistence
const STORAGE_KEY = "smart-pages-sites";

export const getStoredSites = (): SmartPageSite[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: "sp_1", name: "Full Stack Bootcamp", type: "Single Online Course", category: "education", url: "https://rzp.io/s/bootcamp", created: "10 Feb 2026", views: 1240, conversions: 342, status: "Published" },
    { id: "sp_2", name: "Creator Portfolio", type: "Personal Portfolio", category: "general", url: "https://rzp.io/s/portfolio", created: "1 Feb 2026", views: 3420, conversions: 89, status: "Published" },
    { id: "sp_3", name: "Weekend Workshop", type: "Webinar", category: "education", url: "https://rzp.io/s/workshop", created: "15 Jan 2026", views: 890, conversions: 156, status: "Published" },
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

const statusClass: Record<string, string> = {
  Published: "blade-badge-paid",
  Draft: "blade-badge-expired",
};

const WebsiteBuilder = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SmartPageSite[]>(getStoredSites());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");
  const [analyticsDialog, setAnalyticsDialog] = useState<SmartPageSite | null>(null);

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
    const dup: SmartPageSite = { ...site, id: `sp_${Date.now()}`, name: `${site.name} (Copy)`, status: "Draft", url: "—", views: 0, conversions: 0, created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) };
    const updated = [dup, ...sites];
    setSites(updated);
    storeSites(updated);
    toast.success("Site duplicated as draft");
  };

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
            { label: "Total Views", value: sites.reduce((a, s) => a + s.views, 0).toLocaleString() },
            { label: "Total Conversions", value: sites.reduce((a, s) => a + s.conversions, 0).toLocaleString() },
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

        {/* Sites Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((site) => {
              const tpl = templates.find(
                (t) => t.title.toLowerCase() === site.type.toLowerCase() || t.id === site.type
              );
              return (
                <div
                  key={site.id}
                  onClick={() => navigate(`/website-builder/${site.id}`)}
                  className="blade-card overflow-hidden group cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="h-40 overflow-hidden relative bg-muted/30 border-b border-border">
                    {tpl ? (
                      <div className="origin-top-left absolute" style={{ width: 1200, transform: "scale(0.28)", transformOrigin: "top left" }}>
                        <SitePreview template={tpl} sections={tpl.sections} />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Globe className="h-10 w-10 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="secondary" className="gap-1.5 shadow-lg">
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{site.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{site.type}</p>
                      </div>
                      <span className={`flex-shrink-0 ${site.status === "Published" ? "blade-badge-paid" : "blade-badge-expired"}`}>{site.status}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {site.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {site.conversions}</span>
                      <span className="ml-auto">{site.created}</span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-7 gap-1" onClick={(e) => { e.stopPropagation(); navigate(`/website-builder/editor?id=${site.id}`); }}>
                      <Settings className="h-3 w-3" /> Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setAnalyticsDialog(site)}>
                          <BarChart3 className="h-4 w-4 mr-2" /> Analytics
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
                </div>
              );
            })}
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

      {/* Analytics Dialog */}
      <Dialog open={!!analyticsDialog} onOpenChange={() => setAnalyticsDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{analyticsDialog?.name} — Analytics</DialogTitle></DialogHeader>
          {analyticsDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Views", value: analyticsDialog.views.toLocaleString() },
                  { label: "Conversions", value: analyticsDialog.conversions.toLocaleString() },
                  { label: "Conversion Rate", value: analyticsDialog.views > 0 ? `${((analyticsDialog.conversions / analyticsDialog.views) * 100).toFixed(1)}%` : "—" },
                  { label: "Status", value: analyticsDialog.status },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary rounded-md p-3">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-semibold text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WebsiteBuilder;
