import React, { useState, useEffect } from "react";
import menuService from "../../services/menuService";

function MenuForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel = "บันทึก",
  isLoading = false,
  activeCategory,
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
      {/* Name (Thai) */}
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
          placeholder="เช่น เนื้อหมูสไลด์"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          รายละเอียด
        </label>
        <textarea
          name="description"
          rows={2}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="เช่น เนื้อหมูคุณภาพดีหั่นบางพร้อมทาน"
        />
      </div>

      {/* Food Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ประเภทอาหาร
        </label>
        <select
          name="foodType"
          value={formData.foodType}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">เลือกประเภท</option>
          <option value="pork">หมู (Pork)</option>
          <option value="beef">เนื้อ (Beef)</option>
          <option value="chicken">ไก่ (Chicken)</option>
          <option value="seafood">อาหารทะเล (Seafood)</option>
          <option value="vegetable">ผัก (Vegetable)</option>
          <option value="japanese">อาหารญี่ปุ่น (Japanese)</option>
          <option value="rice">ข้าว (Rice)</option>
          <option value="drink">เครื่องดื่ม (Drink)</option>
          <option value="other">อื่นๆ (Other)</option>
        </select>
      </div>

      {/* Price - Only for Special menu */}
      {activeCategory === "Special" && (
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
            placeholder="เช่น 180"
          />
        </div>
      )}

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL รูปภาพ
        </label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="/images/menu/example.jpg"
        />
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700"
          disabled={isLoading}
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function MenuPage() {
  const [menuData, setMenuData] = useState({
    starter: [],
    premium: [],
    special: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Starter");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    foodType: "",
    price: "",
    imageUrl: "",
  });

  // Categories for the tabs
  const categories = [
    { key: "Starter", label: "Starter (259฿)", description: "รวมในบุฟเฟ่ต์" },
    { key: "Premium", label: "Premium (299฿)", description: "รวมในบุฟเฟ่ต์ Premium" },
    { key: "Special", label: "Special Menu", description: "สั่งเพิ่ม มีราคา" },
  ];

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await menuService.getAll();
      setMenuData(response.data || { starter: [], premium: [], special: [] });
    } catch (err) {
      console.error("Failed to fetch menu:", err);
      setError("ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("กรุณากรอกชื่อเมนู");
      return;
    }

    if (activeCategory === "Special") {
      const priceNumber = Number(formData.price);
      if (Number.isNaN(priceNumber) || priceNumber < 0) {
        alert("กรุณากรอกราคาให้ถูกต้อง");
        return;
      }
    }

    setIsSaving(true);
    try {
      await menuService.create(activeCategory, {
        name: formData.name,
        description: formData.description || "",
        foodType: formData.foodType || "",
        imageUrl: formData.imageUrl || "",
        price: activeCategory === "Special" ? Number(formData.price) : 0,
        isAvailable: true,
      });

      // Refresh menu list
      await fetchMenuItems();

      // Reset form
      setFormData({
        name: "",
        description: "",
        foodType: "",
        price: "",
        imageUrl: "",
      });
    } catch (err) {
      console.error("Failed to add menu item:", err);
      alert("ไม่สามารถเพิ่มเมนูได้ กรุณาลองใหม่");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      foodType: "",
      price: "",
      imageUrl: "",
    });
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("ต้องการลบเมนูนี้หรือไม่?")) return;

    try {
      await menuService.delete(activeCategory, itemId);
      await fetchMenuItems();
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      alert("ไม่สามารถลบเมนูได้ กรุณาลองใหม่");
    }
  };

  const handleToggleAvailability = async (itemId, currentAvailability) => {
    const newAvailability = !currentAvailability;
    try {
      await menuService.setAvailability(activeCategory, itemId, newAvailability);
      await fetchMenuItems();
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      alert("ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองใหม่");
    }
  };

  // Get items for active category
  const getActiveItems = () => {
    const categoryKey = activeCategory.toLowerCase();
    return menuData[categoryKey] || [];
  };

  // Handle category change
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setFormData({
      name: "",
      description: "",
      foodType: "",
      price: "",
      imageUrl: "",
    });
  };

  const activeItems = getActiveItems();
  const activeCategoryInfo = categories.find(c => c.key === activeCategory);

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">📋 จัดการเมนูอาหาร</h1>
        <p className="text-gray-400">เพิ่ม แก้ไข และลบรายการเมนู (3 หมวด: Starter, Premium, Special)</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {error}
          <button onClick={fetchMenuItems} className="ml-4 underline hover:no-underline">
            ลองใหม่
          </button>
        </div>
      )}

      {/* ปุ่มเลือกหมวด */}
      <div className="flex gap-3 mb-8 border-b border-gray-700 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center ${
              activeCategory === cat.key
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
            }`}
            onClick={() => handleCategoryChange(cat.key)}
          >
            <span className="font-bold">{cat.label}</span>
            <span className="text-xs opacity-75">{cat.description}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ฟอร์มเพิ่มเมนู */}
        <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ➕ เพิ่มเมนูใหม่ใน <span className="text-red-400">{activeCategoryInfo?.label}</span>
          </h2>
          <MenuForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="เพิ่มเมนู"
            isLoading={isSaving}
            activeCategory={activeCategory}
          />
        </div>

        {/* รายการเมนู */}
        <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📝 รายการในหมวด:{" "}
            <span className="text-red-400">{activeCategoryInfo?.label}</span>
            <span className="text-sm text-gray-500 font-normal">
              ({activeItems.length} รายการ)
            </span>
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
              <p className="text-gray-400">กำลังโหลด...</p>
            </div>
          ) : activeItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">ยังไม่มีเมนูในหมวดนี้</p>
              <p className="text-sm text-gray-500 mt-2">เพิ่มรายการแรกจากแบบฟอร์มด้านซ้าย</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#0f1220]/60 border p-4 rounded-lg transition-all ${
                    item.isAvailable
                      ? "border-red-500/40 hover:border-red-500"
                      : "border-gray-600 opacity-60"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white">{item.name}</span>
                        {item.foodType && (
                          <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded">
                            {item.foodType}
                          </span>
                        )}
                        {activeCategory === "Special" && item.price > 0 && (
                          <span className="ml-auto text-lg text-red-400 font-bold">
                            ฿{item.price}
                          </span>
                        )}
                        {activeCategory !== "Special" && (
                          <span className="ml-auto text-sm text-green-400">
                            รวมในบุฟเฟ่ต์
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-400">{item.description}</p>
                      )}
                      {!item.isAvailable && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-600/30 text-yellow-400 text-xs rounded">
                          หมด
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          item.isAvailable
                            ? "bg-yellow-600/80 hover:bg-yellow-600"
                            : "bg-green-600/80 hover:bg-green-600"
                        }`}
                        onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                      >
                        {item.isAvailable ? "ปิด" : "เปิด"}
                      </button>
                      <button
                        className="bg-red-600/80 hover:bg-red-600 px-3 py-1 rounded text-xs font-medium transition-colors"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

