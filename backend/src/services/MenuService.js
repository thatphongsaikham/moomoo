import MenuItem from "../models/MenuItem.js";

/**
 * MenuService - Business logic for menu item management
 * Handles CRUD operations, availability toggle, and filtering
 */
class MenuService {
  /**
   * Get all menu items with optional filtering
   * @param {Object} filters - Optional filters { category, availability }
   * @returns {Promise<Array>} Array of menu items
   */
  async getAllMenuItems(filters = {}) {
    const query = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.availability) {
      query.availability = filters.availability;
    }

    const menuItems = await MenuItem.find(query).sort({
      category: 1,
      nameEnglish: 1,
    });
    return menuItems;
  }

  /**
   * Get a specific menu item by ID
   * @param {String} id - Menu item ID
   * @returns {Promise<Object>} Menu item
   */
  async getMenuItemById(id) {
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    return menuItem;
  }

  /**
   * Create a new menu item
   * @param {Object} data - Menu item data
   * @returns {Promise<Object>} Created menu item
   */
  async createMenuItem(data) {
    const {
      category,
      nameThai,
      nameEnglish,
      descriptionThai,
      descriptionEnglish,
      price,
      imageUrl,
    } = data;

    // Validate required fields
    if (!category || !nameThai || !nameEnglish) {
      throw new Error("Category, Thai name, and English name are required");
    }

    // Validate category
    const validCategories = [
      "Starter Buffet",
      "Premium Buffet",
      "Special Menu",
    ];
    if (!validCategories.includes(category)) {
      throw new Error(
        `Invalid category. Must be one of: ${validCategories.join(", ")}`
      );
    }

    // Validate price
    if (price === undefined || price === null || price < 0) {
      throw new Error("Price is required and must be >= 0");
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      category,
      nameThai,
      nameEnglish,
      descriptionThai: descriptionThai || "",
      descriptionEnglish: descriptionEnglish || "",
      price,
      availability: "Available",
      imageUrl: imageUrl || "",
    });

    return menuItem;
  }

  /**
   * Update an existing menu item
   * @param {String} id - Menu item ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated menu item
   */
  async updateMenuItem(id, updates) {
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    // Validate category if provided
    if (updates.category) {
      const validCategories = [
        "Starter Buffet",
        "Premium Buffet",
        "Special Menu",
      ];
      if (!validCategories.includes(updates.category)) {
        throw new Error(
          `Invalid category. Must be one of: ${validCategories.join(", ")}`
        );
      }
    }

    // Validate price if provided
    if (
      updates.price !== undefined &&
      (updates.price === null || updates.price < 0)
    ) {
      throw new Error("Price must be >= 0");
    }

    // Update fields
    const allowedUpdates = [
      "category",
      "nameThai",
      "nameEnglish",
      "descriptionThai",
      "descriptionEnglish",
      "price",
      "imageUrl",
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        menuItem[field] = updates[field];
      }
    });

    await menuItem.save();
    return menuItem;
  }

  /**
   * Toggle menu item availability
   * @param {String} id - Menu item ID
   * @param {String} availability - New availability status
   * @returns {Promise<Object>} Updated menu item
   */
  async toggleAvailability(id, availability) {
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    // Validate availability
    const validAvailability = ["Available", "Out of Stock"];
    if (!validAvailability.includes(availability)) {
      throw new Error(
        `Invalid availability. Must be one of: ${validAvailability.join(", ")}`
      );
    }

    menuItem.availability = availability;
    await menuItem.save();

    return menuItem;
  }

  /**
   * Delete a menu item
   * @param {String} id - Menu item ID
   * @returns {Promise<Object>} Deleted menu item
   */
  async deleteMenuItem(id) {
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    await MenuItem.findByIdAndDelete(id);
    return menuItem;
  }

  /**
   * Get menu items grouped by category
   * @returns {Promise<Object>} Menu items grouped by category
   */
  async getMenuByCategory() {
    const menuItems = await MenuItem.find({ availability: "Available" }).sort({
      category: 1,
      nameEnglish: 1,
    });

    const grouped = {
      "Starter Buffet": [],
      "Premium Buffet": [],
      "Special Menu": [],
    };

    menuItems.forEach((item) => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });

    return grouped;
  }
}

export default new MenuService();
