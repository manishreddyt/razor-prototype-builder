import { useState } from "react";
import { Order, OrderStatus } from "@/types/orders";
import { updateOrder } from "@/lib/orderStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface OrderStatusSelectProps {
  order: Order;
  onStatusUpdate: () => void;
  compact?: boolean;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const statusClass: Record<OrderStatus, string> = {
  pending: "blade-badge",
  confirmed: "blade-badge-info",
  processing: "blade-badge-info",
  shipped: "blade-badge-warning",
  delivered: "blade-badge-paid",
  cancelled: "blade-badge-cancelled",
  refunded: "blade-badge-cancelled",
};

export const OrderStatusSelect = ({ order, onStatusUpdate, compact = false }: OrderStatusSelectProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  const requiresConfirmation = (newStatus: OrderStatus): boolean => {
    // Require confirmation for cancelled and refunded statuses
    return newStatus === "cancelled" || newStatus === "refunded";
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;

    if (requiresConfirmation(newStatus)) {
      setPendingStatus(newStatus);
      setShowConfirmation(true);
    } else {
      updateStatus(newStatus);
    }
  };

  const updateStatus = (newStatus: OrderStatus) => {
    const updates: Partial<Order> = {
      status: newStatus,
    };

    // Auto-update timestamps based on status
    const now = new Date().toISOString();
    if (newStatus === "shipped" && !order.shippedAt) {
      updates.shippedAt = now;
    } else if (newStatus === "delivered" && !order.deliveredAt) {
      updates.deliveredAt = now;
    }

    // Auto-update payment status
    if (newStatus === "refunded" && order.paymentStatus === "paid") {
      updates.paymentStatus = "refunded";
    }

    const updated = updateOrder(order.websiteId, order.id, updates);

    if (updated) {
      toast({
        title: "Status updated",
        description: `Order ${order.orderNumber} is now ${statusLabels[newStatus].toLowerCase()}`,
      });
      onStatusUpdate();
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirm = () => {
    if (pendingStatus) {
      updateStatus(pendingStatus);
      setPendingStatus(null);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setPendingStatus(null);
    setShowConfirmation(false);
  };

  if (compact) {
    return (
      <>
        <span
          className={`${statusClass[order.status]} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {statusLabels[order.status]}
        </span>
        <Select
          value={order.status}
          onValueChange={(value) => handleStatusChange(value as OrderStatus)}
        >
          <SelectTrigger className="w-32 h-7 text-xs border-0 shadow-none opacity-0 absolute pointer-events-none" />
          <SelectContent>
            {Object.entries(statusLabels).map(([status, label]) => (
              <SelectItem key={status} value={status}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm status change</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingStatus === "cancelled" && (
                  <>Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.</>
                )}
                {pendingStatus === "refunded" && (
                  <>
                    Are you sure you want to mark order {order.orderNumber} as refunded?
                    Make sure you have processed the refund in Razorpay before updating this status.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Select
        value={order.status}
        onValueChange={(value) => handleStatusChange(value as OrderStatus)}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusLabels).map(([status, label]) => (
            <SelectItem key={status} value={status}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "cancelled" && (
                <>Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.</>
              )}
              {pendingStatus === "refunded" && (
                <>
                  Are you sure you want to mark order {order.orderNumber} as refunded?
                  Make sure you have processed the refund in Razorpay before updating this status.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
