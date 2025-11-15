import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import tableIcon from "@/assets/b.png";

function TableList() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const tables = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    status: (i + 1) % 3 === 0 ? "occupied" : "available",
  }));

  const handleTableSelect = (tableId, status) => {
    if (status === "occupied") {
      setSelectedTable(null);
      setError("");
      return;
    }
    setSelectedTable(tableId);
    setPassword("");
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === "1234") {
      navigate(`/${selectedTable}/order`);
    } else {
      setError("รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสในใบเสร็จ");
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "available":
        return "text-green-600";
      case "occupied":
        return "text-red-800";
      default:
        return "text-slate-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "• ว่าง";
      case "occupied":
        return "• ไม่ว่าง";
      default:
        return "• ตรวจสอบ";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            เลือกโต๊ะของคุณ
          </h1>
          <p className="text-lg text-slate-600">
            กรุณาเลือกโต๊ะที่ต้องการและป้อนรหัสผ่านเพื่อสั่งอาหาร
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableSelect(table.id, table.status)}
              disabled={table.status === "occupied"}
              className={`
                rounded-xl text-center transition-all duration-300 ease-in-out
                flex flex-col items-center
                p-6
                border border-slate-200
                shadow-md
                ${
                  selectedTable === table.id
                    ? "bg-[#990000] text-white shadow-xl transform scale-105"
                    : "bg-black text-slate-900 hover:shadow-xl hover:-translate-y-1"
                }
                disabled:opacity-70
                disabled:shadow-sm
                disabled:cursor-not-allowed
                disabled:hover:shadow-sm
                disabled:hover:-translate-y-0
              `}
            >
              <img
                src={tableIcon}
                alt={`รูปโต๊ะที่ ${table.id}`}
                className="
                  w-32 h-32 md:w-40 md:h-40
                  object-cover
                  rounded-xl
                  mb-6
                  shadow-sm
                "
              />
              <div className="text-2xl font-bold text-white">โต๊ะที่ {table.id}</div>
              <div
                className={`text-base font-medium ${
                  selectedTable === table.id
                    ? "text-white/80"
                    : getStatusClasses(table.status)
                }`}
              >
                {getStatusText(table.status)}
              </div>
            </button>
          ))}
        </div>

        {selectedTable && (
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                ยืนยันการเลือก
              </h2>
              <p className="text-center text-slate-500 mb-6">
                ป้อนรหัสสำหรับ{" "}
                <span className="font-bold text-[#990000]">
                  โต๊ะที่ {selectedTable}
                </span>
              </p>

              <div className="mb-6">
                <label className="block text-slate-700 text-sm font-bold mb-2 sr-only">
                  รหัสผ่านสำหรับโต๊ะที่ {selectedTable}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-inner appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 text-center text-lg tracking-widest leading-tight focus:outline-none focus:ring-2 focus:ring-[#990000] focus:border-transparent"
                  placeholder="****"
                  autoFocus
                />
                {error && (
                  <p className="text-[#990000] text-sm text-center italic mt-3">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#990000] hover:bg-[#800000] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                ยืนยันและสั่งอาหาร
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableList;
