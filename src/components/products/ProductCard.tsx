import { Product } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Copy, Archive, Trash2, Eye, GraduationCap, Video, Calendar } from "lucide-react";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}

const productTypeIcons = {
  "online-course": GraduationCap,
  "1-1-session": Calendar,
  "webinar": Video,
};

const productTypeLabels = {
  "online-course": "Online Course",
  "1-1-session": "1:1 Session",
  "webinar": "Webinar",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  published: "bg-green-100 text-green-700 border-green-300",
  archived: "bg-orange-100 text-orange-700 border-orange-300",
};

export const ProductCard = ({
  product,
  viewMode,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
}: ProductCardProps) => {
  const Icon = productTypeIcons[product.type];
  const minPrice = Math.min(...product.pricingModels.map((pm) => pm.price));
  const maxPrice = Math.max(...product.pricingModels.map((pm) => pm.price));
  const priceRange = minPrice === maxPrice
    ? `₹${minPrice.toLocaleString()}`
    : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-white">
        <img
          src={product.image}
          alt={product.title}
          className="w-20 h-20 rounded object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <h3 className="font-semibold truncate">{product.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {product.description}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {product.badge && (
                <Badge variant="secondary" className="flex-shrink-0">
                  {product.badge}
                </Badge>
              )}
              <Badge className={statusColors[product.status]}>
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </Badge>
              <div className="text-right min-w-[100px]">
                <div className="font-semibold text-sm">{priceRange}</div>
                <div className="text-xs text-muted-foreground">
                  {product.pricingModels.length} {product.pricingModels.length === 1 ? "tier" : "tiers"}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {product.badge && (
            <Badge variant="secondary" className="shadow-sm">
              {product.badge}
            </Badge>
          )}
          <Badge className={statusColors[product.status]}>
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {productTypeLabels[product.type]}
          </span>
        </div>
        <h3 className="font-semibold mb-2 line-clamp-1">{product.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <div className="font-semibold">{priceRange}</div>
            <div className="text-xs text-muted-foreground">
              {product.pricingModels.length} pricing {product.pricingModels.length === 1 ? "tier" : "tiers"}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};
