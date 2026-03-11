import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Package,
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Wallet,
  Building,
  ArrowLeft,
  Mail,
  Phone,
  User,
  MapPin,
  Home,
  MessageCircle,
  Truck,
  BadgeCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  image?: string;
  acceptPartialPayment?: boolean;
  minPartialAmount?: number;
  collectPhone?: boolean;
  collectEmail?: boolean;
  collectAddress?: boolean;
  selectedProducts?: string[];
  shiprocketEnabled?: boolean;
  whatsappConfirmation?: boolean;
  status: "active" | "inactive";
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export function PaymentLinkCheckout() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: 0,
    // Address fields
    address: "",
    city: "",
    pincode: "",
    // WhatsApp
    whatsappConsent: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");

  useEffect(() => {
    loadPaymentLink();
  }, [linkId]);

  const loadPaymentLink = () => {
    try {
      // Load payment links from localStorage
      const stored = localStorage.getItem("payment_links");
      if (!stored) {
        setLoading(false);
        return;
      }

      const links: PaymentLink[] = JSON.parse(stored);
      const foundLink = links.find((l) => l.id === linkId);

      if (!foundLink) {
        setLoading(false);
        return;
      }

      setLink(foundLink);
      setFormData((prev) => ({ ...prev, amount: foundLink.amount }));

      // Load products if any are tagged
      if (foundLink.selectedProducts && foundLink.selectedProducts.length > 0) {
        const storedProducts = localStorage.getItem("available_products");
        if (storedProducts) {
          const allProducts: Product[] = JSON.parse(storedProducts);
          const taggedProducts = allProducts.filter((p) =>
            foundLink.selectedProducts?.includes(p.id)
          );
          setProducts(taggedProducts);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading payment link:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (link?.collectEmail && !formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (link?.collectPhone && !formData.phone.trim()) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (link?.collectAddress) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
        toast({
          title: "Address required",
          description: "Please fill in all address fields",
          variant: "destructive",
        });
        return;
      }
    }

    if (link?.acceptPartialPayment && link.minPartialAmount) {
      if (formData.amount < link.minPartialAmount) {
        toast({
          title: "Invalid amount",
          description: `Minimum amount is ₹${link.minPartialAmount.toLocaleString('en-IN')}`,
          variant: "destructive",
        });
        return;
      }
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);

      // Calculate final amount
      const finalAmount = link?.acceptPartialPayment ? formData.amount : totalAmount;

      // Generate transaction ID
      const transactionId = `TXN${Date.now().toString().slice(-10)}`;

      // Redirect to success page with payment details
      const params = new URLSearchParams({
        amount: finalAmount.toString(),
        method: paymentMethod,
        merchant: "Razorpay Merchant",
        description: link?.description || link?.title || "Payment",
        txnId: transactionId,
        name: formData.name,
        email: formData.email || "",
        phone: formData.phone || "",
      });

      navigate(`/payment-success?${params.toString()}`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Payment Link Not Found</CardTitle>
            <CardDescription>
              This payment link doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (link.status === "inactive") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Payment Link Inactive</CardTitle>
            <CardDescription>
              This payment link is currently inactive and cannot accept payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = products.length > 0
    ? products.reduce((sum, p) => sum + p.price, 0)
    : link.amount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Merchant Details & Payment Info */}
          <div className="space-y-6">
            {/* Merchant Info Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Payment Request Header */}
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Payment Request from
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Razorpay Merchant</p>
                        <p className="text-xs text-muted-foreground">razorpay.com</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Details */}
                  {link.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p className="text-sm text-foreground">{link.description}</p>
                    </div>
                  )}

                  {/* Products List */}
                  {products.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Items</p>
                      <div className="space-y-2">
                        {products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{product.name}</span>
                            <span className="font-medium">₹{product.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Amount Payable */}
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Amount Payable
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </p>
                    {link.acceptPartialPayment && link.minPartialAmount && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum payment: ₹{link.minPartialAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      For any queries, please contact <span className="font-medium text-foreground">Razorpay Merchant</span>
                    </p>
                    {link.shiprocketEnabled && link.collectAddress && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                        <Truck className="h-3 w-3" />
                        <span>Free shipping via Shiprocket</span>
                      </div>
                    )}
                  </div>

                  {/* Security Badges */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>100% Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Encrypted</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Options */}
          <div>
            <Card>
              {/* Merchant Header */}
              <div className="bg-primary text-white p-4 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">Razorpay Merchant</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Options Heading */}
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Payment Options</h3>
                    <p className="text-xs text-muted-foreground">Choose your preferred payment method</p>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                    />

                    {link.collectEmail && (
                      <>
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-11"
                        />
                      </>
                    )}

                    {link.collectPhone && (
                      <>
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="h-11"
                        />
                      </>
                    )}
                  </div>

                  {/* Address Collection */}
                  {link.collectAddress && (
                    <div className="space-y-3 pt-2">
                      <Separator />
                      <h4 className="text-sm font-semibold">Delivery Address</h4>

                      <div className="space-y-3">
                        <Input
                          id="address"
                          placeholder="Street Address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                          className="h-11"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            id="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            className="h-11"
                          />
                          <Input
                            id="pincode"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Partial Payment Amount */}
                  {link.acceptPartialPayment && (
                    <div className="space-y-3">
                      <Label htmlFor="amount" className="text-sm font-medium">
                        Enter Amount (Min: ₹{link.minPartialAmount?.toLocaleString('en-IN')})
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          ₹
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          min={link.minPartialAmount}
                          max={totalAmount}
                          placeholder={link.minPartialAmount?.toString()}
                          className="pl-7 h-11 text-base font-medium"
                          value={formData.amount || ""}
                          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Select Payment Method</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`p-3 rounded-md border-2 transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                          paymentMethod === "upi"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Smartphone className="h-5 w-5" />
                        UPI
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-3 rounded-md border-2 transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        Card
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`p-3 rounded-md border-2 transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                          paymentMethod === "netbanking"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Building className="h-5 w-5" />
                        NetBanking
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("wallet")}
                        className={`p-3 rounded-md border-2 transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                          paymentMethod === "wallet"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Wallet className="h-5 w-5" />
                        Wallet
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Consent */}
                  {link.whatsappConfirmation && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md border border-green-200">
                      <Switch
                        checked={formData.whatsappConsent}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, whatsappConsent: checked })
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                          <Label className="text-sm font-medium text-green-900">
                            Get updates on WhatsApp
                          </Label>
                        </div>
                        <p className="text-xs text-green-700">
                          Receive order confirmation and updates
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Amount Display & Pay Button */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-base">
                      <span className="font-medium">Amount to Pay</span>
                      <span className="text-2xl font-bold">
                        ₹{(link.acceptPartialPayment ? (formData.amount || 0) : totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 text-base font-semibold"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>

                    {/* Security Info */}
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        <span>Secure</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Encrypted</span>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Powered by <span className="font-semibold text-foreground">Razorpay</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
