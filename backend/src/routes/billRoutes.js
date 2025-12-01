import express from "express";
import {
  getActiveByTable,
  getById,
  getHistory,
  create,
  addItem,
  archive,
  getPrintable,
} from "../controllers/billController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public/Admin routes
router.get("/table/:tableNumber", getActiveByTable);
router.get("/table/:tableNumber/print", getPrintable);
router.get("/history", getHistory);
router.get("/:id", getById);

// Internal routes (called by system)
router.post("/table/:tableNumber", create);
router.patch("/:id/add-item", addItem);

// Admin routes
router.patch("/:id/archive", archive);

export default router;
