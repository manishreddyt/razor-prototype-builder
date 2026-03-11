import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order, OrderStatus } from "@/types/orders";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { Button } from "@/components/ui/button";
import { Download, MapPin, CreditCard, Package, Truck, CheckCircle2, Mail, Printer, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const statusClass: Record<OrderStatus, string> = {
  pending: "blade-badge",
  confirmed: "blade-badge-info",
  processing: "blade-badge-info",
  shipped: "blade-badge-warning",
  delivered: "blade-badge-paid",
  cancelled: "blade-badge-cancelled",
  refunded: "blade-badge-cancelled",
};

export const OrderDetailModal = ({ order, onClose, onStatusUpdate }: OrderDetailModalProps) => {
  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const downloadInvoice = () => {
    // Generate simple invoice text
    const invoice = `
INVOICE
Order Number: ${order.orderNumber}
Date: ${formatDate(order.createdAt)}

Customer Details:
${order.customerName}
${order.customerEmail}
${order.customerPhone || ""}

Items:
${order.items.map(item => `${item.productName} x${item.quantity} - ${formatCurrency(item.subtotal)}`).join("\n")}

Subtotal: ${formatCurrency(order.subtotal)}
Shipping: ${formatCurrency(order.shippingCost)}
Tax: ${formatCurrency(order.tax)}
Discount: ${formatCurrency(order.discount)}
Total: ${formatCurrency(order.total)}

Payment Status: ${order.paymentStatus}
Order Status: ${order.status}
    `.trim();

    const blob = new Blob([invoice], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Invoice downloaded",
      description: `Invoice for ${order.orderNumber} has been downloaded.`,
    });
  };

  const sendEmailToCustomer = () => {
    // In production, this would call an API to send email
    toast({
      title: "Email sent",
      description: `Order confirmation email sent to ${order.customerEmail}`,
    });
  };

  const printShippingLabel = () => {
    // In production, this would generate and print a shipping label
    toast({
      title: "Printing shipping label",
      description: `Shipping label for ${order.orderNumber} is being prepared.`,
    });
  };

  const initiateRefund = () => {
    // In production, this would call Razorpay refund API
    if (order.paymentStatus !== "paid") {
      toast({
        title: "Cannot refund",
        description: "Only paid orders can be refunded.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Refund initiated",
      description: `Refund of ${formatCurrency(order.total)} initiated for ${order.orderNumber}`,
    });
  };

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-3">
            Order Details
            <span className="text-sm font-normal text-muted-foreground">{order.orderNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(order.total)}</p>
              <p className="text-sm text-muted-foreground mt-1">Created on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              <span className={statusClass[order.status]}>{order.status}</span>
              <span className={
                order.paymentStatus === "paid" ? "blade-badge-paid" :
                order.paymentStatus === "failed" ? "blade-badge-cancelled" :
                order.paymentStatus === "refunded" ? "blade-badge-warning" :
                "blade-badge"
              }>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="blade-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Name</p>
                <p className="text-foreground font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-foreground font-medium">{order.customerEmail}</p>
              </div>
              {order.customerPhone && (
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="text-foreground font-medium">{order.customerPhone}</p>
                </div>
              )}
              {order.paymentId && (
                <div>
                  <p className="text-muted-foreground text-xs">Payment ID</p>
                  <p className="text-foreground font-medium text-xs">{order.paymentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="blade-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">Variant: {item.variantName}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{formatCurrency(order.shippingCost)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="blade-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h3>
              <div className="text-sm text-foreground">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p className="mt-2">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.landmark && (
                  <p className="text-muted-foreground mt-1">Landmark: {order.shippingAddress.landmark}</p>
                )}
              </div>
            </div>
          )}

          {/* Tracking Info */}
          {(order.trackingNumber || order.courierPartner) && (
            <div className="blade-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Tracking Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {order.courierPartner && (
                  <div>
                    <p className="text-muted-foreground text-xs">Courier Partner</p>
                    <p className="text-foreground font-medium">{order.courierPartner}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <p className="text-muted-foreground text-xs">Tracking Number</p>
                    <p className="text-foreground font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="blade-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Order Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground font-medium">{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="text-foreground font-medium">{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipped</span>
                  <span className="text-foreground font-medium">{formatDate(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="text-foreground font-medium">{formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(order.notes || order.internalNotes) && (
            <div className="blade-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Notes</h3>
              {order.notes && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Notes</p>
                  <p className="text-sm text-foreground mt-1">{order.notes}</p>
                </div>
              )}
              {order.internalNotes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Internal Notes</p>
                  <p className="text-sm text-foreground mt-1">{order.internalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <OrderStatusSelect order={order} onStatusUpdate={onStatusUpdate} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadInvoice}>
                <Download className="h-3.5 w-3.5" /> Download Invoice
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={sendEmailToCustomer}>
                <Mail className="h-3.5 w-3.5" /> Email Customer
              </Button>
              {order.shippingAddress && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={printShippingLabel}>
                  <Printer className="h-3.5 w-3.5" /> Print Label
                </Button>
              )}
              {order.paymentStatus === "paid" && order.status !== "refunded" && (
                <Button variant="outline" size="sm" className="gap-1.5 text-red-600 hover:text-red-700" onClick={initiateRefund}>
                  <RefreshCcw className="h-3.5 w-3.5" /> Initiate Refund
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
