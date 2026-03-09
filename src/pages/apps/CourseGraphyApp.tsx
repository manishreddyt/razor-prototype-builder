import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RazorpayAuthGate } from "@/components/RazorpayAuthGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  IndianRupee,
  ChevronDown,
  ChevronRight,
  Trash2,
  Rocket,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award,
  X,
} from "lucide-react";

// --- Types ---
interface Lesson { id: string; title: string }
interface Module { id: string; title: string; lessons: Lesson[] }
interface Course { id: string; name: string; description: string; price: number; modules: Module[]; createdAt: string }
interface StudentEnrollment { courseId: string; hasAccess: boolean }
interface Student { id: string; name: string; email: string; enrollments: StudentEnrollment[]; createdAt: string }

const LS_COURSES = "simple-lms-courses";
const LS_STUDENTS = "simple-lms-students";
const LS_ONBOARDING = "simple-lms-onboarding-done";

const loadCourses = (): Course[] => JSON.parse(localStorage.getItem(LS_COURSES) || "[]");
const saveCourses = (c: Course[]) => localStorage.setItem(LS_COURSES, JSON.stringify(c));
const loadStudents = (): Student[] => JSON.parse(localStorage.getItem(LS_STUDENTS) || "[]");
const saveStudents = (s: Student[]) => localStorage.setItem(LS_STUDENTS, JSON.stringify(s));
const uid = () => Math.random().toString(36).slice(2, 9);

// --- Demo Data ---
const DEMO_COURSES: Course[] = [
  {
    id: "demo-1", name: "Digital Marketing Masterclass", description: "Learn SEO, social media, and paid advertising from scratch.", price: 2999,
    modules: [
      { id: "m1", title: "Introduction to Digital Marketing", lessons: [{ id: "l1", title: "What is Digital Marketing?" }, { id: "l2", title: "The Marketing Funnel" }] },
      { id: "m2", title: "SEO Fundamentals", lessons: [{ id: "l3", title: "On-page SEO" }, { id: "l4", title: "Keyword Research" }, { id: "l5", title: "Link Building" }] },
      { id: "m3", title: "Social Media Strategy", lessons: [{ id: "l6", title: "Instagram Growth" }, { id: "l7", title: "LinkedIn for Business" }] },
    ],
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "demo-2", name: "Full Stack Web Development", description: "HTML, CSS, JavaScript, React, Node.js — build real projects.", price: 4999,
    modules: [
      { id: "m4", title: "HTML & CSS Basics", lessons: [{ id: "l8", title: "HTML Structure" }, { id: "l9", title: "CSS Flexbox & Grid" }] },
      { id: "m5", title: "JavaScript Essentials", lessons: [{ id: "l10", title: "Variables & Functions" }, { id: "l11", title: "DOM Manipulation" }] },
      { id: "m6", title: "React Fundamentals", lessons: [{ id: "l12", title: "Components & Props" }, { id: "l13", title: "State Management" }] },
    ],
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "demo-3", name: "Personal Finance & Investing", description: "Manage money, build wealth, and invest smartly.", price: 1499,
    modules: [
      { id: "m7", title: "Budgeting 101", lessons: [{ id: "l14", title: "Tracking Expenses" }, { id: "l15", title: "50/30/20 Rule" }] },
      { id: "m8", title: "Stock Market Basics", lessons: [{ id: "l16", title: "What are Stocks?" }, { id: "l17", title: "Mutual Funds vs ETFs" }] },
    ],
    createdAt: "2026-02-20T10:00:00Z",
  },
];

