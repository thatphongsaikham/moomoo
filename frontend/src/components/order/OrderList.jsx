import OrderCard from "./orderCard";
import React from "react";

export default function OrderList({ title, color, orders, onComplete }) {
  return (
    <div>
      <div className={`bg-white border-2 ${color} rounded-2xl p-6 mb-6 shadow`}>
        <h2 className="text-2xl font-black text-black flex items-center gap-3">
          <div className={`w-3 h-3 ${color} rounded-full animate-pulse`} />
          {title}
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center shadow border-2 border-gray-300">
          <p className="text-black text-xl">ไม่มีออเดอร์ในคิว</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onComplete={onComplete}
              borderColor={`border-${color.replace("bg-", "")}`}
              badgeColor={color}
              dotColor={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
