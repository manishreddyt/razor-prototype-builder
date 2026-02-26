import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Eye, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const subscriptions = [
  { id: "sub_Abc123", plan: "Full Stack Dev — Monthly", student: "Priya Sharma", email: "priya@example.com", amount: "₹2,999/mo", nextDue: "15 Mar 2026", method: "UPI Autopay", status: "Active", startDate: "15 Jan 2026", totalPaid: "₹5,998" },
  { id: "sub_Def456", plan: "Data Science — Quarterly", student: "Rahul Mehta", email: "rahul@example.com", amount: "₹7,499/qtr", nextDue: "01 Apr 2026", method: "Card", status: "Active", startDate: "1 Jan 2026", totalPaid: "₹7,499" },
  { id: "sub_Ghi789", plan: "UI/UX Design — Monthly", student: "Ananya Gupta", email: "ananya@example.com", amount: "₹1,999/mo", nextDue: "—", method: "UPI Autopay", status: "Paused", startDate: "1 Dec 2025", totalPaid: "₹5,997" },
  { id: "sub_Jkl012", plan: "Digital Marketing — Termly", student: "Vikram Singh", email: "vikram@example.com", amount: "₹12,999/term", nextDue: "—", method: "Card", status: "Cancelled", startDate: "1 Nov 2025", totalPaid: "₹12,999" },
];

const statusClass: Record<string, string> = {
  Active: "blade-badge-paid",
  Paused: "blade-badge-warning",
  Cancelled: "blade-badge-cancelled",
};

const Subscriptions = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSub, setSelectedSub] = useState<typeof subscriptions[0] | null>(null);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Subscriptions</h1>
            <p className="text-sm text-muted-foreground mt-1">No-code recurring billing for course fees</p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Subscriptions", value: "186" },
            { label: "Monthly Recurring", value: "₹3,42,800" },
            { label: "Churn Rate", value: "4.2%" },
          ].map((s) => (
            <div key={s.label} className="blade-stat">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="blade-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="blade-table-header px-5 py-3 text-left">Subscription ID</th>
                <th className="blade-table-header px-5 py-3 text-left">Plan</th>
                <th className="blade-table-header px-5 py-3 text-left">Student</th>
                <th className="blade-table-header px-5 py-3 text-left">Amount</th>
                <th className="blade-table-header px-5 py-3 text-left">Next Due</th>
                <th className="blade-table-header px-5 py-3 text-left">Method</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
                <th className="blade-table-header px-5 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary cursor-pointer hover:underline" onClick={() => setSelectedSub(sub)}>{sub.id}</td>
                  <td className="px-5 py-3 text-foreground">{sub.plan}</td>
                  <td className="px-5 py-3 text-muted-foreground">{sub.student}</td>
                  <td className="px-5 py-3 text-foreground">{sub.amount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{sub.nextDue}</td>
                  <td className="px-5 py-3 text-muted-foreground">{sub.method}</td>
                  <td className="px-5 py-3"><span className={statusClass[sub.status] || "blade-badge"}>{sub.status}</span></td>
                  <td className="px-5 py-3">
                    <button className="text-muted-foreground hover:text-primary" onClick={() => setSelectedSub(sub)}><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Subscription Plan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Plan Name</label>
              <Input placeholder="e.g. Full Stack Dev — Monthly" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                <Input placeholder="2999" type="number" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Billing Cycle</label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Course</label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bootcamp">Full Stack Dev Bootcamp</SelectItem>
                  <SelectItem value="uiux">UI/UX Design Masterclass</SelectItem>
                  <SelectItem value="datascience">Data Science Fundamentals</SelectItem>
                  <SelectItem value="marketing">Digital Marketing 101</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Auto-send payment receipt</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Send renewal reminders</span>
              <Switch defaultChecked />
            </div>
            <Button className="w-full" onClick={() => { setShowCreate(false); toast.success("Subscription plan created!"); }}>Create Plan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Subscription Details</DialogTitle></DialogHeader>
          {selectedSub && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-foreground">{selectedSub.amount}</span>
                <span className={statusClass[selectedSub.status] || "blade-badge"}>{selectedSub.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Subscription ID", selectedSub.id],
                  ["Plan", selectedSub.plan],
                  ["Student", selectedSub.student],
                  ["Email", selectedSub.email],
                  ["Start Date", selectedSub.startDate],
                  ["Next Due", selectedSub.nextDue],
                  ["Method", selectedSub.method],
                  ["Total Paid", selectedSub.totalPaid],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-foreground font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                {selectedSub.status === "Active" && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Subscription paused")}>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </Button>
                )}
                {selectedSub.status === "Paused" && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Subscription resumed")}>
                    <Play className="h-3.5 w-3.5" /> Resume
                  </Button>
                )}
                {selectedSub.status !== "Cancelled" && (
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => toast.success("Subscription cancelled")}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Subscriptions;
