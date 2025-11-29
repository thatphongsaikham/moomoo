import React, { useState, useEffect } from 'react';
import { Users, Filter, Copy, Check, Utensils, UserCheck, Clock, Sparkles } from 'lucide-react';
import TableGrid from '../../components/table/TableGrid';
import tableService from '../../services/tableService';

function TableManagement() {
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

  // Current time for display
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      alert('เกิดข้อผิดพลาด: ' + error.message);
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
    if (!confirm(`ต้องการปิดโต๊ะ ${tableNumber} หรือไม่?`)) {
      return;
    }

    setLoading(true);
    try {
      await tableService.closeTable(tableNumber);
      alert(`โต๊ะ ${tableNumber} ชำระเงินเรียบร้อย! โต๊ะพร้อมรับลูกค้าใหม่`);
      fetchTables();
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
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

  // Format current time
  const formatTime = (date) => {
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 text-white min-h-screen">
      {/* Header with gradient */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
              <Utensils className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-serif text-white">
                จัดการโต๊ะ
              </h1>
              <p className="text-gray-400 text-xs md:text-sm">
                ระบบจัดการโต๊ะแบบเรียลไทม์
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-700/50 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-lg md:text-xl font-mono font-bold text-white">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Symmetrical Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {/* Total Tables */}
        <div className="group bg-gray-800/60 p-4 md:p-5 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-lg">🪑</span>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">ทั้งหมด</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-gray-400 text-xs md:text-sm mt-1">โต๊ะในระบบ</p>
        </div>

        {/* Available Tables */}
        <div className="group bg-green-900/30 p-4 md:p-5 rounded-xl border border-green-700/30 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-green-400 hidden sm:block">พร้อมใช้งาน</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-400">{stats.available}</p>
          <p className="text-gray-400 text-xs md:text-sm mt-1">โต๊ะว่าง</p>
        </div>

        {/* Open Tables */}
        <div className="group bg-blue-900/30 p-4 md:p-5 rounded-xl border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-400 hidden sm:block">กำลังใช้งาน</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-blue-400">{stats.open}</p>
          <p className="text-gray-400 text-xs md:text-sm mt-1">โต๊ะเปิดอยู่</p>
        </div>

        {/* Customer Count */}
        <div className="group bg-purple-900/30 p-4 md:p-5 rounded-xl border border-purple-700/30 hover:border-purple-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-purple-400 hidden sm:block">ลูกค้าทั้งหมด</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-purple-400">{stats.customers}</p>
          <p className="text-gray-400 text-xs md:text-sm mt-1">คนรับประทาน</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-800/40 p-3 md:p-4 rounded-xl border border-gray-700/50 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm mr-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">กรอง:</span>
          </div>
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${statusFilter === null
              ? 'bg-red-600 text-white'
              : 'bg-gray-700/70 text-gray-300 hover:bg-gray-600/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            ทั้งหมด
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{stats.total}</span>
          </button>
          <button
            onClick={() => setStatusFilter('Available')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${statusFilter === 'Available'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700/70 text-gray-300 hover:bg-gray-600/70'
            }`}
          >
            <Check className="w-4 h-4" />
            ว่าง
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{stats.available}</span>
          </button>
          <button
            onClick={() => setStatusFilter('Open')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${statusFilter === 'Open'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/70 text-gray-300 hover:bg-gray-600/70'
            }`}
          >
            <Users className="w-4 h-4" />
            เปิดอยู่
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{stats.open}</span>
          </button>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gray-700/50" />
        <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          🪑 แผนผังโต๊ะ
        </h2>
        <div className="h-px flex-1 bg-gray-700/50" />
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
              เปิดโต๊ะ {selectedTable}
            </h3>
            <form onSubmit={submitOpenTable} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  จำนวนลูกค้า (1-4) *
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
                  ประเภทบุฟเฟ่ต์ *
                </label>
                <select
                  value={openForm.buffetTier}
                  onChange={(e) => setOpenForm({ ...openForm, buffetTier: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-red-600/30 rounded-lg text-white focus:border-red-600 focus:outline-none"
                >
                  <option value="Starter">
                    ธรรมดา (259฿)
                  </option>
                  <option value="Premium">
                    พรีเมียม (299฿)
                  </option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpenDialog(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'กำลังเปิด...' : 'เปิดโต๊ะ'}
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
                เปิดโต๊ะสำเร็จ!
              </h3>
              <p className="text-gray-400">
                โต๊ะที่ {openedTableData.tableNumber}
              </p>
            </div>

            {/* PIN Display */}
            <div className="bg-black/50 border border-red-600/30 rounded-xl p-6 mb-4">
              <p className="text-gray-400 text-sm mb-2 text-center">
                รหัส PIN สำหรับลูกค้า
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
                ลิงก์เมนู
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
                <strong>วิธีใช้:</strong> ให้ลูกค้าเปิดหน้าเว็บ แล้วกรอกหมายเลขโต๊ะและรหัส PIN เพื่อเข้าสู่เมนู
              </p>
            </div>

            {/* Table Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">จำนวนลูกค้า</p>
                <p className="text-white text-xl font-bold">{openedTableData.customerCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">ประเภท</p>
                <p className="text-white text-xl font-bold">{openedTableData.buffetTier === 'Starter' ? 'ธรรมดา' : 'พรีเมียม'}</p>
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
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableManagement;