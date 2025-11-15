import React from "react";
import OrderCard from "./OrderCard";
import { useBilingual } from '../../hook/useBilingual';

/**
 * OrderList Component - Display list of orders for a specific queue
 * @param {Object} props
 * @param {String} props.queueType - 'Normal' or 'Special'
 * @param {Array} props.orders - Array of order objects
 * @param {Function} props.onComplete - Handler for completing order
 */
export default function OrderList({ queueType, orders, onComplete }) {
  const { isThai } = useBilingual();

  const isNormalQueue = queueType === 'Normal';
  const headerColor = isNormalQueue ? 'bg-blue-500' : 'bg-purple-500';
  const borderColor = isNormalQueue ? 'border-blue-400' : 'border-purple-400';
  const pulseColor = isNormalQueue ? 'bg-blue-500' : 'bg-purple-500';

  const title = isNormalQueue
    ? (isThai ? 'คิวธรรมดา (บุฟเฟ่ต์)' : 'Normal Queue (Buffet)')
    : (isThai ? 'คิวพิเศษ (เมนูพิเศษ)' : 'Special Queue (Special Menu)');

  const emptyMessage = isNormalQueue
    ? (isThai ? 'ไม่มีออเดอร์ในคิวธรรมดา' : 'No orders in Normal queue')
    : (isThai ? 'ไม่มีออเดอร์ในคิวพิเศษ' : 'No orders in Special queue');

  return (
    <div>
      {/* Queue Header */}
      <div className={`${headerColor} rounded-xl p-4 mb-4 shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 ${pulseColor} rounded-full animate-pulse border-2 border-white`} />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
            <span className="text-white font-bold text-lg">{orders.length}</span>
            <span className="text-white text-sm ml-2">
              {isThai ? 'ออเดอร์' : 'orders'}
            </span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className={`bg-white rounded-xl p-10 text-center border-2 ${borderColor} border-dashed`}>
          <div className="text-gray-400 text-6xl mb-3">📋</div>
          <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
