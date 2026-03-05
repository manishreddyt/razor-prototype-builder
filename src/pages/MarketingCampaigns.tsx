import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Mail, Plus, CheckCircle2, Clock, Sparkles, ListFilter,
  Send, Bot, ArrowRight, Zap, FileText, MessageCircle,
  ShoppingCart, UserPlus, GraduationCap, Video, Bell,
  ToggleLeft, ChevronRight, Tag, ArrowLeft, Trash2,
  Edit3, MoreHorizontal, Play, Pause, X, Phone,
  MessageSquare, Settings, ChevronDown, GripVertical,
  TrendingUp, TrendingDown, BarChart3, Users, IndianRupee,
  Eye, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CampaignType, TriggerEvent, ProductReference } from "@/types/campaigns";

type WorkflowCategory = "all" | "operations" | "marketing" | "engagement" | "support";

interface WorkflowAction {
  id: string;
  type: "email" | "sms" | "whatsapp" | "lms" | "tag" | "wait" | "certificate";
  label: string;
  config: Record<string, string>;
  enabled: boolean;
}

interface Workflow {
  id: number;
  name: string;
  description: string;
  trigger: string;
  category: WorkflowCategory;
  actions: WorkflowAction[];
  enabled: boolean;
  isDefault: boolean;
  runs: number;
  lastRun?: string;
}

const makeAction = (type: WorkflowAction["type"], label: string, config: Record<string, string> = {}): WorkflowAction => ({
  id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type, label, config, enabled: true,
});

// Campaign Type Configurations
const campaignTypeConfig: Record<CampaignType, {
  label: string;
  icon: React.ElementType;
  description: string;
  suggestedTriggers: TriggerEvent[];
  defaultActions: WorkflowAction[];
}> = {
  upsell: {
    label: "Upsell Campaign",
    icon: TrendingUp,
    description: "Promote premium products to existing customers",
    suggestedTriggers: ["course_purchased", "webinar_ended"],
    defaultActions: [
      makeAction("email", "Send product recommendation"),
      makeAction("wait", "Wait 2 days"),
      makeAction("email", "Send reminder with offer code"),
    ],
  },
  retarget_dropoff: {
    label: "Payment Recovery",
    icon: ShoppingCart,
    description: "Re-engage users who abandoned checkout or had failed payments",
    suggestedTriggers: ["payment_failed", "cart_abandoned"],
    defaultActions: [
      makeAction("email", "Send reminder email"),
      makeAction("wait", "Wait 4 hours"),
      makeAction("whatsapp", "Send WhatsApp nudge with discount"),
    ],
  },
  webinar_nurture: {
    label: "Webinar Nurture",
    icon: Video,
    description: "Automated follow-ups for webinar attendees",
    suggestedTriggers: ["webinar_registration", "webinar_ended"],
    defaultActions: [
      makeAction("email", "Send confirmation with meeting link"),
      makeAction("wait", "Wait until webinar ends"),
      makeAction("email", "Send recording + course offer"),
    ],
  },
  generic: {
    label: "Generic Campaign",
    icon: Zap,
    description: "Custom automation for any trigger",
    suggestedTriggers: ["payment_success"],
    defaultActions: [makeAction("email", "Send custom message")],
  },
};

const defaultWorkflows: Workflow[] = [
  {
    id: 1, name: "Send Payment Receipts", description: "Automatically send payment receipt emails after every successful payment",
    trigger: "Payment Captured", category: "operations",
    actions: [makeAction("email", "Send Email with receipt details", { subject: "Payment Receipt - {{amount}}", body: "Hi {{name}},\n\nYour payment of ₹{{amount}} has been received successfully.\n\nTransaction ID: {{txn_id}}\n\nThank you!" })],
    enabled: true, isDefault: true, runs: 1248, lastRun: "2 min ago",
  },
  {
    id: 2, name: "Onboard Student to LMS", description: "Add students to the course LMS and send access credentials after course payment",
    trigger: "Course Payment Success", category: "operations",
    actions: [makeAction("lms", "Create LMS account & enroll"), makeAction("email", "Send credentials email", { subject: "Your Course Access is Ready!", body: "Hi {{name}},\n\nYour account has been created. Login at {{lms_url}} with your email.\n\nHappy Learning!" })],
    enabled: true, isDefault: true, runs: 342, lastRun: "15 min ago",
  },
  {
    id: 3, name: "Webinar Registration Confirmation", description: "Send confirmation email with meeting link when a student registers for a webinar",
    trigger: "Webinar Registration", category: "engagement",
    actions: [makeAction("email", "Send confirmation email", { subject: "You're Registered! 🎉", body: "Hi {{name}},\n\nYou're confirmed for {{webinar_name}} on {{date}}.\n\nMeeting link: {{meeting_link}}" }), makeAction("wait", "Wait 1 hour before webinar"), makeAction("whatsapp", "Send WhatsApp reminder")],
    enabled: true, isDefault: false, runs: 567, lastRun: "1 hr ago",
  },
  {
    id: 4, name: "Post-Webinar Follow Up", description: "Send recording link and feedback form after webinar ends",
    trigger: "Webinar Ended", category: "marketing",
    actions: [makeAction("email", "Send recording email", { subject: "Webinar Recording is Ready 🎥", body: "Hi {{name}},\n\nThanks for attending! Here's the recording: {{recording_link}}\n\nPlease share your feedback: {{feedback_link}}" }), makeAction("wait", "Wait 2 days"), makeAction("email", "Send course recommendation")],
    enabled: true, isDefault: false, runs: 89, lastRun: "2 days ago",
  },
  {
    id: 5, name: "Abandoned Cart Recovery", description: "Send reminder emails when a student leaves the checkout without completing payment",
    trigger: "Cart Abandoned (30 min)", category: "marketing",
    actions: [makeAction("email", "Send reminder email"), makeAction("wait", "Wait 4 hours"), makeAction("whatsapp", "Send WhatsApp nudge")],
    enabled: false, isDefault: false, runs: 156, lastRun: "1 day ago",
  },
  {
    id: 6, name: "Subscription Renewal Reminder", description: "Remind students 3 days before their subscription is due for renewal",
    trigger: "3 Days Before Renewal", category: "operations",
    actions: [makeAction("email", "Send renewal reminder email", { subject: "Subscription Renewal in 3 Days", body: "Hi {{name}},\n\nYour subscription renews on {{renewal_date}}. Make sure your payment method is up to date." })],
    enabled: true, isDefault: false, runs: 210, lastRun: "6 hrs ago",
  },
];

