import { useState } from "react";
import { PricingModel } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Star } from "lucide-react";
import { toast } from "sonner";

interface PricingModelBuilderProps {
  pricingModels: PricingModel[];
  onUpdate: (models: PricingModel[]) => void;
}

export const PricingModelBuilder = ({ pricingModels, onUpdate }: PricingModelBuilderProps) => {
  const [editingModel, setEditingModel] = useState<PricingModel | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddModel = () => {
    const newModel: PricingModel = {
      id: `pm-${Date.now()}`,
      name: "",
      price: 0,
      currency: "INR",
      interval: "one_time",
      features: [],
      highlighted: false,
      description: "",
    };
    setEditingModel(newModel);
    setShowForm(true);
  };

  const handleEditModel = (model: PricingModel) => {
    setEditingModel({ ...model });
    setShowForm(true);
  };

  const handleSaveModel = () => {
    if (!editingModel) return;

    if (!editingModel.name.trim()) {
      toast.error("Please enter a name for this pricing tier");
      return;
    }
    if (editingModel.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const existingIndex = pricingModels.findIndex((m) => m.id === editingModel.id);
    if (existingIndex >= 0) {
      const updated = [...pricingModels];
      updated[existingIndex] = editingModel;
      onUpdate(updated);
    } else {
      onUpdate([...pricingModels, editingModel]);
    }
    setEditingModel(null);
    setShowForm(false);
    toast.success("Pricing tier saved");
  };

  const handleDeleteModel = (id: string) => {
    onUpdate(pricingModels.filter((m) => m.id !== id));
    toast.success("Pricing tier deleted");
  };

  const handleToggleHighlight = (id: string) => {
    onUpdate(
      pricingModels.map((m) => ({
        ...m,
        highlighted: m.id === id ? !m.highlighted : false, // Only one can be highlighted
      }))
    );
  };

  const handleAddFeature = () => {
    if (!editingModel) return;
    setEditingModel({
      ...editingModel,
      features: [...editingModel.features, ""],
    });
  };

  const handleUpdateFeature = (index: number, value: string) => {
    if (!editingModel) return;
    const features = [...editingModel.features];
    features[index] = value;
    setEditingModel({ ...editingModel, features });
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingModel) return;
    setEditingModel({
      ...editingModel,
      features: editingModel.features.filter((_, i) => i !== index),
    });
  };

  if (showForm && editingModel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {pricingModels.some((m) => m.id === editingModel.id) ? "Edit" : "Add"} Pricing Tier
          </h3>
          <Button variant="outline" onClick={() => { setShowForm(false); setEditingModel(null); }}>
            Cancel
          </Button>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tier Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Self-Paced, Premium"
                value={editingModel.name}
                onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={editingModel.price || ""}
                onChange={(e) => setEditingModel({ ...editingModel, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Billing Interval</Label>
            <Select
              value={editingModel.interval}
              onValueChange={(v) => setEditingModel({ ...editingModel, interval: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One-time Payment</SelectItem>
                <SelectItem value="monthly">Monthly Subscription</SelectItem>
                <SelectItem value="yearly">Yearly Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of this tier"
              value={editingModel.description || ""}
              onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Features Included</Label>
              <Button variant="outline" size="sm" onClick={handleAddFeature}>
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
            <div className="space-y-2">
              {editingModel.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., Lifetime access to all materials"
                    value={feature}
                    onChange={(e) => handleUpdateFeature(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {editingModel.features.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No features added yet. Click "Add Feature" to get started.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Highlight This Tier</Label>
              <p className="text-sm text-muted-foreground">
                Show as "Recommended" or "Best Value"
              </p>
            </div>
            <Switch
              checked={editingModel.highlighted}
              onCheckedChange={(checked) => setEditingModel({ ...editingModel, highlighted: checked })}
            />
          </div>
        </div>

        <Button onClick={handleSaveModel} className="w-full">
          {pricingModels.some((m) => m.id === editingModel.id) ? "Update" : "Add"} Pricing Tier
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Pricing Tiers</h3>
          <p className="text-sm text-muted-foreground">
            Create multiple pricing options for your product
          </p>
        </div>
        <Button onClick={handleAddModel}>
          <Plus className="w-4 h-4 mr-2" />
          Add Pricing Tier
        </Button>
      </div>

      {pricingModels.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">No pricing tiers yet</p>
          <Button onClick={handleAddModel}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Pricing Tier
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pricingModels.map((model) => (
            <Card
              key={model.id}
              className={`p-6 relative ${
                model.highlighted ? "border-primary border-2" : ""
              }`}
            >
              {model.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Recommended
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold">{model.name}</h4>
                  {model.description && (
                    <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteModel(model.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold">₹{model.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  {model.interval === "one_time" && "One-time payment"}
                  {model.interval === "monthly" && "Per month"}
                  {model.interval === "yearly" && "Per year"}
                </div>
              </div>

              {model.features.length > 0 && (
                <div className="space-y-2 mb-4 text-sm">
                  {model.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span className="line-clamp-2">{feature}</span>
                    </div>
                  ))}
                  {model.features.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{model.features.length - 3} more features
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditModel(model)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleHighlight(model.id)}
                >
                  <Star className={`w-4 h-4 ${model.highlighted ? "fill-current" : ""}`} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
