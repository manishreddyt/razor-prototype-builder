import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export interface CourseInstructor {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  credentials?: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: number;
  duration: string;
}

export interface CourseData {
  name: string;
  title?: string;
  description: string;
  tagline?: string;
  modules: CourseModule[];
  instructor: CourseInstructor;
  duration: string;
  courseDuration?: string;
  courseFormat?: string;
  level: string;
  image?: string;
  bannerImage?: string;
  price?: number;
  amount: number;
  subscriptionAmount?: number;
  isPaid: boolean;
  pricingModel: "one-time" | "subscription" | "free";
  whatYouWillLearn: string[];
  courseIncludes: string[];
  enrollmentFields?: string[];
  certificateOffered?: boolean;
}

export interface CourseStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledAt: string;
  progress: number;
  status?: string;
  paymentStatus?: string;
  amount?: number;
}

const CourseCreate = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/website-builder")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Create Course</h1>
        </div>
        <p className="text-muted-foreground">Course creation page - coming soon.</p>
      </div>
    </DashboardLayout>
  );
};

export default CourseCreate;
