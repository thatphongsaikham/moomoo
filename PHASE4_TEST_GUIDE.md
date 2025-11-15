# Phase 4 Testing Guide - Admin Table & Billing Management

## ✅ Servers Running
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5174
- **TimerService**: Active (30s cron job running)

---

## 🧪 Test Scenarios

### **Test 1: Admin Login**
1. Navigate to http://localhost:5174
2. Click **Admin Login** or go to `/admin`
3. Use admin credentials from seed data:
   - **Username**: admin
   - **Password**: admin123
4. ✅ **Expected**: Redirect to admin dashboard

---

### **Test 2: View All Tables (Table Management)**
1. Go to **Table Management** page (`/admin/table`)
2. ✅ **Expected**: 
   - See 10 tables (all should be "Available" initially)
   - Green badges for Available status
   - Statistics showing: 10 total, 10 available, 0 open
   - Real-time polling (updates every 2 seconds)

---

### **Test 3: Open a Table**
1. On Table Management page, click **"Open Table"** on any available table (e.g., Table 1)
2. Fill in the dialog:
   - **Customer Count**: 3
   - **Buffet Tier**: Premium (299฿)
3. Click **"Open"**
4. ✅ **Expected**:
   - Alert: "Table 1 opened successfully!"
   - Table status changes to **"Open"** (blue badge)
   - Timer starts counting down from 90:00:00 (90 minutes)
   - Bill is automatically created in background
   - Statistics update: Available -1, Open +1

---

### **Test 4: Monitor Timer (90-min Dining Timer)**
1. Watch the open table - timer should update every second
2. ✅ **Expected**:
   - Format: `HH:MM:SS` (e.g., `01:29:45`)
   - **Green text** when > 10 min remaining
   - **Yellow text** when ≤ 10 min remaining (warning)
   - **Red text** when expired (overtime)
   - Backend logs warnings at 10min, 5min, and 0min (check terminal)

---

### **Test 5: Reserve a Table**
1. Click **"Reserve"** on an available table (e.g., Table 2)
2. Optional: Add notes (e.g., "Party of 4")
3. Click **"Reserve"**
4. ✅ **Expected**:
   - Alert: "Table 2 reserved for 15 minutes!"
   - Status changes to **"Reserved"** (yellow badge)
   - Timer shows 15:00 countdown
   - Statistics update: Available -1, Reserved +1

---

### **Test 6: Auto-Release Expired Reservation**
1. Wait for reservation timer to expire (15 minutes, or modify code for faster testing)
2. ✅ **Expected**:
   - Backend TimerService detects expiry (check terminal logs)
   - Table automatically reverts to **"Available"**
   - Frontend updates via polling (within 2 seconds)

---

### **Test 7: Cancel Reservation Manually**
1. Click **"Cancel Reservation"** on a reserved table
2. Confirm the action
3. ✅ **Expected**:
   - Alert: "Reservation cancelled"
   - Status immediately changes to **"Available"**

---

### **Test 8: View Bill for Open Table**
1. On Table Management, click **"View Bill"** on an open table
2. ✅ **Expected**:
   - Redirects to Billing Management page
   - OR (if we implement modal): Shows bill dialog with:
     - Buffet charges (e.g., Premium × 3 = 897฿)
     - Special items (if any orders completed)
     - VAT breakdown (7%)
     - Total amount

---

### **Test 9: Billing Management - View Active Bills**
1. Go to **Billing Management** page (`/admin/billing`)
2. ✅ **Expected**:
   - Shows all open tables with bills
   - Statistics: Number of open tables, active bills
   - Each table card shows:
     - Table number
     - Customer count
     - Buffet tier
     - Opened time
     - **"View Bill"** button

---

### **Test 10: View Bill Details**
1. Click **"View Bill"** on any open table
2. ✅ **Expected**:
   - Modal/dialog opens showing **BillSummary**:
     - Table number & created time
     - Customer count & buffet tier
     - **Buffet Charges**: `Starter × 2 @ 259฿ = 518฿`
     - **Special Items**: (if any, shows list with quantities)
     - **Subtotal (before VAT)**: Calculated amount
     - **VAT 7%**: VAT amount
     - **Total**: Final amount
     - Payment status: "Unpaid"
   - Action buttons: Close, Print Bill, Close Bill

---

### **Test 11: Print Bill**
1. In bill dialog, click **"Print Bill"**
2. ✅ **Expected**:
   - **BillPrint** component loads with thermal receipt format:
     - Restaurant header (MOOMOO, address, tax ID)
     - Table number & date
     - Item breakdown
     - VAT calculation
     - Total amount
   - Browser print dialog opens automatically
   - Receipt is 80mm print-ready format

---

