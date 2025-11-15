# API Contract: Tables

**Base Path**: `/api/tables`  
**Purpose**: Table lifecycle management (open, reserve, close, status updates)  
**Functional Requirements**: FR-007 to FR-017

---

## Endpoints

### GET /api/tables

Get all tables with current status

**Request**:
```http
GET /api/tables HTTP/1.1
```

**Query Parameters**:
- `status` (optional): Filter by status ("Available" | "Reserved" | "Open" | "Closed")

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "tableNumber": 1,
      "status": "Available",
      "customerCount": 0,
      "buffetTier": "None",
      "buffetPrice": 0,
      "openedAt": null,
      "diningTimeRemaining": 5400000,
      "reservedAt": null,
      "reservationExpiresAt": null,
      "currentBill": null,
      "updatedAt": "2025-11-15T10:00:00.000Z"
    },
    {
      "tableNumber": 2,
      "status": "Open",
      "customerCount": 3,
      "buffetTier": "Premium",
      "buffetPrice": 299,
      "openedAt": "2025-11-15T10:30:00.000Z",
      "diningTimeRemaining": 4500000,
      "reservedAt": null,
      "reservationExpiresAt": null,
      "currentBill": "673ab89c5f2a3e4b12345678",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

**Response 500**:
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

**Mapping**: FR-011 (view all open tables), FR-017 (display all available tables)

---

### GET /api/tables/:tableNumber

Get specific table details

**Request**:
```http
GET /api/tables/1 HTTP/1.1
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Open",
    "customerCount": 2,
    "buffetTier": "Starter",
    "buffetPrice": 259,
    "openedAt": "2025-11-15T10:00:00.000Z",
    "diningTimeRemaining": 5100000,
    "reservedAt": null,
    "reservationExpiresAt": null,
    "currentBill": "673ab89c5f2a3e4b12345678",
    "updatedAt": "2025-11-15T10:05:00.000Z"
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Table not found"
}
```

**Mapping**: FR-011 (view table status and bill totals)

---

### POST /api/tables/:tableNumber/open

Open a table for dining

**Request**:
```http
POST /api/tables/1/open HTTP/1.1
Content-Type: application/json

{
  "customerCount": 3,
  "buffetTier": "Premium"
}
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Body Parameters**:
- `customerCount`: Integer 1-4 (required)
- `buffetTier`: "Starter" | "Premium" (required)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Open",
    "customerCount": 3,
    "buffetTier": "Premium",
    "buffetPrice": 299,
    "openedAt": "2025-11-15T10:30:00.000Z",
    "diningTimeRemaining": 5400000,
    "currentBill": "673ab89c5f2a3e4b12345678",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  },
  "message": "Table 1 opened successfully"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Table is not available (current status: Reserved)"
}
```

**Response 422**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "customerCount": "Must be between 1 and 4",
    "buffetTier": "Must be Starter or Premium"
  }
}
```

**Mapping**: FR-007 (open new table), FR-008 (start 90-minute timer)

---

### POST /api/tables/:tableNumber/reserve

Reserve a table

**Request**:
```http
POST /api/tables/1/reserve HTTP/1.1
Content-Type: application/json

{
  "notes": "Party of 4"
}
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Body Parameters**:
- `notes` (optional): String max 200 characters

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Reserved",
    "customerCount": 0,
    "buffetTier": "None",
    "buffetPrice": 0,
    "reservedAt": "2025-11-15T10:00:00.000Z",
    "reservationExpiresAt": "2025-11-15T10:15:00.000Z",
    "reservationTimeRemaining": 900000,
    "updatedAt": "2025-11-15T10:00:00.000Z"
  },
  "message": "Table 1 reserved for 15 minutes"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Table is not available (current status: Open)"
}
```

**Mapping**: FR-015 (reserve table for 15 minutes)

---

### POST /api/tables/:tableNumber/cancel-reservation

Cancel a table reservation

**Request**:
```http
POST /api/tables/1/cancel-reservation HTTP/1.1
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Available",
    "reservedAt": null,
    "reservationExpiresAt": null,
    "updatedAt": "2025-11-15T10:05:00.000Z"
  },
  "message": "Reservation cancelled"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Table is not reserved (current status: Available)"
}
```

**Mapping**: FR-016 (manually cancel reservations)

---

### POST /api/tables/:tableNumber/close

Close a table after payment

**Request**:
```http
POST /api/tables/1/close HTTP/1.1
Content-Type: application/json

