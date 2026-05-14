import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, ShieldCheck, Lock, CreditCard, Smartphone, Wallet, Building2,
  ArrowLeft, Calendar, QrCode, Check, ChevronRight, Sparkles, Package, Star,
  Users, Zap, Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────
const MERCHANT_NAME = "Wealthjoy Technologies";
const MERCHANT_INITIALS = "WJ";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SmartProduct { id: string; name: string; price: number; qty: number; image?: string; }
interface Installment { id: string; label: string; amount: number | string; dueDate: string; description: string; }
interface PaymentLink {
  id: string; title: string; description: string; amount: number; currency?: string;
  collectInMultiplePayments?: boolean; multiPaymentMode?: "schedule" | "customer_choice";
  splitType?: "equal" | "custom"; installments?: Installment[];
  collectPhone?: boolean; collectEmail?: boolean; collectAddress?: boolean;
  selectedProducts?: string[]; shiprocketEnabled?: boolean; whatsappConfirmation?: boolean;
  status: "active" | "inactive"; createdAt: string;
  isSmartLink?: boolean; smartProducts?: SmartProduct[];
}
type Screen = "overview" | "details" | "method" | "success";
type PayMethod = "upi" | "card" | "netbanking" | "wallet";
type Variant = 1 | 2 | 3;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const todayD = new Date();
const fmtD = (d: Date) => d.toISOString().split("T")[0];
const addD = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const parseDate = (iso: string) => { if (!iso) return null; const d = new Date(iso); return isNaN(d.getTime()) ? null : d; };
const fmtRelative = (iso: string): string => {
  const d = parseDate(iso); if (!d) return "—";
  const t = new Date(); t.setHours(0, 0, 0, 0); const m = new Date(d); m.setHours(0, 0, 0, 0);
  const diff = Math.round((m.getTime() - t.getTime()) / 86_400_000);
  if (diff === 0) return "Today"; if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 90) return `in ${diff} days`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_SMART_PRODUCTS: SmartProduct[] = [
  { id: "p1", name: "Premium Cotton T-Shirt", price: 799, qty: 2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
  { id: "p2", name: "Denim Jeans – Slim Fit", price: 1499, qty: 1, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop" },
  { id: "p3", name: "Running Shoes – Sports", price: 2499, qty: 1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" },
];
const DEMO_SMART_LINK: PaymentLink = {
  id: "demo-smart-001", title: "Summer Collection", description: "3 items",
  amount: DEMO_SMART_PRODUCTS.reduce((s, p) => s + p.price * p.qty, 0),
  isSmartLink: true, smartProducts: DEMO_SMART_PRODUCTS,
  collectEmail: true, collectPhone: true, status: "active", createdAt: new Date().toISOString(),
};
const DEMO_LINK: PaymentLink = {
  id: "demo-wj-001", title: "Business Management Programme",
  description: "3-month intensive programme · Batch starting 1 May 2026", amount: 12000,
  collectInMultiplePayments: true, multiPaymentMode: "schedule",
  installments: [
    { id: "1", label: "Payment 1 — Enrolment Fee", amount: 4000, dueDate: fmtD(todayD), description: "" },
    { id: "2", label: "Payment 2 — Month 2", amount: 4000, dueDate: fmtD(addD(todayD, 30)), description: "" },
    { id: "3", label: "Payment 3 — Month 3", amount: 4000, dueDate: fmtD(addD(todayD, 60)), description: "" },
  ],
  collectEmail: true, collectPhone: true, status: "active", createdAt: new Date().toISOString(),
};

// ── Main component ─────────────────────────────────────────────────────────────
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
  const [variant, setVariant] = useState<Variant>(1);

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
    setLink(DEMO_SMART_LINK);
    setLoading(false);
  };

  // Derived
  const isSchedule = link?.collectInMultiplePayments && link.multiPaymentMode === "schedule" && (link.installments?.length ?? 0) > 0;
  const installments: Installment[] = (link?.installments ?? []).map((i) => ({ ...i, amount: Number(i.amount) }));
  const currentInst = installments[0];
  const remainingInsts = installments.slice(1);
  const payNowAmount = payFull ? installments.reduce((s, i) => s + Number(i.amount), 0) : currentInst ? Number(currentInst.amount) : link?.amount ?? 0;
  const totalAmount = link ? (installments.length > 0 ? installments.reduce((s, i) => s + Number(i.amount), 0) : link.amount) : 0;
  const smartProducts = link?.smartProducts ?? [];
  const smartTotal = smartProducts.reduce((s, p) => s + p.price * p.qty, 0);
  const isSmartLink = !!(link?.isSmartLink && smartProducts.length > 0);
  const effectiveAmount = isSmartLink ? smartTotal : payNowAmount;

  const handleOverviewContinue = () => { setScreen("details"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDetailsContinue = () => { if (!formData.name.trim()) return; setScreen("method"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setTxnId(`TXN${Date.now().toString().slice(-10)}`); setScreen("success"); window.scrollTo({ top: 0, behavior: "smooth" }); }, 2000);
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!link || link.status === "inactive") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-xl border p-8 text-center">
        <Lock className="h-10 w-10 text-red-400 mx-auto mb-4" />
        <h2 className="font-semibold mb-1">{!link ? "Link not found" : "Link inactive"}</h2>
        <Button variant="outline" onClick={() => navigate("/")} className="w-full mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    </div>
  );

  // ── Shared render helpers ─────────────────────────────────────────────────────

  const renderPayIcons = () => (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-gray-50 text-gray-600">UPI</span>
      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white" style={{ background: "#1A1F71" }}>VISA</span>
      <span className="flex items-center"><span className="h-3.5 w-3.5 rounded-full" style={{ background: "#EB001B", marginRight: "-5px" }} /><span className="h-3.5 w-3.5 rounded-full" style={{ background: "#F79E1B" }} /></span>
      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-gray-50 text-gray-600">Net Banking</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-gray-50 text-gray-600">Wallets</span>
    </div>
  );

  const renderSecured = (center = false) => (
    <p className={cn("text-xs text-gray-400 flex items-center gap-1", center && "justify-center")}>
      <Lock className="h-3 w-3" /> Secured by Razorpay
    </p>
  );

  const renderMethodTabs = (borderB = false) => (
    <div className={cn("flex gap-0", borderB && "border-b border-gray-200")}>
      {[{ k: "upi" as PayMethod, l: "UPI" }, { k: "card" as PayMethod, l: "Cards" }, { k: "netbanking" as PayMethod, l: "Net Banking" }, { k: "wallet" as PayMethod, l: "Wallet" }].map(({ k, l }) => (
        <button key={k} onClick={() => setPayMethod(k)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors", payMethod === k ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700")}>{l}</button>
      ))}
    </div>
  );

  const renderMethodContent = (amount: number) => (
    <div className="space-y-4">
      {payMethod === "upi" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center py-5 rounded-xl border border-gray-200 bg-gray-50">
            <QrCode className="h-24 w-24 text-gray-300" />
            <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
            <div className="flex gap-1.5 mt-1">{["G Pay", "PhonePe", "Paytm", "BHIM"].map(a => <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-white border text-gray-500">{a}</span>)}</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400"><div className="flex-1 h-px bg-gray-200" /><span>or pay with UPI ID</span><div className="flex-1 h-px bg-gray-200" /></div>
          <div className="flex gap-2">
            <Input placeholder="yourname@upi" value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }} className="h-10 flex-1" />
            <Button variant="outline" className="h-10 px-4" onClick={() => { if (upiId.includes("@")) setUpiVerified(true); }}>
              {upiVerified ? <span className="flex items-center gap-1 text-green-600"><Check className="h-4 w-4" /> Verified</span> : "Verify"}
            </Button>
          </div>
        </div>
      )}
      {payMethod === "card" && (
        <div className="space-y-3">
          <div><Label className="text-xs text-gray-600 mb-1 block">Card Number</Label><Input placeholder="0000 0000 0000 0000" value={cardData.number} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 16); setCardData({ ...cardData, number: v.replace(/(.{4})/g, "$1 ").trim() }); }} className="h-10 font-mono" /></div>
          <div><Label className="text-xs text-gray-600 mb-1 block">Name on Card</Label><Input placeholder="As printed on card" value={cardData.name} onChange={(e) => setCardData({ ...cardData, name: e.target.value })} className="h-10" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs text-gray-600 mb-1 block">Expiry</Label><Input placeholder="MM / YY" value={cardData.expiry} onChange={(e) => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length >= 3) v = v.slice(0, 2) + " / " + v.slice(2); setCardData({ ...cardData, expiry: v }); }} className="h-10 font-mono" /></div>
            <div><Label className="text-xs text-gray-600 mb-1 block">CVV</Label><Input placeholder="• • •" type="password" maxLength={4} value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} className="h-10 font-mono" /></div>
          </div>
        </div>
      )}
      {payMethod === "netbanking" && <div className="grid grid-cols-3 gap-2">{["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank", "PNB", "Canara", "Union Bank"].map(b => <button key={b} className="py-3 rounded-lg border text-xs font-medium hover:border-blue-400 hover:bg-blue-50">{b}</button>)}</div>}
      {payMethod === "wallet" && <div className="grid grid-cols-3 gap-2">{["Paytm", "PhonePe", "Amazon Pay", "Mobikwik", "Freecharge", "Ola Money"].map(w => <button key={w} className="py-3 rounded-lg border text-xs font-medium hover:border-blue-400 hover:bg-blue-50">{w}</button>)}</div>}
      <Separator />
      <Button onClick={handlePay} disabled={processing} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-semibold">
        {processing ? <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Processing…</span> : `Pay ${fmtINR(amount)}`}
      </Button>
      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5"><ShieldCheck className="h-3 w-3" /> PCI DSS Compliant · Secured by Razorpay</p>
    </div>
  );

  const renderDetailsPanel = (onBack: () => void, amtLabel: string) => (
    <div>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1"><p className="text-sm font-semibold">Your Details</p><p className="text-xs text-gray-400">Paying {amtLabel}</p></div>
        <p className="text-base font-bold">{amtLabel}</p>
      </div>
      <div className="p-5 space-y-4">
        <div><Label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</Label><Input placeholder="Enter your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-10" /></div>
        {link.collectEmail !== false && <div><Label className="text-xs font-medium text-gray-600 mb-1 block">Email Address</Label><Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10" /></div>}
        {link.collectPhone !== false && (
          <div><Label className="text-xs font-medium text-gray-600 mb-1 block">Mobile Number</Label>
            <div className="flex gap-2"><div className="flex items-center px-3 h-10 rounded-md border bg-gray-50 text-sm text-gray-600 flex-shrink-0">+91</div><Input type="tel" placeholder="10-digit number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-10 flex-1" /></div>
          </div>
        )}
        <Button onClick={handleDetailsContinue} disabled={!formData.name.trim()} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-semibold">Continue to Payment <ChevronRight className="ml-1.5 h-4 w-4" /></Button>
        {renderSecured(true)}
      </div>
    </div>
  );

  const renderMethodPanel = (onBack: () => void, amount: number) => (
    <div>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1"><p className="text-sm font-semibold">Select Payment Method</p><p className="text-xs text-gray-400">Paying {fmtINR(amount)}</p></div>
        <p className="text-base font-bold">{fmtINR(amount)}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[{ k: "upi" as PayMethod, icon: <Smartphone className="h-4 w-4" />, l: "UPI" }, { k: "card" as PayMethod, icon: <CreditCard className="h-4 w-4" />, l: "Card" }, { k: "netbanking" as PayMethod, icon: <Building2 className="h-4 w-4" />, l: "Net Banking" }, { k: "wallet" as PayMethod, icon: <Wallet className="h-4 w-4" />, l: "Wallet" }].map(({ k, icon, l }) => (
            <button key={k} onClick={() => setPayMethod(k)} className={cn("flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all", payMethod === k ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300")}>{icon}{l}</button>
          ))}
        </div>
        {renderMethodContent(amount)}
      </div>
    </div>
  );

  const renderSuccessPanel = () => (
    <div>
      <div className="bg-green-50 border-b border-green-100 px-5 py-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-green-600 flex items-center justify-center mb-3"><CheckCircle2 className="h-7 w-7 text-white" /></div>
        <h2 className="text-lg font-semibold">Payment Successful!</h2>
        <p className="text-sm text-gray-500 mt-1">{fmtINR(effectiveAmount)} paid to {MERCHANT_NAME}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-xl border divide-y">
          {[{ label: "Payment ID", value: txnId }, { label: "Amount Paid", value: fmtINR(effectiveAmount) }, { label: "Items", value: isSmartLink ? `${smartProducts.length} items` : (link?.title ?? "") }, { label: "Method", value: { upi: "UPI", card: "Card", netbanking: "Net Banking", wallet: "Wallet" }[payMethod] }, { label: "Date", value: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) }].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3"><span className="text-xs text-gray-500">{label}</span><span className="text-sm font-medium">{value}</span></div>
          ))}
        </div>
        <Button variant="outline" className="w-full h-10" onClick={() => navigate("/")}>Done</Button>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────────
  // ── V1: GALLERY CHECKOUT ─ Product showcase + sticky order summary
  // ──────────────────────────────────────────────────────────────────────────────
  const renderV1 = () => (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Top trust bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{MERCHANT_INITIALS}</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 leading-tight">{MERCHANT_NAME}</p>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-green-500" />
              <span className="text-[11px] text-green-600 font-medium">Razorpay Trusted Business</span>
              <span className="text-gray-300 mx-1">·</span>
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] text-gray-500">4.9 · 2,400+ sales</span>
            </div>
          </div>
          {isSmartLink && (
            <div className="flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3" /> Smart Link
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-start">

          {/* Left: Product gallery */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Your Order ({smartProducts.length} items)</h2>
            <div className="space-y-3">
              {smartProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                    : <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Package className="h-8 w-8 text-gray-300" /></div>
                  }
                  <div className="flex-1 min-w-0 py-1">
                    <p className="font-semibold text-gray-900 text-base leading-tight">{p.name}</p>
                    <p className="text-sm text-gray-400 mt-1">Qty: {p.qty} unit{p.qty > 1 ? "s" : ""}</p>
                    <div className="flex items-end justify-between mt-3">
                      <p className="text-xs text-gray-400">{fmtINR(p.price)} × {p.qty}</p>
                      <p className="text-lg font-bold text-gray-900">{fmtINR(p.price * p.qty)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust signals row */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck className="h-4 w-4 text-green-600" />, label: "Secure Payments", sub: "256-bit SSL" },
                { icon: <Zap className="h-4 w-4 text-yellow-600" />, label: "Instant Confirmation", sub: "Email + WhatsApp" },
                { icon: <Users className="h-4 w-4 text-blue-600" />, label: "148 paid today", sub: "From this merchant" },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col items-center text-center">
                  <div className="mb-1">{icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Checkout panel (sticky) */}
          <div className="sticky top-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {screen === "overview" && (
                <div>
                  <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-base">Order Summary</h3>
                  </div>
                  <div className="p-5 space-y-5">
                    <div className="space-y-3">
                      {smartProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                            <div className="min-w-0">
                              <p className="text-sm text-gray-700 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">×{p.qty}</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{fmtINR(p.price * p.qty)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Subtotal</span>
                        <span className="text-sm font-medium">{fmtINR(smartTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-sm text-gray-500">Tax & Fees</span>
                        <span className="text-sm text-green-600 font-medium">Included</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-700">{fmtINR(smartTotal)}</span>
                    </div>
                    <Button onClick={handleOverviewContinue} className="w-full h-12 bg-blue-700 hover:bg-blue-800 font-bold text-base rounded-xl">
                      Continue to Pay {fmtINR(smartTotal)} <ChevronRight className="ml-1.5 h-5 w-5" />
                    </Button>
                    <div className="text-center space-y-2">
                      {renderSecured(true)}
                      {renderPayIcons()}
                    </div>
                  </div>
                </div>
              )}
              {screen === "details" && renderDetailsPanel(() => setScreen("overview"), fmtINR(smartTotal))}
              {screen === "method" && renderMethodPanel(() => setScreen("details"), smartTotal)}
              {screen === "success" && renderSuccessPanel()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────────
  // ── V2: STREAM CHECKOUT ─ Mobile-first, conversion-optimised single column
  // ──────────────────────────────────────────────────────────────────────────────
  const renderV2 = () => (
    <div className="min-h-screen bg-gray-100">
      {/* Brand hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white px-4 pb-10 pt-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 ring-2 ring-white/30">
            <span className="text-white font-bold text-2xl">{MERCHANT_INITIALS}</span>
          </div>
          <h1 className="text-xl font-bold">{MERCHANT_NAME}</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
            <span className="text-sm text-blue-200 font-medium">Razorpay Trusted Business</span>
          </div>
          <div className="flex items-center justify-center gap-5 mt-4">
            <div className="flex items-center gap-1 text-xs text-blue-200">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /><span>4.9 · 2,400+ orders</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-200">
              <Users className="h-3 w-3" /><span>148 paid today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-md mx-auto px-4 -mt-5 pb-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {screen === "overview" && (
            <div className="p-5 space-y-5">
              {/* Section header */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center"><Package className="h-4 w-4 text-blue-600" /></div>
                <h3 className="font-semibold text-gray-900">{smartProducts.length} items in your order</h3>
              </div>

              {/* Product rows */}
              <div className="divide-y divide-gray-100">
                {smartProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center"><Package className="h-5 w-5 text-gray-300" /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtINR(p.price)} × {p.qty}</p>
                    </div>
                    <p className="text-base font-bold text-gray-900 flex-shrink-0">{fmtINR(p.price * p.qty)}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 rounded-xl p-4 flex items-center justify-between border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Amount</p>
                  <p className="text-xs text-green-600 mt-0.5 font-medium">✓ Tax & fees included</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{fmtINR(smartTotal)}</p>
              </div>

              {/* CTA */}
              <Button onClick={handleOverviewContinue} className="w-full h-13 bg-blue-700 hover:bg-blue-800 font-bold text-base py-4 rounded-xl shadow-lg shadow-blue-200">
                Continue to Pay {fmtINR(smartTotal)}
                <ChevronRight className="ml-1.5 h-5 w-5" />
              </Button>

              {/* Trust row */}
              <div className="text-center space-y-2">
                {renderSecured(true)}
                {renderPayIcons()}
              </div>

              {/* Social proof pill */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-1.5">
                  {["#3B82F6", "#8B5CF6", "#10B981"].map((c, i) => (
                    <div key={i} className="h-5 w-5 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-xs text-gray-500">148 people paid today</p>
              </div>
            </div>
          )}
          {screen === "details" && renderDetailsPanel(() => setScreen("overview"), fmtINR(smartTotal))}
          {screen === "method" && renderMethodPanel(() => setScreen("details"), smartTotal)}
          {screen === "success" && renderSuccessPanel()}
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────────
  // ── V3: DASHBOARD CHECKOUT ─ Razorpay-checkout-inspired rich 2-panel layout
  // ──────────────────────────────────────────────────────────────────────────────
  const renderV3 = () => (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel: dark brand sidebar ── */}
      <div className="lg:w-[38%] bg-[#1e3a8a] text-white flex flex-col px-8 py-8 lg:min-h-screen">

        {/* Merchant identity */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 ring-1 ring-white/20">
            <span className="text-white font-bold text-lg">{MERCHANT_INITIALS}</span>
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">{MERCHANT_NAME}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-green-400" />
              <span className="text-xs text-blue-200">Razorpay Trusted Business</span>
            </div>
          </div>
        </div>

        {/* Activity pill */}
        <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-2.5 mb-6">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <p className="text-sm text-blue-100">300+ orders last month · 148 paid today</p>
        </div>

        {/* Price summary */}
        <div className="mb-5">
          <p className="text-xs text-blue-300 uppercase tracking-widest mb-2 font-medium">Price Summary</p>
          <p className="text-5xl font-black tracking-tight">{fmtINR(smartTotal)}</p>
          <p className="text-sm text-blue-300 mt-1">{smartProducts.length} item{smartProducts.length > 1 ? "s" : ""} · Tax included</p>
        </div>

        {/* Product thumbnails */}
        <div className="space-y-3 flex-1">
          {smartProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              {p.image
                ? <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10" />
                : <div className="w-11 h-11 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center"><Package className="h-4 w-4 text-white/40" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight truncate">{p.name}</p>
                <p className="text-xs text-blue-300 mt-0.5">Qty {p.qty} · {fmtINR(p.price)}</p>
              </div>
              <p className="text-sm font-bold text-white flex-shrink-0">{fmtINR(p.price * p.qty)}</p>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-sm text-blue-200">
            <span>Subtotal</span><span>{fmtINR(smartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-blue-200">
            <span>Tax</span><span className="text-green-400">Included</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-1">
            <span>Total</span><span>{fmtINR(smartTotal)}</span>
          </div>
        </div>

        {/* Bottom trust */}
        <div className="mt-6 flex items-center gap-2 text-blue-300 text-xs">
          <Lock className="h-3 w-3" />
          <span>Money Back Guarantee by Razorpay</span>
        </div>
      </div>

      {/* ── Right panel: white checkout ── */}
      <div className="flex-1 bg-white flex flex-col">

        {screen === "overview" && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Payment Options</h2>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="h-3 w-3" /> Secured</span>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              {/* Method tabs */}
              {renderMethodTabs(true)}

              {/* Offers banner */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Available Offers</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><Gift className="h-4 w-4 text-amber-600" /></div>
                  <p className="text-sm text-gray-800 flex-1 font-medium">Upto ₹50 cashback via CRED</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">+6</span>
                    <button className="text-xs text-blue-600 font-semibold hover:underline">View all</button>
                  </div>
                </div>
              </div>

              {/* UPI default */}
              {payMethod === "upi" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">UPI QR</p>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">⏱ 11:48</span>
                  </div>
                  <div className="flex gap-5 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex-shrink-0 bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm">
                      <QrCode className="h-[100px] w-[100px] text-gray-800" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-gray-700 font-medium">Scan the QR using any UPI App</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[["G", "#4285F4"], ["P", "#5F259F"], ["C", "#000"], ["PT", "#00B9F1"], ["B", "#003366"]].map(([l, c]) => (
                          <div key={l} className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: c }}>{l}</div>
                        ))}
                      </div>
                      <div className="bg-green-100 text-green-700 rounded-lg px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1">
                        <Zap className="h-3 w-3" /> 8 Offers available
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 my-4">
                    <div className="flex-1 h-px bg-gray-200" /><span>or enter UPI ID</span><div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="yourname@upi" value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }} className="h-10 flex-1" />
                    <Button variant="outline" className="h-10 px-4" onClick={() => { if (upiId.includes("@")) setUpiVerified(true); }}>
                      {upiVerified ? <span className="flex items-center gap-1 text-green-600"><Check className="h-4 w-4" /> OK</span> : "Verify"}
                    </Button>
                  </div>
                </div>
              )}
              {payMethod === "card" && (
                <div className="space-y-3">
                  <div><Label className="text-xs text-gray-600 mb-1 block">Card Number</Label><Input placeholder="0000 0000 0000 0000" value={cardData.number} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 16); setCardData({ ...cardData, number: v.replace(/(.{4})/g, "$1 ").trim() }); }} className="h-10 font-mono" /></div>
                  <div><Label className="text-xs text-gray-600 mb-1 block">Name on Card</Label><Input placeholder="As printed on card" value={cardData.name} onChange={(e) => setCardData({ ...cardData, name: e.target.value })} className="h-10" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs text-gray-600 mb-1 block">Expiry</Label><Input placeholder="MM / YY" value={cardData.expiry} onChange={(e) => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length >= 3) v = v.slice(0, 2) + " / " + v.slice(2); setCardData({ ...cardData, expiry: v }); }} className="h-10 font-mono" /></div>
                    <div><Label className="text-xs text-gray-600 mb-1 block">CVV</Label><Input placeholder="• • •" type="password" maxLength={4} value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} className="h-10 font-mono" /></div>
                  </div>
                </div>
              )}
              {payMethod === "netbanking" && <div className="grid grid-cols-3 gap-2">{["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank", "PNB", "Canara", "Union Bank"].map(b => <button key={b} className="py-3 rounded-lg border text-xs font-medium hover:border-blue-400 hover:bg-blue-50">{b}</button>)}</div>}
              {payMethod === "wallet" && <div className="grid grid-cols-3 gap-2">{["Paytm", "PhonePe", "Amazon Pay", "Mobikwik", "Freecharge", "Ola Money"].map(w => <button key={w} className="py-3 rounded-lg border text-xs font-medium hover:border-blue-400 hover:bg-blue-50">{w}</button>)}</div>}

              {/* CTA */}
              <div className="pt-2 space-y-3">
                <Button onClick={handleOverviewContinue} className="w-full h-12 bg-blue-700 hover:bg-blue-800 font-bold text-base rounded-xl">
                  Continue to Pay {fmtINR(smartTotal)} <ChevronRight className="ml-1.5 h-5 w-5" />
                </Button>
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> PCI DSS Compliant · Secured by Razorpay
                </p>
                {renderPayIcons()}
              </div>
            </div>
          </>
        )}

        {screen === "details" && <div className="flex-1">{renderDetailsPanel(() => setScreen("overview"), fmtINR(smartTotal))}</div>}
        {screen === "method" && <div className="flex-1">{renderMethodPanel(() => setScreen("details"), smartTotal)}</div>}
        {screen === "success" && <div className="flex-1">{renderSuccessPanel()}</div>}
      </div>
    </div>
  );

  // ── Prototype variant switcher ────────────────────────────────────────────────
  const VARIANT_META: Record<Variant, { label: string; desc: string }> = {
    1: { label: "V1 · Gallery", desc: "Product showcase + sticky summary" },
    2: { label: "V2 · Stream", desc: "Mobile-first, conversion focused" },
    3: { label: "V3 · Dashboard", desc: "Razorpay checkout-style" },
  };

  const renderSwitcher = () => (
    <div className="bg-gray-950 text-white py-2.5 px-4">
      <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap justify-center">
        <span className="text-xs text-gray-500 font-medium">Prototype · Smart Link Checkout Variations</span>
        <div className="flex gap-1.5">
          {([1, 2, 3] as Variant[]).map((v) => (
            <button key={v} onClick={() => { setVariant(v); setScreen("overview"); }}
              title={VARIANT_META[v].desc}
              className={cn("text-xs px-3 py-1.5 rounded-full font-medium transition-all",
                variant === v ? "bg-blue-600 text-white shadow-sm" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              )}>
              {VARIANT_META[v].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Shared footer ─────────────────────────────────────────────────────────────
  const renderFooter = () => (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-3 text-center">
        {renderPayIcons()}
        <p className="text-xs text-gray-500">Want to create payment links for your business?{" "}
          <a href="https://razorpay.com/payment-links" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Visit razorpay.com/payment-links</a>
        </p>
        <p className="text-xs text-gray-400"><button className="text-red-500 font-medium">🚩 Report Payment Link</button></p>
      </div>
    </div>
  );

  // ── Non-smart: existing standard layout ──────────────────────────────────────
  if (!isSmartLink) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-[3fr_2fr] items-start">
              {/* Left */}
              <div className="flex flex-col justify-center lg:min-h-[70vh] py-10 px-8 border-r border-gray-200">
                <div className="space-y-6">
                  <div><p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Payment Request from</p><p className="text-2xl font-bold">{MERCHANT_NAME}</p></div>
                  {(link.title || link.description) && (
                    <div><p className="text-xs text-gray-400 mb-0.5">Payment for</p>{link.title && <p className="font-medium text-gray-800">{link.title}</p>}{link.description && <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>}</div>
                  )}
                  <div><p className="text-xs text-gray-400 mb-0.5">Total Amount</p><p className="text-2xl font-bold">{fmtINR(totalAmount)}</p></div>
                </div>
                <div className="mt-10 pt-5 border-t border-gray-200 space-y-1">
                  <p className="text-xs text-gray-400">For any queries, please contact <span className="font-medium text-gray-600">{MERCHANT_NAME}</span></p>
                  <button className="text-xs text-blue-600 underline">Merchant's business policies</button>
                </div>
              </div>
              {/* Right */}
              <div>
                {screen === "overview" && (
                  <div>
                    <div className="bg-blue-700 px-5 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-600 border border-blue-500 flex items-center justify-center"><span className="text-white font-bold text-xs">{MERCHANT_INITIALS}</span></div>
                      <p className="text-white font-semibold">{MERCHANT_NAME}</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Amount to Pay</p>
                        <p className="text-2xl font-bold">{fmtINR(isSchedule ? payNowAmount : totalAmount)}</p>
                      </div>
                      <Button onClick={handleOverviewContinue} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-semibold">Continue to Pay {fmtINR(isSchedule ? payNowAmount : totalAmount)} <ChevronRight className="ml-1.5 h-4 w-4" /></Button>
                      {renderSecured(true)}
                    </div>
                  </div>
                )}
                {screen === "details" && renderDetailsPanel(() => setScreen("overview"), fmtINR(isSchedule ? payNowAmount : totalAmount))}
                {screen === "method" && renderMethodPanel(() => setScreen("details"), isSchedule ? payNowAmount : totalAmount)}
                {screen === "success" && renderSuccessPanel()}
              </div>
            </div>
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  }

  // ── Smart link: variant-based render ─────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {renderSwitcher()}
      {variant === 1 && <>{renderV1()}{renderFooter()}</>}
      {variant === 2 && <>{renderV2()}{renderFooter()}</>}
      {variant === 3 && renderV3()}
    </div>
  );
}
