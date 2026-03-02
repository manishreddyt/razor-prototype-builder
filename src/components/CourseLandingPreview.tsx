import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Play, Clock, Users, Award, CheckCircle2, Star, BookOpen,
  Video, FileText, Download, MessageCircle, Globe, Mail, Phone,
  ArrowLeft, Lock, ChevronDown, ArrowRight,
} from "lucide-react";
import type { CourseData } from "@/pages/CourseCreate";
import InlineEditable from "@/components/InlineEditable";
import { toast } from "sonner";

interface CourseLandingPreviewProps {
  data: CourseData;
  interactive?: boolean;
  editable?: boolean;
  onEdit?: (field: string, value: string) => void;
}

type View = "landing" | "checkout";

const CourseLandingPreview = ({ data, interactive = false, editable = false, onEdit }: CourseLandingPreviewProps) => {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [enrollmentData, setEnrollmentData] = useState({ name: "", email: "", phone: "" });
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const handleEnroll = () => {
    if (!enrollmentData.name || !enrollmentData.email) {
      toast.error("Please fill in required fields");
      return;
    }
    if (data.isPaid) {
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        return;
      }
      const options = {
        key: "rzp_live_SFFFdBjmPbTKZL",
        amount: (data.pricingModel === "one-time" ? data.amount : (data.subscriptionAmount || 999)) * 100,
        currency: "INR",
        name: data.name,
        description: `Enroll in ${data.name}`,
        image: data.bannerImage,
        prefill: { name: enrollmentData.name, email: enrollmentData.email, contact: enrollmentData.phone },
        theme: { color: "#0066FF" },
        handler: (response: any) => {
          toast.success("Enrollment successful! 🎉", { description: `Payment ID: ${response.razorpay_payment_id}` });
          setEnrollmentData({ name: "", email: "", phone: "" });
          setCurrentView("landing");
        },
        modal: { ondismiss: () => toast.info("Enrollment cancelled") },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => toast.error("Payment failed!", { description: response.error.description }));
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
    : `₹${(data.subscriptionAmount || 999).toLocaleString()}/mo`;

  // ─── Checkout View ───
  if (currentView === "checkout" && interactive) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)" }}>
        <div className="border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ color: "#0f172a" }}>LearnHub</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("landing")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-6">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#0f172a" }}>Complete Your Enrollment</h1>
                <p style={{ color: "#64748b" }} className="mt-2">Fill in your details to enroll in {data.name}</p>
              </div>
              <div className="rounded-2xl shadow-xl p-8 space-y-6" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>Student Information</h2>
                <div className="space-y-4">
                  {data.enrollmentFields.map(field => (
                    <div key={field.id}>
                      <Label className="text-sm font-medium" style={{ color: "#374151" }}>
                        {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                      </Label>
                      <Input type={field.type} placeholder={field.placeholder} required={field.required} className="mt-1.5"
                        value={enrollmentData[field.id.replace("rf_", "") as keyof typeof enrollmentData] || ""}
                        onChange={(e) => setEnrollmentData(prev => ({ ...prev, [field.id.replace("rf_", "")]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div className="pt-6" style={{ borderTop: "1px solid #e2e8f0" }}>
                  <Button className="w-full text-lg py-6" style={{ background: "#2563eb" }} onClick={handleEnroll}>
                    <Lock className="h-5 w-5 mr-2" />
                    {data.isPaid ? `Pay ${enrollmentPrice} & Enroll` : "Enroll Now - Free"}
                  </Button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs" style={{ color: "#94a3b8" }}>
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure payment</span>
                    <span>•</span><span>Powered by Razorpay</span><span>•</span><span>30-day refund policy</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="rounded-2xl shadow-xl p-6 sticky top-24" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: "#0f172a" }}>Order Summary</h2>
                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  <img src={data.bannerImage} alt={data.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold" style={{ color: "#0f172a" }}>{data.name}</h3>
                <p className="text-sm mt-1" style={{ color: "#64748b" }}>{data.tagline}</p>
                <div className="flex items-center gap-4 text-xs py-3 my-3" style={{ color: "#64748b", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                  <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {totalLessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {data.courseDuration}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span style={{ color: "#2563eb" }}>{enrollmentPrice}</span>
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
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: "#0f172a" }}>LearnHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#64748b" }}>
            <a href="#overview" className="hover:text-[#2563eb] transition-colors">Overview</a>
            <a href="#curriculum" className="hover:text-[#2563eb] transition-colors">Curriculum</a>
            <a href="#instructor" className="hover:text-[#2563eb] transition-colors">Instructor</a>
            <a href="#reviews" className="hover:text-[#2563eb] transition-colors">Reviews</a>
          </div>
          <Button size="sm" style={{ background: "#2563eb" }} onClick={() => interactive && setCurrentView("checkout")}>
            Enroll — {enrollmentPrice}
          </Button>
        </div>
      </nav>

      {/* Hero — Split layout with asymmetric design */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)" }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-5" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}>
                  {data.courseFormat === "self-paced" ? "⏱️ Self-paced" : data.courseFormat === "cohort-based" ? "👥 Cohort" : "📹 Live"}
                </Badge>
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }}>
                  🔥 Bestseller
                </Badge>
              </div>

              <InlineEditable value={data.name} field="name" editable={editable} onEdit={onEdit} as="h1"
                className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white" />

              <InlineEditable value={data.tagline} field="tagline" editable={editable} onEdit={onEdit} as="p"
                className="text-xl leading-relaxed" style={{ color: "#94a3b8" }} />

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                  <span className="font-semibold text-white text-sm">4.8</span>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>(2,340)</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: "#94a3b8" }}>
                  <Users className="h-4 w-4" /><span className="text-sm">12,456 enrolled</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl shadow-xl"
                  style={{ background: "#2563eb" }}
                  onClick={() => interactive && setCurrentView("checkout")}>
                  Enroll Now — {enrollmentPrice}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="px-6 py-6 text-base rounded-xl"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", background: "rgba(255,255,255,0.05)" }}>
                  <Play className="h-5 w-5 mr-2" /> Preview
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm pt-2" style={{ color: "#94a3b8" }}>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {data.courseDuration}</span>
                <span className="flex items-center gap-2"><Video className="h-4 w-4" /> {totalLessons} lessons</span>
                {data.certificateOffered && <span className="flex items-center gap-2"><Award className="h-4 w-4" /> Certificate</span>}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={data.bannerImage} alt={data.name} className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer rounded-2xl">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl" style={{ background: "rgba(255,255,255,0.95)" }}>
                    <Play className="h-8 w-8 ml-1" style={{ color: "#2563eb" }} />
                  </div>
                </div>
              </div>
              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 rounded-xl p-4 shadow-2xl" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#dbeafe" }}>
                    <Users className="h-5 w-5" style={{ color: "#2563eb" }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>12K+</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>Students enrolled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-6" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-12 text-sm" style={{ color: "#64748b" }}>
            <span>Featured in</span>
            {["Product Hunt", "YourStory", "Inc42", "TechCrunch"].map((name) => (
              <span key={name} className="font-semibold text-base" style={{ color: "#94a3b8" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Learn — Card grid */}
      <section id="overview" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#dbeafe", color: "#2563eb" }}>
              COURSE HIGHLIGHTS
            </Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>What You'll Learn</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "#64748b" }}>
              Master in-demand skills with our comprehensive curriculum
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.whatYouWillLearn.map((item, idx) => (
              <div key={idx} className="group rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ border: "1px solid #e2e8f0", background: "#fff" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `hsl(${220 + idx * 30}, 80%, 95%)` }}>
                  <CheckCircle2 className="h-6 w-6" style={{ color: `hsl(${220 + idx * 30}, 70%, 50%)` }} />
                </div>
                <p className="font-medium leading-relaxed" style={{ color: "#1e293b" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Includes + Pricing Side by Side */}
      <section className="py-24" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-bold mb-8" style={{ color: "#0f172a" }}>Everything You Need</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.courseIncludes.map((item, idx) => {
                  const icons: Record<string, any> = { "Videos": Video, "PDFs": FileText, "Assignments": Download, "Quizzes": CheckCircle2, "Certificate": Award, "Live Q&A": MessageCircle };
                  const Icon = icons[item] || CheckCircle2;
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#dbeafe" }}>
                        <Icon className="h-5 w-5" style={{ color: "#2563eb" }} />
                      </div>
                      <span className="font-medium" style={{ color: "#1e293b" }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl shadow-xl p-8 sticky top-24" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                <div className="text-center space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Course Price</p>
                  <div className="text-5xl font-extrabold" style={{ color: "#0f172a" }}>{enrollmentPrice}</div>
                  {data.pricingModel === "subscription" && <p className="text-sm" style={{ color: "#64748b" }}>Cancel anytime</p>}
                  <Button className="w-full py-6 text-base font-semibold rounded-xl shadow-lg"
                    style={{ background: "#2563eb" }}
                    onClick={() => interactive && setCurrentView("checkout")}>
                    Enroll Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>30-day money-back guarantee</p>
                </div>
                <div className="mt-6 pt-6 space-y-3" style={{ borderTop: "1px solid #e2e8f0" }}>
                  {["Lifetime access", "Mobile & desktop", "Certificate of completion", "Downloadable resources"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "#475569" }}>
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#22c55e" }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#fef3c7", color: "#b45309" }}>
              STRUCTURED LEARNING
            </Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Course Curriculum</h2>
            <p className="mt-4 text-lg" style={{ color: "#64748b" }}>
              {data.modules.length} modules · {totalLessons} lessons · {data.courseDuration}
            </p>
          </div>
          <div className="space-y-3">
            {data.modules.map((mod, idx) => (
              <div key={mod.id} className="rounded-xl overflow-hidden transition-all duration-200"
                style={{ border: expandedModule === mod.id ? "1px solid #3b82f6" : "1px solid #e2e8f0" }}>
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: "#dbeafe", color: "#2563eb" }}>{idx + 1}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: "#0f172a" }}>{mod.title}</h3>
                      {expandedModule === mod.id && <p className="text-sm mt-1" style={{ color: "#64748b" }}>{mod.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: "#64748b" }}>
                    <span>{mod.lessons} lessons</span>
                    <span>{mod.duration}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedModule === mod.id ? "rotate-180" : ""}`} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor */}
      <section id="instructor" className="py-24" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#ede9fe", color: "#7c3aed" }}>
              MEET YOUR INSTRUCTOR
            </Badge>
          </div>
          <div className="rounded-2xl shadow-xl p-10" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}>
                {data.instructor.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold" style={{ color: "#0f172a" }}>{data.instructor.name}</h3>
                <p className="font-medium mt-1" style={{ color: "#2563eb" }}>{data.instructor.title}</p>
                <p className="mt-4 leading-relaxed" style={{ color: "#475569" }}>{data.instructor.bio}</p>
                {data.instructor.credentials && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {data.instructor.credentials.map((cred, idx) => (
                      <Badge key={idx} variant="secondary" className="rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>{cred}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-8 mt-6 text-sm" style={{ color: "#64748b" }}>
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> 15K+ students</span>
                  <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> 8 courses</span>
                  <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#dcfce7", color: "#16a34a" }}>
              STUDENT REVIEWS
            </Badge>
            <h2 className="text-4xl font-bold" style={{ color: "#0f172a" }}>Loved by Students</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", role: "Software Engineer", text: "This course completely transformed my understanding. The hands-on projects were invaluable!", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
              { name: "Rahul Verma", role: "Product Manager", text: "Excellent structure and real-world examples. I was able to apply what I learned immediately at work.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
              { name: "Ananya Patel", role: "Data Scientist", text: "The instructor's teaching style is outstanding. Complex topics made simple and easy to understand.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
            ].map((t, idx) => (
              <div key={idx} className="rounded-2xl p-6 transition-all duration-300 hover:shadow-xl"
                style={{ border: "1px solid #e2e8f0", background: "#fff" }}>
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="leading-relaxed mb-6" style={{ color: "#475569" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#0f172a" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#64748b" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Learning?</h2>
          <p className="text-lg mb-10" style={{ color: "#94a3b8" }}>
            Join 12,000+ students already learning. Get lifetime access and start building real-world skills today.
          </p>
          <Button size="lg" className="px-12 py-7 text-lg font-semibold rounded-xl shadow-2xl"
            style={{ background: "#2563eb" }}
            onClick={() => interactive && setCurrentView("checkout")}>
            Enroll Now — {enrollmentPrice}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm mt-4" style={{ color: "#64748b" }}>Secure payment powered by Razorpay · 30-day refund policy</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ background: "#0f172a" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">LearnHub</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>Transform your career with expert-led courses.</p>
            </div>
            {[
              { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
              { title: "Support", links: ["Help Center", "FAQs", "Contact", "Privacy"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <div className="space-y-2.5 text-sm" style={{ color: "#94a3b8" }}>
                  {col.links.map(l => <div key={l} className="hover:text-white cursor-pointer transition-colors">{l}</div>)}
                </div>
              </div>
            ))}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2.5 text-sm" style={{ color: "#94a3b8" }}>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@learnhub.com</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 text-center text-sm" style={{ borderTop: "1px solid #1e293b", color: "#64748b" }}>
            © 2026 LearnHub. All rights reserved. · Powered by Razorpay
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CourseLandingPreview;
