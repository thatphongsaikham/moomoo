import React from 'react';
import TableCard from './TableCard';
import { useBilingual } from '../../hook/useBilingual';

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
  const { isThai } = useBilingual();

  // Filter tables by status if provided
  const filteredTables = statusFilter
    ? tables.filter(table => table.status === statusFilter)
    : tables;

  // Sort tables by table number
  const sortedTables = [...filteredTables].sort((a, b) => a.tableNumber - b.tableNumber);

  if (sortedTables.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {isThai ? 'ไม่พบโต๊ะ' : 'No tables found'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