{
  "paymentMethod": "Cash"
}
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Body Parameters**:
- `paymentMethod`: "Cash" | "Credit Card" | "Debit Card" | "Mobile Payment" (required)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Closed",
    "closedAt": "2025-11-15T12:00:00.000Z",
    "archivedBill": "673ab89c5f2a3e4b12345678",
    "updatedAt": "2025-11-15T12:00:00.000Z"
  },
  "message": "Table 1 closed. Bill archived."
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Table is not open (current status: Available)"
}
```

**Response 422**:
```json
{
  "success": false,
  "error": "Payment method is required"
}
```

**Mapping**: FR-013 (close table after payment, archive transaction)

---

### POST /api/tables/:tableNumber/reset

Reset a closed table to available (internal use)

**Request**:
```http
POST /api/tables/1/reset HTTP/1.1
```

**Path Parameters**:
- `tableNumber`: Integer 1-10

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tableNumber": 1,
    "status": "Available",
    "customerCount": 0,
    "buffetTier": "None",
    "buffetPrice": 0,
    "openedAt": null,
    "closedAt": null,
    "diningTimeRemaining": 5400000,
    "currentBill": null,
    "updatedAt": "2025-11-15T12:05:00.000Z"
  },
  "message": "Table 1 reset to Available"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Can only reset Closed tables"
}
```

**Mapping**: Automatic cleanup after table closure

---

## Real-Time Updates

**Polling Strategy**: Frontend polls `GET /api/tables` every 2 seconds when on table management page

**Calculated Fields**:
- `diningTimeRemaining`: Calculated on backend as `5400000 - (Date.now() - openedAt)`
- `reservationTimeRemaining`: Calculated as `reservationExpiresAt - Date.now()`

**Frontend Implementation**:
```javascript
// tableService.js
export const getTables = async (status = null) => {
  const params = status ? `?status=${status}` : '';
  const response = await axios.get(`/api/tables${params}`);
  return response.data;
};

export const openTable = async (tableNumber, customerCount, buffetTier) => {
  const response = await axios.post(`/api/tables/${tableNumber}/open`, {
    customerCount,
    buffetTier
  });
  return response.data;
};

export const reserveTable = async (tableNumber, notes = '') => {
  const response = await axios.post(`/api/tables/${tableNumber}/reserve`, {
    notes
  });
  return response.data;
};

export const closeTable = async (tableNumber, paymentMethod) => {
  const response = await axios.post(`/api/tables/${tableNumber}/close`, {
    paymentMethod
  });
  return response.data;
};
```

**Backend Implementation**:
```javascript
// tableRoutes.js
import express from 'express';
import { 
  getAllTables, 
  getTableByNumber, 
  openTable, 
  reserveTable, 
  cancelReservation, 
  closeTable, 
  resetTable 
} from '../controllers/tableController.js';

const router = express.Router();

router.get('/', getAllTables);
router.get('/:tableNumber', getTableByNumber);
router.post('/:tableNumber/open', openTable);
router.post('/:tableNumber/reserve', reserveTable);
router.post('/:tableNumber/cancel-reservation', cancelReservation);
router.post('/:tableNumber/close', closeTable);
router.post('/:tableNumber/reset', resetTable);

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
- `200`: Success
- `400`: Invalid request (wrong state, invalid parameters)
- `404`: Table not found
- `422`: Validation error
- `500`: Server error

---

**Status**: Tables API contract complete ✅
