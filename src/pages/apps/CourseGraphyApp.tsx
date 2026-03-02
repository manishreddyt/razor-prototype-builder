import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  modules: Module[];
  createdAt: string;
}

interface StudentEnrollment {
  courseId: string;
  hasAccess: boolean;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrollments: StudentEnrollment[];
  createdAt: string;
}

const LS_COURSES = "course-graphy-courses";
const LS_STUDENTS = "course-graphy-students";

const loadCourses = (): Course[] => JSON.parse(localStorage.getItem(LS_COURSES) || "[]");
const saveCourses = (c: Course[]) => localStorage.setItem(LS_COURSES, JSON.stringify(c));
const loadStudents = (): Student[] => JSON.parse(localStorage.getItem(LS_STUDENTS) || "[]");
const saveStudents = (s: Student[]) => localStorage.setItem(LS_STUDENTS, JSON.stringify(s));

const uid = () => Math.random().toString(36).slice(2, 9);

const CourseGraphyApp = () => {
  const { toast } = useToast();
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

  useEffect(() => { saveCourses(courses); }, [courses]);
  useEffect(() => { saveStudents(students); }, [students]);

  const totalRevenue = students.reduce((sum, s) => {
    return sum + s.enrollments.filter((e) => e.hasAccess).reduce((acc, e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return acc + (course?.price || 0);
    }, 0);
  }, 0);

  // --- Course CRUD ---
  const addModule = () => {
    setCModules([...cModules, { id: uid(), title: "", lessons: [] }]);
  };

  const addLesson = (moduleId: string) => {
    setCModules(cModules.map((m) =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, { id: uid(), title: "" }] } : m
    ));
  };

  const createCourse = () => {
    if (!cName.trim()) return;
    const course: Course = {
      id: uid(),
      name: cName,
      description: cDesc,
      price: parseFloat(cPrice) || 0,
      modules: cModules.filter((m) => m.title.trim()),
      createdAt: new Date().toISOString(),
    };
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

  // --- Student CRUD ---
  const createStudent = () => {
    if (!sName.trim() || !sEmail.trim()) return;
    const student: Student = {
      id: uid(),
      name: sName,
      email: sEmail,
      enrollments: sCourseId ? [{ courseId: sCourseId, hasAccess: true }] : [],
      createdAt: new Date().toISOString(),
    };
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
      } else {
        return { ...s, enrollments: [...s.enrollments, { courseId, hasAccess: true }] };
      }
    }));
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
    toast({ title: "Student removed" });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Course Graphy</h1>
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
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{students.length}</p>
                    <p className="text-xs text-muted-foreground">Total Students</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {courses.length === 0 && students.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Get started by creating your first course.
              </div>
            )}
          </TabsContent>

          {/* ===== COURSES ===== */}
          <TabsContent value="courses">
            <div className="flex items-center justify-between mt-4 mb-4">
              <h2 className="text-sm font-semibold text-foreground">Your Courses</h2>
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
                          <button
                            className="flex items-center gap-3 text-left flex-1"
                            onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <div>
                              <h3 className="font-semibold text-sm text-foreground">{course.name}</h3>
                              <p className="text-xs text-muted-foreground">{course.description}</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs">₹{course.price}</Badge>
                            <Badge variant="outline" className="text-xs">{enrolled} students</Badge>
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
              <h2 className="text-sm font-semibold text-foreground">Students</h2>
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
                                  <Switch
                                    checked={hasAccess}
                                    onCheckedChange={() => toggleAccess(student.id, course.id)}
                                    className="scale-75"
                                  />
                                  <span className={`text-xs ${hasAccess ? "text-foreground" : "text-muted-foreground"}`}>
                                    {course.name}
                                  </span>
                                </div>
                              );
                            })}
                            {courses.length === 0 && (
                              <span className="text-xs text-muted-foreground">No courses created</span>
                            )}
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
            <div>
              <Label>Course Name</Label>
              <Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Digital Marketing Masterclass" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder="What students will learn..." rows={2} />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" value={cPrice} onChange={(e) => setCPrice(e.target.value)} placeholder="999" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Modules</Label>
                <Button variant="outline" size="sm" onClick={addModule}>
                  <Plus className="h-3 w-3 mr-1" /> Add Module
                </Button>
              </div>
              <div className="space-y-3">
                {cModules.map((mod, mi) => (
                  <div key={mod.id} className="border rounded-lg p-3 space-y-2">
                    <Input
                      placeholder={`Module ${mi + 1} title`}
                      value={mod.title}
                      onChange={(e) =>
                        setCModules(cModules.map((m) => (m.id === mod.id ? { ...m, title: e.target.value } : m)))
                      }
                    />
                    {mod.lessons.map((les, li) => (
                      <Input
                        key={les.id}
                        placeholder={`Lesson ${li + 1} title`}
                        value={les.title}
                        className="ml-4 w-[calc(100%-1rem)]"
                        onChange={(e) =>
                          setCModules(
                            cModules.map((m) =>
                              m.id === mod.id
                                ? {
                                    ...m,
                                    lessons: m.lessons.map((l) =>
                                      l.id === les.id ? { ...l, title: e.target.value } : l
                                    ),
                                  }
                                : m
                            )
                          )
                        }
                      />
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => addLesson(mod.id)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Lesson
                    </Button>
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
            <div>
              <Label>Name</Label>
              <Input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Student name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)} placeholder="student@email.com" />
            </div>
            {courses.length > 0 && (
              <div>
                <Label>Enroll in Course (optional)</Label>
                <Select value={sCourseId} onValueChange={setSCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
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
    </DashboardLayout>
  );
};

export default CourseGraphyApp;
