import { ReactNode, useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import DashboardAIAssistant from "@/components/DashboardAIAssistant";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isAIOpen, setIsAIOpen] = useState(() => {
    const saved = localStorage.getItem("dashboard-ai-open");
    return saved !== null ? saved === "true" : false;
  });

  useEffect(() => {
    localStorage.setItem("dashboard-ai-open", String(isAIOpen));
  }, [isAIOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar isAIOpen={isAIOpen} onToggleAI={() => setIsAIOpen(!isAIOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <DashboardAIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
};
