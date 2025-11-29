import React, { useState } from "react";

const initialMenuData = [
  {
    category: "Menu",
    items: [
      { name: "ชุดหมูกระทะมาตรฐาน", price: 259, description: "หมูสไลซ์, เบคอน, ไก่หมัก, ผักรวม" },
      { name: "ชุดหมูกระทะพรีเมียม", price: 299, description: "เนื้อวัวสไลซ์, หมูสามชั้น, กุ้ง, ปลาหมึก" },
      { name: "ชุดซีฟู้ดเลิฟเวอร์", price: 329, description: "กุ้ง, ปลาหมึก, หอยแมลงภู่, ปลาชิ้น" },
      { name: "ชุดหมูรวมมิตร", price: 249, description: "หมูสไลซ์, หมูสามชั้น, หมูหมัก, ไส้กรอก" },
      { name: "ชุดสายผักเฮลตี้", price: 219, description: "ผักรวม, เต้าหู้, เห็ด, วุ้นเส้น" },
      { name: "ชุดเด็กน้อย", price: 199, description: "ไส้กรอก, นักเก็ต, หมูหมัก, วุ้นเส้น" },
    ],
  },
  {
    category: "Special Menu",
    items: [
      { name: "เนื้อวากิวสไลซ์", price: 89, description: "เพิ่มได้ต่อจาน" },
      { name: "ชีสเยิ้มลาวา", price: 49, description: "ชีสหม้อไฟสำหรับจิ้ม" },
      { name: "กุ้งแม่น้ำตัวโต", price: 129, description: "เพิ่มกุ้งแม่น้ำพิเศษ" },
      { name: "ชุดหม้อไฟต้มยำ", price: 79, description: "น้ำซุปต้มยำ + เครื่องต้มยำ" },
      { name: "ชีสบอลทอดกรอบ", price: 59, description: "ของทานเล่นสำหรับเพิ่ม" },
      { name: "ไอศกรีมไม่อั้น", price: 39, description: "ท็อปปิงกินได้ไม่จำกัด" },
    ],
  },
];

function MenuForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel = "บันทึก",
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 bg-[#0f1220] p-6 rounded-xl border border-gray-700"
    >
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          หมวดหมู่เมนู<span className="text-red-400"> *</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        >
          <option value="Menu">Menu</option>
          <option value="Special Menu">Special Menu</option>
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ชื่อเมนู <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="กรอกชื่อเมนู"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ราคา (บาท) <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          name="price"
          min="0"
          step="1"
          value={formData.price}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="เช่น 259"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          รายละเอียดเมนู (ถ้ามี)
        </label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="เช่น หมูสไลซ์, เบคอน, ไก่หมัก, ผักรวม"
        />
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function MenuPage() {
  const [menuData, setMenuData] = useState(initialMenuData);
  const [activeCategory, setActiveCategory] = useState("Menu");

  const [formData, setFormData] = useState({
    category: "Menu",
    name: "",
    price: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || formData.price === "") {
      alert("กรุณากรอกชื่อเมนูและราคาให้ครบ");
      return;
    }

    const priceNumber = Number(formData.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      alert("กรุณากรอกราคาให้ถูกต้อง");
      return;
    }

    setMenuData((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((m) => m.category === formData.category);

      const newItem = {
        name: formData.name,
        price: priceNumber,
        description: formData.description,
      };

      if (idx === -1) {
        copy.push({
          category: formData.category,
          items: [newItem],
        });
      } else {
        copy[idx] = {
          ...copy[idx],
          items: [...copy[idx].items, newItem],
        };
      }

      return copy;
    });

    setActiveCategory(formData.category);

    setFormData((prev) => ({
      ...prev,
      name: "",
      price: "",
      description: "",
    }));
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      name: "",
      price: "",
      description: "",
    }));
  };

  const handleDeleteItem = (category, index) => {
    setMenuData((prev) => {
      const copy = [...prev];
      const catIndex = copy.findIndex((m) => m.category === category);
      if (catIndex === -1) return prev;

      const cat = copy[catIndex];
      const newItems = cat.items.filter((_, i) => i !== index);

      copy[catIndex] = {
        ...cat,
        items: newItems,
      };

      return copy;
    });
  };

  const activeMenu = menuData.find((m) => m.category === activeCategory);

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">📋 จัดการเมนูอาหาร</h1>
        <p className="text-gray-400">เพิ่ม แก้ไข และลบรายการเมนู</p>
      </div>

      {/* ปุ่มเลือกหมวด */}
      <div className="flex gap-3 mb-8 border-b border-gray-700 pb-4">
        {["Menu", "Special Menu"].map((cat) => (
          <button
            key={cat}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ฟอร์มเพิ่มเมนู */}
        <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ➕ เพิ่มเมนูใหม่
          </h2>
          <MenuForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="เพิ่มเมนู"
          />
        </div>

        {/* รายการเมนู */}
        <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📝 รายการในหมวด:{" "}
            <span className="text-red-400">{activeCategory}</span>
          </h2>

          {!activeMenu || activeMenu.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">ยังไม่มีเมนูในหมวดนี้</p>
              <p className="text-sm text-gray-500 mt-2">เพิ่มรายการแรกจากแบบฟอร์มด้านซ้าย</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {activeMenu.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0f1220]/60 border border-red-500/40 hover:border-red-500 p-4 rounded-lg flex justify-between gap-3 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="ml-auto text-lg text-red-400 font-bold">
                        ฿{item.price}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-400">{item.description}</p>
                    )}
                  </div>

                  <button
                    className="self-start bg-red-600/80 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                    onClick={() => handleDeleteItem(activeCategory, idx)}
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

