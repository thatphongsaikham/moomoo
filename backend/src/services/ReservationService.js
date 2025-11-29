import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";

/**
 * ReservationService - Manage table reservations and waitlist
 */
class ReservationService {
  /**
   * Create a new reservation
   * @param {Object} data - { customerName, customerPhone, partySize, tableId? }
   * @returns {Promise<Object>} Created reservation
   */
  async createReservation(data) {
    const { customerName, customerPhone, partySize, tableId } = data;

    if (!customerName || !partySize) {
      throw new Error("Customer name and party size are required");
    }

    if (partySize < 1 || partySize > 10) {
      throw new Error("Party size must be between 1 and 10");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    const reservation = await Reservation.create({
      customerName,
      customerPhone: customerPhone || "",
      partySize,
      reservationTime: now,
      expiresAt,
      table: tableId || null,
    });

    // If specific table provided, mark it as reserved
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: "Reserved",
        reservedAt: now,
        reservationExpiresAt: expiresAt,
      });
    }

    return reservation.populate("table");
  }

  /**
   * Get all active reservations
   * @returns {Promise<Array>} List of active reservations
   */
  async getActiveReservations() {
    const now = new Date();
    const reservations = await Reservation.find({
      status: "Active",
      expiresAt: { $gt: now },
    })
      .populate("table")
      .sort({ reservationTime: 1 });

    return reservations;
  }

  /**
   * Get all reservations (active + history)
   * @param {String} status - Filter by status (optional)
   * @returns {Promise<Array>} Reservations
   */
  async getAllReservations(status = null) {
    const query = {};
    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate("table")
      .sort({ reservationTime: -1 });

    return reservations;
  }

  /**
   * Get reservation by ID
   * @param {String} reservationId
   * @returns {Promise<Object>} Reservation
   */
  async getReservationById(reservationId) {
    const reservation = await Reservation.findById(reservationId).populate("table");

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    return reservation;
  }

  /**
   * Cancel a reservation
   * @param {String} reservationId
   * @returns {Promise<Object>} Cancelled reservation
   */
  async cancelReservation(reservationId) {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.status !== "Active") {
      throw new Error(`Cannot cancel ${reservation.status} reservation`);
    }

    reservation.status = "Cancelled";
    await reservation.save();

    // Free up the table if it was reserved
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, {
        status: "Available",
        reservedAt: null,
        reservationExpiresAt: null,
      });
    }

    return reservation;
  }

  /**
   * Convert reservation to open table
   * @param {String} reservationId
   * @param {Number} customerCount
   * @param {String} buffetTier - "Starter" or "Premium"
   * @returns {Promise<Object>} { reservation, table }
   */
  async convertToOpenTable(reservationId, customerCount, buffetTier) {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.status !== "Active") {
      throw new Error(`Cannot convert ${reservation.status} reservation`);
    }

    // Find or use reserved table
    let table;
    if (reservation.table) {
      table = await Table.findById(reservation.table);
    } else {
      // Find first available table if no specific table was reserved
      table = await Table.findOne({ status: "Available" });
      if (!table) {
        throw new Error("No available tables");
      }
    }

    // Get buffet price based on tier
    const buffetPrices = {
      Starter: 259,
      Premium: 299,
    };

    const buffetPrice = buffetPrices[buffetTier] || 0;
    const now = new Date();

    // Open the table
    table.status = "Open";
    table.customerCount = customerCount;
    table.buffetTier = buffetTier;
    table.buffetPrice = buffetPrice;
    table.openedAt = now;
    table.diningTimeRemaining = 90 * 60 * 1000; // 90 minutes in ms
    table.reservedAt = null;
    table.reservationExpiresAt = null;
    await table.save();

    // Mark reservation as converted
    reservation.status = "Converted";
    reservation.table = table._id;
    await reservation.save();

    return {
      reservation: await reservation.populate("table"),
      table,
    };
  }

  /**
   * Auto-expire old reservations (called by cron job)
   * @returns {Promise<Number>} Count of expired reservations
   */
  async expireOldReservations() {
    const now = new Date();

    const result = await Reservation.updateMany(
      {
        status: "Active",
        expiresAt: { $lte: now },
      },
      {
        status: "Expired",
        updatedAt: now,
      }
    );

    // Free up tables for expired reservations
    const expiredReservations = await Reservation.find({
      status: "Expired",
      updatedAt: now,
    });

    for (const res of expiredReservations) {
      if (res.table) {
        await Table.findByIdAndUpdate(res.table, {
          status: "Available",
          reservedAt: null,
          reservationExpiresAt: null,
        });
      }
    }

    return result.modifiedCount;
  }

  /**
   * Get waitlist statistics
   * @returns {Promise<Object>} Stats
   */
  async getWaitlistStats() {
    const total = await Reservation.countDocuments();
    const active = await Reservation.countDocuments({ status: "Active" });
    const waitingPartySize = await Reservation.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: null, total: { $sum: "$partySize" } } },
    ]);

    return {
      totalReservations: total,
      activeReservations: active,
      totalPeopleWaiting: waitingPartySize[0]?.total || 0,
    };
  }
}

export default new ReservationService();
