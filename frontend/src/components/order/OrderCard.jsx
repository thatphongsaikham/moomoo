import React from "react";

export default function OrderCard({ order, onComplete, borderColor, badgeColor, dotColor }) {
  return (
    <div className={`group relative rounded-2xl p-6 shadow-lg border-2 ${borderColor} bg-white`}>
      <div className={`absolute -top-4 -right-4 ${badgeColor} w-16 h-16 rounded-full flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-xs font-bold text-black">โต๊ะ</div>
          <div className="text-2xl font-black text-black">{order.tableId}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-black mb-3">รายการอาหาร</h3>

          <div className="bg-white rounded-xl p-5 shadow">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-black">
                <div className={`w-2 h-2 ${dotColor} rounded-full`} />
                <span>{item.name} x{item.qty}</span>
              </div>
            ))}
          </div>

          <div className="text-sm text-black mt-3">
            เวลา: {new Date(order.createdAt).toLocaleTimeString("th-TH")}
          </div>
        </div>

        <div className="flex-shrink-0 self-center">
          <button
            onClick={() => onComplete(order._id)}
            className="w-[120px] bg-green-700 text-white py-3 rounded-xl font-bold shadow hover:bg-green-800"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
