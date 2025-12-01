import db from "../config/database.js";

/**
 * Queue Model - Simple queue management for waiting customers
 * Uses standard queue operations: enqueue, dequeue, peek, size, isEmpty, clear
 */
class Queue {
  /**
   * Enqueue - Add customer to the back of the queue
   */
  static enqueue(data) {
    const { customerName, customerPhone = "", partySize } = data;

    const result = db
      .prepare(
        `
      INSERT INTO queue (customerName, customerPhone, partySize, createdAt)
      VALUES (?, ?, ?, datetime('now'))
    `
      )
      .run(customerName, customerPhone, partySize);

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Dequeue - Remove and return the front customer from the queue
   */
  static dequeue() {
    const first = this.peek();
    if (!first) return null;

    db.prepare("DELETE FROM queue WHERE id = ?").run(first.id);
    return first;
  }

  /**
   * Peek - View the front customer without removing
   */
  static peek() {
    const queue = db
      .prepare("SELECT * FROM queue ORDER BY createdAt ASC LIMIT 1")
      .get();
    return this.toObject(queue);
  }

  /**
   * GetAll - Get all queue entries ordered by creation time (FIFO)
   */
  static getAll() {
    const queues = db
      .prepare("SELECT * FROM queue ORDER BY createdAt ASC")
      .all();
    return queues.map((q) => this.toObject(q));
  }

  /**
   * GetById - Get queue entry by ID
   */
  static getById(id) {
    const queue = db.prepare("SELECT * FROM queue WHERE id = ?").get(id);
    return this.toObject(queue);
  }

  /**
   * Remove - Remove a specific queue entry by ID
   */
  static remove(id) {
    const queue = this.getById(id);
    if (!queue) return null;

    db.prepare("DELETE FROM queue WHERE id = ?").run(id);
    return queue;
  }

  /**
   * Size - Get the number of entries in the queue
   */
  static size() {
    return db.prepare("SELECT COUNT(*) as count FROM queue").get().count;
  }

  /**
   * IsEmpty - Check if queue is empty
   */
  static isEmpty() {
    return this.size() === 0;
  }

  /**
   * Clear - Remove all entries from the queue
   */
  static clear() {
    const result = db.prepare("DELETE FROM queue").run();
    return result.changes;
  }

  /**
   * Convert to object format
   */
  static toObject(queue) {
    if (!queue) return null;
    return {
      _id: queue.id,
      id: queue.id,
      customerName: queue.customerName,
      customerPhone: queue.customerPhone,
      partySize: queue.partySize,
      // SQLite datetime('now') stores UTC, append 'Z' to indicate UTC timezone
      createdAt: queue.createdAt ? new Date(queue.createdAt + "Z") : null,
    };
  }
}

export default Queue;
