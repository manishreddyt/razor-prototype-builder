import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Send, Sparkles, Check, Copy, ExternalLink, Share2,
  Plus, Trash2, Globe, PartyPopper, Eye, MessageSquare, Settings,
  ChevronDown, ChevronUp, BookOpen, Video, FileText, Award,
} from "lucide-react";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import {
  defaultRegistrationFields,
  type RegistrationField,
} from "@/types/smartPages";
import CourseLandingPreview from "@/components/CourseLandingPreview";
import { useAIPageBuilder, type AIPageUpdates } from "@/hooks/useAIPageBuilder";

type Phase = "chat" | "builder" | "confirmation";

interface ChatMsg {
  id: string;
  role: "bot" | "user";
  content: string;
  type?: "text" | "paid-toggle" | "pricing-model" | "course-format" | "course-includes" | "certificate" | "modules" | "transition";
  answered?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string; // "2 hours", "3 lessons", etc.
  lessons: number;
}

export interface CourseData {
  name: string;
  description: string;
  tagline: string;
  bannerImage: string;
  isPaid: boolean;
  amount: number;
  pricingModel: "one-time" | "subscription"; // one-time or monthly subscription
  subscriptionAmount?: number;
  courseDuration: string; // "4 weeks", "8 weeks", "Self-paced"
  courseFormat: "self-paced" | "cohort-based" | "live-sessions";
  courseIncludes: string[]; // ["Videos", "PDFs", "Assignments", "Quizzes", "Certificate"]
  certificateOffered: boolean;
  modules: CourseModule[];
  enrollmentFields: RegistrationField[];
  instructor: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
    credentials?: string[];
  };
  students: CourseStudent[];
  whatYouWillLearn: string[];
}

export interface CourseStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledAt: string;
  progress: number; // 0-100
  status: "active" | "completed" | "dropped";
  paymentStatus: "paid" | "pending";
  amount: number;
}

// The questions the bot asks sequentially
const QUESTION_SEQUENCE = [
  { key: "name", message: "👋 Hey! I'll help you set up a **landing page for your online course** and collect payments seamlessly.\n\n🎯 **What you'll get:**\n• A professional course page with curriculum, pricing & enrollment\n• Payment collection via Razorpay (one-time or subscription)\n• Student registration & tracking\n• You can host your course on any LMS (Teachable, Thinkific, Udemy, etc.) and share access post payment\n\n📋 **To get started, I'll need:**\n1. Course name & description\n2. Pricing (free or paid)\n3. Course format & duration\n4. Curriculum / modules\n\nLet's begin — **What's your course called?**", type: "text" as const },
  { key: "tagline", message: "Great! **Write a one-line tagline** — what will students achieve after completing this course?", type: "text" as const },
  { key: "description", message: "Now **describe your course briefly** — what will students learn?", type: "text" as const },
  { key: "isPaid", message: "Is this a **paid or free** course?", type: "paid-toggle" as const },
  { key: "pricingModel", message: "How would you like to charge? **One-time payment or monthly subscription?**", type: "pricing-model" as const, condition: (state: Partial<CourseData>) => state.isPaid },
  { key: "amount", message: "How much for the course? **Enter the amount in ₹**.", type: "text" as const, condition: (state: Partial<CourseData>) => state.isPaid && state.pricingModel === "one-time" },
  { key: "subscriptionAmount", message: "What's the monthly subscription price? **Enter the amount in ₹**.", type: "text" as const, condition: (state: Partial<CourseData>) => state.isPaid && state.pricingModel === "subscription" },
  { key: "courseDuration", message: "How long is the course? (e.g., 4 weeks, 8 weeks, Self-paced)", type: "text" as const },
  { key: "courseFormat", message: "What's the course format?", type: "course-format" as const },
  { key: "courseIncludes", message: "What does your course include?", type: "course-includes" as const },
  { key: "certificate", message: "Do you offer a certificate of completion?", type: "certificate" as const },
  { key: "modules", message: "Let's add your course curriculum. **How many modules/sections does your course have?**", type: "modules" as const },
];

