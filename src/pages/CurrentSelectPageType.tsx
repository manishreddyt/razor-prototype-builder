import { useNavigate } from "react-router-dom";
import { X, ArrowRight, ShoppingBag, FileText } from "lucide-react";
import { toast } from "sonner";

const CurrentSelectPageType = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a56db] flex flex-col">
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate("/payment-pages-current")}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Header */}
      <div className="text-center pt-4 pb-10">
        <h1 className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
          <span className="text-xl">📄</span>
          Select page of your choice
        </h1>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-start justify-center gap-8 px-8 pb-16">
        {/* Payment Page Card */}
        <div className="bg-white rounded-xl shadow-2xl w-[420px] overflow-hidden">
          {/* Preview image area */}
          <div className="p-5 pb-3">
            <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg h-56 relative overflow-hidden flex items-center justify-center">
              {/* Mock page preview */}
              <div className="absolute inset-4 flex gap-3">
                <div className="flex-1 bg-white/10 backdrop-blur rounded-md p-3">
                  <div className="w-16 h-3 bg-white/30 rounded mb-2"></div>
                  <div className="w-full h-2 bg-white/20 rounded mb-1.5"></div>
                  <div className="w-3/4 h-2 bg-white/20 rounded mb-1.5"></div>
                  <div className="w-1/2 h-2 bg-white/20 rounded mb-3"></div>
                  <div className="w-24 h-6 bg-green-500/60 rounded"></div>
                </div>
                <div className="w-36 bg-white/10 backdrop-blur rounded-md p-3">
                  <div className="w-full h-3 bg-white/30 rounded mb-2"></div>
                  <div className="space-y-2">
                    <div className="w-full h-6 bg-white/15 rounded"></div>
                    <div className="w-full h-6 bg-white/15 rounded"></div>
                    <div className="w-full h-8 bg-blue-500/50 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <span className="text-white/50 text-xs">Preview Mockup</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment page</h2>
            <p className="text-sm text-gray-500 mb-1">
              Setup your own custom branded page. Collect payments for:
            </p>
            <p className="text-xs text-gray-400 mb-4">
              ✓ Events & tickets &nbsp; ✓ Donations &nbsp; ✓ Fees &nbsp; ✓ Courses &nbsp; & more
            </p>
            <button
              onClick={() => navigate("/payment-pages-current/create")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a56db] text-white text-sm font-medium rounded-md hover:bg-[#1648c0] transition-colors"
            >
              Select Payment page <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Razorpay Webstore Card */}
        <div className="bg-white rounded-xl shadow-2xl w-[420px] overflow-hidden">
          {/* Preview image area */}
          <div className="p-5 pb-3">
            <div className="bg-gray-50 rounded-lg h-56 relative overflow-hidden flex items-center justify-center border border-gray-100">
              {/* Mock store preview */}
              <div className="absolute inset-4">
                <div className="w-32 h-3 bg-gray-200 rounded mb-3"></div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-md border border-gray-100 p-2 shadow-sm">
                      <div className="w-full h-16 bg-gray-100 rounded mb-1.5"></div>
                      <div className="w-3/4 h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="w-1/2 h-2 bg-gray-150 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="text-gray-400 text-xs">Catalogue Preview</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">Razorpay Webstore</h2>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded">Beta</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              Showcase products on your online Razorpay Webstore and start accepting orders.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Add multiple images and detailed descriptions for your products & deliver...
            </p>
            <button
              onClick={() => toast.info("Razorpay Webstore coming soon")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" /> Explore Webstore
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar with category links */}
      <div className="bg-[#0f3a99] py-3 px-8 flex items-center justify-center gap-6">
        {["Collect Payments", "Webstore"].map((label) => (
          <button
            key={label}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurrentSelectPageType;
