import { ProductCategory, CategoryType } from "@/types/categories";

const STORAGE_KEY_PREFIX = "smart-page-categories-";

/**
 * Get default categories for e-commerce stores
 */
export const getDefaultCategories = (): ProductCategory[] => {
  const now = new Date().toISOString();

  return [
    {
      id: "cat-fashion-apparel",
      name: "Fashion & Apparel",
      type: "fashion-apparel" as CategoryType,
      description: "Clothing, accessories, and fashion items",
      icon: "shirt",
      order: 1,
      enabled: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "cat-grocery-consumables",
      name: "Grocery & Consumables",
      type: "grocery-consumables" as CategoryType,
      description: "Food, beverages, and daily essentials",
      icon: "shopping-basket",
      order: 2,
      enabled: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "cat-general-merchandise",
      name: "General Merchandise",
      type: "general-merchandise" as CategoryType,
      description: "Variety of general products",
      icon: "package",
      order: 3,
      enabled: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "cat-home-electronics",
      name: "Home & Electronics",
      type: "home-electronics" as CategoryType,
      description: "Electronics, appliances, and home goods",
      icon: "monitor",
      order: 4,
      enabled: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "cat-health-beauty",
      name: "Health & Beauty",
      type: "health-beauty" as CategoryType,
      description: "Personal care and wellness products",
      icon: "heart",
      order: 5,
      enabled: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "cat-books-stationery",
      name: "Books & Stationery",
      type: "books-stationery" as CategoryType,
      description: "Books, notebooks, and office supplies",
      icon: "book-open",
      order: 6,
      enabled: true,
      createdAt: now,
      updatedAt: now
    }
  ];
};

/**
 * Get all categories for a specific website
 */
export const getCategories = (websiteId: string): ProductCategory[] => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${websiteId}`;
    const stored = localStorage.getItem(key);

    if (!stored) {
      // Return default categories for new websites
      const defaults = getDefaultCategories();
      saveCategories(websiteId, defaults);
      return defaults;
    }

    return JSON.parse(stored) as ProductCategory[];
  } catch (error) {
    console.error("Failed to get categories:", error);
    return getDefaultCategories();
  }
};

/**
 * Save categories for a specific website
 */
export const saveCategories = (websiteId: string, categories: ProductCategory[]): void => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${websiteId}`;
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to save categories:", error);
  }
};

/**
 * Add a new category
 */
export const addCategory = (websiteId: string, category: ProductCategory): void => {
  const categories = getCategories(websiteId);
  categories.push(category);
  saveCategories(websiteId, categories);
};

/**
 * Update an existing category
 */
export const updateCategory = (
  websiteId: string,
  categoryId: string,
  updates: Partial<ProductCategory>
): ProductCategory | null => {
  const categories = getCategories(websiteId);
  const index = categories.findIndex(c => c.id === categoryId);

  if (index === -1) {
    console.error(`Category ${categoryId} not found`);
    return null;
  }

  const updatedCategory = {
    ...categories[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  categories[index] = updatedCategory;
  saveCategories(websiteId, categories);

  return updatedCategory;
};

/**
 * Delete a category
 */
export const deleteCategory = (websiteId: string, categoryId: string): boolean => {
  const categories = getCategories(websiteId);
  const filtered = categories.filter(c => c.id !== categoryId);

  if (filtered.length === categories.length) {
    return false; // Category not found
  }

  saveCategories(websiteId, filtered);
  return true;
};

/**
 * Get a single category by ID
 */
export const getCategory = (websiteId: string, categoryId: string): ProductCategory | null => {
  const categories = getCategories(websiteId);
  return categories.find(c => c.id === categoryId) || null;
};

/**
 * Reorder categories
 */
export const reorderCategories = (websiteId: string, categoryIds: string[]): void => {
  const categories = getCategories(websiteId);

  const reordered = categoryIds.map((id, index) => {
    const category = categories.find(c => c.id === id);
    if (!category) return null;
    return { ...category, order: index + 1 };
  }).filter(Boolean) as ProductCategory[];

  saveCategories(websiteId, reordered);
};
