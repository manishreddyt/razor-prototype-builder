import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AlignLeft, ArrowLeft, BookOpen, Building2, Check, CheckCircle2, ExternalLink, FileText, Hash, Info, MapPin, Pencil, Percent, Receipt, Shield, Tag, Upload, X } from "lucide-react";

// ── Shared A4 sub-components ──────────────────────────────────────────────────

const A4W = 794;
const SCALE = 0.383;

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
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.9 }}>{(detail as string).split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
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

const Notes = ({ text }: { text?: string }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Customer Notes</div>
    <div style={{ fontSize: 12, color: "#444", lineHeight: 1.75 }}>
      {text || "Thank you for enrolling with Wealthjoy! Your course access is valid for 12 months. For support, reach us at support@wealthjoy.in."}
    </div>
  </div>
);

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

// ── Receipt Template variants ─────────────────────────────────────────────────

const TemplateStandard = ({ color, name, logoUrl, notes }: { color: string; name: string; logoUrl?: string; notes?: string }) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "56px 60px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <ReceiptHeaderMeta />
            <LogoBlock color={color} logoUrl={logoUrl} name={name} />
          </div>
        </div>
        <div style={{ padding: "0 60px" }}>
          <div style={{ height: 1, background: "#e8e8e8", margin: "30px 0" }} />
          <Parties />
          <div style={{ height: 1, background: "#e8e8e8", margin: "30px 0" }} />
        </div>
        <div style={{ padding: "0 60px" }}><ItemsTable /></div>
        <div style={{ padding: "0 60px" }}><Totals /></div>
        <div style={{ flex: 1, minHeight: 40 }} />
        <div style={{ padding: "0 60px 32px" }}><Notes text={notes} /></div>
      </div>
      <div style={{ borderTop: "1px solid #e8e8e8", padding: "18px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <RzpFooter /><span style={{ fontSize: 12, color: "#aaa" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

const TemplateModern = ({ color, name, logoUrl, notes }: { color: string; name: string; logoUrl?: string; notes?: string }) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#111", padding: "56px 60px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <ReceiptHeaderMeta titleColor="#fff" metaKeyColor="rgba(255,255,255,0.45)" metaValColor="#fff" />
          <LogoBlock color={color} logoUrl={logoUrl} name={name} textColor="rgba(255,255,255,0.75)" />
        </div>
      </div>
      <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "36px 60px 0" }}><Parties /></div>
        <div style={{ height: 1, background: "#e8e8e8", margin: "28px 60px" }} />
        <div style={{ padding: "0 60px" }}><ItemsTable thBg="#111" thColor="#fff" thBorder="none" /></div>
        <div style={{ padding: "0 60px" }}><Totals borderTopColor="#111" /></div>
        <div style={{ flex: 1, minHeight: 40 }} />
        <div style={{ padding: "0 60px 32px" }}><Notes text={notes} /></div>
      </div>
      <div style={{ background: "#111", padding: "18px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RzpFooter dark /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

const TemplateMinimal = ({ color, name, logoUrl, notes }: { color: string; name: string; logoUrl?: string; notes?: string }) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: color }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "50px 60px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <ReceiptHeaderMeta />
            <LogoBlock color={color} logoUrl={logoUrl} name={name} />
          </div>
        </div>
        <div style={{ padding: "0 60px" }}>
          <div style={{ height: 1, background: "#f0f0f0", margin: "26px 0" }} />
          <Parties accentColor="#bbb" />
          <div style={{ height: 1, background: "#f0f0f0", margin: "26px 0" }} />
        </div>
        <div style={{ padding: "0 60px" }}><ItemsTable thColor="#ccc" thBorder="1px solid #f0f0f0" /></div>
        <div style={{ padding: "0 60px" }}><Totals borderTopColor="#e0e0e0" /></div>
        <div style={{ flex: 1, minHeight: 40 }} />
        <div style={{ padding: "0 60px 32px" }}><Notes text={notes} /></div>
      </div>
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "18px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RzpFooter /><span style={{ fontSize: 12, color: "#ccc" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

const RECEIPT_TEMPLATES = [
  { id: 1, label: "Standard", Component: TemplateStandard },
  { id: 2, label: "Modern",   Component: TemplateModern },
  { id: 3, label: "Minimal",  Component: TemplateMinimal },
];

// ── Invoice A4 sub-components ─────────────────────────────────────────────────

const InvHeader = ({ color, logoUrl, name, invNum, titleColor = "#000" }: { color: string; logoUrl?: string; name: string; invNum: string; titleColor?: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div>
      <div style={{ fontSize: 36, fontWeight: 800, color: titleColor, letterSpacing: -0.5, lineHeight: 1, marginBottom: 14 }}>TAX INVOICE</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "5px 16px" }}>
        {[["Invoice No:", invNum], ["Invoice Date:", "13 Apr 2026"], ["Due Date:", "20 Apr 2026"]].map(([k, v], i) => ([
          <span key={`k${i}`} style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>{k}</span>,
          <span key={`v${i}`} style={{ fontSize: 12, color: titleColor === "#000" ? "#1a1a1a" : titleColor, fontWeight: 600 }}>{v}</span>,
        ]))}
      </div>
    </div>
    <LogoBlock color={color} logoUrl={logoUrl} name={name} textColor={titleColor === "#000" ? "#333" : "rgba(255,255,255,0.75)"} />
  </div>
);

const InvParties = ({ accentColor = "#888", company = "Wealthjoy Technologies Pvt Ltd", gstin = "29AADCW4121C1CY", address = "123, MG Road\nBengaluru, KA 560001" }: { accentColor?: string; company?: string; gstin?: string; address?: string }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
    {[
      { label: "Bill From", name: company, details: [`GSTIN: ${gstin}`, ...address.split("\n"), "support@wealthjoy.in"] },
      { label: "Bill To",   name: "Manish Reddy", details: ["manish@gmail.com", "+91 99209 72082", "Bengaluru, KA"] },
    ].map(({ label, name, details }) => (
      <div key={label}>
        <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 5 }}>{name}</div>
        {details.map((d, i) => <div key={i} style={{ fontSize: 12, color: "#555", lineHeight: 1.8 }}>{d}</div>)}
      </div>
    ))}
  </div>
);

