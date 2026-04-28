import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  ArrowLeft,
  Calendar,
  QrCode,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Merchant constants ──────────────────────────────────────────────
const MERCHANT_NAME = "Wealthjoy Technologies";
const MERCHANT_INITIALS = "WJ";
const MERCHANT_DOMAIN = "wealthjoy.in";

// ── Types ───────────────────────────────────────────────────────────
interface Installment {
  id: string;
  label: string;
  amount: number | string;
  dueDate: string;
  description: string;
}

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency?: string;
  collectInMultiplePayments?: boolean;
  multiPaymentMode?: "schedule" | "customer_choice";
  splitType?: "equal" | "custom";
  installments?: Installment[];
  collectPhone?: boolean;
  collectEmail?: boolean;
  collectAddress?: boolean;
  selectedProducts?: string[];
  shiprocketEnabled?: boolean;
  whatsappConfirmation?: boolean;
  status: "active" | "inactive";
  createdAt: string;
}

type Screen = "overview" | "method" | "success";
type PayMethod = "upi" | "card" | "netbanking" | "wallet";

// ── Demo fallback link ───────────────────────────────────────────────
const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const DEMO_LINK: PaymentLink = {
  id: "demo-wj-001",
  title: "Business Management Programme",
  description: "3-month intensive programme · Batch starting 1 May 2026",
  amount: 12000,
  collectInMultiplePayments: true,
  multiPaymentMode: "schedule",
  installments: [
    { id: "1", label: "Payment 1 — Enrolment Fee", amount: 4000, dueDate: fmt(today), description: "" },
    { id: "2", label: "Payment 2 — Month 2", amount: 4000, dueDate: fmt(addDays(today, 30)), description: "" },
    { id: "3", label: "Payment 3 — Month 3", amount: 4000, dueDate: fmt(addDays(today, 60)), description: "" },
  ],
  collectEmail: true,
  collectPhone: true,
  status: "active",
  createdAt: new Date().toISOString(),
};

// ── Helpers ─────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const parseDate = (iso: string): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

