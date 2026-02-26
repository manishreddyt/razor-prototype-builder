import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Eye, Copy, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const forms = [
  { id: 1, name: "Bootcamp Registration", responses: 342, fields: 6, created: "1 Jan 2026", status: "Active", url: "https://rzp.io/f/bootcamp-reg" },
  { id: 2, name: "Workshop Feedback", responses: 128, fields: 8, created: "15 Jan 2026", status: "Active", url: "https://rzp.io/f/workshop-fb" },
  { id: 3, name: "Free Trial Sign-up", responses: 1024, fields: 4, created: "5 Feb 2026", status: "Active", url: "https://rzp.io/f/free-trial" },
  { id: 4, name: "Scholarship Application", responses: 56, fields: 12, created: "10 Feb 2026", status: "Draft", url: "—" },
  { id: 5, name: "Guest Speaker Inquiry", responses: 18, fields: 5, created: "18 Feb 2026", status: "Active", url: "https://rzp.io/f/speaker-inq" },
];

const statusClass: Record<string, string> = {
  Active: "blade-badge-paid",
  Draft: "blade-badge-expired",
};

const Forms = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showResponses, setShowResponses] = useState<typeof forms[0] | null>(null);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Forms</h1>
            <p className="text-sm text-muted-foreground mt-1">Collect student details, registrations, and feedback</p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Forms", value: "5" },
            { label: "Total Responses", value: "1,568" },
            { label: "This Month", value: "312" },
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
                <th className="blade-table-header px-5 py-3 text-left">Form Name</th>
                <th className="blade-table-header px-5 py-3 text-left">Responses</th>
                <th className="blade-table-header px-5 py-3 text-left">Fields</th>
                <th className="blade-table-header px-5 py-3 text-left">Created</th>
                <th className="blade-table-header px-5 py-3 text-left">Status</th>
                <th className="blade-table-header px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{f.name}</td>
                  <td className="px-5 py-3 text-foreground">{f.responses}</td>
                  <td className="px-5 py-3 text-muted-foreground">{f.fields}</td>
                  <td className="px-5 py-3 text-muted-foreground">{f.created}</td>
                  <td className="px-5 py-3"><span className={statusClass[f.status] || "blade-badge"}>{f.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowResponses(f)} className="text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></button>
                      <button className="text-muted-foreground hover:text-primary"><Copy className="h-4 w-4" /></button>
                      {f.url !== "—" && <button className="text-muted-foreground hover:text-primary"><ExternalLink className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New Form</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Form Name</label>
              <Input placeholder="e.g. Bootcamp Registration" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">Default fields: Name, Email, Phone. You can add custom fields after creation.</div>
            <Button className="w-full">Create Form</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Responses Dialog */}
      <Dialog open={!!showResponses} onOpenChange={() => setShowResponses(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{showResponses?.name} — Responses</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">{showResponses?.responses} total responses</p>
            <div className="blade-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="blade-table-header px-4 py-2 text-left">Name</th>
                    <th className="blade-table-header px-4 py-2 text-left">Email</th>
                    <th className="blade-table-header px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {["Priya Sharma", "Rahul Mehta", "Ananya Gupta"].map((n, i) => (
                    <tr key={n} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 text-foreground">{n}</td>
                      <td className="px-4 py-2 text-muted-foreground">{n.toLowerCase().replace(" ", ".") + "@example.com"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{26 - i} Feb 2026</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Forms;
