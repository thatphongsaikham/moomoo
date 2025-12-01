import api from "./api";

/**
 * GetActiveByTable - Get active bill for a table
 * @param {number} tableNumber - Table number (1-10)
 * @returns {Promise} Response with bill data
 */
export const getActiveByTable = async (tableNumber) => {
  const response = await api.get(`/bills/table/${tableNumber}`);
  return response.data;
};

/**
 * GetById - Get bill by ID (for historical access)
 * @param {string} billId - Bill MongoDB ObjectId
 * @returns {Promise} Response with bill data
 */
export const getById = async (billId) => {
  const response = await api.get(`/bills/${billId}`);
  return response.data;
};

/**
 * GetHistory - Get historical bills with filters
 * @param {Object} filters - Query filters
 * @returns {Promise} Response with bills array and pagination
 */
export const getHistory = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/bills/history?${params}`);
  return response.data;
};

/**
 * Create - Create bill for a table (internal use)
 * @param {number} tableNumber - Table number (1-10)
 * @param {Object} billData - Bill creation data
 * @returns {Promise} Response with created bill
 */
export const create = async (tableNumber, billData) => {
  const response = await api.post(`/bills/table/${tableNumber}`, billData);
  return response.data;
};

/**
 * AddItem - Add item to bill (internal use)
 * @param {string} billId - Bill MongoDB ObjectId
 * @param {Object} item - Item data
 * @returns {Promise} Response with updated bill
 */
export const addItem = async (billId, item) => {
  const response = await api.patch(`/bills/${billId}/add-item`, item);
  return response.data;
};

/**
 * Archive - Archive bill (mark as paid)
 * @param {string} billId - Bill MongoDB ObjectId
 * @returns {Promise} Response with archived bill
 */
export const archive = async (billId) => {
  const response = await api.patch(`/bills/${billId}/archive`);
  return response.data;
};

/**
 * GetPrintable - Get printable bill format
 * @param {number} tableNumber - Table number (1-10)
 * @returns {Promise} Response with printable bill data
 */
export const getPrintable = async (tableNumber) => {
  const response = await api.get(`/bills/table/${tableNumber}/print`);
  return response.data;
};

export default {
  getActiveByTable,
  getById,
  getHistory,
  create,
  addItem,
  archive,
  getPrintable,
};
