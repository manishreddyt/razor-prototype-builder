import {
  Globe, GraduationCap, Briefcase, Heart, ShoppingBag, LayoutGrid,
  BookOpen, Video, UserCheck, Calendar, Users, Store, Gift, FileText, CreditCard,
} from "lucide-react";
import { ProductsConfig } from "@/types/products";
import { ContactFormConfig } from "@/types/leads";
import { productFocusedTemplates } from "./productTemplates";

export type SectionType =
  | "hero" | "about" | "services" | "features" | "pricing"
  | "testimonials" | "google-reviews" | "faq" | "team" | "gallery"
  | "stats" | "cta-banner" | "contact-form" | "curriculum"
  | "schedule" | "speakers" | "newsletter" | "clients" | "portfolio"
  | "impact" | "donation" | "products" | "video-embed" | "countdown" | "biolink";

export interface SectionData {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
  data: Record<string, any>;
}

export interface PageData {
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  heroCta: string;
  bannerImage: string;
  sections: SectionData[];
}

export interface CheckoutFormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "textarea" | "number";
  required: boolean;
  placeholder: string;
  options?: string[]; // for select type
}

export interface CheckoutConfig {
  enabled: boolean;
  amount: number;
  amountType: "fixed" | "custom";
  currency: string;
  buttonText: string;
  successMessage: string;
  redirectUrl: string;
  collectAddress: boolean;
  sendReceipt: boolean;
  gstEnabled: boolean;
  formFields: CheckoutFormField[];
  /** Product features/highlights shown on checkout left side */
  highlights: string[];
}

export interface CustomPage {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sections: SectionData[];
  order: number;
}

export interface TemplateData {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon: any;
  /** "standard" (default) = multi-page site; "payment-page" = single two-column payment page */
  layout?: "standard" | "payment-page";
  pages: string[];
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  heroCta: string;
  bannerImage: string;
  sections: SectionData[];
  /** Per-page content. Key = page name. "Home" maps to the top-level hero/sections. */
  pagesData?: Record<string, PageData>;
  /** Checkout/payment configuration */
  checkout?: CheckoutConfig;
  /** Products configuration */
  productsConfig?: ProductsConfig;
  /** Contact form configuration */
  contactForm?: ContactFormConfig;
  /** Biolink configuration */
  biolinkConfig?: Partial<import("@/types/biolink").BiolinkProfile>;
  /** Custom pages beyond template pages */
  customPages?: CustomPage[];
}

const makeId = () => `s_${Math.random().toString(36).slice(2, 8)}`;

// ──────────────── Reusable section factories ────────────────

const heroSection = (): SectionData => ({
  id: makeId(), type: "hero", label: "Hero Banner", visible: true,
  data: {},
});

const aboutSection = (heading = "About Us", text = "We are passionate about delivering exceptional value. Our team combines years of experience with cutting-edge innovation to help you achieve your goals."): SectionData => ({
  id: makeId(), type: "about", label: "About", visible: true,
  data: { heading, text, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" },
});

const servicesSection = (items = [
  { title: "Strategy Consulting", desc: "Expert advice to grow your business.", icon: "💡" },
  { title: "Digital Marketing", desc: "Reach your audience with data-driven campaigns.", icon: "📈" },
  { title: "Product Design", desc: "Beautiful, user-centric design solutions.", icon: "🎨" },
  { title: "Development", desc: "Scalable web and mobile applications.", icon: "⚙️" },
]): SectionData => ({
  id: makeId(), type: "services", label: "Services", visible: true,
  data: { heading: "Our Services", items },
});

const featuresSection = (items = [
  { title: "Lightning Fast", desc: "Optimized for speed and performance.", icon: "⚡" },
  { title: "Secure", desc: "Enterprise-grade security built in.", icon: "🔒" },
  { title: "Scalable", desc: "Grows with your business needs.", icon: "📊" },
]): SectionData => ({
  id: makeId(), type: "features", label: "Features", visible: true,
  data: { heading: "Why Choose Us", items },
});

const pricingSection = (tiers = [
  { name: "Basic", price: "₹999", period: "/mo", features: ["Access to content", "Email support", "1 month access"], highlighted: false },
  { name: "Pro", price: "₹2,999", period: "/mo", features: ["Everything in Basic", "1:1 mentorship", "Certificate", "Lifetime access"], highlighted: true },
  { name: "Premium", price: "₹4,999", period: "/mo", features: ["Everything in Pro", "Priority support", "Community access", "Bonus materials"], highlighted: false },
]): SectionData => ({
  id: makeId(), type: "pricing", label: "Pricing", visible: true,
  data: { heading: "Pricing Plans", tiers },
});

const testimonialsSection = (items = [
  { name: "Priya Sharma", text: "Amazing experience! Completely transformed my business.", rating: 5, avatar: "PS" },
  { name: "Rahul Mehta", text: "Professional, reliable, and truly impactful.", rating: 5, avatar: "RM" },
  { name: "Ananya Gupta", text: "Worth every penny. Highly recommend to everyone.", rating: 4, avatar: "AG" },
]): SectionData => ({
  id: makeId(), type: "testimonials", label: "Testimonials", visible: true,
  data: { heading: "What People Say", items },
});

const googleReviewsSection = (): SectionData => ({
  id: makeId(), type: "google-reviews", label: "Google Reviews", visible: false,
  data: {
    heading: "Google Reviews",
    overallRating: 4.8,
    totalReviews: 127,
    reviews: [
      { name: "Vikram Singh", text: "Excellent service and great communication throughout.", rating: 5, date: "2 weeks ago" },
      { name: "Meera Patel", text: "Very professional. Would definitely recommend.", rating: 5, date: "1 month ago" },
      { name: "Arjun Reddy", text: "Good quality work. Delivered on time.", rating: 4, date: "2 months ago" },
    ],
  },
});

const faqSection = (items = [
  { q: "How do I get started?", a: "Simply click the Get Started button and follow the onboarding steps." },
  { q: "Is there a refund policy?", a: "Yes, we offer a full refund within 7 days of purchase." },
  { q: "Do you offer customer support?", a: "Yes, we provide 24/7 support via email and live chat." },
]): SectionData => ({
  id: makeId(), type: "faq", label: "FAQ", visible: true,
  data: { heading: "Frequently Asked Questions", items },
});

const teamSection = (members = [
  { name: "Arun Kumar", role: "Founder & CEO", avatar: "AK", bio: "10+ years building digital products." },
  { name: "Sneha Iyer", role: "Head of Design", avatar: "SI", bio: "Award-winning UX/UI designer." },
  { name: "Rohan Das", role: "Lead Developer", avatar: "RD", bio: "Full-stack engineer & architect." },
]): SectionData => ({
  id: makeId(), type: "team", label: "Team", visible: true,
  data: { heading: "Meet Our Team", members },
});

const gallerySection = (images = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
]): SectionData => ({
  id: makeId(), type: "gallery", label: "Gallery", visible: false,
  data: { heading: "Gallery", images },
});

const statsSection = (items = [
  { value: "500+", label: "Happy Clients" },
  { value: "50+", label: "Projects Completed" },
  { value: "10+", label: "Years Experience" },
  { value: "24/7", label: "Support Available" },
]): SectionData => ({
  id: makeId(), type: "stats", label: "Stats", visible: true,
  data: { items },
});

const ctaBannerSection = (heading = "Ready to Get Started?", text = "Join thousands of satisfied customers today.", buttonText = "Start Now"): SectionData => ({
  id: makeId(), type: "cta-banner", label: "CTA Banner", visible: true,
  data: { heading, text, buttonText },
});

const contactFormSection = (overrides?: { heading?: string; submitText?: string; fields?: any[] }): SectionData => ({
  id: makeId(), type: "contact-form", label: "Contact Form", visible: true,
  data: {
    heading: overrides?.heading || "Get in Touch",
    fields: overrides?.fields || [
      { label: "Full Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Phone", type: "tel", required: false },
      { label: "Message", type: "textarea", required: true },
    ],
    submitText: overrides?.submitText || "Send Message",
  },
});

const curriculumSection = (modules = [
  { title: "Module 1: Introduction", lessons: ["Getting Started", "Overview", "Setup & Tools"], duration: "2 hours" },
  { title: "Module 2: Fundamentals", lessons: ["Core Concepts", "Hands-on Practice", "Quiz"], duration: "4 hours" },
  { title: "Module 3: Advanced Topics", lessons: ["Deep Dive", "Real-World Projects", "Final Assessment"], duration: "6 hours" },
]): SectionData => ({
  id: makeId(), type: "curriculum", label: "Curriculum", visible: true,
  data: { heading: "Course Curriculum", modules },
});

const scheduleSection = (events = [
  { time: "10:00 AM", title: "Registration & Welcome", speaker: "" },
  { time: "10:30 AM", title: "Keynote Session", speaker: "Dr. Arun Kumar" },
  { time: "12:00 PM", title: "Workshop: Hands-on Lab", speaker: "Sneha Iyer" },
  { time: "2:00 PM", title: "Panel Discussion", speaker: "Multiple Speakers" },
  { time: "4:00 PM", title: "Networking & Closing", speaker: "" },
]): SectionData => ({
  id: makeId(), type: "schedule", label: "Schedule", visible: true,
  data: { heading: "Event Schedule", events },
});

const speakersSection = (speakers = [
  { name: "Dr. Arun Kumar", title: "AI Researcher", avatar: "AK", bio: "Leading expert in machine learning." },
  { name: "Sneha Iyer", title: "UX Director", avatar: "SI", bio: "Design thinking evangelist." },
]): SectionData => ({
  id: makeId(), type: "speakers", label: "Speakers", visible: true,
  data: { heading: "Our Speakers", speakers },
});

const newsletterSection = (): SectionData => ({
  id: makeId(), type: "newsletter", label: "Newsletter", visible: false,
  data: { heading: "Stay Updated", text: "Subscribe to our newsletter for the latest updates.", buttonText: "Subscribe" },
});

const clientsSection = (names = ["Tata", "Infosys", "Wipro", "Reliance", "Flipkart", "Zomato"]): SectionData => ({
  id: makeId(), type: "clients", label: "Clients / Logos", visible: true,
  data: { heading: "Trusted By", names },
});

