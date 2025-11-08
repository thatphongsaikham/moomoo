import React from 'react';
import { useParams } from 'react-router-dom';

function OrderPage() {
  const { tableId } = useParams();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">โต๊ะที่ {tableId}</h1>
        <div className="text-red-600 font-semibold">เวลาคงเหลือ: 1:59:59</div>
      </div>

      <div className="bg-red-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">รายการอาหารที่สั่ง</h2>
        <div className="space-y-2">
          {/* TODO: Implement ordered items list */}
          <div className="text-gray-600">ยังไม่มีรายการอาหาร</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">เมนูอาหาร</h2>
        {/* TODO: Implement menu items grid */}
        <div className="text-gray-600">อยู่ระหว่างการพัฒนา...</div>
      </div>
    </div>
  );
}

export default OrderPage;
