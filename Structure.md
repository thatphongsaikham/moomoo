# MOOMOO Restaurant Management System - Data Structure

## 📋 Overview
ระบบจัดการร้านอาหารบุฟเฟ่ต์ Shabu แบบ All-You-Can-Eat พร้อมระบบคิวอาหาร, การจัดการโต๊ะ, และบิล

---

## 🗄️ Database Models

### 1. **Table Model** (`Table.js`)
จัดการสถานะโต๊ะ 10 โต๊ะในร้าน

```javascript
{
  tableNumber: Number,           // 1-10 (unique, immutable)
  status: String,                // "Available" | "Reserved" | "Open" | "Closed"
  customerCount: Number,         // 0-4 คน
  buffetTier: String,           // "None" | "Starter" | "Premium"
  buffetPrice: Number,          // ราคาบุฟเฟ่ต์ต่อคน (0 ถ้ายังไม่เปิด)
  openedAt: Date,               // เวลาที่เปิดโต๊ะ
  closedAt: Date,               // เวลาที่ปิดโต๊ะ
  diningTimeRemaining: Number,  // เวลาทานเหลือ (milliseconds, default 90 นาที)
  reservedAt: Date,             // เวลาที่จองโต๊ะ
  reservationExpiresAt: Date,   // เวลาหมดอายุการจอง
  currentBill: ObjectId,        // อ้างอิงถึง Bill ที่กำลังใช้งาน
  updatedAt: Date               // เวลาอัพเดตล่าสุด
}
```

**Indexes:**
- `{ status: 1, reservationExpiresAt: 1 }` - สำหรับ cron job ปลดล็อคโต๊ะที่หมดอายุการจอง
- `{ status: 1, openedAt: 1 }` - สำหรับติดตามเวลาทาน

**Status Flow:**
```
Available → Open → Closed → Available
     ↓        ↑
  Reserved  (expired or cancelled)
```

---

### 2. **Bill Model** (`Bill.js`)
จัดการบิลสำหรับแต่ละโต๊ะ

```javascript
{
  tableNumber: Number,           // 1-10 (ref: Table)
  customerCount: Number,         // 1-4 คน
  buffetTier: String,           // "Starter" | "Premium"
  buffetPricePerPerson: Number, // ราคาบุฟเฟ่ต์ต่อคน
  buffetCharges: Number,        // customerCount × buffetPricePerPerson
  
  // Special Items (เมนูพิเศษที่สั่งเพิ่ม)
  specialItems: [
    {
      menuItem: ObjectId,       // ref: MenuItem (ถ้ามี)
      nameThai: String,         // ชื่อเมนูภาษาไทย
      nameEnglish: String,      // ชื่อเมนูภาษาอังกฤษ
      price: Number,            // ราคาต่อชิ้น
      quantity: Number,         // จำนวน
      subtotal: Number          // price × quantity
    }
  ],
  specialItemsTotal: Number,    // รวมราคาเมนูพิเศษ
  
  // Totals
  total: Number,                // buffetCharges + specialItemsTotal
  preVatSubtotal: Number,       // ยอดก่อน VAT (total / 1.07)
  vatAmount: Number,            // VAT 7% (total - preVatSubtotal)
  
  // Status
  status: String,               // "Active" | "Archived"
  
  // Timestamps
  createdAt: Date,              // เวลาสร้างบิล
  archivedAt: Date              // เวลาปิดบิล/ชำระเงิน
}
```

**Indexes:**
- `{ tableNumber: 1, status: 1 }` - หา active bill ของโต๊ะ
- `{ status: 1, archivedAt: -1 }` - ดึงประวัติบิลเรียงตามวันที่ปิด
- `{ createdAt: -1 }` - รายการบิลล่าสุด

**Validations:**
- `buffetCharges` = `customerCount` × `buffetPricePerPerson`
- `subtotal` = `price` × `quantity`
- `total` = `buffetCharges` + `specialItemsTotal`
- `preVatSubtotal` และ `vatAmount` ต้องมีทศนิยมไม่เกิน 2 ตำแหน่ง

---

### 3. **Order Model** (`Order.js`)
จัดการคิวอาหารแบบ FIFO (First In First Out)