const categoryConfig: Record<WorkflowCategory, { label: string; color: string }> = {
  all: { label: "All", color: "" },
  operations: { label: "Operations", color: "bg-blue-100 text-blue-700" },
  marketing: { label: "Marketing", color: "bg-purple-100 text-purple-700" },
  engagement: { label: "Engagement", color: "bg-emerald-100 text-emerald-700" },
  support: { label: "Support", color: "bg-amber-100 text-amber-700" },
};

const actionTypeConfig: Record<WorkflowAction["type"], { icon: any; label: string; color: string; bgColor: string }> = {
  email: { icon: Mail, label: "Email", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  sms: { icon: Phone, label: "SMS", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  lms: { icon: GraduationCap, label: "LMS Enroll", color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
  tag: { icon: Tag, label: "Add Tag", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  wait: { icon: Clock, label: "Wait/Delay", color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" },
  certificate: { icon: FileText, label: "Certificate", color: "text-pink-600", bgColor: "bg-pink-50 border-pink-200" },
};

const triggerOptions = [
  "Payment Captured", "Payment Failed", "Webinar Registration", "Webinar Ended",
  "Course Payment Success", "Course Completed", "Cart Abandoned (30 min)",
  "3 Days Before Renewal", "New Student Signup", "Manual Trigger",
];

// ─── Helper Functions ───
const getAvailableProducts = (): ProductReference[] => {
  const smartPages = JSON.parse(localStorage.getItem("smart-pages") || "[]");
  return smartPages.map((page: any) => ({
    id: page.id,
    type: page.type,
    name: page.name,
    pageUrl: `/page/${page.id}`,
  }));
};

const getActiveOffers = () => {
  // Mock data for prototype - replace with actual API call
  return [
    { code: "EARLYBIRD25", discount: "25%", used: 48, limit: 100 },
    { code: "LAUNCH500", discount: "₹500", used: 156, limit: 500 },
    { code: "REFERRAL10", discount: "10%", used: 89, limit: null },
  ].filter(o => !o.limit || o.used < o.limit);
};

const getTemplateVariables = (campaignType?: CampaignType): string[] => {
  const baseVars = ["{{name}}", "{{email}}"];

  const campaignVars: Record<CampaignType, string[]> = {
    webinar_nurture: [
      "{{webinar_name}}", "{{recording_link}}", "{{meeting_link}}",
      "{{webinar_date}}", "{{product_name}}", "{{product_link}}",
      "{{offer_code}}"
    ],
    upsell: [
      "{{previous_course}}", "{{product_name}}", "{{product_link}}",
      "{{offer_code}}", "{{discount_amount}}"
    ],
    retarget_dropoff: [
      "{{abandoned_product}}", "{{cart_value}}", "{{checkout_link}}",
      "{{offer_code}}"
    ],
    generic: ["{{product_name}}", "{{product_link}}"],
  };

  return [...baseVars, ...(campaignType ? campaignVars[campaignType] : [])];
};

const formatRevenue = (revenue: number): string => {
  if (revenue >= 10000000) return `${(revenue / 10000000).toFixed(1)}Cr`;
  if (revenue >= 100000) return `${(revenue / 100000).toFixed(1)}L`;
  if (revenue >= 1000) return `${(revenue / 1000).toFixed(1)}K`;
  return revenue.toString();
};

// ─── Campaign Performance Data ───
interface Campaign {
  id: string;
  name: string;
  type: "webinar" | "course_launch" | "drip" | "cart_recovery";
  date: string;
  leads: number;
  paidCustomers: number;
  revenue: number;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  status: "completed" | "active" | "scheduled";
}

const campaignData: Campaign[] = [
  { id: "c1", name: "AI for Business Masterclass", type: "webinar", date: "2026-02-28", leads: 1248, paidCustomers: 187, revenue: 467500, emailsSent: 3200, openRate: 42.5, clickRate: 18.3, status: "completed" },
  { id: "c2", name: "Full-Stack Dev Bootcamp Launch", type: "course_launch", date: "2026-02-25", leads: 892, paidCustomers: 134, revenue: 938000, emailsSent: 2400, openRate: 38.7, clickRate: 15.1, status: "completed" },
  { id: "c3", name: "Design Thinking Workshop", type: "webinar", date: "2026-02-20", leads: 567, paidCustomers: 78, revenue: 195000, emailsSent: 1800, openRate: 45.2, clickRate: 21.6, status: "completed" },
  { id: "c4", name: "Digital Marketing Webinar", type: "webinar", date: "2026-02-15", leads: 2103, paidCustomers: 312, revenue: 780000, emailsSent: 5400, openRate: 39.8, clickRate: 16.4, status: "completed" },
  { id: "c5", name: "Data Science Intro", type: "webinar", date: "2026-03-01", leads: 456, paidCustomers: 52, revenue: 130000, emailsSent: 1200, openRate: 41.0, clickRate: 19.2, status: "active" },
  { id: "c6", name: "Cart Recovery - Feb Batch", type: "cart_recovery", date: "2026-02-01", leads: 340, paidCustomers: 89, revenue: 222500, emailsSent: 980, openRate: 52.1, clickRate: 28.4, status: "completed" },
  { id: "c7", name: "Product Management Live", type: "webinar", date: "2026-03-05", leads: 128, paidCustomers: 0, revenue: 0, emailsSent: 450, openRate: 0, clickRate: 0, status: "scheduled" },
  { id: "c8", name: "Advanced React Patterns", type: "drip", date: "2026-02-10", leads: 734, paidCustomers: 98, revenue: 490000, emailsSent: 4200, openRate: 36.5, clickRate: 14.8, status: "completed" },
];

const campaignTypeLabels: Record<Campaign["type"], { label: string; color: string }> = {
  webinar: { label: "Webinar", color: "bg-purple-100 text-purple-700" },
  course_launch: { label: "Course Launch", color: "bg-blue-100 text-blue-700" },
  drip: { label: "Drip Sequence", color: "bg-emerald-100 text-emerald-700" },
  cart_recovery: { label: "Cart Recovery", color: "bg-amber-100 text-amber-700" },
};

// ─── Chat message types ───
interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: string[];
  parsedWorkflow?: { name: string; trigger: string; category: WorkflowCategory; actions: WorkflowAction[]; description: string };
}

type ViewMode = "list" | "campaign-type" | "create-chat" | "builder" | "detail";

// ─── Main Component ───
const MarketingCampaigns = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeCategory, setActiveCategory] = useState<WorkflowCategory>("all");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Builder state
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // Detail state
  const [detailWorkflow, setDetailWorkflow] = useState<Workflow | null>(null);

  // Campaign creation state
  const [currentCampaignType, setCurrentCampaignType] = useState<CampaignType | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ProductReference[]>([]);
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<CampaignType | "all">("all");
  const [hasStartedCreate, setHasStartedCreate] = useState(false);

  // URL parameter handling
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const prefilledType = searchParams.get("type") as CampaignType | null;
  const prefilledProductId = searchParams.get("product");

  const filtered = workflows.filter(
    (w) => activeCategory === "all" || w.category === activeCategory
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  // Handle pre-filled campaign creation from URL params
  useEffect(() => {
    if (prefilledType && !hasStartedCreate) {
      const product = getAvailableProducts().find(p => p.id === prefilledProductId);
      startCreateWithPrefill(prefilledType, product);
      setHasStartedCreate(true);
    }
  }, [prefilledType, prefilledProductId, hasStartedCreate]);

  const startCreateWithPrefill = (type: CampaignType, product?: ProductReference) => {
    const config = campaignTypeConfig[type];

    // Set initial state
    setCurrentCampaignType(type);
    setSelectedProducts(product ? [product] : []);

    // Start with AI chat pre-filled
    setChatMessages([{
      id: "welcome",
      role: "assistant",
      content: `I'll help you set up a **${config.label}** for your ${product?.name || 'product'}.\n\n${config.description}\n\n**What I'll create:**\n${config.defaultActions.map((a, i) => `${i + 1}. ${a.label}`).join('\n')}\n\nTell me if you'd like to customize this, or I can generate it now!`,
      suggestions: [
        "Generate this campaign",
        "Customize the messages",
        "Add an offer code",
      ],
    }]);

    setViewMode("create-chat");
  };

  const startCreate = (campaignType?: CampaignType) => {
    if (!campaignType) {
      setViewMode("campaign-type");
      return;
    }

    // Pre-fill based on campaign type
    const config = campaignTypeConfig[campaignType];
    setCurrentCampaignType(campaignType);

    setChatMessages([{
      id: "welcome",
      role: "assistant",
      content: `I'll help you set up a **${config.label}**.\n\n${config.description}\n\n**What I'll create:**\n${config.defaultActions.map((a, i) => `${i + 1}. ${a.label}`).join('\n')}\n\nTell me if you'd like to customize this, or I can generate it now!`,
      suggestions: ["Generate this campaign", "Customize the messages", "Add an offer code"],
    }]);
    setViewMode("create-chat");
  };

  const parseWorkflowFromMessage = (text: string): ChatMessage["parsedWorkflow"] => {
    const lower = text.toLowerCase();
    if (lower.includes("webinar") && (lower.includes("follow") || lower.includes("recording") || lower.includes("after"))) {
      return {
        name: "Post-Webinar Nurture Sequence",
        trigger: "Webinar Ended",
        category: "marketing",
        description: "Follow up with attendees after webinar with recording and course offer",
        actions: [
          makeAction("email", "Send recording & thank you email", { subject: "Here's your webinar recording 🎥", body: "Hi {{name}},\n\nThanks for attending {{webinar_name}}!\n\nHere's the recording: {{recording_link}}\n\nWe hope you found it valuable!" }),
          makeAction("wait", "Wait 2 days", { duration: "2 days" }),
          makeAction("email", "Send course recommendation", { subject: "Ready to dive deeper? 🚀", body: "Hi {{name}},\n\nBased on the webinar you attended, we think you'd love our course: {{course_name}}.\n\nEnroll now with 20% off: {{course_link}}" }),
          makeAction("wait", "Wait 3 days", { duration: "3 days" }),
          makeAction("whatsapp", "Send discount reminder on WhatsApp", { message: "Hi {{name}}! Just a reminder — your 20% discount for {{course_name}} expires tomorrow. Don't miss out! 🎯" }),
        ],
      };
    }
    if (lower.includes("abandon") || lower.includes("cart")) {
      return {
        name: "Abandoned Cart Recovery",
        trigger: "Cart Abandoned (30 min)",
        category: "marketing",
        description: "Multi-channel recovery sequence for abandoned checkouts",
        actions: [
          makeAction("email", "Send cart reminder email", { subject: "You left something behind! 🛒", body: "Hi {{name}},\n\nYou were so close to enrolling in {{course_name}}!\n\nComplete your purchase: {{checkout_link}}" }),
          makeAction("wait", "Wait 4 hours", { duration: "4 hours" }),
          makeAction("whatsapp", "Send WhatsApp nudge", { message: "Hey {{name}}, you have an incomplete purchase for {{course_name}}. Complete it here: {{checkout_link}} 📚" }),
          makeAction("wait", "Wait 1 day", { duration: "1 day" }),
          makeAction("sms", "Send SMS with urgency", { message: "Last chance! Your cart for {{course_name}} expires soon. Complete purchase: {{short_link}}" }),
        ],
      };
    }
    if (lower.includes("receipt") || lower.includes("payment") || lower.includes("lms") || lower.includes("enroll")) {
      return {
        name: "Payment Receipt & LMS Onboarding",
        trigger: "Course Payment Success",
        category: "operations",
        description: "Send receipt, enroll in LMS, and welcome the student",
        actions: [
          makeAction("email", "Send payment receipt", { subject: "Payment Confirmed ✅ — ₹{{amount}}", body: "Hi {{name}},\n\nPayment of ₹{{amount}} received for {{course_name}}.\n\nTransaction ID: {{txn_id}}\n\nYour course access is being set up!" }),
          makeAction("lms", "Create LMS account & enroll in course"),
          makeAction("email", "Send welcome & access email", { subject: "Welcome! Your course is ready 🎓", body: "Hi {{name}},\n\nYour account is ready! Login here: {{lms_url}}\n\nCourse: {{course_name}}\n\nHappy learning!" }),
          makeAction("wait", "Wait 3 days", { duration: "3 days" }),
          makeAction("email", "Send check-in email", { subject: "How's your learning going? 📖", body: "Hi {{name}},\n\nJust checking in! How are you finding {{course_name}}?\n\nIf you need help, reply to this email." }),
        ],
      };
    }
    if (lower.includes("certificate") || lower.includes("complet")) {
      return {
        name: "Course Completion Certificate",
        trigger: "Course Completed",
        category: "engagement",
        description: "Auto-generate and send certificate on course completion",
        actions: [
          makeAction("certificate", "Generate personalized certificate"),
          makeAction("email", "Send certificate email", { subject: "Congratulations! 🎉 Your Certificate", body: "Hi {{name}},\n\nYou've completed {{course_name}}! Your certificate is attached.\n\nShare your achievement!" }),
          makeAction("tag", "Add 'course-completed' tag"),
          makeAction("wait", "Wait 2 days", { duration: "2 days" }),
          makeAction("email", "Send next course recommendation", { subject: "What's Next? 🚀", body: "Hi {{name}},\n\nNow that you've mastered {{course_name}}, here are some advanced courses..." }),
        ],
      };
    }
    // Generic
    return {
      name: "Custom Workflow",
      trigger: "Manual Trigger",
      category: "operations",
      description: text,
      actions: [
        makeAction("email", "Send notification email", { subject: "Notification", body: "Hi {{name}},\n\n" + text }),
      ],
    };
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      const isCreateConfirmation = text.toLowerCase().includes("create") || text.toLowerCase().includes("configure") || text.toLowerCase().includes("looks good") || text.toLowerCase().includes("yes");
      const lastAssistant = [...chatMessages].reverse().find(m => m.role === "assistant" && m.parsedWorkflow);

      if (isCreateConfirmation && lastAssistant?.parsedWorkflow) {
        // Move to builder
        const pw = lastAssistant.parsedWorkflow;
        const wf: Workflow = {
          id: Date.now(), name: pw.name, description: pw.description,
          trigger: pw.trigger, category: pw.category, actions: [...pw.actions],
          enabled: true, isDefault: false, runs: 0,
        };
        setEditingWorkflow(wf);
        setChatMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(), role: "assistant",
          content: "🚀 Opening the visual workflow builder — you can configure each action, reorder steps, and customize email/SMS content before publishing.",
        }]);
        setIsAiTyping(false);
        setTimeout(() => setViewMode("builder"), 1200);
        return;
      }

      const parsed = parseWorkflowFromMessage(text);
      const actionsList = parsed.actions.map((a, i) => `${i + 1}. **${actionTypeConfig[a.type].label}:** ${a.label}`).join("\n");

      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Here's what I've designed:\n\n**${parsed.name}**\n\n📌 **Trigger:** ${parsed.trigger}\n📂 **Category:** ${categoryConfig[parsed.category].label}\n\n⚡ **Actions:**\n${actionsList}\n\n✨ **Next Step:** Click "Configure Campaign" below to open the builder where you can:\n• Customize email content and subjects\n• Add product references and offer codes\n• Adjust triggers and timing\n• Preview and publish your campaign`,
        suggestions: ["Configure Campaign →", "Add SMS follow-up", "Change the trigger", "Start over"],
        parsedWorkflow: parsed,
      };

      setChatMessages(prev => [...prev, response]);
      setIsAiTyping(false);
    }, 1500);
  };

  const saveWorkflow = () => {
    if (!editingWorkflow) return;
    const existing = workflows.find(w => w.id === editingWorkflow.id);
    if (existing) {
      setWorkflows(prev => prev.map(w => w.id === editingWorkflow.id ? editingWorkflow : w));
      toast.success("Campaign updated successfully!");
    } else {
      setWorkflows(prev => [...prev, editingWorkflow]);
      toast.success("Campaign activated! Your automated marketing is now live 🚀");
    }
    setEditingWorkflow(null);
    setEditingActionId(null);
    setViewMode("list");
  };

  const deleteWorkflow = (id: number) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    toast.success("Workflow deleted");
    if (detailWorkflow?.id === id) setViewMode("list");
  };

  const toggleWorkflow = (id: number) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const openEdit = (wf: Workflow) => {
    setEditingWorkflow({ ...wf, actions: wf.actions.map(a => ({ ...a })) });
    setEditingActionId(null);
    setViewMode("builder");
  };

  const openDetail = (wf: Workflow) => {
    setDetailWorkflow(wf);
    setViewMode("detail");
  };

  const currentSuggestions = (() => {
    const lastAssistant = [...chatMessages].reverse().find(m => m.role === "assistant");
    return lastAssistant?.suggestions || [];
  })();

  // ─── CAMPAIGN TYPE SELECTOR VIEW ───
  if (viewMode === "campaign-type") {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6 py-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Choose Campaign Type</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select the type of marketing automation you want to set up
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(campaignTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => startCreate(type as CampaignType)}
                className="blade-card p-6 text-left hover:border-primary transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <config.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">{config.label}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {config.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {config.suggestedTriggers.slice(0, 2).map(trigger => (
                        <Badge key={trigger} variant="outline" className="text-xs">
                          {trigger.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── LIST VIEW ───
  if (viewMode === "list") {
    const totalLeads = campaignData.reduce((s, c) => s + c.leads, 0);
    const totalPaid = campaignData.reduce((s, c) => s + c.paidCustomers, 0);
    const totalRevenue = campaignData.reduce((s, c) => s + c.revenue, 0);
    const avgConversion = totalLeads > 0 ? ((totalPaid / totalLeads) * 100).toFixed(1) : "0";

    return (
      <DashboardLayout>
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Marketing Campaigns</h1>
              <p className="text-sm text-muted-foreground mt-1">Drive revenue with automated marketing campaigns and upsells</p>
            </div>
            <Button className="gap-2" onClick={startCreate}>
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </div>

          <Tabs defaultValue="workflows" className="space-y-5">
            <TabsList>
              <TabsTrigger value="workflows" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Workflows</TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-5">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { icon: Zap, label: "Active Campaigns", value: workflows.filter(w => w.enabled).length },
                  { icon: Users, label: "Total Triggers", value: workflows.reduce((s, w) => s + w.runs, 0).toLocaleString() },
                  { icon: Mail, label: "Messages Sent", value: (workflows.reduce((s, w) => s + w.runs, 0) * 2.3).toFixed(0) },
                  { icon: Eye, label: "Avg Open Rate", value: "42%" },
                  { icon: IndianRupee, label: "Revenue", value: `₹${formatRevenue(totalRevenue)}` },
                ].map(s => (
                  <div key={s.label} className="blade-stat flex items-center gap-4">
                    <s.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-xl font-semibold text-foreground">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                {(Object.keys(categoryConfig) as WorkflowCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {categoryConfig[cat].label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filtered.map(w => (
                  <div
                    key={w.id}
                    className="blade-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openDetail(w)}
                  >
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", w.enabled ? "bg-primary/10" : "bg-muted")}>
                      <Zap className={cn("h-5 w-5", w.enabled ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{w.name}</span>
                        {w.isDefault && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>}
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", categoryConfig[w.category].color)}>
                          {categoryConfig[w.category].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{w.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground">Trigger: <span className="text-foreground">{w.trigger}</span></span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground">{w.actions.length} action{w.actions.length !== 1 ? "s" : ""}</span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground">{w.runs} runs</span>
                        {w.lastRun && <>
                          <span className="text-[11px] text-muted-foreground">·</span>
                          <span className="text-[11px] text-muted-foreground">Last: {w.lastRun}</span>
                        </>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <Switch checked={w.enabled} onCheckedChange={() => toggleWorkflow(w.id)} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(w)}>
                            <Edit3 className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteWorkflow(w.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No workflows in this category. <button onClick={startCreate} className="text-primary hover:underline">Create one</button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-5">
              {/* Campaign Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Total Leads", value: totalLeads.toLocaleString(), sub: "across all campaigns" },
                  { icon: UserPlus, label: "Paid Customers", value: totalPaid.toLocaleString(), sub: `${avgConversion}% conversion` },
                  { icon: IndianRupee, label: "Revenue Generated", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, sub: "from workflow campaigns" },
                  { icon: Mail, label: "Emails Sent", value: campaignData.reduce((s, c) => s + c.emailsSent, 0).toLocaleString(), sub: "total messages" },
                ].map(s => (
                  <div key={s.label} className="blade-stat flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-semibold text-foreground">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Table */}
              <div className="blade-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Open Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(c => {
                      const conversion = c.leads > 0 ? ((c.paidCustomers / c.leads) * 100).toFixed(1) : "—";
                      return (
                        <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="font-medium text-sm text-foreground">{c.name}</div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(c.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", campaignTypeLabels[c.type].color)}>
                              {campaignTypeLabels[c.type].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">{c.leads.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium text-sm">{c.paidCustomers.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className={cn("text-sm font-medium", parseFloat(conversion) >= 15 ? "text-emerald-600" : parseFloat(conversion) >= 10 ? "text-amber-600" : "text-muted-foreground")}>
                              {conversion}{conversion !== "—" ? "%" : ""}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {c.revenue > 0 ? `₹${(c.revenue / 1000).toFixed(0)}K` : "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {c.openRate > 0 ? `${c.openRate}%` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0",
                              c.status === "completed" ? "bg-muted text-muted-foreground" :
                              c.status === "active" ? "bg-emerald-100 text-emerald-700" :
                              "bg-blue-100 text-blue-700"
                            )}>
                              {c.status === "completed" ? "Completed" : c.status === "active" ? "Active" : "Scheduled"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // ─── CREATE CHAT VIEW ───
  if (viewMode === "create-chat") {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Create Workflow</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-5">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                  style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm shadow-lg shadow-primary/10"
                      : "bg-card text-foreground rounded-bl-sm border border-border/60 shadow-sm"
                  )}>
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                        .replace(/^• /gm, '<span class="inline-flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-primary inline-block"></span></span> ')
                        .replace(/^(\d+)\. /gm, '<span class="text-primary font-semibold">$1.</span> ')
                    }} />
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex gap-3 justify-start" style={{ animation: "slideUp 0.3s ease-out" }}>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="border-t border-border px-4 py-3 space-y-2.5">
            {!isAiTyping && currentSuggestions.length > 0 && (
              <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-0.5">
                {currentSuggestions.map((s, idx) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      idx === 0 && s.toLowerCase().includes("configure")
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary hover:border-primary/40"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="max-w-2xl mx-auto flex items-center gap-2 bg-card border border-border/80 rounded-2xl px-4 py-2 shadow-lg shadow-black/5 focus-within:border-primary/40 transition-all">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage(chatInput)}
                placeholder="Describe what you want to automate..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
                disabled={isAiTyping}
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage(chatInput)}
                disabled={!chatInput.trim() || isAiTyping}
                className="rounded-xl h-9 w-9 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── VISUAL BUILDER VIEW ───
  if (viewMode === "builder" && editingWorkflow) {
    const wf = editingWorkflow;
    const selectedAction = editingActionId ? wf.actions.find(a => a.id === editingActionId) : null;

    const updateAction = (actionId: string, updates: Partial<WorkflowAction>) => {
      setEditingWorkflow({
        ...wf,
        actions: wf.actions.map(a => a.id === actionId ? { ...a, ...updates } : a),
      });
    };

    const updateActionConfig = (actionId: string, key: string, value: string) => {
      setEditingWorkflow({
        ...wf,
        actions: wf.actions.map(a => a.id === actionId ? { ...a, config: { ...a.config, [key]: value } } : a),
      });
    };

    const removeAction = (actionId: string) => {
      setEditingWorkflow({ ...wf, actions: wf.actions.filter(a => a.id !== actionId) });
      if (editingActionId === actionId) setEditingActionId(null);
    };

    const addAction = (type: WorkflowAction["type"]) => {
      const newAction = makeAction(type, `New ${actionTypeConfig[type].label} action`);
      setEditingWorkflow({ ...wf, actions: [...wf.actions, newAction] });
      setEditingActionId(newAction.id);
    };

    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setViewMode("list"); setEditingWorkflow(null); }} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm font-semibold text-foreground">{wf.name}</span>
              <Badge variant="outline" className={cn("text-[10px]", categoryConfig[wf.category].color)}>
                {categoryConfig[wf.category].label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setViewMode("list"); setEditingWorkflow(null); }}>Cancel</Button>
              <Button size="sm" onClick={saveWorkflow} className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Activate Campaign
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden mt-4 gap-4">
            {/* Left: Visual flow */}
            <div className="flex-1 overflow-y-auto pr-2">
              {/* Info Banner */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Configure Your Campaign</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize email content, add product references and offer codes, then click "Activate Campaign" to start automating your marketing.
                  </p>
                </div>
              </div>

              {/* Workflow name & trigger */}
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Workflow Name</Label>
                  <Input
                    value={wf.name}
                    onChange={e => setEditingWorkflow({ ...wf, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Trigger</Label>
                  <Select value={wf.trigger} onValueChange={v => setEditingWorkflow({ ...wf, trigger: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trigger node */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md bg-primary/5 border-2 border-primary/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">TRIGGER</p>
                    <p className="text-sm font-semibold text-foreground">{wf.trigger}</p>
                  </div>
                </div>

                {/* Connector line */}
                <div className="w-px h-6 bg-border" />

                {/* Action nodes */}
                {wf.actions.map((action, idx) => {
                  const cfg = actionTypeConfig[action.type];
                  const Icon = cfg.icon;
                  const isSelected = editingActionId === action.id;

                  return (
                    <div key={action.id} className="flex flex-col items-center w-full">
                      <div
                        className={cn(
                          "w-full max-w-md border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all",
                          isSelected ? "border-primary shadow-md shadow-primary/10 bg-primary/[0.02]" : "border-border hover:border-primary/40 bg-card",
                        )}
                        onClick={() => setEditingActionId(isSelected ? null : action.id)}
                      >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", cfg.bgColor)}>
                          <Icon className={cn("h-5 w-5", cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{cfg.label}</p>
                          <p className="text-sm font-medium text-foreground truncate">{action.label}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={action.enabled}
                            onCheckedChange={v => updateAction(action.id, { enabled: v })}
                            onClick={e => e.stopPropagation()}
                          />
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={e => { e.stopPropagation(); removeAction(action.id); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {idx < wf.actions.length - 1 && <div className="w-px h-6 bg-border" />}
                    </div>
                  );
                })}

                {/* Add action button */}
                <div className="w-px h-6 bg-border" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full max-w-md border-2 border-dashed border-border rounded-xl p-3 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                      <Plus className="h-4 w-4" />
                      <span className="text-xs font-medium">Add Action</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {(Object.keys(actionTypeConfig) as WorkflowAction["type"][]).map(type => {
                      const c = actionTypeConfig[type];
                      const I = c.icon;
                      return (
                        <DropdownMenuItem key={type} onClick={() => addAction(type)}>
                          <I className={cn("h-3.5 w-3.5 mr-2", c.color)} /> {c.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right: Action config panel */}
            <div className="w-[340px] border-l border-border pl-4 overflow-y-auto flex-shrink-0">
              {selectedAction ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Configure Action</h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingActionId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs">Action Label</Label>
                    <Input
                      value={selectedAction.label}
                      onChange={e => updateAction(selectedAction.id, { label: e.target.value })}
                      className="mt-1 text-sm"
                    />
                  </div>

                  {/* Type-specific config */}
                  {(selectedAction.type === "email") && (
                    <>
                      <div>
                        <Label className="text-xs">Email Subject</Label>
                        <Input
                          value={selectedAction.config.subject || ""}
                          onChange={e => updateActionConfig(selectedAction.id, "subject", e.target.value)}
                          placeholder="e.g. Welcome to {{course_name}}"
                          className="mt-1 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Use {"{{variable}}"} for dynamic content</p>
                      </div>
                      <div>
                        <Label className="text-xs">Email Body</Label>
                        <Textarea
                          value={selectedAction.config.body || ""}
                          onChange={e => updateActionConfig(selectedAction.id, "body", e.target.value)}
                          placeholder="Write your email content..."
                          rows={8}
                          className="mt-1 text-sm font-mono"
                        />
                      </div>

                      {/* NEW: Product Reference Selector */}
                      <div>
                        <Label className="text-xs">Reference Product (Optional)</Label>
                        <Select
                          value={selectedAction.config.product_id || ""}
                          onValueChange={(val) => updateActionConfig(selectedAction.id, "product_id", val)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a product to promote" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableProducts().map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Use {`{{product_name}}`} and {`{{product_link}}`} in your message
                        </p>
                      </div>

                      {/* NEW: Offer Code Selector */}
                      <div>
                        <Label className="text-xs">Apply Offer Code (Optional)</Label>
                        <Select
                          value={selectedAction.config.offer_code || ""}
                          onValueChange={(val) => updateActionConfig(selectedAction.id, "offer_code", val)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select an offer code" />
                          </SelectTrigger>
                          <SelectContent>
                            {getActiveOffers().map(offer => (
                              <SelectItem key={offer.code} value={offer.code}>
                                {offer.code} - {offer.discount} ({offer.used}/{offer.limit || "∞"} used)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Use {`{{offer_code}}`} to insert code in your message
                        </p>
                      </div>
                    </>
                  )}

                  {(selectedAction.type === "sms") && (
                    <div>
                      <Label className="text-xs">SMS Message</Label>
                      <Textarea
                        value={selectedAction.config.message || ""}
                        onChange={e => updateActionConfig(selectedAction.id, "message", e.target.value)}
                        placeholder="Write your SMS..."
                        rows={4}
                        className="mt-1 text-sm"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Max 160 characters recommended</p>
                    </div>
                  )}

                  {(selectedAction.type === "whatsapp") && (
                    <div>
                      <Label className="text-xs">WhatsApp Message</Label>
                      <Textarea
                        value={selectedAction.config.message || ""}
                        onChange={e => updateActionConfig(selectedAction.id, "message", e.target.value)}
                        placeholder="Write your WhatsApp message..."
                        rows={5}
                        className="mt-1 text-sm"
                      />
                    </div>
                  )}

                  {(selectedAction.type === "wait") && (
                    <div>
                      <Label className="text-xs">Delay Duration</Label>
                      <Input
                        value={selectedAction.config.duration || ""}
                        onChange={e => updateActionConfig(selectedAction.id, "duration", e.target.value)}
                        placeholder="e.g. 2 days, 4 hours"
                        className="mt-1 text-sm"
                      />
                    </div>
                  )}

                  {(selectedAction.type === "tag") && (
                    <div>
                      <Label className="text-xs">Tag Name</Label>
                      <Input
                        value={selectedAction.config.tag || ""}
                        onChange={e => updateActionConfig(selectedAction.id, "tag", e.target.value)}
                        placeholder="e.g. course-completed"
                        className="mt-1 text-sm"
                      />
                    </div>
                  )}

                  {(selectedAction.type === "lms" || selectedAction.type === "certificate") && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        This action will be automatically configured based on your connected LMS / certificate settings.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Select an action</p>
                  <p className="text-xs text-muted-foreground mt-1">Click any action node to configure its details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── DETAIL VIEW ───
  if (viewMode === "detail" && detailWorkflow) {
    const wf = detailWorkflow;
    return (
      <DashboardLayout>
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold text-foreground">{wf.name}</h1>
            <Badge variant="outline" className={cn("text-[10px]", categoryConfig[wf.category].color)}>
              {categoryConfig[wf.category].label}
            </Badge>
            {wf.isDefault && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
            <div className="ml-auto flex items-center gap-2">
              <Switch checked={wf.enabled} onCheckedChange={() => { toggleWorkflow(wf.id); setDetailWorkflow({ ...wf, enabled: !wf.enabled }); }} />
              <span className="text-xs text-muted-foreground">{wf.enabled ? "Active" : "Paused"}</span>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(wf)}>
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => { deleteWorkflow(wf.id); setViewMode("list"); }}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{wf.description}</p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Runs", value: wf.runs.toLocaleString() },
              { label: "Last Run", value: wf.lastRun || "Never" },
              { label: "Actions", value: `${wf.actions.length} step${wf.actions.length !== 1 ? "s" : ""}` },
            ].map(s => (
              <div key={s.label} className="blade-stat">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Visual flow (read-only) */}
          <div className="blade-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Workflow Flow</h3>
            <div className="flex flex-col items-center">
              {/* Trigger */}
              <div className="w-full max-w-md bg-primary/5 border-2 border-primary/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">TRIGGER</p>
                  <p className="text-sm font-semibold text-foreground">{wf.trigger}</p>
                </div>
              </div>

              {wf.actions.map((action, idx) => {
                const cfg = actionTypeConfig[action.type];
                const Icon = cfg.icon;
                return (
                  <div key={action.id} className="flex flex-col items-center w-full">
                    <div className="w-px h-6 bg-border" />
                    <div className={cn("w-full max-w-md border rounded-xl p-4 flex items-center gap-3 bg-card", cfg.bgColor.replace("bg-", "border-").split(" ")[0])}>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", cfg.bgColor)}>
                        <Icon className={cn("h-5 w-5", cfg.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{cfg.label}</p>
                        <p className="text-sm font-medium text-foreground">{action.label}</p>
                      </div>
                      <Badge variant={action.enabled ? "default" : "secondary"} className="text-[10px]">
                        {action.enabled ? "Active" : "Off"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
};

export default MarketingCampaigns;
