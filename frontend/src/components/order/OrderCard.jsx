import React from "react";
import { Clock, Users } from 'lucide-react';
import { useBilingual } from '../../hook/useBilingual';

/**
 * OrderCard Component - Display order details with queue type badge
 * @param {Object} props
 * @param {Object} props.order - Order object
 * @param {Function} props.onComplete - Handler for completing order
 */
export default function OrderCard({ order, onComplete }) {
  const { isThai } = useBilingual();

  // Queue type styling
  const isNormalQueue = order.queueType === 'Normal';
  const borderColor = isNormalQueue ? 'border-blue-400' : 'border-purple-400';
  const badgeColor = isNormalQueue ? 'bg-blue-500' : 'bg-purple-500';
  const dotColor = isNormalQueue ? 'bg-blue-500' : 'bg-purple-500';

  // Format time
  const orderTime = new Date(order.createdAt).toLocaleTimeString(
    isThai ? 'th-TH' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className={`group relative rounded-2xl p-6 shadow-lg border-2 ${borderColor} bg-white hover:shadow-xl transition-shadow`}>
      {/* Queue Type Badge */}
      <div className={`absolute -top-3 -right-3 ${badgeColor} px-4 py-2 rounded-full shadow-lg`}>
        <div className="text-xs font-bold text-white">
          {order.queueType} Queue
        </div>
      </div>

      {/* Table Number Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <span className="text-xl font-bold text-gray-800">
          {isThai ? 'โต๊ะ' : 'Table'} {order.tableNumber}
        </span>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">
          {isThai ? 'รายการอาหาร' : 'Order Items'}
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-2 h-2 ${dotColor} rounded-full mt-2 flex-shrink-0`} />
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {isThai ? item.nameThai : item.nameEnglish}
                </div>
                <div className="text-sm text-gray-500">
                  {isThai ? 'จำนวน' : 'Qty'}: {item.quantity} × ฿{item.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-xs font-semibold text-yellow-800 mb-1">
            {isThai ? 'หมายเหตุ' : 'Notes'}
          </div>
          <div className="text-sm text-yellow-900">{order.notes}</div>
        </div>
      )}

      {/* Footer with Time and Complete Button */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{orderTime}</span>
        </div>
        <button
          onClick={() => onComplete(order._id)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          {isThai ? 'เสร็จสิ้น' : 'Complete'}
        </button>
      </div>
    </div>
  );
}
