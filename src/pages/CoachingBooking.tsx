import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Calendar, Clock, IndianRupee, ChevronLeft, ChevronRight,
  Globe, User, Mail, Phone, Video,
} from "lucide-react";
import { toast } from "sonner";

interface CoachingBookingProps {
  sessionTitle?: string;
  sessionDescription?: string;
  sessionPrice?: number;
  sessionDuration?: number;
  coachName?: string;
  coachImage?: string;
}

const CoachingBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get session details from URL params or use defaults
  const sessionTitle = searchParams.get("title") || "Quick Chat";
  const sessionPrice = Number(searchParams.get("price")) || 500;
  const sessionDuration = Number(searchParams.get("duration")) || 30;
  const coachName = searchParams.get("coach") || "Manish R";

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showDetailsForm, setShowDetailsForm] = useState(false);

  // Booking details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Mock booked slots (same as before)
  const bookedSlots = [
    { date: "2026-03-15", time: "10:00" },
    { date: "2026-03-15", time: "14:00" },
    { date: "2026-03-16", time: "11:00" },
  ];

  // Mock availability (Mon-Fri, 9 AM - 5 PM)
  const availability = [
    { day: "monday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "tuesday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "wednesday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "thursday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "friday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "saturday", enabled: false, startTime: "09:00", endTime: "17:00" },
    { day: "sunday", enabled: false, startTime: "09:00", endTime: "17:00" },
  ];

  // Generate week dates for horizontal scroll
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const isDateAvailable = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && availability.some(a => a.day === dayName && a.enabled);
  };

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

    const buffer = 15; // 15 min buffer
    while (currentMinutes + sessionDuration <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const min = currentMinutes % 60;
      slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
      currentMinutes += sessionDuration + buffer;
    }

    // Filter out booked slots
    const dateStr = date.toISOString().split("T")[0];
    const bookedTimesForDay = bookedSlots
      .filter(slot => slot.date === dateStr)
      .map(slot => slot.time);

    return slots.filter(slot => !bookedTimesForDay.includes(slot));
  };

  const availableSlots = getAvailableSlots(selectedDate);

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }
    setShowDetailsForm(true);
  };

  const handleProceedToPayment = () => {
    if (!name || !email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // TODO: Integrate with Razorpay
    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment gateway not loaded.");
      return;
    }

    const options = {
      key: "rzp_live_SFFFdBjmPbTKZL",
      amount: sessionPrice * 100,
      currency: "INR",
      name: sessionTitle,
      description: `${sessionDuration} min session with ${coachName}`,
      prefill: { name, email, contact: phone },
      theme: { color: "#0d9488" },
      handler: (response: any) => {
        toast.success("Booking confirmed! 🎉", {
          description: `You'll receive a confirmation email at ${email}`,
        });
        setTimeout(() => navigate(-1), 2000);
      },
      modal: {
        ondismiss: () => toast.info("Payment cancelled"),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (r: any) => toast.error("Payment failed!", { description: r.error.description }));
    rzp.open();
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Session Details */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-br from-pink-50 to-orange-50 border-none shadow-lg sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{coachName}</h3>
                  <p className="text-sm text-gray-600">Career Coach</p>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{sessionTitle}</h1>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{sessionPrice}</p>
                    <p className="text-xs text-gray-600">per session</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{sessionDuration} mins</p>
                    <p className="text-xs text-gray-600">duration</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                Want to get on a 1-on-1 call with me and have a brief discussion about what I do,
                how I can help you or talk about any brief query you have under the umbrella of
                Product Management? Book a call with me and I\'ll see you inside. The only reason
                to keep a nominal charge is to let me have a chance to speak with people who
                genuinely want to connect.
              </div>
            </Card>
          </div>

          {/* Right: Booking Calendar */}
          <div className="lg:col-span-3">
            <Card className="p-8 shadow-lg">
              {!showDetailsForm ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">When should we meet?</h2>

                  {/* Horizontal Date Scroller */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={goToPreviousWeek}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>

                      <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
                        {weekDates.map((date, idx) => {
                          const isAvailable = isDateAvailable(date);
                          const isSelected = selectedDate?.toDateString() === date.toDateString();
                          const isToday = new Date().toDateString() === date.toDateString();

                          return (
                            <button
                              key={idx}
                              onClick={() => isAvailable && setSelectedDate(date)}
                              disabled={!isAvailable}
                              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-xl transition-all ${
                                isSelected
                                  ? "bg-gray-900 text-white shadow-lg scale-105"
                                  : isAvailable
                                  ? "bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-900"
                                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
                              } ${isToday && !isSelected ? "border-orange-500" : ""}`}
                            >
                              <span className="text-xs font-medium">
                                {date.toLocaleDateString("en-US", { weekday: "short" })}
                              </span>
                              <span className="text-xl font-bold mt-1">
                                {date.getDate()}
                              </span>
                              <span className="text-xs">
                                {date.toLocaleDateString("en-US", { month: "short" })}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={goToNextWeek}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select time of day</h3>

                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3 mb-8">
                          {availableSlots.map((slot) => {
                            const isSelected = selectedTime === slot;
                            return (
                              <button
                                key={slot}
                                onClick={() => setSelectedTime(slot)}
                                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                                  isSelected
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-900"
                                }`}
                              >
                                {formatTime(slot)}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200 mb-8">
                          <p className="text-sm font-medium text-yellow-800">No available slots for this day</p>
                          <p className="text-xs text-yellow-700 mt-1">Please select another date</p>
                        </div>
                      )}

                      {/* Timezone */}
                      <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Timezone</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                          <Globe className="h-4 w-4" />
                          <span>(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi (India Standard Time)</span>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <Button
                        onClick={handleContinue}
                        disabled={!selectedTime}
                        className="w-full py-6 text-base font-semibold rounded-lg"
                        style={{ background: "#000" }}
                      >
                        Continue
                      </Button>
                    </>
                  )}
                </>
              ) : (
                /* Customer Details Form */
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setShowDetailsForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
                  </div>

                  {/* Selected Slot Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-green-800 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-semibold">
                        {selectedDate?.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{formatTime(selectedTime)} ({sessionDuration} minutes)</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  {/* Meeting Platform Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Meeting will be on Google Meet</p>
                      <p className="text-xs text-blue-700">You'll receive the meeting link via email after payment</p>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-lg font-medium text-gray-700">Total Amount</span>
                      <span className="text-3xl font-bold text-gray-900">₹{sessionPrice}</span>
                    </div>

                    <Button
                      onClick={handleProceedToPayment}
                      className="w-full py-6 text-base font-semibold rounded-lg"
                      style={{ background: "#000" }}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingBooking;
