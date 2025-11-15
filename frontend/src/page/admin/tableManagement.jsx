import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Plus, Filter } from 'lucide-react';
import TableGrid from '../../components/table/TableGrid';
import tableService from '../../services/tableService';
import { useBilingual } from '../../hook/useBilingual';

function TableManagement() {
  const { isThai } = useBilingual();
  const [tables, setTables] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);

  // Open table form state
  const [openForm, setOpenForm] = useState({
    customerCount: '',
    buffetTier: 'Starter'
  });

  /**
   * Fetch tables from API
   */
  const fetchTables = async () => {
    try {
      const response = await tableService.getTables(statusFilter);
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  /**
   * Poll tables every 2 seconds
   */
  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 2000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  /**
   * Handle open table dialog
   */
  const handleOpenTable = (tableNumber) => {
    setSelectedTable(tableNumber);
    setOpenForm({ customerCount: '', buffetTier: 'Starter' });
    setShowOpenDialog(true);
  };

  /**
   * Submit open table
   */
  const submitOpenTable = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await tableService.openTable(
        selectedTable,
        parseInt(openForm.customerCount),
        openForm.buffetTier
      );
      alert(isThai ? `เปิดโต๊ะ ${selectedTable} สำเร็จ!` : `Table ${selectedTable} opened successfully!`);
      setShowOpenDialog(false);
      fetchTables();
    } catch (error) {
      alert(isThai ? 'เกิดข้อผิดพลาด: ' + error.message : 'Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };



  /**
   * Handle view bill (redirect to billing management)
   */
  const handleViewBill = (tableNumber) => {
    window.location.href = `/admin/billing?table=${tableNumber}`;
  };

  /**
   * Handle close table - directly close with default payment method
   */
  const handleCloseTable = async (tableNumber) => {
    if (!confirm(isThai ? `ต้องการปิดโต๊ะ ${tableNumber} หรือไม่?` : `Close table ${tableNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      await tableService.closeTable(tableNumber);
      alert(isThai 
        ? `โต๊ะ ${tableNumber} ชำระเงินเรียบร้อย! โต๊ะพร้อมรับลูกค้าใหม่` 
        : `Table ${tableNumber} checked out! Ready for next customer`
      );
      fetchTables();
    } catch (error) {
      alert(isThai ? 'เกิดข้อผิดพลาด: ' + error.message : 'Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get statistics
   */
  const getStats = () => {
    const stats = {
      total: tables.length,
      available: tables.filter(t => t.status === 'Available').length,
      reserved: tables.filter(t => t.status === 'Reserved').length,
      open: tables.filter(t => t.status === 'Open').length,
      customers: tables.filter(t => t.status === 'Open').reduce((sum, t) => sum + t.customerCount, 0)
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-red-600 p-3 rounded-full mr-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              {isThai ? 'จัดการโต๊ะ' : 'Table Management'}
            </h1>
            <p className="text-red-400 text-lg mt-2">
              {isThai ? 'Table Management' : 'จัดการโต๊ะ'}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/50 backdrop-blur-sm border border-red-600/20 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">{isThai ? 'ทั้งหมด' : 'Total'}</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-green-600/20 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">{isThai ? 'ว่าง' : 'Available'}</p>
              <p className="text-green-400 text-2xl font-bold">{stats.available}</p>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-blue-600/20 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">{isThai ? 'เปิด' : 'Open'}</p>
              <p className="text-blue-400 text-2xl font-bold">{stats.open}</p>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">{isThai ? 'ลูกค้า' : 'Customers'}</p>
              <p className="text-purple-400 text-2xl font-bold">{stats.customers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            statusFilter === null
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Filter className="w-4 h-4 inline mr-2" />
          {isThai ? 'ทั้งหมด' : 'All'}
        </button>
        <button
          onClick={() => setStatusFilter('Available')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            statusFilter === 'Available'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isThai ? 'ว่าง' : 'Available'}
        </button>
        <button
          onClick={() => setStatusFilter('Open')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            statusFilter === 'Open'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isThai ? 'เปิด' : 'Open'}
        </button>
      </div>

      {/* Table Grid */}
      <TableGrid
        tables={tables}
        onOpenTable={handleOpenTable}
        onViewBill={handleViewBill}
        onCloseTable={handleCloseTable}
        statusFilter={statusFilter}
      />

      {/* Open Table Dialog */}
      {showOpenDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-600/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              {isThai ? 'เปิดโต๊ะ' : 'Open Table'} {selectedTable}
            </h3>
            <form onSubmit={submitOpenTable} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  {isThai ? 'จำนวนลูกค้า' : 'Customer Count'} (1-4) *
                </label>
                <input
                  type="number"
                  value={openForm.customerCount}
                  onChange={(e) => setOpenForm({ ...openForm, customerCount: e.target.value })}
                  min="1"
                  max="4"
                  required
                  className="w-full px-4 py-2 bg-black border border-red-600/30 rounded-lg text-white focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  {isThai ? 'ประเภทบุฟเฟ่ต์' : 'Buffet Tier'} *
                </label>
                <select
                  value={openForm.buffetTier}
                  onChange={(e) => setOpenForm({ ...openForm, buffetTier: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-red-600/30 rounded-lg text-white focus:border-red-600 focus:outline-none"
                >
                  <option value="Starter">
                    {isThai ? 'ธรรมดา (259฿)' : 'Starter (259฿)'}
                  </option>
                  <option value="Premium">
                    {isThai ? 'พรีเมียม (299฿)' : 'Premium (299฿)'}
                  </option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpenDialog(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isThai ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? (isThai ? 'กำลังเปิด...' : 'Opening...') : (isThai ? 'เปิดโต๊ะ' : 'Open')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableManagement;