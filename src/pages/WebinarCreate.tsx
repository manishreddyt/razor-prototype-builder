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
  MessageSquare, Settings, ChevronDown, ChevronUp, Bot, FileText,
  Users, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import {
  defaultRegistrationFields, defaultWorkflows, defaultConfirmationConfig,
  type RegistrationField, type EventConfig, type WebinarData, type ConfirmationConfig,
} from "@/types/smartPages";
import WebinarLandingPreview from "@/components/WebinarLandingPreview";
import { useAIPageBuilder, type AIPageUpdates } from "@/hooks/useAIPageBuilder";

type Phase = "chat" | "form" | "builder" | "confirmation";

interface ChatMsg {
  id: string;
  role: "bot" | "user";
  content: string;
  type?: "text" | "platform-select" | "paid-toggle" | "date-time" | "duration" | "reg-fields" | "zoom-setup" | "transition";
  answered?: boolean;
  isNew?: boolean;
}

// Initial welcome message that asks multiple questions at once
const INITIAL_MESSAGE = `👋 Hey! I'll help you set up a **webinar landing page** with registration and payment collection.

🎯 **What you'll get:**
• Professional webinar page with countdown & speakers
• Registration form to collect attendee details
• Payment collection via Razorpay (for paid webinars)
• Zoom / Google Meet integration
• Post-event follow-up workflows

📋 **Let's get started! Please answer these questions:**

1️⃣ **What's your webinar about?**
   (Name and brief description)

2️⃣ **Is it free or paid?**
   (If paid, what's the price in ₹?)

3️⃣ **When is it happening?**
   (Date, time, and duration)

4️⃣ **Which platform?**
   (Zoom, Google Meet, or custom link)

💡 **Tip:** Answer all at once, or one by one - I'll figure it out!

Example: "AI Web Development Workshop, Learn to build with AI tools, Paid ₹1999, March 15 at 6 PM for 60 minutes, Zoom"`;

const timezones = [
  "Asia/Kolkata (IST)", "America/New_York (EST)", "America/Los_Angeles (PST)",
  "Europe/London (GMT)", "Asia/Singapore (SGT)", "Australia/Sydney (AEST)",
];

