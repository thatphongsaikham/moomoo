import asyncHandler from "express-async-handler";
import TableService from "../services/TableService.js";

/**
 * @route GET /api/tables
 * @desc Get all tables with optional status filter
 * @access Public
 */
export const getAllTables = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const tables = await TableService.getAllTables(status);

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
export const getTableByNumber = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const table = await TableService.getTableByNumber(parseInt(tableNumber));

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
export const openTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { customerCount, buffetTier } = req.body;

  // Validation
  if (!customerCount || !buffetTier) {
    res.status(422);
    throw new Error("Customer count and buffet tier are required");
  }

  const table = await TableService.openTable(
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
export const reserveTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { notes } = req.body;

  const table = await TableService.reserveTable(
    parseInt(tableNumber),
    notes || ""
  );

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
export const closeTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;

  const result = await TableService.closeTable(parseInt(tableNumber));

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
