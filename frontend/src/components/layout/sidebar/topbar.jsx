import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Topbar = () => {
  const location = useLocation();
  // detect if any path segment is a numeric table id (e.g. /5 or /5/order)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const numericIndex = pathSegments.findIndex((s) => !isNaN(s));
  const hasTableInPath = numericIndex !== -1;
  const tableId = hasTableInPath ? pathSegments[numericIndex] : null;

  const handleRequestBill = () => {
    // For now show a confirmation — backend integration can be added later.
    if (tableId) {
      // Close menu on mobile
      setMenuOpen(false);
      window.alert('เรียกเช็คบิลแล้ว กรุณารอสักครู่');
      // Optionally dispatch a custom event for other parts of the app to handle:
      try {
        window.dispatchEvent(new CustomEvent('moomoo:request-bill', { detail: { tableId } }));
      } catch (e) {
        // ignore
      }
    } else {
      window.alert('ไม่พบหมายเลขโต๊ะสำหรับเรียกเช็คบิล');
    }
  };
 

  return (
    <nav className="bg-white shadow-md w-full z-50">
      <div className="container mx-auto flex items-center justify-between px-3 py-2 md:px-4 md:py-3">
        <NavLink to="/" className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 tracking-tight">
          MooMoo
        </NavLink>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6 text-base">
          {hasTableInPath && (
            <button
              type="button"
              onClick={handleRequestBill}
              className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200 text-sm"
            >
              เรียกเช็คบิล
            </button>
          )}
        </div>

        {/* Mobile menu removed: no hamburger shown */}
      </div>

      {/* mobile menu removed */}
    </nav>
  );
};

export default Topbar;
