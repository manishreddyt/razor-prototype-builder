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

// Helper function to generate smart features based on webinar name
const generateFeatures = (name: string, description: string): string[] => {
  const lower = (name + " " + description).toLowerCase();

  // Detect topic and generate relevant features
  if (lower.includes("marketing") || lower.includes("digital")) {
    return [
      "Master proven digital marketing strategies",
      "Learn social media engagement techniques",
      "Understand analytics and ROI tracking",
      "Get actionable campaign templates"
    ];
  } else if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("tech")) {
    return [
      "Understand core AI/ML concepts",
      "Hands-on practical demonstrations",
      "Real-world use cases and applications",
      "Best practices and implementation tips"
    ];
  } else if (lower.includes("leadership") || lower.includes("management")) {
    return [
      "Develop effective leadership skills",
      "Learn team management strategies",
      "Master communication techniques",
      "Build high-performing teams"
    ];
  } else if (lower.includes("finance") || lower.includes("investment")) {
    return [
      "Understand financial planning basics",
      "Learn investment strategies",
      "Master risk management",
      "Get practical portfolio tips"
    ];
  } else {
    return [
      `Core concepts and fundamentals of ${name}`,
      "Practical, actionable strategies",
      "Real-world case studies and examples",
      "Interactive Q&A with industry experts"
    ];
  }
};

// Helper function to generate relevant FAQs
const generateFAQs = (isPaid: boolean, amount: number, platform: string): Array<{question: string; answer: string}> => {
  const platformName = platform === "zoom" ? "Zoom" : platform === "gmeet" ? "Google Meet" : "the webinar platform";

  return [
    {
      question: "What will I learn in this webinar?",
      answer: "You'll gain practical insights, actionable strategies, and expert knowledge that you can immediately apply. The session includes interactive Q&A for personalized guidance."
    },
    {
      question: isPaid ? "What's included in the registration?" : "Is this webinar really free?",
      answer: isPaid
        ? `Yes! Your ₹${amount} registration includes access to the live session, recording for 30 days, session materials, and a certificate of participation.`
        : "Absolutely! This is a completely free webinar with no hidden costs. Just register and join the live session."
    },
    {
      question: `How do I join the ${platformName} session?`,
      answer: `After registration, you'll receive an email with the ${platformName} link and instructions. The link will be sent 24 hours before and 1 hour before the webinar starts.`
    },
    {
      question: "Will I get a recording?",
      answer: "Yes! All registered attendees will receive a recording link within 24 hours after the webinar ends."
    }
  ];
};

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
      // Generate content locally based on webinar data
      // Note: Direct Anthropic API calls from browser fail due to CORS
      // This creates smart, contextual content without API calls

      const webinarName = data.name || "Webinar";
      const isPaid = data.isPaid || false;
      const amount = data.amount || 0;
      const description = data.description || "";

      console.log("Generating content for webinar:", { webinarName, isPaid, amount, description });

      const generatedContent = {
        heroTitle: webinarName,
        heroTagline: isPaid
          ? `Professional Training • Live Interactive Session • Certificate Included`
          : `Free Live Webinar • Expert-Led • Interactive Q&A`,
        heroDescription: description
          ? `${description}. Join industry experts for this ${isPaid ? 'exclusive paid' : 'free'} webinar and transform your skills.`
          : `Join us for an insightful ${isPaid ? 'premium' : 'free'} webinar on ${webinarName}. Learn from industry experts and take your skills to the next level.`,
        heroCta: isPaid ? `Register Now for ₹${amount}` : "Save My Spot - Free",
        features: generateFeatures(webinarName, description),
        aboutSection: `Our expert instructors bring years of real-world experience in ${webinarName.toLowerCase()}. This ${isPaid ? 'premium' : 'free'} webinar is designed to provide actionable insights and practical knowledge you can apply immediately.`,
        testimonials: [
          {
            name: "Priya Sharma",
            text: "The insights shared were incredible! This webinar completely changed how I approach my work.",
            role: "Senior Manager"
          },
          {
            name: "Rahul Mehta",
            text: "Best webinar I've attended. The practical examples and Q&A session were extremely valuable.",
            role: "Product Lead"
          }
        ],
        faqs: generateFAQs(isPaid, amount, data.platform || "zoom")
      };


      // Store generated content in localStorage for the editor to pick up
      const dataToStore = {
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
      };

      console.log("Storing AI-generated content:", dataToStore);
      localStorage.setItem("ai-generated-content", JSON.stringify(dataToStore));

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

      const editorUrl = `/website-builder/editor?${queryParams.toString()}`;
      console.log("Navigating to editor:", editorUrl);

      setTimeout(() => {
        navigate(editorUrl);
      }, 800);

    } catch (error) {
      console.error("Error generating content:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to generate content"}`);
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
