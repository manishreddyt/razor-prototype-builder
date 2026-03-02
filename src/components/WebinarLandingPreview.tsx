import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Video, Users, Shield, Award, CheckCircle2, Mail, ArrowRight, Play, Star, Globe } from "lucide-react";
import type { WebinarData, ConfirmationConfig } from "@/types/smartPages";
import { defaultConfirmationConfig } from "@/types/smartPages";
import InlineEditable from "@/components/InlineEditable";
import { toast } from "sonner";

interface WebinarLandingPreviewProps {
  data: WebinarData;
  interactive?: boolean;
  editable?: boolean;
  onEdit?: (field: string, value: string) => void;
  onRegister?: (fields: Record<string, string>) => void;
}

interface FormErrors { [key: string]: string; }

const WebinarLandingPreview = ({ data, interactive = false, editable = false, onEdit, onRegister }: WebinarLandingPreviewProps) => {
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
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins: Math.floor((diff / (1000 * 60)) % 60),
    };
  };

  const countdown = getCountdown();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    registrationFields.forEach((f) => {
      const val = (formValues[f.id] || "").trim();
      if (f.required && !val) errors[f.id] = `${f.label} is required`;
      else if (f.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors[f.id] = "Enter a valid email";
      else if (f.type === "phone" && val && !/^\+?[\d\s-]{7,15}$/.test(val)) errors[f.id] = "Enter a valid phone";
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (formErrors[fieldId]) setFormErrors((prev) => { const n = { ...prev }; delete n[fieldId]; return n; });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (isPaid && amount > 0) { triggerPayment(); } else { completeRegistration(); }
  };

  const triggerPayment = () => {
    setIsSubmitting(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: "rzp_live_SFFFdBjmPbTKZL", amount: (amount || 0) * 100, currency: "INR",
        name: name || "Webinar", description: `Registration for ${name}`,
        handler: () => completeRegistration(),
        prefill: { name: formValues["rf_name"] || "", email: formValues["rf_email"] || "", contact: formValues["rf_phone"] || "" },
        theme: { color: "#7c3aed" },
        modal: { ondismiss: () => setIsSubmitting(false) },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => { toast.error("Failed to load payment gateway."); setIsSubmitting(false); };
    document.body.appendChild(script);
  };

  const completeRegistration = () => {
    setIsSubmitting(false);
    onRegister?.(formValues);
    toast.success("Registration successful!");
    setView("confirmation");
  };

  // ─── Confirmation ───
  if (view === "confirmation") {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)" }}>
        <div className="max-w-lg mx-auto px-6 py-16 text-center space-y-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: "#dcfce7" }}>
            <CheckCircle2 className="h-10 w-10" style={{ color: "#16a34a" }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#0f172a" }}>{confirmation.title}</h1>
          <p className="leading-relaxed" style={{ color: "#64748b" }}>{confirmation.message}</p>
          {confirmation.showEventDetails && (
            <div className="rounded-xl p-6 text-left space-y-3" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <h3 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Event Details</h3>
              <div className="space-y-2 text-sm" style={{ color: "#475569" }}>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" style={{ color: "#7c3aed" }} /> {eventDate}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" style={{ color: "#7c3aed" }} /> {formatTime(eventConfig.time)} · {eventConfig.duration} min</div>
                <div className="flex items-center gap-2"><Video className="h-4 w-4" style={{ color: "#7c3aed" }} /> <span className="capitalize">{eventConfig.platform}</span></div>
              </div>
            </div>
          )}
          {formValues["rf_email"] && (
            <p className="text-sm" style={{ color: "#64748b" }}>
              <Mail className="h-4 w-4 inline mr-1" /> Confirmation sent to <strong style={{ color: "#0f172a" }}>{formValues["rf_email"]}</strong>
            </p>
          )}
          {confirmation.showCalendarLink && (
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => {
              if (confirmation.ctaUrl) window.open(confirmation.ctaUrl, "_blank");
              else toast.info("Calendar link coming soon.");
            }}>
              <Calendar className="h-4 w-4" /> {confirmation.ctaText}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── Landing Page ───
  return (
    <div className="min-h-full" style={{ background: "#fff" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#7c3aed" }}>
              <Video className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: "#0f172a" }}>WebinarPro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#64748b" }}>
            <a href="#about" className="hover:text-[#7c3aed] transition-colors">About</a>
            <a href="#speakers" className="hover:text-[#7c3aed] transition-colors">Speakers</a>
            <a href="#register" className="hover:text-[#7c3aed] transition-colors">Register</a>
          </div>
          <Button size="sm" style={{ background: "#7c3aed" }} onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}>
            {isPaid ? `Register — ₹${amount?.toLocaleString()}` : "Register Free"}
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(167,139,250,0.2)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.3)" }}>
                  🔴 LIVE WEBINAR
                </Badge>
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(34,211,238,0.15)", color: "#67e8f9", border: "1px solid rgba(34,211,238,0.3)" }}>
                  {isPaid ? `₹${amount?.toLocaleString()}` : "FREE"}
                </Badge>
              </div>

              <InlineEditable value={name || "Untitled Webinar"} field="name" editable={editable} onEdit={onEdit} as="h1"
                className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white" />

              <InlineEditable value={description || "Join us for this exciting webinar."} field="description" editable={editable} onEdit={onEdit} as="p"
                className="text-xl leading-relaxed" style={{ color: "#c4b5fd" }} multiline />

              <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: "#a5b4fc" }}>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {eventDate}</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {formatTime(eventConfig.time)} · {eventConfig.duration} min</span>
                <span className="flex items-center gap-2"><Video className="h-4 w-4" /> <span className="capitalize">{eventConfig.platform}</span></span>
              </div>

              <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl shadow-xl"
                style={{ background: "#7c3aed" }}
                onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}>
                Register Now <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={bannerImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=500&fit=crop"} alt={name} className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer rounded-2xl">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl" style={{ background: "rgba(255,255,255,0.95)" }}>
                    <Play className="h-8 w-8 ml-1" style={{ color: "#7c3aed" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown */}
      {countdown && (
        <section className="py-10" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div className="max-w-md mx-auto">
            <p className="text-center text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "#7c3aed" }}>Starts In</p>
            <div className="grid grid-cols-3 gap-4">
              {[{ val: countdown.days, label: "Days" }, { val: countdown.hours, label: "Hours" }, { val: countdown.mins, label: "Minutes" }].map(c => (
                <div key={c.label} className="text-center p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                  <p className="text-4xl font-extrabold" style={{ color: "#7c3aed" }}>{c.val}</p>
                  <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: "#94a3b8" }}>{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What You'll Learn */}
      <section id="about" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#ede9fe", color: "#7c3aed" }}>WHAT YOU'LL LEARN</Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Key Takeaways</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Industry-leading strategies", desc: "Learn proven frameworks used by top companies", icon: "🎯" },
              { title: "Hands-on techniques", desc: "Practical methods you can apply immediately", icon: "🛠️" },
              { title: "Real-world case studies", desc: "Deep-dive analysis of successful implementations", icon: "📊" },
              { title: "Live Q&A with experts", desc: "Get your questions answered in real-time", icon: "💬" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ border: "1px solid #e2e8f0", background: "#fff" }}>
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-semibold" style={{ color: "#0f172a" }}>{item.title}</h3>
                  <p className="text-sm mt-1" style={{ color: "#64748b" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers */}
      {speakers && speakers.length > 0 && (
        <section id="speakers" className="py-24" style={{ background: "#f8fafc" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#fef3c7", color: "#b45309" }}>SPEAKERS</Badge>
              <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Meet the Experts</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {speakers.map((s, i) => (
                <div key={i} className="rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl"
                  style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                  <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white mb-5"
                    style={{ background: `linear-gradient(135deg, hsl(${260 + i * 30}, 70%, 55%) 0%, hsl(${280 + i * 30}, 70%, 45%) 100%)` }}>
                    {s.avatar || s.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#0f172a" }}>{s.name}</h3>
                  <p className="text-sm font-medium mt-1" style={{ color: "#7c3aed" }}>{s.title}</p>
                  <p className="text-sm mt-3" style={{ color: "#64748b" }}>{s.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration Form */}
      <section id="register" className="py-24" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)" }}>
        <div className="max-w-xl mx-auto px-6">
          <div className="rounded-2xl shadow-2xl p-10" style={{ background: "#fff" }}>
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-bold" style={{ color: "#0f172a" }}>
                {isPaid ? "Register & Pay" : "Register for Free"}
              </h2>
              <p className="text-sm" style={{ color: "#64748b" }}>Secure your spot now. Limited seats available.</p>
              {isPaid && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span className="text-2xl font-bold" style={{ color: "#7c3aed" }}>₹{amount?.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {registrationFields.map((f) => (
                <div key={f.id}>
                  <Label className="text-sm font-medium" style={{ color: "#374151" }}>
                    {f.label} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                  </Label>
                  <Input type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                    placeholder={f.placeholder}
                    className={`mt-1.5 ${formErrors[f.id] ? "border-red-400" : ""}`}
                    value={formValues[f.id] || ""}
                    onChange={(e) => handleFieldChange(f.id, e.target.value)}
                    disabled={!interactive} />
                  {formErrors[f.id] && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{formErrors[f.id]}</p>}
                </div>
              ))}
              <Button className="w-full py-6 text-base font-semibold rounded-xl shadow-lg mt-2"
                style={{ background: "#7c3aed" }}
                disabled={!interactive || isSubmitting}
                onClick={handleSubmit}>
                {isSubmitting ? "Processing..." : isPaid ? `Register & Pay ₹${amount?.toLocaleString()}` : "Register for Free"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-xs" style={{ color: "#94a3b8" }}>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure</span>
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Certificate</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Limited seats</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ background: "#0f172a" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#7c3aed" }}>
                  <Video className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">WebinarPro</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>Professional webinars that deliver real value.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2.5 text-sm" style={{ color: "#94a3b8" }}>
                {["About", "Speakers", "FAQ", "Contact"].map(l => <div key={l} className="hover:text-white cursor-pointer transition-colors">{l}</div>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2.5 text-sm" style={{ color: "#94a3b8" }}>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@webinarpro.com</div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.webinarpro.com</div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 text-center text-sm" style={{ borderTop: "1px solid #1e293b", color: "#64748b" }}>
            © 2026 WebinarPro. All rights reserved. · Powered by Razorpay
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebinarLandingPreview;
