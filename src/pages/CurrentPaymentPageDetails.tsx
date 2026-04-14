import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Copy, Share, Settings, Edit, Search, Download, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const pageDataMap: Record<string, {
  id: string; pageId: string; title: string; pageUrl: string; status: "Active" | "Inactive";
  createdBy: string; createdByEmail: string; createdOn: string; expiresOn: string;
  items: { name: string; revenue: string; price: string; unitsSold: number }[];
  transactions: { paymentId: string; amount: string; customerPhone: string; customerEmail: string; createdAt: string; status: string }[];
  totalPayments: number; totalRevenue: string;
}> = {
  pp_c01: {
    id: "pp_c01", pageId: "pl_Sbi0FDr3fuMJ5Z", title: "Online Course",
    pageUrl: "https://rzp.io/rzp/z4NuPQgY", status: "Active",
    createdBy: "Manish Reddy", createdByEmail: "manishreddy.t+321@razorpay.com",
    createdOn: "10 Apr 2026", expiresOn: "No Expiry",
    items: [
      { name: "Amount", revenue: "₹10.00", price: "₹5.00", unitsSold: 2 },
      { name: "Item 2", revenue: "₹4.00", price: "₹2.00", unitsSold: 2 },
    ],
    transactions: [
      { paymentId: "pay_Sctw8xT0RnJJku", amount: "₹ 7.00", customerPhone: "+91 9920 972082", customerEmail: "manishredditirumala@gmail.com", createdAt: "Apr 13, 2026", status: "Captured" },
      { paymentId: "pay_SctqObLqSowYkp", amount: "₹ 7.00", customerPhone: "+91 9920 972082", customerEmail: "manishredditirumala@gmail.com", createdAt: "Apr 13, 2026", status: "Captured" },
    ],
    totalPayments: 2, totalRevenue: "₹ 14.00",
  },
  pp_c02: {
    id: "pp_c02", pageId: "pl_RxK9mWq2abNP7Y", title: "Online Course",
    pageUrl: "https://rzp.io/rzp/80FLNRG", status: "Active",
    createdBy: "Manish Reddy", createdByEmail: "manishreddy.t+321@razorpay.com",
    createdOn: "28 Mar 2026", expiresOn: "No Expiry",
    items: [{ name: "Amount", revenue: "₹0.00", price: "₹0.00", unitsSold: 0 }],
    transactions: [], totalPayments: 0, totalRevenue: "₹ 0.00",
  },
};

type TxnTab = "all" | "authorized" | "captured" | "refunded" | "failed";