```javascript
{
  tableNumber: Number,           // 1-10 (ref: Table)
  queueType: String,            // "Normal" | "Special"
  items: [
    {
      menuItem: ObjectId,       // ref: MenuItem
      nameThai: String,         // Snapshot - เก็บไว้กรณีเมนูถูกลบ
      nameEnglish: String,      // Snapshot - เก็บไว้กรณีเมนูถูกลบ
      price: Number,            // Snapshot - เก็บไว้กรณีราคาเปลี่ยน
      quantity: Number          // จำนวน (default: 1)
    }
  ],
  status: String,               // "Pending" | "Completed"
  createdAt: Date,              // เวลาสร้างออเดอร์
  completedAt: Date,            // เวลาทำเสร็จ
  notes: String                 // หมายเหตุ (max 500 ตัวอักษร)
}
```

**Indexes:**
- `{ queueType: 1, status: 1, createdAt: 1 }` - คิว FIFO หลัก
- `{ tableNumber: 1, status: 1, createdAt: -1 }` - ประวัติออเดอร์ของโต๊ะ

**Queue Types:**
- **Normal**: เมนูธรรมดาในบุฟเฟ่ต์ (ไม่คิดเงินเพิ่ม)
- **Special**: เมนูพิเศษ (คิดเงินเพิ่ม, จะถูกเพิ่มเข้า Bill)

---

### 4. **User Model** (`User.js`)
ข้อมูลผู้ใช้ (ไม่ได้ใช้งานในปัจจุบัน)

```javascript
{
  name: String,                 // ชื่อผู้ใช้
  email: String                 // อีเมล (unique)
}
```

---

## 🔄 API Endpoints

### **Table Routes** (`/api/tables`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | ดึงข้อมูลโต๊ะทั้งหมด (filter by status) | - |
| GET | `/:tableNumber` | ดึงข้อมูลโต๊ะเฉพาะ | - |
| PATCH | `/:tableNumber/open` | เปิดโต๊ะ | - |
| PATCH | `/:tableNumber/close` | ปิดโต๊ะ/ชำระเงิน | - |

### **Bill Routes** (`/api/bills`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/table/:tableNumber` | ดึงบิล active ของโต๊ะ | - |
| GET | `/table/:tableNumber/print` | ดึงบิลในรูปแบบพิมพ์ | - |
| GET | `/history` | ดึงประวัติบิลทั้งหมด | - |
| GET | `/:id` | ดึงข้อมูลบิลเฉพาะ | - |
| POST | `/table/:tableNumber` | สร้างบิลใหม่ (internal) | - |
| PATCH | `/:id/add-item` | เพิ่มเมนูพิเศษเข้าบิล (internal) | - |
| PATCH | `/:id/archive` | ปิดบิล/archive | - |

### **Order Routes** (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/queue/:queueType` | ดึงคิวออเดอร์ตาม type | - |
| GET | `/table/:tableNumber` | ดึงประวัติออเดอร์ของโต๊ะ | - |
| POST | `/` | สร้างออเดอร์ใหม่ | - |
| PATCH | `/:id/complete` | ทำเครื่องหมายออเดอร์เสร็จ | - |

### **Menu Routes** (`/api/menu`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | ดึงเมนูทั้งหมด | - |
| POST | `/` | เพิ่มเมนูใหม่ | - |
| PATCH | `/:id` | แก้ไขเมนู | - |
| DELETE | `/:id` | ลบเมนู | - |

---

## 📊 Business Logic Flow

### 1. **เปิดโต๊ะ (Open Table)**
```
1. ตรวจสอบว่าโต๊ะว่าง (Available/Closed)
2. สร้าง Bill ใหม่สำหรับโต๊ะ
3. อัพเดต Table:
   - status → "Open"
   - customerCount, buffetTier, buffetPrice
   - openedAt → current time
   - currentBill → bill._id
   - diningTimeRemaining → 5400000 (90 minutes)
4. เริ่มนับเวลาทาน
```

### 2. **สั่งอาหาร (Create Order)**
```
1. ตรวจสอบว่าโต๊ะเปิดอยู่
2. สร้าง Order:
   - queueType: "Normal" (ฟรี) หรือ "Special" (คิดเงิน)
   - status: "Pending"
3. ถ้าเป็น Special → เมนูจะถูกเพิ่มเข้าบิลทีหลัง
```

### 3. **ทำอาหารเสร็จ (Complete Order)**
```
1. อัพเดต Order:
   - status → "Completed"
   - completedAt → current time
2. ถ้าเป็น Special Order → เพิ่มเมนูเข้า Bill.specialItems
3. คำนวณยอดใหม่:
   - specialItemsTotal
   - total
   - preVatSubtotal, vatAmount
```

