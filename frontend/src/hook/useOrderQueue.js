import React, { useState, useEffect } from "react";
import orderService from "../services/orderService";

/**
 * useOrderQueue - Custom hook for real-time order queue management
 * Polls both Normal and Special queues separately with configurable intervals
 * @param {Number} pollInterval - Polling interval in milliseconds (default: 3000ms / 3s)
 * @returns {Object} { normalQueue, specialQueue, loading, error, refetch }
 */
export const useOrderQueue = (pollInterval = 3000) => {
  const [normalQueue, setNormalQueue] = useState([]);
  const [specialQueue, setSpecialQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueues = async () => {
    try {
      setError(null);

      // Fetch both queues in parallel
      const [normalResponse, specialResponse] = await Promise.all([
        orderService.getNormalQueue(),
        orderService.getSpecialQueue(),
      ]);

      setNormalQueue(normalResponse.data || []);
      setSpecialQueue(specialResponse.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch queues:", err);
      setError(err.message || "Failed to load order queues");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchQueues();

    // Set up polling interval
    const intervalId = setInterval(fetchQueues, pollInterval);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [pollInterval]);

  return {
    normalQueue,
    specialQueue,
    loading,
    error,
    refetch: fetchQueues,
  };
};
