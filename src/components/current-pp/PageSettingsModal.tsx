import { useState } from "react";
import { Settings, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PageSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const CurrentPageSettingsModal = ({ open, onClose }: PageSettingsModalProps) => {
  const [pageUrl, setPageUrl] = useState("https://pages.razorpay.com/");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [noExpiry, setNoExpiry] = useState(true);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [afterPaymentAction, setAfterPaymentAction] = useState<"message" | "redirect">("message");
  const [showCustomMessage, setShowCustomMessage] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("");

  if (!open) return null;

  const handleSave = () => {
    toast.success("Page settings saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Page Settings</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* URL of this page */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">URL of this page</label>
            <Input
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              className="text-sm h-9"
              placeholder="https://pages.razorpay.com/"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Theme</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Dark</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Light</span>
              </label>
            </div>
          </div>

          {/* Page Expiry Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Page Expiry Date</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noExpiry}
                  onChange={(e) => setNoExpiry(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">No Expiry</span>
              </label>

              {!noExpiry && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="text-sm h-9 flex-1"
                    placeholder="DD/MM/YYYY"
                  />
                  <Input
                    type="time"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    className="text-sm h-9 w-28"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action after successful payment */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Action after successful payment?
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCustomMessage}
                  onChange={(e) => {
                    setShowCustomMessage(e.target.checked);
                    if (e.target.checked) setAfterPaymentAction("message");
                  }}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Show custom message</span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={afterPaymentAction === "redirect"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAfterPaymentAction("redirect");
                      setShowCustomMessage(false);
                    } else {
                      setAfterPaymentAction("message");
                    }
                  }}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-gray-600">Redirect to your website</span>
                  {afterPaymentAction === "redirect" && (
                    <Input
                      value={redirectUrl}
                      onChange={(e) => setRedirectUrl(e.target.value)}
                      className="text-sm h-8 mt-2 w-full"
                      placeholder="https://yourwebsite.com/thank-you"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Get Hyperlink Button */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Get Hyperlink Button
            </label>
            <p className="text-xs text-gray-400">
              Embed a payment button on your website that links to this page.
            </p>
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
