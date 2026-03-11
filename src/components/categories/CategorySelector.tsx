import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { ProductCategory, CategoryType } from "@/types/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategorySelectorProps {
  categories: ProductCategory[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
  onCreateCategory: (category: ProductCategory) => void;
  websiteId: string;
}

const categoryTypeLabels: Record<CategoryType, string> = {
  "fashion-apparel": "Fashion & Apparel",
  "grocery-consumables": "Grocery & Consumables",
  "general-merchandise": "General Merchandise",
  "home-electronics": "Home & Electronics",
  "health-beauty": "Health & Beauty",
  "books-stationery": "Books & Stationery",
  "custom": "Custom Category",
};

export const CategorySelector = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  websiteId,
}: CategorySelectorProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>("custom");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  // Filter only enabled categories
  const enabledCategories = categories.filter((cat) => cat.enabled);

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Category name is required");
      return;
    }

    const now = new Date().toISOString();
    const newCategory: ProductCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      type: newCategoryType,
      description: newCategoryDesc.trim() || undefined,
      enabled: true,
      order: categories.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    onCreateCategory(newCategory);
    onSelectCategory(newCategory.id);

    // Reset form
    setNewCategoryName("");
    setNewCategoryType("custom");
    setNewCategoryDesc("");
    setShowCreateDialog(false);
  };

  return (
    <>
      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quick-cat-name">Category Name *</Label>
              <Input
                id="quick-cat-name"
                placeholder="e.g., T-Shirts, Groceries"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="quick-cat-type">Category Type</Label>
              <Select
                value={newCategoryType}
                onValueChange={(v) => setNewCategoryType(v as CategoryType)}
              >
                <SelectTrigger id="quick-cat-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quick-cat-desc">Description (Optional)</Label>
              <Textarea
                id="quick-cat-desc"
                placeholder="Brief description"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreateCategory} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Create Category
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewCategoryName("");
                  setNewCategoryType("custom");
                  setNewCategoryDesc("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Selector */}
      <div className="space-y-2">
        <Select
          value={selectedCategoryId || "none"}
          onValueChange={(value) => {
            if (value === "create-new") {
              setShowCreateDialog(true);
            } else if (value === "none") {
              onSelectCategory(undefined);
            } else {
              onSelectCategory(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Category</SelectItem>

            {enabledCategories.length > 0 && (
              <>
                {enabledCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </>
            )}

            <SelectItem value="create-new" className="text-primary font-medium">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Category
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {selectedCategoryId && (
          <p className="text-xs text-muted-foreground">
            {categories.find((c) => c.id === selectedCategoryId)?.description}
          </p>
        )}
      </div>
    </>
  );
};
