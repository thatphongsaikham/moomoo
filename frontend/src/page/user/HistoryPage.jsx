import React from 'react';
import { useParams } from 'react-router-dom';

function HistoryPage() {
  const { tableId } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ประวัติการสั่งโต๊ะที่ {tableId}</h1>
      <div className="text-gray-600">ยังไม่มีข้อมูลประวัติ (placeholder)</div>
    </div>
  );
}

export default HistoryPage;
