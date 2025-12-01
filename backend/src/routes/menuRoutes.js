import express from "express";
import {
  getAll,
  getByCategory,
  getById,
  create,
  update,
  toggleAvailability,
  remove,
} from "../controllers/menuController.js";
// TODO: Re-enable auth when login system is ready
// import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAll); // Get all menu items (grouped by category)
router.get("/:category", getByCategory); // Get items by category (Starter/Premium/Special)
router.get("/:category/:id", getById); // Get specific menu item

// Admin routes (temporarily without auth for development)
router.post("/:category", create); // Create menu item in category
router.put("/:category/:id", update); // Update menu item
router.patch("/:category/:id/availability", toggleAvailability); // Toggle availability
router.delete("/:category/:id", remove); // Delete menu item

export default router;
