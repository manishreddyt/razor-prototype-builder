import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Mail, Plus, CheckCircle2, Clock, Sparkles,
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

interface CampaignAction {
  id: string;
  type: "email" | "sms" | "whatsapp" | "lms" | "tag" | "wait" | "certificate";
  label: string;
  config: Record<string, string>;
  enabled: boolean;
}

interface CampaignRun {
  id: string;
  campaignId: number;
  campaignName: string;
  triggerName: string; // e.g., "Webinar on 25th Jun", "Python Basics Course"
  triggerDate: string;
  executedAt: string;
  stats: {
    recipients: number;
    emailsSent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  status: "completed" | "in_progress" | "failed";
}

interface CampaignLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  emailOpened: boolean;
  linkClicked: boolean;
  status: "pending" | "engaged" | "converted";
}

interface ConvertedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  productBought: string;
  amountPaid: number;
  convertedAt: string;
  paymentMethod: string;
}

interface Campaign {
  id: number;
  name: string;
  description: string;
  trigger: string;
  audienceType?: string;
  targetProductId?: string; // "all" or specific product ID
  actions: CampaignAction[];
  enabled: boolean;
  isDefault?: boolean;
  runs: number;
  lastRun?: string;
}

const makeAction = (type: CampaignAction["type"], label: string, config: Record<string, string> = {}): CampaignAction => ({
  id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type, label, config, enabled: true,
});

// Campaign Type Configurations
const campaignTypeConfig: Record<CampaignType, {
  label: string;
  icon: React.ElementType;
  description: string;
  suggestedTriggers: TriggerEvent[];
  defaultActions: CampaignAction[];
}> = {
  upsell: {
    label: "Upsell Campaign",
    icon: TrendingUp,
    description: "Promote premium products to existing customers",
    suggestedTriggers: ["course_purchased", "webinar_ended"],
    defaultActions: [
      makeAction("whatsapp", "Send product recommendation", {
        message: "Hi {{name}}! 🎉\n\nCongratulations on completing {{current_product}}!\n\nReady to level up? Check out our {{new_product}} - it's perfect for you.\n\nGet 25% off with code UPGRADE25\n{{product_link}}"
      }),
      makeAction("wait", "Wait 2 days", { duration: "2 days" }),
      makeAction("whatsapp", "Send reminder with offer code", {
        message: "Hi {{name}}! 👋\n\nJust a reminder - your 25% discount on {{new_product}} expires tomorrow!\n\nUse code UPGRADE25: {{product_link}}"
      }),
    ],
  },
  retarget_dropoff: {
    label: "Payment Recovery",
    icon: ShoppingCart,
    description: "Re-engage users who abandoned checkout or had failed payments",
    suggestedTriggers: ["payment_failed", "cart_abandoned"],
    defaultActions: [
      makeAction("whatsapp", "Send cart reminder", {
        message: "Hi {{name}}! 🛒\n\nYou were so close to enrolling in {{product_name}}!\n\nComplete your purchase here: {{checkout_link}}"
      }),
      makeAction("wait", "Wait 4 hours", { duration: "4 hours" }),
      makeAction("whatsapp", "Send discount offer", {
        message: "{{name}}, get 10% off if you complete your purchase in the next 2 hours! 🎁\n\nUse code SAVE10: {{checkout_link}}"
      }),
    ],
  },
  webinar_nurture: {
    label: "Webinar Nurture",
    icon: Video,
    description: "Automated follow-ups for webinar attendees",
    suggestedTriggers: ["webinar_registration", "webinar_ended"],
    defaultActions: [
      makeAction("whatsapp", "Send webinar confirmation", {
        message: "Hi {{name}}! 🎉\n\nYou're registered for {{webinar_name}} on {{webinar_date}}.\n\nJoin link: {{meeting_link}}\n\nSee you there!"
      }),
      makeAction("wait", "Wait until webinar ends", { duration: "Until webinar ends" }),
      makeAction("whatsapp", "Send recording + offer", {
        message: "Thanks for attending {{webinar_name}}, {{name}}! 🙏\n\nHere's the recording: {{recording_link}}\n\nLoved it? Get our complete course with 25% off using WEBINAR25\n{{course_link}}"
      }),
    ],
  },
  generic: {
    label: "Generic Campaign",
    icon: Zap,
    description: "Custom automation for any trigger",
    suggestedTriggers: ["payment_success"],
    defaultActions: [
      makeAction("whatsapp", "Send welcome message", {
        message: "Hi {{name}}! 👋\n\nThank you for choosing us!\n\nWe're excited to have you onboard."
      })
    ],
  },
};

const defaultCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Convert Free Webinar to Paid Course",
    description: "Nurture webinar attendees with recording, testimonials, and exclusive discount to drive course enrollments",
    trigger: "Webinar Ended",
    audienceType: "webinar_attendees",
    targetProductId: "all",
    actions: [
      makeAction("email", "Send recording + thank you", { subject: "Here's your webinar recording 🎥", body: "Hi {{name}},\n\nThanks for attending {{webinar_name}}!\n\nWatch recording: {{recording_link}}" }),
      makeAction("wait", "Wait 2 days", { duration: "2 days" }),
      makeAction("email", "Promote course with offer", { subject: "Ready to dive deeper? Get 25% off", body: "Hi {{name}},\n\nLoved the webinar? Take your learning to the next level with our complete course.\n\nUse code WEBINAR25 for 25% off: {{course_link}}" }),
    ],
    enabled: true,
    isDefault: true,
    runs: 342,
    lastRun: "1 hr ago",
  },
  {
    id: 2,
    name: "Upsell Advanced Course to Basic Students",
    description: "Promote premium courses to students who completed basic courses with personalized recommendations",
    trigger: "Course Completed",
    audienceType: "course_students",
    targetProductId: "all",
    actions: [
      makeAction("email", "Send congratulations + certificate", { subject: "Congratulations on completing {{course_name}}! 🎓", body: "Hi {{name}},\n\nYou did it! Your certificate is ready.\n\nDownload: {{certificate_link}}" }),
      makeAction("wait", "Wait 3 days", { duration: "3 days" }),
      makeAction("email", "Recommend advanced course", { subject: "Take the next step: Advanced {{topic}}", body: "Hi {{name}},\n\nReady for more? Check out our Advanced {{topic}} course.\n\nEarly bird pricing: {{advanced_course_link}}" }),
    ],
    enabled: true,
    isDefault: true,
    runs: 156,
    lastRun: "3 hrs ago",
  },
  {
    id: 3,
    name: "Recover Abandoned Checkout",
    description: "Multi-channel recovery sequence with email and WhatsApp reminders + discount code",
    trigger: "Cart Abandoned (30 min)",
    audienceType: "cart_abandoners",
    targetProductId: "all",
    actions: [
      makeAction("email", "Send cart reminder", { subject: "You left something behind! 🛒", body: "Hi {{name}},\n\nComplete your enrollment: {{checkout_link}}" }),
      makeAction("wait", "Wait 4 hours", { duration: "4 hours" }),
      makeAction("whatsapp", "WhatsApp nudge with discount", { message: "Hi {{name}}! Complete your purchase now and get 10% off with code SAVE10: {{checkout_link}}" }),
    ],
    enabled: true,
    isDefault: true,
    runs: 89,
    lastRun: "20 min ago",
  },
  {
    id: 4,
    name: "Re-engage Inactive Students",
    description: "Win-back campaign for students who haven't logged in for 30 days with special offers",
    trigger: "Manual Trigger",
    audienceType: "course_students",
    targetProductId: "all",
    actions: [
      makeAction("email", "We miss you email", { subject: "We miss you! Come back to learning 🎓", body: "Hi {{name}},\n\nIt's been a while! Here's what's new...\n\nSpecial offer: 20% off any course" }),
      makeAction("wait", "Wait 5 days", { duration: "5 days" }),
      makeAction("sms", "SMS reminder", { message: "{{name}}, your 20% discount expires tomorrow! Use code COMEBACK20" }),
    ],
    enabled: false,
    isDefault: true,
    runs: 23,
    lastRun: "5 days ago",
  },
  {
    id: 5,
    name: "Payment Failed Recovery",
    description: "Automatic retry notification for failed payments with payment link",
    trigger: "Payment Failed",
    audienceType: "payment_failed",
    targetProductId: "all",
    actions: [
      makeAction("email", "Payment failed notification", { subject: "Payment Issue - Action Required", body: "Hi {{name}},\n\nYour payment couldn't be processed. Please update your payment method: {{payment_link}}" }),
      makeAction("wait", "Wait 6 hours", { duration: "6 hours" }),
      makeAction("whatsapp", "WhatsApp follow-up", { message: "Hi {{name}}, please complete your payment to continue learning: {{payment_link}}" }),
    ],
    enabled: true,
    isDefault: true,
    runs: 47,
    lastRun: "2 hrs ago",
  },
];

// Mock campaign run data
const mockCampaignRuns: Record<number, CampaignRun[]> = {
  1: [ // "Convert Free Webinar to Paid Course"
    {
      id: "run_1_1",
      campaignId: 1,
      campaignName: "Convert Free Webinar to Paid Course",
      triggerName: "Webinar on 25th Jun",
      triggerDate: "2024-06-25",
      executedAt: "2024-06-25 18:30",
      stats: { recipients: 156, emailsSent: 312, opened: 187, clicked: 89, converted: 23, revenue: 34500 },
      status: "completed",
    },
    {
      id: "run_1_2",
      campaignId: 1,
      campaignName: "Convert Free Webinar to Paid Course",
      triggerName: "Webinar on 18th Jun",
      triggerDate: "2024-06-18",
      executedAt: "2024-06-18 19:00",
      stats: { recipients: 143, emailsSent: 286, opened: 172, clicked: 76, converted: 19, revenue: 28500 },
      status: "completed",
    },
    {
      id: "run_1_3",
      campaignId: 1,
      campaignName: "Convert Free Webinar to Paid Course",
      triggerName: "Webinar on 10th Jun",
      triggerDate: "2024-06-10",
      executedAt: "2024-06-10 18:00",
      stats: { recipients: 178, emailsSent: 356, opened: 201, clicked: 98, converted: 31, revenue: 46500 },
      status: "completed",
    },
  ],
  2: [ // "Upsell Advanced Course"
    {
      id: "run_2_1",
      campaignId: 2,
      campaignName: "Upsell Advanced Course to Basic Students",
      triggerName: "Python Basics Course",
      triggerDate: "2024-06-20",
      executedAt: "2024-06-23 10:00",
      stats: { recipients: 89, emailsSent: 178, opened: 134, clicked: 67, converted: 12, revenue: 35940 },
      status: "completed",
    },
    {
      id: "run_2_2",
      campaignId: 2,
      campaignName: "Upsell Advanced Course to Basic Students",
      triggerName: "JavaScript Fundamentals",
      triggerDate: "2024-06-15",
      executedAt: "2024-06-18 09:30",
      stats: { recipients: 67, emailsSent: 134, opened: 98, clicked: 45, converted: 8, revenue: 23960 },
      status: "completed",
    },
  ],
  3: [ // "Recover Abandoned Checkout"
    {
      id: "run_3_1",
      campaignId: 3,
      campaignName: "Recover Abandoned Checkout",
      triggerName: "Cart Abandoned - Advanced Python",
      triggerDate: "2024-06-24",
      executedAt: "2024-06-24 14:30",
      stats: { recipients: 23, emailsSent: 46, opened: 34, clicked: 18, converted: 5, revenue: 7475 },
      status: "completed",
    },
  ],
  5: [ // "Payment Failed Recovery"
    {
      id: "run_5_1",
      campaignId: 5,
      campaignName: "Payment Failed Recovery",
      triggerName: "Payment Failed - UPI Timeout",
      triggerDate: "2024-06-26",
      executedAt: "2024-06-26 11:15",
      stats: { recipients: 12, emailsSent: 24, opened: 19, clicked: 11, converted: 7, revenue: 10465 },
      status: "completed",
    },
    {
      id: "run_5_2",
      campaignId: 5,
      campaignName: "Payment Failed Recovery",
      triggerName: "Payment Failed - Card Declined",
      triggerDate: "2024-06-25",
      executedAt: "2024-06-25 16:45",
      stats: { recipients: 8, emailsSent: 16, opened: 13, clicked: 8, converted: 4, revenue: 5980 },
      status: "completed",
    },
  ],
};

