import React from "react";
import { Send, Loader2 } from "lucide-react";
import OrderCard from "./OrderCard";
import { useBilingual } from '../../hook/useBilingual';

/**
 * OrderList Component - Display list of orders for a specific queue
 * @param {Object} props
 * @param {String} props.queueType - 'Normal' or 'Special'
 * @param {Array} props.orders - Array of order objects
 * @param {Function} props.onServeFirst - Handler for serving first order
 * @param {Boolean} props.isServing - Is currently serving
 */
export default function OrderList({ queueType, orders, onServeFirst, isServing }) {
  const { isThai } = useBilingual();

  const isNormalQueue = queueType === 'Normal';
  const headerBg = isNormalQueue ? 'bg-blue-600' : 'bg-purple-600';
  const borderColor = isNormalQueue ? 'border-blue-500/30' : 'border-purple-500/30';
  const emptyBorder = isNormalQueue ? 'border-blue-500/20' : 'border-purple-500/20';
  const buttonBg = isNormalQueue 
    ? 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600' 
    : 'bg-purple-500 hover:bg-purple-400 active:bg-purple-600';

  const title = isNormalQueue
    ? (isThai ? '🍖 คิวบุฟเฟ่ต์' : '🍖 Buffet Queue')
    : (isThai ? '🍣 คิวพิเศษ' : '🍣 Special Queue');

  const emptyMessage = isNormalQueue
    ? (isThai ? 'ไม่มีออเดอร์บุฟเฟ่ต์' : 'No buffet orders')
    : (isThai ? 'ไม่มีออเดอร์พิเศษ' : 'No special orders');

  const firstOrder = orders[0];

  return (
    <div className={`bg-gray-800/40 rounded-2xl border ${borderColor} overflow-hidden`}>
      {/* Queue Header */}
      <div className={`${headerBg} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="text-white font-bold">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Serve First Button - แสดงเฉพาะเมื่อมี order */}
      {orders.length > 0 && (
        <div className="p-3 md:p-4 border-b border-gray-700">
          <button
            onClick={onServeFirst}
            disabled={isServing}
            className={`w-full ${buttonBg} text-white py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg`}
          >
            {isServing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{isThai ? 'กำลังส่ง...' : 'Serving...'}</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span>
                  {isThai 
                    ? `ส่งเมนู โต๊ะ ${firstOrder.tableNumber}` 
                    : `Serve Table ${firstOrder.tableNumber}`
                  }
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="p-4 md:p-5">
        {orders.length === 0 ? (
          <div className={`rounded-xl p-8 md:p-10 text-center border-2 ${emptyBorder} border-dashed bg-gray-900/30`}>
            <div className="text-4xl md:text-5xl mb-2 opacity-50">
              {isNormalQueue ? '🍖' : '🍣'}
            </div>
            <p className="text-gray-400 text-sm md:text-base font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <OrderCard
                key={order._id}
                order={order}
                isFirst={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
