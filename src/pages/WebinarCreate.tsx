import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Check, Plus, Trash2, Video, Calendar,
  Clock, Globe, Users, CreditCard, Eye, Sparkles, Link2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { addSite, type SmartPageSite } from "./WebsiteBuilder";
import {
  defaultRegistrationFields, defaultWorkflows,
  type RegistrationField, type EventConfig, type WebinarData,
} from "@/types/smartPages";

const steps = [
  { label: "Basic Details", icon: Sparkles },
  { label: "Schedule & Meeting", icon: Calendar },
  { label: "Registration Form", icon: Users },
  { label: "Preview", icon: Eye },
  { label: "Publish", icon: Check },
];

const timezones = [
  "Asia/Kolkata (IST)",
  "America/New_York (EST)",
  "America/Los_Angeles (PST)",
  "Europe/London (GMT)",
  "Asia/Singapore (SGT)",
  "Australia/Sydney (AEST)",
];

const WebinarCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Basic Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=400&fit=crop");
  const [isPaid, setIsPaid] = useState(false);
  const [amount, setAmount] = useState(999);

  // Step 2: Schedule & Meeting
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    date: "2026-04-15",
    time: "10:00",
    duration: 60,
    timezone: "Asia/Kolkata (IST)",
    platform: "zoom",
    meetingLink: "",
    eventName: "",
  });
  const [connectionMode, setConnectionMode] = useState<"link" | "connect">("link");

  // Step 3: Registration Fields
  const [regFields, setRegFields] = useState<RegistrationField[]>([...defaultRegistrationFields]);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  // Speakers
  const [speakers] = useState([
    { name: "Dr. Arun Kumar", title: "AI Researcher", avatar: "AK", bio: "Leading expert in machine learning with 15+ years of research experience." },
  ]);

  const canProceed = () => {
    if (currentStep === 0) return name.trim().length > 0;
    if (currentStep === 1) return eventConfig.date && eventConfig.time;
    return true;
  };

  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;
    setRegFields([
      ...regFields,
      {
        id: `rf_custom_${Date.now()}`,
        label: newFieldLabel,
        type: "text",
        required: false,
        placeholder: `Enter ${newFieldLabel.toLowerCase()}`,
      },
    ]);
    setNewFieldLabel("");
  };

  const removeField = (id: string) => {
    setRegFields(regFields.filter((f) => f.id !== id));
  };

  const handlePublish = () => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const site: SmartPageSite = {
      id: `sp_${Date.now()}`,
      name,
      type: "Webinar",
      category: "education",
      slug,
      templateId: "webinar",
      url: `/s/${slug}`,
      created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      views: 0,
      conversions: 0,
      status: "Published",
      amount: isPaid ? amount : 0,
      transactions: 0,
      pageType: "webinar",
    };

    // Store webinar-specific data
    const webinarData: WebinarData = {
      name,
      description,
      bannerImage,
      isPaid,
      amount: isPaid ? amount : 0,
      eventConfig: { ...eventConfig, eventName: eventConfig.eventName || name },
      registrationFields: regFields,
      workflows: defaultWorkflows,
      attendees: [],
      speakers,
    };
    localStorage.setItem(`webinar_${site.id}`, JSON.stringify(webinarData));

    addSite(site);
    toast.success("Webinar published successfully!");
    navigate("/website-builder");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/website-builder/create")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-xl font-semibold text-foreground">Create Webinar</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  i === currentStep
                    ? "bg-primary text-primary-foreground"
                    : i < currentStep
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="blade-card p-6">
          {/* ─── Step 1: Basic Details ─── */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Basic Details</h2>
                <p className="text-sm text-muted-foreground">Set up the core information for your webinar.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Webinar Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mastering AI in 2026" className="mt-1.5" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what attendees will learn..." className="mt-1.5" rows={4} />
                </div>
                <div>
                  <Label>Banner Image URL</Label>
                  <Input value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} placeholder="https://..." className="mt-1.5" />
                  {bannerImage && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border h-40">
                      <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Paid Webinar</p>
                    <p className="text-xs text-muted-foreground">Charge attendees for registration</p>
                  </div>
                  <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                </div>
                {isPaid && (
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1.5 max-w-xs" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Step 2: Schedule & Meeting ─── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Schedule & Meeting</h2>
                <p className="text-sm text-muted-foreground">Set the date, time, and meeting platform.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={eventConfig.date} onChange={(e) => setEventConfig({ ...eventConfig, date: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input type="time" value={eventConfig.time} onChange={(e) => setEventConfig({ ...eventConfig, time: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Select value={String(eventConfig.duration)} onValueChange={(v) => setEventConfig({ ...eventConfig, duration: Number(v) })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[30, 45, 60, 90, 120, 180].map((d) => (
                        <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select value={eventConfig.timezone} onValueChange={(v) => setEventConfig({ ...eventConfig, timezone: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Meeting Platform</Label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: "zoom", label: "Zoom", icon: "🎥" },
                    { id: "gmeet", label: "Google Meet", icon: "📹" },
                    { id: "custom", label: "Custom Link", icon: "🔗" },
                  ] as const).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setEventConfig({ ...eventConfig, platform: p.id })}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        eventConfig.platform === p.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <p className="text-sm font-medium text-foreground mt-1">{p.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {eventConfig.platform !== "custom" && (
                <div className="flex gap-3">
                  <Button
                    variant={connectionMode === "connect" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConnectionMode("connect")}
                    className="gap-1.5"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Connect {eventConfig.platform === "zoom" ? "Zoom" : "Google Meet"}
                  </Button>
                  <Button
                    variant={connectionMode === "link" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConnectionMode("link")}
                    className="gap-1.5"
                  >
                    <Globe className="h-3.5 w-3.5" /> Paste Meeting Link
                  </Button>
                </div>
              )}

              {connectionMode === "connect" && eventConfig.platform !== "custom" && (
                <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-center space-y-2">
                  <Video className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-sm font-medium text-foreground">Connect your {eventConfig.platform === "zoom" ? "Zoom" : "Google Meet"} account</p>
                  <p className="text-xs text-muted-foreground">Go to Connectors to set up the integration first.</p>
                  <Button size="sm" variant="outline" onClick={() => navigate("/connectors")} className="gap-1.5">
                    <Link2 className="h-3.5 w-3.5" /> Open Connectors
                  </Button>
                </div>
              )}

              {(connectionMode === "link" || eventConfig.platform === "custom") && (
                <div>
                  <Label>Meeting Link</Label>
                  <Input
                    value={eventConfig.meetingLink}
                    onChange={(e) => setEventConfig({ ...eventConfig, meetingLink: e.target.value })}
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    className="mt-1.5"
                  />
                </div>
              )}

              <div>
                <Label>Event Name (on calendar)</Label>
                <Input
                  value={eventConfig.eventName}
                  onChange={(e) => setEventConfig({ ...eventConfig, eventName: e.target.value })}
                  placeholder={name || "Webinar event name"}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* ─── Step 3: Registration Form ─── */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Registration Form</h2>
                <p className="text-sm text-muted-foreground">Configure what information to collect from registrants.</p>
              </div>

              <div className="space-y-3">
                {regFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{field.label}</p>
                      <p className="text-xs text-muted-foreground">{field.type} • {field.required ? "Required" : "Optional"}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{field.type}</Badge>
                    {!["rf_name", "rf_email"].includes(field.id) && (
                      <Button variant="ghost" size="sm" onClick={() => removeField(field.id)} className="h-7 w-7 p-0">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Add custom field (e.g. Company, Experience Level)"
                  onKeyDown={(e) => e.key === "Enter" && addCustomField()}
                />
                <Button variant="outline" onClick={addCustomField} className="gap-1.5 flex-shrink-0">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          )}

          {/* ─── Step 4: Preview ─── */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Landing Page Preview</h2>
                <p className="text-sm text-muted-foreground">This is what your attendees will see.</p>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                {/* Mock webinar landing page */}
                <div className="relative">
                  <img src={bannerImage} alt="Banner" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-2">{isPaid ? `₹${amount}` : "Free"}</Badge>
                    <h2 className="text-2xl font-bold text-background">{name || "Webinar Name"}</h2>
                    <p className="text-sm text-background/80 mt-1">{description || "Webinar description"}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{eventConfig.date ? new Date(eventConfig.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{eventConfig.time} • {eventConfig.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-primary" />
                      <span className="text-foreground capitalize">{eventConfig.platform}</span>
                    </div>
                  </div>

                  {speakers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Speakers</h3>
                      <div className="flex gap-3">
                        {speakers.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{s.avatar}</div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{s.name}</p>
                              <p className="text-[10px] text-muted-foreground">{s.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Registration Form Preview</h3>
                    {regFields.map((f) => (
                      <div key={f.id}>
                        <Label className="text-xs">{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                        <Input placeholder={f.placeholder} className="mt-1" disabled />
                      </div>
                    ))}
                    <Button className="w-full mt-2" disabled>
                      {isPaid ? `Register & Pay ₹${amount}` : "Register for Free"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 5: Publish ─── */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Review & Publish</h2>
                <p className="text-sm text-muted-foreground">Review your webinar details before publishing.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="blade-card p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Webinar</p>
                  <p className="text-foreground font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">{isPaid ? `₹${amount}` : "Free"}</p>
                </div>
                <div className="blade-card p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Schedule</p>
                  <p className="text-foreground font-semibold">
                    {eventConfig.date ? new Date(eventConfig.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBD"}
                  </p>
                  <p className="text-sm text-muted-foreground">{eventConfig.time} • {eventConfig.duration} min • {eventConfig.platform}</p>
                </div>
                <div className="blade-card p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Registration Fields</p>
                  <p className="text-foreground font-semibold">{regFields.length} fields</p>
                  <p className="text-sm text-muted-foreground">{regFields.filter((f) => f.required).length} required</p>
                </div>
                <div className="blade-card p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">URL</p>
                  <p className="text-foreground font-semibold text-sm font-mono">/s/{name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Ready to publish</p>
                  <p className="text-xs text-muted-foreground">Your webinar landing page will be live immediately after publishing.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} className="gap-1.5">
              <Check className="h-4 w-4" /> Publish Webinar
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WebinarCreate;
