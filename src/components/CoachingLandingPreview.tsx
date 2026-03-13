import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar, Clock, Video, Star, Shield, Award, CheckCircle2, ChevronLeft, ChevronRight,
  Users, BookOpen, Target, MessageSquare, Globe, ArrowRight, Mail, Phone,
} from "lucide-react";
import type { CoachingData } from "@/pages/CoachingCreate";
import InlineEditable from "@/components/InlineEditable";
import { toast } from "sonner";

interface CoachingLandingPreviewProps {
  data: CoachingData;
  interactive?: boolean;
  editable?: boolean;
  onBook?: (fields: Record<string, string>) => void;
  onEdit?: (field: string, value: string) => void;
}

const CoachingLandingPreview = ({ data, interactive = false, editable = false, onBook, onEdit }: CoachingLandingPreviewProps) => {
  const navigate = useNavigate();
  const {
    name, tagline, description, bannerImage, isPaid, amount, pricingModel,
    packageSessions, packageAmount, sessionConfig, availability, bookingFields, coach,
  } = data;

  const enabledDays = availability.filter(a => a.enabled);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingData, setBookingData] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // TODO: Backend Integration - In production, fetch booked slots from API
  // Mock data for demonstration purposes
  const [bookedSlots] = useState<Array<{ date: string; time: string }>>([
    { date: "2026-03-15", time: "10:00" },
    { date: "2026-03-15", time: "14:00" },
    { date: "2026-03-16", time: "11:00" },
    { date: "2026-03-17", time: "09:00" },
    { date: "2026-03-17", time: "15:00" },
  ]);

  const getAvailableSlots = (date: Date | null) => {
    if (!date) return [];
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const dayAvailability = availability.find(a => a.day === dayName && a.enabled);
    if (!dayAvailability) return [];

    const slots: string[] = [];
    const [startH, startM] = dayAvailability.startTime.split(":").map(Number);
    const [endH, endM] = dayAvailability.endTime.split(":").map(Number);
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + sessionConfig.duration <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const min = currentMinutes % 60;
      slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
      currentMinutes += sessionConfig.duration + sessionConfig.buffer;
    }

    // TODO: Backend Integration - Filter out booked slots from API response
    // For now, using mock booked slots data
    const dateStr = date.toISOString().split("T")[0];
    const bookedTimesForDay = bookedSlots
      .filter(slot => slot.date === dateStr)
      .map(slot => slot.time);

    return slots.filter(slot => !bookedTimesForDay.includes(slot));
  };

  const availableSlots = getAvailableSlots(selectedDate);

  const handleBooking = () => {
    // Validation checks
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    const missingFields = bookingFields.filter(f => f.required && !bookingData[f.id]);
    if (missingFields.length > 0) {
      toast.error(`Please fill: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    const bookingAmount = pricingModel === "package" ? packageAmount : amount;

    if (!interactive) {
      toast.success("Booking flow demo");
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment gateway not loaded.");
      return;
    }

    // TODO: Backend Integration - Add slot hold mechanism before payment
    // In production, hold the slot when payment modal opens and release on cancel

    const options = {
      key: "rzp_live_SFFFdBjmPbTKZL",
      amount: (bookingAmount || 0) * 100,
      currency: "INR",
      name,
      description: pricingModel === "package" ? `${packageSessions} Sessions Package` : "1:1 Consultation",
      prefill: {
        name: bookingData.rf_name || "",
        email: bookingData.rf_email || "",
        contact: bookingData.rf_phone || "",
      },
      theme: { color: "#0d9488" },
      handler: (response: any) => {
        // TODO: Backend Integration - Confirm booking via webhook
        // POST /api/coaching/:page_id/bookings with payment_id, slot_date, slot_time
        toast.success("Booking confirmed! 🎉", {
          description: `You'll receive a confirmation email shortly. Payment ID: ${response.razorpay_payment_id}`,
        });

        // Reset form
        setSelectedDate(null);
        setSelectedTime("");
        setBookingData({});

        // Note: In production, booked slots would be refreshed from API
        // For demo purposes, we're using static mock data
      },
      modal: {
        ondismiss: () => {
          // TODO: Backend Integration - Release held slot on payment cancel
          toast.info("Booking cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (r: any) => {
      // TODO: Backend Integration - Release held slot on payment failure
      toast.error("Payment failed!", { description: r.error.description });
    });
    rzp.open();
  };

  const sessionPrice = isPaid
    ? pricingModel === "package"
      ? `₹${(packageAmount || 0).toLocaleString()}`
      : `₹${amount.toLocaleString()}`
    : "Free";

  const perSessionPrice = pricingModel === "package" && packageSessions
    ? `₹${Math.round((packageAmount || 0) / packageSessions).toLocaleString()}/session`
    : null;

  const handleBookSession = () => {
    if (!interactive) {
      toast.info("Preview mode - booking disabled");
      return;
    }

    const bookingAmount = pricingModel === "package" ? packageAmount : amount;
    const sessionTitle = pricingModel === "package"
      ? `${packageSessions} Session Package`
      : "1:1 Consultation";

    navigate(`/coaching/book?title=${encodeURIComponent(sessionTitle)}&price=${bookingAmount}&duration=${sessionConfig.duration}&coach=${encodeURIComponent(coach.name)}`);
  };

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0d9488" }}>
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: "#0f172a" }}>{coach.name.split(" ")[0]}Coach</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#64748b" }}>
            <a href="#about" className="hover:text-[#0d9488] transition-colors">About</a>
            <a href="#services" className="hover:text-[#0d9488] transition-colors">Services</a>
            <a href="#testimonials" className="hover:text-[#0d9488] transition-colors">Reviews</a>
            <a href="#book" className="hover:text-[#0d9488] transition-colors">Book</a>
          </div>
          <Button size="sm" style={{ background: "#0d9488" }} onClick={handleBookSession}>
            Book Session — {sessionPrice}
          </Button>
        </div>
      </nav>

      {/* Hero — Personal brand focused */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #042f2e 0%, #134e4a 40%, #0f766e 100%)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(45,212,191,0.2)", color: "#99f6e4", border: "1px solid rgba(45,212,191,0.3)" }}>
                ✨ 1:1 PERSONALIZED COACHING
              </Badge>

              <InlineEditable value={tagline} field="tagline" editable={editable} onEdit={onEdit} as="h1"
                className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white" />

              <InlineEditable value={description} field="description" editable={editable} onEdit={onEdit} as="p"
                className="text-xl leading-relaxed" style={{ color: "#99f6e4" }} multiline />

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                  <span className="font-semibold text-white text-sm">5.0</span>
                  <span className="text-sm" style={{ color: "#99f6e4" }}>(230+ reviews)</span>
                </div>
                <span className="text-sm" style={{ color: "#99f6e4" }}>
                  <strong className="text-white">500+</strong> students helped
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl shadow-xl"
                  style={{ background: "#0d9488" }}
                  onClick={handleBookSession}>
                  Book a Session <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="px-6 py-6 text-base rounded-xl"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", background: "rgba(255,255,255,0.05)" }}>
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={bannerImage} alt={coach.name} className="w-full aspect-[4/5] object-cover" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 rounded-xl p-4 shadow-2xl" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                <p className="text-sm font-semibold" style={{ color: "#64748b" }}>Success Rate</p>
                <p className="text-3xl font-extrabold" style={{ color: "#0d9488" }}>95%</p>
              </div>
              <div className="absolute -top-4 -right-4 rounded-xl p-4 shadow-2xl" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                <p className="text-sm font-semibold" style={{ color: "#64748b" }}>Experience</p>
                <p className="text-3xl font-extrabold" style={{ color: "#0d9488" }}>10+</p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>years</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Coach */}
      <section id="about" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop" alt="Coaching session"
                className="rounded-2xl w-full object-cover shadow-xl" style={{ height: "450px" }} />
            </div>
            <div className="space-y-6">
              <Badge className="rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#ccfbf1", color: "#0d9488" }}>ABOUT</Badge>
              <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Why Choose {coach.name}?</h2>
              <p className="text-lg leading-relaxed" style={{ color: "#64748b" }}>{coach.bio}</p>
              {coach.credentials && (
                <div className="flex flex-wrap gap-2">
                  {coach.credentials.map((cred, i) => (
                    <Badge key={i} variant="secondary" className="rounded-full px-3 py-1.5" style={{ background: "#f1f5f9", color: "#475569" }}>{cred}</Badge>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-6 pt-4">
                {[
                  { val: "500+", label: "Clients" },
                  { val: "95%", label: "Success Rate" },
                  { val: "10+", label: "Years Exp." },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <p className="text-2xl font-extrabold" style={{ color: "#0d9488" }}>{s.val}</p>
                    <p className="text-xs font-medium mt-1" style={{ color: "#64748b" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="services" className="py-24" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#fef3c7", color: "#b45309" }}>HOW IT WORKS</Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Simple 4-Step Process</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Discovery Call", desc: "Understand your goals and challenges", step: "01" },
              { icon: Target, title: "Custom Plan", desc: "Tailored roadmap for your success", step: "02" },
              { icon: MessageSquare, title: "Regular Sessions", desc: "Guided 1:1 coaching sessions", step: "03" },
              { icon: Award, title: "Achieve Goals", desc: "Measurable results and growth", step: "04" },
            ].map((item, i) => (
              <div key={i} className="relative rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                <span className="absolute top-4 right-4 text-4xl font-extrabold" style={{ color: "#e2e8f0" }}>{item.step}</span>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "#ccfbf1" }}>
                  <item.icon className="h-7 w-7" style={{ color: "#0d9488" }} />
                </div>
                <h3 className="font-bold text-lg" style={{ color: "#0f172a" }}>{item.title}</h3>
                <p className="text-sm mt-2" style={{ color: "#64748b" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#dcfce7", color: "#16a34a" }}>TESTIMONIALS</Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>What Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: "Priya Sharma", role: "Got into Stanford", text: "The guidance I received was invaluable. From goal setting to execution, everything was handled professionally.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
              { name: "Rahul Patel", role: "Career Switch to PM", text: "Thanks to the personalized approach, I achieved my career goals with a clear, actionable roadmap. Highly recommended!", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl p-8 transition-all duration-300 hover:shadow-xl"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(j => <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />)}</div>
                <p className="leading-relaxed text-lg italic mb-6" style={{ color: "#475569" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold" style={{ color: "#0f172a" }}>{t.name}</p>
                    <p className="text-sm" style={{ color: "#0d9488" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24" style={{ background: "#f8fafc" }}>
        <div className="max-w-lg mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#ede9fe", color: "#7c3aed" }}>PRICING</Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Investment in Your Growth</h2>
          </div>
          <div className="rounded-2xl shadow-xl p-10 text-center" style={{ background: "#fff", border: "2px solid #0d9488" }}>
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
              {pricingModel === "package" ? `${packageSessions} Session Package` : "Per Session"}
            </p>
            <div className="text-5xl font-extrabold mt-4" style={{ color: "#0f172a" }}>{sessionPrice}</div>
            {perSessionPrice && <p className="text-sm mt-2" style={{ color: "#64748b" }}>{perSessionPrice}</p>}
            <div className="space-y-3 mt-8 text-left">
              {[
                `${sessionConfig.duration}-minute sessions`,
                "Personalized action plan",
                "Follow-up resources & notes",
                "Priority email support",
                pricingModel === "package" ? `${packageSessions} sessions included` : "Flexible scheduling",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm" style={{ color: "#475569" }}>
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: "#0d9488" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Button className="w-full py-6 text-base font-semibold rounded-xl shadow-lg mt-8"
              style={{ background: "#0d9488" }}
              onClick={handleBookSession}>
              Book Now <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="book" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#ccfbf1", color: "#0d9488" }}>BOOK NOW</Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Schedule Your Session</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Calendar */}
            <div className="rounded-2xl p-8 shadow-xl" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <CalendarPicker
                currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
                selectedDate={selectedDate} onSelectDate={setSelectedDate}
                availability={availability} interactive={interactive} />
              {selectedDate && (
                <div className="mt-6 pt-6" style={{ borderTop: "1px solid #e2e8f0" }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold" style={{ color: "#0f172a" }}>
                      Available Times
                      <span className="text-sm font-normal ml-2" style={{ color: "#64748b" }}>
                        ({selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })})
                      </span>
                    </h3>
                    {availableSlots.length > 0 && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#ccfbf1", color: "#0d9488" }}>
                        {availableSlots.length} slots available
                      </span>
                    )}
                  </div>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(slot => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => interactive && setSelectedTime(slot)}
                            disabled={!interactive}
                            className="p-3 rounded-xl text-sm font-medium transition-all hover:shadow-md"
                            style={
                              isSelected
                                ? {
                                    background: "#0d9488",
                                    color: "#fff",
                                    border: "2px solid #0d9488",
                                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)",
                                  }
                                : {
                                    background: "#fff",
                                    color: "#374151",
                                    border: "1px solid #10b981",
                                    borderLeftWidth: "3px",
                                  }
                            }
                          >
                            <div className="flex items-center justify-center gap-1">
                              {!isSelected && <span className="text-green-600 text-xs">✓</span>}
                              <span>{slot}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 rounded-xl" style={{ background: "#fef3c7", border: "1px solid #fbbf24" }}>
                      <p className="text-sm font-medium" style={{ color: "#92400e" }}>
                        No available slots for this day
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#b45309" }}>
                        All slots are booked. Please select another date.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form */}
            <div className="rounded-2xl p-8 shadow-xl space-y-6" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>Your Details</h3>
              {bookingFields.map(f => (
                <div key={f.id}>
                  <Label className="text-sm font-medium" style={{ color: "#374151" }}>
                    {f.label} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                  </Label>
                  <Input placeholder={f.placeholder} className="mt-1.5"
                    value={bookingData[f.id] || ""}
                    onChange={e => setBookingData({ ...bookingData, [f.id]: e.target.value })}
                    disabled={!interactive} />
                </div>
              ))}
              {selectedDate && selectedTime && (
                <div className="space-y-4">
                  {/* Review/Confirmation Card */}
                  <div className="p-5 rounded-xl" style={{ background: "#f0fdfa", border: "2px solid #5eead4" }}>
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#0d9488" }}>
                        Review Your Booking
                      </p>
                      <Badge className="bg-green-100 text-green-700 border-green-300">Ready to book</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 mt-0.5" style={{ color: "#0d9488" }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
                            {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <p className="text-xs" style={{ color: "#64748b" }}>Session date</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 mt-0.5" style={{ color: "#0d9488" }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
                            {selectedTime} ({sessionConfig.duration} minutes)
                          </p>
                          <p className="text-xs" style={{ color: "#64748b" }}>Session time and duration</p>
                        </div>
                      </div>

                      {bookingData.rf_name && (
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 mt-0.5" style={{ color: "#0d9488" }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#0f172a" }}>{bookingData.rf_name}</p>
                            {bookingData.rf_email && (
                              <p className="text-xs" style={{ color: "#64748b" }}>{bookingData.rf_email}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {isPaid && (
                        <div className="pt-3 mt-3" style={{ borderTop: "1px solid #99f6e4" }}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: "#475569" }}>Total Amount</span>
                            <span className="text-2xl font-bold" style={{ color: "#0d9488" }}>{sessionPrice}</span>
                          </div>
                          {pricingModel === "package" && perSessionPrice && (
                            <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                              {packageSessions} sessions · {perSessionPrice}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirm & Pay Button */}
                  <Button
                    className="w-full py-6 text-base font-semibold rounded-xl shadow-lg"
                    style={{ background: "#0d9488" }}
                    disabled={!interactive}
                    onClick={handleBooking}
                  >
                    {isPaid ? `Confirm & Pay ${sessionPrice}` : "Confirm Booking"}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-center gap-6 text-xs pt-2" style={{ color: "#94a3b8" }}>
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {sessionConfig.duration} min</span>
                <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> Google Meet</span>
              </div>
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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0d9488" }}>
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">{coach.name.split(" ")[0]}Coach</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>Your trusted partner in personal and professional growth.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2.5 text-sm" style={{ color: "#94a3b8" }}>
                {["About", "Services", "Testimonials", "Contact"].map(l => <div key={l} className="hover:text-white cursor-pointer transition-colors">{l}</div>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2.5 text-sm" style={{ color: "#94a3b8" }}>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@coaching.com</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 text-center text-sm" style={{ borderTop: "1px solid #1e293b", color: "#64748b" }}>
            © 2026 {coach.name.split(" ")[0]}Coach. All rights reserved. · Powered by Razorpay
          </div>
        </div>
      </footer>
    </div>
  );
};

// Calendar Picker Component
interface CalendarPickerProps {
  currentMonth: Date; setCurrentMonth: (d: Date) => void;
  selectedDate: Date | null; onSelectDate: (d: Date) => void;
  availability: any[]; interactive: boolean;
}

const CalendarPicker = ({ currentMonth, setCurrentMonth, selectedDate, onSelectDate, availability, interactive }: CalendarPickerProps) => {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const isDateAvailable = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return availability.some((a: any) => a.day === dayName && a.enabled);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`e-${i}`} className="aspect-square" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const available = isDateAvailable(date);
    const past = date < today;
    const selected = selectedDate?.toDateString() === date.toDateString();
    const isToday = today.toDateString() === date.toDateString();
    days.push(
      <button key={day} onClick={() => interactive && available && !past && onSelectDate(date)}
        disabled={!interactive || !available || past}
        className="aspect-square p-2 rounded-xl text-sm font-medium transition-all"
        style={selected ? { background: "#0d9488", color: "#fff" }
          : isToday ? { border: "2px solid #0d9488", color: "#0d9488" }
          : available && !past ? { color: "#374151" } : { color: "#d1d5db", cursor: "not-allowed" }}>
        {day}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} disabled={!interactive}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
          {currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} disabled={!interactive}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-xs font-medium p-2" style={{ color: "#94a3b8" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};

export default CoachingLandingPreview;
