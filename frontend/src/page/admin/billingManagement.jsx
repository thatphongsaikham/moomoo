import React, { useState } from 'react';

function BillingManagement() {
  const [bills, setBills] = useState([]);

  const completeBill = (billId) => {
    setBills(
      bills.map((bill) =>
        bill.id === billId ? { ...bill, status: 'completed' } : bill
      )
    );
  };

  const calculateItemTotal = (bill) => {
    const summary = { Moo: 0, Prawn: 0, Veggies: 0, Sauce: 0 };
    bill.items.forEach((item) => {
      if (item.name.includes('Moo'))
        summary.Moo += item.quantity * item.price;
      else if (item.name.includes('Prawns'))
        summary.Prawn += item.quantity * item.price;
      else if (item.name.includes('Veggie'))
        summary.Veggies += item.quantity * item.price;
      else if (item.name.includes('Sauce'))
        summary.Sauce += item.quantity * item.price;
    });
    return summary;
  };

  const calculateTotal = (bill) =>
    bill.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">จัดการบิล</h1>
      <div className="space-y-6">
        {bills.map((bill) => {
          const itemTotals = calculateItemTotal(bill);
          const total = calculateTotal(bill);
          return (
            <div
              key={bill.id}
              className={`bg-white rounded-xl shadow-2xl p-6 ${
                bill.status === 'pending' ? 'border-t-8 border-red-600' : ''
              } flex flex-col lg:flex-row gap-6`}
            >
              <div className="lg:w-3/5">
                <h2 className="text-xl font-bold mb-4 text-red-700">
                  รายการสั่งซื้อ โต๊ะที่ {bill.tableId}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {bill.timestamp
                    .toLocaleString('th-TH', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    .replace(',', ' ')}
                </p>
                <div className="space-y-3">
                  {bill.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                          x{item.quantity}
                        </div>
                        <span className="text-gray-900 font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-red-700 font-semibold">
                        {(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-2/5 bg-white text-gray-800 rounded-lg p-6 shadow-inner border border-gray-200">
                <h3 className="text-2xl font-black mb-6 border-b border-red-300 pb-2 text-red-700">
                  Table {bill.tableId}
                </h3>
                <h4 className="text-xl font-semibold mb-4 text-gray-700">
                  สรุปคำสั่งซื้อ
                </h4>
                <div className="space-y-3 text-gray-600">
                  {itemTotals.Moo > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span>Moo</span>
                      <span className="font-medium text-gray-800">
                        {itemTotals.Moo.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {itemTotals.Prawn > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span>Prawn</span>
                      <span className="font-medium text-gray-800">
                        {itemTotals.Prawn.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {itemTotals.Veggies > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span>Veggies</span>
                      <span className="font-medium text-gray-800">
                        {itemTotals.Veggies.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {itemTotals.Sauce > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span>Sauce</span>
                      <span className="font-medium text-gray-800">
                        {itemTotals.Sauce.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-8">
                  <div
                    style={{ backgroundColor: '#990000' }}
                    className="p-3 rounded-md text-center shadow-lg text-white"
                  >
                    <span className="text-sm font-light block">รวมทั้งหมด</span>
                    <span className="text-3xl font-extrabold tracking-wider text-yellow-300">
                      {total.toFixed(2)}
                    </span>
                  </div>
                  {bill.status === 'pending' ? (
                    <button
                      onClick={() => completeBill(bill.id)}
                      style={{ backgroundColor: '#FADA7A' }}
                      className="w-full mt-4 text-red-900 font-bold py-3 rounded-md hover:brightness-110 transition duration-150 shadow-md"
                    >
                      ชำระเงิน
                    </button>
                  ) : (
                    <div className="w-full mt-4 text-center bg-green-500 text-white font-bold py-3 rounded-md shadow-md">
                      ชำระเงินเรียบร้อย
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BillingManagement;
