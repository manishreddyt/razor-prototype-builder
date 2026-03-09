import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RazorpayAuthGate } from "@/components/RazorpayAuthGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Settings,
  Activity,
  BarChart3,
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Mail,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { marketplaceApps } from "../AppMarketplace";
import { useNavigate } from "react-router-dom";

interface Workflow {
  id: string;
  name: string;
  trigger: { app: string; event: string };
  action: { app: string; event: string };
  status: "active" | "paused";
  createdAt: string;
  lastRun?: string;
  totalRuns: number;
  successRate: number;
}

interface WorkflowActivity {
  id: string;
  workflowId: string;
  timestamp: string;
  status: "success" | "failed";
  paymentId: string;
  customer: string;
  amount: string;
  details: string;
}

const ZapierApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const app = marketplaceApps.find((a) => a.id === "zapier");

  const [activeTab, setActiveTab] = useState<"overview" | "workflows" | "create">("overview");
  const [createStep, setCreateStep] = useState(1);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);

  // Workflow creation state
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [workflowName, setWorkflowName] = useState("Post-Payment to Google Sheets");
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState("");
  const [selectedWorksheet, setSelectedWorksheet] = useState("");
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({
    paymentId: "payment_id",
    orderId: "order_id",
    date: "created_at",
    time: "created_at",
    customerName: "customer_name",
    email: "email",
    phone: "contact",
    amount: "amount",
  });

  // Sample workflows
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "wf-1",
      name: "Post-Payment to Google Sheets",
      trigger: { app: "Razorpay", event: "payment.captured" },
      action: { app: "Google Sheets", event: "Create Row" },
      status: "active",
      createdAt: "2026-03-06T18:13:00",
      lastRun: "2026-03-06T18:14:00",
      totalRuns: 247,
      successRate: 100,
    },
  ]);

  // Sample activity
  const [activities] = useState<WorkflowActivity[]>([
    {
      id: "act-1",
      workflowId: "wf-1",
      timestamp: "2026-03-06T18:14:00",
      status: "success",
      paymentId: "pay_MN3kXbMpuQzKc9",
      customer: "Rahul Sharma",
      amount: "₹500.00",
      details: "Added to Google Sheets successfully",
    },
    {
      id: "act-2",
      workflowId: "wf-1",
      timestamp: "2026-03-06T17:47:00",
      status: "success",
      paymentId: "pay_MN3kWYNmoKzLd8",
      customer: "Priya Singh",
      amount: "₹1,200.00",
      details: "Added to Google Sheets successfully",
    },
    {
      id: "act-3",
      workflowId: "wf-1",
      timestamp: "2026-03-06T16:32:00",
      status: "success",
      paymentId: "pay_MN3kTRPqsLmJe2",
      customer: "Amit Kumar",
      amount: "₹750.00",
      details: "Added to Google Sheets successfully",
    },
  ]);

  const razorpayTriggers = [
    { value: "payment.captured", label: "Payment Captured", description: "Triggers when a payment is successfully captured" },
    { value: "payment.failed", label: "Payment Failed", description: "Triggers when a payment fails" },
    { value: "payment_link.paid", label: "Payment Link Paid", description: "Triggers when a payment link is paid" },
    { value: "order.paid", label: "Order Paid", description: "Triggers when an order is paid" },
    { value: "subscription.charged", label: "Subscription Charged", description: "Triggers when a subscription is charged" },
    { value: "invoice.paid", label: "Invoice Paid", description: "Triggers when an invoice is paid" },
  ];

  const actionApps = [
    { id: "google-sheets", name: "Google Sheets", icon: FileSpreadsheet, iconBg: "bg-green-100 text-green-600" },
    { id: "gmail", name: "Gmail", icon: Mail, iconBg: "bg-red-100 text-red-600" },
    { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, iconBg: "bg-green-100 text-green-600" },
  ];

  const availableFields = [
    { value: "payment_id", label: "Payment ID", sample: "pay_MN3kXbMpuQzKc9" },
    { value: "order_id", label: "Order ID", sample: "order_MN3kXbMpuQzKc8" },
    { value: "amount", label: "Amount (₹)", sample: "500.00", transform: "/ 100" },
    { value: "currency", label: "Currency", sample: "INR" },
    { value: "status", label: "Status", sample: "captured" },
    { value: "method", label: "Payment Method", sample: "card" },
    { value: "customer_name", label: "Customer Name", sample: "Rahul Sharma" },
    { value: "email", label: "Email", sample: "rahul@example.com" },
    { value: "contact", label: "Phone", sample: "+919876543210" },
    { value: "created_at", label: "Date & Time", sample: "06/03/2026 18:13:37" },
    { value: "card_network", label: "Card Network", sample: "Visa" },
    { value: "card_last4", label: "Last 4 Digits", sample: "1234" },
    { value: "description", label: "Description", sample: "Premium Course" },
    { value: "notes.course_id", label: "Course ID (from notes)", sample: "CS101" },
  ];

  const handleCreateWorkflow = () => {
    setIsCreatingWorkflow(true);
    setActiveTab("create");
    setCreateStep(1);
  };

  const handleTestWorkflow = () => {
    toast({
      title: "✅ Test Successful!",
      description: "Row added to Google Sheets successfully. Check your spreadsheet.",
    });
    setTimeout(() => {
      setCreateStep(7);
    }, 1000);
  };

  const handleSaveWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `wf-${workflows.length + 1}`,
      name: workflowName,
      trigger: { app: "Razorpay", event: selectedTrigger },
      action: { app: "Google Sheets", event: "Create Row" },
      status: "active",
      createdAt: new Date().toISOString(),
      totalRuns: 0,
      successRate: 100,
    };
    setWorkflows([newWorkflow, ...workflows]);
    toast({
      title: "✅ Workflow Activated!",
      description: `Your workflow "${workflowName}" is now active.`,
    });
    setIsCreatingWorkflow(false);
    setActiveTab("workflows");
    setCreateStep(1);
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(wf =>
      wf.id === id ? { ...wf, status: wf.status === "active" ? "paused" : "active" } : wf
    ));
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(wf => wf.id !== id));
    toast({ title: "Workflow deleted" });
  };

  if (!app) return null;

  return (
    <DashboardLayout>
      <RazorpayAuthGate appName={app.name}>
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border bg-background shrink-0">
                <img src={app.logo} alt={app.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{app.name}</h1>
                  <Badge variant="secondary" className="text-[10px]">Installed</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{app.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Documentation
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
              {isCreatingWorkflow && <TabsTrigger value="create">Create Workflow</TabsTrigger>}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Active Workflows", value: workflows.filter(w => w.status === "active").length.toString(), icon: Activity, color: "text-green-600" },
                  { label: "Events Today", value: activities.length.toString(), icon: Zap, color: "text-amber-600" },
                  { label: "Total Runs", value: workflows.reduce((acc, w) => acc + w.totalRuns, 0).toString(), icon: BarChart3, color: "text-blue-600" },
                  { label: "Success Rate", value: "100%", icon: CheckCircle2, color: "text-green-600" },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Create Workflow CTA */}
              <Card className="border-dashed">
                <CardContent className="p-8 text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
                    <Zap className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Automate Your Workflows</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect Razorpay with 6,000+ apps. Automatically log payments, send receipts, update CRM, and more.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button onClick={handleCreateWorkflow} className="gap-1.5">
                      <Plus className="h-4 w-4" /> Create New Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Templates */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Popular Workflow Templates</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Log Payments to Google Sheets", trigger: "Payment Captured", action: "Add Row", icon: FileSpreadsheet },
                    { name: "Send Receipt Emails", trigger: "Payment Captured", action: "Send Email", icon: Mail },
                    { name: "WhatsApp Payment Notifications", trigger: "Payment Captured", action: "Send Message", icon: MessageCircle },
                    { name: "Add Customers to CRM", trigger: "Payment Captured", action: "Create Contact", icon: Activity },
                  ].map((template, i) => (
                    <Card key={i} className="hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <template.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {template.trigger} → {template.action}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              {activities.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h2>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium">{activity.customer}</p>
                            <p className="text-xs text-muted-foreground">
                              Payment {activity.paymentId} • {activity.amount}
                            </p>
                            <p className="text-[11px] text-green-600 mt-1">{activity.details}</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {new Date(activity.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Workflows Tab */}
            <TabsContent value="workflows" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Active Workflows ({workflows.length})</h2>
                <Button onClick={handleCreateWorkflow} size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Create New
                </Button>
              </div>

              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                            <Badge variant={workflow.status === "active" ? "default" : "secondary"} className="text-[9px]">
                              {workflow.status === "active" ? "● Active" : "○ Paused"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                                🔔 {workflow.trigger.event}
                              </div>
                              <ArrowRight className="h-3.5 w-3.5" />
                              <div className="px-2.5 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
                                📊 {workflow.action.event}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleWorkflow(workflow.id)}>
                            {workflow.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkflow(workflow.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium text-foreground">
                            {new Date(workflow.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Run</p>
                          <p className="font-medium text-foreground">
                            {workflow.lastRun ? new Date(workflow.lastRun).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Runs</p>
                          <p className="font-medium text-foreground">{workflow.totalRuns}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium text-green-600">{workflow.successRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Create Workflow Tab */}
            <TabsContent value="create" className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      createStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`h-0.5 w-16 ${createStep > step ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {createStep === 1 && "Step 1 of 4: Choose a Trigger"}
                  {createStep === 2 && "Step 2 of 4: Configure Trigger"}
                  {createStep === 3 && "Step 3 of 4: Choose Action"}
                  {createStep === 4 && "Step 4 of 4: Map Fields"}
                  {createStep === 7 && "Review & Activate"}
                </p>
              </div>

              {/* Step 1: Choose Trigger */}
              {createStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Trigger Event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Razorpay — Connected ✓</Label>
                      <p className="text-xs text-muted-foreground mb-3">Choose when this workflow should trigger:</p>
                      <div className="space-y-2">
                        {razorpayTriggers.map((trigger) => (
                          <button
                            key={trigger.value}
                            onClick={() => setSelectedTrigger(trigger.value)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              selectedTrigger === trigger.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`h-5 w-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                                selectedTrigger === trigger.value ? "border-primary" : "border-muted-foreground"
                              }`}>
                                {selectedTrigger === trigger.value && (
                                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-foreground">{trigger.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{trigger.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => {
                        setIsCreatingWorkflow(false);
                        setActiveTab("overview");
                      }}>Cancel</Button>
                      <Button onClick={() => setCreateStep(2)} disabled={!selectedTrigger}>
                        Continue <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Configure Trigger */}
              {createStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configure Trigger: {razorpayTriggers.find(t => t.value === selectedTrigger)?.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <h4 className="font-medium text-sm mb-2">Sample Trigger Data (Latest Payment)</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        <div><span className="text-muted-foreground">Payment ID:</span> <span className="font-mono">pay_MN3kXbMpuQzKc9</span></div>
                        <div><span className="text-muted-foreground">Order ID:</span> <span className="font-mono">order_MN3kXbMpuQzKc8</span></div>
                        <div><span className="text-muted-foreground">Amount:</span> ₹500.00</div>
                        <div><span className="text-muted-foreground">Customer:</span> Rahul Sharma</div>
                        <div><span className="text-muted-foreground">Email:</span> rahul@example.com</div>
                        <div><span className="text-muted-foreground">Phone:</span> +919876543210</div>
                        <div><span className="text-muted-foreground">Method:</span> Card</div>
                        <div><span className="text-muted-foreground">Status:</span> Captured</div>
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCreateStep(1)}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={() => setCreateStep(3)}>
                        Continue <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Choose Action */}
              {createStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Action App</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Popular Apps:</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {actionApps.map((actionApp) => (
                          <button
                            key={actionApp.id}
                            onClick={() => setSelectedAction(actionApp.id)}
                            className={`p-4 rounded-lg border transition-all ${
                              selectedAction === actionApp.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className={`h-12 w-12 rounded-xl ${actionApp.iconBg} flex items-center justify-center mx-auto mb-2`}>
                              <actionApp.icon className="h-6 w-6" />
                            </div>
                            <p className="font-medium text-sm text-center">{actionApp.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCreateStep(2)}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={() => setCreateStep(4)} disabled={!selectedAction}>
                        Continue <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Map Fields */}
              {createStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Map Payment Data to Google Sheets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Select Spreadsheet</Label>
                        <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a spreadsheet..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="payment-tracking-2026">Payment Tracking - 2026</SelectItem>
                            <SelectItem value="transactions">Transactions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Select Worksheet</Label>
                        <Select value={selectedWorksheet} onValueChange={setSelectedWorksheet}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a worksheet..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-payments">All Payments</SelectItem>
                            <SelectItem value="monthly">Monthly Summary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <Label className="text-sm font-medium mb-3 block">Field Mapping</Label>
                        <div className="space-y-3">
                          {[
                            { column: "A", label: "Payment ID", key: "paymentId" },
                            { column: "B", label: "Order ID", key: "orderId" },
                            { column: "C", label: "Date", key: "date" },
                            { column: "D", label: "Customer Name", key: "customerName" },
                            { column: "E", label: "Email", key: "email" },
                            { column: "F", label: "Amount (₹)", key: "amount" },
                          ].map((field) => {
                            const selectedField = availableFields.find(f => f.value === fieldMappings[field.key]);
                            return (
                              <div key={field.key}>
                                <Label className="text-xs text-muted-foreground">Column {field.column}: {field.label}</Label>
                                <Select
                                  value={fieldMappings[field.key]}
                                  onValueChange={(value) => setFieldMappings({ ...fieldMappings, [field.key]: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFields.map((f) => (
                                      <SelectItem key={f.value} value={f.value}>
                                        {f.label} {f.transform && `(${f.transform})`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {selectedField && (
                                  <p className="text-[10px] text-muted-foreground mt-1">Sample: {selectedField.sample}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCreateStep(3)}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={handleTestWorkflow} disabled={!selectedSpreadsheet || !selectedWorksheet}>
                        Test Workflow <Play className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 7: Review & Activate */}
              {createStep === 7 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-base">Test Successful!</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">Your workflow is ready to activate.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <h4 className="font-medium text-sm mb-3">Workflow Summary</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="px-3 py-2 rounded-lg bg-primary/10 text-sm">
                          🔔 Payment Captured
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="px-3 py-2 rounded-lg bg-green-100 text-sm">
                          📊 Add Row to Google Sheets
                        </div>
                      </div>
                      <div className="text-xs space-y-1">
                        <p><span className="text-muted-foreground">Spreadsheet:</span> Payment Tracking - 2026</p>
                        <p><span className="text-muted-foreground">Worksheet:</span> All Payments</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Workflow Name</Label>
                      <Input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Enter workflow name..."
                        className="mt-1"
                      />
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCreateStep(4)}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={handleSaveWorkflow} className="gap-1.5">
                        <Zap className="h-4 w-4" /> Save & Activate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </RazorpayAuthGate>
    </DashboardLayout>
  );
};

export default ZapierApp;
