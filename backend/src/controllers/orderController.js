import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    // Get all pending orders from MongoDB
    const pendingOrders = await Order.find({ status: "pending" }).sort({
      createdAt: 1,
    });

    // Separate into normal and special based on menuType
    const normal = pendingOrders.filter((order) => order.menuType === "normal");
    const special = pendingOrders.filter(
      (order) => order.menuType === "special"
    );

    res.json({
      normal,
      special,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: "delivered",
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: `Order ${id} completed`, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: `Order ${id} deleted`, order: deletedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
