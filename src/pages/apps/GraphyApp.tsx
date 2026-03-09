import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RazorpayAuthGate } from "@/components/RazorpayAuthGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  IndianRupee,
  Video,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Smartphone,
  Globe,
  TrendingUp,
  Calendar,
  Download,
  Heart,
  Star,
} from "lucide-react";

const GraphyApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data
  const stats = {
    totalCourses: 8,
    totalStudents: 1247,
    revenue: 456789,
    liveClasses: 3,
    digitalProducts: 12,
    communityMembers: 890,
  };

  const recentCourses = [
    { id: 1, name: "Full Stack Web Development", students: 342, revenue: 102600, rating: 4.8 },
    { id: 2, name: "Digital Marketing Mastery", students: 456, revenue: 136800, rating: 4.9 },
    { id: 3, name: "UI/UX Design Bootcamp", students: 289, revenue: 86700, rating: 4.7 },
  ];

  const upcomingWebinars = [
    { id: 1, title: "SEO in 2026: What's Changed", date: "15 Mar 2026", registered: 234 },
    { id: 2, title: "Building Your Personal Brand", date: "20 Mar 2026", registered: 189 },
  ];

  const digitalProducts = [
    { id: 1, name: "React Component Library", downloads: 456, revenue: 22800 },
    { id: 2, name: "Marketing Templates Pack", downloads: 678, revenue: 33900 },
    { id: 3, name: "Design System Guide", downloads: 234, revenue: 11700 },
  ];

  return (
    <DashboardLayout>
      <RazorpayAuthGate appName="Graphy">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Graphy</h1>
                <p className="text-xs text-muted-foreground">All-in-one creator platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                <Smartphone className="h-3 w-3 mr-1" /> Mobile App Ready
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="webinars">Webinars</TabsTrigger>
              <TabsTrigger value="products">Digital Products</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            {/* ===== DASHBOARD ===== */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalCourses}</p>
                      <p className="text-xs text-muted-foreground">Active Courses</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalStudents.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Students</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">₹{stats.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">{stats.liveClasses}</p>
                      <p className="text-xs text-muted-foreground">Live Classes Today</p>
                    </div>
                    <Video className="h-8 w-8 text-indigo-600" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">{stats.digitalProducts}</p>
                      <p className="text-xs text-muted-foreground">Digital Products</p>
                    </div>
                    <ShoppingBag className="h-8 w-8 text-purple-600" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">{stats.communityMembers}</p>
                      <p className="text-xs text-muted-foreground">Community Members</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-pink-600" />
                  </CardContent>
                </Card>
              </div>

              {/* Top Courses */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Top Performing Courses
                </h2>
                <div className="space-y-3">
                  {recentCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-foreground">{course.name}</h3>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Users className="h-3 w-3 mr-1" /> {course.students} students
                              </Badge>
                              <span className="text-xs text-muted-foreground">₹{course.revenue.toLocaleString()} revenue</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-medium">{course.rating}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Mobile App Promotion */}
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">Launch Your Branded Mobile App</h3>
                      <p className="text-xs text-indigo-100 mt-1">Give your students a native iOS & Android app with your branding</p>
                    </div>
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50">Configure App</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== WEBINARS ===== */}
            <TabsContent value="webinars" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Upcoming Webinars</h2>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-1" /> Schedule Webinar
                </Button>
              </div>

              <div className="space-y-3">
                {upcomingWebinars.map((webinar) => (
                  <Card key={webinar.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Video className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">{webinar.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {webinar.date} • {webinar.registered} registered
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                          <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700">Go Live</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ===== DIGITAL PRODUCTS ===== */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Digital Products</h2>
                <Button size="sm">
                  <ShoppingBag className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {digitalProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="h-32 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3">
                        <Download className="h-8 w-8 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">{product.name}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{product.downloads} downloads</p>
                          <p className="text-sm font-semibold text-foreground">₹{product.revenue.toLocaleString()}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs">Manage</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ===== COMMUNITY ===== */}
            <TabsContent value="community" className="space-y-6">
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Build Your Community</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Engage with {stats.communityMembers} members through discussions, live chats, and exclusive content.
                </p>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <MessageSquare className="h-4 w-4 mr-1" /> Open Community Dashboard
                </Button>
              </div>
            </TabsContent>

            {/* ===== COURSES ===== */}
            <TabsContent value="courses" className="space-y-6">
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{stats.totalCourses} Active Courses</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Manage your course catalog, upload content, and track student progress.
                </p>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <GraduationCap className="h-4 w-4 mr-1" /> Create New Course
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </RazorpayAuthGate>
    </DashboardLayout>
  );
};

export default GraphyApp;
