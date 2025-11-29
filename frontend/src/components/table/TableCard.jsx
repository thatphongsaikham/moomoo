import React from 'react';
import { Clock, Users, DollarSign, CreditCard, Eye, Play } from 'lucide-react';
import { useTableTimer } from '../../hook/useTableTimer';

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

  /**
   * Get status style based on table status
   */
  const getStatusStyle = () => {
    if (isOvertime) return 'border-red-500/70 bg-gradient-to-br from-red-900/30 to-red-950/30 shadow-red-900/20';
    if (isExpiringSoon) return 'border-yellow-500/70 bg-gradient-to-br from-yellow-900/20 to-yellow-950/20 shadow-yellow-900/20';
    
    const statusMap = {
      Available: 'border-green-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 hover:border-green-500/60 hover:shadow-green-900/20',
      Open: 'border-blue-600/40 bg-gradient-to-br from-blue-900/20 to-blue-950/20 hover:border-blue-500/60 hover:shadow-blue-900/20',
      Closed: 'border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60'
    };
    return statusMap[table.status] || statusMap.Available;
  };

  /**
   * Get status badge style based on table status
   */
  const getStatusBadge = () => {
    const statusMap = {
      Available: {
        bg: 'bg-gradient-to-r from-green-500 to-green-600',
        shadow: 'shadow-green-500/30',
        label: 'ว่าง',
        icon: '✓'
      },
      Open: {
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/30',
        label: 'กำลังใช้งาน',
        icon: '●'
      },
      Closed: {
        bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
        shadow: 'shadow-gray-500/30',
        label: 'ปิด',
        icon: '✕'
      }
    };

    const status = statusMap[table.status] || statusMap.Available;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${status.bg} shadow-lg ${status.shadow}`}>
        <span className="text-[10px]">{status.icon}</span>
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
      Starter: { 
        label: 'ธรรมดา', 
        price: '259฿', 
        color: 'text-gray-300',
        bg: 'bg-gray-700/50',
        border: 'border-gray-600/50'
      },
      Premium: { 
        label: 'พรีเมียม', 
        price: '299฿', 
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/30',
        border: 'border-yellow-600/30'
      }
    };

    const tier = tierMap[table.buffetTier];
    if (!tier) return null;

    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${tier.bg} ${tier.color} border ${tier.border}`}>
        {table.buffetTier === 'Premium' && <span>⭐</span>}
        {tier.label}
      </span>
    );
  };

  return (
    <div className={`
      group relative rounded-xl p-4 border-2 transition-all duration-300 
      hover:shadow-lg backdrop-blur-sm h-full flex flex-col
      ${getStatusStyle()}
    `}>
      {/* Header */}
      <div className="relative flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gray-700/80 rounded-lg flex items-center justify-center text-lg">
            🪑
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white leading-none">
              {table.tableNumber}
            </h3>
            <div className="mt-1">
              {getStatusBadge()}
            </div>
          </div>
        </div>
        
        {/* Timer Display */}
        {table.status === 'Open' && (
          <div className={`
            flex flex-col items-center bg-gray-900/80 px-2 py-1.5 rounded-lg border
            ${isOvertime ? 'border-red-500/50' : isExpiringSoon ? 'border-yellow-500/50' : 'border-gray-700/50'}
          `}>
            <div className="flex items-center gap-1">
              <Clock className={`w-3 h-3 ${isOvertime ? 'text-red-400' : isExpiringSoon ? 'text-yellow-400' : 'text-gray-400'}`} />
              <span className={`text-sm md:text-base font-mono font-bold ${timerColorClass}`}>
                {formattedTime}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Area - Flex grow to push buttons to bottom */}
      <div className="flex-1">
        {/* Table Info for Open Tables */}
        {table.status === 'Open' && (
          <div className="space-y-2 mb-3">
            {/* Customer & Tier Info */}
            <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-2.5 border border-gray-700/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600/20 rounded flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <span className="text-white font-semibold text-sm">{table.customerCount}</span>
                  <span className="text-gray-400 text-xs ml-1">ท่าน</span>
                </div>
              </div>
              {getBuffetTierDisplay()}
            </div>

            {table.currentBill && (
              <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-900/20 px-2.5 py-1.5 rounded-lg border border-amber-600/20">
                <DollarSign className="w-3.5 h-3.5" />
                <span>มีบิลค้าง</span>
              </div>
            )}
          </div>
        )}

        {/* Empty state for Available tables */}
        {table.status === 'Available' && (
          <div className="py-4 flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center mb-1.5 border border-dashed border-gray-600">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs">พร้อมรับลูกค้า</span>
          </div>
        )}
      </div>

      {/* Action Buttons - Always at bottom */}
      <div className="flex gap-2 mt-auto">
        {table.status === 'Available' && (
          <button
            onClick={() => onOpenTable(table.tableNumber)}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 text-sm"
          >
            <Play className="w-4 h-4" />
            เปิดโต๊ะ
          </button>
        )}

        {table.status === 'Open' && (
          <>
            <button
              onClick={() => onViewBill(table.tableNumber)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">ดู</span>บิล
            </button>
            <button
              onClick={() => onCloseTable(table.tableNumber)}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white px-2 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">ชำระ</span>เงิน
            </button>
          </>
        )}
      </div>

      {/* Warnings */}
      {isOvertime && (
        <div className="mt-3 bg-red-900/50 border border-red-500/50 rounded-lg p-2">
          <p className="text-xs text-red-300 font-medium text-center">
            ⚠️ เกินเวลา!
          </p>
        </div>
      )}

      {isExpiringSoon && !isOvertime && (
        <div className="mt-3 bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-2">
          <p className="text-xs text-yellow-300 font-medium text-center">
            ⏰ ใกล้หมดเวลา
          </p>
        </div>
      )}
    </div>
  );
};

export default TableCard;
