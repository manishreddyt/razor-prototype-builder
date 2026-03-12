import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ArrowUpRight, ArrowDownRight, IndianRupee, Users, CreditCard, TrendingUp,
  Globe, Mail, Plug, ClipboardList, MessageCircle, Tag, Rocket, Check,
  ChevronRight, Play, Sparkles, BookOpen, Video, GraduationCap, Zap,
  ArrowRight, Star, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  path: string;
  completed: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    { id: "page", title: "Create your first course page", description: "Build a stunning landing page for your course with AI", icon: Globe, action: "Create Page", path: "/website-builder/create", completed: false },
    { id: "workflow", title: "Set up an automation workflow", description: "Automate receipts, onboarding, or follow-ups", icon: Mail, action: "Create Workflow", path: "/email-workflows", completed: false },
    { id: "connector", title: "Connect Zoom or Google Meet", description: "Link your video tool for live classes & webinars", icon: Plug, action: "Connect", path: "/connectors", completed: false },
    { id: "agent", title: "Deploy your first AI agent", description: "Let AI handle sales calls or student support 24/7", icon: MessageCircle, action: "Set Up Agent", path: "/agents", completed: false },
  ]);

  const completedCount = setupSteps.filter(s => s.completed).length;
  const progressPercent = (completedCount / setupSteps.length) * 100;
  const allDone = completedCount === setupSteps.length;

  const handleStepAction = (stepId: string) => {
    const step = setupSteps.find(s => s.id === stepId);
    if (step) {
      setSetupSteps(prev => prev.map(s => s.id === stepId ? { ...s, completed: true } : s));
      navigate(step.path);
    }
  };

  const stats = [
    { label: "Total Revenue", value: "₹4,52,300", change: "+12.5%", up: true, icon: IndianRupee },
    { label: "Active Students", value: "1,248", change: "+8.2%", up: true, icon: Users },
    { label: "Payment Links", value: "342", change: "+24.1%", up: true, icon: CreditCard },
    { label: "Conversion Rate", value: "68.4%", change: "-2.1%", up: false, icon: TrendingUp },
  ];

  const quickActions = [
    { title: "Create Course Page", desc: "AI-powered landing page", icon: Globe, path: "/website-builder/create", color: "bg-primary/10 text-primary" },
    { title: "Host a Webinar", desc: "Free or paid, live or recorded", icon: Video, path: "/website-builder/webinar/chat", color: "bg-[hsl(152,69%,91%)] text-[hsl(152,69%,30%)]" },
    { title: "Launch 1:1 Coaching", desc: "Personal coaching packages", icon: GraduationCap, path: "/website-builder/editor?template=coaching&title=Coaching&type=Coaching", color: "bg-[hsl(38,92%,90%)] text-[hsl(38,92%,35%)]" },
    { title: "Create Offer", desc: "Discounts & bundles", icon: Tag, path: "/offers", color: "bg-accent text-accent-foreground" },
  ];

  const tips = [
    { emoji: "🎯", title: "Boost conversions by 40%", desc: "Deploy the Sales Agent to auto-follow-up with free webinar leads and pitch your paid course." },
    { emoji: "⚡", title: "Save 10 hrs/week", desc: "Set up automated workflows for receipts, onboarding emails, and cart recovery." },
    { emoji: "📈", title: "Grow with Smart Pages", desc: "Creators using AI-built landing pages see 2.5x more enrollments than generic forms." },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6 max-w-6xl">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Welcome Back 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Everything you need to sell courses, host webinars, and grow your education business.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder/create")} className="flex-shrink-0 w-full sm:w-auto">
            <Sparkles className="h-4 w-4 mr-1" />
            Quick Create
          </Button>
        </div>

        {/* Setup Checklist */}
        {!allDone && (
          <div className="blade-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                  <Rocket className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Get started in 4 steps</h2>
                  <p className="text-xs text-muted-foreground">{completedCount} of {setupSteps.length} completed</p>
                </div>
              </div>
              <span className="text-xs font-medium text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {setupSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => !step.completed && handleStepAction(step.id)}
                  disabled={step.completed}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all group",
                    step.completed
                      ? "border-border bg-secondary/30 opacity-60"
                      : "border-border hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0 transition-colors",
                    step.completed ? "bg-[hsl(152,69%,91%)]" : "bg-primary/10"
                  )}>
                    {step.completed ? (
                      <Check className="h-4 w-4 text-[hsl(152,69%,30%)]" />
                    ) : (
                      <step.icon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium",
                      step.completed ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                  {!step.completed && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0 group-hover:text-primary transition-colors" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="blade-stat">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                <span className={`flex items-center text-xs font-medium ${stat.up ? "text-[hsl(152,69%,41%)]" : "text-destructive"}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="blade-card flex items-center gap-3 p-4 text-left hover:shadow-md transition-all group"
              >
                <div className={cn("flex items-center justify-center h-10 w-10 rounded-lg flex-shrink-0", action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column: Tips + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Tips */}
          <div className="lg:col-span-2 blade-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Creator Tips</h2>
            </div>
            <div className="space-y-3">
              {tips.map((tip) => (
                <div key={tip.title} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <span className="text-lg flex-shrink-0 mt-0.5">{tip.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tip.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="lg:col-span-3 blade-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Payments</h2>
              <button onClick={() => navigate("/transactions")} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {[
                { student: "Priya Sharma", course: "Full Stack Dev Bootcamp", amount: "₹12,999", time: "2 min ago", status: "Paid" },
                { student: "Rahul Mehta", course: "UI/UX Design Masterclass", amount: "₹8,499", time: "15 min ago", status: "Paid" },
                { student: "Ananya Gupta", course: "Data Science Fundamentals", amount: "₹15,999", time: "1 hr ago", status: "Partial" },
                { student: "Vikram Singh", course: "Digital Marketing 101", amount: "₹4,999", time: "3 hr ago", status: "Created" },
              ].map((p) => (
                <div key={p.student} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {p.student.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.student}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.course}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-foreground">{p.amount}</p>
                    <p className="text-[11px] text-muted-foreground">{p.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore Platform Banner */}
        <div className="blade-card p-4 sm:p-5 bg-accent/30 border-primary/10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 flex-shrink-0">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">You're building something great!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Creators on this platform have earned ₹12+ Cr in the last 30 days. Set up your first course page to start.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/website-builder/create")} className="w-full sm:w-auto flex-shrink-0">
            Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
