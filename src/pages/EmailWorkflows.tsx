import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Mail, Plus, CheckCircle2, Clock, Sparkles, ListFilter,
  Send, Bot, ArrowRight, Zap, FileText, MessageCircle,
  ShoppingCart, UserPlus, GraduationCap, Video, Bell,
  ToggleLeft, ChevronRight, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type WorkflowCategory = "all" | "operations" | "marketing" | "engagement" | "support";

interface Workflow {
  id: number;
  name: string;
  description: string;
  trigger: string;
  category: WorkflowCategory;
  actions: string[];
  enabled: boolean;
  isDefault: boolean;
  runs: number;
  lastRun?: string;
}

const workflowsData: Workflow[] = [
  {
    id: 1, name: "Send Payment Receipts", description: "Automatically send payment receipt emails after every successful payment",
    trigger: "Payment Captured", category: "operations", actions: ["Send Email with receipt details"],
    enabled: true, isDefault: true, runs: 1248, lastRun: "2 min ago",
  },
  {
    id: 2, name: "Onboard Student to LMS", description: "Add students to the course LMS and send access credentials after course payment",
    trigger: "Course Payment Success", category: "operations", actions: ["Create LMS account", "Enroll in course", "Send credentials email"],
    enabled: true, isDefault: true, runs: 342, lastRun: "15 min ago",
  },
  {
    id: 3, name: "Webinar Registration Confirmation", description: "Send confirmation email with meeting link when a student registers for a webinar",
    trigger: "Webinar Registration", category: "engagement", actions: ["Send confirmation email", "Add to calendar invite"],
    enabled: true, isDefault: false, runs: 567, lastRun: "1 hr ago",
  },
  {
    id: 4, name: "Post-Webinar Follow Up", description: "Send recording link and feedback form after webinar ends",
    trigger: "Webinar Ended", category: "marketing", actions: ["Send recording email", "Send feedback form"],
    enabled: true, isDefault: false, runs: 89, lastRun: "2 days ago",
  },
  {
    id: 5, name: "Abandoned Cart Recovery", description: "Send reminder emails when a student leaves the checkout without completing payment",
    trigger: "Cart Abandoned (30 min)", category: "marketing", actions: ["Send reminder email", "Send WhatsApp nudge"],
    enabled: false, isDefault: false, runs: 156, lastRun: "1 day ago",
  },
  {
    id: 6, name: "Course Completion Certificate", description: "Auto-generate and email certificate when a student completes all course modules",
    trigger: "Course Completed", category: "engagement", actions: ["Generate certificate", "Send email with certificate"],
    enabled: false, isDefault: false, runs: 45, lastRun: "5 days ago",
  },
  {
    id: 7, name: "Subscription Renewal Reminder", description: "Remind students 3 days before their subscription is due for renewal",
    trigger: "3 Days Before Renewal", category: "operations", actions: ["Send renewal reminder email"],
    enabled: true, isDefault: false, runs: 210, lastRun: "6 hrs ago",
  },
  {
    id: 8, name: "Failed Payment Retry Notification", description: "Notify students when a payment fails and provide retry instructions",
    trigger: "Payment Failed", category: "support", actions: ["Send payment failed email", "Send retry link"],
    enabled: true, isDefault: false, runs: 34, lastRun: "3 hrs ago",
  },
];

