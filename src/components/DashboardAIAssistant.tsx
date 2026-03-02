import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, X, Send, ChevronRight, Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  actions?: ActionItem[];
}

interface ActionItem {
  label: string;
  description?: string;
  icon?: string;
  nextFlow?: string;
  route?: string;
}

const FLOWS: Record<string, { message: string; actions: ActionItem[] }> = {
  welcome: {
    message: "👋 Hey! I'm your Razorpay AI assistant. What would you like to do today?",
    actions: [
      { label: "Sell online courses", icon: "🎓", nextFlow: "online_courses", description: "Set up and sell digital courses" },
      { label: "Sell 1:1 sessions", icon: "📞", nextFlow: "sessions", description: "Offer coaching or consulting" },
    ],
  },
  online_courses: {
    message: "Great choice! 🎓 Here's how I can help you sell online courses. Pick a step to get started:",
    actions: [
      { label: "Setup online course website", icon: "🌐", nextFlow: "setup_website", description: "Create a beautiful landing page for your course" },
      { label: "Run a free webinar", icon: "📹", nextFlow: "run_webinar", description: "Attract leads with a free webinar" },
      { label: "Convert free → paid customers", icon: "💰", nextFlow: "convert_customers", description: "Turn attendees into paying students" },
      { label: "Create payment link", icon: "🔗", route: "/payment-links", description: "Generate a quick payment link to share" },
    ],
  },
  sessions: {
    message: "Let's set up your 1:1 sessions business! 📞 Here's what I recommend:",
    actions: [
      { label: "Create a coaching page", icon: "📋", route: "/smart-pages/create", description: "Build a booking page for your sessions" },
      { label: "Set up pricing plans", icon: "💳", route: "/subscriptions", description: "Offer session packages & subscriptions" },
      { label: "Automate follow-ups", icon: "🤖", route: "/email-workflows", description: "Set up post-session email workflows" },
      { label: "Track customer progress", icon: "📊", route: "/customer-tracker", description: "Monitor engagement & retention" },
    ],
  },
  social_commerce: {
    message: "Social commerce is booming! 🛒 Here's how to get started:",
    actions: [
      { label: "Create a Smart Page store", icon: "🛍️", route: "/smart-pages/create", description: "Build a mobile-first storefront" },
      { label: "Setup WhatsApp payments", icon: "💬", route: "/app-marketplace", description: "Accept payments via WhatsApp" },
      { label: "Create offers & coupons", icon: "🏷️", route: "/offers", description: "Drive sales with promotions" },
      { label: "Track orders & settlements", icon: "📈", route: "/settlements", description: "Monitor your revenue" },
    ],
  },
  setup_website: {
    message: "Let's build your course website! 🌐 I can help you with:",
    actions: [
      { label: "Use Smart Pages builder", icon: "⚡", route: "/smart-pages/create", description: "AI-powered page builder — just describe your course" },
      { label: "Use Website Builder", icon: "🎨", route: "/website-builder", description: "Full website with custom pages" },
      { label: "Install Course Graphy", icon: "📚", route: "/app-marketplace/course-graphy", description: "Full LMS with student management" },
    ],
  },
  run_webinar: {
    message: "Free webinars are a great lead magnet! 📹 Here's the plan:",
    actions: [
      { label: "Create webinar landing page", icon: "📄", route: "/website-builder/webinar/create", description: "Capture registrations with a beautiful page" },
      { label: "Set up email reminders", icon: "📧", route: "/email-workflows", description: "Automate reminder emails before the event" },
      { label: "Deploy Sales Agent", icon: "🤖", route: "/agents", description: "AI agent to follow up with attendees" },
    ],
  },
  convert_customers: {
    message: "Converting free users to paid customers is the key! 💰 Here's your playbook:",
    actions: [
      { label: "Deploy Sales AI Agent", icon: "🤖", route: "/agents", description: "Auto-call attendees and pitch paid course" },
      { label: "Create limited-time offer", icon: "⏰", route: "/offers", description: "Urgency drives conversions" },
      { label: "Set up retargeting workflow", icon: "🔄", route: "/email-workflows", description: "Multi-touch follow-up sequence" },
      { label: "Track conversion funnel", icon: "📊", route: "/reports", description: "See what's working" },
    ],
  },
};

interface DashboardAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardAIAssistant = ({ isOpen, onClose }: DashboardAIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: FLOWS.welcome.message, actions: FLOWS.welcome.actions },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAction = (action: ActionItem) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: action.label };
    setMessages((prev) => [...prev, userMsg]);

    if (action.route) {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Taking you to **${action.label}** now! 🚀\n\nI'll be right here if you need any help.`,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        navigate(action.route!);
      }, 400);
    }

    if (action.nextFlow && FLOWS[action.nextFlow]) {
      const flow = FLOWS[action.nextFlow];
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: flow.message,
          actions: flow.actions,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }, 600);
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      let flowKey = "welcome";
      if (lower.includes("course") || lower.includes("teach") || lower.includes("education")) flowKey = "online_courses";
      else if (lower.includes("session") || lower.includes("coaching") || lower.includes("1:1") || lower.includes("consult")) flowKey = "sessions";
      else if (lower.includes("social") || lower.includes("whatsapp") || lower.includes("instagram") || lower.includes("commerce")) flowKey = "social_commerce";
      else if (lower.includes("webinar")) flowKey = "run_webinar";
      else if (lower.includes("website") || lower.includes("landing")) flowKey = "setup_website";
      else if (lower.includes("convert") || lower.includes("paid")) flowKey = "convert_customers";

      const flow = FLOWS[flowKey];
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: flowKey === "welcome"
          ? "I'd love to help! Here's what I can assist with:"
          : flow.message,
        actions: flow.actions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 500);
  };

  const handleReset = () => {
    setMessages([
      { id: "welcome", role: "assistant", content: FLOWS.welcome.message, actions: FLOWS.welcome.actions },
    ]);
  };

  return (
    <>
      {/* Full-height right sidebar panel */}
      <div
        className={cn(
          "h-full border-l border-border bg-card flex flex-col transition-all duration-300 flex-shrink-0",
          isOpen ? "w-[340px]" : "w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Razorpay AI</p>
              <p className="text-[11px] text-muted-foreground">Your business growth assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleReset} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary">
              Reset
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[95%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-foreground"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.actions && (
                  <div className="mt-2.5 space-y-1.5">
                    {msg.actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleAction(action)}
                        className="flex items-center gap-2.5 w-full p-2 rounded-lg bg-background/80 hover:bg-background border border-border/50 text-left transition-all hover:shadow-sm group"
                      >
                        <span className="text-base flex-shrink-0">{action.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{action.label}</p>
                          {action.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{action.description}</p>
                          )}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 h-9 text-sm"
            />
            <Button type="submit" size="icon" className="h-9 w-9" disabled={!input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DashboardAIAssistant;
