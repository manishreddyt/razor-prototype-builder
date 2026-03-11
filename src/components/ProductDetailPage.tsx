import { useState } from "react";
import { Product, PricingModel, ProductVariant } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Star, Clock, BookOpen, Video, Calendar,
  Check, GraduationCap, FileText, ShoppingCart, Package,
  Truck, ChevronRight, Download, AlertCircle,
} from "lucide-react";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onBuyNow: (product: Product, pricingModel: PricingModel, selectedVariant?: ProductVariant) => void;
  visibleSections?: {
    pricing?: boolean;
    curriculum?: boolean;
    instructors?: boolean;
    agenda?: boolean;
    whatYouLearn?: boolean;
    includes?: boolean;
  };
  categoryName?: string;
}

export const ProductDetailPage = ({
  product,
  onBack,
  onBuyNow,
  visibleSections = {
    pricing: true,
    curriculum: true,
    instructors: true,
    agenda: true,
    whatYouLearn: true,
    includes: true,
  },
  categoryName,
}: ProductDetailPageProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.find(v => v.enabled)
  );

  const isEcommerce = product.type === "physical-product" || product.type === "digital-product";

  // Calculate effective price based on variant selection
  const getEffectivePrice = (pricingModel: PricingModel) => {
    if (selectedVariant?.price !== undefined) {
      return selectedVariant.price;
    }
    return pricingModel.price;
  };

  // Calculate effective compareAtPrice
  const getEffectiveCompareAtPrice = () => {
    if (selectedVariant?.compareAtPrice !== undefined) {
      return selectedVariant.compareAtPrice;
    }
    return product.compareAtPrice;
  };

  // Calculate discount percentage
  const getDiscountPercentage = (price: number) => {
    const compareAt = getEffectiveCompareAtPrice();
    if (!compareAt || compareAt <= price) return null;
    return Math.round(((compareAt - price) / compareAt) * 100);
  };

  // Get stock info
  const getStockInfo = () => {
    let stock = product.inventory?.stock || 0;

    if (selectedVariant?.stock !== undefined) {
      stock = selectedVariant.stock;
    }

    if (!product.inventory?.trackInventory && !selectedVariant?.stock) {
      return { available: true, label: "In Stock", color: "text-green-600" };
    }

    const threshold = product.inventory?.lowStockThreshold || 10;

    if (stock === 0) {
      return { available: false, label: "Out of Stock", color: "text-red-600" };
    }
    if (stock <= threshold) {
      return { available: true, label: `Only ${stock} left in stock`, color: "text-orange-600" };
    }
    return { available: true, label: "In Stock", color: "text-green-600" };
  };

  const stockInfo = getStockInfo();
  const effectivePrice = getEffectivePrice(product.pricingModels[0]);
  const discount = getDiscountPercentage(effectivePrice);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb */}
          {categoryName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hover:text-primary cursor-pointer">Products</span>
              <ChevronRight className="w-4 h-4" />
              <span className="hover:text-primary cursor-pointer">{categoryName}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{product.title}</span>
            </div>
          )}

          {/* Hero Section */}
          <Card className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Image */}
              <div>
                <img
                  src={selectedVariant?.image || product.image}
                  alt={product.title}
                  className="w-full rounded-lg shadow-lg"
                />
                {/* Image gallery for variants */}
                {product.images && product.images.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-20 h-20 rounded border-2 border-primary cursor-pointer object-cover"
                    />
                    {product.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${product.title} ${i + 2}`}
                        className="w-20 h-20 rounded border hover:border-primary cursor-pointer object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="space-y-6">
                {product.badge && (
                  <Badge variant="secondary" className="text-sm">
                    {product.badge}
                  </Badge>
                )}
                <div>
                  <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                  <p className="text-lg text-muted-foreground">
                    {product.description}
                  </p>
                </div>

                {/* SKU */}
                {isEcommerce && (product.inventory?.sku || selectedVariant?.sku) && (
                  <div className="text-sm text-muted-foreground">
                    SKU: {selectedVariant?.sku || product.inventory?.sku}
                  </div>
                )}

                {/* Variant Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <label className="text-sm font-medium">Select Variant</label>
                    <Select
                      value={selectedVariant?.id}
                      onValueChange={(id) => setSelectedVariant(product.variants?.find(v => v.id === id))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.filter(v => v.enabled).map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name}
                            {variant.price && ` - ₹${variant.price.toLocaleString()}`}
                            {variant.stock !== undefined && variant.stock === 0 && " (Out of Stock)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Stock Status */}
                {isEcommerce && (
                  <div className={`flex items-center gap-2 text-sm font-medium ${stockInfo.color}`}>
                    <AlertCircle className="w-4 h-4" />
                    {stockInfo.label}
                  </div>
                )}

                {/* Shipping Info */}
                {product.shipping?.requiresShipping && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-900">Shipping Available</div>
                      <div className="text-blue-700">
                        {product.shipping.shippingCost ? (
                          <>Shipping: ₹{product.shipping.shippingCost}</>
                        ) : product.shipping.freeShippingThreshold ? (
                          <>Free shipping on orders above ₹{product.shipping.freeShippingThreshold}</>
                        ) : (
                          <>Shipping calculated at checkout</>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Product Download Info */}
                {product.type === "digital-product" && product.downloadUrl && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Download className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-green-900">Instant Download</div>
                      <div className="text-green-700">Get instant access after purchase</div>
                    </div>
                  </div>
                )}

                {/* Course Meta */}
                {product.type === "online-course" && (
                  <div className="flex flex-wrap gap-4 text-sm pt-4 border-t">
                    {product.level && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="capitalize">{product.level}</span>
                      </div>
                    )}
                    {product.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{product.duration}</span>
                      </div>
                    )}
                    {product.format && (
                      <div className="flex items-center gap-2">
                        {product.format === "video" && <Video className="w-4 h-4 text-primary" />}
                        {product.format === "text" && <FileText className="w-4 h-4 text-primary" />}
                        {product.format === "mixed" && <BookOpen className="w-4 h-4 text-primary" />}
                        <span className="capitalize">{product.format}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Session Meta */}
                {product.type === "1-1-session" && product.sessionDuration && (
                  <div className="flex items-center gap-2 text-sm pt-4 border-t">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{product.sessionDuration} minutes</span>
                  </div>
                )}

                {/* Webinar Meta */}
                {product.type === "webinar" && (
                  <div className="flex flex-wrap gap-4 text-sm pt-4 border-t">
                    {product.webinarDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{new Date(product.webinarDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {product.webinarTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{product.webinarTime}</span>
                      </div>
                    )}
                    {product.webinarDuration && (
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span>{product.webinarDuration} minutes</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="pt-6 border-t">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold">
                      ₹{effectivePrice.toLocaleString()}
                    </span>
                    {getEffectiveCompareAtPrice() && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">
                          ₹{getEffectiveCompareAtPrice()?.toLocaleString()}
                        </span>
                        {discount && (
                          <Badge className="bg-red-500 text-white">
                            {discount}% OFF
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  {product.pricingModels.length > 1 && (
                    <span className="text-muted-foreground text-sm">
                      + {product.pricingModels.length - 1} more {product.pricingModels.length - 1 === 1 ? 'option' : 'options'}
                    </span>
                  )}
                  <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold mt-4"
                    onClick={() => onBuyNow(product, product.pricingModels[0], selectedVariant)}
                    disabled={isEcommerce && !stockInfo.available}
                  >
                    {isEcommerce ? (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {stockInfo.available ? "Add to Cart" : "Out of Stock"}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Options - If multiple */}
          {visibleSections.pricing && product.pricingModels.length > 1 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.pricingModels.map((pm) => {
                  const pmPrice = getEffectivePrice(pm);
                  const pmDiscount = getDiscountPercentage(pmPrice);

                  return (
                    <div
                      key={pm.id}
                      className={`border-2 rounded-xl p-6 flex flex-col ${
                        pm.highlighted
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{pm.name}</h3>
                            {pm.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {pm.description}
                              </p>
                            )}
                          </div>
                          {pm.highlighted && (
                            <Badge variant="default" className="text-xs">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="mb-6">
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold">
                              ₹{pmPrice.toLocaleString()}
                            </div>
                            {pm.interval && pm.interval !== "one_time" && (
                              <span className="text-sm text-muted-foreground font-normal">
                                /{pm.interval === "monthly" ? "mo" : pm.interval === "yearly" ? "yr" : ""}
                              </span>
                            )}
                          </div>
                          {getEffectiveCompareAtPrice() && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{getEffectiveCompareAtPrice()?.toLocaleString()}
                              </span>
                              {pmDiscount && (
                                <Badge variant="destructive" className="text-xs">
                                  {pmDiscount}% OFF
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <ul className="space-y-3">
                          {pm.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        className="w-full mt-6"
                        variant={pm.highlighted ? "default" : "outline"}
                        onClick={() => onBuyNow(product, pm, selectedVariant)}
                        disabled={isEcommerce && !stockInfo.available}
                      >
                        Select Plan
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* What You'll Learn */}
          {visibleSections.whatYouLearn &&
            product.whatYouWillLearn &&
            product.whatYouWillLearn.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.whatYouWillLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* Curriculum */}
          {visibleSections.curriculum &&
            product.modules &&
            product.modules.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                <div className="space-y-4">
                  {product.modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="border rounded-lg p-6 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{module.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{module.lessons} lessons</span>
                          <span>{module.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* Course Includes */}
          {visibleSections.includes &&
            product.courseIncludes &&
            product.courseIncludes.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">This Course Includes</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.courseIncludes.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* Speakers (Webinar) */}
          {visibleSections.instructors &&
            product.type === "webinar" &&
            product.speakers &&
            product.speakers.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Meet Your Speakers</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {product.speakers.map((speaker) => (
                    <div key={speaker.id} className="flex gap-4">
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{speaker.name}</h3>
                        <p className="text-sm text-primary mb-2">{speaker.title}</p>
                        <p className="text-sm text-muted-foreground">{speaker.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* Agenda (Webinar) */}
          {visibleSections.agenda &&
            product.type === "webinar" &&
            product.agenda &&
            product.agenda.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Event Agenda</h2>
                <div className="space-y-4">
                  {product.agenda.map((item) => (
                    <div key={item.id} className="flex gap-6 pb-4 border-b last:border-0">
                      <div className="text-base font-semibold text-primary min-w-[80px]">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.speaker && (
                          <p className="text-xs text-primary mt-2">
                            Speaker: {product.speakers?.find(s => s.id === item.speaker)?.name}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.duration} min
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* Long Description */}
          {product.longDescription && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                {product.type === "online-course" && "About This Course"}
                {product.type === "1-1-session" && "About This Session"}
                {product.type === "webinar" && "About This Webinar"}
                {isEcommerce && "Product Details"}
              </h2>
              <div className="prose max-w-none">
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {product.longDescription}
                </p>
              </div>
            </Card>
          )}

          {/* Sticky Bottom CTA */}
          <div className="sticky bottom-0 bg-white border-t shadow-lg p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  {getEffectiveCompareAtPrice() ? "Sale Price" : "Price"}
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">
                    ₹{effectivePrice.toLocaleString()}
                  </div>
                  {getEffectiveCompareAtPrice() && (
                    <div className="text-sm text-muted-foreground line-through">
                      ₹{getEffectiveCompareAtPrice()?.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold"
                onClick={() => onBuyNow(product, product.pricingModels[0], selectedVariant)}
                disabled={isEcommerce && !stockInfo.available}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isEcommerce && !stockInfo.available ? "Out of Stock" : "Buy Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
