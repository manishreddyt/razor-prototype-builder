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

      // Show success toast
      toast({
        title: "Payment Successful! 🎉",
        description: `Paid ₹${formData.amount.toLocaleString('en-IN')} via ${paymentMethod.toUpperCase()}`,
      });

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg">Razorpay</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Form (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{link.title}</CardTitle>
                {link.description && (
                  <CardDescription className="text-base">
                    {link.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    {link.collectEmail && (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="pl-9"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {link.collectPhone && (
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="pl-9"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address Collection */}
                  {link.collectAddress && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Delivery Address
                        </h3>

                        <div className="space-y-2">
                          <Label htmlFor="address">Street Address *</Label>
                          <div className="relative">
                            <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="address"
                              placeholder="123 Main Street, Apartment 4B"
                              className="pl-9"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              placeholder="Mumbai"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                              id="pincode"
                              placeholder="400001"
                              value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Amount */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment Amount</h3>

                    {link.acceptPartialPayment ? (
                      <div className="space-y-2">
                        <Label htmlFor="amount">
                          Amount (Min: ₹{link.minPartialAmount?.toLocaleString('en-IN')})
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ₹
                          </span>
                          <Input
                            id="amount"
                            type="number"
                            min={link.minPartialAmount}
                            max={totalAmount}
                            placeholder={link.minPartialAmount?.toString()}
                            className="pl-7"
                            value={formData.amount || ""}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total: ₹{totalAmount.toLocaleString('en-IN')} •
                          Pay minimum ₹{link.minPartialAmount?.toLocaleString('en-IN')} now
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount</span>
                        <span className="text-2xl font-bold">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment Method</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "upi"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Smartphone className="h-5 w-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">UPI</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <CreditCard className="h-5 w-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">Card</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "netbanking"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Building className="h-5 w-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">NetBanking</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("wallet")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "wallet"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Wallet className="h-5 w-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">Wallet</div>
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Consent */}
                  {link.whatsappConfirmation && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <Switch
                          checked={formData.whatsappConsent}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, whatsappConsent: checked })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="h-4 w-4 text-green-600" />
                            <Label className="font-medium text-green-900">
                              WhatsApp Order Updates
                            </Label>
                          </div>
                          <p className="text-sm text-green-700">
                            Receive instant order confirmation and updates on WhatsApp
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Pay ₹{(link.acceptPartialPayment ? formData.amount : totalAmount).toLocaleString('en-IN')}
                      </>
                    )}
                  </Button>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      <span>PCI DSS Compliant</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary (2 cols) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Link Image */}
                  {link.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={link.image}
                        alt={link.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Products */}
                  {products.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Items ({products.length})
                      </h4>
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{product.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">{link.title}</p>
                      {link.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {link.acceptPartialPayment && formData.amount < totalAmount && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Paying Now</span>
                          <span className="font-medium text-primary">
                            ₹{formData.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className="text-orange-600">
                            ₹{(totalAmount - formData.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>
                        ₹{(link.acceptPartialPayment ? formData.amount : totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Shiprocket Badge */}
                  {link.shiprocketEnabled && link.collectAddress && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-900">
                          Fast shipping via Shiprocket
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Security Badge */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Secure Payment</h4>
                      <p className="text-sm text-muted-foreground">
                        Your payment information is encrypted and secure.
                        We never store your card details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by <span className="font-semibold text-foreground">Razorpay</span></p>
          <p className="mt-1">Trusted by 10 million+ businesses across India</p>
        </div>
      </div>
    </div>
  );
}
