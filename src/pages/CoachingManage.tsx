import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, Users, IndianRupee, Eye, Copy, ExternalLink,
  Download, Calendar, CheckCircle2, Edit, BarChart3, Clock,
  MoreHorizontal, X, RefreshCw, DollarSign, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Mock data - in real app, this would come from API based on page ID
const mockPageData = {
  id: "coaching_001",
  title: "1:1 Coaching",
  slug: "career-coaching",
  totalRevenue: "₹ 4,25,000.00",
  sessionPrice: "₹ 2,500.00",
  sessionsBooked: 170,
  pageUrl: "https://rzp.io/rzp/career-coaching",
  createdOn: "15 Jan 2026",
  status: "Active" as const,
  views: 2340,
  conversion: "15.2%",
};

// Mock booking data
const mockBookings = [
  {
    id: "book_001",
    customerName: "Priya Sharma",
    email: "priya.s@email.com",
    phone: "+91 98765 43210",
    sessionDate: "15 Mar 2026",
    sessionTime: "10:00 AM - 11:00 AM",
    status: "Confirmed",
    bookedOn: "5 Mar 2026, 2:30 PM",
    amount: "₹ 2,500",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "book_002",
    customerName: "Rahul Mehta",
    email: "rahul.m@email.com",
    phone: "+91 98765 43211",
    sessionDate: "16 Mar 2026",
    sessionTime: "2:00 PM - 3:00 PM",
    status: "Confirmed",
    bookedOn: "6 Mar 2026, 11:15 AM",
    amount: "₹ 2,500",
    meetingLink: "https://meet.google.com/xyz-abcd-efg",
  },
  {
    id: "book_003",
    customerName: "Ananya Gupta",
    email: "ananya.g@email.com",
    phone: "+91 98765 43212",
    sessionDate: "17 Mar 2026",
    sessionTime: "4:00 PM - 5:00 PM",
    status: "Confirmed",
    bookedOn: "7 Mar 2026, 9:45 AM",
    amount: "₹ 2,500",
    meetingLink: "https://meet.google.com/mno-pqrs-tuv",
  },
  {
    id: "book_004",
    customerName: "Vikram Singh",
    email: "vikram.s@email.com",
    phone: "+91 98765 43213",
    sessionDate: "14 Mar 2026",
    sessionTime: "11:00 AM - 12:00 PM",
    status: "Completed",
    bookedOn: "1 Mar 2026, 3:20 PM",
    amount: "₹ 2,500",
    meetingLink: "https://meet.google.com/wxy-zabc-def",
  },
  {
    id: "book_005",
    customerName: "Sneha Patel",
    email: "sneha.p@email.com",
    phone: "+91 98765 43214",
    sessionDate: "18 Mar 2026",
    sessionTime: "3:00 PM - 4:00 PM",
    status: "Cancelled",
    bookedOn: "8 Mar 2026, 1:10 PM",
    amount: "₹ 2,500",
    meetingLink: null,
  },
  {
    id: "book_006",
    customerName: "Arjun Kumar",
    email: "arjun.k@email.com",
    phone: "+91 98765 43215",
    sessionDate: "19 Mar 2026",
    sessionTime: "9:00 AM - 10:00 AM",
    status: "Confirmed",
    bookedOn: "9 Mar 2026, 5:30 PM",
    amount: "₹ 2,500",
    meetingLink: "https://meet.google.com/ghi-jklm-nop",
  },
];

const recentTransactions = [
  { name: "Priya Sharma", email: "priya.s@email.com", amount: "₹ 2,500", date: "9 Mar 2026, 2:45 PM", status: "Paid" },
  { name: "Rahul Mehta", email: "rahul.m@email.com", amount: "₹ 2,500", date: "8 Mar 2026, 11:30 AM", status: "Paid" },
  { name: "Ananya Gupta", email: "ananya.g@email.com", amount: "₹ 2,500", date: "7 Mar 2026, 4:15 PM", status: "Paid" },
  { name: "Vikram Singh", email: "vikram.s@email.com", amount: "₹ 2,500", date: "6 Mar 2026, 9:20 AM", status: "Paid" },
  { name: "Sneha Patel", email: "sneha.p@email.com", amount: "₹ 2,500", date: "5 Mar 2026, 3:50 PM", status: "Refunded" },
  { name: "Arjun Kumar", email: "arjun.k@email.com", amount: "₹ 2,500", date: "4 Mar 2026, 10:15 AM", status: "Paid" },
  { name: "Meera Iyer", email: "meera.i@email.com", amount: "₹ 2,500", date: "3 Mar 2026, 1:20 PM", status: "Paid" },
  { name: "Rohan Nair", email: "rohan.n@email.com", amount: "₹ 2,500", date: "2 Mar 2026, 5:30 PM", status: "Failed" },
];