const categoryConfig: Record<WorkflowCategory, { label: string; color: string }> = {
  all: { label: "All", color: "" },
  operations: { label: "Operations", color: "bg-blue-100 text-blue-700" },
  marketing: { label: "Marketing", color: "bg-purple-100 text-purple-700" },
  engagement: { label: "Engagement", color: "bg-emerald-100 text-emerald-700" },
  support: { label: "Support", color: "bg-amber-100 text-amber-700" },
};

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: string[];
  quickActions?: { label: string; description: string; icon: any }[];
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "👋 Hi! I'm your workflow assistant. Tell me what you'd like to automate, and I'll help you set it up.\n\nYou can describe your full requirement in one go, or pick from the suggestions below.",
    quickActions: [
      { label: "Post-payment onboarding", description: "Enroll students in LMS after course purchase", icon: GraduationCap },
      { label: "Webinar follow-up", description: "Send recordings & collect feedback after webinars", icon: Video },
      { label: "Abandoned cart recovery", description: "Re-engage students who didn't complete checkout", icon: ShoppingCart },
      { label: "Subscription reminders", description: "Notify before renewals or after failed payments", icon: Bell },
      { label: "Certificate on completion", description: "Auto-generate certificates when courses are finished", icon: FileText },
      { label: "Lead nurturing sequence", description: "Drip emails to convert free webinar attendees to paid", icon: UserPlus },
    ],
  },
];

