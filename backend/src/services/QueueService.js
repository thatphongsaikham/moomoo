import Queue from "../models/Queue.js";

/**
 * QueueService - Manage customer waiting queue
 * Uses standard queue operations: enqueue, dequeue, peek, size, clear
 */
class QueueService {
  /**
   * Enqueue - Add a customer to the back of the queue
   * @param {Object} data - { customerName, customerPhone, partySize }
   * @returns {Object} Created queue entry
   */
  async enqueue(data) {
    const { customerName, customerPhone, partySize } = data;

    if (!customerName || !partySize) {
      throw new Error("Customer name and party size are required");
    }

    if (partySize < 1 || partySize > 4) {
      throw new Error("Party size must be between 1 and 4");
    }

    return Queue.enqueue({
      customerName,
      customerPhone: customerPhone || "",
      partySize,
    });
  }

  /**
   * Dequeue - Remove and return the front customer from the queue
   * @returns {Object} Removed queue entry
   */
  async dequeue() {
    const next = Queue.peek();

    if (!next) {
      throw new Error("Queue is empty");
    }

    return Queue.dequeue();
  }

  /**
   * Peek - View the front customer without removing
   * @returns {Object} Front queue entry
   */
  async peek() {
    return Queue.peek();
  }

  /**
   * GetAll - Get all queue entries (ordered by createdAt, oldest first)
   * @returns {Array} Queue entries
   */
  async getAll() {
    return Queue.getAll();
  }

  /**
   * Remove - Remove a specific queue entry by ID
   * @param {Number} id - Queue entry ID
   * @returns {Object} Removed queue entry
   */
  async remove(id) {
    const queue = Queue.getById(id);

    if (!queue) {
      throw new Error("Queue entry not found");
    }

    return Queue.remove(id);
  }

  /**
   * Size - Get the number of customers in queue
   * @returns {Number} Queue size
   */
  async size() {
    return Queue.size();
  }

  /**
   * isEmpty - Check if queue is empty
   * @returns {Boolean} True if queue is empty
   */
  async isEmpty() {
    return Queue.isEmpty();
  }

  /**
   * Clear - Remove all entries from the queue
   * @returns {Number} Number of entries cleared
   */
  async clear() {
    return Queue.clear();
  }
}

export default new QueueService();
