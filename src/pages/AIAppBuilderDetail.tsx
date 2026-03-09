import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ExternalLink, Eye, Settings, BarChart3, Users, CreditCard,
  TrendingUp, Pencil, IndianRupee, CheckCircle2, XCircle, AlertCircle,
  Sparkles, Globe, Code2, Zap,
} from "lucide-react";
import { getStoredApps, type AIApp } from "./AIAppBuilder";

const mockTransactions = [
  { id: "txn_a1", customer: "Aarav Sharma", amount: 999, date: "28 Feb 2026, 2:15 PM", method: "UPI", status: "Success" },
  { id: "txn_a2", customer: "Priya Patel", amount: 999, date: "25 Feb 2026, 11:30 AM", method: "Card", status: "Success" },
  { id: "txn_a3", customer: "Rahul Kumar", amount: 999, date: "22 Feb 2026, 4:45 PM", method: "UPI", status: "Refunded" },
  { id: "txn_a4", customer: "Sneha Gupta", amount: 999, date: "20 Feb 2026, 9:00 AM", method: "Netbanking", status: "Success" },
  { id: "txn_a5", customer: "Vikram Singh", amount: 1999, date: "18 Feb 2026, 6:20 PM", method: "Card", status: "Success" },
  { id: "txn_a6", customer: "Meera Joshi", amount: 1999, date: "15 Feb 2026, 1:10 PM", method: "UPI", status: "Failed" },
];

const mockUsers = [
  { id: "u1", name: "Aarav Sharma", email: "aarav@example.com", plan: "Premium", joined: "28 Feb 2026", status: "Active" },
  { id: "u2", name: "Priya Patel", email: "priya@example.com", plan: "Free", joined: "25 Feb 2026", status: "Active" },
  { id: "u3", name: "Rahul Kumar", email: "rahul@example.com", plan: "Premium", joined: "22 Feb 2026", status: "Churned" },
  { id: "u4", name: "Sneha Gupta", email: "sneha@example.com", plan: "Free", joined: "20 Feb 2026", status: "Active" },
  { id: "u5", name: "Vikram Singh", email: "vikram@example.com", plan: "Premium", joined: "18 Feb 2026", status: "Active" },
];

const statusIcon = (status: string) => {
  switch (status) {
    case "Success": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "Failed": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "Refunded": return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    default: return null;
  }
};

const AIAppBuilderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const app = useMemo(() => {
    const apps = getStoredApps();
    return apps.find((a) => a.id === id) || null;
  }, [id]);

  if (!app) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">App not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/apps/emergent")}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = mockTransactions.filter(t => t.status === "Success").reduce((a, t) => a + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/apps/emergent")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-foreground truncate">{app.name}</h1>
              <span className={app.status === "Published" ? "blade-badge-paid" : "blade-badge-expired"}>{app.status}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground ml-10">
              <span>{app.type}</span>
              <span>•</span>
              <span>Created {app.created}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/apps/emergent/editor?id=${app.id}`)}>
              <Pencil className="h-3.5 w-3.5" /> Edit App
            </Button>
            <Button size="sm" className="gap-1.5">
              <Eye className="h-3.5 w-3.5" /> View Live
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Views", value: app.views.toLocaleString(), icon: Eye },
                { label: "Users", value: app.users.toLocaleString(), icon: Users },
                { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee },
                { label: "Transactions", value: app.transactions.toLocaleString(), icon: CreditCard },
              ].map((s) => (
                <div key={s.label} className="blade-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* App preview card */}
            <div className="blade-card overflow-hidden">
              <div className="h-64 bg-muted/30 flex items-center justify-center border-b border-border">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{app.name}</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">{app.description}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {app.type}</span>
                  <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" /> AI-Generated</span>
                  <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Razorpay Integrated</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => navigate(`/apps/emergent/editor?id=${app.id}`)}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="mt-4">
            <div className="blade-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="blade-table-header px-4 py-3 text-left">User</th>
                    <th className="blade-table-header px-4 py-3 text-left">Plan</th>
                    <th className="blade-table-header px-4 py-3 text-left">Joined</th>
                    <th className="blade-table-header px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-foreground">{u.name}</span>
                          <span className="block text-xs text-muted-foreground">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.plan === "Premium" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{u.plan}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                      <td className="px-4 py-3">
                        <span className={u.status === "Active" ? "blade-badge-paid" : "blade-badge-expired"}>{u.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="mt-4">
            <div className="blade-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="blade-table-header px-4 py-3 text-left">Transaction ID</th>
                    <th className="blade-table-header px-4 py-3 text-left">Customer</th>
                    <th className="blade-table-header px-4 py-3 text-left">Amount</th>
                    <th className="blade-table-header px-4 py-3 text-left">Method</th>
                    <th className="blade-table-header px-4 py-3 text-left">Status</th>
                    <th className="blade-table-header px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                      <td className="px-4 py-3 text-foreground">{t.customer}</td>
                      <td className="px-4 py-3 font-medium text-foreground">₹{t.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.method}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {statusIcon(t.status)}
                          <span className="text-xs">{t.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Daily Active Users", value: "89", change: "+12%" },
                { label: "Avg. Session Duration", value: "4m 32s", change: "+8%" },
                { label: "Bounce Rate", value: "32%", change: "-5%" },
              ].map((s) => (
                <div key={s.label} className="blade-card p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{s.value}</p>
                  <p className="text-xs text-emerald-600 mt-1">{s.change} vs last week</p>
                </div>
              ))}
            </div>
            <div className="blade-card p-6 h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Analytics charts will appear here as users interact with your app.</p>
              </div>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="mt-4 space-y-4">
            {["App Name & Description", "Custom Domain", "Payment Settings", "SEO & Meta Tags", "Danger Zone"].map((section) => (
              <div key={section} className="blade-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{section}</span>
                  <Button variant="outline" size="sm" className="text-xs h-7">Configure</Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AIAppBuilderDetail;
