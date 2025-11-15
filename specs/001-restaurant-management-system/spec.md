# Feature Specification: MOOMOO Restaurant Management System

**Feature Branch**: `001-restaurant-management-system`  
**Created**: 2025-11-15  
**Status**: Draft  
**Input**: Complete MOOMOO hot pot buffet restaurant management system with table operations, menu management, order queuing, and billing

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Anonymous Ordering (Priority: P1)

Customers can browse the menu and place orders anonymously using their table number without creating an account or logging in. Orders are immediately sent to the kitchen queue and linked to their table session.

**Why this priority**: Core revenue-generating functionality. Without customer ordering capability, the restaurant cannot serve customers digitally.

**Independent Test**: Can be fully tested by opening a table in admin panel, accessing menu as customer via table number, placing orders, and verifying orders appear in kitchen queue.

**Acceptance Scenarios**:

1. **Given** a table is open and customer accesses menu via table number, **When** customer selects Starter Buffet items and places order, **Then** order appears in Normal Queue with table number and timestamp
2. **Given** customer is viewing menu, **When** customer adds Special Menu (à la carte) items, **Then** items are added to Special Queue with correct pricing
3. **Given** customer places multiple orders during 90-minute session, **When** each order is submitted, **Then** all orders are tracked separately with unique order IDs and timestamps

---

### User Story 2 - Admin Table Management (Priority: P1)

Admin staff can open tables for incoming customers, monitor dining time limits (90 minutes), view real-time bills, print bills anytime, and close tables after payment to archive transactions.

**Why this priority**: Essential for restaurant operations. Tables must be managed to control customer flow and track revenue.

**Independent Test**: Admin can open table with customer count and buffet tier selection, system starts 90-minute timer, admin can view/print bill in real-time, and close table to move transaction to history.

**Acceptance Scenarios**:

1. **Given** admin opens a new table with 3 customers selecting Premium Buffet, **When** table is opened, **Then** 90-minute timer starts and bill shows 897 THB base charge (3 × 299 THB)
2. **Given** table is open for 75 minutes, **When** system checks time remaining, **Then** notification appears warning 15 minutes remaining
3. **Given** table has active orders and special items, **When** admin prints bill, **Then** bill shows buffet charges, special items, subtotal (pre-VAT), VAT (7%), and total
4. **Given** payment is received, **When** admin closes table, **Then** transaction moves to historical records and table becomes available

---

### User Story 3 - Admin Order Queue Management (Priority: P1)

Kitchen staff view two separate queues (Normal and Special) on the admin panel, process orders in FIFO sequence, and mark orders as completed. Both queues process in parallel without blocking each other.

**Why this priority**: Critical for kitchen operations. Orders must be fulfilled in sequence to maintain service quality.

**Independent Test**: Multiple orders placed to both queues, kitchen staff can view both queues separately, mark orders as completed, and verify completed status updates in real-time.

**Acceptance Scenarios**:

1. **Given** 5 buffet orders in Normal Queue and 3 special orders in Special Queue, **When** kitchen staff views order management screen, **Then** both queues display separately with order details (ID, table, timestamp, items)
2. **Given** kitchen completes a buffet order, **When** staff marks order as completed, **Then** order is removed from Normal Queue and completion time is recorded
3. **Given** special order station completes sushi order, **When** marked complete, **Then** order removed from Special Queue independently of Normal Queue status

---

### User Story 4 - Table Reservation with Auto-Release (Priority: P2)

Admin staff can reserve a table for incoming customers with a 15-minute hold. If customers don't arrive within 15 minutes, the system automatically releases the reservation and makes the table available.

**Why this priority**: Improves customer experience for walk-ins while preventing table blocking. Secondary to core ordering operations.

**Independent Test**: Admin reserves table, system tracks 15-minute timer, and table automatically becomes available if timer expires without manual opening.

**Acceptance Scenarios**:

1. **Given** admin reserves Table 5 for incoming customers, **When** reservation is created, **Then** table status changes to "Reserved" with 15-minute countdown
2. **Given** table reserved for 15 minutes with no customer arrival, **When** timer expires, **Then** table automatically returns to "Available" status
3. **Given** reserved table and customers arrive within 15 minutes, **When** admin opens table, **Then** reservation is cancelled and table opens normally

---

### User Story 5 - Admin Menu Management (Priority: P2)

Admin can add new menu items to any category (Starter Buffet, Premium Buffet, Special Menu), mark items as temporarily unavailable (out of stock), and permanently delete items from the system.

**Why this priority**: Necessary for operational flexibility but not blocking core ordering. Menu changes happen less frequently than orders.

