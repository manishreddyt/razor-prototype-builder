import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Sparkles, Send, ArrowRight,
  ShoppingCart, BarChart3, CalendarDays, FileText,
  Smartphone, Globe, Users, CreditCard,
  Brain, Wand2, CheckCircle2, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const promptSuggestions = [
  "A fitness tracker app with workout plans and progress charts",
  "Invoice generator with Razorpay payment collection",
  "Event booking app with ticketing and QR check-in",
  "SaaS dashboard with user analytics and billing",
  "Online food ordering app with cart and checkout",
  "Portfolio website with contact form and testimonials",
];

const appTypes = [
  { id: "webapp", title: "Web Application", desc: "Full-featured web app with dashboard, auth & payments.", icon: Globe, color: "bg-blue-100 text-blue-700" },
  { id: "marketplace", title: "Marketplace / Store", desc: "E-commerce or marketplace with listings, cart & checkout.", icon: ShoppingCart, color: "bg-emerald-100 text-emerald-700" },
  { id: "saas", title: "SaaS Dashboard", desc: "Analytics dashboard with user management & subscriptions.", icon: BarChart3, color: "bg-purple-100 text-purple-700" },
  { id: "booking", title: "Booking / Scheduling", desc: "Appointment booking with calendar, payments & notifications.", icon: CalendarDays, color: "bg-amber-100 text-amber-700" },
  { id: "forms", title: "Forms & Data Collection", desc: "Custom forms with validation, file uploads & submissions.", icon: FileText, color: "bg-pink-100 text-pink-700" },
  { id: "mobile", title: "Mobile-First App", desc: "Mobile-optimized app with push notifications & offline support.", icon: Smartphone, color: "bg-cyan-100 text-cyan-700" },
];

const analysisSteps = [
  { icon: Brain, text: "Understanding your app idea..." },
  { icon: Code2, text: "Planning app architecture..." },
  { icon: Wand2, text: "Generating your app..." },
  { icon: CheckCircle2, text: "" },
];

const AIAppBuilderCreate = () => {
  const navigate = useNavigate();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [detectedType, setDetectedType] = useState("");

  const handleGenerate = () => {
    if (!aiPrompt.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setDetectedType("Custom App");
    setTimeout(() => setAnalysisStep(1), 1200);
    setTimeout(() => setAnalysisStep(2), 2400);
    setTimeout(() => setAnalysisStep(3), 3600);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate(`/ai-app-builder/editor?prompt=${encodeURIComponent(aiPrompt)}`);
    }, 4800);
  };

  const handleAppType = (type: typeof appTypes[0]) => {
    navigate(`/ai-app-builder/editor?type=${encodeURIComponent(type.id)}&title=${encodeURIComponent(type.title)}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Analysis Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-[3px] border-border" />
              <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-3 w-full">
              {analysisSteps.map((step, i) => {
                const isActive = analysisStep === i;
                const isDone = analysisStep > i;
                const StepIcon = step.icon;
                const displayText = i === 3 ? `Launching your ${detectedType}...` : step.text;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${isActive ? "bg-accent border border-primary/20" : isDone ? "opacity-50" : "opacity-20"}`}>
                    <StepIcon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary animate-pulse" : isDone ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{displayText}</span>
                    {isDone && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="animate-fade-in">
          {/* Top bar */}
          <div className="px-6 py-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/ai-app-builder")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>

          {/* Hero Section */}
          <div className="relative pb-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }} />
            </div>

            <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Powered by AI</span>
              </div>
              <h1 className="text-[28px] font-semibold text-foreground tracking-tight text-center">
                What app do you want to build?
              </h1>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-lg">
                Describe your app idea and AI will build it for you — complete with UI, payments, and everything you need.
              </p>

              {/* Prompt Input */}
              <div className={`w-full max-w-2xl mt-8 rounded-xl border bg-card transition-all duration-200 ${isFocused ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" : "border-border shadow-sm"}`}>
                <textarea
                  className="w-full bg-transparent px-5 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                  placeholder="e.g. 'A project management app with task boards, team collaboration, and Razorpay billing...'"
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs">AI-powered builder</span>
                  </div>
                  <Button size="sm" className="gap-2 rounded-lg px-5" onClick={handleGenerate} disabled={!aiPrompt.trim()}>
                    Build App <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl">
                {promptSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setAiPrompt(s)}
                    className="text-xs px-3.5 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* App Types */}
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Or choose an app type</h2>
              <p className="text-sm text-muted-foreground mt-1">Pick a category to get started with a pre-configured setup.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {appTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAppType(type)}
                  className="text-left p-5 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg ${type.color} flex items-center justify-center mb-3`}>
                    <type.icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{type.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{type.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Start building <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>

            {/* Features callout */}
            <div className="mt-12 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Built-in Razorpay Payments</h3>
                  <p className="text-xs text-muted-foreground">Every app comes with payment collection built right in.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: CreditCard, label: "One-time Payments" },
                  { icon: Users, label: "Subscriptions" },
                  { icon: ShoppingCart, label: "Cart & Checkout" },
                  { icon: BarChart3, label: "Revenue Analytics" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <f.icon className="h-3.5 w-3.5 text-primary/60" />
                    {f.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIAppBuilderCreate;
