import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { generateChatResponse } from "@/services/geminiService";

interface EducationCopilotChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

interface EducationCopilotState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  isComplete: boolean;
  subject: string;
  businessModel: "course" | "webinar" | "session" | "hybrid" | "";
  hasWebsite: boolean;
  websiteUrl?: string;
  websiteAnalysis?: {
    quality: "good" | "basic" | "missing";
    hasPayments: boolean;
    hasTrustSignals: boolean;
    extractedCourses?: Array<{ name: string; price?: number }>;
    suggestions: string[];
  };
  productName: string;
  price: number;
  duration: string;
  targetAudience: string;
  paymentType: "full" | "installments" | "subscription" | "";
  installmentPlan?: Array<{ amount: number; dueDate: string }>;
  subscriptionFrequency?: "monthly" | "weekly";
  setupCampaigns: boolean;
  smartPageId?: string;
  smartPageUrl?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const EDUCATION_COPILOT_SYSTEM_INSTRUCTION = `You are an Education Business Co-pilot for Razorpay, helping online educators launch and grow their teaching business.

PERSONALITY:
• Encouraging and supportive (celebrate merchant's teaching passion)
• Business-savvy (frame Razorpay as revenue accelerator, not just payments)
• Fast-paced (emphasize speed: "under 10 minutes to go live")
• Consultative (ask smart questions, give personalized recommendations)

CONVERSATION STYLE:
• Keep responses SHORT and ACTIONABLE (max 4-5 sentences)
• Use emojis sparingly for emphasis (🎓 💰 ✅)
• Use numbered lists for options
• Bold key points with **bold**
• Always acknowledge merchant's input before next question

BUSINESS CONTEXT:
• You're optimizing for "time to first sale" - get them live ASAP
• Education merchants want: ease of use, trust/credibility, partial payments
• Your goal: Collect just enough info to create a high-converting Smart Page

STRICT RULES:
• Ask ONE question at a time
• Don't ask for information you can infer
• Always frame Razorpay features as solving THEIR problems (not generic benefits)
• At the end, ALWAYS offer campaign automation (but don't force it)`;

