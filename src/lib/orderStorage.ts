import { Order } from "@/types/orders";

const STORAGE_KEY_PREFIX = "smart-page-orders-";

/**
 * Get all orders for a specific website
 */
export const getOrders = (websiteId: string): Order[] => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${websiteId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as Order[];
  } catch (error) {
    console.error("Failed to get orders:", error);
    return [];
  }
};

/**
 * Save orders for a specific website
 */
export const saveOrders = (websiteId: string, orders: Order[]): void => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${websiteId}`;
    localStorage.setItem(key, JSON.stringify(orders));
  } catch (error) {
    console.error("Failed to save orders:", error);
  }
};

/**
 * Add a new order
 */
export const addOrder = (order: Order): void => {
  const orders = getOrders(order.websiteId);
  orders.push(order);
  saveOrders(order.websiteId, orders);
};

/**
 * Update an existing order
 */
export const updateOrder = (websiteId: string, orderId: string, updates: Partial<Order>): Order | null => {
  const orders = getOrders(websiteId);
  const index = orders.findIndex(o => o.id === orderId);

  if (index === -1) {
    console.error(`Order ${orderId} not found`);
    return null;
  }

  const updatedOrder = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  orders[index] = updatedOrder;
  saveOrders(websiteId, orders);

  return updatedOrder;
};

/**
 * Get a single order by ID
 */
export const getOrder = (websiteId: string, orderId: string): Order | null => {
  const orders = getOrders(websiteId);
  return orders.find(o => o.id === orderId) || null;
};

/**
 * Delete an order
 */
export const deleteOrder = (websiteId: string, orderId: string): boolean => {
  const orders = getOrders(websiteId);
  const filtered = orders.filter(o => o.id !== orderId);

  if (filtered.length === orders.length) {
    return false; // Order not found
  }

  saveOrders(websiteId, filtered);
  return true;
};

/**
 * Generate next order number for a website
 */
export const generateOrderNumber = (websiteId: string): string => {
  const orders = getOrders(websiteId);
  const year = new Date().getFullYear();
  const count = orders.length + 1;
  return `ORD-${year}-${String(count).padStart(4, "0")}`;
};
