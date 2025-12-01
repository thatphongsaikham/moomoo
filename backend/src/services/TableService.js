import Table from "../models/Table.js";
import BillingService from "./BillingService.js";
import CryptoJS from "crypto-js";

// Encryption utilities
const SECRET_KEY = process.env.ENCRYPTION_KEY || "moomoo-secret-key-2024";

function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function encryptTableId(tableNumber, sessionTimestamp) {
  // รวม tableNumber และ sessionTimestamp เพื่อให้ link ใช้ได้แค่ session นี้
  const payload = JSON.stringify({ tableNumber, session: sessionTimestamp });
  const encrypted = CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
  // Make URL-safe by replacing special characters
  return encodeURIComponent(encrypted);
}

class TableService {
  /**
   * Open a table for dining
   * @param {number} tableNumber - Table number (1-10)
   * @param {number} customerCount - Number of customers (1-4)
   * @param {string} buffetTier - Buffet tier (Starter or Premium)
   * @returns {Promise<Object>} Updated table with bill reference
   */
  async open(tableNumber, customerCount, buffetTier) {
    const table = Table.getByNumber(tableNumber);

    if (!table) {
      throw new Error("Table not found");
    }

    // Validate table is available
    if (table.status !== "Available") {
      throw new Error(
        `Table is not available (current status: ${table.status})`
      );
    }

    // Validate inputs
    if (customerCount < 1 || customerCount > 4) {
      throw new Error("Customer count must be between 1 and 4");
    }

    const validTiers = ["Starter", "Premium"];
    if (!validTiers.includes(buffetTier)) {
      throw new Error("Buffet tier must be Starter or Premium");
    }

    // Determine buffet price
    const buffetPrice = buffetTier === "Starter" ? 259 : 299;

    // Generate PIN and encrypted ID with session timestamp
    const pin = generatePIN();
    const sessionTimestamp = Date.now();
    const encryptedId = encryptTableId(tableNumber, sessionTimestamp);

    // Update table
    Table.update(tableNumber, {
      status: "Open",
      customerCount,
      buffetTier,
      buffetPrice,
      openedAt: new Date(),
      reservedAt: null,
      reservationExpiresAt: null,
      pin,
      encryptedId,
      currentBillId: null,
    });

    // Create bill for the table
    const bill = await BillingService.createBillForTable(
      tableNumber,
      customerCount,
      buffetTier,
      buffetPrice
    );

    // Update table with bill reference
    const updatedTable = Table.update(tableNumber, {
      currentBillId: bill._id,
    });

    return updatedTable;
  }

  /**
   * Reserve a table for 15 minutes
   * @param {number} tableNumber - Table number (1-10)
   * @param {string} notes - Optional reservation notes
   * @returns {Promise<Object>} Updated table with reservation timestamps
   */
  async reserve(tableNumber, notes = "") {
    const table = Table.getByNumber(tableNumber);

    if (!table) {
      throw new Error("Table not found");
    }

    // Validate table is available
    if (table.status !== "Available") {
      throw new Error(
        `Table is not available (current status: ${table.status})`
      );
    }

    // Set reservation timestamps
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    const updatedTable = Table.update(tableNumber, {
      status: "Reserved",
      reservedAt: now,
      reservationExpiresAt: expiresAt,
    });

    return updatedTable;
  }

  /**
   * Cancel a table reservation
   * @param {number} tableNumber - Table number (1-10)
   * @returns {Promise<Object>} Updated table (Available status)
   */
  async cancelReservation(tableNumber) {
    const table = Table.getByNumber(tableNumber);

    if (!table) {
      throw new Error("Table not found");
    }

    // Validate table is reserved
    if (table.status !== "Reserved") {
      throw new Error(
        `Table is not reserved (current status: ${table.status})`
      );
    }

    // Clear reservation data
    const updatedTable = Table.update(tableNumber, {
      status: "Available",
      reservedAt: null,
      reservationExpiresAt: null,
    });

    return updatedTable;
  }

