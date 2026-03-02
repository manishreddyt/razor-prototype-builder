import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Settings, MoreHorizontal, Trash2, Copy, Globe, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface AIApp {
  id: string;
  name: string;
  description: string;
  type: string;
  url: string;
  slug: string;
  created: string;
  views: number;
  users: number;
  status: "Published" | "Draft";
  revenue: number;
  transactions: number;
}

const STORAGE_KEY = "ai-app-builder-apps";

export const getStoredApps = (): AIApp[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaults: AIApp[] = [
    { id: "app_1", name: "Fitness Tracker Pro", description: "Track workouts, nutrition & progress", type: "Mobile App", slug: "fitness-tracker-pro", url: "/ai-apps/fitness-tracker-pro", created: "28 Feb 2026", views: 3420, users: 890, status: "Published", revenue: 89900, transactions: 890 },
    { id: "app_2", name: "Recipe Manager", description: "Organize recipes with AI suggestions", type: "Web App", slug: "recipe-manager", url: "/ai-apps/recipe-manager", created: "20 Feb 2026", views: 1560, users: 320, status: "Published", revenue: 31800, transactions: 320 },
    { id: "app_3", name: "Invoice Generator", description: "Professional invoices with payment links", type: "Business Tool", slug: "invoice-generator", url: "/ai-apps/invoice-generator", created: "15 Feb 2026", views: 2100, users: 540, status: "Published", revenue: 53460, transactions: 540 },
    { id: "app_4", name: "Event Planner", description: "Plan events with RSVP & ticketing", type: "Web App", slug: "event-planner", url: "/ai-apps/event-planner", created: "10 Feb 2026", views: 980, users: 150, status: "Draft", revenue: 0, transactions: 0 },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const storeApps = (apps: AIApp[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
};

export const addApp = (app: AIApp) => {
  const apps = getStoredApps();
  apps.unshift(app);
  storeApps(apps);
};

const AIAppBuilder = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<AIApp[]>(getStoredApps());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");

  const filtered = apps.filter((a) => {
    const matchSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const deleteApp = (id: string) => {
    const updated = apps.filter((a) => a.id !== id);
    setApps(updated);
    storeApps(updated);
    toast.success("App deleted");
  };

  const duplicateApp = (app: AIApp) => {
    const dup: AIApp = { ...app, id: `app_${Date.now()}`, name: `${app.name} (Copy)`, status: "Draft", views: 0, users: 0, revenue: 0, transactions: 0, created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) };
    const updated = [dup, ...apps];
    setApps(updated);
    storeApps(updated);
    toast.success("App duplicated as draft");
  };

  const totalRevenue = apps.reduce((a, s) => a + s.revenue, 0);
  const totalUsers = apps.reduce((a, s) => a + s.users, 0);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">AI App Builder</h1>
              <span className="blade-badge-new">new</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">Build custom websites, full blown apps etc. Build any app that you can imagine and collect payments with Razorpay.</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent text-xs font-medium text-muted-foreground whitespace-nowrap">
                <img src="/images/logo-lovable.png" alt="Lovable" className="h-3.5 w-3.5 rounded-sm" />
                Powered by Lovable
              </span>
            </div>
          </div>
          <Button className="gap-2" onClick={() => navigate("/ai-app-builder/create")}>
            <Plus className="h-4 w-4" /> Create App
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Apps", value: apps.length.toString() },
            { label: "Published", value: apps.filter((a) => a.status === "Published").length.toString() },
            { label: "Total Users", value: totalUsers.toLocaleString() },
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
            <Input placeholder="Search apps..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                  <th className="blade-table-header px-4 py-3 text-left">App</th>
                  <th className="blade-table-header px-4 py-3 text-left">Type</th>
                  <th className="blade-table-header px-4 py-3 text-left">Status</th>
                  <th className="blade-table-header px-4 py-3 text-left">Users</th>
                  <th className="blade-table-header px-4 py-3 text-left">Revenue</th>
                  <th className="blade-table-header px-4 py-3 text-left">Created</th>
                  <th className="blade-table-header px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/ai-app-builder/${app.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate max-w-[200px]">{app.name}</span>
                          <span className="text-xs text-muted-foreground">{app.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{app.type}</td>
                    <td className="px-4 py-3">
                      <span className={app.status === "Published" ? "blade-badge-paid" : "blade-badge-expired"}>{app.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{app.users.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-foreground">₹{app.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{app.created}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={(e) => { e.stopPropagation(); navigate(`/ai-app-builder/${app.id}`); }}>
                          Manage
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/ai-app-builder/editor?id=${app.id}`)}>
                              <Settings className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateApp(app)}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteApp(app.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="blade-card p-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No apps yet</p>
            <p className="text-sm text-muted-foreground mt-1">Build your first app with AI — describe what you want and we'll create it.</p>
            <Button className="mt-4 gap-2" onClick={() => navigate("/ai-app-builder/create")}>
              <Plus className="h-4 w-4" /> Create App
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIAppBuilder;
