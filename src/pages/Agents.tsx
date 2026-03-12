import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AgentConfigChat from "@/components/AgentConfigChat";
import { InstagramSetupWizard } from "@/components/InstagramSetupWizard";
import { EducationCopilotChat } from "@/components/EducationCopilotChat";
import {
  PhoneCall,
  Megaphone,
  MessageCircle,
  Star,
  Play,
  Pause,
  Zap,
  TrendingUp,
  Clock,
  Bot,
  Eye,
  Settings,
  Users,
  Instagram,
  GraduationCap,
} from "lucide-react";

type AgentStatus = "draft" | "configured" | "deployed" | "paused";

interface AgentState {
  id: string;
  type: string;
  icon: any;
  title: string;
  description: string;
  status: AgentStatus;
  goal: string;
  leadsProcessed: number;
  conversions: number;
  lastActive: string;
}

const initialAgents: AgentState[] = [
  {
    id: "instagram",
    type: "instagram",
    icon: Instagram,
    title: "Social Commerce",
    description:
      "Auto-respond to Instagram DMs, convert comments to sales, send payment links automatically for your e-commerce business.",
    status: "draft",
    goal: "",
    leadsProcessed: 487,
    conversions: 123,
    lastActive: "30 sec ago",
  },
  {
    id: "education",
    type: "education",
    icon: GraduationCap,
    title: "Education Co-pilot",
    description:
      "Intelligent assistant that analyzes your education business, recommends Razorpay features, guides Smart Page creation, and sets up automated campaigns.",
    status: "draft",
    goal: "",
    leadsProcessed: 0,
    conversions: 0,
    lastActive: "Never",
  },
  {
    id: "sales",
    type: "sales",
    icon: PhoneCall,
    title: "Sales Agent",
    description:
      "Automatically follows up with free webinar leads via calls, pitches your paid courses, handles objections, and converts them into paying students — all without manual intervention.",
    status: "deployed",
    goal: "Call all free webinar attendees within 1 hour, pitch Advanced Python Course, send payment link if interested.",
    leadsProcessed: 1247,
    conversions: 312,
    lastActive: "2 min ago",
  },
  {
    id: "marketing",
    type: "marketing",
    icon: Megaphone,
    title: "Marketing Agent",
    description:
      "Runs targeted campaigns across channels and retargets students who dropped off. Optimises ad spend and messaging to maximize enrollment rates for your courses.",
    status: "configured",
    goal: "Retarget all free webinar attendees who didn't purchase within 48 hours.",
    leadsProcessed: 3420,
    conversions: 456,
    lastActive: "1 hr ago",
  },
  {
    id: "support",
    type: "support",
    icon: MessageCircle,
    title: "Customer Service Agent",
    description:
      "WhatsApp-based AI agent that handles customer queries, resolves support tickets, shares course materials, and escalates complex issues — available 24/7 for your students.",
    status: "deployed",
    goal: "Handle all WhatsApp queries 24/7. Answer FAQs instantly, share course materials, escalate complex issues.",
    leadsProcessed: 2890,
    conversions: 2601,
    lastActive: "1 min ago",
  },
  {
    id: "feedback",
    type: "feedback",
    icon: Star,
    title: "Feedback Agent",
    description:
      "Automatically collects NPS scores and reviews after course completion. Identifies at-risk students early and gathers testimonials from your happiest learners.",
    status: "draft",
    goal: "",
    leadsProcessed: 890,
    conversions: 756,
    lastActive: "30 min ago",
  },
];

const statusConfig: Record<AgentStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  configured: { label: "Configured", variant: "secondary" },
  deployed: { label: "Deployed", variant: "default" },
  paused: { label: "Paused", variant: "destructive" },
};

const stats = [
  { icon: Zap, value: "60%", label: "Faster follow-ups" },
  { icon: TrendingUp, value: "40%", label: "Higher conversions" },
  { icon: Clock, value: "24/7", label: "Availability" },
];