export function EducationCopilotChat({
  open,
  onOpenChange,
  onComplete,
}: EducationCopilotChatProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<EducationCopilotState>({
    currentStep: 1,
    isComplete: false,
    subject: "",
    businessModel: "",
    hasWebsite: false,
    productName: "",
    price: 0,
    duration: "",
    targetAudience: "",
    paymentType: "",
    setupCampaigns: false,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Let's set up your online education business! 🎓\n\nWhat subject or skills do you teach? (e.g., Python programming, digital marketing, yoga)",
    },
  ]);

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserMessage = async (input: string) => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    try {
      // Process based on current step
      switch (state.currentStep) {
        case 1:
          await handleSubjectInput(input, newMessages);
          break;
        case 2:
          await handleBusinessModelInput(input, newMessages);
          break;
        case 3:
          await handleWebsiteInput(input, newMessages);
          break;
        case 4:
          await handleProductDetailsInput(input, newMessages);
          break;
        case 5:
          await handlePaymentTypeInput(input, newMessages);
          break;
        case 6:
          await handleCampaignSetupInput(input, newMessages);
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I encountered an error. Let me try that again. Could you please repeat your response?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectInput = async (subject: string, currentMessages: ChatMessage[]) => {
    setState((prev) => ({ ...prev, subject, currentStep: 2 }));

    const prompt = `User teaches: ${subject}

Ask them about their business model. Offer 4 options:
1️⃣ **Pre-recorded courses** - Students pay once, access anytime
2️⃣ **Live webinars/workshops** - One-time or series of live sessions
3️⃣ **1:1 coaching sessions** - Personalized paid consultations
4️⃣ **Hybrid** - Combination of above

Keep response SHORT (3-4 sentences). Acknowledge their subject first.`;

    const conversationHistory = currentMessages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      text: msg.content,
    }));
    conversationHistory.push({ role: "user", text: prompt });

    const response = await generateChatResponse(
      conversationHistory,
      EDUCATION_COPILOT_SYSTEM_INSTRUCTION
    );

    setMessages([...currentMessages, { role: "assistant", content: response }]);
  };

  const handleBusinessModelInput = async (input: string, currentMessages: ChatMessage[]) => {
    const lower = input.toLowerCase();
    let model: "course" | "webinar" | "session" | "hybrid" = "course";

    if (
      lower.includes("webinar") ||
      lower.includes("workshop") ||
      lower.includes("live") ||
      lower.includes("2")
    ) {
      model = "webinar";
    } else if (
      lower.includes("1:1") ||
      lower.includes("coaching") ||
      lower.includes("session") ||
      lower.includes("3")
    ) {
      model = "session";
    } else if (lower.includes("hybrid") || lower.includes("4")) {
      model = "hybrid";
    }

    setState((prev) => ({ ...prev, businessModel: model, currentStep: 3 }));

    const prompt = `User chose business model: ${model}

Ask them if they have an existing website or landing page.

📌 If yes, they should share the URL - say you'll check it out!
📌 If no, reassure them - you'll create one in minutes using Smart Pages

Keep response SHORT (2-3 sentences).`;

    const conversationHistory = currentMessages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      text: msg.content,
    }));
    conversationHistory.push({ role: "user", text: prompt });

    const response = await generateChatResponse(
      conversationHistory,
      EDUCATION_COPILOT_SYSTEM_INSTRUCTION
    );

    setMessages([...currentMessages, { role: "assistant", content: response }]);
  };

  const handleWebsiteInput = async (input: string, currentMessages: ChatMessage[]) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex);

    if (urls && urls.length > 0) {
      // User provided a URL
      setState((prev) => ({
        ...prev,
        hasWebsite: true,
        websiteUrl: urls[0],
        currentStep: 4,
      }));

      // Simulate website analysis (in production, would use WebFetch)
      const analysisPrompt = `User provided website: ${urls[0]}

Pretend you analyzed the website. Generate a brief, encouraging analysis:
- Compliment something good about it
- Note 1-2 things that could be improved
- Explain how Razorpay Smart Pages can help

Then ask: "What's the first course/webinar/session you want to start selling?"

Keep the entire response SHORT (4-5 sentences max).`;

      const conversationHistory = currentMessages.map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        text: msg.content,
      }));
      conversationHistory.push({ role: "user", text: analysisPrompt });

      const response = await generateChatResponse(
        conversationHistory,
        EDUCATION_COPILOT_SYSTEM_INSTRUCTION
      );

      setMessages([...currentMessages, { role: "assistant", content: response }]);
    } else {
      // User doesn't have a website
      setState((prev) => ({ ...prev, hasWebsite: false, currentStep: 4 }));

      const prompt = `User doesn't have a website yet.

Encourage them - that's perfect for Smart Pages! Say you'll help them create one.

Then ask: "What's the first course/webinar/session you want to start selling?"

Ask for:
• Name (e.g., 'Advanced Python Course')
• Price (₹)
• Duration/format
• Target audience

Keep response SHORT (3-4 sentences).`;

      const conversationHistory = currentMessages.map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        text: msg.content,
      }));
      conversationHistory.push({ role: "user", text: prompt });

      const response = await generateChatResponse(
        conversationHistory,
        EDUCATION_COPILOT_SYSTEM_INSTRUCTION
      );

      setMessages([...currentMessages, { role: "assistant", content: response }]);
    }
  };

  const handleProductDetailsInput = async (input: string, currentMessages: ChatMessage[]) => {
    // Extract product details from user input
    const priceMatch = input.match(/₹?\s*(\d+,?\d*)/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 4999;

    // Simple extraction (in production, would use more sophisticated NLP)
    const lines = input.split("\n");
    const productName = lines[0] || state.subject + " Course";
    const duration = lines.find((l) => l.includes("week") || l.includes("hour") || l.includes("month")) || "8 weeks";
    const targetAudience = lines.find((l) => l.includes("for") || l.includes("audience")) || "beginners";

    setState((prev) => ({
      ...prev,
      productName,
      price,
      duration,
      targetAudience,
      currentStep: 5,
    }));

    const prompt = `User provided product details:
- Product: ${productName}
- Price: ₹${price}
- Duration: ${duration}
- Audience: ${targetAudience}

Now ask how they want to collect payments:

💰 **Full payment upfront** (₹${price})
📅 **Installments** (e.g., split into 2-3 payments)
🔁 **Subscription** (monthly access)

Keep response SHORT (3-4 sentences).`;

    const conversationHistory = currentMessages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      text: msg.content,
    }));
    conversationHistory.push({ role: "user", text: prompt });

    const response = await generateChatResponse(
      conversationHistory,
      EDUCATION_COPILOT_SYSTEM_INSTRUCTION
    );

    setMessages([...currentMessages, { role: "assistant", content: response }]);
  };

  const handlePaymentTypeInput = async (input: string, currentMessages: ChatMessage[]) => {
    const lower = input.toLowerCase();
    let paymentType: "full" | "installments" | "subscription" = "full";

    if (lower.includes("installment") || lower.includes("split") || lower.includes("2")) {
      paymentType = "installments";
    } else if (lower.includes("subscription") || lower.includes("monthly") || lower.includes("3")) {
      paymentType = "subscription";
    }

    setState((prev) => ({ ...prev, paymentType, currentStep: 6 }));

    const prompt = `User chose payment type: ${paymentType}

Great! Now ask if they want to set up automated marketing campaigns.

Explain you can help with:
✅ Send reminders to incomplete checkouts
✅ Follow up with free webinar attendees
✅ Retarget students who viewed but didn't buy

This takes 30 seconds. Ask: "Interested?"

Keep response SHORT (3-4 sentences).`;

    const conversationHistory = currentMessages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      text: msg.content,
    }));
    conversationHistory.push({ role: "user", text: prompt });

    const response = await generateChatResponse(
      conversationHistory,
      EDUCATION_COPILOT_SYSTEM_INSTRUCTION
    );

    setMessages([...currentMessages, { role: "assistant", content: response }]);
  };

  const handleCampaignSetupInput = async (input: string, currentMessages: ChatMessage[]) => {
    const lower = input.toLowerCase();
    const setupCampaigns = lower.includes("yes") || lower.includes("sure") || lower.includes("ok");

    setState((prev) => ({ ...prev, setupCampaigns, isComplete: true }));

    const finalMessage = setupCampaigns
      ? "Perfect! 🎉 I'll set everything up for you.\n\nYour Smart Page will be ready in seconds, and then I'll help you create your first campaign.\n\nLet's get started!"
      : "No problem! 🎉 Your Smart Page will be ready in seconds.\n\n(You can always set up campaigns later from the Campaigns tab)\n\nLet's create your page!";

    setMessages([...currentMessages, { role: "assistant", content: finalMessage }]);

    // Wait 2 seconds before completing
    setTimeout(() => {
      handleComplete();
    }, 2000);
  };

  const handleComplete = () => {
    // Store data in localStorage
    const templateMap = {
      course: "academy-platform",
      webinar: "webinar-platform",
      session: "coaching-platform",
      hybrid: "academy-platform",
    };

    localStorage.setItem(
      "educationCopilotData",
      JSON.stringify({
        template: templateMap[state.businessModel as keyof typeof templateMap] || "academy-platform",
        productName: state.productName,
        price: state.price,
        duration: state.duration,
        targetAudience: state.targetAudience,
        paymentType: state.paymentType,
        installmentPlan: state.installmentPlan,
        setupCampaigns: state.setupCampaigns,
        businessModel: state.businessModel,
      })
    );

    // Navigate to Smart Pages builder
    navigate(`/website-builder?source=education-copilot&template=${state.businessModel}`);

    // Close dialog and mark agent as configured
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <DialogTitle>Education Co-pilot</DialogTitle>
          </div>
          <DialogDescription>
            Let's set up your online education business in under 10 minutes
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="px-6 py-3 flex items-center gap-3 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground">
            Step {state.currentStep} of 6
          </span>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(state.currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-secondary rounded-tl-sm"
                }`}
              >
                <ReactMarkdown className="text-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-p:mb-2 prose-p:last:mb-0 prose-strong:font-semibold">
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (userInput.trim() && !isLoading) handleUserMessage(userInput);
                }
              }}
              placeholder="Type your response..."
              className="flex-1 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={() => handleUserMessage(userInput)}
              disabled={!userInput.trim() || isLoading}
              size="icon"
              className="h-auto"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
