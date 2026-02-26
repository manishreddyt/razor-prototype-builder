import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Receipt, Download } from "lucide-react";

const receipts = [
  { id: "rcpt_001", student: "Priya Sharma", course: "Full Stack Dev Bootcamp", amount: "₹12,999", date: "26 Feb 2026", gst: "₹1,983", method: "UPI" },
  { id: "rcpt_002", student: "Rahul Mehta", course: "UI/UX Design Masterclass", amount: "₹8,499", date: "25 Feb 2026", gst: "₹1,296", method: "Card" },
  { id: "rcpt_003", student: "Sneha Patel", course: "Photography Workshop", amount: "₹2,999", date: "24 Feb 2026", gst: "₹458", method: "UPI" },
];

const Receipts = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Receipts</h1>
            <p className="text-sm text-muted-foreground mt-1">Auto-generated, GST-compliant receipts shared via email/WhatsApp</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="blade-badge-success">GST Compliant</span>
          </div>
        </div>

        <div className="blade-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="blade-table-header px-5 py-3 text-left">Receipt ID</th>
                <th className="blade-table-header px-5 py-3 text-left">Student</th>
                <th className="blade-table-header px-5 py-3 text-left">Course</th>
                <th className="blade-table-header px-5 py-3 text-left">Amount</th>
                <th className="blade-table-header px-5 py-3 text-left">GST</th>
                <th className="blade-table-header px-5 py-3 text-left">Date</th>
                <th className="blade-table-header px-5 py-3 text-left">Method</th>
                <th className="blade-table-header px-5 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary">{r.id}</td>
                  <td className="px-5 py-3 text-foreground">{r.student}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.course}</td>
                  <td className="px-5 py-3 text-foreground">{r.amount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.gst}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.method}</td>
                  <td className="px-5 py-3">
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
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

export default Receipts;
