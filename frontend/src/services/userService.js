import { useState, useEffect } from "react";
import axios from "axios";

export default function useOrderService() {
  const [orders, setOrders] = useState({ normal: [], special: [] });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
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
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      // Return empty orders when API is unavailable
      setOrders({ normal: [], special: [] });
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (id) => {
    try {
      await axios.put(`/api/orders/${id}/complete`);
      setOrders((prev) => ({
        normal: prev.normal.filter((o) => (o._id || o.id) !== id),
        special: prev.special.filter((o) => (o._id || o.id) !== id),
      }));
    } catch (error) {
      console.error("Failed to complete order:", error);
      throw new Error("Failed to complete order. Please try again.");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // ลด frequency
    return () => clearInterval(interval);
  }, []);

  return { orders, loading, completeOrder };
}
