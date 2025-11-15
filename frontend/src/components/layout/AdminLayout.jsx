import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Flame, Settings, Users, ShoppingCart, FileText, Clock, ArrowLeft } from "lucide-react";

import background from "@/assets/background.png";

const AdminLayout = () => {
  const adminMenuItems = [
    { name: "เมนู", path: "/admin/menu", icon: FileText },
    { name: "ออเดอร์", path: "/admin/orders", icon: ShoppingCart },
    { name: "โต๊ะ", path: "/admin/tables", icon: Users },
    { name: "บิล", path: "/admin/billing", icon: Settings },
    { name: "คิวรอ", path: "/admin/waitlist", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src={background}
          alt="Admin Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Navigation */}
        <nav className="bg-black/90 backdrop-blur-md border-b border-red-600/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="bg-red-600 p-2 rounded-lg mr-3">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-white">มูคระทา</h1>
                  <p className="text-xs text-red-400">Admin Panel</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="hidden md:flex items-center space-x-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : "text-gray-300 hover:text-white hover:bg-gray-800 hover:border hover:border-red-600/30"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>

              {/* Back to Store */}
              <NavLink
                to="/"
                className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg font-medium transition-all duration-300 border border-gray-700 hover:border-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าร้าน
              </NavLink>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden border-t border-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-900/50 backdrop-blur-md border border-red-600/20 rounded-2xl shadow-2xl">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black/80 backdrop-blur-md border-t border-red-600/20 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                © 2024 มูคระทา Admin Panel | All rights reserved
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;