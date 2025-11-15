import React from "react";
import { NavLink, Outlet } from "react-router-dom"; // ใช้ NavLink เพื่อแสดงสถานะ Active

import background from "@/assets/background.png"; // สมมติว่าใช้ภาพพื้นหลังเดียวกัน
import { useBilingual } from "@/hook/useBilingual";

const UserLayout = () => {
  const { language, toggleLanguage, t } = useBilingual();

  // 1. กำหนดรายการเมนูสำหรับผู้ใช้
  const userMenuItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.menu"), path: "/menu" },
    { name: t("nav.cart"), path: "/cart" },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative z-10">
        <nav className="bg-black backdrop-blur-sm text-red-900 shadow-lg">
          <div className="container mx-auto flex items-center justify-between px-4 py-3 md:p-4">
            <div className="text-2xl font-bold text-red-700">{t("app.name")}</div>

            <div className="flex items-center space-x-4 md:space-x-6">
              {userMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "font-bold text-red-700 border-b-2 border-red-700 py-2 transition-colors duration-200"
                      : "text-white hover:text-red-700 py-2 transition-colors duration-200"
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              <NavLink
                to="/admin" 
                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors duration-200 text-sm font-medium"
              >
                เข้าสู่ระบบ
              </NavLink>
            </div>
          </div>
        </nav>



        <main className="container mx-auto px-4 py-3 md:p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl mt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;