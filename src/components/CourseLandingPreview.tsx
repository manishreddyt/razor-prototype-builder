import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Play, Clock, Users, Award, CheckCircle2, Star, BookOpen,
  Video, FileText, Download, MessageCircle, Globe, Mail, Phone,
  ArrowLeft, Lock, CreditCard,
} from "lucide-react";
import type { CourseData } from "@/pages/CourseCreate";
import { toast } from "sonner";

interface CourseLandingPreviewProps {
  data: CourseData;
  interactive?: boolean;
}

type View = "landing" | "checkout";

const CourseLandingPreview = ({ data, interactive = false }: CourseLandingPreviewProps) => {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [enrollmentData, setEnrollmentData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleEnroll = () => {
    if (!enrollmentData.name || !enrollmentData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    if (data.isPaid) {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        return;
      }

      // Trigger Razorpay checkout
      const options = {
        key: "rzp_test_1234567890",
        amount: (data.pricingModel === "one-time" ? data.amount : (data.subscriptionAmount || 999)) * 100,
        currency: "INR",
        name: data.name,
        description: `Enroll in ${data.name}`,
        image: data.bannerImage,
        prefill: {
          name: enrollmentData.name,
          email: enrollmentData.email,
          contact: enrollmentData.phone,
        },
        notes: {
          course_name: data.name,
          pricing_model: data.pricingModel,
          student_name: enrollmentData.name,
        },
        theme: {
          color: "#0066FF",
        },
        handler: function (response: any) {
          toast.success("Enrollment successful! 🎉", {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          console.log("Payment success:", response);
          setEnrollmentData({ name: "", email: "", phone: "" });
          setCurrentView("landing");
        },
        modal: {
          ondismiss: function () {
            toast.info("Enrollment cancelled");
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
    } else {
      toast.success("Enrolled successfully! Check your email for course access.");
      setEnrollmentData({ name: "", email: "", phone: "" });
      setCurrentView("landing");
    }
  };

  const totalLessons = data.modules.reduce((sum, mod) => sum + (mod.lessons || 0), 0);
  const enrollmentPrice = data.pricingModel === "one-time"
    ? `₹${data.amount.toLocaleString()}`
    : `₹${(data.subscriptionAmount || 999).toLocaleString()}/month`;
  const enrollmentAmount = data.pricingModel === "one-time" ? data.amount : (data.subscriptionAmount || 999);

  // ─── Checkout View ───
  if (currentView === "checkout" && interactive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LearnHub</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("landing")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Course
            </Button>
          </div>
        </div>

        {/* Checkout Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Left: Enrollment Form */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Complete Your Enrollment</h1>
                <p className="text-gray-600 mt-2">Fill in your details to enroll in {data.name}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
                  <div className="space-y-4">
                    {data.enrollmentFields.map(field => (
                      <div key={field.id}>
                        <Label className="text-sm font-medium text-gray-700">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="mt-1.5"
                          value={enrollmentData[field.id.replace("rf_", "") as keyof typeof enrollmentData] || ""}
                          onChange={(e) => setEnrollmentData(prev => ({
                            ...prev,
                            [field.id.replace("rf_", "")]: e.target.value
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    onClick={handleEnroll}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    {data.isPaid ? `Pay ${enrollmentPrice} & Enroll` : "Enroll Now - Free"}
                  </Button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Secure payment</span>
                    </div>
                    <span>•</span>
                    <span>Powered by Razorpay</span>
                    <span>•</span>
                    <span>30-day refund policy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-4">
                  {/* Course Image */}
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img src={data.bannerImage} alt={data.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Course Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900">{data.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{data.tagline}</p>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 border-t border-b border-gray-200 py-3">
                    <div className="flex items-center gap-1">
                      <Video className="h-3.5 w-3.5" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{data.courseDuration}</span>
                    </div>
                    {data.certificateOffered && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        <span>Certificate</span>
                      </div>
                    )}
                  </div>

                  {/* What's Included */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">What's included:</h4>
                    <div className="space-y-2">
                      {data.courseIncludes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Course Price</span>
                      <span className="font-semibold text-gray-900">{enrollmentPrice}</span>
                    </div>
                    {data.pricingModel === "subscription" && (
                      <p className="text-xs text-gray-500">Billed monthly. Cancel anytime.</p>
                    )}
                    <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-blue-600">{enrollmentPrice}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <span>🔒 SSL Secure</span>
                    <span>💳 All cards</span>
                    <span>↩️ 30-day refund</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Landing Page View ───
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LearnHub</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#overview" className="text-gray-600 hover:text-blue-600">Overview</a>
            <a href="#curriculum" className="text-gray-600 hover:text-blue-600">Curriculum</a>
            <a href="#instructor" className="text-gray-600 hover:text-blue-600">Instructor</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600">Reviews</a>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => interactive && setCurrentView("checkout")}
          >
            Enroll Now
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                {data.courseFormat === "self-paced" ? "⏱️ Self-paced" : data.courseFormat === "cohort-based" ? "👥 Cohort-based" : "📹 Live Sessions"}
              </Badge>

              <h1 className="text-5xl font-bold leading-tight">
                {data.name}
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed">
                {data.tagline}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-blue-100">(2,340 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>12,456 enrolled</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8"
                  onClick={() => interactive && setCurrentView("checkout")}
                >
                  Enroll Now — {enrollmentPrice}
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Play className="h-5 w-5 mr-2" /> Preview
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{data.courseDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>{totalLessons} lessons</span>
                </div>
                {data.certificateOffered && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Certificate</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src={data.bannerImage}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="h-10 w-10 text-blue-600 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{totalLessons}+</div>
              <div className="text-sm text-gray-600 mt-1">Video Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{data.courseDuration}</div>
              <div className="text-sm text-gray-600 mt-1">Course Duration</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">12K+</div>
              <div className="text-sm text-gray-600 mt-1">Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">4.8★</div>
              <div className="text-sm text-gray-600 mt-1">Course Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section id="overview" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
              <div className="space-y-4">
                {data.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">This course includes:</h3>
              <div className="space-y-4">
                {data.courseIncludes.map((item, idx) => {
                  const icons: Record<string, any> = {
                    "Videos": Video,
                    "PDFs": FileText,
                    "Assignments": Download,
                    "Quizzes": CheckCircle2,
                    "Certificate": Award,
                    "Live Q&A": MessageCircle,
                  };
                  const Icon = icons[item] || CheckCircle2;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-gray-900">{enrollmentPrice}</div>
                  {data.pricingModel === "subscription" && (
                    <p className="text-sm text-gray-600">Cancel anytime</p>
                  )}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    onClick={() => interactive && setCurrentView("checkout")}
                  >
                    Enroll Now
                  </Button>
                  <p className="text-xs text-gray-500">30-day money-back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Curriculum */}
      <section id="curriculum" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Course Curriculum</h2>
            <p className="text-gray-600">
              {data.modules.length} modules • {totalLessons} lessons • {data.courseDuration}
            </p>
          </div>

          <div className="space-y-4">
            {data.modules.map((module, idx) => (
              <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                <div className="bg-gray-50 px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Video className="h-4 w-4" />
                      <span>{module.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{module.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section id="instructor" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Your Instructor</h2>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {data.instructor.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{data.instructor.name}</h3>
                <p className="text-blue-600 font-medium mt-1">{data.instructor.title}</p>
                <p className="text-gray-700 mt-4 leading-relaxed">{data.instructor.bio}</p>

                {data.instructor.credentials && data.instructor.credentials.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {data.instructor.credentials.map((cred, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {cred}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>15,000+ students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>8 courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.9 rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Student Success Stories</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                role: "Software Engineer",
                content: "This course completely transformed my understanding of the subject. The hands-on projects were invaluable!",
                rating: 5,
              },
              {
                name: "Rahul Verma",
                role: "Product Manager",
                content: "Excellent course structure and real-world examples. I was able to apply what I learned immediately.",
                rating: 5,
              },
              {
                name: "Ananya Patel",
                role: "Student",
                content: "The instructor's teaching style is outstanding. Complex topics made simple and easy to understand.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Form */}
      {interactive && (
        <section id="enroll" className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Start Learning?</h2>
                <p className="text-gray-600">Enroll now and get lifetime access to the course</p>
              </div>

              <div className="space-y-4">
                {data.enrollmentFields.map(field => (
                  <div key={field.id}>
                    <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="mt-1"
                      value={enrollmentData[field.id.replace("rf_", "") as keyof typeof enrollmentData] || ""}
                      onChange={(e) => setEnrollmentData(prev => ({
                        ...prev,
                        [field.id.replace("rf_", "")]: e.target.value
                      }))}
                    />
                  </div>
                ))}

                <div className="pt-4">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    onClick={() => setCurrentView("checkout")}
                  >
                    {data.isPaid ? `Enroll Now — ${enrollmentPrice}` : "Enroll Now — Free"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {data.isPaid ? "Secure payment powered by Razorpay" : "No credit card required"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">LearnHub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Transform your career with expert-led online courses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer">About Us</div>
                <div className="hover:text-white cursor-pointer">All Courses</div>
                <div className="hover:text-white cursor-pointer">Instructors</div>
                <div className="hover:text-white cursor-pointer">Success Stories</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer">Help Center</div>
                <div className="hover:text-white cursor-pointer">FAQs</div>
                <div className="hover:text-white cursor-pointer">Contact Us</div>
                <div className="hover:text-white cursor-pointer">Privacy Policy</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@learnhub.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>www.learnhub.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 LearnHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CourseLandingPreview;
