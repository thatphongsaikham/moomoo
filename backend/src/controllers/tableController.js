import asyncHandler from "express-async-handler";
import TableService from "../services/TableService.js";

/**
 * @route GET /api/tables
 * @desc Get all tables with optional status filter
 * @access Public
 */
export const getAll = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const tables = await TableService.getAll(status);

  res.json({
    success: true,
    data: tables,
  });
});

/**
 * @route GET /api/tables/:tableNumber
 * @desc Get specific table by number
 * @access Public
 */
export const getByNumber = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const table = await TableService.getByNumber(parseInt(tableNumber));

  res.json({
    success: true,
    data: table,
  });
});

/**
 * @route POST /api/tables/:tableNumber/open
 * @desc Open a table for dining
 * @access Admin
 */
export const open = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { customerCount, buffetTier } = req.body;

  // Validation
  if (!customerCount || !buffetTier) {
    res.status(422);
    throw new Error("Customer count and buffet tier are required");
  }

  const table = await TableService.open(
    parseInt(tableNumber),
    customerCount,
    buffetTier
  );

  res.json({
    success: true,
    data: table,
    message: `Table ${tableNumber} opened successfully`,
  });
});

/**
 * @route POST /api/tables/:tableNumber/reserve
 * @desc Reserve a table for 15 minutes
 * @access Admin
 */
export const reserve = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { notes } = req.body;

  const table = await TableService.reserve(parseInt(tableNumber), notes || "");

  res.json({
    success: true,
    data: table,
    message: `Table ${tableNumber} reserved for 15 minutes`,
  });
});

/**
 * @route POST /api/tables/:tableNumber/cancel-reservation
 * @desc Cancel a table reservation
 * @access Admin
 */
export const cancelReservation = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;

  const table = await TableService.cancelReservation(parseInt(tableNumber));

  res.json({
    success: true,
    data: table,
    message: "Reservation cancelled",
  });
});

/**
 * @route POST /api/tables/:tableNumber/close
 * @desc Close a table after payment and reset to Available
 * @access Admin
 */
export const close = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;

  const result = await TableService.close(parseInt(tableNumber));

  res.json({
    success: true,
    data: {
      tableNumber: result.table.tableNumber,
      status: result.table.status, // Now "Available"
      archivedBill: result.archivedBillId,
      sessionHistory: result.sessionHistory,
      updatedAt: result.table.updatedAt,
    },
    message: result.message,
  });
});

/**
 * @route POST /api/tables/:tableNumber/verify-pin
 * @desc Verify PIN for a table to get encrypted ID
 * @access Public
 */
export const verifyPIN = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { pin } = req.body;

  if (!pin) {
    res.status(422);
    throw new Error("PIN is required");
  }

  const result = await TableService.verifyPIN(parseInt(tableNumber), pin);

  if (!result.valid) {
    res.status(401);
    throw new Error(result.message);
  }

  res.json({
    success: true,
    data: result,
    message: result.message,
  });
});
