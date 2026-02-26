import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BarChart3, Download, Calendar, TrendingUp, IndianRupee, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const reportTypes = [
  { title: "Revenue Report", desc: "Daily/weekly/monthly revenue breakdown", icon: IndianRupee, generated: "Auto-generated daily" },
  { title: "Transaction Report", desc: "All payments with method, status, and fee details", icon: BarChart3, generated: "On-demand" },
  { title: "Settlement Report", desc: "Bank settlement reconciliation", icon: TrendingUp, generated: "Auto-generated per cycle" },
  { title: "Student Enrollment", desc: "Course-wise enrollment and payment stats", icon: Users, generated: "Weekly" },
];

const recentReports = [
  { name: "Revenue — Feb 2026", type: "Revenue", date: "26 Feb 2026", size: "124 KB", status: "Ready" },
  { name: "Transactions — Week 8", type: "Transaction", date: "24 Feb 2026", size: "89 KB", status: "Ready" },
  { name: "Settlement — Cycle 42", type: "Settlement", date: "22 Feb 2026", size: "56 KB", status: "Ready" },
  { name: "Enrollment — Feb 2026", type: "Student", date: "20 Feb 2026", size: "201 KB", status: "Ready" },
];

const Reports = () => {
  const [period, setPeriod] = useState("this-month");

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate and download business reports</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-2 gap-4">
          {reportTypes.map((r) => (
            <div key={r.title} className="blade-card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <r.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{r.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                <p className="text-xs text-primary mt-1">{r.generated}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Generate
              </Button>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="blade-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Recent Reports</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="blade-table-header px-5 py-3 text-left">Report Name</th>
                <th className="blade-table-header px-5 py-3 text-left">Type</th>
                <th className="blade-table-header px-5 py-3 text-left">Generated On</th>
                <th className="blade-table-header px-5 py-3 text-left">Size</th>
                <th className="blade-table-header px-5 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r) => (
                <tr key={r.name} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{r.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.type}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.size}</td>
                  <td className="px-5 py-3">
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
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

export default Reports;
