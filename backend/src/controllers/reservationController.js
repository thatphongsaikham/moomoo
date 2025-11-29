import asyncHandler from "express-async-handler";
import ReservationService from "../services/ReservationService.js";

/**
 * @route   POST /api/reservations
 * @desc    Create a new reservation
 * @access  Public
 */
export const createReservation = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, partySize, tableId } = req.body;

  const reservation = await ReservationService.createReservation({
    customerName,
    customerPhone,
    partySize,
    tableId,
  });

  res.status(201).json({
    success: true,
    message: "Reservation created successfully",
    data: reservation,
  });
});

/**
 * @route   GET /api/reservations
 * @desc    Get all active reservations
 * @access  Public
 */
export const getActiveReservations = asyncHandler(async (req, res) => {
  const reservations = await ReservationService.getActiveReservations();

  res.status(200).json({
    success: true,
    count: reservations.length,
    data: reservations,
  });
});

/**
 * @route   GET /api/reservations/all
 * @desc    Get all reservations (including history)
 * @access  Public
 * @query   status - Optional filter by status
 */
export const getAllReservations = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const reservations = await ReservationService.getAllReservations(status);

  res.status(200).json({
    success: true,
    count: reservations.length,
    data: reservations,
  });
});

/**
 * @route   GET /api/reservations/:id
 * @desc    Get a specific reservation by ID
 * @access  Public
 */
export const getReservationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reservation = await ReservationService.getReservationById(id);

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

/**
 * @route   PATCH /api/reservations/:id/cancel
 * @desc    Cancel a reservation
 * @access  Public
 */
export const cancelReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reservation = await ReservationService.cancelReservation(id);

  res.status(200).json({
    success: true,
    message: "Reservation cancelled successfully",
    data: reservation,
  });
});

/**
 * @route   PATCH /api/reservations/:id/convert
 * @desc    Convert reservation to open table
 * @access  Public
 */
export const convertToOpenTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customerCount, buffetTier } = req.body;

  if (!customerCount || !buffetTier) {
    res.status(400);
    throw new Error("Customer count and buffet tier are required");
  }

  const result = await ReservationService.convertToOpenTable(
    id,
    customerCount,
    buffetTier
  );

  res.status(200).json({
    success: true,
    message: "Reservation converted to open table",
    data: result,
  });
});

/**
 * @route   GET /api/reservations/stats
 * @desc    Get waitlist statistics
 * @access  Public
 */
export const getWaitlistStats = asyncHandler(async (req, res) => {
  const stats = await ReservationService.getWaitlistStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});
