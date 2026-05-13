import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, Pencil, Upload, X } from "lucide-react";

// ── Template mini-preview components ─────────────────────────────────────────

const TemplatePreview1 = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <div className="w-full h-full bg-white rounded-md p-3 flex flex-col gap-2 border border-gray-100">
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0 pr-2">
        <div className="text-[8px] font-bold text-gray-900 leading-tight">Payment Receipt</div>
        <div className="text-[6px] text-gray-400 mt-0.5">Transaction: pay_Sc6nUSSKS8</div>
        <div className="text-[6px] text-gray-400">Paid On: 13 Apr 2026</div>
      </div>
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: logoUrl ? "transparent" : color }}>
          {logoUrl
            ? <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-[9px]">{name.slice(0, 2).toUpperCase()}</span>}
        </div>
        <div className="text-[5.5px] font-semibold text-gray-600 max-w-[36px] truncate text-center">{name}</div>
      </div>
    </div>
    <div className="border-t border-gray-100 pt-1.5 flex gap-4">
      <div><div className="text-[5.5px] text-gray-400 mb-0.5">Bill From</div><div className="text-[6px] font-semibold text-gray-800">{name}</div></div>
      <div><div className="text-[5.5px] text-gray-400 mb-0.5">Bill To</div><div className="text-[6px] font-semibold text-gray-800">Customer</div></div>
    </div>
    <div className="border-t border-gray-100 pt-1.5 flex-1">
      <div className="flex justify-between text-[5.5px] text-gray-400 mb-1">
        <span>Description</span><span>Amount</span>
      </div>
      <div className="flex justify-between text-[6.5px] text-gray-800 font-medium">
        <span>Online Course</span><span>₹5,000</span>
      </div>
    </div>
    <div className="border-t border-gray-100 pt-1.5 flex justify-end">
      <div className="text-[7px] font-bold text-gray-900">Total ₹5,000</div>
    </div>
    <div className="text-[5px] text-gray-300 text-center">Powered by Razorpay</div>
  </div>
);

const TemplatePreview2 = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <div className="w-full h-full bg-white rounded-md overflow-hidden border border-gray-100">
    <div className="px-3 py-2 flex justify-between items-center" style={{ background: color }}>
      <div className="text-white text-[7.5px] font-bold">{name}</div>
      {logoUrl
        ? <img src={logoUrl} alt="" className="w-6 h-6 rounded object-cover" />
        : <div className="text-white text-[7px] font-semibold opacity-80 border border-white/30 rounded px-1 py-0.5">Receipt</div>}
    </div>
    <div className="p-3 flex flex-col gap-2">
      <div className="flex justify-between text-[5.5px]">
        <div className="text-gray-400">Transaction<br /><span className="text-gray-700 font-medium">pay_Sc6nUSSKS8</span></div>
        <div className="text-gray-400 text-right">Paid On<br /><span className="text-gray-700 font-medium">13 Apr 2026</span></div>
      </div>
      <div className="border-t border-gray-100 pt-1.5 flex justify-between text-[6px] text-gray-700">
        <span>Online Course</span><span>₹5,000</span>
      </div>
      <div className="flex justify-end">
        <div className="text-[6.5px] font-semibold px-2 py-0.5 rounded text-white" style={{ background: color }}>₹5,000 Paid</div>
      </div>
      <div className="text-[5px] text-gray-300 text-center pt-1 border-t border-gray-100">Powered by Razorpay</div>
    </div>
  </div>
);

