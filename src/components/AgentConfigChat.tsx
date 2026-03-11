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
  Instagram,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { generateChatResponse } from "@/services/geminiService";
import ReactMarkdown from "react-markdown";

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
  instagram: [
    { label: "Auto-respond to product inquiries", description: "Answer sizing, price, availability questions instantly" },
    { label: "Convert comments to sales", description: "Turn Instagram comments into DM conversations with payment links" },
    { label: "Cart abandonment reminders", description: "Remind customers about items they viewed or added" },
  ],
};

const agentTypeMap: Record<string, string> = {
  sales: "Sales Agent",
  marketing: "Marketing Agent",
  support: "Customer Service Agent",
  feedback: "Feedback Agent",
  instagram: "Social Commerce Agent",
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
      content: `👋 **Welcome! Let's set up your ${agentName}**\n\nI'll help you configure what this agent should do and when. You can describe your goal in your own words, or pick one of the templates below to get started quickly.`,
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

      const systemInstruction = `You are an AI assistant helping users configure their ${agentName} for business automation.

Agent Type: ${agentType}

CRITICAL FORMATTING RULES:
- Keep responses SHORT and SCANNABLE (max 4-5 sentences)
- Use clear headers with **bold**
- Use numbered lists (1., 2., 3.) for steps
- Add emojis sparingly for visual breaks
- Leave blank lines between sections
- NO long paragraphs - break into bullet points

When users describe a goal:
1. Confirm understanding in ONE sentence with emoji
2. Show workflow as numbered steps (max 4 steps)
3. End with: "**Ready to save?**"
4. Keep total response to 4-5 short lines

When users say "save", "confirm", or similar:
Response format:
✅ **Configuration saved!**

You can now deploy this agent from the main screen.

GOOD Example:
**Got it! Here's your workflow:** 🎯

1. **Trigger:** After webinar ends
2. **Action:** Call attendees within 1 hour
3. **Pitch:** Advanced Python Course
4. **Close:** Send payment link if interested

**Ready to save?**

BAD Example (too wordy):
"I understand you want to set up a comprehensive workflow for your business. Let me break this down into a detailed process..."`;


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
        content: `**I can help with that!** 🎯\n\nTo set this up, I need to know:\n\n1. **When** should this happen? (trigger)\n2. **What** should the agent do? (actions)\n3. **How** do we measure success? (metric)\n\nDescribe it in your own words, and I'll structure it into a workflow!`,
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-4",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background border border-border/60 shadow-sm"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-semibold prose-ul:text-foreground prose-li:text-foreground">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        ul: ({ children }) => <ul className="space-y-1 mb-2 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="space-y-1.5 mb-2 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">{msg.content}</div>
                )}

                {msg.quickActions && (
                  <div className="grid grid-cols-1 gap-2.5 mt-4 pt-4 border-t border-border/40">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Choose a template to get started:
                    </p>
                    {msg.quickActions.map((action, idx) => (
                      <button
                        key={action.label}
                        onClick={() => handleSend(action.label)}
                        className="group flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary hover:shadow-md border border-border/60 hover:border-primary/40 text-left transition-all"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground mb-0.5">{action.label}</p>
                          <p className="text-xs text-muted-foreground leading-snug">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {msg.suggestions && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-border/40">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Quick actions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestions.map((s, idx) => {
                        const isSaveAction = s.toLowerCase().includes("save") || s.toLowerCase().includes("confirm");
                        return (
                          <button
                            key={s}
                            onClick={() => handleSend(s)}
                            className={cn(
                              "px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-sm",
                              isSaveAction
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md border-2 border-primary/20"
                                : "bg-background hover:bg-secondary border border-border/60 text-foreground hover:shadow-md"
                            )}
                          >
                            {isSaveAction && <CheckCircle2 className="h-3 w-3 inline mr-1.5" />}
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-background border border-border/60 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="animate-pulse">Generating your workflow...</span>
                </div>
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
              placeholder="Type your goal, or pick a template above..."
              className="flex-1"
              disabled={isTyping}
              autoFocus
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