const CurrentPaymentPageDetails = () => {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId: string }>();
  const [txnTab, setTxnTab] = useState<TxnTab>("all");
  const [searchPayment, setSearchPayment] = useState("");
  const [showMore, setShowMore] = useState(false);

  const data = pageDataMap[pageId || ""];

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p>Payment page not found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/payment-pages-current")}>← Back to All Payment Pages</Button>
        </div>
      </DashboardLayout>
    );
  }

  const copyUrl = () => { navigator.clipboard.writeText(data.pageUrl); toast.success("URL copied to clipboard!"); };
  const filteredTxns = data.transactions.filter((t) => txnTab === "all" || t.status.toLowerCase() === txnTab);

  return (
    <DashboardLayout>
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          <Button variant="ghost" size="sm" onClick={() => navigate("/payment-pages-current")}>
            <ChevronLeft className="h-4 w-4 mr-1" />All Payment Pages
          </Button>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">{data.title}</span>
        </div>

        {/* Title + Actions */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => toast.info("Share coming soon")}><Share className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={copyUrl}><Copy className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => toast.info("Settings coming soon")}><Settings className="h-4 w-4" /></Button>
            <Button size="sm" onClick={() => navigate("/payment-pages-current/create")}><Edit className="h-4 w-4 mr-1" />Edit Page</Button>
          </div>
        </div>

        {/* Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6 flex gap-6">
            <div className="flex-1">
              {[
                { label: "Page URL", value: <div className="flex items-center gap-2"><span className="text-sm text-primary">{data.pageUrl}</span><Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyUrl}><Copy className="h-3 w-3" /></Button></div> },
                { label: "Page Status", value: <div className="flex items-center gap-3"><Badge className="bg-green-100 text-green-800">{data.status}</Badge><Button variant="ghost" size="sm" className="h-6" onClick={() => toast.info("Deactivate coming soon")}>Deactivate</Button></div> },
                { label: "Payment Page ID", value: <span className="text-sm">{data.pageId}</span> },
                { label: "Created by", value: <div><p className="text-sm font-medium">{data.createdBy}</p><p className="text-xs text-muted-foreground">{data.createdByEmail}</p></div> },
                { label: "Created On", value: <span className="text-sm">{data.createdOn}</span> },
                { label: "Expires On", value: <div className="flex items-center gap-2"><span className="text-sm">{data.expiresOn}</span><button className="text-sm text-primary hover:underline" onClick={() => toast.info("Change expiry coming soon")}>Change</button></div> },
              ].map((row, i) => (
                <div key={i} className="flex mb-4">
                  <div className="w-[140px] shrink-0"><span className="text-sm text-muted-foreground">{row.label}</span></div>
                  {row.value}
                </div>
              ))}
            </div>
            <div className="w-[320px] shrink-0 flex flex-col gap-3">
              {data.items.slice(0, showMore ? data.items.length : 2).map((item, idx) => (
                <div key={idx} className="border rounded-md p-4">
                  <p className="text-sm font-semibold mb-3">{item.name}</p>
                  <div className="flex justify-between items-end">
                    <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-sm font-medium">{item.revenue}</p></div>
                    <div><p className="text-xs text-muted-foreground">Price</p><p className="text-sm font-medium">{item.price}</p></div>
                    <div><p className="text-xs text-muted-foreground">Units Sold</p><p className="text-sm font-medium">{item.unitsSold}</p></div>
                    <button className="text-sm text-primary hover:underline" onClick={() => toast.info("Update Stock coming soon")}>Update Stock</button>
                  </div>
                </div>
              ))}
              {data.items.length > 2 && !showMore && (
                <div className="text-center"><button className="text-sm text-primary hover:underline" onClick={() => setShowMore(true)}>Show More</button></div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-5">
                <h3 className="text-base font-semibold">Transactions</h3>
                <span className="text-sm text-muted-foreground">Total Payments <strong>{data.totalPayments}</strong></span>
                <span className="text-sm text-muted-foreground">Total revenue <strong>{data.totalRevenue}</strong></span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast.info("Download report coming soon")}>
                <Download className="h-4 w-4 mr-1" />Download Report
              </Button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex">
                {(["all", "authorized", "captured", "refunded", "failed"] as TxnTab[]).map((tab) => (
                  <button key={tab} className={`px-4 py-2 text-sm font-medium border-b-2 bg-transparent border-none cursor-pointer ${txnTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setTxnTab(tab)} style={{ borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: txnTab === tab ? "hsl(var(--primary))" : "transparent" }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="w-60 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by Payment ID" value={searchPayment} onChange={(e) => setSearchPayment(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>

            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">Status: All</span>
            </div>

            {filteredTxns.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment Id</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created At</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-3 text-primary">{row.paymentId}</td>
                        <td className="px-4 py-3">{row.amount}</td>
                        <td className="px-4 py-3"><div>{row.customerPhone}</div><div className="text-xs text-muted-foreground">{row.customerEmail}</div></td>
                        <td className="px-4 py-3">{row.createdAt}</td>
                        <td className="px-4 py-3"><Badge className="bg-green-100 text-green-800">{row.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t flex justify-center">
                  <span className="text-xs text-muted-foreground">Showing 1 - {filteredTxns.length}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center"><p className="text-sm text-muted-foreground">No transactions yet</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CurrentPaymentPageDetails;
