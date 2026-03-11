import { useState } from "react";

export interface CoachingData {
  name: string;
  tagline: string;
  description: string;
  bannerImage: string;
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  heroCta: string;
  isPaid: boolean;
  amount: number;
  pricingModel: string;
  sessionDuration: number;
  coachName: string;
  coachTitle: string;
  coachBio: string;
  enableWeekends: boolean;
  whatYouWillLearn: string[];
  features: { title: string; desc: string; icon?: string }[];
  testimonials: { name: string; text: string; rating?: number }[];
  faqItems: { q: string; a: string }[];
  courseIncludes: string[];
}

const CoachingCreate = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Create Coaching Session</h1>
      <p className="text-muted-foreground mt-2">Coming soon...</p>
    </div>
  );
};

export default CoachingCreate;
