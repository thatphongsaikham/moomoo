import { useState } from "react";

// โครงสร้างข้อมูล: Array ใช้เก็บเมนูหมูกระทะ
const initialMenus = [
  "ชุดหมูรวม",
  "ชุดไก่หมักงา",
  "ชุดเนื้อโคขุน",
  "เบคอนสไลด์",
  "ผักรวม",
  "เห็ดเข็มทอง",
  "น้ำจิ้มสูตรเผ็ด",
  "น้ำจิ้มสูตรหวาน",
  "น้ำซุปเติม",
  "โค้ก",
  "เก๊กฮวยเย็น",
];

function MenuDSPage() {
  const [menuList, setMenuList] = useState(initialMenus);
  const [keyword, setKeyword] = useState("");
  const [newMenu, setNewMenu] = useState("");

  // ค้นหาแบบ linear search (O(n))
  const filteredMenus = menuList.filter((item) =>
    item.includes(keyword)
  );

  // เพิ่มเมนูด้วย array.push (O(1))
  const handleAddMenu = () => {
    if (newMenu.trim() === "") return;
    setMenuList([...menuList, newMenu.trim()]);
    setNewMenu("");
    alert("เพิ่มเมนูเรียบร้อย");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>หน้าแสดงโครงสร้างข้อมูล (Array + Search)</h1>

      <h2>ค้นหาเมนูหมูกระทะ</h2>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="พิมพ์คำที่ต้องการค้นหา"
        style={{ padding: "8px", width: "280px" }}
      />

      <h3>ผลลัพธ์</h3>
      <ul>
        {filteredMenus.length > 0 ? (
          filteredMenus.map((item, idx) => <li key={idx}>{item}</li>)
        ) : (
          <li>ไม่พบเมนู</li>
        )}
      </ul>

      <hr />

      <h2>เพิ่มเมนูใหม่ (ทดลองใช้ Array.push)</h2>
      <input
        type="text"
        value={newMenu}
        onChange={(e) => setNewMenu(e.target.value)}
        placeholder="เพิ่มเมนูใหม่ เช่น หมูสามชั้น"
        style={{ padding: "8px", width: "280px", marginRight: "10px" }}
      />
      <button onClick={handleAddMenu}>เพิ่มเมนู</button>
    </div>
  );
}

export default MenuDSPage;
