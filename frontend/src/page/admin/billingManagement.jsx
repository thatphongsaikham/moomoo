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
    <div className="p-6 md:p-8 min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-green-600 p-3 rounded-full mr-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              {isThai ? 'จัดการบิล' : 'Billing Management'}
            </h1>
            <p className="text-green-400 text-lg mt-2">
              {isThai ? 'Billing Management' : 'จัดการบิล'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'active'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            {isThai ? 'บิลที่เปิดอยู่' : 'Active Bills'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <History className="w-5 h-5 inline mr-2" />
            {isThai ? 'ประวัติบิล' : 'Bill History'}
          </button>
        </div>

        {/* Statistics */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
            <div className="bg-black/50 backdrop-blur-sm border border-green-600/20 rounded-xl p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">{isThai ? 'โต๊ะที่เปิด' : 'Open Tables'}</p>
                <p className="text-green-400 text-3xl font-bold">{tables.length}</p>
              </div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm border border-green-600/20 rounded-xl p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">{isThai ? 'บิลที่รออ่าน' : 'Active Bills'}</p>
                <p className="text-green-400 text-3xl font-bold">{tables.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Bills Tab */}
      {activeTab === 'active' && (
        <>
          {/* Tables with Bills */}
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {isThai ? 'ไม่มีโต๊ะที่เปิดอยู่' : 'No open tables'}
              </p>
            </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div
              key={table.tableNumber}
              className="bg-gray-900/50 backdrop-blur-sm border border-green-600/20 rounded-2xl p-6 hover:border-green-600/40 transition-all duration-300"
            >
              {/* Table Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-1">
                    {isThai ? 'โต๊ะ' : 'Table'} {table.tableNumber}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {table.customerCount} {isThai ? 'ท่าน' : 'customers'}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-blue-100 border border-blue-200">
                  <span className="text-sm font-semibold text-blue-800">
                    {table.buffetTier === 'Starter'
                      ? isThai ? 'ธรรมดา' : 'Starter'
                      : isThai ? 'พรีเมียม' : 'Premium'
                    }
                  </span>
                </div>
              </div>

              {/* Table Info */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{isThai ? 'เปิดเมื่อ' : 'Opened at'}:</span>
                  <span className="text-white">
                    {new Date(table.openedAt).toLocaleTimeString(isThai ? 'th-TH' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleViewBill(table.tableNumber)}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                {loading ? (isThai ? 'กำลังโหลด...' : 'Loading...') : (isThai ? 'ดูบิล' : 'View Bill')}
              </button>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {/* Historical Bills Tab */}
      {activeTab === 'history' && (
        <>
          {/* Historical Bills List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">{isThai ? 'กำลังโหลด...' : 'Loading...'}</p>
            </div>
          ) : historicalBills.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {isThai ? 'ไม่พบประวัติบิล' : 'No historical bills found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historicalBills.map((bill) => (
                <div
                  key={bill._id}
                  className="bg-gray-900/50 backdrop-blur-sm border border-green-600/20 rounded-xl p-6 hover:border-green-600/40 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {isThai ? 'โต๊ะ' : 'Table'} {bill.tableNumber}
                        </h3>
                        <span className="px-3 py-1 rounded-lg bg-green-900/50 border border-green-600/30 text-green-400 text-sm font-semibold">
                          {isThai ? 'ชำระแล้ว' : 'Paid'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>
                          {isThai ? 'ปิดเมื่อ' : 'Closed at'}: {new Date(bill.archivedAt).toLocaleString(isThai ? 'th-TH' : 'en-US')}
                        </div>
                        <div>
                          {bill.customerCount} {isThai ? 'ท่าน' : 'customers'} • {bill.buffetTier} Buffet
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">{isThai ? 'ยอดรวม' : 'Total'}</div>
                      <div className="text-3xl font-bold text-green-400">฿{(bill.total || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isThai ? 'VAT' : 'VAT'}: ฿{(bill.vatAmount || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
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
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        <FileText className="w-4 h-4 inline mr-2" />
                        {isThai ? 'ดูรายละเอียด' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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
                {isThai ? 'ตัวอย่างบิล' : 'Bill Preview'}
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
              {isThai ? 'พิมพ์อีกครั้ง' : 'Print Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingManagement;