const TemplatePreview3 = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <div className="w-full h-full bg-white rounded-md p-3 flex flex-col gap-1.5 border border-gray-100">
    <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
      <div className="flex items-center gap-1.5">
        {logoUrl
          ? <img src={logoUrl} alt="" className="w-5 h-5 rounded object-cover" />
          : <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[6px] font-bold" style={{ background: color }}>{name.slice(0,2).toUpperCase()}</div>}
        <div className="text-[6.5px] font-semibold text-gray-700">{name}</div>
      </div>
      <div className="text-[5.5px] text-gray-400">13 Apr 2026</div>
    </div>
    <div className="text-[9px] font-bold text-gray-900">₹5,000</div>
    <div className="text-[5.5px] text-gray-400">Amount Paid · 13 Apr 2026</div>
    <div className="border-t border-gray-100 mt-1 pt-1.5 space-y-1">
      <div className="flex justify-between text-[5.5px] text-gray-500">
        <span>Online Course</span><span>₹5,000</span>
      </div>
      <div className="flex justify-between text-[5.5px] text-gray-500">
        <span>Ref: pay_Sc6n…</span><span></span>
      </div>
    </div>
    <div className="mt-auto pt-1.5 border-t border-gray-100 text-[5px] text-gray-300 text-center">
      Powered by Razorpay
    </div>
  </div>
);

