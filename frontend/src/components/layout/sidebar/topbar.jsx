import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Topbar = () => {
  const location = useLocation();
  // detect if any path segment is a numeric table id (e.g. /5 or /5/order)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const numericIndex = pathSegments.findIndex((s) => !isNaN(s));
  const hasTableInPath = numericIndex !== -1;
  const tableId = hasTableInPath ? pathSegments[numericIndex] : null;


  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  const handleGoOrder = () => {
    if (tableId) navigate(`/${tableId}/order`);
    else window.alert('ไม่พบหมายเลขโต๊ะสำหรับไปที่หน้าออเดอร์');
  };

  const handleGoHistory = () => {
    if (tableId) navigate(`/${tableId}/history`);
    else window.alert('ไม่พบหมายเลขโต๊ะสำหรับไปที่ประวัติ');
  };

  const handleRequestBill = () => {
    if (tableId) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
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

        {/* Responsive menu: show buttons if tableId exists */}
        {hasTableInPath && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoOrder}
              className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors duration-200 text-xs md:text-sm"
            >
              สั่งอาหาร
            </button>

            <button
              type="button"
              onClick={handleGoHistory}
              className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors duration-200 text-xs md:text-sm"
            >
              ประวัติ
            </button>

            <button
              type="button"
              onClick={handleRequestBill}
              className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 transition-colors duration-200 text-xs md:text-sm"
              style={{ minWidth: '90px' }}
            >
              เรียกเช็คบิล
            </button>
          </div>
        )}
        {showNotification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 text-sm">
            เรียกเช็คบิลแล้ว กรุณารอสักครู่
          </div>
        )}
      </div>
    </nav>
  );
};

export default Topbar;
