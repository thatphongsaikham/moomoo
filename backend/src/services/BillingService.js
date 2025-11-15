import Bill from "../models/Bill.js";
import TableService from "./TableService.js";

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
   * Create a new bill for a table
   * @param {number} tableNumber - Table number (1-10)
   * @param {number} customerCount - Number of customers (1-4)
   * @param {string} buffetTier - Buffet tier (Starter or Premium)
   * @param {number} buffetPricePerPerson - Price per person
   * @returns {Promise<Object>} Created bill
   */
  async createBillForTable(
    tableNumber,
    customerCount,
    buffetTier,
    buffetPricePerPerson
  ) {
    // Check for existing active bill
    const existingBill = await Bill.findOne({
      tableNumber,
      status: "Active",
    });

    if (existingBill) {
      throw new Error(`Active bill already exists for table ${tableNumber}`);
    }

    // Calculate buffet charges
    const buffetCharges = customerCount * buffetPricePerPerson;

    // Calculate VAT
    const { preVatSubtotal, vatAmount } = calculateVAT(buffetCharges);

    // Create bill
    const bill = new Bill({
      tableNumber,
      customerCount,
      buffetTier,
      buffetPricePerPerson,
      buffetCharges,
      specialItems: [],
      specialItemsTotal: 0,
      total: buffetCharges,
      preVatSubtotal,
      vatAmount,
      paymentMethod: "Unpaid",
      status: "Active",
    });

    await bill.save();

    // Update table's currentBill reference
    await TableService.setCurrentBill(tableNumber, bill._id);

    return bill;
  }

  /**
   * Get active bill for a table
   * @param {number} tableNumber - Table number (1-10)
   * @returns {Promise<Object|null>} Active bill or null if not found
   */
  async getActiveBillForTable(tableNumber) {
    const bill = await Bill.findOne({
      tableNumber,
      status: "Active",
    });

    // Return null instead of throwing error - this is a valid state
    return bill;
  }

  /**
   * Get bill by ID
   * @param {string} billId - Bill MongoDB ObjectId
   * @returns {Promise<Object>} Bill
   */
  async getBillById(billId) {
    const bill = await Bill.findById(billId);

    if (!bill) {
      throw new Error("Bill not found");
    }

    return bill;
  }

  /**
   * Get historical bills with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} { data, pagination }
   */
  async getHistoricalBills(filters = {}) {
    const { tableNumber, startDate, endDate, limit = 50, page = 1 } = filters;

    const query = { status: "Archived" };

    if (tableNumber) {
      query.tableNumber = parseInt(tableNumber);
    }

    if (startDate || endDate) {
      query.archivedAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of day
        query.archivedAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        query.archivedAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .sort({ archivedAt: -1 })
        .limit(limit)
        .skip(skip)
        .select(
          "tableNumber customerCount buffetTier buffetCharges specialItemsTotal total preVatSubtotal vatAmount status createdAt archivedAt"
        ),
      Bill.countDocuments(query),
    ]);

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
   * Add special menu item to bill
   * @param {string} billId - Bill MongoDB ObjectId
   * @param {Object} item - Item details
   * @returns {Promise<Object>} Updated bill
   */
  async addItemToBill(billId, item) {
    const bill = await Bill.findById(billId);

    if (!bill) {
      throw new Error("Bill not found");
    }

    if (bill.status !== "Active") {
      throw new Error("Cannot modify archived bill");
    }

    // Calculate subtotal
    const subtotal = item.price * item.quantity;

    // Add item to specialItems
    bill.specialItems.push({
      menuItem: item.menuItem,
      nameThai: item.nameThai,
      nameEnglish: item.nameEnglish,
      price: item.price,
      quantity: item.quantity,
      subtotal,
    });

    // Recalculate totals
    bill.specialItemsTotal = bill.specialItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    bill.total = bill.buffetCharges + bill.specialItemsTotal;

    // Recalculate VAT
    const { preVatSubtotal, vatAmount } = calculateVAT(bill.total);
    bill.preVatSubtotal = preVatSubtotal;
    bill.vatAmount = vatAmount;

    await bill.save();

    return bill;
  }

  /**
   * Archive a bill (mark as paid and close)
   * @param {string} billId - Bill MongoDB ObjectId
   * @param {string} paymentMethod - Payment method used
   * @returns {Promise<Object>} Archived bill
   */
  async archiveBill(billId) {
    const bill = await Bill.findById(billId);

    if (!bill) {
      throw new Error("Bill not found");
    }

    if (bill.status === "Archived") {
      throw new Error("Bill is already archived");
    }

    // Archive bill
    bill.status = "Archived";
    bill.archivedAt = new Date();

    await bill.save();

    return bill;
  }

  /**
   * Get printable bill format
   * @param {number} tableNumber - Table number (1-10)
   * @returns {Promise<Object>} Printable bill data
   */
  async getPrintableBill(tableNumber) {
    const bill = await this.getActiveBillForTable(tableNumber);

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
        paymentMethod: bill.paymentMethod,
      },
    };
  }
}

export default new BillingService();
