import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Mail, Plus, Play, Pause, Eye, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const workflows = [
  { id: 1, name: "Welcome — Course Enrollment", trigger: "Payment Captured", course: "Full Stack Dev Bootcamp", sent: 342, opened: 278, rate: "81.3%", active: true },
  { id: 2, name: "Payment Receipt", trigger: "Payment Captured", course: "All Courses", sent: 1248, opened: 986, rate: "79.0%", active: true },
  { id: 3, name: "Subscription Renewal Reminder", trigger: "3 Days Before Due", course: "All Subscriptions", sent: 186, opened: 142, rate: "76.3%", active: true },
  { id: 4, name: "Payment Failed — Retry", trigger: "Payment Failed", course: "All Courses", sent: 89, opened: 67, rate: "75.3%", active: true },
  { id: 5, name: "Course Completion Certificate", trigger: "Manual Trigger", course: "UI/UX Design Masterclass", sent: 128, opened: 115, rate: "89.8%", active: false },
  { id: 6, name: "Feedback Request", trigger: "7 Days After Enrollment", course: "All Courses", sent: 456, opened: 198, rate: "43.4%", active: false },
];

const EmailWorkflows = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Email Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">Automated email sequences triggered by payment events</p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Mail, label: "Emails Sent (Month)", value: "2,449" },
            { icon: CheckCircle2, label: "Avg Open Rate", value: "74.2%" },
            { icon: Clock, label: "Active Workflows", value: "4" },
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
                <th className="blade-table-header px-5 py-3 text-left">Workflow</th>
                <th className="blade-table-header px-5 py-3 text-left">Trigger</th>
                <th className="blade-table-header px-5 py-3 text-left">Course</th>
                <th className="blade-table-header px-5 py-3 text-left">Sent</th>
                <th className="blade-table-header px-5 py-3 text-left">Opened</th>
                <th className="blade-table-header px-5 py-3 text-left">Open Rate</th>
                <th className="blade-table-header px-5 py-3 text-left">Active</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{w.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{w.trigger}</td>
                  <td className="px-5 py-3 text-muted-foreground">{w.course}</td>
                  <td className="px-5 py-3 text-foreground">{w.sent}</td>
                  <td className="px-5 py-3 text-foreground">{w.opened}</td>
                  <td className="px-5 py-3 text-foreground">{w.rate}</td>
                  <td className="px-5 py-3">
                    <Switch defaultChecked={w.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Email Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Workflow Name</label>
              <Input placeholder="e.g. Welcome Email — Bootcamp" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Trigger Event</label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select trigger" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_captured">Payment Captured</SelectItem>
                  <SelectItem value="payment_failed">Payment Failed</SelectItem>
                  <SelectItem value="subscription_created">Subscription Created</SelectItem>
                  <SelectItem value="3_days_before">3 Days Before Due</SelectItem>
                  <SelectItem value="7_days_after">7 Days After Enrollment</SelectItem>
                  <SelectItem value="manual">Manual Trigger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Subject Line</label>
              <Input placeholder="Welcome to {{course_name}}!" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email Body</label>
              <Textarea placeholder="Hi {{student_name}}, ..." rows={4} className="mt-1.5" />
            </div>
            <Button className="w-full">Create Workflow</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmailWorkflows;
