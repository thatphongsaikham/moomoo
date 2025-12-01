import express from "express";
import {
  create,
  getByQueue,
  getByTable,
  complete,
} from "../controllers/orderController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no auth required)
router.post("/", create); // Customers can place orders
router.get("/table/:tableNumber", getByTable); // Customers can view their table's orders

// Admin-only routes
router.get("/queue/:queueType", authMiddleware, adminOnly, getByQueue); // View queue orders
router.patch("/:id/complete", authMiddleware, adminOnly, complete); // Mark order complete

export default router;
