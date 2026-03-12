export type CategoryType =
  | "fashion-apparel"
  | "grocery-consumables"
  | "general-merchandise"
  | "home-electronics"
  | "health-beauty"
  | "books-stationery"
  | "custom";

export interface ProductCategory {
  id: string;
  name: string;
  type?: CategoryType;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
  productCount?: number;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryConfig {
  enabled: boolean;
  categories: ProductCategory[];
  allowCustomCategories: boolean;
  displayMode: "tabs" | "sidebar" | "dropdown";
}
