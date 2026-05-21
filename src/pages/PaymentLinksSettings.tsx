import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ChevronLeft, Truck, MapPin, Plus, Edit2, Trash2, CheckCircle2,
  XCircle, Link2, Star, Settings, Copy, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LogisticsConnection {
  connected: boolean;
  accountEmail: string;
  connectedAt: string;
  apiKey: string;
}

interface PickupAddress {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LOGISTICS_STORAGE_KEY = "pl_logistics_connections";
const ADDRESSES_STORAGE_KEY = "pl_pickup_addresses";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const PINCODE_DB: Record<string, { city: string; state: string }> = {
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "560034": { city: "Bengaluru", state: "Karnataka" },
  "560037": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "122001": { city: "Gurugram", state: "Haryana" },
  "201301": { city: "Noida", state: "Uttar Pradesh" },
};

const PARTNER_META = {
  shiprocket: {
    name: "Shiprocket",
    logo: "🚀",
    description: "India's #1 eCommerce shipping platform. Get access to 25+ courier partners.",
    setupSteps: [
      "Log in to your Shiprocket account at app.shiprocket.in",
      "Go to Settings → API → Generate a new API Key",
      "Paste the API Key below to connect",
    ],
    docsUrl: "https://app.shiprocket.in",
    color: "orange",
  },
  delhivery: {
    name: "Delhivery",
    logo: "📦",
    description: "Reliable last-mile delivery with 18,500+ pin codes covered across India.",
    setupSteps: [
      "Log in to your Delhivery Business account",
      "Navigate to Integrations → API Access",
      "Copy your API Token and paste below",
    ],
    docsUrl: "https://business.delhivery.com",
    color: "red",
  },
} as const;

type PartnerKey = keyof typeof PARTNER_META;

// ─── Storage helpers ──────────────────────────────────────────────────────────

const loadConnections = (): Record<PartnerKey, LogisticsConnection> => {
  try {
    const stored = localStorage.getItem(LOGISTICS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    shiprocket: { connected: false, accountEmail: "", connectedAt: "", apiKey: "" },
    delhivery: { connected: false, accountEmail: "", connectedAt: "", apiKey: "" },
  };
};

const saveConnections = (c: Record<PartnerKey, LogisticsConnection>) => {
  localStorage.setItem(LOGISTICS_STORAGE_KEY, JSON.stringify(c));
};

const loadAddresses = (): PickupAddress[] => {
  try {
    const stored = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    {
      id: "addr_1",
      label: "Main Office",
      addressLine: "5th Cross, Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      isDefault: true,
    },
  ];
};

const saveAddresses = (addrs: PickupAddress[]) => {
  localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addrs));
};

// ─── Component ───────────────────────────────────────────────────────────────

