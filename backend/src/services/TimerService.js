import cron from "node-cron";
import Table from "../models/Table.js";
import TableService from "./TableService.js";

class TimerService {
  /**
   * Initialize cron jobs for timer management
   */
  initializeCronJobs() {
    // Run every 30 seconds to check timers
    cron.schedule("*/30 * * * * *", async () => {
      try {
        await this.checkDiningTimers();
        await this.checkReservationTimers();
      } catch (error) {
        console.error("❌ Timer service error:", error.message);
      }
    });

    console.log("✅ Timer service initialized (checking every 30 seconds)");
  }

  /**
   * Check dining timers and warn when approaching 90 minutes
   */
  async checkDiningTimers() {
    const openTables = Table.getByStatus("Open");

    for (const table of openTables) {
      if (!table.openedAt) continue;

      const elapsed = Date.now() - new Date(table.openedAt).getTime();
      const remaining = 5400000 - elapsed; // 90 minutes = 5400000ms

      // Warning at 10 minutes remaining (5 minutes before expiry)
      if (remaining <= 600000 && remaining > 570000) {
        console.log(
          `⚠️  Table ${table.tableNumber}: 10 minutes remaining (${Math.floor(
            remaining / 60000
          )} min)`
        );
      }

      // Warning at 5 minutes remaining
      if (remaining <= 300000 && remaining > 270000) {
        console.log(
          `⚠️  Table ${table.tableNumber}: 5 minutes remaining (${Math.floor(
            remaining / 60000
          )} min)`
        );
      }

      // Time expired
      if (remaining <= 0) {
        console.log(
          `❌ Table ${table.tableNumber}: Dining time expired (${Math.floor(
            Math.abs(remaining) / 60000
          )} min overtime)`
        );
      }
    }
  }

  /**
   * Check reservation timers and auto-release expired reservations
   */
  async checkReservationTimers() {
    const reservedTables = Table.getByStatus("Reserved");

    for (const table of reservedTables) {
      if (!table.reservationExpiresAt) continue;

      const remaining =
        new Date(table.reservationExpiresAt).getTime() - Date.now();

      // Auto-release expired reservations
      if (remaining <= 0) {
        console.log(
          `⏰ Auto-releasing expired reservation for table ${table.tableNumber}`
        );

        try {
          await TableService.cancelReservation(table.tableNumber);
          console.log(
            `✅ Table ${table.tableNumber} released (reservation expired)`
          );
        } catch (error) {
          console.error(
            `❌ Failed to release table ${table.tableNumber}:`,
            error.message
          );
        }
      }

      // Warning at 5 minutes remaining
      if (remaining <= 300000 && remaining > 270000) {
        console.log(
          `⚠️  Table ${table.tableNumber} reservation: 5 minutes remaining`
        );
      }

      // Warning at 2 minutes remaining
      if (remaining <= 120000 && remaining > 90000) {
        console.log(
          `⚠️  Table ${table.tableNumber} reservation: 2 minutes remaining`
        );
      }
    }
  }

  /**
   * Get real-time timer status for all tables
   * @returns {Promise<Array>} Array of table timer statuses
   */
  async getTimerStatuses() {
    const tables = Table.getAll();

    return tables.map((table) => {
      const status = {
        tableNumber: table.tableNumber,
        status: table.status,
        diningTimeRemaining: null,
        reservationTimeRemaining: null,
        isOvertime: false,
        isExpiringSoon: false,
      };

      // Calculate dining timer
      if (table.status === "Open" && table.openedAt) {
        const elapsed = Date.now() - new Date(table.openedAt).getTime();
        const remaining = 5400000 - elapsed;

        status.diningTimeRemaining = remaining;
        status.isOvertime = remaining < 0;
        status.isExpiringSoon = remaining > 0 && remaining <= 600000; // 10 min warning
      }

      // Calculate reservation timer
      if (table.status === "Reserved" && table.reservationExpiresAt) {
        const remaining =
          new Date(table.reservationExpiresAt).getTime() - Date.now();

        status.reservationTimeRemaining = Math.max(0, remaining);
        status.isExpiringSoon = remaining > 0 && remaining <= 300000; // 5 min warning
      }

      return status;
    });
  }
}

export default new TimerService();
