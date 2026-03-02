import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Video, Users, Shield, Award, ArrowLeft, CheckCircle2, Mail, Phone } from "lucide-react";
import type { WebinarData, ConfirmationConfig } from "@/types/smartPages";
import { defaultConfirmationConfig } from "@/types/smartPages";
import { toast } from "sonner";

interface WebinarLandingPreviewProps {
  data: WebinarData;
  interactive?: boolean;
  onRegister?: (fields: Record<string, string>) => void;
}

interface FormErrors {
  [key: string]: string;
}

const WebinarLandingPreview = ({ data, interactive = false, onRegister }: WebinarLandingPreviewProps) => {
  const { name, description, bannerImage, isPaid, amount, eventConfig, registrationFields, speakers } = data;
  const confirmation: ConfirmationConfig = data.confirmation || defaultConfirmationConfig;

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [view, setView] = useState<"landing" | "confirmation">("landing");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventDate = eventConfig.date
    ? new Date(eventConfig.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Date TBD";

  const formatTime = (time: string) => {
    if (!time) return "Time TBD";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const getCountdown = () => {
    if (!eventConfig.date) return null;
    const target = new Date(`${eventConfig.date}T${eventConfig.time || "00:00"}`);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return { days, hours, mins };
  };

  const countdown = getCountdown();

  // Validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    registrationFields.forEach((f) => {
      const val = (formValues[f.id] || "").trim();
      if (f.required && !val) {
        errors[f.id] = `${f.label} is required`;
      } else if (f.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors[f.id] = "Enter a valid email address";
      } else if (f.type === "phone" && val && !/^\+?[\d\s-]{7,15}$/.test(val)) {
        errors[f.id] = "Enter a valid phone number";
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (formErrors[fieldId]) {
      setFormErrors((prev) => { const n = { ...prev }; delete n[fieldId]; return n; });
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (isPaid && amount > 0) {
      triggerPayment();
    } else {
      completeRegistration();
    }
  };

  const triggerPayment = () => {
    setIsSubmitting(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: "rzp_live_SFFFdBjmPbTKZL",
        amount: (amount || 0) * 100,
        currency: "INR",
        name: name || "Webinar",
        description: `Registration for ${name || "Webinar"}`,
        image: bannerImage || "",
        handler: () => {
          completeRegistration();
        },
        prefill: {
          name: formValues["rf_name"] || "",
          email: formValues["rf_email"] || "",
          contact: formValues["rf_phone"] || "",
        },
        theme: { color: "#528FF0" },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => {
      toast.error("Failed to load payment gateway. Please try again.");
      setIsSubmitting(false);
    };
    document.body.appendChild(script);
  };

  const completeRegistration = () => {
    setIsSubmitting(false);
    onRegister?.(formValues);
    toast.success("Registration successful!");
    setView("confirmation");
  };

  // ─── Confirmation Screen ───
  if (view === "confirmation") {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-6 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{confirmation.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{confirmation.message}</p>

          {confirmation.showEventDetails && (
            <div className="bg-secondary/50 border border-border rounded-xl p-5 text-left space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Event Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{formatTime(eventConfig.time)} · {eventConfig.duration} min</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="capitalize">{eventConfig.platform}</span>
                  <span className="text-xs text-muted-foreground">— link sent via email</span>
                </div>
              </div>
            </div>
          )}

          {formValues["rf_email"] && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>Confirmation sent to <strong className="text-foreground">{formValues["rf_email"]}</strong></span>
            </div>
          )}

          {confirmation.showCalendarLink && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (confirmation.ctaUrl) {
                  window.open(confirmation.ctaUrl, "_blank");
                } else {
                  toast.info("Calendar link will be available soon.");
                }
              }}
            >
              <Calendar className="h-4 w-4" />
              {confirmation.ctaText}
            </Button>
          )}

          {isPaid && (
            <p className="text-xs text-muted-foreground">Payment of ₹{amount?.toLocaleString()} received. Receipt sent to your email.</p>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Powered by Razorpay Smart Pages</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Landing Page ───
  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-[340px] relative overflow-hidden">
          <img
            src={bannerImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=400&fit=crop"}
            alt={name || "Webinar"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">
                {isPaid ? `₹${amount?.toLocaleString()}` : "Free"}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white/90 text-xs">
                <Video className="h-3 w-3 mr-1" />
                {eventConfig.platform === "zoom" ? "Zoom" : eventConfig.platform === "gmeet" ? "Google Meet" : "Online"}
              </Badge>
              {eventConfig.duration && (
                <Badge variant="outline" className="border-white/30 text-white/90 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {eventConfig.duration} min
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{name || "Untitled Webinar"}</h1>
            <p className="text-white/80 text-base max-w-xl">{description || "Join us for this exciting webinar."}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Countdown */}
        {countdown && (
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {[
              { val: countdown.days, label: "Days" },
              { val: countdown.hours, label: "Hours" },
              { val: countdown.mins, label: "Minutes" },
            ].map((c) => (
              <div key={c.label} className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-2xl font-bold text-primary">{c.val}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Event Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Date</p>
              <p className="text-sm font-semibold text-foreground">{eventDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Time</p>
              <p className="text-sm font-semibold text-foreground">
                {formatTime(eventConfig.time)} · {eventConfig.duration} min
              </p>
              <p className="text-[10px] text-muted-foreground">{eventConfig.timezone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
            <Video className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Platform</p>
              <p className="text-sm font-semibold text-foreground capitalize">{eventConfig.platform}</p>
              <p className="text-[10px] text-muted-foreground">Link shared on registration</p>
            </div>
          </div>
        </div>

        {/* About */}
        {description && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">About this Webinar</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        )}

        {/* What You'll Learn */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What You'll Learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "Industry-leading strategies and frameworks",
              "Hands-on practical techniques",
              "Real-world case studies and examples",
              "Q&A with industry experts",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/30">
                <span className="text-primary text-sm mt-0.5">✓</span>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Speakers */}
        {speakers && speakers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Speakers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {speakers.map((s, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.avatar || s.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-primary">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.02] p-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              {isPaid ? "Register & Pay" : "Register for Free"}
            </h2>
            <p className="text-sm text-muted-foreground">Secure your spot now. Limited seats available.</p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            {registrationFields.map((f) => (
              <div key={f.id}>
                <Label className="text-xs font-medium">
                  {f.label} {f.required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                  placeholder={f.placeholder}
                  className={`mt-1 ${formErrors[f.id] ? "border-destructive" : ""}`}
                  value={formValues[f.id] || ""}
                  onChange={(e) => handleFieldChange(f.id, e.target.value)}
                  disabled={!interactive}
                />
                {formErrors[f.id] && (
                  <p className="text-xs text-destructive mt-1">{formErrors[f.id]}</p>
                )}
              </div>
            ))}
            <Button
              className="w-full py-5 text-base font-semibold rounded-xl shadow-lg shadow-primary/20"
              disabled={!interactive || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Processing..."
                : isPaid
                  ? `Register & Pay ₹${amount?.toLocaleString()}`
                  : "Register for Free →"}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
            <span className="flex items-center gap-1"><Award className="h-3 w-3" /> Certificate</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Limited seats</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Powered by Razorpay Smart Pages</p>
        </div>
      </div>
    </div>
  );
};

export default WebinarLandingPreview;