const EmailWorkflows = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"ai" | "form">("ai");
  const [activeCategory, setActiveCategory] = useState<WorkflowCategory>("all");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const filtered = workflowsData.filter(
    (w) => activeCategory === "all" || w.category === activeCategory
  );

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let response: ChatMessage;

      if (lower.includes("webinar") && (lower.includes("free") || lower.includes("add") || lower.includes("customer"))) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Great idea! Here's what I understand:\n\n**Workflow: Add Free Webinar Attendees to Nurture Sequence**\n\n📌 **Trigger:** When a student registers for a free webinar\n\n⚡ **Actions:**\n1. Add contact to \"Free Webinar Leads\" segment\n2. Send welcome email with webinar details & calendar invite\n3. After webinar ends → Send recording link\n4. Day 2 → Send a related course recommendation\n5. Day 5 → Send a limited-time discount offer for the paid course\n\n📂 **Category:** Marketing\n\nWould you like me to:\n- **Create this workflow** as described?\n- **Modify** any of the steps?\n- **Add more actions** like WhatsApp or SMS?",
          suggestions: ["Create this workflow", "Add WhatsApp reminder before webinar", "Add SMS follow-up on Day 3", "Change the discount timing to Day 7"],
        };
      } else if (lower.includes("payment") || lower.includes("receipt")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's a payment workflow I'd recommend:\n\n**Workflow: Smart Payment Follow-up**\n\n📌 **Trigger:** Payment Captured\n\n⚡ **Actions:**\n1. Send detailed receipt email with invoice\n2. Add student to the purchased course in LMS\n3. Send welcome email with getting started guide\n4. Day 3 → Send \"How's it going?\" check-in email\n\n📂 **Category:** Operations\n\nShall I create this, or would you like to adjust anything?",
          suggestions: ["Create this workflow", "Skip the Day 3 check-in", "Add WhatsApp receipt too", "Split into separate workflows"],
        };
      } else if (lower.includes("certificate") || lower.includes("completion")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's a completion certificate workflow:\n\n**Workflow: Auto Certificate on Course Completion**\n\n📌 **Trigger:** Student completes all modules\n\n⚡ **Actions:**\n1. Generate personalized certificate (PDF)\n2. Email certificate with congratulations message\n3. Add a completion badge to student profile\n4. Send a \"What's Next\" email with advanced course recommendations\n\n📂 **Category:** Engagement\n\nReady to create this?",
          suggestions: ["Create this workflow", "Add LinkedIn share option", "Include a feedback survey", "Customize certificate template"],
        };
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I can help you build that! Let me ask a few things to design the right workflow:\n\n**1. What should trigger this workflow?**\n- Payment captured / failed\n- Student registration / enrollment\n- Course completion\n- Time-based (e.g., X days after event)\n- Manual trigger\n\n**2. What actions should happen?**\n- Send email / WhatsApp / SMS\n- Enroll in course or LMS\n- Add to a segment or tag\n- Generate certificate\n\n**3. Any conditions or delays?**\n- Only for specific courses?\n- Wait X hours/days between steps?\n\nFeel free to answer all at once or one by one!`,
          suggestions: ["On registration → send email + enroll in LMS", "After webinar → send recording + discount", "Payment failed → retry notification + WhatsApp"],
        };
      }

      setChatMessages((prev) => [...prev, response]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleQuickAction = (label: string) => {
    handleSendMessage(label);
  };

  const handleSuggestion = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">Automate your education business with smart workflows</p>
          </div>
          <Button className="gap-2" onClick={() => { setShowCreate(true); setChatMessages(initialMessages); setCreateMode("ai"); }}>
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Zap, label: "Total Runs (Month)", value: "2,691" },
            { icon: CheckCircle2, label: "Success Rate", value: "98.4%" },
            { icon: Clock, label: "Active Workflows", value: String(workflowsData.filter((w) => w.enabled).length) },
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

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          {(Object.keys(categoryConfig) as WorkflowCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {categoryConfig[cat].label}
            </button>
          ))}
        </div>

        {/* Workflows List */}
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="blade-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", w.enabled ? "bg-primary/10" : "bg-muted")}>
                <Zap className={cn("h-5 w-5", w.enabled ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{w.name}</span>
                  {w.isDefault && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>
                  )}
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", categoryConfig[w.category].color)}>
                    {categoryConfig[w.category].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{w.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-muted-foreground">Trigger: <span className="text-foreground">{w.trigger}</span></span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{w.runs} runs</span>
                  {w.lastRun && (
                    <>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">Last: {w.lastRun}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-muted-foreground">{w.actions.length} action{w.actions.length !== 1 ? "s" : ""}</span>
                <Switch defaultChecked={w.enabled} />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Workflow Dialog — AI Chat + Form */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">Create Workflow</DialogTitle>
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                <button
                  onClick={() => setCreateMode("ai")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    createMode === "ai" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Mode
                </button>
                <button
                  onClick={() => setCreateMode("form")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    createMode === "form" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Form View
                </button>
              </div>
            </div>
          </DialogHeader>

          {createMode === "ai" ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    )}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      
                      {/* Quick action cards */}
                      {msg.quickActions && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {msg.quickActions.map((action) => (
                            <button
                              key={action.label}
                              onClick={() => handleQuickAction(action.label)}
                              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/80 hover:bg-background border border-border/50 text-left transition-colors"
                            >
                              <action.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-foreground">{action.label}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suggestion chips */}
                      {msg.suggestions && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {msg.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSuggestion(s)}
                              className="px-2.5 py-1 rounded-full bg-background/80 hover:bg-background border border-border/50 text-xs text-foreground transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-xl px-4 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:200ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:400ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-border px-5 py-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(chatInput)}
                    placeholder="Describe your workflow... e.g. 'I want to automate adding free webinar customers to a nurture sequence'"
                    className="flex-1"
                  />
                  <Button size="icon" onClick={() => handleSendMessage(chatInput)} disabled={!chatInput.trim() || isAiTyping}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Form View */
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Workflow Name</label>
                <Input placeholder="e.g. Post-Webinar Nurture Sequence" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Trigger Event</label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select trigger" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_captured">Payment Captured</SelectItem>
                    <SelectItem value="payment_failed">Payment Failed</SelectItem>
                    <SelectItem value="webinar_registration">Webinar Registration</SelectItem>
                    <SelectItem value="webinar_ended">Webinar Ended</SelectItem>
                    <SelectItem value="course_completed">Course Completed</SelectItem>
                    <SelectItem value="cart_abandoned">Cart Abandoned</SelectItem>
                    <SelectItem value="subscription_renewal">Before Subscription Renewal</SelectItem>
                    <SelectItem value="manual">Manual Trigger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Actions</label>
                <div className="mt-1.5 space-y-2">
                  {["Send Email", "Send WhatsApp", "Enroll in LMS", "Add Tag/Segment"].map((action) => (
                    <div key={action} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-secondary/30">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm text-foreground">{action}</span>
                      <Switch className="ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea placeholder="What does this workflow do?" rows={3} className="mt-1.5" />
              </div>
              <Button className="w-full">Create Workflow</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmailWorkflows;
