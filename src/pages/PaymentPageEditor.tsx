import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Eye, Settings,
  X, Copy, ExternalLink, Plus,
  Trash2, GripVertical, ChevronDown,
  Save, Loader2, CheckCircle2,
  Receipt, Image as ImageIcon, MoreVertical, Package, DollarSign,
  AlignLeft, Hash, Mail, Phone, Type, Link, CalendarDays, List,
  Share2, Sparkles, Shield, Star, Check, CreditCard, Settings2,
  BarChart2, User, HelpCircle, Play, LayoutGrid, MousePointer, Pencil,
  Calendar, Tag, MapPin, Clock, Users, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputFieldType =
  | "text" | "alpha" | "alphanum" | "number" | "email" | "phone"
  | "url" | "textarea" | "pan" | "pincode" | "dropdown" | "date";

type AmountFieldType = "amount-fixed" | "amount-custom" | "amount-item";

interface BaseField {
  id: string;
  label: string;
  required: boolean;
  placeholder: string;
}

interface InputField extends BaseField {
  fieldKind: "input";
  type: InputFieldType;
  options?: string[];
}

interface AmountField extends BaseField {
  fieldKind: "amount";
  type: AmountFieldType;
  amount: number;
  description?: string;
  image?: string;
  optional?: boolean;
  showDescription?: boolean;
  minQty?: number;
  maxQty?: number;
}

type FormField = InputField | AmountField;

type SectionType =
  | "hero" | "description" | "highlights" | "instructor" | "schedule"
  | "testimonials" | "event" | "gallery" | "faq" | "social_proof"
  | "pricing" | "richtext" | "video" | "image" | "cta"
  | "stats" | "about"; // legacy aliases

interface ContentSection {
  id: string;
  type: SectionType;
  visible: boolean;
  data: Record<string, any>;
}

interface PageData {
  merchantName: string;
  logoInitial: string;
  logoUrl?: string;
  brandColor: string;
  primaryColor: string;
  secondaryColor: string;
  category: "education" | "services" | "ecommerce" | "events";
  buttonText: string;
  successMessage: string;
  redirectUrl: string;
  sendReceipt: boolean;
  gstEnabled: boolean;
  sections: ContentSection[];
  formFields: FormField[];
  status: "draft" | "published";
  slug: string;
  pageUrl: string;
  supportEmail: string;
  supportPhone: string;
  termsText: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultFormFields: FormField[] = [
  {
    id: "f_amt",
    fieldKind: "amount",
    type: "amount-fixed",
    label: "Amount",
    required: true,
    placeholder: "",
    amount: 2999,
    showDescription: false,
  },
  {
    id: "f_email",
    fieldKind: "input",
    type: "email",
    label: "Email",
    required: true,
    placeholder: "Enter your email",
  },
  {
    id: "f_phone",
    fieldKind: "input",
    type: "phone",
    label: "Phone",
    required: false,
    placeholder: "Enter your phone number",
  },
];

const defaultSections: ContentSection[] = [
  {
    id: "s_hero",
    type: "hero",
    visible: true,
    data: {
      title: "Full-Stack Development Bootcamp",
      tagline: "From beginner to job-ready in 12 weeks",
      description: "A comprehensive bootcamp designed for aspiring developers. Learn React, Node.js, databases, and deployment from industry veterans.",
    },
  },
  {
    id: "s_stats",
    type: "social_proof",
    visible: true,
    data: {
      items: [
        { value: "1,200+", label: "Students enrolled" },
        { value: "4.9★", label: "Average rating" },
        { value: "12 wks", label: "Duration" },
        { value: "94%", label: "Placement rate" },
      ],
    },
  },
  {
    id: "s_highlights",
    type: "highlights",
    visible: true,
    data: {
      title: "What's included",
      items: [
        "Lifetime access to all course materials",
        "Certificate on completion",
        "1:1 mentorship sessions",
        "Community access & peer learning",
        "Hands-on projects & portfolio",
        "Job placement support",
      ],
    },
  },
  {
    id: "s_instructor",
    type: "instructor",
    visible: true,
    data: {
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      name: "Rahul Sharma",
      role: "Lead Instructor",
      credentials: "12 yrs at Flipkart & Razorpay",
      bio: "Senior engineer with 12 years of experience. Has trained 3,000+ developers across India.",
    },
  },
  {
    id: "s_testimonials",
    type: "testimonials",
    visible: true,
    data: {
      items: [
        { name: "Priya S.", rating: 5, text: "This bootcamp completely changed my career. Got a job within 3 weeks of completing it!" },
        { name: "Arjun M.", rating: 5, text: "Best investment I've made. The mentorship and community are incredible." },
        { name: "Neha K.", rating: 5, text: "Very structured curriculum. The hands-on projects made all the difference." },
        { name: "Vikram P.", rating: 4, text: "Excellent content and instructor support. Highly recommended." },
      ],
    },
  },
  {
    id: "s_faq",
    type: "faq",
    visible: false,
    data: {
      items: [
        { q: "Do I need prior experience?", a: "No prior experience needed. We start from the very basics." },
        { q: "Can I get a refund?", a: "Full refund within 7 days of joining. No questions asked." },
        { q: "Is the certificate recognized?", a: "Yes, our certificate is recognized by 200+ partner companies." },
      ],
    },
  },
];

const SECTION_META: Record<SectionType, { label: string }> = {
  hero:         { label: "Hero / Title" },
  description:  { label: "About / Description" },
  highlights:   { label: "Features / Includes" },
  instructor:   { label: "Instructor / Seller" },
  schedule:     { label: "Schedule / Curriculum" },
  testimonials: { label: "Testimonials" },
  event:        { label: "Event Details" },
  gallery:      { label: "Gallery / Media" },
  faq:          { label: "FAQs" },
  social_proof: { label: "Social Proof Bar" },
  pricing:      { label: "Pricing Breakdown" },
  richtext:     { label: "Text Block" },
  video:        { label: "Video" },
  image:        { label: "Image" },
  cta:          { label: "CTA Button" },
  stats:        { label: "Stats Bar" },
  about:        { label: "Instructor / About" },
};

const WIDGET_CATALOG: { type: SectionType; label: string; desc: string; icon: React.ElementType; preview: string }[] = [
  { type: "description",  label: "About / Description",  desc: "2-4 sentences about the offering",      icon: AlignLeft,    preview: "Learn the skills that top companies need..." },
  { type: "highlights",   label: "Features / Includes",  desc: "Icon + text bullet list",               icon: CheckCircle2, preview: "✓ Lifetime access  ✓ Certificate  ✓ Mentorship" },
  { type: "instructor",   label: "Instructor / Seller",  desc: "Bio card with photo and credentials",   icon: User,         preview: "Rahul Sharma — Lead Instructor, 12 yrs exp" },
  { type: "testimonials", label: "Testimonials",          desc: "Quotes + attribution cards",            icon: Star,         preview: "⭐⭐⭐⭐⭐ \"This changed my career!\" — Priya" },
  { type: "social_proof", label: "Social Proof Bar",      desc: "Student count, ratings, trust badges",  icon: BarChart2,    preview: "1,200+ Students • 4.9★ • 94% Placement" },
  { type: "schedule",     label: "Schedule / Curriculum", desc: "Session list, modules or agenda",       icon: Calendar,     preview: "Week 1: Foundations  Week 2: Core Concepts…" },
  { type: "pricing",      label: "Pricing Breakdown",     desc: "What's included vs not",                icon: Tag,          preview: "✓ Live sessions  ✓ Recording  ✗ 1:1 coaching" },
  { type: "faq",          label: "FAQ",                   desc: "Collapsible Q&A pairs",                 icon: HelpCircle,   preview: "Q: Do I need prior experience? A: No..." },
  { type: "richtext",     label: "Text Block",            desc: "Free-form heading + body text",         icon: Type,         preview: "Heading\nYour text content here…" },
  { type: "event",        label: "Event Details",         desc: "Date, time, venue, capacity",           icon: CalendarDays, preview: "📅 15 Jun 2025  🕒 10am–1pm  📍 Zoom" },
  { type: "video",        label: "Video",                 desc: "Embed YouTube or Vimeo URL",            icon: Play,         preview: "▶ Embedded video player" },
  { type: "image",        label: "Image",                 desc: "Single image with caption",             icon: ImageIcon,    preview: "📷 Full-width image block" },
  { type: "gallery",      label: "Gallery / Media",       desc: "Grid of images",                       icon: LayoutGrid,   preview: "🖼 🖼 🖼 Three-column image grid" },
  { type: "cta",          label: "CTA Button",            desc: "Standalone call-to-action button",      icon: MousePointer, preview: "[ Get Started Today → ]" },
];

const createDefaultSection = (type: SectionType): ContentSection => {
  const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const dataMap: Record<string, any> = {
    description:  { body: "A comprehensive program designed for aspiring professionals. Learn from industry experts and build real-world skills." },
    highlights:   { title: "What's included", items: ["Lifetime access to all materials", "Certificate on completion", "Community access", "Hands-on projects"] },
    instructor:   { image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", name: "Rahul Sharma", role: "Lead Instructor", credentials: "12 yrs at Flipkart & Razorpay", bio: "Has trained 3,000+ developers across India." },
    schedule:     { title: "Curriculum", items: [{ label: "Week 1: Foundations", detail: "5 sessions · 6 hrs" }, { label: "Week 2: Core Concepts", detail: "8 sessions · 10 hrs" }, { label: "Week 3: Projects", detail: "6 sessions · 8 hrs" }, { label: "Week 4: Certification", detail: "4 sessions · 4 hrs" }] },
    testimonials: { items: [{ name: "Priya S.", rating: 5, text: "This completely changed my career. Got a job within 3 weeks of completing!" }, { name: "Arjun M.", rating: 5, text: "Best investment I've made. The mentorship is incredible." }] },
    event:        { date: "15 Jun 2025", time: "10:00 AM – 1:00 PM IST", venue: "Online (Zoom)", capacity: "50 seats", registrationDeadline: "" },
    gallery:      { title: "Gallery", images: [] },
    faq:          { items: [{ q: "Do I need prior experience?", a: "No prior experience needed. We start from the very basics." }, { q: "Can I get a refund?", a: "Full refund within 7 days of joining." }] },
    social_proof: { items: [{ value: "500+", label: "Happy customers" }, { value: "4.8★", label: "Average rating" }, { value: "2 yrs", label: "In business" }] },
    pricing:      { title: "What's included", included: ["Live sessions", "Recording access", "Certificate"], notIncluded: ["1:1 coaching"] },
    richtext:     { heading: "About this offering", body: "Add your content here…" },
    video:        { url: "", title: "Watch this video" },
    image:        { url: "", caption: "" },
    cta:          { text: "Get started today", url: "", style: "primary" },
  };
  return { id, type, visible: true, data: dataMap[type] ?? {} };
};

const INPUT_TYPES: { type: InputFieldType; label: string; icon: React.ElementType }[] = [
  { type: "text",      label: "Single Line Text",  icon: Type },
  { type: "alpha",     label: "Alphabets",          icon: Type },
  { type: "alphanum",  label: "Alphanumeric",        icon: Hash },
  { type: "number",    label: "Number",              icon: Hash },
  { type: "email",     label: "Email",               icon: Mail },
  { type: "phone",     label: "Phone No.",           icon: Phone },
  { type: "url",       label: "Link / URL",          icon: Link },
  { type: "textarea",  label: "Large Textarea",      icon: AlignLeft },
  { type: "pan",       label: "PAN Number",          icon: Hash },
  { type: "pincode",   label: "Pincode",             icon: Hash },
  { type: "dropdown",  label: "Dropdown",            icon: List },
  { type: "date",      label: "Date Picker",         icon: CalendarDays },
];

const AMOUNT_TYPES: { type: AmountFieldType; label: string; desc: string }[] = [
  { type: "amount-fixed",  label: "Fixed Amount",            desc: "Set a fixed price" },
  { type: "amount-custom", label: "Customer Decides Amount", desc: "Customer enters amount" },
  { type: "amount-item",   label: "Item with Quantity",      desc: "Product with qty selector" },
];

const categoryLabel = (cat: PageData["category"]) =>
  ({ education: "Online Course", services: "Professional Service", ecommerce: "Product", events: "Event" }[cat] ?? "Payment");

// ─── Template configs ─────────────────────────────────────────────────────────

const COMPANY_LOGO = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=64&h=64&fit=crop";


const TEMPLATE_CONFIGS: Record<string, Partial<PageData>> = {
  "School / College Fee Collection": {
    merchantName: "Company",
    logoInitial: "C",
    logoUrl: COMPANY_LOGO,
    brandColor: "#1D4ED8",
    category: "education",
    buttonText: "Pay Fees Now",
    successMessage: "Payment received! Your fee receipt has been sent to your email.",
    slug: "company-fee-payment",
    pageUrl: "https://rzp.io/rzp/company-fee-payment",
    sections: [
      { id: "s_hero", type: "hero", visible: true, data: { title: "Student Fee Payment Portal", tagline: "Quick & secure fee collection — no queues, no cash", description: "Pay tuition fees, exam fees, hostel charges, and any other dues directly online. Get an instant GST-compliant receipt delivered to your email." } },
      { id: "s_stats", type: "stats", visible: true, data: { items: [{ value: "15,000+", label: "Students enrolled" }, { value: "₹0", label: "Convenience fee" }, { value: "10+", label: "Payment modes" }, { value: "Instant", label: "Receipt delivery" }] } },
      { id: "s_highlights", type: "highlights", visible: true, data: { title: "Why pay online?", items: ["Accept any fee type in one place", "UPI, card, net banking — all accepted", "Instant GST-compliant receipt on email", "Partial payment & installment support", "Auto-reminders for upcoming due dates", "24/7 payment acceptance, no queues"] } },
      { id: "s_about", type: "about", visible: true, data: { image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&crop=face", name: "Finance Department", role: "Accounts & Admissions Office", bio: "All payments are processed securely and credited within 24 hours. Contact fees@company.edu for queries. Office hours: Mon–Sat, 9 AM – 5 PM." } },
      { id: "s_testimonials", type: "testimonials", visible: false, data: { items: [] } },
      { id: "s_faq", type: "faq", visible: true, data: { items: [{ q: "Which payment methods are accepted?", a: "UPI, Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking, and Wallets." }, { q: "Will I get a receipt?", a: "Yes, a GST-compliant receipt is sent to your email immediately after payment." }, { q: "Can I pay in installments?", a: "Yes, installment plans are available for select fee types. Contact the finance office." }, { q: "What if my payment fails?", a: "Failed payments are auto-refunded within 5–7 business days. You can retry immediately." }] } },
    ] as ContentSection[],
    formFields: [
      { id: "f_amt", fieldKind: "amount" as const, type: "amount-fixed" as const, label: "Fee Amount", required: true, placeholder: "", amount: 15000, showDescription: true, description: "Academic year 2024–25 tuition fee" },
      { id: "f_name", fieldKind: "input" as const, type: "text" as const, label: "Student Full Name", required: true, placeholder: "Enter student's full name" },
      { id: "f_id", fieldKind: "input" as const, type: "alphanum" as const, label: "Student / Roll Number", required: true, placeholder: "e.g. STU2024001" },
      { id: "f_class", fieldKind: "input" as const, type: "dropdown" as const, label: "Class / Course", required: true, placeholder: "Select your class", options: ["Class 9", "Class 10", "Class 11 (Science)", "Class 11 (Commerce)", "Class 12 (Science)", "Class 12 (Commerce)", "B.Com Year 1", "B.Com Year 2", "B.Com Year 3"] },
      { id: "f_type", fieldKind: "input" as const, type: "dropdown" as const, label: "Fee Type", required: true, placeholder: "Select fee type", options: ["Tuition Fee", "Exam Fee", "Hostel Fee", "Library Fee", "Sports Fee", "Lab Fee"] },
      { id: "f_email", fieldKind: "input" as const, type: "email" as const, label: "Email Address", required: true, placeholder: "Receipt will be sent here" },
      { id: "f_phone", fieldKind: "input" as const, type: "phone" as const, label: "Phone Number", required: false, placeholder: "Parent / guardian contact" },
    ] as FormField[],
  },

  "Online Course Fee Collection": {
    merchantName: "Company",
    logoInitial: "C",
    logoUrl: COMPANY_LOGO,
    brandColor: "#7C3AED",
    category: "education",
    buttonText: "Enroll Now",
    successMessage: "Welcome aboard! Check your email for onboarding instructions and course access details.",
    slug: "company-bootcamp",
    pageUrl: "https://rzp.io/rzp/company-bootcamp",
    sections: [
      { id: "s_hero", type: "hero", visible: true, data: { title: "Full-Stack Web Development Bootcamp", tagline: "From complete beginner to job-ready in 12 weeks", description: "A rigorous, hands-on bootcamp that teaches you React, Node.js, PostgreSQL, and deployment. Built for people who want to switch careers or upskill fast." } },
      { id: "s_stats", type: "stats", visible: true, data: { items: [{ value: "2,400+", label: "Students enrolled" }, { value: "4.9★", label: "Average rating" }, { value: "12 weeks", label: "Duration" }, { value: "92%", label: "Placement rate" }] } },
      { id: "s_highlights", type: "highlights", visible: true, data: { title: "What's included", items: ["60+ hours of live instructor-led sessions", "Unlimited doubt-clearing support", "6 real-world portfolio projects", "Certificate of completion", "1:1 mock interviews + resume review", "Lifetime alumni community access"] } },
      { id: "s_about", type: "about", visible: true, data: { image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", name: "Rahul Sharma", role: "Lead Instructor & Founder", bio: "Ex-Razorpay senior engineer with 12 years of industry experience. Has trained 4,000+ developers and helped 500+ land their first tech job." } },
      { id: "s_testimonials", type: "testimonials", visible: true, data: { items: [{ name: "Priya S.", rating: 5, text: "Switched from a non-tech background. Got a ₹12 LPA offer 3 weeks after completing the bootcamp!" }, { name: "Arjun M.", rating: 5, text: "Best investment I've made. The mock interviews and resume prep were game-changing. Placed at a Series B startup." }, { name: "Neha K.", rating: 5, text: "Incredibly well-structured curriculum. You build real things from day 1 instead of watching theory videos." }, { name: "Vikram P.", rating: 4, text: "Excellent mentorship. Rahul personally reviewed my portfolio and the feedback was gold." }] } },
      { id: "s_faq", type: "faq", visible: true, data: { items: [{ q: "Do I need prior coding experience?", a: "No prior experience needed. We start from absolute basics and build up progressively." }, { q: "Are sessions live or recorded?", a: "All sessions are live with recordings available for 6 months after the course ends." }, { q: "What's the refund policy?", a: "Full refund within 7 days of starting. No questions asked." }] } },
    ] as ContentSection[],
    formFields: [
      { id: "f_amt", fieldKind: "amount" as const, type: "amount-fixed" as const, label: "Course Fee", required: true, placeholder: "", amount: 29999, showDescription: true, description: "Full-Stack Web Development Bootcamp — Batch 12" },
      { id: "f_name", fieldKind: "input" as const, type: "text" as const, label: "Full Name", required: true, placeholder: "Your full name" },
      { id: "f_email", fieldKind: "input" as const, type: "email" as const, label: "Email Address", required: true, placeholder: "Course access will be sent here" },
      { id: "f_phone", fieldKind: "input" as const, type: "phone" as const, label: "Phone Number", required: true, placeholder: "For WhatsApp updates" },
    ] as FormField[],
  },

  "Coaching Session Booking": {
    merchantName: "Company",
    logoInitial: "C",
    logoUrl: COMPANY_LOGO,
    brandColor: "#059669",
    category: "services",
    buttonText: "Book My Session",
    successMessage: "Session booked! You'll receive a calendar invite and Zoom link within 2 hours.",
    slug: "company-coaching",
    pageUrl: "https://rzp.io/rzp/company-coaching",
    sections: [
      { id: "s_hero", type: "hero", visible: true, data: { title: "1-on-1 Business Strategy Coaching", tagline: "Clarity, focus, and a real action plan — in one session", description: "Work directly with an experienced business coach to overcome challenges, validate your strategy, and unlock your next level of growth. Available for founders, managers, and professionals." } },
      { id: "s_stats", type: "stats", visible: true, data: { items: [{ value: "500+", label: "Clients coached" }, { value: "4.9★", label: "Average rating" }, { value: "60 min", label: "Session duration" }, { value: "48 hrs", label: "Response time" }] } },
      { id: "s_highlights", type: "highlights", visible: true, data: { title: "What you get", items: ["Pre-session questionnaire for deep prep", "Full session recording sent to you", "Written summary + action items after", "Proven frameworks for growth decisions", "Email follow-up support for 2 weeks", "Flexible rescheduling with 24-hr notice"] } },
      { id: "s_about", type: "about", visible: true, data: { image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face", name: "Meera Krishnan", role: "Business Coach & Consultant", bio: "Former McKinsey consultant. 15 years helping founders and executives unlock growth across 200+ companies. Certified ICF coach and TEDx speaker." } },
      { id: "s_testimonials", type: "testimonials", visible: true, data: { items: [{ name: "Kartik T.", rating: 5, text: "One session with Meera was worth more than 3 months of self-doubt. Clear path forward, immediate action." }, { name: "Divya R.", rating: 5, text: "I came in overwhelmed. I left with a prioritized 90-day plan. The ROI on this session was immediate." }, { name: "Sameer G.", rating: 5, text: "Meera's frameworks for decision-making are genuinely powerful. Recommended her to every founder I know." }, { name: "Anjali M.", rating: 4, text: "Great depth, very personalized. She did her homework before the call and asked exactly the right questions." }] } },
      { id: "s_faq", type: "faq", visible: false, data: { items: [] } },
    ] as ContentSection[],
    formFields: [
      { id: "f_amt", fieldKind: "amount" as const, type: "amount-fixed" as const, label: "Coaching Session", required: true, placeholder: "", amount: 4999, showDescription: true, description: "60-minute 1-on-1 business strategy session via Zoom" },
      { id: "f_name", fieldKind: "input" as const, type: "text" as const, label: "Full Name", required: true, placeholder: "Your full name" },
      { id: "f_email", fieldKind: "input" as const, type: "email" as const, label: "Email Address", required: true, placeholder: "Calendar invite sent here" },
      { id: "f_phone", fieldKind: "input" as const, type: "phone" as const, label: "Phone / WhatsApp", required: true, placeholder: "+91 XXXXX XXXXX" },
      { id: "f_type", fieldKind: "input" as const, type: "dropdown" as const, label: "Session Focus", required: true, placeholder: "What do you want to work on?", options: ["Business strategy & growth", "Fundraising & investor pitch", "Team building & leadership", "Career transition & clarity", "Product-market fit", "Revenue & sales strategy", "Other"] },
      { id: "f_date", fieldKind: "input" as const, type: "date" as const, label: "Preferred Session Date", required: false, placeholder: "" },
    ] as FormField[],
  },

  "E-commerce Store": {
    merchantName: "Company",
    logoInitial: "C",
    logoUrl: COMPANY_LOGO,
    brandColor: "#DC2626",
    category: "ecommerce",
    buttonText: "Buy Now",
    successMessage: "Order confirmed! You'll receive shipping details and tracking within 24 hours.",
    slug: "company-store",
    pageUrl: "https://rzp.io/rzp/company-store",
    sections: [
      { id: "s_hero", type: "hero", visible: true, data: { title: "Premium Noise-Cancelling Headphones", tagline: "Studio-grade sound. Built for the real world.", description: "Experience deep bass, crystal-clear highs, and 30 hours of battery life in an ultra-light design. Perfect for work, travel, and everything in between." } },
      { id: "s_stats", type: "stats", visible: true, data: { items: [{ value: "4.8★", label: "Rated by 8,000+ buyers" }, { value: "30 hrs", label: "Battery life" }, { value: "Free", label: "Shipping pan-India" }, { value: "30 days", label: "Easy returns" }] } },
      { id: "s_highlights", type: "highlights", visible: true, data: { title: "Product highlights", items: ["Active noise cancellation (ANC)", "40mm custom drivers for rich bass", "Foldable design with hard carry case", "Works with iOS, Android & Windows", "USB-C fast charge: 10 min = 3 hrs", "1-year manufacturer warranty"] } },
      { id: "s_testimonials", type: "testimonials", visible: true, data: { items: [{ name: "Rohan P.", rating: 5, text: "Best headphones under ₹5K. ANC blocks out my entire open office. Sound quality is exceptional." }, { name: "Shreya M.", rating: 5, text: "Battery life is insane. Charged once and used it for 4 days straight. Super comfortable too." }, { name: "Aditya K.", rating: 4, text: "Great build quality and the carry case is a nice touch. Crystal clear on video meetings." }, { name: "Pooja V.", rating: 5, text: "Gifted to my husband. He hasn't taken them off. Fast delivery, great packaging." }] } },
      { id: "s_about", type: "about", visible: false, data: { image: "", name: "", role: "", bio: "" } },
      { id: "s_faq", type: "faq", visible: true, data: { items: [{ q: "How long does shipping take?", a: "2–5 business days for metro cities, 5–7 days for other locations. Express shipping available." }, { q: "What's the return policy?", a: "30-day hassle-free returns. Product must be in original condition with all accessories." }, { q: "Is warranty included?", a: "Yes, 1-year manufacturer warranty covering all manufacturing defects." }] } },
    ] as ContentSection[],
    formFields: [
      { id: "f_amt", fieldKind: "amount" as const, type: "amount-fixed" as const, label: "Headphones XPro 3.0", required: true, placeholder: "", amount: 4999, showDescription: true, description: "Premium Noise-Cancelling Headphones — includes carry case & USB-C cable" },
      { id: "f_name", fieldKind: "input" as const, type: "text" as const, label: "Full Name", required: true, placeholder: "Name for shipping label" },
      { id: "f_email", fieldKind: "input" as const, type: "email" as const, label: "Email Address", required: true, placeholder: "Order confirmation sent here" },
      { id: "f_phone", fieldKind: "input" as const, type: "phone" as const, label: "Phone Number", required: true, placeholder: "For delivery updates" },
      { id: "f_color", fieldKind: "input" as const, type: "dropdown" as const, label: "Colour", required: true, placeholder: "Choose a colour", options: ["Midnight Black", "Pearl White", "Space Grey", "Coral Red"] },
      { id: "f_addr", fieldKind: "input" as const, type: "textarea" as const, label: "Delivery Address", required: true, placeholder: "Full delivery address with pincode" },
    ] as FormField[],
  },

  "Event Booking": {
    merchantName: "Company",
    logoInitial: "C",
    logoUrl: COMPANY_LOGO,
    brandColor: "#D97706",
    category: "events",
    buttonText: "Register Now",
    successMessage: "You're registered! Check your email for your event pass and schedule.",
    slug: "company-summit",
    pageUrl: "https://rzp.io/rzp/company-summit",
    sections: [
      { id: "s_hero", type: "hero", visible: true, data: { title: "Growth Summit 2025 — Mumbai", tagline: "India's premier conference for founders and business builders", description: "Two days of high-signal talks, workshops, and networking with 1,500+ founders, investors, and operators. Actionable insights you can implement immediately." } },
      { id: "s_stats", type: "stats", visible: true, data: { items: [{ value: "1,500+", label: "Attendees" }, { value: "40+", label: "Speakers" }, { value: "Dec 14–15", label: "Mumbai" }, { value: "3", label: "Tracks" }] } },
      { id: "s_highlights", type: "highlights", visible: true, data: { title: "What's included", items: ["Access to all keynotes & panel sessions", "Hands-on workshops (limited seats)", "Curated 1:1 networking sessions", "Summit playbook & speaker slide decks", "Lunch, tea & evening networking dinner", "Recording access for 3 months"] } },
      { id: "s_testimonials", type: "testimonials", visible: true, data: { items: [{ name: "Ankit S.", rating: 5, text: "Best conference I've attended in years. Every session was packed with actionable insights. Met my co-founder here!" }, { name: "Ritu K.", rating: 5, text: "Quality of speakers and hallway conversations is unmatched. Worth every rupee." }, { name: "Varun M.", rating: 4, text: "Great organisation. The investor networking session alone was worth the ticket price." }, { name: "Preethi N.", rating: 5, text: "I've attended Growth Summit 3 years in a row. The one conference I never miss." }] } },
      { id: "s_about", type: "about", visible: false, data: { image: "", name: "", role: "", bio: "" } },
      { id: "s_faq", type: "faq", visible: true, data: { items: [{ q: "Is there a group discount?", a: "Yes! Get 20% off for groups of 5+. Email events@company.in for group bookings." }, { q: "Can I transfer my ticket?", a: "Tickets are transferable up to 7 days before the event." }, { q: "What's the refund policy?", a: "Full refund up to 30 days before. 50% refund up to 14 days before. No refund after." }] } },
    ] as ContentSection[],
    formFields: [
      { id: "f_ticket", fieldKind: "amount" as const, type: "amount-fixed" as const, label: "Standard Pass", required: true, placeholder: "", amount: 2999, showDescription: true, description: "Growth Summit 2025 — Dec 14–15 · Mumbai · NSCI Dome" },
      { id: "f_name", fieldKind: "input" as const, type: "text" as const, label: "Full Name", required: true, placeholder: "Name for event badge" },
      { id: "f_email", fieldKind: "input" as const, type: "email" as const, label: "Email Address", required: true, placeholder: "Event pass sent here" },
      { id: "f_phone", fieldKind: "input" as const, type: "phone" as const, label: "Phone Number", required: false, placeholder: "For event updates" },
      { id: "f_org", fieldKind: "input" as const, type: "text" as const, label: "Company / Organisation", required: false, placeholder: "For badge & networking" },
      { id: "f_type", fieldKind: "input" as const, type: "dropdown" as const, label: "Ticket Type", required: true, placeholder: "Select ticket type", options: ["Standard Pass — ₹2,999", "Pro Pass (incl. workshops) — ₹5,999", "VIP Pass (front row + dinner) — ₹9,999"] },
    ] as FormField[],
  },

  "Non-Profit Donation": {
    merchantName: "Company",
    logoInitial: "C",
    logoUrl: COMPANY_LOGO,
    brandColor: "#BE185D",
    category: "services",
    buttonText: "Donate Now",
    successMessage: "Thank you for your generosity! Your 80G tax receipt has been sent to your email within 30 minutes.",
    slug: "company-donate",
    pageUrl: "https://rzp.io/rzp/company-donate",
    sections: [
      { id: "s_hero", type: "hero", visible: true, data: { title: "Help 10,000 Children Access Quality Education", tagline: "Your contribution changes lives — one child at a time", description: "In rural India, millions of children drop out of school due to poverty. We provide free schooling, meals, and mentorship. 100% of your donation goes directly to the children." } },
      { id: "s_stats", type: "stats", visible: true, data: { items: [{ value: "8,400+", label: "Children supported" }, { value: "12 years", label: "On the ground" }, { value: "3 states", label: "UP, Bihar, Jharkhand" }, { value: "₹3.2 Cr", label: "Raised last year" }] } },
      { id: "s_highlights", type: "highlights", visible: true, data: { title: "Your donation funds", items: ["Free schooling for out-of-school children", "Daily nutritious mid-day meals", "Trained teachers and mentors", "Educational materials & digital access", "80G tax exemption for all donations", "Monthly impact reports sent to donors"] } },
      { id: "s_about", type: "about", visible: true, data: { image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face", name: "Sunita Rao", role: "Founder & Executive Director", bio: "Former IAS officer who left a 20-year career to build this NGO. NASSCOM Social Innovation Award winner. Trusted by 8,000+ donors across India." } },
      { id: "s_testimonials", type: "testimonials", visible: true, data: { items: [{ name: "Kavya R.", rating: 5, text: "I've been donating monthly for 2 years. The impact reports are detailed and honest. You can see exactly where your money goes." }, { name: "Deepak J.", rating: 5, text: "Transparent, trustworthy, genuinely impactful. Got my 80G receipt instantly. Will keep supporting." }, { name: "Sunita B.", rating: 5, text: "Visited one of their centres in Bihar. The work they do on the ground is incredible." }, { name: "Manish T.", rating: 5, text: "One of the few NGOs that publishes audited financials. Zero doubt about credibility." }] } },
      { id: "s_faq", type: "faq", visible: true, data: { items: [{ q: "How is my donation used?", a: "100% of your donation goes to program costs. Operational expenses are funded separately via CSR partners." }, { q: "Will I get a tax receipt?", a: "Yes, an 80G-compliant receipt is sent to your email within 30 minutes of your donation." }, { q: "Can I donate monthly?", a: "Yes! Set up a monthly donation using UPI AutoPay or recurring card. Cancel anytime." }] } },
    ] as ContentSection[],
    formFields: [
      { id: "f_amt", fieldKind: "amount" as const, type: "amount-custom" as const, label: "Donation Amount", required: true, placeholder: "Enter amount you wish to donate" },
      { id: "f_name", fieldKind: "input" as const, type: "text" as const, label: "Full Name", required: true, placeholder: "Name for 80G receipt" },
      { id: "f_email", fieldKind: "input" as const, type: "email" as const, label: "Email Address", required: true, placeholder: "80G receipt sent here" },
      { id: "f_phone", fieldKind: "input" as const, type: "phone" as const, label: "Phone Number", required: false, placeholder: "Optional" },
      { id: "f_pan", fieldKind: "input" as const, type: "pan" as const, label: "PAN Number (for 80G)", required: false, placeholder: "ABCDE1234F" },
    ] as FormField[],
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

const PaymentPageEditor = () => {
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const [viewMode,              setViewMode]              = useState<"desktop" | "mobile">("desktop");
  const [previewMode,           setPreviewMode]           = useState(false);
  const [publishDialogOpen,     setPublishDialogOpen]     = useState(false);
  const [postPublishDialogOpen, setPostPublishDialogOpen] = useState(false);
  const [receiptsDialogOpen,    setReceiptsDialogOpen]    = useState(false);
  const [settingsDialogOpen,    setSettingsDialogOpen]    = useState(false);
  const [publishing,            setPublishing]            = useState(false);
  const [unsavedChanges,        setUnsavedChanges]        = useState(false);

  // Settings modal state
  const [pageExpiry,            setPageExpiry]            = useState("no-expiry");
  const [successAction,         setSuccessAction]         = useState<"message" | "redirect" | null>(null);

  const [receiptDeliveryMode, setReceiptDeliveryMode] = useState<"auto" | "manual">("auto");
  const [receiptChannel,      setReceiptChannel]       = useState<"email" | "whatsapp" | "both">("email");
  const [receiptPrefix,       setReceiptPrefix]        = useState("RCP");
  const [receiptStartNumber,  setReceiptStartNumber]   = useState("001");

  const dragIndexRef = useRef<number | null>(null);

  const templateName   = searchParams.get("template") || "";
  const templateConfig = TEMPLATE_CONFIGS[templateName] || {};

  const [pageData, setPageData] = useState<PageData>({
    merchantName: searchParams.get("title") || searchParams.get("template") || "XYZ Company",
    logoInitial: (searchParams.get("title") || searchParams.get("template") || "X")[0].toUpperCase(),
    logoUrl: COMPANY_LOGO,
    brandColor: "#0066FF",
    primaryColor: "#0066FF",
    secondaryColor: "#EEF3FF",
    category: "education",
    buttonText: "Pay Now",
    successMessage: "Thank you! You'll receive a confirmation shortly.",
    redirectUrl: "",
    sendReceipt: true,
    gstEnabled: true,
    sections: defaultSections,
    formFields: defaultFormFields,
    status: "draft",
    slug: "xyz-company-page",
    pageUrl: "https://rzp.io/rzp/xyz-company-page",
    supportEmail: "",
    supportPhone: "",
    termsText: "",
    ...templateConfig,
    primaryColor: (templateConfig as any)?.brandColor || "#0066FF",
    secondaryColor: "#EEF3FF",
  });

  const updatePage = (updates: Partial<PageData>) => {
    setPageData((prev) => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const updateSection = (id: string, patch: Partial<ContentSection>) =>
    updatePage({ sections: pageData.sections.map((s) => s.id === id ? { ...s, ...patch } : s) });

  const updateSectionData = (id: string, dataPatch: Record<string, any>) =>
    updatePage({ sections: pageData.sections.map((s) => s.id === id ? { ...s, data: { ...s.data, ...dataPatch } } : s) });

  const removeSection = (id: string) =>
    updatePage({ sections: pageData.sections.map((s) => s.id === id ? { ...s, visible: false } : s) });

  const addSection = (type: SectionType) => {
    const newSection = createDefaultSection(type);
    updatePage({ sections: [...pageData.sections, newSection] });
    toast.success(`${SECTION_META[type]?.label ?? type} added`);
  };

  const reorderSections = (orderedIds: string[]) => {
    const map = Object.fromEntries(pageData.sections.map((s) => [s.id, s]));
    const visible = orderedIds.map((id) => map[id]).filter(Boolean) as ContentSection[];
    const hidden  = pageData.sections.filter((s) => !s.visible);
    updatePage({ sections: [...visible, ...hidden] });
  };

  const updateField = (id: string, patch: Partial<FormField>) =>
    updatePage({ formFields: pageData.formFields.map((f) => f.id === id ? ({ ...f, ...patch } as FormField) : f) });

  const removeField = (id: string) =>
    updatePage({ formFields: pageData.formFields.filter((f) => f.id !== id) });

  const addInputField = (type: InputFieldType) => {
    const field: InputField = {
      id: `f_${Date.now()}`,
      fieldKind: "input",
      type,
      label: INPUT_TYPES.find(x => x.type === type)?.label ?? "New Field",
      required: false,
      placeholder: "Enter value",
    };
    updatePage({ formFields: [...pageData.formFields, field] });
  };

  const addAmountField = (type: AmountFieldType) => {
    const field: AmountField = {
      id: `f_${Date.now()}`,
      fieldKind: "amount",
      type,
      label: AMOUNT_TYPES.find(x => x.type === type)?.label ?? "Amount",
      required: true,
      placeholder: "",
      amount: 0,
      showDescription: false,
      optional: false,
    };
    updatePage({ formFields: [...pageData.formFields, field] });
  };

  const handleDragStart = (index: number) => { dragIndexRef.current = index; };
  const handleDragOver  = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    const fields = [...pageData.formFields];
    const [moved] = fields.splice(from, 1);
    fields.splice(index, 0, moved);
    dragIndexRef.current = index;
    setPageData((prev) => ({ ...prev, formFields: fields }));
    setUnsavedChanges(true);
  };
  const handleDragEnd   = () => { dragIndexRef.current = null; };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      updatePage({ status: "published" });
      setPublishDialogOpen(false);
      setPostPublishDialogOpen(true);
      setUnsavedChanges(false);
    }, 2000);
  };

  const handleSave = () => { setUnsavedChanges(false); toast.success("Saved as draft"); };
  const copyLink   = () => { navigator.clipboard.writeText(pageData.pageUrl); toast.success("Link copied!"); };

  const totalAmount = pageData.formFields
    .filter((f): f is AmountField => f.fieldKind === "amount" && f.type === "amount-fixed")
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const hiddenSections = pageData.sections.filter((s) => !s.visible);

  // ─── Preview mode ─────────────────────────────────────────────────────────

  if (previewMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="relative flex items-center justify-between border-b border-border px-4 py-2.5 bg-background">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Exit Preview
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">Previewing as customers see it</span>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center border border-border rounded-md overflow-hidden bg-background">
            <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Monitor className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("mobile")}  className={`p-2 ${viewMode === "mobile"  ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Smartphone className="h-4 w-4" /></button>
          </div>
          <Button size="sm" onClick={() => { setPreviewMode(false); setPublishDialogOpen(true); }}>Publish</Button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className={`mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-5xl"}`}>
            <EditorCanvas pageData={pageData} editable={false} isMobile={viewMode === "mobile"} totalAmount={totalAmount} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Editor ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="relative flex items-center justify-between border-b border-border px-3 sm:px-4 py-2.5 bg-background z-10">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-1.5 flex-shrink-0">
            <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-foreground text-sm truncate max-w-[120px] sm:max-w-xs">{pageData.merchantName}</span>
            {unsavedChanges && <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />}
            <span className={`${pageData.status === "published" ? "blade-badge-paid" : "blade-badge-expired"} text-[10px] flex-shrink-0`}>
              {pageData.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        </div>
        {/* Centered toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center border border-border rounded-md overflow-hidden bg-background">
          <button onClick={() => setViewMode("desktop")} className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Monitor className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("mobile")}  className={`p-2 ${viewMode === "mobile"  ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Smartphone className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {unsavedChanges && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hidden sm:flex" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" /> Save Draft
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4" /><span className="hidden sm:inline">Preview</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setReceiptsDialogOpen(true)}>
            <Receipt className="h-4 w-4" /><span className="hidden sm:inline">Receipts</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSettingsDialogOpen(true)}>
            <Settings className="h-4 w-4" /><span className="hidden sm:inline">Settings</span>
          </Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)}>Publish</Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className={`mx-auto transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-6xl"}`}>
            <EditorCanvas
              pageData={pageData}
              editable
              isMobile={viewMode === "mobile"}
              onUpdatePage={updatePage}
              onUpdateSectionData={updateSectionData}
              onRemoveSection={removeSection}
              hiddenSections={hiddenSections}
              onRestoreSection={(id) => updateSection(id, { visible: true })}
              onUpdateField={updateField}
              onRemoveField={removeField}
              onAddInputField={addInputField}
              onAddAmountField={addAmountField}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onAddSection={addSection}
              onReorderSections={reorderSections}
              totalAmount={totalAmount}
            />
          </div>
        </div>

      </div>

      {/* ── Receipts Modal ───────────────────────────────────────────────────── */}
      <Dialog open={receiptsDialogOpen} onOpenChange={setReceiptsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-foreground" />
              <DialogTitle>Payment Receipts Settings</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-5 py-1">
            {/* Send automatically */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="receiptMode" checked={pageData.sendReceipt} onChange={() => updatePage({ sendReceipt: true })}
                className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Send Receipts Automatically</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receipts are emailed to customers immediately after payment.</p>
              </div>
            </label>
            {/* Don't send */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="receiptMode" checked={!pageData.sendReceipt} onChange={() => updatePage({ sendReceipt: false })}
                className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Don't Send Receipts Automatically</p>
                <p className="text-xs text-muted-foreground mt-0.5">You may send receipts later from dashboard. Your own reference ID may be added too.</p>
              </div>
            </label>
            <div className="flex items-center gap-4 text-xs">
              <a href="#" className="text-primary hover:underline">Sample Receipt ↗</a>
              <a href="#" className="text-primary hover:underline">Learn More ↗</a>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="accent-primary w-4 h-4" />
                <span className="text-sm text-foreground">Show Customer's Information on Receipt</span>
              </label>
              <div className="space-y-1">
                <label className="flex items-center gap-2.5 cursor-not-allowed opacity-50">
                  <input type="checkbox" disabled className="w-4 h-4" />
                  <span className="text-sm text-foreground">Show 80g Details on Receipt</span>
                  <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-[10px] flex items-center justify-center flex-shrink-0">?</span>
                </label>
                <button className="text-xs text-primary hover:underline pl-7">+ Add your 80g details</button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setReceiptsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setReceiptsDialogOpen(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Settings Modal ───────────────────────────────────────────────────── */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-foreground" />
              <DialogTitle>Page Settings</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-5 py-1 divide-y divide-border">
            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">URL of this page</label>
              <Input value={pageData.pageUrl} readOnly className="text-sm text-muted-foreground bg-muted" />
            </div>

            {/* Theme */}
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Theme</p>
              <div className="flex items-center gap-5">
                {["Dark", "Light"].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" defaultChecked={t === "Light"} className="accent-primary" />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Page Expiry */}
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Page Expiry Date</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                <span className="text-sm">No Expiry</span>
              </label>
              <Input type="text" placeholder="DD-MM-YYYY" className="text-sm w-40" disabled />
            </div>

            {/* Action after payment */}
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Action after successful payment?</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={successAction === "message"} onChange={() => setSuccessAction(successAction === "message" ? null : "message")}
                  className="accent-primary w-4 h-4" />
                <span className="text-sm">Show custom message</span>
              </label>
              {successAction === "message" && (
                <Textarea value={pageData.successMessage} onChange={(e) => updatePage({ successMessage: e.target.value })} rows={2} className="text-sm mt-1" placeholder="Your payment was successful!" />
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={successAction === "redirect"} onChange={() => setSuccessAction(successAction === "redirect" ? null : "redirect")}
                  className="accent-primary w-4 h-4" />
                <span className="text-sm">Redirect to your website</span>
              </label>
              {successAction === "redirect" && (
                <Input value={pageData.redirectUrl} onChange={(e) => updatePage({ redirectUrl: e.target.value })} placeholder="https://example.com/thank-you" className="text-sm mt-1" />
              )}
            </div>

            {/* Hyperlink Button */}
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Get Hyperlink Button</p>
              <p className="text-xs text-muted-foreground">Put a hyperlink button on your website. Your customers can pay from your website by clicking on this Payment Button.</p>
              <Button variant="outline" size="sm" disabled className="opacity-50">Create</Button>
              <p className="text-[11px] text-muted-foreground">You can customize Embed Button after creating Payment Page</p>
            </div>

            {/* Plugins */}
            <div className="pt-4 space-y-4">
              <p className="text-sm font-medium text-foreground">Plugins and Add-ons</p>
              {/* Tracking */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">Facebook Pixel or Google Tracking</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Track your page metrics with analytics IDs</p>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0">Configure</Button>
              </div>
              {/* Shiprocket */}
              <div className="flex items-start justify-between gap-3 border border-border rounded-xl p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">Shiprocket</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">New</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-create orders on Shiprocket after payment. eCommerce shipping with low rates and wide reach.</p>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0">Enable</Button>
              </div>
            </div>
          </div>
            {/* Brand Colors */}
            <div className="pt-4 space-y-4">
              <p className="text-sm font-medium text-foreground">Brand Colors</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={pageData.primaryColor} onChange={(e) => updatePage({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border p-0.5 flex-shrink-0" />
                    <Input value={pageData.primaryColor} onChange={(e) => updatePage({ primaryColor: e.target.value })}
                      className="font-mono text-sm flex-1" placeholder="#0066FF" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Secondary / Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={pageData.secondaryColor} onChange={(e) => updatePage({ secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border p-0.5 flex-shrink-0" />
                    <Input value={pageData.secondaryColor} onChange={(e) => updatePage({ secondaryColor: e.target.value })}
                      className="font-mono text-sm flex-1" placeholder="#EEF3FF" />
                  </div>
                </div>
                <div className="rounded-lg p-4 flex items-center gap-3 border border-border" style={{ backgroundColor: pageData.secondaryColor }}>
                  <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: pageData.primaryColor }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: pageData.primaryColor }}>Live preview</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Colors applied to the page in real time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setSettingsDialogOpen(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Publish Payment Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">{pageData.merchantName}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Fields</span><p className="font-medium">{pageData.formFields.length} fields</p></div>
                <div><span className="text-muted-foreground text-xs">Total</span><p className="font-medium">₹{totalAmount.toLocaleString("en-IN")}</p></div>
              </div>
            </div>
            <div><label className="text-xs font-medium">Page URL</label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input value={pageData.pageUrl} readOnly className="flex-1 text-xs" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {["Payment integration active", "SSL-secured checkout", pageData.gstEnabled ? "GST-compliant receipts" : "Receipts enabled"].map((t) => (
                <div key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t}</div>
              ))}
            </div>
            <Button className="w-full gap-2" onClick={handlePublish} disabled={publishing}>
              {publishing ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing...</> : "Publish Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Share Payment Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate mr-2">{pageData.pageUrl}</span>
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={copyLink}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["WhatsApp", "Email", "SMS", "Twitter"].map((c) => (
                <Button key={c} variant="outline" onClick={() => toast.success(`Shared via ${c}`)}>{c}</Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Publish Dialog */}
      <Dialog open={postPublishDialogOpen} onOpenChange={setPostPublishDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-[hsl(152,69%,91%)] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[hsl(152,69%,30%)]" />
              </div>
              <div>
                <DialogTitle className="text-xl">Payment Page Published!</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Your page is live and ready to accept payments</p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="blade-card p-4">
              <label className="text-xs font-semibold mb-2 block">Your Payment Page URL</label>
              <div className="flex items-center gap-2">
                <Input value={`https://rzp.io/rzp/${pageData.slug}`} readOnly className="flex-1 text-sm font-mono" />
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-4 w-4 mr-1" />Copy</Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/payment/${pageData.slug}`, "_blank")}><ExternalLink className="h-4 w-4 mr-1" />Open</Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPostPublishDialogOpen(false)}>Done</Button>
              <Button className="flex-1" onClick={() => { setPostPublishDialogOpen(false); navigate("/payment-pages"); }}>View All Pages</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── EditorCanvas ─────────────────────────────────────────────────────────────

interface EditorCanvasProps {
  pageData: PageData;
  editable?: boolean;
  isMobile?: boolean;
  onUpdatePage?: (u: Partial<PageData>) => void;
  onUpdateSectionData?: (id: string, data: Record<string, any>) => void;
  onRemoveSection?: (id: string) => void;
  hiddenSections?: ContentSection[];
  onRestoreSection?: (id: string) => void;
  onUpdateField?: (id: string, patch: Partial<FormField>) => void;
  onRemoveField?: (id: string) => void;
  onAddInputField?: (type: InputFieldType) => void;
  onAddAmountField?: (type: AmountFieldType) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  onAddSection?: (type: SectionType) => void;
  onReorderSections?: (orderedIds: string[]) => void;
  totalAmount: number;
}

const EditorCanvas = ({
  pageData, editable = false, isMobile = false,
  onUpdatePage, onUpdateSectionData, onRemoveSection,
  hiddenSections = [], onRestoreSection,
  onUpdateField, onRemoveField, onAddInputField, onAddAmountField,
  onDragStart, onDragOver, onDragEnd,
  onAddSection, onReorderSections,
  totalAmount,
}: EditorCanvasProps) => {
  const visibleSections = pageData.sections.filter((s) => s.visible);
  const [mobileStep, setMobileStep] = useState<"content" | "payment">("content");
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const sectionDragRef = useRef<number | null>(null);

  const primaryColor = pageData.primaryColor || "#0066FF";
  const secondaryColor = pageData.secondaryColor || "#EEF3FF";

  const handleSectionDragStart = (i: number) => { sectionDragRef.current = i; };
  const handleSectionDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = sectionDragRef.current;
    if (from === null || from === i || from === 0 || i === 0) return;
    const arr = [...visibleSections];
    const [moved] = arr.splice(from, 1);
    arr.splice(i, 0, moved);
    sectionDragRef.current = i;
    onReorderSections?.(arr.map((s) => s.id));
  };
  const handleSectionDragEnd = () => { sectionDragRef.current = null; };

  return (
    <div className="bg-white min-h-screen">
      {/* Merchant nav */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-3">
            {pageData.logoUrl ? (
              <img src={pageData.logoUrl} alt="logo" className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                style={{ backgroundColor: primaryColor }}>
                {pageData.logoInitial}
              </div>
            )}
            {editable ? (
              <input
                value={pageData.merchantName}
                onChange={(e) => onUpdatePage?.({ merchantName: e.target.value })}
                className="font-bold text-base text-gray-900 bg-transparent border-none focus:outline-none focus:bg-gray-50 rounded px-1 hover:bg-gray-50 max-w-xs"
              />
            ) : (
              <span className="font-bold text-base text-gray-900">{pageData.merchantName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Two-column grid — mobile becomes single-column with step navigation */}
      {isMobile ? (
        /* ── Mobile: stepped layout ── */
        <div className="flex flex-col min-h-[calc(100vh-56px)]">
          {mobileStep === "content" ? (
            <>
              <div className="flex-1 px-4 py-8 pb-24 space-y-8">
                {visibleSections.map((section, i) => (
                  <div key={section.id} draggable={editable && i !== 0}
                    onDragStart={() => handleSectionDragStart(i)}
                    onDragOver={(e) => handleSectionDragOver(e, i)}
                    onDragEnd={handleSectionDragEnd}>
                    <SectionBlock
                      section={section} pageData={pageData} editable={editable}
                      primaryColor={primaryColor} secondaryColor={secondaryColor}
                      isHero={i === 0}
                      onUpdate={(data) => onUpdateSectionData?.(section.id, data)}
                      onRemove={() => onRemoveSection?.(section.id)}
                      onEdit={() => setEditingSection(section)}
                    />
                  </div>
                ))}
                {editable && (
                  <button onClick={() => setAddWidgetOpen(true)}
                    className="flex items-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors justify-center">
                    <Plus className="h-4 w-4" /> Add Widget
                  </button>
                )}
                {editable && hiddenSections.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200">
                    {hiddenSections.map((s) => (
                      <button key={s.id} onClick={() => onRestoreSection?.(s.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition-colors">
                        <Plus className="h-3 w-3" />{SECTION_META[s.type]?.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-gray-100 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" />100% Secure</div>
                  <div className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-blue-400" />Razorpay Protected</div>
                  <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="ml-0.5">4.9 / 5 rating</span></div>
                </div>
                <PageContactFooter merchantName={pageData.merchantName} supportEmail={pageData.supportEmail} supportPhone={pageData.supportPhone} termsText={pageData.termsText} editable={editable} onUpdate={(p) => onUpdatePage?.(p)} />
              </div>
              {/* Sticky proceed button */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-10">
                <button onClick={() => setMobileStep("payment")}
                  className="w-full text-white rounded-xl py-3.5 text-sm font-semibold shadow-lg"
                  style={{ backgroundColor: primaryColor }}>
                  Proceed to Payment →
                </button>
              </div>
            </>
          ) : (
            /* Mobile payment step */
            <div className="flex-1 px-4 pt-4 pb-8">
              <button onClick={() => setMobileStep("content")} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary mb-4 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to details
              </button>
              <PaymentPanel editable={editable} pageData={pageData} totalAmount={totalAmount}
                onUpdateField={onUpdateField} onRemoveField={onRemoveField}
                onAddInputField={onAddInputField} onAddAmountField={onAddAmountField}
                onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}
                primaryColor={primaryColor}
              />
            </div>
          )}
        </div>
      ) : (
        /* Desktop: two-column grid */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">
          {/* LEFT: content sections */}
          <div className="space-y-8">
            {visibleSections.map((section, i) => (
              <div key={section.id} draggable={editable && i !== 0}
                onDragStart={() => handleSectionDragStart(i)}
                onDragOver={(e) => handleSectionDragOver(e, i)}
                onDragEnd={handleSectionDragEnd}>
                <SectionBlock section={section} pageData={pageData} editable={editable}
                  primaryColor={primaryColor} secondaryColor={secondaryColor}
                  isHero={i === 0}
                  onUpdate={(data) => onUpdateSectionData?.(section.id, data)}
                  onRemove={() => onRemoveSection?.(section.id)}
                  onEdit={() => setEditingSection(section)}
                />
              </div>
            ))}
            {editable && (
              <button onClick={() => setAddWidgetOpen(true)}
                className="flex items-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors justify-center">
                <Plus className="h-4 w-4" /> Add Widget
              </button>
            )}
            {editable && hiddenSections.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200">
                {hiddenSections.map((s) => (
                  <button key={s.id} onClick={() => onRestoreSection?.(s.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition-colors">
                    <Plus className="h-3 w-3" />{SECTION_META[s.type]?.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-gray-100 text-xs text-gray-400">
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" />100% Secure</div>
              <div className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-blue-400" />Razorpay Protected</div>
              <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="ml-0.5">4.9 / 5 rating</span></div>
            </div>
            <PageContactFooter merchantName={pageData.merchantName} supportEmail={pageData.supportEmail} supportPhone={pageData.supportPhone} termsText={pageData.termsText} editable={editable} onUpdate={(p) => onUpdatePage?.(p)} />
          </div>
          {/* RIGHT: payment panel */}
          <div className="lg:sticky lg:top-20">
            <PaymentPanel editable={editable} pageData={pageData} totalAmount={totalAmount}
              onUpdateField={onUpdateField} onRemoveField={onRemoveField}
              onAddInputField={onAddInputField} onAddAmountField={onAddAmountField}
              onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}
              primaryColor={primaryColor}
            />
          </div>
        </div>
      )}
      {/* Add Widget Dialog */}
      <Dialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
              {WIDGET_CATALOG.map(({ type, label, desc, icon: Icon, preview }) => (
                <button key={type} onClick={() => { onAddSection?.(type as SectionType); setAddWidgetOpen(false); }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}18` }}>
                    <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-1 truncate">{preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Widget Dialog */}
      {editingSection && (
        <WidgetEditDialog
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSave={(data) => {
            onUpdateSectionData?.(editingSection.id, data);
            setEditingSection(null);
          }}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
};

// ─── PaymentPanel ─────────────────────────────────────────────────────────────
// Shared payment fields panel used in both desktop and mobile payment step.

interface PaymentPanelProps {
  editable: boolean;
  pageData: PageData;
  totalAmount: number;
  onUpdateField?: (id: string, patch: Partial<FormField>) => void;
  onRemoveField?: (id: string) => void;
  onAddInputField?: (type: InputFieldType) => void;
  onAddAmountField?: (type: AmountFieldType) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  primaryColor?: string;
}

const PaymentPanel = ({
  editable, pageData, totalAmount,
  onUpdateField, onRemoveField, onAddInputField, onAddAmountField,
  onDragStart, onDragOver, onDragEnd,
  primaryColor = "#0066FF",
}: PaymentPanelProps) => (
  editable ? (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
        <div className="w-8 h-0.5 bg-primary mt-1.5" />
      </div>
      <div className="px-6 py-4 space-y-1">
        {pageData.formFields.map((field, index) => (
          <InlineFieldRow key={field.id} field={field} index={index}
            onUpdate={(patch) => onUpdateField?.(field.id, patch)}
            onRemove={() => onRemoveField?.(field.id)}
            onDragStart={() => onDragStart?.(index)}
            onDragOver={(e) => onDragOver?.(e, index)}
            onDragEnd={() => onDragEnd?.()}
          />
        ))}
        <div className="pt-3 pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">+ Add new</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs text-primary border border-primary/30 rounded px-2.5 py-1 hover:bg-primary/5 transition-colors font-medium">Input field</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {INPUT_TYPES.map(({ type, label, icon: Icon }) => (
                  <DropdownMenuItem key={type} onClick={() => onAddInputField?.(type)} className="gap-2 text-sm">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />{label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs text-primary border border-primary/30 rounded px-2.5 py-1 hover:bg-primary/5 transition-colors font-medium">Price field</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                {AMOUNT_TYPES.map(({ type, label, desc }) => (
                  <DropdownMenuItem key={type} onClick={() => onAddAmountField?.(type)} className="flex-col items-start py-2.5">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking"].map((l) => (
            <span key={l} className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5 font-medium">{l}</span>
          ))}
        </div>
        <button className="w-full bg-primary text-white rounded-lg py-3 text-sm font-semibold opacity-60 cursor-not-allowed" disabled>
          {pageData.buttonText}{totalAmount > 0 ? ` — ₹${totalAmount.toLocaleString("en-IN")}` : ""}
        </button>
        <p className="text-center text-[11px] text-gray-400">Powered by <span className="font-semibold" style={{ color: "#0066FF" }}>Razorpay</span></p>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
        <div className="w-8 h-0.5 bg-primary mt-1.5" />
      </div>
      <div className="px-6 py-4 space-y-4">
        {pageData.formFields.map((field) => <PreviewField key={field.id} field={field} />)}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {["UPI", "Visa", "Mastercard", "RuPay"].map((l) => (
            <span key={l} className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5 font-medium">{l}</span>
          ))}
        </div>
        <button className="w-full bg-primary text-white rounded-lg py-3 text-sm font-semibold">
          {pageData.buttonText}{totalAmount > 0 ? ` — ₹${totalAmount.toLocaleString("en-IN")}` : ""}
        </button>
        <p className="text-center text-[11px] text-gray-400">Powered by <span className="font-semibold" style={{ color: "#0066FF" }}>Razorpay</span></p>
      </div>
    </div>
  )
);

// ─── InlineFieldRow ───────────────────────────────────────────────────────────
// Renders each payment field as an actual inline input control, Razorpay-style.

interface InlineFieldRowProps {
  field: FormField;
  index: number;
  onUpdate: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const InlineFieldRow = ({
  field, index, onUpdate, onRemove, onDragStart, onDragOver, onDragEnd,
}: InlineFieldRowProps) => {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue,   setLabelValue]   = useState(field.label);
  const isAmount = field.fieldKind === "amount";
  const af = isAmount ? (field as AmountField) : null;
  const inf = !isAmount ? (field as InputField) : null;

  const commitLabel = () => {
    setEditingLabel(false);
    if (labelValue.trim()) onUpdate({ label: labelValue } as any);
  };

  // 3-dot menu options
  const ThreeDotMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={4}>
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-1">
          Additional Options
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="gap-2.5 py-2"
          onClick={() => onUpdate({ image: af?.image !== undefined ? undefined : "" } as any)}
        >
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <span>{af?.image !== undefined ? "Remove Image" : "Add Image"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 py-2"
          onClick={() => onUpdate({ showDescription: !af?.showDescription } as any)}
        >
          <AlignLeft className="h-4 w-4 text-gray-500" />
          <span>{af?.showDescription ? "Remove Description" : "Add Description"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 py-2"
          onClick={() => onUpdate({ optional: !af?.optional } as any)}
        >
          <Check className="h-4 w-4 text-gray-500" />
          <span>Make it Optional Item</span>
        </DropdownMenuItem>
        {af?.type === "amount-item" && (
          <DropdownMenuItem className="gap-2.5 py-2 flex-col items-start">
            <div className="flex items-center gap-2.5">
              <Settings2 className="h-4 w-4 text-gray-500" />
              <span>Advanced Options</span>
            </div>
            <span className="text-[11px] text-gray-400 pl-6">Add quantity, define rules around quantity, etc.</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2.5 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Field</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="group"
    >
      <div className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Drag handle */}
        <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Label (editable) */}
        <div className="w-28 flex-shrink-0">
          {editingLabel ? (
            <input
              autoFocus
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => e.key === "Enter" && commitLabel()}
              className="w-full text-sm font-medium text-gray-700 bg-white border border-primary/40 rounded px-1.5 py-0.5 focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingLabel(true)}
              className="text-sm font-medium text-gray-700 hover:text-primary text-left truncate w-full group/label flex items-center gap-1"
              title="Click to rename"
            >
              {field.label}
              <span className="opacity-0 group-hover/label:opacity-100 transition-opacity">
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </span>
            </button>
          )}
        </div>

        {/* Field control */}
        <div className="flex-1 min-w-0">
          {isAmount && af ? (
            <>
              {af.type === "amount-fixed" && (
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                  <span className="flex items-center gap-1 pl-3 pr-2 text-sm text-gray-600 border-r border-gray-200 bg-gray-50 self-stretch flex items-center">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={af.amount || ""}
                    onChange={(e) => onUpdate({ amount: Number(e.target.value) } as any)}
                    placeholder="0"
                    className="flex-1 px-3 py-2 text-sm text-gray-900 bg-transparent focus:outline-none min-w-0"
                  />
                </div>
              )}
              {af.type === "amount-custom" && (
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <span className="pl-3 pr-2 text-sm text-gray-400 border-r border-gray-200 self-stretch flex items-center">₹</span>
                  <span className="px-3 py-2 text-sm text-gray-400 italic">Customer enters amount</span>
                </div>
              )}
              {af.type === "amount-item" && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1 focus-within:border-primary/50">
                    <span className="pl-3 pr-2 text-sm text-gray-600 border-r border-gray-200 bg-gray-50 self-stretch flex items-center">₹</span>
                    <input
                      type="number"
                      value={af.amount || ""}
                      onChange={(e) => onUpdate({ amount: Number(e.target.value) } as any)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 text-xs text-gray-500">
                    <span>Qty: 1</span>
                  </div>
                </div>
              )}
              {/* Description sub-row */}
              {af.showDescription && (
                <input
                  value={af.description || ""}
                  onChange={(e) => onUpdate({ description: e.target.value } as any)}
                  placeholder="Item description (optional)"
                  className="mt-1.5 w-full text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/40"
                />
              )}
            </>
          ) : inf ? (
            inf.type === "textarea" ? (
              <textarea
                rows={2}
                placeholder={field.placeholder}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none text-gray-400 bg-gray-50/50"
                readOnly
              />
            ) : inf.type === "dropdown" ? (
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 gap-2">
                <span className="text-sm text-gray-400 flex-1">{field.placeholder || "Select option"}</span>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            ) : inf.type === "date" ? (
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 gap-2">
                <span className="text-sm text-gray-400 flex-1">DD / MM / YYYY</span>
                <CalendarDays className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                readOnly
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-gray-50/50 text-gray-400 cursor-default"
              />
            )
          ) : null}
        </div>

        {/* 3-dot menu */}
        <ThreeDotMenu />
      </div>
    </div>
  );
};

// ─── SectionBlock ─────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: ContentSection;
  pageData: PageData;
  editable: boolean;
  primaryColor: string;
  secondaryColor: string;
  isHero: boolean;
  onUpdate: (data: Record<string, any>) => void;
  onRemove: () => void;
  onEdit: () => void;
}

const SectionBlock = ({ section, pageData, editable, primaryColor, secondaryColor, isHero, onUpdate, onRemove, onEdit }: SectionBlockProps) => {
  const wrap = (children: React.ReactNode) =>
    editable ? (
      <div className="relative group/section">
        {children}
        {!isHero && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-all z-10">
            <button onClick={onEdit} className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-blue-500 transition-colors" title="Edit"><Pencil className="h-3 w-3" /></button>
            <button onClick={onRemove} className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-300 hover:text-red-500 hover:border-red-200 transition-colors" title="Remove"><X className="h-3 w-3" /></button>
          </div>
        )}
        {!isHero && editable && (
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/section:opacity-100 transition-all cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-300" />
          </div>
        )}
      </div>
    ) : <>{children}</>;

  const ET = ({ value, onChange, className, tag: Tag = "p" }: { value: string; onChange: (v: string) => void; className?: string; tag?: any }) => {
    if (!editable) return <Tag className={className}>{value}</Tag>;
    return (
      <Tag className={`${className} focus:outline-none hover:bg-blue-50/50 focus:bg-blue-50/60 rounded-sm transition-colors cursor-text`}
        contentEditable suppressContentEditableWarning
        onBlur={(e: any) => onChange(e.currentTarget.textContent || "")}
      >{value}</Tag>
    );
  };

  if (section.type === "hero") return wrap(
    <div className="space-y-4">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}>
        <Sparkles className="h-3 w-3" />{categoryLabel(pageData.category)}
      </span>
      <ET tag="h1" value={section.data.title} onChange={(v) => onUpdate({ title: v })} className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" />
      {section.data.tagline && <ET value={section.data.tagline} onChange={(v) => onUpdate({ tagline: v })} className="text-base font-medium" style={{ color: primaryColor } as any} />}
      <ET value={section.data.description} onChange={(v) => onUpdate({ description: v })} className="text-gray-600 leading-relaxed max-w-xl" />
    </div>
  );

  if (section.type === "stats" || section.type === "social_proof") return wrap(
    <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100">
      {(section.data.items as any[]).map((item, i) => (
        <div key={i} className="text-center">
          <div className="text-xl font-bold" style={{ color: primaryColor }}>{item.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );

  if (section.type === "highlights") return wrap(
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{section.data.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(section.data.items as string[]).map((h, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}18` }}>
              <Check className="h-3 w-3" style={{ color: primaryColor }} />
            </div>
            <span className="text-sm text-gray-700">{h}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (section.type === "about" || section.type === "instructor") return wrap(
    <div className="rounded-2xl p-6 flex items-start gap-5" style={{ backgroundColor: secondaryColor }}>
      {section.data.image && <img src={section.data.image} alt={section.data.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow" />}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
          {pageData.category === "education" ? "Your Instructor" : "Your Provider"}
        </p>
        <h3 className="text-base font-semibold text-gray-900">{section.data.name}</h3>
        <p className="text-xs text-gray-500 mb-0.5">{section.data.role}</p>
        {section.data.credentials && <p className="text-xs font-medium mb-1" style={{ color: primaryColor }}>{section.data.credentials}</p>}
        <p className="text-sm text-gray-600 leading-relaxed">{section.data.bio}</p>
      </div>
    </div>
  );

  if (section.type === "testimonials") return wrap(
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">What people say</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(section.data.items as any[]).slice(0, 4).map((t, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">"{t.text}"</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: primaryColor }}>{t.name?.charAt(0)}</div>
              <span className="text-xs font-medium text-gray-700">{t.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (section.type === "faq") return wrap(
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
      {(section.data.items as any[]).map((faq, i) => (
        <details key={i} className="border border-gray-200 rounded-xl">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer">
            <span className="text-sm font-medium text-gray-900">{faq.q}</span>
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </summary>
          <p className="px-5 pb-4 text-sm text-gray-600">{faq.a}</p>
        </details>
      ))}
    </div>
  );

  if (section.type === "description") return wrap(
    <p className="text-gray-600 leading-relaxed">{section.data.body}</p>
  );

  if (section.type === "schedule") return wrap(
    <div className="space-y-3">
      {section.data.title && <h2 className="text-lg font-semibold text-gray-900">{section.data.title}</h2>}
      <div className="space-y-2">
        {(section.data.items as any[] || []).map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: primaryColor }}>{i + 1}</span>
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
            </div>
            <span className="text-xs text-gray-400">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (section.type === "event") return wrap(
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { icon: CalendarDays, label: "Date", value: section.data.date },
        { icon: Clock, label: "Time", value: section.data.time },
        { icon: MapPin, label: "Venue", value: section.data.venue },
        { icon: Users, label: "Capacity", value: section.data.capacity },
      ].filter(e => e.value).map((e, i) => (
        <div key={i} className="rounded-xl p-4 border border-gray-100 space-y-1" style={{ backgroundColor: secondaryColor }}>
          <e.icon className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
          <p className="text-[11px] text-gray-400 uppercase tracking-wide">{e.label}</p>
          <p className="text-sm font-semibold text-gray-900">{e.value}</p>
        </div>
      ))}
    </div>
  );

  if (section.type === "pricing") return wrap(
    <div className="space-y-3">
      {section.data.title && <h2 className="text-lg font-semibold text-gray-900">{section.data.title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          {(section.data.included as string[] || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />{item}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {(section.data.notIncluded as string[] || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
              <Minus className="h-4 w-4 flex-shrink-0" />{item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (section.type === "richtext") return wrap(
    <div className="space-y-2">
      {section.data.heading && <h2 className="text-lg font-semibold text-gray-900">{section.data.heading}</h2>}
      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{section.data.body}</p>
    </div>
  );

  if (section.type === "video") return wrap(
    <div className="space-y-2">
      {section.data.title && <h2 className="text-lg font-semibold text-gray-900">{section.data.title}</h2>}
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
        {section.data.url ? (
          <iframe src={section.data.url} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
        ) : (
          <div className="w-full h-full flex items-center justify-center gap-2 text-gray-400">
            <Play className="h-8 w-8" />
            <span className="text-sm">{editable ? "Click Edit to add a video URL" : "No video set"}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (section.type === "image") return wrap(
    <div className="space-y-2">
      {section.data.url
        ? <img src={section.data.url} className="w-full rounded-2xl object-cover max-h-96" alt={section.data.caption || ""} />
        : <div className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="h-6 w-6" />
            <span className="text-sm">{editable ? "Click Edit to add an image" : "No image set"}</span>
          </div>
      }
      {section.data.caption && <p className="text-sm text-gray-500 text-center">{section.data.caption}</p>}
    </div>
  );

  if (section.type === "gallery") return wrap(
    <div className="space-y-3">
      {section.data.title && <h2 className="text-lg font-semibold text-gray-900">{section.data.title}</h2>}
      {(section.data.images as string[] || []).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(section.data.images as string[]).map((src, i) => (
            <img key={i} src={src} className="w-full h-32 object-cover rounded-xl" alt="" />
          ))}
        </div>
      ) : (
        <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400">
          <LayoutGrid className="h-5 w-5" />
          <span className="text-sm">{editable ? "Click Edit to add images" : "No images"}</span>
        </div>
      )}
    </div>
  );

  if (section.type === "cta") return wrap(
    <div className="flex justify-center py-4">
      <button className="px-8 py-3 rounded-xl font-semibold text-sm transition-colors"
        style={section.data.style === "outline"
          ? { border: `2px solid ${primaryColor}`, color: primaryColor, backgroundColor: "transparent" }
          : { backgroundColor: primaryColor, color: "white" }}>
        {section.data.text || "Click here"}
      </button>
    </div>
  );

  return null;
};

// ─── WidgetEditDialog ─────────────────────────────────────────────────────────

const WidgetEditDialog = ({ section, onClose, onSave, primaryColor }: {
  section: ContentSection; onClose: () => void;
  onSave: (data: Record<string, any>) => void; primaryColor: string;
}) => {
  const [draft, setDraft] = useState<Record<string, any>>({ ...section.data });
  const patch = (key: string, value: any) => setDraft((d) => ({ ...d, [key]: value }));
  const patchListItem = (key: string, i: number, itemPatch: any) =>
    setDraft((d) => { const arr = [...(d[key] || [])]; arr[i] = typeof itemPatch === "object" ? { ...arr[i], ...itemPatch } : itemPatch; return { ...d, [key]: arr }; });
  const addListItem = (key: string, blank: any) =>
    setDraft((d) => ({ ...d, [key]: [...(d[key] || []), blank] }));
  const removeListItem = (key: string, i: number) =>
    setDraft((d) => { const arr = [...(d[key] || [])]; arr.splice(i, 1); return { ...d, [key]: arr }; });

  const label = SECTION_META[section.type]?.label ?? section.type;

  const renderForm = () => {
    switch (section.type) {
      case "description":
        return <Textarea value={draft.body || ""} onChange={(e) => patch("body", e.target.value)} rows={5} placeholder="Enter description…" />;

      case "richtext":
        return <div className="space-y-3">
          <Input value={draft.heading || ""} onChange={(e) => patch("heading", e.target.value)} placeholder="Heading (optional)" />
          <Textarea value={draft.body || ""} onChange={(e) => patch("body", e.target.value)} rows={6} placeholder="Body text…" />
        </div>;

      case "video":
        return <div className="space-y-3">
          <Input value={draft.title || ""} onChange={(e) => patch("title", e.target.value)} placeholder="Video title (optional)" />
          <Input value={draft.url || ""} onChange={(e) => patch("url", e.target.value)} placeholder="YouTube/Vimeo embed URL (e.g. https://www.youtube.com/embed/...)" />
          {draft.url && <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video"><iframe src={draft.url} className="w-full h-full" allowFullScreen /></div>}
        </div>;

      case "image":
        return <div className="space-y-3">
          <Input value={draft.url || ""} onChange={(e) => patch("url", e.target.value)} placeholder="Image URL" />
          {draft.url && <img src={draft.url} className="w-full rounded-xl object-cover max-h-60" alt="" />}
          <Input value={draft.caption || ""} onChange={(e) => patch("caption", e.target.value)} placeholder="Caption (optional)" />
        </div>;

      case "gallery":
        return <div className="space-y-3">
          <Input value={draft.title || ""} onChange={(e) => patch("title", e.target.value)} placeholder="Gallery title (optional)" />
          <div className="space-y-2">
            {(draft.images as string[] || []).map((url, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input value={url} onChange={(e) => patchListItem("images", i, e.target.value)} placeholder="Image URL" className="flex-1" />
                <button onClick={() => removeListItem("images", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => addListItem("images", "")} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"><Plus className="h-3.5 w-3.5" /> Add image URL</button>
          </div>
        </div>;

      case "cta":
        return <div className="space-y-3">
          <Input value={draft.text || ""} onChange={(e) => patch("text", e.target.value)} placeholder="Button text" />
          <Input value={draft.url || ""} onChange={(e) => patch("url", e.target.value)} placeholder="Link URL (optional)" />
          <div className="flex gap-2">
            {["primary", "outline"].map((s) => (
              <button key={s} onClick={() => patch("style", s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${draft.style === s ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600"}`}>
                {s === "primary" ? "Filled" : "Outline"}
              </button>
            ))}
          </div>
        </div>;

      case "social_proof":
      case "stats":
        return <div className="space-y-2">
          {(draft.items as any[] || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={item.value} onChange={(e) => patchListItem("items", i, { value: e.target.value })} placeholder="Value (e.g. 1,200+)" className="w-28" />
              <Input value={item.label} onChange={(e) => patchListItem("items", i, { label: e.target.value })} placeholder="Label" className="flex-1" />
              <button onClick={() => removeListItem("items", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => addListItem("items", { value: "", label: "" })} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"><Plus className="h-3.5 w-3.5" /> Add stat</button>
        </div>;

      case "highlights":
        return <div className="space-y-2">
          <Input value={draft.title || ""} onChange={(e) => patch("title", e.target.value)} placeholder="Section heading (e.g. What's included)" />
          {(draft.items as string[] || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={item} onChange={(e) => patchListItem("items", i, e.target.value)} placeholder="Feature item" className="flex-1" />
              <button onClick={() => removeListItem("items", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => addListItem("items", "")} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"><Plus className="h-3.5 w-3.5" /> Add item</button>
        </div>;

      case "testimonials":
        return <div className="space-y-3">
          {(draft.items as any[] || []).map((t, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                <Input value={t.name} onChange={(e) => patchListItem("items", i, { name: e.target.value })} placeholder="Name" className="flex-1" />
                <select value={t.rating} onChange={(e) => patchListItem("items", i, { rating: Number(e.target.value) })}
                  className="border border-gray-200 rounded-lg px-2 text-sm w-20">
                  {[5,4,3].map(n => <option key={n} value={n}>{n}★</option>)}
                </select>
                <button onClick={() => removeListItem("items", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
              <Textarea value={t.text} onChange={(e) => patchListItem("items", i, { text: e.target.value })} placeholder="Review text" rows={2} />
            </div>
          ))}
          <button onClick={() => addListItem("items", { name: "", rating: 5, text: "" })} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"><Plus className="h-3.5 w-3.5" /> Add testimonial</button>
        </div>;

      case "faq":
        return <div className="space-y-3">
          {(draft.items as any[] || []).map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex gap-2 items-start">
                <Input value={faq.q} onChange={(e) => patchListItem("items", i, { q: e.target.value })} placeholder="Question" className="flex-1" />
                <button onClick={() => removeListItem("items", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
              <Textarea value={faq.a} onChange={(e) => patchListItem("items", i, { a: e.target.value })} placeholder="Answer" rows={2} />
            </div>
          ))}
          <button onClick={() => addListItem("items", { q: "", a: "" })} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"><Plus className="h-3.5 w-3.5" /> Add Q&A</button>
        </div>;

      case "instructor":
      case "about":
        return <div className="space-y-3">
          <Input value={draft.image || ""} onChange={(e) => patch("image", e.target.value)} placeholder="Photo URL" />
          {draft.image && <img src={draft.image} className="w-16 h-16 rounded-full object-cover border" alt="" />}
          <Input value={draft.name || ""} onChange={(e) => patch("name", e.target.value)} placeholder="Name" />
          <Input value={draft.role || ""} onChange={(e) => patch("role", e.target.value)} placeholder="Role / Title" />
          <Input value={draft.credentials || ""} onChange={(e) => patch("credentials", e.target.value)} placeholder="Credentials (e.g. 12 yrs at Razorpay)" />
          <Textarea value={draft.bio || ""} onChange={(e) => patch("bio", e.target.value)} placeholder="Bio" rows={3} />
        </div>;

      case "schedule":
        return <div className="space-y-3">
          <Input value={draft.title || ""} onChange={(e) => patch("title", e.target.value)} placeholder="Section title (e.g. Curriculum)" />
          {(draft.items as any[] || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={item.label} onChange={(e) => patchListItem("items", i, { label: e.target.value })} placeholder="Module / session name" className="flex-1" />
              <Input value={item.detail} onChange={(e) => patchListItem("items", i, { detail: e.target.value })} placeholder="Duration / detail" className="w-36" />
              <button onClick={() => removeListItem("items", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => addListItem("items", { label: "", detail: "" })} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"><Plus className="h-3.5 w-3.5" /> Add item</button>
        </div>;

      case "event":
        return <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500 mb-1 block">Date</label><Input value={draft.date || ""} onChange={(e) => patch("date", e.target.value)} placeholder="e.g. 15 Jun 2025" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Time</label><Input value={draft.time || ""} onChange={(e) => patch("time", e.target.value)} placeholder="e.g. 10:00 AM – 1:00 PM IST" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Venue</label><Input value={draft.venue || ""} onChange={(e) => patch("venue", e.target.value)} placeholder="e.g. Online (Zoom)" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Capacity</label><Input value={draft.capacity || ""} onChange={(e) => patch("capacity", e.target.value)} placeholder="e.g. 50 seats" /></div>
          <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Registration Deadline</label><Input value={draft.registrationDeadline || ""} onChange={(e) => patch("registrationDeadline", e.target.value)} placeholder="e.g. 10 Jun 2025" /></div>
        </div>;

      case "pricing":
        return <div className="space-y-4">
          <Input value={draft.title || ""} onChange={(e) => patch("title", e.target.value)} placeholder="Section title (e.g. What's included)" />
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Included ✓</p>
            {(draft.included as string[] || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <Input value={item} onChange={(e) => patchListItem("included", i, e.target.value)} placeholder="Included item" className="flex-1" />
                <button onClick={() => removeListItem("included", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => addListItem("included", "")} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline mb-3"><Plus className="h-3.5 w-3.5" /> Add item</button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Not Included ✗</p>
            {(draft.notIncluded as string[] || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <Input value={item} onChange={(e) => patchListItem("notIncluded", i, e.target.value)} placeholder="Not included item" className="flex-1" />
                <button onClick={() => removeListItem("notIncluded", i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => addListItem("notIncluded", "")} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"><Plus className="h-3.5 w-3.5" /> Add item</button>
          </div>
        </div>;

      default:
        return <p className="text-sm text-gray-500">No editable fields for this widget type.</p>;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit: {label}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-2 space-y-3">{renderForm()}</div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)} style={{ backgroundColor: primaryColor }}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── PreviewField ─────────────────────────────────────────────────────────────

const PreviewField = ({ field }: { field: FormField }) => {
  if (field.fieldKind === "amount") {
    const af = field as AmountField;
    return (
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {af.type === "amount-fixed" && (
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <span className="pl-3 pr-3 py-2.5 text-sm text-gray-600 border-r border-gray-200 bg-gray-50">₹</span>
            <span className="px-3 py-2.5 text-sm font-semibold text-gray-900">{af.amount.toLocaleString("en-IN")}</span>
            <span className="ml-auto mr-3 text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5">Fixed</span>
          </div>
        )}
        {af.type === "amount-custom" && (
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <span className="pl-3 pr-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 bg-gray-50">₹</span>
            <input type="number" className="flex-1 px-3 py-2.5 text-sm focus:outline-none" placeholder="Enter amount" />
          </div>
        )}
        {af.type === "amount-item" && (
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{field.label}</p>
                {af.description && <p className="text-xs text-gray-500 mt-0.5">{af.description}</p>}
              </div>
              <span className="text-sm font-bold text-gray-900 flex-shrink-0">₹{af.amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-lg leading-none">−</button>
              <span className="text-sm w-6 text-center font-medium">1</span>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-lg leading-none">+</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const inf = field as InputField;
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
        {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {inf.type === "textarea" ? (
        <textarea rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder={field.placeholder} />
      ) : inf.type === "dropdown" ? (
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 bg-white">
          <span className="text-sm text-gray-400 flex-1">{field.placeholder || "Select..."}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      ) : inf.type === "date" ? (
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
          <span className="text-sm text-gray-400 flex-1">DD / MM / YYYY</span>
          <CalendarDays className="h-4 w-4 text-gray-400" />
        </div>
      ) : (
        <input
          type={inf.type === "email" ? "email" : inf.type === "phone" || inf.type === "number" ? "tel" : "text"}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
};

// ─── PageContactFooter ────────────────────────────────────────────────────────
// Contact Us + T&C + Razorpay footer shown at the bottom of every payment page.

interface PageContactFooterProps {
  merchantName: string;
  supportEmail: string;
  supportPhone: string;
  termsText: string;
  editable?: boolean;
  onUpdate?: (patch: { supportEmail?: string; supportPhone?: string; termsText?: string }) => void;
}

export const PageContactFooter = ({
  merchantName, supportEmail, supportPhone, termsText, editable = false, onUpdate,
}: PageContactFooterProps) => {
  return (
    <div className="border-t border-gray-100 pt-8 mt-6 space-y-6">
      {/* Contact Us */}
      <div>
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Contact Us:
        </p>
        <div className="space-y-2">
          {/* Email */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1">
              <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              {editable ? (
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => onUpdate?.({ supportEmail: e.target.value })}
                  placeholder="Enter support email"
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300"
                />
              ) : (
                <span className={`text-sm flex-1 ${supportEmail ? "text-gray-700" : "text-gray-300"}`}>
                  {supportEmail || "Enter support email"}
                </span>
              )}
            </div>
          </div>
          {!supportEmail && editable && (
            <p className="text-[11px] text-gray-400 pl-1">Please add your support email</p>
          )}
          {/* Phone */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-shrink-0">
              <span className="text-sm text-gray-500 whitespace-nowrap">🇮🇳 +91 (IN)</span>
            </div>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1">
              <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              {editable ? (
                <input
                  type="tel"
                  value={supportPhone}
                  onChange={(e) => onUpdate?.({ supportPhone: e.target.value })}
                  placeholder="Enter support phone"
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300"
                />
              ) : (
                <span className={`text-sm flex-1 ${supportPhone ? "text-gray-700" : "text-gray-300"}`}>
                  {supportPhone || "Enter support phone"}
                </span>
              )}
            </div>
          </div>
          {!supportPhone && editable && (
            <p className="text-[11px] text-gray-400 pl-1">Please add your support contact number</p>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div>
        {editable ? (
          <div className="space-y-1.5">
            <button className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" />
              Add Your Terms and Conditions
            </button>
            {termsText && (
              <Textarea
                value={termsText}
                onChange={(e) => onUpdate?.({ termsText: e.target.value })}
                placeholder="Enter your terms and conditions..."
                rows={3}
                className="text-xs resize-none mt-1"
              />
            )}
          </div>
        ) : termsText ? (
          <div className="text-xs text-gray-500 leading-relaxed">{termsText}</div>
        ) : null}

        {/* Mandatory consent text */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            You agree to share information entered on this page with{" "}
            <span className="font-semibold text-gray-700">{merchantName || "the merchant"}</span>{" "}
            (owner of this page) and Razorpay, adhering to applicable laws.
            These terms and conditions are mandatory and cannot be removed.
          </p>
        </div>
      </div>

      {/* Razorpay footer */}
      <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.968 0L6.5 17.344h7.246L9.863 30l14.17-17.344H16.79L21.437 0z" fill="#0066FF"/>
          </svg>
          <span className="text-xs font-semibold text-gray-500">Razorpay</span>
        </div>
        <p className="text-[11px] text-gray-400 text-center sm:text-right">
          Want to create a page like this for your business?{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Visit Razorpay Payment Pages
          </a>{" "}
          to get started!
        </p>
      </div>
    </div>
  );
};

export default PaymentPageEditor;
