import React from 'react';
import { Clock, Users, DollarSign } from 'lucide-react';
import { useTableTimer } from '../../hook/useTableTimer';
import { useBilingual } from '../../hook/useBilingual';

/**
 * TableCard Component - Display table status with timer
 * @param {Object} props
 * @param {Object} props.table - Table data
 * @param {Function} props.onOpenTable - Handler for opening table
 * @param {Function} props.onViewBill - Handler for viewing bill
 * @param {Function} props.onCloseTable - Handler for closing table
 */
export const TableCard = ({
  table,
  onOpenTable,
  onViewBill,
  onCloseTable
}) => {
  const { formattedTime, timerColorClass, isOvertime, isExpiringSoon } = useTableTimer(table);
  const { isThai } = useBilingual();

  /**
   * Get status badge style based on table status
   */
  const getStatusBadge = () => {
    const statusMap = {
      Available: {
        bg: 'bg-green-600',
        text: 'text-white',
        label: isThai ? 'ว่าง' : 'Available'
      },
      Open: {
        bg: 'bg-blue-600',
        text: 'text-white',
        label: isThai ? 'เปิด' : 'Open'
      },
      Closed: {
        bg: 'bg-gray-600',
        text: 'text-white',
        label: isThai ? 'ปิด' : 'Closed'
      }
    };

    const status = statusMap[table.status] || statusMap.Available;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text}`}>
        {status.label}
      </span>
    );
  };

  /**
   * Get buffet tier display
   */
  const getBuffetTierDisplay = () => {
    if (table.buffetTier === 'None') return null;

    const tierMap = {
      Starter: isThai ? 'บุฟเฟ่ต์ปกติ (259฿)' : 'Starter Buffet (259฿)',
      Premium: isThai ? 'บุฟเฟ่ต์พรีเมียม (299฿)' : 'Premium Buffet (299฿)'
    };

    return tierMap[table.buffetTier];
  };

  return (
    <div className={`
      bg-black/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border-2
      ${table.status === 'Available' ? 'border-green-600/50' : ''}
      ${table.status === 'Open' ? 'border-blue-600/50' : ''}
      ${table.status === 'Closed' ? 'border-gray-600/50' : ''}
      ${isOvertime ? 'border-red-500 shadow-lg shadow-red-500/20' : ''}
      ${isExpiringSoon ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : ''}
      transition-all duration-300 hover:shadow-2xl
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white">
            {isThai ? 'โต๊ะ' : 'Table'} {table.tableNumber}
          </h3>
          <div className="mt-2">
            {getStatusBadge()}
          </div>
        </div>
        
        {/* Timer Display */}
        {table.status === 'Open' && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className={`text-lg font-mono font-bold ${timerColorClass}`}>
              {formattedTime}
            </span>
          </div>
        )}
      </div>

      {/* Table Info */}
      {table.status === 'Open' && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span>
              {table.customerCount} {isThai ? 'ท่าน' : 'customers'}
            </span>
          </div>
          
          {getBuffetTierDisplay() && (
            <div className="text-sm text-gray-400">
              {getBuffetTierDisplay()}
            </div>
          )}

          {table.currentBill && (
            <div className="flex items-center gap-2 text-gray-300">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">
                {isThai ? 'มีบิล' : 'Has bill'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {table.status === 'Available' && (
          <button
            onClick={() => onOpenTable(table.tableNumber)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            {isThai ? 'เปิดโต๊ะ' : 'Open Table'}
          </button>
        )}

        {table.status === 'Open' && (
          <>
            <button
              onClick={() => onViewBill(table.tableNumber)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {isThai ? 'ดูบิล' : 'View Bill'}
            </button>
            <button
              onClick={() => onCloseTable(table.tableNumber)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {isThai ? 'ชำระเงิน' : 'Checkout'}
            </button>
          </>
        )}
      </div>

      {/* Overtime Warning */}
      {isOvertime && (
        <div className="mt-3 bg-red-900/30 border border-red-500 rounded-lg p-3">
          <p className="text-sm text-red-400 font-semibold">
            ⚠️ {isThai ? 'เกินเวลา! กรุณาตรวจสอบ' : 'Overtime! Please check'}
          </p>
        </div>
      )}

      {/* Expiring Soon Warning */}
      {isExpiringSoon && !isOvertime && (
        <div className="mt-3 bg-yellow-900/30 border border-yellow-500 rounded-lg p-3">
          <p className="text-sm text-yellow-400 font-semibold">
            ⏰ {isThai ? 'ใกล้หมดเวลา' : 'Time expiring soon'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TableCard;