  /**
   * Close a table after payment
   * This will archive the bill and immediately reset the table to Available status
   * @param {number} tableNumber - Table number (1-10)
   * @returns {Promise<Object>} Updated table and archived bill info
   */
  async close(tableNumber) {
    const table = Table.getByNumber(tableNumber);

    if (!table) {
      throw new Error("Table not found");
    }

    // Validate table is open
    if (table.status !== "Open") {
      throw new Error(`Table is not open (current status: ${table.status})`);
    }

    // Save bill reference and usage history
    const archivedBillId = table.currentBillId;
    const sessionHistory = {
      openedAt: table.openedAt,
      closedAt: new Date(),
      customerCount: table.customerCount,
      buffetTier: table.buffetTier,
      buffetPrice: table.buffetPrice,
      billId: archivedBillId,
    };

    // Archive the bill (only if it exists and not already archived)
    if (archivedBillId) {
      try {
        await BillingService.archiveBill(archivedBillId);
      } catch (error) {
        // If bill is already archived, ignore the error and continue
        if (!error.message.includes("already archived")) {
          throw error;
        }
      }
    }

    // Reset table to Available status immediately (ready for next customer)
    const updatedTable = Table.update(tableNumber, {
      status: "Available",
      customerCount: 0,
      buffetTier: "None",
      buffetPrice: 0,
      openedAt: null,
      closedAt: null,
      reservedAt: null,
      reservationExpiresAt: null,
      currentBillId: null,
      pin: null,
      encryptedId: null,
      diningTimeRemaining: 5400000, // Reset to 90 minutes
    });

    return {
      table: updatedTable,
      archivedBillId,
      sessionHistory,
      message: `Table ${tableNumber} is now available for next customer. Session history saved.`,
    };
  }

  /**
   * Get all tables with optional status filter
   * @param {string} status - Optional status filter
   * @returns {Promise<Array>} Array of tables with calculated fields
   */
  async getAll(status = null) {
    const tables = Table.getAll(status);

    // Add calculated fields
    return tables.map((table) => {
      const tableObj = { ...table };

      // Calculate dining time remaining (90 minutes = 5400000ms)
      if (table.status === "Open" && table.openedAt) {
        const elapsed = Date.now() - new Date(table.openedAt).getTime();
        tableObj.diningTimeRemaining = Math.max(0, 5400000 - elapsed);
      } else {
        tableObj.diningTimeRemaining = 5400000;
      }

      // Calculate reservation time remaining
      if (table.status === "Reserved" && table.reservationExpiresAt) {
        tableObj.reservationTimeRemaining = Math.max(
          0,
          new Date(table.reservationExpiresAt).getTime() - Date.now()
        );
      }

      return tableObj;
    });
  }

  /**
   * Get specific table by number
   * @param {number} tableNumber - Table number (1-10)
   * @returns {Promise<Object>} Table with calculated fields
   */
  async getByNumber(tableNumber) {
    const table = Table.getByNumber(tableNumber);

    if (!table) {
      throw new Error("Table not found");
    }

    const tableObj = { ...table };

    // Calculate dining time remaining
    if (table.status === "Open" && table.openedAt) {
      const elapsed = Date.now() - new Date(table.openedAt).getTime();
      tableObj.diningTimeRemaining = Math.max(0, 5400000 - elapsed);
    } else {
      tableObj.diningTimeRemaining = 5400000;
    }

    // Calculate reservation time remaining
    if (table.status === "Reserved" && table.reservationExpiresAt) {
      tableObj.reservationTimeRemaining = Math.max(
        0,
        new Date(table.reservationExpiresAt).getTime() - Date.now()
      );
    }

    return tableObj;
  }

  /**
   * Set current bill for a table
   * @param {number} tableNumber - Table number
   * @param {number} billId - Bill ID
   * @returns {Promise<Object>} Updated table
   */
  async setCurrentBill(tableNumber, billId) {
    const table = Table.getByNumber(tableNumber);

    if (!table) {
      throw new Error("Table not found");
    }

    return Table.update(tableNumber, { currentBillId: billId });
  }

  /**
   * Verify PIN for a table
   * @param {number} tableNumber - Table number (1-10)
   * @param {string} pin - 4-digit PIN to verify
   * @returns {Promise<Object>} Verification result with encryptedId if valid
   */
  async verifyPIN(tableNumber, pin) {
    const table = Table.getByNumber(tableNumber);

    if (!table) {
      throw new Error("Table not found");
    }

    if (table.status !== "Open") {
      throw new Error(`Table is not open (current status: ${table.status})`);
    }

    if (!table.pin) {
      throw new Error("No PIN set for this table");
    }

    if (table.pin !== pin) {
      return { valid: false, message: "Invalid PIN" };
    }

    return {
      valid: true,
      encryptedId: table.encryptedId,
      tableNumber: table.tableNumber,
      message: "PIN verified successfully",
    };
  }
}

export default new TableService();
