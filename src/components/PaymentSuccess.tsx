import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Download,
  Home,
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  CreditCard,
  Share2,
  MessageCircle,
  ArrowRight,
  Smartphone,
  Building,
  Wallet,
} from "lucide-react";

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);

  // Get payment details from URL params
  const amount = searchParams.get("amount") || "0";
  const paymentMethod = searchParams.get("method") || "upi";
  const merchantName = searchParams.get("merchant") || "Razorpay Merchant";
  const description = searchParams.get("description") || "Payment Link";
  const transactionId = searchParams.get("txnId") || `TXN${Date.now().toString().slice(-10)}`;
  const customerName = searchParams.get("name") || "Customer";
  const customerEmail = searchParams.get("email") || "";
  const customerPhone = searchParams.get("phone") || "";

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const paymentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case "upi":
        return <Smartphone className="h-5 w-5" />;
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "netbanking":
        return <Building className="h-5 w-5" />;
      case "wallet":
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case "upi":
        return "UPI";
      case "card":
        return "Debit/Credit Card";
      case "netbanking":
        return "Net Banking";
      case "wallet":
        return "Wallet";
      default:
        return "Online Payment";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* Success Icon & Message */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 animate-scale-in">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">
            Your payment of <span className="font-semibold text-foreground">₹{Number(amount).toLocaleString('en-IN')}</span> was successful
          </p>
        </div>

        {/* Payment Details Card */}
        <Card className="mb-6 shadow-lg animate-slide-up">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Transaction ID */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Transaction ID
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-semibold text-foreground">{transactionId}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(transactionId);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Payment Summary
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount Paid</span>
                    <span className="text-lg font-bold text-foreground">
                      ₹{Number(amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon()}
                      <span className="text-sm font-medium">{getPaymentMethodName()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date & Time</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{paymentDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Paid To</span>
                    <span className="text-sm font-medium">{merchantName}</span>
                  </div>

                  {description && (
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">Description</span>
                      <span className="text-sm font-medium text-right max-w-[200px]">
                        {description}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Customer Details */}
              {(customerEmail || customerPhone) && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Customer Details
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {customerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{customerName}</span>
                      </div>

                      {customerEmail && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{customerEmail}</span>
                        </div>
                      )}

                      {customerPhone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Status Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Payment Confirmed</p>
                    <p className="text-xs text-green-700">
                      A confirmation email has been sent to {customerEmail || "your email"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                // Create receipt content
                const receiptContent = `
PAYMENT RECEIPT
================

Transaction ID: ${transactionId}
Date: ${paymentDate}

Amount Paid: ₹${Number(amount).toLocaleString('en-IN')}
Payment Method: ${getPaymentMethodName()}
Paid To: ${merchantName}
${description ? `Description: ${description}` : ''}

Customer: ${customerName}
${customerEmail ? `Email: ${customerEmail}` : ''}
${customerPhone ? `Phone: ${customerPhone}` : ''}

Status: SUCCESS ✓

Thank you for your payment!
                `.trim();

                // Create blob and download
                const blob = new Blob([receiptContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt_${transactionId}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                const message = `Payment Successful!\n\nAmount: ₹${Number(amount).toLocaleString('en-IN')}\nTransaction ID: ${transactionId}\nDate: ${paymentDate}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Share
            </Button>
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>

        {/* Help Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">What's Next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Check your email for the payment confirmation and receipt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>The merchant will contact you for next steps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Save the transaction ID for your records</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by <span className="font-semibold text-foreground">Razorpay</span></p>
          <p className="mt-1">Your payment is secure and encrypted</p>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
