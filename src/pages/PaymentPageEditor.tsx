import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Monitor, Smartphone, Eye, Settings, Sparkles, Camera, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const suggestedActions = [
  "Generate a professional header banner image",
  "Change the color theme to match my brand",
  "Add a new form field to collect more details",
];

interface ChatMsg {
  role: "assistant" | "user";
  content: string;
  time: string;
}

const PaymentPageEditor = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [showAI, setShowAI] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Razorpay AI page builder. I can edit your page, add sections, generate images, and more. Try asking me anything!",
      time: "1m ago",
    },
  ]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, time: "Just now" },
      { role: "assistant", content: `I'll help you with "${text}". This is a prototype — in production, the AI would update the page in real-time.`, time: "Just now" },
    ]);
    setChatInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/payment-pages")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="font-semibold text-foreground text-sm">Event Booking — My Page</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-2 ${viewMode === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-2 ${viewMode === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button size="sm">Publish</Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAI(!showAI)}
          >
            <Sparkles className="h-4 w-4" />
            {showAI ? "Hide AI" : "Show AI"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Page preview */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className={`mx-auto bg-background rounded-lg shadow-sm border border-border overflow-hidden ${viewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}>
            {/* Banner */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop"
                alt="Event banner"
                className="w-full h-52 object-cover"
              />
              <button className="absolute top-3 right-3 bg-background/80 rounded-full p-1.5 hover:bg-background">
                <span className="text-xs">✕</span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Left: page content */}
              <div className="flex-1 p-6 border-r border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">E</div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">EVENT BOOKING —</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Event Booking — My Page</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  A professional event registration page for conferences, workshops, seminars, meetups, concerts, and community gatherings. Collect attendee details, offer multiple ticket tiers, and share your event schedule.
                </p>
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-1">Why Students Love This</h3>
                  <p className="text-sm text-muted-foreground mb-4">Here's what makes us different</p>
                  <div className="space-y-3">
                    {["Curated Experience", "Expert Speakers", "Networking Opportunities"].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: payment form */}
              <div className="w-full lg:w-96 p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Type</label>
                    <Select defaultValue="fixed">
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="custom">Custom Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</label>
                    <div className="mt-1.5 text-3xl font-bold text-foreground">₹ 2,999</div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</label>
                    <div className="space-y-3 mt-2">
                      <div>
                        <label className="text-sm text-foreground">Full Name <span className="text-destructive">*</span></label>
                        <Input placeholder="Enter your full name" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-foreground">Email <span className="text-destructive">*</span></label>
                        <Input placeholder="Enter your email" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm text-foreground">Phone</label>
                        <Input placeholder="Enter your phone number" className="mt-1" />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-2">Pay ₹ 2,999</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        {showAI && (
          <div className="w-80 border-l border-border flex flex-col bg-background">
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-[10px]">R</span>
                </div>
                <span className="text-sm font-semibold text-foreground">Razorpay AI Builder</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`${msg.role === "user" ? "ml-8" : "mr-4"}`}>
                  <div
                    className={`text-sm p-3 rounded-lg ${
                      msg.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-2 space-y-1.5">
              {suggestedActions.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="w-full text-left text-xs px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <button className="text-muted-foreground hover:text-foreground p-1">
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
                  placeholder="e.g. Change the banner image, add a testimonial, update pricing..."
                  className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => sendMessage(chatInput)}
                  className="text-primary hover:text-primary/80 p-1"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPageEditor;
