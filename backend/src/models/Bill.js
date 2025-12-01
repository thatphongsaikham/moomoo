import db from "../config/database.js";

/**
 * Bill Model - SQLite implementation
 */
class Bill {
  /**
   * Create a new bill
   */
  static create(data) {
    const {
      tableNumber,
      customerCount,
      buffetTier,
      buffetPricePerPerson,
      buffetCharges,
      specialItemsTotal = 0,
      total,
      preVatSubtotal,
      vatAmount,
      status = "Active",
    } = data;

    const result = db
      .prepare(
        `
      INSERT INTO bills (tableNumber, customerCount, buffetTier, buffetPricePerPerson, 
                        buffetCharges, specialItemsTotal, total, preVatSubtotal, vatAmount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        tableNumber,
        customerCount,
        buffetTier,
        buffetPricePerPerson,
        buffetCharges,
        specialItemsTotal,
        total,
        preVatSubtotal,
        vatAmount,
        status
      );

    return this.getById(result.lastInsertRowid);
  }

  /**
   * GetById - Get bill by ID
   */
  static getById(id) {
    const bill = db.prepare("SELECT * FROM bills WHERE id = ?").get(id);
    if (!bill) return null;

    // Get special items
    const specialItems = db
      .prepare("SELECT * FROM bill_special_items WHERE billId = ?")
      .all(id);

    return this.toObject(bill, specialItems);
  }

  /**
   * GetActiveByTable - Get active bill for a table
   */
  static getActiveByTable(tableNumber) {
    const bill = db
      .prepare(
        "SELECT * FROM bills WHERE tableNumber = ? AND status = 'Active'"
      )
      .get(tableNumber);

    if (!bill) return null;

    const specialItems = db
      .prepare("SELECT * FROM bill_special_items WHERE billId = ?")
      .all(bill.id);
    return this.toObject(bill, specialItems);
  }

  /**
   * GetOne - Get one bill matching query
   */
  static getOne(query) {
    if (query.tableNumber && query.status) {
      if (query.status === "Active") {
        return this.getActiveByTable(query.tableNumber);
      }
    }
    return null;
  }

  /**
   * GetAll - Get all bills with optional filters
   */
  static getAll(filters = {}) {
    let query = "SELECT * FROM bills WHERE 1=1";
    const params = [];

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.tableNumber) {
      query += " AND tableNumber = ?";
      params.push(filters.tableNumber);
    }

    query += " ORDER BY createdAt DESC";

    if (filters.limit) {
      query += " LIMIT ?";
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += " OFFSET ?";
      params.push(filters.offset);
    }

    const bills = db.prepare(query).all(...params);

    return bills.map((bill) => {
      const specialItems = db
        .prepare("SELECT * FROM bill_special_items WHERE billId = ?")
        .all(bill.id);
      return this.toObject(bill, specialItems);
    });
  }

  /**
   * Count - Count bills with optional filters
   */
  static count(filters = {}) {
    let query = "SELECT COUNT(*) as count FROM bills WHERE 1=1";
    const params = [];

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.tableNumber) {
      query += " AND tableNumber = ?";
      params.push(filters.tableNumber);
    }

    return db.prepare(query).get(...params).count;
  }

  /**
   * Add special item to bill
   */
  static addSpecialItem(billId, item) {
    const { menuItemId, nameThai, nameEnglish, price, quantity, subtotal } =
      item;

    db.prepare(
      `
      INSERT INTO bill_special_items (billId, menuItemId, nameThai, nameEnglish, price, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(billId, menuItemId, nameThai, nameEnglish, price, quantity, subtotal);

    // Recalculate totals
    return this.recalculateTotals(billId);
  }

  /**
   * Recalculate bill totals
   */
  static recalculateTotals(billId) {
    const bill = db.prepare("SELECT * FROM bills WHERE id = ?").get(billId);
    if (!bill) return null;

    const specialItemsResult = db
      .prepare(
        "SELECT SUM(subtotal) as total FROM bill_special_items WHERE billId = ?"
      )
      .get(billId);

    const specialItemsTotal = specialItemsResult.total || 0;
    const total = bill.buffetCharges + specialItemsTotal;
    const preVatSubtotal = parseFloat((total / 1.07).toFixed(2));
    const vatAmount = parseFloat((total - preVatSubtotal).toFixed(2));

    db.prepare(
      `
      UPDATE bills SET specialItemsTotal = ?, total = ?, preVatSubtotal = ?, vatAmount = ?
      WHERE id = ?
    `
    ).run(specialItemsTotal, total, preVatSubtotal, vatAmount, billId);

    return this.getById(billId);
  }

  /**
   * Archive - Archive a bill
   */
  static archive(billId) {
    db.prepare(
      `
      UPDATE bills SET status = 'Archived', archivedAt = datetime('now')
      WHERE id = ?
    `
    ).run(billId);

    return this.getById(billId);
  }

  /**
   * UpdateById - Update bill by ID
   */
  static updateById(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = ["status", "archivedAt"];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (value instanceof Date) {
          values.push(value.toISOString());
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return this.getById(id);

    values.push(id);
    db.prepare(`UPDATE bills SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values
    );

    return this.getById(id);
  }

  /**
   * Convert to object format (for compatibility)
   */
  static toObject(bill, specialItems = []) {
    if (!bill) return null;
    return {
      _id: bill.id,
      id: bill.id,
      tableNumber: bill.tableNumber,
      customerCount: bill.customerCount,
      buffetTier: bill.buffetTier,
      buffetPricePerPerson: bill.buffetPricePerPerson,
      buffetCharges: bill.buffetCharges,
      specialItems: specialItems.map((item) => ({
        _id: item.id,
        menuItem: item.menuItemId,
        nameThai: item.nameThai,
        nameEnglish: item.nameEnglish,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      specialItemsTotal: bill.specialItemsTotal,
      total: bill.total,
      preVatSubtotal: bill.preVatSubtotal,
      vatAmount: bill.vatAmount,
      status: bill.status,
      createdAt: bill.createdAt ? new Date(bill.createdAt) : null,
      archivedAt: bill.archivedAt ? new Date(bill.archivedAt) : null,
    };
  }
}

export default Bill;
