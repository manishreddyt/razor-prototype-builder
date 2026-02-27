import {
  Globe, GraduationCap, Briefcase, Heart, ShoppingBag, LayoutGrid,
  BookOpen, Video, UserCheck, Calendar, Users, Store, Gift, FileText,
} from "lucide-react";

export type SectionType =
  | "hero" | "about" | "services" | "features" | "pricing"
  | "testimonials" | "google-reviews" | "faq" | "team" | "gallery"
  | "stats" | "cta-banner" | "contact-form" | "curriculum"
  | "schedule" | "speakers" | "newsletter" | "clients" | "portfolio"
  | "impact" | "donation" | "products" | "video-embed" | "countdown";

export interface SectionData {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
  data: Record<string, any>;
}

export interface TemplateData {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon: any;
  pages: string[];
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  heroCta: string;
  bannerImage: string;
  sections: SectionData[];
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

const contactFormSection = (): SectionData => ({
  id: makeId(), type: "contact-form", label: "Contact Form", visible: true,
  data: {
    heading: "Get in Touch",
    fields: [
      { label: "Full Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Phone", type: "tel", required: false },
      { label: "Message", type: "textarea", required: true },
    ],
    submitText: "Send Message",
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

const productsSection = (items = [
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

// ──────────────── CATEGORIES ────────────────

export const categories = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "general", label: "General", icon: Globe },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "nonprofit", label: "Non-Profit", icon: Heart },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
];

// ──────────────── FULL TEMPLATES ────────────────

export const templates: TemplateData[] = [
  // ─── General ───
  {
    id: "portfolio", title: "Personal Portfolio", desc: "Showcase your work, bio, and contact info with a stunning portfolio.", category: "general", icon: Users,
    pages: ["Home", "About", "Portfolio", "Contact"],
    heroTitle: "Hi, I'm Alex 👋", heroTagline: "Designer, Developer & Creative Thinker",
    heroDescription: "I craft beautiful digital experiences that combine aesthetics with functionality. Let's build something amazing together.",
    heroCta: "View My Work", bannerImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection("About Me", "I'm a multi-disciplinary designer with 8+ years of experience creating brands, products, and digital experiences for startups and Fortune 500 companies."), portfolioSection(), statsSection([{ value: "50+", label: "Projects" }, { value: "30+", label: "Clients" }, { value: "8", label: "Years" }, { value: "12", label: "Awards" }]), testimonialsSection(), contactFormSection(), newsletterSection(), googleReviewsSection()],
  },
  {
    id: "business", title: "Business Website", desc: "Professional company website with services, team, and contact pages.", category: "general", icon: Briefcase,
    pages: ["Home", "About", "Services", "Team", "Contact"],
    heroTitle: "Grow Your Business", heroTagline: "Strategic solutions for modern enterprises",
    heroDescription: "We help businesses scale with data-driven strategies, innovative design, and robust technology solutions.",
    heroCta: "Get a Free Consultation", bannerImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection(), servicesSection(), featuresSection(), statsSection(), teamSection(), clientsSection(), testimonialsSection(), googleReviewsSection(), faqSection(), ctaBannerSection(), contactFormSection(), newsletterSection(), gallerySection()],
  },
  {
    id: "biolink", title: "Bio Link Page", desc: "Single-page link hub perfect for social bios and creators.", category: "general", icon: Globe,
    pages: ["Link Page"],
    heroTitle: "@yourname", heroTagline: "Creator • Educator • Entrepreneur",
    heroDescription: "All my important links in one place.",
    heroCta: "Latest Video →", bannerImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection("Bio", "Digital creator sharing insights on tech, design, and entrepreneurship. 100K+ community across platforms."), statsSection([{ value: "100K+", label: "Followers" }, { value: "500+", label: "Videos" }, { value: "50M+", label: "Views" }, { value: "10+", label: "Brands" }]), newsletterSection()],
  },
  {
    id: "event", title: "Event Landing", desc: "Promote events with countdown, speakers, and registration.", category: "general", icon: Calendar,
    pages: ["Home", "Schedule", "Speakers", "Register"],
    heroTitle: "TechSummit 2026", heroTagline: "India's Largest Technology Conference",
    heroDescription: "Join 5,000+ professionals for 2 days of talks, workshops, and networking. April 15-16, 2026 — Bangalore.",
    heroCta: "Register Now", bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop",
    sections: [heroSection(), countdownSection(), speakersSection(), scheduleSection(), statsSection([{ value: "5000+", label: "Attendees" }, { value: "40+", label: "Speakers" }, { value: "20+", label: "Workshops" }, { value: "2", label: "Days" }]), testimonialsSection([{ name: "Vikram S.", text: "Best tech conference in India. The networking alone is worth it.", rating: 5, avatar: "VS" }, { name: "Meera P.", text: "Incredible speakers and well-organized sessions.", rating: 5, avatar: "MP" }, { name: "Arjun R.", text: "Learned so much. Already booked for next year.", rating: 5, avatar: "AR" }]), faqSection([{ q: "Where is the venue?", a: "Bangalore International Exhibition Centre (BIEC), Bangalore." }, { q: "Is food included?", a: "Yes, lunch and refreshments are provided on both days." }, { q: "Can I get a refund?", a: "Full refund available up to 7 days before the event." }]), contactFormSection(), gallerySection(), googleReviewsSection()],
  },

