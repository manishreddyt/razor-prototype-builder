import { GraduationCap, Video, Calendar, ShoppingBag } from "lucide-react";
import { TemplateData } from "./smartPageTemplates";
import { Product, CourseModule } from "@/types/products";

const makeId = () => `s_${Math.random().toString(36).slice(2, 8)}`;

// Sample products for templates
const sampleCourseProduct: Product = {
  id: "prod-course-1",
  type: "online-course",
  title: "Complete Web Development Bootcamp",
  description: "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch",
  longDescription: "This comprehensive bootcamp takes you from beginner to job-ready web developer. You'll build real-world projects, learn industry best practices, and get hands-on experience with the latest technologies.\n\nPerfect for career switchers, students, and anyone looking to break into tech. No prior experience required!",
  image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=800&fit=crop&q=80",
  pricingModels: [
    {
      id: "pm1",
      name: "Self-Paced",
      price: 4999,
      currency: "INR",
      interval: "one_time",
      features: [
        "Lifetime access to all course materials",
        "50+ hours of video content",
        "Downloadable resources and code",
        "Community forum access",
        "Certificate of completion"
      ],
      highlighted: false,
      description: "Learn at your own pace"
    },
    {
      id: "pm2",
      name: "With Mentorship",
      price: 12999,
      currency: "INR",
      interval: "one_time",
      features: [
        "Everything in Self-Paced",
        "4× 1:1 mentor sessions",
        "Code review and feedback",
        "Career guidance and resume review",
        "Job placement support",
        "LinkedIn profile optimization"
      ],
      highlighted: true,
      description: "Best for career switchers"
    },
    {
      id: "pm3",
      name: "Monthly Access",
      price: 999,
      currency: "INR",
      interval: "monthly",
      features: [
        "Access for 1 month",
        "All course materials",
        "Community support",
        "Cancel anytime"
      ],
      highlighted: false,
      description: "Try before you commit"
    }
  ],
  duration: "12 weeks",
  format: "video",
  level: "beginner",
  modules: [
    { id: "m1", title: "HTML & CSS Fundamentals", description: "Build your first website from scratch", lessons: 15, duration: "8 hours", order: 1 },
    { id: "m2", title: "JavaScript Essentials", description: "Learn programming fundamentals", lessons: 20, duration: "12 hours", order: 2 },
    { id: "m3", title: "React Framework", description: "Build modern user interfaces", lessons: 18, duration: "10 hours", order: 3 },
    { id: "m4", title: "Node.js & Express", description: "Create backend APIs", lessons: 16, duration: "9 hours", order: 4 },
    { id: "m5", title: "MongoDB & Databases", description: "Store and manage data", lessons: 12, duration: "7 hours", order: 5 },
    { id: "m6", title: "Full-Stack Projects", description: "Build complete applications", lessons: 10, duration: "15 hours", order: 6 }
  ],
  whatYouWillLearn: [
    "Build responsive websites from scratch using HTML, CSS, and JavaScript",
    "Create interactive web applications with React",
    "Develop backend APIs with Node.js and Express",
    "Work with databases using MongoDB",
    "Deploy full-stack applications to production",
    "Follow industry best practices and clean code principles"
  ],
  courseIncludes: [
    "50+ hours of on-demand video",
    "Downloadable resources and code samples",
    "Lifetime access to course materials",
    "Certificate of completion",
    "Access on mobile and desktop",
    "Community forum support"
  ],
  featured: true,
  badge: "Bestseller",
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const sampleSessionProduct: Product = {
  id: "prod-session-1",
  type: "1-1-session",
  title: "Career Coaching Session",
  description: "Navigate your tech career with personalized 1:1 guidance",
  longDescription: "Get expert advice on your career path, whether you're switching careers, looking for a promotion, or building new skills. Our experienced coaches have helped hundreds of professionals achieve their goals.",
  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop",
  sessionDuration: 60,
  calendarConnected: false,
  availability: [
    { day: "Monday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Tuesday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Wednesday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Thursday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Friday", startTime: "09:00", endTime: "15:00", enabled: true },
    { day: "Saturday", startTime: "09:00", endTime: "17:00", enabled: false },
    { day: "Sunday", startTime: "09:00", endTime: "17:00", enabled: false }
  ],
  pricingModels: [
    {
      id: "pm1",
      name: "Single Session",
      price: 2999,
      currency: "INR",
      interval: "one_time",
      features: [
        "60-minute 1:1 video call",
        "Session recording",
        "Follow-up email with action items",
        "Resource recommendations"
      ],
      highlighted: false
    },
    {
      id: "pm2",
      name: "4-Session Package",
      price: 9999,
      currency: "INR",
      interval: "one_time",
      features: [
        "4× 60-minute sessions",
        "Priority scheduling",
        "Email support between sessions",
        "Custom action plan document",
        "LinkedIn profile review",
        "Save ₹2,000"
      ],
      highlighted: true,
      description: "Most Popular"
    }
  ],
  featured: true,
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const sampleWebinarProduct: Product = {
  id: "prod-webinar-1",
  type: "webinar",
  title: "Mastering Digital Marketing in 2027",
  description: "Learn the latest strategies from industry experts in this exclusive 90-minute webinar",
  longDescription: "Join us for an action-packed webinar where we'll cover the latest trends, tools, and tactics in digital marketing. Perfect for business owners, marketers, and anyone looking to grow their online presence.",
  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
  webinarDate: "2027-04-15",
  webinarTime: "18:00",
  webinarDuration: 90,
  webinarPlatform: "zoom",
  webinarConnected: false,
  speakers: [
    {
      id: "s1",
      name: "Sarah Johnson",
      title: "Head of Marketing, TechCorp",
      bio: "15+ years in digital marketing with Fortune 500 companies. Helped 100+ brands scale their online presence.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      social: { linkedin: "https://linkedin.com/in/sarahjohnson" }
    },
    {
      id: "s2",
      name: "Rajesh Kumar",
      title: "Growth Hacker & Founder",
      bio: "Built and scaled 3 startups to $10M+ ARR. Expert in performance marketing and analytics.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      social: { linkedin: "https://linkedin.com/in/rajeshkumar" }
    }
  ],
  agenda: [
    { id: "a1", time: "18:00", title: "Introduction & Welcome", description: "Overview of the session and introductions", duration: 10 },
    { id: "a2", time: "18:10", title: "Digital Marketing Trends 2027", description: "Latest strategies, platforms, and consumer behaviors", speaker: "s1", duration: 30 },
    { id: "a3", time: "18:40", title: "Growth Hacking Case Studies", description: "Real-world examples from successful campaigns", speaker: "s2", duration: 30 },
    { id: "a4", time: "19:10", title: "Q&A Session", description: "Audience questions and expert answers", duration: 20 }
  ],
  pricingModels: [
    {
      id: "pm1",
      name: "Live Access",
      price: 499,
      currency: "INR",
      interval: "one_time",
      features: [
        "Live webinar access",
        "Q&A participation",
        "Digital certificate",
        "Resource links"
      ],
      highlighted: false
    },
    {
      id: "pm2",
      name: "VIP Package",
      price: 1499,
      currency: "INR",
      interval: "one_time",
      features: [
        "Everything in Live Access",
        "Recording access (30 days)",
        "Exclusive 15-min Q&A with speakers",
        "Bonus toolkit and templates",
        "Priority support"
      ],
      highlighted: true,
      description: "Best Value"
    }
  ],
  featured: true,
  badge: "Limited Seats",
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Helper function to create section with ID
const section = (type: string, label: string, data: any = {}) => ({
  id: makeId(),
  type: type as any,
  label,
  visible: true,
  data
});

// Academy Template
export const academyTemplate: TemplateData = {
  id: "academy-platform",
  title: "Online Academy",
  desc: "Complete platform for selling online courses with multiple pricing tiers",
  category: "education",
  icon: GraduationCap,
  pages: ["Home", "About Us", "Contact Us"],
  heroTitle: "Master New Skills with Expert-Led Courses",
  heroTagline: "Education • Online Learning • Career Growth",
  heroDescription: "Learn at your own pace with our comprehensive course library. Join thousands of successful students who've transformed their careers.",
  heroCta: "Browse Courses",
  bannerImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop&q=90",
  sections: [
    section("hero", "Hero Banner"),
    section("products", "Courses", {
      heading: "Featured Courses",
      description: "Start your learning journey with our most popular courses"
    }),
    section("about", "About", {
      heading: "Why Choose Our Academy?",
      text: "We're committed to providing high-quality education that's accessible to everyone. Our expert instructors bring real-world experience and our hands-on approach ensures you'll be job-ready.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
    }),
    section("features", "Features", {
      heading: "What Makes Us Different",
      items: [
        { title: "Expert Instructors", desc: "Learn from industry professionals", icon: "👨‍🏫" },
        { title: "Hands-On Projects", desc: "Build real applications", icon: "💻" },
        { title: "Lifetime Access", desc: "Learn at your own pace", icon: "⏰" },
        { title: "Career Support", desc: "Get job-ready with our help", icon: "💼" }
      ]
    }),
    section("testimonials", "Testimonials", {
      heading: "Student Success Stories",
      items: [
        { name: "Priya Sharma", text: "This course changed my career. I landed my dream job as a developer!", rating: 5, avatar: "PS" },
        { name: "Rahul Verma", text: "The mentorship program was invaluable. Highly recommend!", rating: 5, avatar: "RV" }
      ]
    }),
    section("stats", "Stats", {
      items: [
        { value: "10,000+", label: "Students Enrolled" },
        { value: "50+", label: "Courses Available" },
        { value: "95%", label: "Success Rate" },
        { value: "4.8/5", label: "Average Rating" }
      ]
    }),
    section("faq", "FAQ", {
      heading: "Frequently Asked Questions",
      items: [
        { q: "Do I need prior experience?", a: "No! Our courses are designed for beginners." },
        { q: "How long do I have access?", a: "Lifetime access to all course materials." },
        { q: "Can I get a refund?", a: "Yes, 30-day money-back guarantee." }
      ]
    }),
    section("contact-form", "Contact Form"),
    section("cta-banner", "CTA Banner", {
      heading: "Ready to Start Learning?",
      text: "Join thousands of successful students today",
      buttonText: "Browse Courses"
    })
  ],
  productsConfig: {
    enabled: true,
    products: [sampleCourseProduct],
    displayMode: "grid",
    showPricing: true,
    categoriesEnabled: true,
    categories: ["Web Development", "Data Science", "Design", "Business"]
  },
  contactForm: {
    enabled: true,
    title: "Have Questions?",
    description: "Our team is here to help you choose the right course",
    fields: [
      { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Your name" },
      { id: "email", label: "Email", type: "email", required: true, placeholder: "your.email@example.com" },
      { id: "phone", label: "Phone", type: "phone", required: false, placeholder: "+91 98765 43210" },
      { id: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help?" }
    ],
    includeInterests: true,
    autoReply: true,
    autoReplyMessage: "Thanks for reaching out! We'll get back to you within 24 hours.",
    successMessage: "Thank you! We'll be in touch soon."
  },
  pagesData: {
    "About Us": {
      heroTitle: "About Our Academy",
      heroTagline: "Excellence • Innovation • Success",
      heroDescription: "We're on a mission to make quality education accessible to everyone, everywhere.",
      heroCta: "Start Learning",
      bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("about", "Our Story", {
          heading: "Transforming Lives Through Education",
          text: "Founded in 2020, our academy has helped over 10,000 students transform their careers. We believe in hands-on learning, expert mentorship, and building real-world skills that employers value.\n\nOur courses are designed by industry professionals who understand what it takes to succeed in today's competitive job market. We're not just teaching theory – we're building careers.",
          image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80"
        }),
        section("features", "Our Values", {
          heading: "What We Stand For",
          items: [
            { title: "Quality First", desc: "Every course is crafted by experts and regularly updated", icon: "⭐" },
            { title: "Student Success", desc: "Your growth is our priority – we measure success by your achievements", icon: "🎯" },
            { title: "Practical Learning", desc: "Build real projects, not just consume content", icon: "💡" },
            { title: "Lifetime Support", desc: "Join a community that supports you even after course completion", icon: "🤝" }
          ]
        }),
        section("stats", "Impact", {
          items: [
            { value: "10,000+", label: "Students Taught" },
            { value: "95%", label: "Job Placement Rate" },
            { value: "4.9/5", label: "Average Rating" },
            { value: "50+", label: "Industry Partners" }
          ]
        }),
        section("testimonials", "Student Stories", {
          heading: "Hear From Our Graduates",
          items: [
            { name: "Sarah Johnson", text: "Best investment I ever made. Landed a ₹12 LPA job within 3 months!", rating: 5, avatar: "SJ" },
            { name: "Amit Patel", text: "The instructors are world-class. They actually care about your success.", rating: 5, avatar: "AP" },
            { name: "Neha Gupta", text: "Switched from marketing to tech thanks to this academy. Forever grateful!", rating: 5, avatar: "NG" }
          ]
        }),
        section("cta-banner", "Join Us", {
          heading: "Ready to Transform Your Career?",
          text: "Join thousands of successful students who've already made the leap",
          buttonText: "Browse Courses"
        })
      ]
    },
    "Contact Us": {
      heroTitle: "Get in Touch",
      heroTagline: "We're Here to Help",
      heroDescription: "Have questions about our courses? Want to discuss your career goals? We'd love to hear from you.",
      heroCta: "",
      bannerImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("contact-form", "Contact Form"),
        section("features", "How to Reach Us", {
          heading: "Connect With Us",
          items: [
            { title: "Email", desc: "support@academy.com", icon: "📧" },
            { title: "Phone", desc: "+91 98765 43210", icon: "📞" },
            { title: "WhatsApp", desc: "Chat with us instantly", icon: "💬" },
            { title: "Office Hours", desc: "Mon-Fri, 9 AM - 6 PM IST", icon: "🕐" }
          ]
        }),
        section("faq", "Common Questions", {
          heading: "Frequently Asked Questions",
          items: [
            { q: "How do I enroll in a course?", a: "Browse our courses, select the one that fits your goals, and click 'Enroll Now'. We accept all major payment methods." },
            { q: "Do you offer refunds?", a: "Yes! We have a 30-day money-back guarantee. If you're not satisfied, we'll refund you in full." },
            { q: "Can I access courses on mobile?", a: "Absolutely! Our platform works seamlessly on desktop, tablet, and mobile devices." },
            { q: "Do you provide certificates?", a: "Yes, you'll receive a verified certificate upon course completion that you can share on LinkedIn." }
          ]
        })
      ]
    }
  }
};

// Coaching Template
export const coachingTemplate: TemplateData = {
  id: "coaching-platform",
  title: "Professional Coaching",
  desc: "1:1 coaching and mentoring services with calendar booking",
  category: "services",
  icon: Calendar,
  pages: ["Home", "About Us", "Contact Us"],
  heroTitle: "Transform Your Life with Expert Coaching",
  heroTagline: "Coaching • Mentoring • Personal Growth",
  heroDescription: "Book personalized 1:1 sessions with experienced coaches. Get the guidance you need to achieve your goals.",
  heroCta: "Book a Session",
  bannerImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&h=1080&fit=crop&q=90",
  sections: [
    section("hero", "Hero Banner"),
    section("about", "About", {
      heading: "About Your Coach",
      text: "With 15+ years of experience helping professionals achieve their goals, I bring a proven track record of success. My approach combines practical strategies with personalized support to help you overcome obstacles and reach new heights in your career.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop"
    }),
    section("products", "Services", {
      heading: "Coaching Services",
      description: "Choose the package that works for you"
    }),
    section("testimonials", "Testimonials", {
      heading: "What Clients Say",
      items: [
        { name: "Ananya Gupta", text: "The coaching sessions helped me land a promotion and double my salary!", rating: 5, avatar: "AG" },
        { name: "Vikram Singh", text: "Life-changing experience. Highly recommend to anyone feeling stuck in their career.", rating: 5, avatar: "VS" }
      ]
    }),
    section("stats", "Stats", {
      items: [
        { value: "500+", label: "Clients Coached" },
        { value: "15+", label: "Years Experience" },
        { value: "95%", label: "Success Rate" },
        { value: "4.9/5", label: "Client Rating" }
      ]
    }),
    section("contact-form", "Contact Form"),
    section("cta-banner", "CTA Banner", {
      heading: "Ready to Take the Next Step?",
      text: "Book your first session today",
      buttonText: "Get Started"
    })
  ],
  productsConfig: {
    enabled: true,
    products: [sampleSessionProduct],
    displayMode: "grid",
    showPricing: true,
    categoriesEnabled: false
  },
  contactForm: {
    enabled: true,
    title: "Get in Touch",
    description: "Have questions? Let's talk about how I can help you",
    fields: [
      { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Your name" },
      { id: "email", label: "Email", type: "email", required: true, placeholder: "your.email@example.com" },
      { id: "message", label: "What are your goals?", type: "textarea", required: true, placeholder: "Tell me about your situation" }
    ],
    includeInterests: false,
    autoReply: false,
    successMessage: "Thank you! I'll get back to you within 24 hours."
  },
  pagesData: {
    "About Us": {
      heroTitle: "About Your Coach",
      heroTagline: "Experience • Expertise • Empathy",
      heroDescription: "15+ years of experience helping professionals and entrepreneurs achieve their goals.",
      heroCta: "Book a Discovery Call",
      bannerImage: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("about", "My Story", {
          heading: "Why I Became a Coach",
          text: "After spending 15 years in corporate leadership roles, I discovered my true passion: helping others unlock their potential. I've coached over 500 professionals, from first-time managers to C-suite executives.\n\nMy approach combines proven coaching methodologies with real-world business experience. I don't just offer theory – I provide actionable strategies that drive results.",
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop&q=80"
        }),
        section("features", "My Approach", {
          heading: "How I Work",
          items: [
            { title: "Goal-Oriented", desc: "We start with your goals and create a clear roadmap", icon: "🎯" },
            { title: "Accountability", desc: "Regular check-ins keep you on track", icon: "✅" },
            { title: "Customized", desc: "Every session is tailored to your unique situation", icon: "⚙️" },
            { title: "Confidential", desc: "Safe space to explore challenges openly", icon: "🔒" }
          ]
        }),
        section("testimonials", "Client Success Stories", {
          heading: "What Clients Say",
          items: [
            { name: "Michael Chen", text: "Best decision I made for my career. Promoted to VP within 6 months!", rating: 5, avatar: "MC" },
            { name: "Lisa Anderson", text: "Finally found clarity on my business strategy. Revenue doubled!", rating: 5, avatar: "LA" }
          ]
        })
      ]
    },
    "Contact Us": {
      heroTitle: "Let's Talk",
      heroTagline: "Start Your Journey",
      heroDescription: "Ready to make a change? Book a free 30-minute discovery call to see if we're a good fit.",
      heroCta: "",
      bannerImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("contact-form", "Contact Form"),
        section("features", "Get in Touch", {
          heading: "How to Reach Me",
          items: [
            { title: "Email", desc: "coach@example.com", icon: "📧" },
            { title: "Phone", desc: "+91 98765 43210", icon: "📞" },
            { title: "WhatsApp", desc: "Quick responses", icon: "💬" },
            { title: "LinkedIn", desc: "Connect professionally", icon: "💼" }
          ]
        })
      ]
    }
  }
};

// Webinar Template
export const webinarTemplate: TemplateData = {
  id: "webinar-platform",
  title: "Professional Webinars",
  desc: "Host and sell webinar registrations with platform integration",
  category: "education",
  icon: Video,
  pages: ["Home", "About Us", "Contact Us"],
  heroTitle: "Mastering Digital Marketing in 2027",
  heroTagline: "Webinar • Live Online Event • April 15, 2027",
  heroDescription: "Join industry experts for an exclusive 90-minute webinar on the latest digital marketing strategies",
  heroCta: "Register Now",
  bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop&q=90",
  sections: [
    section("hero", "Hero Banner"),
    section("speakers", "Speakers", {
      heading: "Meet Your Speakers",
      speakers: [
        { name: "Sarah Johnson", title: "Head of Marketing, TechCorp", avatar: "SJ", bio: "15+ years in digital marketing" },
        { name: "Rajesh Kumar", title: "Growth Hacker & Founder", avatar: "RK", bio: "Built 3 startups to $10M+ ARR" }
      ]
    }),
    section("schedule", "Agenda", {
      heading: "What We'll Cover",
      events: [
        { time: "18:00", title: "Introduction & Welcome", speaker: "" },
        { time: "18:10", title: "Digital Marketing Trends 2027", speaker: "Sarah Johnson" },
        { time: "18:40", title: "Growth Hacking Case Studies", speaker: "Rajesh Kumar" },
        { time: "19:10", title: "Q&A Session", speaker: "Both Speakers" }
      ]
    }),
    section("products", "Pricing", {
      heading: "Choose Your Access Level",
      description: "Select the option that works best for you"
    }),
    section("faq", "FAQ", {
      heading: "Frequently Asked Questions",
      items: [
        { q: "Will I get a recording?", a: "Yes, with the VIP package you get 30-day recording access." },
        { q: "Can I ask questions?", a: "Yes! We have a live Q&A session at the end." },
        { q: "What if I can't attend live?", a: "Upgrade to VIP for recording access." }
      ]
    }),
    section("cta-banner", "CTA Banner", {
      heading: "Don't Miss Out!",
      text: "Limited seats available. Register now to secure your spot.",
      buttonText: "Register Now"
    })
  ],
  productsConfig: {
    enabled: true,
    products: [sampleWebinarProduct],
    displayMode: "grid",
    showPricing: true,
    categoriesEnabled: false
  },
  contactForm: {
    enabled: true,
    title: "Questions?",
    description: "Get in touch with our team",
    fields: [
      { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Your name" },
      { id: "email", label: "Email", type: "email", required: true, placeholder: "your.email@example.com" },
      { id: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help?" }
    ],
    includeInterests: false,
    autoReply: false,
    successMessage: "Thank you! We'll be in touch soon."
  },
  pagesData: {
    "About Us": {
      heroTitle: "About This Event",
      heroTagline: "Professional Development • Industry Insights",
      heroDescription: "Learn from the best minds in digital marketing and take your skills to the next level.",
      heroCta: "Register Now",
      bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("about", "Why Attend", {
          heading: "What You'll Gain",
          text: "This isn't just another webinar. You'll walk away with actionable strategies, proven frameworks, and insider knowledge from experts who've built multi-million dollar campaigns.\n\nPerfect for marketing professionals, business owners, and anyone looking to stay ahead in the digital marketing landscape.",
          image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop&q=80"
        }),
        section("features", "What's Included", {
          heading: "Your Takeaways",
          items: [
            { title: "Live Q&A", desc: "Ask questions directly to industry experts", icon: "💬" },
            { title: "Recording Access", desc: "Lifetime access to the webinar recording", icon: "📹" },
            { title: "Resources", desc: "Downloadable templates and frameworks", icon: "📚" },
            { title: "Certificate", desc: "Professional development certificate", icon: "🎓" }
          ]
        })
      ]
    },
    "Contact Us": {
      heroTitle: "Get in Touch",
      heroTagline: "Questions About the Event?",
      heroDescription: "Our team is here to help. Reach out with any questions about registration, content, or technical requirements.",
      heroCta: "",
      bannerImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("contact-form", "Contact Form"),
        section("features", "Reach Us", {
          heading: "Contact Information",
          items: [
            { title: "Email", desc: "events@company.com", icon: "📧" },
            { title: "Phone", desc: "+91 98765 43210", icon: "📞" },
            { title: "Support", desc: "Live chat during event", icon: "💬" },
            { title: "Hours", desc: "Mon-Fri, 9 AM - 6 PM IST", icon: "🕐" }
          ]
        })
      ]
    }
  }
};

// Sample E-commerce Products
const samplePhysicalProduct: Product = {
  id: "prod-tshirt-1",
  type: "physical-product",
  title: "Premium Cotton T-Shirt",
  description: "Ultra-soft, breathable cotton t-shirt perfect for everyday wear",
  longDescription: "Our premium cotton t-shirt is crafted from 100% organic cotton for maximum comfort and durability. Perfect for casual outings or lounging at home.\n\nFeatures:\n- 100% organic cotton fabric\n- Pre-shrunk for perfect fit\n- Reinforced collar and shoulders\n- Double-stitched sleeves and bottom hem\n- Available in multiple colors and sizes\n- Machine washable\n\nSustainably sourced and ethically manufactured. Each purchase supports fair trade practices.",
  image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&q=80",
  images: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop&q=80"
  ],
  pricingModels: [
    {
      id: "pm1",
      name: "Standard Price",
      price: 799,
      currency: "INR",
      interval: "one_time",
      features: [
        "Premium 100% cotton",
        "Available in all sizes",
        "Free shipping on orders above ₹999",
        "30-day return policy"
      ],
      highlighted: true
    }
  ],
  category: "cat_ec_1",
  productCategory: "cat_ec_1", // Fashion & Apparel
  tags: ["t-shirt", "casual", "cotton", "unisex"],
  featured: true,
  badge: "Bestseller",
  compareAtPrice: 999,
  discountedPrice: 799,
  discountPercentage: 20,
  variants: [
    {
      id: "var-1",
      name: "Small / Black",
      sku: "TSH-BLK-S",
      stock: 50,
      attributes: { size: "S", color: "Black" },
      enabled: true
    },
    {
      id: "var-2",
      name: "Small / White",
      sku: "TSH-WHT-S",
      stock: 45,
      attributes: { size: "S", color: "White" },
      enabled: true
    },
    {
      id: "var-3",
      name: "Medium / Black",
      sku: "TSH-BLK-M",
      stock: 75,
      attributes: { size: "M", color: "Black" },
      enabled: true
    },
    {
      id: "var-4",
      name: "Medium / White",
      sku: "TSH-WHT-M",
      stock: 80,
      attributes: { size: "M", color: "White" },
      enabled: true
    },
    {
      id: "var-5",
      name: "Large / Black",
      sku: "TSH-BLK-L",
      stock: 60,
      attributes: { size: "L", color: "Black" },
      enabled: true
    },
    {
      id: "var-6",
      name: "Large / White",
      sku: "TSH-WHT-L",
      stock: 55,
      attributes: { size: "L", color: "White" },
      enabled: true
    },
    {
      id: "var-7",
      name: "XL / Black",
      sku: "TSH-BLK-XL",
      stock: 40,
      attributes: { size: "XL", color: "Black" },
      enabled: true
    },
    {
      id: "var-8",
      name: "XL / White",
      sku: "TSH-WHT-XL",
      stock: 35,
      attributes: { size: "XL", color: "White" },
      enabled: true
    }
  ],
  inventory: {
    trackInventory: true,
    stock: 50,
    lowStockThreshold: 10,
    allowBackorder: false,
    sku: "TS-001-BLK-M"
  },
  shipping: {
    requiresShipping: true,
    weight: 200,
    dimensions: {
      length: 30,
      width: 25,
      height: 2
    },
    shippingCost: 80,
    freeShippingThreshold: 999
  },
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const sampleDigitalProduct: Product = {
  id: "prod-lightroom-presets-1",
  type: "digital-product",
  title: "Premium Lightroom Presets Pack",
  description: "Professional photo editing presets for stunning Instagram-worthy photos",
  longDescription: "Transform your photos instantly with our premium collection of 50+ Lightroom presets. Perfect for photographers, influencers, and content creators looking to create a cohesive aesthetic.\n\n**What's Included:**\n- 50+ professional Lightroom presets\n- Desktop (.xmp) and mobile (.dng) formats\n- Portrait, landscape, and lifestyle categories\n- Before/after preview guide\n- Installation instructions\n- Video tutorial on preset application\n\n**Instant Download:** Get immediate access after purchase. Compatible with Lightroom Classic, CC, and Mobile.\n\n**Preset Categories:**\n- Warm & Moody (10 presets)\n- Bright & Airy (12 presets)\n- Vintage Film (8 presets)\n- Black & White (10 presets)\n- Travel & Landscape (10 presets)",
  image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=800&fit=crop&q=80",
  images: [
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800&h=800&fit=crop&q=80"
  ],
  pricingModels: [
    {
      id: "pm1",
      name: "Standard Price",
      price: 499,
      currency: "INR",
      interval: "one_time",
      features: [
        "50+ Lightroom presets",
        "Desktop & mobile formats",
        "Instant download",
        "Lifetime access",
        "Free updates"
      ],
      highlighted: true
    }
  ],
  category: "cat_ec_2",
  tags: ["lightroom", "presets", "photography", "digital"],
  featured: true,
  badge: "Digital Download",
  downloadUrl: "/downloads/lightroom-presets-pack.zip",
  inventory: {
    trackInventory: false,
    stock: 9999,
    allowBackorder: true,
    sku: "LP-PREM-001"
  },
  shipping: {
    requiresShipping: false
  },
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const sampleEarbudsProduct: Product = {
  id: "prod-earbuds-1",
  type: "physical-product",
  title: "Wireless Bluetooth Earbuds",
  description: "Premium sound quality with active noise cancellation and 24-hour battery life",
  longDescription: "Experience crystal-clear audio with our premium wireless earbuds. Perfect for music lovers, commuters, and fitness enthusiasts.\n\n**Key Features:**\n- Active Noise Cancellation (ANC)\n- 24-hour battery life with charging case\n- IPX7 water resistance\n- Touch controls for music and calls\n- Premium sound with deep bass\n- Comfortable ergonomic design\n- USB-C fast charging\n- Bluetooth 5.3 connectivity\n\n**What's in the Box:**\n- Wireless earbuds\n- Charging case\n- 3 sizes of ear tips (S, M, L)\n- USB-C charging cable\n- User manual\n- 1-year warranty\n\nPerfect for workouts, travel, and everyday use. Compatible with all Bluetooth devices.",
  image: "https://images.unsplash.com/photo-1590658165737-15a047b7a0c5?w=800&h=800&fit=crop&q=80",
  images: [
    "https://images.unsplash.com/photo-1590658165737-15a047b7a0c5?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&h=800&fit=crop&q=80"
  ],
  pricingModels: [
    {
      id: "pm1",
      name: "Standard Price",
      price: 2499,
      currency: "INR",
      interval: "one_time",
      features: [
        "Premium wireless earbuds",
        "Active noise cancellation",
        "24-hour battery life",
        "Free shipping on orders above ₹999",
        "1-year warranty"
      ],
      highlighted: true
    }
  ],
  category: "cat_ec_2",
  tags: ["earbuds", "wireless", "bluetooth", "audio", "electronics"],
  featured: true,
  badge: "Bestseller",
  compareAtPrice: 2999,
  discountedPrice: 2499,
  discountPercentage: 17,
  inventory: {
    trackInventory: true,
    stock: 25,
    lowStockThreshold: 10,
    allowBackorder: false,
    sku: "EB-WRL-001"
  },
  shipping: {
    requiresShipping: true,
    weight: 150,
    dimensions: {
      length: 12,
      width: 10,
      height: 4
    },
    shippingCost: 50,
    freeShippingThreshold: 999
  },
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// E-commerce Store Template
export const ecommerceTemplate: TemplateData = {
  id: "ecommerce-store",
  title: "E-commerce Store",
  desc: "Complete online store with product catalog, categories, and cart",
  category: "ecommerce",
  icon: ShoppingBag,
  pages: ["Home", "About Us", "Contact Us"],
  heroTitle: "Shop Premium Quality Products",
  heroTagline: "E-commerce • Online Shopping • Fast Delivery",
  heroDescription: "Discover our curated collection of premium products. Free shipping on orders above ₹999. Shop now and get exclusive deals!",
  heroCta: "Shop Now",
  bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&q=90",
  sections: [
    section("hero", "Hero Banner"),
    section("products", "Products", {
      heading: "Featured Products",
      description: "Handpicked collection of our best-selling items"
    }),
    section("features", "Features", {
      heading: "Why Shop With Us",
      items: [
        { title: "Free Shipping", desc: "On orders above ₹999", icon: "🚚" },
        { title: "Secure Payments", desc: "100% safe & secure checkout", icon: "🔒" },
        { title: "Easy Returns", desc: "30-day return policy", icon: "↩️" },
        { title: "Quality Guaranteed", desc: "Premium products, verified quality", icon: "✓" }
      ]
    }),
    section("testimonials", "Testimonials", {
      heading: "What Customers Say",
      items: [
        { name: "Priya Sharma", text: "Amazing quality! The t-shirts are super comfortable and delivery was fast.", rating: 5, avatar: "PS" },
        { name: "Rahul Verma", text: "Great products at reasonable prices. Will definitely order again!", rating: 5, avatar: "RV" },
        { name: "Ananya Gupta", text: "Love the collection! Customer service is excellent too.", rating: 5, avatar: "AG" }
      ]
    }),
    section("stats", "Stats", {
      items: [
        { value: "10,000+", label: "Happy Customers" },
        { value: "5,000+", label: "Products Sold" },
        { value: "4.8/5", label: "Average Rating" },
        { value: "24/7", label: "Support Available" }
      ]
    }),
    section("faq", "FAQ", {
      heading: "Frequently Asked Questions",
      items: [
        { q: "What is the shipping time?", a: "Most orders are delivered within 5-7 business days." },
        { q: "Do you offer cash on delivery?", a: "Yes, COD is available for most locations." },
        { q: "What is your return policy?", a: "We offer a 30-day return policy for unused items in original packaging." },
        { q: "Are the products genuine?", a: "Yes, all our products are 100% authentic and come with quality guarantee." }
      ]
    }),
    section("contact-form", "Contact Form"),
    section("cta-banner", "CTA Banner", {
      heading: "Ready to Shop?",
      text: "Browse our complete collection and find your perfect product today!",
      buttonText: "Start Shopping"
    })
  ],
  productsConfig: {
    enabled: true,
    products: [samplePhysicalProduct, sampleDigitalProduct, sampleEarbudsProduct],
    displayMode: "grid",
    showPricing: true,
    categoriesEnabled: true,
    categories: ["Fashion & Apparel", "Electronics", "Digital Products", "Books"]
  },
  contactForm: {
    enabled: true,
    title: "Get in Touch",
    description: "Have questions about our products? We're here to help!",
    fields: [
      { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Your name" },
      { id: "email", label: "Email", type: "email", required: true, placeholder: "your.email@example.com" },
      { id: "phone", label: "Phone", type: "phone", required: false, placeholder: "+91 98765 43210" },
      { id: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help?" }
    ],
    includeInterests: false,
    autoReply: true,
    autoReplyMessage: "Thanks for reaching out! We'll get back to you within 24 hours.",
    successMessage: "Thank you! We'll be in touch soon."
  },
  pagesData: {
    "About Us": {
      heroTitle: "About Our Store",
      heroTagline: "Quality • Trust • Excellence",
      heroDescription: "Your trusted destination for premium products and exceptional service.",
      heroCta: "Shop Now",
      bannerImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("about", "Our Story", {
          heading: "Built on Quality and Trust",
          text: "Founded in 2020, we've built a reputation for delivering premium products and exceptional customer service. Our mission is simple: provide our customers with quality products at fair prices, backed by outstanding support.\n\nEvery product in our catalog is carefully selected and quality-checked to ensure you get the best value for your money. We believe in building long-term relationships with our customers through trust and reliability.",
          image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&q=80"
        }),
        section("features", "Our Values", {
          heading: "What We Stand For",
          items: [
            { title: "Quality First", desc: "Every product is carefully vetted for quality", icon: "⭐" },
            { title: "Customer Satisfaction", desc: "Your happiness is our priority", icon: "😊" },
            { title: "Fast Delivery", desc: "Quick and reliable shipping nationwide", icon: "⚡" },
            { title: "Secure Shopping", desc: "Safe and encrypted payment processing", icon: "🔒" }
          ]
        }),
        section("stats", "Impact", {
          items: [
            { value: "10,000+", label: "Customers Served" },
            { value: "5,000+", label: "Orders Delivered" },
            { value: "4.8/5", label: "Average Rating" },
            { value: "99%", label: "Satisfaction Rate" }
          ]
        }),
        section("cta-banner", "Start Shopping", {
          heading: "Discover Our Collection",
          text: "Browse through our carefully curated products and find what you love",
          buttonText: "Shop Now"
        })
      ]
    },
    "Contact Us": {
      heroTitle: "Contact Us",
      heroTagline: "We're Here to Help",
      heroDescription: "Have questions? Need support? Get in touch with our friendly customer service team.",
      heroCta: "",
      bannerImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop&q=90",
      sections: [
        section("hero", "Hero Banner"),
        section("contact-form", "Contact Form"),
        section("features", "Reach Us", {
          heading: "How to Contact Us",
          items: [
            { title: "Email", desc: "support@store.com", icon: "📧" },
            { title: "Phone", desc: "+91 98765 43210", icon: "📞" },
            { title: "WhatsApp", desc: "Chat with us instantly", icon: "💬" },
            { title: "Hours", desc: "Mon-Sat, 9 AM - 7 PM IST", icon: "🕐" }
          ]
        }),
        section("faq", "Common Questions", {
          heading: "Frequently Asked Questions",
          items: [
            { q: "How do I track my order?", a: "You'll receive a tracking link via email once your order ships." },
            { q: "What payment methods do you accept?", a: "We accept UPI, cards, net banking, and cash on delivery." },
            { q: "Can I cancel my order?", a: "Yes, you can cancel within 24 hours of placing the order." },
            { q: "Do you ship internationally?", a: "Currently we only ship within India." }
          ]
        })
      ]
    }
  }
};

// Export sample e-commerce products for use in other templates
export const sampleEcommerceProducts = {
  tshirt: samplePhysicalProduct,
  lightroomPresets: sampleDigitalProduct,
  earbuds: sampleEarbudsProduct
};

export const productFocusedTemplates = [
  academyTemplate,
  coachingTemplate,
  webinarTemplate,
  ecommerceTemplate
];
