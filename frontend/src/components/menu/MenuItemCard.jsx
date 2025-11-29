import React from "react";
import { Plus, Minus } from "lucide-react";
import { useBilingual } from "@/hook/useBilingual";

/**
 * MenuItemCard - Display individual menu item
 * item model (ใหม่):
 * {
 *   name: string,
 *   price: number,
 *   description?: string,
 *   availability?: "Available" | "Out of Stock",
 *   category?: string
 * }
 */
const MenuItemCard = ({
  item,
  quantity = 0,
  onAdd,
  onRemove,
  category, // ถ้า parent ส่ง category มา จะใช้ค่านี้ก่อน
}) => {
  const { isThai } = useBilingual();

  // ใช้ name เดียวแล้ว ไม่แยกไทย/อังกฤษ
  const displayName = item.name;
  const displayDescription = item.description || "";

  // category สำหรับ badge (พยายามรองรับทั้งของใหม่/เก่า)
  const displayCategory =
    category || item.category || (isThai ? "เมนู" : "Menu");

  // ถ้าไม่มีฟิลด์ availability ให้ถือว่า Available
  const isAvailable =
    item.availability != null ? item.availability === "Available" : true;

  const isFree = !item.price || item.price === 0;

  // สี badge ตาม category แบบง่าย ๆ
  const categoryClass =
    displayCategory === "Special menu" || displayCategory === "Special Menu"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        !isAvailable ? "opacity-60" : "hover:shadow-lg"
      }`}
    >
      {/* ถ้ายังมี imageUrl อยู่ก็ใช้ต่อได้ ถ้าไม่มีจะไม่แสดงอะไร */}
      {item.imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-200">
          <img
            src={item.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Item Details */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${categoryClass}`}
          >
            {displayCategory}
          </span>
        </div>

        {/* Item Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          {displayName}
        </h3>

        {/* Item Description */}
        {displayDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {displayDescription}
          </p>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex flex-col">
            {isFree ? (
              <span className="text-lg font-bold text-green-600">
                {isThai ? "ฟรี" : "Free"}
              </span>
            ) : (
              <span className="text-lg font-bold text-red-600">
                ฿{Number(item.price).toFixed(0)}
              </span>
            )}
          </div>

          {/* Add/Remove Controls */}
          {isAvailable ? (
            <div className="flex items-center space-x-2">
              {quantity > 0 && (
                <>
                  <button
                    onClick={onRemove}
                    className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    aria-label="Remove item"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-800">
                    {quantity}
                  </span>
                </>
              )}
              <button
                onClick={onAdd}
                className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                aria-label="Add item"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <span className="text-sm font-semibold text-gray-500">
              {isThai ? "หมด" : "Out of Stock"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
