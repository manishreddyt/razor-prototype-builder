import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Calendar, Clock, Video, Plus, Trash2, Globe, PartyPopper, Eye,
  MessageSquare, Settings, ChevronDown, ChevronUp, Bot,
} from "lucide-react";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import {
  defaultRegistrationFields, defaultWorkflows, defaultConfirmationConfig,
  type RegistrationField, type EventConfig, type WebinarData, type ConfirmationConfig,
} from "@/types/smartPages";
import WebinarLandingPreview from "@/components/WebinarLandingPreview";
import { useAIPageBuilder, type AIPageUpdates } from "@/hooks/useAIPageBuilder";

type Phase = "chat" | "builder" | "confirmation";

interface ChatMsg {
  id: string;
  role: "bot" | "user";
  content: string;
  type?: "text" | "platform-select" | "paid-toggle" | "date-time" | "duration" | "reg-fields" | "transition";
  answered?: boolean;
  isNew?: boolean;
}

// The questions the bot asks sequentially
const QUESTION_SEQUENCE = [
  { key: "name", message: "👋 Hey! I'll help you set up a **webinar landing page** with registration and payment collection.\n\n🎯 **What you'll get:**\n• A professional webinar page with countdown, speakers & agenda\n• Registration form to collect attendee details\n• Payment collection for paid webinars via Razorpay\n• Zoom / Google Meet integration for hosting\n• Post-event follow-up workflows (email, WhatsApp)\n\n📋 **I'll need a few details:**\n1. Webinar name & description\n2. Free or paid\n3. Date, time & platform\n4. Registration fields\n\nLet's start — **What's the name of your webinar?**", type: "text" as const },
  { key: "description", message: "Nice! **Describe what attendees will learn** — a few sentences is perfect.", type: "text" as const },
  { key: "isPaid", message: "Is this a **paid or free** webinar?", type: "paid-toggle" as const },
  { key: "amount", message: "How much would you like to charge? **Enter the amount in ₹**.", type: "text" as const, condition: (state: Partial<WebinarData>) => state.isPaid },
  { key: "dateTime", message: "When is the webinar? **Pick a date and time.**", type: "date-time" as const },
  { key: "duration", message: "How long will it be? **Select the duration.**", type: "duration" as const },
  { key: "platform", message: "Which platform are you hosting on?", type: "platform-select" as const },
  { key: "meetingLink", message: "Got it! **Paste your meeting link** (or skip for now).", type: "text" as const },
  { key: "regFields", message: "I've set up default registration fields (Name, Email, Phone). Want to **add any custom fields**?", type: "reg-fields" as const },
];

const timezones = [
  "Asia/Kolkata (IST)", "America/New_York (EST)", "America/Los_Angeles (PST)",
  "Europe/London (GMT)", "Asia/Singapore (SGT)", "Australia/Sydney (AEST)",
];