/** Returns a human-readable relative label: "Today", "Tomorrow", "in 30 days", "15 Apr" */
const fmtRelative = (iso: string): string => {
  const d = parseDate(iso);
  if (!d) return "—";
  const todayMid = new Date();
  todayMid.setHours(0, 0, 0, 0);
  const targetMid = new Date(d);
  targetMid.setHours(0, 0, 0, 0);
  const diff = Math.round((targetMid.getTime() - todayMid.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 90) return `in ${diff} days`;
  if (diff < 0 && diff >= -1) return "Yesterday";
  if (diff < -1) return `${Math.abs(diff)} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const isToday = (iso: string) => {
  const d = parseDate(iso);
  if (!d) return false;
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};

// ── Main component ───────────────────────────────────────────────────
export function PaymentLinkCheckout() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("overview");
  const [payMethod, setPayMethod] = useState<PayMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [payFull, setPayFull] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "", name: "" });

  useEffect(() => { loadLink(); }, [linkId]);

  const loadLink = () => {
    try {
      const stored = localStorage.getItem("payment_links");
      if (stored) {
        const links: PaymentLink[] = JSON.parse(stored);
        const found = links.find((l) => l.id === linkId);
        if (found) { setLink(found); setLoading(false); return; }
      }
    } catch {}
    // Fall back to demo
    setLink(DEMO_LINK);
    setLoading(false);
  };

  // ── Derived values ─────────────────────────────────────────────────
  const isSchedule =
    link?.collectInMultiplePayments && link.multiPaymentMode === "schedule" && (link.installments?.length ?? 0) > 0;

  const installments: Installment[] = (link?.installments ?? []).map((i) => ({
    ...i,
    amount: Number(i.amount),
  }));

  // First unpaid installment (for prototype = first one)
  const currentInst = installments[0];
  const remainingInsts = installments.slice(1);

  const payNowAmount = payFull
    ? installments.reduce((s, i) => s + Number(i.amount), 0)
    : currentInst
    ? Number(currentInst.amount)
    : link?.amount ?? 0;

  const totalAmount = link
    ? installments.length > 0
      ? installments.reduce((s, i) => s + Number(i.amount), 0)
      : link.amount
    : 0;

  // ── Handlers ────────────────────────────────────────────────────────
  const handleContinue = () => {
    if (!formData.name.trim()) return;
    setScreen("method");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setTxnId(`TXN${Date.now().toString().slice(-10)}`);
      setScreen("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2000);
  };

  // ── Loading / error states ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!link || link.status === "inactive") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">
            {!link ? "Link not found" : "Link inactive"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {!link
              ? "This payment link doesn't exist or has been removed."
              : "This payment link is currently inactive."}
          </p>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">

          {/* ─── LEFT PANEL ─────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-8 space-y-4">
            {/* Merchant card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              {/* Merchant identity */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{MERCHANT_INITIALS}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 leading-tight">Payment Request from</p>
                  <p className="font-semibold text-gray-900 leading-tight">{MERCHANT_NAME}</p>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Payment title & description */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Payment For</p>
                <p className="font-semibold text-gray-900">{link.title}</p>
                {link.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{link.description}</p>
                )}
              </div>

              {/* Total amount */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{fmtINR(totalAmount)}</p>
              </div>

              {/* Payment schedule timeline */}
              {isSchedule && installments.length > 0 && (
                <>
                  <Separator className="mb-4" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Payment Schedule
                    </p>
                    <div className="space-y-0">
                      {installments.map((inst, idx) => {
                        const isDue = idx === 0;
                        const isLast = idx === installments.length - 1;
                        return (
                          <div key={inst.id} className="flex gap-3">
                            {/* Timeline dot + line */}
                            <div className="flex flex-col items-center">
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                  isDue
                                    ? "bg-blue-600"
                                    : "bg-gray-200"
                                )}
                              >
                                {isDue && <Check className="h-3 w-3 text-white" />}
                              </div>
                              {!isLast && (
                                <div className="w-px flex-1 bg-gray-200 my-1 min-h-[20px]" />
                              )}
                            </div>
                            {/* Content */}
                            <div className="pb-4 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className={cn("text-sm font-medium leading-tight", isDue ? "text-gray-900" : "text-gray-500")}>
                                    {inst.label || `Payment ${idx + 1}`}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-400">
                                      {fmtRelative(inst.dueDate)}
                                    </span>
                                    {isDue && (
                                      <Badge className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 border-blue-200">
                                        Due now
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className={cn("text-sm font-semibold flex-shrink-0", isDue ? "text-gray-900" : "text-gray-400")}>
                                  {fmtINR(Number(inst.amount))}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400 px-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>256-bit Encrypted</span>
              </div>
            </div>

            {/* Contact & policies footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center space-y-1">
              <p className="text-xs text-gray-400">
                For any queries, please contact{" "}
                <span className="font-medium text-gray-600">{MERCHANT_NAME}</span>
              </p>
              <button className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-700">
                Merchant's business policies
              </button>
            </div>
          </div>

          {/* ─── RIGHT PANEL ────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* ══ SCREEN 1: OVERVIEW ════════════════════════════════ */}
            {screen === "overview" && (
              <div>
                {/* Header bar */}
                <div className="bg-blue-700 px-5 py-4">
                  <p className="text-white font-semibold">{MERCHANT_NAME}</p>
                  <p className="text-blue-200 text-xs mt-0.5">Secure Payment</p>
                </div>

                <div className="p-5 space-y-5">
                  {/* Current payment highlight */}
                  {isSchedule && currentInst ? (
                    <div className="rounded-xl border-2 border-blue-600 bg-blue-50 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-0.5">
                            Payment Due Now
                          </p>
                          <p className="font-semibold text-gray-900">
                            {currentInst.label || "Payment 1"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Due {fmtRelative(currentInst.dueDate).toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">
                            {fmtINR(Number(currentInst.amount))}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">of {fmtINR(totalAmount)} total</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Amount to Pay</p>
                      <p className="text-2xl font-bold text-gray-900">{fmtINR(link.amount)}</p>
                    </div>
                  )}

                  {/* Pay full amount option */}
                  {isSchedule && remainingInsts.length > 0 && (
                    <div
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all",
                        payFull ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setPayFull(!payFull)}
                    >
                      <Checkbox
                        id="pay-full"
                        checked={payFull}
                        onCheckedChange={(v) => setPayFull(!!v)}
                        className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <div className="flex-1">
                        <label htmlFor="pay-full" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Pay full amount instead
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pay {fmtINR(totalAmount)} now and clear all {installments.length} payments
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Customer details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Your Details</h3>
                    <div className="space-y-2.5">
                      <div>
                        <Label htmlFor="name" className="text-xs font-medium text-gray-600 mb-1 block">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-10"
                        />
                      </div>
                      {link.collectEmail !== false && (
                        <div>
                          <Label htmlFor="email" className="text-xs font-medium text-gray-600 mb-1 block">
                            Email Address {link.collectEmail ? "*" : "(optional)"}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      )}
                      {link.collectPhone !== false && (
                        <div>
                          <Label htmlFor="phone" className="text-xs font-medium text-gray-600 mb-1 block">
                            Mobile Number {link.collectPhone ? "*" : "(optional)"}
                          </Label>
                          <div className="flex gap-2">
                            <div className="flex items-center px-3 h-10 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-600 flex-shrink-0">
                              +91
                            </div>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="10-digit number"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="h-10 flex-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* CTA */}
                  <div>
                    <Button
                      onClick={handleContinue}
                      disabled={!formData.name.trim()}
                      className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-sm font-semibold"
                    >
                      Continue to Pay {fmtINR(payNowAmount)}
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-2.5 flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3" />
                      Secured by Razorpay
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ══ SCREEN 2: PAYMENT METHOD ══════════════════════════ */}
            {screen === "method" && (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <button
                    onClick={() => setScreen("overview")}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Select Payment Method</p>
                    <p className="text-xs text-gray-400">
                      Paying {fmtINR(payNowAmount)}
                      {payFull ? " (full amount)" : isSchedule ? " (first instalment)" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">{fmtINR(payNowAmount)}</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Method tabs */}
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        { key: "upi" as PayMethod, icon: <Smartphone className="h-4 w-4" />, label: "UPI" },
                        { key: "card" as PayMethod, icon: <CreditCard className="h-4 w-4" />, label: "Card" },
                        { key: "netbanking" as PayMethod, icon: <Building2 className="h-4 w-4" />, label: "Net Banking" },
                        { key: "wallet" as PayMethod, icon: <Wallet className="h-4 w-4" />, label: "Wallet" },
                      ] as const
                    ).map(({ key, icon, label }) => (
                      <button
                        key={key}
                        onClick={() => setPayMethod(key)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all",
                          payMethod === key
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* UPI */}
                  {payMethod === "upi" && (
                    <div className="space-y-4">
                      {/* QR code placeholder */}
                      <div className="flex flex-col items-center py-5 rounded-xl border border-gray-200 bg-gray-50">
                        <QrCode className="h-24 w-24 text-gray-300" />
                        <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
                        <div className="flex items-center gap-2 mt-1">
                          {["G Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                            <span key={app} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span>or pay with UPI ID</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }}
                          className="h-10 flex-1"
                        />
                        <Button
                          variant="outline"
                          className="h-10 px-4 text-sm"
                          onClick={() => { if (upiId.includes("@")) setUpiVerified(true); }}
                        >
                          {upiVerified ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="h-4 w-4" /> Verified
                            </span>
                          ) : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Card */}
                  {payMethod === "card" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Card Number</Label>
                        <Input
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                            const f = v.replace(/(.{4})/g, "$1 ").trim();
                            setCardData({ ...cardData, number: f });
                          }}
                          className="h-10 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Name on Card</Label>
                        <Input
                          placeholder="As printed on card"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          className="h-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Expiry</Label>
                          <Input
                            placeholder="MM / YY"
                            value={cardData.expiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (v.length >= 3) v = v.slice(0, 2) + " / " + v.slice(2);
                              setCardData({ ...cardData, expiry: v });
                            }}
                            className="h-10 font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">CVV</Label>
                          <Input
                            placeholder="• • •"
                            type="password"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                            className="h-10 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Banking */}
                  {payMethod === "netbanking" && (
                    <div className="grid grid-cols-3 gap-2">
                      {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank", "PNB", "Canara", "Union Bank"].map((bank) => (
                        <button
                          key={bank}
                          className="py-3 px-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Wallet */}
                  {payMethod === "wallet" && (
                    <div className="grid grid-cols-3 gap-2">
                      {["Paytm", "PhonePe", "Amazon Pay", "Mobikwik", "Freecharge", "Ola Money"].map((w) => (
                        <button
                          key={w}
                          className="py-3 px-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  )}

                  <Separator />

                  {/* Pay button */}
                  <Button
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-sm font-semibold"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Processing…
                      </span>
                    ) : (
                      `Pay ${fmtINR(payNowAmount)}`
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    Payments secured by Razorpay · PCI DSS compliant
                  </p>
                </div>
              </div>
            )}

            {/* ══ SCREEN 3: SUCCESS ════════════════════════════════ */}
            {screen === "success" && (
              <div>
                {/* Success header */}
                <div className="bg-green-50 border-b border-green-100 px-5 py-6 text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-green-600 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Payment Successful!</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {fmtINR(payNowAmount)} paid to {MERCHANT_NAME}
                  </p>
                </div>

                <div className="p-5 space-y-5">
                  {/* Transaction details */}
                  <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {[
                      { label: "Transaction ID", value: txnId },
                      { label: "Amount Paid", value: fmtINR(payNowAmount) },
                      {
                        label: "Payment", value: payFull
                          ? "Full amount cleared"
                          : isSchedule && currentInst
                          ? currentInst.label || "Payment 1"
                          : link.title,
                      },
                      { label: "Method", value: { upi: "UPI", card: "Credit / Debit Card", netbanking: "Net Banking", wallet: "Wallet" }[payMethod] },
                      { label: "Date", value: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Remaining payments */}
                  {isSchedule && !payFull && remainingInsts.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Upcoming Payments
                      </p>
                      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {remainingInsts.map((inst, idx) => (
                          <div key={inst.id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {inst.label || `Payment ${idx + 2}`}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{fmtRelative(inst.dueDate)}</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {fmtINR(Number(inst.amount))}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        You'll receive a reminder before each payment is due.
                      </p>
                    </div>
                  )}

                  {/* All paid confirmation */}
                  {isSchedule && payFull && (
                    <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800">
                        All {installments.length} payments cleared. You're fully paid up!
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full h-10 text-sm"
                    onClick={() => navigate("/")}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}

          </div>
          {/* end right panel */}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white mt-4">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <Lock className="h-3 w-3" />
          <span>Powered by <span className="font-semibold text-gray-600">Razorpay</span></span>
        </div>
      </div>
    </div>
  );
}
