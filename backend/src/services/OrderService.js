import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";
import Bill from "../models/Bill.js";

/**
 * OrderService - Business logic for order management
 * Handles order placement and queue assignment
 * Uses SQLite (synchronous operations)
 */
class OrderService {
  /**
   * Create - Place a new order and assign to appropriate queue
   * @param {Number} tableNumber - Table number (1-10)
   * @param {Array} items - Array of {menuItem: String, quantity: Number}
   * @param {String} notes - Optional order notes
   * @returns {Object} Created order
   */
  create(tableNumber, items, notes = "") {
    // Validate table exists and is open
    const table = Table.getByNumber(tableNumber);
    if (!table) {
      throw new Error(`Table ${tableNumber} not found`);
    }
    if (table.status !== "Open") {
      throw new Error(`Table ${tableNumber} is not open for orders`);
    }

    // Enrich items and split by category
    const normalItems = [];
    const specialItems = [];

    for (const item of items) {
      const menuItem = MenuItem.getById(item.menuItem);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItem} not found`);
      }
      if (menuItem.availability !== "Available") {
        throw new Error(
          `${menuItem.nameEnglish} is currently ${menuItem.availability}`
        );
      }
      const enriched = {
        menuItem: menuItem._id,
        nameThai: menuItem.nameThai,
        nameEnglish: menuItem.nameEnglish,
        price: menuItem.price,
        quantity: item.quantity,
      };
      if (menuItem.category === "Special Menu") {
        specialItems.push(enriched);
      } else {
        normalItems.push(enriched);
      }
    }

    const createdOrders = [];

    if (normalItems.length > 0) {
      const normalOrder = Order.create({
        tableNumber,
        queueType: "Normal",
        items: normalItems,
        status: "Pending",
        notes: notes || "",
      });
      createdOrders.push(normalOrder);
    }

    if (specialItems.length > 0) {
      const specialOrder = Order.create({
        tableNumber,
        queueType: "Special",
        items: specialItems,
        status: "Pending",
        notes: notes || "",
      });
      createdOrders.push(specialOrder);

      // เพิ่มเมนู Special ลงบิลเพื่อคิดเงินตอนปิดโต๊ะ
      const activeBill = Bill.findActiveByTable(tableNumber);
      if (activeBill) {
        for (const item of specialItems) {
          Bill.addSpecialItem(activeBill._id, {
            menuItemId: item.menuItem,
            nameThai: item.nameThai,
            nameEnglish: item.nameEnglish,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          });
        }
      }
    }

    // ถ้ามีแค่ normal หรือ special จะ return ออเดอร์เดียว ถ้ามีทั้งสอง return array
    return createdOrders.length === 1 ? createdOrders[0] : createdOrders;
  }

  /**
   * GetByQueue - Get all pending orders for a specific queue
   * @param {String} queueType - 'Normal' or 'Special'
   * @returns {Array} Orders sorted by FIFO (createdAt ascending)
   */
  getByQueue(queueType) {
    return Order.getByQueue(queueType, "Pending");
  }

  /**
   * GetNormalQueue - Get all pending orders in Normal queue
   * @returns {Array} Orders sorted by FIFO
   */
  getNormalQueue() {
    return this.getByQueue("Normal");
  }

  /**
   * GetSpecialQueue - Get all pending orders in Special queue
   * @returns {Array} Orders sorted by FIFO
   */
  getSpecialQueue() {
    return this.getByQueue("Special");
  }

  /**
   * GetByTable - Get all orders for a specific table
   * @param {Number} tableNumber - Table number
   * @returns {Array} Orders for the table
   */
  getByTable(tableNumber) {
    return Order.getByTable(tableNumber);
  }

  /**
   * Complete - Mark an order as completed
   * @param {String|Number} orderId - Order ID
   * @returns {Object} Updated order
   */
  complete(orderId) {
    const order = Order.getById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "Completed") {
      throw new Error("Order is already completed");
    }

    return Order.complete(orderId);
  }

  /**
   * GetCompletedForBilling - Get all completed orders for a table (for billing)
   * @param {Number} tableNumber - Table number
   * @returns {Array} Completed orders with special items only
   */
  getCompletedForBilling(tableNumber) {
    return Order.getCompletedForBilling(tableNumber);
  }
}

export default new OrderService();
