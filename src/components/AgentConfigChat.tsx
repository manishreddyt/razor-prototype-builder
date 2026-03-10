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
import { generateChatResponse } from "@/services/geminiService";

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

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history for Gemini
      const conversationHistory = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        text: msg.content
      }));

      conversationHistory.push({
        role: "user" as const,
        text: text
      });

      const systemInstruction = `You are an AI assistant helping users configure their ${agentName} for their business automation.

Agent Type: ${agentType}
Available Templates: ${JSON.stringify(templates, null, 2)}

When users describe a goal:
1. Understand their objective clearly
2. Break it down into numbered steps with emojis
3. Be specific about triggers, actions, and success metrics
4. Always end with "Shall I save this configuration?" or similar
5. Provide 3-4 relevant modification suggestions

When users say "save", "confirm", or similar:
- Acknowledge the save
- Mention they can deploy the agent from the main screen
- Keep it brief and celebratory

Format:
- Use **bold** for emphasis
- Use emojis where appropriate
- Number steps clearly
- Be concise and actionable

Examples of good configurations:
- "After webinar ends → Call attendees → Pitch paid course → Send payment link"
- "Daily at 9 AM → Send WhatsApp to leads → Follow up on responses → Log outcomes"
- "When customer submits ticket → Check FAQ → Send solution → Escalate if needed"`;

      const response = await generateChatResponse(conversationHistory, systemInstruction);

      // Check if user is saving
      const lower = text.toLowerCase();
      if (lower.includes("save") || lower.includes("confirm") || lower.includes("create")) {
        const goalSummary = messages.filter(m => m.role === "assistant").pop()?.content || text;
        onSaveGoal(goalSummary);
      }

      // Generate contextual suggestions
      let suggestions: string[] = [];
      if (!lower.includes("save")) {
        suggestions = [
          "Save this configuration",
          "Add more automation steps",
          "Change the timing",
          "Include follow-up actions"
        ];
      }

      const responseMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };

      setMessages((prev) => [...prev, responseMsg]);
      setIsTyping(false);

    } catch (error) {
      console.error("Error calling Gemini:", error);

      // Fallback response
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I can build that! Let me understand better:\n\n**1. What's the trigger?**\n- After a webinar / After a purchase / On schedule / Manual\n\n**2. What actions should the agent take?**\n- Call leads / Send WhatsApp / Send email / Run ads\n\n**3. What's the success metric?**\n- Conversions / Response rate / NPS score / Resolution time\n\nDescribe it however you like — I'll structure it into a clear process!`,
        suggestions: ["Call webinar leads and pitch paid course", "Send NPS survey after course completion", "Handle WhatsApp queries 24/7"],
      };

      setMessages((prev) => [...prev, fallbackResponse]);
      setIsTyping(false);
    }
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
