import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Plus, X, Check, AlertCircle, Flame, Calendar, Timer } from 'lucide-react';

function TableManagement() {
  const BUFFET_PRICES = {
    normal: 259,
    premium: 299
  };

  const VAT_RATE = 0.07;

  const calculateVAT = (subtotal) => {
    return Math.round(subtotal * VAT_RATE);
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [tables, setTables] = useState([]);

  const [newTable, setNewTable] = useState({
    tableNumber: '',
    people: '',
    buffetType: 'normal',
    showForm: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRequestBill = (tableId) => {
    setTables(tables.map(table =>
      table.id === tableId
        ? { ...table, status: 'requesting_bill' }
        : table
    ));
  };

  const handleRemoveTable = (tableId) => {
    setTables(tables.filter(table => table.id !== tableId));
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (newTable.tableNumber && newTable.people) {
      const tableId = parseInt(newTable.tableNumber);
      if (tables.some(t => t.id === tableId)) {
        alert('หมายเลขโต๊ะนี้ถูกใช้งานแล้ว');
        return;
      }

      const buffetPrice = BUFFET_PRICES[newTable.buffetType];
      const people = parseInt(newTable.people);

      setTables([...tables, {
        id: tableId,
        timeLeft: '02:00:00',
        status: 'active',
        people: people,
        buffetType: newTable.buffetType,
        buffetTotal: buffetPrice * people,
        specialOrderTotal: 0,
        orders: {
          special: [],
          buffet: []
        }
      }]);
      setNewTable({ tableNumber: '', people: '', buffetType: 'normal', showForm: false });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requesting_bill':
        return {
          bg: 'bg-yellow-600/20',
          border: 'border-yellow-600/40',
          text: 'text-yellow-400',
          icon: AlertCircle
        };
      case 'active':
        return {
          bg: 'bg-green-600/20',
          border: 'border-green-600/40',
          text: 'text-green-400',
          icon: Check
        };
      default:
        return {
          bg: 'bg-gray-600/20',
          border: 'border-gray-600/40',
          text: 'text-gray-400',
          icon: Clock
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'requesting_bill':
        return { thai: 'รอเช็คบิล', en: 'Requesting Bill' };
      case 'active':
        return { thai: 'กำลังใช้งาน', en: 'Active' };
      default:
        return { thai: status, en: status };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const getTotalRevenue = () => {
    return tables.reduce((total, table) => {
      const subtotal = table.buffetTotal + table.specialOrderTotal;
      return total + subtotal + calculateVAT(subtotal);
    }, 0);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-red-600 p-3 rounded-full mr-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              จัดการโต๊ะ
            </h1>
            <p className="text-red-400 text-lg mt-2">Table Management</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 backdrop-blur-sm border border-red-600/20 rounded-xl p-4">
            <div className="flex items-center justify-center">
              <Users className="w-6 h-6 text-red-500 mr-2" />
              <span className="text-white font-semibold">โต๊ะทั้งหมด: {tables.length}</span>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-red-600/20 rounded-xl p-4">
            <div className="flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500 mr-2" />
              <span className="text-white font-semibold">ลูกค้าทั้งหมด: {tables.reduce((sum, t) => sum + t.people, 0)} คน</span>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-red-600/20 rounded-xl p-4">
            <div className="flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-white font-semibold">รายได้ทั้งหมด: {formatPrice(getTotalRevenue())}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-mono">
            {currentTime.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })}
          </span>
        </div>
      </div>

      {/* Add Table Button */}
      <div className="flex justify-end mb-6">
        {!newTable.showForm && (
          <button
            onClick={() => setNewTable({...newTable, showForm: true})}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-600/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มโต๊ะใหม่
          </button>
        )}
      </div>

      {/* Add Table Form */}
      {newTable.showForm && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-600/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-serif font-bold text-white flex items-center">
              <Plus className="w-6 h-6 text-red-500 mr-3" />
              เพิ่มโต๊ะใหม่
            </h3>
            <button
              onClick={() => setNewTable({tableNumber: '', people: '', buffetType: 'normal', showForm: false})}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleAddTable} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  หมายเลขโต๊ะ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
                  min="1"
                  required
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                  placeholder="กรอกหมายเลขโต๊ะ"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  จำนวนลูกค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newTable.people}
                  onChange={(e) => setNewTable({...newTable, people: e.target.value})}
                  min="1"
                  required
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                  placeholder="กรอกจำนวนลูกค้า"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  ประเภทบุฟเฟ่ต์
                </label>
                <select
                  value={newTable.buffetType}
                  onChange={(e) => setNewTable({...newTable, buffetType: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white focus:border-red-600 focus:outline-none"
                >
                  <option value="normal">ธรรมดา ({formatPrice(BUFFET_PRICES.normal)})</option>
                  <option value="premium">พรีเมียม ({formatPrice(BUFFET_PRICES.premium)})</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setNewTable({tableNumber: '', people: '', buffetType: 'normal', showForm: false})}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                ยืนยันเพิ่มโต๊ะ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => {
          const statusBadge = getStatusBadge(table.status);
          const statusText = getStatusText(table.status);
          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={table.id}
              className="bg-gray-900/50 backdrop-blur-sm border border-red-600/20 rounded-2xl p-6 hover:border-red-600/40 transition-all duration-300 group"
            >
              {/* Table Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-1">
                    โต๊ะที่ {table.id}
                  </h3>
                  <p className="text-gray-400 text-sm">Table {table.id}</p>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-lg border ${statusBadge.border} ${statusBadge.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${statusBadge.text} mr-1`} />
                  <span className={`text-sm font-medium ${statusBadge.text}`}>
                    {statusText.thai}
                  </span>
                </div>
              </div>

              {/* Table Info */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    ลูกค้า
                  </span>
                  <span className="text-white font-semibold">{table.people} คน</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Flame className="w-4 h-4 mr-2" />
                    บุฟเฟ่ต์
                  </span>
                  <span className={`font-semibold ${table.buffetType === 'premium' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {table.buffetType === 'premium' ? 'พรีเมียม' : 'ธรรมดา'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Timer className="w-4 h-4 mr-2" />
                    เวลาที่เหลือ
                  </span>
                  <span className="text-xl font-mono text-red-500">{table.timeLeft}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-700 pt-4 mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">สรุปค่าใช้จ่าย</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">บุฟเฟ่ต์ ({formatPrice(BUFFET_PRICES[table.buffetType])} × {table.people})</span>
                    <span className="text-white">{formatPrice(table.buffetTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">เมนูพิเศษ</span>
                    <span className="text-white">{formatPrice(table.specialOrderTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
                    <span>ราคาก่อน VAT</span>
                    <span>{formatPrice(table.buffetTotal + table.specialOrderTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>VAT 7%</span>
                    <span>{formatPrice(calculateVAT(table.buffetTotal + table.specialOrderTotal))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
                    <span className="text-white">รวมทั้งหมด</span>
                    <span className="text-red-500">
                      {formatPrice(table.buffetTotal + table.specialOrderTotal + calculateVAT(table.buffetTotal + table.specialOrderTotal))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-black/50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-white mb-2">รายการสั่งอาหาร</h4>
                {table.orders.buffet.length > 0 || table.orders.special.length > 0 ? (
                  <ul className="space-y-1">
                    {table.orders.buffet.map((order, index) => (
                      <li key={`b-${index}`} className="text-xs text-gray-400 flex items-center">
                        <span className="text-green-500 mr-2">•</span>
                        {order.split('(')[0].trim()}
                        <span className="text-green-500 ml-1">(ฟรี)</span>
                      </li>
                    ))}
                    {table.orders.special.map((order, index) => (
                      <li key={`s-${index}`} className="text-xs text-gray-300 flex items-center">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-red-400">{order}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">ยังไม่มีรายการอาหาร</p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {table.status === 'active' && (
                  <button
                    onClick={() => handleRequestBill(table.id)}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    เรียกเช็คบิล
                  </button>
                )}
                {table.status === 'requesting_bill' && (
                  <button
                    onClick={() => handleRemoveTable(table.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    ปิดโต๊ะ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TableManagement;