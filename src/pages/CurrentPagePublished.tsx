import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Copy, ExternalLink, Check, Mail, ArrowUpRight, BarChart3, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CurrentPaymentReceiptsModal } from "@/components/current-pp/PaymentReceiptsModal";
import { CurrentPageSettingsModal } from "@/components/current-pp/PageSettingsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Top bar */}
      <div className="bg-foreground h-14 flex items-center justify-between px-6">
        <span className="text-sm font-medium text-white">Page Published</span>
        <Button variant="secondary" size="sm" onClick={() => navigate("/payment-pages-current")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 px-8 py-6 max-w-[960px] mx-auto w-full">
        <div className="mb-5">
          <Button variant="ghost" size="sm" onClick={() => navigate("/payment-pages-current/create")}>
            ← EDIT PAGE
          </Button>
        </div>

        {/* Success Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{pageTitle.toUpperCase()}</p>
                <div className="flex items-center gap-2 mb-5">
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                  <h2 className="text-lg font-semibold">Your page is now live!</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Page URL</span>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <div className="px-3 py-2 bg-muted">
                      <span className="text-sm text-primary font-medium">{pageUrl}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyUrl}>
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyAsLink}>Share</Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.info("Customize URL coming soon")}>
                      CUSTOMIZE URL
                    </Button>
                  </div>
                </div>
              </div>
              <div className="ml-8 shrink-0">
                <button className="p-0 bg-transparent border-none cursor-pointer" onClick={() => window.open(pageUrl, "_blank")}>
                  <div className="w-[180px] h-[120px] rounded-md border bg-muted overflow-hidden p-3 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs text-white font-bold">W</span>
                      </div>
                      <span className="text-xs text-muted-foreground">WEALTHJOY</span>
                    </div>
                    <span className="text-xs font-semibold mb-1">{pageTitle}</span>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 bg-muted-foreground/20 rounded w-3/4" />
                        <div className="h-1.5 bg-muted-foreground/20 rounded w-1/2" />
                        <div className="h-1.5 bg-muted-foreground/20 rounded w-2/3" />
                      </div>
                      <div className="w-14 flex flex-col gap-1">
                        <div className="h-1.5 bg-muted-foreground/20 rounded" />
                        <div className="h-1.5 bg-muted-foreground/20 rounded" />
                        <div className="h-3 bg-primary/20 rounded mt-1" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold mb-1">Next Steps for Your Page</h3>
            <div className="h-0.5 w-8 bg-primary mb-5 rounded-full" />

            {/* Receipts */}
            <div className="flex justify-between items-start mb-5 pb-5 border-b">
              <div className="flex-1 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <Mail size={12} className="text-green-700" />
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium">Receipts will be sent automatically</span> to customers after each payment</p>
                  <p className="text-xs text-muted-foreground mt-1">You can customise your receipt by adding customer's information & billing details</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-4 shrink-0" onClick={() => setShowReceiptsModal(true)}>
                Receipt Settings
              </Button>
            </div>

            {/* Page Settings */}
            <div className="flex justify-between items-start">
              <div className="flex-1 flex flex-col gap-3">
                {[
                  { icon: ArrowUpRight, color: "text-blue-700", bg: "bg-blue-100", text: <>
                    <span className="font-medium">Redirect</span> customers to your website after payment
                  </> },
                  { icon: ShoppingCart, color: "text-orange-700", bg: "bg-orange-100", text: <>
                    <span className="font-medium">Create orders on Shiprocket</span> after customer pays on this page
                  </> },
                  { icon: BarChart3, color: "text-purple-700", bg: "bg-purple-100", text: <>
                    <span className="font-medium">Track</span> page usage with Facebook Pixel & Google Analytics
                  </> },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className={`w-5 h-5 rounded-full ${item.bg} flex items-center justify-center shrink-0 mt-1`}>
                      <item.icon size={12} className={item.color} />
                    </div>
                    <p className="text-sm">{item.text}</p>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground/60 ml-8">...and more!</p>
              </div>
              <Button variant="outline" size="sm" className="ml-4 shrink-0" onClick={() => setShowSettingsModal(true)}>
                Page Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help button */}
      <div className="fixed bottom-6 right-6">
        <Button size="sm" onClick={() => toast.info("Help & Support coming soon")}>Help & Support</Button>
      </div>

      <CurrentPaymentReceiptsModal open={showReceiptsModal} onClose={() => setShowReceiptsModal(false)} />
      <CurrentPageSettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
};

export default CurrentPagePublished;
