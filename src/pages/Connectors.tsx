import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Video, Calendar, HardDrive, Link2, CheckCircle2, XCircle,
  ExternalLink, Settings, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  connected: boolean;
  accountName?: string;
  lastSync?: string;
}

const defaultConnectors: Connector[] = [
  { id: "zoom", name: "Zoom", description: "Host and manage webinars, sync attendee data, and auto-create meeting links.", icon: "🎥", category: "Video", connected: false },
  { id: "gmeet", name: "Google Meet", description: "Create meeting links and calendar events for your webinars and sessions.", icon: "📹", category: "Video", connected: false },
  { id: "gcalendar", name: "Google Calendar", description: "Sync events, send calendar invites, and manage scheduling.", icon: "📅", category: "Scheduling", connected: false },
  { id: "gdrive", name: "Google Drive", description: "Store recordings, materials, and resources for your courses and webinars.", icon: "📁", category: "Storage", connected: false },
];

const STORAGE_KEY = "smart-pages-connectors";

const getStoredConnectors = (): Connector[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultConnectors;
};

const Connectors = () => {
  const [connectors, setConnectors] = useState<Connector[]>(getStoredConnectors());

  const toggleConnection = (id: string) => {
    const updated = connectors.map((c) => {
      if (c.id !== id) return c;
      if (c.connected) {
        toast.success(`${c.name} disconnected`);
        return { ...c, connected: false, accountName: undefined, lastSync: undefined };
      }
      // Mock connect
      toast.success(`${c.name} connected successfully!`);
      return {
        ...c,
        connected: true,
        accountName: `user@example.com`,
        lastSync: "Just now",
      };
    });
    setConnectors(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const connectedCount = connectors.filter((c) => c.connected).length;

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Connectors</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Connect third-party services to power your Smart Pages workflows.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="blade-card p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Available</p>
            <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1">{connectors.length}</p>
          </div>
          <div className="blade-card p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Connected</p>
            <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1">{connectedCount}</p>
          </div>
          <div className="blade-card p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
            <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1">{connectedCount > 0 ? "Active" : "—"}</p>
          </div>
        </div>

        {/* Connector Cards */}
        <div className="space-y-3 sm:space-y-4">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className={`blade-card p-4 sm:p-5 transition-all ${
                connector.connected ? "border-primary/20 bg-primary/[0.02]" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="text-2xl sm:text-3xl flex-shrink-0">{connector.icon}</div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">{connector.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">{connector.category}</Badge>
                      {connector.connected && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{connector.description}</p>
                    {connector.connected && connector.accountName && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="truncate">Account: <span className="text-foreground">{connector.accountName}</span></span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">Last synced: {connector.lastSync}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connector.connected && (
                    <>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => toast.info("Syncing...")}>
                        <RefreshCw className="h-3.5 w-3.5" /> Sync
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => toast.info("Settings coming soon")}>
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant={connector.connected ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleConnection(connector.id)}
                    className="gap-1.5"
                  >
                    {connector.connected ? (
                      <><XCircle className="h-3.5 w-3.5" /> Disconnect</>
                    ) : (
                      <><Link2 className="h-3.5 w-3.5" /> Connect</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> Connectors enable integrations within Smart Pages.
            Once connected, you can use them in webinar creation, workflows, and automations.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Connectors;
