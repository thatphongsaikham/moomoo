import React from 'react';
import { useBilingual } from '../../hook/useBilingual';

/**
 * BillPrint Component - Printable bill format
 * @param {Object} props
 * @param {Object} props.printData - Printable bill data from API
 */
export const BillPrint = ({ printData }) => {
  const { isThai } = useBilingual();

  if (!printData || !printData.bill) {
    return null;
  }

  const { restaurant, bill } = printData;

  return (
    <div className="max-w-md mx-auto bg-white p-8 print:p-4" id="print-area">
      {/* Restaurant Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {restaurant.name}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
        <p className="text-sm text-gray-600">{restaurant.phone}</p>
        <p className="text-xs text-gray-500 mt-1">
          {isThai ? 'เลขประจำตัวผู้เสียภาษี' : 'Tax ID'}: {restaurant.taxId}
        </p>
      </div>

      {/* Bill Info */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">{isThai ? 'โต๊ะ' : 'Table'}:</span>
          <span>{bill.tableNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold">{isThai ? 'วันที่' : 'Date'}:</span>
          <span>{new Date(bill.date).toLocaleString(isThai ? 'th-TH' : 'en-US')}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-gray-300 pt-3 mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left pb-2">{isThai ? 'รายการ' : 'Item'}</th>
              <th className="text-right pb-2">{isThai ? 'จำนวนเงิน' : 'Amount'}</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2">{item.description}</td>
                <td className="text-right py-2">{item.amount.toFixed(2)}฿</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t-2 border-gray-800 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span>{isThai ? 'ยอดก่อน VAT' : 'Subtotal'}:</span>
          <span>{bill.subtotal.toFixed(2)}฿</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>VAT {bill.vat.rate}:</span>
          <span>{bill.vat.amount.toFixed(2)}฿</span>
        </div>

        <div className="flex justify-between text-lg font-bold border-t border-gray-400 pt-2">
          <span>{isThai ? 'รวมทั้งสิ้น' : 'TOTAL'}:</span>
          <span>{bill.total.toFixed(2)}฿</span>
        </div>
      </div>

      {/* Payment Method */}
      {bill.paymentMethod !== 'Unpaid' && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isThai ? 'ชำระด้วย' : 'Paid by'}: <span className="font-semibold">{bill.paymentMethod}</span>
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-gray-300">
        <p className="text-sm text-gray-600">
          {isThai ? 'ขอบคุณที่ใช้บริการ' : 'Thank you for dining with us'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {isThai ? 'โปรดเก็บใบเสร็จไว้เป็นหลักฐาน' : 'Please keep this receipt'}
        </p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0.5cm;
            size: 80mm auto;
          }
        }
      `}</style>
    </div>
  );
};

export default BillPrint;
