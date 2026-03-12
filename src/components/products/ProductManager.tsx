import { useState } from "react";
import { Plus, Search, Filter, Grid, List, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, ProductType } from "@/types/products";
import { ProductCategory } from "@/types/categories";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "./ProductForm";
import { CategoryManager } from "@/components/categories/CategoryManager";
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

interface ProductManagerProps {
  websiteId: string;
  products: Product[];
  categories: ProductCategory[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategories: (categories: ProductCategory[]) => void;
}

export const ProductManager = ({
  websiteId,
  products,
  categories,
  onUpdateProducts,
  onUpdateCategories,
}: ProductManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    const matchCategory = categoryFilter === "all" ||
      (categoryFilter === "uncategorized" && !p.category) ||
      p.category === categoryFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchType && matchCategory && matchStatus;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      // Update existing product
      const updated = products.map((p) => (p.id === product.id ? product : p));
      onUpdateProducts(updated);
    } else {
      // Add new product
      onUpdateProducts([...products, product]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicate: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      title: `${product.title} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateProducts([...products, duplicate]);
  };

  const handleArchiveProduct = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, status: "archived" as const } : p
    );
    onUpdateProducts(updated);
  };

  return (
    <div className="space-y-6">
      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Category Manager Dialog */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <CategoryManager
            websiteId={websiteId}
            categories={categories}
            onUpdateCategories={(updatedCategories) => {
              onUpdateCategories(updatedCategories);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage courses, sessions, and webinars
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategoryManager(true)}>
            <FolderTree className="w-4 h-4 mr-2" />
            Manage Categories
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ProductType | "all")}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="online-course">Online Courses</SelectItem>
            <SelectItem value="1-1-session">1:1 Sessions</SelectItem>
            <SelectItem value="webinar">Webinars</SelectItem>
            <SelectItem value="physical-product">Physical Products</SelectItem>
            <SelectItem value="digital-product">Digital Products</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {categories
              .filter((cat) => cat.enabled)
              .map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground mb-4">
            {products.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p>Create your first product to start selling</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p>Try adjusting your filters</p>
              </>
            )}
          </div>
          {products.length === 0 && (
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onEdit={() => handleEditProduct(product)}
              onDelete={() => handleDeleteProduct(product.id)}
              onDuplicate={() => handleDuplicateProduct(product)}
              onArchive={() => handleArchiveProduct(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
