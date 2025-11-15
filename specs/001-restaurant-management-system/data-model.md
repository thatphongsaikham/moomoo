# Data Model: MOOMOO Restaurant Management System

**Phase**: 1 (Design & Contracts)  
**Date**: 2025-11-15  
**Purpose**: Define entity schemas, relationships, validation rules, and state transitions

## Entity Overview

| Entity | Purpose | Primary Key | Relationships |
|--------|---------|-------------|---------------|
| Table | Physical restaurant table state | tableNumber (1-10) | → Orders (1:N), → Bill (1:1) |
| MenuItem | Food/beverage item | _id (ObjectId) | ← Orders (N:M via items array) |
| Order | Customer food order | _id (ObjectId) | ← Table (N:1), ← MenuItem (N:M) |
| Bill | Transaction record | _id (ObjectId) | ← Table (1:1) |
| User | Admin authentication | _id (ObjectId) | None (existing entity) |

## Entities

### 1. Table

**Purpose**: Represents physical restaurant table with operational state, customer count, buffet tier, and timing information

**Schema**:

```javascript
{
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 10,
    immutable: true
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Open', 'Closed'],
    default: 'Available',
    required: true
  },
  customerCount: {
    type: Number,
    min: 0,
    max: 4,
    default: 0,
    required: true
  },
  buffetTier: {
    type: String,
    enum: ['None', 'Starter', 'Premium'],
    default: 'None',
    required: true
  },
  buffetPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  openedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },
  diningTimeRemaining: {
    type: Number, // milliseconds
    default: 5400000 // 90 minutes in ms
  },
  reservedAt: {
    type: Date,
    default: null
  },
  reservationExpiresAt: {
    type: Date,
    default: null
  },
  currentBill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Validation Rules**:

- **FR-014**: `tableNumber` must be between 1-10 (10 tables maximum)
- **FR-014**: `customerCount` must be between 0-4 (4 customers per table maximum)
- **FR-008**: When `status` = "Open", `openedAt` must be set and `diningTimeRemaining` = 5400000 (90 minutes)
- **FR-015**: When `status` = "Reserved", `reservedAt` and `reservationExpiresAt` must be set (15 minutes from reservation)
- **Constraint**: `buffetTier` = "None" only when `status` = "Available" or "Reserved"
- **Constraint**: `buffetPrice` = 259 when `buffetTier` = "Starter", 299 when "Premium", 0 when "None"

**State Transitions**:

```
Available → Reserved: Admin reserves table (FR-015)
  - Set reservedAt = now
  - Set reservationExpiresAt = now + 15 minutes
  - customerCount remains 0

Reserved → Available: Timer expires OR admin cancels (FR-015, FR-016)
  - Set reservedAt = null
  - Set reservationExpiresAt = null

Reserved → Open: Admin opens table for arrived customers (FR-007)
  - Set status = "Open"
  - Set customerCount, buffetTier, buffetPrice
  - Set openedAt = now
  - Set diningTimeRemaining = 5400000 (90 min)
  - Create Bill document
  - Set reservedAt = null, reservationExpiresAt = null

Available → Open: Admin opens table directly (FR-007)
  - Same as Reserved → Open

Open → Closed: Admin closes table after payment (FR-013)
  - Set status = "Closed"
  - Set closedAt = now
  - Archive Bill (set Bill.status = "Archived")

Closed → Available: System resets table (automatic)
  - Set status = "Available"
  - Reset customerCount = 0
  - Reset buffetTier = "None"
  - Reset buffetPrice = 0
  - Reset openedAt = null, closedAt = null
  - Reset diningTimeRemaining = 5400000
  - Reset currentBill = null
