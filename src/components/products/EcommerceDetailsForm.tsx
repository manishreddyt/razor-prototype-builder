import { Product, InventoryConfig, ShippingConfig } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Package, DollarSign, Archive, Truck, Tag } from "lucide-react";

interface EcommerceDetailsFormProps {
  formData: Partial<Product>;
  updateFormData: (updates: Partial<Product>) => void;
}

export const EcommerceDetailsForm = ({ formData, updateFormData }: EcommerceDetailsFormProps) => {
  const images = formData.images || [];
  const inventory: InventoryConfig = formData.inventory || {
    trackInventory: false,
    stock: 0,
    allowBackorder: false,
  };
  const shipping: ShippingConfig = formData.shipping || {
    requiresShipping: formData.type === "physical-product",
    weight: undefined,
    dimensions: undefined,
    shippingCost: undefined,
    freeShippingThreshold: undefined,
  };

  const updateInventory = (updates: Partial<InventoryConfig>) => {
    updateFormData({ inventory: { ...inventory, ...updates } });
  };

  const updateShipping = (updates: Partial<ShippingConfig>) => {
    updateFormData({ shipping: { ...shipping, ...updates } });
  };

  const updateDimensions = (key: "length" | "width" | "height", value: number) => {
    const dimensions = shipping.dimensions || { length: 0, width: 0, height: 0 };
    updateShipping({ dimensions: { ...dimensions, [key]: value } });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h3 className="font-semibold text-lg">Product Details</h3>

      {/* Basic Info Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Basic Information</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Product images and category details
            </p>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <ImageUpload
            images={images}
            maxImages={5}
            onImagesChange={(imgs) => {
              updateFormData({
                images: imgs,
                image: imgs[0] || "", // Set first image as main
              });
            }}
            allowUrl={true}
            label="Product Images"
            hint="Add up to 5 images. First image will be the main product image."
          />
        </div>

        {/* Category & Tags */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Fashion, Electronics"
              value={formData.category || ""}
              onChange={(e) => updateFormData({ category: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Input
              id="badge"
              placeholder="e.g., Bestseller, Sale"
              value={formData.badge || ""}
              onChange={(e) => updateFormData({ badge: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="e.g., organic, handmade, premium"
            value={formData.tags?.join(", ") || ""}
            onChange={(e) =>
              updateFormData({
                tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Add tags to help customers find your product
          </p>
        </div>
      </Card>

      {/* Pricing Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Pricing</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Set product pricing and discounts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Compare at Price (₹)</Label>
            <Input
              id="compareAtPrice"
              type="number"
              placeholder="999"
              value={formData.compareAtPrice || ""}
              onChange={(e) =>
                updateFormData({ compareAtPrice: Number(e.target.value) || undefined })
              }
            />
            <p className="text-xs text-muted-foreground">
              Original price (shown as crossed out)
            </p>
          </div>
        </div>

        {formData.compareAtPrice && formData.pricingModels?.[0]?.price && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              <span className="font-semibold">
                {Math.round(
                  ((formData.compareAtPrice - formData.pricingModels[0].price) /
                    formData.compareAtPrice) *
                    100
                )}
                % OFF
              </span>{" "}
              - Customers save ₹
              {formData.compareAtPrice - formData.pricingModels[0].price}
            </p>
          </div>
        )}
      </Card>

      {/* Inventory Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Archive className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Inventory</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Manage stock levels and SKU
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
          <Input
            id="sku"
            placeholder="e.g., PROD-001"
            value={inventory.sku || ""}
            onChange={(e) => updateInventory({ sku: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier for inventory tracking
          </p>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Track Inventory</Label>
            <p className="text-xs text-muted-foreground">
              Monitor stock levels and prevent overselling
            </p>
          </div>
          <Switch
            checked={inventory.trackInventory}
            onCheckedChange={(checked) => updateInventory({ trackInventory: checked })}
          />
        </div>

        {inventory.trackInventory && (
          <div className="space-y-4 pl-6 border-l-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Available Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="100"
                  value={inventory.stock || ""}
                  onChange={(e) => updateInventory({ stock: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStock">Low Stock Alert</Label>
                <Input
                  id="lowStock"
                  type="number"
                  placeholder="10"
                  value={inventory.lowStockThreshold || ""}
                  onChange={(e) =>
                    updateInventory({ lowStockThreshold: Number(e.target.value) || undefined })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Allow Backorders</Label>
                <p className="text-xs text-muted-foreground">
                  Let customers order when out of stock
                </p>
              </div>
              <Switch
                checked={inventory.allowBackorder}
                onCheckedChange={(checked) => updateInventory({ allowBackorder: checked })}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Shipping Section */}
      {formData.type === "physical-product" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold">Shipping</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Configure shipping details and costs
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Requires Shipping</Label>
              <p className="text-xs text-muted-foreground">
                This is a physical product that needs to be shipped
              </p>
            </div>
            <Switch
              checked={shipping.requiresShipping}
              onCheckedChange={(checked) => updateShipping({ requiresShipping: checked })}
            />
          </div>

          {shipping.requiresShipping && (
            <div className="space-y-4 pl-6 border-l-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (grams)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="500"
                  value={shipping.weight || ""}
                  onChange={(e) => updateShipping({ weight: Number(e.target.value) || undefined })}
                />
                <p className="text-xs text-muted-foreground">
                  Used for shipping cost calculation
                </p>
              </div>

              <div className="space-y-2">
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    placeholder="Length"
                    value={shipping.dimensions?.length || ""}
                    onChange={(e) => updateDimensions("length", Number(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Width"
                    value={shipping.dimensions?.width || ""}
                    onChange={(e) => updateDimensions("width", Number(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Height"
                    value={shipping.dimensions?.height || ""}
                    onChange={(e) => updateDimensions("height", Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost (₹)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    placeholder="50"
                    value={shipping.shippingCost || ""}
                    onChange={(e) =>
                      updateShipping({ shippingCost: Number(e.target.value) || undefined })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Fixed shipping charge</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeShipping">Free Shipping Above (₹)</Label>
                  <Input
                    id="freeShipping"
                    type="number"
                    placeholder="500"
                    value={shipping.freeShippingThreshold || ""}
                    onChange={(e) =>
                      updateShipping({ freeShippingThreshold: Number(e.target.value) || undefined })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Minimum order value</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Digital Product Section */}
      {formData.type === "digital-product" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold">Digital Product Details</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Download link and delivery settings
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="downloadUrl">Download URL</Label>
            <Input
              id="downloadUrl"
              type="url"
              placeholder="https://example.com/download/product.zip"
              value={formData.downloadUrl || ""}
              onChange={(e) => updateFormData({ downloadUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Link sent to customer after purchase. Use a secure file hosting service.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Tip:</span> For secure delivery, use file hosting
              services like Google Drive, Dropbox, or AWS S3 with time-limited access links.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
