import asyncHandler from "express-async-handler";
import OrderService from "../services/OrderService.js";

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Public (no auth required for customer orders)
 * @body    { tableNumber: Number, items: [{menuItem: String, quantity: Number}], notes: String }
 */
export const createOrder = asyncHandler(async (req, res) => {
  console.log("รับ request สั่งอาหาร:", req.body);
  const { tableNumber, items, notes } = req.body;

  // Validation
  if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
    console.error("ข้อมูลไม่ครบ:", { tableNumber, items });
    res.status(400);
    throw new Error("Table number and items array are required");
  }

  // Validate table number range
  if (tableNumber < 1 || tableNumber > 10) {
    console.error("เลขโต๊ะผิด:", tableNumber);
    res.status(400);
    throw new Error("Table number must be between 1 and 10");
  }

  // Validate items structure
  for (const item of items) {
    if (!item.menuItem || !item.quantity || item.quantity < 1) {
      console.error("ข้อมูลเมนูผิด:", item);
      res.status(400);
      throw new Error("Each item must have menuItem ID and quantity >= 1");
    }
  }

  // Create order via service
  let order;
  try {
    order = await OrderService.placeOrder(tableNumber, items, notes);
    console.log("สร้างออเดอร์สำเร็จ:", order);
  } catch (err) {
    console.error("เกิด error ใน OrderService.placeOrder:", err);
    throw err;
  }

  res.status(201).json({
    success: true,
    message: `Order placed in ${order.queueType} queue`,
    data: order,
  });
});

/**
 * @route   GET /api/orders/queue/:queueType
 * @desc    Get all pending orders for a specific queue
 * @access  Private (admin only)
 * @param   queueType - 'Normal' or 'Special'
 */
export const getQueueOrders = asyncHandler(async (req, res) => {
  const { queueType } = req.params;

  if (!["Normal", "Special"].includes(queueType)) {
    res.status(400);
    throw new Error("Queue type must be Normal or Special");
  }

  const orders = await OrderService.getQueueOrders(queueType);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @route   GET /api/orders/table/:tableNumber
 * @desc    Get all orders for a specific table
 * @access  Public (customers can view their table's orders)
 * @param   tableNumber - Table number (1-10)
 */
export const getTableOrders = asyncHandler(async (req, res) => {
  const tableNumber = parseInt(req.params.tableNumber);

  if (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 10) {
    res.status(400);
    throw new Error("Invalid table number");
  }

  const orders = await OrderService.getTableOrders(tableNumber);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @route   PATCH /api/orders/:id/complete
 * @desc    Mark an order as completed
 * @access  Private (admin only)
 * @param   id - Order ID
 */
export const completeOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await OrderService.completeOrder(id);

  res.status(200).json({
    success: true,
    message: "Order marked as completed",
    data: order,
  });
});
