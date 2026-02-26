import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Sparkles, CheckCircle2, TrendingUp, Zap, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const features = [
  { icon: Zap, title: "1-Click Checkout", desc: "Students pay with a single tap — no OTP or card re-entry for returning users." },
  { icon: Smartphone, title: "Auto-fill Details", desc: "Phone number, email, and address auto-filled from Razorpay's network." },
  { icon: ShieldCheck, title: "Trust Signals", desc: "Razorpay trust badge and secure payment indicators boost conversions." },
  { icon: TrendingUp, title: "15% Higher Conversions", desc: "Merchants see an average 15% lift in successful payments with Magic Checkout." },
];

const stats = [
  { label: "Conversion Lift", value: "+15.2%", trend: "vs standard checkout" },
  { label: "Avg Checkout Time", value: "12s", trend: "down from 45s" },
  { label: "Drop-off Rate", value: "8.4%", trend: "vs 23% standard" },
];

const MagicCheckout = () => (
  <DashboardLayout>
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Magic Checkout</h1>
            <span className="blade-badge-new">Beta</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">1-click checkout experience for your payment pages and links</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Enable Magic Checkout</span>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="blade-stat">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-primary mt-0.5">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.map((f) => (
          <div key={f.title} className="blade-card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="blade-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-3">Integration Settings</h2>
        <div className="space-y-4">
          {[
            ["Auto-apply on Payment Links", true],
            ["Auto-apply on Payment Pages", true],
            ["Auto-apply on Subscriptions", false],
            ["Show Razorpay Trust Badge", true],
          ].map(([label, checked]) => (
            <div key={label as string} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{label as string}</span>
              <Switch defaultChecked={checked as boolean} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default MagicCheckout;
