# API Contract: Bills

**Base Path**: `/api/bills`  
**Purpose**: Bill calculation, VAT breakdown, payment recording, and historical access  
**Functional Requirements**: FR-012, FR-029 to FR-037

---

## Endpoints

### GET /api/bills/table/:tableNumber

Get active bill for a table

**Request**:
```http
GET /api/bills/table/3 HTTP/1.1
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345690",
    "tableNumber": 3,
    "customerCount": 2,
    "buffetTier": "Starter",
    "buffetPricePerPerson": 259,
    "buffetCharges": 518,
    "specialItems": [
      {
        "menuItem": "673ab89c5f2a3e4b12345679",
        "nameThai": "ซูชิแซลมอน",
        "nameEnglish": "Salmon Sushi",
        "price": 180,
        "quantity": 1,
        "subtotal": 180
      },
      {
        "menuItem": "673ab89c5f2a3e4b12345680",
        "nameThai": "น้ำอัดลม",
        "nameEnglish": "Soft Drink",
        "price": 20,
        "quantity": 2,
        "subtotal": 40
      }
    ],
    "specialItemsTotal": 220,
    "total": 738,
    "preVatSubtotal": 689.72,
    "vatAmount": 48.28,
    "paymentMethod": "Unpaid",
    "status": "Active",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "archivedAt": null
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "No active bill found for table 3"
}
```

**Mapping**: FR-012 (view bill with real-time updates), FR-033 (bill breakdown display)

---

### GET /api/bills/:id

Get bill by ID (for historical access)

**Request**:
```http
GET /api/bills/673ab89c5f2a3e4b12345690 HTTP/1.1
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345690",
    "tableNumber": 3,
    "customerCount": 2,
    "buffetTier": "Starter",
    "buffetPricePerPerson": 259,
    "buffetCharges": 518,
    "specialItems": [
      {
        "nameThai": "ซูชิแซลมอน",
        "nameEnglish": "Salmon Sushi",
        "price": 180,
        "quantity": 1,
        "subtotal": 180
      }
    ],
    "specialItemsTotal": 180,
    "total": 698,
    "preVatSubtotal": 652.34,
    "vatAmount": 45.66,
    "paymentMethod": "Cash",
    "status": "Archived",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "archivedAt": "2025-11-15T11:30:00.000Z"
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Bill not found"
}
```

**Mapping**: FR-037 (access historical bills)

---

### GET /api/bills/history

Get historical bills (archived transactions)

**Request**:
```http
GET /api/bills/history HTTP/1.1
```

**Query Parameters**:
- `tableNumber` (optional): Filter by table number (1-10)
- `startDate` (optional): ISO 8601 date (e.g., "2025-11-15T00:00:00Z")
- `endDate` (optional): ISO 8601 date
- `paymentMethod` (optional): Filter by payment method
- `limit` (optional): Max results (default 50)
- `page` (optional): Page number (default 1)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "673ab89c5f2a3e4b12345690",
      "tableNumber": 3,
      "customerCount": 2,
      "buffetTier": "Starter",
      "total": 698,
      "paymentMethod": "Cash",
      "status": "Archived",
      "createdAt": "2025-11-15T10:00:00.000Z",
      "archivedAt": "2025-11-15T11:30:00.000Z"
    },
    {
      "_id": "673ab89c5f2a3e4b12345691",
      "tableNumber": 5,
      "customerCount": 4,
      "buffetTier": "Premium",
      "total": 1396,
      "paymentMethod": "Credit Card",
      "status": "Archived",
      "createdAt": "2025-11-14T18:00:00.000Z",
      "archivedAt": "2025-11-14T19:45:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "page": 1,
    "pages": 1
  }
}
```

**Response 500**:
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

**Mapping**: FR-037 (historical bills searchable by date, table, transaction details)

---

### POST /api/bills/table/:tableNumber

Create bill for a table (automatic on table open)

**Request**:
```http
POST /api/bills/table/3 HTTP/1.1
Content-Type: application/json