const faqs = [
  {
    q: "What are AI agents?",
    a: "AI agents are autonomous software programs that can perform tasks on your behalf — like following up with leads, running campaigns, or answering customer queries — without constant human supervision. They learn from your data and improve over time.",
  },
  {
    q: "How do agents integrate with my existing setup?",
    a: "Agents connect directly to your Smart Pages, payment links, WhatsApp Business, and email workflows. No additional setup is required — they pull data from your existing dashboard and act on it automatically.",
  },
  {
    q: "What's the ROI of using AI agents?",
    a: "Creators using AI agents see an average 40% increase in course conversions and 60% faster lead follow-up times. The agents work 24/7, eliminating missed opportunities from delayed responses.",
  },
  {
    q: "Can AI agents replace my human sales reps?",
    a: "AI agents are designed to augment your team, not replace them. They handle repetitive tasks like initial outreach and qualification, freeing your team to focus on high-value conversations and relationship building.",
  },
  {
    q: "Is there a limit on how many leads agents can handle?",
    a: "No. AI agents scale infinitely — whether you have 10 leads or 10,000, they process and follow up with each one individually, maintaining personalized communication at any volume.",
  },
];

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentState[]>(initialAgents);
  const [configAgent, setConfigAgent] = useState<AgentState | null>(null);
  const [showInstagramSetup, setShowInstagramSetup] = useState(false);
  const [showEducationCopilot, setShowEducationCopilot] = useState(false);

  const handleDeploy = (agentId: string) => {
    // For Instagram agent, show setup wizard on first enable
    if (agentId === "instagram") {
      const agent = agents.find((a) => a.id === agentId);
      if (agent?.status === "draft" || agent?.status === "configured") {
        setShowInstagramSetup(true);
        return;
      }
    }

    // For Education agent, show setup wizard on first enable
    if (agentId === "education") {
      const agent = agents.find((a) => a.id === agentId);
      if (agent?.status === "draft" || agent?.status === "configured") {
        setShowEducationCopilot(true);
        return;
      }
    }

    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        if (a.status === "deployed") return { ...a, status: "paused" as AgentStatus };
        return { ...a, status: "deployed" as AgentStatus };
      })
    );
  };

  const handleInstagramSetupComplete = () => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== "instagram") return a;
        return { ...a, status: "deployed" as AgentStatus };
      })
    );
  };

  const handleSaveGoal = (goal: string) => {
    if (!configAgent) return;
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== configAgent.id) return a;
        return {
          ...a,
          goal,
          status: a.status === "draft" ? ("configured" as AgentStatus) : a.status,
        };
      })
    );
    setConfigAgent(null);
  };

  const handleEducationCopilotComplete = () => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== "education") return a;
        return {
          ...a,
          status: "deployed" as AgentStatus,
        };
      })
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Build Your AI Workforce
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl">
            Automate sales, marketing, and support for your creator business.
            Deploy AI agents that work 24/7 to convert leads, engage students,
            and grow revenue.
          </p>

          {/* Watch banner */}
          <div className="blade-card flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-primary/20 bg-accent/50">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 flex-shrink-0">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-xs sm:text-sm">
                Agents@Work
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                See AI agents in production — automating sales and support for
                top creators.
              </p>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0 hidden sm:flex">
              Watch now
            </Button>
            <Button variant="outline" size="sm" className="flex-shrink-0 sm:hidden">
              Watch
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="blade-stat flex items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 flex-shrink-0">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Cards */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
            Your AI Agents
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Deploy AI teammates that optimize your creator business engine.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {agents.map((agent) => {
              const sInfo = statusConfig[agent.status];
              return (
                <div
                  key={agent.id}
                  className="blade-card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-primary/10">
                      <agent.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={sInfo.variant} className="text-[10px] sm:text-xs">{sInfo.label}</Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      {agent.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {agent.description}
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Users className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{agent.leadsProcessed.toLocaleString()} leads</span>
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{agent.conversions.toLocaleString()} converted</span>
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{agent.lastActive}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/agents/${agent.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (agent.id === "education") {
                          setShowEducationCopilot(true);
                        } else {
                          setConfigAgent(agent);
                        }
                      }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant={agent.status === "deployed" ? "destructive" : "default"}
                      onClick={() => handleDeploy(agent.id)}
                      disabled={agent.status === "draft" && agent.id !== "instagram" && agent.id !== "education"}
                    >
                      {agent.status === "deployed" ? (
                        <><Pause className="h-4 w-4 mr-1" /> Pause</>
                      ) : (
                        <><Play className="h-4 w-4 mr-1" /> {agent.id === "instagram" || agent.id === "education" ? "Enable" : "Deploy"}</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">FAQs</h2>
          <div className="blade-card p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* Config Chat Dialog */}
      {configAgent && (
        <AgentConfigChat
          open={!!configAgent}
          onOpenChange={(open) => !open && setConfigAgent(null)}
          agentType={configAgent.type}
          onSaveGoal={handleSaveGoal}
        />
      )}

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

export default Agents;
