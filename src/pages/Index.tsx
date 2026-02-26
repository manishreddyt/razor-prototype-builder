import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowUpRight, ArrowDownRight, IndianRupee, Users, CreditCard, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "₹4,52,300", change: "+12.5%", up: true, icon: IndianRupee },
  { label: "Active Students", value: "1,248", change: "+8.2%", up: true, icon: Users },
  { label: "Payment Links", value: "342", change: "+24.1%", up: true, icon: CreditCard },
  { label: "Conversion Rate", value: "68.4%", change: "-2.1%", up: false, icon: TrendingUp },
];

const recentPayments = [
  { id: "pay_Abc123XYZ", course: "Full Stack Dev Bootcamp", student: "Priya Sharma", amount: "₹12,999", date: "26 Feb 2026", status: "Paid" },
  { id: "pay_Def456UVW", course: "UI/UX Design Masterclass", student: "Rahul Mehta", amount: "₹8,499", date: "25 Feb 2026", status: "Paid" },
  { id: "pay_Ghi789RST", course: "Data Science Fundamentals", student: "Ananya Gupta", amount: "₹15,999", date: "25 Feb 2026", status: "Partially Paid" },
  { id: "pay_Jkl012OPQ", course: "Digital Marketing 101", student: "Vikram Singh", amount: "₹4,999", date: "24 Feb 2026", status: "Created" },
  { id: "pay_Mno345LMN", course: "Photography Workshop", student: "Sneha Patel", amount: "₹2,999", date: "24 Feb 2026", status: "Paid" },
];

const statusBadgeClass: Record<string, string> = {
  "Paid": "blade-badge-paid",
  "Created": "blade-badge-created",
  "Partially Paid": "blade-badge-warning",
  "Cancelled": "blade-badge-cancelled",
  "Expired": "blade-badge-expired",
};

const Index = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Creator Commerce · Education Stack Overview
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="blade-stat">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                <span className={`flex items-center text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Payments Table */}
        <div className="blade-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Recent Payments</h2>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="blade-table-header px-5 py-3 text-left">Payment ID</th>
                  <th className="blade-table-header px-5 py-3 text-left">Course</th>
                  <th className="blade-table-header px-5 py-3 text-left">Student</th>
                  <th className="blade-table-header px-5 py-3 text-left">Amount</th>
                  <th className="blade-table-header px-5 py-3 text-left">Date</th>
                  <th className="blade-table-header px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-primary">{payment.id}</td>
                    <td className="px-5 py-3 text-foreground">{payment.course}</td>
                    <td className="px-5 py-3 text-muted-foreground">{payment.student}</td>
                    <td className="px-5 py-3 text-foreground">{payment.amount}</td>
                    <td className="px-5 py-3 text-muted-foreground">{payment.date}</td>
                    <td className="px-5 py-3">
                      <span className={statusBadgeClass[payment.status] || "blade-badge"}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: "Create Payment Link", desc: "Share via WhatsApp, email, or Instagram", icon: "🔗" },
            { title: "Build Landing Page", desc: "AI-powered page for your course", icon: "🌐" },
            { title: "Set Up Subscription", desc: "Recurring billing for course fees", icon: "🔄" },
          ].map((action) => (
            <button
              key={action.title}
              className="blade-card flex items-center gap-4 p-5 text-left hover:bg-secondary/50 transition-colors group"
            >
              <span className="text-2xl">{action.icon}</span>
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