{
  "customerCount": 2,
  "buffetTier": "Starter",
  "buffetPricePerPerson": 259
}
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Body Parameters**:
- `customerCount`: Integer 1-4 (required)
- `buffetTier`: "Starter" | "Premium" (required)
- `buffetPricePerPerson`: Number (259 or 299) (required)

**Response 201**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345690",
    "tableNumber": 3,
    "customerCount": 2,
    "buffetTier": "Starter",
    "buffetPricePerPerson": 259,
    "buffetCharges": 518,
    "specialItems": [],
    "specialItemsTotal": 0,
    "total": 518,
    "preVatSubtotal": 484.11,
    "vatAmount": 33.89,
    "paymentMethod": "Unpaid",
    "status": "Active",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "archivedAt": null
  },
  "message": "Bill created for table 3"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Active bill already exists for table 3"
}
```

**Mapping**: FR-029 (calculate buffet charges = customerCount × buffetPrice)

---

### PATCH /api/bills/:id/add-item

Add special menu item to bill (from order completion)

**Request**:
```http
PATCH /api/bills/673ab89c5f2a3e4b12345690/add-item HTTP/1.1
Content-Type: application/json

{
  "menuItem": "673ab89c5f2a3e4b12345679",
  "nameThai": "ซูชิแซลมอน",
  "nameEnglish": "Salmon Sushi",
  "price": 180,
  "quantity": 1
}
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Body Parameters**:
- `menuItem`: MongoDB ObjectId (optional, for reference)
- `nameThai`: String (required)
- `nameEnglish`: String (required)
- `price`: Number ≥ 0 (required)
- `quantity`: Integer ≥ 1 (required)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345690",
    "tableNumber": 3,
    "buffetCharges": 518,
    "specialItems": [
      {
        "menuItem": "673ab89c5f2a3e4b12345679",
        "nameThai": "ซูชิแซลมอน",
        "nameEnglish": "Salmon Sushi",
        "price": 180,
        "quantity": 1,
        "subtotal": 180
      }
    ],
    "specialItemsTotal": 180,
    "total": 698,
    "preVatSubtotal": 652.34,
    "vatAmount": 45.66,
    "status": "Active",
    "createdAt": "2025-11-15T10:00:00.000Z"
  },
  "message": "Item added to bill"
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Bill not found"
}
```

**Business Logic**:
- Calculate `subtotal = price × quantity`
- Recalculate `specialItemsTotal = sum(specialItems[].subtotal)`
- Recalculate `total = buffetCharges + specialItemsTotal`
- Recalculate VAT breakdown

**Mapping**: FR-030 (add special menu items to bill), FR-034 (real-time bill updates)

---

### PATCH /api/bills/:id/archive

Archive bill (mark as paid and close)

**Request**:
```http
PATCH /api/bills/673ab89c5f2a3e4b12345690/archive HTTP/1.1
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "paymentMethod": "Cash"
}
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Body Parameters**:
- `paymentMethod`: "Cash" | "Credit Card" | "Debit Card" | "Mobile Payment" (required)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345690",
    "tableNumber": 3,
    "total": 698,
    "paymentMethod": "Cash",
    "status": "Archived",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "archivedAt": "2025-11-15T11:30:00.000Z"
  },
  "message": "Bill archived successfully"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Bill is already archived"
}
```

**Response 401**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Mapping**: FR-013 (close table archives bill), FR-035 (record payment method), FR-036 (archive transaction)

---

### GET /api/bills/table/:tableNumber/print

Get printable bill format

**Request**:
```http
GET /api/bills/table/3/print HTTP/1.1
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Response 200**:
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "name": "MOOMOO Restaurant",
      "address": "123 Bangkok Street, Thailand",
      "phone": "+66 12 345 6789",
      "taxId": "0123456789012"
    },
    "bill": {
      "_id": "673ab89c5f2a3e4b12345690",
      "tableNumber": 3,
      "date": "2025-11-15T10:00:00.000Z",
      "items": [
        {
          "description": "Starter Buffet × 2",
          "amount": 518.00
        },
        {
          "description": "ซูชิแซลมอน (Salmon Sushi) × 1",
          "amount": 180.00
        }
      ],
      "subtotal": 652.34,
      "vat": {
        "rate": "7%",
        "amount": 45.66
      },
      "total": 698.00,
      "paymentMethod": "Unpaid"
    }
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "No active bill found for table 3"
}
```

**Mapping**: FR-012 (print bill anytime), FR-033 (display complete breakdown)

---

## VAT Calculation Logic

**Formula** (7% VAT included in prices):

```javascript
// Backend utility function
export const calculateVAT = (totalIncludingVAT) => {
  const preVatSubtotal = Math.round((totalIncludingVAT / 1.07) * 100) / 100;
  const vatAmount = Math.round((totalIncludingVAT - preVatSubtotal) * 100) / 100;
  
  // Ensure no rounding drift
  const recalculatedTotal = preVatSubtotal + vatAmount;
  if (recalculatedTotal !== totalIncludingVAT) {
    // Adjust VAT amount to match total
    const adjustedVatAmount = totalIncludingVAT - preVatSubtotal;
    return {
      preVatSubtotal,
      vatAmount: Math.round(adjustedVatAmount * 100) / 100
    };
  }
  
  return { preVatSubtotal, vatAmount };
};
```

**Validation**:
- `preVatSubtotal + vatAmount === total` (no rounding errors)
- All values rounded to 2 decimal places
- Use Number type (not String) for calculations

**Mapping**: FR-032 (track VAT separately), FR-008 (VAT calculation precision)

---

## Frontend Implementation

**Service Layer** (`billService.js`):

```javascript
export const getActiveBillForTable = async (tableNumber) => {
  const response = await axios.get(`/api/bills/table/${tableNumber}`);
  return response.data;
};