const InvTable = ({ thBg = "transparent", thColor = "#888", accentColor = "#e8e8e8" }: { thBg?: string; thColor?: string; accentColor?: string }) => (
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: thBg, borderBottom: `1.5px solid ${accentColor}` }}>
        {["Description", "HSN/SAC", "Qty", "Rate", "Tax", "Amount"].map((h, i) => (
          <th key={h} style={{ padding: "9px 8px", fontSize: 11, fontWeight: 600, color: thColor, textAlign: i === 0 ? "left" : "right", whiteSpace: "nowrap" }}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
        <td style={{ padding: "16px 8px", fontSize: 13, fontWeight: 500 }}>Online Course — Pro Plan</td>
        <td style={{ padding: "16px 8px", fontSize: 12, color: "#888", textAlign: "right" }}>998313</td>
        <td style={{ padding: "16px 8px", fontSize: 13, textAlign: "right" }}>1</td>
        <td style={{ padding: "16px 8px", fontSize: 13, textAlign: "right" }}>₹4,237</td>
        <td style={{ padding: "16px 8px", fontSize: 13, textAlign: "right" }}>18%</td>
        <td style={{ padding: "16px 8px", fontSize: 13, fontWeight: 600, textAlign: "right" }}>₹5,000</td>
      </tr>
    </tbody>
  </table>
);

const InvTotals = ({ color = "#e8e8e8" }: { color?: string }) => (
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <div style={{ width: 280 }}>
      {[["Subtotal", "₹4,237"], ["CGST (9%)", "₹381"], ["SGST (9%)", "₹382"]].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", fontSize: 12.5, color: "#555" }}>
          <span>{k}</span><span>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 8px", fontSize: 17, fontWeight: 700, borderTop: `1.5px solid ${color}`, marginTop: 6 }}>
        <span>Total</span><span>₹5,000</span>
      </div>
    </div>
  </div>
);

const InvTerms = ({ text }: { text?: string }) => text ? (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Terms & Conditions</div>
    <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>{text}</div>
  </div>
) : null;

const InvSignatory = ({ signUrl }: { signUrl?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
    {signUrl
      ? <img src={signUrl} alt="Signature" style={{ height: 36, objectFit: "contain", opacity: 0.85 }} />
      : <div style={{ width: 100, height: 32, borderBottom: "1.5px solid #ccc" }} />}
    <div style={{ fontSize: 11, color: "#888", textAlign: "right" }}>Authorised Signatory</div>
  </div>
);

// ── Invoice Template variants ─────────────────────────────────────────────────

interface InvProps { color: string; name: string; logoUrl?: string; invNum: string; terms?: string; signUrl?: string; company?: string; gstin?: string; address?: string; }

const InvoiceTemplateStandard = ({ color, name, logoUrl, invNum, terms, signUrl, company, gstin, address }: InvProps) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "52px 60px 0" }}><InvHeader color={color} logoUrl={logoUrl} name={name} invNum={invNum} /></div>
        <div style={{ padding: "0 60px" }}><div style={{ height: 1, background: "#e8e8e8", margin: "28px 0" }} /><InvParties company={company} gstin={gstin} address={address} /><div style={{ height: 1, background: "#e8e8e8", margin: "28px 0" }} /></div>
        <div style={{ padding: "0 60px" }}><InvTable accentColor="#e8e8e8" /></div>
        <div style={{ padding: "0 60px", marginTop: 12 }}><InvTotals /></div>
        <div style={{ flex: 1, minHeight: 30 }} />
        <div style={{ padding: "0 60px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <InvTerms text={terms} />
          <InvSignatory signUrl={signUrl} />
        </div>
      </div>
      <div style={{ borderTop: "1px solid #e8e8e8", padding: "16px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RzpFooter /><span style={{ fontSize: 12, color: "#aaa" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

const InvoiceTemplateModern = ({ color, name, logoUrl, invNum, terms, signUrl, company, gstin, address }: InvProps) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#111", padding: "52px 60px 32px" }}>
        <InvHeader color={color} logoUrl={logoUrl} name={name} invNum={invNum} titleColor="#fff" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "32px 60px 0" }}><InvParties accentColor="rgba(0,0,0,0.4)" company={company} gstin={gstin} address={address} /></div>
        <div style={{ height: 1, background: "#e8e8e8", margin: "24px 60px" }} />
        <div style={{ padding: "0 60px" }}><InvTable thBg="#111" thColor="#fff" accentColor="#111" /></div>
        <div style={{ padding: "0 60px", marginTop: 12 }}><InvTotals color="#111" /></div>
        <div style={{ flex: 1, minHeight: 30 }} />
        <div style={{ padding: "0 60px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <InvTerms text={terms} />
          <InvSignatory signUrl={signUrl} />
        </div>
      </div>
      <div style={{ background: "#111", padding: "16px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RzpFooter dark /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

const InvoiceTemplateMinimal = ({ color, name, logoUrl, invNum, terms, signUrl, company, gstin, address }: InvProps) => (
  <A4Preview>
    <div style={{ background: "#fff", minHeight: 1123, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: color }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "50px 60px 0" }}><InvHeader color={color} logoUrl={logoUrl} name={name} invNum={invNum} /></div>
        <div style={{ padding: "0 60px" }}><div style={{ height: 1, background: "#f0f0f0", margin: "26px 0" }} /><InvParties accentColor="#bbb" company={company} gstin={gstin} address={address} /><div style={{ height: 1, background: "#f0f0f0", margin: "26px 0" }} /></div>
        <div style={{ padding: "0 60px" }}><InvTable thColor="#ccc" accentColor="#f0f0f0" /></div>
        <div style={{ padding: "0 60px", marginTop: 12 }}><InvTotals color="#e0e0e0" /></div>
        <div style={{ flex: 1, minHeight: 30 }} />
        <div style={{ padding: "0 60px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <InvTerms text={terms} />
          <InvSignatory signUrl={signUrl} />
        </div>
      </div>
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RzpFooter /><span style={{ fontSize: 12, color: "#ccc" }}>Page 1 of 1</span>
      </div>
    </div>
  </A4Preview>
);

const INVOICE_TEMPLATES = [
  { id: 1, label: "Standard", Component: InvoiceTemplateStandard },
  { id: 2, label: "Modern",   Component: InvoiceTemplateModern },
  { id: 3, label: "Minimal",  Component: InvoiceTemplateMinimal },
];

const PRESET_COLORS = [
  "#0066FF", "#6C47FF", "#00AA60", "#E5292A",
  "#F59E0B", "#0EA5E9", "#EC4899", "#111111",
];

// ── Toggle helper ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? "bg-primary" : "bg-gray-200"}`}
    role="switch" aria-checked={checked}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
  </button>
);

// ── Section heading helper ────────────────────────────────────────────────────
const SectionHeading = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
    </div>
  </div>
);

// ── Template Picker (options list + live preview) ─────────────────────────────
function ReceiptTemplatePicker({ templates, selected, onSelect, previewProps }: {
  templates: typeof RECEIPT_TEMPLATES;
  selected: number;
  onSelect: (id: number) => void;
  previewProps: { color: string; name: string; logoUrl?: string; notes?: string };
}) {
  const active = templates.find(t => t.id === selected) || templates[0];
  return (
    <div className="space-y-3">
      {/* Options row */}
      <div className="flex gap-2">
        {templates.map(({ id, label }) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              selected === id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-gray-300 hover:bg-secondary/50"
            }`}>
            <div className={`h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === id ? "border-primary" : "border-gray-300"}`}>
              {selected === id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>
            {label}
          </button>
        ))}
      </div>
      {/* Live preview — small thumbnail */}
      <div className="flex justify-center">
        <div className="w-48 rounded-xl overflow-hidden"
          style={{ border: `2px solid ${previewProps.color}22`, boxShadow: `0 0 0 3px ${previewProps.color}11` }}>
          <active.Component {...previewProps} />
        </div>
      </div>
    </div>
  );
}

function InvoiceTemplatePicker({ templates, selected, onSelect, previewProps }: {
  templates: typeof INVOICE_TEMPLATES;
  selected: number;
  onSelect: (id: number) => void;
  previewProps: InvProps;
}) {
  const active = templates.find(t => t.id === selected) || templates[0];
  return (
    <div className="space-y-3">
      {/* Options row */}
      <div className="flex gap-2">
        {templates.map(({ id, label }) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              selected === id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-gray-300 hover:bg-secondary/50"
            }`}>
            <div className={`h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === id ? "border-primary" : "border-gray-300"}`}>
              {selected === id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>
            {label}
          </button>
        ))}
      </div>
      {/* Live preview — small thumbnail */}
      <div className="flex justify-center">
        <div className="w-48 rounded-xl overflow-hidden"
          style={{ border: `2px solid ${previewProps.color}22`, boxShadow: `0 0 0 3px ${previewProps.color}11` }}>
          <active.Component {...previewProps} />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ReceiptsSettings = () => {
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const signatoryInputRef = useRef<HTMLInputElement>(null);

  // Brand
  const [brandName, setBrandName] = useState("Manish Reddy");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("Manish Reddy");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [brandColor, setBrandColor] = useState("#0066FF");
  const [editingColor, setEditingColor] = useState(false);
  const [draftColor, setDraftColor] = useState("#0066FF");

  // Billing details (in Brand Details card)
  const billingCompany = "Wealthjoy Technologies Pvt Ltd"; // from KYC, read-only
  const billingGSTIN = "29AADCW4121C1CY"; // read-only from KYC
  const [billingAddress, setBillingAddress] = useState("123, MG Road, Indiranagar\nBengaluru, Karnataka 560038");
  const [editingBillingAddr, setEditingBillingAddr] = useState(false);
  const [draftBillingAddr, setDraftBillingAddr] = useState("123, MG Road, Indiranagar\nBengaluru, Karnataka 560038");

  // Receipt config
  const [sendAutomatically, setSendAutomatically] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(true);

  // 80G
  const [enable80g, setEnable80g] = useState(false);
  const [g80Description, setG80Description] = useState("");
  const [g80SignatureFile, setG80SignatureFile] = useState<File | null>(null);
  const [g80SignatureUrl, setG80SignatureUrl] = useState<string | undefined>(undefined);

  // Customer notes
  const [customerNotes, setCustomerNotes] = useState("Thank you for your payment! For support, contact us at support@wealthjoy.in.");

  // Receipt template
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  // Invoice settings — numbering
  const [invPrefix, setInvPrefix] = useState("INV-");
  const [invStartFrom, setInvStartFrom] = useState("0001");
  const [hsnCode, setHsnCode] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");

  // Invoice settings — terms & signatory
  const [invoiceTerms, setInvoiceTerms] = useState("Payment is due within 7 days of invoice date. Late payments may attract a penalty of 1.5% per month. Goods once sold will not be taken back.");
  const [signatoryFile, setSignatoryFile] = useState<File | null>(null);
  const [signatoryUrl, setSignatoryUrl] = useState<string | undefined>(undefined);

  // Invoice template
  const [selectedInvoiceTemplate, setSelectedInvoiceTemplate] = useState(1);

  const invPreview = `${invPrefix}${invStartFrom.padStart(4, "0")}`;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUrl(URL.createObjectURL(file));
    toast.success("Logo updated");
  };

  const handleSave = () => {
    toast.success("Settings saved!");
    navigate("/account-settings");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" size="icon" onClick={() => navigate("/account-settings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Receipts & Invoice Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Customize receipts, invoices, and brand identity shown to customers</p>
          </div>
        </div>

        {/* ── 1. Billing From ──────────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Billing From</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Business identity shown on receipts and invoices.</p>
                </div>
              </div>
              <a href="/account-settings" className="flex items-center gap-1 text-xs text-primary font-medium hover:underline flex-shrink-0 mt-1">
                Change <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border overflow-hidden">
              {/* Business name + logo + color */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: logoUrl ? "transparent" : brandColor }}>
                  {logoUrl
                    ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                    : <span className="text-white font-bold text-sm">{brandName.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{billingCompany}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Billing label: <span className="font-medium text-foreground">{brandName}</span></p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-4 h-4 rounded border border-border/60 shadow-sm" style={{ background: brandColor }} />
                  <span className="text-xs font-mono text-muted-foreground">{brandColor.toUpperCase()}</span>
                </div>
              </div>

              {/* GST */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs text-muted-foreground w-14 flex-shrink-0">GST</span>
                <Shield className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-mono font-medium text-foreground">{billingGSTIN}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-100">Verified</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-xs text-muted-foreground w-14 flex-shrink-0 mt-0.5">Address</span>
                <p className="text-sm text-foreground leading-relaxed">
                  {billingAddress.split("\n").map((l, i, arr) => (
                    <span key={i}>{l}{i < arr.length - 1 && <br />}</span>
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Receipt Settings ───────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <SectionHeading
              icon={<Receipt className="h-4 w-4 text-primary" />}
              title="Receipt Settings"
              desc="Configure how and when receipts are sent to your customers."
            />

            {/* Send automatically — simple checkbox */}
            <div className="flex items-center gap-3 mb-5">
              <Checkbox
                id="sendAuto"
                checked={sendAutomatically}
                onCheckedChange={(v) => setSendAutomatically(!!v)}
              />
              <div>
                <Label htmlFor="sendAuto" className="text-sm font-medium cursor-pointer">Send Receipts Automatically</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Receipts are sent to customers immediately after payment.</p>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Send via */}
            <div className="mb-5">
              <p className="text-sm font-medium text-foreground mb-1">Send Receipts via</p>
              <p className="text-xs text-muted-foreground mb-3">Choose how payment receipts are delivered to your customers.</p>
              <div className="flex gap-5">
                <div className="flex items-center gap-2">
                  <Checkbox checked={sendViaEmail} onCheckedChange={(v) => setSendViaEmail(!!v)} id="email" />
                  <Label htmlFor="email" className="text-sm">Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={sendViaWhatsapp} onCheckedChange={(v) => setSendViaWhatsapp(!!v)} id="whatsapp" />
                  <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                </div>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* 80G */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">80G Details</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add 80G tax exemption details to all payment receipts.</p>
              </div>
              <Toggle checked={enable80g} onChange={() => setEnable80g(v => !v)} />
            </div>
            {enable80g && (
              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">80G Description</Label>
                    <a href="https://razorpay.com/docs/payments/payment-pages/80g-receipt/#pdf-receipt-to-customers" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1">
                      Sample 80G Receipt <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <textarea value={g80Description} onChange={(e) => setG80Description(e.target.value)}
                    placeholder="All donations made to us are eligible for tax exemption under 80G of IT act"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Signature of Authorised Person <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <input ref={signatureInputRef} type="file" accept=".png,.jpg,.jpeg" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file && file.size > 500 * 1024) { toast.error("File size must be under 500 KB"); return; }
                        setG80SignatureFile(file);
                        if (file) setG80SignatureUrl(URL.createObjectURL(file));
                      }} />
                    {g80SignatureFile ? (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate max-w-xs">{g80SignatureFile.name}</span>
                        <button type="button" className="text-muted-foreground hover:text-destructive ml-1 flex-shrink-0"
                          onClick={(e) => { e.preventDefault(); setG80SignatureFile(null); setG80SignatureUrl(undefined); }}>
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
                  {g80SignatureUrl && <img src={g80SignatureUrl} alt="Signature preview" className="mt-2 h-12 object-contain rounded border border-border" />}
                </div>
              </div>
            )}

            <Separator className="my-5" />

            {/* Customer Notes */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Customer Notes</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">A message shown at the bottom of every receipt sent to your customers.</p>
              <div className="space-y-2">
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Thank you for your payment! For support, contact us at support@yourbusiness.in."
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">{customerNotes.length}/500</span>
                </div>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Receipt PDF Template */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Receipt PDF Template</p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Choose the visual style for your payment receipts.</p>
              <ReceiptTemplatePicker
                templates={RECEIPT_TEMPLATES}
                selected={selectedTemplate}
                onSelect={setSelectedTemplate}
                previewProps={{ color: brandColor, name: brandName || "Brand", logoUrl, notes: customerNotes }}
              />
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-md bg-muted/50 border border-border px-3 py-2.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Receipts for <span className="font-medium text-foreground">Payment Pages</span> can be configured in the payment page settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── 3. Invoice Settings ───────────────────────────────────────────── */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Invoice Settings</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Configure invoice numbering, GST defaults, and PDF layout.</p>
                </div>
              </div>
              <a href="https://razorpay.com/docs/payments/payment-pages/receipt/#pdf-receipt-to-customers" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline flex-shrink-0 mt-1">
                <BookOpen className="h-3.5 w-3.5" /> Docs
              </a>
            </div>

            {/* ── Invoice Number Format ── */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">Invoice Number Format</p>
              <p className="text-xs text-muted-foreground mb-4">Configure the numbering format for GST invoices.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prefix</Label>
                  <Input value={invPrefix} onChange={(e) => setInvPrefix(e.target.value)} placeholder="INV-" className="h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start from</Label>
                  <Input value={invStartFrom} onChange={(e) => setInvStartFrom(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="0001" className="h-9 text-sm font-mono" />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border px-4 py-3">
                <span className="text-xs text-muted-foreground font-medium">Preview:</span>
                <span className="text-sm font-bold font-mono text-foreground tracking-wide">{invPreview}</span>
              </div>
            </div>

            <Separator />

            {/* ── Product Config ── */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">Product Config <span className="text-xs text-muted-foreground font-normal ml-1">(default)</span></p>
              <p className="text-xs text-muted-foreground mb-4">Default tax settings applied to products on GST invoices.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">HSN/SAC Code</Label>
                  <Input value={hsnCode} onChange={(e) => setHsnCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="e.g. 998313" className="h-9 text-sm font-mono" />
                  <p className="text-xs text-muted-foreground">6 or 8 digit code.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tax Percentage</Label>
                  <select
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select tax rate</option>
                    {["0", "5", "12", "18", "28"].map((v) => (
                      <option key={v} value={v}>{v}%</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Terms & Conditions ── */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Terms & Conditions</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Printed at the bottom of every GST invoice sent to customers.</p>
              <div className="space-y-2">
                <textarea
                  value={invoiceTerms}
                  onChange={(e) => setInvoiceTerms(e.target.value)}
                  placeholder="e.g. Payment is due within 7 days. Goods once sold will not be taken back."
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">{invoiceTerms.length}/1000</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Authorised Signatory ── */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Authorised Signatory</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Signature image printed at the bottom-right of every invoice. PNG with transparent background recommended.</p>
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <input ref={signatoryInputRef} type="file" accept=".png,.jpg,.jpeg" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file && file.size > 500 * 1024) { toast.error("File size must be under 500 KB"); return; }
                    setSignatoryFile(file);
                    if (file) setSignatoryUrl(URL.createObjectURL(file));
                  }} />
                {signatoryFile ? (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate max-w-xs">{signatoryFile.name}</span>
                    <button type="button" className="text-muted-foreground hover:text-destructive ml-1 flex-shrink-0"
                      onClick={(e) => { e.preventDefault(); setSignatoryFile(null); setSignatoryUrl(undefined); }}>
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
                    <p className="text-xs text-muted-foreground">PNG with transparent background · 500 KB max</p>
                  </>
                )}
              </label>
              {signatoryUrl && (
                <div className="mt-3 flex items-end gap-3">
                  <img src={signatoryUrl} alt="Signature preview" className="h-9 max-w-[140px] object-contain rounded border border-border bg-gray-50 px-2 py-1.5" />
                  <button onClick={() => { setSignatoryFile(null); setSignatoryUrl(undefined); }} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Invoice PDF Template ── */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Invoice PDF Template</p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Choose the visual style for your GST invoices.</p>
              <InvoiceTemplatePicker
                templates={INVOICE_TEMPLATES}
                selected={selectedInvoiceTemplate}
                onSelect={setSelectedInvoiceTemplate}
                previewProps={{
                  color: brandColor,
                  name: brandName || "Brand",
                  logoUrl,
                  invNum: invPreview,
                  terms: invoiceTerms,
                  signUrl: signatoryUrl,
                  company: billingCompany,
                  gstin: billingGSTIN,
                  address: billingAddress,
                }}
              />
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