const WebinarCreate = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("chat");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Webinar state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage] = useState("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=400&fit=crop");
  const [isPaid, setIsPaid] = useState(false);
  const [amount, setAmount] = useState(999);
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    date: "", time: "", duration: 60, timezone: "Asia/Kolkata (IST)",
    platform: "zoom", meetingLink: "", eventName: "",
  });
  const [regFields, setRegFields] = useState<RegistrationField[]>([...defaultRegistrationFields]);
  const [speakers] = useState([
    { name: "Dr. Arun Kumar", title: "AI Researcher", avatar: "AK", bio: "Leading expert in machine learning." },
  ]);

  // Builder state
  const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationConfig>({ ...defaultConfirmationConfig });
  const [builderTab, setBuilderTab] = useState<"chat" | "settings">("chat");
  const [builderChatInput, setBuilderChatInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState<Record<string, boolean>>({ details: true, schedule: false, registration: false, confirmation: false });

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
        isNew: true,
      }]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
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
    const total = QUESTION_SEQUENCE.filter(q => !q.condition || q.condition({ isPaid })).length;
    return Math.round((questionIndex / total) * 100);
  };

  const advanceQuestion = useCallback((currentIdx: number) => {
    let nextIdx = currentIdx + 1;
    // Skip conditional questions
    while (nextIdx < QUESTION_SEQUENCE.length) {
      const q = QUESTION_SEQUENCE[nextIdx];
      if (q.condition && !q.condition({ isPaid, name, description })) {
        nextIdx++;
        continue;
      }
      break;
    }
    if (nextIdx >= QUESTION_SEQUENCE.length) {
      // All questions answered → transition
      addBotMessage("✨ Perfect! I have everything I need. **Let me build your landing page...**", "transition");
      setTimeout(() => setPhase("builder"), 2000);
    } else {
      setQuestionIndex(nextIdx);
      const q = QUESTION_SEQUENCE[nextIdx];
      addBotMessage(q.message, q.type);
    }
  }, [isPaid, name, description, addBotMessage]);

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
        setEventConfig(prev => ({ ...prev, eventName: text }));
        break;
      case "description":
        setDescription(text);
        break;
      case "amount":
        setAmount(parseInt(text.replace(/[^0-9]/g, "")) || 999);
        break;
      case "meetingLink":
        setEventConfig(prev => ({ ...prev, meetingLink: text }));
        break;
    }

    advanceQuestion(questionIndex);
  };

  const handlePlatformSelect = (platform: "zoom" | "gmeet" | "custom") => {
    setEventConfig(prev => ({ ...prev, platform }));
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: platform === "zoom" ? "Zoom" : platform === "gmeet" ? "Google Meet" : "Custom Link",
    }]);
    advanceQuestion(questionIndex);
  };

  const handlePaidToggle = (paid: boolean) => {
    setIsPaid(paid);
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: paid ? "Paid webinar" : "Free webinar",
    }]);
    // Need to advance, but we have to handle the condition check for amount
    // advanceQuestion will skip amount if free
    setTimeout(() => {
      let nextIdx = questionIndex + 1;
      while (nextIdx < QUESTION_SEQUENCE.length) {
        const q = QUESTION_SEQUENCE[nextIdx];
        if (q.condition && !q.condition({ isPaid: paid })) { nextIdx++; continue; }
        break;
      }
      if (nextIdx >= QUESTION_SEQUENCE.length) {
        addBotMessage("✨ Perfect! Let me build your landing page...", "transition");
        setTimeout(() => setPhase("builder"), 2000);
      } else {
        setQuestionIndex(nextIdx);
        addBotMessage(QUESTION_SEQUENCE[nextIdx].message, QUESTION_SEQUENCE[nextIdx].type);
      }
    }, 100);
  };

  const handleDateTimeSet = (date: string, time: string) => {
    setEventConfig(prev => ({ ...prev, date, time }));
    const dateStr = date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBD";
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: `${dateStr} at ${time || "TBD"}`,
    }]);
    advanceQuestion(questionIndex);
  };

  const handleDurationSet = (d: number) => {
    setEventConfig(prev => ({ ...prev, duration: d }));
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user", content: `${d} minutes`,
    }]);
    advanceQuestion(questionIndex);
  };

  const handleRegFieldsDone = () => {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`, role: "user",
      content: `${regFields.length} fields configured`,
    }]);
    advanceQuestion(questionIndex);
  };

  // Build webinar data object
  const buildWebinarData = (): WebinarData => ({
    name, description, bannerImage, isPaid, amount: isPaid ? amount : 0,
    eventConfig: { ...eventConfig, eventName: eventConfig.eventName || name },
    registrationFields: regFields, workflows: defaultWorkflows,
    attendees: [], speakers, confirmation: confirmationConfig,
  });

  // Handle publish
  const handlePublish = () => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "webinar";
    const site: SmartPageSite = {
      id: `sp_${Date.now()}`, name, type: "Webinar", category: "education",
      slug, templateId: "webinar", url: `/s/${slug}`,
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 0, conversions: 0, status: "Published",
      amount: isPaid ? amount : 0, transactions: 0, pageType: "webinar",
    };
    localStorage.setItem(`webinar_${site.id}`, JSON.stringify(buildWebinarData()));
    addSite(site);
    setPublishedSlug(slug);
    setPublishedSiteId(site.id);
    setPhase("confirmation");
  };

  // Builder chat handler using real AI
  const { sendPrompt, isLoading: aiLoading } = useAIPageBuilder({
    pageType: "webinar",
    getCurrentData: () => ({
      name, description, bannerImage, isPaid, amount,
      eventConfig, speakers: speakers.map(s => ({ name: s.name, title: s.title })),
    }),
    onUpdates: (updates: AIPageUpdates) => {
      if (updates.name) setName(updates.name);
      if (updates.description) setDescription(updates.description);
      if (updates.bannerImage) { /* bannerImage is const in webinar */ }
      if (updates.isPaid !== undefined) setIsPaid(updates.isPaid);
      if (updates.amount !== undefined) setAmount(updates.amount);
    },
  });

  const handleBuilderChat = async (text: string) => {
    if (!text.trim() || aiLoading) return;
    setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "user", content: text }]);
    setBuilderChatInput("");

    const response = await sendPrompt(text);
    setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "bot", content: response }]);
  };

  const webinarData = buildWebinarData();
  const fullUrl = `${window.location.origin}/s/${publishedSlug}`;

  // ─── PHASE 1: Chat Flow ───
  if (phase === "chat") {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
        {/* Top bar — minimal, floating */}
        <div className="flex items-center justify-between px-5 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/website-builder/create")} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Create Webinar</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{getProgress()}%</span>
              <Progress value={getProgress()} className="w-20 h-1" />
            </div>
          </div>
        </div>

        {/* Chat area */}
        <ScrollArea className="flex-1 px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-5">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{
                  animation: msg.isNew ? "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
                  opacity: 1,
                }}
              >
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 shadow-lg shadow-primary/10"
                    : "bg-card text-foreground rounded-2xl rounded-bl-sm px-5 py-4 border border-border/60 shadow-sm"
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                      .replace(/^• /gm, '<span class="inline-flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-primary inline-block flex-shrink-0"></span></span> ')
                      .replace(/^(\d+)\. /gm, '<span class="text-primary font-semibold">$1.</span> ')
                  }} />
                </div>
              </div>
            ))}

            {/* Inline interactive elements based on current question */}
            {!isTyping && questionIndex < QUESTION_SEQUENCE.length && (
              <div className="pl-11" style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <ChatInlineWidget
                  questionKey={QUESTION_SEQUENCE[questionIndex]?.key}
                  type={QUESTION_SEQUENCE[questionIndex]?.type}
                  eventConfig={eventConfig}
                  onPlatformSelect={handlePlatformSelect}
                  onPaidToggle={handlePaidToggle}
                  onDateTimeSet={handleDateTimeSet}
                  onDurationSet={handleDurationSet}
                  onRegFieldsDone={handleRegFieldsDone}
                  regFields={regFields}
                  setRegFields={setRegFields}
                />
              </div>
            )}

            {isTyping && (
              <div className="flex gap-3 justify-start" style={{ animation: "slideUp 0.3s ease-out" }}>
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Input bar — floating, modern */}
        {!isTyping && questionIndex < QUESTION_SEQUENCE.length &&
          ["name", "description", "amount", "meetingLink"].includes(QUESTION_SEQUENCE[questionIndex]?.key) && (
          <div className="px-4 pb-5 pt-2 bg-gradient-to-t from-background via-background to-transparent">
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 items-center bg-card border border-border/80 rounded-2xl px-4 py-2 shadow-lg shadow-black/5 focus-within:border-primary/40 focus-within:shadow-primary/5 transition-all duration-200">
                <Input
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    QUESTION_SEQUENCE[questionIndex]?.key === "meetingLink"
                      ? "Paste link or type 'skip'..."
                      : "Type your response..."
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (QUESTION_SEQUENCE[questionIndex]?.key === "meetingLink" && (!chatInput.trim() || chatInput.trim().toLowerCase() === "skip")) {
                        handleUserResponse("Skipped for now");
                      } else {
                        handleUserResponse(chatInput);
                      }
                    }
                  }}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
                  autoFocus
                />
                <Button
                  onClick={() => {
                    if (QUESTION_SEQUENCE[questionIndex]?.key === "meetingLink" && (!chatInput.trim() || chatInput.trim().toLowerCase() === "skip")) {
                      handleUserResponse("Skipped for now");
                    } else {
                      handleUserResponse(chatInput);
                    }
                  }}
                  size="icon"
                  className="rounded-xl h-9 w-9 flex-shrink-0 shadow-md"
                  disabled={!chatInput.trim() && QUESTION_SEQUENCE[questionIndex]?.key !== "meetingLink"}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
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
            <span className="font-medium text-sm text-foreground">{name || "Untitled Webinar"}</span>
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
                        <p className="text-xs">🎨 Your landing page is ready! I've built it from your responses. Use the **Settings** tab to make edits, or ask me anything here.</p>
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
                        <Label className="text-xs">Webinar Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="mt-1 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 text-xs" rows={3} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Paid Webinar</Label>
                        <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                      </div>
                      {isPaid && (
                        <div>
                          <Label className="text-xs">Amount (₹)</Label>
                          <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 text-xs" />
                        </div>
                      )}
                    </div>
                  </CollapsibleSection>

                  {/* Schedule Section */}
                  <CollapsibleSection
                    title="Schedule & Platform" icon={<Calendar className="h-3.5 w-3.5" />}
                    open={settingsOpen.schedule}
                    onToggle={() => setSettingsOpen(p => ({ ...p, schedule: !p.schedule }))}
                  >
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Date</Label>
                          <Input type="date" value={eventConfig.date} onChange={e => setEventConfig(p => ({ ...p, date: e.target.value }))} className="mt-1 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs">Time</Label>
                          <Input type="time" value={eventConfig.time} onChange={e => setEventConfig(p => ({ ...p, time: e.target.value }))} className="mt-1 text-xs" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Duration</Label>
                        <Select value={String(eventConfig.duration)} onValueChange={v => setEventConfig(p => ({ ...p, duration: Number(v) }))}>
                          <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[30, 45, 60, 90, 120, 180].map(d => (
                              <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Platform</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {(["zoom", "gmeet", "custom"] as const).map(p => (
                            <button
                              key={p}
                              onClick={() => setEventConfig(prev => ({ ...prev, platform: p }))}
                              className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                                eventConfig.platform === p
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              {p === "zoom" ? "Zoom" : p === "gmeet" ? "GMeet" : "Custom"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Meeting Link</Label>
                        <Input
                          value={eventConfig.meetingLink}
                          onChange={e => setEventConfig(p => ({ ...p, meetingLink: e.target.value }))}
                          placeholder="https://..."
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Registration Section */}
                  <CollapsibleSection
                    title="Registration Fields" icon={<Globe className="h-3.5 w-3.5" />}
                    open={settingsOpen.registration}
                    onToggle={() => setSettingsOpen(p => ({ ...p, registration: !p.registration }))}
                  >
                    <div className="space-y-2">
                      {regFields.map(f => (
                        <div key={f.id} className="flex items-center gap-2 p-2 rounded-md border border-border text-xs">
                          <span className="flex-1 font-medium text-foreground">{f.label}</span>
                          <Badge variant="secondary" className="text-[9px]">{f.required ? "Required" : "Optional"}</Badge>
                          {!["rf_name", "rf_email"].includes(f.id) && (
                            <button onClick={() => setRegFields(prev => prev.filter(x => x.id !== f.id))} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline" size="sm" className="w-full text-xs gap-1 mt-1"
                        onClick={() => setRegFields(prev => [...prev, {
                          id: `rf_${Date.now()}`, label: "Custom Field", type: "text", required: false, placeholder: "Enter value",
                        }])}
                      >
                        <Plus className="h-3 w-3" /> Add Field
                      </Button>
                    </div>
                  </CollapsibleSection>

                  {/* Confirmation Section */}
                  <CollapsibleSection
                    title="Confirmation Screen" icon={<Check className="h-3.5 w-3.5" />}
                    open={settingsOpen.confirmation}
                    onToggle={() => setSettingsOpen(p => ({ ...p, confirmation: !p.confirmation }))}
                  >
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input value={confirmationConfig.title} onChange={e => setConfirmationConfig(p => ({ ...p, title: e.target.value }))} className="mt-1 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Message</Label>
                        <Textarea value={confirmationConfig.message} onChange={e => setConfirmationConfig(p => ({ ...p, message: e.target.value }))} className="mt-1 text-xs" rows={3} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Event Details</Label>
                        <Switch checked={confirmationConfig.showEventDetails} onCheckedChange={v => setConfirmationConfig(p => ({ ...p, showEventDetails: v }))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Calendar Link</Label>
                        <Switch checked={confirmationConfig.showCalendarLink} onCheckedChange={v => setConfirmationConfig(p => ({ ...p, showCalendarLink: v }))} />
                      </div>
                      {confirmationConfig.showCalendarLink && (
                        <>
                          <div>
                            <Label className="text-xs">Button Text</Label>
                            <Input value={confirmationConfig.ctaText} onChange={e => setConfirmationConfig(p => ({ ...p, ctaText: e.target.value }))} className="mt-1 text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">Button URL</Label>
                            <Input value={confirmationConfig.ctaUrl} onChange={e => setConfirmationConfig(p => ({ ...p, ctaUrl: e.target.value }))} placeholder="https://..." className="mt-1 text-xs" />
                          </div>
                        </>
                      )}
                    </div>
                  </CollapsibleSection>
                </div>
              </ScrollArea>
            )}
          </div>

          {/* RIGHT: Live Preview */}
          <div className="flex-1 bg-muted/30 overflow-auto">
            <div className="max-w-3xl mx-auto my-6 bg-background rounded-xl shadow-lg border border-border overflow-hidden">
              <WebinarLandingPreview data={webinarData} editable onEdit={(field, value) => {
                if (field === "name") setName(value);
                else if (field === "description") setDescription(value);
              }} />
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
          <h1 className="text-2xl font-bold text-foreground">Webinar Published! 🎉</h1>
          <p className="text-muted-foreground mt-1">{name} is now live and ready for registrations.</p>
        </div>

        {/* URL Card */}
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Your webinar URL</p>
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
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my webinar: ${name} — ${fullUrl}`)}`, "_blank")}>
            <Share2 className="h-3.5 w-3.5" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(`Register here: ${fullUrl}`)}`, "_blank")}>
            <Share2 className="h-3.5 w-3.5" /> Email
          </Button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="gap-1.5" onClick={() => window.open(`/s/${publishedSlug}`, "_blank")}>
            <ExternalLink className="h-4 w-4" /> View Live Page
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/website-builder/${publishedSiteId}`)}>
            <Settings className="h-4 w-4" /> Manage Webinar
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => navigate("/website-builder/webinar/create")}>
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
  eventConfig: EventConfig;
  onPlatformSelect: (p: "zoom" | "gmeet" | "custom") => void;
  onPaidToggle: (paid: boolean) => void;
  onDateTimeSet: (date: string, time: string) => void;
  onDurationSet: (d: number) => void;
  onRegFieldsDone: () => void;
  regFields: RegistrationField[];
  setRegFields: (fn: (prev: RegistrationField[]) => RegistrationField[]) => void;
}

const ChatInlineWidget = ({ questionKey, type, eventConfig, onPlatformSelect, onPaidToggle, onDateTimeSet, onDurationSet, onRegFieldsDone, regFields, setRegFields }: ChatInlineWidgetProps) => {
  const [date, setDate] = useState(eventConfig.date);
  const [time, setTime] = useState(eventConfig.time);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  if (type === "platform-select") {
    return (
      <div className="flex gap-2.5">
        {([
          { id: "zoom" as const, label: "Zoom", emoji: "🎥" },
          { id: "gmeet" as const, label: "Google Meet", emoji: "📹" },
          { id: "custom" as const, label: "Custom Link", emoji: "🔗" },
        ]).map(p => (
          <button
            key={p.id}
            onClick={() => onPlatformSelect(p.id)}
            className="px-5 py-3.5 rounded-xl border border-border/80 bg-card hover:border-primary hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 text-center group"
          >
            <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">{p.emoji}</span>
            <p className="text-xs font-medium text-foreground">{p.label}</p>
          </button>
        ))}
      </div>
    );
  }

  if (type === "paid-toggle") {
    return (
      <div className="flex gap-2.5">
        <button
          onClick={() => onPaidToggle(false)}
          className="px-6 py-3.5 rounded-xl border border-border/80 bg-card hover:border-primary hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group"
        >
          <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">🆓</span>
          <p className="text-xs font-medium text-foreground">Free</p>
        </button>
        <button
          onClick={() => onPaidToggle(true)}
          className="px-6 py-3.5 rounded-xl border border-border/80 bg-card hover:border-primary hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group"
        >
          <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">💰</span>
          <p className="text-xs font-medium text-foreground">Paid</p>
        </button>
      </div>
    );
  }

  if (type === "date-time") {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-4 space-y-3 shadow-sm max-w-xs">
        <div className="flex gap-2">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-xs" />
          <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="text-xs" />
        </div>
        <Button size="sm" className="w-full text-xs rounded-lg" onClick={() => onDateTimeSet(date, time)} disabled={!date || !time}>
          Confirm
        </Button>
      </div>
    );
  }

  if (type === "duration") {
    return (
      <div className="flex flex-wrap gap-2">
        {[30, 45, 60, 90, 120].map(d => (
          <button
            key={d}
            onClick={() => onDurationSet(d)}
            className="px-4 py-2.5 rounded-xl border border-border/80 bg-card hover:border-primary hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 text-xs font-medium text-foreground"
          >
            {d} min
          </button>
        ))}
      </div>
    );
  }

  if (type === "reg-fields") {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-4 space-y-3 shadow-sm max-w-sm">
        <div className="space-y-1.5">
          {regFields.map(f => (
            <div key={f.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-secondary/40 border border-border/50">
              <span className="flex-1 text-foreground font-medium">{f.label}</span>
              <Badge variant="secondary" className="text-[8px]">{f.required ? "Req" : "Opt"}</Badge>
              {!["rf_name", "rf_email"].includes(f.id) && (
                <button onClick={() => setRegFields(prev => prev.filter(x => x.id !== f.id))} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Input
            value={newFieldLabel}
            onChange={e => setNewFieldLabel(e.target.value)}
            placeholder="Add custom field..."
            className="text-xs h-8"
            onKeyDown={e => {
              if (e.key === "Enter" && newFieldLabel.trim()) {
                setRegFields(prev => [...prev, { id: `rf_${Date.now()}`, label: newFieldLabel, type: "text", required: false, placeholder: `Enter ${newFieldLabel.toLowerCase()}` }]);
                setNewFieldLabel("");
              }
            }}
          />
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
            if (newFieldLabel.trim()) {
              setRegFields(prev => [...prev, { id: `rf_${Date.now()}`, label: newFieldLabel, type: "text", required: false, placeholder: `Enter ${newFieldLabel.toLowerCase()}` }]);
              setNewFieldLabel("");
            }
          }}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button size="sm" className="w-full text-xs rounded-lg" onClick={onRegFieldsDone}>
          Looks good, continue →
        </Button>
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

export default WebinarCreate;