// Mock leads data for each run
const mockRunLeads: Record<string, CampaignLead[]> = {
  "run_1_1": [
    { id: "l1", name: "Rahul Sharma", email: "rahul.s@email.com", phone: "+91 98765 43210", registeredAt: "2024-06-25 15:30", emailOpened: true, linkClicked: true, status: "converted" },
    { id: "l2", name: "Priya Patel", email: "priya.p@email.com", phone: "+91 98765 43211", registeredAt: "2024-06-25 16:00", emailOpened: true, linkClicked: true, status: "converted" },
    { id: "l3", name: "Amit Kumar", email: "amit.k@email.com", phone: "+91 98765 43212", registeredAt: "2024-06-25 16:15", emailOpened: true, linkClicked: false, status: "engaged" },
    { id: "l4", name: "Sneha Reddy", email: "sneha.r@email.com", phone: "+91 98765 43213", registeredAt: "2024-06-25 16:45", emailOpened: false, linkClicked: false, status: "pending" },
    { id: "l5", name: "Vikram Singh", email: "vikram.s@email.com", phone: "+91 98765 43214", registeredAt: "2024-06-25 17:00", emailOpened: true, linkClicked: true, status: "converted" },
  ],
  "run_2_1": [
    { id: "l6", name: "Anjali Verma", email: "anjali.v@email.com", phone: "+91 98765 43215", registeredAt: "2024-06-23 09:00", emailOpened: true, linkClicked: true, status: "converted" },
    { id: "l7", name: "Rohan Gupta", email: "rohan.g@email.com", phone: "+91 98765 43216", registeredAt: "2024-06-23 09:30", emailOpened: true, linkClicked: false, status: "engaged" },
    { id: "l8", name: "Kavya Iyer", email: "kavya.i@email.com", phone: "+91 98765 43217", registeredAt: "2024-06-23 10:00", emailOpened: false, linkClicked: false, status: "pending" },
  ],
};

// Mock converted users data for each run
const mockRunConversions: Record<string, ConvertedUser[]> = {
  "run_1_1": [
    { id: "c1", name: "Rahul Sharma", email: "rahul.s@email.com", phone: "+91 98765 43210", productBought: "Advanced Python Course", amountPaid: 1499, convertedAt: "2024-06-26 10:30", paymentMethod: "UPI" },
    { id: "c2", name: "Priya Patel", email: "priya.p@email.com", phone: "+91 98765 43211", productBought: "Advanced Python Course", amountPaid: 1499, convertedAt: "2024-06-26 14:20", paymentMethod: "Card" },
    { id: "c3", name: "Vikram Singh", email: "vikram.s@email.com", phone: "+91 98765 43214", productBought: "Advanced Python Course", amountPaid: 1499, convertedAt: "2024-06-27 09:15", paymentMethod: "UPI" },
  ],
  "run_2_1": [
    { id: "c4", name: "Anjali Verma", email: "anjali.v@email.com", phone: "+91 98765 43215", productBought: "Python Mastery Program", amountPaid: 2995, convertedAt: "2024-06-24 11:00", paymentMethod: "UPI" },
    { id: "c5", name: "Sanjay Mehta", email: "sanjay.m@email.com", phone: "+91 98765 43218", productBought: "Python Mastery Program", amountPaid: 2995, convertedAt: "2024-06-24 15:30", paymentMethod: "Card" },
  ],
};