### 4. **ปิดโต๊ะ/ชำระเงิน (Close Table)**
```
1. ตรวจสอบว่าโต๊ะเปิดอยู่
2. Archive Bill:
   - status → "Archived"
   - archivedAt → current time
3. รีเซ็ตโต๊ะ:
   - status → "Available"
   - customerCount → 0
   - buffetTier → "None"
   - buffetPrice → 0
   - currentBill → null
   - ล้างค่า timestamps
4. พร้อมรับลูกค้าคนต่อไป
```

---

## ⏰ Background Services

### **Timer Service** (ทุก 30 วินาที)
```javascript
// ตรวจสอบโต๊ะที่เปิดอยู่และลดเวลาทาน
1. ดึงโต๊ะที่ status = "Open"
2. คำนวณเวลาที่ใช้ไป = now - openedAt
3. อัพเดต diningTimeRemaining = 5400000 - elapsed
4. ถ้าหมดเวลา (≤ 0):
   - แสดงการแจ้งเตือน
   - อาจปิดโต๊ะอัตโนมัติ (optional)
```

---

## 💾 Frontend State Management

### **Page States**
```javascript
// Table Management
- tables: Table[]               // รายการโต๊ะทั้งหมด
- loading: boolean              // สถานะโหลด
- openForm: { customerCount, buffetTier }

// Billing Management  
- activeTab: "active" | "history"
- tables: Table[]               // โต๊ะที่เปิดอยู่
- historicalBills: Bill[]       // ประวัติบิล
- selectedBill: Bill           // บิลที่เลือกดู
- showBillDialog: boolean      // แสดง dialog รายละเอียดบิล
- printData: Object           // ข้อมูลสำหรับพิมพ์

// Order Queue
- normalQueue: Order[]         // คิวเมนูธรรมดา
- specialQueue: Order[]        // คิวเมนูพิเศษ
- loading: boolean
```

---

## 🔒 Validation Rules

### Table
- `tableNumber`: 1-10
- `customerCount`: 1-4 คน
- `buffetTier`: "Starter" | "Premium"
- เปิดได้เฉพาะโต๊ะที่ Available/Closed
- ปิดได้เฉพาะโต๊ะที่ Open

### Bill
- ต้องมี customerCount ≥ 1
- buffetCharges = customerCount × buffetPricePerPerson
- total = buffetCharges + specialItemsTotal
- VAT 7% คำนวณจาก total

### Order
- tableNumber ต้องอยู่ในระบบ (1-10)
- items ต้องมีอย่างน้อย 1 รายการ
- quantity ≥ 1
- notes ไม่เกิน 500 ตัวอักษร

---

## 📈 Performance Optimizations

### Database Indexes
- `Bill`: tableNumber, status, archivedAt, createdAt
- `Order`: queueType, status, tableNumber, createdAt
- `Table`: status, reservationExpiresAt, openedAt

### Polling Intervals
- Open Tables: ทุก 3 วินาที
- Timer Updates: ทุก 30 วินาที
- Order Queue: ทุก 5 วินาที

---

## 🎯 Key Features

1. **Real-time Updates**: Auto-refresh ทุกหน้าด้วย polling
2. **FIFO Queue**: คิวอาหารเข้าก่อนทำก่อน
3. **Automatic Timer**: นับเวลาทานอัตโนมัติ
4. **Simplified Checkout**: ปิดบิลด้วย 1 คลิก (ไม่ต้องเลือกวิธีชำระเงิน)
5. **Historical Bills**: ดูประวัติบิลทั้งหมดโดยไม่ต้องกรอกวันที่
6. **Bilingual**: รองรับไทย/อังกฤษ

---

## 🚀 Technology Stack

- **Backend**: Node.js + Express 5.1
- **Database**: MongoDB 8.2 + Mongoose 8.19
- **Frontend**: React 19.1 + Vite 7.2
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React

---

## 📝 Notes

- **No Authentication**: ระบบไม่มีการ login (เหมาะสำหรับ internal use)
- **No Payment Method**: ระบบไม่ต้องเลือกวิธีชำระเงิน ปิดบิลได้ทันที
- **90-Minute Limit**: เวลาทานมาตรฐาน 90 นาที
- **Max 4 Customers**: รองรับลูกค้าสูงสุด 4 คนต่อโต๊ะ
- **10 Tables**: ร้านมี 10 โต๊ะ (จำนวนคงที่)

---

**Last Updated**: November 16, 2025
**Version**: 1.0.0
