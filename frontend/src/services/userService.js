import { useState, useEffect } from "react";
import axios from "axios";

export default function useOrderService() {
  const [orders, setOrders] = useState({ normal: [], special: [] });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await axios.get("/api/orders");
    setOrders((prev) => {
      const newOrders = res.data;
      if (
        JSON.stringify(prev.normal) !== JSON.stringify(newOrders.normal) ||
        JSON.stringify(prev.special) !== JSON.stringify(newOrders.special)
      ) {
        return newOrders;
      }
      return prev;
    });
    setLoading(false);
  };

  const completeOrder = async (id) => {
    await axios.put(`/api/orders/${id}/complete`);
    setOrders((prev) => ({
      normal: prev.normal.filter((o) => o.id !== id),
      special: prev.special.filter((o) => o.id !== id),
    }));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // ลด frequency
    return () => clearInterval(interval);
  }, []);

  return { orders, loading, completeOrder };
}
