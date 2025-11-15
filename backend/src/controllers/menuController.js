import Menu from "../models/Menu.js";

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find({ isAvailable: true });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get menu items by tier
export const getMenuByTier = async (req, res) => {
  try {
    const { tier } = req.params;
    const menuItems = await Menu.find({ tier, isAvailable: true });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get special items (paid additions)
export const getSpecialItems = async (req, res) => {
  try {
    const specialItems = await Menu.find({
      isSpecial: true,
      isAvailable: true,
    });
    res.json(specialItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get menu categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Menu.distinct("category");
    const categoriesData = [
      { id: "all", name: "ทั้งหมด", nameEn: "All Items" },
      ...categories.map((cat) => ({
        id: cat.toLowerCase().replace(/\s+/g, "-"),
        name: cat,
        nameEn: cat,
      })),
    ];
    res.json(categoriesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new menu item
export const addMenuItem = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.category) {
      return res.status(400).json({
        message: "Missing required fields: name and category are required",
      });
    }

    // Clean up the data
    const menuData = {
      name: req.body.name,
      nameEn: req.body.nameEn || req.body.name,
      price: parseFloat(req.body.price) || 0,
      category: req.body.category,
      description: req.body.description || "",
      tier: req.body.tier || "standard",
      isSpecial: req.body.isSpecial || false,
      imageUrl: req.body.imageUrl || "",
      isAvailable:
        req.body.isAvailable !== undefined ? req.body.isAvailable : true,
    };

    const menuItem = new Menu(menuData);
    const savedItem = await menuItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(400).json({
      message: error.message || "Failed to add menu item",
      details: error.errors
        ? Object.keys(error.errors).map((key) => error.errors[key].message)
        : [],
    });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete menu item (soft delete by setting isAvailable to false)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Menu.findByIdAndUpdate(
      id,
      { isAvailable: false },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
