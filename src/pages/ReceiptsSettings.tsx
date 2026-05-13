import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, CheckCircle2, ExternalLink, Pencil, Upload, X } from "lucide-react";

// ── Shared A4 sub-components ──────────────────────────────────────────────────

const A4W = 794;
const SCALE = 0.383; // fits ~304px card width (2-col grid)

const RzpFooter = ({ dark }: { dark?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.4)" : "#888" }}>
      Invoicing and payments powered by
    </span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
      <path d="M13.5 2L4 14h8l-1.5 8L20 10h-8l1.5-8z" fill={dark ? "#fff" : "#000"} />
    </svg>
    <span style={{ fontSize: 14, fontWeight: 700, color: dark ? "#fff" : "#000", letterSpacing: -0.3 }}>Razorpay</span>
  </div>
);

const LogoBlock = ({ color, logoUrl, name, textColor = "#333" }: { color: string; logoUrl?: string; name: string; textColor?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, flexShrink: 0 }}>
    <div style={{ width: 88, height: 88, borderRadius: 14, background: logoUrl ? "transparent" : color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {logoUrl
        ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, color: "#000" }}>{name.slice(0, 2).toUpperCase()}</span>}
    </div>
    <div style={{ fontSize: 13.5, fontWeight: 600, color: textColor, letterSpacing: 0.2 }}>{name}</div>
  </div>
);

const ReceiptHeaderMeta = ({ titleColor = "#000", metaKeyColor = "#888", metaValColor = "#1a1a1a" }: { titleColor?: string; metaKeyColor?: string; metaValColor?: string }) => (
  <div>
    <div style={{ fontSize: 38, fontWeight: 700, color: titleColor, letterSpacing: -0.5, lineHeight: 1, marginBottom: 20 }}>Payment Receipt</div>
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 18px", alignItems: "baseline" }}>
      {[["Transaction Reference:", "pay_Scv6cq6nUSSKS8"], ["Paid On:", "13 Apr 2026"], ["Reference ID:", "ISN12123"]].map(([k, v], i) => (
        [
          <span key={`k${i}`} style={{ fontSize: 13, color: metaKeyColor, whiteSpace: "nowrap" }}>{k}</span>,
          <span key={`v${i}`} style={{ fontSize: 13, color: metaValColor, fontWeight: 500 }}>{v}</span>,
        ]
      ))}
    </div>
  </div>
);

