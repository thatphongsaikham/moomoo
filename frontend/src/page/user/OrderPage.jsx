import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function OrderPage() {
  const { tableId } = useParams();
  const [cart, setCart] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  // Menu state will be loaded depending on table price tier (259 or 299)
  const [menu, setMenu] = useState({ free: [], special: [] });
  const [tier, setTier] = useState(null); // 259 or 299
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);

  // Mock database functions
  const mockDB = {
    // table info: decide tier based on tableId for mock (odd=259, even=299)
    getTableInfo: async (tableId) => {
      // simulate latency
      await new Promise((r) => setTimeout(r, 200));
      const id = Number(tableId);
      if (Number.isNaN(id)) throw new Error('Invalid table id');
      return { tableId: id, tier: id % 2 === 0 ? 299 : 259 };
    },
    // menu by tier
    getMenuByTier: async (tier) => {
      await new Promise((r) => setTimeout(r, 200));
      // Arrange mock data: start with price 259, then 299, then paid specials
      const price259Included = [
        { id: 201, name: 'หมูสไลซ์', price: 0, category: 'หมู' },
        { id: 202, name: 'สามชั้น', price: 0, category: 'หมู' },
        { id: 203, name: 'หมูหมักพิเศษ', price: 0, category: 'หมู' },
        { id: 204, name: 'ลูกชิ้นรวม', price: 0, category: 'เครื่องเคียง' },
        { id: 205, name: 'ผักสดรวม', price: 0, category: 'ผัก' },
        { id: 206, name: 'ข้าวสวย', price: 0, category: 'พื้นฐาน' },
        { id: 207, name: 'น้ำเปล่า', price: 0, category: 'เครื่องดื่ม' },
        { id: 208, name: 'บะหมี่/เส้น', price: 0, category: 'เส้น' },
        { id: 209, name: 'ไข่ไก่', price: 0, category: 'เครื่องเคียง' },
        { id: 210, name: 'เต้าหู้ทอด', price: 0, category: 'เครื่องเคียง' },
      ];

      // extra premium items included in 299 (6 items)
      const price299Extras = [
        { id: 301, name: 'สันคอออสเตรเลีย', price: 0, category: 'หมู (พรีเมียม)' },
        { id: 302, name: 'สันในวัวนุ่ม', price: 0, category: 'เนื้อ (พรีเมียม)' },
        { id: 303, name: 'กุ้งแม่น้ำ (พรีเมียม)', price: 0, category: 'อาหารทะเล' },
        { id: 304, name: 'หอยเชลล์', price: 0, category: 'อาหารทะเล' },
        { id: 305, name: 'เบคอนรมควัน', price: 0, category: 'หมู (พรีเมียม)' },
        { id: 306, name: 'เนื้อวากิว (พรีเมียม)', price: 0, category: 'เนื้อ (พรีเมียม)' },
      ];

      // paid special menu (can be ordered extra even if not included)
      const paidSpecials = [
        { id: 501, name: 'กุ้งสด (ชิ้น)', price: 80, category: 'อาหารทะเล' },
        { id: 502, name: 'ปลาหมึก (ชิ้น)', price: 70, category: 'อาหารทะเล' },
        { id: 503, name: 'เนื้อสไลซ์', price: 40, category: 'เนื้อ' },
        { id: 504, name: 'บะหมี่พิเศษ', price: 30, category: 'เส้น' },
        { id: 505, name: 'ไส้กรอกพรีเมียม', price: 60, category: 'เครื่องเคียง' },
      ];

      if (tier === 259) {
        return {
          free: price259Included,
          special: paidSpecials,
        };
      }

      if (tier === 299) {
        return {
          free: price259Included.concat(price299Extras), // 10 + 6 = 16 items
          special: paidSpecials,
        };
      }

      throw new Error('Unknown tier');
    },
  };

  useEffect(() => {
    let mounted = true;
    setLoadingMenu(true);
    setMenuError(null);
    (async () => {
      try {
        const info = await mockDB.getTableInfo(tableId);
        if (!mounted) return;
        setTier(info.tier);
        const m = await mockDB.getMenuByTier(info.tier);
        if (!mounted) return;
        setMenu(m);
      } catch (e) {
        if (!mounted) return;
        setMenuError(e.message || 'Failed to load menu');
      } finally {
        if (!mounted) return;
        setLoadingMenu(false);
      }
    })();
    return () => { mounted = false; };
  }, [tableId]);

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

  const submitOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      // Prepare order data
      const orderData = {
        tableId: tableId,
        menuType: cart.some(item => item.price > 0) ? 'special' : 'normal',
        items: cart.map(item => ({
          menuId: String(item.id),
          name: item.name,
          qty: item.qty,
          price: item.price,
          note: ''
        }))
      };

      // Send order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      // Success - show notification and clear cart
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
      setCart([]);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('เกิดข้อผิดพลาดในการส่งออเดอร์ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">โต๊ะที่ {tableId}</h1>
        <div className="text-red-600 font-semibold">เวลาคงเหลือ: 1:59:59</div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">เมนูอาหาร</h2>
          {loadingMenu ? (
            <div className="text-gray-600">กำลังโหลดเมนู...</div>
          ) : menuError ? (
            <div className="text-red-500">เกิดข้อผิดพลาด: {menuError}</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-md font-semibold mb-2">ฟรี (แพ็กเกจ ฿{tier})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {menu.free.map((m) => (
                    <div key={m.id} className="border rounded p-3 bg-white">
                      <div className="font-semibold mb-1">{m.name}</div>
                      <div className="text-sm text-gray-600 mb-3">ฟรี</div>
                      <button onClick={() => addToCart(m)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">เพิ่ม</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-2">เมนูพิเศษ (จ่ายเงิน)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {menu.special.map((m) => (
                    <div key={m.id} className="border rounded p-3 bg-white">
                      <div className="font-semibold mb-1">{m.name}</div>
                      {m.category && <div className="text-xs text-gray-400 mb-1">{m.category}</div>}
                      <div className="text-sm text-gray-600 mb-3">{m.price > 0 ? `฿${m.price}` : 'ฟรี'}</div>
                      <button onClick={() => addToCart(m)} className={`px-3 py-1 rounded text-sm ${m.price>0 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>เพิ่ม</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">ตะกร้า</h2>
          <div className="space-y-2 mb-4">
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

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2">สรุปคำสั่ง</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600">รายการ: {cart.reduce((s, i) => s + i.qty, 0)}</div>
              <div className="text-lg font-bold">รวม: ฿{total}</div>
            </div>
            <button onClick={submitOrder} disabled={cart.length===0} className={`w-full py-2 rounded ${cart.length===0 ? 'bg-gray-300 text-gray-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
              สั่งอาหาร
            </button>
          </div>
        </div>
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
