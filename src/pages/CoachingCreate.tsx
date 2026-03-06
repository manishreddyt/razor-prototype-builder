import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  MessageSquare, Settings, ChevronDown, ChevronUp, Users, Monitor, Smartphone, Loader2,
  FileText, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import {
  defaultRegistrationFields,
  type RegistrationField,
} from "@/types/smartPages";
import CoachingLandingPreview from "@/components/CoachingLandingPreview";
import { useAIPageBuilder, type AIPageUpdates } from "@/hooks/useAIPageBuilder";

interface ChatMsg {
  id: string;
  role: "bot" | "user";
  content: string;
}

export interface SessionConfig {
  duration: number;
  buffer: number;
  maxPerDay: number;
  platform: "gmeet";
  meetingLink: string;
}

export interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface CoachingData {
  name: string;
  description: string;
  tagline: string;
  bannerImage: string;
  isPaid: boolean;
  amount: number;
  pricingModel: "per-session" | "package";
  packageSessions?: number;
  packageAmount?: number;
  sessionConfig: SessionConfig;
  availability: AvailabilitySlot[];
  bookingFields: RegistrationField[];
  coach: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
    credentials?: string[];
  };
}

const defaultAvailability: AvailabilitySlot[] = [
  { id: "av_1", day: "monday", startTime: "09:00", endTime: "17:00", enabled: true },
  { id: "av_2", day: "tuesday", startTime: "09:00", endTime: "17:00", enabled: true },
  { id: "av_3", day: "wednesday", startTime: "09:00", endTime: "17:00", enabled: true },
  { id: "av_4", day: "thursday", startTime: "09:00", endTime: "17:00", enabled: true },
  { id: "av_5", day: "friday", startTime: "09:00", endTime: "17:00", enabled: true },
  { id: "av_6", day: "saturday", startTime: "09:00", endTime: "17:00", enabled: false },
  { id: "av_7", day: "sunday", startTime: "09:00", endTime: "17:00", enabled: false },
];

const INITIAL_MESSAGE = `👋 Hey! I'll help you set up a **1:1 coaching/session booking page** with payments.

🎯 **What you'll get:**
• Professional booking page with your profile & services
• Calendar integration for session scheduling
• Payment collection via Razorpay (for paid sessions)
• Custom booking form for client details
• Google Meet integration (or custom platform)

📋 **Let's get started! Please answer these questions:**

1️⃣ **What coaching/service do you offer?**
   (Name and brief description)

2️⃣ **Is it free or paid?**
   (If paid, what's the price per session in ₹? Or package pricing?)

3️⃣ **How long is each session?**
   (Duration in minutes, e.g., 30, 60, 90)

4️⃣ **Your name and title?**
   (e.g., "John Doe, Career Coach")

5️⃣ **When are you available?**
   (Weekdays only, or weekends too?)

💡 **Tip:** Answer all at once, or one by one - I'll figure it out!

Example: "Career Coaching, Help professionals transition careers, Paid ₹4999 per session, 60 minutes, Sarah Smith - Career Transition Coach, Weekdays only"`;

