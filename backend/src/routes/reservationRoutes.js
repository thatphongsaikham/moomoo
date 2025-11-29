import express from "express";
import {
  createReservation,
  getActiveReservations,
  getAllReservations,
  getReservationById,
  cancelReservation,
  convertToOpenTable,
  getWaitlistStats,
} from "../controllers/reservationController.js";

const router = express.Router();

// Public routes
router.post("/", createReservation); // Create new reservation
router.get("/", getActiveReservations); // Get active reservations
router.get("/all", getAllReservations); // Get all reservations (including history)
router.get("/stats", getWaitlistStats); // Get waitlist statistics
router.get("/:id", getReservationById); // Get specific reservation
router.patch("/:id/cancel", cancelReservation); // Cancel reservation
router.patch("/:id/convert", convertToOpenTable); // Convert to open table

export default router;