**Independent Test**: Admin can create new menu item with category, price, and details; mark existing item as unavailable; and delete unused items.

**Acceptance Scenarios**:

1. **Given** admin adds "Wagyu Ribeye" to Premium Buffet category, **When** item is saved, **Then** item appears in Premium Buffet menu for customers
2. **Given** "Salmon Sashimi" is out of stock, **When** admin marks as unavailable, **Then** item becomes hidden or grayed out in customer menu
3. **Given** seasonal item "Winter Soup" is no longer served, **When** admin deletes item, **Then** item is permanently removed from all menu displays

---

### User Story 6 - Billing with VAT Calculation (Priority: P2)

System calculates bills with buffet charges per customer, adds special menu items, tracks pre-VAT subtotal and 7% VAT separately, and displays complete breakdown for transparency and accounting compliance.

**Why this priority**: Required for legal compliance but calculation happens automatically. Secondary to core ordering flow.

**Independent Test**: Open table with customers, place buffet and special orders, verify bill calculation matches: (Customers × Buffet Price) + Special Items, with VAT breakdown shown.

**Acceptance Scenarios**:

1. **Given** table with 2 Starter Buffet customers (518 THB) and 2 special items (200 THB total), **When** bill is generated, **Then** subtotal pre-VAT = 670.09 THB, VAT = 47.91 THB, Total = 718 THB
2. **Given** bill is printed, **When** receipt is displayed, **Then** shows: Buffet Charges, Special Items list with prices, Subtotal (pre-VAT), VAT 7%, and Total

---

### User Story 7 - Historical Bill Access (Priority: P3)

After tables are closed, admin can access archived bills for reporting, auditing, and customer inquiries. Historical data remains searchable by date, table number, or transaction details.

**Why this priority**: Important for business operations but not blocking day-to-day service. Can be implemented after core operations are stable.

**Independent Test**: Close multiple tables with completed transactions, access historical bills section, search by criteria, and view complete bill details.

**Acceptance Scenarios**:

1. **Given** 10 tables closed in past week, **When** admin accesses historical bills, **Then** all transactions are listed with date, table number, and total amount
2. **Given** customer inquires about yesterday's bill for Table 3, **When** admin searches by table and date, **Then** complete bill with all items and charges is displayed

---

### Edge Cases

- **Order during table transition**: What happens when customer places order exactly when table reaches 90-minute limit? System should queue order but notify staff that table time has expired.
- **Menu item deleted with pending orders**: If special menu item is deleted while orders for it are in queue, existing orders should complete normally with item name preserved in order history.
- **Concurrent bill printing**: If multiple staff members print bill for same table simultaneously, ensure consistent data is shown without race conditions.
- **Reservation conflicts**: If admin tries to reserve already-reserved table, system should show warning and display reservation expiry time.
- **Network failure during order submission**: Customer orders should queue locally and retry submission when connection is restored, with duplicate detection.
- **Timer precision near midnight**: Ensure 90-minute dining timer works correctly across midnight boundary (e.g., table opened at 11:30 PM).
- **VAT calculation rounding**: Ensure VAT calculation at 7% handles rounding correctly for compliance (e.g., round to 2 decimal places, totals match).
- **Zero special items**: Bill with only buffet charges and no special items should still show proper VAT breakdown.

## Requirements *(mandatory)*

### Functional Requirements

**Customer Ordering (User Interface)**

- **FR-001**: System MUST allow customers to access menu anonymously using table number without login or account creation
- **FR-002**: System MUST display menu items organized by category (Starter Buffet, Premium Buffet, Special Menu)
- **FR-003**: System MUST show item availability status (available vs out of stock)
- **FR-004**: System MUST allow customers to place orders for buffet items (included in price) and special items (à la carte)
- **FR-005**: System MUST send orders to appropriate queue (Normal Queue for buffet, Special Queue for à la carte)
- **FR-006**: System MUST support bilingual display (Thai and English) for all menu items and UI text

**Table Management (Admin Interface)**

- **FR-007**: System MUST allow admin to open new table with customer count and buffet tier selection (Starter/Premium)
- **FR-008**: System MUST start 90-minute dining timer when table is opened
- **FR-009**: System MUST track and display remaining dining time for all open tables
- **FR-010**: System MUST send notification when table has 15 minutes remaining before time limit
- **FR-011**: System MUST allow admin to view all open tables with current status and bill totals
- **FR-012**: System MUST allow admin to print/view bill for any open table at any time with real-time updates
- **FR-013**: System MUST allow admin to close table after payment, archiving transaction to historical records
- **FR-014**: System MUST support 10 tables maximum with up to 4 customers per table
- **FR-015**: System MUST allow admin to reserve table for 15 minutes with automatic release if customer doesn't arrive
- **FR-016**: System MUST allow admin to manually cancel table reservations
- **FR-017**: System MUST display all available tables with status: Available, Reserved, Open, or Closed

