import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";

const AccountSettings = () => {
  const navigate = useNavigate();

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
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">MR</div>
              <div>
                <h2 className="text-lg font-semibold">Manish Reddy</h2>
                <p className="text-sm text-muted-foreground">Owner</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Merchant ID</span>
                  <span className="text-sm font-medium">RoOR1GZ6pOgE14</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyMerchantId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {[
                { label: "Phone number", value: "+91 9920 972082" },
                { label: "Login email", value: "manishreddy.t+321@razorpay.com" },
                { label: "Password", value: "••••••••" },
              ].map((item) => (
                <div key={item.label} className="flex">
                  <span className="w-36 text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.value}</span>
                    <button className="text-sm text-primary hover:underline" onClick={() => toast.info("Edit coming soon")}>Edit</button>
                  </div>
                </div>
              ))}
              <div className="flex">
                <span className="w-36 text-sm text-muted-foreground">2-step verification</span>
                <button className="text-sm text-primary hover:underline" onClick={() => toast.info("2FA settings coming soon")}>Enable</button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">Account and product settings</h2>
          <button className="text-sm text-primary hover:underline" onClick={() => toast.info("Documentation coming soon")}>Documentation</button>
        </div>

        <div className="flex gap-5 flex-wrap">
          {[
            { icon: "💳", title: "Payment methods", bg: "bg-primary/10", links: ["Cards", "UPI/QR", "Netbanking", "EMI", "Wallet", "Pay Later", "International payments"] },
            { icon: "🌐", title: "Website and app settings", bg: "bg-green-100", links: ["Business website detail", "API Keys", "Webhooks", "Applications"] },
            { icon: "🏢", title: "Business settings", bg: "bg-yellow-100", links: ["GST details", { label: "Receipt & Invoice Settings", action: () => navigate("/account-settings/receipts") }, "Business details", "Bank account"] },
            { icon: "💰", title: "Payments and refunds", bg: "bg-blue-100", links: ["Payment capture settings", "Refund settings", "Flash checkout", "Checkout customisation"] },
          ].map((card) => (
            <div key={card.title} className="w-[340px]">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-md ${card.bg} flex items-center justify-center text-sm`}>{card.icon}</div>
                    <h3 className="font-semibold">{card.title}</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {card.links.map((link) => {
                      const label = typeof link === "string" ? link : link.label;
                      const onClick = typeof link === "string" ? () => toast.info("Coming soon") : link.action;
                      return (
                        <button key={label} className="text-sm text-primary hover:underline text-left" onClick={onClick}>{label}</button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
