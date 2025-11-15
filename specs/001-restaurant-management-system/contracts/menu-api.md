# API Contract: Menu Items

**Base Path**: `/api/menu`  
**Purpose**: Menu management (CRUD operations, availability toggle, bilingual support)  
**Functional Requirements**: FR-002, FR-003, FR-006, FR-018 to FR-021

---

## Endpoints

### GET /api/menu

Get all menu items

**Request**:
```http
GET /api/menu HTTP/1.1
```

**Query Parameters**:
- `category` (optional): Filter by category ("Starter Buffet" | "Premium Buffet" | "Special Menu")
- `availability` (optional): Filter by availability ("Available" | "Out of Stock")
- `language` (optional): Return only specified language ("th" | "en" | "both" default)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "673ab89c5f2a3e4b12345678",
      "category": "Starter Buffet",
      "nameThai": "เนื้อหมูสไลด์",
      "nameEnglish": "Sliced Pork",
      "descriptionThai": "เนื้อหมูคุณภาพดี",
      "descriptionEnglish": "Premium quality pork",
      "price": 0,
      "availability": "Available",
      "imageUrl": "/images/pork.jpg",
      "createdAt": "2025-11-15T08:00:00.000Z",
      "updatedAt": "2025-11-15T08:00:00.000Z"
    },
    {
      "_id": "673ab89c5f2a3e4b12345679",
      "category": "Special Menu",
      "nameThai": "ซูชิแซลมอน",
      "nameEnglish": "Salmon Sushi",
      "descriptionThai": "ซูชิแซลมอนสด 8 ชิ้น",
      "descriptionEnglish": "Fresh salmon sushi 8 pieces",
      "price": 180,
      "availability": "Available",
      "imageUrl": "/images/salmon-sushi.jpg",
      "createdAt": "2025-11-15T08:00:00.000Z",
      "updatedAt": "2025-11-15T08:00:00.000Z"
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

**Mapping**: FR-002 (display menu organized by category), FR-003 (show availability), FR-006 (bilingual display)

---

### GET /api/menu/:id

Get specific menu item by ID

**Request**:
```http
GET /api/menu/673ab89c5f2a3e4b12345678 HTTP/1.1
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345678",
    "category": "Premium Buffet",
    "nameThai": "เนื้อวากิว",
    "nameEnglish": "Wagyu Beef",
    "descriptionThai": "เนื้อวากิวเกรด A5",
    "descriptionEnglish": "A5 grade Wagyu beef",
    "price": 0,
    "availability": "Available",
    "imageUrl": "/images/wagyu.jpg",
    "createdAt": "2025-11-15T08:00:00.000Z",
    "updatedAt": "2025-11-15T08:00:00.000Z"
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Menu item not found"
}
```

**Mapping**: Menu item detail view

---

### POST /api/menu

Create new menu item (Admin only)

**Request**:
```http
POST /api/menu HTTP/1.1
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "category": "Special Menu",
  "nameThai": "วากิวริบอาย",
  "nameEnglish": "Wagyu Ribeye",
  "descriptionThai": "สเต็กเนื้อวากิวริบอาย 200 กรัม",
  "descriptionEnglish": "200g Wagyu ribeye steak",
  "price": 450,
  "imageUrl": "/images/wagyu-ribeye.jpg"
}
```

**Body Parameters**:
- `category`: "Starter Buffet" | "Premium Buffet" | "Special Menu" (required)
- `nameThai`: String 1-100 characters (required)
- `nameEnglish`: String 1-100 characters (required)
- `descriptionThai`: String max 500 characters (optional)
- `descriptionEnglish`: String max 500 characters (optional)
- `price`: Number ≥ 0, max 2 decimals (required)
- `imageUrl`: String (optional)

**Response 201**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345680",
    "category": "Special Menu",
    "nameThai": "วากิวริบอาย",
    "nameEnglish": "Wagyu Ribeye",
    "descriptionThai": "สเต็กเนื้อวากิวริบอาย 200 กรัม",
    "descriptionEnglish": "200g Wagyu ribeye steak",
    "price": 450,
    "availability": "Available",
    "imageUrl": "/images/wagyu-ribeye.jpg",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  },
  "message": "Menu item created successfully"
}
```

**Response 401**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Response 422**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "nameThai": "Thai name is required",
    "price": "Price must be non-negative with max 2 decimal places"
  }
}
```

**Mapping**: FR-018 (add new menu items with bilingual names and price)

---

### PUT /api/menu/:id

Update menu item (Admin only)

