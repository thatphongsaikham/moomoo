import express from "express";
import {
  getAllTables,
  getTableByNumber,
  openTable,
  reserveTable,
  cancelReservation,
  closeTable,
} from "../controllers/tableController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no auth required for demo)
router.get("/", getAllTables);
router.get("/:tableNumber", getTableByNumber);

// Admin routes (temporarily public for demo - TODO: add authentication)
router.post("/:tableNumber/open", openTable);
router.post("/:tableNumber/reserve", reserveTable);
router.post("/:tableNumber/cancel-reservation", cancelReservation);
router.post("/:tableNumber/close", closeTable);

export default router;
