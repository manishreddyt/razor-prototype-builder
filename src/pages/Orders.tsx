import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, Filter, X, ChevronLeft, ChevronRight, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Order, OrderStatus } from "@/types/orders";
import { getOrders } from "@/lib/orderStorage";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";
import { toast } from "@/hooks/use-toast";

const statusClass: Record<OrderStatus, string> = {
  pending: "blade-badge",
  confirmed: "blade-badge-info",
  processing: "blade-badge-info",
  shipped: "blade-badge-warning",
  delivered: "blade-badge-paid",
  cancelled: "blade-badge-cancelled",
  refunded: "blade-badge-cancelled",
};

const statusTabs: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const Orders = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    // For demo: load from all websites (in production, filter by current user's websites)
    const allOrders: Order[] = [];
    const websites = JSON.parse(localStorage.getItem("smart-page-sites") || "[]");

    websites.forEach((site: any) => {
      const siteOrders = getOrders(site.id);
      allOrders.push(...siteOrders);
    });

    // Sort by creation date (newest first)
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(allOrders);
  };

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const matchSearch = !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    return matchTab && matchSearch && matchPayment;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const exportToCSV = () => {
    const headers = ["Order Number", "Customer Name", "Email", "Phone", "Items", "Total", "Status", "Payment Status", "Created At"];
    const rows = filtered.map(o => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.customerPhone || "",
      o.items.length,
      o.total,
      o.status,
      o.paymentStatus,
      o.createdAt,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${filtered.length} orders to CSV`,
    });
  };

  const handleStatusUpdate = () => {
    loadOrders(); // Reload orders after status update
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all e-commerce orders from Smart Pages</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={exportToCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: orders.length, color: "text-primary" },
            { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "text-muted-foreground" },
            { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, color: "text-green-600" },
            { label: "Cancelled", value: orders.filter(o => o.status === "cancelled" || o.status === "refunded").length, color: "text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className="blade-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "blade-filter-chip-active" : "blade-filter-chip"}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number, email, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || paymentFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setPaymentFilter("all"); }}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="blade-card p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {orders.length === 0
                ? "Orders from your Smart Pages with e-commerce products will appear here."
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="blade-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="blade-table-header px-5 py-3 text-left">Order Number</th>
                    <th className="blade-table-header px-5 py-3 text-left">Customer</th>
                    <th className="blade-table-header px-5 py-3 text-left">Items</th>
                    <th className="blade-table-header px-5 py-3 text-left">Total</th>
                    <th className="blade-table-header px-5 py-3 text-left">Payment</th>
                    <th className="blade-table-header px-5 py-3 text-left">Status</th>
                    <th className="blade-table-header px-5 py-3 text-left">Created On</th>
                    <th className="blade-table-header px-5 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-3 font-medium text-primary">{order.orderNumber}</td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-foreground font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                      <td className="px-5 py-3 text-foreground font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-3">
                        <span className={
                          order.paymentStatus === "paid" ? "blade-badge-paid" :
                          order.paymentStatus === "failed" ? "blade-badge-cancelled" :
                          order.paymentStatus === "refunded" ? "blade-badge-warning" :
                          "blade-badge"
                        }>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusSelect
                          order={order}
                          onStatusUpdate={handleStatusUpdate}
                          compact
                        />
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-3">
                        <button className="text-muted-foreground hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-5 py-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {filtered.length} of {filtered.length}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs">Page 1</span>
                <Button variant="outline" size="sm" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </DashboardLayout>
  );
};

export default Orders;
