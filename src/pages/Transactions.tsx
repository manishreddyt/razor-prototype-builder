import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, Filter, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const transactions = [
  { id: "pay_QwErTy123456", orderId: "order_AbCdEf7890", method: "UPI", email: "priya@example.com", contact: "+91 98765 43210", amount: "₹12,999.00", fee: "₹305.68", tax: "₹46.56", date: "26 Feb 2026, 10:30 AM", status: "Captured", course: "Full Stack Dev Bootcamp" },
  { id: "pay_AsDfGh234567", orderId: "order_GhIjKl2345", method: "Card", email: "rahul@example.com", contact: "+91 87654 32109", amount: "₹8,499.00", fee: "₹199.73", tax: "₹30.44", date: "25 Feb 2026, 03:15 PM", status: "Captured", course: "UI/UX Design Masterclass" },
  { id: "pay_ZxCvBn345678", orderId: "order_MnOpQr6789", method: "UPI", email: "ananya@example.com", contact: "+91 76543 21098", amount: "₹15,999.00", fee: "₹376.18", tax: "₹57.32", date: "25 Feb 2026, 11:00 AM", status: "Captured", course: "Data Science Fundamentals" },
  { id: "pay_PoIuYt456789", orderId: "order_StUvWx0123", method: "Netbanking", email: "vikram@example.com", contact: "+91 65432 10987", amount: "₹4,999.00", fee: "₹117.52", tax: "₹17.91", date: "24 Feb 2026, 09:45 AM", status: "Failed", course: "Digital Marketing 101" },
  { id: "pay_LkJhGf567890", orderId: "order_YzAbCd4567", method: "UPI", email: "sneha@example.com", contact: "+91 54321 09876", amount: "₹2,999.00", fee: "₹70.53", tax: "₹10.75", date: "24 Feb 2026, 02:30 PM", status: "Captured", course: "Photography Workshop" },
  { id: "pay_MnBvCx678901", orderId: "order_EfGhIj8901", method: "Card", email: "meera@example.com", contact: "+91 43210 98765", amount: "₹6,499.00", fee: "₹152.78", tax: "₹23.28", date: "23 Feb 2026, 05:20 PM", status: "Refunded", course: "Content Writing Mastery" },
  { id: "pay_QaWsEd789012", orderId: "order_KlMnOp2345", method: "Wallet", email: "arjun@example.com", contact: "+91 32109 87654", amount: "₹1,999.00", fee: "₹47.00", tax: "₹7.16", date: "22 Feb 2026, 01:10 PM", status: "Captured", course: "Guitar Basics" },
  { id: "pay_RfTgYh890123", orderId: "order_QrStUv6789", method: "UPI", email: "kavya@example.com", contact: "+91 21098 76543", amount: "₹9,999.00", fee: "₹234.98", tax: "₹35.81", date: "21 Feb 2026, 11:55 AM", status: "Authorized", course: "Machine Learning A-Z" },
];

const statusClass: Record<string, string> = {
  Captured: "blade-badge-paid",
  Failed: "blade-badge-cancelled",
  Refunded: "blade-badge-warning",
  Authorized: "blade-badge-info",
};

const tabs = ["All", "Captured", "Failed", "Refunded", "Authorized"];

const Transactions = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState<typeof transactions[0] | null>(null);

  const filtered = transactions.filter((t) => {
    const matchTab = activeTab === "All" || t.status === activeTab;
    const matchSearch = !searchQuery || t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMethod = methodFilter === "all" || t.method.toLowerCase() === methodFilter;
    return matchTab && matchSearch && matchMethod;
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Transactions</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">View and manage all payment transactions</p>
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-4 sm:gap-6 border-b border-border min-w-max">
            <span className="blade-tab-active whitespace-nowrap">Payments</span>
            <span className="blade-tab whitespace-nowrap">Refunds</span>
            <span className="blade-tab whitespace-nowrap">Disputes</span>
            <span className="blade-tab whitespace-nowrap hidden sm:inline-flex">Downtimes</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "blade-filter-chip-active" : "blade-filter-chip"}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Payment ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="netbanking">Netbanking</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || methodFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setMethodFilter("all"); }} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="blade-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Payment ID</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden lg:table-cell">Order ID</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden sm:table-cell">Method</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden md:table-cell">Email</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Amount</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden lg:table-cell">Fee</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap hidden md:table-cell">Created On</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="blade-table-header px-3 sm:px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => (
                  <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedTxn(txn)}>
                    <td className="px-3 sm:px-5 py-3 font-medium text-primary text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{txn.id}</td>
                    <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{txn.orderId}</td>
                    <td className="px-3 sm:px-5 py-3 text-foreground text-xs sm:text-sm hidden sm:table-cell">{txn.method}</td>
                    <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden md:table-cell truncate max-w-[150px]">{txn.email}</td>
                    <td className="px-3 sm:px-5 py-3 text-foreground font-medium text-xs sm:text-sm whitespace-nowrap">{txn.amount}</td>
                    <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{txn.fee}</td>
                    <td className="px-3 sm:px-5 py-3 text-muted-foreground text-xs sm:text-sm hidden md:table-cell whitespace-nowrap">{txn.date}</td>
                    <td className="px-3 sm:px-5 py-3">
                      <span className={statusClass[txn.status] || "blade-badge"}>{txn.status}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <button className="text-muted-foreground hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-3 sm:px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>Showing 1 - {filtered.length} of {filtered.length}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs">Page 1</span>
              <Button variant="outline" size="sm" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTxn} onOpenChange={() => setSelectedTxn(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTxn && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">{selectedTxn.amount}</span>
                <span className={statusClass[selectedTxn.status] || "blade-badge"}>{selectedTxn.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Payment ID", selectedTxn.id],
                  ["Order ID", selectedTxn.orderId],
                  ["Method", selectedTxn.method],
                  ["Email", selectedTxn.email],
                  ["Contact", selectedTxn.contact],
                  ["Course", selectedTxn.course],
                  ["Fee", selectedTxn.fee],
                  ["Tax", selectedTxn.tax],
                  ["Created", selectedTxn.date],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-foreground font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download Invoice
                </Button>
                {selectedTxn.status === "Captured" && (
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    Issue Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