**Request**:
```http
PUT /api/menu/673ab89c5f2a3e4b12345678 HTTP/1.1
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "price": 200,
  "descriptionEnglish": "Updated description"
}
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Body Parameters** (all optional, update only provided fields):
- `category`: "Starter Buffet" | "Premium Buffet" | "Special Menu"
- `nameThai`: String 1-100 characters
- `nameEnglish`: String 1-100 characters
- `descriptionThai`: String max 500 characters
- `descriptionEnglish`: String max 500 characters
- `price`: Number ≥ 0, max 2 decimals
- `imageUrl`: String

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345678",
    "category": "Special Menu",
    "nameThai": "ซูชิแซลมอน",
    "nameEnglish": "Salmon Sushi",
    "descriptionThai": "ซูชิแซลมอนสด 8 ชิ้น",
    "descriptionEnglish": "Updated description",
    "price": 200,
    "availability": "Available",
    "imageUrl": "/images/salmon-sushi.jpg",
    "createdAt": "2025-11-15T08:00:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  },
  "message": "Menu item updated successfully"
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Menu item not found"
}
```

**Mapping**: FR-018 (admin can modify menu items)

---

### PATCH /api/menu/:id/availability

Toggle menu item availability (Admin only)

**Request**:
```http
PATCH /api/menu/673ab89c5f2a3e4b12345678/availability HTTP/1.1
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "availability": "Out of Stock"
}
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Body Parameters**:
- `availability`: "Available" | "Out of Stock" (required)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "673ab89c5f2a3e4b12345678",
    "category": "Special Menu",
    "nameThai": "ซูชิแซลมอน",
    "nameEnglish": "Salmon Sushi",
    "price": 180,
    "availability": "Out of Stock",
    "updatedAt": "2025-11-15T10:45:00.000Z"
  },
  "message": "Menu item availability updated"
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Menu item not found"
}
```

**Mapping**: FR-019 (mark items as temporarily unavailable)

---

### DELETE /api/menu/:id

Delete menu item (Admin only)

**Request**:
```http
DELETE /api/menu/673ab89c5f2a3e4b12345678 HTTP/1.1
Authorization: Bearer <admin-token>
```

**Path Parameters**:
- `id`: MongoDB ObjectId

**Response 200**:
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

**Response 404**:
```json
{
  "success": false,
  "error": "Menu item not found"
}
```

**Edge Case**: Orders and Bills that reference deleted items will retain snapshot data (nameThai, nameEnglish, price) from order placement time.

**Mapping**: FR-020 (permanently delete menu items)

---

## Frontend Implementation

**Service Layer** (`menuService.js`):

```javascript
export const getMenuItems = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`/api/menu?${params}`);
  return response.data;
};

export const getMenuItemById = async (id) => {
  const response = await axios.get(`/api/menu/${id}`);
  return response.data;
};

export const createMenuItem = async (itemData) => {
  const response = await axios.post('/api/menu', itemData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

export const updateMenuItem = async (id, updates) => {
  const response = await axios.put(`/api/menu/${id}`, updates, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

export const toggleAvailability = async (id, availability) => {
  const response = await axios.patch(
    `/api/menu/${id}/availability`,
    { availability },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await axios.delete(`/api/menu/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};
```

**Backend Routes** (`menuRoutes.js`):

```javascript
import express from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem
} from '../controllers/menuController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (customer access)
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Admin routes (require authentication)
router.post('/', authMiddleware, createMenuItem);
router.put('/:id', authMiddleware, updateMenuItem);
router.patch('/:id/availability', authMiddleware, toggleAvailability);
router.delete('/:id', authMiddleware, deleteMenuItem);

export default router;
```

---

## Validation Rules

**Category Rules**:
- Buffet categories ("Starter Buffet", "Premium Buffet"): Price should be 0 (included in buffet)
- Special Menu category: Price must be > 0 (à la carte pricing)

**Bilingual Requirements**:
- Both `nameThai` and `nameEnglish` are required (FR-006)
- Descriptions are optional but recommended for customer clarity

**Price Precision**:
- Must be non-negative: `price >= 0`
- Max 2 decimal places: `Number.isInteger(price * 100)`
- Store as Number type in MongoDB (not String)

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
- `200`: Success (GET, PUT, PATCH, DELETE)
- `201`: Created (POST)
- `400`: Invalid request
- `401`: Unauthorized (missing/invalid admin token)
- `404`: Menu item not found
- `422`: Validation error
- `500`: Server error

---

**Status**: Menu API contract complete ✅
