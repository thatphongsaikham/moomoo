# Table Checkout Process - Updated Behavior

## 📋 Summary of Changes

**Previous Behavior:**
- "ปิดโต๊ะ" (Close Table) → Set status to "Closed"
- Need separate "Reset" action to make table available again
- Two-step process: Close → Reset

**New Behavior:**
- "ชำระเงิน/Checkout" → Archives bill + Resets table to "Available" **immediately**
- One-step process: Customer pays → Table ready for next customer
- Session history automatically saved to database

---

## 🔄 How It Works Now

### Checkout Process Flow

```
┌─────────────────────────────────────────────┐
│  1. Table Status: Open                      │
│     - Customer is dining                    │
│     - Has active bill                       │
│     - Timer counting down                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  2. Staff Clicks "ชำระเงิน" (Checkout)      │
│     - Modal opens                           │
│     - Select payment method required        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  3. Backend Processing:                     │
│     ✓ Archive bill with payment method      │
│     ✓ Save session history                  │
│       - openedAt, closedAt timestamps       │
│       - customerCount, buffetTier           │
│       - buffetPrice, paymentMethod          │
│       - billId reference                    │
│     ✓ Reset table to Available status       │
│       - Clear customerCount → 0             │
│       - Clear buffetTier → "None"           │
│       - Clear currentBill → null            │
│       - Clear all timestamps                │
│       - Reset diningTimeRemaining           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  4. Table Status: Available                 │
│     - Ready for next customer immediately   │
│     - Session history saved in bill         │
│     - No manual reset needed                │
└─────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### 1. Automatic Table Reset
- **Before**: Close → Manual Reset
- **After**: Checkout → Auto Reset
- **Benefit**: Faster table turnover

### 2. Session History
Each checkout saves:
```javascript
{
  openedAt: Date,
  closedAt: Date,
  customerCount: Number,
  buffetTier: String,
  buffetPrice: Number,
  paymentMethod: String,
  billId: ObjectId
}
```

### 3. Bill Archival
- Bill status → "Archived"
- Payment method recorded
- archivedAt timestamp saved
- Accessible in "Historical Bills" page

### 4. No "Reset" Button
- Removed from UI completely
- Removed from backend routes
- Removed from services
- All functionality built into checkout

---

## 📁 Files Modified

### Backend Changes

1. **`backend/src/services/TableService.js`**
   - Updated `closeTable()` function
   - Now archives bill + resets table in one action
   - Removed `resetTable()` function
   - Returns session history

2. **`backend/src/controllers/tableController.js`**
   - Updated `closeTable` endpoint response
   - Removed `resetTable` controller
   - Now returns "Available" status instead of "Closed"

3. **`backend/src/routes/tableRoutes.js`**
   - Removed `/reset` route
   - Only checkout route needed now

### Frontend Changes

1. **`frontend/src/page/admin/tableManagement.jsx`**
   - Changed dialog title: "ชำระเงินและ Checkout"
   - Updated success message: "โต๊ะพร้อมรับลูกค้าใหม่"
   - Changed button text: "ชำระเงิน & Checkout"
   - Updated info message (green box)

2. **`frontend/src/components/table/TableCard.jsx`**
   - Changed button text from "ปิดโต๊ะ" to "ชำระเงิน"
   - English: "Close Table" → "Checkout"

3. **`frontend/src/services/tableService.js`**
   - Removed `resetTable()` function
   - Updated `closeTable()` documentation

---

## 🧪 Testing Scenarios

### Test 1: Normal Checkout
```
1. Open a table (Table 1, 2 customers, Starter)
2. Wait a few seconds
3. Click "ชำระเงิน" button
4. Select payment method: "Cash"
5. Click "ชำระเงิน & Checkout"
6. ✅ Alert: "โต๊ะ 1 ชำระเงินเรียบร้อย! โต๊ะพร้อมรับลูกค้าใหม่"
7. ✅ Table 1 shows "ว่าง" (Available) badge
8. ✅ Can immediately open table again
```

### Test 2: Verify Bill Archive
```
1. After checkout from Test 1
2. Go to "Billing Management" page
3. Click "Historical Bills" tab
4. ✅ Should see archived bill for Table 1
5. ✅ Payment method should be "Cash"
6. ✅ archivedAt timestamp should be recent
```

### Test 3: Active Tables View
```
1. Open 3 tables (Tables 1, 2, 3)
2. Go to "Active Tables" page (/admin/active-tables)
3. ✅ Should see 3 tables in linked list
4. Checkout Table 2
5. ✅ Table 2 should disappear from active tables view
6. ✅ Statistics should update (2 open tables remaining)
```

### Test 4: Rapid Turnover
```
1. Open Table 5 (4 customers, Premium)
2. Immediately checkout with "Credit Card"
3. ✅ Should complete in < 1 second
4. Open Table 5 again (2 customers, Starter)
5. ✅ Should allow opening immediately
6. ✅ New bill created (separate from previous)
```

---

## 🔧 API Changes

### POST `/api/tables/:tableNumber/close`

**Before:**
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Closed",
    "closedAt": "2025-01-16T18:00:00Z",
    "archivedBill": "507f1f77bcf86cd799439011"
  },
  "message": "Table 1 closed. Bill archived."
}
```

