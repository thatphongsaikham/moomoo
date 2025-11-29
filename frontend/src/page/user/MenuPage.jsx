// frontend/src/page/user/MenuPage.jsx

import React from "react";
// 👇 import เมนูจาก menudata.js (สังเกตว่าใช้ชื่อไฟล์ menudata ไม่ใช่ menuData)
import { menu, specialMenu } from "../../data/menudata";

const MenuPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>เมนูทั้งหมด</h1>

      {/* เมนูบุฟเฟ่ต์ (ฟรี) */}
      <section style={{ marginTop: "20px" }}>
        <h2>เมนูบุฟเฟ่ต์</h2>
        {menu.map((item) => (
          <div key={item.id}>
            {item.nameThai} ({item.nameEng})
          </div>
        ))}
      </section>

      {/* เมนูพิเศษ (คิดเงินเพิ่ม) */}
      <section style={{ marginTop: "20px" }}>
        <h2>Special Menu (คิดเงินเพิ่ม)</h2>
        {specialMenu.map((item) => (
          <div key={item.id}>
            {item.nameThai} - {item.price} บาท
          </div>
        ))}
      </section>
    </div>
  );
};

export default MenuPage;