const CoachingCreate = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "msg_welcome",
      role: "bot",
      content: INITIAL_MESSAGE,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Coaching state - start with empty values
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=400&fit=crop");
  const [isPaid, setIsPaid] = useState(false);
  const [amount, setAmount] = useState(0);
  const [pricingModel, setPricingModel] = useState<"per-session" | "package">("per-session");
  const [packageSessions, setPackageSessions] = useState(5);
  const [packageAmount, setPackageAmount] = useState(0);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    duration: 60,
    buffer: 15,
    maxPerDay: 5,
    platform: "gmeet",
    meetingLink: "auto",
  });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(defaultAvailability);
  const [bookingFields, setBookingFields] = useState<RegistrationField[]>([...defaultRegistrationFields]);
  const [coach, setCoach] = useState({
    name: "",
    title: "",
    avatar: "",
    bio: "",
    credentials: [] as string[],
  });

  // UI state
  const [hasBasicInfo, setHasBasicInfo] = useState(false);
  const [builderTab, setBuilderTab] = useState<"chat" | "settings">("chat");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [settingsOpen, setSettingsOpen] = useState<Record<string, boolean>>({
    details: true,
    pricing: false,
    sessions: false,
    availability: false,
    booking: false,
  });

  // Phase state - start with chat
  const [phase, setPhase] = useState<"chat" | "form" | "builder" | "confirmation">("chat");
  const [publishedSlug, setPublishedSlug] = useState("");
  const [publishedSiteId, setPublishedSiteId] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Parse user input to extract coaching details
  const parseUserInput = useCallback((text: string) => {
    const lower = text.toLowerCase();
    let updates: any = {};
    let extractedInfo: string[] = [];

    // Extract service name
    const namePatterns = [
      /(?:coaching|service|session|consulting|mentoring|training)\s+(?:on|for|in|about|:|-)?\s*([^,\.]+)/i,
      /(?:name|title|called|it's|i offer)\s+(?:is|:|-)?\s*["']?([^"',.]+)["']?/i,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = text.match(pattern);
      if (nameMatch && nameMatch[1].trim()) {
        const extractedName = nameMatch[1].trim();
        if (extractedName.length > 3 && extractedName.length < 100) {
          updates.name = extractedName;
          extractedInfo.push(`✓ Service: ${extractedName}`);
          break;
        }
      }
    }

    // Extract description
    const sentences = text.split(/[,\.\n]/).filter(s => s.trim().length > 10);
    if (sentences.length > 1) {
      const desc = sentences.slice(1, 3).join('. ').trim();
      if (desc.length > 10) {
        updates.description = desc;
        extractedInfo.push(`✓ Description captured`);
      }
    }

    // Extract price
    if (lower.includes('paid') || lower.match(/₹\s*\d+/)) {
      updates.isPaid = true;
      const priceMatch = text.match(/₹\s*(\d+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1]);

        // Check if it's package pricing
        if (lower.includes('package') || lower.includes('sessions')) {
          updates.pricingModel = 'package';
          updates.packageAmount = price;
          extractedInfo.push(`✓ Package price: ₹${price}`);
        } else {
          updates.pricingModel = 'per-session';
          updates.amount = price;
          extractedInfo.push(`✓ Price: ₹${price} per session`);
        }
      }
    } else if (lower.includes('free')) {
      updates.isPaid = false;
      extractedInfo.push(`✓ Free sessions`);
    }

    // Extract duration
    const durationMatch = text.match(/(\d+)\s*(?:min|minute|minutes|mins)/i);
    if (durationMatch) {
      updates.duration = parseInt(durationMatch[1]);
      extractedInfo.push(`✓ Duration: ${durationMatch[1]} minutes`);
    }

    // Extract coach name and title
    const coachMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–—,]\s*([^,\.\n]+(?:coach|consultant|mentor|trainer|expert|specialist))/i);
    if (coachMatch) {
      updates.coachName = coachMatch[1].trim();
      updates.coachTitle = coachMatch[2].trim();
      extractedInfo.push(`✓ Coach: ${coachMatch[1]} - ${coachMatch[2]}`);
    }

    // Extract availability
    if (lower.includes('weekend')) {
      updates.enableWeekends = true;
      extractedInfo.push(`✓ Weekends enabled`);
    } else if (lower.includes('weekday')) {
      updates.enableWeekends = false;
      extractedInfo.push(`✓ Weekdays only`);
    }

    return { updates, extractedInfo };
  }, []);

  // Handle user response in chat phase
  const handleUserResponse = useCallback((text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
    }]);
    setChatInput("");

    const { updates, extractedInfo } = parseUserInput(text);

    // Apply updates
    if (updates.name) setName(updates.name);
    if (updates.description) setDescription(updates.description);
    if (updates.isPaid !== undefined) setIsPaid(updates.isPaid);
    if (updates.amount) setAmount(updates.amount);
    if (updates.pricingModel) setPricingModel(updates.pricingModel);
    if (updates.packageAmount) setPackageAmount(updates.packageAmount);
    if (updates.duration) setSessionConfig(prev => ({ ...prev, duration: updates.duration }));
    if (updates.coachName) {
      const initials = updates.coachName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
      setCoach(prev => ({ ...prev, name: updates.coachName, avatar: initials }));
    }
    if (updates.coachTitle) setCoach(prev => ({ ...prev, title: updates.coachTitle }));
    if (updates.enableWeekends !== undefined) {
      setAvailability(prev => prev.map(slot =>
        slot.day === "saturday" || slot.day === "sunday"
          ? { ...slot, enabled: updates.enableWeekends }
          : slot
      ));
    }

    // Generate response
    setIsTyping(true);
    setTimeout(() => {
      let response = "";
      let needsMore = [];

      if (extractedInfo.length > 0) {
        response = "Great! I've captured:\n\n" + extractedInfo.join('\n');

        // Check what's missing
        if (!name && !updates.name) needsMore.push("service/coaching name");
        if (!isPaid && updates.isPaid === undefined) needsMore.push("pricing (free/paid)");
        if (!coach.name && !updates.coachName) needsMore.push("your name");
        if (!coach.title && !updates.coachTitle) needsMore.push("your title/role");

        if (needsMore.length > 0) {
          response += "\n\n📝 **Still need:**\n• " + needsMore.join('\n• ');
          response += "\n\nJust reply with the missing info, or click **Switch to Form** to fill it manually!";
        } else {
          response += "\n\n✨ **Perfect! I have enough to create your coaching page.**\n\nClick **Continue to Builder** below, or provide more details!";
          setHasBasicInfo(true);
        }
      } else {
        response = "I didn't catch that. Could you tell me:\n\n• What coaching/service you offer?\n• Is it free or paid (and the price)?\n• Your name and title?\n\nOr click **Switch to Form** to fill in the details!";
      }

      setMessages((prev) => [...prev, { id: `msg_${Date.now()}`, role: "bot", content: response }]);
      setIsTyping(false);
    }, 800);
  }, [parseUserInput, name, isPaid, coach.name, coach.title]);

  // Build coaching data object
  const buildCoachingData = (): CoachingData => ({
    name,
    tagline,
    description,
    bannerImage,
    isPaid,
    amount: isPaid ? amount : 0,
    pricingModel,
    packageSessions: pricingModel === "package" ? packageSessions : undefined,
    packageAmount: pricingModel === "package" ? packageAmount : undefined,
    sessionConfig,
    availability,
    bookingFields,
    coach,
  });

  // AI Chat handler using real AI
  const { sendPrompt, isLoading: aiLoading } = useAIPageBuilder({
    pageType: "coaching",
    getCurrentData: () => ({
      name, tagline, description, bannerImage, isPaid, amount, pricingModel,
      packageSessions, packageAmount,
      sessionDuration: sessionConfig.duration,
      coachName: coach.name, coachTitle: coach.title, coachBio: coach.bio,
      availability: availability.filter(a => a.enabled).map(a => a.day),
    }),
    onUpdates: (updates: AIPageUpdates) => {
      if (updates.name) setName(updates.name);
      if (updates.tagline) setTagline(updates.tagline);
      if (updates.description) setDescription(updates.description);
      if (updates.bannerImage) setBannerImage(updates.bannerImage);
      if (updates.isPaid !== undefined) setIsPaid(updates.isPaid);
      if (updates.amount !== undefined) setAmount(updates.amount);
      if (updates.pricingModel) setPricingModel(updates.pricingModel as any);
      if (updates.sessionDuration) setSessionConfig(prev => ({ ...prev, duration: updates.sessionDuration! }));
      if (updates.coachName) setCoach(prev => ({ ...prev, name: updates.coachName!, avatar: updates.coachName!.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) }));
      if (updates.coachTitle) setCoach(prev => ({ ...prev, title: updates.coachTitle! }));
      if (updates.coachBio) setCoach(prev => ({ ...prev, bio: updates.coachBio! }));
      if (updates.enableWeekends !== undefined) {
        setAvailability(prev => prev.map(slot =>
          slot.day === "saturday" || slot.day === "sunday"
            ? { ...slot, enabled: updates.enableWeekends! }
            : slot
        ));
      }
    },
  });

  const handleBuilderChat = async (text: string) => {
    if (!text.trim() || aiLoading) return;
    setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "user", content: text }]);
    setChatInput("");
    setIsTyping(true);

    const response = await sendPrompt(text);
    setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "bot", content: response }]);
    setIsTyping(false);
  };

  // Handle publish
  const handlePublish = () => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "coaching";
    const site: SmartPageSite = {
      id: `sp_${Date.now()}`,
      name,
      type: "Coaching",
      category: "education",
      slug,
      templateId: "coaching",
      url: `/s/${slug}`,
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 0,
      conversions: 0,
      status: "Published",
      amount: isPaid ? amount : 0,
      transactions: 0,
      pageType: "coaching",
    };
    localStorage.setItem(`coaching_${site.id}`, JSON.stringify(buildCoachingData()));
    addSite(site);
    setPublishedSlug(slug);
    setPublishedSiteId(site.id);
    setPhase("confirmation");
    toast.success("Coaching page published! 🎉");
  };

  const coachingData = buildCoachingData();
  const fullUrl = `${window.location.origin}/s/${publishedSlug}`;

  // ─── CHAT PHASE ───
  if (phase === "chat") {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/website-builder/create")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Create 1:1 Coaching Page</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPhase("form")} className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Switch to Form
            </Button>
            {hasBasicInfo && (
              <Button size="sm" onClick={() => {
                if (!name.trim()) {
                  toast.error("Please provide service name first");
                  return;
                }
                setPhase("builder");
              }} className="gap-1.5">
                Continue to Builder <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Chat area */}
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3"
                    : "bg-secondary/70 text-foreground rounded-2xl rounded-bl-md px-4 py-3"
                }`}>
                  <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^(#{1,6})\s+(.*)$/gm, (_, h, text) => `<h${h.length} class="font-bold mt-2 mb-1">${text}</h${h.length}>`)
                      .replace(/^(\d+)️⃣\s+(.*)$/gm, '<div class="font-medium text-primary mt-3">$1️⃣ $2</div>')
                      .replace(/^•\s+(.*)$/gm, '<div class="ml-4 my-1">• $1</div>')
                  }} />
                </div>
              </div>
            ))}
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

        {/* Input area */}
        <div className="px-4 pb-5 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 items-center bg-card border border-border/80 rounded-2xl px-4 py-2">
              <Input
                ref={inputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Answer the questions above, or ask me anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && chatInput.trim()) {
                    handleUserResponse(chatInput);
                  }
                }}
                disabled={isTyping}
                className="border-0 focus-visible:ring-0 shadow-none bg-transparent"
                autoFocus
              />
              <Button
                onClick={() => handleUserResponse(chatInput)}
                size="icon"
                disabled={!chatInput.trim() || isTyping}
                className="rounded-xl flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM PHASE ───
  if (phase === "form") {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPhase("chat")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Chat
            </Button>
            <div className="h-5 w-px bg-border" />
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Coaching Details Form</span>
          </div>
          <Button size="sm" onClick={() => {
            if (!name.trim()) {
              toast.error("Please provide service name");
              return;
            }
            setPhase("builder");
          }} className="gap-1.5">
            Continue to Builder <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Form */}
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
            {/* Basic Details */}
            <div className="blade-card p-5 space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Basic Details
              </h3>
              <div>
                <Label>Service/Coaching Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Career Coaching" className="mt-1" />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="One-line description" className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of your coaching service" className="mt-1" rows={3} />
              </div>
            </div>

            {/* Coach Info */}
            <div className="blade-card p-5 space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Your Profile
              </h3>
              <div>
                <Label>Your Name *</Label>
                <Input value={coach.name} onChange={e => {
                  const initials = e.target.value.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  setCoach(prev => ({ ...prev, name: e.target.value, avatar: initials }));
                }} placeholder="e.g., John Doe" className="mt-1" />
              </div>
              <div>
                <Label>Your Title/Role *</Label>
                <Input value={coach.title} onChange={e => setCoach(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Career Coach" className="mt-1" />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={coach.bio} onChange={e => setCoach(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell clients about yourself" className="mt-1" rows={2} />
              </div>
            </div>

            {/* Pricing */}
            <div className="blade-card p-5 space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Pricing
              </h3>
              <div className="flex items-center justify-between">
                <Label>Paid Coaching</Label>
                <Switch checked={isPaid} onCheckedChange={setIsPaid} />
              </div>
              {isPaid && (
                <>
                  <div>
                    <Label>Pricing Model</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {(["per-session", "package"] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setPricingModel(p)}
                          className={`p-3 rounded-lg border text-center text-sm font-medium transition-all ${
                            pricingModel === p
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {p === "per-session" ? "Per Session" : "Package"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {pricingModel === "per-session" && (
                    <div>
                      <Label>Amount per Session (₹)</Label>
                      <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="e.g., 2999" className="mt-1" />
                    </div>
                  )}
                  {pricingModel === "package" && (
                    <>
                      <div>
                        <Label>Number of Sessions</Label>
                        <Input type="number" value={packageSessions} onChange={e => setPackageSessions(Number(e.target.value))} placeholder="e.g., 5" className="mt-1" />
                      </div>
                      <div>
                        <Label>Package Amount (₹)</Label>
                        <Input type="number" value={packageAmount} onChange={e => setPackageAmount(Number(e.target.value))} placeholder="e.g., 12999" className="mt-1" />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Session Settings */}
            <div className="blade-card p-5 space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Session Settings
              </h3>
              <div>
                <Label>Session Duration</Label>
                <Select value={String(sessionConfig.duration)} onValueChange={v => setSessionConfig(p => ({ ...p, duration: Number(v) }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[30, 45, 60, 90, 120].map(d => (
                      <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Buffer Between Sessions</Label>
                <Select value={String(sessionConfig.buffer)} onValueChange={v => setSessionConfig(p => ({ ...p, buffer: Number(v) }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 5, 10, 15, 30].map(d => (
                      <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability */}
            <div className="blade-card p-5 space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Availability
              </h3>
              <div className="space-y-2">
                {availability.map(slot => (
                  <div key={slot.id} className="flex items-center gap-2 p-2 rounded-md border border-border">
                    <Switch
                      checked={slot.enabled}
                      onCheckedChange={(checked) => setAvailability(prev => prev.map(s => s.id === slot.id ? { ...s, enabled: checked } : s))}
                    />
                    <span className="flex-1 text-sm font-medium capitalize">{slot.day}</span>
                    {slot.enabled && (
                      <>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={e => setAvailability(prev => prev.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s))}
                          className="w-28 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={e => setAvailability(prev => prev.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s))}
                          className="w-28 text-sm"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ─── BUILDER PHASE ───
  if (phase === "builder") {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/website-builder/create")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-foreground">{name || "Untitled Coaching"}</span>
            <Badge variant="secondary" className="text-[10px]">Draft</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button onClick={() => setViewMode("desktop")} className={`p-1.5 ${viewMode === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><Monitor className="h-3.5 w-3.5" /></button>
              <button onClick={() => setViewMode("mobile")} className={`p-1.5 ${viewMode === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><Smartphone className="h-3.5 w-3.5" /></button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                const draftSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "coaching-draft";
                const draftSite: SmartPageSite = {
                  id: `draft_coaching_${Date.now()}`,
                  name: name || "Draft Coaching",
                  type: "Coaching",
                  category: "education",
                  slug: draftSlug,
                  templateId: "coaching",
                  url: `/s/${draftSlug}`,
                  created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                  views: 0,
                  conversions: 0,
                  status: "Draft" as const,
                  amount: isPaid ? amount : 0,
                  transactions: 0,
                  pageType: "coaching",
                };
                localStorage.setItem(`coaching_${draftSite.id}`, JSON.stringify(buildCoachingData()));
                addSite(draftSite);
                window.open(`/s/${draftSlug}`, "_blank");
              }}
            >
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
                    {messages.map(msg => (
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
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-secondary/70 rounded-2xl rounded-bl-md px-3 py-2">
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
                <div className="border-t border-border p-3">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Tell me what to change..."
                      className="text-xs"
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleBuilderChat(chatInput);
                        }
                      }}
                      autoFocus
                    />
                    <Button size="icon" className="h-9 w-9" onClick={() => handleBuilderChat(chatInput)} disabled={!chatInput.trim()}>
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
                        <Label className="text-xs">Coaching Service Name</Label>
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
                      <div>
                        <Label className="text-xs">Coach Name</Label>
                        <Input value={coach.name} onChange={e => setCoach(prev => ({ ...prev, name: e.target.value, avatar: e.target.value.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) }))} className="mt-1 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Coach Title</Label>
                        <Input value={coach.title} onChange={e => setCoach(prev => ({ ...prev, title: e.target.value }))} className="mt-1 text-xs" />
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
                        <Label className="text-xs">Paid Coaching</Label>
                        <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                      </div>
                      {isPaid && (
                        <>
                          <div>
                            <Label className="text-xs">Pricing Model</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {(["per-session", "package"] as const).map(p => (
                                <button
                                  key={p}
                                  onClick={() => setPricingModel(p)}
                                  className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                                    pricingModel === p
                                      ? "border-primary bg-primary/5 text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/30"
                                  }`}
                                >
                                  {p === "per-session" ? "Per Session" : "Package"}
                                </button>
                              ))}
                            </div>
                          </div>
                          {pricingModel === "per-session" && (
                            <div>
                              <Label className="text-xs">Amount per Session (₹)</Label>
                              <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 text-xs" />
                            </div>
                          )}
                          {pricingModel === "package" && (
                            <>
                              <div>
                                <Label className="text-xs">Number of Sessions</Label>
                                <Input type="number" value={packageSessions} onChange={e => setPackageSessions(Number(e.target.value))} className="mt-1 text-xs" />
                              </div>
                              <div>
                                <Label className="text-xs">Package Amount (₹)</Label>
                                <Input type="number" value={packageAmount} onChange={e => setPackageAmount(Number(e.target.value))} className="mt-1 text-xs" />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </CollapsibleSection>

                  {/* Session Settings */}
                  <CollapsibleSection
                    title="Session Settings" icon={<Clock className="h-3.5 w-3.5" />}
                    open={settingsOpen.sessions}
                    onToggle={() => setSettingsOpen(p => ({ ...p, sessions: !p.sessions }))}
                  >
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Session Duration</Label>
                        <Select value={String(sessionConfig.duration)} onValueChange={v => setSessionConfig(p => ({ ...p, duration: Number(v) }))}>
                          <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[30, 45, 60, 90, 120].map(d => (
                              <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Buffer Between Sessions</Label>
                        <Select value={String(sessionConfig.buffer)} onValueChange={v => setSessionConfig(p => ({ ...p, buffer: Number(v) }))}>
                          <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[0, 5, 10, 15, 30].map(d => (
                              <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Max Sessions Per Day</Label>
                        <Input type="number" value={sessionConfig.maxPerDay} onChange={e => setSessionConfig(p => ({ ...p, maxPerDay: Number(e.target.value) }))} className="mt-1 text-xs" />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Availability Section */}
                  <CollapsibleSection
                    title="Availability" icon={<Calendar className="h-3.5 w-3.5" />}
                    open={settingsOpen.availability}
                    onToggle={() => setSettingsOpen(p => ({ ...p, availability: !p.availability }))}
                  >
                    <div className="space-y-2">
                      {availability.map(slot => (
                        <div key={slot.id} className="flex items-center gap-2 p-2 rounded-md border border-border">
                          <Switch
                            checked={slot.enabled}
                            onCheckedChange={(checked) => setAvailability(prev => prev.map(s => s.id === slot.id ? { ...s, enabled: checked } : s))}
                          />
                          <span className="flex-1 text-xs font-medium text-foreground capitalize">{slot.day}</span>
                          {slot.enabled && (
                            <>
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={e => setAvailability(prev => prev.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s))}
                                className="w-24 text-xs h-7"
                              />
                              <span className="text-xs text-muted-foreground">-</span>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={e => setAvailability(prev => prev.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s))}
                                className="w-24 text-xs h-7"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>

                  {/* Booking Fields Section */}
                  <CollapsibleSection
                    title="Booking Fields" icon={<Users className="h-3.5 w-3.5" />}
                    open={settingsOpen.booking}
                    onToggle={() => setSettingsOpen(p => ({ ...p, booking: !p.booking }))}
                  >
                    <div className="space-y-2">
                      {bookingFields.map(f => (
                        <div key={f.id} className="flex items-center gap-2 p-2 rounded-md border border-border text-xs">
                          <span className="flex-1 font-medium text-foreground">{f.label}</span>
                          <Badge variant="secondary" className="text-[9px]">{f.required ? "Required" : "Optional"}</Badge>
                          {!["rf_name", "rf_email"].includes(f.id) && (
                            <button onClick={() => setBookingFields(prev => prev.filter(x => x.id !== f.id))} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline" size="sm" className="w-full text-xs gap-1 mt-1"
                        onClick={() => setBookingFields(prev => [...prev, {
                          id: `rf_${Date.now()}`, label: "Custom Field", type: "text", required: false, placeholder: "Enter value",
                        }])}
                      >
                        <Plus className="h-3 w-3" /> Add Field
                      </Button>
                    </div>
                  </CollapsibleSection>
                </div>
              </ScrollArea>
            )}
          </div>

          {/* RIGHT: Live Preview */}
          <div className="flex-1 bg-muted/30 overflow-auto flex justify-center">
            <div className={`my-6 bg-background rounded-xl shadow-lg border border-border overflow-hidden transition-all ${viewMode === "mobile" ? "max-w-sm" : "max-w-3xl w-full"}`}>
              <CoachingLandingPreview
                data={coachingData}
                editable
                onEdit={(field, value) => {
                  if (field === "name") setName(value);
                  else if (field === "tagline") setTagline(value);
                  else if (field === "description") setDescription(value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── CONFIRMATION PHASE ───
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full mx-auto px-6 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Coaching Page Published! 🎉</h1>
          <p className="text-muted-foreground mt-1">{name} is now live and ready for bookings.</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Your coaching page URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-foreground bg-background px-3 py-2 rounded-lg border border-border truncate text-left">
              {fullUrl}
            </code>
            <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("URL copied!"); }}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("Link copied!"); }}>
            <Copy className="h-3.5 w-3.5" /> Copy Link
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Book a coaching session: ${name} — ${fullUrl}`)}`, "_blank")}>
            <Share2 className="h-3.5 w-3.5" /> WhatsApp
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button className="gap-1.5" onClick={() => window.open(`/s/${publishedSlug}`, "_blank")}>
            <ExternalLink className="h-4 w-4" /> View Live Page
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/website-builder/${publishedSiteId}`)}>
            <Settings className="h-4 w-4" /> Manage Coaching
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => window.location.reload()}>
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

export default CoachingCreate;
