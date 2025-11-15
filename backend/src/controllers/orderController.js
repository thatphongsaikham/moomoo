import Order from "../models/Order.js";
import OrderQueue from "../services/OrderQueue.js";

const normalQueue = new OrderQueue();
const specialQueue = new OrderQueue();

export const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    if (order.menuType === "special") specialQueue.pushFront(order);
    else normalQueue.pushBack(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  res.json({
    normal: normalQueue.getAll(),
    special: specialQueue.getAll(),
  });
};

export const completeOrder = async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    status: "done",
    completedAt: new Date(),
  });
  normalQueue.remove(id);
  specialQueue.remove(id);
  res.json({ message: `Order ${id} completed` });
};
