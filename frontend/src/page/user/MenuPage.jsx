// frontend/src/page/user/MenuPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import orderService from "../../services/orderService";
import menuService from "../../services/menuService";
import { decryptTableId } from "../../utils/encryption";

const MenuPage = () => {
  const { encryptedId } = useParams();
  // ถอดรหัส encryptedId เป็น tableNumber
  const tableNumber = decryptTableId(encryptedId);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงเมนูจาก backend
  useEffect(() => {
    setLoading(true);
    menuService.getAllMenuItems().then((res) => {
      console.log('response จาก backend:', res.data);
      // ถ้า res.data.data ไม่มีข้อมูล ให้ fallback เป็น res.data
      setMenuItems(res.data.data || res.data);
      console.log('เมนูที่ได้รับจาก backend:', res.data.data || res.data);
    }).finally(() => setLoading(false));
  }, []);

  // เพิ่มเมนูเข้าตะกร้า
  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((i) => i._id === item._id);
      if (found) {
        return prev.map((i) => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      }
      // ถ้าไม่มี price ให้ default เป็น 0
      return [...prev, { ...item, qty: 1, price: item.price ?? 0 }];
    });
  };
  // ลดจำนวนเมนูในตะกร้า
  const removeFromCart = (_id) => {
    setCart((prev) => prev.reduce((acc, i) => {
      if (i._id === _id) {
        if (i.qty > 1) acc.push({ ...i, qty: i.qty - 1 });
        return acc;
      }
      acc.push(i);
      return acc;
    }, []));
  };

  const total = cart.reduce((sum, i) => sum + (i.price > 0 ? i.price * i.qty : 0), 0);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  // ส่งออเดอร์ไป backend แบบสมบูรณ์
  const submitOrder = async () => {
    alert('submitOrder called!');
    console.log('submitOrder called!', { cart, tableNumber });
    if (cart.length === 0 || !tableNumber) {
      alert('กรุณาเลือกเมนูและระบุหมายเลขโต๊ะ');
      return;
    }
    setSending(true);
    try {
      const items = cart.map((it) => ({
        menuItem: it._id,
        quantity: it.qty || 1,
      }));
      const response = await orderService.placeOrder(tableNumber, items, "");
      console.log('ผลลัพธ์จาก backend เมื่อสั่งอาหาร:', response);
      alert('สั่งอาหารสำเร็จ!');
      setSuccess(true);
      setCart([]);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งออเดอร์");
      console.error('error submitOrder:', err);
    } finally {
      setSending(false);
    }
  };

  // ...existing code...
  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>กำลังโหลดเมนู...</div>;
  }

  // ป้องกัน crash ถ้า menuItems ยัง undefined/null
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const buffetMenu = safeMenuItems.filter((item) => item.category !== "Special Menu");
  const starterMenu = safeMenuItems.filter((item) => item.category === "Starter Buffet");
  const premiumMenu = safeMenuItems.filter((item) => item.category === "Premium Buffet");
  const specialMenu = safeMenuItems.filter((item) => item.category === "Special Menu");

  return (
    <div style={{ padding: "20px", background: "#18181b", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: 16, color: '#dc2626', textShadow: '0 2px 8px #0008' }}>เมนูอาหาร</h1>

      {/* เมนูบุฟเฟ่ต์ (ฟรี) */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: 12, color: '#fff', textShadow: '0 2px 8px #0008' }}>เมนูบุฟเฟ่ต์ (ฟรีในแพ็กเกจ)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {buffetMenu.map((item) => (
            <div key={item._id} style={{ background: "#232323", borderRadius: 16, boxShadow: "0 2px 8px #0008", padding: 20, textAlign: "center", color: '#fff' }}>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: '#fff' }}>{item.nameThai} <span style={{ color: '#bbb' }}>({item.nameEnglish})</span></div>
              <div style={{ color: "#16a34a", fontWeight: "bold", margin: "8px 0" }}>ฟรี</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                <button onClick={() => removeFromCart(item._id)} style={{ padding: "4px 12px", background: "#444", color: '#fff', borderRadius: 8, fontSize: 18 }}>-</button>
                <button onClick={() => addToCart(item)} style={{ padding: "4px 12px", background: "#dc2626", color: "#fff", borderRadius: 8, fontSize: 18 }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* เมนูพิเศษ (คิดเงินเพิ่ม) */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: 12, color: '#fff', textShadow: '0 2px 8px #0008' }}>Special Menu (คิดเงินเพิ่ม)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {specialMenu.map((item) => (
            <div key={item._id} style={{ background: "#232323", borderRadius: 16, boxShadow: "0 2px 8px #0008", padding: 20, textAlign: "center", color: '#fff' }}>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: '#fff' }}>{item.nameThai} <span style={{ color: '#bbb' }}>({item.nameEnglish})</span></div>
              <div style={{ color: "#dc2626", fontWeight: "bold", margin: "8px 0" }}>฿{item.price}</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                <button onClick={() => removeFromCart(item._id)} style={{ padding: "4px 12px", background: "#444", color: '#fff', borderRadius: 8, fontSize: 18 }}>-</button>
                <span style={{ fontWeight: "bold", fontSize: 18 }}>{cart.find(i => i._id === item._id)?.qty || 0}</span>
                <button onClick={() => addToCart(item)} style={{ padding: "4px 12px", background: "#dc2626", color: "#fff", borderRadius: 8, fontSize: 18 }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ตะกร้าสั่งอาหาร */}
      <section style={{ marginTop: 40, background: "#232323", borderRadius: 16, boxShadow: "0 2px 8px #0008", padding: 24, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: 12, color: '#dc2626' }}>ตะกร้าสั่งอาหาร</h2>
        {cart.length === 0 ? (
          <div style={{ color: "#888" }}>ยังไม่มีรายการอาหาร</div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {cart.map((it) => (
              <div key={it._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f3f4f6", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{it.nameThai} <span style={{ color: '#888' }}>({it.nameEnglish})</span></div>
                  <div style={{ fontSize: 14, color: '#555' }}>{it.qty} × {it.price > 0 ? `฿${it.price}` : 'ฟรี'}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => removeFromCart(it._id)} style={{ padding: "2px 8px", background: "#eee", borderRadius: 8 }}>-</button>
                  <button onClick={() => addToCart(it)} style={{ padding: "2px 8px", background: "#eee", borderRadius: 8 }}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12, color: '#fff' }}>รวมทั้งหมด: <span style={{ color: '#dc2626' }}>฿{total}</span></div>
        <button
          disabled={cart.length === 0 || sending}
          onClick={submitOrder}
          style={{ width: "100%", padding: "12px 0", background: cart.length === 0 ? '#444' : '#dc2626', color: cart.length === 0 ? '#888' : '#fff', borderRadius: 8, fontWeight: "bold", fontSize: 18, cursor: cart.length === 0 ? 'not-allowed' : 'pointer', boxShadow: cart.length === 0 ? '' : '0 2px 8px #dc262688' }}
        >
          {sending ? "กำลังส่ง..." : "สั่งอาหาร"}
        </button>
        {success && (
          <div style={{ marginTop: 16, color: '#16a34a', fontWeight: 'bold', textAlign: 'center' }}>ส่งคำสั่งเรียบร้อย!</div>
        )}
      </section>
    </div>
  );
};

export default MenuPage;

