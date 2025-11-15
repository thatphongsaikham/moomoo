import api from "./api";

/**
 * Order Service - Frontend API calls for order management
 */
class OrderService {
  /**
   * Place a new order
   * @param {Number} tableNumber - Table number (1-10)
   * @param {Array} items - Array of {menuItem: String (ID), quantity: Number}
   * @param {String} notes - Optional order notes
   * @returns {Promise} Order response
   */
  async placeOrder(tableNumber, items, notes = "") {
    try {
      const response = await api.post("/orders", {
        tableNumber,
        items,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to place order:", error);
      throw new Error(
        error.response?.data?.message ||
          "Unable to place order. Please try again."
      );
    }
  }

  /**
   * Get orders for a specific table
   * @param {Number} tableNumber - Table number
   * @returns {Promise} Array of orders
   */
  async getTableOrders(tableNumber) {
    try {
      const response = await api.get(`/orders/table/${tableNumber}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch table orders:", error);
      throw new Error("Unable to load orders. Please try again.");
    }
  }

  /**
   * Get orders for a specific table (alias for getTableOrders)
   * @param {Number} tableNumber - Table number
   * @returns {Promise} API response with orders array
   */
  async getOrdersByTable(tableNumber) {
    return this.getTableOrders(tableNumber);
  }

  /**
   * Get orders for a specific queue (admin only)
   * @param {String} queueType - 'Normal' or 'Special'
   * @returns {Promise} Array of orders
   */
  async getQueueOrders(queueType) {
    try {
      const response = await api.get(`/orders/queue/${queueType}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch queue orders:", error);
      throw new Error("Unable to load queue. Please try again.");
    }
  }

  /**
   * Get Normal queue orders (admin only)
   * @returns {Promise} Array of orders
   */
  async getNormalQueue() {
    return this.getQueueOrders("Normal");
  }

  /**
   * Get Special queue orders (admin only)
   * @returns {Promise} Array of orders
   */
  async getSpecialQueue() {
    return this.getQueueOrders("Special");
  }

  /**
   * Mark an order as completed (admin only)
   * @param {String} orderId - Order ID
   * @returns {Promise} Updated order
   */
  async completeOrder(orderId) {
    try {
      const response = await api.patch(`/orders/${orderId}/complete`);
      return response.data;
    } catch (error) {
      console.error("Failed to complete order:", error);
      throw new Error("Unable to complete order. Please try again.");
    }
  }

  /**
   * Calculate cart total
   * @param {Array} cartItems - Array of {menuItem: Object, quantity: Number}
   * @returns {Number} Total price
   */
  calculateCartTotal(cartItems) {
    return cartItems.reduce((total, item) => {
      const price = item.menuItem?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  }

  /**
   * Format order items for API submission
   * @param {Array} cartItems - Array of cart items with full menu item objects
   * @returns {Array} Formatted items array with just menuItem ID and quantity
   */
  formatOrderItems(cartItems) {
    return cartItems.map((item) => ({
      menuItem: item.menuItem._id || item.menuItem.id,
      quantity: item.quantity,
    }));
  }
}

export default new OrderService();