const PaymentLinksSettings = () => {
  const navigate = useNavigate();

  // ── Logistics state ──────────────────────────────────────────────────────
  const [connections, setConnections] = useState<Record<PartnerKey, LogisticsConnection>>(loadConnections);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingPartner, setConnectingPartner] = useState<PartnerKey>("shiprocket");
  const [connectStep, setConnectStep] = useState(1);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [disconnectTarget, setDisconnectTarget] = useState<PartnerKey | null>(null);

  // ── Pickup addresses state ────────────────────────────────────────────────
  const [addresses, setAddresses] = useState<PickupAddress[]>(loadAddresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<PickupAddress | null>(null);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrPin, setAddrPin] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");

  // Persist whenever connections or addresses change
  useEffect(() => { saveConnections(connections); }, [connections]);
  useEffect(() => { saveAddresses(addresses); }, [addresses]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openConnectModal = (partner: PartnerKey) => {
    setConnectingPartner(partner);
    setConnectStep(1);
    setApiKeyInput("");
    setShowConnectModal(true);
  };

  const handleConnect = () => {
    if (!apiKeyInput.trim()) {
      toast.error("Please enter your API Key");
      return;
    }
    setConnectStep(2);
  };

  const handleConnectDone = () => {
    const now = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
    setConnections((prev) => ({
      ...prev,
      [connectingPartner]: {
        connected: true,
        apiKey: apiKeyInput,
        accountEmail: `merchant@${connectingPartner}.com`,
        connectedAt: now,
      },
    }));
    setShowConnectModal(false);
    toast.success(`${PARTNER_META[connectingPartner].name} connected successfully!`);
  };

  const handleDisconnect = (partner: PartnerKey) => {
    setConnections((prev) => ({
      ...prev,
      [partner]: { connected: false, accountEmail: "", connectedAt: "", apiKey: "" },
    }));
    setDisconnectTarget(null);
    toast.success(`${PARTNER_META[partner].name} disconnected.`);
  };

  // ── Address helpers ───────────────────────────────────────────────────────

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddrLabel("");
    setAddrLine("");
    setAddrPin("");
    setAddrCity("");
    setAddrState("");
    setShowAddressModal(true);
  };

  const openEditAddress = (addr: PickupAddress) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrLine(addr.addressLine);
    setAddrPin(addr.pincode);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setShowAddressModal(true);
  };

  const handlePincodeChange = (pin: string) => {
    setAddrPin(pin);
    if (pin.length === 6 && PINCODE_DB[pin]) {
      setAddrCity(PINCODE_DB[pin].city);
      setAddrState(PINCODE_DB[pin].state);
    }
  };

  const handleSaveAddress = () => {
    if (!addrLabel.trim() || !addrLine.trim() || !addrPin.trim() || !addrCity.trim() || !addrState) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddress.id
            ? { ...a, label: addrLabel, addressLine: addrLine, pincode: addrPin, city: addrCity, state: addrState }
            : a
        )
      );
      toast.success("Address updated");
    } else {
      const newAddr: PickupAddress = {
        id: `addr_${Date.now()}`,
        label: addrLabel,
        addressLine: addrLine,
        city: addrCity,
        state: addrState,
        pincode: addrPin,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
      toast.success("Pickup address added");
    }
    setShowAddressModal(false);
  };

  const handleDeleteAddress = (id: string) => {
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && addresses.find((a) => a.id === id)?.isDefault) {
      remaining[0].isDefault = true;
    }
    setAddresses(remaining);
    toast.success("Address removed");
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Default address updated");
  };

  const connectedCount = (Object.keys(connections) as PartnerKey[]).filter(
    (k) => connections[k].connected
  ).length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-3xl space-y-8">

        {/* Page header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/account-settings")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Account &amp; Settings
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Logistics Partner Settings</span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Logistics Partner Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect courier partners and manage pickup addresses for auto-fulfilment after payment.
          </p>
        </div>

        {/* ── Section 1: Logistics Partners ─────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Logistics Partners
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect a courier partner to auto-push orders after payment.
              </p>
            </div>
            {connectedCount > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                {connectedCount} connected
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {(Object.keys(PARTNER_META) as PartnerKey[]).map((partner) => {
              const meta = PARTNER_META[partner];
              const conn = connections[partner];
              return (
                <div
                  key={partner}
                  className={`rounded-xl border p-4 sm:p-5 transition-all ${conn.connected ? "border-emerald-200 bg-emerald-50/40" : "border-border bg-card"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: logo + info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                        {meta.logo}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{meta.name}</span>
                          {conn.connected ? (
                            <Badge className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Not connected</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                        {conn.connected && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                            <span>Account: <span className="text-foreground font-medium">{conn.accountEmail}</span></span>
                            <span className="hidden sm:inline">·</span>
                            <span>Connected on {conn.connectedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conn.connected ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => {
                              toast.info("Settings coming soon");
                            }}
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                            onClick={() => setDisconnectTarget(partner)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => openConnectModal(partner)}
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg p-3">
            <span className="font-medium text-foreground">How it works:</span> Once connected, when a customer completes
            payment on a Magic Link, the order is automatically pushed to your logistics partner for fulfilment.
          </p>
        </section>

        <Separator />

        {/* ── Section 2: Pickup Addresses ───────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Pickup Addresses
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saved addresses used as the pick-up origin for shipments.
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={openAddAddress}>
              <Plus className="h-3.5 w-3.5" />
              Add Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No pickup addresses saved yet.</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={openAddAddress}>
                <Plus className="h-3.5 w-3.5" /> Add your first address
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-all ${
                    addr.isDefault ? "border-blue-200 bg-blue-50/40" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${addr.isDefault ? "bg-blue-100" : "bg-secondary"}`}>
                      <MapPin className={`h-4 w-4 ${addr.isDefault ? "text-blue-600" : "text-muted-foreground"}`} />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                        {addr.isDefault && (
                          <Badge className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
                            <Star className="h-2.5 w-2.5 fill-current" /> Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{addr.addressLine}</p>
                      <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} – {addr.pincode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setDefaultAddress(addr.id)}
                      >
                        Set default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditAddress(addr)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAddress(addr.id)}
                      disabled={addresses.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Connect Logistics Modal ─────────────────────────────────────────── */}
      <Dialog
        open={showConnectModal}
        onOpenChange={(open) => {
          if (!open) { setShowConnectModal(false); setConnectStep(1); setApiKeyInput(""); }
        }}
      >
        <DialogContent className="max-w-md p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Truck className="h-5 w-5 text-blue-600" />
              Connect {PARTNER_META[connectingPartner].name}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-6">
            {connectStep === 1 ? (
              <div className="space-y-5">
                {/* Steps */}
                <div className="space-y-3">
                  {PARTNER_META[connectingPartner].setupSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* API key input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {PARTNER_META[connectingPartner].name} API Key <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Paste API key here…"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is encrypted and stored securely.
                  </p>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleConnect}>
                  Verify & Connect
                </Button>
              </div>
            ) : (
              <div className="space-y-5 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">
                    {PARTNER_META[connectingPartner].name} Connected!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your logistics account is now linked to Razorpay. Orders on Magic Links will be
                    auto-pushed after payment.
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleConnectDone}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Disconnect Confirm Modal ────────────────────────────────────────── */}
      <Dialog open={!!disconnectTarget} onOpenChange={() => setDisconnectTarget(null)}>
        <DialogContent className="max-w-sm p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              Disconnect {disconnectTarget ? PARTNER_META[disconnectTarget].name : ""}?
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Disconnecting will stop automatic order fulfilment for new Magic Link payments.
              Existing orders already pushed will not be affected.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDisconnectTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => disconnectTarget && handleDisconnect(disconnectTarget)}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Address Modal ────────────────────────────────────────── */}
      <Dialog open={showAddressModal} onOpenChange={(open) => { if (!open) setShowAddressModal(false); }}>
        <DialogContent className="max-w-md p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              {editingAddress ? "Edit Address" : "Add Pickup Address"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            {/* Label */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Label <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Main Office, Warehouse"
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
              />
            </div>

            {/* Address line */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Address <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Flat / Building / Street"
                value={addrLine}
                onChange={(e) => setAddrLine(e.target.value)}
              />
            </div>

            {/* Pincode + City */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Pincode <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="6-digit PIN"
                  maxLength={6}
                  value={addrPin}
                  onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="City"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                />
              </div>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                State <span className="text-destructive">*</span>
              </label>
              <Select value={addrState} onValueChange={setAddrState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddressModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSaveAddress}>
                {editingAddress ? "Save Changes" : "Add Address"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PaymentLinksSettings;
