import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Copy, ExternalLink, Check, Mail, ArrowUpRight, BarChart3, ShoppingCart, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { CurrentPaymentReceiptsModal } from "@/components/current-pp/PaymentReceiptsModal";
import { CurrentPageSettingsModal } from "@/components/current-pp/PageSettingsModal";

const CurrentPagePublished = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageTitle = searchParams.get("title") || "Online Course";
  const [copied, setCopied] = useState(false);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const pageUrl = "https://rzp.io/rzp/WxYhV5PH";

  const copyUrl = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAsLink = () => {
    const html = `<a href="${pageUrl}">${pageTitle}</a>`;
    navigator.clipboard.writeText(html);
    toast.success("HTML link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#f0f3f8] flex flex-col">
      {/* Top bar — same dark bar as editor */}
      <div className="bg-[#2b3a67] h-14 flex items-center justify-between px-6 shadow-sm">
        <h1 className="text-white text-sm font-medium">Page Published</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/payment-pages-current")}
            className="px-4 py-1.5 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-md hover:bg-white/20 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 px-8 py-6 max-w-5xl mx-auto w-full">
        {/* Edit Page link */}
        <div className="mb-5">
          <button
            onClick={() => navigate("/payment-pages-current/create")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← EDIT PAGE
          </button>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            {/* Left side */}
            <div className="flex-1">
              {/* Category tag */}
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {pageTitle.toUpperCase()}
              </div>

              {/* Success message */}
              <div className="flex items-center gap-2 mb-5">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Your page is now live!</h2>
              </div>

              {/* Page URL row */}
              <div className="flex items-center gap-0">
                <label className="text-sm text-gray-500 mr-3 whitespace-nowrap">Page URL</label>
                <div className="flex items-center">
                  <div className="h-9 px-3 flex items-center bg-gray-50 border border-gray-200 rounded-l-md text-sm text-blue-600 font-medium min-w-[200px]">
                    {pageUrl}
                  </div>
                  <button
                    onClick={copyUrl}
                    className="h-9 px-3 flex items-center gap-1.5 border border-l-0 border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={copyAsLink}
                    className="h-9 px-3 flex items-center gap-1.5 border border-l-0 border-gray-200 bg-white text-sm text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>↗ share</span>
                  </button>
                  <button
                    onClick={() => toast.info("Customize URL coming soon")}
                    className="h-9 px-3 flex items-center gap-1.5 border border-l-0 border-gray-200 rounded-r-md bg-white text-sm text-orange-500 font-medium hover:bg-orange-50 transition-colors"
                  >
                    CUSTOMIZE URL
                  </button>
                </div>
              </div>
            </div>

            {/* Right side — Page preview thumbnail */}
            <div className="ml-8 flex-shrink-0">
              <div className="w-[180px] h-[120px] rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shadow-sm relative group cursor-pointer"
                onClick={() => window.open(pageUrl, "_blank")}
              >
                {/* Mock preview of the payment page */}
                <div className="p-3 h-full flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[7px] font-bold">W</div>
                    <span className="text-[7px] text-gray-500 font-medium">WEALTHJOY TECHNOLOGIES</span>
                  </div>
                  <div className="text-[8px] font-semibold text-gray-700 mb-1">{pageTitle}</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-1.5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="w-14 space-y-1">
                      <div className="h-1.5 bg-gray-200 rounded"></div>
                      <div className="h-1.5 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-blue-400 rounded mt-1.5"></div>
                    </div>
                  </div>
                </div>
                {/* Hover overlay with external link icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1.5 shadow-md">
                    <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Next Steps for Your Page</h3>
          <div className="h-0.5 w-8 bg-blue-500 mb-5"></div>

          {/* Section 1: Receipts */}
          <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-start gap-2.5 mb-1.5">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">Receipts will be sent automatically</span> to customers after each payment
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    You can customise your receipt by adding customer's information & Bllg details
                    <span className="inline-flex items-center ml-0.5 text-gray-300 cursor-help" title="More info about billing details">
                      ⓘ
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowReceiptsModal(true)}
              className="ml-4 px-4 py-2 border border-blue-200 rounded-md text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Receipt Settings
            </button>
          </div>

          {/* Section 2: Page Settings */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Redirect */}
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Redirect</span> customers to your website after payment
                </p>
              </div>

              {/* Shiprocket */}
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="h-3 w-3 text-orange-500" />
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Create orders on Shiprocket</span> after customer pays on this page
                </p>
              </div>

              {/* Tracking */}
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-3 w-3 text-purple-600" />
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Track</span> page usage with Facebook Pixel & Google Analytics
                </p>
              </div>

              {/* And more */}
              <p className="text-sm text-gray-400 ml-7.5 pl-[30px]">...and more!</p>
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="ml-4 px-4 py-2 border border-blue-200 rounded-md text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0 self-start"
            >
              Page Settings
            </button>
          </div>
        </div>
      </div>

      {/* Help & Support floating button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => toast.info("Help & Support coming soon")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2b3a67] text-white text-sm font-medium rounded-lg shadow-lg hover:bg-[#364578] transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </button>
      </div>

      {/* Modals */}
      <CurrentPaymentReceiptsModal
        open={showReceiptsModal}
        onClose={() => setShowReceiptsModal(false)}
      />
      <CurrentPageSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default CurrentPagePublished;
