import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Monitor, Smartphone, Sparkles, Send, Eye,
  Loader2, CheckCircle2, Share2, Save, Globe,
  Layout, ShoppingCart, Users, BarChart3, CreditCard,
  Settings, Code2, Palette, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addApp, type AIApp } from "./AIAppBuilder";

interface ChatMsg {
  role: "assistant" | "user";
  content: string;
}

interface AppScreen {
  id: string;
  name: string;
  type: string;
  description: string;
}

const defaultScreens: AppScreen[] = [
  { id: "home", name: "Home", type: "landing", description: "Main landing page with hero section" },
  { id: "dashboard", name: "Dashboard", type: "dashboard", description: "User dashboard with analytics" },
  { id: "checkout", name: "Checkout", type: "checkout", description: "Payment & checkout flow" },
  { id: "settings", name: "Settings", type: "settings", description: "User settings & preferences" },
];

const suggestedActions = [
  "Add a user authentication flow",
  "Create a pricing page with plans",
  "Add analytics dashboard",
  "Set up payment collection",
  "Add a contact form",
  "Create a landing page",
];

const screenIcons: Record<string, any> = {
  landing: Globe,
  dashboard: BarChart3,
  checkout: CreditCard,
  settings: Settings,
  users: Users,
  store: ShoppingCart,
  default: Layout,
};

const AIAppBuilderEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const prompt = searchParams.get("prompt") || "";
  const appType = searchParams.get("type") || "webapp";
  const appTitle = searchParams.get("title") || "My App";

  const [appName, setAppName] = useState(prompt ? prompt.split(" ").slice(0, 4).join(" ") : appTitle);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeScreen, setActiveScreen] = useState("home");
  const [screens] = useState<AppScreen[]>(defaultScreens);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [slug, setSlug] = useState(appName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: prompt
        ? `I'm building your app: **"${appName}"**. I've set up the basic structure with a landing page, dashboard, checkout, and settings. What would you like to customize?`
        : `Let's build your **${appTitle}**! I've created the basic structure. Tell me what features you need and I'll build them for you.`,
    },
  ]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Done! I've updated your app with those changes. The preview on the right shows the latest version. Want me to adjust anything else?`,
        `Great idea! I've added that to your app. You can see the changes in the preview. What's next?`,
        `I've implemented that feature. The app now includes what you asked for. Would you like to tweak the design or add more functionality?`,
        `Changes applied! Your app is looking great. Want to add payment integration or any other features?`,
      ];
      setMessages((prev) => [...prev, { role: "assistant", content: responses[Math.floor(Math.random() * responses.length)] }]);
      setIsLoading(false);
    }, 1500);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublishDialogOpen(false);
      const newApp: AIApp = {
        id: `app_${Date.now()}`,
        name: appName,
        description: prompt || `A custom ${appTitle} built with AI`,
        type: appTitle,
        slug,
        url: `/ai-apps/${slug}`,
        created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        views: 0,
        users: 0,
        status: "Published",
        revenue: 0,
        transactions: 0,
      };
      addApp(newApp);
      toast.success("App published successfully!");
      setTimeout(() => navigate("/apps/emergent"), 1200);
    }, 2000);
  };

  const currentScreen = screens.find((s) => s.id === activeScreen) || screens[0];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background z-10">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/apps/emergent")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{appName}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent border border-border">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">Powered by AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-secondary/50">
            <button onClick={() => setViewMode("desktop")} className={`p-1.5 rounded-md transition-colors ${viewMode === "desktop" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              <Monitor className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("mobile")} className={`p-1.5 rounded-md transition-colors ${viewMode === "mobile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Changes saved!")}>
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setPublishDialogOpen(true)}>
            <Share2 className="h-3.5 w-3.5" /> Publish
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 bg-muted/30 overflow-hidden flex flex-col">
          {/* Screen tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-background overflow-x-auto">
            {screens.map((screen) => {
              const Icon = screenIcons[screen.type] || screenIcons.default;
              return (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(screen.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    activeScreen === screen.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {screen.name}
                </button>
              );
            })}
          </div>

          {/* App Preview */}
          <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
            <div className={`bg-background rounded-lg shadow-lg border border-border overflow-hidden transition-all ${viewMode === "mobile" ? "w-[375px]" : "w-full max-w-4xl"}`}>
              {/* Simulated App Preview */}
              <div className="min-h-[600px]">
                {/* Nav bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-foreground text-sm">{appName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {["Features", "Pricing", "Contact"].map((link) => (
                      <span key={link} className="text-xs text-muted-foreground hover:text-foreground cursor-default">{link}</span>
                    ))}
                    <Button size="sm" className="text-xs h-7">Get Started</Button>
                  </div>
                </div>

                {/* Screen content */}
                {currentScreen.type === "landing" && (
                  <div className="p-8 space-y-8">
                    <div className="text-center py-12 space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Sparkles className="h-3 w-3" /> AI-Powered
                      </div>
                      <h1 className="text-3xl font-bold text-foreground">{appName}</h1>
                      <p className="text-muted-foreground max-w-md mx-auto text-sm">{prompt || `A powerful ${appTitle} built with AI. Start using it today.`}</p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Button className="gap-2">Get Started <Zap className="h-4 w-4" /></Button>
                        <Button variant="outline">Learn More</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: Zap, title: "Lightning Fast", desc: "Built for speed and performance" },
                        { icon: CreditCard, title: "Razorpay Payments", desc: "Accept payments instantly" },
                        { icon: Users, title: "User Management", desc: "Built-in auth & profiles" },
                      ].map((f, i) => (
                        <div key={i} className="p-5 rounded-lg border border-border text-center space-y-2">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto">
                            <f.icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                          <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentScreen.type === "dashboard" && (
                  <div className="p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Total Users", value: "1,234" },
                        { label: "Revenue", value: "₹4,56,789" },
                        { label: "Active Sessions", value: "89" },
                        { label: "Conversion", value: "12.4%" },
                      ].map((s) => (
                        <div key={s.label} className="p-4 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className="text-xl font-semibold text-foreground mt-1">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="h-48 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">Analytics Chart</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentScreen.type === "checkout" && (
                  <div className="p-6 max-w-md mx-auto space-y-6 py-12">
                    <h2 className="text-lg font-semibold text-foreground text-center">Checkout</h2>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-border space-y-2">
                        <p className="text-sm font-medium text-foreground">Premium Plan</p>
                        <p className="text-2xl font-bold text-foreground">₹999<span className="text-sm text-muted-foreground font-normal">/month</span></p>
                      </div>
                      <div className="space-y-3">
                        {["Full Name", "Email Address", "Phone Number"].map((label) => (
                          <div key={label}>
                            <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                            <div className="h-9 rounded-md border border-border bg-muted/20" />
                          </div>
                        ))}
                      </div>
                      <Button className="w-full gap-2">
                        <CreditCard className="h-4 w-4" /> Pay with Razorpay
                      </Button>
                    </div>
                  </div>
                )}

                {currentScreen.type === "settings" && (
                  <div className="p-6 space-y-6 max-w-lg">
                    <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                    <div className="space-y-4">
                      {["Profile Information", "Notification Preferences", "Payment Methods", "Security"].map((section) => (
                        <div key={section} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{section}</span>
                            <Button variant="outline" size="sm" className="text-xs h-7">Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        <div className="w-[360px] border-l border-border flex flex-col bg-background">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">AI Builder</span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5"
                      : "bg-card text-foreground rounded-2xl rounded-bl-sm px-4 py-3 border border-border/60"
                  }`}>
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                    }} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">Building...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {suggestedActions.slice(0, 3).map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <input
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder="Tell AI what to build..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(chatInput); }}
              />
              <button
                onClick={() => sendMessage(chatInput)}
                disabled={!chatInput.trim() || isLoading}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Your App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">App Name</label>
              <Input value={appName} onChange={(e) => setAppName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">URL Slug</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">/ai-apps/</span>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1" />
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handlePublish} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {publishing ? "Publishing..." : "Publish App"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAppBuilderEditor;
