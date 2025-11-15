# API Contract: Orders

**Base Path**: `/api/orders`  
**Purpose**: Customer order placement and kitchen queue management  
**Functional Requirements**: FR-001, FR-004, FR-005, FR-022 to FR-028

---

## Endpoints

### GET /api/orders

Get orders with filtering (dual queue support)

**Request**:
```http
GET /api/orders HTTP/1.1
```

**Query Parameters**:
- `queueType` (optional): Filter by queue ("Normal" | "Special")
- `status` (optional): Filter by status ("Pending" | "Completed")
- `tableNumber` (optional): Filter by table number (1-10)
- `limit` (optional): Max results (default 50)
- `sort` (optional): Sort order ("createdAt" default, "-createdAt" for desc)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "673ab89c5f2a3e4b12345680",
      "tableNumber": 3,
      "queueType": "Normal",
      "items": [
        {
          "menuItem": "673ab89c5f2a3e4b12345678",
          "nameThai": "เนื้อหมูสไลด์",
          "nameEnglish": "Sliced Pork",
          "price": 0,
          "quantity": 2
        }
      ],
      "status": "Pending",
      "createdAt": "2025-11-15T10:00:00.000Z",
      "completedAt": null,
      "notes": ""
    },
    {
      "_id": "673ab89c5f2a3e4b12345681",
      "tableNumber": 5,
      "queueType": "Special",
      "items": [
        {
          "menuItem": "673ab89c5f2a3e4b12345679",
          "nameThai": "ซูชิแซลมอน",
          "nameEnglish": "Salmon Sushi",
          "price": 180,
          "quantity": 1
        }
      ],
      "status": "Pending",
      "createdAt": "2025-11-15T10:02:00.000Z",
      "completedAt": null,
      "notes": "No wasabi"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "page": 1
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

**Mapping**: FR-023 (display both queues separately), FR-025 (FIFO sequence by createdAt)

---

### GET /api/orders/:id

Get specific order details

**Request**:
```http
GET /api/orders/673ab89c5f2a3e4b12345680 HTTP/1.1
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345680",
    "tableNumber": 3,
    "queueType": "Normal",
    "items": [
      {
        "menuItem": "673ab89c5f2a3e4b12345678",
        "nameThai": "เนื้อหมูสไลด์",
        "nameEnglish": "Sliced Pork",
        "price": 0,
        "quantity": 2
      },
      {
        "menuItem": "673ab89c5f2a3e4b12345679",
        "nameThai": "เนื้อไก่สไลด์",
        "nameEnglish": "Sliced Chicken",
        "price": 0,
        "quantity": 1
      }
    ],
    "status": "Pending",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "completedAt": null,
    "notes": ""
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Mapping**: Order detail view

---

### POST /api/orders

Create new order (Customer)

**Request**:
```http
POST /api/orders HTTP/1.1
Content-Type: application/json

{
  "tableNumber": 3,
  "items": [
    {
      "menuItem": "673ab89c5f2a3e4b12345678",
      "quantity": 2
    },
    {
      "menuItem": "673ab89c5f2a3e4b12345679",
      "quantity": 1
    }
  ],
  "notes": "Extra spicy"
}
```

**Body Parameters**:
- `tableNumber`: Integer 1-10 (required)
- `items`: Array of objects (required, min 1 item)
  - `menuItem`: MongoDB ObjectId (required)
  - `quantity`: Integer ≥ 1 (required)
- `notes`: String max 500 characters (optional)

**Response 201**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345682",
    "tableNumber": 3,
    "queueType": "Normal",
    "items": [
      {
        "menuItem": "673ab89c5f2a3e4b12345678",
        "nameThai": "เนื้อหมูสไลด์",
        "nameEnglish": "Sliced Pork",
        "price": 0,
        "quantity": 2
      },
      {
        "menuItem": "673ab89c5f2a3e4b12345679",
        "nameThai": "เนื้อไก่สไลด์",
        "nameEnglish": "Sliced Chicken",
        "price": 0,
        "quantity": 1
      }
    ],
    "status": "Pending",
    "createdAt": "2025-11-15T10:05:00.000Z",
    "completedAt": null,
    "notes": "Extra spicy"
  },
  "message": "Order placed successfully"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Table is not open"
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Menu item not found: 673ab89c5f2a3e4b12345678"
}
```

**Response 422**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "items": "Must contain at least 1 item",
    "quantity": "Must be at least 1"
  }
}
```

**Business Logic**:
- Fetch each `menuItem` from MenuItem collection
- Snapshot `nameThai`, `nameEnglish`, `price` to preserve data if item is deleted
- Determine `queueType`:
  - If **all** items have `price = 0` → `queueType = "Normal"` (buffet)
  - If **any** item has `price > 0` → `queueType = "Special"` (à la carte)
- Validate `tableNumber` is in "Open" status

**Mapping**: FR-001 (anonymous ordering via table number), FR-004 (place orders), FR-005 (send to appropriate queue)

---

### PATCH /api/orders/:id/complete

Mark order as completed (Admin/Kitchen)

**Request**:
```http
PATCH /api/orders/673ab89c5f2a3e4b12345680/complete HTTP/1.1
Authorization: Bearer <admin-token>
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345680",
    "tableNumber": 3,
    "queueType": "Normal",
    "items": [
      {
        "menuItem": "673ab89c5f2a3e4b12345678",
        "nameThai": "เนื้อหมูสไลด์",
        "nameEnglish": "Sliced Pork",
        "price": 0,
        "quantity": 2
      }
    ],
    "status": "Completed",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "completedAt": "2025-11-15T10:15:00.000Z",
    "notes": ""
  },
  "message": "Order marked as completed"
}
```

**Response 400**:
```json
{
  "success": false,
  "error": "Order is already completed"
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Mapping**: FR-026 (mark orders as completed), FR-027 (record completion time)

---

### GET /api/orders/queue/normal

Get Normal Queue (buffet orders) - FIFO sorted

**Request**:
```http
GET /api/orders/queue/normal HTTP/1.1
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "673ab89c5f2a3e4b12345680",
      "tableNumber": 3,
      "queueType": "Normal",
      "items": [
        {
          "nameThai": "เนื้อหมูสไลด์",
          "nameEnglish": "Sliced Pork",
          "quantity": 2
        }
      ],
      "status": "Pending",
      "createdAt": "2025-11-15T10:00:00.000Z",
      "queuePosition": 1
    },
    {
      "_id": "673ab89c5f2a3e4b12345682",
      "tableNumber": 7,
      "queueType": "Normal",
      "items": [
        {
          "nameThai": "ผักรวม",
          "nameEnglish": "Mixed Vegetables",
          "quantity": 1
        }
      ],
      "status": "Pending",
      "createdAt": "2025-11-15T10:02:00.000Z",
      "queuePosition": 2
    }
  ],
  "queueLength": 2
}
```

**Mapping**: FR-023 (display Normal Queue separately), FR-025 (FIFO processing)

---

### GET /api/orders/queue/special

Get Special Queue (à la carte orders) - FIFO sorted

**Request**:
```http
GET /api/orders/queue/special HTTP/1.1
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "673ab89c5f2a3e4b12345681",
      "tableNumber": 5,
      "queueType": "Special",
      "items": [
        {
          "nameThai": "ซูชิแซลมอน",
          "nameEnglish": "Salmon Sushi",
          "price": 180,
          "quantity": 1
        }
      ],
      "status": "Pending",
      "createdAt": "2025-11-15T10:02:00.000Z",
      "notes": "No wasabi",
      "queuePosition": 1
    }
  ],
  "queueLength": 1
}
```

**Mapping**: FR-023 (display Special Queue separately), FR-025 (FIFO processing), FR-028 (parallel processing)

---

## Frontend Implementation

**Service Layer** (`orderService.js`):

```javascript
export const getOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`/api/orders?${params}`);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`/api/orders/${id}`);
  return response.data;
};

export const placeOrder = async (tableNumber, items, notes = '') => {
  const response = await axios.post('/api/orders', {
    tableNumber,
    items,
    notes
  });
  return response.data;
};

export const completeOrder = async (id) => {
  const response = await axios.patch(
    `/api/orders/${id}/complete`,
    {},
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
};

export const getNormalQueue = async () => {
  const response = await axios.get('/api/orders/queue/normal');
  return response.data;
};

export const getSpecialQueue = async () => {
  const response = await axios.get('/api/orders/queue/special');
  return response.data;
};
```

**Hook for Polling** (`useOrderQueue.js`):

```javascript
export const useOrderQueue = (queueType) => {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const endpoint = queueType === 'Normal' 
          ? '/api/orders/queue/normal' 
          : '/api/orders/queue/special';
        const response = await axios.get(endpoint);
        setQueue(response.data.data);
      } catch (error) {
        console.error('Failed to fetch queue:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [queueType]);

  return { queue, isLoading };
};
```

**Backend Routes** (`orderRoutes.js`):

```javascript
import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  completeOrder,
  getNormalQueue,
  getSpecialQueue
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (customer ordering)
router.post('/', createOrder);

// Queue routes (admin/kitchen viewing)
router.get('/', getAllOrders);
router.get('/queue/normal', getNormalQueue);
router.get('/queue/special', getSpecialQueue);
router.get('/:id', getOrderById);

// Admin routes (order completion)
router.patch('/:id/complete', authMiddleware, completeOrder);

export default router;
```

---

## Validation Rules

**Queue Assignment Logic**:
```javascript
// Pseudo-code for queueType determination
const determineQueueType = (items) => {
  const hasSpecialItem = items.some(item => item.price > 0);
  return hasSpecialItem ? 'Special' : 'Normal';
};
```

**FIFO Ordering**:
- Query: `Order.find({queueType, status: 'Pending'}).sort({createdAt: 1})`
- Index: `{queueType: 1, status: 1, createdAt: 1}` for performance

**Edge Cases**:
- **Order during table transition** (90-minute limit expired): Allow order creation but notify admin
- **Menu item deleted with pending orders**: Snapshot data preserved, orders complete normally
- **Mixed buffet + special items**: Route to Special Queue (any special item triggers Special)

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
- `400`: Invalid request (table not open, order already completed)
- `401`: Unauthorized (admin routes only)
- `404`: Order/MenuItem not found
- `422`: Validation error
- `500`: Server error

---

**Status**: Orders API contract complete ✅
