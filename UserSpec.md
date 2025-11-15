# MOOMOO - Hot Pot Buffet Restaurant System

## Clarifications

### Session 2025-11-15

- Q: What happens when a 15-minute table reservation expires? → A: Automatically release reservation and make table available to other customers
- Q: Is there a dining time limit for buffet service? → A: 90 minutes dining limit for buffet service
- Q: How should kitchen staff prioritize between Normal Queue and Special Queue? → A: Process both queues in parallel with different kitchen stations
- Q: How should VAT be handled in bill calculations? → A: Include 7% VAT in displayed prices (259/299 THB are final prices)
- Q: Do customers need accounts/login to place orders? → A: Anonymous ordering by table number (no login required)
- Q: Can bills be printed before closing the table? → A: Yes, bills can be printed/viewed anytime while table is open; closing table only archives the transaction history

## User Role

- Can place food orders anonymously using table number (no login/account required)
- Orders linked to table session opened by admin staff

## Admin Role

### Table Management

#### Table Specifications

- 10 tables available in the restaurant
- Maximum capacity: 4 customers per table
- Table status: Open or Closed
- Dining time limit: 90 minutes per table session (enforced from table opening time)

#### Functions

- View all open tables with details and current bill information
- Open a new table for incoming customers (starts 90-minute dining timer)
- Print/view bill for any open table at any time (bill updates in real-time as orders are placed)
- Close a table after payment is completed (archives transaction to history)
- Reserve a table for 15 minutes (auto-releases if customer doesn't arrive)
- Track reservation start time for each table
- Cancel table reservations manually
- Display all available tables
- Monitor remaining dining time for active tables
- Send notifications when dining time approaches limit (e.g., 15 minutes remaining)
- Access historical bills from closed tables

### Menu Management

#### Menu Categories

**Starter Buffet (259 THB - VAT included)**
- 20 free menu items included in the base price
- Includes: meat, pork, and seafood options
- 90-minute dining time limit

**Premium Buffet (299 THB - VAT included)**
- Includes all Starter Buffet items
- Plus 10 additional premium menu items
- Examples: Australian Chuck Roll, Mussels, Wagyu Beef, etc.
- 90-minute dining time limit

**Special Menu (A la carte - Not included in buffet)**
- 10 special items available for separate purchase
- Prices include 7% VAT
- Examples: Premium Sushi, Salmon Rice, desserts, etc.

#### Functions

- Add new menu items to the system
- Mark menu items as temporarily unavailable (out of stock)
- Permanently delete menu items from the system

### Order Management

#### Order Queue System

**Normal Queue**
- Linked list structure containing:
  - Order ID
  - Table number
  - Order timestamp
  - List of ordered menu items
- Processed by main buffet prep station

**Special Queue**
- Separate queue for a la carte (paid) menu items
- Tracks additional purchases outside of buffet price
- Processed by specialized kitchen station (sushi, desserts, etc.)

**Queue Processing Strategy**
- Both queues process in parallel using different kitchen stations
- Prevents blocking: buffet orders don't wait for special items and vice versa
- Each station processes their respective queue in FIFO order

#### Functions
- Mark orders as completed/served in respective queues
- Process and fulfill orders in parallel based on kitchen station
- Track order status and completion times for both queue types
- Display both queues separately on admin order management screen

---

### Billing System

#### Bill Calculation
- Buffet charges calculated per customer: 259 THB (Starter) or 299 THB (Premium)
- All displayed prices include 7% VAT (pre-VAT and VAT amounts tracked separately for accounting)
- Special menu items add to total bill at item-specific prices
- Final bill = (Number of customers × Buffet price) + Special items total
- System tracks pre-VAT subtotal, VAT amount (7%), and total for each bill

#### Payment Processing

- Bills can be generated/printed at any time while table is open
- Real-time bill updates as orders are placed and completed
- Print/display breakdown: Buffet charges, Special items, Subtotal (pre-VAT), VAT (7%), Total
- Support for cash and digital payment recording
- Closing table after payment moves the transaction to historical records
- Historical bills remain accessible for reporting and audit purposes

## System Overview

This system manages a hot pot buffet restaurant with tiered pricing (Starter 259 THB / Premium 299 THB, VAT included), 90-minute dining time limit, table reservations with auto-release, and both buffet and à la carte ordering capabilities. Customers order anonymously via table number without login. The admin panel handles table operations with time tracking, menu availability, and parallel order fulfillment through separate kitchen station queues.