// Menu Service - Handles all menu-related API calls
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class MenuService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add any auth tokens here if needed
        console.log(
          `Making ${config.method?.toUpperCase()} request to ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error("Response error:", error);
        // Network error or backend not available
        if (
          error.code === "ERR_NETWORK" ||
          error.code === "ERR_CONNECTION_REFUSED"
        ) {
          console.warn(
            "Backend server not available - this is expected in development mode"
          );
        } else if (error.response?.status === 404) {
          console.warn("Menu endpoint not found - using fallback data");
        }
        return Promise.reject(error);
      }
    );
  }

  // Get menu by tier (259 or 299)
  async getMenuByTier(tier) {
    try {
      const response = await this.api.get(`/menu/tier/${tier}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch menu by tier:", error);
      throw new Error(
        `Unable to load menu tier ${tier}. Please check your connection and try again.`
      );
    }
  }

  // Get all menu items
  async getAllMenuItems() {
    try {
      const response = await this.api.get("/menu");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch all menu items:", error);
      throw error;
    }
  }

  // Get special items (paid additions)
  async getSpecialItems() {
    try {
      const response = await this.api.get("/menu/special");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch special items:", error);
      throw error;
    }
  }

  // Get menu categories
  async getCategories() {
    try {
      const response = await this.api.get("/menu/categories");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  }

  // Filter menu items by category
  filterItemsByCategory(items, category) {
    if (category === "all") return items;

    return items.filter((item) => {
      const itemCategory = item.category.toLowerCase();
      const searchCategory = category.toLowerCase();

      // Handle category matching with variations
      return (
        itemCategory.includes(searchCategory) ||
        itemCategory.includes(searchCategory.replace("(พรีเมียม)", "")) ||
        itemCategory.includes(searchCategory.replace("พิเศษ", ""))
      );
    });
  }

  // Calculate total price for items with quantities
  calculateTotal(items, quantities) {
    return items.reduce((total, item) => {
      const quantity = quantities[item.id] || 0;
      return total + item.price * quantity;
    }, 0);
  }

  // Group items by category
  groupItemsByCategory(items) {
    return items.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});
  }

  // Search menu items
  searchItems(items, query) {
    if (!query) return items;

    const searchTerm = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.nameEn.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
  }

  // Menu management functions for admin
  async addMenuItem(menuItemData) {
    try {
      const response = await this.api.post("/menu", menuItemData);
      return response.data;
    } catch (error) {
      console.error("Failed to add menu item:", error);
      throw new Error("Failed to add menu item. Please try again.");
    }
  }

  async updateMenuItem(id, menuItemData) {
    try {
      const response = await this.api.put(`/menu/${id}`, menuItemData);
      return response.data;
    } catch (error) {
      console.error("Failed to update menu item:", error);
      throw new Error("Failed to update menu item. Please try again.");
    }
  }

  async deleteMenuItem(id) {
    try {
      await this.api.delete(`/menu/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      throw new Error("Failed to delete menu item. Please try again.");
    }
  }
}

// Create singleton instance
const menuService = new MenuService();

export default menuService;