const defaultModules: CourseModule[] = [
  { id: "mod_1", title: "Introduction & Fundamentals", description: "Get started with the basics", duration: "2 hours", lessons: 5 },
  { id: "mod_2", title: "Core Concepts", description: "Deep dive into key concepts", duration: "4 hours", lessons: 8 },
  { id: "mod_3", title: "Practical Applications", description: "Hands-on projects and exercises", duration: "6 hours", lessons: 10 },
];

const CourseCreate = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("chat");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Course state
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage] = useState("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=400&fit=crop");
  const [isPaid, setIsPaid] = useState(true);
  const [amount, setAmount] = useState(4999);
  const [pricingModel, setPricingModel] = useState<"one-time" | "subscription">("one-time");
  const [subscriptionAmount, setSubscriptionAmount] = useState(999);
  const [courseDuration, setCourseDuration] = useState("8 weeks");
  const [courseFormat, setCourseFormat] = useState<"self-paced" | "cohort-based" | "live-sessions">("self-paced");
  const [courseIncludes, setCourseIncludes] = useState<string[]>(["Videos", "PDFs", "Certificate"]);
  const [certificateOffered, setCertificateOffered] = useState(true);
  const [modules, setModules] = useState<CourseModule[]>(defaultModules);
  const [enrollmentFields, setEnrollmentFields] = useState<RegistrationField[]>([...defaultRegistrationFields]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([
    "Master the fundamentals and core concepts",
    "Build real-world projects from scratch",
    "Learn industry best practices",
  ]);
  const [instructor] = useState({
    name: "Instructor Name",
    title: "Course Instructor",
    avatar: "IN",
    bio: "Expert instructor with years of experience in the field.",
    credentials: ["10+ years experience", "Industry certified"],
  });

  // Builder state
  const [builderTab, setBuilderTab] = useState<"chat" | "settings">("chat");
  const [builderChatInput, setBuilderChatInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState<Record<string, boolean>>({
    details: true, pricing: false, content: false, modules: false, enrollment: false
  });

  // Confirmation state
  const [publishedSlug, setPublishedSlug] = useState("");
  const [publishedSiteId, setPublishedSiteId] = useState("");

  // Add a bot message with typing effect
  const addBotMessage = useCallback((content: string, type?: ChatMsg["type"]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: `msg_${Date.now()}`,
        role: "bot",
        content,
        type: type || "text",
      }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, []);

  // Initialize first question
  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(QUESTION_SEQUENCE[0].message, QUESTION_SEQUENCE[0].type);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getProgress = () => {
    const total = QUESTION_SEQUENCE.filter(q => !q.condition || q.condition({ isPaid, pricingModel })).length;
    return Math.round((questionIndex / total) * 100);
  };

  const advanceQuestion = useCallback((currentIdx: number) => {
    let nextIdx = currentIdx + 1;
    // Skip conditional questions
    while (nextIdx < QUESTION_SEQUENCE.length) {
      const q = QUESTION_SEQUENCE[nextIdx];
      if (q.condition && !q.condition({ isPaid, pricingModel })) {
        nextIdx++;
        continue;
      }
      break;
    }
    if (nextIdx >= QUESTION_SEQUENCE.length) {
      // All questions answered → transition
      addBotMessage("✨ Perfect! I have everything I need. **Let me build your course page...**", "transition");
      setTimeout(() => setPhase("builder"), 2000);
    } else {
      setQuestionIndex(nextIdx);
      const q = QUESTION_SEQUENCE[nextIdx];
      addBotMessage(q.message, q.type);
    }
  }, [isPaid, pricingModel, addBotMessage]);

  const handleUserResponse = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
    }]);
    setChatInput("");

    const currentQ = QUESTION_SEQUENCE[questionIndex];
    switch (currentQ.key) {
      case "name":
        setName(text);
        break;
      case "tagline":
        setTagline(text);
        break;
      case "description":
        setDescription(text);
        break;
      case "amount":
        setAmount(parseInt(text.replace(/[^0-9]/g, "")) || 4999);
        break;
      case "subscriptionAmount":
        setSubscriptionAmount(parseInt(text.replace(/[^0-9]/g, "")) || 999);
        break;
      case "courseDuration":
        setCourseDuration(text);
        break;
    }

    advanceQuestion(questionIndex);
  };

  const handlePaidToggle = (paid: boolean) => {
    setIsPaid(paid);
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: paid ? "Paid course" : "Free course",
    }]);
    setTimeout(() => {
      let nextIdx = questionIndex + 1;
      while (nextIdx < QUESTION_SEQUENCE.length) {
        const q = QUESTION_SEQUENCE[nextIdx];
        if (q.condition && !q.condition({ isPaid: paid, pricingModel })) { nextIdx++; continue; }
        break;
      }
      if (nextIdx >= QUESTION_SEQUENCE.length) {
        addBotMessage("✨ Perfect! Let me build your course page...", "transition");
        setTimeout(() => setPhase("builder"), 2000);
      } else {
        setQuestionIndex(nextIdx);
        addBotMessage(QUESTION_SEQUENCE[nextIdx].message, QUESTION_SEQUENCE[nextIdx].type);
      }
    }, 100);
  };

  const handlePricingModelSelect = (model: "one-time" | "subscription") => {
    setPricingModel(model);
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: model === "one-time" ? "One-time payment" : "Monthly subscription",
    }]);
    advanceQuestion(questionIndex);
  };

  const handleCourseFormatSet = (format: "self-paced" | "cohort-based" | "live-sessions") => {
    setCourseFormat(format);
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user", content: format.replace("-", " "),
    }]);
    advanceQuestion(questionIndex);
  };

  const handleCourseIncludesSet = (includes: string[]) => {
    setCourseIncludes(includes);
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: includes.join(", "),
    }]);
    advanceQuestion(questionIndex);
  };

  const handleCertificateSet = (offered: boolean) => {
    setCertificateOffered(offered);
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: offered ? "Yes, certificate included" : "No certificate",
    }]);
    advanceQuestion(questionIndex);
  };

  const handleModulesDone = () => {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: `${modules.length} modules configured`,
    }]);
    advanceQuestion(questionIndex);
  };

  // Build course data object
  const buildCourseData = (): CourseData => ({
    name,
    tagline,
    description,
    bannerImage,
    isPaid,
    amount: isPaid ? amount : 0,
    pricingModel,
    subscriptionAmount: pricingModel === "subscription" ? subscriptionAmount : undefined,
    courseDuration,
    courseFormat,
    courseIncludes,
    certificateOffered,
    modules,
    enrollmentFields,
    instructor,
    students: [],
    whatYouWillLearn,
  });

  // Handle publish
  const handlePublish = () => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "course";
    const site: SmartPageSite = {
      id: `sp_${Date.now()}`,
      name,
      type: "Course",
      category: "education",
      slug,
      templateId: "course",
      url: `/s/${slug}`,
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 0,
      conversions: 0,
      status: "Published",
      amount: isPaid ? amount : 0,
      transactions: 0,
      pageType: "course",
    };
    localStorage.setItem(`course_${site.id}`, JSON.stringify(buildCourseData()));
    addSite(site);
    setPublishedSlug(slug);
    setPublishedSiteId(site.id);
    setPhase("confirmation");
  };

  // Builder chat handler using real AI
  const { sendPrompt, isLoading: aiLoading } = useAIPageBuilder({
    pageType: "course",
    getCurrentData: () => ({
      name, tagline, description, bannerImage, isPaid, amount, pricingModel,
      subscriptionAmount, courseDuration, courseFormat, courseIncludes,
      certificateOffered, modules: modules.map(m => ({ title: m.title, description: m.description })),
      whatYouWillLearn, instructor: { name: instructor.name, title: instructor.title },
    }),
    onUpdates: (updates: AIPageUpdates) => {
      if (updates.name) setName(updates.name);
      if (updates.tagline) setTagline(updates.tagline);
      if (updates.description) setDescription(updates.description);
      if (updates.isPaid !== undefined) setIsPaid(updates.isPaid);
      if (updates.amount !== undefined) setAmount(updates.amount);
      if (updates.pricingModel) setPricingModel(updates.pricingModel as any);
      if (updates.courseDuration) setCourseDuration(updates.courseDuration);
      if (updates.courseFormat) setCourseFormat(updates.courseFormat as any);
      if (updates.whatYouWillLearn) setWhatYouWillLearn(updates.whatYouWillLearn);
      if (updates.courseIncludes) setCourseIncludes(updates.courseIncludes);
    },
  });

  const handleBuilderChat = async (text: string) => {
    if (!text.trim() || aiLoading) return;
    setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "user", content: text }]);
    setBuilderChatInput("");

    const response = await sendPrompt(text);
    setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "bot", content: response }]);
  };

  const courseData = buildCourseData();
  const fullUrl = `${window.location.origin}/s/${publishedSlug}`;

  // ─── PHASE 1: Chat Flow ───
  if (phase === "chat") {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/website-builder/create")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Create Online Course</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{getProgress()}% complete</span>
            <Progress value={getProgress()} className="w-32 h-1.5" />
          </div>
        </div>

        {/* Chat area */}
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5"
                    : "bg-secondary/70 text-foreground rounded-2xl rounded-bl-md px-4 py-2.5"
                }`}>
                  <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                </div>
              </div>
            ))}

            {/* Inline interactive elements based on current question */}
            {!isTyping && questionIndex < QUESTION_SEQUENCE.length && (
              <ChatInlineWidget
                questionKey={QUESTION_SEQUENCE[questionIndex]?.key}
                type={QUESTION_SEQUENCE[questionIndex]?.type}
                onPaidToggle={handlePaidToggle}
                onPricingModelSelect={handlePricingModelSelect}
                onCourseFormatSet={handleCourseFormatSet}
                onCourseIncludesSet={handleCourseIncludesSet}
                onCertificateSet={handleCertificateSet}
                onModulesDone={handleModulesDone}
                courseIncludes={courseIncludes}
                modules={modules}
                setModules={setModules}
              />
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary/70 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Input bar (only for text questions) */}
        {!isTyping && questionIndex < QUESTION_SEQUENCE.length &&
          ["name", "tagline", "description", "amount", "subscriptionAmount", "courseDuration"].includes(QUESTION_SEQUENCE[questionIndex]?.key) && (
          <div className="border-t border-border px-4 py-3 bg-background">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Input
                ref={inputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your response..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUserResponse(chatInput);
                  }
                }}
                autoFocus
              />
              <Button
                onClick={() => handleUserResponse(chatInput)}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── PHASE 2: Builder ───
  if (phase === "builder") {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPhase("chat")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Chat
            </Button>
            <div className="h-5 w-px bg-border" />
            <span className="font-medium text-sm text-foreground">{name || "Untitled Course"}</span>
            <Badge variant="secondary" className="text-[10px]">Draft</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`/s/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, "_blank")}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button size="sm" onClick={handlePublish} className="gap-1.5">
              <Check className="h-4 w-4" /> Publish
            </Button>
          </div>
        </div>

        {/* Split pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Chat + Settings */}
          <div className="w-[380px] border-r border-border flex flex-col bg-background">
            {/* Tab switch */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setBuilderTab("chat")}
                className={`flex-1 px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  builderTab === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" /> AI Chat
              </button>
              <button
                onClick={() => setBuilderTab("settings")}
                className={`flex-1 px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  builderTab === "settings" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="h-3.5 w-3.5" /> Settings
              </button>
            </div>

            {builderTab === "chat" ? (
              <>
                <ScrollArea className="flex-1 px-3 py-4">
                  <div className="space-y-3">
                    {/* Show transition message */}
                    <div className="flex justify-start">
                      <div className="bg-secondary/70 text-foreground rounded-2xl rounded-bl-md px-3 py-2 max-w-[90%]">
                        <p className="text-xs">🎨 Your course page is ready! I've built it from your responses. Use the **Settings** tab to make edits, or ask me anything here.</p>
                      </div>
                    </div>
                    {messages.filter(m => phase === "builder" || m.id > "msg_builder").map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[90%] ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2"
                            : "bg-secondary/70 text-foreground rounded-2xl rounded-bl-md px-3 py-2"
                        }`}>
                          <p className="text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{
                            __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t border-border p-3">
                  <div className="flex gap-2">
                    <Input
                      value={builderChatInput}
                      onChange={e => setBuilderChatInput(e.target.value)}
                      placeholder="Ask me to change anything..."
                      className="text-xs"
                      onKeyDown={e => e.key === "Enter" && handleBuilderChat(builderChatInput)}
                    />
                    <Button size="icon" className="h-9 w-9" onClick={() => handleBuilderChat(builderChatInput)}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {/* Details Section */}
                  <CollapsibleSection
                    title="Details" icon={<Sparkles className="h-3.5 w-3.5" />}
                    open={settingsOpen.details}
                    onToggle={() => setSettingsOpen(p => ({ ...p, details: !p.details }))}
                  >
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Course Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="mt-1 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Tagline</Label>
                        <Input value={tagline} onChange={e => setTagline(e.target.value)} className="mt-1 text-xs" placeholder="One-line description" />
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 text-xs" rows={3} />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Pricing Section */}
                  <CollapsibleSection
                    title="Pricing" icon={<Globe className="h-3.5 w-3.5" />}
                    open={settingsOpen.pricing}
                    onToggle={() => setSettingsOpen(p => ({ ...p, pricing: !p.pricing }))}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Paid Course</Label>
                        <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                      </div>
                      {isPaid && (
                        <>
                          <div>
                            <Label className="text-xs">Pricing Model</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {(["one-time", "subscription"] as const).map(p => (
                                <button
                                  key={p}
                                  onClick={() => setPricingModel(p)}
                                  className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                                    pricingModel === p
                                      ? "border-primary bg-primary/5 text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/30"
                                  }`}
                                >
                                  {p === "one-time" ? "One-time" : "Subscription"}
                                </button>
                              ))}
                            </div>
                          </div>
                          {pricingModel === "one-time" && (
                            <div>
                              <Label className="text-xs">Course Price (₹)</Label>
                              <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 text-xs" />
                            </div>
                          )}
                          {pricingModel === "subscription" && (
                            <div>
                              <Label className="text-xs">Monthly Price (₹)</Label>
                              <Input type="number" value={subscriptionAmount} onChange={e => setSubscriptionAmount(Number(e.target.value))} className="mt-1 text-xs" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CollapsibleSection>

                  {/* Course Content */}
                  <CollapsibleSection
                    title="Course Content" icon={<BookOpen className="h-3.5 w-3.5" />}
                    open={settingsOpen.content}
                    onToggle={() => setSettingsOpen(p => ({ ...p, content: !p.content }))}
                  >
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Course Duration</Label>
                        <Input value={courseDuration} onChange={e => setCourseDuration(e.target.value)} className="mt-1 text-xs" placeholder="e.g., 8 weeks, Self-paced" />
                      </div>
                      <div>
                        <Label className="text-xs">Course Format</Label>
                        <Select value={courseFormat} onValueChange={(v: any) => setCourseFormat(v)}>
                          <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self-paced">Self-paced</SelectItem>
                            <SelectItem value="cohort-based">Cohort-based</SelectItem>
                            <SelectItem value="live-sessions">Live Sessions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Certificate Offered</Label>
                        <Switch checked={certificateOffered} onCheckedChange={setCertificateOffered} />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Course Modules */}
                  <CollapsibleSection
                    title="Course Modules" icon={<Video className="h-3.5 w-3.5" />}
                    open={settingsOpen.modules}
                    onToggle={() => setSettingsOpen(p => ({ ...p, modules: !p.modules }))}
                  >
                    <div className="space-y-2">
                      {modules.map((mod, idx) => (
                        <div key={mod.id} className="p-2 rounded-md border border-border space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground">#{idx + 1}</span>
                            <Input
                              value={mod.title}
                              onChange={e => setModules(prev => prev.map(m => m.id === mod.id ? { ...m, title: e.target.value } : m))}
                              className="flex-1 text-xs h-7"
                              placeholder="Module title"
                            />
                            <button
                              onClick={() => setModules(prev => prev.filter(m => m.id !== mod.id))}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <Textarea
                            value={mod.description}
                            onChange={e => setModules(prev => prev.map(m => m.id === mod.id ? { ...m, description: e.target.value } : m))}
                            className="text-xs h-12"
                            placeholder="Module description"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline" size="sm" className="w-full text-xs gap-1 mt-1"
                        onClick={() => setModules(prev => [...prev, {
                          id: `mod_${Date.now()}`,
                          title: `Module ${prev.length + 1}`,
                          description: "Module description",
                          duration: "2 hours",
                          lessons: 5,
                        }])}
                      >
                        <Plus className="h-3 w-3" /> Add Module
                      </Button>
                    </div>
                  </CollapsibleSection>
                </div>
              </ScrollArea>
            )}
          </div>

          {/* RIGHT: Live Preview */}
          <div className="flex-1 bg-muted/30 overflow-auto">
            <div className="max-w-4xl mx-auto my-6 bg-background rounded-xl shadow-lg border border-border overflow-hidden">
              <CourseLandingPreview data={courseData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE 3: Confirmation ───
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full mx-auto px-6 text-center space-y-6 animate-fade-in">
        {/* Success animation */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Course Page Published! 🎉</h1>
          <p className="text-muted-foreground mt-1">{name} is now live and ready for enrollments.</p>
        </div>

        {/* URL Card */}
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Your course page URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-foreground bg-background px-3 py-2 rounded-lg border border-border truncate text-left">
              {fullUrl}
            </code>
            <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("URL copied!"); }}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </div>

        {/* Share Options */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("Link copied!"); }}>
            <Copy className="h-3.5 w-3.5" /> Copy Link
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this course: ${name} — ${fullUrl}`)}`, "_blank")}>
            <Share2 className="h-3.5 w-3.5" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(`Enroll here: ${fullUrl}`)}`, "_blank")}>
            <Share2 className="h-3.5 w-3.5" /> Email
          </Button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="gap-1.5" onClick={() => window.open(`/s/${publishedSlug}`, "_blank")}>
            <ExternalLink className="h-4 w-4" /> View Live Page
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/website-builder/${publishedSiteId}`)}>
            <Settings className="h-4 w-4" /> Manage Course
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => navigate("/website-builder/course/create")}>
            <Plus className="h-4 w-4" /> Create Another
          </Button>
          <Button variant="ghost" className="gap-1.5" onClick={() => navigate("/website-builder")}>
            <Globe className="h-4 w-4" /> View All Pages
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Inline Chat Widgets ───
interface ChatInlineWidgetProps {
  questionKey: string;
  type: string;
  onPaidToggle: (paid: boolean) => void;
  onPricingModelSelect: (model: "one-time" | "subscription") => void;
  onCourseFormatSet: (format: "self-paced" | "cohort-based" | "live-sessions") => void;
  onCourseIncludesSet: (includes: string[]) => void;
  onCertificateSet: (offered: boolean) => void;
  onModulesDone: () => void;
  courseIncludes: string[];
  modules: CourseModule[];
  setModules: (fn: (prev: CourseModule[]) => CourseModule[]) => void;
}