const DEMO_STUDENTS: Student[] = [
  { id: "s1", name: "Priya Sharma", email: "priya@example.com", enrollments: [{ courseId: "demo-1", hasAccess: true }, { courseId: "demo-3", hasAccess: true }], createdAt: "2026-01-20T10:00:00Z" },
  { id: "s2", name: "Rahul Verma", email: "rahul@example.com", enrollments: [{ courseId: "demo-2", hasAccess: true }], createdAt: "2026-02-05T10:00:00Z" },
  { id: "s3", name: "Ananya Patel", email: "ananya@example.com", enrollments: [{ courseId: "demo-1", hasAccess: true }, { courseId: "demo-2", hasAccess: true }], createdAt: "2026-02-10T10:00:00Z" },
  { id: "s4", name: "Vikram Singh", email: "vikram@example.com", enrollments: [{ courseId: "demo-3", hasAccess: false }], createdAt: "2026-02-15T10:00:00Z" },
  { id: "s5", name: "Neha Gupta", email: "neha@example.com", enrollments: [{ courseId: "demo-1", hasAccess: true }], createdAt: "2026-02-25T10:00:00Z" },
];

// --- Onboarding Component ---
const onboardingSteps = [
  {
    icon: Rocket,
    title: "Welcome to Simple LMS! 🎓",
    description: "Your all-in-one platform to create, sell, and manage online courses — right from your Razorpay dashboard.",
    highlights: ["Create courses with modules & lessons", "Manage student enrollments", "Track revenue & analytics"],
  },
  {
    icon: BookOpen,
    title: "Create Your First Course",
    description: "Build rich courses with multiple modules, each containing structured lessons. Set pricing and start selling instantly.",
    highlights: ["Drag-and-drop course builder", "Add unlimited modules & lessons", "Set course pricing in INR"],
  },
  {
    icon: Users,
    title: "Manage Your Students",
    description: "Add students, enroll them in courses, and control access with a single toggle. Track who has access to what.",
    highlights: ["Add students via email", "Enroll in multiple courses", "Grant/revoke access instantly"],
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    description: "Monitor your business with real-time analytics. See total courses, enrolled students, and revenue at a glance.",
    highlights: ["Revenue tracking", "Student enrollment stats", "Course performance insights"],
  },
];

