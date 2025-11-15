import asyncHandler from "express-async-handler";
import MenuService from "../services/MenuService.js";

/**
 * @route   GET /api/menu
 * @desc    Get all menu items with optional filtering
 * @access  Public
 * @query   category, availability
 */
export const getAllMenuItems = asyncHandler(async (req, res) => {
  const { category, availability } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (availability) filters.availability = availability;

  const menuItems = await MenuService.getAllMenuItems(filters);

  res.status(200).json({
    success: true,
    count: menuItems.length,
    data: menuItems,
  });
});

/**
 * @route   GET /api/menu/:id
 * @desc    Get a specific menu item by ID
 * @access  Public
 * @param   id - Menu item ID
 */
export const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuService.getMenuItemById(id);

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

/**
 * @route   POST /api/menu
 * @desc    Create a new menu item
 * @access  Private (admin only)
 * @body    { category, nameThai, nameEnglish, descriptionThai, descriptionEnglish, price, imageUrl }
 */
export const createMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuService.createMenuItem(req.body);

  res.status(201).json({
    success: true,
    message: "Menu item created successfully",
    data: menuItem,
  });
});

/**
 * @route   PUT /api/menu/:id
 * @desc    Update an existing menu item
 * @access  Private (admin only)
 * @param   id - Menu item ID
 * @body    Fields to update
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuService.updateMenuItem(id, req.body);

  res.status(200).json({
    success: true,
    message: "Menu item updated successfully",
    data: menuItem,
  });
});

/**
 * @route   PATCH /api/menu/:id/availability
 * @desc    Toggle menu item availability
 * @access  Private (admin only)
 * @param   id - Menu item ID
 * @body    { availability: "Available" | "Out of Stock" }
 */
export const toggleAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (!availability) {
    res.status(400);
    throw new Error("Availability status is required");
  }

  const menuItem = await MenuService.toggleAvailability(id, availability);

  res.status(200).json({
    success: true,
    message: `Menu item marked as ${availability}`,
    data: menuItem,
  });
});

/**
 * @route   DELETE /api/menu/:id
 * @desc    Delete a menu item
 * @access  Private (admin only)
 * @param   id - Menu item ID
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuService.deleteMenuItem(id);

  res.status(200).json({
    success: true,
    message: "Menu item deleted successfully",
    data: menuItem,
  });
});

/**
 * @route   GET /api/menu/grouped/category
 * @desc    Get menu items grouped by category (available only)
 * @access  Public
 */
export const getMenuByCategory = asyncHandler(async (req, res) => {
  const grouped = await MenuService.getMenuByCategory();

  res.status(200).json({
    success: true,
    data: grouped,
  });
});