const portfolioSection = (items = [
  { title: "E-commerce Redesign", category: "Design", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
  { title: "Mobile Banking App", category: "Development", image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop" },
  { title: "Brand Identity", category: "Branding", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop" },
  { title: "SaaS Dashboard", category: "UI/UX", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
]): SectionData => ({
  id: makeId(), type: "portfolio", label: "Portfolio", visible: true,
  data: { heading: "Our Work", items },
});

const impactSection = (): SectionData => ({
  id: makeId(), type: "impact", label: "Impact Stories", visible: true,
  data: {
    heading: "Our Impact",
    stories: [
      { title: "Clean Water for 500 Villages", text: "Installed water purification systems across rural India.", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop" },
      { title: "Education for 10,000 Children", text: "Built schools and provided scholarships in underserved areas.", image: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?w=400&h=300&fit=crop" },
    ],
  },
});

const donationSection = (): SectionData => ({
  id: makeId(), type: "donation", label: "Donation", visible: true,
  data: {
    heading: "Make a Difference",
    text: "Your contribution helps us continue our mission.",
    amounts: ["₹500", "₹1,000", "₹2,500", "₹5,000"],
    goal: "₹10,00,000",
    raised: "₹7,50,000",
  },
});

const productsSection = (items: { title: string; price: string; image: string; badge: string; desc?: string }[] = [
  { title: "Premium T-Shirt", price: "₹899", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop", badge: "Best Seller" },
  { title: "Laptop Sleeve", price: "₹1,299", image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=300&fit=crop", badge: "" },
  { title: "Wireless Earbuds", price: "₹2,499", image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop", badge: "New" },
  { title: "Notebook Set", price: "₹499", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop", badge: "" },
]): SectionData => ({
  id: makeId(), type: "products", label: "Products", visible: true,
  data: { heading: "Shop Our Products", items },
});

const videoEmbedSection = (url = "https://www.youtube.com/embed/dQw4w9WgXcQ"): SectionData => ({
  id: makeId(), type: "video-embed", label: "Video", visible: false,
  data: { heading: "Watch Our Story", url },
});

const countdownSection = (date = "2026-04-15T10:00:00"): SectionData => ({
  id: makeId(), type: "countdown", label: "Countdown", visible: true,
  data: { heading: "Event Starts In", targetDate: date },
});

const biolinkSection = (): SectionData => ({
  id: makeId(), type: "biolink", label: "Biolink Profile", visible: true,
  data: {
    // This section uses biolinkConfig from SmartPageSite instead of local data
    // The data field is kept minimal for compatibility
  },
});

// ──────────────── CATEGORIES ────────────────

export const categories = [
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "nonprofit", label: "Non-Profit", icon: Heart },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "all", label: "All", icon: LayoutGrid },
];

// ──────────────── Default checkout config factory ────────────────

const defaultCheckoutFields = (): CheckoutFormField[] => [
  { id: "f_name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
  { id: "f_email", label: "Email", type: "email", required: true, placeholder: "Enter your email" },
  { id: "f_phone", label: "Phone", type: "phone", required: false, placeholder: "Enter your phone number" },
];

export const createCheckoutConfig = (
  amount: number,
  buttonText = "Pay Now",
  highlights: string[] = [],
  extraFields: CheckoutFormField[] = [],
  overrides: Partial<CheckoutConfig> = {},
): CheckoutConfig => ({
  enabled: true,
  amount,
  amountType: "fixed",
  currency: "INR",
  buttonText,
  successMessage: "Payment successful! You'll receive a confirmation email shortly.",
  redirectUrl: "",
  collectAddress: false,
  sendReceipt: true,
  gstEnabled: true,
  formFields: [...defaultCheckoutFields(), ...extraFields],
  highlights,
  ...overrides,
});

// ──────────────── FULL TEMPLATES ────────────────


export const templates: TemplateData[] = [
  // ─── General ───
  {
    id: "portfolio", title: "Personal Portfolio", desc: "Showcase your work, bio, and contact info with a stunning portfolio.", category: "general", icon: Users,
    pages: ["Home", "About", "Portfolio"],
    heroTitle: "Hi, I'm Alex 👋", heroTagline: "Designer, Developer & Creative Thinker",
    heroDescription: "I craft beautiful digital experiences that combine aesthetics with functionality. Let's build something amazing together.",
    heroCta: "View My Work", bannerImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection("About Me", "I'm a multi-disciplinary designer with 8+ years of experience creating brands, products, and digital experiences for startups and Fortune 500 companies."), portfolioSection(), statsSection([{ value: "50+", label: "Projects" }, { value: "30+", label: "Clients" }, { value: "8", label: "Years" }, { value: "12", label: "Awards" }]), testimonialsSection(), newsletterSection(), googleReviewsSection()],
  },
  {
    id: "business", title: "Business Website", desc: "Professional company website with services, team, and contact pages.", category: "general", icon: Briefcase,
    pages: ["Home", "About", "Services", "Team"],
    heroTitle: "Grow Your Business", heroTagline: "Strategic solutions for modern enterprises",
    heroDescription: "We help businesses scale with data-driven strategies, innovative design, and robust technology solutions.",
    heroCta: "Get a Free Consultation", bannerImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection(), servicesSection(), featuresSection(), statsSection(), teamSection(), clientsSection(), testimonialsSection(), googleReviewsSection(), faqSection(), ctaBannerSection(), newsletterSection(), gallerySection()],
  },
  {
    id: "biolink", title: "Bio Link Page", desc: "Single-page link hub perfect for social bios and creators.", category: "general", icon: CreditCard,
    pages: ["Link Page"],
    heroTitle: "@yourname", heroTagline: "Creator • Educator • Entrepreneur",
    heroDescription: "All my important links in one place.",
    heroCta: "Latest Video →", bannerImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=300&fit=crop",
    sections: [biolinkSection()],
  },
  {
    id: "event", title: "Event Landing", desc: "Promote events with countdown, speakers, and registration.", category: "general", icon: Calendar,
    pages: ["Home", "Schedule", "Speakers", "Register"],
    heroTitle: "TechSummit 2026", heroTagline: "India's Largest Technology Conference",
    heroDescription: "Join 5,000+ professionals for 2 days of talks, workshops, and networking. April 15-16, 2026 — Bangalore.",
    heroCta: "Register Now", bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop",
    sections: [heroSection(), countdownSection(), speakersSection(), scheduleSection(), statsSection([{ value: "5000+", label: "Attendees" }, { value: "40+", label: "Speakers" }, { value: "20+", label: "Workshops" }, { value: "2", label: "Days" }]), testimonialsSection([{ name: "Vikram S.", text: "Best tech conference in India. The networking alone is worth it.", rating: 5, avatar: "VS" }, { name: "Meera P.", text: "Incredible speakers and well-organized sessions.", rating: 5, avatar: "MP" }, { name: "Arjun R.", text: "Learned so much. Already booked for next year.", rating: 5, avatar: "AR" }]), faqSection([{ q: "Where is the venue?", a: "Bangalore International Exhibition Centre (BIEC), Bangalore." }, { q: "Is food included?", a: "Yes, lunch and refreshments are provided on both days." }, { q: "Can I get a refund?", a: "Full refund available up to 7 days before the event." }]), gallerySection(), googleReviewsSection()],
  },

  // ─── Payment Page: School Fee Collection ───
  {
    id: "pay-school-fee",
    layout: "payment-page" as const,
    title: "School Fee Collection",
    desc: "Single-page fee collection for schools and colleges — admission, tuition, exam, or activity fees with Razorpay checkout.",
    category: "education",
    icon: GraduationCap,
    pages: ["Home"],
    heroTitle: "School / College Fee Payment",
    heroTagline: "Secure • Instant • GST Compliant",
    heroDescription: "Pay your school or college fees quickly and securely via UPI, cards, net banking, or EMI. Instant payment confirmation and receipt sent to your email.",
    heroCta: "Pay Fees Now",
    bannerImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=300&fit=crop",
    sections: [
      featuresSection([
        { title: "Instant Confirmation", desc: "Payment receipt sent to your email immediately.", icon: "✅" },
        { title: "All Payment Modes", desc: "UPI, debit/credit cards, net banking, wallets, and EMI.", icon: "💳" },
        { title: "GST Compliant", desc: "Automated GST invoice generated for every payment.", icon: "📄" },
        { title: "Secure & Safe", desc: "256-bit encryption and PCI-DSS compliant checkout.", icon: "🔒" },
      ]),
      testimonialsSection([
        { name: "Priya S.", text: "Paid my daughter's school fees in under 2 minutes. So convenient!", rating: 5, avatar: "PS" },
        { name: "Rahul M.", text: "Got the receipt instantly on email. No more standing in queues.", rating: 5, avatar: "RM" },
        { name: "Ananya G.", text: "Easy EMI option made the annual fee very manageable.", rating: 4, avatar: "AG" },
      ]),
      faqSection([
        { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, net banking, wallets, and EMI via Razorpay." },
        { q: "Will I get a receipt?", a: "Yes, an instant payment receipt is emailed to you right after payment." },
        { q: "Is my payment secure?", a: "Absolutely. All transactions are protected by 256-bit encryption and are PCI-DSS certified." },
        { q: "Can I pay in installments?", a: "Yes, EMI options are available on credit cards for amounts above ₹3,000." },
      ]),
    ],
    checkout: createCheckoutConfig(5000, "Pay Now", [
      "Instant payment confirmation",
      "Receipt sent to your email",
      "GST invoice included",
      "Secure Razorpay checkout",
      "All payment modes accepted",
    ], [
      { id: "f_student", label: "Student Name", type: "text", required: true, placeholder: "Enter student's full name" },
      { id: "f_class", label: "Class / Course", type: "text", required: true, placeholder: "e.g. Class 10, B.Tech 2nd Year" },
      { id: "f_rollno", label: "Roll / Admission No.", type: "text", required: false, placeholder: "Enter roll or admission number" },
      { id: "f_feetype", label: "Fee Type", type: "select", required: true, placeholder: "Select fee type", options: ["Tuition Fee", "Admission Fee", "Exam Fee", "Activity Fee", "Hostel Fee", "Other"] },
    ], { amountType: "fixed" as const }),
  },

  // ─── Payment Page: Online Course Collection ───
  {
    id: "pay-online-course",
    layout: "payment-page" as const,
    title: "Online Course Enrollment",
    desc: "Single-page enrollment page for online courses — AI-powered, cohort-based, or self-paced — with instant Razorpay checkout.",
    category: "education",
    icon: BookOpen,
    pages: ["Home"],
    heroTitle: "Enroll in Your Course",
    heroTagline: "Learn from Experts • Lifetime Access • Certificate Included",
    heroDescription: "Join thousands of learners who've transformed their careers. Enroll today and get instant access to all course materials, live sessions, and our student community.",
    heroCta: "Enroll Now",
    bannerImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=900&h=300&fit=crop",
    sections: [
      featuresSection([
        { title: "Lifetime Access", desc: "All course materials are yours forever — including future updates.", icon: "♾️" },
        { title: "Live Mentoring", desc: "Weekly live sessions and doubt-clearing with expert instructors.", icon: "🎓" },
        { title: "Certificate", desc: "Industry-recognized certificate upon completion.", icon: "🏆" },
        { title: "Community", desc: "Access to a private community of 10,000+ learners.", icon: "👥" },
      ]),
      statsSection([
        { value: "10K+", label: "Students Enrolled" },
        { value: "4.9★", label: "Average Rating" },
        { value: "92%", label: "Completion Rate" },
        { value: "85%", label: "Got Jobs / Promoted" },
      ]),
      testimonialsSection([
        { name: "Karthik M.", text: "Best investment I've made in my career. Got promoted within 3 months of completing the course.", rating: 5, avatar: "KM" },
        { name: "Divya R.", text: "The live sessions and doubt support were incredible. Never felt stuck for long.", rating: 5, avatar: "DR" },
        { name: "Amit P.", text: "Real projects, real skills. The certificate opened doors I didn't expect.", rating: 5, avatar: "AP" },
      ]),
      faqSection([
        { q: "How long do I have access?", a: "Lifetime access — once enrolled, all materials are yours forever including future updates." },
        { q: "Can I get a refund?", a: "Yes, we offer a 7-day no-questions-asked refund policy." },
        { q: "Is this course beginner-friendly?", a: "Yes! We start from the basics and progressively build to advanced topics." },
        { q: "What payment modes are supported?", a: "UPI, credit/debit cards, net banking, and EMI via Razorpay." },
      ]),
    ],
    checkout: createCheckoutConfig(2999, "Enroll Now", [
      "Lifetime access to all materials",
      "Live weekly sessions with instructors",
      "Hands-on projects and assignments",
      "Industry-recognized certificate",
      "Private student community",
      "7-day money-back guarantee",
    ], [
      { id: "f_exp", label: "Experience Level", type: "select", required: true, placeholder: "Select your level", options: ["Beginner", "Intermediate", "Advanced"] },
      { id: "f_goal", label: "What do you want to achieve?", type: "textarea", required: false, placeholder: "Tell us your learning goal..." },
    ]),
  },

  // ─── Education ───

  // 1. MULTI-COURSE PLATFORM
  {
    id: "multi-course", title: "Online Courses (Multi)", desc: "Course marketplace with catalog, categories, and student dashboard.", category: "education", icon: BookOpen,
    pages: ["Home", "Courses", "Instructors"],
    heroTitle: "Learn Without Limits", heroTagline: "100+ courses by industry experts",
    heroDescription: "From programming to design, marketing to data science — master new skills with hands-on courses and expert mentors. Join 15,000+ learners already building their future.",
    heroCta: "Browse Courses", bannerImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      statsSection([{ value: "100+", label: "Courses" }, { value: "15K+", label: "Students" }, { value: "50+", label: "Instructors" }, { value: "4.8★", label: "Rating" }]),
      productsSection([
        { title: "Full Stack Web Development", price: "₹4,999", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop", badge: "Best Seller", desc: "Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 10+ real-world projects from scratch. Includes deployment and CI/CD." },
        { title: "UI/UX Design Mastery", price: "₹3,999", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop", badge: "Popular", desc: "Learn Figma, design systems, user research, wireframing, prototyping, and usability testing. Create a professional portfolio." },
        { title: "Data Science & Machine Learning", price: "₹5,999", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop", badge: "", desc: "Python, Pandas, NumPy, Scikit-learn, TensorFlow. Build predictive models, NLP pipelines, and recommendation engines." },
        { title: "Digital Marketing Pro", price: "₹2,999", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop", badge: "New", desc: "SEO, Google Ads, Facebook Ads, content marketing, email automation, and analytics. Run real campaigns with live budgets." },
      ]),
      featuresSection([
        { title: "Self-Paced Learning", desc: "Learn at your own speed with lifetime access to all materials.", icon: "🕐" },
        { title: "Expert Instructors", desc: "Learn from industry practitioners at Google, Amazon & more.", icon: "👨‍🏫" },
        { title: "Certificates", desc: "Earn industry-recognized certificates on completion.", icon: "🏆" },
        { title: "Hands-on Projects", desc: "Build real-world projects for your portfolio.", icon: "💻" },
        { title: "Community Access", desc: "Join a private community of 15,000+ learners.", icon: "👥" },
        { title: "Razorpay Payments", desc: "Secure payment with UPI, cards, net banking & EMI.", icon: "💳" },
      ]),
      teamSection([
        { name: "Dr. Meera Shah", role: "Head of Curriculum", avatar: "MS", bio: "PhD Stanford. 20 years in EdTech." },
        { name: "Arjun Reddy", role: "Lead Instructor", avatar: "AR", bio: "Ex-Google. Full stack expert." },
        { name: "Priya Nair", role: "Student Success", avatar: "PN", bio: "Ensuring every student thrives." },
      ]),
      clientsSection(["Google", "Microsoft", "Amazon", "Flipkart", "Infosys", "TCS"]),
      testimonialsSection([
        { name: "Rohit Verma", text: "Landed a ₹18 LPA job at a startup after completing the Full Stack course. The projects were incredibly practical.", rating: 5, avatar: "RV" },
        { name: "Aditi Sharma", text: "The UI/UX course gave me the portfolio I needed to switch careers. Now working as a product designer.", rating: 5, avatar: "AS" },
        { name: "Karthik M.", text: "Best investment I've made. The Data Science course is on par with ₹2L bootcamps.", rating: 5, avatar: "KM" },
      ]),
      googleReviewsSection(),
      faqSection([
        { q: "How long do I have access?", a: "Lifetime access. Once enrolled, the course is yours forever — including future updates." },
        { q: "Can I get a refund?", a: "Yes, full refund within 7 days of purchase, no questions asked." },
        { q: "Are certificates recognized?", a: "Our certificates are recognized by 500+ companies including Google, Amazon, and TCS." },
        { q: "Do I need prior experience?", a: "Most courses start from beginner level. Prerequisites are clearly mentioned on each course page." },
        { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, net banking, wallets, and EMI options via Razorpay." },
      ]),
      ctaBannerSection("Start Learning Today", "Join 15,000+ students already enrolled. 7-day money-back guarantee.", "Explore Courses"),
      newsletterSection(),
    ],
    pagesData: {
      "Courses": {
        heroTitle: "Explore Our Courses", heroTagline: "Find the perfect course for your career goals",
        heroDescription: "Browse 100+ courses across programming, design, marketing, data science, and more. Every course includes lifetime access, projects, and a certificate.",
        heroCta: "View All Courses", bannerImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Programming", desc: "Python, JavaScript, React, Node.js, Go, and more.", icon: "💻" },
            { title: "Design", desc: "UI/UX, Figma, Adobe Suite, motion design.", icon: "🎨" },
            { title: "Marketing", desc: "SEO, social media, content, paid ads, analytics.", icon: "📈" },
            { title: "Data Science", desc: "Python, ML, AI, deep learning, data visualization.", icon: "📊" },
          ]),
          productsSection([
            { title: "Full Stack Web Development", price: "₹4,999", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop", badge: "Best Seller", desc: "Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 10+ real-world projects from scratch." },
            { title: "UI/UX Design Mastery", price: "₹3,999", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop", badge: "Popular", desc: "Learn Figma, design systems, user research, wireframing, prototyping, and usability testing." },
            { title: "Data Science & Machine Learning", price: "₹5,999", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop", badge: "", desc: "Python, Pandas, NumPy, Scikit-learn, TensorFlow. Build predictive models and recommendation engines." },
            { title: "Digital Marketing Pro", price: "₹2,999", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop", badge: "New", desc: "SEO, Google Ads, Facebook Ads, content marketing, email automation, and analytics." },
            { title: "Python Programming", price: "₹1,999", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=300&fit=crop", badge: "", desc: "Complete Python masterclass from basics to advanced. Covers OOP, file handling, APIs, and automation." },
            { title: "Mobile App Development", price: "₹6,999", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=300&fit=crop", badge: "Advanced", desc: "Build iOS and Android apps with React Native. Covers navigation, APIs, push notifications, and app store deployment." },
            { title: "Cloud & DevOps", price: "₹4,499", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&fit=crop", badge: "", desc: "AWS, Docker, Kubernetes, CI/CD, Terraform. Deploy and scale production applications." },
            { title: "Graphic Design Bootcamp", price: "₹3,499", image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&h=300&fit=crop", badge: "Popular", desc: "Adobe Photoshop, Illustrator, InDesign. Create logos, social media graphics, print materials, and brand identities." },
          ]),
          ctaBannerSection("Can't Decide?", "Take our 2-minute quiz to find the right course for you.", "Take the Quiz"),
        ],
      },
      "Instructors": {
        heroTitle: "Learn from the Best", heroTagline: "50+ industry experts and practitioners",
        heroDescription: "Our instructors bring real-world experience from top companies like Google, Amazon, and Microsoft. Learn directly from those who've built and shipped products at scale.",
        heroCta: "Meet Our Team", bannerImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&h=300&fit=crop",
        sections: [
          teamSection([
            { name: "Dr. Meera Shah", role: "Head of Curriculum · PhD Stanford", avatar: "MS", bio: "20 years in EdTech. Led curriculum design at Coursera and Udacity." },
            { name: "Arjun Reddy", role: "Full Stack Lead · Ex-Google", avatar: "AR", bio: "10 years building web apps. Taught 5,000+ students." },
            { name: "Priya Nair", role: "Data Science · Ex-Amazon", avatar: "PN", bio: "ML engineer turned educator. Published researcher." },
            { name: "Vikram Joshi", role: "DevOps · Ex-Microsoft", avatar: "VJ", bio: "Cloud architect. AWS & Azure certified." },
            { name: "Sneha Kapoor", role: "UI/UX · Ex-Flipkart", avatar: "SK", bio: "Design systems expert. 8 years in product design." },
            { name: "Rahul Menon", role: "Marketing · Ex-Zomato", avatar: "RM", bio: "Growth marketing specialist. Scaled 0 to 10M users." },
          ]),
          statsSection([{ value: "50+", label: "Instructors" }, { value: "200+", label: "Years Combined Experience" }, { value: "15K+", label: "Students Taught" }, { value: "4.9★", label: "Avg Rating" }]),
          ctaBannerSection("Become an Instructor", "Share your expertise with thousands of eager learners.", "Apply to Teach"),
        ],
      },
      "Pricing": {
        heroTitle: "Simple, Transparent Pricing", heroTagline: "Choose the plan that fits your learning goals",
        heroDescription: "Whether you're exploring a single topic or building a complete career, we have a plan for you. All plans include lifetime access and a 7-day refund guarantee.",
        heroCta: "Get Started", bannerImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=300&fit=crop",
        sections: [
          pricingSection([
            { name: "Single Course", price: "₹2,999", period: "", features: ["1 course of your choice", "Lifetime access", "Certificate of completion", "Community forum access", "Email support"], highlighted: false },
            { name: "All Access", price: "₹9,999", period: "/year", features: ["All 100+ courses", "Lifetime access", "All certificates", "Priority support", "1:1 mentorship (monthly)", "New courses added free"], highlighted: true },
            { name: "Enterprise", price: "Custom", period: "", features: ["Custom course bundles", "Team dashboards & analytics", "Dedicated account manager", "API access & SSO", "Bulk certificates", "Custom branding"], highlighted: false },
          ]),
          featuresSection([
            { title: "Money-Back Guarantee", desc: "Full refund within 7 days, no questions asked.", icon: "💰" },
            { title: "Flexible Payments", desc: "Pay via UPI, cards, net banking, or EMI via Razorpay.", icon: "💳" },
            { title: "Team Discounts", desc: "Special rates for teams of 5+ people.", icon: "👥" },
          ]),
          faqSection([
            { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime. We'll prorate the difference." },
            { q: "Is there a free trial?", a: "Yes, every course has 3 free preview lessons so you can try before you buy." },
            { q: "What payment methods do you accept?", a: "UPI, credit/debit cards, net banking, wallets, and EMI options via Razorpay." },
            { q: "Can I buy for my team?", a: "Yes! Contact us for Enterprise pricing with team dashboards and bulk enrollment." },
          ]),
        ],
      },
    },
    productsConfig: {
      enabled: true,
      displayMode: "grid",
      showPricing: true,
      categoriesEnabled: false,
      products: [
        {
          id: "mc-p1", type: "course", title: "Full Stack Web Development", status: "published", featured: true, badge: "Best Seller",
          description: "Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 10+ real-world projects from scratch.",
          image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
          pricingModels: [{ id: "mc-pm1", type: "one-time", price: 4999, currency: "INR", label: "Enroll Now" }],
        },
        {
          id: "mc-p2", type: "course", title: "UI/UX Design Mastery", status: "published", featured: false, badge: "Popular",
          description: "Learn Figma, design systems, user research, wireframing, prototyping, and usability testing.",
          image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
          pricingModels: [{ id: "mc-pm2", type: "one-time", price: 3999, currency: "INR", label: "Enroll Now" }],
        },
        {
          id: "mc-p3", type: "course", title: "Data Science & Machine Learning", status: "published", featured: false, badge: "",
          description: "Python, Pandas, NumPy, Scikit-learn, TensorFlow. Build predictive models and recommendation engines.",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
          pricingModels: [{ id: "mc-pm3", type: "one-time", price: 5999, currency: "INR", label: "Enroll Now" }],
        },
        {
          id: "mc-p4", type: "course", title: "Digital Marketing Pro", status: "published", featured: false, badge: "New",
          description: "SEO, Google Ads, Facebook Ads, content marketing, email automation, and analytics.",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
          pricingModels: [{ id: "mc-pm4", type: "one-time", price: 2999, currency: "INR", label: "Enroll Now" }],
        },
        {
          id: "mc-p5", type: "course", title: "Python Programming", status: "published", featured: false, badge: "",
          description: "Complete Python masterclass from basics to advanced. Covers OOP, file handling, APIs, and automation.",
          image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
          pricingModels: [{ id: "mc-pm5", type: "one-time", price: 1999, currency: "INR", label: "Enroll Now" }],
        },
        {
          id: "mc-p6", type: "course", title: "Cloud & DevOps", status: "published", featured: false, badge: "",
          description: "AWS, Docker, Kubernetes, CI/CD, Terraform. Deploy and scale production applications.",
          image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
          pricingModels: [{ id: "mc-pm6", type: "one-time", price: 4499, currency: "INR", label: "Enroll Now" }],
        },
      ],
    },
    checkout: createCheckoutConfig(4999, "Enroll Now — ₹4,999", [
      "Lifetime access to all course materials",
      "Expert-led HD video lessons",
      "Hands-on projects & assignments",
      "Certificate of completion",
      "Community forum access",
      "Monthly live Q&A with instructors",
    ]),
  },

  // 2. SINGLE COURSE
  {
    id: "single-course", title: "Single Online Course", desc: "High-converting sales page for one course with modules, instructor bio, and enrollment.", category: "education", icon: GraduationCap,
    pages: ["Home", "Curriculum"],
    heroTitle: "Master Full Stack Development", heroTagline: "12-Week Intensive Bootcamp • Next Batch: March 2026",
    heroDescription: "Go from zero to job-ready full stack developer. Learn React, Node.js, databases, and deployment with real-world projects. 2000+ alumni placed.",
    heroCta: "Enroll Now — ₹12,999", bannerImage: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      videoEmbedSection(),
      aboutSection("Meet Your Instructor", "I'm Karthik Rajan, ex-Amazon engineer with 10 years of full-stack experience. I've trained 2000+ developers and my students work at Google, Microsoft, Flipkart, and more."),
      curriculumSection([
        { title: "Weeks 1-2: HTML, CSS & JavaScript Foundations", lessons: ["Semantic HTML", "Flexbox & Grid", "JavaScript ES6+", "DOM Manipulation"], duration: "20 hours" },
        { title: "Weeks 3-5: React & Frontend Architecture", lessons: ["Components & Hooks", "State Management", "API Integration", "Testing with Jest"], duration: "30 hours" },
        { title: "Weeks 6-8: Node.js, Express & Databases", lessons: ["REST APIs", "MongoDB & PostgreSQL", "Authentication", "File Uploads"], duration: "30 hours" },
        { title: "Weeks 9-10: DevOps & Deployment", lessons: ["Docker Basics", "CI/CD Pipelines", "AWS/Vercel Deploy", "Monitoring"], duration: "20 hours" },
        { title: "Weeks 11-12: Capstone Project & Career Prep", lessons: ["Full-Stack Project", "Code Review", "Resume Workshop", "Mock Interviews"], duration: "20 hours" },
      ]),
      statsSection([{ value: "2000+", label: "Graduates" }, { value: "92%", label: "Completion Rate" }, { value: "85%", label: "Placed in 6 Months" }, { value: "4.9★", label: "Rating" }]),
      pricingSection([
        { name: "Self-Paced", price: "₹9,999", period: "", features: ["Video lectures", "Assignments", "Community access", "Certificate"], highlighted: false },
        { name: "Mentored", price: "₹12,999", period: "", features: ["Everything in Self-Paced", "Weekly 1:1 mentoring", "Code reviews", "Job prep"], highlighted: true },
        { name: "Premium", price: "₹19,999", period: "", features: ["Everything in Mentored", "Guaranteed internship", "Resume building", "Interview prep"], highlighted: false },
      ]),
      testimonialsSection([
        { name: "Karthik M.", text: "Went from zero coding knowledge to landing a ₹8 LPA job in 6 months!", rating: 5, avatar: "KM" },
        { name: "Divya R.", text: "The mentorship made all the difference. Best investment I've made.", rating: 5, avatar: "DR" },
        { name: "Amit P.", text: "Real projects, real skills. Not just theory like other courses.", rating: 5, avatar: "AP" },
      ]),
      googleReviewsSection(),
      faqSection([
        { q: "Do I need prior coding experience?", a: "No! This course starts from absolute basics and builds up." },
        { q: "How long do I have access?", a: "Lifetime access to all course materials and future updates." },
        { q: "Is there a certificate?", a: "Yes, you'll receive a verified completion certificate." },
        { q: "What if I fall behind?", a: "No worries — you can learn at your own pace with lifetime access." },
      ]),
      ctaBannerSection("Limited Seats Available", "Next batch starts March 1, 2026. Don't miss out!", "Reserve Your Seat"),
    ],
    pagesData: {
      "Curriculum": {
        heroTitle: "Course Curriculum", heroTagline: "120+ hours of hands-on, project-based learning",
        heroDescription: "Every module is designed to build on the previous one. By the end, you'll have 5+ portfolio projects and the skills to land your first developer job.",
        heroCta: "Start Learning", bannerImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=300&fit=crop",
        sections: [
          curriculumSection([
            { title: "Weeks 1-2: HTML, CSS & JavaScript Foundations", lessons: ["Semantic HTML & Accessibility", "CSS Flexbox & Grid Layouts", "Responsive Design & Media Queries", "JavaScript ES6+ Fundamentals", "DOM Manipulation & Events", "Project: Personal Portfolio Site"], duration: "20 hours" },
            { title: "Weeks 3-5: React & Modern Frontend", lessons: ["React Components & JSX", "useState, useEffect, useRef", "React Router & Navigation", "State Management (Context, Zustand)", "API Integration & Async Patterns", "Testing with Jest & React Testing Library", "Project: Task Management App"], duration: "30 hours" },
            { title: "Weeks 6-8: Backend with Node.js", lessons: ["Node.js & Express Fundamentals", "REST API Design Patterns", "MongoDB with Mongoose", "PostgreSQL with Prisma", "Authentication (JWT, OAuth)", "File Upload & Cloud Storage", "Project: E-commerce API"], duration: "30 hours" },
            { title: "Weeks 9-10: DevOps & Deployment", lessons: ["Docker & Containerization", "CI/CD with GitHub Actions", "Deployment (Vercel, Railway, AWS)", "Environment Variables & Secrets", "Monitoring & Error Tracking", "Project: Deploy Full Stack App"], duration: "20 hours" },
            { title: "Weeks 11-12: Capstone & Career", lessons: ["Full Stack Capstone Project", "Code Review & Best Practices", "Resume & LinkedIn Optimization", "Portfolio Website Polish", "Mock Interviews (Technical + HR)", "Salary Negotiation Workshop"], duration: "20 hours" },
          ]),
          statsSection([{ value: "120+", label: "Hours of Content" }, { value: "50+", label: "Hands-on Exercises" }, { value: "5+", label: "Portfolio Projects" }, { value: "12", label: "Weeks" }]),
          ctaBannerSection("Ready to Start?", "Enroll now and get immediate access to Week 1.", "Enroll Now"),
        ],
      },
      "Pricing": {
        heroTitle: "Choose Your Plan", heroTagline: "Invest in your career today",
        heroDescription: "All plans include lifetime access to course materials, future updates, and a verified completion certificate.",
        heroCta: "Compare Plans", bannerImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=300&fit=crop",
        sections: [
          pricingSection([
            { name: "Self-Paced", price: "₹9,999", period: "", features: ["All video lectures", "Assignments & projects", "Community forum access", "Completion certificate", "Lifetime access"], highlighted: false },
            { name: "Mentored", price: "₹12,999", period: "", features: ["Everything in Self-Paced", "Weekly 1:1 mentoring (30 min)", "Code reviews on projects", "Job preparation sessions", "Priority doubt resolution"], highlighted: true },
            { name: "Premium", price: "₹19,999", period: "", features: ["Everything in Mentored", "Guaranteed internship placement", "Resume & LinkedIn building", "Mock interview sessions (5x)", "Salary negotiation coaching", "Lifetime mentor access"], highlighted: false },
          ]),
          featuresSection([
            { title: "7-Day Refund", desc: "Not satisfied? Full refund within 7 days.", icon: "💰" },
            { title: "EMI Available", desc: "Pay in 3-6 monthly installments at 0% interest.", icon: "💳" },
            { title: "Group Discount", desc: "Enroll with friends and save 20%.", icon: "👥" },
          ]),
          testimonialsSection([
            { name: "Ravi K.", text: "The Mentored plan was perfect. Weekly calls kept me accountable.", rating: 5, avatar: "RK" },
            { name: "Shruti M.", text: "Premium plan's placement guarantee actually worked! Got placed at Flipkart.", rating: 5, avatar: "SM" },
            { name: "Dev P.", text: "Self-paced worked great for me since I have a day job.", rating: 5, avatar: "DP" },
          ]),
        ],
      },
      "Enroll": {
        heroTitle: "Enroll Now", heroTagline: "Next batch starts March 1, 2026 — limited seats",
        heroDescription: "Complete the form below to reserve your spot. You'll get instant access to pre-course materials and our student community.",
        heroCta: "Reserve My Seat", bannerImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Instant Access", desc: "Get pre-course materials immediately after enrollment.", icon: "⚡" },
            { title: "Community Access", desc: "Join our Slack community of 2000+ developers.", icon: "🤝" },
            { title: "Flexible Schedule", desc: "Learn at your own pace with recorded sessions.", icon: "📅" },
          ]),
          ctaBannerSection("Still Have Questions?", "Book a free 15-minute call with our admissions team.", "Book a Call"),
        ],
      },
      "FAQ": {
        heroTitle: "Frequently Asked Questions", heroTagline: "Everything you need to know before enrolling",
        heroDescription: "Can't find your answer here? Reach out to our support team — we're happy to help.",
        heroCta: "Contact Support", bannerImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=300&fit=crop",
        sections: [
          faqSection([
            { q: "Do I need prior coding experience?", a: "No! This course starts from absolute basics. Many of our successful graduates had zero coding experience before joining." },
            { q: "How long do I have access?", a: "Lifetime access to all course materials, including future updates and new modules." },
            { q: "What's the time commitment?", a: "Plan for 10-15 hours per week. The course is designed for working professionals." },
            { q: "Is there a certificate?", a: "Yes, you'll receive a verified digital certificate upon completion that you can share on LinkedIn." },
            { q: "What if I fall behind?", a: "No worries — all content is self-paced with lifetime access. You can also join the next batch's live sessions." },
            { q: "Do you help with job placement?", a: "Yes! Our Premium plan includes guaranteed internship placement. All plans include resume review and interview prep resources." },
            { q: "Can I pay in installments?", a: "Yes, EMI options available at 0% interest for 3-6 months." },
            { q: "What tech stack will I learn?", a: "HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, and Git." },
          ]),
        ],
      },
    },
    checkout: createCheckoutConfig(12999, "Enroll Now — ₹12,999", [
      "12-week intensive bootcamp",
      "120+ hours of hands-on content",
      "Real-world capstone projects",
      "1:1 mentor sessions",
      "Job placement assistance",
      "Lifetime community access",
    ], [
      { id: "f_exp", label: "Experience Level", type: "select", required: true, placeholder: "Select your level", options: ["Beginner", "Intermediate", "Advanced"] },
    ]),
  },

  // 3. WEBINAR
  {
    id: "webinar", title: "Webinar", desc: "High-converting webinar registration page with countdown, speakers, and social proof.", category: "education", icon: Video,
    pages: ["Home", "Agenda", "Register"],
    heroTitle: "Free Masterclass: AI in 2026", heroTagline: "Live Webinar • March 15, 2026 • 7:00 PM IST",
    heroDescription: "Discover how AI is transforming industries and learn practical skills to leverage it in your career. 5,000+ already registered.",
    heroCta: "Register for Free", bannerImage: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      countdownSection("2026-03-15T19:00:00"),
      statsSection([{ value: "5,000+", label: "Registered" }, { value: "2", label: "Expert Speakers" }, { value: "90 min", label: "Duration" }, { value: "FREE", label: "Cost" }]),
      speakersSection([
        { name: "Dr. Kavita Nair", title: "AI Research Lead, Google", avatar: "KN", bio: "15+ years in machine learning and natural language processing. Published 40+ papers." },
        { name: "Raj Venkatesh", title: "CTO, TechStartup.io", avatar: "RV", bio: "Built AI products used by 10M+ users worldwide. Forbes 30 Under 30." },
      ]),
      scheduleSection([
        { time: "7:00 PM", title: "Welcome & Introduction", speaker: "" },
        { time: "7:15 PM", title: "The AI Landscape in 2026 — What's Changed", speaker: "Dr. Kavita Nair" },
        { time: "7:45 PM", title: "Building Your First AI Product — Live Demo", speaker: "Raj Venkatesh" },
        { time: "8:15 PM", title: "Career Opportunities in AI — Panel + Live Q&A", speaker: "Both Speakers" },
        { time: "8:45 PM", title: "Exclusive Offer & Wrap-up", speaker: "" },
      ]),
      featuresSection([
        { title: "100% Free", desc: "No hidden charges or upsells during the session.", icon: "🎁" },
        { title: "Live Q&A", desc: "Get your questions answered in real-time.", icon: "💬" },
        { title: "Recording Access", desc: "Can't attend live? Get the replay link.", icon: "📹" },
      ]),
      testimonialsSection([
        { name: "Neha K.", text: "Best free webinar I've attended. So much actionable content!", rating: 5, avatar: "NK" },
        { name: "Siddharth J.", text: "Dr. Kavita's insights were mind-blowing. Must attend!", rating: 5, avatar: "SJ" },
        { name: "Pooja R.", text: "Signed up for the full course after this webinar. Amazing!", rating: 5, avatar: "PR" },
      ]),
      faqSection([
        { q: "Is this really free?", a: "Yes, 100% free. No credit card required." },
        { q: "Will I get a recording?", a: "Yes, all registered attendees get the replay within 24 hours." },
        { q: "Do I need any prior knowledge?", a: "No, this is beginner-friendly with something for everyone." },
      ]),
    ],
    pagesData: {
      "Agenda": {
        heroTitle: "Webinar Agenda", heroTagline: "90 minutes of actionable AI insights",
        heroDescription: "Here's exactly what we'll cover in our masterclass. Every minute is packed with practical, actionable content.",
        heroCta: "Register Now", bannerImage: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&h=300&fit=crop",
        sections: [
          scheduleSection([
            { time: "7:00 PM", title: "Welcome & Introductions", speaker: "Host: Ananya Sharma" },
            { time: "7:10 PM", title: "The State of AI in 2026 — Key Trends & Breakthroughs", speaker: "Dr. Kavita Nair" },
            { time: "7:30 PM", title: "Live Demo: Build a ChatBot in 15 Minutes", speaker: "Raj Venkatesh" },
            { time: "7:50 PM", title: "AI Career Paths — Where the Jobs Are", speaker: "Dr. Kavita Nair" },
            { time: "8:10 PM", title: "Panel Discussion & Live Q&A", speaker: "Both Speakers" },
            { time: "8:35 PM", title: "Exclusive Course Launch Offer", speaker: "Host" },
            { time: "8:45 PM", title: "Closing & Next Steps", speaker: "" },
          ]),
          speakersSection([
            { name: "Dr. Kavita Nair", title: "AI Research Lead, Google", avatar: "KN", bio: "15+ years in ML/NLP. Published 40+ papers. Former professor at IIT Bombay." },
            { name: "Raj Venkatesh", title: "CTO, TechStartup.io", avatar: "RV", bio: "Built AI products for 10M+ users. Forbes 30 Under 30. Ex-Microsoft AI team." },
          ]),
          featuresSection([
            { title: "Actionable Takeaways", desc: "Walk away with a clear AI roadmap for your career.", icon: "🎯" },
            { title: "Live Coding Demo", desc: "Watch a real AI product built live in 15 minutes.", icon: "💻" },
            { title: "Q&A Session", desc: "Get your specific questions answered by experts.", icon: "❓" },
          ]),
          ctaBannerSection("Don't Miss Out", "5,000+ have already registered. Secure your free spot now.", "Register for Free"),
        ],
      },
      "Register": {
        heroTitle: "Register for Free", heroTagline: "Secure your spot — limited virtual seats available",
        heroDescription: "Fill in your details below and we'll send you the joining link, calendar invite, and pre-event materials.",
        heroCta: "Complete Registration", bannerImage: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Instant Confirmation", desc: "Get your joining link immediately after registration.", icon: "✅" },
            { title: "Calendar Invite", desc: "We'll send a Google Calendar invite so you don't forget.", icon: "📅" },
            { title: "Pre-Event Kit", desc: "Receive AI resources and prep materials before the event.", icon: "📦" },
          ]),
          testimonialsSection([
            { name: "Past Attendee", text: "Registration took 10 seconds. Got the link instantly. Smooth!", rating: 5, avatar: "PA" },
            { name: "Corporate Team", text: "Registered our entire team of 15. Great group experience.", rating: 5, avatar: "CT" },
          ]),
        ],
      },
    },
    checkout: createCheckoutConfig(0, "Register for Free", [
      "90-minute live masterclass",
      "Expert AI insights from Google & MIT",
      "Downloadable resources & slides",
      "Certificate of attendance",
      "Recording access for 7 days",
    ], [], { amountType: "fixed", amount: 0, gstEnabled: false, buttonText: "Register Now — Free" }),
  },

  // 4. 1:1 COACHING
  {
    id: "coaching", title: "1:1 Coaching", desc: "Personal coaching page with booking, coach bio, and transformation stories.", category: "education", icon: UserCheck,
    pages: ["Home", "About", "Book Session", "Results"],
    heroTitle: "Unlock Your Full Potential", heroTagline: "Personalized coaching for ambitious professionals",
    heroDescription: "Get clarity, accountability, and proven strategies from a certified coach who's helped 200+ professionals land dream roles at top companies.",
    heroCta: "Book a Free Discovery Call", bannerImage: "https://images.unsplash.com/photo-1552581234-26160f608093?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      aboutSection("Hi, I'm Nandini 👋", "I'm a certified executive coach (ICF-PCC) with 12+ years of corporate experience at McKinsey and Google. After my own career transformation, I've dedicated myself to helping others navigate career transitions, leadership challenges, and professional growth. 200+ careers transformed and counting."),
      servicesSection([
        { title: "Career Transition", desc: "Navigate job changes with confidence and strategy.", icon: "🚀" },
        { title: "Interview Mastery", desc: "Ace any interview with mock sessions and feedback.", icon: "🗣️" },
        { title: "Executive Presence", desc: "Build leadership skills and boardroom confidence.", icon: "👔" },
        { title: "Work-Life Design", desc: "Create sustainable success without burnout.", icon: "⚖️" },
      ]),
      statsSection([{ value: "200+", label: "Careers Transformed" }, { value: "95%", label: "Got Offers" }, { value: "3x", label: "Avg Salary Jump" }, { value: "4.9★", label: "Rating" }]),
      pricingSection([
        { name: "Discovery Call", price: "Free", period: "", features: ["30-min video call", "Goal assessment", "Personalized plan", "No commitment"], highlighted: false },
        { name: "Growth Package", price: "₹9,999", period: "/4 sessions", features: ["4 × 60-min calls", "WhatsApp support", "Resume review", "Mock interview"], highlighted: true },
        { name: "Transformation", price: "₹24,999", period: "/12 sessions", features: ["12 × 60-min calls", "Priority scheduling", "Unlimited chat", "Career roadmap", "Placement guarantee"], highlighted: false },
      ]),
      testimonialsSection([
        { name: "Ravi K.", text: "Went from stuck mid-level manager to VP in 8 months. Nandini's coaching is life-changing!", rating: 5, avatar: "RK" },
        { name: "Preethi S.", text: "Her interview prep is unmatched. Got offers from 3 FAANG companies and negotiated 40% higher.", rating: 5, avatar: "PS" },
        { name: "Manish G.", text: "The career roadmap gave me clarity I'd been missing for years. Worth every rupee.", rating: 5, avatar: "MG" },
      ]),
      googleReviewsSection(),
      faqSection([
        { q: "How do sessions work?", a: "All sessions are via Zoom with flexible scheduling. I work across time zones." },
        { q: "What's the cancellation policy?", a: "Free rescheduling up to 24 hours before. No cancellation fees." },
        { q: "Is this for experienced professionals only?", a: "No — I work with early-career, mid-level, and senior professionals." },
      ]),
    ],
    pagesData: {
      "About": {
        heroTitle: "About Nandini", heroTagline: "ICF-PCC Certified Executive Coach",
        heroDescription: "From McKinsey consultant to Google leader to full-time coach — here's my story and why I'm passionate about transforming careers.",
        heroCta: "Book a Call", bannerImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=300&fit=crop",
        sections: [
          aboutSection("My Journey", "I spent 8 years at McKinsey solving business problems, then 4 years at Google leading product teams. But my most rewarding work was always mentoring — helping people find clarity and courage in their careers. In 2022, I became a certified coach (ICF-PCC) and haven't looked back. 200+ professionals later, I can say coaching is my calling."),
          featuresSection([
            { title: "ICF-PCC Certified", desc: "Professional Certified Coach by International Coaching Federation.", icon: "🏅" },
            { title: "12+ Years Corporate", desc: "Real-world experience at McKinsey, Google, and startups.", icon: "💼" },
            { title: "200+ Transformations", desc: "Proven track record across industries and levels.", icon: "🌟" },
            { title: "Published Author", desc: "\"Career by Design\" — a bestselling career guide.", icon: "📚" },
          ]),
          statsSection([{ value: "12+", label: "Years Experience" }, { value: "200+", label: "Clients Coached" }, { value: "95%", label: "Success Rate" }, { value: "15+", label: "Industries" }]),
          testimonialsSection([
            { name: "Arjun T.", text: "Nandini understands corporate politics and career strategy like no one else.", rating: 5, avatar: "AT" },
            { name: "Priya M.", text: "She helped me transition from engineering to product management seamlessly.", rating: 5, avatar: "PM" },
          ]),
        ],
      },
      "Book Session": {
        heroTitle: "Book Your Session", heroTagline: "Start with a free 30-minute discovery call",
        heroDescription: "Choose a time that works for you. We'll discuss your goals, challenges, and create a personalized action plan.",
        heroCta: "Select a Time Slot", bannerImage: "https://images.unsplash.com/photo-1552581234-26160f608093?w=900&h=300&fit=crop",
        sections: [
          pricingSection([
            { name: "Discovery Call", price: "Free", period: "", features: ["30-min video call", "Goal assessment", "Personalized plan", "No commitment"], highlighted: false },
            { name: "Growth Package", price: "₹9,999", period: "/4 sessions", features: ["4 × 60-min calls", "WhatsApp support", "Resume review", "Mock interview"], highlighted: true },
            { name: "Transformation", price: "₹24,999", period: "/12 sessions", features: ["12 × 60-min calls", "Priority scheduling", "Unlimited chat", "Career roadmap", "Placement guarantee"], highlighted: false },
          ]),
          faqSection([
            { q: "How do I book?", a: "Fill the form above and I'll send you my calendar link within 24 hours." },
            { q: "What platform do we use?", a: "All sessions are on Zoom. I'll send the link before each session." },
            { q: "Can I reschedule?", a: "Yes, free rescheduling up to 24 hours before the session." },
          ]),
        ],
      },
      "Results": {
        heroTitle: "Client Results", heroTagline: "Real transformations, real people",
        heroDescription: "Don't take my word for it — here are the stories of professionals who transformed their careers through coaching.",
        heroCta: "Start Your Transformation", bannerImage: "https://images.unsplash.com/photo-1552581234-26160f608093?w=900&h=300&fit=crop",
        sections: [
          statsSection([{ value: "200+", label: "Careers Transformed" }, { value: "95%", label: "Got Offers" }, { value: "3x", label: "Avg Salary Jump" }, { value: "40%", label: "Avg Raise Negotiated" }]),
          testimonialsSection([
            { name: "Ravi K.", text: "Went from stuck mid-level manager to VP at a Fortune 500 in 8 months. Nandini helped me see blind spots I didn't know existed.", rating: 5, avatar: "RK" },
            { name: "Preethi S.", text: "Got offers from Google, Amazon, and Microsoft after her interview prep. Negotiated 40% higher than the initial offer.", rating: 5, avatar: "PS" },
            { name: "Manish G.", text: "Transitioned from engineering to product management. The career roadmap gave me clarity I'd been missing for years.", rating: 5, avatar: "MG" },
            { name: "Deepa R.", text: "After 3 years of feeling stuck, 4 sessions with Nandini changed everything. I'm now leading a team of 20.", rating: 5, avatar: "DR" },
            { name: "Suresh M.", text: "The work-life design coaching saved my marriage and my career. Went from burnout to balanced leader.", rating: 5, avatar: "SM" },
            { name: "Kavya L.", text: "As a first-time manager, Nandini's executive presence coaching was invaluable. My team's engagement scores went up 35%.", rating: 5, avatar: "KL" },
          ]),
          googleReviewsSection(),
          ctaBannerSection("Your Transformation is Next", "Book a free discovery call and let's discuss your goals.", "Book Free Call"),
        ],
      },
    },
    checkout: createCheckoutConfig(7999, "Book Your Session — ₹7,999", [
      "60-minute 1:1 coaching call",
      "Personalized action plan",
      "Career roadmap document",
      "2 weeks of follow-up support",
      "Access to resource library",
    ], [
      { id: "f_goal", label: "What's your primary goal?", type: "textarea", required: true, placeholder: "Tell us about your goals..." },
      { id: "f_slot", label: "Preferred Time Slot", type: "select", required: true, placeholder: "Select time", options: ["Morning (9-12)", "Afternoon (12-5)", "Evening (5-8)"] },
    ]),
  },

  // 5. WORKSHOP SERIES
  {
    id: "workshop", title: "Workshop Series", desc: "Multi-session hands-on workshops with schedules, batches, and enrollment.", category: "education", icon: Calendar,
    pages: ["Home", "Workshops", "Schedule", "Enroll"],
    heroTitle: "Weekend Workshops", heroTagline: "Hands-on learning • Small batches • Real projects",
    heroDescription: "Intensive, project-based workshops by industry practitioners. Max 20 per batch for personalized attention.",
    heroCta: "View Upcoming Workshops", bannerImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      productsSection([
        { title: "React Masterclass", price: "₹3,999", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=300&fit=crop", badge: "This Weekend" },
        { title: "Python for Data Science", price: "₹2,999", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=300&fit=crop", badge: "Mar 9" },
        { title: "Figma to Production", price: "₹1,999", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop", badge: "Mar 15" },
        { title: "DevOps & AWS", price: "₹4,999", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&fit=crop", badge: "Advanced" },
      ]),
      scheduleSection([
        { time: "Sat 10 AM", title: "React Masterclass — Batch 5", speaker: "Starts Mar 8" },
        { time: "Sun 11 AM", title: "Python for Data Science — Batch 3", speaker: "Starts Mar 9" },
        { time: "Sat 2 PM", title: "Figma to Production — Batch 2", speaker: "Starts Mar 15" },
        { time: "Sat 10 AM", title: "DevOps & AWS — Batch 1", speaker: "Starts Mar 22" },
      ]),
      featuresSection([
        { title: "Max 20 Per Batch", desc: "Small groups for focused, interactive learning.", icon: "👥" },
        { title: "Build Real Projects", desc: "Take home a portfolio-worthy project each weekend.", icon: "🔨" },
        { title: "Certificate Included", desc: "Industry-recognized completion certificate.", icon: "📜" },
        { title: "Replay Access", desc: "Missed a session? Watch the recording anytime.", icon: "🔄" },
      ]),
      statsSection([{ value: "100+", label: "Workshops Completed" }, { value: "2000+", label: "Graduates" }, { value: "4.8★", label: "Avg Rating" }, { value: "20", label: "Max Batch Size" }]),
      testimonialsSection([
        { name: "Sneha T.", text: "Built a full React app in one weekend. The pace was perfect!", rating: 5, avatar: "ST" },
        { name: "Vikram P.", text: "Small batch = lots of personal attention. Way better than video courses.", rating: 5, avatar: "VP" },
        { name: "Anita M.", text: "The instructor answered every single question. Incredible experience.", rating: 4, avatar: "AM" },
      ]),
      googleReviewsSection(),
      faqSection([
        { q: "Do I need a laptop?", a: "Yes, please bring your own laptop with the software pre-installed (setup guide provided)." },
        { q: "What if I can't attend one session?", a: "You get recording access and can attend the next batch for free." },
        { q: "Are there group discounts?", a: "Yes! Teams of 3+ get 15% off. Contact us for corporate rates." },
      ]),
      ctaBannerSection("Next Batch Starting Soon", "Limited to 20 seats per workshop. Reserve yours today.", "Enroll Now"),
    ],
    pagesData: {
      "Workshops": {
        heroTitle: "All Workshops", heroTagline: "Choose from our growing catalog of hands-on workshops",
        heroDescription: "Each workshop is a self-contained, weekend-intensive experience. Pick the topic that interests you and start building.",
        heroCta: "Browse Workshops", bannerImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=300&fit=crop",
        sections: [
          productsSection([
            { title: "React Masterclass", price: "₹3,999", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=300&fit=crop", badge: "This Weekend" },
            { title: "Python for Data Science", price: "₹2,999", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=300&fit=crop", badge: "Mar 9" },
            { title: "Figma to Production", price: "₹1,999", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop", badge: "Mar 15" },
            { title: "DevOps & AWS", price: "₹4,999", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&fit=crop", badge: "Advanced" },
            { title: "SQL & Database Design", price: "₹2,499", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=300&h=300&fit=crop", badge: "Beginner" },
            { title: "TypeScript Deep Dive", price: "₹2,999", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=300&fit=crop", badge: "Mar 22" },
            { title: "System Design Basics", price: "₹3,999", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=300&fit=crop", badge: "Interview Prep" },
            { title: "Git & GitHub Mastery", price: "₹999", image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=300&h=300&fit=crop", badge: "Free Intro" },
          ]),
          ctaBannerSection("Request a Workshop", "Don't see a topic you need? We create custom workshops on demand.", "Request Topic"),
        ],
      },
      "Schedule": {
        heroTitle: "Upcoming Schedule", heroTagline: "Plan your learning weekends ahead",
        heroDescription: "All workshops run on weekends. Each session is 4-6 hours with breaks. Check the schedule below and pick your dates.",
        heroCta: "View Calendar", bannerImage: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&h=300&fit=crop",
        sections: [
          scheduleSection([
            { time: "Mar 8, Sat 10 AM", title: "React Masterclass — Batch 5 (Day 1/2)", speaker: "Instructor: Arjun Reddy" },
            { time: "Mar 9, Sun 10 AM", title: "React Masterclass — Batch 5 (Day 2/2)", speaker: "Instructor: Arjun Reddy" },
            { time: "Mar 9, Sun 11 AM", title: "Python for Data Science — Batch 3 (Day 1/2)", speaker: "Instructor: Priya Nair" },
            { time: "Mar 15, Sat 10 AM", title: "Python for Data Science — Batch 3 (Day 2/2)", speaker: "Instructor: Priya Nair" },
            { time: "Mar 15, Sat 2 PM", title: "Figma to Production — Batch 2 (Single Day)", speaker: "Instructor: Sneha Kapoor" },
            { time: "Mar 22, Sat 10 AM", title: "DevOps & AWS — Batch 1 (Day 1/3)", speaker: "Instructor: Vikram Joshi" },
            { time: "Mar 23, Sun 10 AM", title: "DevOps & AWS — Batch 1 (Day 2/3)", speaker: "Instructor: Vikram Joshi" },
            { time: "Mar 29, Sat 10 AM", title: "DevOps & AWS — Batch 1 (Day 3/3)", speaker: "Instructor: Vikram Joshi" },
          ]),
          featuresSection([
            { title: "Weekend Only", desc: "All workshops run on Saturdays and Sundays.", icon: "📅" },
            { title: "4-6 Hours/Session", desc: "Intensive but manageable with breaks included.", icon: "⏱️" },
            { title: "Recordings Available", desc: "Every session is recorded for later review.", icon: "🎥" },
          ]),
        ],
      },
      "Enroll": {
        heroTitle: "Enroll in a Workshop", heroTagline: "Secure your seat — max 20 per batch",
        heroDescription: "Select your workshop, fill in your details, and pay to confirm your spot. You'll receive a setup guide and joining link immediately.",
        heroCta: "Complete Enrollment", bannerImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Setup Guide", desc: "Get a pre-workshop setup guide with all requirements.", icon: "📋" },
            { title: "Community Access", desc: "Join the workshop Slack channel for support.", icon: "💬" },
            { title: "100% Refund", desc: "Cancel up to 48 hours before for a full refund.", icon: "💰" },
          ]),
          faqSection([
            { q: "How do I pay?", a: "UPI, cards, net banking, or wallet. Payment link sent after form submission." },
            { q: "Can I attend online?", a: "Select workshops offer hybrid mode. Check the workshop details." },
            { q: "What if the batch is full?", a: "You'll be waitlisted and notified when the next batch opens." },
          ]),
        ],
      },
    },
    checkout: createCheckoutConfig(3999, "Enroll in Workshop — ₹3,999", [
      "Full-day hands-on workshop",
      "Max 20 seats per batch",
      "Take-home project & materials",
      "Completion certificate",
      "Workshop recording access",
    ], [
      { id: "f_workshop", label: "Workshop", type: "select", required: true, placeholder: "Select workshop", options: ["React Masterclass", "Python for Data Science", "Figma to Production", "DevOps & AWS"] },
      { id: "f_batch", label: "Preferred Batch", type: "select", required: true, placeholder: "Select batch", options: ["This Weekend", "Mar 9", "Mar 15", "Mar 22"] },
    ]),
  },

  // 6. MEMBERSHIP / COMMUNITY
  {
    id: "membership", title: "Membership / Community", desc: "Exclusive gated community with membership tiers, content library, and networking.", category: "education", icon: Users,
    pages: ["Home", "What You Get", "Plans", "Join"],
    heroTitle: "The Inner Circle", heroTagline: "An exclusive community for ambitious builders",
    heroDescription: "Weekly masterclasses, curated resources, peer accountability, and direct mentor access. Your growth tribe awaits.",
    heroCta: "Join the Community", bannerImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      featuresSection([
        { title: "Weekly Live Sessions", desc: "Masterclasses with industry leaders every Thursday.", icon: "🎓" },
        { title: "Resource Vault", desc: "500+ templates, playbooks, guides, and tools.", icon: "📚" },
        { title: "Private Network", desc: "Connect with 1000+ ambitious professionals on Slack.", icon: "🤝" },
        { title: "Mentor Office Hours", desc: "Monthly 1:1 with experienced mentors.", icon: "💎" },
      ]),
      gallerySection([
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop",
      ]),
      pricingSection([
        { name: "Free", price: "₹0", period: "/mo", features: ["Community access", "Monthly newsletter", "Public events", "Job board"], highlighted: false },
        { name: "Pro", price: "₹999", period: "/mo", features: ["Everything in Free", "Weekly masterclasses", "Resource vault", "Private Slack channels", "Event recordings"], highlighted: true },
        { name: "VIP", price: "₹2,999", period: "/mo", features: ["Everything in Pro", "Monthly 1:1 mentoring", "Priority support", "Annual retreat invite", "Co-working passes"], highlighted: false },
      ]),
      statsSection([{ value: "1,000+", label: "Active Members" }, { value: "200+", label: "Resources" }, { value: "50+", label: "Masterclasses" }, { value: "98%", label: "Retention Rate" }]),
      testimonialsSection([
        { name: "Aditya S.", text: "The network alone is worth 10x the membership. Found my co-founder here!", rating: 5, avatar: "AS" },
        { name: "Kavya M.", text: "Weekly masterclasses are gold. Better than any MBA elective I've taken.", rating: 5, avatar: "KM" },
        { name: "Rohan D.", text: "The accountability groups keep me on track. Best professional investment.", rating: 5, avatar: "RD" },
      ]),
      googleReviewsSection(),
      faqSection([
        { q: "Can I cancel anytime?", a: "Yes, cancel anytime with one click. No lock-in or hidden fees." },
        { q: "How active is the community?", a: "Very! We have 50+ messages daily and weekly events with 100+ attendees." },
        { q: "Is this for beginners?", a: "We have members at all levels. The community is organized into interest-based channels." },
      ]),
      ctaBannerSection("Start Your Free Membership", "Join 1,000+ members. Upgrade to Pro anytime.", "Join Free"),
      newsletterSection(),
    ],
    pagesData: {
      "What You Get": {
        heroTitle: "What's Inside", heroTagline: "Everything included in your membership",
        heroDescription: "From live sessions to curated resources to a private network — here's exactly what you get when you join The Inner Circle.",
        heroCta: "Join Now", bannerImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Weekly Live Masterclasses", desc: "Every Thursday at 8 PM IST. Topics: tech, business, career, mindset.", icon: "🎓" },
            { title: "Resource Vault (500+)", desc: "Templates, playbooks, checklists, guides, and tools — all downloadable.", icon: "📚" },
            { title: "Private Slack Community", desc: "1,000+ members. Channels for tech, careers, freelancing, startups, and more.", icon: "💬" },
            { title: "Accountability Groups", desc: "Join a group of 5 peers. Weekly check-ins to stay on track.", icon: "🎯" },
          ]),
          featuresSection([
            { title: "Monthly Mentor 1:1 (VIP)", desc: "30-minute sessions with experienced mentors in your field.", icon: "💎" },
            { title: "Job Board", desc: "Exclusive job postings from partner companies. Members-first access.", icon: "💼" },
            { title: "Annual Retreat", desc: "VIP members get invited to our annual in-person retreat.", icon: "✈️" },
            { title: "Event Recordings", desc: "Can't attend live? All sessions are recorded and searchable.", icon: "🎥" },
          ]),
          gallerySection([
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop",
          ]),
          statsSection([{ value: "50+", label: "Masterclasses/Year" }, { value: "500+", label: "Resources" }, { value: "1,000+", label: "Members" }, { value: "15+", label: "Mentors" }]),
          ctaBannerSection("Ready to Join?", "Start free. Upgrade to Pro anytime.", "Join Free"),
        ],
      },
      "Plans": {
        heroTitle: "Membership Plans", heroTagline: "Start free, upgrade when ready",
        heroDescription: "Every plan includes community access and our monthly newsletter. Upgrade for masterclasses, resources, and mentoring.",
        heroCta: "Compare Plans", bannerImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=300&fit=crop",
        sections: [
          pricingSection([
            { name: "Free", price: "₹0", period: "/mo", features: ["Community Slack access", "Monthly newsletter", "Public events (quarterly)", "Job board", "Member directory"], highlighted: false },
            { name: "Pro", price: "₹999", period: "/mo", features: ["Everything in Free", "Weekly masterclasses (50+/year)", "Full resource vault (500+)", "Private Slack channels", "Event recordings library", "Accountability group matching"], highlighted: true },
            { name: "VIP", price: "₹2,999", period: "/mo", features: ["Everything in Pro", "Monthly 1:1 mentor session", "Priority support & responses", "Annual retreat invitation", "Co-working space passes (4/mo)", "Early access to new content"], highlighted: false },
          ]),
          faqSection([
            { q: "Can I switch between plans?", a: "Yes, upgrade or downgrade anytime. Changes take effect next billing cycle." },
            { q: "Is there a yearly discount?", a: "Yes! Pay annually for Pro at ₹9,999/year (save 17%) or VIP at ₹29,999/year (save 17%)." },
            { q: "Can my company pay?", a: "Absolutely. We provide invoices and support corporate billing." },
            { q: "What if I cancel?", a: "You keep access until end of billing period. No exit fees." },
          ]),
          testimonialsSection([
            { name: "Free Member", text: "Even the free tier is incredibly valuable. The community alone is worth it.", rating: 5, avatar: "FM" },
            { name: "Pro Member", text: "Upgraded after 1 week. The masterclasses are worth 10x the price.", rating: 5, avatar: "PM" },
            { name: "VIP Member", text: "Mentor sessions have accelerated my career growth like nothing else.", rating: 5, avatar: "VM" },
          ]),
        ],
      },
      "Join": {
        heroTitle: "Join The Inner Circle", heroTagline: "Start your journey today — it takes 30 seconds",
        heroDescription: "Fill in your details below to create your free account. You'll get instant access to the community, newsletter, and public events.",
        heroCta: "Create Free Account", bannerImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Instant Access", desc: "Get your Slack invite and welcome kit immediately.", icon: "⚡" },
            { title: "No Credit Card", desc: "Free tier requires no payment information.", icon: "🆓" },
            { title: "Upgrade Anytime", desc: "Try free, then upgrade to Pro or VIP when ready.", icon: "🚀" },
          ]),
          ctaBannerSection("1,000+ Members Can't Be Wrong", "Join the fastest-growing professional community in India.", "Join Free Now"),
        ],
      },
    },
    checkout: createCheckoutConfig(999, "Join Pro — ₹999/mo", [
      "Weekly live masterclasses",
      "Full resource vault (500+ items)",
      "Private Slack community",
      "Event recordings library",
      "Accountability group matching",
    ], [
      { id: "f_plan", label: "Membership Plan", type: "select", required: true, placeholder: "Select plan", options: ["Free (₹0/mo)", "Pro (₹999/mo)", "VIP (₹2,999/mo)"] },
    ]),
  },

  // ─── Services ───
  {
    id: "consulting", title: "Consulting Firm", desc: "Professional consulting with case studies and booking.", category: "services", icon: Briefcase,
    pages: ["Home", "Services", "Case Studies", "Book"],
    heroTitle: "Strategic Business Consulting", heroTagline: "Drive growth with data-driven strategies",
    heroDescription: "We partner with ambitious companies to solve complex challenges and unlock sustainable growth.",
    heroCta: "Schedule Consultation", bannerImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection(), servicesSection([{ title: "Growth Strategy", desc: "Market analysis and growth roadmaps.", icon: "📈" }, { title: "Digital Transformation", desc: "Modernize operations with technology.", icon: "🔄" }, { title: "Process Optimization", desc: "Streamline workflows for efficiency.", icon: "⚙️" }, { title: "M&A Advisory", desc: "Due diligence and integration support.", icon: "🤝" }]), clientsSection(), portfolioSection([{ title: "FinTech Startup — 300% Growth", category: "Strategy", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" }, { title: "E-commerce Scale-Up", category: "Digital", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop" }, { title: "Healthcare Platform Launch", category: "Advisory", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" }]), statsSection(), teamSection(), testimonialsSection(), googleReviewsSection(), faqSection(), newsletterSection()],
  },
  {
    id: "freelancer", title: "Freelancer Profile", desc: "Showcase skills, past work, and testimonials.", category: "services", icon: UserCheck,
    pages: ["Home", "Work", "Testimonials", "Hire Me"],
    heroTitle: "Freelance Designer & Developer", heroTagline: "Crafting digital experiences since 2018",
    heroDescription: "I help startups and small businesses build beautiful, high-converting websites and apps. Let's create something great together.",
    heroCta: "Hire Me", bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection("About Me", "I'm a full-stack designer-developer hybrid. 6 years of experience, 80+ projects, clients in 12 countries. I specialize in React, Next.js, and design systems."), servicesSection([{ title: "Web Design", desc: "Custom responsive websites.", icon: "🎨" }, { title: "Web Development", desc: "React & Next.js applications.", icon: "💻" }, { title: "UI/UX Design", desc: "User research to pixel-perfect UI.", icon: "📐" }]), portfolioSection(), statsSection([{ value: "80+", label: "Projects" }, { value: "45+", label: "Clients" }, { value: "12", label: "Countries" }, { value: "100%", label: "On Time" }]), testimonialsSection(), googleReviewsSection(), pricingSection([{ name: "Starter", price: "₹25,000", period: "", features: ["Landing page", "5 sections", "Mobile responsive", "2 revisions"], highlighted: false }, { name: "Standard", price: "₹50,000", period: "", features: ["Multi-page website", "CMS integration", "SEO setup", "5 revisions"], highlighted: true }, { name: "Custom", price: "Custom", period: "", features: ["Full web app", "Backend API", "Admin panel", "Ongoing support"], highlighted: false }]), newsletterSection()],
  },
  {
    id: "agency", title: "Creative Agency", desc: "Agency website with portfolio and client testimonials.", category: "services", icon: Store,
    pages: ["Home", "Work", "Team", "Clients"],
    heroTitle: "We Build Brands", heroTagline: "Full-service creative agency",
    heroDescription: "From brand strategy to digital execution, we create experiences that move people and drive results.",
    heroCta: "Start a Project", bannerImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection(), servicesSection([{ title: "Brand Strategy", desc: "Position your brand for growth.", icon: "🎯" }, { title: "Visual Identity", desc: "Logo, colors, typography, guidelines.", icon: "🎨" }, { title: "Web & Mobile", desc: "Custom digital products.", icon: "📱" }, { title: "Content & Social", desc: "Engaging content that converts.", icon: "📣" }]), portfolioSection(), clientsSection(["Swiggy", "Cred", "Meesho", "PhonePe", "Myntra", "UrbanClap"]), teamSection([{ name: "Ritu Sharma", role: "Creative Director", avatar: "RS", bio: "Ex-Ogilvy. 15 years in advertising." }, { name: "Deepak Nair", role: "Tech Lead", avatar: "DN", bio: "Full-stack architect. Built products at scale." }, { name: "Kavya Iyer", role: "Strategy Head", avatar: "KI", bio: "MBA, IIM-A. Growth marketing expert." }]), statsSection([{ value: "200+", label: "Projects" }, { value: "50+", label: "Clients" }, { value: "15+", label: "Awards" }, { value: "12", label: "Team Members" }]), testimonialsSection(), googleReviewsSection(), gallerySection(), ctaBannerSection("Let's Create Together", "Have a project in mind? We'd love to hear about it.", "Get in Touch"), newsletterSection()],
  },

  // ─── Payment Page: NGO Fund Raising ───
  {
    id: "pay-ngo-fundraise",
    layout: "payment-page" as const,
    title: "NGO Fundraiser",
    desc: "Single-page donation collection for NGOs and charities — fixed or custom amounts with instant 80G receipt.",
    category: "nonprofit",
    icon: Heart,
    pages: ["Home"],
    heroTitle: "Support Our Cause",
    heroTagline: "Every Contribution Creates Lasting Change",
    heroDescription: "Your donation directly funds education, healthcare, and livelihoods for underserved communities across India. Every rupee is accounted for — transparent, impactful, and tax-deductible under 80G.",
    heroCta: "Donate Now",
    bannerImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&h=300&fit=crop",
    sections: [
      impactSection(),
      statsSection([
        { value: "50K+", label: "Lives Impacted" },
        { value: "500+", label: "Villages Reached" },
        { value: "₹2.5Cr", label: "Raised Last Year" },
        { value: "92%", label: "Funds to Programs" },
      ]),
      testimonialsSection([
        { name: "Ramesh V.", text: "I've been donating for 3 years. The impact reports are detailed and trustworthy.", rating: 5, avatar: "RV" },
        { name: "Sunita K.", text: "The 80G certificate arrived instantly. Made my tax filing so much easier.", rating: 5, avatar: "SK" },
        { name: "Corporate Donor", text: "Transparent, efficient, and deeply committed to their mission.", rating: 5, avatar: "CD" },
      ]),
      faqSection([
        { q: "Is my donation tax-deductible?", a: "Yes, all donations are eligible for 50% deduction under Section 80G of the Income Tax Act." },
        { q: "How are funds used?", a: "92% of all donations go directly to programs. Full financial reports are published annually." },
        { q: "Will I get a receipt?", a: "Yes, an 80G donation receipt is emailed to you immediately after payment." },
        { q: "Can I donate a custom amount?", a: "Absolutely — enter any amount you're comfortable with during checkout." },
      ]),
    ],
    checkout: createCheckoutConfig(1000, "Donate Now", [
      "100% secure payment via Razorpay",
      "Instant 80G donation receipt by email",
      "92% of funds go directly to programs",
      "Tax-deductible under Section 80G",
      "Annual impact report shared with donors",
    ], [
      { id: "f_pan", label: "PAN Number (for 80G receipt)", type: "text", required: false, placeholder: "Enter PAN number" },
      { id: "f_message", label: "Dedication / Message (optional)", type: "textarea", required: false, placeholder: "Dedicate your donation or leave a message..." },
    ], { amountType: "custom" as const, amount: 1000 }),
  },

  // ─── Non-Profit ───
  {
    id: "ngo", title: "NGO / Charity", desc: "Cause page with impact stories and donation collection.", category: "nonprofit", icon: Heart,
    pages: ["Home", "Our Cause", "Impact", "Donate", "Volunteer"],
    heroTitle: "Building a Better Tomorrow", heroTagline: "Every contribution creates lasting change",
    heroDescription: "We work in education, healthcare, and sustainability to uplift communities across rural India. Join our mission.",
    heroCta: "Donate Now", bannerImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection("Our Mission", "Since 2015, we've been working tirelessly to provide education, clean water, and healthcare to underserved communities. Every rupee donated goes directly to impact."), impactSection(), statsSection([{ value: "50K+", label: "Lives Impacted" }, { value: "500+", label: "Villages Reached" }, { value: "100+", label: "Schools Built" }, { value: "92%", label: "Funds to Programs" }]), donationSection(), teamSection([{ name: "Dr. Lakshmi Rao", role: "Founder & Director", avatar: "LR", bio: "Social entrepreneur with 20 years in development." }, { name: "Suresh Menon", role: "Operations Head", avatar: "SM", bio: "MBA, managed programs across 10 states." }]), testimonialsSection([{ name: "Ramesh V.", text: "Volunteered for 2 years. The impact is real and measurable.", rating: 5, avatar: "RV" }, { name: "Corporate Partner", text: "Transparent, efficient, and deeply committed to their cause.", rating: 5, avatar: "CP" }]), googleReviewsSection(), gallerySection(), faqSection([{ q: "How are funds used?", a: "92% goes directly to programs. Full financial reports available." }, { q: "Can I volunteer?", a: "Yes! We welcome volunteers. Fill the contact form to get started." }, { q: "Is my donation tax-deductible?", a: "Yes, all donations are eligible for 80G tax benefits." }]), newsletterSection()],
  },
  {
    id: "fundraiser", title: "Fundraiser Campaign", desc: "Campaign page with progress bar and donate button.", category: "nonprofit", icon: Gift,
    pages: ["Campaign Page"],
    heroTitle: "Help Us Reach Our Goal", heroTagline: "Every contribution brings us closer",
    heroDescription: "We're raising ₹10,00,000 to build a new computer lab for 500 rural students. Help us make digital education accessible.",
    heroCta: "Contribute Now", bannerImage: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?w=900&h=300&fit=crop",
    sections: [heroSection(), donationSection(), impactSection(), statsSection([{ value: "₹7.5L", label: "Raised" }, { value: "75%", label: "Goal Reached" }, { value: "342", label: "Donors" }, { value: "15", label: "Days Left" }]), testimonialsSection([{ name: "Donor", text: "Proud to contribute to such a meaningful cause.", rating: 5, avatar: "D" }]), gallerySection(), faqSection(), newsletterSection(), googleReviewsSection()],
  },

  // ─── E-commerce ───

  // 1. FASHION D2C BRAND
  {
    id: "fashion-brand",
    title: "Fashion Brand Store",
    desc: "D2C fashion brand with new arrivals, sale section, size guides, and lifestyle-first design.",
    category: "ecommerce",
    icon: ShoppingBag,
    pages: ["Home", "New Arrivals", "Collections", "Sale"],
    heroTitle: "Summer '26 Collection",
    heroTagline: "Thread & Story — Contemporary Indian Womenswear",
    heroDescription: "Handblock prints, linen co-ords, and breezy summer dresses. Ethical craftsmanship meets everyday wearability. Free shipping above ₹999.",
    heroCta: "Shop New Arrivals",
    bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&h=400&fit=crop",
    sections: [
      heroSection(),
      statsSection([
        { value: "50K+", label: "Orders shipped" },
        { value: "4.8★", label: "Google rating" },
        { value: "Free", label: "Shipping ₹999+" },
        { value: "15 days", label: "Easy returns" },
      ]),
      featuresSection([
        { title: "Kurtas & Tops", desc: "Block prints, embroidery, and fusion silhouettes.", icon: "👘" },
        { title: "Co-ord Sets", desc: "Matching sets in linen, cotton, and crepe.", icon: "✨" },
        { title: "Dresses & Midis", desc: "From brunch to wedding — we have the dress.", icon: "👗" },
        { title: "Bottoms", desc: "Palazzos, trousers, and relaxed-fit skirts.", icon: "🪡" },
        { title: "Dupattas & Stoles", desc: "Hand-dyed and block-printed statement pieces.", icon: "🎨" },
        { title: "Sale — Upto 50% Off", desc: "End of season deals on past collections.", icon: "🏷️" },
      ]),
      productsSection([
        { title: "Ombre Block Print Kurta", price: "₹1,299", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=300&h=380&fit=crop", badge: "Bestseller", desc: "100% cotton. Hand block printed. Available S–XXL. Pairs perfectly with linen palazzos." },
        { title: "Linen Co-ord Set", price: "₹2,499", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=380&fit=crop", badge: "New Arrival", desc: "Relaxed linen top + wide-leg trouser. Lightweight and breathable. Perfect for summer travel." },
        { title: "Bagh Print Midi Dress", price: "₹1,899", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=380&fit=crop", badge: "Limited", desc: "Traditional Bagh print from Madhya Pradesh artisans. V-neck, flared hem. Only 40 pieces." },
        { title: "Handblock Dupatta", price: "₹799", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=380&fit=crop", badge: "New", desc: "Mul cotton. Hand block printed with natural dyes. 2.5 metres. Ships in a gift box." },
        { title: "Embroidered Palazzo Set", price: "₹3,199", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=380&fit=crop", badge: "Premium", desc: "Chikankari embroidered kurta with matching palazzo. Perfect for festive occasions." },
        { title: "Cotton Oversized Tee", price: "₹699", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=380&fit=crop", badge: "", desc: "180 GSM cotton. Garment-washed. Relaxed fit. 8 colours. Everyday essential." },
      ]),
      aboutSection(
        "Made with intention. Worn with joy.",
        "Thread & Story was born in 2019 from a single block-printing studio in Jaipur. We work directly with artisan clusters across Rajasthan, MP, and Gujarat — paying fair wages, documenting each craftsperson's story, and bringing their work to a new generation of Indian women."
      ),
      testimonialsSection([
        { name: "Priya Mehta, Bangalore", text: "The linen co-ord set is my most-worn piece this summer. The quality is genuinely better than what I've found at Zara or H&M.", rating: 5, avatar: "PM" },
        { name: "Ritu S., Delhi", text: "Ordered 3 times. Every kurta fits perfectly and the fabric is exactly as described. Their packaging is also beautiful — like unboxing a gift.", rating: 5, avatar: "RS" },
        { name: "Ananya K., Mumbai", text: "The Bagh print dress got so many compliments at a wedding. I love that I can actually tell people about the artisans who made it.", rating: 5, avatar: "AK" },
        { name: "Deepika V., Hyderabad", text: "Returns process was painless — raised a request, got a pickup the next day. Rare for small brands. Will keep buying.", rating: 4, avatar: "DV" },
      ]),
      googleReviewsSection(),
      gallerySection([
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1496217590455-aa63a8550c23?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=400&h=400&fit=crop",
      ]),
      faqSection([
        { q: "How do Indian sizes run?", a: "We follow standard Indian sizes: XS (32), S (34), M (36), L (38), XL (40), XXL (42). A detailed size chart is on each product page. When in doubt, size up." },
        { q: "What's the return/exchange policy?", a: "15-day returns from delivery date. Items must be unwashed and unworn with tags intact. Exchanges are free. Refunds processed in 5–7 business days." },
        { q: "How long does delivery take?", a: "Metro cities: 2–3 days. Tier 2/3: 4–6 days. All orders dispatched within 24 hours. Tracking link sent via WhatsApp." },
        { q: "Is cash on delivery available?", a: "Yes, COD is available on orders upto ₹5,000. A small convenience fee of ₹50 applies." },
        { q: "Do you ship internationally?", a: "We ship to UAE, UK, US, Canada, Singapore, and Australia. International shipping starts at ₹799." },
        { q: "Are the fabrics pre-washed?", a: "All block print pieces are pre-washed. We recommend gentle machine wash (cold) or hand wash for embroidered styles." },
      ]),
      ctaBannerSection("10% off your first order", "Sign up for early access to new drops and exclusive member pricing.", "Claim My Discount"),
      newsletterSection(),
    ],
    pagesData: {
      "New Arrivals": {
        heroTitle: "New Arrivals",
        heroTagline: "Summer '26 — Fresh drops every Tuesday",
        heroDescription: "Hand-picked new pieces added weekly. Block prints, linens, and summer silhouettes you'll actually wear every day.",
        heroCta: "Filter by Category",
        bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=300&fit=crop",
        sections: [
          productsSection([
            { title: "Linen Co-ord Set", price: "₹2,499", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=380&fit=crop", badge: "New This Week", desc: "Relaxed linen top + wide-leg trouser. Lightweight and breathable." },
            { title: "Bagh Print Midi Dress", price: "₹1,899", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=380&fit=crop", badge: "Just Dropped", desc: "Traditional Bagh print. V-neck, flared hem. Only 40 pieces." },
            { title: "Handblock Dupatta", price: "₹799", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=380&fit=crop", badge: "New", desc: "Mul cotton. Natural dyes. 2.5 metres. Ships in a gift box." },
            { title: "Ikat Kurta Set", price: "₹2,199", image: "https://images.unsplash.com/photo-1614771637369-ed94441a651b?w=300&h=380&fit=crop", badge: "New", desc: "Handwoven Pochampally ikat. Short kurta + flared pants." },
            { title: "Stripe Linen Shirt Dress", price: "₹1,699", image: "https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2?w=300&h=380&fit=crop", badge: "Trending", desc: "Button-down shirt dress in stripe linen. Belted waist. Pockets." },
            { title: "Embroidered Anarkali Top", price: "₹1,499", image: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=300&h=380&fit=crop", badge: "New", desc: "Chikankari embroidery on georgette. Flowy anarkali silhouette." },
          ]),
          ctaBannerSection("New drops every Tuesday", "Enable notifications so you never miss a launch.", "Subscribe to Drops"),
        ],
      },
      "Collections": {
        heroTitle: "Our Collections",
        heroTagline: "Curated by occasion, crafted by artisans",
        heroDescription: "Whether it's a lazy Sunday brunch or a festive family function — we have a collection for every moment.",
        heroCta: "Shop Collections",
        bannerImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Everyday Essentials", desc: "Comfortable, breathable pieces for work, errands, and everything in between.", icon: "☀️" },
            { title: "Festive Edit", desc: "Embroidered kurtas, silk co-ords, and statement dupattas for special occasions.", icon: "✨" },
            { title: "Travel Wardrobe", desc: "Wrinkle-resistant, packable, and effortlessly stylish. Made for the modern traveller.", icon: "🧳" },
            { title: "The Artisan Series", desc: "Limited-edition pieces from craftsperson clusters. Each piece is numbered.", icon: "🎨" },
          ]),
          productsSection([
            { title: "Ombre Block Print Kurta", price: "₹1,299", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=300&h=380&fit=crop", badge: "Bestseller", desc: "Everyday Essentials. 100% cotton. Available S–XXL." },
            { title: "Embroidered Palazzo Set", price: "₹3,199", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=380&fit=crop", badge: "Festive Edit", desc: "Chikankari embroidered kurta + palazzo. For festive occasions." },
            { title: "Linen Co-ord Set", price: "₹2,499", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=380&fit=crop", badge: "Travel Pick", desc: "Lightweight, breathable. Wrinkle-resistant linen." },
            { title: "Bagh Print Midi Dress", price: "₹1,899", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=380&fit=crop", badge: "Artisan Series", desc: "Traditional Bagh print. Only 40 pieces made." },
          ]),
        ],
      },
      "Sale": {
        heroTitle: "End of Season Sale",
        heroTagline: "Upto 50% off — while stocks last",
        heroDescription: "Clearance prices on past season pieces. Same quality, better price. No restocks after these sell out.",
        heroCta: "Shop Sale",
        bannerImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&h=300&fit=crop",
        sections: [
          statsSection([
            { value: "50%", label: "Max discount" },
            { value: "200+", label: "Sale styles" },
            { value: "No", label: "Restocks" },
            { value: "Free", label: "Shipping ₹999+" },
          ]),
          productsSection([
            { title: "Cotton Kurta (was ₹1,299)", price: "₹649", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=300&h=380&fit=crop", badge: "50% Off", desc: "Spring '25 edition. 100% cotton. Select sizes remaining." },
            { title: "Embroidered Top (was ₹1,899)", price: "₹999", image: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=300&h=380&fit=crop", badge: "47% Off", desc: "Chikankari on cotton. Limited pieces left." },
            { title: "Linen Shirt Dress (was ₹1,699)", price: "₹999", image: "https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2?w=300&h=380&fit=crop", badge: "41% Off", desc: "Button-down. Belted. Pockets. Very few left." },
            { title: "Co-ord Set (was ₹2,499)", price: "₹1,499", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=380&fit=crop", badge: "40% Off", desc: "Linen blend. S and M only remaining." },
          ]),
          ctaBannerSection("Move fast — no restocks", "Sale items won't come back. Grab yours before they're gone.", "Shop All Sale"),
        ],
      },
    },
    checkout: createCheckoutConfig(1299, "Add to Bag — ₹1,299", [
      "Ombre Block Print Kurta",
      "100% handblock printed cotton",
      "Sizes: XS to XXL available",
      "Free shipping above ₹999",
      "15-day easy returns",
      "Dispatched within 24 hours",
    ], [
      { id: "f_size", label: "Size", type: "select", required: true, placeholder: "Select your size", options: ["XS (32)", "S (34)", "M (36)", "L (38)", "XL (40)", "XXL (42)"] },
      { id: "f_color", label: "Colour", type: "select", required: false, placeholder: "Select colour", options: ["Indigo Blue", "Terracotta", "Sage Green", "Dusty Rose", "Ivory"] },
    ]),
  },

  // 2. SKINCARE / BEAUTY BRAND
  {
    id: "skincare-brand",
    title: "Skincare Brand",
    desc: "Science-backed D2C skincare brand with routine builder, ingredient transparency, and skin-concern navigation.",
    category: "ecommerce",
    icon: ShoppingBag,
    pages: ["Home", "Shop by Concern", "Routines", "About"],
    heroTitle: "Skin that speaks for itself",
    heroTagline: "Skin Ritual — Evidence-based skincare for Indian skin",
    heroDescription: "No fluff, no fillers. Just science-backed actives at effective concentrations. Build your routine in 3 steps — cleanser, active, moisturiser.",
    heroCta: "Build My Routine",
    bannerImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=900&h=400&fit=crop",
    sections: [
      heroSection(),
      statsSection([
        { value: "2L+", label: "Happy customers" },
        { value: "4.9★", label: "Average rating" },
        { value: "Dermat", label: "Tested & approved" },
        { value: "0", label: "Harmful fillers" },
      ]),
      featuresSection([
        { title: "Dark Spots & Pigmentation", desc: "Niacinamide, Vitamin C, and Alpha Arbutin target stubborn hyperpigmentation.", icon: "🌟" },
        { title: "Hydration & Barrier Repair", desc: "Hyaluronic Acid and Ceramides restore moisture balance for dry, dehydrated skin.", icon: "💧" },
        { title: "Anti-Aging & Firmness", desc: "0.1% Retinol and Peptide Complex reduce fine lines and improve elasticity.", icon: "✨" },
        { title: "Acne & Oily Skin", desc: "Salicylic Acid and Zinc control breakouts and regulate sebum production.", icon: "🌿" },
        { title: "Brightening & Glow", desc: "5% Vitamin C Serum and Kojic Acid for a visible glow in 4 weeks.", icon: "☀️" },
        { title: "Sun Protection", desc: "SPF 50 PA+++ broad-spectrum protection with no white cast.", icon: "🛡️" },
      ]),
      productsSection([
        { title: "10% Niacinamide Serum", price: "₹649", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop", badge: "Bestseller", desc: "Fades dark spots, minimises pores, controls oil. All skin types. 30ml." },
        { title: "0.1% Retinol Night Cream", price: "₹899", image: "https://images.unsplash.com/photo-1611080626919-7cf5a9041525?w=300&h=300&fit=crop", badge: "Popular", desc: "Buffered retinol in a ceramide base. Reduces fine lines. For beginners and intermediates. 30ml." },
        { title: "SPF 50 Matte Sunscreen", price: "₹549", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=300&fit=crop", badge: "New Launch", desc: "PA+++ broad-spectrum. Zero white cast. Lightweight gel texture. 50ml." },
        { title: "5% Vitamin C Serum", price: "₹749", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop", badge: "New", desc: "Stable ethyl ascorbic acid. Brightens and evens skin tone. Use AM before SPF. 30ml." },
        { title: "Hyaluronic Acid Moisturiser", price: "₹699", image: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=300&h=300&fit=crop", badge: "", desc: "3-weight HA + ceramides. Deep hydration without greasiness. All skin types. 50ml." },
        { title: "AHA BHA Exfoliating Toner", price: "₹499", image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop", badge: "Starter Pick", desc: "2% salicylic + 5% lactic acid. Unclogs pores, smooths texture. Use 3x a week." },
      ]),
      aboutSection(
        "Formulated for Indian skin. Not just adapted from it.",
        "Indian skin has unique concerns — heavy melanin, humidity-induced oiliness, pollution, and sun intensity that Western formulations never account for. We built Skin Ritual from the ground up with a team of dermatologists based in India. Every active is concentration-tested. Every formula is clinically trialled. No greenwashing. No fragrance. No compromise."
      ),
      testimonialsSection([
        { name: "Kavitha R., Chennai", text: "The Niacinamide serum genuinely faded my post-acne marks in 6 weeks. I've spent so much on 'brightening' products before — this is the first one that actually worked.", rating: 5, avatar: "KR" },
        { name: "Surbhi M., Delhi", text: "The SPF has no white cast — I repeat, NO WHITE CAST — on my NC45 skin. I've been looking for this for years.", rating: 5, avatar: "SM" },
        { name: "Neha P., Pune", text: "I introduced the Retinol cream slowly as instructed and had zero irritation. Fine lines visibly reduced after 3 months.", rating: 5, avatar: "NP" },
        { name: "Divya S., Bangalore", text: "I love that they explain what each ingredient does and at what concentration. Feels like buying from a brand that respects your intelligence.", rating: 4, avatar: "DS" },
      ]),
      googleReviewsSection(),
      faqSection([
        { q: "Which serum should I start with?", a: "Dark spots/pigmentation: Niacinamide. Dull skin: Vitamin C. Acne: AHA BHA Toner. Anti-aging: Retinol (start with 2 nights/week)." },
        { q: "Can I use Vitamin C and Niacinamide together?", a: "Yes! Both are stable and effective together. Use Vitamin C in the morning; Niacinamide can be used AM or PM." },
        { q: "How long before I see results?", a: "Niacinamide: 4–6 weeks. Vitamin C: 4–8 weeks. Retinol: 8–12 weeks. Consistency is key." },
        { q: "Is patch testing necessary?", a: "We recommend a 24-hour patch test behind the ear for first-time users, especially for Retinol and AHA BHA." },
        { q: "What's the return policy?", a: "7-day returns on unopened/sealed products. If you experience a reaction, contact us — we'll make it right." },
        { q: "Are your products cruelty-free?", a: "100% cruelty-free. Not tested on animals. Most products are also vegan — check individual product pages." },
      ]),
      clientsSection(["Vogue India", "Femina", "Cosmopolitan", "Healthshots", "iDiva", "Hindustan Times"]),
      ctaBannerSection("Not sure where to start?", "Take our 2-minute skin quiz and get a personalised routine recommendation.", "Take the Skin Quiz"),
      newsletterSection(),
    ],
    pagesData: {
      "Shop by Concern": {
        heroTitle: "Shop by Skin Concern",
        heroTagline: "Find exactly what your skin needs",
        heroDescription: "Every product page includes the active ingredient, its concentration, and the science behind it.",
        heroCta: "Browse All Products",
        bannerImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Dark Spots", desc: "Niacinamide 10% • Alpha Arbutin • Vitamin C 5%", icon: "🌟" },
            { title: "Acne & Pores", desc: "Salicylic Acid 2% • Niacinamide • AHA BHA Toner", icon: "🌿" },
            { title: "Anti-Aging", desc: "Retinol 0.1% • Peptide Complex • Hyaluronic Acid", icon: "✨" },
            { title: "Dryness", desc: "Hyaluronic Acid • Ceramides • Squalane Moisturiser", icon: "💧" },
          ]),
          productsSection([
            { title: "10% Niacinamide Serum", price: "₹649", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop", badge: "Dark Spots", desc: "Best for: dark spots, open pores, oily skin. AM + PM." },
            { title: "5% Vitamin C Serum", price: "₹749", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop", badge: "Brightening", desc: "Best for: dull skin, pigmentation, brightening. AM only." },
            { title: "0.1% Retinol Night Cream", price: "₹899", image: "https://images.unsplash.com/photo-1611080626919-7cf5a9041525?w=300&h=300&fit=crop", badge: "Anti-Aging", desc: "Best for: fine lines, texture, firmness. PM only (2–3x/week)." },
            { title: "AHA BHA Exfoliating Toner", price: "₹499", image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop", badge: "Acne + Texture", desc: "Best for: clogged pores, acne, uneven texture. PM, 3x/week." },
            { title: "Hyaluronic Acid Moisturiser", price: "₹699", image: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=300&h=300&fit=crop", badge: "Hydration", desc: "Best for: dehydrated and dry skin. AM + PM after actives." },
            { title: "SPF 50 Matte Sunscreen", price: "₹549", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=300&fit=crop", badge: "Sun Damage", desc: "Last step AM routine. Reapply every 2–3 hours outdoors." },
          ]),
        ],
      },
      "Routines": {
        heroTitle: "Build Your Routine",
        heroTagline: "Starter routines from ₹1,247",
        heroDescription: "A good routine is just 3 steps. Cleanser → Active → Moisturiser + SPF in the morning. We've built the bundles.",
        heroCta: "Shop Routines",
        bannerImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&h=300&fit=crop",
        sections: [
          pricingSection([
            { name: "Starter Routine", price: "₹1,247", period: "", features: ["Niacinamide Serum (₹649)", "Hyaluronic Moisturiser (₹699) — save ₹101", "Perfect for routine beginners", "AM + PM 3-step routine"], highlighted: false },
            { name: "Glow Routine", price: "₹1,697", period: "", features: ["Vitamin C Serum (₹749)", "SPF 50 Sunscreen (₹549)", "Hyaluronic Moisturiser (₹699) — save ₹300", "Best for brightening + sun protection"], highlighted: true },
            { name: "Anti-Aging Routine", price: "₹2,047", period: "", features: ["Retinol Night Cream (₹899)", "Niacinamide Serum (₹649)", "Hyaluronic Moisturiser (₹699) — save ₹200", "Best for fine lines + dark spots"], highlighted: false },
          ]),
          featuresSection([
            { title: "Save 10–15%", desc: "All routine bundles are discounted vs buying individually.", icon: "💰" },
            { title: "Routine Guide Included", desc: "Each bundle ships with a printed AM/PM routine card.", icon: "📋" },
            { title: "Expert Support", desc: "Chat with our skin advisor if you need personalised help.", icon: "💬" },
          ]),
        ],
      },
      "About": {
        heroTitle: "Why we built Skin Ritual",
        heroTagline: "Skin science built around Indian skin",
        heroDescription: "We got tired of Western serums that didn't account for Indian skin tones, climate, and concerns. So we built our own.",
        heroCta: "Our Formulation Philosophy",
        bannerImage: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=900&h=300&fit=crop",
        sections: [
          aboutSection("The problem with imported skincare", "Most skincare brands formulate for Fitzpatrick types 1–3 — essentially for lighter skin. Indian skin — ranging from type 3 to 6 — has higher melanin, more hyperpigmentation risk, and different barrier characteristics. We partnered with dermatologists in Chennai and Mumbai to develop formulations that address what Indian skin actually needs."),
          featuresSection([
            { title: "Dermatologist Developed", desc: "Every formula co-developed with board-certified dermatologists.", icon: "👩‍⚕️" },
            { title: "Clinically Tested", desc: "All products tested in a NABL-accredited lab in India.", icon: "🔬" },
            { title: "No Harmful Fillers", desc: "No parabens, no mineral oil, no synthetic fragrance, no sulfates.", icon: "🌿" },
            { title: "Transparent Actives", desc: "We publish every active and its concentration. No hiding behind 'proprietary blends'.", icon: "📊" },
          ]),
          statsSection([{ value: "15+", label: "Dermatologists on board" }, { value: "2L+", label: "Customers" }, { value: "4.9★", label: "Average rating" }, { value: "2020", label: "Founded" }]),
        ],
      },
    },
    checkout: createCheckoutConfig(649, "Add to Cart — ₹649", [
      "10% Niacinamide Serum (30ml)",
      "Fades dark spots & minimises pores",
      "Suitable for all skin types",
      "Dermatologist-tested formula",
      "Free shipping above ₹599",
      "7-day return policy",
    ], [
      { id: "f_skin", label: "Skin Type", type: "select", required: false, placeholder: "Your skin type (optional)", options: ["Oily", "Dry", "Combination", "Normal", "Sensitive"] },
    ]),
  },

  // 3. ARTISAN FOOD STORE
  {
    id: "artisan-food",
    title: "Artisan Food Store",
    desc: "Handcrafted specialty food brand with gifting collections, seasonal produce, and a strong origin story.",
    category: "ecommerce",
    icon: ShoppingBag,
    pages: ["Home", "Shop", "Gift Sets", "Our Story"],
    heroTitle: "Made in small batches. Loved in every kitchen.",
    heroTagline: "The Good Pantry — Artisan preserves & specialty foods",
    heroDescription: "Handcrafted jams, nut butters, and condiments from heritage fruits and local farms. No preservatives. No artificial anything. Just real food with real flavour.",
    heroCta: "Shop Bestsellers",
    bannerImage: "https://images.unsplash.com/photo-1506368083636-6defb67639a3?w=900&h=400&fit=crop",
    sections: [
      heroSection(),
      statsSection([
        { value: "25K+", label: "Jars sold" },
        { value: "Ships", label: "PAN India" },
        { value: "0", label: "Preservatives" },
        { value: "100%", label: "Natural" },
      ]),
      productsSection([
        { title: "Alphonso Mango Preserve", price: "₹329", image: "https://images.unsplash.com/photo-1597210291903-4ef2b2825e33?w=300&h=300&fit=crop", badge: "Seasonal", desc: "Made with Devgad Alphonso mangoes. No added pectin. 240g glass jar. Limited May–June." },
        { title: "Kashmiri Walnut Honey", price: "₹549", image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=300&h=300&fit=crop", badge: "Premium", desc: "Raw mountain honey from Kashmiri beekeepers blended with hand-broken Kashmiri walnuts. 300g." },
        { title: "Smoked Chilli Peanut Butter", price: "₹449", image: "https://images.unsplash.com/photo-1575487394938-0ad303c87a26?w=300&h=300&fit=crop", badge: "Bestseller", desc: "Stone-ground peanuts. Smoked red chillies. Zero palm oil. Crunchy texture. 350g." },
        { title: "Wild Forest Berry Jam", price: "₹299", image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=300&h=300&fit=crop", badge: "Popular", desc: "Jamun, karonda, and wild cape gooseberry. Low-sugar. Pairs perfectly with sourdough. 240g." },
        { title: "Ladakhi Apricot Preserve", price: "₹379", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&h=300&fit=crop", badge: "", desc: "Sun-dried Ladakhi apricots slow-cooked with raw cane sugar. 240g." },
        { title: "The Pantry Essentials Box", price: "₹1,299", image: "https://images.unsplash.com/photo-1543342384-1f1350e27861?w=300&h=300&fit=crop", badge: "Gift Pick", desc: "Our 4 bestsellers in a handcrafted wooden box. Perfect for gifting. Includes a handwritten note." },
      ]),
      featuresSection([
        { title: "No Preservatives", desc: "Every product is made without chemical preservatives or artificial colours.", icon: "🌿" },
        { title: "Small-Batch Made", desc: "Never more than 200 jars per batch. Quality over quantity, always.", icon: "🫙" },
        { title: "Farm to Jar", desc: "We source directly from named farms — you know exactly where your food comes from.", icon: "🌾" },
        { title: "Glass Packaging", desc: "All our jars are glass and 100% recyclable. No plastic packaging.", icon: "♻️" },
      ]),
      aboutSection(
        "A kitchen experiment that grew into something real.",
        "The Good Pantry started in 2020 when Priya and Anand — both ex-restaurant industry — couldn't find preserves made the way their grandmothers made them. No shortcuts, no stabilisers, just fruit, sugar, and time. They began selling jars to neighbours in Bangalore. Three years later, 25,000 jars have found their way to kitchens across India."
      ),
      testimonialsSection([
        { name: "Shruti K., Mumbai", text: "The Alphonso Mango Preserve is so intensely mango-flavoured that I nearly cried. Tastes exactly like the pickle my grandmother used to make in summer.", rating: 5, avatar: "SK" },
        { name: "Aditya V., Hyderabad", text: "The Smoked Chilli Peanut Butter is an absolute revelation. I've been through 4 jars in 2 months. Slightly dangerous.", rating: 5, avatar: "AV" },
        { name: "Meena R., Chennai", text: "Gifted the Pantry Essentials box for a housewarming and everyone wanted to know where it came from. Packaging is gorgeous.", rating: 5, avatar: "MR" },
        { name: "Corporate Team, Delhi", text: "Ordered 40 boxes for Diwali gifting. The team was incredibly helpful with customisation. Will repeat every year.", rating: 5, avatar: "CT" },
      ]),
      googleReviewsSection(),
      gallerySection([
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1543342384-1f1350e27861?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1506368083636-6defb67639a3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=400&fit=crop",
      ]),
      clientsSection(["Conde Nast Traveller", "Vogue India", "The Hindu", "Economic Times", "Scroll.in", "Zomato Blog"]),
      faqSection([
        { q: "How long do the preserves last?", a: "Unopened: 12 months from manufacture date (printed on lid). Once opened: refrigerate and consume within 3–4 weeks." },
        { q: "Do you use any preservatives?", a: "Never. Our shelf stability comes from proper pH balance and high sugar concentration — just like your grandmother did it." },
        { q: "How long does shipping take?", a: "2–4 business days across India. All jars are individually bubble-wrapped. We've never had a breakage claim." },
        { q: "Can I customise a gift box?", a: "Yes! Choose any 4+ products and we'll pack them with a handwritten note. Minimum order ₹1,499 for custom boxes." },
      ]),
      ctaBannerSection("Build a custom gift box", "Seasonal fruits. Handcrafted in Bangalore. Delivered across India.", "Design My Gift Box"),
      newsletterSection(),
    ],
    pagesData: {
      "Shop": {
        heroTitle: "The Full Pantry",
        heroTagline: "Small-batch. No shortcuts.",
        heroDescription: "Every jar is made in our Bangalore production kitchen. We publish the sourcing story, farm location, and ingredient list for everything we make.",
        heroCta: "Browse All Products",
        bannerImage: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "Jams & Preserves", desc: "Seasonal fruit jams with no artificial pectin or stabilisers.", icon: "🫙" },
            { title: "Nut Butters", desc: "Stone-ground almond, peanut, and mixed-nut butters.", icon: "🥜" },
            { title: "Honeys", desc: "Single-origin raw honeys from mountain beekeepers.", icon: "🍯" },
            { title: "Condiments", desc: "Chutneys, hot sauces, and spreads for the adventurous palate.", icon: "🌶️" },
          ]),
          productsSection([
            { title: "Alphonso Mango Preserve", price: "₹329", image: "https://images.unsplash.com/photo-1597210291903-4ef2b2825e33?w=300&h=300&fit=crop", badge: "Seasonal", desc: "Devgad Alphonso mangoes. No pectin. 240g." },
            { title: "Kashmiri Walnut Honey", price: "₹549", image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=300&h=300&fit=crop", badge: "Premium", desc: "Raw mountain honey + Kashmiri walnuts. Cold-process. 300g." },
            { title: "Smoked Chilli Peanut Butter", price: "₹449", image: "https://images.unsplash.com/photo-1575487394938-0ad303c87a26?w=300&h=300&fit=crop", badge: "Bestseller", desc: "Stone-ground. Smoked chillies. No palm oil. Crunchy. 350g." },
            { title: "Wild Forest Berry Jam", price: "₹299", image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=300&h=300&fit=crop", badge: "Popular", desc: "Jamun + karonda + cape gooseberry. Low-sugar. 240g." },
            { title: "Ladakhi Apricot Preserve", price: "₹379", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&h=300&fit=crop", badge: "", desc: "Sun-dried apricots. Raw cane sugar. 240g glass jar." },
            { title: "Green Chilli Pickle", price: "₹279", image: "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?w=300&h=300&fit=crop", badge: "New", desc: "Andhra-style green chilli pickle. Mustard oil, fresh garlic. 250g." },
            { title: "Almond Butter (Dark Roast)", price: "₹599", image: "https://images.unsplash.com/photo-1608188329487-5e80d9f96ca9?w=300&h=300&fit=crop", badge: "", desc: "Whole dark-roasted almonds. No additives. Silky smooth. 280g." },
            { title: "The Pantry Essentials Box", price: "₹1,299", image: "https://images.unsplash.com/photo-1543342384-1f1350e27861?w=300&h=300&fit=crop", badge: "Gift Pick", desc: "4 bestsellers. Handcrafted wooden box. Handwritten note included." },
          ]),
        ],
      },
      "Gift Sets": {
        heroTitle: "Give a Good Pantry Gift",
        heroTagline: "The gift that fills kitchens with joy",
        heroDescription: "Every occasion calls for something thoughtful. Our gift boxes are curated, beautifully packed, and deeply personal.",
        heroCta: "Build a Gift Box",
        bannerImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&h=300&fit=crop",
        sections: [
          pricingSection([
            { name: "The Starter Box", price: "₹899", period: "", features: ["2 artisan preserves", "1 nut butter", "Handwritten note", "Kraft paper packaging"], highlighted: false },
            { name: "The Pantry Essentials", price: "₹1,299", period: "", features: ["4 bestseller jars", "Handcrafted wooden box", "Recipe cards", "Personalised handwritten note"], highlighted: true },
            { name: "The Grand Hamper", price: "₹2,499", period: "", features: ["7 artisan products", "Premium wooden crate", "2 artisan crackers pack", "Personalised note + branded ribbon"], highlighted: false },
          ]),
          featuresSection([
            { title: "Corporate Gifting", desc: "Minimum 20 boxes. Custom branding available. GST invoice provided.", icon: "🏢" },
            { title: "Customise Your Box", desc: "Choose any 4+ products and we'll box it up. Starting ₹1,499.", icon: "✏️" },
            { title: "Pan-India Delivery", desc: "Ships everywhere in India. 3–5 business days. Tracked dispatch.", icon: "🚚" },
          ]),
          ctaBannerSection("Corporate gifting? We've got you.", "50+ boxes for Diwali, Christmas, or employee appreciation. Custom branding. GST invoice.", "Enquire Now"),
        ],
      },
      "Our Story": {
        heroTitle: "Where it all started",
        heroTagline: "A kitchen in Bangalore. A problem worth solving.",
        heroDescription: "Why are the best-tasting preserves always homemade? We decided to bring that home cooking to everyone's kitchen.",
        heroCta: "Meet the Founders",
        bannerImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=300&fit=crop",
        sections: [
          aboutSection("Priya & Anand — co-founders", "Both of us worked in Bangalore's restaurant industry for 10 years — Priya as a pastry chef, Anand as a forager and sous chef. When we had our daughter in 2020, we wanted to feed her real food. We couldn't find preserves without additives anywhere. So we made our own. The first 50 jars sold out in a day."),
          featuresSection([
            { title: "Farm to Jar", desc: "We visit every farm we source from. Farm names appear on each jar label.", icon: "🌾" },
            { title: "No middlemen", desc: "Direct sourcing means better prices for farmers and better produce for you.", icon: "🤝" },
            { title: "Published recipes", desc: "Every jar comes with a QR linking to recipes and food pairings.", icon: "📱" },
            { title: "B Corp pending", desc: "In the process of B Corp certification. We take social and environmental impact seriously.", icon: "🌍" },
          ]),
          statsSection([{ value: "2020", label: "Founded" }, { value: "25K+", label: "Jars sold" }, { value: "12", label: "Source farms" }, { value: "100%", label: "Natural" }]),
        ],
      },
    },
    checkout: createCheckoutConfig(449, "Add to Cart — ₹449", [
      "Smoked Chilli Peanut Butter (350g)",
      "Stone-ground, no palm oil",
      "Handcrafted in small batches",
      "Free shipping above ₹699",
      "Ships PAN India",
      "100% natural, no preservatives",
    ]),
  },

  // 4. DIGITAL CREATOR STORE
  {
    id: "creator-store",
    title: "Digital Creator Store",
    desc: "Sell Lightroom presets, Canva templates & digital products with instant delivery and a creator-first brand.",
    category: "ecommerce",
    icon: FileText,
    pages: ["Home", "Presets", "Templates", "Free Downloads"],
    heroTitle: "One click. Pro results.",
    heroTagline: "Pixel & Craft — Lightroom presets & Canva templates for creators",
    heroDescription: "Stop spending hours editing. Our presets and templates give your photos and content a consistent, professional look in seconds. Used by 10,000+ photographers and creators.",
    heroCta: "Shop Bestsellers",
    bannerImage: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&h=400&fit=crop",
    sections: [
      heroSection(),
      statsSection([
        { value: "10K+", label: "Happy creators" },
        { value: "4.9★", label: "Average rating" },
        { value: "Instant", label: "Download" },
        { value: "Commercial", label: "License included" },
      ]),
      productsSection([
        { title: "Film Noir Preset Pack", price: "₹699", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&h=300&fit=crop", badge: "Bestseller", desc: "12 moody, film-inspired Lightroom presets. Works on RAW and JPEG. Desktop + Mobile DNG included." },
        { title: "Golden Hour Collection", price: "₹549", image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=300&h=300&fit=crop", badge: "Popular", desc: "8 warm-toned presets for sunset and golden hour photography. Wedding and travel photographers love this." },
        { title: "Minimal Brand Canva Kit", price: "₹999", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop", badge: "Popular", desc: "70-page Canva template kit for Instagram, Stories, Reels covers, and pitch decks. 3 colour palettes." },
        { title: "Instagram Carousel Pack", price: "₹399", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=300&fit=crop", badge: "New", desc: "20 carousel layouts for creators, coaches, and brands. Canva + Figma formats." },
        { title: "Wedding Preset Bundle", price: "₹1,499", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=300&fit=crop", badge: "Pro Pick", desc: "25 presets for wedding photography — from bright and airy to moody and romantic. Loved by 800+ photographers." },
        { title: "Complete Creator Bundle", price: "₹2,499", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=300&fit=crop", badge: "Best Value", desc: "Everything — 45 presets + Full Canva Kit. Save ₹1,247 vs buying separately." },
      ]),
      featuresSection([
        { title: "Instant Download", desc: "Files delivered to your email within 60 seconds of payment.", icon: "⚡" },
        { title: "Desktop + Mobile", desc: "All presets include XMP (desktop) and DNG (Lightroom Mobile) files.", icon: "📱" },
        { title: "Free Lifetime Updates", desc: "Buy once, get all future updates to the pack for free.", icon: "🔄" },
        { title: "Commercial License", desc: "Use in client work, paid projects, and monetised content.", icon: "📄" },
        { title: "Works on Free Lightroom", desc: "Lightroom Mobile is free. Our DNG files work without a subscription.", icon: "📸" },
        { title: "Video Tutorial Included", desc: "Every pack includes a 10-minute install and customisation guide.", icon: "🎬" },
      ]),
      testimonialsSection([
        { name: "Rohini P., Wedding Photographer, Pune", text: "The Wedding Bundle saved me 2 hours per wedding. My editing is finally consistent across 500 photos. Clients actually comment on the quality now.", rating: 5, avatar: "RP" },
        { name: "Siddharth G., Content Creator, Delhi", text: "The Minimal Brand Kit transformed my Instagram. I used to spend 45 mins per post. Now it's 10. My engagement is up 30%.", rating: 5, avatar: "SG" },
        { name: "Meenakshi V., Travel Photographer", text: "Golden Hour presets are incredible for Rajasthan and Goa light. Exactly the warmth I was looking for without the orange oversaturation.", rating: 5, avatar: "MV" },
        { name: "Ajay K., Brand Photographer, Bangalore", text: "Film Noir gave my urban portraits exactly the editorial edge my clients wanted. Easy to adapt and commercially usable.", rating: 4, avatar: "AK" },
      ]),
      googleReviewsSection(),
      faqSection([
        { q: "How do I get my files after purchase?", a: "Download link in your email within 60 seconds of payment. Valid for 7 days and 3 downloads." },
        { q: "Do I need a Lightroom subscription?", a: "No! Our DNG files work on the free Lightroom Mobile app (iOS & Android). For desktop, Lightroom Classic or CC is needed." },
        { q: "Are Canva templates compatible with free Canva?", a: "Most templates work with free Canva. Templates using Pro elements are clearly marked." },
        { q: "Can I use these in client projects?", a: "Yes. Our commercial license covers all paid client work, social media content, advertising, and print." },
        { q: "Do you offer refunds?", a: "Generally no — digital products are non-refundable. But if files are corrupted or not as described, contact us and we'll sort it immediately." },
        { q: "How do I install presets on Lightroom Mobile?", a: "Save the DNG file to your phone → open in Lightroom Mobile → tap the three dots → Copy Settings → apply to any photo. A step-by-step video is included with every purchase." },
      ]),
      ctaBannerSection("Try before you buy", "Download 3 free presets and 5 free Canva templates — no email required.", "Get Free Samples"),
      newsletterSection(),
    ],
    pagesData: {
      "Presets": {
        heroTitle: "Lightroom Preset Packs",
        heroTagline: "Professional edits in one click",
        heroDescription: "Every preset works on RAW and JPEG. Every pack includes desktop XMP and mobile DNG files. Every purchase includes a video install guide.",
        heroCta: "Browse All Presets",
        bannerImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=300&fit=crop",
        sections: [
          productsSection([
            { title: "Film Noir Preset Pack", price: "₹699", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&h=300&fit=crop", badge: "Bestseller", desc: "12 moody, cinematic presets. Best for portraits, street, editorial." },
            { title: "Golden Hour Collection", price: "₹549", image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=300&h=300&fit=crop", badge: "Popular", desc: "8 warm-toned presets. Best for weddings, travel, outdoor portraits." },
            { title: "Wedding Preset Bundle", price: "₹1,499", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=300&fit=crop", badge: "Pro Pick", desc: "25 presets. Bright+airy to moody+romantic. Professional wedding standard." },
            { title: "Moody Indoor Pack", price: "₹499", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300&h=300&fit=crop", badge: "New", desc: "8 presets for indoor, dark ambient, café, and low-light photography." },
            { title: "Clean & Minimal Pack", price: "₹449", image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=300&fit=crop", badge: "", desc: "10 clean presets for lifestyle and product photography." },
            { title: "All Presets Bundle", price: "₹1,999", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=300&fit=crop", badge: "Best Value", desc: "All 5 preset packs (55 presets total). Save ₹697 vs buying individually." },
          ]),
          featuresSection([
            { title: "RAW + JPEG Compatible", desc: "Works on all file types from any camera brand.", icon: "📷" },
            { title: "Non-destructive", desc: "Presets are non-destructive — original files are never modified.", icon: "🔒" },
            { title: "Batch edit 500 photos", desc: "Apply to a single photo or batch-edit an entire shoot at once.", icon: "⚡" },
          ]),
        ],
      },
      "Templates": {
        heroTitle: "Canva & Figma Templates",
        heroTagline: "Consistent content. Zero design skills needed.",
        heroDescription: "Built for creators, coaches, and small brands. Plug in your content, change the colours, publish. Done.",
        heroCta: "Browse All Templates",
        bannerImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&h=300&fit=crop",
        sections: [
          productsSection([
            { title: "Minimal Brand Canva Kit", price: "₹999", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop", badge: "Popular", desc: "70 templates — IG posts, Stories, Reels covers, pitch deck. 3 colour palettes." },
            { title: "Instagram Carousel Pack", price: "₹399", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=300&fit=crop", badge: "New", desc: "20 carousel layouts. Coaches, creators, and brands. Canva + Figma." },
            { title: "Content Calendar Template", price: "₹299", image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=300&fit=crop", badge: "", desc: "Monthly content calendar in Notion + printable PDF. 30 content prompts included." },
            { title: "Brand Identity Starter Kit", price: "₹799", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop", badge: "Popular", desc: "Logo variations, colour palette, font pairing guide, and social media kit." },
            { title: "Proposal & Invoice Pack", price: "₹499", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop", badge: "Freelancer Hit", desc: "Client proposal, project invoice, and contract template. Canva + Google Docs." },
            { title: "Full Creator Bundle", price: "₹1,799", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=300&fit=crop", badge: "Best Value", desc: "Brand Kit + Carousel Pack + Proposal Pack + Calendar. Save ₹697 vs individual." },
          ]),
          featuresSection([
            { title: "Canva Free + Pro", desc: "All templates available in free Canva. Pro elements marked separately.", icon: "🎨" },
            { title: "Fully Editable", desc: "Change colours, fonts, images, and text without design knowledge.", icon: "✏️" },
            { title: "Brand in 10 minutes", desc: "A setup guide shows you how to apply your brand colours in one click.", icon: "🏷️" },
          ]),
        ],
      },
      "Free Downloads": {
        heroTitle: "Free Downloads",
        heroTagline: "Try before you buy — no email required",
        heroDescription: "3 free Lightroom presets and 5 free Canva templates. Download, use, love. If you want more, you know where to find us.",
        heroCta: "Download Free Pack",
        bannerImage: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&h=300&fit=crop",
        sections: [
          featuresSection([
            { title: "3 Free Presets", desc: "One each from Film Noir, Golden Hour, and Clean & Minimal packs.", icon: "📸" },
            { title: "5 Free Canva Templates", desc: "1 IG post, 2 Stories, 1 carousel slide, 1 highlight cover. Fully editable.", icon: "🎨" },
            { title: "No Email Required", desc: "No signup gate. Direct download link. We trust you to come back for more.", icon: "🔓" },
          ]),
          ctaBannerSection("Loved the free pack?", "Get 50x more with our bundles. Starting ₹399.", "See All Products"),
        ],
      },
    },
    checkout: createCheckoutConfig(699, "Buy Now — ₹699", [
      "Film Noir Preset Pack (12 presets)",
      "Desktop XMP + Mobile DNG files",
      "Works on Lightroom Free + Paid",
      "Instant email delivery",
      "Commercial use license",
      "Free lifetime updates",
    ]),
  },

  // ─── Biolink / Social Commerce ───
  {
    id: "biolink-profile",
    title: "Biolink Profile",
    desc: "Social profile page for events, tickets, and links with Razorpay checkout.",
    category: "ecommerce",
    icon: CreditCard,
    pages: ["Links"],
    heroTitle: "Book Your Tickets ⬇️",
    heroTagline: "@yourhandle",
    heroDescription: "Your events and links in one place",
    heroCta: "",
    bannerImage: "",
    sections: [
      biolinkSection(),
    ],
    biolinkConfig: {
      enabled: true,
      displayName: "Book Your Tickets ⬇️",
      bio: "Live music events and cultural experiences",
      location: "95, 100 feet Rd, HAL 2nd Stage, Appareddipalya, Indiranagar, Bangalore",
      theme: "light",
      socialLinks: [],
      customLinks: [
        { id: "e1", title: "8th March - Turtle walker: Notes from the Coastline | a screening with bodyweather1n", subtitle: "", url: "#", icon: "", enabled: true, order: 1, type: "event" },
        { id: "e2", title: "11th March - Grassroots Wednesdays with My Conscience & PXP | K", subtitle: "", url: "#", icon: "", enabled: true, order: 2, type: "event" },
        { id: "e3", title: "12th March - GBD-B Pulse with Adi G, EBITDA, Daishō", subtitle: "", url: "#", icon: "", enabled: true, order: 3, type: "event" },
        { id: "e4", title: "13th March - Gawdy Bhai", subtitle: "", url: "#", icon: "", enabled: true, order: 4, type: "event" },
        { id: "e5", title: "14th March - THT presents Dawn Bhat", subtitle: "", url: "#", icon: "", enabled: true, order: 5, type: "event" },
        { id: "e6", title: "15th March - Skin Contact by Project Grapejuice", subtitle: "", url: "#", icon: "", enabled: true, order: 6, type: "event" },
        { id: "e7", title: "17th March - Solidarity Tuesday with The Threshold by Mo Pallen, B. Bindhu Malini", subtitle: "", url: "#", icon: "", enabled: true, order: 7, type: "event" },
        { id: "e8", title: "18th March - Grassroots Wednesdays with Keeravani, Backrooms, threexdweeds18", subtitle: "", url: "#", icon: "", enabled: true, order: 8, type: "event" },
        { id: "e9", title: "19th March - THT presents Gliding Emotions by Tamil Jazz Collective and a reading of Tamil Pulp Fiction with Hishām", subtitle: "", url: "#", icon: "", enabled: true, order: 9, type: "event" },
        { id: "e10", title: "20th March - THT x ANHAR RECORDS presents Denbhim Audio + Borai + More", subtitle: "", url: "#", icon: "", enabled: true, order: 10, type: "event" },
        { id: "e11", title: "22nd March - Oddball x THT present Jack Gardiner", subtitle: "", url: "#", icon: "", enabled: true, order: 11, type: "event" },
        { id: "e12", title: "25th March - Grassroots Wednesdays with FTP, Skivinnie", subtitle: "", url: "#", icon: "", enabled: true, order: 12, type: "event" },
        { id: "e13", title: "26th March - THT presents Ranj x Clif, STEVIE", subtitle: "", url: "#", icon: "", enabled: true, order: 13, type: "event" },
        { id: "e14", title: "27th March - oelii|grlqo: Jatin Talukdar Project + Avedhita + Sei Hek", subtitle: "", url: "#", icon: "", enabled: true, order: 14, type: "event" },
        { id: "e15", title: "28th March - THT presents Parveez", subtitle: "", url: "#", icon: "", enabled: true, order: 15, type: "event" },
      ],
      showContactButton: false,
      showProductsSection: false,
      viewMode: "links",
    },
    checkout: createCheckoutConfig(499, "Book Now", [
      "Secure payment via Razorpay",
      "Instant ticket confirmation",
      "Easy refunds and support"
    ]),
  },
  {
    id: "biolink-shop",
    title: "Biolink Shop",
    desc: "Product showcase with social profile and Razorpay checkout.",
    category: "ecommerce",
    icon: CreditCard,
    pages: ["Shop"],
    heroTitle: "@dohfulcookies",
    heroTagline: "Your shop",
    heroDescription: "Gooey cookies for the Guilty! Baked on Order | Shipping PAN India",
    heroCta: "",
    bannerImage: "",
    sections: [
      biolinkSection(),
    ],
    biolinkConfig: {
      enabled: true,
      displayName: "@dohfulcookies",
      bio: "Gooey cookies for the Guilty!\nBaked on Order | Shipping PAN India",
      theme: "light",
      profileImage: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop",
      socialLinks: [
        { id: "s1", platform: "instagram", url: "https://instagram.com/dohfulcookies", enabled: true, order: 1 },
        { id: "s2", platform: "youtube", url: "https://youtube.com/@dohfulcookies", enabled: true, order: 2 },
        { id: "s3", platform: "custom", url: "mailto:hello@dohful.com", label: "Email", icon: "✉️", enabled: true, order: 3 },
        { id: "s4", platform: "whatsapp", url: "https://wa.me/919876543210", enabled: true, order: 4 },
        { id: "s5", platform: "custom", url: "https://dohfulcookies.com", label: "Website", icon: "🌐", enabled: true, order: 5 },
      ],
      customLinks: [],
      showContactButton: false,
      showProductsSection: true,
      viewMode: "both",
    },
    productsConfig: {
      enabled: true,
      products: [
        {
          id: "p1", type: "physical-product", title: "Choco Chunk Cookies", description: "Classic chocolate chunk cookies with Belgian chocolate", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
          pricingModels: [{ id: "pm1", type: "one-time", amount: 299, currency: "INR", label: "Buy Now" }],
          featured: true, badge: "Bestseller", status: "published",
        },
        {
          id: "p2", type: "physical-product", title: "Nutella Lust Cookies", description: "Gooey Nutella-filled cookies", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
          pricingModels: [{ id: "pm2", type: "one-time", amount: 349, currency: "INR", label: "Buy Now" }],
          featured: false, status: "published",
        },
        {
          id: "p3", type: "physical-product", title: "S'mores Chocolate Chunk", description: "S'mores style chocolate cookies", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
          pricingModels: [{ id: "pm3", type: "one-time", amount: 399, currency: "INR", label: "Buy Now" }],
          featured: false, status: "published",
        },
        {
          id: "p4", type: "physical-product", title: "16% Very Chocolate Cookie", description: "Ultra rich chocolate cookies", image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=400&fit=crop",
          pricingModels: [{ id: "pm4", type: "one-time", amount: 429, currency: "INR", label: "Buy Now" }],
          featured: false, badge: "New", status: "published",
        },
        {
          id: "p5", type: "physical-product", title: "Choco-Brownie Cookies", description: "Brownie-style chocolate cookies", image: "https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=400&h=400&fit=crop",
          pricingModels: [{ id: "pm5", type: "one-time", amount: 379, currency: "INR", label: "Buy Now" }],
          featured: false, status: "published",
        },
        {
          id: "p6", type: "physical-product", title: "Dohful's 10-Cookie Sampler", description: "Assorted cookie sampler pack", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
          pricingModels: [{ id: "pm6", type: "one-time", amount: 1299, currency: "INR", label: "Buy Now" }],
          featured: true, badge: "Value Pack", status: "published",
        },
        {
          id: "p7", type: "physical-product", title: "Assorted Cookies", description: "Mix of our bestselling cookies", image: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=400&h=400&fit=crop",
          pricingModels: [{ id: "pm7", type: "one-time", amount: 299, currency: "INR", label: "Buy Now" }],
          featured: false, status: "published",
        },
      ],
      displayMode: "grid",
      showPricing: true,
      categoriesEnabled: false,
    },
    checkout: createCheckoutConfig(299, "Buy Now", [
      "Free shipping on orders above ₹999",
      "Easy returns within 7 days",
      "Secure payment via Razorpay"
    ]),
  },

  // ─── Payment Page Templates (two-column single page) ───

  // Education: Course enrollment payment page
  {
    id: "pay-edu-course",
    layout: "payment-page",
    title: "Course Enrollment Page",
    desc: "Single-page two-column course enrollment. Left content, right Razorpay checkout — no navigation needed.",
    category: "education",
    icon: GraduationCap,
    pages: ["Home"],
    heroTitle: "Full Stack Web Development",
    heroTagline: "12-Week Intensive • Live + Recorded • Next Batch: June 2026",
    heroDescription: "Go from zero to job-ready in 12 weeks. Learn React, Node.js, PostgreSQL, and DevOps with real-world projects. Mentored by ex-Google and ex-Amazon engineers. 2,000+ alumni placed.",
    heroCta: "Enroll Now",
    bannerImage: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=900&h=300&fit=crop",
    sections: [
      statsSection([
        { value: "2,000+", label: "Alumni placed" },
        { value: "92%", label: "Completion rate" },
        { value: "4.9★", label: "Average rating" },
        { value: "12 wks", label: "Duration" },
      ]),
      aboutSection(
        "Karthik Rajan — Your Lead Instructor",
        "Ex-Amazon SDE-II with 10 years of full-stack experience. Trained 2,000+ developers. Alumni placed at Google, Microsoft, Flipkart, and top startups across India."
      ),
      testimonialsSection([
        { name: "Rohit Verma", text: "Landed a ₹18 LPA job at a fintech startup 3 months after completing the course. The projects were incredibly practical.", rating: 5, avatar: "RV" },
        { name: "Divya R.", text: "Best investment of my career. The mentorship and code reviews made all the difference.", rating: 5, avatar: "DR" },
        { name: "Amit P.", text: "Real projects, real skills. Not just theory. I had a portfolio ready to show on day 1 of interviews.", rating: 5, avatar: "AP" },
        { name: "Sneha K.", text: "Switched from non-tech to a developer role in 6 months. Forever grateful for this course.", rating: 5, avatar: "SK" },
      ]),
    ],
    checkout: createCheckoutConfig(
      12999,
      "Enroll Now — ₹12,999",
      [
        "120+ hours of HD video content",
        "12 weeks of live mentoring sessions",
        "5 real-world capstone projects",
        "Code reviews on every assignment",
        "Verified certificate of completion",
        "Lifetime access + future updates",
        "Private Slack community (2,000+ devs)",
        "Job placement assistance",
      ],
      [
        { id: "f_exp", label: "Experience Level", type: "select", required: true, placeholder: "Select your level", options: ["Beginner (no coding)", "Some experience", "Intermediate"] },
        { id: "f_goal", label: "Your Goal", type: "textarea", required: false, placeholder: "What do you want to build or achieve?" },
      ]
    ),
  },

  // Education: Workshop enrollment payment page
  {
    id: "pay-edu-workshop",
    layout: "payment-page",
    title: "Workshop Enrollment Page",
    desc: "Single-page payment page for a weekend workshop or short course with Razorpay checkout.",
    category: "education",
    icon: GraduationCap,
    pages: ["Home"],
    heroTitle: "UI/UX Design Intensive",
    heroTagline: "2-Day Weekend Workshop • 20 Seats Only • June 14–15, 2026",
    heroDescription: "Hands-on Figma workshop — from wireframes to pixel-perfect prototypes. Build a complete product case study in 2 days. Taught by senior designers from Zomato and Swiggy.",
    heroCta: "Reserve Your Seat",
    bannerImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=300&fit=crop",
    sections: [
      statsSection([
        { value: "20", label: "Seats per batch" },
        { value: "16 hrs", label: "Hands-on practice" },
        { value: "98%", label: "Satisfaction rate" },
        { value: "3 Yrs", label: "Running" },
      ]),
      aboutSection(
        "Priya Nair & Sneha Kapoor",
        "Senior product designers at Zomato and Swiggy respectively. Combined 15 years of designing products used by millions. They bring real problems, real feedback, and no fluff."
      ),
      testimonialsSection([
        { name: "Meera S.", text: "Got my first design job within 3 weeks of the workshop. The portfolio piece we built was the conversation-starter in every interview.", rating: 5, avatar: "MS" },
        { name: "Arjun T.", text: "Dense, practical, and zero filler. The 2 days felt like 2 weeks worth of learning.", rating: 5, avatar: "AT" },
        { name: "Pooja R.", text: "The feedback sessions were brutal but incredibly valuable. I redesigned my portfolio right after.", rating: 5, avatar: "PR" },
        { name: "Vikram J.", text: "Worth every rupee. I've done expensive bootcamps that delivered less.", rating: 5, avatar: "VJ" },
      ]),
    ],
    checkout: createCheckoutConfig(
      2499,
      "Reserve My Seat — ₹2,499",
      [
        "2 full days of hands-on Figma training",
        "Real product design case study",
        "Portfolio-ready project to take home",
        "1:1 feedback on your designs",
        "Access to design resources & UI kit",
        "Certificate of participation",
        "30-day post-workshop Q&A support",
      ],
      [
        { id: "f_tool", label: "Figma experience", type: "select", required: true, placeholder: "Your Figma level", options: ["Never used it", "Basic (free plan)", "Intermediate", "Advanced"] },
      ]
    ),
  },

  // Services: Consulting session payment page
  {
    id: "pay-service-consult",
    layout: "payment-page",
    title: "Consultation Booking Page",
    desc: "Single-page two-column page for booking and paying for a consulting or coaching session.",
    category: "services",
    icon: Briefcase,
    pages: ["Home"],
    heroTitle: "1:1 Business Strategy Session",
    heroTagline: "90-Minute Deep Dive • Recorded + Notes • Book Within 5 Days",
    heroDescription: "Get unstuck. Work with an experienced strategist to cut through the noise, validate your ideas, and walk away with a concrete 30/60/90-day action plan tailored to your business.",
    heroCta: "Book Session",
    bannerImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&h=300&fit=crop",
    sections: [
      statsSection([
        { value: "500+", label: "Sessions delivered" },
        { value: "4.9★", label: "Average rating" },
        { value: "12 yrs", label: "Experience" },
        { value: "48 hr", label: "Response time" },
      ]),
      aboutSection(
        "Ananya Krishnan — Business Strategist",
        "Ex-McKinsey consultant and founder with 12 years across strategy, product, and growth. Has worked with 200+ startups and SMBs across EdTech, FinTech, and D2C. Featured in Economic Times and YourStory."
      ),
      testimonialsSection([
        { name: "Rahul M.", text: "One session changed how I think about my entire go-to-market. Worth 10x what I paid.", rating: 5, avatar: "RM" },
        { name: "Nisha P.", text: "She cut through my 3-month mental block in 90 minutes. Actionable, direct, and no fluff.", rating: 5, avatar: "NP" },
        { name: "Karan S.", text: "I came in with a fuzzy idea. I left with a clear 60-day plan and three quick wins to test.", rating: 5, avatar: "KS" },
        { name: "Deepa V.", text: "The follow-up notes alone were worth it. Still referring back to them 6 months later.", rating: 5, avatar: "DV" },
      ]),
    ],
    checkout: createCheckoutConfig(
      8999,
      "Book My Session — ₹8,999",
      [
        "90-minute 1:1 video strategy session",
        "Full session recording shared after",
        "Written summary + action plan (PDF)",
        "30/60/90-day roadmap tailored to you",
        "2 weeks of follow-up email support",
        "Resource toolkit (templates, frameworks)",
        "Booking within 5 business days",
      ],
      [
        { id: "f_biz", label: "Business / Project", type: "text", required: true, placeholder: "What are you working on?" },
        { id: "f_challenge", label: "Primary challenge", type: "textarea", required: true, placeholder: "What's the main problem you want to solve in this session?" },
        { id: "f_stage", label: "Business stage", type: "select", required: true, placeholder: "Select stage", options: ["Idea / Pre-revenue", "Early stage (< ₹10L revenue)", "Growth stage (₹10L–1Cr)", "Scale stage (₹1Cr+)"] },
      ]
    ),
  },

  // Services: Membership / subscription payment page
  {
    id: "pay-service-membership",
    layout: "payment-page",
    title: "Membership Signup Page",
    desc: "Single-page payment page for recurring memberships, subscriptions, or community access.",
    category: "services",
    icon: Briefcase,
    pages: ["Home"],
    heroTitle: "The Founders' Inner Circle",
    heroTagline: "Monthly Membership • Cancel Anytime • Join 800+ Members",
    heroDescription: "A curated community for ambitious founders and operators. Monthly masterclasses, peer accountability groups, deal flow access, and a network that actually helps you grow — not just network.",
    heroCta: "Join the Circle",
    bannerImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=300&fit=crop",
    sections: [
      statsSection([
        { value: "800+", label: "Active members" },
        { value: "4.8★", label: "Member rating" },
        { value: "4 yrs", label: "Community age" },
        { value: "₹0", label: "Cancellation fee" },
      ]),
      aboutSection(
        "Siddharth Rao — Community Founder",
        "Serial entrepreneur, 3 exits. Built communities that have generated over ₹200Cr in member revenue. Believes your network is your biggest unfair advantage."
      ),
      testimonialsSection([
        { name: "Avni T.", text: "Got my first enterprise client through the community within 3 months. The quality of people here is unmatched.", rating: 5, avatar: "AT" },
        { name: "Rohan D.", text: "The monthly masterclasses alone are worth the fee. I've stopped buying individual courses.", rating: 5, avatar: "RD" },
        { name: "Priti M.", text: "I've tried 4 founder communities. This is the only one where people actually show up and help.", rating: 5, avatar: "PM" },
        { name: "Sahil K.", text: "Closed a co-founder here. Worth every rupee for that alone.", rating: 5, avatar: "SK" },
      ]),
    ],
    checkout: createCheckoutConfig(
      2999,
      "Join Now — ₹2,999/month",
      [
        "Monthly live masterclass with top operators",
        "Private Slack — 800+ active founders",
        "Weekly accountability pods (6–8 people)",
        "Deal flow & warm intro network",
        "Resource library (playbooks, templates)",
        "Monthly hot-seat sessions",
        "Early access to events & workshops",
        "Cancel anytime, no questions asked",
      ],
      [
        { id: "f_company", label: "Company / Project", type: "text", required: true, placeholder: "What are you building?" },
        { id: "f_stage", label: "Stage", type: "select", required: true, placeholder: "Select your stage", options: ["Idea stage", "Pre-revenue", "Revenue generating", "Scaling", "Exited / Investing"] },
      ],
      { amountType: "fixed" }
    ),
  },

  // ─── Product-Focused Templates ───
  ...productFocusedTemplates,
];

// ──────────────── Available section types for Add Section ────────────────
export const availableSectionTypes: { type: SectionType; label: string; description: string }[] = [
  { type: "hero", label: "Hero Banner", description: "Full-width hero with title, tagline, and CTA" },
  { type: "about", label: "About", description: "About section with text and image" },
  { type: "services", label: "Services", description: "Service cards with icons" },
  { type: "features", label: "Features", description: "Feature highlights with icons" },
  { type: "pricing", label: "Pricing", description: "Pricing tiers comparison" },
  { type: "testimonials", label: "Testimonials", description: "Customer testimonials with ratings" },
  { type: "google-reviews", label: "Google Reviews", description: "Google review widget style" },
  { type: "faq", label: "FAQ", description: "Expandable FAQ accordion" },
  { type: "team", label: "Team", description: "Team member profiles" },
  { type: "gallery", label: "Gallery", description: "Image gallery grid" },
  { type: "stats", label: "Stats / Numbers", description: "Key metrics and numbers" },
  { type: "cta-banner", label: "CTA Banner", description: "Call-to-action banner" },
  { type: "contact-form", label: "Contact Form", description: "Contact form with fields" },
  { type: "curriculum", label: "Curriculum", description: "Course modules and lessons" },
  { type: "schedule", label: "Schedule", description: "Event timeline / schedule" },
  { type: "speakers", label: "Speakers", description: "Speaker profiles" },
  { type: "newsletter", label: "Newsletter", description: "Email signup form" },
  { type: "clients", label: "Clients / Logos", description: "Client/partner logo strip" },
  { type: "portfolio", label: "Portfolio", description: "Work samples grid" },
  { type: "impact", label: "Impact Stories", description: "NGO impact narratives" },
  { type: "donation", label: "Donation", description: "Donation CTA with amounts" },
  { type: "products", label: "Products", description: "Product card grid" },
  { type: "video-embed", label: "Video Embed", description: "Embedded video player" },
  { type: "countdown", label: "Countdown Timer", description: "Countdown to a date" },
  { type: "biolink", label: "Biolink Profile", description: "Social profile page with products and links" },
];

export const createDefaultSection = (type: SectionType): SectionData => {
  const factories: Record<string, () => SectionData> = {
    "hero": heroSection,
    "about": () => aboutSection(),
    "services": () => servicesSection(),
    "features": () => featuresSection(),
    "pricing": () => pricingSection(),
    "testimonials": () => testimonialsSection(),
    "google-reviews": googleReviewsSection,
    "faq": () => faqSection(),
    "team": () => teamSection(),
    "gallery": () => gallerySection(),
    "stats": () => statsSection(),
    "cta-banner": () => ctaBannerSection(),
    "contact-form": contactFormSection,
    "curriculum": () => curriculumSection(),
    "schedule": () => scheduleSection(),
    "speakers": () => speakersSection(),
    "newsletter": newsletterSection,
    "clients": () => clientsSection(),
    "portfolio": () => portfolioSection(),
    "impact": impactSection,
    "donation": donationSection,
    "products": () => productsSection(),
    "video-embed": () => videoEmbedSection(),
    "countdown": () => countdownSection(),
    "biolink": () => biolinkSection(),
  };
  const section = (factories[type] || (() => aboutSection()))();
  section.visible = true;
  return section;
};

export const getDefaultSectionsForPageName = (name: string): SectionData[] => {
  const lower = name.toLowerCase();
  if (lower.includes("about")) {
    return [
      aboutSection(
        "Who We Are",
        "We are a team of passionate educators and industry experts committed to delivering world-class learning experiences. Our mission is to make quality education accessible to everyone — regardless of background or location."
      ),
      teamSection([
        { name: "Founder & CEO", role: "Founder & CEO", avatar: "FC", bio: "10+ years in EdTech. Building the future of online learning." },
        { name: "Head of Content", role: "Head of Content", avatar: "HC", bio: "Curriculum expert. Ensures every lesson delivers real-world value." },
        { name: "Student Success Lead", role: "Student Success", avatar: "SS", bio: "Dedicated to helping every student achieve their goals." },
      ]),
      statsSection([
        { value: "15K+", label: "Students Enrolled" },
        { value: "4.9★", label: "Average Rating" },
        { value: "100+", label: "Courses Available" },
        { value: "5 Yrs", label: "In Business" },
      ]),
      testimonialsSection([
        { name: "Rohit V.", text: "This platform completely changed my career trajectory. The instructors are world-class.", rating: 5, avatar: "RV" },
        { name: "Aditi S.", text: "The community and support team are incredible. I never felt stuck for long.", rating: 5, avatar: "AS" },
        { name: "Karthik M.", text: "Best investment I've made in my education. Highly recommend to anyone serious about learning.", rating: 5, avatar: "KM" },
      ]),
    ];
  }
  if (lower.includes("contact")) {
    return [
      faqSection([
        { q: "How quickly do you respond?", a: "We typically respond within 24 hours on business days." },
        { q: "Can I speak with someone before enrolling?", a: "Absolutely! Book a free 15-minute call using the form above and we'll be happy to answer all your questions." },
        { q: "What is your refund policy?", a: "We offer a full refund within 7 days of purchase — no questions asked." },
        { q: "Do you offer group or corporate discounts?", a: "Yes! For teams of 5 or more, contact us for special pricing and customised learning plans." },
      ]),
    ];
  }
  return [];
};