const actionTypeConfig: Record<CampaignAction["type"], { icon: any; label: string; color: string; bgColor: string }> = {
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
interface CampaignPerformance {
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

const campaignData: CampaignPerformance[] = [
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
  parsedCampaign?: { name: string; trigger: string; actions: CampaignAction[]; description: string };
}

type ViewMode = "list" | "campaign-type" | "create-chat" | "builder" | "detail" | "runs" | "run-details";

// ─── Formatted Message Component ───
const FormattedMessage = ({ content }: { content: string }) => {
  // Parse markdown-like formatting
  const formatText = (text: string) => {
    const parts: React.ReactNode[] = [];
    const lines = text.split('\n');

    lines.forEach((line, lineIndex) => {
      let formattedLine: React.ReactNode[] = [];
      let currentText = line;
      let key = 0;

      // Handle bold **text**
      const boldRegex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          formattedLine.push(
            <span key={`text-${lineIndex}-${key++}`}>{line.slice(lastIndex, match.index)}</span>
          );
        }
        formattedLine.push(
          <strong key={`bold-${lineIndex}-${key++}`} className="font-semibold text-foreground">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        formattedLine.push(
          <span key={`text-${lineIndex}-${key++}`}>{line.slice(lastIndex)}</span>
        );
      }

      if (formattedLine.length === 0) {
        formattedLine.push(<span key={`empty-${lineIndex}`}>{line}</span>);
      }

      parts.push(
        <div key={`line-${lineIndex}`} className={lineIndex > 0 ? "mt-1.5" : ""}>
          {formattedLine}
        </div>
      );
    });

    return parts;
  };

  return <div className="leading-relaxed">{formatText(content)}</div>;
};

// ─── Main Component ───
const MarketingCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Builder state
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // Detail state
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

  // Runs view state
  const [runsCampaign, setRunsCampaign] = useState<Campaign | null>(null);
  const [selectedRun, setSelectedRun] = useState<CampaignRun | null>(null);

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

  const filtered = campaigns;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  // Initialize campaign when entering create-chat view
  useEffect(() => {
    if (viewMode === "create-chat" && !editingCampaign) {
      const initialCampaign: Campaign = {
        id: Date.now(),
        name: currentCampaignType ? campaignTypeConfig[currentCampaignType].label : "New Campaign",
        description: "",
        trigger: "Payment Captured",
        audienceType: undefined,
        targetProductId: "all",
        actions: currentCampaignType ? [...campaignTypeConfig[currentCampaignType].defaultActions] : [
          makeAction("email", "Send welcome email", { subject: "Welcome!", body: "Hi {{name}},\n\nThank you!" })
        ],
        enabled: true,
        isDefault: false,
        runs: 0,
      };
      setEditingCampaign(initialCampaign);
    }
  }, [viewMode, editingCampaign, currentCampaignType]);

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

  const parseCampaignFromMessage = (text: string): ChatMessage["parsedCampaign"] => {
    const lower = text.toLowerCase();
    if (lower.includes("webinar") && (lower.includes("follow") || lower.includes("recording") || lower.includes("after"))) {
      return {
        name: "Post-Webinar Nurture Sequence",
        trigger: "Webinar Ended",
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
      name: "Custom Campaign",
      trigger: "Manual Trigger",
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
      const lower = text.toLowerCase();

      // Handle campaign name updates
      if (lower.includes("name") && lower.includes("change")) {
        const nameMatch = text.match(/change.*name.*to\s+["']?([^"']+)["']?/i) || text.match(/name.*["']([^"']+)["']/i);
        if (nameMatch && editingCampaign) {
          const newName = nameMatch[1].trim();
          setEditingCampaign({ ...editingCampaign, name: newName });
          const response: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `✅ Updated campaign name to **"${newName}"**\n\nThe form has been updated. What else would you like to change?`,
            suggestions: ["Change description", "Update messages", "Looks good!"],
          };
          setChatMessages(prev => [...prev, response]);
          setIsAiTyping(false);
          return;
        }
      }

      // Handle description updates
      if (lower.includes("description") && (lower.includes("change") || lower.includes("update"))) {
        const descMatch = text.match(/description.*to\s+["']?([^"']+)["']?/i) || text.match(/description.*["']([^"']+)["']/i);
        if (descMatch && editingCampaign) {
          const newDesc = descMatch[1].trim();
          setEditingCampaign({ ...editingCampaign, description: newDesc });
          const response: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `✅ Updated campaign description!\n\nThe form has been updated. What else would you like to modify?`,
            suggestions: ["Update WhatsApp message", "Change trigger", "All set!"],
          };
          setChatMessages(prev => [...prev, response]);
          setIsAiTyping(false);
          return;
        }
      }

      // Handle message content updates
      if ((lower.includes("message") || lower.includes("whatsapp") || lower.includes("email") || lower.includes("sms")) &&
          (lower.includes("change") || lower.includes("update") || lower.includes("modify"))) {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `💬 **To update message content:**\n\n1. Click on any action in the campaign form on the right\n2. Edit the message directly in the text area\n3. You can also add emojis, variables like {{name}}, and offer codes\n\nTry clicking on one of the actions now!`,
          suggestions: ["How do I add variables?", "Show me offer codes", "I'm done editing"],
        };
        setChatMessages(prev => [...prev, response]);
        setIsAiTyping(false);
        return;
      }

      // Handle variable questions
      if (lower.includes("variable") || lower.includes("{{")) {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `📝 **Available Variables:**\n\n• {{name}} - Customer name\n• {{email}} - Customer email\n• {{phone}} - Phone number\n• {{product_name}} - Product being promoted\n• {{product_link}} - Link to product page\n• {{offer_code}} - Discount code\n• {{webinar_name}} - Webinar title\n• {{recording_link}} - Webinar recording\n\nJust type them in your messages and they'll be replaced automatically!`,
          suggestions: ["Got it!", "Show offer codes", "Continue editing"],
        };
        setChatMessages(prev => [...prev, response]);
        setIsAiTyping(false);
        return;
      }

      // Handle offer code questions
      if (lower.includes("offer") || lower.includes("discount") || lower.includes("code")) {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `🏷️ **How to add offer codes:**\n\n1. When editing an Email or WhatsApp action\n2. Scroll down to "Apply Offer Code"\n3. Select from your active offers\n4. Use {{offer_code}} in your message\n\nExample:\n"Get 25% off with code {{offer_code}}"`,
          suggestions: ["Thanks!", "Add more actions", "Finish campaign"],
        };
        setChatMessages(prev => [...prev, response]);
        setIsAiTyping(false);
        return;
      }

      // Default helpful response
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `💡 **I can help you with:**\n\n• Updating campaign name or description\n• Explaining variables and offer codes\n• Adding or modifying actions\n• Answering questions about the campaign\n\n**To edit messages:** Click on any action in the form →\n\nWhat would you like help with?`,
        suggestions: ["Add another WhatsApp", "Explain variables", "I'm ready to save"],
      };

      setChatMessages(prev => [...prev, response]);
      setIsAiTyping(false);
    }, 800);
  };

  const saveCampaign = () => {
    if (!editingCampaign) return;
    const existing = campaigns.find(w => w.id === editingCampaign.id);
    if (existing) {
      setCampaigns(prev => prev.map(w => w.id === editingCampaign.id ? editingCampaign : w));
      toast.success("Campaign updated successfully!");
    } else {
      setCampaigns(prev => [...prev, editingCampaign]);
      toast.success("Campaign activated! Your automated marketing is now live 🚀");
    }
    setEditingCampaign(null);
    setEditingActionId(null);
    setViewMode("list");
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(prev => prev.filter(w => w.id !== id));
    toast.success("Campaign deleted");
    if (detailCampaign?.id === id) setViewMode("list");
  };

  const toggleCampaign = (id: number) => {
    setCampaigns(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const openEdit = (wf: Campaign) => {
    setEditingCampaign({ ...wf, actions: wf.actions.map(a => ({ ...a })) });
    setEditingActionId(null);
    setViewMode("builder");
  };

  const openDetail = (wf: Campaign) => {
    setDetailCampaign(wf);
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
            <Button className="gap-2" onClick={() => startCreate()}>
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </div>

          <Tabs defaultValue="campaigns" className="space-y-5">
            <TabsList>
              <TabsTrigger value="campaigns" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Campaigns</TabsTrigger>
              <TabsTrigger value="performance" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Campaign Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-5">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { icon: Zap, label: "Active Campaigns", value: campaigns.filter(w => w.enabled).length },
                  { icon: Users, label: "Total Triggers", value: campaigns.reduce((s, w) => s + w.runs, 0).toLocaleString() },
                  { icon: Mail, label: "Messages Sent", value: (campaigns.reduce((s, w) => s + w.runs, 0) * 2.3).toFixed(0) },
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
                        {w.isDefault && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Sample</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{w.description}</p>
                      {w.audienceType && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-foreground">
                            {w.audienceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {w.targetProductId && w.targetProductId !== "all" && (
                              <span className="text-muted-foreground"> • Specific product</span>
                            )}
                            {w.targetProductId === "all" && (
                              <span className="text-muted-foreground"> • All products</span>
                            )}
                          </span>
                        </div>
                      )}
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
                      <Switch checked={w.enabled} onCheckedChange={() => toggleCampaign(w.id)} />
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
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteCampaign(w.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No campaigns created yet. <button onClick={() => startCreate()} className="text-primary hover:underline">Create one</button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-5">
              {/* Campaign Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Total Leads", value: totalLeads.toLocaleString(), sub: "across all campaigns" },
                  { icon: UserPlus, label: "Paid Customers", value: totalPaid.toLocaleString(), sub: `${avgConversion}% conversion` },
                  { icon: IndianRupee, label: "Revenue Generated", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, sub: "from campaigns" },
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

  // ─── CREATE CHAT VIEW (Split: AI Assistant + Campaign Form) ───
  if (viewMode === "create-chat") {
    // Wait for editingCampaign to be initialized by useEffect
    if (!editingCampaign) {
      return <div className="h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
    }

    const wf = editingCampaign;
    const selectedAction = editingActionId ? wf.actions.find(a => a.id === editingActionId) : null;

    const updateAction = (actionId: string, updates: Partial<CampaignAction>) => {
      setEditingCampaign({
        ...wf,
        actions: wf.actions.map(a => a.id === actionId ? { ...a, ...updates } : a),
      });
    };

    const updateActionConfig = (actionId: string, key: string, value: string) => {
      setEditingCampaign({
        ...wf,
        actions: wf.actions.map(a => a.id === actionId ? { ...a, config: { ...a.config, [key]: value } } : a),
      });
    };

    const removeAction = (actionId: string) => {
      setEditingCampaign({ ...wf, actions: wf.actions.filter(a => a.id !== actionId) });
      if (editingActionId === actionId) setEditingActionId(null);
    };

    const addAction = (type: CampaignAction["type"]) => {
      const newAction = makeAction(type, `New ${actionTypeConfig[type].label} action`);
      setEditingCampaign({ ...wf, actions: [...wf.actions, newAction] });
      setEditingActionId(newAction.id);
    };

    return (
        <div className="h-screen flex flex-col bg-white p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Create Campaign</span>
              </div>
            </div>
            <Button size="sm" onClick={saveCampaign} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Create & Activate
            </Button>
          </div>

          {/* Split View: AI Assistant (Left) + Campaign Form (Right) */}
          <div className="flex-1 flex gap-4 overflow-hidden mt-4">
            {/* LEFT: AI Assistant */}
            <div className="w-80 flex flex-col border-r border-border pr-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Assistant</p>
                  <p className="text-[10px] text-muted-foreground">Ask me anything</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {chatMessages.length === 0 && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-4 space-y-3">
                    <p className="font-medium flex items-center gap-2">
                      <span className="text-base">👋</span>
                      <span>Hi! I can help you:</span>
                    </p>
                    <ul className="space-y-2 ml-1">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Write compelling email subject lines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Suggest campaign ideas & strategies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Explain triggers, timing & best practices</span>
                      </li>
                    </ul>
                    <p className="text-[10px] opacity-70 mt-2">Just type your question below</p>
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "text-xs px-4 py-2.5 rounded-xl max-w-[85%] shadow-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-white border border-border/50 text-foreground"
                    )}>
                      <FormattedMessage content={msg.content} />
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/30">
                          {msg.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(sug)}
                              className="text-[10px] px-2 py-1 rounded-md bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary animate-pulse" />
                    </div>
                    <div className="bg-white border border-border/50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Thinking</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="relative">
                <Input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage(chatInput)}
                  placeholder={isAiTyping ? "AI is thinking..." : "Ask me anything..."}
                  className="text-xs h-10 pr-10 bg-muted/30 border-border/50 focus-visible:ring-primary/20 placeholder:text-muted-foreground/50"
                  disabled={isAiTyping}
                />
                <Button
                  size="sm"
                  onClick={() => handleSendMessage(chatInput)}
                  disabled={!chatInput.trim() || isAiTyping}
                  className="absolute right-1 top-1 h-8 w-8 p-0 rounded-lg"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* RIGHT: Campaign Creation Form */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 max-w-3xl">
                {/* Campaign Name & Type */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Campaign Name *</Label>
                    <Input
                      value={wf.name}
                      onChange={e => setEditingCampaign({ ...wf, name: e.target.value })}
                      placeholder="e.g., Post-Webinar Nurture Sequence"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Campaign Type</Label>
                    <Select
                      value={currentCampaignType || "generic"}
                      onValueChange={(val) => {
                        setCurrentCampaignType(val as CampaignType);
                        const config = campaignTypeConfig[val as CampaignType];
                        setEditingCampaign({ ...wf, name: config.label });
                      }}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(campaignTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentCampaignType && campaignTypeConfig[currentCampaignType].description}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      value={wf.description}
                      onChange={e => setEditingCampaign({ ...wf, description: e.target.value })}
                      placeholder="Describe what this campaign does..."
                      rows={2}
                      className="mt-1.5 text-sm"
                    />
                  </div>
                </div>

                {/* Who to Target */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Who to Target *</Label>
                    <Select
                      value={wf.audienceType || ""}
                      onValueChange={v => setEditingCampaign({ ...wf, audienceType: v })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select audience type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webinar_attendees">Webinar Attendees</SelectItem>
                        <SelectItem value="webinar_registrants">Webinar Registrants (All)</SelectItem>
                        <SelectItem value="free_webinar_guests">Free Webinar Guests</SelectItem>
                        <SelectItem value="course_students">Course Students</SelectItem>
                        <SelectItem value="paid_customers">Paid Customers</SelectItem>
                        <SelectItem value="cart_abandoners">Cart Abandoners</SelectItem>
                        <SelectItem value="payment_failed">Payment Failed Users</SelectItem>
                        <SelectItem value="all_customers">All Customers</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Which audience segment should receive this campaign?
                    </p>
                  </div>

                  {wf.audienceType && (wf.audienceType.includes("webinar") || wf.audienceType.includes("course")) && (
                    <div>
                      <Label className="text-sm font-medium">Select Product</Label>
                      <Select
                        value={wf.targetProductId || "all"}
                        onValueChange={v => setEditingCampaign({ ...wf, targetProductId: v })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Zap className="h-3.5 w-3.5" />
                              All {wf.audienceType.includes("webinar") ? "Webinars" : "Courses"}
                            </div>
                          </SelectItem>
                          <div className="h-px bg-border my-1" />
                          {getAvailableProducts()
                            .filter(p =>
                              wf.audienceType?.includes("webinar") ? p.type === "webinar" :
                              wf.audienceType?.includes("course") ? p.type === "course" :
                              true
                            )
                            .map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-3.5 w-3.5" />
                                  {product.name}
                                </div>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Target specific {wf.audienceType.includes("webinar") ? "webinar" : "course"} or send to all
                      </p>
                    </div>
                  )}
                </div>

                {/* Trigger Event */}
                <div>
                  <Label className="text-sm font-medium">Trigger Event *</Label>
                  <Select value={wf.trigger} onValueChange={v => setEditingCampaign({ ...wf, trigger: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    When should this campaign start?
                  </p>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Campaign Actions</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" /> Add Action
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(Object.keys(actionTypeConfig) as CampaignAction["type"][]).map(type => {
                          const cfg = actionTypeConfig[type];
                          return (
                            <DropdownMenuItem key={type} onClick={() => addAction(type)} className="gap-2">
                              <cfg.icon className="h-4 w-4" />
                              {cfg.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Action List */}
                  <div className="space-y-3">
                    {wf.actions.map((action, idx) => {
                      const cfg = actionTypeConfig[action.type];
                      const Icon = cfg.icon;
                      const isSelected = editingActionId === action.id;

                      return (
                        <div key={action.id} className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all",
                          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )} onClick={() => setEditingActionId(action.id)}>
                          <div className="flex items-start gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bgColor)}>
                              <Icon className={cn("h-4 w-4", cfg.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium">{cfg.label}</p>
                                <div className="flex items-center gap-1">
                                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAction(action.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{action.label}</p>

                              {/* Expanded Config */}
                              {isSelected && (
                                <div className="mt-3 pt-3 border-t space-y-3">
                                  <div>
                                    <Label className="text-xs">Action Label</Label>
                                    <Input
                                      value={action.label}
                                      onChange={e => updateAction(action.id, { label: e.target.value })}
                                      className="mt-1 text-xs"
                                    />
                                  </div>

                                  {/* Email Config */}
                                  {action.type === "email" && (
                                    <>
                                      <div>
                                        <Label className="text-xs">Subject</Label>
                                        <Input
                                          value={action.config.subject || ""}
                                          onChange={e => updateActionConfig(action.id, "subject", e.target.value)}
                                          placeholder="e.g., Welcome to {{course_name}}"
                                          className="mt-1 text-xs"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Body</Label>
                                        <Textarea
                                          value={action.config.body || ""}
                                          onChange={e => updateActionConfig(action.id, "body", e.target.value)}
                                          placeholder="Email content..."
                                          rows={5}
                                          className="mt-1 text-xs font-mono"
                                        />
                                      </div>

                                      {/* Product Reference */}
                                      <div>
                                        <Label className="text-xs">Product Reference</Label>
                                        <Select
                                          value={action.config.product_id || ""}
                                          onValueChange={(val) => updateActionConfig(action.id, "product_id", val)}
                                        >
                                          <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select product" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {getAvailableProducts().map(product => (
                                              <SelectItem key={product.id} value={product.id}>
                                                {product.name} ({product.type})
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Offer Code */}
                                      <div>
                                        <Label className="text-xs">Offer Code</Label>
                                        <Select
                                          value={action.config.offer_code || ""}
                                          onValueChange={(val) => updateActionConfig(action.id, "offer_code", val)}
                                        >
                                          <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select offer" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {getActiveOffers().map(offer => (
                                              <SelectItem key={offer.code} value={offer.code}>
                                                {offer.code} - {offer.discount}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </>
                                  )}

                                  {/* Wait Config */}
                                  {action.type === "wait" && (
                                    <div>
                                      <Label className="text-xs">Wait Duration</Label>
                                      <Input
                                        value={action.config.duration || ""}
                                        onChange={e => updateActionConfig(action.id, "duration", e.target.value)}
                                        placeholder="e.g., 2 days, 4 hours"
                                        className="mt-1 text-xs"
                                      />
                                    </div>
                                  )}

                                  {/* SMS/WhatsApp Config */}
                                  {(action.type === "sms" || action.type === "whatsapp") && (
                                    <div>
                                      <Label className="text-xs">Message</Label>
                                      <Textarea
                                        value={action.config.message || ""}
                                        onChange={e => updateActionConfig(action.id, "message", e.target.value)}
                                        placeholder="Message content..."
                                        rows={3}
                                        className="mt-1 text-xs"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  // ─── VISUAL BUILDER VIEW ───
  if (viewMode === "builder" && editingCampaign) {
    const wf = editingCampaign;
    const selectedAction = editingActionId ? wf.actions.find(a => a.id === editingActionId) : null;

    const updateAction = (actionId: string, updates: Partial<CampaignAction>) => {
      setEditingCampaign({
        ...wf,
        actions: wf.actions.map(a => a.id === actionId ? { ...a, ...updates } : a),
      });
    };

    const updateActionConfig = (actionId: string, key: string, value: string) => {
      setEditingCampaign({
        ...wf,
        actions: wf.actions.map(a => a.id === actionId ? { ...a, config: { ...a.config, [key]: value } } : a),
      });
    };

    const removeAction = (actionId: string) => {
      setEditingCampaign({ ...wf, actions: wf.actions.filter(a => a.id !== actionId) });
      if (editingActionId === actionId) setEditingActionId(null);
    };

    const addAction = (type: CampaignAction["type"]) => {
      const newAction = makeAction(type, `New ${actionTypeConfig[type].label} action`);
      setEditingCampaign({ ...wf, actions: [...wf.actions, newAction] });
      setEditingActionId(newAction.id);
    };

    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col bg-white rounded-lg border border-border p-6 -m-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setViewMode("list"); setEditingCampaign(null); }} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm font-semibold text-foreground">{wf.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setViewMode("list"); setEditingCampaign(null); }}>Cancel</Button>
              <Button size="sm" onClick={saveCampaign} className="gap-1.5">
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

              {/* Campaign name & trigger */}
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Campaign Name</Label>
                  <Input
                    value={wf.name}
                    onChange={e => setEditingCampaign({ ...wf, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Trigger</Label>
                  <Select value={wf.trigger} onValueChange={v => setEditingCampaign({ ...wf, trigger: v })}>
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
                    {(Object.keys(actionTypeConfig) as CampaignAction["type"][]).map(type => {
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
  if (viewMode === "detail" && detailCampaign) {
    const wf = detailCampaign;
    return (
      <DashboardLayout>
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold text-foreground">{wf.name}</h1>
            {wf.isDefault && <Badge variant="secondary" className="text-[10px]">Sample</Badge>}
            <div className="ml-auto flex items-center gap-2">
              <Switch checked={wf.enabled} onCheckedChange={() => { toggleCampaign(wf.id); setDetailCampaign({ ...wf, enabled: !wf.enabled }); }} />
              <span className="text-xs text-muted-foreground">{wf.enabled ? "Active" : "Paused"}</span>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(wf)}>
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => { deleteCampaign(wf.id); setViewMode("list"); }}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{wf.description}</p>

          {wf.audienceType && (
            <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-4 py-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">Target Audience</p>
                <p className="text-sm font-semibold text-foreground">
                  {wf.audienceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {wf.targetProductId === "all" && <span className="text-muted-foreground font-normal"> • All products</span>}
                  {wf.targetProductId && wf.targetProductId !== "all" && <span className="text-muted-foreground font-normal"> • Specific product</span>}
                </p>
              </div>
            </div>
          )}

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

          {/* View Runs CTA */}
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">View Campaign Performance</p>
                <p className="text-xs text-muted-foreground">See individual run details and metrics</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setRunsCampaign(wf);
                setViewMode("runs");
              }}
              className="gap-1.5"
            >
              <Eye className="h-4 w-4" /> View All Runs
            </Button>
          </div>

          {/* Visual flow (read-only) */}
          <div className="blade-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Campaign Flow</h3>
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

  // ─── CAMPAIGN RUNS VIEW ───
  if (viewMode === "runs" && runsCampaign) {
    const campaignRuns = mockCampaignRuns[runsCampaign.id] || [];

    return (
      <DashboardLayout>
        <div className="animate-fade-in space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setViewMode("detail"); setDetailCampaign(runsCampaign); }} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Campaign
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">{runsCampaign.name}</h1>
              <p className="text-xs text-muted-foreground">Campaign Performance - Individual Runs</p>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Total Runs",
                value: campaignRuns.length.toLocaleString(),
                icon: Zap,
              },
              {
                label: "Total Recipients",
                value: campaignRuns.reduce((sum, r) => sum + r.stats.recipients, 0).toLocaleString(),
                icon: Users,
              },
              {
                label: "Total Conversions",
                value: campaignRuns.reduce((sum, r) => sum + r.stats.converted, 0).toLocaleString(),
                icon: TrendingUp,
              },
              {
                label: "Total Revenue",
                value: `₹${(campaignRuns.reduce((sum, r) => sum + r.stats.revenue, 0) / 1000).toFixed(1)}K`,
                icon: IndianRupee,
              },
            ].map(s => (
              <div key={s.label} className="blade-stat flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold text-foreground">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Campaign Runs Table */}
          <div className="blade-card">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Individual Campaign Runs</h3>
              <p className="text-xs text-muted-foreground mt-1">Detailed performance for each campaign execution</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trigger Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Emails Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                    <TableHead>Converted</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        No runs found for this campaign yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaignRuns.map((run) => {
                      const openRate = run.stats.emailsSent > 0 ? ((run.stats.opened / run.stats.emailsSent) * 100).toFixed(1) : "0";
                      const clickRate = run.stats.opened > 0 ? ((run.stats.clicked / run.stats.opened) * 100).toFixed(1) : "0";
                      const conversionRate = run.stats.recipients > 0 ? ((run.stats.converted / run.stats.recipients) * 100).toFixed(1) : "0";

                      return (
                        <TableRow key={run.id} className="cursor-pointer hover:bg-secondary/50">
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{run.triggerName}</p>
                              <p className="text-xs text-muted-foreground">{run.triggerDate}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{run.executedAt}</TableCell>
                          <TableCell className="text-sm font-medium">{run.stats.recipients}</TableCell>
                          <TableCell className="text-sm">{run.stats.emailsSent}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{run.stats.opened}</p>
                              <p className="text-xs text-muted-foreground">{openRate}%</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{run.stats.clicked}</p>
                              <p className="text-xs text-muted-foreground">{clickRate}%</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-green-600">{run.stats.converted}</p>
                              <p className="text-xs text-muted-foreground">{conversionRate}%</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-semibold">₹{(run.stats.revenue / 1000).toFixed(1)}K</TableCell>
                          <TableCell>
                            <Badge variant={run.status === "completed" ? "default" : run.status === "in_progress" ? "secondary" : "destructive"}>
                              {run.status === "completed" ? "Completed" : run.status === "in_progress" ? "In Progress" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRun(run);
                                setViewMode("run-details");
                              }}
                            >
                              <Settings className="h-3.5 w-3.5" /> Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Performance Insights (if we have runs) */}
          {campaignRuns.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="blade-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Best Performing Run</h3>
                {(() => {
                  const bestRun = campaignRuns.reduce((best, run) =>
                    run.stats.revenue > best.stats.revenue ? run : best
                  , campaignRuns[0]);

                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Trigger Event</p>
                        <p className="text-sm font-medium text-foreground">{bestRun.triggerName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="text-lg font-semibold text-green-600">{bestRun.stats.converted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg font-semibold text-primary">₹{(bestRun.stats.revenue / 1000).toFixed(1)}K</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="blade-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Average Performance</h3>
                {(() => {
                  const avgRecipients = (campaignRuns.reduce((sum, r) => sum + r.stats.recipients, 0) / campaignRuns.length).toFixed(0);
                  const avgConverted = (campaignRuns.reduce((sum, r) => sum + r.stats.converted, 0) / campaignRuns.length).toFixed(0);
                  const avgRevenue = (campaignRuns.reduce((sum, r) => sum + r.stats.revenue, 0) / campaignRuns.length / 1000).toFixed(1);
                  const totalOpened = campaignRuns.reduce((sum, r) => sum + r.stats.opened, 0);
                  const totalEmailsSent = campaignRuns.reduce((sum, r) => sum + r.stats.emailsSent, 0);
                  const avgOpenRate = totalEmailsSent > 0 ? ((totalOpened / totalEmailsSent) * 100).toFixed(1) : "0";

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Recipients</p>
                          <p className="text-lg font-semibold text-foreground">{avgRecipients}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Open Rate</p>
                          <p className="text-lg font-semibold text-foreground">{avgOpenRate}%</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Conversions</p>
                          <p className="text-lg font-semibold text-green-600">{avgConverted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Revenue</p>
                          <p className="text-lg font-semibold text-primary">₹{avgRevenue}K</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ─── RUN DETAILS VIEW (Leads & Converted Users) ───
  if (viewMode === "run-details" && selectedRun) {
    const leads = mockRunLeads[selectedRun.id] || [];
    const conversions = mockRunConversions[selectedRun.id] || [];

    return (
      <DashboardLayout>
        <div className="animate-fade-in space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("runs")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Runs
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">{selectedRun.triggerName}</h1>
              <p className="text-xs text-muted-foreground">{selectedRun.campaignName} • {selectedRun.triggerDate}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Leads", value: leads.length, icon: Users },
              { label: "Converted", value: conversions.length, icon: TrendingUp },
              { label: "Conversion Rate", value: `${leads.length > 0 ? ((conversions.length / leads.length) * 100).toFixed(1) : 0}%`, icon: BarChart3 },
              { label: "Total Revenue", value: `₹${(conversions.reduce((sum, c) => sum + c.amountPaid, 0) / 1000).toFixed(1)}K`, icon: IndianRupee },
            ].map(s => (
              <div key={s.label} className="blade-stat flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold text-foreground">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs for Leads vs Converted */}
          <Tabs defaultValue="leads" className="space-y-4">
            <TabsList>
              <TabsTrigger value="leads" className="gap-1.5">
                <Users className="h-3.5 w-3.5" /> Leads ({leads.length})
              </TabsTrigger>
              <TabsTrigger value="converted" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Converted Users ({conversions.length})
              </TabsTrigger>
            </TabsList>

            {/* Leads Tab */}
            <TabsContent value="leads">
              <div className="blade-card">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">All Leads</h3>
                  <p className="text-xs text-muted-foreground mt-1">People who received this campaign</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Registered At</TableHead>
                        <TableHead>Email Opened</TableHead>
                        <TableHead>Link Clicked</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                            No leads data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lead.phone}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lead.registeredAt}</TableCell>
                            <TableCell>
                              {lead.emailOpened ? (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Opened
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <X className="h-3 w-3" /> Not Opened
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {lead.linkClicked ? (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Clicked
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <X className="h-3 w-3" /> Not Clicked
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  lead.status === "converted" ? "default" :
                                  lead.status === "engaged" ? "secondary" :
                                  "outline"
                                }
                              >
                                {lead.status === "converted" ? "Converted" : lead.status === "engaged" ? "Engaged" : "Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Converted Users Tab */}
            <TabsContent value="converted">
              <div className="blade-card">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Converted Users</h3>
                  <p className="text-xs text-muted-foreground mt-1">Users who completed a purchase</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Product Bought</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Converted At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                            No conversions yet for this campaign run
                          </TableCell>
                        </TableRow>
                      ) : (
                        conversions.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.phone}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{user.productBought}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-semibold text-green-600">₹{user.amountPaid.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.paymentMethod}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.convertedAt}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary Stats for Converted Users */}
              {conversions.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="blade-stat">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-semibold text-primary">
                      ₹{conversions.reduce((sum, c) => sum + c.amountPaid, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="blade-stat">
                    <p className="text-sm text-muted-foreground">Average Order Value</p>
                    <p className="text-2xl font-semibold text-foreground">
                      ₹{(conversions.reduce((sum, c) => sum + c.amountPaid, 0) / conversions.length).toLocaleString()}
                    </p>
                  </div>
                  <div className="blade-stat">
                    <p className="text-sm text-muted-foreground">UPI vs Card</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {conversions.filter(c => c.paymentMethod === "UPI").length} / {conversions.filter(c => c.paymentMethod === "Card").length}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  return null;
};

export default MarketingCampaigns;