**Menu Management (Admin Interface)**

- **FR-018**: System MUST allow admin to add new menu items with category, name (Thai/English), price, and description
- **FR-019**: System MUST allow admin to mark menu items as temporarily unavailable (out of stock)
- **FR-020**: System MUST allow admin to permanently delete menu items from system
- **FR-021**: System MUST maintain menu item data: category (Starter/Premium/Special), name, price, availability status

**Order Queue Management (Admin Interface)**

- **FR-022**: System MUST maintain two separate queues: Normal Queue (buffet orders) and Special Queue (à la carte orders)
- **FR-023**: System MUST display both queues separately on admin order management screen
- **FR-024**: System MUST store order data: Order ID, Table number, Timestamp, List of ordered items
- **FR-025**: System MUST process orders in FIFO sequence within each queue
- **FR-026**: System MUST allow admin to mark orders as completed/served in respective queues
- **FR-027**: System MUST remove completed orders from active queue and record completion time
- **FR-028**: System MUST support parallel processing of both queues (different kitchen stations)

**Billing System (Admin Interface)**

- **FR-029**: System MUST calculate buffet charges: Customer count × Buffet price (259 THB Starter / 299 THB Premium)
- **FR-030**: System MUST add special menu item charges to table bill at item-specific prices
- **FR-031**: System MUST calculate final bill: (Customers × Buffet Price) + Special Items Total
- **FR-032**: System MUST track VAT separately: pre-VAT subtotal and 7% VAT amount (all displayed prices include VAT)
- **FR-033**: System MUST display bill breakdown: Buffet Charges, Special Items (itemized), Subtotal (pre-VAT), VAT (7%), Total
- **FR-034**: System MUST update bill in real-time as orders are placed and completed
- **FR-035**: System MUST support cash and digital payment recording
- **FR-036**: System MUST archive closed table transactions to historical records
- **FR-037**: System MUST allow admin to access historical bills for reporting and auditing

**Data Persistence**

- **FR-038**: System MUST persist table data: table number, status, customer count, buffet tier, open time, dining time remaining
- **FR-039**: System MUST persist menu items: category, name (Thai/English), price, availability status
- **FR-040**: System MUST persist orders: order ID, table number, timestamp, items, status (pending/completed), completion time
- **FR-041**: System MUST persist bills: table number, customer count, buffet charges, special items, VAT breakdown, total, payment method, transaction timestamp

### Key Entities

- **Table**: Represents physical restaurant table with attributes: table number (1-10), status (Available/Reserved/Open/Closed), customer count (0-4), buffet tier (Starter/Premium/None), open timestamp, reservation expiry, dining time remaining
- **Menu Item**: Represents food/beverage item with attributes: item ID, category (Starter Buffet/Premium Buffet/Special Menu), name (Thai), name (English), price (THB), availability status (Available/Out of Stock)
- **Order**: Represents customer food order with attributes: order ID, table number, order timestamp, queue type (Normal/Special), items list, status (Pending/Completed), completion timestamp
- **Bill**: Represents table transaction with attributes: bill ID, table number, customer count, buffet tier, buffet charge total, special items list with prices, subtotal (pre-VAT), VAT amount, total, payment method, transaction timestamp, status (Active/Archived)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can browse menu and place orders within 30 seconds of accessing table number
- **SC-002**: Admin can open new table and start service in under 15 seconds
- **SC-003**: Orders appear in kitchen queue within 2 seconds of customer submission
- **SC-004**: Admin can print bill for any open table in under 5 seconds with real-time accuracy
- **SC-005**: System handles 10 concurrent open tables with active orders without performance degradation
- **SC-006**: Table reservation auto-releases exactly at 15-minute mark without requiring manual intervention
- **SC-007**: 90-minute dining timer accuracy within 10 seconds across all tables
- **SC-008**: VAT calculations match Thai tax requirements with correct rounding (2 decimal places)
- **SC-009**: 95% of orders marked as completed within 15 minutes of placement during normal service hours
- **SC-010**: Zero data loss for orders and bills during normal operations (all transactions persisted correctly)
- **SC-011**: Historical bills remain accessible and searchable for at least 90 days after table closure
- **SC-012**: System supports both Thai and English languages with 100% coverage of customer-facing text

