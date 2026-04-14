import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Pencil, GripVertical, Trash2, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Image, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { CurrentPaymentReceiptsModal } from "@/components/current-pp/PaymentReceiptsModal";
import { CurrentPageSettingsModal } from "@/components/current-pp/PageSettingsModal";

const CurrentCreatePaymentPage = () => {
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("+91 (IN)");
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);

  // Payment form fields
  const [paymentFields, setPaymentFields] = useState([
    { id: "f1", label: "Amount", type: "price", rate: "", removable: false },
    { id: "f2", label: "Email", type: "input", rate: "", removable: false },
    { id: "f3", label: "Phone", type: "input", rate: "", removable: true },
  ]);

  const addField = (type: "input" | "price") => {
    const newField = {
      id: `f${Date.now()}`,
      label: type === "input" ? "New Field" : "Price Field",
      type,
      rate: "",
      removable: true,
    };
    setPaymentFields([...paymentFields, newField]);
  };

  const updateFieldRate = (id: string, rate: string) => {
    setPaymentFields(paymentFields.map((f) => (f.id === id ? { ...f, rate } : f)));
  };

  const removeField = (id: string) => {
    setPaymentFields(paymentFields.filter((f) => f.id !== id));
  };

  const handlePublish = () => {
    if (!pageTitle.trim()) {
      toast.error("Please enter a page title");
      return;
    }
    toast.success("Payment page created and published!");
    setTimeout(() => navigate(`/payment-pages-current/published?title=${encodeURIComponent(pageTitle)}`), 800);
  };

  return (
    <div className="min-h-screen bg-[#f0f1f5] flex flex-col">
      {/* Top bar — matches Razorpay's dark navy header */}
      <div className="bg-[#3b4a6b] h-[50px] flex items-center justify-between px-5 shadow-sm">
        <h1 className="text-white text-[13px] font-medium tracking-[0.2px]">Create New Payment Page</h1>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowReceiptsModal(true)}
            className="px-3.5 py-[6px] bg-transparent border border-white/40 text-white text-[12px] font-medium rounded hover:bg-white/10 transition-colors"
          >
            Payment Receipts
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3.5 py-[6px] bg-transparent border border-white/40 text-white text-[12px] font-medium rounded hover:bg-white/10 transition-colors"
          >
            Page Settings
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-[6px] bg-[#528ff0] text-white text-[12px] font-semibold rounded hover:bg-[#4580e0] transition-colors"
          >
            Create and Publish Page
          </button>
          <button
            onClick={() => navigate("/payment-pages-current")}
            className="text-white/60 hover:text-white transition-colors ml-1"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 flex justify-center py-8 px-4 gap-6">
        {/* Left: Page editor card */}
        <div className="w-[520px] bg-white rounded shadow-sm border border-gray-200/80">
          <div className="p-8 pb-6">
            {/* Business logo area */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6b8dd6] to-[#3b5cb8] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                W
              </div>
              <span className="text-[13px] font-semibold text-gray-800 uppercase tracking-wider">
                WEALTHJOY TECHNOLOGIES
              </span>
            </div>

            {/* Page title */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter page title here"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full text-[22px] font-light text-gray-800 placeholder:text-gray-300 border-none outline-none bg-transparent leading-tight"
              />
              <div className="h-[2px] w-10 bg-[#528ff0] mt-2"></div>
            </div>

            {/* Add Goal Tracker */}
            <div className="mb-4">
              <button className="text-[13px] text-[#528ff0] hover:text-[#4580e0] font-medium flex items-center gap-1">
                + Add a Goal Tracker
                <span className="text-[9px] text-[#528ff0] bg-blue-50 px-1 py-px rounded-sm ml-0.5">ⓘ</span>
                <span className="ml-1 px-1.5 py-[1px] bg-[#e6f4ea] text-[#1e8e3e] text-[9px] font-bold rounded-sm uppercase">new</span>
              </button>
            </div>

            {/* Description */}
            <div className="mb-4">
              <textarea
                placeholder="Enter page description"
                value={pageDescription}
                onChange={(e) => setPageDescription(e.target.value)}
                className="w-full text-[13px] text-gray-500 placeholder:text-gray-300 border-none outline-none bg-transparent resize-none min-h-[50px] leading-relaxed"
                rows={2}
              />
            </div>

            {/* Rich text toolbar */}
            <div className="flex items-center gap-0.5 mb-4 border-t border-b border-gray-100 py-1.5">
              <select className="text-[11px] text-gray-500 border-none outline-none bg-transparent mr-1 cursor-pointer">
                <option>Normal</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
              </select>
              <div className="w-px h-3.5 bg-gray-200 mx-1"></div>
              <button className="p-1 hover:bg-gray-50 rounded"><Bold className="h-3 w-3 text-gray-400" /></button>
              <button className="p-1 hover:bg-gray-50 rounded"><Italic className="h-3 w-3 text-gray-400" /></button>
              <button className="p-1 hover:bg-gray-50 rounded"><Underline className="h-3 w-3 text-gray-400" /></button>
              <div className="w-px h-3.5 bg-gray-200 mx-1"></div>
              <button className="p-1 hover:bg-gray-50 rounded"><List className="h-3 w-3 text-gray-400" /></button>
              <button className="p-1 hover:bg-gray-50 rounded"><ListOrdered className="h-3 w-3 text-gray-400" /></button>
              <div className="w-px h-3.5 bg-gray-200 mx-1"></div>
              <button className="p-1 hover:bg-gray-50 rounded"><AlignLeft className="h-3 w-3 text-gray-400" /></button>
              <button className="p-1 hover:bg-gray-50 rounded"><AlignCenter className="h-3 w-3 text-gray-400" /></button>
              <button className="p-1 hover:bg-gray-50 rounded"><AlignRight className="h-3 w-3 text-gray-400" /></button>
              <div className="w-px h-3.5 bg-gray-200 mx-1"></div>
              <button className="p-1 hover:bg-gray-50 rounded"><Link2 className="h-3 w-3 text-gray-400" /></button>
              <button className="p-1 hover:bg-gray-50 rounded"><Image className="h-3 w-3 text-gray-400" /></button>
            </div>

            {/* Social media share icons */}
            <div className="mb-6">
              <button className="text-[13px] text-[#528ff0] hover:text-[#4580e0] font-medium">
                + Add social media share icons
              </button>
            </div>

            {/* Contact Us section */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Contact Us:</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-gray-400">✉</span>
                  <input
                    type="email"
                    placeholder="Enter support email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="flex-1 text-[13px] text-gray-500 placeholder:text-gray-300 border-none outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-gray-400">📞</span>
                  <input
                    type="text"
                    placeholder="Enter support phone"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="flex-1 text-[13px] text-gray-500 placeholder:text-gray-300 border-none outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Details panel */}
        <div className="w-[320px]">
          <div className="bg-white rounded shadow-sm border border-gray-200/80 p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Payment Details</h2>
            <div className="h-[2px] w-8 bg-[#528ff0] mb-5"></div>

            {/* Payment fields */}
            <div className="space-y-4">
              {paymentFields.map((field) => (
                <div key={field.id} className="group">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] text-gray-700 font-medium">{field.label}</span>
                        <div className="flex items-center gap-1.5">
                          {field.type === "price" && (
                            <span className="text-[10px] text-[#528ff0] font-medium">↗ Price field</span>
                          )}
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        disabled
                        className="w-full h-[34px] border border-gray-200 rounded bg-[#fafbfc] text-sm px-3"
                      />
                    </div>
                    {field.removable && (
                      <button
                        onClick={() => removeField(field.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* GST Address Fields — shown when GST Receipt is enabled */}
            {gstEnabled && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">GST Invoice Fields</span>
                  <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">Required</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">Customer Name</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Customer Name"
                      className="w-full h-[34px] border border-gray-200 rounded bg-[#fafbfc] text-sm px-3 placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">Billing Address</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Address Line"
                      className="w-full h-[34px] border border-gray-200 rounded bg-[#fafbfc] text-sm px-3 placeholder:text-gray-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-gray-500 mb-1 block">City</label>
                      <input
                        type="text"
                        disabled
                        placeholder="City"
                        className="w-full h-[34px] border border-gray-200 rounded bg-[#fafbfc] text-sm px-3 placeholder:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 mb-1 block">Pincode</label>
                      <input
                        type="text"
                        disabled
                        placeholder="Pincode"
                        className="w-full h-[34px] border border-gray-200 rounded bg-[#fafbfc] text-sm px-3 placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">State</label>
                    <select
                      disabled
                      className="w-full h-[34px] border border-gray-200 rounded bg-[#fafbfc] text-sm px-3 text-gray-400"
                    >
                      <option value="">Select State</option>
                      {[
                        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
                        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                        "Uttar Pradesh", "Uttarakhand", "West Bengal",
                        "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
                        "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
                      ].map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">
                      Customer GST Number <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="e.g., 29ABCDE1234F1Z5"
                      className="w-full h-[34px] border border-gray-200 rounded bg-[#fafbfc] text-sm px-3 placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add field buttons */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-[11px] text-gray-400">Add new</span>
              <button
                onClick={() => addField("input")}
                className="text-[12px] text-[#528ff0] hover:text-[#4580e0] font-medium flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Input field
              </button>
              <button
                onClick={() => addField("price")}
                className="text-[12px] text-[#528ff0] hover:text-[#4580e0] font-medium flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Price field
              </button>
            </div>

            {/* Payment methods & Pay button */}
            <div className="mt-8 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="h-[18px] px-1.5 bg-gray-100 rounded-sm flex items-center">
                  <span className="text-[8px] font-semibold text-gray-500 tracking-wide">UPI</span>
                </div>
                <div className="h-[18px] px-1.5 bg-[#1a1f71]/5 rounded-sm flex items-center">
                  <span className="text-[8px] font-bold text-[#1a1f71] tracking-wide">VISA</span>
                </div>
                <div className="h-[18px] px-1.5 bg-[#eb001b]/5 rounded-sm flex items-center">
                  <span className="text-[8px] font-bold text-[#eb001b]">Master</span>
                </div>
                <div className="h-[18px] px-1.5 bg-[#097a44]/5 rounded-sm flex items-center">
                  <span className="text-[8px] font-bold text-[#097a44]">RuPay</span>
                </div>
                <div className="h-[18px] px-1.5 bg-[#003087]/5 rounded-sm flex items-center">
                  <span className="text-[8px] font-bold text-[#003087]">PayPal</span>
                </div>
              </div>
              <button className="w-full h-[42px] bg-[#61b44b] text-white font-semibold rounded text-[13px] hover:bg-[#56a343] transition-colors tracking-wide">
                Pay ₹ 0,000.00
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support floating button */}
      <div className="fixed bottom-5 right-5">
        <button
          onClick={() => toast.info("Help & Support coming soon")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3b4a6b] text-white text-[12px] font-medium rounded-lg shadow-lg hover:bg-[#475882] transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Help & Support
        </button>
      </div>

      {/* Modals */}
      <CurrentPaymentReceiptsModal
        open={showReceiptsModal}
        onClose={() => setShowReceiptsModal(false)}
        paymentItems={paymentFields}
        onGstChange={(enabled) => setGstEnabled(enabled)}
      />
      <CurrentPageSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default CurrentCreatePaymentPage;
