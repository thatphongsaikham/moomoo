import express from "express";
import {
  getAll,
  getByNumber,
  open,
  reserve,
  cancelReservation,
  close,
  verifyPIN,
} from "../controllers/tableController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no auth required for demo)
router.get("/", getAll);
router.get("/:tableNumber", getByNumber);
router.post("/:tableNumber/verify-pin", verifyPIN);

// Admin routes (temporarily public for demo - TODO: add authentication)
router.post("/:tableNumber/open", open);
router.post("/:tableNumber/reserve", reserve);
router.post("/:tableNumber/cancel-reservation", cancelReservation);
router.post("/:tableNumber/close", close);

export default router;
