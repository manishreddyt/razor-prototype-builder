import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar, Users, CreditCard, BarChart3,
  MessageSquare, Settings, FileText, CheckCircle2
} from "lucide-react";

const TestPage = () => {
  const navigate = useNavigate();

  const testLinks = [
    {
      title: "Coaching Management",
      description: "Test the 1:1 Coaching sessions management page with bookings tab",
      icon: Calendar,
      path: "/coaching/manage?id=coaching_001",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Payment Pages Management",
      description: "Test the payment pages management interface",
      icon: CreditCard,
      path: "/payment-pages/manage?id=pp_001",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Websites (Website Builder)",
      description: "Test the website builder and websites",
      icon: FileText,
      path: "/website-builder",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Session Communications",
      description: "Test automated session communications setup",
      icon: MessageSquare,
      path: "/communications/coaching_001",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Transactions",
      description: "View all transactions and payments",
      icon: BarChart3,
      path: "/transactions",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Customer Tracker",
      description: "Track customer interactions and data",
      icon: Users,
      path: "/customers",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Test Pages</h1>
          <p className="text-muted-foreground">
            Quick access to all prototype pages for testing
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="blade-stat">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Total Test Pages</p>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{testLinks.length}</p>
          </div>
          <div className="blade-stat">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Categories</p>
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">6</p>
          </div>
          <div className="blade-stat">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">Active</p>
          </div>
        </div>

        {/* Test Links Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Available Test Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testLinks.map((link) => (
              <div
                key={link.path}
                className="blade-card p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(link.path)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${link.color} flex-shrink-0`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                    <div className="mt-3">
                      <code className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">
                        {link.path}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="blade-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Latest Features
          </h2>
          <div className="space-y-3">
            {[
              {
                title: "Bookings Management",
                desc: "Manage 1:1 coaching sessions with reschedule, cancel & refund actions",
                status: "New",
                statusColor: "bg-emerald-100 text-emerald-700",
              },
              {
                title: "Session Communications",
                desc: "Automated pre-session reminders and post-session follow-ups",
                status: "Updated",
                statusColor: "bg-blue-100 text-blue-700",
              },
              {
                title: "Analytics Dashboard",
                desc: "Traffic sources, device breakdown, and conversion metrics",
                status: "Active",
                statusColor: "bg-purple-100 text-purple-700",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feature.desc}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-4 ${feature.statusColor}`}
                >
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="blade-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/coaching/manage?id=coaching_001")}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Coaching</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/website-builder")}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Smart Pages</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/transactions")}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Transactions</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/customers")}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Customers</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestPage;
