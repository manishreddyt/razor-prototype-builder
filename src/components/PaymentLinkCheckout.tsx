import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, ShieldCheck, Lock, CreditCard, Smartphone, Wallet, Building2,
  ArrowLeft, Calendar, QrCode, Check, ChevronRight, ChevronDown, Sparkles,
  Package, Star, Users, Zap, Gift, X, ShoppingCart,
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
  const [paidInstCount, setPaidInstCount] = useState(0);
  const [txnId, setTxnId] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<{ label: string; amount: number; paidAt: string; txnId: string }[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [lastPaidAmt, setLastPaidAmt] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [variant, setVariant] = useState<Variant>(3);
  const [orderExpanded, setOrderExpanded] = useState(false);
  // V3 contact + address step state
  const [v3Phone, setV3Phone] = useState("");
  const [v3Pincode, setV3Pincode] = useState("");
  const [v3City, setV3City] = useState("");
  const [v3FullName, setV3FullName] = useState("");
  const [v3House, setV3House] = useState("");
  const [v3Area, setV3Area] = useState("");
  const [v3SelectedAddr, setV3SelectedAddr] = useState<string | null>(null);

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
  const currentInst = installments[paidInstCount];
  const remainingInsts = installments.slice(paidInstCount + 1);
  const totalAmount = link ? (installments.length > 0 ? installments.reduce((s, i) => s + Number(i.amount), 0) : link.amount) : 0;
  const paidSoFar = installments.slice(0, paidInstCount).reduce((s, i) => s + Number(i.amount), 0);
  const remainingAmt = totalAmount - paidSoFar;
  const payNowAmount = payFull ? remainingAmt : currentInst ? Number(currentInst.amount) : link?.amount ?? 0;
  const smartProducts = link?.smartProducts ?? [];
  const smartTotal = smartProducts.reduce((s, p) => s + p.price * p.qty, 0);
  const isSmartLink = !!(link?.isSmartLink && smartProducts.length > 0);
  const effectiveAmount = isSmartLink ? smartTotal : payNowAmount;

  const handleOverviewContinue = () => { setScreen("method"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDetailsContinue = () => { if (!formData.name.trim()) return; setScreen("method"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Persist payment result back to localStorage so PaymentLinks list stays in sync
  const persistPayment = (txnId: string, instsPaid: Installment[], newPaidCount: number) => {
    try {
      const stored = localStorage.getItem("payment_links");
      if (!stored || !link) return;
      const links: any[] = JSON.parse(stored);
      const idx = links.findIndex((l) => l.id === link.id);
      if (idx === -1) return;
      const updatedLink = { ...links[idx] };
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const methodLabel: Record<string, string> = { upi: "UPI", card: "Card", netbanking: "Net Banking", wallet: "Wallet" };
      // Mark each paid installment
      const updatedInsts = (updatedLink.installments || []).map((inst: any) => {
        const wasPaid = instsPaid.find((p) => String(p.id) === String(inst.id));
        if (!wasPaid) return inst;
        return {
          ...inst,
          status: "Paid",
          transactions: [
            ...(inst.transactions || []),
            { id: txnId, date: dateStr, method: methodLabel[payMethod] ?? "UPI", amount: wasPaid.amount, status: "Success" },
          ],
        };
      });
      const allInstsPaid = newPaidCount >= (updatedLink.installments?.length ?? 0);
      const anyPaid = newPaidCount > 0;
      const newAmountPaid = updatedInsts
        .filter((i: any) => i.status === "Paid")
        .reduce((s: number, i: any) => s + Number(i.amount), 0);
      updatedLink.installments = updatedInsts;
      updatedLink.amountPaid = newAmountPaid;
      updatedLink.status = allInstsPaid ? "Paid" : anyPaid ? "Partially Paid" : updatedLink.status;
      // Capture delivery address for Magic Links
      if (updatedLink.isSmartLink) {
        const SAVED_ADDRS_MAP: Record<string, { tag: string; line1: string; line2: string }> = {
          a1: { tag: "Home", line1: "5th Cross, Koramangala 4th Block", line2: "Bengaluru, Karnataka 560034" },
          a2: { tag: "Office", line1: "100 Feet Road, Indiranagar", line2: "Bengaluru, Karnataka 560038" },
        };
        if (v3SelectedAddr && SAVED_ADDRS_MAP[v3SelectedAddr]) {
          const sa = SAVED_ADDRS_MAP[v3SelectedAddr];
          updatedLink.customerAddress = {
            tag: sa.tag,
            addressLine: sa.line1,
            cityState: sa.line2,
          };
        } else if (v3House || v3Area || v3City) {
          updatedLink.customerAddress = {
            tag: "Delivery",
            name: v3FullName,
            addressLine: [v3House, v3Area].filter(Boolean).join(", "),
            cityState: [v3City, v3Pincode].filter(Boolean).join(" – "),
          };
        }
      }
      links[idx] = updatedLink;
      localStorage.setItem("payment_links", JSON.stringify(links));
    } catch (e) { console.error("persistPayment error", e); }
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const newTxnId = `TXN${Date.now().toString().slice(-10)}`;
      setTxnId(newTxnId);
      if (isSchedule) {
        const instsPaid = payFull ? installments.slice(paidInstCount) : [installments[paidInstCount]];
        const amtJustPaid = instsPaid.reduce((s, i) => s + Number(i.amount), 0);
        setLastPaidAmt(amtJustPaid);
        const newPaidCount = payFull ? installments.length : paidInstCount + 1;
        const paidAt = new Date().toISOString();
        setPaymentHistory(prev => [
          ...prev,
          ...instsPaid.map(inst => ({ label: inst.label, amount: Number(inst.amount), paidAt, txnId: newTxnId })),
        ]);
        setPaidInstCount(newPaidCount);
        persistPayment(newTxnId, instsPaid, newPaidCount);
      }
      setScreen("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2000);
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
  // ── V2: STREAM CHECKOUT ─ Mobile-first, modal-based checkout popup
  // ──────────────────────────────────────────────────────────────────────────────
  const renderV2 = () => {
    const openModal = () => { setScreen("details"); };
    const closeModal = () => { setScreen("overview"); };

    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #eef2ff 0%, #f8fafc 60%)" }}>
        {/* Brand hero — compact strip */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 pt-10 pb-16 text-center relative overflow-hidden">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white font-black text-2xl tracking-tight">{MERCHANT_INITIALS}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{MERCHANT_NAME}</h1>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm text-blue-200">Razorpay Trusted Business</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-blue-200/80">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> 4.9 · 2,400+ orders
              </span>
              <span className="text-blue-400/50">·</span>
              <span className="flex items-center gap-1 text-xs text-blue-200/80">
                <Users className="h-3 w-3" /> 148 paid today
              </span>
            </div>
          </div>
        </div>

        {/* Floating order card — always shows overview */}
        <div className="max-w-md mx-auto px-4 -mt-8 pb-12 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-white overflow-hidden">

            {/* Card header */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-2 border-b border-gray-100">
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">Order Summary</span>
              <span className="ml-auto text-xs text-gray-400 font-medium">{smartProducts.length} item{smartProducts.length > 1 ? "s" : ""}</span>
            </div>

            {/* Product rows */}
            <div className="divide-y divide-gray-50 px-5">
              {smartProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-3.5">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                    : <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center"><Package className="h-4 w-4 text-gray-300" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtINR(p.price)} × {p.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">{fmtINR(p.price * p.qty)}</p>
                </div>
              ))}
            </div>

            {/* Total row */}
            <div className="mx-5 mb-5 mt-1 rounded-2xl border border-gray-200 bg-gray-50">
              <div className="px-4 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">TOTAL AMOUNT</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5 font-medium flex items-center gap-0.5">✓ Tax & fees included</p>
                </div>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{fmtINR(smartTotal)}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5 space-y-3">
              <Button
                onClick={openModal}
                className="w-full h-13 py-3.5 text-base font-bold rounded-2xl shadow-lg shadow-blue-300/40 bg-blue-700 hover:bg-blue-800 transition-all active:scale-[0.98]"
              >
                Continue to Pay {fmtINR(smartTotal)}
                <ChevronRight className="ml-1.5 h-5 w-5" />
              </Button>

              {/* Trust + pay icons */}
              <div className="text-center space-y-2 pt-1">
                {renderSecured(true)}
                {renderPayIcons()}
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="flex -space-x-1.5">
                  {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"].map((c, i) => (
                    <div key={i} className="h-5 w-5 rounded-full border-2 border-white ring-0" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-xs text-gray-400">148 people paid today</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Checkout modal overlay ── */}
        {screen !== "overview" && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)" }}
            onClick={(e) => { if (e.target === e.currentTarget && screen === "details") closeModal(); }}
          >
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "90vh" }}>

              {/* Modal top bar */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                {/* Drag handle (mobile) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-2 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
                <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[11px] font-bold">{MERCHANT_INITIALS}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{MERCHANT_NAME}</p>
                  <p className="text-xs text-gray-500">Paying {fmtINR(smartTotal)}</p>
                </div>
                {/* Close — only when not in success */}
                {screen !== "success" && (
                  <button
                    onClick={closeModal}
                    className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Modal content */}
              <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 73px)" }}>
                {screen === "details" && renderDetailsPanel(closeModal, fmtINR(smartTotal))}
                {screen === "method" && renderMethodPanel(() => setScreen("details"), smartTotal)}
                {screen === "success" && renderSuccessPanel()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // ── V3: MAGIC CHECKOUT ─ Contact → Address → Payment full flow
  // ──────────────────────────────────────────────────────────────────────────────

  const SAVED_ADDRESSES = [
    { id: "a1", tag: "Home", line1: "5th Cross, Koramangala 4th Block", line2: "Bengaluru, Karnataka 560034" },
    { id: "a2", tag: "Office", line1: "100 Feet Road, Indiranagar", line2: "Bengaluru, Karnataka 560038" },
  ];

  const PAYMENT_METHODS = [
    {
      k: "upi" as PayMethod,
      label: "UPI",
      sub: "2 Offers",
      icon: <Smartphone className="h-4 w-4" />,
      logos: [["G","#4285F4"],["P","#5F259F"],["C","#000"],["B","#003366"]],
    },
    {
      k: "card" as PayMethod,
      label: "Cards",
      sub: "Upto 1.5% savings",
      icon: <CreditCard className="h-4 w-4" />,
      logos: [],
    },
    {
      k: "netbanking" as PayMethod,
      label: "Netbanking",
      sub: "",
      icon: <Building2 className="h-4 w-4" />,
      logos: [],
    },
    {
      k: "wallet" as PayMethod,
      label: "Wallet",
      sub: "",
      icon: <Wallet className="h-4 w-4" />,
      logos: [],
    },
  ];

  const renderV3 = () => {
    // Map screen → step label
    const v3Step = screen === "overview" ? "contact" : screen === "details" ? "address" : screen === "method" ? "payment" : "success";
    const steps = ["Contact", "Address", "Payment"] as const;
    const activeIdx = v3Step === "contact" ? 0 : v3Step === "address" ? 1 : 2;

    // ── Shared breadcrumb bar ──────────────────────────────────────────────
    const renderBreadcrumb = () => (
      <div className="flex items-center gap-1.5 px-6 py-3.5 border-b border-gray-100 bg-gray-50/60 flex-shrink-0">
        {steps.map((step, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <span key={step} className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (done) setScreen(i === 0 ? "overview" : i === 1 ? "details" : "method");
                }}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors",
                  active ? "text-blue-700 font-semibold" : done ? "text-gray-600 hover:text-blue-600 cursor-pointer" : "text-gray-300 cursor-default"
                )}
              >
                <span className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                  active ? "bg-blue-600 text-white" : done ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-400"
                )}>
                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                {step}
              </button>
              {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />}
            </span>
          );
        })}
        <span className="ml-auto text-[11px] text-gray-400 flex items-center gap-1">
          <Lock className="h-3 w-3" /> Secured
        </span>
      </div>
    );

    // ── Left panel ─────────────────────────────────────────────────────────
    const renderLeft = () => (
      <div className="lg:w-[300px] flex-shrink-0 bg-[#1a3472] text-white flex flex-col">
        <div className="px-5 pt-5 pb-4 flex flex-col flex-1">

          {/* Logo + name */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                <span className="text-white font-black text-base tracking-tight">{MERCHANT_INITIALS}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#1a3472] flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              </div>
            </div>
            <div>
              <p className="font-black text-base leading-tight">{MERCHANT_NAME}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span className="text-[11px] text-blue-300">Razorpay Trusted Business</span>
              </div>
            </div>
          </div>

          {/* Live activity strip */}
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 mb-3"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <ShoppingCart className="h-3 w-3 text-blue-300 flex-shrink-0" />
            <span className="text-[11px] text-blue-100">400+ orders last month</span>
            <span className="ml-auto text-[11px] font-bold text-amber-400">148 today</span>
          </div>
          <style>{`@keyframes countUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Order summary — collapsible */}
          <button type="button" onClick={() => setOrderExpanded(v => !v)}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 mb-1"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-blue-300" />
              <span className="text-[11px] font-semibold text-blue-200">
                Order summary · {smartProducts.length} item{smartProducts.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">{fmtINR(smartTotal)}</span>
              <ChevronRight className={`h-3.5 w-3.5 text-blue-300 transition-transform ${orderExpanded ? "rotate-90" : ""}`} />
            </div>
          </button>

          {orderExpanded && (
            <div className="space-y-1 mb-2 pt-1">
              {smartProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10" />
                    : <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center"><Package className="h-3 w-3 text-white/40" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-blue-300">Qty. {p.qty}</p>
                  </div>
                  <p className="text-xs font-bold text-white">{fmtINR(p.price * p.qty)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Coupons & offers card */}
          <button type="button"
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 mt-2 transition-colors"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <div className="h-7 w-7 rounded-full bg-emerald-500/25 flex items-center justify-center flex-shrink-0">
              <Gift className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-emerald-300 leading-tight">Coupons and offers</p>
              <p className="text-[10px] text-emerald-400/70">7 coupons and offers available</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
          </button>

          {/* Show phone after contact step */}
          {v3Phone && (
            <div className="flex items-center gap-2 mt-2 rounded-xl px-3 py-2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <Users className="h-3.5 w-3.5 text-blue-300 flex-shrink-0" />
              <span className="text-xs text-blue-200">Using as +91 {v3Phone}</span>
            </div>
          )}

          {/* Illustration area */}
          <div className="flex-1 flex items-end justify-center pb-2 pt-4 select-none pointer-events-none">
            <div className="flex items-end gap-3 opacity-30">
              <div className="text-5xl">🛍️</div>
              <div className="text-4xl mb-1">📦</div>
              <div className="text-3xl mb-2">🏷️</div>
            </div>
          </div>

          {/* Secured footer */}
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/10">
            <Lock className="h-3 w-3 text-blue-400" />
            <span className="text-[11px] text-blue-300">Secured by Razorpay</span>
          </div>
        </div>
      </div>
    );

    // ── Right panel screens ────────────────────────────────────────────────

    // Contact
    const renderContact = () => (
      <div className="flex-1 flex flex-col">
        {renderBreadcrumb()}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-5">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
            <Users className="h-7 w-7 text-gray-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Contact details</h2>
            <p className="text-sm text-gray-500 mt-1">Enter mobile number to continue</p>
          </div>
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center border border-input rounded-xl overflow-hidden h-12 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <div className="flex items-center gap-1.5 px-3 border-r border-input bg-gray-50 h-full text-sm text-gray-700 flex-shrink-0">
                🇮🇳 <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <span className="px-3 text-sm text-gray-500 border-r border-input h-full flex items-center flex-shrink-0">+91</span>
              <input
                type="tel" placeholder="Mobile number" value={v3Phone}
                onChange={(e) => setV3Phone(e.target.value.replace(/\D/g,"").slice(0,10))}
                className="flex-1 h-full px-3 text-sm outline-none bg-white"
              />
            </div>
            <Button
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 font-semibold rounded-xl text-base"
              onClick={() => { if (v3Phone.length >= 10) setScreen("details"); }}
              disabled={v3Phone.length < 10}
            >
              Continue
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span>Money Back Promise by</span>
            <span className="font-bold text-gray-700">Razorpay</span>
          </div>
        </div>
      </div>
    );

    // Address
    const renderAddress = () => (
      <div className="flex-1 flex flex-col">
        {renderBreadcrumb()}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add delivery address</h2>

          {/* Saved addresses */}
          <div className="space-y-2 mb-4">
            {SAVED_ADDRESSES.map((addr) => (
              <button key={addr.id} type="button"
                onClick={() => setV3SelectedAddr(addr.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                  v3SelectedAddr === addr.id ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                )}>
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors",
                  v3SelectedAddr === addr.id ? "border-blue-600 bg-blue-600" : "border-gray-300"
                )}>
                  {v3SelectedAddr === addr.id && <div className="h-full w-full rounded-full scale-50 bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{addr.tag}</span>
                  <p className="text-sm text-gray-800 leading-snug mt-0.5">{addr.line1}</p>
                  <p className="text-xs text-gray-500">{addr.line2}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or add new address</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Address form */}
          <div className="space-y-3">
            <Input placeholder="Pincode" value={v3Pincode}
              onChange={(e) => setV3Pincode(e.target.value.replace(/\D/g,"").slice(0,6))}
              className="h-11 text-sm rounded-xl" />
            <Input placeholder="City" value={v3City} onChange={(e) => setV3City(e.target.value)} className="h-11 text-sm rounded-xl" />
            <Input placeholder="Full name" value={v3FullName} onChange={(e) => setV3FullName(e.target.value)} className="h-11 text-sm rounded-xl" />
            <Input placeholder="House no / Building / Apartment" value={v3House} onChange={(e) => setV3House(e.target.value)} className="h-11 text-sm rounded-xl" />
            <Input placeholder="Area, Sector, Street, Village" value={v3Area} onChange={(e) => setV3Area(e.target.value)} className="h-11 text-sm rounded-xl" />
            <button type="button" className="flex items-center gap-1.5 text-sm text-blue-600 font-medium">
              <span className="text-lg leading-none">+</span> Add landmark (optional)
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
              Save my address as
            </label>
          </div>

          <Button
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 font-semibold rounded-xl text-base mt-5"
            onClick={() => setScreen("method")}
          >
            Continue
          </Button>
        </div>
      </div>
    );

    // Payment
    const renderPayment = () => (
      <div className="flex-1 flex flex-col min-h-0">
        {renderBreadcrumb()}
        <div className="flex flex-1 min-h-0 divide-x divide-gray-100 overflow-hidden">
          {/* Method list */}
          <div className="w-[195px] flex-shrink-0 flex flex-col py-4 overflow-y-auto">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-4 mb-2">Recommended</p>
            {PAYMENT_METHODS.map(({ k, label, sub, icon }) => (
              <button key={k} onClick={() => setPayMethod(k)}
                className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-left border-l-2 transition-all",
                  payMethod === k ? "border-l-blue-600 bg-blue-50/70" : "border-l-transparent hover:bg-gray-50")}>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  payMethod === k ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500")}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold leading-tight", payMethod === k ? "text-blue-700" : "text-gray-800")}>{label}</p>
                  {sub && <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">{sub}</span>}
                </div>
              </button>
            ))}
            <button className="flex items-center gap-1 text-xs text-gray-400 px-4 py-3">
              <ChevronDown className="h-3.5 w-3.5" /> More options
            </button>
          </div>

          {/* Detail / QR panel */}
          <div className="flex-1 flex flex-col p-5 overflow-y-auto gap-4 min-w-0">
            {/* Offers */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Available Offers</p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <Gift className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-gray-800 font-medium flex-1">Upto ₹50 cashback via CRED</p>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">+6</span>
                <button className="text-[11px] text-blue-600 font-semibold hover:underline">View all</button>
              </div>
            </div>

            {/* UPI */}
            {payMethod === "upi" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">UPI QR</p>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">⏱ 11:48</span>
                </div>
                <div className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/60">
                  <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex-shrink-0">
                    <QrCode className="h-[80px] w-[80px] text-gray-800" />
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <p className="text-xs text-gray-700 font-medium">Scan using any UPI App</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[["G","#4285F4"],["P","#5F259F"],["C","#000"],["PT","#00B9F1"],["B","#003366"]].map(([l,c]) => (
                        <div key={l} className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: c }}>{l}</div>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-semibold">
                      <Zap className="h-2.5 w-2.5" /> 8 Offers
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <div className="flex-1 h-px bg-gray-200" /><span>or enter UPI ID</span><div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <Input placeholder="yourname@upi" value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }} className="h-9 flex-1 text-sm" />
                  <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => { if (upiId.includes("@")) setUpiVerified(true); }}>
                    {upiVerified ? <span className="text-green-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" />OK</span> : "Verify"}
                  </Button>
                </div>
              </div>
            )}
            {payMethod === "card" && (
              <div className="space-y-3">
                <div><Label className="text-xs text-gray-600 mb-1 block">Card Number</Label><Input placeholder="0000 0000 0000 0000" value={cardData.number} onChange={(e) => { const v=e.target.value.replace(/\D/g,"").slice(0,16); setCardData({...cardData,number:v.replace(/(.{4})/g,"$1 ").trim()}); }} className="h-9 font-mono text-sm" /></div>
                <div><Label className="text-xs text-gray-600 mb-1 block">Name on Card</Label><Input placeholder="As printed on card" value={cardData.name} onChange={(e) => setCardData({...cardData,name:e.target.value})} className="h-9 text-sm" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs text-gray-600 mb-1 block">Expiry</Label><Input placeholder="MM / YY" value={cardData.expiry} className="h-9 font-mono text-sm" onChange={(e) => { let v=e.target.value.replace(/\D/g,"").slice(0,4); if(v.length>=3) v=v.slice(0,2)+" / "+v.slice(2); setCardData({...cardData,expiry:v}); }} /></div>
                  <div><Label className="text-xs text-gray-600 mb-1 block">CVV</Label><Input placeholder="• • •" type="password" maxLength={4} value={cardData.cvv} onChange={(e) => setCardData({...cardData,cvv:e.target.value.replace(/\D/g,"").slice(0,4)})} className="h-9 font-mono text-sm" /></div>
                </div>
              </div>
            )}
            {payMethod === "netbanking" && <div className="grid grid-cols-2 gap-2">{["SBI","HDFC","ICICI","Axis","Kotak","Yes Bank","PNB","Canara"].map(b => <button key={b} className="py-2.5 rounded-xl border text-xs font-medium hover:border-blue-400 hover:bg-blue-50">{b}</button>)}</div>}
            {payMethod === "wallet" && <div className="grid grid-cols-2 gap-2">{["Paytm","PhonePe","Amazon Pay","Mobikwik","Freecharge","Ola Money"].map(w => <button key={w} className="py-2.5 rounded-xl border text-xs font-medium hover:border-blue-400 hover:bg-blue-50">{w}</button>)}</div>}

            {/* CTA */}
            <div className="mt-auto pt-2 space-y-2">
              <Button onClick={handlePay} disabled={processing} className="w-full h-11 bg-gray-900 hover:bg-gray-800 font-bold rounded-xl text-sm">
                {processing ? <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Processing…</span> : <>Pay {fmtINR(smartTotal)} <ChevronRight className="ml-1 h-4 w-4" /></>}
              </Button>
              <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" /> PCI DSS Compliant · Secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-[#eef0f5] flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row" style={{ minHeight: 560 }}>
          {renderLeft()}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {v3Step === "contact" && renderContact()}
            {v3Step === "address" && renderAddress()}
            {v3Step === "payment" && renderPayment()}
            {screen === "success" && <div className="flex-1">{renderSuccessPanel()}</div>}
          </div>
        </div>
      </div>
    );
  };

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

  // ── Non-smart: Razorpay-style standard layout ────────────────────────────────
  if (!isSmartLink) {
    const stdAmt = isSchedule ? payNowAmount : totalAmount;

    const allPaid = paidInstCount >= installments.length;
    const justPaidAmt = lastPaidAmt || payNowAmount;

    // Right panel: radio selection for partial payment
    const renderPartialOverview = () => (
      <div className="p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Choose payment option</p>

        {/* Option 1 — Pay instalment now */}
        <button
          type="button"
          onClick={() => setPayFull(false)}
          className={`w-full flex items-start gap-3.5 px-4 py-4 rounded-xl border-2 text-left transition-all ${!payFull ? "border-blue-500 bg-blue-50/60" : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${!payFull ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
            {!payFull && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm font-semibold ${!payFull ? "text-blue-700" : "text-gray-800"}`}>{currentInst?.label ?? "Pay now"}</p>
              <p className={`text-base font-black flex-shrink-0 ${!payFull ? "text-blue-700" : "text-gray-900"}`}>{fmtINR(Number(currentInst?.amount ?? 0))}</p>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Due {currentInst ? fmtRelative(currentInst.dueDate) : "now"} · {remainingInsts.length} more payment{remainingInsts.length !== 1 ? "s" : ""} after this</p>
          </div>
        </button>

        {/* Option 2 — Pay full */}
        <button
          type="button"
          onClick={() => setPayFull(true)}
          className={`w-full flex items-start gap-3.5 px-4 py-4 rounded-xl border-2 text-left transition-all ${payFull ? "border-blue-500 bg-blue-50/60" : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${payFull ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
            {payFull && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm font-semibold ${payFull ? "text-blue-700" : "text-gray-800"}`}>
                {paidInstCount > 0 ? "Pay Remaining Amount" : "Pay full amount"}
              </p>
              <p className={`text-base font-black flex-shrink-0 ${payFull ? "text-blue-700" : "text-gray-900"}`}>{fmtINR(remainingAmt)}</p>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {paidInstCount > 0
                ? `${installments.length - paidInstCount} remaining payment${installments.length - paidInstCount !== 1 ? "s" : ""}`
                : `Clear all ${installments.length} payments at once`}
            </p>
          </div>
        </button>

        <Button onClick={() => setScreen("method")} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-bold text-base rounded-xl mt-2">
          Continue to Pay {fmtINR(payFull ? remainingAmt : Number(currentInst?.amount ?? 0))} <ChevronRight className="ml-1.5 h-5 w-5" />
        </Button>
        {renderSecured(true)}
      </div>
    );

    // Right panel: partial payment success
    const renderPartialSuccess = () => (
      <div className="p-6 space-y-5">
        {/* Confirmation */}
        <div className="flex flex-col items-center text-center py-2">
          <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <p className="text-lg font-bold text-gray-900">Payment Successful!</p>
          <p className="text-sm text-gray-500 mt-0.5">{fmtINR(justPaidAmt)} paid to {MERCHANT_NAME}</p>
          <p className="text-xs text-gray-400 mt-1 font-mono">{txnId}</p>
        </div>

        {allPaid ? (
          /* All done */
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-center space-y-1">
            <p className="text-sm font-semibold text-emerald-700">All payments complete 🎉</p>
            <p className="text-xs text-emerald-600">Total {fmtINR(totalAmount)} paid in full</p>
          </div>
        ) : (
          /* Next payment nudge */
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 space-y-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Next Payment</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{installments[paidInstCount]?.label}</p>
                {installments[paidInstCount]?.dueDate && fmtRelative(installments[paidInstCount].dueDate) !== "—" && (
                  <p className="text-xs text-gray-500 mt-0.5">Due {fmtRelative(installments[paidInstCount].dueDate)}</p>
                )}
              </div>
              <p className="text-base font-black text-gray-900">{fmtINR(Number(installments[paidInstCount]?.amount ?? 0))}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={() => { setPayFull(false); setScreen("overview"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-bold rounded-xl"
          >
            Done
          </Button>
          {!allPaid && (
            <Button
              variant="outline"
              className="w-full h-10 rounded-xl"
              onClick={() => { setPayFull(false); setScreen("overview"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              Pay Next Instalment <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
        {renderSecured(true)}
      </div>
    );

    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#f0f4ff 0%,#f8fafc 60%)" }}>
        <div className="max-w-5xl mx-auto px-4 py-8 lg:py-14">
          <div className="flex flex-col lg:flex-row gap-5 items-center">

            {/* ── Left: info card ── */}
            <div className="w-full lg:w-[45%] flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-8 space-y-5">
                {/* Merchant */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Payment Request from</p>
                  <p className="text-xl font-bold text-gray-900">{MERCHANT_NAME}</p>
                </div>
                {/* Payment for */}
                {(link.title || link.description) && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Payment for</p>
                    {link.title && <p className="text-sm font-semibold text-gray-800">{link.title}</p>}
                    {link.description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{link.description}</p>}
                  </div>
                )}
                {/* Payment plan timeline — only for partial payment links */}
                {isSchedule && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Payment Plan</p>
                    <div className="relative pl-5">
                      {/* Vertical line */}
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                      <div className="space-y-0">
                        {installments.map((inst, i) => {
                          const isPaid = i < paidInstCount;
                          const isCurrent = i === paidInstCount;
                          return (
                            <div key={inst.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
                              {/* Dot */}
                              <div className={cn(
                                "absolute -left-5 mt-0.5 h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 z-10 flex items-center justify-center",
                                isPaid ? "bg-emerald-500 border-emerald-500" : isCurrent ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                              )}>
                                {isPaid && <Check className="h-2 w-2 text-white" strokeWidth={3.5} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={cn("text-sm font-semibold leading-tight", isCurrent ? "text-blue-700" : "text-gray-700")}>{inst.label}</p>
                                  <p className={cn("text-sm font-bold flex-shrink-0", isCurrent ? "text-blue-700" : "text-gray-600")}>{fmtINR(Number(inst.amount))}</p>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {isPaid
                                    ? <span className="text-[9px] bg-emerald-100 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Paid</span>
                                    : <>
                                        {inst.dueDate && fmtRelative(inst.dueDate) !== "—" && (
                                          <p className="text-[11px] text-gray-400">{fmtRelative(inst.dueDate)}</p>
                                        )}
                                        {isCurrent && screen !== "success" && <span className="text-[9px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Due now</span>}
                                      </>
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Total Amount — bold */}
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Amount</span>
                          <span className="text-base font-black text-gray-900">{fmtINR(totalAmount)}</span>
                        </div>
                        {paidInstCount > 0 && !allPaid && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Remaining Amount</span>
                            <span className="text-xl font-black text-amber-600">{fmtINR(remainingAmt)}</span>
                          </div>
                        )}
                        {allPaid && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600">Fully paid</span>
                          </div>
                        )}
                      </div>

                      {/* Payment History link */}
                      {paymentHistory.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Payment History
                            <span className="bg-blue-100 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{paymentHistory.length}</span>
                            <ChevronRight className="h-3 w-3 ml-auto" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Amount — only for non-partial links */}
                {!isSchedule && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Amount Payable</p>
                    <p className="text-3xl font-black text-gray-900">{fmtINR(stdAmt)}</p>
                    <div className="w-8 h-0.5 bg-blue-500 rounded-full mt-2" />
                  </div>
                )}
                {/* Reference ID */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Reference ID</p>
                  <p className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">ABCD23123</p>
                </div>
              </div>
              {/* Footer */}
              <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/60 space-y-1">
                <p className="text-xs text-gray-400">For any queries, please contact <span className="font-semibold text-gray-600">{MERCHANT_NAME}</span></p>
                <button className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-0.5">Merchant's business policies <ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>

            {/* ── Right: payment panel ── */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
              {/* Dark header */}
              {screen !== "success" && (
                <div className="flex items-center justify-between px-5 py-3.5 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#111827 0%,#1e293b 100%)" }}>
                  <div className="flex items-center gap-3 z-10">
                    <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-sm">{MERCHANT_INITIALS}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{MERCHANT_NAME}</p>
                      <p className="text-gray-400 text-[11px]">Paying {fmtINR(stdAmt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-30 select-none pointer-events-none text-2xl pr-1">
                    🛍️ 📦
                  </div>
                </div>
              )}
              {/* Partial payment: show plan overview before methods */}
              {isSchedule && screen === "overview" && renderPartialOverview()}
              {/* Direct methods for non-partial, or after continuing from partial plan */}
              {(!isSchedule && (screen === "overview" || screen === "method")) && (
                <div className="p-5 space-y-4">
                  {renderMethodTabs(true)}
                  {renderMethodContent(stdAmt)}
                </div>
              )}
              {isSchedule && screen === "method" && (
                <div className="p-5 space-y-4">
                  {renderMethodTabs(true)}
                  {renderMethodContent(payNowAmount)}
                </div>
              )}
              {screen === "details" && renderDetailsPanel(() => setScreen("overview"), fmtINR(stdAmt))}
              {screen === "success" && (isSchedule ? renderPartialSuccess() : renderSuccessPanel())}
            </div>

          </div>
        </div>
        {renderFooter()}

        {/* ── Payment History Modal ── */}
        {showHistoryModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowHistoryModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Payment History</p>
                    <p className="text-[10px] text-gray-400">{link?.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>

              {/* Payment rows */}
              <div className="p-4 space-y-2.5 max-h-[55vh] overflow-y-auto">
                {paymentHistory.map((h, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{h.label}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">{fmtINR(h.amount)}</p>
                    </div>
                    <div className="pl-8 space-y-0.5">
                      <p className="text-[11px] text-gray-500">
                        {new Date(h.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        <span className="mx-1 text-gray-300">·</span>
                        {new Date(h.paidAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <span className="text-gray-300">#</span>{h.txnId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer summary */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <span className="text-xs text-gray-500">Total paid so far</span>
                <span className="text-sm font-black text-gray-900">{fmtINR(paidSoFar)}</span>
              </div>
            </div>
          </div>
        )}
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
