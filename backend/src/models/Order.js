import db from "../config/database.js";

/**
 * Order Model - SQLite implementation
 */
class Order {
  /**
   * Create a new order with items
   * @param {Object} orderData - { tableNumber, queueType, status, notes, items }
   * @returns {Object} Created order with items
   */
  static create(orderData) {
    const {
      tableNumber,
      queueType,
      items,
      status = "Pending",
      notes = "",
    } = orderData;

    // Insert order - Use Thailand timezone (UTC+7)
    const thaiTime = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" })
      .replace(" ", "T");

    const insertOrder = db.prepare(`
      INSERT INTO orders (tableNumber, queueType, status, notes, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertOrder.run(
      tableNumber,
      queueType,
      status,
      notes,
      thaiTime
    );
    const orderId = result.lastInsertRowid;

    // Insert order items
    if (items && items.length > 0) {
      const insertItem = db.prepare(`
        INSERT INTO order_items (orderId, menuItemId, nameThai, nameEnglish, price, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        insertItem.run(
          orderId,
          item.menuItem || item.menuItemId || null,
          item.nameThai,
          item.nameEnglish,
          item.price,
          item.quantity
        );
      }
    }

    return this.getById(orderId);
  }

  /**
   * GetById - Get order by ID
   */
  static getById(id) {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    if (!order) return null;

    const items = db
      .prepare("SELECT * FROM order_items WHERE orderId = ?")
      .all(id);
    return this.toObject(order, items);
  }

  /**
   * GetByQueue - Get orders by queue type and status
   */
  static getByQueue(queueType, status = null) {
    let query = "SELECT * FROM orders WHERE queueType = ?";
    const params = [queueType];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY createdAt ASC"; // FIFO

    const orders = db.prepare(query).all(...params);
    return orders.map((order) => {
      const items = db
        .prepare("SELECT * FROM order_items WHERE orderId = ?")
        .all(order.id);
      return this.toObject(order, items);
    });
  }

  /**
   * GetByTable - Get orders by table number
   */
  static getByTable(tableNumber, status = null) {
    let query = "SELECT * FROM orders WHERE tableNumber = ?";
    const params = [tableNumber];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY createdAt DESC";

    const orders = db.prepare(query).all(...params);
    return orders.map((order) => {
      const items = db
        .prepare("SELECT * FROM order_items WHERE orderId = ?")
        .all(order.id);
      return this.toObject(order, items);
    });
  }

  /**
   * GetCompletedForBilling - Get completed orders for billing (Special queue only)
   */
  static getCompletedForBilling(tableNumber) {
    const orders = db
      .prepare(
        `
      SELECT * FROM orders 
      WHERE tableNumber = ? AND queueType = 'Special' AND status = 'Completed'
      ORDER BY createdAt ASC
    `
      )
      .all(tableNumber);

    return orders.map((order) => {
      const items = db
        .prepare("SELECT * FROM order_items WHERE orderId = ?")
        .all(order.id);
      return this.toObject(order, items);
    });
  }

  /**
   * Mark order as completed
   */
  static complete(orderId) {
    const thaiTime = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" })
      .replace(" ", "T");

    db.prepare(
      `
      UPDATE orders SET status = 'Completed', completedAt = ?
      WHERE id = ?
    `
    ).run(thaiTime, orderId);

    return this.getById(orderId);
  }

  /**
   * UpdateStatus - Update order status
   */
  static updateStatus(orderId, status) {
    if (status === "Completed") {
      const thaiTime = new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" })
        .replace(" ", "T");

      db.prepare(
        `
        UPDATE orders SET status = ?, completedAt = ?
        WHERE id = ?
      `
      ).run(status, thaiTime, orderId);
    } else {
      db.prepare(
        `
        UPDATE orders SET status = ?
        WHERE id = ?
      `
      ).run(status, orderId);
    }

    return this.getById(orderId);
  }

  /**
   * GetAllPendingl pending orders
   */
  static getAllPending() {
    const orders = db
      .prepare(
        `
      SELECT * FROM orders WHERE status = 'Pending' ORDER BY createdAt ASC
    `
      )
      .all();

    return orders.map((order) => {
      const items = db
        .prepare("SELECT * FROM order_items WHERE orderId = ?")
        .all(order.id);
      return this.toObject(order, items);
    });
  }

  /**
   * Delete orders by table number (for cleanup when table closes)
   */
  static deleteByTable(tableNumber) {
    // Get order IDs first
    const orders = db
      .prepare("SELECT id FROM orders WHERE tableNumber = ?")
      .all(tableNumber);

    if (orders.length > 0) {
      // Delete order items (CASCADE should handle this, but explicit is safer)
      const orderIds = orders.map((o) => o.id);
      for (const orderId of orderIds) {
        db.prepare("DELETE FROM order_items WHERE orderId = ?").run(orderId);
      }

      // Delete orders
      db.prepare("DELETE FROM orders WHERE tableNumber = ?").run(tableNumber);
    }

    return orders.length;
  }

  /**
   * Convert to object format (for API compatibility)
   */
  static toObject(order, items = []) {
    if (!order) return null;

    // Parse stored Thai time - already in Thai timezone
    const parseThaiTime = (timeStr) => {
      if (!timeStr) return null;
      // The time is stored as Thai time, return as ISO string with +07:00
      return timeStr.replace("T", " ").replace(" ", "T") + "+07:00";
    };

    return {
      _id: order.id,
      id: order.id,
      tableNumber: order.tableNumber,
      queueType: order.queueType,
      status: order.status,
      notes: order.notes || "",
      items: items.map((item) => ({
        _id: item.id,
        id: item.id,
        menuItem: item.menuItemId,
        menuItemId: item.menuItemId,
        nameThai: item.nameThai,
        nameEnglish: item.nameEnglish,
        price: item.price,
        quantity: item.quantity,
      })),
      createdAt: parseThaiTime(order.createdAt) || new Date().toISOString(),
      completedAt: parseThaiTime(order.completedAt),
    };
  }
}

export default Order;
