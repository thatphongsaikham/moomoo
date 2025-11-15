import { useState, useEffect } from "react";

/**
 * Custom hook for managing table timer display
 * @param {Object} table - Table object with openedAt and reservationExpiresAt
 * @returns {Object} Timer state and formatted display
 */
export const useTableTimer = (table) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    if (!table) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      // Dining timer (90 minutes for Open tables)
      if (table.status === "Open" && table.openedAt) {
        const elapsed = Date.now() - new Date(table.openedAt).getTime();
        const remaining = 5400000 - elapsed; // 90 minutes = 5400000ms

        setTimeRemaining(remaining);
        setIsOvertime(remaining < 0);
        setIsExpiringSoon(remaining > 0 && remaining <= 600000); // 10 min warning
      }
      // Reservation timer (15 minutes for Reserved tables)
      else if (table.status === "Reserved" && table.reservationExpiresAt) {
        const remaining =
          new Date(table.reservationExpiresAt).getTime() - Date.now();

        setTimeRemaining(Math.max(0, remaining));
        setIsOvertime(false);
        setIsExpiringSoon(remaining > 0 && remaining <= 300000); // 5 min warning
      } else {
        setTimeRemaining(null);
        setIsOvertime(false);
        setIsExpiringSoon(false);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [table]);

  /**
   * Format milliseconds to HH:MM:SS display
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time string
   */
  const formatTime = (ms) => {
    if (ms === null) return "--:--:--";

    const totalSeconds = Math.abs(Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const sign = ms < 0 ? "-" : "";
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  /**
   * Get timer color class based on state
   * @returns {string} Tailwind color class
   */
  const getTimerColorClass = () => {
    if (isOvertime) return "text-red-600 font-bold";
    if (isExpiringSoon) return "text-yellow-600 font-semibold";
    return "text-gray-700";
  };

  return {
    timeRemaining,
    isExpiringSoon,
    isOvertime,
    formattedTime: formatTime(timeRemaining),
    timerColorClass: getTimerColorClass(),
  };
};

export default useTableTimer;
