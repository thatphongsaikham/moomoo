import express from "express";
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  getMenuByCategory,
} from "../controllers/menuController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllMenuItems); // Get all menu items with optional filters
router.get("/grouped/category", getMenuByCategory); // Get menu grouped by category
router.get("/:id", getMenuItemById); // Get specific menu item

// Admin-only routes
router.post("/", authMiddleware, adminOnly, createMenuItem); // Create menu item
router.put("/:id", authMiddleware, adminOnly, updateMenuItem); // Update menu item
router.patch(
  "/:id/availability",
  authMiddleware,
  adminOnly,
  toggleAvailability
); // Toggle availability
router.delete("/:id", authMiddleware, adminOnly, deleteMenuItem); // Delete menu item

export default router;