```

**Indexes**:

- Primary: `{tableNumber: 1}` (unique)
- Query: `{status: 1, reservationExpiresAt: 1}` (for cron job auto-release)
- Query: `{status: 1, openedAt: 1}` (for timer monitoring)

---

### 2. MenuItem

**Purpose**: Represents food/beverage item with category, bilingual names, price, and availability status

**Schema**:

```javascript
{
  category: {
    type: String,
    enum: ['Starter Buffet', 'Premium Buffet', 'Special Menu'],
    required: true
  },
  nameThai: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  nameEnglish: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  descriptionThai: {
    type: String,
    default: '',
    maxlength: 500
  },
  descriptionEnglish: {
    type: String,
    default: '',
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (v) => Number.isInteger(v * 100), // Ensure 2 decimal max
      message: 'Price must have at most 2 decimal places'
    }
  },
  availability: {
    type: String,
    enum: ['Available', 'Out of Stock'],
    default: 'Available',
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Validation Rules**:

- **FR-018**: `nameThai` and `nameEnglish` are required (bilingual names)
- **FR-018**: `category` must be one of: "Starter Buffet", "Premium Buffet", "Special Menu"
- **FR-021**: `price` must be non-negative with max 2 decimal places
- **FR-019**: `availability` toggles between "Available" and "Out of Stock"
- **Constraint**: Items in "Starter Buffet" or "Premium Buffet" categories have price = 0 (included in buffet)
- **Constraint**: Items in "Special Menu" category have price > 0 (à la carte pricing)

**State Transitions**:

```
Available → Out of Stock: Admin marks as unavailable (FR-019)
  - Set availability = "Out of Stock"
  - Update updatedAt = now

Out of Stock → Available: Admin restores availability (FR-019)
  - Set availability = "Available"
  - Update updatedAt = now
```

**Indexes**:

- Query: `{category: 1, availability: 1, nameThai: 1}` (customer menu filtering)
- Query: `{availability: 1, updatedAt: -1}` (admin inventory management)

---

### 3. Order

**Purpose**: Represents customer food order with queue assignment, table reference, items, and completion status

**Schema**:

```javascript
{
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    ref: 'Table'
  },
  queueType: {
    type: String,
    enum: ['Normal', 'Special'],
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    nameThai: { // Snapshot for deleted items
      type: String,
      required: true
    },
    nameEnglish: { // Snapshot for deleted items
      type: String,
      required: true
    },
    price: { // Snapshot for price changes
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500
  }
}
```

**Validation Rules**:

- **FR-022**: `queueType` must be "Normal" (buffet items) or "Special" (à la carte)
- **FR-024**: `tableNumber` must reference valid open table
- **FR-024**: `items` array must contain at least 1 item
- **FR-004**: Items with `price = 0` go to "Normal" queue, `price > 0` go to "Special" queue
- **Edge Case**: Item names/prices are snapshots to preserve history if MenuItem is deleted/modified
- **FR-027**: `completedAt` is set when `status` changes to "Completed"

**State Transitions**:

```
Pending → Completed: Kitchen marks order as served (FR-026)
  - Set status = "Completed"
  - Set completedAt = now
  - Remove from active queue display (filter by status = "Pending")

Note: Orders cannot transition back to Pending once Completed
```

**Relationships**:

- **Table**: Order.tableNumber → Table.tableNumber (N:1)
- **MenuItem**: Order.items[].menuItem → MenuItem._id (N:M, soft reference)
- **Bill**: Orders for a table are aggregated in Bill calculation

**Indexes**:

- Primary: `{_id: 1}` (auto)
- Query: `{queueType: 1, status: 1, createdAt: 1}` (FIFO queue processing)
- Query: `{tableNumber: 1, status: 1, createdAt: -1}` (table order history)

---

### 4. Bill

**Purpose**: Represents table transaction with buffet charges, special items, VAT breakdown, payment, and archival status

**Schema**:

```javascript
{
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    ref: 'Table',
    index: true
  },
  customerCount: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  buffetTier: {
    type: String,
    enum: ['Starter', 'Premium'],
    required: true
  },
  buffetPricePerPerson: {
    type: Number,
    required: true,
    min: 0
  },
  buffetCharges: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function() {
        return this.buffetCharges === this.customerCount * this.buffetPricePerPerson;
      },
      message: 'Buffet charges must equal customerCount × buffetPricePerPerson'
    }
  },
  specialItems: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    nameThai: {
      type: String,
      required: true
    },
    nameEnglish: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function() {
          return this.subtotal === this.price * this.quantity;
        },
        message: 'Subtotal must equal price × quantity'
      }
    }
  }],
  specialItemsTotal: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function() {
        return this.total === this.buffetCharges + this.specialItemsTotal;
      },
      message: 'Total must equal buffetCharges + specialItemsTotal'
    }
  },
  preVatSubtotal: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (v) => Number.isInteger(v * 100), // 2 decimal precision
      message: 'Pre-VAT subtotal must have at most 2 decimal places'
    }
  },
  vatAmount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (v) => Number.isInteger(v * 100), // 2 decimal precision
      message: 'VAT amount must have at most 2 decimal places'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Unpaid'],
    default: 'Unpaid'
  },
  status: {
    type: String,
    enum: ['Active', 'Archived'],
    default: 'Active',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
  }
}
```

**Validation Rules**:

- **FR-029**: `buffetCharges` = `customerCount` × `buffetPricePerPerson` (259 or 299)
- **FR-030**: `specialItemsTotal` = sum of all `specialItems[].subtotal`
- **FR-031**: `total` = `buffetCharges` + `specialItemsTotal`
- **FR-032**: VAT calculation (7% included in prices):
  - `preVatSubtotal` = `total / 1.07` (rounded to 2 decimals)
  - `vatAmount` = `total - preVatSubtotal` (rounded to 2 decimals)
  - Ensure `preVatSubtotal + vatAmount === total` (no rounding drift)
- **FR-033**: Bill breakdown must show all components for display
- **FR-035**: `paymentMethod` must be set before closing table
- **FR-036**: When table closed, `status` changes to "Archived" and `archivedAt` is set

**State Transitions**:

```
Active → Archived: Table is closed after payment (FR-013)
  - Set status = "Archived"
  - Set archivedAt = now
  - Set paymentMethod (from admin input)

Note: Bills cannot transition back to Active once Archived
```

**Relationships**:

- **Table**: Bill.tableNumber → Table.tableNumber (1:1 for active bills)
- **Orders**: Bills aggregate completed orders for the table (derived data, not direct reference)

**Indexes**:

- Query: `{tableNumber: 1, status: 1}` (fetch active bill for table)
- Query: `{status: 1, archivedAt: -1}` (historical bill access, FR-037)
- Query: `{createdAt: -1}` (recent transactions)

---

### 5. User (Existing)

**Purpose**: Admin authentication (already implemented, no changes needed)

**Schema**: (Reference only - not modified in this feature)

```javascript
{
  username: String,
  email: String,
  password: String, // bcrypt hashed
  role: String, // e.g., "admin"
  createdAt: Date
}
```

**Note**: Customer ordering is anonymous (FR-001), so User entity is only for admin access.

---

## Relationships Diagram

```
┌─────────────┐
│   Table     │ 1:N
│ tableNumber │────────┐
│   status    │        │
│  openedAt   │        │
└─────────────┘        │
       │ 1:1           │
       │               ↓
       │        ┌─────────────┐
       │        │    Order    │ N:M
       │        │ tableNumber │────────┐
       │        │  queueType  │        │
       │        │   items[]   │        │
       │        └─────────────┘        │
       │                               │
       ↓                               ↓
┌─────────────┐              ┌─────────────┐
│    Bill     │              │  MenuItem   │
│ tableNumber │              │  category   │
│   total     │              │  nameThai   │
│ vatAmount   │              │  nameEng    │
│   status    │              │   price     │
└─────────────┘              └─────────────┘
```

---

## Data Integrity Constraints

### Referential Integrity

1. **Order.tableNumber** must reference existing Table with status = "Open"
2. **Bill.tableNumber** must reference existing Table with status = "Open" or "Closed"
3. **Order.items[].menuItem** should reference MenuItem, but allow null if item is deleted (preserve snapshot)
4. **Table.currentBill** must reference existing Bill with status = "Active"

### Business Logic Constraints

1. **One Active Bill Per Table**: Only one Bill with status = "Active" per tableNumber at any time
2. **FIFO Queue Ordering**: Orders in each queue must be processed in `createdAt` ASC order
3. **Timer Consistency**: `Table.diningTimeRemaining` decreases in real-time, recalculated as `5400000 - (now - openedAt)`
4. **Reservation Expiry**: `Table.reservationExpiresAt` must be exactly 15 minutes (900000ms) after `reservedAt`
5. **VAT Precision**: All monetary calculations rounded to 2 decimal places using `Math.round(value * 100) / 100`

### Cascade Behaviors

1. **Table Deletion**: NOT ALLOWED (tables are fixed 1-10)
2. **MenuItem Deletion**: Preserve in Order.items[] and Bill.specialItems[] as snapshot (soft delete)
3. **Bill Archival**: Set status = "Archived", keep data indefinitely (FR-037 requires 90+ day access)
4. **Order Completion**: Status change only, never delete (preserve for historical records)

---

## Calculated Fields (Not Stored)

These fields are derived on-the-fly and not persisted in database:

1. **Table.diningTimeRemaining**: Calculated as `5400000 - (Date.now() - openedAt)` when status = "Open"
2. **Table.reservationTimeRemaining**: Calculated as `reservationExpiresAt - Date.now()` when status = "Reserved"
3. **Bill.specialItemsTotal**: Sum of `specialItems[].subtotal` (stored for validation, but can be recalculated)
4. **Order Queue Position**: Rank in queue based on `createdAt` ASC (calculated during query)

---

## Migration Notes

### Existing Models to Modify

- **Order.js**: Add `queueType` field, `items[]` snapshot structure
- **User.js**: No changes needed (admin auth only)

### New Models to Create

- **Table.js**: Complete new entity
- **MenuItem.js**: Complete new entity
- **Bill.js**: Complete new entity

### Database Initialization

- Pre-populate 10 Table documents with `tableNumber: 1-10`, `status: "Available"`
- Seed MenuItem collection with sample buffet and special menu items

---

**Status**: Data model complete ✅  
**Next**: Generate API contracts in `contracts/` directory
