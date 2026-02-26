import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, TrendingUp, IndianRupee } from "lucide-react";

const customers = [
  { name: "Priya Sharma", email: "priya@example.com", courses: 2, totalPaid: "₹25,998", lastPayment: "26 Feb 2026", status: "Active" },
  { name: "Rahul Mehta", email: "rahul@example.com", courses: 1, totalPaid: "₹8,499", lastPayment: "25 Feb 2026", status: "Active" },
  { name: "Ananya Gupta", email: "ananya@example.com", courses: 1, totalPaid: "₹8,000", lastPayment: "20 Feb 2026", status: "Partial" },
  { name: "Vikram Singh", email: "vikram@example.com", courses: 1, totalPaid: "₹0", lastPayment: "—", status: "Lead" },
  { name: "Sneha Patel", email: "sneha@example.com", courses: 1, totalPaid: "₹2,999", lastPayment: "24 Feb 2026", status: "Active" },
];

const statusClass: Record<string, string> = {
  Active: "blade-badge-paid",
  Partial: "blade-badge-warning",
  Lead: "blade-badge-info",
};

const CustomerTracker = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Customer Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Basic cohort view of enrolled students</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Total Students", value: "1,248" },
            { icon: TrendingUp, label: "Active This Month", value: "342" },
            { icon: IndianRupee, label: "Lifetime Value (Avg)", value: "₹9,240" },
          ].map((s) => (
            <div key={s.label} className="blade-stat flex items-center gap-4">
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="blade-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="blade-table-header px-5 py-3 text-left">Name</th>
                <th className="blade-table-header px-5 py-3 text-left">Email</th>
                <th className="blade-table-header px-5 py-3 text-left">Courses</th>
                <th className="blade-table-header px-5 py-3 text-left">Total Paid</th>
                <th className="blade-table-header px-5 py-3 text-left">Last Payment</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-3 text-foreground">{c.courses}</td>
                  <td className="px-5 py-3 text-foreground">{c.totalPaid}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.lastPayment}</td>
                  <td className="px-5 py-3">
                    <span className={statusClass[c.status] || "blade-badge"}>{c.status}</span>
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

export default CustomerTracker;
