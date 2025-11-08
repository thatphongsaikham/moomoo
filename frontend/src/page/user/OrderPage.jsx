import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

function OrderPage() {
  const { tableId } = useParams();
  const [cart, setCart] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  // Mock menu data - replace with backend data later
  const menu = useMemo(() => [
    { id: 1, name: 'ข้าวผัดกะเพรา', price: 80 },
    { id: 2, name: 'ต้มยำกุ้ง', price: 120 },
    { id: 3, name: 'ส้มตำ', price: 70 },
    { id: 4, name: 'ผัดซีอิ๊ว', price: 85 },
    { id: 5, name: 'ไข่ดาว', price: 15 },
  ], []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.reduce((acc, p) => {
      if (p.id === itemId) {
        if (p.qty > 1) acc.push({ ...p, qty: p.qty - 1 });
        return acc;
      }
      acc.push(p);
      return acc;
    }, []));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const submitOrder = () => {
    if (cart.length === 0) return;
    // Dispatch custom event so other parts (or backend integration) can listen
    try {
      window.dispatchEvent(new CustomEvent('moomoo:place-order', { detail: { tableId, items: cart } }));
    } catch (e) {
      // ignore
    }
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
    setCart([]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">โต๊ะที่ {tableId}</h1>
        <div className="text-red-600 font-semibold">เวลาคงเหลือ: 1:59:59</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">รายการอาหารที่สั่ง</h2>
            <div className="space-y-2">
              {cart.length === 0 && <div className="text-gray-600">ยังไม่มีรายการอาหาร</div>}
              {cart.map((it) => (
                <div key={it.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">{it.qty} × ฿{it.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(it.id)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                    <button onClick={() => addToCart(it)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">เมนูอาหาร</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {menu.map((m) => (
                <div key={m.id} className="border rounded p-3 bg-white">
                  <div className="font-semibold mb-1">{m.name}</div>
                  <div className="text-sm text-gray-600 mb-3">฿{m.price}</div>
                  <button onClick={() => addToCart(m)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">เพิ่ม</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">สรุปคำสั่ง</h3>
          <div className="mb-4">
            <div className="text-sm text-gray-600">รายการ: {cart.reduce((s, i) => s + i.qty, 0)}</div>
            <div className="text-lg font-bold">รวม: ฿{total}</div>
          </div>
          <button onClick={submitOrder} disabled={cart.length===0} className={`w-full py-2 rounded ${cart.length===0 ? 'bg-gray-300 text-gray-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
            สั่งอาหาร
          </button>
        </aside>
      </div>

      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 text-sm">
          ส่งคำสั่งเรียบร้อย กรุณารอสักครู่
        </div>
      )}
    </div>
  );
}

export default OrderPage;
