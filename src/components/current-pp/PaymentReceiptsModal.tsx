import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

interface PaymentFieldItem {
  id: string;
  label: string;
  type: string;
  rate?: string;
}

interface PaymentReceiptsModalProps {
  open: boolean;
  onClose: () => void;
  paymentItems?: PaymentFieldItem[];
  onGstChange?: (enabled: boolean) => void;
}

interface GstLineItem {
  id: string;
  item: string;
  fieldName: string;
  rate: string;
  taxRate: string;
  hsnSac: string;
}

export const CurrentPaymentReceiptsModal = ({ open, onClose, paymentItems, onGstChange }: PaymentReceiptsModalProps) => {
  const [receiptMode, setReceiptMode] = useState("auto");
  const [customerFields, setCustomerFields] = useState({ email: true, phone: true, name: false, pan: false });
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [showBillingDetails, setShowBillingDetails] = useState(true);
  const [eightyGDescription, setEightyGDescription] = useState(
    "All donations made to us are eligible for tax exemption under 80G of IT act ITBA/EXM/S80G/2019-20/1XXXXXXX Dated DD/MM/YYYY"
  );
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstExpanded, setGstExpanded] = useState(true);
  const [customerInfoExpanded, setCustomerInfoExpanded] = useState(true);
  const [billingExpanded, setBillingExpanded] = useState(true);

  const priceFields = paymentItems ? paymentItems.filter((f) => f.type === "price") : [];
  const initialGstItems: GstLineItem[] = priceFields.length > 0
    ? priceFields.map((field, idx) => ({ id: `g${idx + 1}`, item: field.label, fieldName: field.label, rate: field.rate || "", taxRate: "", hsnSac: "" }))
    : [{ id: "g1", item: "", fieldName: "", rate: "", taxRate: "", hsnSac: "" }];

  const [gstLineItems, setGstLineItems] = useState<GstLineItem[]>(initialGstItems);

  const handleSave = () => { toast.success("Payment receipt settings saved!"); onClose(); };
  const toggleCustomerField = (field: keyof typeof customerFields) => setCustomerFields((prev) => ({ ...prev, [field]: !prev[field] }));
  const addGstLineItem = () => setGstLineItems([...gstLineItems, { id: `g${Date.now()}`, item: "", fieldName: "", rate: "", taxRate: "", hsnSac: "" }]);
  const updateGstLineItem = (id: string, field: keyof GstLineItem, value: string) => setGstLineItems(gstLineItems.map((li) => (li.id === id ? { ...li, [field]: value } : li)));
  const removeGstLineItem = (id: string) => { if (gstLineItems.length > 1) setGstLineItems(gstLineItems.filter((li) => li.id !== id)); };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Receipts Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Receipt mode */}
          <div>
            <Label className="mb-2 block">When to send receipts</Label>
            <RadioGroup value={receiptMode} onValueChange={setReceiptMode}>
              <div className="flex items-start gap-2 mb-2">
                <RadioGroupItem value="auto" id="auto" className="mt-1" />
                <div>
                  <Label htmlFor="auto">Send Receipts Automatically</Label>
                  <p className="text-xs text-muted-foreground">Receipts are emailed to customers immediately after payment.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="manual" id="manual" className="mt-1" />
                <div>
                  <Label htmlFor="manual">Don't Send Receipts Automatically</Label>
                  <p className="text-xs text-muted-foreground">You may send receipts later from dashboard.</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-sm text-primary flex items-center gap-1"><ExternalLink className="h-3 w-3" />Sample Receipt</a>
            <a href="#" className="text-sm text-primary flex items-center gap-1"><ExternalLink className="h-3 w-3" />Learn More</a>
          </div>

          {/* GST Receipt Section */}
          <div className="border rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-muted">
              <div className="flex items-center gap-4">
                <Switch checked={gstEnabled} onCheckedChange={(v) => { setGstEnabled(v); onGstChange?.(v); if (v) setGstExpanded(true); }} />
                <div>
                  <p className="text-sm font-semibold">GST Receipt</p>
                  <p className="text-xs text-muted-foreground">Generate GST-compliant invoice with customer & tax details</p>
                </div>
              </div>
              {gstEnabled && (
                <Button variant="ghost" size="sm" onClick={() => setGstExpanded(!gstExpanded)}>
                  {gstExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {gstEnabled && gstExpanded && (
              <div className="p-4 flex flex-col gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800">
                  The following fields will be enabled on the payment page for GST invoice generation: Name, Billing Address, City, State, Pincode, and Customer GST (optional).
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Item Details</h4>
                  {gstLineItems.map((li, idx) => (
                    <div key={li.id} className="border rounded-md p-3 bg-muted mb-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-muted-foreground font-medium">Item {idx + 1}</span>
                        {gstLineItems.length > 1 && (
                          <Button variant="ghost" size="sm" className="text-destructive h-6" onClick={() => removeGstLineItem(li.id)}>Remove</Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div><Label className="text-xs">Item Name</Label><Input size={1} value={li.item} onChange={(e) => updateGstLineItem(li.id, "item", e.target.value)} placeholder="e.g., Online Course" className="mt-1" /></div>
                        <div><Label className="text-xs">Item Field Name</Label><Input size={1} value={li.fieldName} onChange={(e) => updateGstLineItem(li.id, "fieldName", e.target.value)} placeholder="e.g., Amount" className="mt-1" /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><Label className="text-xs">Rate (₹)</Label><Input size={1} value={li.rate} onChange={(e) => updateGstLineItem(li.id, "rate", e.target.value)} placeholder="0.00" className="mt-1" /></div>
                        <div>
                          <Label className="text-xs">Tax Rate</Label>
                          <Select value={li.taxRate} onValueChange={(v) => updateGstLineItem(li.id, "taxRate", v)}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {["0", "5", "12", "18", "28"].map((r) => <SelectItem key={r} value={r}>{r}%</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label className="text-xs">HSN/SAC Code</Label><Input size={1} value={li.hsnSac} onChange={(e) => updateGstLineItem(li.id, "hsnSac", e.target.value)} placeholder="e.g., 9992" className="mt-1" /></div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addGstLineItem}>+ Add another item</Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800">
                  Tax rate will be auto-calculated based on the customer's billing address and your registered business address.
                </div>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="border rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-muted">
              <div className="flex items-center gap-4">
                <Switch checked={showCustomerInfo} onCheckedChange={(v) => { setShowCustomerInfo(v); if (v) setCustomerInfoExpanded(true); }} />
                <div>
                  <p className="text-sm font-semibold">Show customer's information on receipt</p>
                  <p className="text-xs text-muted-foreground">Include customer details like name and PAN on the payment receipt</p>
                </div>
              </div>
              {showCustomerInfo && (
                <Button variant="ghost" size="sm" onClick={() => setCustomerInfoExpanded(!customerInfoExpanded)}>
                  {customerInfoExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {showCustomerInfo && customerInfoExpanded && (
              <div className="p-4 flex flex-col gap-4">
                <div className="flex gap-5">
                  <div className="flex items-center gap-2"><Checkbox checked={customerFields.name} onCheckedChange={() => toggleCustomerField("name")} /><Label>Customer Name</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={customerFields.pan} onCheckedChange={() => toggleCustomerField("pan")} /><Label>PAN Number</Label></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Always included</p>
                  <div className="flex gap-3"><Badge variant="secondary">Email Address</Badge><Badge variant="secondary">Phone Number</Badge></div>
                </div>
              </div>
            )}
          </div>

          {/* 80G Details */}
          <div className="border rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-muted">
              <div className="flex items-center gap-4">
                <Switch checked={showBillingDetails} onCheckedChange={(v) => { setShowBillingDetails(v); if (v) setBillingExpanded(true); }} />
                <div>
                  <p className="text-sm font-semibold">Show 80G Details on Receipt</p>
                  <p className="text-xs text-muted-foreground">Include 80G tax exemption details on the receipt for donors</p>
                </div>
              </div>
              {showBillingDetails && (
                <Button variant="ghost" size="sm" onClick={() => setBillingExpanded(!billingExpanded)}>
                  {billingExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {showBillingDetails && billingExpanded && (
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <Label>80G Description</Label>
                  <Textarea value={eightyGDescription} onChange={(e) => setEightyGDescription(e.target.value)} className="mt-1" rows={4} />
                  <p className="text-xs text-muted-foreground mt-1">Sample 80G Receipt</p>
                </div>
                <div>
                  <Label>Signature of Authorised Person (Optional)</Label>
                  <Input type="file" accept=".png,.jpg,.jpeg" className="mt-1" onChange={(e) => {
                    if (e.target.files?.[0]) toast.success(`File "${e.target.files[0].name}" selected`);
                  }} />
                  <p className="text-xs text-muted-foreground mt-1">Upload .png, .jpg or .jpeg file | 500 KB Max</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
