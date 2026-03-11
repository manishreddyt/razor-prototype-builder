import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentConfigChat from "@/components/AgentConfigChat";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  PhoneCall,
  Megaphone,
  MessageCircle,
  Star,
  Play,
  Pause,
  Settings,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  IndianRupee,
  Activity,
  Sparkles,
  Instagram,
  GraduationCap,
} from "lucide-react";
import { mockInstagramActivities, instagramMetrics, mockConversations } from "@/data/instagramMockData";
import { InstagramConversationViewer } from "@/components/InstagramConversationViewer";
import { InstagramSetupWizard } from "@/components/InstagramSetupWizard";
import { EducationCopilotChat } from "@/components/EducationCopilotChat";

type AgentStatus = "draft" | "configured" | "deployed" | "paused";

interface AgentActivity {
  id: string;
  timestamp: string;
  action: string;
  outcome: "success" | "interested" | "pending" | "failed";
  details: string;
}

interface AgentData {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: any;
  status: AgentStatus;
  goal: string;
  metrics: { leads: number; conversions: number; revenue: string };
  activities: AgentActivity[];
}

const agentsMap: Record<string, AgentData> = {
  sales: {
    id: "sales",
    type: "sales",
    title: "Sales Agent",
    description: "Automatically follows up with free webinar leads via calls, pitches your paid courses, handles objections, and converts them into paying students.",
    icon: PhoneCall,
    status: "deployed",
    goal: "Call all free webinar attendees within 1 hour, pitch Advanced Python Course, send payment link if interested, schedule follow-up for maybes.",
    metrics: { leads: 1247, conversions: 312, revenue: "₹15,60,000" },
    activities: [
      { id: "a1", timestamp: "2 min ago", action: "Called +91-98xxx-xx432 — Pitched Advanced Python Course", outcome: "success", details: "Student converted. Payment link sent. ₹4,999 received." },
      { id: "a2", timestamp: "15 min ago", action: "Called +91-87xxx-xx891 — Pitched Advanced Python Course", outcome: "interested", details: "Interested but wants to discuss with family. Follow-up scheduled for tomorrow 6 PM." },
      { id: "a3", timestamp: "28 min ago", action: "Called +91-76xxx-xx234 — Pitched Advanced Python Course", outcome: "failed", details: "Not interested. Reason: Already enrolled in competitor course." },
      { id: "a4", timestamp: "45 min ago", action: "Called +91-99xxx-xx567 — Pitched Data Science Masterclass", outcome: "success", details: "Student converted immediately. Payment of ₹7,499 received." },
      { id: "a5", timestamp: "1 hr ago", action: "Called +91-88xxx-xx123 — Pitched Advanced Python Course", outcome: "pending", details: "No answer. Will retry in 2 hours." },
      { id: "a6", timestamp: "1.5 hrs ago", action: "Sent WhatsApp follow-up to 23 leads from yesterday's webinar", outcome: "success", details: "18 opened, 7 clicked payment link, 3 converted." },
      { id: "a7", timestamp: "2 hrs ago", action: "Called +91-77xxx-xx890 — Pitched Web Dev Bootcamp", outcome: "interested", details: "Wants EMI option. Sent EMI payment link." },
      { id: "a8", timestamp: "3 hrs ago", action: "Batch follow-up: 45 leads from 'Python Basics' free webinar", outcome: "success", details: "Completed 45 calls. 12 converted, 18 interested, 15 not interested." },
    ],
  },
  marketing: {
    id: "marketing",
    type: "marketing",
    title: "Marketing Agent",
    description: "Runs targeted campaigns across channels and retargets students who dropped off. Optimises ad spend and messaging to maximize enrollment rates.",
    icon: Megaphone,
    status: "configured",
    goal: "Retarget all free webinar attendees who didn't purchase within 48 hours. Run Meta + Google ads with testimonial creatives. Send email sequence over 7 days.",
    metrics: { leads: 3420, conversions: 456, revenue: "₹22,80,000" },
    activities: [
      { id: "m1", timestamp: "10 min ago", action: "Launched retargeting campaign on Meta for 'Python Basics' attendees", outcome: "success", details: "Audience size: 892. Budget: ₹5,000/day. Estimated reach: 12,000." },
      { id: "m2", timestamp: "1 hr ago", action: "Sent email #3 of nurture sequence to 234 leads", outcome: "success", details: "Open rate: 34%. Click rate: 12%. 8 conversions so far." },
      { id: "m3", timestamp: "3 hrs ago", action: "Optimised Google Ads campaign — paused low-performing ad sets", outcome: "success", details: "Reduced CPA from ₹180 to ₹120 by pausing 3 underperforming ad sets." },
      { id: "m4", timestamp: "6 hrs ago", action: "Created lookalike audience from top 100 paying students", outcome: "pending", details: "Audience is being processed by Meta. Expected ready in 24 hours." },
    ],
  },
  support: {
    id: "support",
    type: "support",
    title: "Customer Service Agent",
    description: "WhatsApp-based AI agent that handles customer queries, resolves support tickets, shares course materials, and escalates complex issues — available 24/7.",
    icon: MessageCircle,
    status: "deployed",
    goal: "Handle all WhatsApp queries 24/7. Answer FAQs instantly, share course materials, create tickets for complex issues, escalate to human if unresolved in 2 hours.",
    metrics: { leads: 2890, conversions: 2601, revenue: "—" },
    activities: [
      { id: "s1", timestamp: "1 min ago", action: "Resolved query: 'How do I access Module 5?' — Sent direct link", outcome: "success", details: "Student accessed module within 2 minutes." },
      { id: "s2", timestamp: "8 min ago", action: "Handled refund request from +91-98xxx-xx111", outcome: "pending", details: "Escalated to human agent. Refund policy shared with student." },
      { id: "s3", timestamp: "20 min ago", action: "Answered FAQ: 'Is certificate included?' — Yes, auto-generated", outcome: "success", details: "Shared certificate preview and explained the process." },
      { id: "s4", timestamp: "35 min ago", action: "Shared course recording link with 12 students who missed live session", outcome: "success", details: "All 12 students acknowledged receipt." },
      { id: "s5", timestamp: "1 hr ago", action: "Created support ticket #1247: Payment deducted but access not granted", outcome: "pending", details: "Escalated to tech team. Student notified about 4-hour resolution window." },
    ],
  },
  feedback: {
    id: "feedback",
    type: "feedback",
    title: "Feedback Agent",
    description: "Automatically collects NPS scores and reviews after course completion. Identifies at-risk students early and gathers testimonials from happiest learners.",
    icon: Star,
    status: "draft",
    goal: "",
    metrics: { leads: 890, conversions: 756, revenue: "—" },
    activities: [
      { id: "f1", timestamp: "30 min ago", action: "Collected NPS from Batch #12 — 'Advanced Python Course'", outcome: "success", details: "23 responses. Avg score: 8.4. Promoters: 15, Passives: 6, Detractors: 2." },
      { id: "f2", timestamp: "2 hrs ago", action: "Requested testimonial from 8 promoters (NPS 9-10)", outcome: "success", details: "5 submitted testimonials. 3 pending." },
      { id: "f3", timestamp: "4 hrs ago", action: "Flagged at-risk student: Low engagement + NPS 3", outcome: "interested", details: "Sent personalised check-in message. Offered 1-on-1 doubt session." },
      { id: "f4", timestamp: "1 day ago", action: "Generated weekly NPS report for all active courses", outcome: "success", details: "Overall NPS: 72. Python: 84, Web Dev: 68, Data Science: 71." },
    ],
  },
  instagram: {
    id: "instagram",
    type: "instagram",
    title: "Social Commerce",
    description: "Auto-respond to Instagram DMs, convert comments to sales, send payment links automatically for your e-commerce business.",
    icon: Instagram,
    status: "deployed",
    goal: "Respond to DMs within 2 min, convert comments to sales, send payment links automatically, remind cart abandoners within 24 hours",
    metrics: {
      leads: instagramMetrics.dmsHandled,
      conversions: instagramMetrics.commentsConverted,
      revenue: `₹${instagramMetrics.revenue.toLocaleString()}`,
    },
    activities: mockInstagramActivities,
  },
  education: {
    id: "education",
    type: "education",
    title: "Education Co-pilot",
    description: "Intelligent co-pilot for online education businesses that guides Smart Page creation and campaign automation.",
    icon: GraduationCap,
    status: "draft",
    goal: "",
    metrics: { leads: 0, conversions: 0, revenue: "₹0" },
    activities: [],
  },
};

const outcomeConfig: Record<string, { label: string; icon: any; className: string }> = {
  success: { label: "Success", icon: CheckCircle2, className: "blade-badge-success" },
  interested: { label: "Interested", icon: AlertCircle, className: "blade-badge-warning" },
  pending: { label: "Pending", icon: Clock, className: "blade-badge-info" },
  failed: { label: "Failed", icon: XCircle, className: "blade-badge-cancelled" },
};

const statusConfig: Record<AgentStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  configured: { label: "Configured", variant: "secondary" },
  deployed: { label: "Deployed", variant: "default" },
  paused: { label: "Paused", variant: "destructive" },
};

const AgentDetail = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const agentData = agentsMap[agentId || "sales"];

  const [status, setStatus] = useState<AgentStatus>(agentData?.status || "draft");
  const [goal, setGoal] = useState(agentData?.goal || "");
  const [showConfig, setShowConfig] = useState(false);
  const [showInstagramSetup, setShowInstagramSetup] = useState(false);
  const [showEducationCopilot, setShowEducationCopilot] = useState(false);

  if (!agentData) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Agent not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/agents")}>
            Back to Agents
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = agentData.icon;
  const statusInfo = statusConfig[status];

  const handleDeploy = () => {
    // For Instagram agent, show setup wizard on first enable
    if (agentId === "instagram" && (status === "draft" || status === "configured")) {
      setShowInstagramSetup(true);
      return;
    }

    if (status === "deployed") {
      setStatus("paused");
    } else {
      setStatus("deployed");
    }
  };

  const handleInstagramSetupComplete = () => {
    setStatus("deployed");
  };

  const handleSaveGoal = (newGoal: string) => {
    setGoal(newGoal);
    if (status === "draft") setStatus("configured");
    setShowConfig(false);
  };

  const handleEducationCopilotComplete = () => {
    if (status === "draft") setStatus("configured");
    setShowEducationCopilot(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/agents")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{agentData.title}</h1>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{agentData.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (agentId === "education") {
                  setShowEducationCopilot(true);
                } else {
                  setShowConfig(true);
                }
              }}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
            <Button
              size="sm"
              variant={status === "deployed" ? "destructive" : "default"}
              onClick={handleDeploy}
              disabled={status === "draft" && agentId !== "instagram"}
            >
              {status === "deployed" ? (
                <><Pause className="h-4 w-4 mr-1" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-1" /> {agentId === "instagram" ? "Enable" : "Deploy"}</>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            {agentId === "instagram" && (
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
            )}
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Users,
                  label: agentId === "instagram" ? "DMs Handled" : "Leads Processed",
                  value: agentData.metrics.leads.toLocaleString()
                },
                {
                  icon: TrendingUp,
                  label: agentId === "instagram" ? "Comments Converted" : "Conversions",
                  value: agentData.metrics.conversions.toLocaleString()
                },
                { icon: IndianRupee, label: "Revenue Generated", value: agentData.metrics.revenue },
              ].map((s) => (
                <div key={s.label} className="blade-stat flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-semibold text-foreground">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {goal && (
              <div className="blade-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">Current Goal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{goal}</p>
              </div>
            )}

            {/* Recent activity preview */}
            <div className="blade-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {agentData.activities.slice(0, 3).map((act) => {
                  const outcome = outcomeConfig[act.outcome];
                  return (
                    <div key={act.id} className="flex items-start gap-3 text-sm">
                      <outcome.icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground">{act.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{act.timestamp}</p>
                      </div>
                      <span className={cn("flex-shrink-0", outcome.className)}>{outcome.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">All Activities</h3>
              <p className="text-xs text-muted-foreground">{agentData.activities.length} entries</p>
            </div>
            {agentData.activities.map((act) => {
              const outcome = outcomeConfig[act.outcome];
              return (
                <div key={act.id} className="blade-card p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                  <outcome.icon className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{act.action}</p>
                      <span className={cn("flex-shrink-0", outcome.className)}>{outcome.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{act.details}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">{act.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Conversations Tab (Instagram only) */}
          {agentId === "instagram" && (
            <TabsContent value="conversations" className="space-y-4">
              <InstagramConversationViewer conversations={mockConversations} />
            </TabsContent>
          )}

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <div className="blade-card p-6">
              {goal ? (
                <>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Agent Process Definition</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-secondary/50 rounded-lg p-4">
                    {goal}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowConfig(true)}>
                    <Settings className="h-4 w-4 mr-1" />
                    Edit with AI
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    This agent hasn't been configured yet. Use the AI chat to define its goal and process.
                  </p>
                  <Button onClick={() => setShowConfig(true)}>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Configure with AI
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AgentConfigChat
        open={showConfig}
        onOpenChange={setShowConfig}
        agentType={agentData.type}
        onSaveGoal={handleSaveGoal}
      />

      {/* Instagram Setup Wizard */}
      <InstagramSetupWizard
        open={showInstagramSetup}
        onOpenChange={setShowInstagramSetup}
        onComplete={handleInstagramSetupComplete}
      />

      {/* Education Co-pilot Chat */}
      <EducationCopilotChat
        open={showEducationCopilot}
        onOpenChange={setShowEducationCopilot}
        onComplete={handleEducationCopilotComplete}
      />
    </DashboardLayout>
  );
};

export default AgentDetail;
