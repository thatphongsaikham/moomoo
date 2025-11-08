import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function TableList() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Mock table data - in real app, this should come from your backend
  const tables = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    status: "available", // available, occupied, reserved
  }));

  const handleTableSelect = (tableId) => {
    setSelectedTable(tableId);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock validation - using "1234" as password for all tables
    if (password === "1234") {
      navigate(`/${selectedTable}`);
    } else {
      setError("รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสในใบเสร็จ");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">เลือกโต๊ะของคุณ</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleTableSelect(table.id)}
            className={`
              p-4 rounded-lg text-center transition-all duration-200
              ${selectedTable === table.id 
                ? 'bg-red-600 text-white' 
                : 'bg-white hover:bg-red-50 border-2 border-red-100'}
            `}
          >
            <div className="text-xl font-bold">โต๊ะที่ {table.id}</div>
            <div className="text-sm">
              {table.status === 'available' ? 'ว่าง' : 'ไม่ว่าง'}
            </div>
          </button>
        ))}
      </div>

      {selectedTable && (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              กรุณาใส่รหัสผ่านสำหรับโต๊ะที่ {selectedTable}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="ใส่รหัสผ่านจากใบเสร็จ"
            />
            {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      )}
    </div>
  );
}

export default TableList;