const OnboardingModal = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const current = onboardingSteps[step];
  const isLast = step === onboardingSteps.length - 1;
  const Icon = current.icon;

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Progress */}
        <div className="flex gap-1 px-6 pt-5">
          {onboardingSteps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="px-6 pt-6 pb-2 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{current.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{current.description}</p>
          </div>
          <div className="space-y-2 text-left">
            {current.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {h}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t mt-4">
          <button onClick={onComplete} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={onComplete}>
                <Award className="h-4 w-4 mr-1" /> Get Started
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main App ---
const CourseGraphyApp = () => {
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [courses, setCourses] = useState<Course[]>(loadCourses);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Course form
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cModules, setCModules] = useState<Module[]>([]);

  // Student form
  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sCourseId, setSCourseId] = useState("");

  // Seed demo data & show onboarding on first visit
  useEffect(() => {
    const onboardingDone = localStorage.getItem(LS_ONBOARDING);
    if (!onboardingDone) {
      // Seed demo data if empty
      if (loadCourses().length === 0) {
        saveCourses(DEMO_COURSES);
        setCourses(DEMO_COURSES);
      }
      if (loadStudents().length === 0) {
        saveStudents(DEMO_STUDENTS);
        setStudents(DEMO_STUDENTS);
      }
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => { saveCourses(courses); }, [courses]);
  useEffect(() => { saveStudents(students); }, [students]);

  const completeOnboarding = () => {
    localStorage.setItem(LS_ONBOARDING, "true");
    setShowOnboarding(false);
    toast({ title: "Welcome to Simple LMS! 🎉", description: "We've added demo courses & students to get you started." });
  };

  const totalRevenue = students.reduce((sum, s) => {
    return sum + s.enrollments.filter((e) => e.hasAccess).reduce((acc, e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return acc + (course?.price || 0);
    }, 0);
  }, 0);

  const addModule = () => setCModules([...cModules, { id: uid(), title: "", lessons: [] }]);
  const addLesson = (moduleId: string) => {
    setCModules(cModules.map((m) => m.id === moduleId ? { ...m, lessons: [...m.lessons, { id: uid(), title: "" }] } : m));
  };

  const createCourse = () => {
    if (!cName.trim()) return;
    const course: Course = { id: uid(), name: cName, description: cDesc, price: parseFloat(cPrice) || 0, modules: cModules.filter((m) => m.title.trim()), createdAt: new Date().toISOString() };
    setCourses([course, ...courses]);
    setCName(""); setCDesc(""); setCPrice(""); setCModules([]);
    setShowCourseDialog(false);
    toast({ title: "Course created!", description: course.name });
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    setStudents(students.map((s) => ({ ...s, enrollments: s.enrollments.filter((e) => e.courseId !== id) })));
    toast({ title: "Course deleted" });
  };

  const createStudent = () => {
    if (!sName.trim() || !sEmail.trim()) return;
    const student: Student = { id: uid(), name: sName, email: sEmail, enrollments: sCourseId ? [{ courseId: sCourseId, hasAccess: true }] : [], createdAt: new Date().toISOString() };
    setStudents([student, ...students]);
    setSName(""); setSEmail(""); setSCourseId("");
    setShowStudentDialog(false);
    toast({ title: "Student added!", description: student.name });
  };

  const toggleAccess = (studentId: string, courseId: string) => {
    setStudents(students.map((s) => {
      if (s.id !== studentId) return s;
      const existing = s.enrollments.find((e) => e.courseId === courseId);
      if (existing) {
        return { ...s, enrollments: s.enrollments.map((e) => e.courseId === courseId ? { ...e, hasAccess: !e.hasAccess } : e) };
      }
      return { ...s, enrollments: [...s.enrollments, { courseId, hasAccess: true }] };
    }));
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
    toast({ title: "Student removed" });
  };

  // Active students = those with at least one active enrollment
  const activeStudents = students.filter((s) => s.enrollments.some((e) => e.hasAccess)).length;

  return (
    <DashboardLayout>
      <RazorpayAuthGate appName="Simple LMS">
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Simple LMS</h1>
            <p className="text-xs text-muted-foreground">Manage your courses and students</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* ===== DASHBOARD ===== */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{courses.length}</p>
                    <p className="text-xs text-muted-foreground">Total Courses</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{activeStudents}<span className="text-sm font-normal text-muted-foreground"> / {students.length}</span></p>
                    <p className="text-xs text-muted-foreground">Active Students</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FTUX Quick Actions */}
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setShowCourseDialog(true)}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Create a Course</p>
                    <p className="text-xs text-muted-foreground">Add modules, lessons & pricing</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => setShowStudentDialog(true)}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Add a Student</p>
                    <p className="text-xs text-muted-foreground">Enroll & manage access</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => { setShowOnboarding(true); }}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Rocket className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Take the Tour</p>
                    <p className="text-xs text-muted-foreground">Learn what you can do</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Recent courses */}
            {courses.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-foreground mb-3">Recent Courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {courses.slice(0, 3).map((course) => {
                    const enrolled = students.filter((s) => s.enrollments.some((e) => e.courseId === course.id && e.hasAccess)).length;
                    return (
                      <Card key={course.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm text-foreground">{course.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">₹{course.price}</Badge>
                            <Badge variant="outline" className="text-xs">{enrolled} students</Badge>
                            <Badge variant="outline" className="text-xs">{course.modules.length} modules</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ===== COURSES ===== */}
          <TabsContent value="courses">
            <div className="flex items-center justify-between mt-4 mb-4">
              <h2 className="text-sm font-semibold text-foreground">Your Courses ({courses.length})</h2>
              <Button size="sm" onClick={() => setShowCourseDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Create Course
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm border rounded-xl">
                No courses yet. Create your first course to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const enrolled = students.filter((s) => s.enrollments.some((e) => e.courseId === course.id && e.hasAccess)).length;
                  const isExpanded = expandedCourse === course.id;
                  return (
                    <Card key={course.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <button className="flex items-center gap-3 text-left flex-1" onClick={() => setExpandedCourse(isExpanded ? null : course.id)}>
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <div>
                              <h3 className="font-semibold text-sm text-foreground">{course.name}</h3>
                              <p className="text-xs text-muted-foreground">{course.description}</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs">₹{course.price}</Badge>
                            <Badge variant="outline" className="text-xs">{enrolled} students</Badge>
                            <Badge variant="outline" className="text-xs">{course.modules.length} modules</Badge>
                            <Button variant="ghost" size="icon" onClick={() => deleteCourse(course.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        {isExpanded && course.modules.length > 0 && (
                          <div className="mt-4 ml-7 space-y-2">
                            {course.modules.map((mod, mi) => (
                              <div key={mod.id} className="border rounded-lg p-3">
                                <p className="text-xs font-medium text-foreground">Module {mi + 1}: {mod.title}</p>
                                {mod.lessons.length > 0 && (
                                  <ul className="mt-1 ml-4 space-y-1">
                                    {mod.lessons.map((les, li) => (
                                      <li key={les.id} className="text-xs text-muted-foreground">
                                        Lesson {li + 1}: {les.title || "Untitled"}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== STUDENTS ===== */}
          <TabsContent value="students">
            <div className="flex items-center justify-between mt-4 mb-4">
              <h2 className="text-sm font-semibold text-foreground">Students ({students.length})</h2>
              <Button size="sm" onClick={() => setShowStudentDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Student
              </Button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm border rounded-xl">
                No students yet. Add your first student.
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-sm">{student.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {courses.map((course) => {
                              const enrollment = student.enrollments.find((e) => e.courseId === course.id);
                              const hasAccess = enrollment?.hasAccess || false;
                              return (
                                <div key={course.id} className="flex items-center gap-1.5">
                                  <Switch checked={hasAccess} onCheckedChange={() => toggleAccess(student.id, course.id)} className="scale-75" />
                                  <span className={`text-xs ${hasAccess ? "text-foreground" : "text-muted-foreground"}`}>{course.name}</span>
                                </div>
                              );
                            })}
                            {courses.length === 0 && <span className="text-xs text-muted-foreground">No courses created</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => deleteStudent(student.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== CREATE COURSE DIALOG ===== */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>Add a new course with modules and lessons.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Course Name</Label><Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Digital Marketing Masterclass" /></div>
            <div><Label>Description</Label><Textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder="What students will learn..." rows={2} /></div>
            <div><Label>Price (₹)</Label><Input type="number" value={cPrice} onChange={(e) => setCPrice(e.target.value)} placeholder="999" /></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Modules</Label>
                <Button variant="outline" size="sm" onClick={addModule}><Plus className="h-3 w-3 mr-1" /> Add Module</Button>
              </div>
              <div className="space-y-3">
                {cModules.map((mod, mi) => (
                  <div key={mod.id} className="border rounded-lg p-3 space-y-2">
                    <Input placeholder={`Module ${mi + 1} title`} value={mod.title} onChange={(e) => setCModules(cModules.map((m) => (m.id === mod.id ? { ...m, title: e.target.value } : m)))} />
                    {mod.lessons.map((les, li) => (
                      <Input key={les.id} placeholder={`Lesson ${li + 1} title`} value={les.title} className="ml-4 w-[calc(100%-1rem)]"
                        onChange={(e) => setCModules(cModules.map((m) => m.id === mod.id ? { ...m, lessons: m.lessons.map((l) => l.id === les.id ? { ...l, title: e.target.value } : l) } : m))} />
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => addLesson(mod.id)}><Plus className="h-3 w-3 mr-1" /> Add Lesson</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>Cancel</Button>
            <Button onClick={createCourse} disabled={!cName.trim()}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== ADD STUDENT DIALOG ===== */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>Add a new student and optionally enroll them in a course.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Student name" /></div>
            <div><Label>Email</Label><Input type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)} placeholder="student@email.com" /></div>
            {courses.length > 0 && (
              <div>
                <Label>Enroll in Course (optional)</Label>
                <Select value={sCourseId} onValueChange={setSCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                  <SelectContent>{courses.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDialog(false)}>Cancel</Button>
            <Button onClick={createStudent} disabled={!sName.trim() || !sEmail.trim()}>Add Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </RazorpayAuthGate>
    </DashboardLayout>
  );
};

export default CourseGraphyApp;
