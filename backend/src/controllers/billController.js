import asyncHandler from "express-async-handler";
import BillingService from "../services/BillingService.js";

/**
 * @route GET /api/bills/table/:tableNumber
 * @desc Get active bill for a table
 * @access Public
 */
export const getActiveByTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const bill = await BillingService.getActiveByTable(parseInt(tableNumber));

  res.json({
    success: true,
    data: bill,
  });
});

/**
 * @route GET /api/bills/:id
 * @desc Get bill by ID
 * @access Public
 */
export const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bill = await BillingService.getById(id);

  res.json({
    success: true,
    data: bill,
  });
});

/**
 * @route GET /api/bills/history
 * @desc Get historical bills with filters
 * @access Admin
 */
export const getHistory = asyncHandler(async (req, res) => {
  const filters = {
    tableNumber: req.query.tableNumber,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    limit: parseInt(req.query.limit) || 50,
    page: parseInt(req.query.page) || 1,
  };

  const result = await BillingService.getHistory(filters);

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * @route POST /api/bills/table/:tableNumber
 * @desc Create bill for a table
 * @access Internal (called by TableService)
 */
export const create = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { customerCount, buffetTier, buffetPricePerPerson } = req.body;

  // Validation
  if (!customerCount || !buffetTier || !buffetPricePerPerson) {
    res.status(422);
    throw new Error("Customer count, buffet tier, and price are required");
  }

  const bill = await BillingService.create(
    parseInt(tableNumber),
    customerCount,
    buffetTier,
    buffetPricePerPerson
  );

  res.status(201).json({
    success: true,
    data: bill,
    message: `Bill created for table ${tableNumber}`,
  });
});

/**
 * @route PATCH /api/bills/:id/add-item
 * @desc Add special menu item to bill
 * @access Internal (called by OrderService)
 */
export const addItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { menuItem, nameThai, nameEnglish, price, quantity } = req.body;

  // Validation
  if (!nameThai || !nameEnglish || price === undefined || !quantity) {
    res.status(422);
    throw new Error("All item fields are required");
  }

  const bill = await BillingService.addItem(id, {
    menuItem,
    nameThai,
    nameEnglish,
    price,
    quantity,
  });

  res.json({
    success: true,
    data: bill,
    message: "Item added to bill",
  });
});

/**
 * @route PATCH /api/bills/:id/archive
 * @desc Archive bill (mark as paid)
 * @access Admin
 */
export const archive = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bill = await BillingService.archive(id);

  res.json({
    success: true,
    data: {
      _id: bill._id,
      tableNumber: bill.tableNumber,
      total: bill.total,
      status: bill.status,
      createdAt: bill.createdAt,
      archivedAt: bill.archivedAt,
    },
    message: "Bill archived successfully",
  });
});

/**
 * @route GET /api/bills/table/:tableNumber/print
 * @desc Get printable bill format
 * @access Public
 */
export const getPrintable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const printableBill = await BillingService.getPrintable(
    parseInt(tableNumber)
  );

  res.json({
    success: true,
    data: printableBill,
  });
});
