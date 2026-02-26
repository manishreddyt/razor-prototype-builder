import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Download, Eye, Search, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const receipts = [
  { id: "rcpt_001", student: "Priya Sharma", email: "priya@example.com", course: "Full Stack Dev Bootcamp", amount: "₹12,999", date: "26 Feb 2026", gst: "₹1,983", subtotal: "₹11,016", method: "UPI", txnId: "pay_QwErTy123456" },
  { id: "rcpt_002", student: "Rahul Mehta", email: "rahul@example.com", course: "UI/UX Design Masterclass", amount: "₹8,499", date: "25 Feb 2026", gst: "₹1,296", subtotal: "₹7,203", method: "Card", txnId: "pay_AsDfGh234567" },
  { id: "rcpt_003", student: "Sneha Patel", email: "sneha@example.com", course: "Photography Workshop", amount: "₹2,999", date: "24 Feb 2026", gst: "₹458", subtotal: "₹2,541", method: "UPI", txnId: "pay_MnBvCx678901" },
  { id: "rcpt_004", student: "Ananya Gupta", email: "ananya@example.com", course: "Data Science Fundamentals", amount: "₹15,999", date: "23 Feb 2026", gst: "₹2,441", subtotal: "₹13,558", method: "Card", txnId: "pay_ZxCvBn345678" },
  { id: "rcpt_005", student: "Vikram Singh", email: "vikram@example.com", course: "Digital Marketing 101", amount: "₹4,999", date: "22 Feb 2026", gst: "₹763", subtotal: "₹4,236", method: "Netbanking", txnId: "pay_PoIuYt456789" },
];

const Receipts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<typeof receipts[0] | null>(null);

  const filtered = receipts.filter(
    (r) => !searchQuery || r.student.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Receipts", value: receipts.length.toString() },
            { label: "Total Revenue", value: "₹45,495" },
            { label: "Total GST Collected", value: "₹6,941" },
          ].map((s) => (
            <div key={s.label} className="blade-stat">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student name or receipt ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
                <th className="blade-table-header px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary cursor-pointer hover:underline" onClick={() => setSelectedReceipt(r)}>{r.id}</td>
                  <td className="px-5 py-3 text-foreground">{r.student}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.course}</td>
                  <td className="px-5 py-3 text-foreground font-medium">{r.amount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.gst}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.method}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-muted-foreground hover:text-primary" onClick={() => setSelectedReceipt(r)}><Eye className="h-4 w-4" /></button>
                      <button className="text-muted-foreground hover:text-primary" onClick={() => toast.success("Receipt downloaded")}><Download className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Detail Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Receipt {selectedReceipt?.id}</DialogTitle></DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="text-center border-b border-border pb-4">
                <div className="w-10 h-10 rounded bg-primary flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold text-sm">R</span>
                </div>
                <p className="text-xs text-muted-foreground">Creator Commerce</p>
                <p className="text-xs text-muted-foreground">GSTIN: 29ABCDE1234F1Z5</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Student", selectedReceipt.student],
                  ["Email", selectedReceipt.email],
                  ["Course", selectedReceipt.course],
                  ["Transaction ID", selectedReceipt.txnId],
                  ["Payment Method", selectedReceipt.method],
                  ["Date", selectedReceipt.date],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-foreground font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-secondary rounded-md p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{selectedReceipt.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="text-foreground">{selectedReceipt.gst}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{selectedReceipt.amount}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5" onClick={() => toast.success("Receipt downloaded")}>
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
                <Button className="flex-1" onClick={() => toast.success("Receipt sent via email")}>
                  Share via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Receipts;
