import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Plus, Filter, Copy, QrCode, Check } from 'lucide-react';
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
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [openedTableData, setOpenedTableData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

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
      const response = await tableService.openTable(
        selectedTable,
        parseInt(openForm.customerCount),
        openForm.buffetTier
      );
      
      // Show PIN dialog with table data
      setOpenedTableData({
        tableNumber: selectedTable,
        pin: response.data.pin,
        encryptedId: response.data.encryptedId,
        customerCount: response.data.customerCount,
        buffetTier: response.data.buffetTier
      });
      setShowOpenDialog(false);
      setShowPINDialog(true);
      fetchTables();
    } catch (error) {
      alert(isThai ? 'เกิดข้อผิดพลาด: ' + error.message : 'Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy to clipboard
   */
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Get menu URL
   */
  const getMenuURL = (encryptedId) => {
    return `${window.location.origin}/menu/${encryptedId}`;
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

      {/* PIN Display Dialog */}
      {showPINDialog && openedTableData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-red-600/30">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {isThai ? 'เปิดโต๊ะสำเร็จ!' : 'Table Opened!'}
              </h3>
              <p className="text-gray-400">
                {isThai ? `โต๊ะที่ ${openedTableData.tableNumber}` : `Table ${openedTableData.tableNumber}`}
              </p>
            </div>

            {/* PIN Display */}
            <div className="bg-black/50 border border-red-600/30 rounded-xl p-6 mb-4">
              <p className="text-gray-400 text-sm mb-2 text-center">
                {isThai ? 'รหัส PIN สำหรับลูกค้า' : 'Customer PIN'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-5xl font-bold text-red-600 tracking-widest">
                  {openedTableData.pin}
                </div>
                <button
                  onClick={() => copyToClipboard(openedTableData.pin, 'pin')}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copiedField === 'pin' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Menu URL */}
            <div className="bg-black/50 border border-red-600/30 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">
                {isThai ? 'ลิงก์เมนู' : 'Menu Link'}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getMenuURL(openedTableData.encryptedId)}
                  readOnly
                  className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={() => copyToClipboard(getMenuURL(openedTableData.encryptedId), 'url')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copiedField === 'url' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4 mb-6">
              <p className="text-blue-300 text-sm leading-relaxed">
                {isThai ? (
                  <>
                    <strong>วิธีใช้:</strong> ให้ลูกค้าเปิดหน้าเว็บ แล้วกรอกหมายเลขโต๊ะและรหัส PIN เพื่อเข้าสู่เมนู
                  </>
                ) : (
                  <>
                    <strong>Instructions:</strong> Customer opens the website, enters table number and PIN to access menu
                  </>
                )}
              </p>
            </div>

            {/* Table Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">{isThai ? 'จำนวนลูกค้า' : 'Customers'}</p>
                <p className="text-white text-xl font-bold">{openedTableData.customerCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">{isThai ? 'ประเภท' : 'Tier'}</p>
                <p className="text-white text-xl font-bold">{openedTableData.buffetTier}</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowPINDialog(false);
                setOpenedTableData(null);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isThai ? 'ปิด' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableManagement;