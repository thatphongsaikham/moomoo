import React, { useState, useEffect } from 'react';
import { Clock, Users, Phone, UtensilsCrossed, UserPlus } from 'lucide-react';
import queueService from '@/services/queueService';
import tableService from '@/services/tableService';

function WaitlistManagement() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openTablesCount, setOpenTablesCount] = useState(0);

  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    customerPhone: '',
    partySize: '',
  });

  // Fetch queue and open tables count on mount
  useEffect(() => {
    loadQueue();
    loadOpenTablesCount();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadQueue();
      loadOpenTablesCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await queueService.getAll();
      setQueue(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading queue:', err);
      setError('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const loadOpenTablesCount = async () => {
    try {
      const response = await tableService.getAll('Open');
      const tables = response.data || [];
      setOpenTablesCount(tables.length);
    } catch (err) {
      console.error('Error loading open tables:', err);
    }
  };

  const handleEnqueue = async (e) => {
    e.preventDefault();

    if (!newCustomer.customerName || !newCustomer.partySize) {
      alert('กรุณากรอกชื่อลูกค้าและจำนวนคน');
      return;
    }

    const partySize = parseInt(newCustomer.partySize);
    if (partySize < 1 || partySize > 4) {
      alert('จำนวนคนต้องอยู่ระหว่าง 1-4 คน');
      return;
    }

    try {
      await queueService.enqueue({
        customerName: newCustomer.customerName,
        customerPhone: newCustomer.customerPhone || '',
        partySize: partySize,
      });

      setNewCustomer({ customerName: '', customerPhone: '', partySize: '' });
      loadQueue();
    } catch (err) {
      alert('ไม่สามารถเพิ่มคิวได้: ' + err.message);
    }
  };

  const handleDequeue = async () => {
    if (queue.length === 0) {
      alert('ไม่มีลูกค้าในคิว');
      return;
    }

    const nextCustomer = queue[0];
    if (!confirm(`เรียกคิวถัดไป: ${nextCustomer.customerName} (${nextCustomer.partySize} คน)?`)) {
      return;
    }

    try {
      await queueService.dequeue();
      loadQueue();
    } catch (err) {
      alert('ไม่สามารถเรียกคิวได้: ' + err.message);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Bangkok'
    });
  };

  return (
    <div className="p-4 md:p-8 text-white min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-serif mb-1 md:mb-2">📋 จัดการคิวรอ</h1>
        <p className="text-gray-400 text-sm md:text-base">จัดการคิวลูกค้าที่รอโต๊ะ</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
        {/* จำนวนโต๊ะที่เปิดอยู่ */}
        <div className="bg-gray-800/40 p-4 md:p-6 rounded-xl border border-green-600/30 flex items-center gap-3 md:gap-4">
          <UtensilsCrossed className="w-8 h-8 md:w-10 md:h-10 text-green-500 shrink-0" />
          <div>
            <p className="text-gray-400 text-xs md:text-sm">โต๊ะที่เปิดอยู่</p>
            <p className="text-2xl md:text-3xl font-bold text-green-400">{openTablesCount} <span className="text-sm md:text-lg text-gray-400">/ 10</span></p>
          </div>
        </div>

        {/* จำนวนคิวที่รอ */}
        <div className="bg-gray-800/40 p-4 md:p-6 rounded-xl border border-yellow-600/30 flex items-center gap-3 md:gap-4">
          <Users className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 shrink-0" />
          <div>
            <p className="text-gray-400 text-xs md:text-sm">คิวที่รอ</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-400">{queue.length} <span className="text-sm md:text-lg text-gray-400">คิว</span></p>
          </div>
        </div>
      </div>

      {/* Add to Queue Form */}
      <div className="bg-gray-800/40 p-4 md:p-6 rounded-xl border border-gray-700 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4">➕ เพิ่มคิวใหม่</h2>
        <form onSubmit={handleEnqueue} className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 md:items-end">
          <div className="md:col-span-4">
            <label className="block text-sm text-gray-300 mb-2">ชื่อลูกค้า *</label>
            <input
              type="text"
              value={newCustomer.customerName}
              onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
              className="w-full px-4 py-3 md:py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="เช่น คุณสมชาย"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-2">จำนวนคน * (1-4)</label>
            <input
              type="number"
              value={newCustomer.partySize}
              onChange={(e) => setNewCustomer({ ...newCustomer, partySize: e.target.value })}
              className="w-full px-4 py-3 md:py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              min="1"
              max="4"
              placeholder="เช่น 2"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-300 mb-2">เบอร์โทร</label>
            <input
              type="tel"
              value={newCustomer.customerPhone}
              onChange={(e) => setNewCustomer({ ...newCustomer, customerPhone: e.target.value })}
              className="w-full px-4 py-3 md:py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="เบอร์โทรศัพท์"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 md:py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-base"
            >
              <UserPlus className="w-5 h-5" />
              เพิ่มคิว
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 p-4 rounded-lg mb-6 text-red-200 text-sm md:text-base">
          ⚠️ {error}
        </div>
      )}

      {/* Call Next Button */}
      {queue.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleDequeue}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 px-6 md:px-8 py-4 md:py-3 rounded-xl font-bold text-base md:text-lg transition-colors flex items-center justify-center md:justify-start gap-3 shadow-lg shadow-green-600/30"
          >
            <Users className="w-6 h-6" />
            <span className="truncate">🔔 เรียกคิวถัดไป: {queue[0]?.customerName} ({queue[0]?.partySize} คน)</span>
          </button>
        </div>
      )}

      {/* Queue List */}
      <div className="bg-gray-800/40 p-4 md:p-6 rounded-xl border border-gray-700">
        <h2 className="text-lg md:text-xl font-bold mb-4">📝 รายการคิว</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 text-gray-400">ไม่มีลูกค้าในคิวขณะนี้</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {queue.map((item, idx) => (
                <div 
                  key={item._id} 
                  className={`p-4 rounded-lg transition-colors ${idx === 0 ? 'bg-green-900/30 border-l-4 border-green-500' : 'bg-gray-900/30'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm ${idx === 0 ? 'bg-green-600 text-white font-bold' : 'bg-gray-700 text-gray-300'}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">
                          {item.customerName}
                          {idx === 0 && <span className="ml-2 text-green-400 text-xs">(คิวถัดไป)</span>}
                        </p>
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3" /> {item.partySize} คน
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400 mt-3 pt-3 border-t border-gray-700">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> 
                      {item.customerPhone || '-'}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-300 w-20">ลำดับ</th>
                    <th className="text-left px-4 py-3 text-gray-300 w-1/3">ชื่อลูกค้า</th>
                    <th className="text-left px-4 py-3 text-gray-300 w-28">จำนวนคน</th>
                    <th className="text-left px-4 py-3 text-gray-300 w-1/4">เบอร์โทร</th>
                    <th className="text-left px-4 py-3 text-gray-300 w-36">เวลาที่เริ่มจอง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {queue.map((item, idx) => (
                    <tr 
                      key={item._id} 
                      className={`transition-colors ${idx === 0 ? 'bg-green-900/20 border-l-4 border-green-500' : 'hover:bg-gray-700/30'}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${idx === 0 ? 'bg-green-600 text-white font-bold' : 'bg-gray-700 text-gray-300'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {item.customerName}
                        {idx === 0 && <span className="ml-2 text-green-400 text-xs">(คิวถัดไป)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {item.partySize} คน
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.customerPhone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" /> {item.customerPhone}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-blue-400 font-mono">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatTime(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WaitlistManagement;

