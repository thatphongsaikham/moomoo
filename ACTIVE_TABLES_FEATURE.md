# Active Tables View - Linked List Implementation

## 📋 Overview
หน้าแสดงโต๊ะที่เปิดอยู่ทั้งหมดพร้อมรายการออเดอร์และเวลาที่เหลือ โดยใช้ **Linked List Data Structure** เพื่อจัดการข้อมูลโต๊ะที่เปิดอยู่

## 🎯 Features

### 1. Linked List Structure
- **Node**: แต่ละ node เก็บข้อมูลโต๊ะ (tableNumber, status, customerCount, orders, ฯลฯ)
- **Dynamic Management**: 
  - `append()` - เพิ่มโต๊ะใหม่เข้า list
  - `remove()` - ลบโต๊ะออกเมื่อปิด
  - `update()` - อัพเดทข้อมูลโต๊ะ
  - `toArray()` - แปลง linked list เป็น array สำหรับแสดงผล

### 2. Real-time Updates
- ดึงข้อมูลอัตโนมัติทุก 3 วินาที
- แสดงเวลาที่เหลือแบบ real-time
- อัพเดท order status ทันที

### 3. Visual Indicators
- **Time Color Coding**:
  - 🟢 เขียว: เหลือเวลามากกว่า 15 นาที
  - 🟡 เหลือง: เหลือเวลา 1-15 นาที
  - 🔴 แดง: เกินเวลาแล้ว

- **Status Badges**:
  - 🟡 Pending: รอทำ
  - 🔵 In Progress: กำลังทำ
  - 🟢 Completed: เสร็จแล้ว
  - ⚫ Served: เสิร์ฟแล้ว

### 4. Order Display
- แสดงรายการออเดอร์ทั้งหมดของแต่ละโต๊ะ
- รายละเอียดเมนู (ชื่อ, จำนวน, ราคา)
- หมายเหตุพิเศษ (special notes)
- เวลาที่สั่ง

### 5. Statistics Dashboard
- **โต๊ะที่เปิด**: จำนวนโต๊ะที่เปิดอยู่ทั้งหมด
- **ออเดอร์ทั้งหมด**: รวมออเดอร์จากทุกโต๊ะ
- **ลูกค้าทั้งหมด**: รวมจำนวนลูกค้าทั้งหมด

## 🏗️ Technical Implementation

### Linked List Class Structure

```javascript
class TableNode {
  constructor(tableData) {
    this.data = tableData;  // Table information
    this.next = null;        // Pointer to next node
  }
}

class ActiveTablesLinkedList {
  constructor() {
    this.head = null;  // First node
    this.size = 0;     // Number of nodes
  }

  // Add new table
  append(tableData) { ... }

  // Remove table by tableNumber
  remove(tableNumber) { ... }

  // Update table data
  update(tableNumber, newData) { ... }

  // Convert to array for rendering
  toArray() { ... }

  // Clear all nodes
  clear() { ... }
}
```

### Why Linked List?

**Advantages**:
1. ✅ **Dynamic Size**: ไม่ต้องกำหนดขนาดล่วงหน้า
2. ✅ **Efficient Removal**: ลบโต๊ะออกจาก list ได้รวดเร็วเมื่อปิดโต๊ะ
3. ✅ **Memory Efficient**: จัดสรรหน่วยความจำแบบ dynamic
4. ✅ **Insertion Order**: รักษาลำดับการเปิดโต๊ะ

**Use Cases**:
- ลูกค้าโต๊ะหนึ่งกินเสร็จก่อน → ลบ node ออกจาก list ทันที
- มีโต๊ะใหม่เปิด → append node ใหม่เข้า list
- ไม่ต้องกังวลเรื่อง array reallocation

### Data Flow

```
┌─────────────────────────────────────────────┐
│  1. Fetch Open Tables from Backend         │
│     GET /api/tables?status=Open             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  2. For Each Table: Fetch Orders            │
│     GET /api/orders/table/:tableNumber      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  3. Build Linked List                       │
│     - Clear existing list                   │
│     - Append each table as node             │
│     - Link nodes together                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  4. Convert to Array & Render               │
│     - linkedList.toArray()                  │
│     - Map to React components               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  5. Auto-refresh Every 3 Seconds            │
│     - useEffect with setInterval            │
└─────────────────────────────────────────────┘
```

## 📁 File Structure

```
frontend/src/
├── page/admin/
│   └── activeTablesView.jsx         # Main component
├── services/
│   ├── tableService.js              # Table API calls
│   └── orderService.js              # Order API calls (added getOrdersByTable)
└── components/layout/
    └── AdminLayout.jsx              # Added "โต๊ะที่เปิด" menu item

frontend/src/App.jsx                 # Added /admin/active-tables route
```

