# Quickstart Guide: MOOMOO Restaurant Management System

**Purpose**: Get development environment running and understand the workflow  
**Audience**: Developers joining the project  
**Prerequisites**: Node.js v18+, MongoDB, Git

---

## 🚀 Initial Setup

### 1. Clone and Install

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd moomoo

# Checkout feature branch
git checkout 001-restaurant-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend** (`backend/.env`):

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/moomoo
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moomoo

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# CORS Settings
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):

```env
# API Base URL
VITE_API_URL=http://localhost:5000
```

### 3. Database Initialization

```bash
# Start MongoDB (if local installation)
mongod --dbpath /path/to/data/directory

# Or use MongoDB Atlas cloud service

# Run seed script to initialize tables (1-10) and sample menu items
cd backend
node scripts/seed-database.js
```

**Seed Script** (`backend/scripts/seed-database.js`):

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Table from '../src/models/Table.js';
import MenuItem from '../src/models/MenuItem.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed 10 tables
    const tables = Array.from({ length: 10 }, (_, i) => ({
      tableNumber: i + 1,
      status: 'Available',
      customerCount: 0,
      buffetTier: 'None',
      buffetPrice: 0
    }));

    await Table.deleteMany({});
    await Table.insertMany(tables);
    console.log('Seeded 10 tables');

    // Seed sample menu items
    const menuItems = [
      // Starter Buffet items
      { category: 'Starter Buffet', nameThai: 'เนื้อหมูสไลด์', nameEnglish: 'Sliced Pork', price: 0 },
      { category: 'Starter Buffet', nameThai: 'เนื้อไก่สไลด์', nameEnglish: 'Sliced Chicken', price: 0 },
      { category: 'Starter Buffet', nameThai: 'ผักรวม', nameEnglish: 'Mixed Vegetables', price: 0 },
      
      // Premium Buffet items
      { category: 'Premium Buffet', nameThai: 'เนื้อวากิว', nameEnglish: 'Wagyu Beef', price: 0 },
      { category: 'Premium Buffet', nameThai: 'กุ้งแม่น้ำ', nameEnglish: 'River Prawns', price: 0 },
      
      // Special Menu items
      { category: 'Special Menu', nameThai: 'ซูชิแซลมอน', nameEnglish: 'Salmon Sushi', price: 180 },
      { category: 'Special Menu', nameThai: 'น้ำอัดลม', nameEnglish: 'Soft Drink', price: 20 }
    ];

    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    console.log('Seeded menu items');

    mongoose.connection.close();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
```

---

## 🏃 Running the Application

### Development Mode (Recommended)

**Terminal 1 - Backend**:

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

**Terminal 2 - Frontend**:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Serve frontend build via backend (if configured)
cd ../backend
npm start
```

---

## 🧭 Application Structure

### Customer Interface (/)

**Access**: `http://localhost:5173/`

**Features**:
- Home → Enter table number (1-10)
- Menu → Browse Starter Buffet, Premium Buffet, Special Menu
- Cart → Review and place orders
- History → View past orders

**No login required** - Anonymous ordering via table number

### Admin Interface (/admin)

**Access**: `http://localhost:5173/admin`

**Features**:
- Dashboard → Overview of tables, orders, revenue
- Table Management → Open/Reserve/Close tables, view timers
- Order Queue → View Normal Queue (buffet) and Special Queue (à la carte)
- Menu Management → Add/Edit/Delete menu items, toggle availability
- Billing → View/Print bills, archive transactions
- Historical Bills → Search past transactions

**Login required** - Admin authentication with JWT

---

## 🧪 Testing Workflow

### Manual Testing Scenario

1. **Admin opens table**:
   ```
   POST /api/tables/1/open
   {
     "customerCount": 2,
     "buffetTier": "Starter"
   }
   ```

2. **Customer places order**:
   ```
   POST /api/orders
   {
     "tableNumber": 1,
     "items": [
       { "menuItem": "<menu-item-id>", "quantity": 2 }
     ]
   }
   ```

3. **Check order in queue**:
   ```
   GET /api/orders/queue/normal
   ```

4. **Mark order complete**:
   ```
   PATCH /api/orders/<order-id>/complete
   ```

5. **View bill**:
   ```
   GET /api/bills/table/1
   ```

6. **Close table**:
   ```
   POST /api/tables/1/close
   {
     "paymentMethod": "Cash"
   }
   ```

### Automated Testing (Future)

```bash
# Backend tests (Jest + Supertest)
cd backend
npm test

# Frontend tests (Vitest + RTL)
cd frontend
npm test
```

---

## 📁 Key Files Reference

### Backend

| File | Purpose |
|------|---------|
| `src/models/Table.js` | Table entity schema |
| `src/models/MenuItem.js` | Menu item schema |
| `src/models/Order.js` | Order schema with queue type |
| `src/models/Bill.js` | Bill schema with VAT calculation |
| `src/services/TableService.js` | Table lifecycle logic |
| `src/services/BillingService.js` | VAT calculation utilities |
| `src/services/TimerService.js` | Cron job for reservation auto-release |
| `src/controllers/tableController.js` | Table management endpoints |
| `src/routes/tableRoutes.js` | Table API routes |
| `src/server.js` | Express app entry point |

### Frontend

