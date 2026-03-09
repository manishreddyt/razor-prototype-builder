import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface WebinarData {
  name: string;
  description: string;
  isPaid: boolean;
  amount: number;
  date: string;
  time: string;
  duration: number;
  platform: "zoom" | "gmeet" | "custom";
}

const INITIAL_GREETING = `👋 Hi! I'll help you create a professional webinar landing page.

Let's start with the basics. **What's your webinar about?**

💡 Example: "AI-Powered Web Development Workshop"`;

const WebinarChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [webinarData, setWebinarData] = useState<Partial<WebinarData>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateAndNavigate = async (data: Partial<WebinarData>) => {
    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

      if (!apiKey || apiKey.includes('your_')) {
        throw new Error("Claude API key not configured");
      }

      // Build the prompt for Claude
      const prompt = `Generate professional webinar landing page content for this webinar:

**Webinar Name:** ${data.name}
**Type:** ${data.isPaid ? `Paid webinar - ₹${data.amount}` : "Free webinar"}
**Platform:** ${data.platform}
${data.description ? `**Description:** ${data.description}` : ""}

Generate compelling, persuasive content for a landing page. Return ONLY a JSON object with this structure:
{
  "heroTitle": "compelling 5-7 word webinar title",
  "heroTagline": "short tagline with bullet points using •",
  "heroDescription": "2-3 sentence description highlighting value and benefits",
  "heroCta": "${data.isPaid ? 'Register Now' : 'Save My Spot'}",
  "features": [
    "What attendees will learn - point 1",
    "What attendees will learn - point 2",
    "What attendees will learn - point 3",
    "What attendees will learn - point 4"
  ],
  "aboutSection": "2-3 sentences about the webinar host/instructor",
  "testimonials": [
    {"name": "Full Name", "text": "testimonial quote", "role": "Job Title"},
    {"name": "Full Name", "text": "testimonial quote", "role": "Job Title"}
  ],
  "faqs": [
    {"question": "relevant question", "answer": "answer"},
    {"question": "relevant question", "answer": "answer"}
  ]
}

Make it specific to "${data.name}" and create compelling, professional copy.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2048,
          temperature: 0.7,
          messages: [{
            role: "user",
            content: prompt
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      let content = result.content[0].text.trim();

      // Clean markdown formatting
      if (content.startsWith("```json")) {
        content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (content.startsWith("```")) {
        content = content.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const generatedContent = JSON.parse(content);

      // Store generated content in localStorage for the editor to pick up
      localStorage.setItem("ai-generated-content", JSON.stringify({
        content: {
          heroTitle: generatedContent.heroTitle,
          heroTagline: generatedContent.heroTagline,
          heroDescription: generatedContent.heroDescription,
          heroCta: generatedContent.heroCta,
        },
        sections: {
          features: generatedContent.features,
          about: generatedContent.aboutSection,
          testimonials: generatedContent.testimonials,
          faqs: generatedContent.faqs,
        }
      }));

      addAssistantMessage(`✨ Content generated! Opening your landing page editor...`);

      // Navigate to editor with URL params
      const queryParams = new URLSearchParams({
        template: "webinar",
        title: data.name || "Webinar",
        type: "Webinar",
        isPaid: String(data.isPaid || false),
        amount: String(data.amount || 0),
        platform: data.platform || "zoom",
        aiPrompt: data.name || "Webinar", // Trigger AI content usage
      });

      setTimeout(() => {
        navigate(`/website-builder/editor?${queryParams.toString()}`);
      }, 1000);

    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Using default template.");

      // Fallback to basic navigation
      const queryParams = new URLSearchParams({
        template: "webinar",
        title: data.name || "Webinar",
        type: "Webinar",
        isPaid: String(data.isPaid || false),
        amount: String(data.amount || 0),
        platform: data.platform || "zoom",
      });

      setTimeout(() => {
        navigate(`/website-builder/editor?${queryParams.toString()}`);
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initialize with greeting
  useEffect(() => {
    addAssistantMessage(INITIAL_GREETING);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content,
      timestamp: new Date(),
    }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }]);
  };

  const simulateTyping = async (callback: () => void, delay = 800) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    callback();
  };

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    const userInput = input.trim();
    addUserMessage(userInput);
    setInput("");

    await simulateTyping(() => {
      processUserInput(userInput);
    });
  };

  const processUserInput = (userInput: string) => {
    switch (step) {
      case 0: // Webinar name
        setWebinarData(prev => ({ ...prev, name: userInput }));
        addAssistantMessage(`Great! **"${userInput}"** sounds interesting! 🎯\n\nNow, **is this a free or paid webinar?**\n\nType "free" or "paid" (and mention the price if paid, e.g., "paid ₹999")`);
        setStep(1);
        break;

      case 1: // Pricing
        const lower = userInput.toLowerCase();
        if (lower.includes("free")) {
          setWebinarData(prev => ({ ...prev, isPaid: false, amount: 0 }));
          addAssistantMessage(`Perfect! A free webinar is great for building your audience. 📈\n\n**When is your webinar scheduled?**\n\n💡 Example: "March 15, 2026 at 6:00 PM"`);
          setStep(2);
        } else if (lower.includes("paid")) {
          const priceMatch = userInput.match(/₹?\s*(\d+)/);
          const amount = priceMatch ? parseInt(priceMatch[1]) : 0;
          setWebinarData(prev => ({ ...prev, isPaid: true, amount }));
          addAssistantMessage(`Got it! ₹${amount} for this webinar. 💰\n\n**When is your webinar scheduled?**\n\n💡 Example: "March 15, 2026 at 6:00 PM"`);
          setStep(2);
        } else {
          addAssistantMessage(`I didn't catch that. Please type **"free"** or **"paid ₹999"**`);
        }
        break;

      case 2: // Date & Time
        // Simple date/time parsing (you can enhance this)
        setWebinarData(prev => ({
          ...prev,
          date: new Date().toISOString().split('T')[0],
          time: "18:00",
          duration: 60,
        }));
        addAssistantMessage(`Scheduled! 📅\n\n**Which platform will you use?**\n\nType:\n• "zoom"\n• "google meet" or "gmeet"\n• "custom" (for other platforms)`);
        setStep(3);
        break;

      case 3: // Platform
        const platformLower = userInput.toLowerCase();
        let platform: "zoom" | "gmeet" | "custom" = "custom";

        if (platformLower.includes("zoom")) {
          platform = "zoom";
        } else if (platformLower.includes("meet") || platformLower.includes("gmeet")) {
          platform = "gmeet";
        }

        setWebinarData(prev => ({ ...prev, platform }));
        addAssistantMessage(`Excellent! All set with ${platform === "zoom" ? "Zoom" : platform === "gmeet" ? "Google Meet" : "your custom platform"}. ✅\n\n**Optionally, add a brief description** (or type "skip" to continue):\n\n💡 What will attendees learn?`);
        setStep(4);
        break;

      case 4: // Description (optional)
        if (userInput.toLowerCase() !== "skip") {
          setWebinarData(prev => ({ ...prev, description: userInput }));
        }

        // All data collected, show summary and generate content
        const data = { ...webinarData, description: userInput.toLowerCase() === "skip" ? "" : userInput };
        addAssistantMessage(`🎉 Perfect! I have everything I need.\n\n**Summary:**\n• **Webinar:** ${data.name}\n• **Type:** ${data.isPaid ? `Paid (₹${data.amount})` : "Free"}\n• **Platform:** ${data.platform}\n\nGenerating your landing page content...`);

        // Generate content using Claude API
        setTimeout(async () => {
          await generateAndNavigate(data);
        }, 1500);
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/website-builder/create")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Webinar Setup</h1>
              <p className="text-xs text-muted-foreground">AI-powered chat assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}
              >
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                      .replace(/^• /gm, '<span class="inline-flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-current"></span></span>')
                  }}
                />
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="px-6 py-6 bg-gradient-to-t from-background via-background to-transparent border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center bg-card border-2 border-border rounded-2xl px-5 py-3 shadow-lg focus-within:border-primary/50 focus-within:shadow-primary/10 transition-all">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isTyping && !isGenerating && handleSubmit()}
              placeholder="Type your answer..."
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
              disabled={isTyping || isGenerating}
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isTyping || isGenerating}
              size="icon"
              className="rounded-xl h-11 w-11 shadow-md"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Press Enter to send • Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebinarChat;