export const getBillById = async (id) => {
  const response = await axios.get(`/api/bills/${id}`);
  return response.data;
};

export const getHistoricalBills = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`/api/bills/history?${params}`);
  return response.data;
};

export const createBillForTable = async (tableNumber, billData) => {
  const response = await axios.post(`/api/bills/table/${tableNumber}`, billData);
  return response.data;
};

export const addItemToBill = async (billId, item) => {
  const response = await axios.patch(`/api/bills/${billId}/add-item`, item);
  return response.data;
};

export const archiveBill = async (billId, paymentMethod) => {
  const response = await axios.patch(
    `/api/bills/${billId}/archive`,
    { paymentMethod },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
};

export const getPrintableBill = async (tableNumber) => {
  const response = await axios.get(`/api/bills/table/${tableNumber}/print`);
  return response.data;
};
```

**Backend Routes** (`billRoutes.js`):

```javascript
import express from 'express';
import {
  getActiveBillForTable,
  getBillById,
  getHistoricalBills,
  createBillForTable,
  addItemToBill,
  archiveBill,
  getPrintableBill
} from '../controllers/billController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Admin routes
router.get('/table/:tableNumber', getActiveBillForTable);
router.get('/table/:tableNumber/print', getPrintableBill);
router.get('/history', getHistoricalBills);
router.get('/:id', getBillById);

// Internal routes (called by system)
router.post('/table/:tableNumber', createBillForTable);
router.patch('/:id/add-item', addItemToBill);

// Admin routes
router.patch('/:id/archive', authMiddleware, archiveBill);

export default router;
```

---

## Error Handling

**Standard Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional validation details
}
```

**HTTP Status Codes**:
- `200`: Success (GET, PATCH)
- `201`: Created (POST)
- `400`: Invalid request (already archived, duplicate bill)
- `401`: Unauthorized
- `404`: Bill not found
- `422`: Validation error
- `500`: Server error

---

**Status**: Bills API contract complete ✅