### **Test 12: Close Table with Payment**
1. In bill dialog, click **"Close Bill"** (or on Table Management, click **"Close Table"**)
2. Select payment method:
   - Cash
   - Credit Card
   - Debit Card
   - Mobile Payment
3. Confirm closure
4. ✅ **Expected**:
   - Alert: "Table X closed successfully!"
   - Bill status changes to **"Archived"**
   - Payment method recorded
   - `archivedAt` timestamp saved
   - Table status changes to **"Closed"**
   - Statistics update: Open -1

---

### **Test 13: Customer Order Flow → Bill Integration**
**This tests the integration between Phase 3 (ordering) and Phase 4 (billing)**

1. **Open Table 3** (admin panel):
   - Customer Count: 2
   - Buffet Tier: Starter (259฿)

2. **Customer orders from Table 3** (user side):
   - Go to customer home: http://localhost:5174
   - Enter table number: **3**
   - Browse menu → Add Special Menu items (e.g., Salmon Sushi 180฿ × 2)
   - Submit order

3. **Check Order Queue** (admin):
   - Go to Order Queue page (`/admin/orders`)
   - Order appears in **Special Queue** (because it has Special Menu items)
   - Mark order as **Complete**

4. **View Updated Bill** (admin):
   - Go to Billing Management
   - View bill for Table 3
   - ✅ **Expected**:
     - Buffet Charges: 518฿ (259 × 2)
     - Special Items: Salmon Sushi × 2 = 360฿
     - **Special Items Total**: 360฿
     - **Pre-VAT Subtotal**: 820.56฿
     - **VAT 7%**: 57.44฿
     - **Total**: 878฿

---

## 🔍 Backend API Testing

### Test API Endpoints Directly

**Get All Tables:**
```bash
curl http://localhost:5000/api/tables
```

**Get Specific Table:**
```bash
curl http://localhost:5000/api/tables/1
```

**Open Table (requires admin auth):**
```bash
curl -X POST http://localhost:5000/api/tables/1/open \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"customerCount": 3, "buffetTier": "Premium"}'
```

**Get Active Bill for Table:**
```bash
curl http://localhost:5000/api/bills/table/1
```

**Get Printable Bill:**
```bash
curl http://localhost:5000/api/bills/table/1/print
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Tables not loading
- **Check**: Backend terminal - MongoDB connected?
- **Fix**: Restart backend, verify MongoDB running

### Issue 2: Timer not updating
- **Check**: Browser console for errors
- **Fix**: Verify `useTableTimer` hook is working, check component re-renders

### Issue 3: Bill not found
- **Cause**: Table opened before bill creation integration
- **Fix**: Close table, reopen to trigger bill creation

### Issue 4: CORS errors
- **Check**: Backend CORS config in `server.js`
- **Fix**: Verify `FRONTEND_URL=http://localhost:5174` in `.env`

### Issue 5: "Cannot read property '_id' of undefined"
- **Cause**: Bill not created when table opened
- **Fix**: Check `TableService.openTable()` calls `BillingService.createBillForTable()`

---

## ✅ Expected Backend Logs

When running tests, you should see these logs in backend terminal:

```
✅ MongoDB Connected
✅ Timer service initialized (checking every 30 seconds)
🚀 Server running on port 5000

# When table opened:
POST /api/tables/1/open 200 - 45ms

# Timer warnings (every 30s check):
⚠️  Table 1: 10 minutes remaining (9 min)
⚠️  Table 1: 5 minutes remaining (4 min)
❌ Table 1: Dining time expired (2 min overtime)

# Reservation auto-release:
⏰ Auto-releasing expired reservation for table 2
✅ Table 2 released (reservation expired)
```

---

## 📊 Success Criteria

**Phase 4 is working correctly if:**

✅ Admin can open tables with customer count & buffet tier  
✅ 90-minute dining timer displays and counts down in real-time  
✅ Timer shows yellow warning at 10min, red at overtime  
✅ Tables can be reserved for 15 minutes  
✅ Expired reservations auto-release (visible in logs)  
✅ Bills auto-create when tables open  
✅ Bill shows buffet charges with VAT breakdown  
✅ Special menu items add to bill when orders complete  
✅ VAT calculation is accurate (7% included in prices)  
✅ Bills can be printed in thermal receipt format  
✅ Tables close with payment method recording  
✅ Real-time polling updates UI every 2-3 seconds  
✅ TimerService logs warnings and auto-releases in backend  

---

## 🎯 Next Steps

After verifying Phase 4 works:
1. **Phase 5**: Implement Order Queue Management (Kitchen staff view)
2. **Integration Testing**: Full customer → admin workflow
3. **Performance**: Optimize polling intervals if needed
4. **UI Polish**: Add loading states, better error handling

---

**Created**: 2025-11-16  
**Phase**: 4 - Admin Table & Billing Management  
**Status**: Ready for Testing ✅
