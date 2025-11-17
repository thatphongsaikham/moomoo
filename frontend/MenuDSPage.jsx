import { useState } from "react";

const menuData = [
  {
    category: "Menu",
    items: [
      { name: "ชุดหมูกระทะมาตรฐาน", price: 259, desc: "หมูสไลซ์, เบคอน, ไก่หมัก, ผักรวม" },
      { name: "ชุดหมูกระทะพรีเมียม", price: 299, desc: "เนื้อวัวสไลซ์, หมูสามชั้น, กุ้ง, ปลาหมึก" },
      { name: "ชุดซีฟู้ดเลิฟเวอร์", price: 329, desc: "กุ้ง, ปลาหมึก, หอยแมลงภู่, ปลาชิ้น" },
      { name: "ชุดหมูรวมมิตร", price: 249, desc: "หมูสไลซ์, หมูสามชั้น, หมูหมัก, ไส้กรอก" },
      { name: "ชุดสายผักเฮลตี้", price: 219, desc: "ผักรวม, เต้าหู้, เห็ด, วุ้นเส้น" },
      { name: "ชุดเด็กน้อย", price: 199, desc: "ไส้กรอก, นักเก็ต, หมูหมัก, วุ้นเส้น" },
    ],
  },
  {
    category: "Special menu",
    items: [
      { name: "เนื้อวากิวสไลซ์", price: 89, desc: "เพิ่มได้ต่อจาน" },
      { name: "ชีสเยิ้มลาวา", price: 49, desc: "ชีสหม้อไฟสำหรับจิ้ม" },
      { name: "กุ้งแม่น้ำตัวโต", price: 129, desc: "เพิ่มกุ้งแม่น้ำพิเศษ" },
      { name: "ชุดหม้อไฟต้มยำ", price: 79, desc: "น้ำซุปต้มยำ + เครื่องต้มยำ" },
      { name: "ชีสบอลทอดกรอบ", price: 59, desc: "ของทานเล่นสำหรับเพิ่ม" },
      { name: "ไอศกรีมไม่อั้น", price: 39, desc: "ท็อปปิงกินได้ไม่จำกัด" },
    ],
  },
];

export default function FullMenuSection() {
  const [activeCategory, setActiveCategory] = useState("Menu");
  const activeMenu = menuData.find((m) => m.category === activeCategory);

  return (
    <section className="text-white mt-10">
      <h2 className="text-center text-3xl font-semibold mb-6">Full Menu</h2>

      {/* ปุ่มเลือกหมวด */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeCategory === "Menu" ? "bg-red-600" : "bg-gray-600"
          }`}
          onClick={() => setActiveCategory("Menu")}
        >
          Menu
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeCategory === "Special menu" ? "bg-red-600" : "bg-gray-600"
          }`}
          onClick={() => setActiveCategory("Special menu")}
        >
          Special menu
        </button>
      </div>

      {/* รายการเมนู */}
      <div className="grid md:grid-cols-2 gap-5 px-4">
        {activeMenu.items.map((item, idx) => (
          <div
            key={idx}
            className="border border-red-500 p-4 rounded-lg bg-[#0f1220]"
          >
            <div className="flex justify-between text-lg font-medium">
              <span>{item.name}</span>
              <span>฿{item.price}</span>
            </div>
            {item.desc && (
              <p className="text-sm text-gray-300 mt-2">{item.desc}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

