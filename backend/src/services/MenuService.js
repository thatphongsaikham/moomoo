import MenuItem from "../models/MenuItem.js";
import db from "../config/database.js";

/**
 * MenuService - Business logic for menu item management
 * Handles 3 separate menu categories: Starter, Premium, Special
 * Uses SQLite (synchronous operations)
 */
class MenuService {
  /**
   * Get all menu items grouped by category
   * @param {Boolean} availableOnly - Only return available items
   * @returns {Object} { starter: [], premium: [], special: [] }
   */
  getAllMenuItems(availableOnly = false) {
    // Return menu items grouped by category
    const allItems = MenuItem.findAll();

    const grouped = {
      starter: [],
      premium: [],
      special: [],
    };

    for (const item of allItems) {
      // Convert API format to frontend format
      const formattedItem = {
        id: item.id,
        _id: item._id,
        name: item.nameThai,
        description: item.descriptionThai || "",
        foodType: item.foodType || "",
        imageUrl: item.imageUrl || "",
        price: item.price || 0,
        isAvailable: item.availability === "Available",
        category: item.category,
      };

      if (item.category === "Starter Buffet") {
        grouped.starter.push(formattedItem);
      } else if (item.category === "Premium Buffet") {
        grouped.premium.push(formattedItem);
      } else if (item.category === "Special Menu") {
        grouped.special.push(formattedItem);
      }
    }

    return grouped;
  }

  /**
   * Get menu items by category
   * @param {String} category - Category name (Starter, Premium, Special)
   * @param {Boolean} availableOnly - Only return available items
   * @returns {Array} Menu items in category
   */
  getMenuByCategory(category, availableOnly = false) {
    // Map short category names to full names
    const categoryMap = {
      Starter: "Starter Buffet",
      Premium: "Premium Buffet",
      Special: "Special Menu",
    };

    const fullCategory = categoryMap[category] || category;

    if (availableOnly) {
      return MenuItem.findAvailableByCategory(fullCategory);
    }
    return MenuItem.findByCategory(fullCategory);
  }

  /**
   * Get a specific menu item by category and ID
   * @param {String} category - Category name
   * @param {Number} id - Menu item ID
   * @returns {Object} Menu item
   */
  getMenuItemById(category, id) {
    // Build the composite ID
    const prefix = category.toLowerCase();
    const compositeId = `${prefix}_${id}`;

    const menuItem = MenuItem.findById(compositeId);
    if (!menuItem) {
      throw new Error("Menu item not found");
    }
    return menuItem;
  }

  /**
   * Create a new menu item
   * @param {String} category - Category name
   * @param {Object} data - Menu item data
   * @returns {Object} Created menu item
   */
  createMenuItem(category, data) {
    const { name, description, imageUrl, foodType, price, isAvailable } = data;

    // Validate required fields
    if (!name) {
      throw new Error("Name is required");
    }

    // Validate category
    const validCategories = ["Starter", "Premium", "Special"];
    if (!validCategories.includes(category)) {
      throw new Error(
        `Invalid category. Must be one of: ${validCategories.join(", ")}`
      );
    }

    // Validate price for Special menu
    if (category === "Special" && (price === undefined || price < 0)) {
      throw new Error("Price is required for Special menu and must be >= 0");
    }

    // Get table name
    const tableMap = {
      Starter: "starter_menu",
      Premium: "premium_menu",
      Special: "special_menu",
    };
    const tableName = tableMap[category];
    const prefix = category.toLowerCase();

    // Insert into database
    let result;
    if (category === "Special") {
      result = db
        .prepare(
          `
        INSERT INTO ${tableName} (name, description, imageUrl, foodType, price, isAvailable, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `
        )
        .run(
          name,
          description || "",
          imageUrl || "",
          foodType || "",
          price,
          isAvailable !== false ? 1 : 0
        );
    } else {
      result = db
        .prepare(
          `
        INSERT INTO ${tableName} (name, description, imageUrl, foodType, isAvailable, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `
        )
        .run(
          name,
          description || "",
          imageUrl || "",
          foodType || "",
          isAvailable !== false ? 1 : 0
        );
    }

    return MenuItem.findById(`${prefix}_${result.lastInsertRowid}`);
  }

  /**
   * Update an existing menu item
   * @param {String} category - Category name
   * @param {Number} id - Menu item ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated menu item
   */
  updateMenuItem(category, id, updates) {
    const prefix = category.toLowerCase();
    const compositeId = `${prefix}_${id}`;

    const menuItem = MenuItem.findById(compositeId);
    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    // Validate price for Special menu
    if (
      category === "Special" &&
      updates.price !== undefined &&
      updates.price < 0
    ) {
      throw new Error("Price must be >= 0");
    }

    // Get table name
    const tableMap = {
      Starter: "starter_menu",
      Premium: "premium_menu",
      Special: "special_menu",
    };
    const tableName = tableMap[category];

    // Build update query
    const fields = [];
    const values = [];
    const allowedFields = [
      "name",
      "description",
      "imageUrl",
      "foodType",
      "price",
      "isAvailable",
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === "isAvailable") {
          fields.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (fields.length > 0) {
      fields.push("updatedAt = datetime('now')");
      values.push(id);
      db.prepare(
        `UPDATE ${tableName} SET ${fields.join(", ")} WHERE id = ?`
      ).run(...values);
    }

    return MenuItem.findById(compositeId);
  }

  /**
   * Toggle menu item availability
   * @param {String} category - Category name
   * @param {Number} id - Menu item ID
   * @param {Boolean} isAvailable - New availability status
   * @returns {Object} Updated menu item
   */
  toggleAvailability(category, id, isAvailable) {
    const prefix = category.toLowerCase();
    const compositeId = `${prefix}_${id}`;

    const menuItem = MenuItem.findById(compositeId);
    if (!menuItem) {
      throw new Error("Menu item not found");
    }
    return MenuItem.updateAvailability(compositeId, isAvailable);
  }

  /**
   * Delete a menu item
   * @param {String} category - Category name
   * @param {Number} id - Menu item ID
   * @returns {Object} Deleted menu item
   */
  deleteMenuItem(category, id) {
    const prefix = category.toLowerCase();
    const compositeId = `${prefix}_${id}`;

    const menuItem = MenuItem.findById(compositeId);
    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    // Get table name
    const tableMap = {
      Starter: "starter_menu",
      Premium: "premium_menu",
      Special: "special_menu",
    };
    const tableName = tableMap[category];

    db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(id);

    return menuItem;
  }

  /**
   * Get all items as flat array (for compatibility)
   * @param {Boolean} availableOnly - Only return available items
   * @returns {Array} All menu items
   */
  getAllItemsFlat(availableOnly = false) {
    return MenuItem.findAll();
  }
}

export default new MenuService();
