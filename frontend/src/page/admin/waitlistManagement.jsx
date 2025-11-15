import React, { useState } from 'react';

function WaitlistManagement() {
  const [waitlist, setWaitlist] = useState([
    { id: 1, name: 'คุณสมชาย', size: 4, phone: '081-234-5678', timestamp: new Date() },
    { id: 2, name: 'คุณสมหญิง', size: 2, phone: '089-876-5432', timestamp: new Date() }
  ]);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    size: '',
    phone: ''
  });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.size) {
      setWaitlist([
        ...waitlist,
        {
          id: Date.now(),
          ...newCustomer,
          timestamp: new Date()
        }
      ]);
      setNewCustomer({ name: '', size: '', phone: '' });
    }
  };

  const removeFromWaitlist = (id) => {
    setWaitlist(waitlist.filter(customer => customer.id !== id));
  };

  return (
    <div className="container mx-auto p-4 font-sarabun">
      <h1 className="text-2xl font-bold mb-6">จัดการคิวรอ</h1>

      <form onSubmit={handleAddCustomer} className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700">ชื่อลูกค้า</label>
            <input
              type="text"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="mt-1 block w-[300px] h-8 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">จำนวนคน</label>
            <input
              type="number"
              value={newCustomer.size}
              onChange={(e) => setNewCustomer({ ...newCustomer, size: e.target.value })}
              className="mt-1 block w-[300px] h-8 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">เบอร์โทร</label>
            <input
              type="tel"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="mt-1 block w-[300px] h-8 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="Optional"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          เพิ่มคิว
        </button>
      </form>

      {/* ตารางคิวรอ */}
      <div className="bg-white rounded-[16px] shadow-[0_-4px_12px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden">
        <table className="min-w-full border-collapse w-full">
          <thead className="bg-[#990000]">
            <tr>
              <th className="px-6 py-3 text-left text-white text-[20px] tracking-wider text-center">
                ลำดับ
              </th>
              <th className="px-6 py-3 text-left text-white text-[20px] tracking-wider">
                ชื่อ
              </th>
              <th className="px-6 py-3 text-left text-white text-[20px] tracking-wider">
                จำนวนคน
              </th>
              <th className="px-6 py-3 text-left text-white text-[20px] tracking-wider">
                เบอร์โทร
              </th>
              <th className="px-6 py-3 text-left text-white text-[20px] tracking-wider">
                เวลา
              </th>
              <th className="px-6 py-3 text-right text-white text-[20px] tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {waitlist.map((customer, index) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-center">{index + 1}</td>
                <td className="px-6 py-4">{customer.name}</td>
                <td className="px-6 py-4">{customer.size} คน</td>
                <td className="px-6 py-4">{customer.phone || '-'}</td>
                <td className="px-6 py-4">{customer.timestamp.toLocaleTimeString()}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => removeFromWaitlist(customer.id)}
                    className="inline-block border-2 border-[#990000] text-[#990000] bg-white hover:bg-[#990000] hover:text-white transition-all duration-200 rounded-[20px] px-4 py-1 font-semibold"
                  >
                    ลบคิว
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WaitlistManagement;
