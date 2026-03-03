import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

const LS_KEY = "razorpay-oauth-connected";

interface RazorpayAuthGateProps {
  appName: string;
  children: React.ReactNode;
}

export const RazorpayAuthGate = ({ appName, children }: RazorpayAuthGateProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === "true") setIsConnected(true);
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    setStep(0);
    setTimeout(() => setStep(1), 1000);
    setTimeout(() => setStep(2), 2200);
    setTimeout(() => {
      localStorage.setItem(LS_KEY, "true");
      setIsConnected(true);
      setIsConnecting(false);
    }, 3400);
  };

  if (isConnected) return <>{children}</>;

  const steps = [
    "Redirecting to Razorpay...",
    "Authorizing merchant account...",
    "Completing setup...",
  ];

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full mx-auto text-center space-y-6 p-8">
        {/* Razorpay Logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">Connect Razorpay Account</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            <strong>{appName}</strong> requires access to your Razorpay merchant account to process payments, manage subscriptions, and sync transaction data.
          </p>
        </div>

        {/* Permissions */}
        <div className="rounded-xl border bg-card p-4 text-left space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions requested</p>
          {[
            "Read account & business details",
            "Create & manage payment links",
            "Access transaction history",
            "Manage subscriptions & plans",
          ].map((perm, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              {perm}
            </div>
          ))}
        </div>

        {/* Connect Button or Progress */}
        {isConnecting ? (
          <div className="space-y-3 py-2">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${
                  step === i
                    ? "bg-accent border border-primary/20"
                    : step > i
                    ? "opacity-50"
                    : "opacity-20"
                }`}
              >
                {step > i ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : step === i ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                <span className={`text-sm ${step === i ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Button size="lg" className="w-full gap-2" onClick={handleConnect}>
            <ExternalLink className="h-4 w-4" />
            Connect with Razorpay
          </Button>
        )}

        <p className="text-[11px] text-muted-foreground">
          By connecting, you agree to Razorpay's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
