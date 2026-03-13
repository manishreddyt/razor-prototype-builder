import type { SmartPageSite } from "@/pages/WebsiteBuilder";
import type { CoachingData } from "@/pages/CoachingCreate";

export const seedCoachingPage = (): SmartPageSite | null => {
  const coachingPageKey = "demo_coaching_page_seeded";

  // Check if already seeded
  if (localStorage.getItem(coachingPageKey) === "true") {
    return null;
  }

  const coachingId = "coaching-demo-001";

  // Create coaching site
  const coachingSite: SmartPageSite = {
    id: coachingId,
    title: "Career Coaching with Priya Sharma",
    description: "Transform your career with personalized 1:1 coaching sessions",
    slug: "career-coaching-priya",
    pageType: "coaching",
    template: "coaching",
    status: "published",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create coaching data with slot booking configuration
  const coachingData: CoachingData = {
    name: "Career Coaching with Priya Sharma",
    tagline: "Land Your Dream Job in 90 Days or Less",
    description: "Get personalized guidance from a career coach who has helped 500+ professionals transition to their dream roles.",
    bannerImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop",
    heroTitle: "Land Your Dream Job in 90 Days or Less",
    heroTagline: "1:1 Career Coaching",
    heroDescription: "Get personalized guidance from a career coach who has helped 500+ professionals transition to their dream roles.",
    heroCta: "Book Your Free Discovery Call",

    isPaid: true,
    amount: 3999,
    pricingModel: "per_session",
    sessionDuration: 60,
    packageSessions: 4,
    packageAmount: 12999,

    sessionConfig: {
      duration: 60,
      buffer: 15,
      breakBetween: 15,
      maxPerDay: 8,
    },

    availability: [
      { day: "monday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "tuesday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "wednesday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "thursday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "friday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "saturday", enabled: false, startTime: "09:00", endTime: "17:00" },
      { day: "sunday", enabled: false, startTime: "09:00", endTime: "17:00" },
    ],

    bookingFields: [
      { id: "rf_name", name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your name" },
      { id: "rf_email", name: "email", label: "Email", type: "email", required: true, placeholder: "your@email.com" },
      { id: "rf_phone", name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "+91 98765 43210" },
      { id: "rf_experience", name: "experience", label: "Years of Experience", type: "text", required: false, placeholder: "e.g., 5 years" },
    ],

    coach: {
      name: "Priya Sharma",
      title: "Senior Career Coach & HR Consultant",
      bio: "With over 10 years of experience in HR and career coaching, I've helped 500+ professionals land their dream jobs at top companies like Google, Microsoft, and Amazon. My coaching focuses on resume optimization, interview preparation, and career strategy.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      credentials: ["ICF Certified Coach", "10+ Years HR Experience", "500+ Clients Helped", "Top 1% LinkedIn Coach"],
    },

    coachName: "Priya Sharma",
    coachTitle: "Senior Career Coach",
    coachBio: "Helping professionals land their dream jobs since 2015",

    enableWeekends: false,

    whatYouWillLearn: [
      "Resume optimization for ATS systems",
      "Interview preparation and mock sessions",
      "Salary negotiation strategies",
      "Personal branding and LinkedIn optimization",
      "Career transition planning",
    ],

    features: [
      { title: "Personalized Strategy", desc: "Custom career roadmap based on your goals", icon: "target" },
      { title: "Interview Prep", desc: "Mock interviews with real-time feedback", icon: "message" },
      { title: "Resume Review", desc: "ATS-optimized resume that gets noticed", icon: "file" },
      { title: "LinkedIn Optimization", desc: "Build a powerful personal brand", icon: "linkedin" },
    ],

    testimonials: [
      { name: "Rahul Verma", text: "Priya helped me land a PM role at Google. Her interview prep was game-changing!", rating: 5 },
      { name: "Anjali Patel", text: "Went from job searching for 6 months to 3 offers in 4 weeks. Highly recommend!", rating: 5 },
    ],

    faqItems: [
      { q: "How long is each session?", a: "Each session is 60 minutes of focused, personalized coaching." },
      { q: "Can I reschedule my session?", a: "Yes, you can reschedule up to 24 hours before your session." },
      { q: "Do you offer refunds?", a: "We offer a 100% money-back guarantee if you're not satisfied after your first session." },
    ],

    courseIncludes: [
      "1:1 personalized coaching session",
      "Resume review and optimization",
      "Interview preparation materials",
      "LinkedIn profile review",
      "Follow-up email support",
    ],
  };

  // Save to localStorage
  try {
    // Add to sites list
    const sites = localStorage.getItem("smartpage_sites");
    const sitesList: SmartPageSite[] = sites ? JSON.parse(sites) : [];

    // Check if already exists
    const exists = sitesList.find(s => s.id === coachingId);
    if (!exists) {
      sitesList.unshift(coachingSite);
      localStorage.setItem("smartpage_sites", JSON.stringify(sitesList));
    }

    // Save coaching data
    localStorage.setItem(`coaching_${coachingId}`, JSON.stringify(coachingData));

    // Mark as seeded
    localStorage.setItem(coachingPageKey, "true");

    console.log("✅ Demo coaching page seeded successfully:", coachingSite.title);
    return coachingSite;
  } catch (error) {
    console.error("❌ Failed to seed coaching page:", error);
    return null;
  }
};
