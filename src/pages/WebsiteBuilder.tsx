import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, ExternalLink, Eye, Settings, MoreHorizontal, BarChart3, Trash2, Copy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

        {/* Sites Table */}
        {filtered.length > 0 ? (
          <div className="blade-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-5 py-3 text-left">Site Name</th>
                  <th className="blade-table-header px-5 py-3 text-left">Type</th>
                  <th className="blade-table-header px-5 py-3 text-left">URL</th>
                  <th className="blade-table-header px-5 py-3 text-left">Views</th>
                  <th className="blade-table-header px-5 py-3 text-left">Conversions</th>
                  <th className="blade-table-header px-5 py-3 text-left">Created</th>
                  <th className="blade-table-header px-5 py-3 text-left">Status</th>
                  <th className="blade-table-header px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((site) => (
                  <tr key={site.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{site.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{site.type}</td>
                    <td className="px-5 py-3">
                      {site.url !== "—" ? (
                        <span className="flex items-center gap-1 text-primary text-xs cursor-pointer hover:underline">
                          {site.url} <ExternalLink className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-foreground">{site.views.toLocaleString()}</td>
                    <td className="px-5 py-3 text-foreground">{site.conversions}</td>
                    <td className="px-5 py-3 text-muted-foreground">{site.created}</td>
                    <td className="px-5 py-3"><span className={statusClass[site.status] || "blade-badge"}>{site.status}</span></td>
                    <td className="px-5 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/website-builder/editor?id=${site.id}`)}>
                            <Settings className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
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
                    </td>
                  </tr>
                ))}
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
