import { useState } from "react";
import { Plus, Search, Pencil, Trash2, MoreVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCategory, CategoryType } from "@/types/categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface CategoryManagerProps {
  websiteId: string;
  categories: ProductCategory[];
  onUpdateCategories: (categories: ProductCategory[]) => void;
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

export const CategoryManager = ({
  websiteId,
  categories,
  onUpdateCategories,
}: CategoryManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CategoryType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ProductCategory>>({
    name: "",
    type: "custom",
    description: "",
    icon: "",
    enabled: true,
  });

  const filteredCategories = categories.filter((cat) => {
    const matchSearch = !searchQuery ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || cat.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "custom",
      description: "",
      icon: "",
      enabled: true,
    });
    setShowForm(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || "",
      icon: category.icon || "",
      enabled: category.enabled,
    });
    setShowForm(true);
  };

  const handleSaveCategory = () => {
    if (!formData.name) {
      alert("Category name is required");
      return;
    }

    const now = new Date().toISOString();

    if (editingCategory) {
      // Update existing category
      const updated = categories.map((cat) =>
        cat.id === editingCategory.id
          ? {
              ...cat,
              ...formData,
              updatedAt: now,
            } as ProductCategory
          : cat
      );
      onUpdateCategories(updated);
    } else {
      // Add new category
      const newCategory: ProductCategory = {
        id: `cat-${Date.now()}`,
        name: formData.name!,
        type: formData.type || "custom",
        description: formData.description,
        icon: formData.icon,
        enabled: formData.enabled ?? true,
        order: categories.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      onUpdateCategories([...categories, newCategory]);
    }

    setShowForm(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? Products in this category will become uncategorized.")) {
      const updated = categories.filter((cat) => cat.id !== categoryId);
      onUpdateCategories(updated);
    }
  };

  const handleToggleEnabled = (categoryId: string) => {
    const updated = categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, enabled: !cat.enabled, updatedAt: new Date().toISOString() }
        : cat
    );
    onUpdateCategories(updated);
  };

  return (
    <div className="space-y-6">
      {/* Category Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g., T-Shirts, Groceries, etc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cat-type">Category Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as CategoryType })}
              >
                <SelectTrigger id="cat-type">
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
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Brief description of this category"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="cat-icon">Icon (Optional)</Label>
              <Input
                id="cat-icon"
                placeholder="e.g., shirt, shopping-cart"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use Lucide icon names
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="cat-enabled">Enabled</Label>
              <Switch
                id="cat-enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveCategory} className="flex-1">
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize products into categories for better navigation
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as CategoryType | "all")}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(categoryTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Table */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground mb-4">
            {categories.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                <p>Create categories to organize your products</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p>Try adjusting your filters</p>
              </>
            )}
          </div>
          {categories.length === 0 && (
            <Button onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Category
            </Button>
          )}
        </div>
      ) : (
        <div className="blade-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="blade-table-header px-5 py-3 text-left">Name</th>
                  <th className="blade-table-header px-5 py-3 text-left">Type</th>
                  <th className="blade-table-header px-5 py-3 text-left">Description</th>
                  <th className="blade-table-header px-5 py-3 text-left">Products</th>
                  <th className="blade-table-header px-5 py-3 text-left">Status</th>
                  <th className="blade-table-header px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {category.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {categoryTypeLabels[category.type]}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">
                      {category.description || "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {category.productCount || 0}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleEnabled(category.id)}
                        className="flex items-center gap-1.5 text-sm hover:opacity-80"
                      >
                        {category.enabled ? (
                          <>
                            <Eye className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Enabled</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500">Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleEnabled(category.id)}
                          >
                            {category.enabled ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
