import api from "./api";

/**
 * Get active bill for a table
 * @param {number} tableNumber - Table number (1-10)
 * @returns {Promise} Response with bill data
 */
export const getActiveBillForTable = async (tableNumber) => {
  const response = await api.get(`/bills/table/${tableNumber}`);
  return response.data;
};

/**
 * Get bill by ID (for historical access)
 * @param {string} billId - Bill MongoDB ObjectId
 * @returns {Promise} Response with bill data
 */
export const getBillById = async (billId) => {
  const response = await api.get(`/bills/${billId}`);
  return response.data;
};

/**
 * Get historical bills with filters
 * @param {Object} filters - Query filters
 * @returns {Promise} Response with bills array and pagination
 */
export const getHistoricalBills = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/bills/history?${params}`);
  return response.data;
};

/**
 * Create bill for a table (internal use)
 * @param {number} tableNumber - Table number (1-10)
 * @param {Object} billData - Bill creation data
 * @returns {Promise} Response with created bill
 */
export const createBillForTable = async (tableNumber, billData) => {
  const response = await api.post(`/bills/table/${tableNumber}`, billData);
  return response.data;
};

/**
 * Add item to bill (internal use)
 * @param {string} billId - Bill MongoDB ObjectId
 * @param {Object} item - Item data
 * @returns {Promise} Response with updated bill
 */
export const addItemToBill = async (billId, item) => {
  const response = await api.patch(`/bills/${billId}/add-item`, item);
  return response.data;
};

/**
 * Archive bill (mark as paid)
 * @param {string} billId - Bill MongoDB ObjectId
 * @returns {Promise} Response with archived bill
 */
export const archiveBill = async (billId) => {
  const response = await api.patch(`/bills/${billId}/archive`);
  return response.data;
};

/**
 * Get printable bill format
 * @param {number} tableNumber - Table number (1-10)
 * @returns {Promise} Response with printable bill data
 */
export const getPrintableBill = async (tableNumber) => {
  const response = await api.get(`/bills/table/${tableNumber}/print`);
  return response.data;
};

export default {
  getActiveBillForTable,
  getBillById,
  getHistoricalBills,
  createBillForTable,
  addItemToBill,
  archiveBill,
  getPrintableBill,
};
