import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check } from "lucide-react";

// ── Template mini-preview components ──────────────────────────────────────────

const TemplatePreview1 = ({ color, name }: { color: string; name: string }) => (
  <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1.5 border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[7px] font-bold text-gray-900 leading-tight">Payment Receipt</div>
        <div className="text-[5px] text-gray-400 mt-0.5">Transaction: pay_Sc6n…</div>
        <div className="text-[5px] text-gray-400">Paid On: 13 Apr 2026</div>
      </div>
      <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[8px] font-bold" style={{ background: color }}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    </div>
    <div className="border-t border-gray-100 pt-1 flex justify-between">
      <div className="text-[5px] text-gray-400">Bill From<br /><span className="text-gray-700 font-semibold">{name}</span></div>
      <div className="text-[5px] text-gray-400">Bill To<br /><span className="text-gray-700 font-semibold">Customer</span></div>
    </div>
    <div className="border-t border-gray-100 pt-1">
      <div className="flex justify-between text-[5px] text-gray-400 pb-0.5">
        <span>Description</span><span>Amount</span>
      </div>
      <div className="flex justify-between text-[5px] text-gray-700">
        <span>Online Course</span><span>₹5,000</span>
      </div>
    </div>
    <div className="border-t border-gray-100 pt-1 flex justify-end">
      <div className="text-[6px] font-bold text-gray-900">Total ₹5,000</div>
    </div>
  </div>
);

const TemplatePreview2 = ({ color, name }: { color: string; name: string }) => (
  <div className="w-full h-full bg-white rounded overflow-hidden border border-gray-100">
    <div className="px-2 py-1.5 flex justify-between items-center" style={{ background: color }}>
      <div className="text-white text-[7px] font-bold">{name}</div>
      <div className="text-white text-[7px] font-semibold opacity-80">Receipt</div>
    </div>
    <div className="p-2 flex flex-col gap-1.5">
      <div className="flex justify-between text-[5px]">
        <div className="text-gray-400">Transaction<br /><span className="text-gray-700">pay_Sc6n…</span></div>
        <div className="text-gray-400 text-right">Paid On<br /><span className="text-gray-700">13 Apr 2026</span></div>
      </div>
      <div className="border-t border-gray-100 pt-1 flex justify-between text-[5px] text-gray-700">
        <span>Online Course</span><span>₹5,000</span>
      </div>
      <div className="flex justify-end">
        <div className="text-[6px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: color }}>₹5,000</div>
      </div>
    </div>
  </div>
);

const TemplatePreview3 = ({ color, name }: { color: string; name: string }) => (
  <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1 border border-gray-100">
    <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
      <div className="text-[6px] font-semibold text-gray-700" style={{ color }}>{name}</div>
      <div className="text-[5px] text-gray-400">13 Apr 2026</div>
    </div>
    <div className="text-[7px] font-bold text-gray-900 mt-0.5">₹5,000</div>
    <div className="text-[5px] text-gray-400">Amount Paid</div>
    <div className="border-t border-gray-100 mt-1 pt-1 space-y-0.5">
      <div className="flex justify-between text-[5px] text-gray-500">
        <span>Online Course</span><span>₹5,000</span>
      </div>
    </div>
    <div className="mt-auto pt-1 border-t border-gray-100 text-[4.5px] text-gray-300 text-center">
      Powered by Razorpay
    </div>
  </div>
);

const TemplatePreview4 = ({ color, name }: { color: string; name: string }) => (
  <div className="w-full h-full rounded overflow-hidden border border-gray-100" style={{ background: "#111" }}>
    <div className="px-2 py-1.5">
      <div className="text-white text-[7px] font-bold leading-tight">{name}</div>
      <div className="text-[5px] mt-1" style={{ color }}>PAYMENT RECEIPT</div>
    </div>
    <div className="bg-white mx-1.5 mb-1.5 rounded p-1.5 flex flex-col gap-1">
      <div className="flex justify-between text-[5px] text-gray-400">
        <span>pay_Sc6n…</span><span>13 Apr 2026</span>
      </div>
      <div className="border-t border-gray-100 pt-1 flex justify-between text-[5px] text-gray-700">
        <span>Online Course</span><span className="font-bold">₹5,000</span>
      </div>
      <div className="flex justify-between text-[5px] font-semibold text-gray-900 pt-0.5 border-t border-gray-100">
        <span>Total</span><span>₹5,000</span>
      </div>
    </div>
  </div>
);

const TEMPLATES = [
  { id: 1, label: "Classic", Component: TemplatePreview1 },
  { id: 2, label: "Modern", Component: TemplatePreview2 },
  { id: 3, label: "Minimal", Component: TemplatePreview3 },
  { id: 4, label: "Bold", Component: TemplatePreview4 },
];

const PRESET_COLORS = [
  "#0066FF", "#6C47FF", "#00AA60", "#E5292A",
  "#F59E0B", "#0EA5E9", "#EC4899", "#111111",
];

// ── Page ──────────────────────────────────────────────────────────────────────

const ReceiptsSettings = () => {
  const navigate = useNavigate();

  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);
  const [brandName, setBrandName] = useState("Manish Reddy");
  const [brandColor, setBrandColor] = useState("#0066FF");
  const [selectedTemplate, setSelectedTemplate] = useState(1);

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

        {/* Brand Name */}
        <Card className="mb-5">
          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="font-semibold mb-1">Brand Name</h3>
              <p className="text-sm text-muted-foreground mb-3">This name appears as the billing label on all payment receipts.</p>
              <div className="max-w-xs">
                <Label htmlFor="brandName" className="text-xs text-muted-foreground mb-1.5 block">Brand Name (Billing Label)</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>

            {/* Brand Color */}
            <div>
              <h3 className="font-semibold mb-1">Brand Color</h3>
              <p className="text-sm text-muted-foreground mb-3">Used as the accent color on receipts and the logo background.</p>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrandColor(c)}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                    style={{
                      background: c,
                      borderColor: brandColor === c ? "#111" : "transparent",
                      boxShadow: brandColor === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none",
                    }}
                    title={c}
                  >
                    {brandColor === c && <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />}
                  </button>
                ))}
                {/* Custom color picker */}
                <label className="cursor-pointer" title="Custom color">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-500 transition-colors overflow-hidden"
                    style={!PRESET_COLORS.includes(brandColor) ? { background: brandColor, borderColor: "#111", borderStyle: "solid" } : {}}
                  >
                    {!PRESET_COLORS.includes(brandColor)
                      ? <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />
                      : <span className="text-[10px]">+</span>
                    }
                  </div>
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
                <span className="text-sm font-mono text-muted-foreground">{brandColor}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Design */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-1">Receipt Template</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose the visual style for your payment receipts.</p>
            <div className="grid grid-cols-4 gap-3">
              {TEMPLATES.map(({ id, label, Component }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTemplate(id)}
                  className="group flex flex-col gap-2"
                >
                  <div
                    className="relative w-full rounded-lg overflow-hidden transition-all"
                    style={{
                      aspectRatio: "3/4",
                      border: selectedTemplate === id
                        ? `2px solid ${brandColor}`
                        : "2px solid transparent",
                      boxShadow: selectedTemplate === id ? `0 0 0 2px ${brandColor}22` : "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Component color={brandColor} name={brandName || "Brand"} />
                    {selectedTemplate === id && (
                      <div
                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: brandColor }}
                      >
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
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

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/account-settings")}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceiptsSettings;
