import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar, Clock, Video, Star, Shield, Award, CheckCircle2, ChevronLeft, ChevronRight,
  GraduationCap, Target, Users, BookOpen, TrendingUp, MessageSquare, Globe
} from "lucide-react";
import type { CoachingData } from "@/pages/CoachingCreate";
import { toast } from "sonner";

interface CoachingLandingPreviewProps {
  data: CoachingData;
  interactive?: boolean;
  editable?: boolean;
  onBook?: (fields: Record<string, string>) => void;
  onEdit?: (field: string, value: string) => void;
}

const CoachingLandingPreview = ({ data, interactive = false, editable = false, onBook, onEdit }: CoachingLandingPreviewProps) => {
  const {
    name,
    tagline,
    description,
    bannerImage,
    isPaid,
    amount,
    pricingModel,
    packageSessions,
    packageAmount,
    sessionConfig,
    availability,
    bookingFields,
    coach,
  } = data;

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const enabledDays = availability.filter(a => a.enabled);

  // Booking flow state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingData, setBookingData] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate available time slots for selected date
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

    return slots;
  };

  const availableSlots = getAvailableSlots(selectedDate);

  // Handle Razorpay checkout
  const handleBooking = () => {
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
      toast.success("Booking flow demo (interactive mode disabled)");
      return;
    }

    // Check if Razorpay is loaded
    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    const options = {
      key: "rzp_test_1234567890",
      amount: (bookingAmount || 0) * 100,
      currency: "INR",
      name: name,
      description: `${pricingModel === "package" ? `${packageSessions} Sessions Package` : "1:1 Consultation"}`,
      image: bannerImage,
      prefill: {
        name: bookingData.rf_name || "",
        email: bookingData.rf_email || "",
        contact: bookingData.rf_phone || "",
      },
      notes: {
        session_date: selectedDate.toISOString(),
        session_time: selectedTime,
        session_duration: sessionConfig.duration,
        pricing_model: pricingModel,
      },
      theme: {
        color: "#0066FF",
      },
      handler: function (response: any) {
        toast.success("Booking confirmed! 🎉", {
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        setSelectedDate(null);
        setSelectedTime("");
        setBookingData({});
      },
      modal: {
        ondismiss: function () {
          toast.info("Booking cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response: any) {
      console.error("Payment Failed:", response.error);
      toast.error("Payment failed!", {
        description: response.error.description || "Please try again",
      });
    });

    rzp.open();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-[#1a4a6b] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">EduConsult</h1>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#services" className="hover:text-blue-200">Services</a>
            <a href="#about" className="hover:text-blue-200">About</a>
            <a href="#testimonials" className="hover:text-blue-200">Testimonials</a>
            <a href="#book" className="hover:text-blue-200">Book Now</a>
          </div>
          <Button variant="secondary" size="sm">Contact</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {editingField === "tagline" && editable ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  if (onEdit && editValue !== tagline) {
                    onEdit("tagline", editValue);
                  }
                  setEditingField(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (onEdit && editValue !== tagline) {
                      onEdit("tagline", editValue);
                    }
                    setEditingField(null);
                  } else if (e.key === "Escape") {
                    setEditingField(null);
                  }
                }}
                className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight w-full bg-white border-2 border-primary rounded-lg px-4 py-2"
                autoFocus
              />
            ) : (
              <h2
                className={`text-4xl md:text-5xl font-bold text-gray-900 leading-tight ${editable ? "cursor-pointer hover:bg-blue-50/50 rounded-lg px-2 -mx-2 py-1 transition-colors" : ""}`}
                onClick={() => {
                  if (editable) {
                    setEditingField("tagline");
                    setEditValue(tagline);
                  }
                }}
                title={editable ? "Click to edit" : ""}
              >
                {tagline}
              </h2>
            )}
            {editingField === "description" && editable ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  if (onEdit && editValue !== description) {
                    onEdit("description", editValue);
                  }
                  setEditingField(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setEditingField(null);
                  }
                }}
                className="text-lg text-gray-600 w-full bg-white border-2 border-primary rounded-lg px-4 py-2 min-h-[100px]"
                autoFocus
              />
            ) : (
              <p
                className={`text-lg text-gray-600 ${editable ? "cursor-pointer hover:bg-blue-50/50 rounded-lg px-2 -mx-2 py-1 transition-colors" : ""}`}
                onClick={() => {
                  if (editable) {
                    setEditingField("description");
                    setEditValue(description);
                  }
                }}
                title={editable ? "Click to edit" : ""}
              >
                {description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#0066FF] hover:bg-blue-700 text-white px-8 py-6 text-base">
                Start Your Journey
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-base">
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-sm text-gray-600">5.0 (230+ reviews)</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">500+</span> students placed
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-100 rounded-full -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-orange-100 rounded-full -z-10"></div>
            <img
              src={bannerImage}
              alt="Education Consultant"
              className="rounded-2xl w-full h-[500px] object-cover shadow-2xl"
            />
            <div className="absolute top-8 right-8 bg-white rounded-xl shadow-lg p-4">
              <p className="text-sm font-semibold text-gray-900">Success Rate</p>
              <p className="text-3xl font-bold text-[#0066FF]">95%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Badges */}
      <section className="py-8 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            {[
              "USA Universities", "UK Universities", "Canada Universities",
              "Australia Universities", "European Universities"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#0066FF]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Alternating Sections */}
      <section className="py-20 px-6" id="about">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose This Consultation?</h2>
          </div>

          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
              alt="Personalized guidance"
              className="rounded-xl w-full h-80 object-cover shadow-lg"
            />
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Personalized University Selection</h3>
              <p className="text-gray-600 leading-relaxed">
                Every student is unique. We analyze your academic background, career goals, budget,
                and preferences to create a tailored university list that maximizes your admission chances.
              </p>
              <div className="space-y-2">
                {[
                  "Detailed profile analysis",
                  "University matching algorithm",
                  "Career-aligned recommendations"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 2 - Reversed */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 md:order-1 order-2">
              <h3 className="text-2xl font-bold text-gray-900">Application Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Navigate the complex application process with expert guidance. From crafting compelling
                essays to managing deadlines, we ensure your application stands out.
              </p>
              <div className="space-y-2">
                {[
                  "Essay review and editing",
                  "Document checklist management",
                  "Application submission support"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop"
              alt="Application support"
              className="rounded-xl w-full h-80 object-cover shadow-lg md:order-2 order-1"
            />
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop"
              alt="Visa assistance"
              className="rounded-xl w-full h-80 object-cover shadow-lg"
            />
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Visa & Immigration Guidance</h3>
              <p className="text-gray-600 leading-relaxed">
                Don't let visa complexities derail your dream. Get expert assistance with
                documentation, interview prep, and compliance requirements.
              </p>
              <div className="space-y-2">
                {[
                  "Visa documentation checklist",
                  "Mock visa interview sessions",
                  "Post-arrival guidance"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Help - Process Steps */}
      <section className="py-20 bg-gray-50 px-6" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How We Can Help You</h2>
            <p className="text-gray-600 mt-2">Simple 4-step process to your dream university</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: "Initial Consultation", desc: "Understand your goals and academic profile" },
              { icon: Target, title: "University Shortlisting", desc: "Curated list based on your preferences" },
              { icon: TrendingUp, title: "Application Prep", desc: "Essays, docs, and submission support" },
              { icon: Globe, title: "Visa Support", desc: "Complete visa and travel assistance" },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center space-y-4 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <step.icon className="h-8 w-8 text-[#0066FF]" />
                </div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white" id="testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Students Say</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: "Priya Sharma", university: "Stanford University", text: "The guidance I received was invaluable. From university selection to visa prep, everything was handled professionally." },
              { name: "Rahul Patel", university: "University of Toronto", text: "Thanks to the personalized approach, I got into my dream university with a scholarship. Highly recommended!" },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex">
                  {[1,2,3,4,5].map(j => <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#0066FF]">{testimonial.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.university}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white px-6" id="book">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Book Your Consultation Session</h2>
            <p className="text-gray-600 mt-2">Schedule a personalized consultation at your convenience</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div className="bg-white rounded-xl p-8 shadow-lg space-y-6">
              {pricingModel === "package" && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{packageSessions} Session Package</p>
                      <p className="text-xs text-gray-600">
                        ₹{Math.round((packageAmount || 0) / (packageSessions || 1)).toLocaleString()}/session
                      </p>
                    </div>
                    <p className="text-xl font-bold text-[#0066FF]">₹{packageAmount?.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {bookingFields.map((f) => (
                <div key={f.id}>
                  <Label className="text-sm font-medium text-gray-700">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    placeholder={f.placeholder}
                    className="mt-1.5"
                    value={bookingData[f.id] || ""}
                    onChange={(e) => setBookingData({ ...bookingData, [f.id]: e.target.value })}
                    disabled={!interactive}
                  />
                </div>
              ))}

              {selectedDate && selectedTime && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-gray-900">Selected Slot</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} at {selectedTime}
                  </p>
                </div>
              )}

              {selectedDate && selectedTime && (
                <Button
                  className="w-full py-6 text-base font-semibold bg-[#0066FF] hover:bg-blue-700"
                  disabled={!interactive}
                  onClick={handleBooking}
                >
                  {isPaid
                    ? pricingModel === "package"
                      ? `Pay ₹${packageAmount?.toLocaleString()} & Book Package`
                      : `Pay ₹${amount?.toLocaleString()} & Book Session`
                    : "Confirm Booking"}
                </Button>
              )}

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-4">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sessionConfig.duration} min</span>
                <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Google Meet</span>
              </div>
            </div>

            {/* Right: Calendar & Time Slots */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <CalendarPicker
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  availability={availability}
                  interactive={interactive}
                />
              </div>

              {selectedDate && (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Available Time Slots
                    <span className="text-sm text-gray-600 font-normal ml-2">
                      ({selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })})
                    </span>
                  </h3>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => interactive && setSelectedTime(slot)}
                          disabled={!interactive}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            selectedTime === slot
                              ? "border-[#0066FF] bg-[#0066FF] text-white"
                              : "border-gray-200 bg-white hover:border-[#0066FF] text-gray-700"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No available slots for this date</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a4a6b] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">EduConsult</h3>
            <p className="text-sm text-blue-200">Your trusted partner in international education</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Links</h4>
            <div className="space-y-2 text-sm text-blue-200">
              <p>About</p>
              <p>Services</p>
              <p>FAQ</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-blue-200">
              <p>hello@educonsult.com</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-3">
              {["facebook", "instagram", "linkedin"].map((social) => (
                <div key={social} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-500">
                  <Globe className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-blue-600 text-center text-sm text-blue-200">
          <p>© 2026 EduConsult. All rights reserved. | Powered by Razorpay Smart Pages</p>
        </div>
      </footer>
    </div>
  );
};

// Calendar Picker Component
interface CalendarPickerProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availability: any[];
  interactive: boolean;
}

const CalendarPicker = ({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  onSelectDate,
  availability,
  interactive,
}: CalendarPickerProps) => {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateAvailable = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return availability.some(a => a.day === dayName && a.enabled);
  };

  const isDatePast = (date: Date) => {
    return date < today;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isAvailable = isDateAvailable(date);
    const isPast = isDatePast(date);
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isToday = today.toDateString() === date.toDateString();

    days.push(
      <button
        key={day}
        onClick={() => interactive && isAvailable && !isPast && onSelectDate(date)}
        disabled={!interactive || !isAvailable || isPast}
        className={`aspect-square p-2 rounded-lg text-sm font-medium transition-all ${
          isSelected
            ? "bg-[#0066FF] text-white"
            : isToday
            ? "border-2 border-[#0066FF] text-[#0066FF]"
            : isAvailable && !isPast
            ? "hover:bg-blue-50 text-gray-700"
            : "text-gray-300 cursor-not-allowed"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth} disabled={!interactive}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-gray-900">
          {currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <Button variant="ghost" size="sm" onClick={handleNextMonth} disabled={!interactive}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default CoachingLandingPreview;
