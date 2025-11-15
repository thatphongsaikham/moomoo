import express from "express";
import {
  createOrder,
  getQueueOrders,
  getTableOrders,
  completeOrder,
} from "../controllers/orderController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no auth required)
router.post("/", createOrder); // Customers can place orders
router.get("/table/:tableNumber", getTableOrders); // Customers can view their table's orders

// Admin-only routes
router.get("/queue/:queueType", authMiddleware, adminOnly, getQueueOrders); // View queue orders
router.patch("/:id/complete", authMiddleware, adminOnly, completeOrder); // Mark order complete

export default router;
