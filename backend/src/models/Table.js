import db from "../config/database.js";

/**
 * Table Model - SQLite implementation
 */
class Table {
  /**
   * GetAll - Get all tables with optional status filter
   */
  static getAll(status = null) {
    let query = "SELECT * FROM tables";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY tableNumber ASC";

    const tables = db.prepare(query).all(...params);
    return tables.map((t) => this.toObject(t));
  }

  /**
   * GetByNumber - Get table by tableNumber
   */
  static getByNumber(tableNumber) {
    const table = db
      .prepare("SELECT * FROM tables WHERE tableNumber = ?")
      .get(tableNumber);
    return this.toObject(table);
  }

  /**
   * GetById - Get table by ID
   */
  static getById(id) {
    const table = db.prepare("SELECT * FROM tables WHERE id = ?").get(id);
    return this.toObject(table);
  }

  /**
   * GetByStatus - Get tables by status
   */
  static getByStatus(status) {
    const tables = db
      .prepare("SELECT * FROM tables WHERE status = ? ORDER BY tableNumber ASC")
      .all(status);
    return tables.map((t) => this.toObject(t));
  }

  /**
   * GetOne - Get one table matching query
   */
  static getOne(query) {
    if (query.tableNumber) {
      return this.getByNumber(query.tableNumber);
    }
    if (query.status) {
      const tables = this.getByStatus(query.status);
      return tables[0] || null;
    }
    return null;
  }

  /**
   * Update a table
   */
  static update(tableNumber, data) {
    const fields = [];
    const values = [];

    const allowedFields = [
      "status",
      "customerCount",
      "buffetTier",
      "buffetPrice",
      "openedAt",
      "closedAt",
      "diningTimeRemaining",
      "reservedAt",
      "reservationExpiresAt",
      "currentBillId",
      "pin",
      "encryptedId",
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        // Convert Date objects to ISO strings
        if (value instanceof Date) {
          values.push(value.toISOString());
        } else if (value === null) {
          values.push(null);
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return null;

    fields.push("updatedAt = datetime('now')");
    values.push(tableNumber);

    const query = `UPDATE tables SET ${fields.join(
      ", "
    )} WHERE tableNumber = ?`;
    db.prepare(query).run(...values);

    return this.getByNumber(tableNumber);
  }

  /**
   * UpdateById - Update by ID
   */
  static updateById(id, data) {
    const table = this.getById(id);
    if (!table) return null;
    return this.update(table.tableNumber, data);
  }

  /**
   * Convert to object format (for compatibility)
   */
  static toObject(table) {
    if (!table) return null;
    return {
      _id: table.id,
      id: table.id,
      tableNumber: table.tableNumber,
      status: table.status,
      customerCount: table.customerCount,
      buffetTier: table.buffetTier,
      buffetPrice: table.buffetPrice,
      openedAt: table.openedAt ? new Date(table.openedAt) : null,
      closedAt: table.closedAt ? new Date(table.closedAt) : null,
      diningTimeRemaining: table.diningTimeRemaining,
      reservedAt: table.reservedAt ? new Date(table.reservedAt) : null,
      reservationExpiresAt: table.reservationExpiresAt
        ? new Date(table.reservationExpiresAt)
        : null,
      currentBill: table.currentBillId,
      currentBillId: table.currentBillId,
      pin: table.pin,
      encryptedId: table.encryptedId,
      updatedAt: table.updatedAt ? new Date(table.updatedAt) : null,
    };
  }
}

export default Table;
