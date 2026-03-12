import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IndianRupee, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";

const settlements = [
  { id: "setl_Abc123", amount: "₹1,42,580.00", utr: "UTR123456789", txnCount: 48, date: "26 Feb 2026", status: "Processed" },
  { id: "setl_Def456", amount: "₹89,320.00", utr: "UTR987654321", txnCount: 31, date: "25 Feb 2026", status: "Processed" },
  { id: "setl_Ghi789", amount: "₹2,15,440.00", utr: "UTR456789012", txnCount: 72, date: "24 Feb 2026", status: "Processed" },
  { id: "setl_Jkl012", amount: "₹67,890.00", utr: "—", txnCount: 22, date: "23 Feb 2026", status: "In Transit" },
  { id: "setl_Mno345", amount: "₹1,05,200.00", utr: "—", txnCount: 35, date: "22 Feb 2026", status: "Created" },
];

const statusClass: Record<string, string> = {
  Processed: "blade-badge-paid",
  "In Transit": "blade-badge-warning",
  Created: "blade-badge-info",
};

const Settlements = () => (
  <DashboardLayout>
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Settlements</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track settlement cycles from Razorpay to your bank</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: IndianRupee, label: "Settled This Month", value: "₹6,20,430" },
          { icon: Clock, label: "Pending Settlement", value: "₹1,73,090" },
          { icon: CheckCircle2, label: "Avg Settlement Time", value: "T+2 Days" },
        ].map((s) => (
          <div key={s.label} className="blade-stat flex items-center gap-3 sm:gap-4">
            <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{s.label}</p>
              <p className="text-lg sm:text-xl font-semibold text-foreground truncate">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="blade-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Settlement ID</th>
                <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Amount</th>
                <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden md:table-cell">UTR</th>
                <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden sm:table-cell">Transactions</th>
                <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden lg:table-cell">Date</th>
                <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 sm:px-5 py-3 font-medium text-primary text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{s.id}</td>
                  <td className="px-3 sm:px-5 py-3 text-foreground font-medium text-xs sm:text-sm whitespace-nowrap">{s.amount}</td>
                  <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden md:table-cell">{s.utr}</td>
                  <td className="px-3 sm:px-5 py-3 text-foreground text-xs sm:text-sm hidden sm:table-cell">{s.txnCount}</td>
                  <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{s.date}</td>
                  <td className="px-3 sm:px-5 py-3"><span className={statusClass[s.status] || "blade-badge"}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default Settlements;
