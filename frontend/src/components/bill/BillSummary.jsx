import React from 'react';
import { useBilingual } from '../../hook/useBilingual';

/**
 * BillSummary Component - Display bill breakdown with VAT
 * @param {Object} props
 * @param {Object} props.bill - Bill data
 * @param {Function} props.onClose - Handler for closing bill view
 * @param {Function} props.onPrint - Handler for printing bill
 */
export const BillSummary = ({ bill, onClose, onPrint }) => {
  const { isThai } = useBilingual();

  if (!bill) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {isThai ? 'ไม่พบข้อมูลบิล' : 'No bill data'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isThai ? 'บิลโต๊ะที่' : 'Bill for Table'} {bill.tableNumber}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isThai ? 'สร้างเมื่อ' : 'Created'}: {new Date(bill.createdAt).toLocaleString(isThai ? 'th-TH' : 'en-US')}
        </p>
      </div>

      {/* Customer Info */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">
              {isThai ? 'จำนวนลูกค้า' : 'Customers'}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {bill.customerCount} {isThai ? 'ท่าน' : 'people'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {isThai ? 'ประเภทบุฟเฟ่ต์' : 'Buffet Tier'}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {bill.buffetTier === 'Starter' ? (isThai ? 'ปกติ' : 'Starter') : ''}
              {bill.buffetTier === 'Premium' ? (isThai ? 'พรีเมียม' : 'Premium') : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Buffet Charges */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          {isThai ? 'ค่าบุฟเฟ่ต์' : 'Buffet Charges'}
        </h3>
        <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
          <span className="text-gray-700">
            {bill.buffetTier} × {bill.customerCount} @ {bill.buffetPricePerPerson}฿
          </span>
          <span className="font-semibold text-gray-800">
            {bill.buffetCharges.toFixed(2)}฿
          </span>
        </div>
      </div>

      {/* Special Items */}
      {bill.specialItems && bill.specialItems.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            {isThai ? 'รายการเมนูพิเศษ' : 'Special Menu Items'}
          </h3>
          <div className="space-y-2">
            {bill.specialItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-purple-50 rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {isThai ? item.nameThai : item.nameEnglish}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {item.price}฿
                  </p>
                </div>
                <span className="font-semibold text-gray-800">
                  {item.subtotal.toFixed(2)}฿
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-700 font-medium">
              {isThai ? 'รวมเมนูพิเศษ' : 'Special Items Total'}
            </span>
            <span className="font-semibold text-gray-800">
              {bill.specialItemsTotal.toFixed(2)}฿
            </span>
          </div>
        </div>
      )}

      {/* Total Calculation */}
      <div className="border-t-2 border-gray-300 pt-4 mt-6 space-y-3">
        <div className="flex justify-between items-center text-gray-700">
          <span>{isThai ? 'ยอดรวมก่อน VAT' : 'Subtotal (before VAT)'}</span>
          <span className="font-medium">
            {bill.preVatSubtotal.toFixed(2)}฿
          </span>
        </div>
        
        <div className="flex justify-between items-center text-gray-700">
          <span>VAT 7%</span>
          <span className="font-medium">
            {bill.vatAmount.toFixed(2)}฿
          </span>
        </div>

        <div className="flex justify-between items-center text-xl font-bold text-gray-900 bg-green-50 rounded-lg p-3">
          <span>{isThai ? 'ยอดรวมทั้งสิ้น' : 'Total'}</span>
          <span>
            {bill.total.toFixed(2)}฿
          </span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          {isThai ? 'สถานะการชำระเงิน' : 'Payment Status'}: 
          <span className={`ml-2 font-semibold ${
            bill.status === 'Active' ? 'text-red-600' : 'text-green-600'
          }`}>
            {bill.status === 'Active' 
              ? (isThai ? 'ยังไม่ชำระ' : 'Unpaid')
              : (isThai ? 'ชำระแล้ว' : 'Paid')
            }
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {isThai ? 'ปิด' : 'Close'}
        </button>
        
        <button
          onClick={onPrint}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {isThai ? 'พิมพ์บิล' : 'Print Bill'}
        </button>
      </div>
    </div>
  );
};

export default BillSummary;
