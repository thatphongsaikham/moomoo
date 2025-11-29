import React, { useState, useEffect } from 'react';
import { Clock, Users, Phone, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import reservationService from '@/services/reservationService';

function WaitlistManagement() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalReservations: 0, activeReservations: 0, totalPeopleWaiting: 0 });

  const [newReservation, setNewReservation] = useState({
    customerName: '',
    customerPhone: '',
    partySize: '',
  });

  const [showConvertForm, setShowConvertForm] = useState(null);
  const [convertData, setConvertData] = useState({
    customerCount: '',
    buffetTier: 'Starter',
  });

  // Fetch reservations and stats on mount
  useEffect(() => {
    loadReservations();
    loadStats();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadReservations();
      loadStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getActiveReservations();
      setReservations(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reservationService.getWaitlistStats();
      setStats(response.data || {});
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleAddReservation = async (e) => {
    e.preventDefault();

    if (!newReservation.customerName || !newReservation.partySize) {
      alert('กรุณากรอกชื่อลูกค้าและจำนวนคน');
      return;
    }

    try {
      await reservationService.createReservation({
        customerName: newReservation.customerName,
        customerPhone: newReservation.customerPhone || '',
        partySize: parseInt(newReservation.partySize),
      });

      setNewReservation({ customerName: '', customerPhone: '', partySize: '' });
      loadReservations();
      loadStats();
    } catch (err) {
      alert('ไม่สามารถเพิ่มการจองได้: ' + err.message);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('ยืนยันการยกเลิกการจอง?')) return;

    try {
      await reservationService.cancelReservation(reservationId);
      loadReservations();
      loadStats();
    } catch (err) {
      alert('ไม่สามารถยกเลิกการจองได้: ' + err.message);
    }
  };

  const handleConvertReservation = async (reservationId) => {
    if (!convertData.customerCount) {
      alert('กรุณากรอกจำนวนลูกค้า');
      return;
    }

    try {
      await reservationService.convertToOpenTable(
        reservationId,
        parseInt(convertData.customerCount),
        convertData.buffetTier
      );

      setShowConvertForm(null);
      setConvertData({ customerCount: '', buffetTier: 'Starter' });
      loadReservations();
      loadStats();
      alert('เปิดโต๊ะสำเร็จ');
    } catch (err) {
      alert('ไม่สามารถเปิดโต๊ะได้: ' + err.message);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return 'หมดเวลา';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">📋 จัดการคิวรอ (การจอง)</h1>
        <p className="text-gray-400">จัดการการจองโต๊ะและคิวรอ</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-gray-400 text-sm">การจองทั้งหมด</p>
              <p className="text-2xl font-bold">{stats.totalReservations}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 p-6 rounded-xl border border-green-600/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-gray-400 text-sm">การจองที่ยังใช้ได้</p>
              <p className="text-2xl font-bold">{stats.activeReservations}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 p-6 rounded-xl border border-blue-600/30">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-gray-400 text-sm">จำนวนคนที่รอ</p>
              <p className="text-2xl font-bold">{stats.totalPeopleWaiting}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Reservation Form */}
      <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-xl font-bold mb-4">➕ เพิ่มการจองใหม่</h2>
        <form onSubmit={handleAddReservation} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">ชื่อลูกค้า *</label>
            <input
              type="text"
              value={newReservation.customerName}
              onChange={(e) => setNewReservation({ ...newReservation, customerName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="เช่น คุณสมชาย"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">จำนวนคน *</label>
            <input
              type="number"
              value={newReservation.partySize}
              onChange={(e) => setNewReservation({ ...newReservation, partySize: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              min="1"
              max="10"
              placeholder="เช่น 4"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">เบอร์โทร</label>
            <input
              type="tel"
              value={newReservation.customerPhone}
              onChange={(e) => setNewReservation({ ...newReservation, customerPhone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="เบอร์โทรศัพท์"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              เพิ่มการจอง
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 p-4 rounded-lg mb-6 text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Reservations List */}
      <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-bold mb-4">📝 รายการการจอง</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">ไม่มีการจองในขณะนี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-300">ลำดับ</th>
                  <th className="text-left px-4 py-3 text-gray-300">ชื่อลูกค้า</th>
                  <th className="text-left px-4 py-3 text-gray-300">จำนวนคน</th>
                  <th className="text-left px-4 py-3 text-gray-300">เบอร์โทร</th>
                  <th className="text-left px-4 py-3 text-gray-300">เวลาที่เหลือ</th>
                  <th className="text-right px-4 py-3 text-gray-300">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reservations.map((res, idx) => (
                  <tr key={res._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{res.customerName}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {res.partySize} คน
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {res.customerPhone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" /> {res.customerPhone}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-mono">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {getTimeRemaining(res.expiresAt)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {showConvertForm === res._id ? (
                        <div className="bg-gray-900 p-3 rounded border border-gray-600 space-y-2 w-64">
                          <input
                            type="number"
                            placeholder="จำนวนลูกค้า"
                            value={convertData.customerCount}
                            onChange={(e) =>
                              setConvertData({ ...convertData, customerCount: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            min="1"
                          />
                          <select
                            value={convertData.buffetTier}
                            onChange={(e) =>
                              setConvertData({ ...convertData, buffetTier: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          >
                            <option value="Starter">Starter Buffet</option>
                            <option value="Premium">Premium Buffet</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConvertReservation(res._id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-medium"
                            >
                              ยืนยัน
                            </button>
                            <button
                              onClick={() => setShowConvertForm(null)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs font-medium"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowConvertForm(res._id)}
                            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" /> เปิดโต๊ะ
                          </button>
                          <button
                            onClick={() => handleCancelReservation(res._id)}
                            className="inline-flex items-center gap-1 bg-red-600/70 hover:bg-red-600 px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> ยกเลิก
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitlistManagement;

