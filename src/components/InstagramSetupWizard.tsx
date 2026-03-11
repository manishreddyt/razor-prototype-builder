import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Instagram,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  MessageSquare,
  ShoppingCart,
  Link as LinkIcon,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface InstagramSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type SetupStep = "connect" | "replies" | "automation" | "review";

interface InstagramAccount {
  username: string;
  profilePic: string;
  followers: string;
  connected: boolean;
}

export function InstagramSetupWizard({
  open,
  onOpenChange,
  onComplete,
}: InstagramSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>("connect");
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<InstagramAccount | null>(null);

  // Form state
  const [autoReply, setAutoReply] = useState(true);
  const [commentConversion, setCommentConversion] = useState(true);
  const [cartReminders, setCartReminders] = useState(true);
  const [greetingMessage, setGreetingMessage] = useState(
    "Hi! 👋 Thanks for reaching out. How can I help you today?"
  );
  const [productCatalogUrl, setProductCatalogUrl] = useState("");

  const steps: { id: SetupStep; label: string; icon: any }[] = [
    { id: "connect", label: "Connect Account", icon: Instagram },
    { id: "replies", label: "Auto-Replies", icon: MessageSquare },
    { id: "automation", label: "Automation Rules", icon: Zap },
    { id: "review", label: "Review & Enable", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    // Simulate Instagram OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock connected account
    setAccount({
      username: "@fashionstore.in",
      profilePic: "https://i.pravatar.cc/150?img=20",
      followers: "12.5K",
      connected: true,
    });
    setIsConnecting(false);
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
    // Reset wizard
    setTimeout(() => {
      setCurrentStep("connect");
      setAccount(null);
    }, 300);
  };

  const canProceed = () => {
    switch (currentStep) {
      case "connect":
        return account?.connected === true;
      case "replies":
        return greetingMessage.trim().length > 0;
      case "automation":
        return true; // At least one automation should be enabled
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg">Instagram Agent Setup</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Connect your account and configure automated responses
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border bg-secondary/20">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium hidden sm:inline",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 sm:w-16 h-0.5 mx-2 transition-colors",
                        isCompleted ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Connect Account */}
          {currentStep === "connect" && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Connect Your Instagram Business Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  We'll securely connect to your Instagram Business or Creator account
                  to enable automated DM responses and comment management.
                </p>
              </div>

              {!account ? (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Requirements:
                        </p>
                        <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
                          <li>• Instagram Business or Creator account</li>
                          <li>• Connected to a Facebook Page</li>
                          <li>• Admin access to the account</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base"
                    size="lg"
                    onClick={handleConnectInstagram}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                        Connecting to Instagram...
                      </>
                    ) : (
                      <>
                        <Instagram className="h-5 w-5 mr-2" />
                        Connect Instagram Account
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By connecting, you agree to Instagram's Business Tools Terms
                  </p>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-xl p-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={account.profilePic}
                        alt={account.username}
                        className="w-16 h-16 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg">{account.username}</p>
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.followers} followers
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-secondary/50 rounded-xl">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      What's Next?
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Configure automated reply messages
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Set up comment-to-DM conversion
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Enable cart abandonment reminders
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Auto-Replies */}
          {currentStep === "replies" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Configure Automated Replies
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set up your default greeting and quick replies for common questions.
                </p>
              </div>

              <div className="space-y-5">
                {/* Greeting Message */}
                <div className="space-y-2">
                  <Label htmlFor="greeting" className="text-sm font-semibold">
                    Greeting Message
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This message is sent when customers first DM you
                  </p>
                  <Textarea
                    id="greeting"
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    placeholder="Enter your greeting message..."
                    className="h-24 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {greetingMessage.length}/500 characters
                  </p>
                </div>

                {/* Quick Replies */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Quick Replies</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Pre-configured responses for common questions
                  </p>

                  <div className="grid gap-3">
                    {[
                      {
                        question: "What are your sizes?",
                        reply: "We have sizes S, M, L, and XL available. Check our size chart: [link]",
                      },
                      {
                        question: "How much does shipping cost?",
                        reply: "FREE shipping on orders above ₹999. Otherwise ₹99 flat rate.",
                      },
                      {
                        question: "What is your return policy?",
                        reply: "Easy 7-day returns. No questions asked! Just DM us for a return.",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-secondary/50 rounded-lg border border-border"
                      >
                        <p className="text-sm font-medium mb-1">{item.question}</p>
                        <p className="text-xs text-muted-foreground">{item.reply}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Automation Rules */}
          {currentStep === "automation" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Automation Rules
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose which automations you want to enable for your store.
                </p>
              </div>

              <div className="space-y-4">
                {/* Auto-Reply to DMs */}
                <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-background hover:border-primary/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Auto-Reply to DMs</h4>
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Automatically respond to product inquiries, sizing questions, and
                      availability checks within 2 minutes.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Example:</strong> Customer asks "Do you have this in M?" →
                      Agent replies with availability + payment link
                    </p>
                  </div>
                  <Switch checked={autoReply} onCheckedChange={setAutoReply} />
                </div>

                {/* Comment Conversion */}
                <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-background hover:border-primary/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Convert Comments to Sales</h4>
                      <Badge variant="secondary" className="text-xs">
                        High Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Turn Instagram comments like "Love this!" into DM conversations
                      with product details and payment links.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Example:</strong> Comment "Want this!" → Agent DMs with
                      product card + payment link
                    </p>
                  </div>
                  <Switch
                    checked={commentConversion}
                    onCheckedChange={setCommentConversion}
                  />
                </div>

                {/* Cart Reminders */}
                <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-background hover:border-primary/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Cart Abandonment Reminders</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Remind customers who showed interest but didn't purchase within 24
                      hours.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Example:</strong> Customer viewed product yesterday → Agent
                      sends reminder with payment link
                    </p>
                  </div>
                  <Switch
                    checked={cartReminders}
                    onCheckedChange={setCartReminders}
                  />
                </div>
              </div>

              {/* Product Catalog */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label htmlFor="catalog" className="text-sm font-semibold">
                  Product Catalog (Optional)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Link your product catalog to enable smart product recommendations
                </p>
                <Input
                  id="catalog"
                  type="url"
                  value={productCatalogUrl}
                  onChange={(e) => setProductCatalogUrl(e.target.value)}
                  placeholder="https://yourstore.com/products.json"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === "review" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Enable!</h3>
                <p className="text-sm text-muted-foreground">
                  Review your configuration and enable your Instagram agent.
                </p>
              </div>

              <div className="space-y-4">
                {/* Connected Account */}
                <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Connected Account
                  </h4>
                  <div className="flex items-center gap-3">
                    <img
                      src={account?.profilePic}
                      alt={account?.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm">{account?.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {account?.followers} followers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enabled Automations */}
                <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Enabled Automations
                  </h4>
                  <div className="space-y-2">
                    {autoReply && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Auto-reply to DMs</span>
                      </div>
                    )}
                    {commentConversion && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Convert comments to sales</span>
                      </div>
                    )}
                    {cartReminders && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Cart abandonment reminders</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Greeting Message */}
                <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Greeting Message
                  </h4>
                  <p className="text-sm text-muted-foreground italic">
                    "{greetingMessage}"
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        What happens next?
                      </p>
                      <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
                        <li>• Agent starts monitoring your Instagram DMs 24/7</li>
                        <li>• Automated responses go live immediately</li>
                        <li>• You can view all conversations in the dashboard</li>
                        <li>• Pause or modify settings anytime</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep !== "review" ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Enable Instagram Agent
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
