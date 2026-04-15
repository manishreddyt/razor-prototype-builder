import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

const ReceiptsSettings = () => {
  const navigate = useNavigate();
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);
  const [receiptPrefix, setReceiptPrefix] = useState("INV-");
  const [receiptStartFrom, setReceiptStartFrom] = useState("0001");
  const [merchantName, setMerchantName] = useState("Manish Reddy");
  const [gstNumber, setGstNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [receiptDetails, setReceiptDetails] = useState("");

  const handleSave = () => {
    toast.success("Receipts settings saved!");
    navigate("/account-settings");
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/account-settings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Receipts Settings</h1>
        </div>

        <Card className="mb-5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Send Receipts via</h3>
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

        <Card className="mb-5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">GST Receipts Numbering</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure the receipt numbering format for GST invoices</p>
            <div className="flex gap-4 items-end">
              <div className="w-[200px]">
                <Label>Prefix</Label>
                <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value)} placeholder="INV-" />
              </div>
              <div className="w-[200px]">
                <Label>Start from</Label>
                <Input value={receiptStartFrom} onChange={(e) => setReceiptStartFrom(e.target.value)} placeholder="0001" />
              </div>
              <p className="text-sm text-muted-foreground pb-2">Preview: <span className="font-semibold">{receiptPrefix}{receiptStartFrom}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-5">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Details printed on Receipts</h3>
              <p className="text-sm text-muted-foreground mb-4">These details will appear on all payment receipts and GST invoices</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Merchant Name</Label>
                <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="Your business name" />
              </div>
              <div>
                <Label>GST Number</Label>
                <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="e.g., 29ABCDE1234F1Z5" />
              </div>
            </div>
            <div>
              <Label>Company Address</Label>
              <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Full registered address" />
            </div>
            <div>
              <Label>Additional Details</Label>
              <Input value={receiptDetails} onChange={(e) => setReceiptDetails(e.target.value)} placeholder="Any additional information to show on receipts" />
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