const CoachingManage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get("id") || "coaching_001";
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7days");
  const [bookings, setBookings] = useState(mockBookings);

  // Dialog states
  const [rescheduleDialog, setRescheduleDialog] = useState<{ open: boolean; booking: typeof mockBookings[0] | null }>({ open: false, booking: null });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; booking: typeof mockBookings[0] | null }>({ open: false, booking: null });
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; booking: typeof mockBookings[0] | null }>({ open: false, booking: null });

  // Form states
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // In real app, fetch page data based on pageId
  const pageData = mockPageData;

  const copyLink = () => {
    navigator.clipboard.writeText(pageData.pageUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleReschedule = (booking: typeof mockBookings[0]) => {
    setRescheduleDialog({ open: true, booking });
    setNewDate("");
    setNewTime("");
  };

  const confirmReschedule = () => {
    if (!rescheduleDialog.booking || !newDate || !newTime) {
      toast.error("Please select both date and time");
      return;
    }

    // Update booking
    const updatedBookings = bookings.map(b =>
      b.id === rescheduleDialog.booking?.id
        ? { ...b, sessionDate: newDate, sessionTime: newTime }
        : b
    );
    setBookings(updatedBookings);

    toast.success("Session rescheduled successfully!");
    setRescheduleDialog({ open: false, booking: null });
  };

  const handleCancel = (booking: typeof mockBookings[0]) => {
    setCancelDialog({ open: true, booking });
  };

  const confirmCancel = () => {
    if (!cancelDialog.booking) return;

    const updatedBookings = bookings.map(b =>
      b.id === cancelDialog.booking?.id
        ? { ...b, status: "Cancelled" }
        : b
    );
    setBookings(updatedBookings);

    toast.success("Session cancelled successfully!");
    setCancelDialog({ open: false, booking: null });
  };

  const handleRefund = (booking: typeof mockBookings[0]) => {
    setRefundDialog({ open: true, booking });
  };

  const confirmRefund = () => {
    if (!refundDialog.booking) return;

    // In real app, process refund via API
    toast.success(`Refund of ${refundDialog.booking.amount} processed successfully!`);
    setRefundDialog({ open: false, booking: null });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "blade-badge-paid";
      case "Completed":
        return "bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium";
      case "Cancelled":
        return "blade-badge-expired";
      default:
        return "blade-badge-pending";
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/website-builder")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{pageData.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your coaching sessions and bookings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-1" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/s/${pageData.slug}`, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-1" /> Open Page
            </Button>
            <Button size="sm" onClick={() => navigate(`/website-builder/editor?id=${pageData.id}`)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Page
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: pageData.totalRevenue, icon: IndianRupee, color: "text-emerald-600" },
                { label: "Sessions Booked", value: pageData.sessionsBooked.toString(), icon: Calendar, color: "text-blue-600" },
                { label: "Page Views", value: pageData.views.toLocaleString(), icon: Eye, color: "text-purple-600" },
                { label: "Conversion", value: pageData.conversion, icon: TrendingUp, color: "text-orange-600" },
              ].map((stat) => (
                <div key={stat.label} className="blade-stat">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue Trend */}
            <div className="blade-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Revenue Trend
                </h2>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 h-48">
                {[35, 52, 48, 72, 68, 85, 92, 78, 95, 88, 102, 115, 98, 120].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-muted rounded-t relative" style={{ height: "100%" }}>
                      <div
                        className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t absolute bottom-0"
                        style={{ height: `${(val / 120) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Upcoming Sessions
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")}>
                  View All
                </Button>
              </div>
              <div className="blade-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="blade-table-header px-4 py-3 text-left">Customer</th>
                      <th className="blade-table-header px-4 py-3 text-left">Date & Time</th>
                      <th className="blade-table-header px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.filter(b => b.status === "Confirmed").slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-semibold text-primary">
                                {booking.customerName.split(" ").map(n => n[0]).join("")}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">{booking.customerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground text-xs">
                          <div className="font-medium">{booking.sessionDate}</div>
                          <div className="text-muted-foreground">{booking.sessionTime}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadgeClass(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">All Bookings</h2>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>

            <div className="blade-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="blade-table-header px-4 py-3 text-left">Customer</th>
                    <th className="blade-table-header px-4 py-3 text-left">Session Date & Time</th>
                    <th className="blade-table-header px-4 py-3 text-left">Booked On</th>
                    <th className="blade-table-header px-4 py-3 text-left">Amount</th>
                    <th className="blade-table-header px-4 py-3 text-left">Status</th>
                    <th className="blade-table-header px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-primary">
                              {booking.customerName.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{booking.customerName}</div>
                            <div className="text-xs text-muted-foreground">{booking.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground text-xs">{booking.sessionDate}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {booking.sessionTime}
                        </div>
                        {booking.meetingLink && (
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            <Video className="h-3 w-3" />
                            Join Meeting
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{booking.bookedOn}</td>
                      <td className="px-4 py-3 text-foreground font-medium">{booking.amount}</td>
                      <td className="px-4 py-3">
                        <span className={getStatusBadgeClass(booking.status)}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {booking.status === "Confirmed" && (
                              <>
                                <DropdownMenuItem onClick={() => handleReschedule(booking)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCancel(booking)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Session
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleRefund(booking)}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
                Showing {bookings.length} bookings
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">All Transactions</h2>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>

            <div className="blade-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="blade-table-header px-4 py-3 text-left">Customer</th>
                    <th className="blade-table-header px-4 py-3 text-left">Email</th>
                    <th className="blade-table-header px-4 py-3 text-left">Amount</th>
                    <th className="blade-table-header px-4 py-3 text-left">Date</th>
                    <th className="blade-table-header px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((txn, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-primary">
                              {txn.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{txn.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{txn.email}</td>
                      <td className="px-4 py-3 text-foreground font-medium">{txn.amount}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{txn.date}</td>
                      <td className="px-4 py-3">
                        <span className={txn.status === "Paid" ? "blade-badge-paid" : txn.status === "Pending" ? "blade-badge-pending" : txn.status === "Refunded" ? "blade-badge-expired" : "blade-badge-expired"}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
                Showing {recentTransactions.length} transactions
              </div>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Workflow automation coming soon</p>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div className="blade-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Traffic Sources</h3>
                <div className="space-y-3">
                  {[
                    { source: "Direct", visits: 856, percent: 37 },
                    { source: "Social Media", visits: 702, percent: 30 },
                    { source: "Email", visits: 468, percent: 20 },
                    { source: "Referral", visits: 314, percent: 13 },
                  ].map((item) => (
                    <div key={item.source}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{item.source}</span>
                        <span className="text-muted-foreground">{item.visits} visits</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="blade-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Device Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { device: "Mobile", visits: 1404, percent: 60 },
                    { device: "Desktop", visits: 702, percent: 30 },
                    { device: "Tablet", visits: 234, percent: 10 },
                  ].map((item) => (
                    <div key={item.device}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{item.device}</span>
                        <span className="text-muted-foreground">{item.visits} visits</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Configure automated session reminders and follow-ups</p>
              <Button onClick={() => navigate(`/communications/${pageId}`)}>
                Configure Communications
              </Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Settings coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog({ open, booking: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Update the session date and time for {rescheduleDialog.booking?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-date">New Date</Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-time">New Time Slot</Label>
              <Input
                id="new-time"
                type="text"
                placeholder="e.g., 2:00 PM - 3:00 PM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button onClick={confirmReschedule}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, booking: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the session with {cancelDialog.booking?.customerName}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Session: {cancelDialog.booking?.sessionDate} at {cancelDialog.booking?.sessionTime}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. The customer will be notified via email.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, booking: null })}>
              Keep Session
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialog.open} onOpenChange={(open) => setRefundDialog({ open, booking: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund payment for {refundDialog.booking?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Amount: <span className="font-semibold text-foreground">{refundDialog.booking?.amount}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              The refund will be processed to the original payment method within 5-7 business days.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button onClick={confirmRefund}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CoachingManage;
