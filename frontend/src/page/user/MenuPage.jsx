// frontend/src/page/user/MenuPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import orderService from "../../services/orderService";
import menuService from "../../services/menuService";
import tableService from "../../services/tableService";
import { decryptTableId } from "../../utils/encryption";

const MenuPage = () => {
  const { encryptedId } = useParams();
  const navigate = useNavigate();
  // ถอดรหัส encryptedId เป็น tableNumber
  const tableNumber = decryptTableId(encryptedId);
  const [menuData, setMenuData] = useState({ starter: [], premium: [], special: [] });
  const [buffetTier, setBuffetTier] = useState(null); // "Starter" หรือ "Premium"
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(null); // เก็บข้อความ error ถ้าเข้าไม่ได้

  // ดึงข้อมูลโต๊ะและเมนูจาก backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setAccessError(null);
      
      try {
        // ตรวจสอบว่า decrypt ได้หรือไม่
        if (!tableNumber) {
          setAccessError("ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว");
          setLoading(false);
          return;
        }

        // ดึงข้อมูลโต๊ะเพื่อตรวจสอบสถานะและ session
        const tableRes = await tableService.getTableByNumber(tableNumber);
        const table = tableRes.data || tableRes;
        console.log('Table info:', table);

        // ตรวจสอบว่าโต๊ะเปิดอยู่หรือไม่
        if (table.status !== "Open") {
          setAccessError("โต๊ะนี้ปิดแล้ว ไม่สามารถสั่งอาหารได้");
          setLoading(false);
          return;
        }

        // ตรวจสอบว่า encryptedId ตรงกับที่เก็บในโต๊ะหรือไม่ (session validation)
        // Decode ทั้งคู่เพื่อเปรียบเทียบ เพราะ URL อาจ encode/decode ต่างกัน
        const urlDecoded = decodeURIComponent(encryptedId);
        const dbDecoded = table.encryptedId ? decodeURIComponent(table.encryptedId) : null;
        
        if (dbDecoded && dbDecoded !== urlDecoded) {
          console.log('Session mismatch:', { urlDecoded, dbDecoded });
          setAccessError("ลิงก์นี้หมดอายุแล้ว กรุณาขอลิงก์ใหม่จากพนักงาน");
          setLoading(false);
          return;
        }

        setBuffetTier(table.buffetTier);

        // ดึงเมนูทั้งหมด
        const menuRes = await menuService.getAllMenuItems();
        const data = menuRes.data || menuRes;
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setMenuData({
            starter: (data.starter || []).map(item => ({
              _id: item.id || item._id,
              nameThai: item.name || item.nameThai,
              nameEnglish: item.name || item.nameEnglish,
              price: 0,
              category: item.category,
              description: item.description,
              foodType: item.foodType,
              imageUrl: item.imageUrl,
              isAvailable: item.isAvailable,
            })),
            premium: (data.premium || []).map(item => ({
              _id: item.id || item._id,
              nameThai: item.name || item.nameThai,
              nameEnglish: item.name || item.nameEnglish,
              price: 0,
              category: item.category,
              description: item.description,
              foodType: item.foodType,
              imageUrl: item.imageUrl,
              isAvailable: item.isAvailable,
            })),
            special: (data.special || []).map(item => ({
              _id: item.id || item._id,
              nameThai: item.name || item.nameThai,
              nameEnglish: item.name || item.nameEnglish,
              price: item.price || 0,
              category: item.category,
              description: item.description,
              foodType: item.foodType,
              imageUrl: item.imageUrl,
              isAvailable: item.isAvailable,
            })),
          });
          console.log('Menu data:', data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setAccessError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableNumber, encryptedId]);

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
  const [orderResult, setOrderResult] = useState(null); // เก็บผลลัพธ์การสั่งอาหาร
  
  // ส่งออเดอร์ไป backend
  const submitOrder = async () => {
    console.log('submitOrder called!', { cart, tableNumber });
    if (cart.length === 0 || !tableNumber) {
      return;
    }
    setSending(true);
    setOrderResult(null);
    
    try {
      const items = cart.map((it) => ({
        menuItem: it._id,
        quantity: it.qty || 1,
      }));
      const response = await orderService.placeOrder(tableNumber, items, "");
      console.log('ผลลัพธ์จาก backend เมื่อสั่งอาหาร:', response);
      
      // นับจำนวนเมนูแต่ละประเภท
      const normalCount = cart.filter(it => it.category !== "Special Menu").reduce((sum, it) => sum + it.qty, 0);
      const specialCount = cart.filter(it => it.category === "Special Menu").reduce((sum, it) => sum + it.qty, 0);
      const specialTotal = cart.filter(it => it.category === "Special Menu").reduce((sum, it) => sum + (it.price * it.qty), 0);
      
      setOrderResult({
        normalCount,
        specialCount,
        specialTotal,
      });
      
      setSuccess(true);
      setCart([]);
      setTimeout(() => {
        setSuccess(false);
        setOrderResult(null);
      }, 5000);
    } catch (err) {
      console.error('error submitOrder:', err);
      setOrderResult({ error: "เกิดข้อผิดพลาดในการส่งออเดอร์" });
    } finally {
      setSending(false);
    }
  };

  // ...existing code...
  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#fff', background: '#18181b', minHeight: '100vh' }}>กำลังโหลดเมนู...</div>;
  }

  // แสดงหน้า error ถ้าเข้าไม่ได้
  if (accessError) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: 'center', 
        background: '#18181b', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🚫</div>
        <h1 style={{ color: '#dc2626', fontSize: '1.5rem', marginBottom: 16 }}>ไม่สามารถเข้าถึงได้</h1>
        <p style={{ color: '#888', marginBottom: 24, maxWidth: 300 }}>{accessError}</p>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            padding: '12px 24px', 
            background: '#dc2626', 
            color: '#fff', 
            borderRadius: 8, 
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  // เมนูบุฟเฟ่ต์ฟรีตาม tier
  // - Starter: แสดงแค่ starter menu
  // - Premium: แสดง starter + premium menu
  const freeBuffetMenu = buffetTier === "Premium" 
    ? [...menuData.starter, ...menuData.premium]
    : menuData.starter;
  
  // Special Menu (คิดเงินเพิ่ม) - แสดงทั้ง 2 tier
  const specialMenu = menuData.special;

  const tierLabel = buffetTier === "Premium" ? "Premium Buffet (299฿)" : "Starter Buffet (259฿)";

  return (
    <div style={{ padding: "20px", background: "#18181b", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: 8, color: '#dc2626', textShadow: '0 2px 8px #0008' }}>เมนูอาหาร</h1>
      <p style={{ color: '#888', marginBottom: 16 }}>โต๊ะ {tableNumber} • {tierLabel}</p>

      {/* เมนูบุฟเฟ่ต์ (ฟรี) */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: 12, color: '#16a34a', textShadow: '0 2px 8px #0008' }}>
          🍖 เมนูบุฟเฟ่ต์ (ฟรีในแพ็กเกจ)
          {buffetTier === "Premium" && <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: 8 }}>รวม Starter + Premium</span>}
        </h2>
        {freeBuffetMenu.length === 0 ? (
          <div style={{ color: '#888', padding: 20 }}>ไม่มีเมนูในหมวดนี้</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {freeBuffetMenu.map((item) => (
              <div key={item._id} style={{ 
                background: "#232323", 
                borderRadius: 16, 
                boxShadow: "0 2px 8px #0008", 
                padding: 20, 
                textAlign: "center", 
                color: '#fff',
                border: item.category === "Premium Buffet" ? "2px solid #eab308" : "1px solid #333"
              }}>
                {item.category === "Premium Buffet" && (
                  <div style={{ color: '#eab308', fontSize: 12, marginBottom: 4 }}>⭐ Premium</div>
                )}
                <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: '#fff' }}>{item.nameThai}</div>
                <div style={{ color: "#16a34a", fontWeight: "bold", margin: "8px 0" }}>ฟรี</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <button onClick={() => removeFromCart(item._id)} style={{ padding: "4px 12px", background: "#444", color: '#fff', borderRadius: 8, fontSize: 18 }}>-</button>
                  <span style={{ fontWeight: "bold", fontSize: 18, minWidth: 24 }}>{cart.find(i => i._id === item._id)?.qty || 0}</span>
                  <button onClick={() => addToCart(item)} style={{ padding: "4px 12px", background: "#16a34a", color: "#fff", borderRadius: 8, fontSize: 18 }}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* เมนูพิเศษ (คิดเงินเพิ่ม) */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: 12, color: '#dc2626', textShadow: '0 2px 8px #0008' }}>
          🍣 Special Menu (คิดเงินเพิ่ม)
        </h2>
        {specialMenu.length === 0 ? (
          <div style={{ color: '#888', padding: 20 }}>ไม่มีเมนูในหมวดนี้</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {specialMenu.map((item) => (
              <div key={item._id} style={{ background: "#232323", borderRadius: 16, boxShadow: "0 2px 8px #0008", padding: 20, textAlign: "center", color: '#fff', border: "1px solid #dc2626" }}>
                <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: '#fff' }}>{item.nameThai}</div>
                <div style={{ color: "#dc2626", fontWeight: "bold", margin: "8px 0", fontSize: "1.2rem" }}>฿{item.price}</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <button onClick={() => removeFromCart(item._id)} style={{ padding: "4px 12px", background: "#444", color: '#fff', borderRadius: 8, fontSize: 18 }}>-</button>
                  <span style={{ fontWeight: "bold", fontSize: 18, minWidth: 24 }}>{cart.find(i => i._id === item._id)?.qty || 0}</span>
                  <button onClick={() => addToCart(item)} style={{ padding: "4px 12px", background: "#dc2626", color: "#fff", borderRadius: 8, fontSize: 18 }}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          {sending ? "กำลังส่ง..." : "🍳 สั่งอาหาร"}
        </button>
        
        {/* แสดงผลลัพธ์การสั่งอาหาร */}
        {success && orderResult && !orderResult.error && (
          <div style={{ marginTop: 16, padding: 16, background: '#16a34a22', borderRadius: 8, border: '1px solid #16a34a' }}>
            <div style={{ color: '#16a34a', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              ✅ สั่งอาหารสำเร็จ!
            </div>
            <div style={{ color: '#fff', fontSize: 14 }}>
              {orderResult.normalCount > 0 && (
                <div>🍖 เมนูบุฟเฟ่ต์ {orderResult.normalCount} รายการ → เข้าคิวปกติ</div>
              )}
              {orderResult.specialCount > 0 && (
                <div>🍣 เมนูพิเศษ {orderResult.specialCount} รายการ → เข้าคิวพิเศษ</div>
              )}
              {orderResult.specialTotal > 0 && (
                <div style={{ marginTop: 8, color: '#dc2626' }}>
                  💰 เพิ่มในบิล: ฿{orderResult.specialTotal}
                </div>
              )}
            </div>
          </div>
        )}
        
        {orderResult?.error && (
          <div style={{ marginTop: 16, color: '#dc2626', fontWeight: 'bold', textAlign: 'center', padding: 12, background: '#dc262622', borderRadius: 8 }}>
            ❌ {orderResult.error}
          </div>
        )}
      </section>
    </div>
  );
};

export default MenuPage;