| File | Purpose |
|------|---------|
| `src/components/layout/UserLayout.jsx` | Customer interface wrapper |
| `src/components/layout/AdminLayout.jsx` | Admin interface wrapper |
| `src/page/user/MenuPage.jsx` | Customer menu browsing |
| `src/page/admin/tableManagement.jsx` | Admin table operations |
| `src/page/admin/orderQueue.jsx` | Kitchen queue display |
| `src/services/tableService.js` | Table API calls |
| `src/services/orderService.js` | Order API calls |
| `src/services/billService.js` | Bill API calls |
| `src/hook/useOrderQueue.js` | Polling hook for queue updates |
| `src/hook/useTableTimer.js` | Timer countdown hook |

---

## 🔧 Common Tasks

### Add New Menu Item

**Backend**:
```javascript
// POST /api/menu
const newItem = {
  category: 'Special Menu',
  nameThai: 'ไอศกรีม',
  nameEnglish: 'Ice Cream',
  descriptionThai: 'ไอศกรีมวนิลา',
  descriptionEnglish: 'Vanilla ice cream',
  price: 50,
  imageUrl: '/images/ice-cream.jpg'
};
```

**Frontend** (Admin Panel):
```jsx
import { createMenuItem } from '../services/menuService';

const handleAddItem = async (formData) => {
  try {
    const response = await createMenuItem(formData);
    console.log('Item created:', response.data);
  } catch (error) {
    console.error('Failed to create item:', error);
  }
};
```

### Check Order Queue Status

**API**:
```bash
# Normal Queue (buffet orders)
curl http://localhost:5000/api/orders/queue/normal

# Special Queue (à la carte orders)
curl http://localhost:5000/api/orders/queue/special
```

**Frontend** (Admin Panel):
```jsx
import { useOrderQueue } from '../hook/useOrderQueue';

const OrderQueuePage = () => {
  const { queue: normalQueue } = useOrderQueue('Normal');
  const { queue: specialQueue } = useOrderQueue('Special');

  return (
    <div>
      <h2>Normal Queue ({normalQueue.length})</h2>
      {/* Render normalQueue */}

      <h2>Special Queue ({specialQueue.length})</h2>
      {/* Render specialQueue */}
    </div>
  );
};
```

### Print Bill

**API**:
```bash
curl http://localhost:5000/api/bills/table/1/print
```

**Frontend**:
```jsx
import { getPrintableBill } from '../services/billService';

const handlePrint = async (tableNumber) => {
  const response = await getPrintableBill(tableNumber);
  window.print(); // Or use custom print logic
};
```

---

## 🐛 Troubleshooting

### Backend won't start

**Issue**: `MONGODB_URI not defined`  
**Solution**: Create `.env` file in `backend/` directory with connection string

**Issue**: `Port 5000 already in use`  
**Solution**: Change `PORT` in `.env` or kill process on port 5000

### Frontend can't connect to backend

**Issue**: `CORS error`  
**Solution**: Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL (http://localhost:5173)

**Issue**: `Network Error`  
**Solution**: Check backend is running and `VITE_API_URL` in frontend `.env` is correct

### Orders not appearing in queue

**Issue**: Orders show as empty array  
**Solution**: Verify table is in "Open" status and menu items exist with correct pricing

---

## 📚 Additional Resources

- [Spec Document](./spec.md) - Full feature requirements
- [Data Model](./data-model.md) - Entity schemas and relationships
- [API Contracts](./contracts/) - Complete API documentation
- [Research Notes](./research.md) - Technical decisions and rationale
- [Constitution](./.specify/memory/constitution.md) - Project principles

---

## 🔐 Admin Authentication

**Default Admin Credentials** (for development):

```
Username: admin
Password: admin123
```

**Login Endpoint**:

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

Store token in localStorage and include in Authorization header for admin routes:

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## ⏰ Real-Time Features

### Polling Strategy

**Order Queue** (Admin):
- Poll `/api/orders/queue/normal` and `/api/orders/queue/special` every 2 seconds
- Display FIFO order with queue position

**Table Status** (Admin):
- Poll `/api/tables` every 2 seconds
- Calculate `diningTimeRemaining` on frontend: `5400000 - (Date.now() - openedAt)`

**Bill Updates** (Admin):
- Poll `/api/bills/table/:tableNumber` every 5 seconds when viewing bill

### Timer Service (Backend)

**Cron Job** (runs every 30 seconds):
- Check `Table.reservationExpiresAt < Date.now()`
- Auto-release expired reservations (set status to "Available")
- Send notifications for tables with < 15 minutes remaining

**Implementation** (`src/services/TimerService.js`):

```javascript
import cron from 'node-cron';
import Table from '../models/Table.js';

// Run every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  // Auto-release expired reservations
  await Table.updateMany(
    {
      status: 'Reserved',
      reservationExpiresAt: { $lt: new Date() }
    },
    {
      status: 'Available',
      reservedAt: null,
      reservationExpiresAt: null
    }
  );
});
```

---

## 🎨 UI Design System

**Color Palette**:
- Primary: Black (`#000000`)
- Accent: Red (`#dc2626`)
- Background: Dark gray (`#1a1a1a`)
- Text: White/Light gray

**Tailwind Utilities**:
- Buttons: `bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2`
- Cards: `bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-4`
- Glass effect: `bg-white/5 backdrop-blur-lg`

**Responsive Breakpoints**:
- Mobile: Default (< 640px)
- Tablet: `md:` (641px - 1024px)
- Desktop: `lg:` (> 1024px)

**Language Toggle**:
```jsx
const [language, setLanguage] = useState('th'); // 'th' or 'en'

const toggleLanguage = () => {
  setLanguage(prev => prev === 'th' ? 'en' : 'th');
  localStorage.setItem('language', language);
};
```

---

**Last Updated**: 2025-11-15  
**Next Steps**: Run `/speckit.tasks` to generate task breakdown for implementation