const ChatInlineWidget = ({
  type,
  onPaidToggle,
  onPricingModelSelect,
  onCourseFormatSet,
  onCourseIncludesSet,
  onCertificateSet,
  onModulesDone,
  courseIncludes,
  modules,
  setModules,
}: ChatInlineWidgetProps) => {
  const [newModuleTitle, setNewModuleTitle] = useState("");

  if (type === "paid-toggle") {
    return (
      <div className="flex justify-start">
        <div className="flex gap-2">
          <button
            onClick={() => onPaidToggle(false)}
            className="px-5 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="text-lg">🆓</span>
            <p className="text-xs font-medium text-foreground mt-1">Free</p>
          </button>
          <button
            onClick={() => onPaidToggle(true)}
            className="px-5 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="text-lg">💰</span>
            <p className="text-xs font-medium text-foreground mt-1">Paid</p>
          </button>
        </div>
      </div>
    );
  }

  if (type === "pricing-model") {
    return (
      <div className="flex justify-start">
        <div className="flex gap-2">
          <button
            onClick={() => onPricingModelSelect("one-time")}
            className="px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-center"
          >
            <span className="text-xl">💵</span>
            <p className="text-xs font-medium text-foreground mt-1">One-time</p>
          </button>
          <button
            onClick={() => onPricingModelSelect("subscription")}
            className="px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-center"
          >
            <span className="text-xl">📅</span>
            <p className="text-xs font-medium text-foreground mt-1">Subscription</p>
          </button>
        </div>
      </div>
    );
  }

  if (type === "course-format") {
    return (
      <div className="flex justify-start">
        <div className="flex gap-2">
          {(["self-paced", "cohort-based", "live-sessions"] as const).map(format => (
            <button
              key={format}
              onClick={() => onCourseFormatSet(format)}
              className="px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-center"
            >
              <span className="text-xl">{format === "self-paced" ? "⏱️" : format === "cohort-based" ? "👥" : "📹"}</span>
              <p className="text-xs font-medium text-foreground mt-1 capitalize">{format.replace("-", " ")}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === "course-includes") {
    const options = ["Videos", "PDFs", "Assignments", "Quizzes", "Certificate", "Live Q&A"];
    return (
      <div className="flex justify-start">
        <div className="bg-secondary/50 rounded-xl p-3 space-y-2 max-w-md">
          <div className="grid grid-cols-2 gap-2">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  if (courseIncludes.includes(opt)) {
                    onCourseIncludesSet(courseIncludes.filter(i => i !== opt));
                  } else {
                    onCourseIncludesSet([...courseIncludes, opt]);
                  }
                }}
                className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                  courseIncludes.includes(opt)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <Button size="sm" className="w-full text-xs mt-2" onClick={() => onCourseIncludesSet(courseIncludes)}>
            Continue →
          </Button>
        </div>
      </div>
    );
  }

  if (type === "certificate") {
    return (
      <div className="flex justify-start">
        <div className="flex gap-2">
          <button
            onClick={() => onCertificateSet(true)}
            className="px-5 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="text-lg">🏆</span>
            <p className="text-xs font-medium text-foreground mt-1">Yes</p>
          </button>
          <button
            onClick={() => onCertificateSet(false)}
            className="px-5 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="text-lg">❌</span>
            <p className="text-xs font-medium text-foreground mt-1">No</p>
          </button>
        </div>
      </div>
    );
  }

  if (type === "modules") {
    return (
      <div className="flex justify-start">
        <div className="bg-secondary/50 rounded-xl p-3 space-y-2 max-w-md">
          <div className="space-y-1.5">
            {modules.map((mod, idx) => (
              <div key={mod.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-background border border-border">
                <span className="text-muted-foreground font-mono">#{idx + 1}</span>
                <span className="flex-1 text-foreground font-medium">{mod.title}</span>
                <button
                  onClick={() => setModules(prev => prev.filter(m => m.id !== mod.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input
              value={newModuleTitle}
              onChange={e => setNewModuleTitle(e.target.value)}
              placeholder="Add module..."
              className="text-xs h-8"
              onKeyDown={e => {
                if (e.key === "Enter" && newModuleTitle.trim()) {
                  setModules(prev => [...prev, {
                    id: `mod_${Date.now()}`,
                    title: newModuleTitle,
                    description: "Module description",
                    duration: "2 hours",
                    lessons: 5,
                  }]);
                  setNewModuleTitle("");
                }
              }}
            />
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
              if (newModuleTitle.trim()) {
                setModules(prev => [...prev, {
                  id: `mod_${Date.now()}`,
                  title: newModuleTitle,
                  description: "Module description",
                  duration: "2 hours",
                  lessons: 5,
                }]);
                setNewModuleTitle("");
              }
            }}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button size="sm" className="w-full text-xs" onClick={onModulesDone}>
            Looks good, continue →
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

// ─── Collapsible Section ───
const CollapsibleSection = ({ title, icon, open, onToggle, children }: {
  title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">{icon}{title}</div>
      {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
    {open && <div className="px-3 py-3 border-t border-border">{children}</div>}
  </div>
);

export default CourseCreate;
