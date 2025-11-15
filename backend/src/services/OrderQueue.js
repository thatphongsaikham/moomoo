export default class OrderQueue {
  constructor() {
    this.queue = [];
  }

  pushBack(order) {
    this.queue.push(order);
  }
  pushFront(order) {
    this.queue.unshift(order);
  }
  popFront() {
    return this.queue.shift();
  }
  remove(orderId) {
    this.queue = this.queue.filter((o) => o._id !== orderId);
  }
  getAll() {
    return this.queue;
  }
}
