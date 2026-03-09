import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export interface CourseData {
  title: string;
  description: string;
  modules: CourseModule[];
  instructor: string;
  duration: string;
  level: string;
  image?: string;
  price?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "text" | "quiz";
}

export interface CourseStudent {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
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
