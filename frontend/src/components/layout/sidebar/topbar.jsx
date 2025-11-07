import React from "react";
import { NavLink } from "react-router-dom";

const Topbar = () => {
  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Order", path: "/order" },
    { name: "Table", path: "/table" },
    { name: "Bill", path: "/bill" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="text-2xl font-bold text-red-600">
          MooMooii
        </div>

        <div className="flex space-x-20">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "font-bold text-red-600 bg-red-100/50 px-3 py-2 rounded-md transition-colors duration-200"
                  : "text-gray-700 hover:text-red-600 hover:bg-red-100/30 px-3 py-2 rounded-md transition-colors duration-200"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200">
          เข้าสู่ระบบ
        </button>
      </div>
    </nav>
  );
};

export default Topbar;