const TemplatePreview4 = ({ color, name, logoUrl }: { color: string; name: string; logoUrl?: string }) => (
  <div className="w-full h-full rounded-md overflow-hidden border border-gray-100" style={{ background: "#111" }}>
    <div className="px-3 py-2 flex justify-between items-center">
      <div>
        <div className="text-white text-[7.5px] font-bold leading-tight">{name}</div>
        <div className="text-[5.5px] mt-0.5 font-medium" style={{ color }}>PAYMENT RECEIPT</div>
      </div>
      {logoUrl
        ? <img src={logoUrl} alt="" className="w-6 h-6 rounded object-cover" />
        : <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[7px] font-bold" style={{ background: color }}>{name.slice(0,2).toUpperCase()}</div>}
    </div>
    <div className="bg-white mx-2 mb-2 rounded-md p-2 flex flex-col gap-1.5">
      <div className="flex justify-between text-[5.5px] text-gray-400">
        <span>pay_Sc6nUSSKS8</span><span>13 Apr 2026</span>
      </div>
      <div className="border-t border-gray-100 pt-1 flex justify-between text-[6px] text-gray-700">
        <span>Online Course</span><span className="font-bold">₹5,000</span>
      </div>
      <div className="flex justify-between text-[6.5px] font-bold text-gray-900 pt-1 border-t border-gray-100">
        <span>Total</span><span>₹5,000</span>
      </div>
      <div className="text-[5px] text-gray-300 text-center pt-0.5">Powered by Razorpay</div>
    </div>
  </div>
);

const TEMPLATES = [
  { id: 1, label: "Classic",  Component: TemplatePreview1 },
  { id: 2, label: "Modern",   Component: TemplatePreview2 },
  { id: 3, label: "Minimal",  Component: TemplatePreview3 },
  { id: 4, label: "Bold",     Component: TemplatePreview4 },
];

const PRESET_COLORS = [
  "#0066FF", "#6C47FF", "#00AA60", "#E5292A",
  "#F59E0B", "#0EA5E9", "#EC4899", "#111111",
];

// ── Page ──────────────────────────────────────────────────────────────────────

const ReceiptsSettings = () => {
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const customColorRef = useRef<HTMLInputElement>(null);

  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);

  // Brand name + logo
  const [brandName, setBrandName] = useState("Manish Reddy");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("Manish Reddy");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  // Brand color
  const [brandColor, setBrandColor] = useState("#0066FF");
  const [editingColor, setEditingColor] = useState(false);
  const [draftColor, setDraftColor] = useState("#0066FF");

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
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

        {/* ── Send via ─────────────────────────────────────── */}
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

        {/* ── Brand Name & Logo ─────────────────────────────── */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-0.5">Brand Name and Logo</h3>
            <p className="text-sm text-muted-foreground mb-5">Shows your Brand Name on the Receipts, Checkout screens etc.</p>

            <div className="flex items-center gap-5">
              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer group"
                  style={{ background: logoUrl ? "transparent" : brandColor }}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoUrl
                    ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                    : <span className="text-white font-bold text-xl">{brandName.slice(0, 2).toUpperCase()}</span>}
                  {/* overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
              </div>

              {/* Name + actions */}
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="max-w-xs h-9 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { setBrandName(draftName); setEditingName(false); }
                        if (e.key === "Escape") { setDraftName(brandName); setEditingName(false); }
                      }}
                    />
                    <Button size="sm" className="h-9 px-3" onClick={() => { setBrandName(draftName); setEditingName(false); }}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-9 px-2" onClick={() => { setDraftName(brandName); setEditingName(false); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-semibold text-foreground">{brandName}</span>
                    <button
                      onClick={() => { setDraftName(brandName); setEditingName(true); }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Upload className="h-3.5 w-3.5" /> {logoUrl ? "Change logo" : "Upload logo"}
                  </button>
                  {logoUrl && (
                    <button
                      onClick={() => { setLogoUrl(undefined); toast.success("Logo removed"); }}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2 MB. Square logo recommended.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Brand Color ───────────────────────────────────── */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-0.5">Brand Color</h3>
            <p className="text-sm text-muted-foreground mb-4">Used as the accent color on receipts and logo background.</p>

            {!editingColor ? (
              /* Collapsed: show current swatch + Edit button */
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-border shadow-sm" style={{ background: brandColor }} />
                <span className="text-sm font-mono text-foreground">{brandColor.toUpperCase()}</span>
                <button
                  onClick={() => { setDraftColor(brandColor); setEditingColor(true); }}
                  className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            ) : (
              /* Expanded: color picker */
              <div className="space-y-4">
                {/* Preview */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-border shadow-sm transition-colors" style={{ background: draftColor }} />
                  <span className="text-sm font-mono text-foreground">{draftColor.toUpperCase()}</span>
                </div>
                {/* Presets */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDraftColor(c)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{
                        background: c,
                        boxShadow: draftColor === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none",
                      }}
                      title={c}
                    >
                      {draftColor === c && <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />}
                    </button>
                  ))}
                  {/* Custom */}
                  <label className="cursor-pointer" title="Custom color">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors overflow-hidden"
                      style={!PRESET_COLORS.includes(draftColor) ? { background: draftColor, border: `2px solid ${draftColor}`, boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${draftColor}` } : {}}
                    >
                      {!PRESET_COLORS.includes(draftColor)
                        ? <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />
                        : <span className="text-gray-400 text-sm leading-none">+</span>}
                    </div>
                    <input
                      ref={customColorRef}
                      type="color"
                      value={draftColor}
                      onChange={(e) => setDraftColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" className="h-8 px-4" onClick={() => { setBrandColor(draftColor); setEditingColor(false); }}>
                    Apply
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-3" onClick={() => { setDraftColor(brandColor); setEditingColor(false); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Receipt Template ─────────────────────────────── */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-0.5">Receipt Template</h3>
            <p className="text-sm text-muted-foreground mb-5">Choose the visual style for your payment receipts.</p>
            <div className="grid grid-cols-4 gap-4">
              {TEMPLATES.map(({ id, label, Component }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTemplate(id)}
                  className="group flex flex-col gap-2"
                >
                  <div
                    className="relative w-full rounded-xl overflow-hidden transition-all"
                    style={{
                      aspectRatio: "2/3",
                      border: selectedTemplate === id ? `2.5px solid ${brandColor}` : "2px solid #e5e7eb",
                      boxShadow: selectedTemplate === id ? `0 0 0 3px ${brandColor}22` : "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Component color={brandColor} name={brandName || "Brand"} logoUrl={logoUrl} />
                    {selectedTemplate === id && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow"
                        style={{ background: brandColor }}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium text-center"
                    style={{ color: selectedTemplate === id ? brandColor : "#6b7280" }}
                  >
                    {label}
                  </span>
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
