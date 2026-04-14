import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GripVertical, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Image, X, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CurrentPaymentReceiptsModal } from "@/components/current-pp/PaymentReceiptsModal";
import { CurrentPageSettingsModal } from "@/components/current-pp/PageSettingsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const CurrentCreatePaymentPage = () => {
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("+91 (IN)");
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [showInputDropdown, setShowInputDropdown] = useState(false);
  const inputDropdownRef = useRef<HTMLDivElement>(null);

  const inputFieldTypes = [
    "Single Line Text", "Alphabets", "Alphanumeric", "Number", "Email", "Phone No.",
    "Link / URL", "Large Textarea", "PAN Number", "Pincode", "Dropdown", "Date Picker", "Name", "Address",
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputDropdownRef.current && !inputDropdownRef.current.contains(e.target as Node)) setShowInputDropdown(false);
    };
    if (showInputDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInputDropdown]);

  const [paymentFields, setPaymentFields] = useState([
    { id: "f1", label: "Amount", type: "price", rate: "", removable: false },
    { id: "f2", label: "Email", type: "input", rate: "", removable: false },
    { id: "f3", label: "Phone", type: "input", rate: "", removable: true },
  ]);

  const addField = (type: "input" | "price", label?: string) => {
    setPaymentFields([...paymentFields, { id: `f${Date.now()}`, label: label || (type === "input" ? "New Field" : "Price Field"), type, rate: "", removable: true }]);
  };

  const removeField = (id: string) => setPaymentFields(paymentFields.filter((f) => f.id !== id));

  const handlePublish = () => {
    if (!pageTitle.trim()) { toast.error("Please enter a page title"); return; }
    toast.success("Payment page created and published!");
    setTimeout(() => navigate(`/payment-pages-current/published?title=${encodeURIComponent(pageTitle)}`), 800);
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Top bar */}
      <div className="bg-foreground h-[50px] flex items-center justify-between px-5">
        <span className="text-sm font-medium text-white">Create New Payment Page</span>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setShowReceiptsModal(true)}>Payment Receipts</Button>
          <Button variant="secondary" size="sm" onClick={() => setShowSettingsModal(true)}>Page Settings</Button>
          <Button size="sm" onClick={handlePublish}>Create and Publish Page</Button>
          <button className="text-white hover:text-white/80 bg-transparent border-none cursor-pointer" onClick={() => navigate("/payment-pages-current")}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex justify-center py-8 px-4 gap-6">
        {/* Left: Page editor */}
        <div className="w-[520px]">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-sm font-semibold">WEALTHJOY TECHNOLOGIES</span>
              </div>

              <div className="mb-3">
                <Label>Page Title</Label>
                <Input placeholder="Enter page title here" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="mt-1 text-lg" />
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">+ Add a Goal Tracker</Button>
                  <Badge className="bg-green-100 text-green-800">NEW</Badge>
                </div>
              </div>

              <div className="mb-4">
                <Label>Description</Label>
                <Textarea placeholder="Enter page description" value={pageDescription} onChange={(e) => setPageDescription(e.target.value)} rows={3} className="mt-1" />
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1 mb-4 py-2 border-t border-b">
                {[Bold, Italic, Underline].map((Icon, i) => (
                  <button key={i} className="bg-transparent border-none cursor-pointer p-0.5"><Icon size={14} className="text-muted-foreground" /></button>
                ))}
                <div className="w-px h-3.5 bg-muted mx-1" />
                {[List, ListOrdered].map((Icon, i) => (
                  <button key={i} className="bg-transparent border-none cursor-pointer p-0.5"><Icon size={14} className="text-muted-foreground" /></button>
                ))}
                <div className="w-px h-3.5 bg-muted mx-1" />
                {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
                  <button key={i} className="bg-transparent border-none cursor-pointer p-0.5"><Icon size={14} className="text-muted-foreground" /></button>
                ))}
                <div className="w-px h-3.5 bg-muted mx-1" />
                {[Link2, Image].map((Icon, i) => (
                  <button key={i} className="bg-transparent border-none cursor-pointer p-0.5"><Icon size={14} className="text-muted-foreground" /></button>
                ))}
              </div>

              <div className="mb-6">
                <Button variant="ghost" size="sm">+ Add social media share icons</Button>
              </div>

              <Separator />
              <div className="pt-5">
                <h3 className="text-sm font-semibold mb-3">Contact Us:</h3>
                <div className="flex gap-4">
                  <div className="flex-1"><Label>Email</Label><Input placeholder="Enter support email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="mt-1" /></div>
                  <div className="flex-1"><Label>Phone</Label><Input placeholder="Enter support phone" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className="mt-1" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment Details */}
        <div className="w-[320px]">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold mb-1">Payment Details</h3>
              <div className="h-0.5 w-8 bg-primary mb-5 rounded-full" />

              <div className="flex flex-col gap-4">
                {paymentFields.map((field) => (
                  <div key={field.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-muted-foreground cursor-grab" />
                        <span className="text-sm font-medium">{field.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {field.type === "price" && <Badge variant="secondary">Price field</Badge>}
                        {field.removable && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeField(field.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Input disabled className="bg-muted" />
                  </div>
                ))}
              </div>

              {gstEnabled && (
                <div className="mt-5 pt-4 border-t flex flex-col gap-3">
                  <Input disabled placeholder="Name" />
                  <Input disabled placeholder="Address Line" />
                  <div className="flex gap-2">
                    <Input disabled placeholder="Pincode" className="flex-1" />
                    <Input disabled placeholder="City" className="flex-1" />
                  </div>
                  <Input disabled placeholder="Select State" />
                  <Input disabled placeholder="e.g., 29ABCDE1234F1Z5" />
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Add new</span>
                <div className="relative" ref={inputDropdownRef}>
                  <Button variant="ghost" size="sm" onClick={() => setShowInputDropdown(!showInputDropdown)}>
                    <Plus className="h-3 w-3 mr-1" />Input field
                  </Button>
                  {showInputDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-background border rounded-md py-2 min-w-[200px] z-50 shadow-lg max-h-[280px] overflow-auto">
                      {inputFieldTypes.map((fieldType) => (
                        <button key={fieldType} className="block w-full text-left bg-transparent border-none cursor-pointer px-4 py-2 text-sm hover:bg-muted" onClick={() => { addField("input", fieldType); setShowInputDropdown(false); }}>
                          {fieldType}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => addField("price")}>
                  <Plus className="h-3 w-3 mr-1" />Price field
                </Button>
              </div>

              <div className="mt-8 pt-5 border-t">
                <div className="flex gap-2 mb-4">
                  {["UPI", "VISA", "Master", "RuPay", "PayPal"].map((method) => (
                    <Badge key={method} variant="secondary">{method}</Badge>
                  ))}
                </div>
                <Button className="w-full">Pay ₹ 0,000.00</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help button */}
      <div className="fixed bottom-5 right-5">
        <Button size="sm" onClick={() => toast.info("Help & Support coming soon")}>Help & Support</Button>
      </div>

      <CurrentPaymentReceiptsModal open={showReceiptsModal} onClose={() => setShowReceiptsModal(false)} paymentItems={paymentFields} onGstChange={(enabled) => setGstEnabled(enabled)} />
      <CurrentPageSettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
};

export default CurrentCreatePaymentPage;