const WebinarCreate = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasBasicInfo, setHasBasicInfo] = useState(false);

  // Webinar state - Start empty, populate from user input
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage] = useState("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=400&fit=crop");
  const [isPaid, setIsPaid] = useState(false);
  const [amount, setAmount] = useState(0);
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    date: "", time: "", duration: 60, timezone: "Asia/Kolkata (IST)",
    platform: "zoom", meetingLink: "", eventName: "",
  });
  const [zoomConnected, setZoomConnected] = useState(false);
  const [meetingLinkOption, setMeetingLinkOption] = useState<"auto" | "manual">("manual"); // "auto" = connect Zoom, "manual" = enter link
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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(INITIAL_MESSAGE, "text");
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Smart parser to extract webinar details from user input
  const parseUserInput = useCallback((text: string) => {
    const lower = text.toLowerCase();
    let updates: any = {};
    let extractedInfo: string[] = [];

    // Extract name (first substantial part or after keywords)
    const namePatterns = [
      /(?:webinar|workshop|session|class|training|course|event)\s+(?:on|about|for|:|-)?\s*([^,\.]+)/i,
      /(?:name|title|called|it's)\s+(?:is|:|-)?\s*["']?([^"',.]+)["']?/i,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = text.match(pattern);
      if (nameMatch && nameMatch[1].trim()) {
        const extractedName = nameMatch[1].trim();
        if (extractedName.length > 3 && extractedName.length < 100) {
          updates.name = extractedName;
          extractedInfo.push(`✓ Name: ${extractedName}`);
          break;
        }
      }
    }

    // If no name pattern found, try to get first meaningful sentence
    if (!updates.name) {
      const firstSentence = text.split(/[,\.\n]/)[0].trim();
      if (firstSentence.length > 5 && firstSentence.length < 80 && !firstSentence.match(/^(yes|no|paid|free|₹)/i)) {
        updates.name = firstSentence;
        extractedInfo.push(`✓ Name: ${firstSentence}`);
      }
    }

    // Extract description
    const sentences = text.split(/[,\.\n]/).filter(s => s.trim().length > 10);
    if (sentences.length > 1) {
      const desc = sentences.slice(1, 3).join('. ').trim();
      if (desc.length > 10) {
        updates.description = desc;
        extractedInfo.push(`✓ Description: ${desc.substring(0, 50)}...`);
      }
    }

    // Extract price
    if (lower.includes('paid') || lower.match(/₹\s*\d+/)) {
      updates.isPaid = true;
      const priceMatch = text.match(/₹\s*(\d+)/);
      if (priceMatch) {
        updates.amount = parseInt(priceMatch[1]);
        extractedInfo.push(`✓ Price: ₹${priceMatch[1]}`);
      } else {
        extractedInfo.push(`✓ Paid webinar (please specify amount)`);
      }
    } else if (lower.includes('free')) {
      updates.isPaid = false;
      extractedInfo.push(`✓ Free webinar`);
    }

    // Extract date
    const datePatterns = [
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})?/i,
      /(\d{4})-(\d{2})-(\d{2})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/i,
    ];

    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern);
      if (dateMatch) {
        // Simple date extraction - in production, use proper date parsing
        extractedInfo.push(`✓ Date detected (please confirm in form)`);
        break;
      }
    }

    // Extract time
    const timeMatch = text.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm|AM|PM)/);
    if (timeMatch) {
      extractedInfo.push(`✓ Time: ${timeMatch[0]}`);
    }

    // Extract duration
    const durationMatch = text.match(/(\d+)\s*(?:min|minutes|hour|hours|hrs?)/i);
    if (durationMatch) {
      const dur = parseInt(durationMatch[1]);
      updates.duration = dur > 10 ? dur : dur * 60; // Convert hours to minutes
      extractedInfo.push(`✓ Duration: ${updates.duration} min`);
    }

    // Extract platform
    if (lower.includes('zoom')) {
      updates.platform = 'zoom';
      extractedInfo.push(`✓ Platform: Zoom`);
    } else if (lower.includes('google meet') || lower.includes('gmeet') || lower.includes('meet')) {
      updates.platform = 'gmeet';
      extractedInfo.push(`✓ Platform: Google Meet`);
    }

    return { updates, extractedInfo };
  }, []);

  const handleUserResponse = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
    }]);
    setChatInput("");

    // Parse the input
    const { updates, extractedInfo } = parseUserInput(text);

    // Apply updates
    if (updates.name) setName(updates.name);
    if (updates.description) setDescription(updates.description);
    if (updates.isPaid !== undefined) setIsPaid(updates.isPaid);
    if (updates.amount) setAmount(updates.amount);
    if (updates.platform) setEventConfig(prev => ({ ...prev, platform: updates.platform }));
    if (updates.duration) setEventConfig(prev => ({ ...prev, duration: updates.duration }));

    // Generate response
    setIsTyping(true);
    setTimeout(() => {
      let response = "";
      let needsMore = [];

      if (extractedInfo.length > 0) {
        response = "Great! I've captured:\n\n" + extractedInfo.join('\n');

        // Check what's missing
        if (!name && !updates.name) needsMore.push("webinar name");
        if (!isPaid && updates.isPaid === undefined) needsMore.push("pricing (free/paid)");
        if (!eventConfig.platform && !updates.platform) needsMore.push("platform (Zoom/Google Meet)");

        if (needsMore.length > 0) {
          response += "\n\n📝 **Still need:**\n• " + needsMore.join('\n• ');
          response += "\n\nJust reply with the missing info, or click **Switch to Form** to fill it manually!";
        } else {
          response += "\n\n✨ **Perfect! I have enough to create your webinar page.**\n\nClick **Continue to Builder** below, or provide more details (description, date/time, etc.)";
          setHasBasicInfo(true);
        }
      } else {
        response = "I didn't catch that. Could you share:\n• **Webinar name**\n• **Free or Paid** (with price if paid)\n• **Platform** (Zoom or Google Meet)\n\nExample: \"AI Workshop, Paid ₹1999, Zoom\"";
      }

      setMessages((prev) => [...prev, {
        id: `msg_${Date.now()}`,
        role: "bot",
        content: response,
      }]);
      setIsTyping(false);
    }, 800);
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

    // Generate Zoom link if Zoom is connected
    let finalEventConfig = { ...eventConfig };
    if (zoomConnected && eventConfig.platform === "zoom" && !eventConfig.meetingLink) {
      const meetingId = Math.floor(100000000000 + Math.random() * 900000000000);
      const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();
      finalEventConfig.meetingLink = `https://zoom.us/j/${meetingId}?pwd=${passcode}`;
      setEventConfig(finalEventConfig);
      toast.success("Zoom meeting link created automatically!");
    }

    const site: SmartPageSite = {
      id: `sp_${Date.now()}`, name, type: "Webinar", category: "education",
      slug, templateId: "webinar", url: `/s/${slug}`,
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 0, conversions: 0, status: "Published",
      amount: isPaid ? amount : 0, transactions: 0, pageType: "webinar",
    };

    const webinarDataToSave: WebinarData = {
      name, description, bannerImage, isPaid, amount: isPaid ? amount : 0,
      eventConfig: { ...finalEventConfig, eventName: finalEventConfig.eventName || name },
      registrationFields: regFields, workflows: defaultWorkflows,
      attendees: [], speakers, confirmation: confirmationConfig,
    };

    localStorage.setItem(`webinar_${site.id}`, JSON.stringify(webinarDataToSave));
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

  // ─── PHASE 1: Form View ───
  if (phase === "form") {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-background border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setPhase("chat")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Chat
            </Button>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">Webinar Details</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => {
              if (!name.trim()) {
                toast.error("Please enter webinar name");
                return;
              }
              setEventConfig(prev => ({ ...prev, eventName: name }));
              setPhase("builder");
            }} className="gap-1.5">
              Continue to Builder <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-8">
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Basic Details</h3>
                </div>

                <div>
                  <Label>Webinar Name *</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Master AI-Powered Web Development"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What will attendees learn in this webinar?"
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Button
                        variant={isPaid ? "outline" : "default"}
                        size="sm"
                        onClick={() => setIsPaid(false)}
                        className="flex-1"
                      >
                        Free
                      </Button>
                      <Button
                        variant={isPaid ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsPaid(true)}
                        className="flex-1"
                      >
                        Paid
                      </Button>
                    </div>
                  </div>

                  {isPaid && (
                    <div>
                      <Label>Amount (₹) *</Label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        placeholder="999"
                        className="mt-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Schedule & Platform</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={eventConfig.date}
                      onChange={e => setEventConfig(p => ({ ...p, date: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Time *</Label>
                    <Input
                      type="time"
                      value={eventConfig.time}
                      onChange={e => setEventConfig(p => ({ ...p, time: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration</Label>
                    <Select value={String(eventConfig.duration)} onValueChange={v => setEventConfig(p => ({ ...p, duration: Number(v) }))}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[30, 45, 60, 90, 120, 180].map(d => (
                          <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Timezone</Label>
                    <Select value={eventConfig.timezone} onValueChange={v => setEventConfig(p => ({ ...p, timezone: v }))}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Platform *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {(["zoom", "gmeet", "custom"] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setEventConfig(prev => ({ ...prev, platform: p }))}
                        className={`p-3 rounded-lg border text-center text-sm font-medium transition-all ${
                          eventConfig.platform === p
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {p === "zoom" ? "Zoom" : p === "gmeet" ? "Google Meet" : "Custom Link"}
                      </button>
                    ))}
                  </div>
                </div>

                {eventConfig.platform === "zoom" && (
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Zoom Integration</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Auto-create meeting links</p>
                      </div>
                      <Switch checked={zoomConnected} onCheckedChange={checked => {
                        setZoomConnected(checked);
                        setMeetingLinkOption(checked ? "auto" : "manual");
                      }} />
                    </div>

                    {!zoomConnected && (
                      <div>
                        <Label className="text-sm">Zoom Meeting Link</Label>
                        <Input
                          value={eventConfig.meetingLink}
                          onChange={e => setEventConfig(p => ({ ...p, meetingLink: e.target.value }))}
                          placeholder="https://zoom.us/j/..."
                          className="mt-1.5"
                        />
                      </div>
                    )}
                  </div>
                )}

                {eventConfig.platform === "gmeet" && (
                  <div>
                    <Label>Google Meet Link</Label>
                    <Input
                      value={eventConfig.meetingLink}
                      onChange={e => setEventConfig(p => ({ ...p, meetingLink: e.target.value }))}
                      placeholder="https://meet.google.com/..."
                      className="mt-1.5"
                    />
                  </div>
                )}

                {eventConfig.platform === "custom" && (
                  <div>
                    <Label>Meeting Link</Label>
                    <Input
                      value={eventConfig.meetingLink}
                      onChange={e => setEventConfig(p => ({ ...p, meetingLink: e.target.value }))}
                      placeholder="https://..."
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>

              {/* Registration Fields */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Registration Fields</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setRegFields(prev => [...prev, {
                      id: `rf_${Date.now()}`, label: "Custom Field", type: "text", required: false, placeholder: "Enter value",
                    }])}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Field
                  </Button>
                </div>

                <div className="space-y-2">
                  {regFields.map(f => (
                    <div key={f.id} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-background">
                      <span className="flex-1 text-sm font-medium">{f.label}</span>
                      <Badge variant="secondary" className="text-xs">{f.required ? "Required" : "Optional"}</Badge>
                      {!["rf_name", "rf_email"].includes(f.id) && (
                        <button onClick={() => setRegFields(prev => prev.filter(x => x.id !== f.id))} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setPhase("method-select")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Change Method
                </Button>
                <Button onClick={() => {
                  if (!name.trim()) {
                    toast.error("Please enter webinar name");
                    return;
                  }
                  if (!description.trim()) {
                    toast.error("Please enter description");
                    return;
                  }
                  setEventConfig(prev => ({ ...prev, eventName: name }));
                  setPhase("builder");
                }} className="gap-2">
                  Continue to Builder <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ─── PHASE 2: Chat Flow ───
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
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">AI Webinar Setup</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPhase("form")} className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Switch to Form
            </Button>
            {hasBasicInfo && (
              <Button size="sm" onClick={() => {
                if (!name.trim()) {
                  toast.error("Please provide webinar name first");
                  return;
                }
                setEventConfig(prev => ({ ...prev, eventName: name }));
                setPhase("builder");
              }} className="gap-1.5">
                Continue to Builder <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
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

        {/* Input bar — always visible */}
        <div className="px-4 pb-5 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 items-center bg-card border border-border/80 rounded-2xl px-4 py-2 shadow-lg shadow-black/5 focus-within:border-primary/40 focus-within:shadow-primary/5 transition-all duration-200">
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
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
                autoFocus
                disabled={isTyping}
              />
              <Button
                onClick={() => handleUserResponse(chatInput)}
                size="icon"
                className="rounded-xl h-9 w-9 flex-shrink-0 shadow-md"
                disabled={!chatInput.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE 3: Builder ───
  if (phase === "builder") {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPhase("method-select")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
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
                        <Label className="text-xs">Timezone</Label>
                        <Select value={eventConfig.timezone} onValueChange={v => setEventConfig(p => ({ ...p, timezone: v }))}>
                          <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {timezones.map(tz => (
                              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
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

                      {/* Zoom-specific options */}
                      {eventConfig.platform === "zoom" && (
                        <div className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border/60">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-xs font-medium">Zoom Integration</Label>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Auto-create meeting links</p>
                            </div>
                            <Switch checked={zoomConnected} onCheckedChange={(checked) => {
                              setZoomConnected(checked);
                              setMeetingLinkOption(checked ? "auto" : "manual");
                            }} />
                          </div>

                          {zoomConnected ? (
                            <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                              <div className="flex items-center gap-2 text-xs">
                                <Check className="h-3 w-3 text-primary" />
                                <span className="text-primary font-medium">Zoom Connected</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">Meeting link will be auto-generated on publish</p>
                            </div>
                          ) : (
                            <div>
                              <Label className="text-xs">Zoom Meeting Link</Label>
                              <Input
                                value={eventConfig.meetingLink}
                                onChange={e => setEventConfig(p => ({ ...p, meetingLink: e.target.value }))}
                                placeholder="https://zoom.us/j/..."
                                className="mt-1 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Google Meet options */}
                      {eventConfig.platform === "gmeet" && (
                        <div>
                          <Label className="text-xs">Google Meet Link</Label>
                          <Input
                            value={eventConfig.meetingLink}
                            onChange={e => setEventConfig(p => ({ ...p, meetingLink: e.target.value }))}
                            placeholder="https://meet.google.com/..."
                            className="mt-1 text-xs"
                          />
                        </div>
                      )}

                      {/* Custom platform */}
                      {eventConfig.platform === "custom" && (
                        <div>
                          <Label className="text-xs">Meeting Link</Label>
                          <Input
                            value={eventConfig.meetingLink}
                            onChange={e => setEventConfig(p => ({ ...p, meetingLink: e.target.value }))}
                            placeholder="https://..."
                            className="mt-1 text-xs"
                          />
                        </div>
                      )}
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

  // ─── PHASE 4: Confirmation ───
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
          {zoomConnected && (
            <Badge variant="secondary" className="mt-2 gap-1.5">
              <Video className="h-3 w-3" />
              Zoom Meeting Auto-Created
            </Badge>
          )}
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
          <Button variant="outline" className="gap-1.5" onClick={() => navigate("/website-builder/editor?template=webinar&title=Webinar&type=Webinar")}>
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

export default WebinarCreate;
