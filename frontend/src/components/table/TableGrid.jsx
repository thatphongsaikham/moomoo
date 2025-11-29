import React from 'react';
import TableCard from './TableCard';
import { Inbox } from 'lucide-react';

/**
 * TableGrid Component - Display all tables in a grid layout
 * @param {Object} props
 * @param {Array} props.tables - Array of table objects
 * @param {Function} props.onOpenTable - Handler for opening table
 * @param {Function} props.onViewBill - Handler for viewing bill
 * @param {Function} props.onCloseTable - Handler for closing table
 * @param {string} props.statusFilter - Optional status filter
 */
export const TableGrid = ({
  tables,
  onOpenTable,
  onViewBill,
  onCloseTable,
  statusFilter = null
}) => {
  // Filter tables by status if provided
  const filteredTables = statusFilter
    ? tables.filter(table => table.status === statusFilter)
    : tables;

  // Sort tables by table number
  const sortedTables = [...filteredTables].sort((a, b) => a.tableNumber - b.tableNumber);

  if (sortedTables.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-4 border border-gray-700/50">
          <Inbox className="w-10 h-10 text-gray-600" />
        </div>
        <p className="text-gray-400 text-lg font-medium mb-2">
          ไม่พบโต๊ะ
        </p>
        <p className="text-gray-500 text-sm">
          {statusFilter === 'Available' && 'ไม่มีโต๊ะว่างในขณะนี้'}
          {statusFilter === 'Open' && 'ไม่มีโต๊ะที่เปิดใช้งานอยู่'}
          {!statusFilter && 'ยังไม่มีโต๊ะในระบบ'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
      {sortedTables.map(table => (
        <TableCard
          key={table.tableNumber}
          table={table}
          onOpenTable={onOpenTable}
          onViewBill={onViewBill}
          onCloseTable={onCloseTable}
        />
      ))}
    </div>
  );
};

export default TableGrid;
