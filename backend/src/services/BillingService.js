import Bill from "../models/Bill.js";
import Table from "../models/Table.js";

/**
 * Calculate VAT breakdown from total (7% VAT included in prices)
 * @param {number} totalIncludingVAT - Total amount including VAT
 * @returns {Object} { preVatSubtotal, vatAmount }
 */
export const calculateVAT = (totalIncludingVAT) => {
  // Round to 2 decimal places at each step
  const preVatSubtotal = parseFloat((totalIncludingVAT / 1.07).toFixed(2));
  const vatAmount = parseFloat((totalIncludingVAT - preVatSubtotal).toFixed(2));

  return { preVatSubtotal, vatAmount };
};

class BillingService {
  /**
   * Create - Create a new bill for a table
   * @param {number} tableNumber - Table number (1-10)
   * @param {number} customerCount - Number of customers (1-4)
   * @param {string} buffetTier - Buffet tier (Starter or Premium)
   * @param {number} buffetPricePerPerson - Price per person
   * @returns {Promise<Object>} Created bill
   */
  async create(tableNumber, customerCount, buffetTier, buffetPricePerPerson) {
    // Check for existing active bill
    const existingBill = Bill.getActiveByTable(tableNumber);

    if (existingBill) {
      throw new Error(`Active bill already exists for table ${tableNumber}`);
    }

    // Calculate buffet charges
    const buffetCharges = customerCount * buffetPricePerPerson;

    // Calculate VAT
    const { preVatSubtotal, vatAmount } = calculateVAT(buffetCharges);

    // Create bill
    const bill = Bill.create({
      tableNumber,
      customerCount,
      buffetTier,
      buffetPricePerPerson,
      buffetCharges,
      specialItemsTotal: 0,
      total: buffetCharges,
      preVatSubtotal,
      vatAmount,
      status: "Active",
    });

    // Update table's currentBill reference
    Table.update(tableNumber, { currentBillId: bill._id });

    return bill;
  }

  /**
   * GetActiveByTable - Get active bill for a table
   * @param {number} tableNumber - Table number (1-10)
   * @returns {Promise<Object|null>} Active bill or null if not found
   */
  async getActiveByTable(tableNumber) {
    const bill = Bill.getActiveByTable(tableNumber);
    // Return null instead of throwing error - this is a valid state
    return bill;
  }

  /**
   * GetById - Get bill by ID
   * @param {string|number} billId - Bill ID
   * @returns {Promise<Object>} Bill
   */
  async getById(billId) {
    const bill = Bill.getById(billId);

    if (!bill) {
      throw new Error("Bill not found");
    }

    return bill;
  }

  /**
   * GetHistory - Get historical bills with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} { data, pagination }
   */
  async getHistory(filters = {}) {
    const { tableNumber, startDate, endDate, limit = 50, page = 1 } = filters;

    const queryFilters = { status: "Archived" };

    if (tableNumber) {
      queryFilters.tableNumber = parseInt(tableNumber);
    }

    const offset = (page - 1) * limit;

    const bills = Bill.getAll({
      ...queryFilters,
      limit,
      offset,
    });

    const total = Bill.count(queryFilters);

    return {
      data: bills,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * AddItem - Add special menu item to bill
   * @param {string|number} billId - Bill ID
   * @param {Object} item - Item details
   * @returns {Promise<Object>} Updated bill
   */
  async addItem(billId, item) {
    const bill = Bill.getById(billId);

    if (!bill) {
      throw new Error("Bill not found");
    }

    if (bill.status !== "Active") {
      throw new Error("Cannot modify archived bill");
    }

    // Calculate subtotal
    const subtotal = item.price * item.quantity;

    // Add item to bill
    return Bill.addSpecialItem(billId, {
      menuItemId: item.menuItem,
      nameThai: item.nameThai,
      nameEnglish: item.nameEnglish,
      price: item.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  /**
   * Archive - Archive a bill (mark as paid and close)
   * @param {string|number} billId - Bill ID
   * @returns {Promise<Object>} Archived bill
   */
  async archive(billId) {
    const bill = Bill.getById(billId);

    if (!bill) {
      throw new Error("Bill not found");
    }

    if (bill.status === "Archived") {
      throw new Error("Bill is already archived");
    }

    // Archive bill
    return Bill.archive(billId);
  }

  /**
   * GetPrintable - Get printable bill format
   * @param {number} tableNumber - Table number (1-10)
   * @returns {Promise<Object>} Printable bill data
   */
  async getPrintable(tableNumber) {
    const bill = await this.getActiveByTable(tableNumber);

    if (!bill) {
      throw new Error("No active bill found for this table");
    }

    // Format items for printing
    const items = [];

    // Add buffet charges
    if (bill.buffetCharges > 0) {
      items.push({
        description: `${bill.buffetTier} Buffet × ${bill.customerCount}`,
        amount: bill.buffetCharges,
      });
    }

    // Add special items
    bill.specialItems.forEach((item) => {
      items.push({
        description: `${item.nameThai} (${item.nameEnglish}) × ${item.quantity}`,
        amount: item.subtotal,
      });
    });

    return {
      restaurant: {
        name: "MOOMOO Restaurant",
        address: "123 Bangkok Street, Thailand",
        phone: "+66 12 345 6789",
        taxId: "0123456789012",
      },
      bill: {
        _id: bill._id,
        tableNumber: bill.tableNumber,
        date: bill.createdAt,
        items,
        subtotal: bill.preVatSubtotal,
        vat: {
          rate: "7%",
          amount: bill.vatAmount,
        },
        total: bill.total,
      },
    };
  }
}

export default new BillingService();
