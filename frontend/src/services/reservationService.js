import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ReservationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Response error:", error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new reservation
   * @param {Object} data - { customerName, customerPhone, partySize, tableId? }
   */
  async createReservation(data) {
    try {
      const response = await this.api.post("/reservations", data);
      return response.data;
    } catch (error) {
      console.error("Failed to create reservation:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create reservation"
      );
    }
  }

  /**
   * Get all active reservations
   */
  async getActiveReservations() {
    try {
      const response = await this.api.get("/reservations");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch active reservations:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservations"
      );
    }
  }

  /**
   * Get all reservations (including history)
   * @param {String} status - Optional filter by status
   */
  async getAllReservations(status = null) {
    try {
      const url = status
        ? `/reservations/all?status=${encodeURIComponent(status)}`
        : "/reservations/all";
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch all reservations:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservations"
      );
    }
  }

  /**
   * Get a specific reservation by ID
   */
  async getReservationById(id) {
    try {
      const response = await this.api.get(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reservation:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservation"
      );
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id) {
    try {
      const response = await this.api.patch(`/reservations/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Failed to cancel reservation:", error);
      throw new Error(
        error.response?.data?.message || "Failed to cancel reservation"
      );
    }
  }

  /**
   * Convert reservation to open table
   */
  async convertToOpenTable(id, customerCount, buffetTier) {
    try {
      const response = await this.api.patch(`/reservations/${id}/convert`, {
        customerCount,
        buffetTier,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to convert reservation:", error);
      throw new Error(
        error.response?.data?.message || "Failed to convert reservation"
      );
    }
  }

  /**
   * Get waitlist statistics
   */
  async getWaitlistStats() {
    try {
      const response = await this.api.get("/reservations/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch waitlist stats:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
}

const reservationService = new ReservationService();
export default reservationService;
