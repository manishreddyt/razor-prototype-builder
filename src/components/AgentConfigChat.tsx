import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Send,
  Sparkles,
  PhoneCall,
  Megaphone,
  MessageCircle,
  Star,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: string[];
  quickActions?: { label: string; description: string }[];
}

const templatesByType: Record<string, { label: string; description: string }[]> = {
  sales: [
    { label: "Free webinar → Paid conversion", description: "Call leads within 1hr, pitch paid course, send payment link" },
    { label: "Demo request follow-up", description: "Follow up with demo requests, qualify and convert" },
    { label: "Re-engage cold leads", description: "Contact leads who haven't responded in 7 days" },
  ],
  marketing: [
    { label: "Webinar retargeting campaign", description: "Retarget attendees who didn't convert with ads" },
    { label: "Course launch campaign", description: "Multi-channel campaign for new course launch" },
    { label: "Student referral program", description: "Incentivize existing students to refer friends" },
  ],
  support: [
    { label: "24/7 query resolution", description: "Handle FAQs, share materials, escalate complex issues" },
    { label: "Onboarding assistance", description: "Guide new students through course access and setup" },
    { label: "Payment issue resolution", description: "Help students with failed payments and refunds" },
  ],
  feedback: [
    { label: "Post-course NPS collection", description: "Collect NPS scores after course completion" },
    { label: "Testimonial harvesting", description: "Request testimonials from high-NPS students" },
    { label: "At-risk student detection", description: "Identify students likely to churn based on engagement" },
  ],
};

const agentTypeMap: Record<string, string> = {
  sales: "Sales Agent",
  marketing: "Marketing Agent",
  support: "Customer Service Agent",
  feedback: "Feedback Agent",
};

interface AgentConfigChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: string;
  onSaveGoal: (goal: string) => void;
}

const AgentConfigChat = ({ open, onOpenChange, agentType, onSaveGoal }: AgentConfigChatProps) => {
  const templates = templatesByType[agentType] || templatesByType.sales;
  const agentName = agentTypeMap[agentType] || "Agent";

  const getInitialMessages = (): ChatMessage[] => [
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Hi! I'll help you configure your **${agentName}**.\n\nDescribe your goal in plain language, or pick a template below to get started.`,
      quickActions: templates,
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let response: ChatMessage;

      if (lower.includes("webinar") || lower.includes("conversion") || lower.includes("paid")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Great! Here's the process I'll follow:\n\n**Goal: Free Webinar → Paid Course Conversion**\n\n📞 **Step 1:** Within 1 hour of webinar ending, call each attendee\n📋 **Step 2:** Pitch the paid course — highlight key outcomes & testimonials\n🤝 **Step 3:** Handle objections using your FAQ database\n💳 **Step 4:** If interested, send personalised payment link via WhatsApp\n🔄 **Step 5:** For "maybe later" — schedule follow-up call in 48 hours\n📊 **Step 6:** Log outcome for each lead (Converted / Interested / Not Interested)\n\nShall I **save this configuration** or would you like to modify any steps?`,
          suggestions: ["Save this configuration", "Add email follow-up too", "Change follow-up to 24 hours", "Add a discount offer for quick signups"],
        };
      } else if (lower.includes("save") || lower.includes("confirm") || lower.includes("create")) {
        const goalSummary = messages.filter(m => m.role === "assistant").pop()?.content || text;
        onSaveGoal(goalSummary);
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `✅ **Configuration saved!**\n\nYour ${agentName} is now configured and ready to deploy. Head back to the agent card and click **Deploy** to start.\n\nYou can reconfigure anytime by opening this chat again.`,
        };
      } else if (lower.includes("retarget") || lower.includes("campaign") || lower.includes("ads")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Here's the campaign plan:\n\n**Goal: Student Retargeting Campaign**\n\n🎯 **Step 1:** Identify students who attended free webinar but didn't purchase\n📱 **Step 2:** Create custom audience on Meta & Google Ads\n📧 **Step 3:** Day 1 — Send "You missed out" email with course highlights\n📣 **Step 4:** Day 2-5 — Run retargeting ads with student testimonials\n💰 **Step 5:** Day 7 — Send limited-time discount offer (15% off)\n📊 **Step 6:** Track conversions and optimise ad spend\n\nShall I save this configuration?`,
          suggestions: ["Save this configuration", "Increase discount to 20%", "Add WhatsApp reminders", "Extend campaign to 14 days"],
        };
      } else if (lower.includes("nps") || lower.includes("feedback") || lower.includes("review")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Here's the feedback collection plan:\n\n**Goal: Post-Course NPS & Review Collection**\n\n📊 **Step 1:** 24 hours after course completion, send NPS survey via email\n⭐ **Step 2:** For scores 9-10 — request a testimonial + Google review link\n⚠️ **Step 3:** For scores 1-6 — alert you immediately, send apology + feedback form\n📧 **Step 4:** For scores 7-8 — send "how can we improve?" follow-up\n📈 **Step 5:** Generate weekly NPS report with trends\n\nReady to save?`,
          suggestions: ["Save this configuration", "Add WhatsApp survey option", "Change timing to 48 hours", "Include instructor rating"],
        };
      } else if (lower.includes("query") || lower.includes("support") || lower.includes("whatsapp")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Here's the support process:\n\n**Goal: 24/7 WhatsApp Customer Support**\n\n💬 **Step 1:** Receive student query on WhatsApp\n🔍 **Step 2:** Check against your FAQ database for instant answers\n📚 **Step 3:** If course-related — share relevant materials/links\n🎫 **Step 4:** If complex — create support ticket and notify your team\n⏰ **Step 5:** If no resolution in 2 hours — escalate to you directly\n📊 **Step 6:** Log all interactions for quality review\n\nShall I save this?`,
          suggestions: ["Save this configuration", "Add voice call escalation", "Include refund handling", "Add auto-response for off-hours"],
        };
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I can build that! Let me understand better:\n\n**1. What's the trigger?**\n- After a webinar / After a purchase / On schedule / Manual\n\n**2. What actions should the agent take?**\n- Call leads / Send WhatsApp / Send email / Run ads\n\n**3. What's the success metric?**\n- Conversions / Response rate / NPS score / Resolution time\n\nDescribe it however you like — I'll structure it into a clear process!`,
          suggestions: ["Call webinar leads and pitch paid course", "Send NPS survey after course completion", "Handle WhatsApp queries 24/7"],
        };
      }

      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1200);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setMessages(getInitialMessages());
      setInput("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <DialogTitle className="text-lg">Configure {agentName}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.quickActions && (
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {msg.quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleSend(action.label)}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/80 hover:bg-background border border-border/50 text-left transition-colors"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground">{action.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {msg.suggestions && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="px-2.5 py-1 rounded-full bg-background/80 hover:bg-background border border-border/50 text-[11px] font-medium text-foreground transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-xl px-4 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-border flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your agent's goal..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentConfigChat;
