import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Info } from "lucide-react";
import { toast } from "sonner";

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
  rate: string;
  taxRate: string;
  hsnSac: string;
}

export const CurrentPaymentReceiptsModal = ({ open, onClose, paymentItems, onGstChange }: PaymentReceiptsModalProps) => {
  const [receiptMode, setReceiptMode] = useState<"auto" | "manual">("auto");

  // Customer info field selections
  const [customerFields, setCustomerFields] = useState({
    email: true,
    phone: true,
    name: false,
    pan: false,
  });
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);

  // Billing details
  const [showBillingDetails, setShowBillingDetails] = useState(true);

  // GST Receipt
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstExpanded, setGstExpanded] = useState(true);

  // Pre-fill GST line items from payment form fields (only price-type fields are actual items)
  const priceFields = paymentItems ? paymentItems.filter((f) => f.type === "price") : [];
  const initialGstItems: GstLineItem[] = priceFields.length > 0
    ? priceFields.map((field, idx) => ({
        id: `g${idx + 1}`,
        item: field.label,
        rate: field.rate || "",
        taxRate: "",
        hsnSac: "",
      }))
    : [{ id: "g1", item: "", rate: "", taxRate: "", hsnSac: "" }];

  const [gstLineItems, setGstLineItems] = useState<GstLineItem[]>(initialGstItems);

  if (!open) return null;

  const handleSave = () => {
    toast.success("Payment receipt settings saved!");
    onClose();
  };

  const toggleCustomerField = (field: keyof typeof customerFields) => {
    setCustomerFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const addGstLineItem = () => {
    setGstLineItems([
      ...gstLineItems,
      { id: `g${Date.now()}`, item: "", rate: "", taxRate: "", hsnSac: "" },
    ]);
  };

  const updateGstLineItem = (id: string, field: keyof GstLineItem, value: string) => {
    setGstLineItems(
      gstLineItems.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  };

  const removeGstLineItem = (id: string) => {
    if (gstLineItems.length > 1) {
      setGstLineItems(gstLineItems.filter((li) => li.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[540px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-gray-100 flex items-center justify-center">
                <span className="text-xs">⚙</span>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Payment Receipts Settings</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Send Receipts Automatically */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="receiptMode"
              checked={receiptMode === "auto"}
              onChange={() => setReceiptMode("auto")}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900">Send Receipts Automatically</span>
              <p className="text-xs text-gray-500 mt-0.5">
                Receipts are emailed to customers immediately after payment.
              </p>
            </div>
          </label>

          {/* Don't Send Receipts Automatically */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="receiptMode"
              checked={receiptMode === "manual"}
              onChange={() => setReceiptMode("manual")}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900">Don't Send Receipts Automatically</span>
              <p className="text-xs text-gray-500 mt-0.5">
                You may send receipts later from dashboard. Your own reference ID may be added too.
              </p>
            </div>
          </label>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Sample Receipt <ExternalLink className="h-3 w-3" />
            </a>
            <a href="#" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Learn More <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* GST Receipt Toggle */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 bg-gray-50/80 cursor-pointer"
              onClick={() => {
                if (gstEnabled) setGstExpanded(!gstExpanded);
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                    gstEnabled ? "bg-[#528ff0]" : "bg-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newVal = !gstEnabled;
                    setGstEnabled(newVal);
                    onGstChange?.(newVal);
                    if (newVal) setGstExpanded(true);
                  }}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform ${
                      gstEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">GST Receipt</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Generate GST-compliant invoice with customer & tax details
                  </p>
                </div>
              </div>
              {gstEnabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGstExpanded(!gstExpanded);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {gstExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>

            {gstEnabled && gstExpanded && (
              <div className="px-4 py-4 border-t border-gray-100 space-y-4">
                {/* Required fields info */}
                <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] text-blue-800 font-medium mb-1">
                        The following fields will be enabled on the payment page for GST invoice generation:
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {["Name", "Billing Address", "City", "State", "Pincode"].map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-medium rounded"
                          >
                            {f}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 bg-blue-100/60 text-blue-600 text-[11px] font-medium rounded border border-dashed border-blue-300">
                          Customer GST <span className="text-blue-400">(optional)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item-wise details */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-2 block uppercase tracking-wider">
                    Item Details
                  </label>
                  <div className="space-y-2.5">
                    {gstLineItems.map((li, idx) => (
                      <div key={li.id} className="border border-gray-200 rounded-md p-3 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-gray-500 font-medium">Item {idx + 1}</span>
                          {gstLineItems.length > 1 && (
                            <button
                              onClick={() => removeGstLineItem(li.id)}
                              className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Item Name</label>
                            <input
                              type="text"
                              value={li.item}
                              onChange={(e) => updateGstLineItem(li.id, "item", e.target.value)}
                              placeholder="e.g., Online Course"
                              className="w-full h-8 px-2.5 text-[12px] border border-gray-200 rounded bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Rate (₹)</label>
                            <input
                              type="text"
                              value={li.rate}
                              onChange={(e) => updateGstLineItem(li.id, "rate", e.target.value)}
                              placeholder="0.00"
                              className="w-full h-8 px-2.5 text-[12px] border border-gray-200 rounded bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Tax Rate (%)</label>
                            <select
                              value={li.taxRate}
                              onChange={(e) => updateGstLineItem(li.id, "taxRate", e.target.value)}
                              className="w-full h-8 px-2.5 text-[12px] border border-gray-200 rounded bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 cursor-pointer"
                            >
                              <option value="">Select</option>
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">HSN/SAC Code</label>
                            <input
                              type="text"
                              value={li.hsnSac}
                              onChange={(e) => updateGstLineItem(li.id, "hsnSac", e.target.value)}
                              placeholder="e.g., 9992"
                              className="w-full h-8 px-2.5 text-[12px] border border-gray-200 rounded bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addGstLineItem}
                    className="mt-2 text-[12px] text-[#528ff0] hover:text-[#4580e0] font-medium"
                  >
                    + Add another item
                  </button>
                </div>

                {/* Tax calculation note — below items list */}
                <div className="bg-amber-50 border border-amber-100 rounded-md px-3 py-2 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800">
                    <span className="font-medium">Tax rate will be auto-calculated</span> based on the customer's
                    billing address and your registered business address (CGST+SGST for intra-state, IGST for
                    inter-state).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Show Customer's Information on Receipt — collapsible dropdown */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">Customer Information on Receipt</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  Email, Phone{customerFields.name || customerFields.pan ? ` + ${[customerFields.name && "Name", customerFields.pan && "PAN"].filter(Boolean).join(", ")}` : ""}
                </span>
              </div>
              {showCustomerInfo ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {showCustomerInfo && (
              <div className="px-4 py-3 border-t border-gray-100 space-y-3">
                {/* Additional fields */}
                <div>
                  <p className="text-[11px] text-gray-500 mb-2">Additional fields on receipt:</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {([
                      { key: "name" as const, label: "Customer Name" },
                      { key: "pan" as const, label: "PAN Number" },
                    ]).map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customerFields[key]}
                          onChange={() => toggleCustomerField(key)}
                          className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-[12px] text-gray-600">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Default fields — always included */}
                <div>
                  <p className="text-[11px] text-gray-400 mb-1.5 font-medium">Always included</p>
                  <div className="flex items-center gap-2">
                    {["Email Address", "Phone Number"].map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500"
                      >
                        <svg className="h-2.5 w-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Show Billing Details on Receipt */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showBillingDetails}
                onChange={(e) => setShowBillingDetails(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                  Show 80G Details on Receipt <span className="text-gray-400 text-xs cursor-help" title="Include 80G tax exemption details on the receipt for donors">ⓘ</span>
                </span>
              </div>
            </label>
            {showBillingDetails && (
              <div className="ml-7 mt-2">
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  + Add your Billing details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#1a56db] text-white text-sm font-medium rounded-md hover:bg-[#1648c0] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
