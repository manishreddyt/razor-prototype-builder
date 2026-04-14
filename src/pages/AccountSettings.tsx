import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Copy, CreditCard, Settings, Receipt, Info, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AccountSettings = () => {
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);
  const [receiptPrefix, setReceiptPrefix] = useState("INV-");
  const [receiptStartFrom, setReceiptStartFrom] = useState("0001");
  const [merchantName, setMerchantName] = useState("Manish Reddy");
  const [gstNumber, setGstNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [receiptDetails, setReceiptDetails] = useState("");
  const [showReceiptsSettings, setShowReceiptsSettings] = useState(false);

  const copyMerchantId = () => {
    navigator.clipboard.writeText("RoOR1GZ6pOgE14");
    toast.success("Merchant ID copied!");
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Your profile</h1>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6 flex gap-8">
            <div className="flex gap-5 flex-1">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">MR</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">Manish Reddy</h2>
                <p className="text-sm text-muted-foreground">Owner</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Merchant ID</span>
                  <span className="text-sm font-medium">RoOR1GZ6pOgE14</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyMerchantId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1">
              {[
                { label: "Phone number", value: "+91 9920 972082" },
                { label: "Login email", value: "manishreddy.t+321@razorpay.com" },
                { label: "Password", value: "••••••••" },
              ].map((item, i) => (
                <div key={i} className="flex mb-3">
                  <div className="w-[140px] shrink-0"><span className="text-sm text-muted-foreground">{item.label}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.value}</span>
                    <button className="text-sm text-primary hover:underline" onClick={() => toast.info("Edit coming soon")}>Edit</button>
                  </div>
                </div>
              ))}
              <div className="flex">
                <div className="w-[140px] shrink-0"><span className="text-sm text-muted-foreground">2-step verification</span></div>
                <Switch checked={false} onCheckedChange={() => toast.info("2FA settings coming soon")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account settings */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Account and product settings</h2>
          <button className="text-sm text-primary hover:underline" onClick={() => toast.info("Documentation coming soon")}>Documentation</button>
        </div>

        <div className="flex gap-5 flex-wrap">
          {[
            { icon: "💳", title: "Payment methods", bgColor: "bg-primary/10", links: ["Cards", "UPI/QR", "Netbanking", "EMI", "Wallet", "Pay Later", "International payments"] },
            { icon: "🌐", title: "Website and app settings", bgColor: "bg-green-100", links: ["Business website detail", "API Keys", "Webhooks", "Applications"] },
            { icon: "🧾", title: "Receipts settings", bgColor: "bg-orange-100", links: ["Send Receipts", "GST Receipt Numbering", "Details on Receipts"], onLinkClick: () => setShowReceiptsSettings(true) },
          ].map((card, i) => (
            <div key={i} className="w-[340px]">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-md ${card.bgColor} flex items-center justify-center`}>
                      <span className="text-sm">{card.icon}</span>
                    </div>
                    <h3 className="text-sm font-semibold">{card.title}</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {card.links.map((link, j) => (
                      <button key={j} className="text-sm text-primary hover:underline text-left bg-transparent border-none cursor-pointer p-0" onClick={() => card.onLinkClick ? card.onLinkClick() : toast.info("Coming soon")}>
                        {link}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Receipts Settings Expanded */}
        {showReceiptsSettings && (
          <div className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold">Receipts Settings</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowReceiptsSettings(false)}>Close</Button>
                </div>

                <div className="mb-6">
                  <p className="text-base font-semibold mb-3">Send Receipts via</p>
                  <div className="flex gap-5">
                    <div className="flex items-center gap-2"><Checkbox checked={sendViaEmail} onCheckedChange={(v) => setSendViaEmail(!!v)} /><Label>Email</Label></div>
                    <div className="flex items-center gap-2"><Checkbox checked={sendViaWhatsapp} onCheckedChange={(v) => setSendViaWhatsapp(!!v)} /><Label>WhatsApp</Label></div>
                  </div>
                </div>

                <Separator />

                <div className="mt-5 mb-6">
                  <p className="text-base font-semibold mb-3">GST Receipts Numbering</p>
                  <p className="text-sm text-muted-foreground mb-4">Configure the receipt numbering format for GST invoices</p>
                  <div className="flex gap-4 items-end">
                    <div className="w-[200px]"><Label>Prefix</Label><Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value)} className="mt-1" /></div>
                    <div className="w-[200px]"><Label>Start from</Label><Input value={receiptStartFrom} onChange={(e) => setReceiptStartFrom(e.target.value)} className="mt-1" /></div>
                    <p className="text-sm text-muted-foreground pb-1">Preview: <span className="font-semibold">{receiptPrefix}{receiptStartFrom}</span></p>
                  </div>
                </div>

                <Separator />

                <div className="mt-5">
                  <p className="text-base font-semibold mb-3">Details printed on Receipts</p>
                  <p className="text-sm text-muted-foreground mb-4">These details will appear on all payment receipts and GST invoices</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1"><Label>Merchant Name</Label><Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} className="mt-1" /></div>
                      <div className="flex-1"><Label>GST Number</Label><Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="e.g., 29ABCDE1234F1Z5" className="mt-1" /></div>
                    </div>
                    <div><Label>Company Address</Label><Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Full registered address" className="mt-1" /></div>
                    <div><Label>Additional Details</Label><Input value={receiptDetails} onChange={(e) => setReceiptDetails(e.target.value)} placeholder="Any additional information to show on receipts" className="mt-1" /></div>
                    <div>
                      <Label>Logo</Label>
                      <Input type="file" accept=".png,.jpg,.jpeg" className="mt-1" onChange={(e) => {
                        if (e.target.files?.[0]) toast.success(`Logo "${e.target.files[0].name}" uploaded`);
                      }} />
                      <p className="text-xs text-muted-foreground mt-1">Upload .png, .jpg or .jpeg file | 1 MB Max</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowReceiptsSettings(false)}>Cancel</Button>
                  <Button onClick={() => { toast.success("Receipts settings saved!"); setShowReceiptsSettings(false); }}>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