  // ─── Education ───

  // 1. MULTI-COURSE PLATFORM — Course catalog marketplace style
  {
    id: "multi-course", title: "Online Courses (Multi)", desc: "Course marketplace with catalog, categories, and student dashboard.", category: "education", icon: BookOpen,
    pages: ["Home", "Courses", "Instructors", "Pricing", "Blog"],
    heroTitle: "Learn Without Limits", heroTagline: "100+ courses by industry experts",
    heroDescription: "From programming to design, marketing to data science — master new skills with hands-on courses and expert mentors.",
    heroCta: "Browse Courses", bannerImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      statsSection([{ value: "100+", label: "Courses" }, { value: "15K+", label: "Students" }, { value: "50+", label: "Instructors" }, { value: "4.8★", label: "Rating" }]),
      productsSection([
        { title: "Full Stack Web Dev", price: "₹4,999", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop", badge: "Best Seller" },
        { title: "UI/UX Design Mastery", price: "₹3,999", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop", badge: "Popular" },
        { title: "Data Science & ML", price: "₹5,999", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop", badge: "" },
        { title: "Digital Marketing", price: "₹2,999", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop", badge: "New" },
      ]),
      featuresSection([
        { title: "Self-Paced Learning", desc: "Learn at your own speed with lifetime access.", icon: "🕐" },
        { title: "Expert Instructors", desc: "Learn from industry practitioners.", icon: "👨‍🏫" },
        { title: "Certificates", desc: "Earn recognized certificates on completion.", icon: "🏆" },
      ]),
      teamSection([
        { name: "Dr. Meera Shah", role: "Head of Curriculum", avatar: "MS", bio: "PhD Stanford. 20 years in EdTech." },
        { name: "Arjun Reddy", role: "Lead Instructor", avatar: "AR", bio: "Ex-Google. Full stack expert." },
        { name: "Priya Nair", role: "Student Success", avatar: "PN", bio: "Ensuring every student thrives." },
      ]),
      clientsSection(["Google", "Microsoft", "Amazon", "Flipkart", "Infosys", "TCS"]),
      testimonialsSection(),
      googleReviewsSection(),
      ctaBannerSection("Start Learning Today", "Join 15,000+ students already enrolled.", "Explore Courses"),
      newsletterSection(),
    ],
  },

  // 2. SINGLE COURSE — Deep-dive sales page with curriculum & social proof
  {
    id: "single-course", title: "Single Online Course", desc: "High-converting sales page for one course with modules, instructor bio, and enrollment.", category: "education", icon: GraduationCap,
    pages: ["Home", "Curriculum", "Pricing", "Enroll", "FAQ"],
    heroTitle: "Master Full Stack Development", heroTagline: "12-Week Intensive Bootcamp • Next Batch: March 2026",
    heroDescription: "Go from zero to job-ready full stack developer. Learn React, Node.js, databases, and deployment with real-world projects. 2000+ alumni placed.",
    heroCta: "Enroll Now — ₹12,999", bannerImage: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=900&h=300&fit=crop",
    sections: [
      heroSection(),
      videoEmbedSection(),
      aboutSection("Meet Your Instructor", "I'm Karthik Rajan, ex-Amazon engineer with 10 years of full-stack experience. I've trained 2000+ developers and my students work at Google, Microsoft, Flipkart, and more. This course distills everything I know into 12 intensive weeks."),
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
  },

  // 3. WEBINAR — Urgency-driven registration page with countdown & speakers
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
      contactFormSection(),
    ],
  },

  // 4. 1:1 COACHING — Personal brand + booking focused
  {
    id: "coaching", title: "1:1 Coaching", desc: "Personal coaching page with booking, coach bio, and transformation stories.", category: "education", icon: UserCheck,
    pages: ["Home", "About", "Book Session", "Results", "Contact"],
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
      contactFormSection(),
    ],
  },

  // 5. WORKSHOP SERIES — Event-catalog style with schedules
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
  },

