import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Printer, X, History, Calendar } from 'lucide-react';
import BillSummary from '../../components/bill/BillSummary';
import BillPrint from '../../components/bill/BillPrint';
import billService from '../../services/billService';
import tableService from '../../services/tableService';
import { useBilingual } from '../../hook/useBilingual';

function BillingManagement() {
  const { isThai } = useBilingual();
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [tables, setTables] = useState([]);
  const [historicalBills, setHistoricalBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // No filters needed - show all historical bills

  /**
   * Fetch open tables (tables with bills)
   */
  const fetchOpenTables = async () => {
    try {
      const response = await tableService.getTables('Open');
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  /**
   * Fetch all historical bills (no filters)
   */
  const fetchHistoricalBills = async () => {
    setLoading(true);
    try {
      const response = await billService.getHistoricalBills({});
      console.log('Historical bills API response:', response);
      console.log('First bill sample:', response.data[0]);
      // response.data is already the array of bills
      setHistoricalBills(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch historical bills:', error);
      setHistoricalBills([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load all historical bills when switching to history tab
   */
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoricalBills();
    }
  }, [activeTab]);

  /**
   * Poll tables every 3 seconds
   */
  useEffect(() => {
    fetchOpenTables();
    const interval = setInterval(fetchOpenTables, 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Handle view bill
   */
  const handleViewBill = async (tableNumber) => {
    setLoading(true);
    try {
      const response = await billService.getActiveBillForTable(tableNumber);
      
      // Check if bill exists
      if (!response.data) {
        alert(isThai ? 'ไม่พบบิลสำหรับโต๊ะนี้' : 'No bill found for this table');
        return;
      }
      
      setSelectedBill(response.data);
      setShowBillDialog(true);
    } catch (error) {
      alert(isThai ? 'เกิดข้อผิดพลาด: ' + error.message : 'Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle print bill
   */
  const handlePrintBill = async () => {
    if (!selectedBill) return;

    setLoading(true);
    try {
      const response = await billService.getPrintableBill(selectedBill.tableNumber);
      setPrintData(response.data);
      setShowPrintDialog(true);
      
      // Trigger print after a short delay
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      alert(isThai ? 'เกิดข้อผิดพลาด: ' + error.message : 'Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 text-white min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-serif mb-1 md:mb-2">
          💵 จัดการบิล
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          ดูบิลและประวัติการชำระเงิน
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800/40 p-3 md:p-4 rounded-xl border border-gray-700 mb-6 md:mb-8">
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:flex-none px-4 py-2.5 md:py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>บิลที่เปิด</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{tables.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-none px-4 py-2.5 md:py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติ</span>
          </button>
        </div>
      </div>

      {/* Active Bills Tab */}
      {activeTab === 'active' && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="bg-gray-800/40 p-4 md:p-6 rounded-xl border border-green-600/30 flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-900/50 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">โต๊ะที่เปิด</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">{tables.length} <span className="text-sm md:text-base text-gray-400">โต๊ะ</span></p>
              </div>
            </div>
            <div className="bg-gray-800/40 p-4 md:p-6 rounded-xl border border-blue-600/30 flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">บิลรอชำระ</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">{tables.length} <span className="text-sm md:text-base text-gray-400">บิล</span></p>
              </div>
            </div>
          </div>

          {/* Tables with Bills */}
          {tables.length === 0 ? (
            <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                ไม่มีโต๊ะที่เปิดอยู่
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {tables.map((table) => (
                <div
                  key={table.tableNumber}
                  className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 md:p-5 hover:border-green-600/50 transition-all"
                >
                  {/* Table Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        โต๊ะ {table.tableNumber}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {table.customerCount} ท่าน
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      table.buffetTier === 'Premium' 
                        ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600/30' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {table.buffetTier === 'Starter' ? 'ธรรมดา' : 'พรีเมียม'}
                    </span>
                  </div>

                  {/* Table Info */}
                  <div className="bg-gray-900/30 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">เปิดเมื่อ</span>
                      <span className="text-white font-mono">
                        {new Date(table.openedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewBill(table.tableNumber)}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {loading ? 'กำลังโหลด...' : 'ดูบิล'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Historical Bills Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">📋 ประวัติบิล</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">กำลังโหลด...</p>
            </div>
          ) : historicalBills.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                ไม่พบประวัติบิล
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {historicalBills.map((bill) => (
                  <div
                    key={bill._id}
                    className="bg-gray-900/30 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          โต๊ะ {bill.tableNumber}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {bill.customerCount} ท่าน • {bill.buffetTier === 'Starter' ? 'ธรรมดา' : 'พรีเมียม'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-green-900/50 border border-green-600/30 text-green-400 text-xs font-medium">
                        ชำระแล้ว
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-gray-400">
                        {new Date(bill.archivedAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}
                        <span className="mx-1">•</span>
                        {new Date(bill.archivedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}
                      </div>
                      <div className="text-xl font-bold text-green-400">฿{(bill.total || 0).toFixed(0)}</div>
                    </div>
                    
                    <button
                      onClick={async () => {
                        try {
                          const response = await billService.getBillById(bill._id);
                          setSelectedBill(response.data);
                          setShowBillDialog(true);
                        } catch (error) {
                          alert(error.message);
                        }
                      }}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-300">โต๊ะ</th>
                      <th className="text-left px-4 py-3 text-gray-300">ลูกค้า</th>
                      <th className="text-left px-4 py-3 text-gray-300">ประเภท</th>
                      <th className="text-left px-4 py-3 text-gray-300">วันที่ปิด</th>
                      <th className="text-right px-4 py-3 text-gray-300">ยอดรวม</th>
                      <th className="text-center px-4 py-3 text-gray-300"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {historicalBills.map((bill) => (
                      <tr key={bill._id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">
                          โต๊ะ {bill.tableNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {bill.customerCount} ท่าน
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            bill.buffetTier === 'Premium' 
                              ? 'bg-yellow-900/50 text-yellow-400' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {bill.buffetTier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {new Date(bill.archivedAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}
                          <br />
                          {new Date(bill.archivedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-lg font-bold text-green-400">฿{(bill.total || 0).toFixed(0)}</span>
                          <div className="text-xs text-gray-500">VAT ฿{(bill.vatAmount || 0).toFixed(0)}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={async () => {
                              try {
                                const response = await billService.getBillById(bill._id);
                                setSelectedBill(response.data);
                                setShowBillDialog(true);
                              } catch (error) {
                                alert(error.message);
                              }
                            }}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            ดู
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bill Dialog */}
      {showBillDialog && selectedBill && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-green-600/30 my-8">
            <BillSummary
              bill={selectedBill}
              onClose={() => {
                setShowBillDialog(false);
                setSelectedBill(null);
              }}
              onPrint={handlePrintBill}
            />
          </div>
        </div>
      )}

      {/* Print Dialog */}
      {showPrintDialog && printData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                ตัวอย่างบิล
              </h3>
              <button
                onClick={() => {
                  setShowPrintDialog(false);
                  setPrintData(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <BillPrint printData={printData} />
            <button
              onClick={() => window.print()}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Printer className="w-4 h-4 inline mr-2" />
              พิมพ์อีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingManagement;
