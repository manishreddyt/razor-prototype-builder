import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, Link2, GraduationCap, Calendar, ShoppingBag, Heart, Monitor, Smartphone, ChevronLeft, X, Sparkles, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const COMPANY_LOGO = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=64&h=64&fit=crop";


const categories = [
  { label: "All Templates", icon: null, value: "all" },
  { label: "Education", icon: GraduationCap, value: "education" },
  { label: "Events", icon: Calendar, value: "events" },
  { label: "E-commerce", icon: ShoppingBag, value: "e-commerce" },
  { label: "Non-Profit", icon: Heart, value: "non-profit" },
];

type PreviewField = { label: string; placeholder: string; isAmount?: boolean; amount?: number; amountDesc?: string };
type TemplatePreviewConfig = {
  brandColor: string;
  buttonText: string;
  hero: { title: string; tagline: string; description: string };
  stats: Array<{ value: string; label: string }>;
  highlights: { title: string; items: string[] };
  about?: { image: string; name: string; role: string; bio: string };
  testimonials?: Array<{ name: string; text: string }>;
  fields: PreviewField[];
};

const PREVIEW_CONFIGS: Record<string, TemplatePreviewConfig> = {
  "School / College Fee Collection": {
    brandColor: "#1D4ED8",
    buttonText: "Pay Fees Now",
    hero: {
      title: "Student Fee Payment Portal",
      tagline: "Quick & secure fee collection — no queues, no cash",
      description: "Pay tuition fees, exam fees, hostel charges, and any other dues directly online. Get an instant GST-compliant receipt delivered to your email.",
    },
    stats: [
      { value: "15,000+", label: "Students enrolled" },
      { value: "₹0", label: "Convenience fee" },
      { value: "10+", label: "Payment modes" },
      { value: "Instant", label: "Receipt delivery" },
    ],
    highlights: {
      title: "Why pay online?",
      items: ["Accept any fee type in one place", "UPI, card, net banking — all accepted", "Instant GST-compliant receipt on email", "Partial payment & installment support", "Auto-reminders for upcoming due dates", "24/7 payment acceptance, no queues"],
    },
    about: {
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&crop=face",
      name: "Finance Department",
      role: "Accounts & Admissions Office",
      bio: "All payments are processed securely and credited within 24 hours. Contact fees@company.edu for queries.",
    },
    fields: [
      { label: "Fee Amount", isAmount: true, amount: 15000, amountDesc: "Academic year 2024–25 tuition fee", placeholder: "" },
      { label: "Student Full Name", placeholder: "Enter student's full name" },
      { label: "Student / Roll Number", placeholder: "e.g. STU2024001" },
      { label: "Class / Course", placeholder: "Select your class" },
      { label: "Fee Type", placeholder: "Select fee type" },
      { label: "Email Address", placeholder: "Receipt will be sent here" },
    ],
  },

  "Online Course Fee Collection": {
    brandColor: "#7C3AED",
    buttonText: "Enroll Now",
    hero: {
      title: "Full-Stack Web Development Bootcamp",
      tagline: "From complete beginner to job-ready in 12 weeks",
      description: "A rigorous, hands-on bootcamp that teaches you React, Node.js, PostgreSQL, and deployment. Built for people who want to switch careers or upskill fast.",
    },
    stats: [
      { value: "2,400+", label: "Students enrolled" },
      { value: "4.9★", label: "Average rating" },
      { value: "12 weeks", label: "Duration" },
      { value: "92%", label: "Placement rate" },
    ],
    highlights: {
      title: "What's included",
      items: ["60+ hours of live instructor-led sessions", "Unlimited doubt-clearing support", "6 real-world portfolio projects", "Certificate of completion", "1:1 mock interviews + resume review", "Lifetime alumni community access"],
    },
    about: {
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      name: "Rahul Sharma",
      role: "Lead Instructor & Founder",
      bio: "Ex-Razorpay senior engineer with 12 years of industry experience. Has trained 4,000+ developers and helped 500+ land their first tech job.",
    },
    testimonials: [
      { name: "Priya S.", text: "Switched from a non-tech background. Got a ₹12 LPA offer 3 weeks after completing the bootcamp!" },
      { name: "Arjun M.", text: "Best investment I've made. The mock interviews and resume prep were game-changing." },
    ],
    fields: [
      { label: "Course Fee", isAmount: true, amount: 29999, amountDesc: "Full-Stack Web Development Bootcamp — Batch 12", placeholder: "" },
      { label: "Full Name", placeholder: "Your full name" },
      { label: "Email Address", placeholder: "Course access will be sent here" },
      { label: "Phone Number", placeholder: "For WhatsApp updates" },
    ],
  },

  "Coaching Session Booking": {
    brandColor: "#059669",
    buttonText: "Book My Session",
    hero: {
      title: "1-on-1 Business Strategy Coaching",
      tagline: "Clarity, focus, and a real action plan — in one session",
      description: "Work directly with an experienced business coach to overcome challenges, validate your strategy, and unlock your next level of growth.",
    },
    stats: [
      { value: "500+", label: "Clients coached" },
      { value: "4.9★", label: "Average rating" },
      { value: "60 min", label: "Session duration" },
      { value: "48 hrs", label: "Response time" },
    ],
    highlights: {
      title: "What you get",
      items: ["Pre-session questionnaire for deep prep", "Full session recording sent to you", "Written summary + action items after", "Proven frameworks for growth decisions", "Email follow-up support for 2 weeks", "Flexible rescheduling with 24-hr notice"],
    },
    about: {
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
      name: "Meera Krishnan",
      role: "Business Coach & Consultant",
      bio: "Former McKinsey consultant. 15 years helping founders and executives unlock growth across 200+ companies. Certified ICF coach.",
    },
    testimonials: [
      { name: "Kartik T.", text: "One session with Meera was worth more than 3 months of self-doubt. Clear path forward, immediate action." },
      { name: "Divya R.", text: "I came in overwhelmed. I left with a prioritized 90-day plan. The ROI on this session was immediate." },
    ],
    fields: [
      { label: "Coaching Session", isAmount: true, amount: 4999, amountDesc: "60-minute 1-on-1 business strategy session via Zoom", placeholder: "" },
      { label: "Full Name", placeholder: "Your full name" },
      { label: "Email Address", placeholder: "Calendar invite sent here" },
      { label: "Phone / WhatsApp", placeholder: "+91 XXXXX XXXXX" },
      { label: "Session Focus", placeholder: "What do you want to work on?" },
    ],
  },

  "E-commerce Store": {
    brandColor: "#DC2626",
    buttonText: "Buy Now",
    hero: {
      title: "Premium Noise-Cancelling Headphones",
      tagline: "Studio-grade sound. Built for the real world.",
      description: "Experience deep bass, crystal-clear highs, and 30 hours of battery life in an ultra-light design. Perfect for work, travel, and everything in between.",
    },
    stats: [
      { value: "4.8★", label: "Rated by 8,000+ buyers" },
      { value: "30 hrs", label: "Battery life" },
      { value: "Free", label: "Shipping pan-India" },
      { value: "30 days", label: "Easy returns" },
    ],
    highlights: {
      title: "Product highlights",
      items: ["Active noise cancellation (ANC)", "40mm custom drivers for rich bass", "Foldable design with hard carry case", "Works with iOS, Android & Windows", "USB-C fast charge: 10 min = 3 hrs", "1-year manufacturer warranty"],
    },
    testimonials: [
      { name: "Rohan P.", text: "Best headphones under ₹5K. ANC blocks out my entire open office. Sound quality is exceptional." },
      { name: "Shreya M.", text: "Battery life is insane. Charged once and used it for 4 days straight. Super comfortable too." },
    ],
    fields: [
      { label: "Headphones XPro 3.0", isAmount: true, amount: 4999, amountDesc: "Premium Noise-Cancelling Headphones — includes carry case & USB-C cable", placeholder: "" },
      { label: "Full Name", placeholder: "Name for shipping label" },
      { label: "Email Address", placeholder: "Order confirmation sent here" },
      { label: "Phone Number", placeholder: "For delivery updates" },
      { label: "Colour", placeholder: "Choose a colour" },
      { label: "Delivery Address", placeholder: "Full delivery address with pincode" },
    ],
  },

  "Event Booking": {
    brandColor: "#D97706",
    buttonText: "Register Now",
    hero: {
      title: "Growth Summit 2025 — Mumbai",
      tagline: "India's premier conference for founders and business builders",
      description: "Two days of high-signal talks, workshops, and networking with 1,500+ founders, investors, and operators. Actionable insights you can implement immediately.",
    },
    stats: [
      { value: "1,500+", label: "Attendees" },
      { value: "40+", label: "Speakers" },
      { value: "Dec 14–15", label: "Mumbai" },
      { value: "3", label: "Tracks" },
    ],
    highlights: {
      title: "What's included",
      items: ["Access to all keynotes & panel sessions", "Hands-on workshops (limited seats)", "Curated 1:1 networking sessions", "Summit playbook & speaker slide decks", "Lunch, tea & evening networking dinner", "Recording access for 3 months"],
    },
    testimonials: [
      { name: "Ankit S.", text: "Best conference I've attended in years. Every session was packed with actionable insights. Met my co-founder here!" },
      { name: "Ritu K.", text: "Quality of speakers and hallway conversations is unmatched. Worth every rupee." },
    ],
    fields: [
      { label: "Standard Pass", isAmount: true, amount: 2999, amountDesc: "Growth Summit 2025 — Dec 14–15 · Mumbai · NSCI Dome", placeholder: "" },
      { label: "Full Name", placeholder: "Name for event badge" },
      { label: "Email Address", placeholder: "Event pass sent here" },
      { label: "Phone Number", placeholder: "For event updates" },
      { label: "Company / Organisation", placeholder: "For badge & networking" },
    ],
  },

  "Non-Profit Donation": {
    brandColor: "#BE185D",
    buttonText: "Donate Now",
    hero: {
      title: "Help 10,000 Children Access Quality Education",
      tagline: "Your contribution changes lives — one child at a time",
      description: "In rural India, millions of children drop out of school due to poverty. We provide free schooling, meals, and mentorship. 100% of your donation goes directly to the children.",
    },
    stats: [
      { value: "8,400+", label: "Children supported" },
      { value: "12 years", label: "On the ground" },
      { value: "3 states", label: "UP, Bihar, Jharkhand" },
      { value: "₹3.2 Cr", label: "Raised last year" },
    ],
    highlights: {
      title: "Your donation funds",
      items: ["Free schooling for out-of-school children", "Daily nutritious mid-day meals", "Trained teachers and mentors", "Educational materials & digital access", "80G tax exemption for all donations", "Monthly impact reports sent to donors"],
    },
    about: {
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face",
      name: "Sunita Rao",
      role: "Founder & Executive Director",
      bio: "Former IAS officer who left a 20-year career to build this NGO. NASSCOM Social Innovation Award winner. Trusted by 8,000+ donors across India.",
    },
    testimonials: [
      { name: "Kavya R.", text: "I've been donating monthly for 2 years. The impact reports are detailed and honest." },
      { name: "Deepak J.", text: "Transparent, trustworthy, genuinely impactful. Got my 80G receipt instantly." },
    ],
    fields: [
      { label: "Donation Amount", placeholder: "Enter amount you wish to donate", isAmount: false },
      { label: "Full Name", placeholder: "Name for 80G receipt" },
      { label: "Email Address", placeholder: "80G receipt sent here" },
      { label: "Phone Number", placeholder: "Optional" },
      { label: "PAN Number (for 80G)", placeholder: "ABCDE1234F" },
    ],
  },
};

const templates = [
  {
    title: "School / College Fee Collection",
    category: "Education",
    desc: "A streamlined fee collection page for schools, colleges, and educational institutions.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=600&fit=crop",
  },
  {
    title: "Online Course Fee Collection",
    category: "Education",
    desc: "An enrollment page for online courses, bootcamps, certification programs, and coaching classes.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop",
  },
  {
    title: "Coaching Session Booking",
    category: "Education",
    desc: "Book 1:1 coaching sessions, mentorship calls, or consulting appointments with integrated scheduling.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=600&fit=crop",
  },
  {
    title: "E-commerce Store",
    category: "E-commerce",
    desc: "A versatile product sale page for any online store — fashion, electronics, home décor, accessories, and more.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=600&fit=crop",
  },
  {
    title: "Event Booking",
    category: "Events",
    desc: "A professional event registration page for conferences, workshops, seminars, meetups, and community gatherings.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop",
  },
  {
    title: "Non-Profit Donation",
    category: "Non-Profit",
    desc: "A heartfelt donation collection page for NGOs, charities, social causes, and community projects.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=900&h=600&fit=crop",
  },
];

type Template = typeof templates[0];

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  Education: "Online Course",
  "E-commerce": "Product",
  Events: "Event",
  "Non-Profit": "Donation",
};

// ── Payment panel (mirrors PaymentPanel in PaymentPageEditor) ─────────────────

const PreviewPaymentPanel = ({ config, compact = false }: { config: TemplatePreviewConfig; compact?: boolean }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className={`${compact ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4"} border-b border-gray-100`}>
      <h3 className={`${compact ? "text-base" : "text-xl"} font-bold text-gray-900`}>Payment Details</h3>
      <div className="w-8 h-0.5 mt-1.5" style={{ backgroundColor: config.brandColor }} />
    </div>
    <div className={`${compact ? "px-4 py-3" : "px-6 py-4"} space-y-${compact ? "3" : "4"}`}>
      {config.fields.map((f) => (
        <div key={f.label}>
          <label className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-gray-600 block mb-1`}>
            {f.label}<span className="text-red-500 ml-0.5">*</span>
          </label>
          {f.isAmount && f.amount != null ? (
            <div>
              <div className={`flex items-center border border-gray-200 rounded-lg overflow-hidden ${compact ? "h-8" : ""}`}>
                <span className={`${compact ? "pl-2.5 pr-2 py-2 text-xs" : "pl-3 pr-3 py-2.5 text-sm"} text-gray-600 border-r border-gray-200 bg-gray-50`}>₹</span>
                <span className={`${compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"} font-semibold text-gray-900`}>{f.amount!.toLocaleString("en-IN")}</span>
                <span className="ml-auto mr-3 text-[10px] border rounded px-1.5 py-0.5" style={{ color: config.brandColor, borderColor: config.brandColor + "50" }}>Fixed</span>
              </div>
              {f.amountDesc && <p className="text-[10px] text-gray-400 mt-0.5">{f.amountDesc}</p>}
            </div>
          ) : (
            <input
              readOnly
              className={`w-full border border-gray-200 rounded-lg ${compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"} text-gray-400 bg-white focus:outline-none`}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}
    </div>
    <div className={`${compact ? "px-4 pb-4 pt-2" : "px-6 pb-6 pt-2"} border-t border-gray-100 space-y-3`}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking"].map((l) => (
          <span key={l} className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5 font-medium">{l}</span>
        ))}
      </div>
      <button className={`w-full text-white rounded-lg ${compact ? "py-2.5 text-xs" : "py-3 text-sm"} font-semibold`} style={{ backgroundColor: config.brandColor }}>
        {config.buttonText}
      </button>
      <p className="text-center text-[11px] text-gray-400">
        Powered by <span className="font-semibold" style={{ color: "#0066FF" }}>Razorpay</span>
      </p>
    </div>
  </div>
);

