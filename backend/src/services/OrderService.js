import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";

/**
 * OrderService - Business logic for order management
 * Handles order placement and queue assignment
 */
class OrderService {
  /**
   * Place a new order and assign to appropriate queue
   * @param {Number} tableNumber - Table number (1-10)
   * @param {Array} items - Array of {menuItem: ObjectId, quantity: Number}
   * @param {String} notes - Optional order notes
   * @returns {Object} Created order
   */
  async placeOrder(tableNumber, items, notes = "") {
    // Validate table exists and is open
    const table = await Table.findOne({ tableNumber });
    if (!table) {
      throw new Error(`Table ${tableNumber} not found`);
    }
    if (table.status !== "Open") {
      throw new Error(`Table ${tableNumber} is not open for orders`);
    }

    // Validate and enrich items with menu data
    const enrichedItems = [];
    let hasSpecialItems = false;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItem} not found`);
      }

      if (menuItem.availability !== "Available") {
        throw new Error(
          `${menuItem.nameEnglish} is currently ${menuItem.availability}`
        );
      }

      // Check if this is a special menu item (not buffet)
      if (menuItem.category === "Special Menu") {
        hasSpecialItems = true;
      }

      enrichedItems.push({
        menuItem: menuItem._id,
        nameThai: menuItem.nameThai,
        nameEnglish: menuItem.nameEnglish,
        price: menuItem.price,
        quantity: item.quantity,
      });
    }

    // Determine queue type based on items
    // Normal Queue: Only buffet items OR no special items
    // Special Queue: Contains at least one special menu item
    const queueType = hasSpecialItems ? "Special" : "Normal";

    // Create order
    const order = await Order.create({
      tableNumber,
      queueType,
      items: enrichedItems,
      status: "Pending",
      notes: notes || "",
    });

    return order;
  }

  /**
   * Get all pending orders for a specific queue
   * @param {String} queueType - 'Normal' or 'Special'
   * @returns {Array} Orders sorted by FIFO (createdAt ascending)
   */
  async getQueueOrders(queueType) {
    const orders = await Order.find({
      queueType,
      status: "Pending",
    })
      .sort({ createdAt: 1 }) // FIFO - oldest first
      .lean();

    return orders;
  }

  /**
   * Get all pending orders in Normal queue
   * @returns {Array} Orders sorted by FIFO
   */
  async getNormalQueue() {
    return this.getQueueOrders("Normal");
  }

  /**
   * Get all pending orders in Special queue
   * @returns {Array} Orders sorted by FIFO
   */
  async getSpecialQueue() {
    return this.getQueueOrders("Special");
  }

  /**
   * Get all orders for a specific table
   * @param {Number} tableNumber - Table number
   * @returns {Array} Orders for the table
   */
  async getTableOrders(tableNumber) {
    const orders = await Order.find({ tableNumber })
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return orders;
  }

  /**
   * Mark an order as completed
   * @param {String} orderId - Order ID
   * @returns {Object} Updated order
   */
  async completeOrder(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "Completed") {
      throw new Error("Order is already completed");
    }

    order.status = "Completed";
    order.completedAt = new Date();
    await order.save();

    return order;
  }

  /**
   * Get all completed orders for a table (for billing)
   * @param {Number} tableNumber - Table number
   * @returns {Array} Completed orders with special items only
   */
  async getCompletedOrdersForBilling(tableNumber) {
    const orders = await Order.find({
      tableNumber,
      status: "Completed",
      queueType: "Special", // Only special items are billed separately
    })
      .sort({ completedAt: 1 })
      .lean();

    return orders;
  }
}

export default new OrderService();
