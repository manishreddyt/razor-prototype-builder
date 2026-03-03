import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RazorpayAuthGate } from "@/components/RazorpayAuthGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Settings, Users, Activity, ExternalLink } from "lucide-react";
import { marketplaceApps } from "../AppMarketplace";

const InstalledApp = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const app = marketplaceApps.find((a) => a.id === appId);

  if (!app) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-muted-foreground">App not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <RazorpayAuthGate appName={app.name}>
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border bg-background shrink-0">
                {app.logo ? (
                  <img src={app.logo} alt={app.name} className="h-full w-full object-cover" />
                ) : (
                  <div className={`h-full w-full flex items-center justify-center ${app.iconBg}`}>
                    <app.icon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{app.name}</h1>
                  <Badge variant="secondary" className="text-[10px]">Installed</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{app.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Open External
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Active Users", value: "0", icon: Users },
              { label: "Events Today", value: "0", icon: Activity },
              { label: "Total Actions", value: "0", icon: BarChart3 },
              { label: "Status", value: "Active", icon: Settings },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content placeholder */}
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mx-auto">
                <app.icon className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{app.name} Dashboard</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your {app.name} integration is active and connected to your Razorpay account. Configure settings and manage your workflows from here.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" size="sm">View Documentation</Button>
                <Button size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </RazorpayAuthGate>
    </DashboardLayout>
  );
};

export default InstalledApp;