// ── Desktop renderer (mirrors EditorCanvas desktop layout) ────────────────────

const TemplatePageDesktop = ({ template, config }: { template: Template; config: TemplatePreviewConfig }) => (
  <div className="bg-white min-h-full">
    {/* Nav — matches EditorCanvas sticky nav */}
    <div className="border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
        <div className="flex items-center gap-3">
          <img src={COMPANY_LOGO} alt="logo" className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
          <span className="font-semibold text-sm text-gray-900">Company</span>
        </div>
      </div>
    </div>

    {/* Two-column grid — matches EditorCanvas desktop grid */}
    <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-[1fr_420px] gap-10 items-start">
      {/* LEFT: content sections */}
      <div className="space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: config.brandColor + "18", color: config.brandColor }}>
            <Sparkles className="h-3 w-3" />{CATEGORY_LABELS[template.category] ?? template.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{config.hero.title}</h1>
          <p className="text-base font-medium" style={{ color: config.brandColor }}>{config.hero.tagline}</p>
          <p className="text-gray-600 leading-relaxed max-w-xl">{config.hero.description}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100">
          {config.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">{config.highlights.title}</h2>
          <div className="grid grid-cols-2 gap-3">
            {config.highlights.items.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        {config.about && (
          <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-5">
            <img src={config.about.image} alt={config.about.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: config.brandColor }}>
                {template.category === "Education" ? "Your Instructor" : "Your Provider"}
              </p>
              <h3 className="text-base font-semibold text-gray-900">{config.about.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{config.about.role}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{config.about.bio}</p>
            </div>
          </div>
        )}

        {/* Testimonials */}
        {config.testimonials && config.testimonials.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">What people say</h2>
            <div className="grid grid-cols-2 gap-4">
              {config.testimonials.map((t) => (
                <div key={t.name} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: config.brandColor }}>
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: payment panel */}
      <div className="sticky top-6">
        <PreviewPaymentPanel config={config} />
      </div>
    </div>
  </div>
);

// ── Mobile renderer (mirrors EditorCanvas mobile stepped layout) ──────────────

const TemplatePageMobile = ({
  template, config, mobileStep, setMobileStep,
}: {
  template: Template;
  config: TemplatePreviewConfig;
  mobileStep: "details" | "payment";
  setMobileStep: (s: "details" | "payment") => void;
}) => (
  <div className="w-[340px] bg-white rounded-[2.5rem] border-[5px] border-gray-800 shadow-2xl overflow-hidden flex flex-col">
    {/* Notch */}
    <div className="bg-gray-800 h-7 flex items-center justify-center flex-shrink-0">
      <div className="w-20 h-1.5 rounded-full bg-gray-600" />
    </div>
    {/* Nav */}
    <div className="border-b border-gray-100 px-4 h-11 flex items-center flex-shrink-0 bg-white">
      <div className="flex items-center gap-2">
        <img src={COMPANY_LOGO} alt="logo" className="w-6 h-6 rounded-lg object-cover border border-gray-100" />
        <span className="font-semibold text-xs text-gray-900">Company</span>
      </div>
    </div>

    <div className="overflow-y-auto flex-1 flex flex-col" style={{ maxHeight: 580 }}>
      {mobileStep === "details" ? (
        <>
          <div className="flex-1 px-4 py-5 pb-20 space-y-5">
            {/* Hero */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: config.brandColor + "18", color: config.brandColor }}>
                <Sparkles className="h-2.5 w-2.5" />{CATEGORY_LABELS[template.category] ?? template.category}
              </span>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{config.hero.title}</h1>
              <p className="text-xs font-medium" style={{ color: config.brandColor }}>{config.hero.tagline}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{config.hero.description}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 py-3 border-y border-gray-100">
              {config.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-sm font-bold text-gray-900">{s.value}</div>
                  <div className="text-[10px] text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900">{config.highlights.title}</h2>
              <div className="space-y-2">
                {config.highlights.items.slice(0, 5).map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-emerald-600" />
                    </div>
                    <span className="text-xs text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            {config.about && (
              <div className="bg-gray-50 rounded-xl p-3.5 flex items-start gap-3">
                <img src={config.about.image} alt={config.about.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm" />
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: config.brandColor }}>
                    {template.category === "Education" ? "Your Instructor" : "Your Provider"}
                  </p>
                  <p className="text-xs font-semibold text-gray-900">{config.about.name}</p>
                  <p className="text-[10px] text-gray-500">{config.about.role}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky proceed button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <button
              onClick={() => setMobileStep("payment")}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: config.brandColor }}
            >
              Proceed to Payment →
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 px-4 pt-4 pb-6">
          <button
            onClick={() => setMobileStep("details")}
            className="flex items-center gap-1.5 text-xs text-gray-500 mb-4"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to details
          </button>
          <PreviewPaymentPanel config={config} compact />
        </div>
      )}
    </div>

    {/* Home bar */}
    <div className="h-5 bg-white flex items-center justify-center flex-shrink-0">
      <div className="w-24 h-1 rounded-full bg-gray-300" />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileStep, setMobileStep] = useState<"details" | "payment">("details");

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category.toLowerCase() === activeCategory);

  const openPreview = (t: Template) => {
    setPreviewDevice("desktop");
    setMobileStep("details");
    setPreviewTemplate(t);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages/editor")} className="gap-2">
          <Link2 className="h-4 w-4" /> Skip & create blank
        </Button>
      </div>

      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Payment Page</h1>
          <p className="text-sm text-muted-foreground mt-1">Start from a template or create a blank page.</p>
        </div>

        {/* Category filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat.value
                    ? "border-primary text-primary bg-accent"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat.icon && <cat.icon className="h-3.5 w-3.5" />}
                {cat.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground flex-shrink-0">{filtered.length} templates</span>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div key={t.title} className="blade-card overflow-hidden group flex flex-col">
              {/* Thumbnail */}
              <div className="h-44 overflow-hidden flex-shrink-0">
                <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-sm leading-snug mb-2">{t.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-2">{t.desc}</p>
                <span className="inline-block self-start px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-medium text-primary border border-primary/20 mb-3">{t.category}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1" onClick={() => openPreview(t)}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs flex-1" onClick={() => navigate(`/payment-pages/editor?template=${encodeURIComponent(t.title)}`)}>
                    Use Template <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col [&>button.absolute]:hidden">
          {/* Dialog header */}
          <div className="relative flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
            <div>
              {previewTemplate && PREVIEW_CONFIGS[previewTemplate.title] ? (
                <>
                  <h2 className="font-semibold text-foreground text-sm leading-snug">{PREVIEW_CONFIGS[previewTemplate.title].hero.title}</h2>
                  <p className="text-[10px] text-muted-foreground">{previewTemplate.title} · {previewTemplate.category}</p>
                </>
              ) : (
                <>
                  <h2 className="font-semibold text-foreground text-sm">{previewTemplate?.title}</h2>
                  <p className="text-xs text-muted-foreground">{previewTemplate?.category}</p>
                </>
              )}
            </div>
            {/* Centre: device toggle */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center border border-border rounded-md overflow-hidden bg-background">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 transition-colors ${previewDevice === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setPreviewDevice("mobile"); setMobileStep("details"); }}
                className={`p-1.5 transition-colors ${previewDevice === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => { setPreviewTemplate(null); navigate(`/payment-pages/editor?template=${encodeURIComponent(previewTemplate!.title)}`); }}
              >
                Use Template <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preview area */}
          <div className={`flex-1 overflow-auto ${previewDevice === "mobile" ? "bg-muted/30 flex items-start justify-center py-6" : "bg-background"}`}>
            {previewTemplate && (() => {
              const cfg = PREVIEW_CONFIGS[previewTemplate.title];
              if (!cfg) return null;
              return previewDevice === "desktop"
                ? <TemplatePageDesktop template={previewTemplate} config={cfg} />
                : <TemplatePageMobile template={previewTemplate} config={cfg} mobileStep={mobileStep} setMobileStep={setMobileStep} />;
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePaymentPage;
