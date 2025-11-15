import express from "express";
import {
  getActiveBillForTable,
  getBillById,
  getHistoricalBills,
  createBillForTable,
  addItemToBill,
  archiveBill,
  getPrintableBill,
} from "../controllers/billController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public/Admin routes
router.get("/table/:tableNumber", getActiveBillForTable);
router.get("/table/:tableNumber/print", getPrintableBill);
router.get("/history", getHistoricalBills);
router.get("/:id", getBillById);

// Internal routes (called by system)
router.post("/table/:tableNumber", createBillForTable);
router.patch("/:id/add-item", addItemToBill);

// Admin routes
router.patch("/:id/archive", archiveBill);

export default router;
