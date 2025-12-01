import api from "./api";

/**
 * GetAll - Get all tables with optional status filter
 * @param {string} status - Optional status filter ("Available", "Reserved", "Open", "Closed")
 * @returns {Promise} Response with tables array
 */
export const getAll = async (status = null) => {
  const params = status ? `?status=${status}` : "";
  const response = await api.get(`/tables${params}`);
  return response.data;
};

/**
 * GetByNumber - Get specific table by number
 * @param {number} tableNumber - Table number (1-10)
 * @returns {Promise} Response with table data
 */
export const getByNumber = async (tableNumber) => {
  const response = await api.get(`/tables/${tableNumber}`);
  return response.data;
};

/**
 * Open - Open a table for dining
 * @param {number} tableNumber - Table number (1-10)
 * @param {number} customerCount - Number of customers (1-4)
 * @param {string} buffetTier - Buffet tier ("Starter" or "Premium")
 * @returns {Promise} Response with opened table data
 */
export const open = async (tableNumber, customerCount, buffetTier) => {
  const response = await api.post(`/tables/${tableNumber}/open`, {
    customerCount,
    buffetTier,
  });
  return response.data;
};

/**
 * Reserve - Reserve a table for 15 minutes
 * @param {number} tableNumber - Table number (1-10)
 * @param {string} notes - Optional reservation notes
 * @returns {Promise} Response with reserved table data
 */
export const reserve = async (tableNumber, notes = "") => {
  const response = await api.post(`/tables/${tableNumber}/reserve`, {
    notes,
  });
  return response.data;
};

/**
 * Cancel a table reservation
 * @param {number} tableNumber - Table number (1-10)
 * @returns {Promise} Response with updated table data
 */
export const cancelReservation = async (tableNumber) => {
  const response = await api.post(`/tables/${tableNumber}/cancel-reservation`);
  return response.data;
};

/**
 * Close - Close a table after payment (archives bill and resets table to Available)
 * @param {number} tableNumber - Table number (1-10)
 * @returns {Promise} Response with updated table data
 */
export const close = async (tableNumber) => {
  const response = await api.post(`/tables/${tableNumber}/close`);
  return response.data;
};

/**
 * Verify PIN for a table
 * @param {number} tableNumber - Table number (1-10)
 * @param {string} pin - 4-digit PIN
 * @returns {Promise} Response with verification result and encryptedId
 */
export const verifyPIN = async (tableNumber, pin) => {
  const response = await api.post(`/tables/${tableNumber}/verify-pin`, {
    pin,
  });
  return response.data;
};

export default {
  getAll,
  getByNumber,
  open,
  reserve,
  cancelReservation,
  close,
  verifyPIN,
};