  // 6. MEMBERSHIP / COMMUNITY — Exclusive community with gated content
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
  },

  // ─── Services ───
  {
    id: "consulting", title: "Consulting Firm", desc: "Professional consulting with case studies and booking.", category: "services", icon: Briefcase,
    pages: ["Home", "Services", "Case Studies", "Book", "Contact"],
    heroTitle: "Strategic Business Consulting", heroTagline: "Drive growth with data-driven strategies",
    heroDescription: "We partner with ambitious companies to solve complex challenges and unlock sustainable growth.",
    heroCta: "Schedule Consultation", bannerImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection(), servicesSection([{ title: "Growth Strategy", desc: "Market analysis and growth roadmaps.", icon: "📈" }, { title: "Digital Transformation", desc: "Modernize operations with technology.", icon: "🔄" }, { title: "Process Optimization", desc: "Streamline workflows for efficiency.", icon: "⚙️" }, { title: "M&A Advisory", desc: "Due diligence and integration support.", icon: "🤝" }]), clientsSection(), portfolioSection([{ title: "FinTech Startup — 300% Growth", category: "Strategy", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" }, { title: "E-commerce Scale-Up", category: "Digital", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop" }, { title: "Healthcare Platform Launch", category: "Advisory", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" }]), statsSection(), teamSection(), testimonialsSection(), googleReviewsSection(), faqSection(), contactFormSection(), newsletterSection()],
  },
  {
    id: "freelancer", title: "Freelancer Profile", desc: "Showcase skills, past work, and testimonials.", category: "services", icon: UserCheck,
    pages: ["Home", "Work", "Testimonials", "Hire Me"],
    heroTitle: "Freelance Designer & Developer", heroTagline: "Crafting digital experiences since 2018",
    heroDescription: "I help startups and small businesses build beautiful, high-converting websites and apps. Let's create something great together.",
    heroCta: "Hire Me", bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection("About Me", "I'm a full-stack designer-developer hybrid. 6 years of experience, 80+ projects, clients in 12 countries. I specialize in React, Next.js, and design systems."), servicesSection([{ title: "Web Design", desc: "Custom responsive websites.", icon: "🎨" }, { title: "Web Development", desc: "React & Next.js applications.", icon: "💻" }, { title: "UI/UX Design", desc: "User research to pixel-perfect UI.", icon: "📐" }]), portfolioSection(), statsSection([{ value: "80+", label: "Projects" }, { value: "45+", label: "Clients" }, { value: "12", label: "Countries" }, { value: "100%", label: "On Time" }]), testimonialsSection(), googleReviewsSection(), pricingSection([{ name: "Starter", price: "₹25,000", period: "", features: ["Landing page", "5 sections", "Mobile responsive", "2 revisions"], highlighted: false }, { name: "Standard", price: "₹50,000", period: "", features: ["Multi-page website", "CMS integration", "SEO setup", "5 revisions"], highlighted: true }, { name: "Custom", price: "Custom", period: "", features: ["Full web app", "Backend API", "Admin panel", "Ongoing support"], highlighted: false }]), contactFormSection(), newsletterSection()],
  },
  {
    id: "agency", title: "Creative Agency", desc: "Agency website with portfolio and client testimonials.", category: "services", icon: Store,
    pages: ["Home", "Work", "Team", "Clients", "Contact"],
    heroTitle: "We Build Brands", heroTagline: "Full-service creative agency",
    heroDescription: "From brand strategy to digital execution, we create experiences that move people and drive results.",
    heroCta: "Start a Project", bannerImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection(), servicesSection([{ title: "Brand Strategy", desc: "Position your brand for growth.", icon: "🎯" }, { title: "Visual Identity", desc: "Logo, colors, typography, guidelines.", icon: "🎨" }, { title: "Web & Mobile", desc: "Custom digital products.", icon: "📱" }, { title: "Content & Social", desc: "Engaging content that converts.", icon: "📣" }]), portfolioSection(), clientsSection(["Swiggy", "Cred", "Meesho", "PhonePe", "Myntra", "UrbanClap"]), teamSection([{ name: "Ritu Sharma", role: "Creative Director", avatar: "RS", bio: "Ex-Ogilvy. 15 years in advertising." }, { name: "Deepak Nair", role: "Tech Lead", avatar: "DN", bio: "Full-stack architect. Built products at scale." }, { name: "Kavya Iyer", role: "Strategy Head", avatar: "KI", bio: "MBA, IIM-A. Growth marketing expert." }]), statsSection([{ value: "200+", label: "Projects" }, { value: "50+", label: "Clients" }, { value: "15+", label: "Awards" }, { value: "12", label: "Team Members" }]), testimonialsSection(), googleReviewsSection(), gallerySection(), ctaBannerSection("Let's Create Together", "Have a project in mind? We'd love to hear about it.", "Get in Touch"), contactFormSection(), newsletterSection()],
  },

  // ─── Non-Profit ───
  {
    id: "ngo", title: "NGO / Charity", desc: "Cause page with impact stories and donation collection.", category: "nonprofit", icon: Heart,
    pages: ["Home", "Our Cause", "Impact", "Donate", "Volunteer"],
    heroTitle: "Building a Better Tomorrow", heroTagline: "Every contribution creates lasting change",
    heroDescription: "We work in education, healthcare, and sustainability to uplift communities across rural India. Join our mission.",
    heroCta: "Donate Now", bannerImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&h=300&fit=crop",
    sections: [heroSection(), aboutSection("Our Mission", "Since 2015, we've been working tirelessly to provide education, clean water, and healthcare to underserved communities. Every rupee donated goes directly to impact."), impactSection(), statsSection([{ value: "50K+", label: "Lives Impacted" }, { value: "500+", label: "Villages Reached" }, { value: "100+", label: "Schools Built" }, { value: "92%", label: "Funds to Programs" }]), donationSection(), teamSection([{ name: "Dr. Lakshmi Rao", role: "Founder & Director", avatar: "LR", bio: "Social entrepreneur with 20 years in development." }, { name: "Suresh Menon", role: "Operations Head", avatar: "SM", bio: "MBA, managed programs across 10 states." }]), testimonialsSection([{ name: "Ramesh V.", text: "Volunteered for 2 years. The impact is real and measurable.", rating: 5, avatar: "RV" }, { name: "Corporate Partner", text: "Transparent, efficient, and deeply committed to their cause.", rating: 5, avatar: "CP" }]), googleReviewsSection(), gallerySection(), faqSection([{ q: "How are funds used?", a: "92% goes directly to programs. Full financial reports available." }, { q: "Can I volunteer?", a: "Yes! We welcome volunteers. Fill the contact form to get started." }, { q: "Is my donation tax-deductible?", a: "Yes, all donations are eligible for 80G tax benefits." }]), contactFormSection(), newsletterSection()],
  },
  {
    id: "fundraiser", title: "Fundraiser Campaign", desc: "Campaign page with progress bar and donate button.", category: "nonprofit", icon: Gift,
    pages: ["Campaign Page"],
    heroTitle: "Help Us Reach Our Goal", heroTagline: "Every contribution brings us closer",
    heroDescription: "We're raising ₹10,00,000 to build a new computer lab for 500 rural students. Help us make digital education accessible.",
    heroCta: "Contribute Now", bannerImage: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?w=900&h=300&fit=crop",
    sections: [heroSection(), donationSection(), impactSection(), statsSection([{ value: "₹7.5L", label: "Raised" }, { value: "75%", label: "Goal Reached" }, { value: "342", label: "Donors" }, { value: "15", label: "Days Left" }]), testimonialsSection([{ name: "Donor", text: "Proud to contribute to such a meaningful cause.", rating: 5, avatar: "D" }]), gallerySection(), faqSection(), contactFormSection(), newsletterSection(), googleReviewsSection()],
  },

  // ─── E-commerce ───
  {
    id: "store", title: "Online Store", desc: "Product catalog with cart and checkout.", category: "ecommerce", icon: ShoppingBag,
    pages: ["Home", "Products", "Product Detail", "Cart", "Checkout"],
    heroTitle: "Shop the Latest Collection", heroTagline: "Premium products, delivered to your door",
    heroDescription: "Discover our curated collection of premium lifestyle products. Free shipping on orders above ₹999.",
    heroCta: "Shop Now", bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=300&fit=crop",
    sections: [heroSection(), productsSection(), featuresSection([{ title: "Free Shipping", desc: "On all orders above ₹999.", icon: "🚚" }, { title: "Easy Returns", desc: "30-day hassle-free returns.", icon: "↩️" }, { title: "Secure Payment", desc: "100% secure checkout.", icon: "🔒" }]), statsSection([{ value: "10K+", label: "Products Sold" }, { value: "5000+", label: "Happy Customers" }, { value: "4.7★", label: "Average Rating" }, { value: "24h", label: "Delivery" }]), testimonialsSection(), googleReviewsSection(), faqSection([{ q: "What's the return policy?", a: "30-day return policy on all unused items." }, { q: "How long does shipping take?", a: "2-5 business days for most locations in India." }, { q: "Do you ship internationally?", a: "Currently we ship within India only." }]), ctaBannerSection("Sign Up for 10% Off", "Subscribe to get exclusive deals and early access.", "Get My Discount"), newsletterSection()],
  },
  {
    id: "digital", title: "Digital Products", desc: "Sell e-books, templates, presets with instant delivery.", category: "ecommerce", icon: FileText,
    pages: ["Home", "Products", "Download", "About"],
    heroTitle: "Premium Digital Resources", heroTagline: "Templates, guides, and tools for creators",
    heroDescription: "Professionally designed templates and resources to supercharge your workflow. Instant download after purchase.",
    heroCta: "Browse Products", bannerImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=300&fit=crop",
    sections: [heroSection(), productsSection([{ title: "Notion Template Pack", price: "₹499", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop", badge: "Best Seller" }, { title: "Instagram Template Kit", price: "₹299", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=300&fit=crop", badge: "" }, { title: "Business Plan Template", price: "₹999", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop", badge: "New" }, { title: "Resume Templates (5-Pack)", price: "₹399", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=300&fit=crop", badge: "" }]), featuresSection([{ title: "Instant Download", desc: "Get your files immediately after purchase.", icon: "⚡" }, { title: "Lifetime Updates", desc: "Free updates for all purchased products.", icon: "🔄" }, { title: "Commercial License", desc: "Use in personal and commercial projects.", icon: "📄" }]), statsSection([{ value: "5000+", label: "Downloads" }, { value: "200+", label: "Products" }, { value: "4.9★", label: "Rating" }, { value: "Instant", label: "Delivery" }]), testimonialsSection(), googleReviewsSection(), faqSection([{ q: "How do I get my files?", a: "Instant download link sent to your email after payment." }, { q: "Can I use these commercially?", a: "Yes, all products include a commercial use license." }, { q: "Do you offer refunds?", a: "Due to digital nature, refunds are case-by-case. Contact support." }]), ctaBannerSection("Bundle & Save 30%", "Get all templates in one pack at a special price.", "View Bundle"), newsletterSection()],
  },
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
  };
  const section = (factories[type] || (() => aboutSection()))();
  section.visible = true;
  return section;
};
