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
  MessageSquare, Settings, ChevronDown, ChevronUp, Users,
} from "lucide-react";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import {
  defaultRegistrationFields,
  type RegistrationField,
} from "@/types/smartPages";
import CoachingLandingPreview from "@/components/CoachingLandingPreview";

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

const CoachingCreate = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "msg_welcome",
      role: "bot",
      content: "👋 Hi! I'm your AI assistant. I've created a coaching page template for you. **Tell me what you'd like to change** — for example: \"Change the title to Career Coaching\" or \"Make it a free session\" or \"Add weekend availability\".",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Coaching state with sensible defaults
  const [name, setName] = useState("Education Consultant - Study Abroad Guidance");
  const [tagline, setTagline] = useState("Overcome admission challenges and find your dream university");
  const [description, setDescription] = useState("Expert guidance to help you navigate the complex world of international education. From university selection to visa assistance, we're with you every step of the way.");
  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=400&fit=crop");
  const [isPaid, setIsPaid] = useState(true);
  const [amount, setAmount] = useState(2999);
  const [pricingModel, setPricingModel] = useState<"per-session" | "package">("per-session");
  const [packageSessions, setPackageSessions] = useState(5);
  const [packageAmount, setPackageAmount] = useState(12999);
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
    name: "Your Name",
    title: "Education Consultant",
    avatar: "YN",
    bio: "Helping professionals achieve their goals through personalized coaching.",
    credentials: ["ICF Certified", "10+ years experience"],
  });

  // UI state
  const [builderTab, setBuilderTab] = useState<"chat" | "settings">("chat");
  const [settingsOpen, setSettingsOpen] = useState<Record<string, boolean>>({
    details: true,
    pricing: false,
    sessions: false,
    availability: false,
    booking: false,
  });

  // Confirmation state
  const [phase, setPhase] = useState<"builder" | "confirmation">("builder");
  const [publishedSlug, setPublishedSlug] = useState("");
  const [publishedSiteId, setPublishedSiteId] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

  // AI Chat handler - interprets natural language and updates coaching data
  const handleBuilderChat = (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "user", content: text }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let response = "";
      let updated = false;

      // Title/Name changes
      if (lower.includes("title") || lower.includes("name") || lower.includes("call it") || lower.includes("rename")) {
        const match = text.match(/(?:title|name|call it|rename)(?:\s+to|\s+as|\s+is)?\s+["']?([^"'\n]+?)["']?$/i) ||
                     text.match(/["']([^"']+)["']/);
        if (match) {
          setName(match[1].trim());
          response = `✅ Updated the coaching service name to "${match[1].trim()}".`;
          updated = true;
        }
      }

      // Tagline changes
      else if (lower.includes("tagline") || lower.includes("subtitle")) {
        const match = text.match(/(?:tagline|subtitle)(?:\s+to|\s+as|\s+is)?\s+["']?([^"'\n]+?)["']?$/i) ||
                     text.match(/["']([^"']+)["']/);
        if (match) {
          setTagline(match[1].trim());
          response = `✅ Updated the tagline to "${match[1].trim()}".`;
          updated = true;
        }
      }

      // Description changes
      else if (lower.includes("description") || lower.includes("about")) {
        const match = text.match(/(?:description|about)(?:\s+to|\s+as|\s+is)?\s+["']?([^"'\n]+?)["']?$/i) ||
                     text.match(/["']([^"']+)["']/);
        if (match) {
          setDescription(match[1].trim());
          response = `✅ Updated the description.`;
          updated = true;
        }
      }

      // Banner/Image changes
      else if (lower.includes("banner") || lower.includes("image") || lower.includes("photo")) {
        if (lower.includes("education") || lower.includes("study")) {
          setBannerImage("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&h=400&fit=crop");
          response = "✅ Changed banner to an education-themed image.";
        } else if (lower.includes("business") || lower.includes("career")) {
          setBannerImage("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&h=400&fit=crop");
          response = "✅ Changed banner to a business/career theme.";
        } else if (lower.includes("coaching") || lower.includes("consultation")) {
          setBannerImage("https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=400&fit=crop");
          response = "✅ Changed banner to a coaching consultation theme.";
        } else {
          response = "📷 To change the banner, try: \"Use an education banner\" or \"Use a career coaching image\".";
        }
        updated = true;
      }

      // Pricing changes
      else if (lower.includes("free") || (lower.includes("make it") && lower.includes("free"))) {
        setIsPaid(false);
        response = "✅ Changed to **free coaching** — removed payment requirement.";
        updated = true;
      }
      else if (lower.includes("paid") || lower.includes("charge")) {
        setIsPaid(true);
        const priceMatch = text.match(/₹?\s*(\d+)/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1]);
          setAmount(price);
          response = `✅ Changed to **paid coaching** at ₹${price.toLocaleString()} per session.`;
        } else {
          response = `✅ Changed to **paid coaching** — set to ₹${amount.toLocaleString()} per session.`;
        }
        updated = true;
      }
      else if (lower.includes("price") || lower.includes("amount") || lower.includes("cost")) {
        const priceMatch = text.match(/₹?\s*(\d+)/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1]);
          setAmount(price);
          response = `✅ Updated pricing to ₹${price.toLocaleString()} per session.`;
          updated = true;
        }
      }

      // Package pricing
      else if (lower.includes("package") || (lower.includes("session") && lower.includes("bundle"))) {
        setPricingModel("package");
        const numMatch = text.match(/(\d+)\s*session/i);
        const priceMatch = text.match(/₹?\s*(\d+)/);
        if (numMatch) setPackageSessions(parseInt(numMatch[1]));
        if (priceMatch) setPackageAmount(parseInt(priceMatch[1]));
        response = `✅ Switched to package pricing — ${packageSessions} sessions for ₹${packageAmount.toLocaleString()}.`;
        updated = true;
      }
      else if (lower.includes("per session") || lower.includes("per-session") || lower.includes("single session")) {
        setPricingModel("per-session");
        response = `✅ Switched to per-session pricing at ₹${amount.toLocaleString()}.`;
        updated = true;
      }

      // Session duration
      else if (lower.includes("duration") || (lower.includes("minute") && lower.includes("session"))) {
        const durationMatch = text.match(/(\d+)\s*(?:min|minute)/i);
        if (durationMatch) {
          const duration = parseInt(durationMatch[1]);
          setSessionConfig(prev => ({ ...prev, duration }));
          response = `✅ Updated session duration to ${duration} minutes.`;
          updated = true;
        }
      }

      // Availability changes
      else if (lower.includes("weekend") || lower.includes("saturday") || lower.includes("sunday")) {
        if (lower.includes("add") || lower.includes("enable") || lower.includes("available")) {
          setAvailability(prev => prev.map(slot =>
            slot.day === "saturday" || slot.day === "sunday"
              ? { ...slot, enabled: true }
              : slot
          ));
          response = "✅ Added weekend availability (Saturday & Sunday).";
          updated = true;
        } else if (lower.includes("remove") || lower.includes("disable")) {
          setAvailability(prev => prev.map(slot =>
            slot.day === "saturday" || slot.day === "sunday"
              ? { ...slot, enabled: false }
              : slot
          ));
          response = "✅ Removed weekend availability.";
          updated = true;
        }
      }

      // Coach name
      else if (lower.includes("coach name") || lower.includes("instructor name")) {
        const match = text.match(/(?:coach|instructor)\s+name(?:\s+to|\s+as|\s+is)?\s+["']?([^"'\n]+?)["']?$/i) ||
                     text.match(/["']([^"']+)["']/);
        if (match) {
          const coachName = match[1].trim();
          setCoach(prev => ({
            ...prev,
            name: coachName,
            avatar: coachName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
          }));
          response = `✅ Updated coach name to "${coachName}".`;
          updated = true;
        }
      }

      // Default fallback
      if (!updated) {
        response = `Got it! **"${text}"** — I can help you with:\n\n• Title: "Change title to X"\n• Banner: "Use a career coaching banner"\n• Pricing: "Make it free" or "Charge ₹4999"\n• Duration: "60 minute sessions"\n• Availability: "Add weekend slots"\n• Coach: "Coach name is John Doe"\n\nYou can also use the **Settings** tab for detailed edits.`;
      }

      setMessages(prev => [...prev, { id: `msg_${Date.now()}`, role: "bot", content: response }]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
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
          <div className="flex-1 bg-muted/30 overflow-auto">
            <div className="max-w-3xl mx-auto my-6 bg-background rounded-xl shadow-lg border border-border overflow-hidden">
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