**After:**
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Available",
    "archivedBill": "507f1f77bcf86cd799439011",
    "sessionHistory": {
      "openedAt": "2025-01-16T16:30:00Z",
      "closedAt": "2025-01-16T18:00:00Z",
      "customerCount": 2,
      "buffetTier": "Starter",
      "buffetPrice": 259,
      "paymentMethod": "Cash",
      "billId": "507f1f77bcf86cd799439011"
    },
    "updatedAt": "2025-01-16T18:00:00Z"
  },
  "message": "Table 1 is now available for next customer. Session history saved."
}
```

### ~~DELETE~~ POST `/api/tables/:tableNumber/reset`
❌ **Route removed** - No longer needed

---

## 💡 Benefits

### For Staff
1. **Faster workflow**: One action instead of two
2. **Fewer mistakes**: Can't forget to reset table
3. **Better visibility**: Table status always accurate

### For Customers
1. **Shorter wait times**: Tables available immediately
2. **Better service**: Staff can focus on service, not admin tasks

### For Business
1. **Higher turnover**: Tables ready faster
2. **Better data**: Session history preserved
3. **Cleaner code**: Simpler logic, fewer bugs

---

## 🐛 Potential Issues & Solutions

### Issue: "Table not available immediately"
**Cause**: Frontend still polling old data  
**Solution**: Auto-refresh every 2 seconds catches it quickly

### Issue: "Session history not showing"
**Cause**: Bill archival failed  
**Solution**: Check MongoDB connection, verify BillingService

### Issue: "Can't open table after checkout"
**Cause**: Table status not "Available"  
**Solution**: Check backend logs, verify TableService.closeTable()

---

## 📊 Database Schema Impact

### Table Model
```javascript
// Fields that get RESET on checkout:
status: "Available"           // Changed from "Open"
customerCount: 0              // Cleared
buffetTier: "None"            // Cleared
buffetPrice: 0                // Cleared
openedAt: null                // Cleared
closedAt: null                // Cleared
currentBill: null             // Cleared
paymentMethod: null           // Cleared
diningTimeRemaining: 5400000  // Reset to 90 min

// Fields that remain:
tableNumber: X                // Unchanged (immutable)
reservedAt: null              // Already cleared if was reserved
```

### Bill Model
```javascript
// After archival:
status: "Archived"            // Changed from "Active"
paymentMethod: "Cash/Card/..." // Set by user
archivedAt: Date              // Timestamp added

// All other fields preserved (read-only now)
```

---

## 🚀 Next Steps

### Optional Enhancements

1. **Print Receipt on Checkout**
   ```javascript
   // After successful checkout
   const receipt = await BillingService.getPrintableBill(tableNumber);
   printReceipt(receipt);
   ```

2. **Email Receipt Option**
   ```javascript
   // Add email field to checkout form
   if (customerEmail) {
     await emailReceipt(receipt, customerEmail);
   }
   ```

3. **Checkout Confirmation Modal**
   ```javascript
   // Show summary before checkout
   - Total: ฿XXX
   - Items ordered: N
   - Duration: XX:XX
   - [Confirm Checkout]
   ```

4. **Session Analytics**
   ```javascript
   // Track metrics
   - Average dining time per tier
   - Revenue per table per day
   - Peak hours by table
   ```

---

## 📝 Changelog

**Version 2.0** (2025-01-16)
- ✅ Merged "Close" and "Reset" into single "Checkout" action
- ✅ Added automatic table reset on payment
- ✅ Implemented session history tracking
- ✅ Updated all UI labels and messages
- ✅ Removed manual reset functionality
- ✅ Updated API responses with session data

**Version 1.0** (Previous)
- Two-step process: Close → Reset
- Manual reset required by admin
- No session history tracking

---

**Created**: 2025-01-16  
**Updated**: 2025-01-16  
**Status**: Production Ready ✅  
**Breaking Changes**: Yes (API response structure changed)
