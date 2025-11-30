import React from "react";
import { Clock } from 'lucide-react';
import { useBilingual } from '../../hook/useBilingual';

/**
 * OrderCard Component - Display order details
 * @param {Object} props
 * @param {Object} props.order - Order object
 * @param {Boolean} props.isFirst - Is this the first order in queue
 */
export default function OrderCard({ order, isFirst }) {
  const { isThai } = useBilingual();

  // Queue type styling
  const isNormalQueue = order.queueType === 'Normal';
  const accentColor = isNormalQueue ? 'bg-blue-500' : 'bg-purple-500';
  const borderHighlight = isFirst 
    ? (isNormalQueue ? 'border-blue-500 bg-blue-950/30' : 'border-purple-500 bg-purple-950/30')
    : 'border-gray-700 bg-gray-900/50';

  // Format time - use Thailand timezone
  const orderDate = new Date(order.createdAt);
  const orderTime = orderDate.toLocaleTimeString('th-TH', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  });

  // Calculate time elapsed - get current time in Thailand timezone
  const nowInThailand = new Date().getTime();
  const orderTimeMs = orderDate.getTime();
  const minutesAgo = Math.max(0, Math.floor((nowInThailand - orderTimeMs) / 60000));
  
  const timeAgoText = minutesAgo < 1 
    ? (isThai ? 'เมื่อกี้' : 'Just now')
    : (isThai ? `${minutesAgo} นาทีก่อน` : `${minutesAgo}m ago`);

  return (
    <div className={`rounded-xl p-5 border-2 ${borderHighlight} transition-all`}>
      {/* Header: Table + Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isFirst && (
            <span className={`${accentColor} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
              #1
            </span>
          )}
          <span className="text-base md:text-lg font-bold text-white">
            🪑 {isThai ? 'โต๊ะ' : 'Table'} {order.tableNumber}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs md:text-sm">
          <Clock className="w-3.5 h-3.5" />
          <span>{orderTime}</span>
          <span className="text-gray-600">•</span>
          <span className={minutesAgo > 10 ? 'text-red-400' : 'text-gray-400'}>
            {timeAgoText}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-3">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 ${accentColor} rounded-full`}></span>
              <span className="text-white font-medium text-sm">
                {item.nameThai || item.nameEnglish}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm bg-gray-700 px-2 py-0.5 rounded">
                ×{item.quantity}
              </span>
              {item.price > 0 && (
                <span className="text-gray-400 text-xs">
                  ฿{item.price}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-600/30">
          <div className="text-sm text-yellow-400">
            📝 {order.notes}
          </div>
        </div>
      )}
    </div>
  );
}
