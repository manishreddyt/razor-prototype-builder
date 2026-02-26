import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Tag, Percent, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const offers = [
  { id: 1, code: "EARLYBIRD25", type: "Percentage", discount: "25%", course: "Full Stack Dev Bootcamp", used: 48, limit: 100, validTill: "15 Mar 2026", status: "Active" },
  { id: 2, code: "LAUNCH500", type: "Flat", discount: "₹500", course: "All Courses", used: 156, limit: 500, validTill: "28 Feb 2026", status: "Active" },
  { id: 3, code: "UIUX30", type: "Percentage", discount: "30%", course: "UI/UX Design Masterclass", used: 30, limit: 30, validTill: "10 Feb 2026", status: "Expired" },
  { id: 4, code: "REFERRAL10", type: "Percentage", discount: "10%", course: "All Courses", used: 89, limit: null, validTill: "31 Dec 2026", status: "Active" },
  { id: 5, code: "WELCOME1000", type: "Flat", discount: "₹1,000", course: "Data Science Fundamentals", used: 0, limit: 50, validTill: "30 Mar 2026", status: "Draft" },
];

const statusClass: Record<string, string> = {
  Active: "blade-badge-paid",
  Expired: "blade-badge-expired",
  Draft: "blade-badge-info",
};

const Offers = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Offers & Coupons</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage discount codes, early-bird pricing, and referral coupons</p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Create Offer
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Tag, label: "Active Offers", value: "3" },
            { icon: Percent, label: "Total Redemptions", value: "293" },
            { icon: Clock, label: "Revenue from Offers", value: "₹2,84,500" },
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
                <th className="blade-table-header px-5 py-3 text-left">Coupon Code</th>
                <th className="blade-table-header px-5 py-3 text-left">Type</th>
                <th className="blade-table-header px-5 py-3 text-left">Discount</th>
                <th className="blade-table-header px-5 py-3 text-left">Course</th>
                <th className="blade-table-header px-5 py-3 text-left">Used / Limit</th>
                <th className="blade-table-header px-5 py-3 text-left">Valid Till</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
                <th className="blade-table-header px-5 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-mono font-medium text-primary">{o.code}</td>
                  <td className="px-5 py-3 text-foreground">{o.type}</td>
                  <td className="px-5 py-3 text-foreground font-medium">{o.discount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.course}</td>
                  <td className="px-5 py-3 text-foreground">{o.used} / {o.limit || "∞"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.validTill}</td>
                  <td className="px-5 py-3"><span className={statusClass[o.status] || "blade-badge"}>{o.status}</span></td>
                  <td className="px-5 py-3">
                    <button className="text-muted-foreground hover:text-primary"><Copy className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Offer Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Offer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Coupon Code</label>
              <Input placeholder="e.g. EARLYBIRD25" className="mt-1.5 font-mono" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Discount Type</label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="flat">Flat Discount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Discount Value</label>
              <Input placeholder="e.g. 25 or 500" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Applicable Course</label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="bootcamp">Full Stack Dev Bootcamp</SelectItem>
                  <SelectItem value="uiux">UI/UX Design Masterclass</SelectItem>
                  <SelectItem value="datascience">Data Science Fundamentals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Usage Limit</label>
                <Input placeholder="e.g. 100" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Valid Till</label>
                <Input type="date" className="mt-1.5" />
              </div>
            </div>
            <Button className="w-full">Create Offer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Offers;
