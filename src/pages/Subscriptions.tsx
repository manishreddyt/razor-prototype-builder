import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus } from "lucide-react";

const subscriptions = [
  { id: "sub_Abc123", plan: "Full Stack Dev — Monthly", student: "Priya Sharma", amount: "₹2,999/mo", nextDue: "15 Mar 2026", method: "UPI Autopay", status: "Active" },
  { id: "sub_Def456", plan: "Data Science — Quarterly", student: "Rahul Mehta", amount: "₹7,499/qtr", nextDue: "01 Apr 2026", method: "Card", status: "Active" },
  { id: "sub_Ghi789", plan: "UI/UX Design — Monthly", student: "Ananya Gupta", amount: "₹1,999/mo", nextDue: "—", method: "UPI Autopay", status: "Paused" },
  { id: "sub_Jkl012", plan: "Digital Marketing — Termly", student: "Vikram Singh", amount: "₹12,999/term", nextDue: "—", method: "Card", status: "Cancelled" },
];

const statusClass: Record<string, string> = {
  Active: "blade-badge-paid",
  Paused: "blade-badge-warning",
  Cancelled: "blade-badge-cancelled",
};

const Subscriptions = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Subscriptions</h1>
            <p className="text-sm text-muted-foreground mt-1">No-code recurring billing for course fees</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            Create Plan
          </button>
        </div>

        {/* Stats */}
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
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary">{sub.id}</td>
                  <td className="px-5 py-3 text-foreground">{sub.plan}</td>
                  <td className="px-5 py-3 text-muted-foreground">{sub.student}</td>
                  <td className="px-5 py-3 text-foreground">{sub.amount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{sub.nextDue}</td>
                  <td className="px-5 py-3 text-muted-foreground">{sub.method}</td>
                  <td className="px-5 py-3">
                    <span className={statusClass[sub.status] || "blade-badge"}>{sub.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;