const Parties = ({ accentColor = "#888" }: { accentColor?: string }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
    {[["Bill From", "Wealthjoy Tech Pvt Ltd", "GSTIN: 29AADCW4121C1CY\nsupport@wealthjoy.in"],
      ["Bill To", "Manish", "manish@gmail.com\n+91 99209 72082"]].map(([label, name, detail]) => (
      <div key={label}>
        <div style={{ fontSize: 12, color: accentColor, fontWeight: 600, marginBottom: 10 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#000", marginBottom: 6 }}>{name}</div>
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.9 }}>{detail.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
      </div>
    ))}
  </div>
);

const ItemsTable = ({ thBg = "transparent", thColor = "#aaa", thBorder = "1px solid #e8e8e8" }: { thBg?: string; thColor?: string; thBorder?: string }) => (
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ borderBottom: thBorder, background: thBg }}>
        {["Description", "Unit Price", "Qty", "Amount"].map((h, i) => (
          <th key={h} style={{ padding: "11px 10px", fontSize: 12.5, fontWeight: thBg !== "transparent" ? 600 : 500, color: thColor, textAlign: i === 0 ? "left" : "right", whiteSpace: "nowrap" }}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
        <td style={{ padding: "20px 10px", fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>Online Course</td>
        {["₹ 5.00", "1", "₹ 5.00"].map((v) => (
          <td key={v} style={{ padding: "20px 10px", fontSize: 14, color: "#1a1a1a", textAlign: "right" }}>{v}</td>
        ))}
      </tr>
    </tbody>
  </table>
);

const Totals = ({ borderTopColor = "#ccc" }: { borderTopColor?: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16 }}>
    {/* PAID stamp */}
    <div style={{ width: 90, height: 90, border: "2.5px solid #000", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-18deg)", opacity: 0.1, flexShrink: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 2 }}>PAID</div>
      <div style={{ fontSize: 6.5, fontWeight: 600, letterSpacing: 1, marginTop: 3 }}>13 APR 2026</div>
    </div>
    <div style={{ width: 290 }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 10px", fontSize: 19, fontWeight: 700, color: "#000", borderTop: `1.5px solid ${borderTopColor}` }}>
        <span>Total</span><span>₹ 5.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: 13.5, fontWeight: 500, color: "#444" }}>
        <span>Amount Paid</span><span>₹ 5.00</span>
      </div>
    </div>
  </div>
);

const Notes = () => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Customer Notes</div>
    <div style={{ fontSize: 12, color: "#444", lineHeight: 1.75 }}>Thank you for enrolling with Wealthjoy! Your course access is valid for 12 months. For support, reach us at support@wealthjoy.in.</div>
  </div>
);

// ── A4 Scale wrapper ──────────────────────────────────────────────────────────

const A4Preview = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: "100%", aspectRatio: "2/3", overflow: "hidden", position: "relative" }}>
    <div style={{
      position: "absolute", top: 0, left: 0,
      width: A4W,
      transform: `scale(${SCALE})`,
      transformOrigin: "top left",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      {children}
    </div>
  </div>
);

// ── Template A: Classic Clean ─────────────────────────────────────────────────

const TemplateA = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "56px 60px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <ReceiptHeaderMeta />
            <LogoBlock color={color} logoUrl={logoUrl} name={name} />
          </div>
        </div>
        {/* Parties */}
        <div style={{ padding: "0 60px" }}>
          <div style={{ height: 1, background: "#e8e8e8", margin: "30px 0" }} />
          <Parties />
          <div style={{ height: 1, background: "#e8e8e8", margin: "30px 0" }} />
        </div>
        {/* Table */}
        <div style={{ padding: "0 60px" }}>
          <ItemsTable />
        </div>
        {/* Totals */}
        <div style={{ padding: "0 60px" }}>
          <Totals />
        </div>
        {/* Notes */}
        <div style={{ flex: 1, minHeight: 40 }} />
        <div style={{ padding: "0 60px 32px" }}>
          <Notes />
        </div>
      </div>
      {/* Footer */}
      <div style={{ borderTop: "1px solid #e8e8e8", padding: "18px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <RzpFooter />
        <span style={{ fontSize: 12, color: "#aaa" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

// ── Template B: Dark Header ───────────────────────────────────────────────────

const TemplateB = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      {/* Dark header */}
      <div style={{ background: "#111", padding: "56px 60px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <ReceiptHeaderMeta titleColor="#fff" metaKeyColor="rgba(255,255,255,0.45)" metaValColor="#fff" />
          <LogoBlock color={color} logoUrl={logoUrl} name={name} textColor="rgba(255,255,255,0.75)" />
        </div>
      </div>
      {/* White body */}
      <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "36px 60px 0" }}>
          <Parties />
        </div>
        <div style={{ height: 1, background: "#e8e8e8", margin: "28px 60px" }} />
        <div style={{ padding: "0 60px" }}>
          <ItemsTable thBg="#111" thColor="#fff" thBorder="none" />
        </div>
        <div style={{ padding: "0 60px" }}>
          <Totals borderTopColor="#111" />
        </div>
        <div style={{ flex: 1, minHeight: 40 }} />
        <div style={{ padding: "0 60px 32px" }}>
          <Notes />
        </div>
      </div>
      {/* Dark footer */}
      <div style={{ background: "#111", padding: "18px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RzpFooter dark />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

// ── Template C: Gold Accent ───────────────────────────────────────────────────

const TemplateC = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      {/* Gold top bar */}
      <div style={{ height: 6, background: color }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "50px 60px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <ReceiptHeaderMeta />
            <LogoBlock color={color} logoUrl={logoUrl} name={name} />
          </div>
        </div>
        {/* Parties */}
        <div style={{ padding: "0 60px" }}>
          <div style={{ height: 1.5, background: color, opacity: 0.6, margin: "28px 0" }} />
          <Parties accentColor={color} />
          <div style={{ height: 1.5, background: color, opacity: 0.6, margin: "28px 0" }} />
        </div>
        {/* Table */}
        <div style={{ padding: "0 60px" }}>
          <ItemsTable thBorder={`2px solid ${color}`} />
        </div>
        {/* Totals */}
        <div style={{ padding: "0 60px" }}>
          <Totals borderTopColor={color} />
        </div>
        <div style={{ flex: 1, minHeight: 40 }} />
        <div style={{ padding: "0 60px 32px" }}>
          <Notes />
        </div>
      </div>
      {/* Footer */}
      <div style={{ borderTop: `2px solid ${color}`, padding: "18px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fffef5" }}>
        <RzpFooter />
        <span style={{ fontSize: 12, color: "#aaa" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

// ── Template D: Bold Contrast ─────────────────────────────────────────────────

const TemplateD = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header with bold border */}
        <div style={{ padding: "56px 60px 28px", borderBottom: "2.5px solid #000" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <ReceiptHeaderMeta />
            <LogoBlock color={color} logoUrl={logoUrl} name={name} />
          </div>
        </div>
        {/* Black meta band */}
        <div style={{ background: "#000", padding: "12px 60px", display: "flex", gap: 36, alignItems: "center" }}>
          {[["Transaction ID", "pay_Scv6cq6n…"], ["Method", "UPI"], ["Currency", "INR"]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{v}</div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 100, fontSize: 10, fontWeight: 700, color: "#fff", padding: "5px 14px", textTransform: "uppercase" }}>
            <div style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%" }} /> Paid
          </div>
        </div>
        {/* Parties */}
        <div style={{ padding: "32px 60px 0" }}>
          <Parties />
          <div style={{ height: 1, background: "#e8e8e8", margin: "28px 0" }} />
        </div>
        {/* Table */}
        <div style={{ padding: "0 60px" }}>
          <ItemsTable thBorder="1.5px solid #000" />
        </div>
        {/* Totals */}
        <div style={{ padding: "0 60px" }}>
          <Totals borderTopColor="#000" />
        </div>
        <div style={{ flex: 1, minHeight: 40 }} />
        {/* Notes divider + notes */}
        <div style={{ height: 2, background: "#000", margin: "0 60px 24px" }} />
        <div style={{ padding: "0 60px 32px" }}>
          <Notes />
        </div>
      </div>
      {/* Dark footer */}
      <div style={{ background: "#000", padding: "18px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RzpFooter dark />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

// ── Template registry ─────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 1, label: "Classic",       Component: TemplateA },
  { id: 2, label: "Dark Header",   Component: TemplateB },
  { id: 3, label: "Gold Accent",   Component: TemplateC },
  { id: 4, label: "Bold Contrast", Component: TemplateD },
];

const PRESET_COLORS = [
  "#0066FF", "#6C47FF", "#00AA60", "#E5292A",
  "#F59E0B", "#0EA5E9", "#EC4899", "#111111",
];

// ── Page ──────────────────────────────────────────────────────────────────────

const ReceiptsSettings = () => {
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(true);

  const [brandName, setBrandName] = useState("Manish Reddy");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("Manish Reddy");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const [brandColor, setBrandColor] = useState("#0066FF");
  const [editingColor, setEditingColor] = useState(false);
  const [draftColor, setDraftColor] = useState("#0066FF");

  const [selectedTemplate, setSelectedTemplate] = useState(1);

  // 80G
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [enable80g, setEnable80g] = useState(false);
  const [g80Description, setG80Description] = useState("");
  const [g80SignatureFile, setG80SignatureFile] = useState<File | null>(null);
  const [g80SignatureUrl, setG80SignatureUrl] = useState<string | undefined>(undefined);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUrl(URL.createObjectURL(file));
    toast.success("Logo updated");
  };

  const handleSave = () => {
    toast.success("Receipts settings saved!");
    navigate("/account-settings");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/account-settings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Receipts Settings</h1>
        </div>

        {/* Send via */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-1">Send Receipts via</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose how payment receipts are delivered to your customers</p>
            <div className="flex gap-5">
              <div className="flex items-center gap-2">
                <Checkbox checked={sendViaEmail} onCheckedChange={(v) => setSendViaEmail(!!v)} id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={sendViaWhatsapp} onCheckedChange={(v) => setSendViaWhatsapp(!!v)} id="whatsapp" />
                <Label htmlFor="whatsapp">WhatsApp</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Name & Logo */}
        <Card className="mb-5">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-0.5">Brand Name and Logo</h3>
              <p className="text-sm text-muted-foreground">Shows your Brand Name on the Receipts, Checkout screens etc.</p>
            </div>

            {/* Logo */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Logo</p>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer group"
                    style={{ background: logoUrl ? "transparent" : brandColor }}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoUrl
                      ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                      : <span className="text-white font-bold text-xl">{brandName.slice(0, 2).toUpperCase()}</span>}
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => logoInputRef.current?.click()} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" /> {logoUrl ? "Change logo" : "Upload logo"}
                    </button>
                    {logoUrl && (
                      <button onClick={() => { setLogoUrl(undefined); toast.success("Logo removed"); }} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2 MB. Square logo recommended.</p>
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Brand Name</p>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input autoFocus value={draftName} onChange={(e) => setDraftName(e.target.value)} className="max-w-xs h-9 text-sm"
                    onKeyDown={(e) => { if (e.key === "Enter") { setBrandName(draftName); setEditingName(false); } if (e.key === "Escape") { setDraftName(brandName); setEditingName(false); } }} />
                  <Button size="sm" className="h-9 px-3" onClick={() => { setBrandName(draftName); setEditingName(false); }}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-9 px-2" onClick={() => { setDraftName(brandName); setEditingName(false); }}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-semibold text-foreground">{brandName}</span>
                  <button onClick={() => { setDraftName(brandName); setEditingName(true); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Color */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-0.5">Brand Color</h3>
            <p className="text-sm text-muted-foreground mb-4">Used as the accent color on receipts and logo background.</p>
            {!editingColor ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-border shadow-sm" style={{ background: brandColor }} />
                <span className="text-sm font-mono text-foreground">{brandColor.toUpperCase()}</span>
                <button onClick={() => { setDraftColor(brandColor); setEditingColor(true); }} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-border shadow-sm transition-colors" style={{ background: draftColor }} />
                  <span className="text-sm font-mono text-foreground">{draftColor.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} onClick={() => setDraftColor(c)} className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ background: c, boxShadow: draftColor === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none" }} title={c}>
                      {draftColor === c && <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />}
                    </button>
                  ))}
                  <label className="cursor-pointer" title="Custom color">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors overflow-hidden"
                      style={!PRESET_COLORS.includes(draftColor) ? { background: draftColor, border: `2px solid ${draftColor}`, boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${draftColor}` } : {}}>
                      {!PRESET_COLORS.includes(draftColor) ? <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} /> : <span className="text-gray-400 text-sm leading-none">+</span>}
                    </div>
                    <input type="color" value={draftColor} onChange={(e) => setDraftColor(e.target.value)} className="sr-only" />
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" className="h-8 px-4" onClick={() => { setBrandColor(draftColor); setEditingColor(false); }}>Apply</Button>
                  <Button size="sm" variant="ghost" className="h-8 px-3" onClick={() => { setDraftColor(brandColor); setEditingColor(false); }}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 80G Details */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-0.5">80G Details</h3>
                <p className="text-sm text-muted-foreground">
                  Add 80G tax exemption details to all payment receipts. Applies to all payment links automatically.
                </p>
              </div>
              <button
                onClick={() => setEnable80g((v) => !v)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none mt-0.5 ${enable80g ? "bg-primary" : "bg-gray-200"}`}
                role="switch"
                aria-checked={enable80g}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${enable80g ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {enable80g && (
              <div className="mt-5 space-y-4">
                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">80G Description</Label>
                    <a
                      href="https://razorpay.com/docs/payments/payment-pages/80g-receipt/#pdf-receipt-to-customers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Sample 80G Receipt <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <textarea
                    value={g80Description}
                    onChange={(e) => setG80Description(e.target.value)}
                    placeholder="All donations made to us are eligible for tax exemption under 80G of IT act"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {/* Signature upload */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Signature of Authorised Person{" "}
                    <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file && file.size > 500 * 1024) {
                          toast.error("File size must be under 500 KB");
                          return;
                        }
                        setG80SignatureFile(file);
                        if (file) setG80SignatureUrl(URL.createObjectURL(file));
                      }}
                    />
                    {g80SignatureFile ? (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate max-w-xs">{g80SignatureFile.name}</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive ml-1 flex-shrink-0"
                          onClick={(e) => { e.preventDefault(); setG80SignatureFile(null); setG80SignatureUrl(undefined); }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span>Drag file here or</span>
                          <span className="text-primary font-medium">Upload</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Upload .png, .jpg or .jpeg file | 500 KB Max</p>
                      </>
                    )}
                  </label>
                  {g80SignatureUrl && (
                    <img src={g80SignatureUrl} alt="Signature preview" className="mt-2 h-12 object-contain rounded border border-border" />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Template */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-0.5">Receipt Template</h3>
            <p className="text-sm text-muted-foreground mb-5">Choose the visual style for your payment receipts.</p>
            <div className="grid grid-cols-2 gap-5">
              {TEMPLATES.map(({ id, label, Component }) => (
                <button key={id} onClick={() => setSelectedTemplate(id)} className="group flex flex-col gap-2 text-left">
                  <div className="relative w-full rounded-xl overflow-hidden transition-all"
                    style={{
                      border: selectedTemplate === id ? `2.5px solid ${brandColor}` : "2px solid #e5e7eb",
                      boxShadow: selectedTemplate === id ? `0 0 0 3px ${brandColor}22` : "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                    <Component color={brandColor} name={brandName || "Brand"} logoUrl={logoUrl} />
                    {selectedTemplate === id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ background: brandColor }}>
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center w-full" style={{ color: selectedTemplate === id ? brandColor : "#6b7280" }}>{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate("/account-settings")}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceiptsSettings;
