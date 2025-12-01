import db from "../config/database.js";

/**
 * MenuItem Model - SQLite implementation
 * Combines data from starter_menu, premium_menu, and special_menu tables
 */
class MenuItem {
  /**
   * GetById - Get menu item by ID (category:id format or just id with category prefix)
   * ID format: "starter_1", "premium_2", "special_3"
   */
  static getById(id) {
    if (!id) return null;

    // Parse the ID to determine category and actual ID
    const idStr = String(id);
    let category, actualId;

    if (idStr.startsWith("starter_")) {
      category = "Starter Buffet";
      actualId = parseInt(idStr.replace("starter_", ""));
    } else if (idStr.startsWith("premium_")) {
      category = "Premium Buffet";
      actualId = parseInt(idStr.replace("premium_", ""));
    } else if (idStr.startsWith("special_")) {
      category = "Special Menu";
      actualId = parseInt(idStr.replace("special_", ""));
    } else {
      // Try to find in special_menu first (most common for orders)
      const special = db
        .prepare("SELECT * FROM special_menu WHERE id = ?")
        .get(id);
      if (special) {
        return this.toObject(special, "Special Menu", "special");
      }
      return null;
    }

    // Get from appropriate table
    const tableName = this.getTableName(category);
    const prefix = this.getPrefix(category);
    const item = db
      .prepare(`SELECT * FROM ${tableName} WHERE id = ?`)
      .get(actualId);

    return item ? this.toObject(item, category, prefix) : null;
  }

  /**
   * GetAll - Get all menu items
   */
  static getAll() {
    const items = [];

    // Get starter items
    const starters = db.prepare("SELECT * FROM starter_menu ORDER BY id").all();
    for (const item of starters) {
      items.push(this.toObject(item, "Starter Buffet", "starter"));
    }

    // Get premium items
    const premiums = db.prepare("SELECT * FROM premium_menu ORDER BY id").all();
    for (const item of premiums) {
      items.push(this.toObject(item, "Premium Buffet", "premium"));
    }

    // Get special items
    const specials = db.prepare("SELECT * FROM special_menu ORDER BY id").all();
    for (const item of specials) {
      items.push(this.toObject(item, "Special Menu", "special"));
    }

    return items;
  }

  /**
   * GetByCategory - Get items by category
   */
  static getByCategory(category) {
    const tableName = this.getTableName(category);
    const prefix = this.getPrefix(category);

    if (!tableName) return [];

    const items = db.prepare(`SELECT * FROM ${tableName} ORDER BY id`).all();
    return items.map((item) => this.toObject(item, category, prefix));
  }

  /**
   * GetAvailableByCategory - Get available items by category
   */
  static getAvailableByCategory(category) {
    const tableName = this.getTableName(category);
    const prefix = this.getPrefix(category);

    if (!tableName) return [];

    const items = db
      .prepare(`SELECT * FROM ${tableName} WHERE isAvailable = 1 ORDER BY id`)
      .all();
    return items.map((item) => this.toObject(item, category, prefix));
  }

  /**
   * Get table name for category
   */
  static getTableName(category) {
    switch (category) {
      case "Starter Buffet":
      case "Starter":
        return "starter_menu";
      case "Premium Buffet":
      case "Premium":
        return "premium_menu";
      case "Special Menu":
      case "Special":
        return "special_menu";
      default:
        return null;
    }
  }

  /**
   * Get ID prefix for category
   */
  static getPrefix(category) {
    switch (category) {
      case "Starter Buffet":
      case "Starter":
        return "starter";
      case "Premium Buffet":
      case "Premium":
        return "premium";
      case "Special Menu":
      case "Special":
        return "special";
      default:
        return "";
    }
  }

  /**
   * Update availability
   */
  static updateAvailability(id, isAvailable) {
    const idStr = String(id);
    let tableName, actualId;

    if (idStr.startsWith("starter_")) {
      tableName = "starter_menu";
      actualId = parseInt(idStr.replace("starter_", ""));
    } else if (idStr.startsWith("premium_")) {
      tableName = "premium_menu";
      actualId = parseInt(idStr.replace("premium_", ""));
    } else if (idStr.startsWith("special_")) {
      tableName = "special_menu";
      actualId = parseInt(idStr.replace("special_", ""));
    } else {
      return null;
    }

    db.prepare(
      `UPDATE ${tableName} SET isAvailable = ?, updatedAt = datetime('now') WHERE id = ?`
    ).run(isAvailable ? 1 : 0, actualId);

    return this.getById(id);
  }

  /**
   * Convert to object format (for API compatibility)
   */
  static toObject(item, category, prefix) {
    if (!item) return null;

    const isSpecial = category === "Special Menu";

    return {
      _id: `${prefix}_${item.id}`,
      id: `${prefix}_${item.id}`,
      category: category,
      nameThai: item.name,
      nameEnglish: item.name, // Using same name for both (can be enhanced later)
      descriptionThai: item.description || "",
      descriptionEnglish: item.description || "",
      price: isSpecial ? item.price || 0 : 0,
      availability: item.isAvailable ? "Available" : "Unavailable",
      imageUrl: item.imageUrl || "",
      foodType: item.foodType || "",
    };
  }
}

export default MenuItem;
