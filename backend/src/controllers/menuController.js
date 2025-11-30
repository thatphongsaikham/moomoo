import asyncHandler from "express-async-handler";
import MenuService from "../services/MenuService.js";

/**
 * @route   GET /api/menu
 * @desc    Get all menu items grouped by category
 * @access  Public
 * @query   available - If true, only return available items
 */
export const getAllMenuItems = asyncHandler(async (req, res) => {
  const { available } = req.query;
  const availableOnly = available === "true";

  const menuItems = MenuService.getAllMenuItems(availableOnly);

  res.status(200).json({
    success: true,
    data: menuItems,
  });
});

/**
 * @route   GET /api/menu/:category
 * @desc    Get menu items by category
 * @access  Public
 * @param   category - 'Starter', 'Premium', or 'Special'
 */
export const getMenuByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { available } = req.query;
  const availableOnly = available === "true";

  const menuItems = MenuService.getMenuByCategory(category, availableOnly);

  res.status(200).json({
    success: true,
    count: menuItems.length,
    data: menuItems,
  });
});

/**
 * @route   GET /api/menu/:category/:id
 * @desc    Get a specific menu item by category and ID
 * @access  Public
 */
export const getMenuItemById = asyncHandler(async (req, res) => {
  const { category, id } = req.params;

  const menuItem = MenuService.getMenuItemById(category, parseInt(id));

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

/**
 * @route   POST /api/menu/:category
 * @desc    Create a new menu item in a category
 * @access  Private (admin only)
 * @body    { name, description, imageUrl, foodType, price (Special only), isAvailable }
 */
export const createMenuItem = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const menuItem = MenuService.createMenuItem(category, req.body);

  res.status(201).json({
    success: true,
    message: "Menu item created successfully",
    data: menuItem,
  });
});

/**
 * @route   PUT /api/menu/:category/:id
 * @desc    Update an existing menu item
 * @access  Private (admin only)
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const { category, id } = req.params;

  const menuItem = MenuService.updateMenuItem(category, parseInt(id), req.body);

  res.status(200).json({
    success: true,
    message: "Menu item updated successfully",
    data: menuItem,
  });
});

/**
 * @route   PATCH /api/menu/:category/:id/availability
 * @desc    Toggle menu item availability
 * @access  Private (admin only)
 * @body    { isAvailable: boolean }
 */
export const toggleAvailability = asyncHandler(async (req, res) => {
  const { category, id } = req.params;
  const { isAvailable } = req.body;

  if (isAvailable === undefined) {
    res.status(400);
    throw new Error("isAvailable is required");
  }

  const menuItem = MenuService.toggleAvailability(
    category,
    parseInt(id),
    isAvailable
  );

  res.status(200).json({
    success: true,
    message: `Menu item ${isAvailable ? "enabled" : "disabled"} successfully`,
    data: menuItem,
  });
});

/**
 * @route   DELETE /api/menu/:category/:id
 * @desc    Delete a menu item
 * @access  Private (admin only)
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { category, id } = req.params;

  const menuItem = MenuService.deleteMenuItem(category, parseInt(id));

  res.status(200).json({
    success: true,
    message: "Menu item deleted successfully",
    data: menuItem,
  });
});
