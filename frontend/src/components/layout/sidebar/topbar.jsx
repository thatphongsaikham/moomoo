import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const Topbar = () => {
  const location = useLocation();
  const tableId = location.pathname.split('/')[1];
  const isTableRoute = !isNaN(tableId);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <NavLink to="/" className="text-2xl font-bold text-red-600">
          MooMooii
        </NavLink>

        <div className="flex items-center space-x-8">
          {isTableRoute && (
            <>
              <div className="text-gray-700">
                โต๊ะที่ {tableId}
              </div>
              <NavLink
                to="/"
                className="text-red-600 hover:bg-red-100/30 px-3 py-2 rounded-md transition-colors duration-200"
              >
                เปลี่ยนโต๊ะ
              </NavLink>
            </>
          )}
          <NavLink
            to="/admin"
            className="text-gray-600 hover:text-red-600 hover:bg-red-100/30 px-3 py-2 rounded-md transition-colors duration-200"
          >
            Admin Panel
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