## 🔌 API Endpoints Used

### 1. Get Open Tables
```
GET /api/tables?status=Open
Response: { success: true, data: [...tables] }
```

### 2. Get Table Orders
```
GET /api/orders/table/:tableNumber
Response: { success: true, count: 0, data: [...orders] }
```

## 🎨 UI Components

### Table Card
- **Header**: Table number, customer count, buffet tier
- **Time Display**: Countdown timer with color coding
- **Orders Section**: List of all orders with status badges
- **Warnings**: 
  - Yellow alert: 15 minutes remaining
  - Red alert: Overtime

### Statistics Cards
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ โต๊ะที่เปิด  │ │ ออเดอร์ทั้งหมด│ │ ลูกค้าทั้งหมด │
│     10       │ │     24       │ │     35       │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 Usage

### Access the Page
1. Navigate to Admin Panel: `http://localhost:5174/admin`
2. Click **"โต๊ะที่เปิด"** (Active Tables) in menu
3. Or directly: `http://localhost:5174/admin/active-tables`

### What Happens When Table Closes?
1. Staff closes table via Table Management page
2. Backend updates table status to "Closed"
3. Next polling cycle (3 seconds): 
   - `getTables('Open')` returns updated list
   - Linked list is rebuilt without closed table
   - UI updates automatically

## 🔄 Auto-removal Process

```javascript
// 1. Table is open → Shows in list
fetchActiveTables() → linkedList.append(table)

// 2. Staff closes table → Backend updates
POST /api/tables/:tableNumber/close

// 3. Next fetch cycle (3 seconds later)
fetchActiveTables() 
  → linkedList.clear()           // Clear old list
  → getTables('Open')            // Only get open tables
  → linkedList.append(...)       // Rebuild without closed table
  → setTables(linkedList.toArray())  // Update UI
```

## 📊 Performance Considerations

### Polling Interval
- **3 seconds**: Balance between real-time updates and server load
- Configurable: Change `setInterval(fetchActiveTables, 3000)` value

### Optimization Tips
```javascript
// Current: Full rebuild every cycle
linkedList.clear();
linkedList.append(...);

// Future optimization: Differential updates
// - Only update changed tables
// - Remove closed tables selectively
// - Add new tables incrementally
```

## 🌐 Bilingual Support

### Thai (Default)
- โต๊ะที่เปิด
- ออเดอร์ทั้งหมด
- เวลาที่เหลือ
- ใกล้หมดเวลา!

### English
- Active Tables
- Total Orders
- Time Left
- Time running out!

## 🐛 Troubleshooting

### No Tables Displayed
1. ✅ Check backend is running: `npm run dev` in `backend/`
2. ✅ Check MongoDB connection
3. ✅ Verify tables are "Open" status
4. ✅ Check console for API errors

### Orders Not Showing
1. ✅ Verify orders exist for table: `GET /api/orders/table/:tableNumber`
2. ✅ Check order service response structure
3. ✅ Inspect browser console for errors

### Time Not Updating
1. ✅ Check `useEffect` cleanup
2. ✅ Verify `setInterval` is not cleared prematurely
3. ✅ Check `diningTimeRemaining` field in backend response

## 📝 Future Enhancements

1. **Differential Updates**: Only update changed tables instead of full rebuild
2. **WebSocket Support**: Real-time push instead of polling
3. **Sort Options**: Sort by time remaining, table number, or customer count
4. **Filter Options**: Filter by buffet tier or customer count
5. **Export Data**: Export active tables report to PDF/Excel
6. **Notifications**: Alert when table is about to expire
7. **Kitchen Display**: Separate view for kitchen staff

## 🎓 Learning Points

### Data Structures
- Linked List implementation in JavaScript
- When to use Linked List vs Array
- Memory management with dynamic data

### React Patterns
- Custom state management with class instances
- Polling with `useEffect` and `setInterval`
- Cleanup functions to prevent memory leaks

### API Integration
- Multiple API calls in sequence
- Error handling for failed requests
- Data transformation for UI

## ✅ Testing Checklist

- [ ] Open 3-5 tables with different customer counts
- [ ] Place orders on each table
- [ ] Verify all tables appear in Active Tables view
- [ ] Check time countdown updates correctly
- [ ] Close one table → Verify it disappears from view
- [ ] Check statistics update (table count, order count)
- [ ] Test on mobile viewport (responsive design)
- [ ] Test bilingual support (TH/EN)

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify backend logs: `cd backend && npm run dev`
3. Review API responses in Network tab
4. Check MongoDB data with Compass

---

**Created**: 2025-01-16  
**Version**: 1.0.0  
**Author**: MooMoo Development Team  
**License**: MIT
