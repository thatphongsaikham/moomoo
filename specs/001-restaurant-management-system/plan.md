# Implementation Plan: MOOMOO Restaurant Management System

**Branch**: `001-restaurant-management-system` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-restaurant-management-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a complete Thai hot pot buffet restaurant management system with dual interfaces: customer-facing menu and ordering (anonymous access via table number) and admin-facing operations (table management, order queue processing, menu management, billing with VAT calculation). System supports 10 tables with 90-minute dining limits, dual order queues (buffet/special items), automatic table reservation release (15 minutes), and bilingual Thai/English support. Technical approach leverages existing MERN stack (MongoDB, Express v5, React v19, Node.js) with real-time updates for order queue and table status.

## Technical Context

**Language/Version**: Node.js v18+ (ES Modules) for backend, React v19.1 for frontend  
**Primary Dependencies**: Express v5.1 (backend), Mongoose v8.19 (ODM), React Router DOM v7.9 (frontend), Vite v7.1 (build), Tailwind CSS v4.1 (styling), Axios v1.13 (HTTP client)  
**Storage**: MongoDB (cloud or local) with Mongoose schemas for Table, MenuItem, Order, Bill entities  
**Testing**: NEEDS CLARIFICATION (no test framework currently configured - need to determine Jest/Vitest/React Testing Library)  
**Target Platform**: Web application - Customer interface on mobile/desktop browsers, Admin interface on tablets/desktops  
**Project Type**: Web (dual-interface: frontend + backend)  
**Performance Goals**: Orders appear in queue within 2 seconds (SC-003), bill printing under 5 seconds (SC-004), 10 concurrent tables without degradation (SC-005)  
**Constraints**: 90-minute timer accuracy ±10 seconds (SC-007), VAT calculation precision 2 decimal places (SC-008), 15-minute reservation auto-release (SC-006)  
**Scale/Scope**: 10 tables maximum, 4 customers per table, 7 user stories (3 P1, 3 P2, 1 P3), 41 functional requirements, bilingual support (Thai/English)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Refer to `.specify/memory/constitution.md` for complete principles. Key checks:**

- [x] **Phase 0 - Before Research**:
  - [x] Feature specification includes both user and admin interface requirements (if applicable) → ✅ FR-001 to FR-006 (customer), FR-007 to FR-037 (admin)
  - [x] Bilingual requirements documented (Thai/English) → ✅ FR-006, FR-018 specify bilingual support
  - [x] Responsive design considerations noted → ✅ SC-001 mentions customer access (mobile), table management requires tablets
- [x] **Phase 1 - After Design**:
  - [x] API contracts defined for frontend ↔ backend integration → ✅ contracts/tables-api.md, menu-api.md, orders-api.md, bills-api.md
  - [x] Component architecture respects user/admin separation (UserLayout vs AdminLayout) → ✅ Project structure defines separate user/ and admin/ page directories
  - [x] Real-time update strategy documented (if applicable) → ✅ Polling strategy (2s intervals) documented in research.md and API contracts
- [ ] **Phase 2 - Before Implementation**:
  - [ ] Tasks organized by frontend/backend with clear dependencies → Deferred to `/speckit.tasks` command
  - [ ] Modular code organization plan follows `backend/src/` and `frontend/src/` structure standards → Will be validated during task generation

**Core Principles to Validate**:

- **Full-Stack Integration**: ✅ API contracts define service layers (tableService.js, orderService.js, billService.js) with matching backend routes
- **User-Centric Design**: ✅ Clear separation: Customer pages (user/) vs Admin pages (admin/), distinct layouts (UserLayout/AdminLayout)
- **Real-Time Operations**: ✅ Polling strategy defined (2s for queues/tables, 5s for bills), cron job for timer auto-release (30s interval)
- **Bilingual Support**: ✅ Data model includes nameThai/nameEnglish fields, quickstart.md documents language toggle implementation
- **Responsive Design**: ✅ Tailwind breakpoints defined in research.md (mobile <640px, tablet 641-1024px, desktop >1024px)
- **Code Organization**: ✅ Project structure follows constitution: Models → Services → Controllers → Routes (backend); Components → Pages → Services → Hooks (frontend)

## Project Structure

### Documentation (this feature)

```text
specs/001-restaurant-management-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── Table.js         # NEW: Table entity (status, customer count, buffet tier, timers)
│   │   ├── MenuItem.js      # NEW: Menu item entity (category, bilingual names, price, availability)
│   │   ├── Order.js         # EXISTING: Extend with queue type (Normal/Special), table reference
│   │   ├── Bill.js          # NEW: Bill entity (charges, VAT breakdown, payment, transaction history)
│   │   └── User.js          # EXISTING: Keep for admin authentication
│   ├── services/
│   │   ├── TableService.js      # NEW: Table lifecycle (open, reserve, close, timer management)
│   │   ├── MenuService.js       # NEW: Menu CRUD operations, availability toggle
│   │   ├── OrderQueue.js        # EXISTING: Extend to handle dual queues (Normal/Special)
│   │   ├── BillingService.js    # NEW: Bill calculation, VAT breakdown, transaction archival
│   │   └── TimerService.js      # NEW: 90-minute dining + 15-minute reservation timers
│   ├── controllers/
│   │   ├── tableController.js   # NEW: Table management endpoints
│   │   ├── menuController.js    # NEW: Menu management endpoints
│   │   ├── orderController.js   # EXISTING: Extend for queue separation
│   │   ├── billController.js    # NEW: Billing endpoints
│   │   └── userController.js    # EXISTING: Keep for admin auth
│   ├── routes/
│   │   ├── tableRoutes.js       # NEW: /api/tables
│   │   ├── menuRoutes.js        # NEW: /api/menu
│   │   ├── orderRoutes.js       # EXISTING: Extend /api/orders
│   │   ├── billRoutes.js        # NEW: /api/bills
│   │   └── userRoutes.js        # EXISTING: /api/users (admin auth)
│   ├── middleware/
│   │   └── errorHandler.js      # EXISTING: Keep for error handling
│   ├── config/
│   │   └── db.js                # EXISTING: MongoDB connection
│   └── server.js                # EXISTING: Entry point, register new routes
└── tests/                       # NEW: Add test structure (framework TBD in research)

frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── UserLayout.jsx       # EXISTING: Customer interface wrapper
│   │   │   ├── AdminLayout.jsx      # EXISTING: Admin interface wrapper
│   │   │   └── sidebar/
│   │   │       └── topbar.jsx       # EXISTING: Keep
│   │   ├── order/
│   │   │   ├── OrderCard.jsx        # EXISTING: Extend for queue type display
│   │   │   └── OrderList.jsx        # EXISTING: Extend for dual queue display
│   │   ├── table/
│   │   │   ├── TableCard.jsx        # NEW: Table status card (status, timer, customer count)
│   │   │   └── TableGrid.jsx        # NEW: Grid of all tables
│   │   ├── menu/
│   │   │   ├── MenuItemCard.jsx     # NEW: Menu item display (bilingual, availability)
│   │   │   └── MenuCategory.jsx     # NEW: Category section (Starter/Premium/Special)
│   │   ├── bill/
│   │   │   ├── BillSummary.jsx      # NEW: Bill breakdown display (buffet, special, VAT)
│   │   │   └── BillPrint.jsx        # NEW: Printable bill format
│   │   └── ui/
│   │       └── crad.jsx             # EXISTING: Keep (typo: should be card.jsx)
│   ├── page/
│   │   ├── user/
│   │   │   ├── Home.jsx             # EXISTING: Extend with table number entry
│   │   │   ├── MenuPage.jsx         # EXISTING: Extend with bilingual display
│   │   │   ├── CartPage.jsx         # EXISTING: Keep
│   │   │   ├── OrderPage.jsx        # EXISTING: Keep for order status
│   │   │   ├── HistoryPage.jsx      # EXISTING: Keep (maps to User Story 7)
│   │   │   ├── ProfilePage.jsx      # EXISTING: Keep (may be unused for anonymous)
│   │   │   ├── ReservationPage.jsx  # EXISTING: Keep (maps to User Story 4)
│   │   │   └── TableList.jsx        # EXISTING: Keep
│   │   └── admin/
│   │       ├── homeAdmin.jsx        # EXISTING: Admin dashboard
│   │       ├── tableManagement.jsx  # EXISTING: Extend for table lifecycle (User Story 2)
│   │       ├── orderQueue.jsx       # EXISTING: Extend for dual queue (User Story 3)
│   │       ├── menu.jsx             # EXISTING: Extend for menu management (User Story 5)
│   │       ├── billingManagement.jsx # EXISTING: Extend for billing (User Story 6)
│   │       ├── waitlistManagement.jsx # EXISTING: Keep (reservation feature)
│   │       ├── billing.jsx          # EXISTING: Keep
│   │       └── table.jsx            # EXISTING: Keep
│   ├── services/
│   │   ├── menuService.js       # EXISTING: Extend for category filtering, bilingual
│   │   ├── userService.js       # EXISTING: Keep for admin auth
│   │   ├── tableService.js      # NEW: Table API calls (open, close, reserve, status)
│   │   ├── orderService.js      # NEW: Order API calls (place, queue status, complete)
│   │   └── billService.js       # NEW: Bill API calls (fetch, print, archive)
│   ├── hook/
│   │   ├── useOrderQueue.js     # EXISTING: Extend for dual queue subscriptions
│   │   ├── use-mobile.js        # EXISTING: Keep for responsive design
│   │   ├── useTableTimer.js     # NEW: Hook for 90-minute + reservation timers
│   │   └── useBilingual.js      # NEW: Hook for Thai/English language switching
│   └── styles/
│       └── restaurant.css       # EXISTING: Keep black/red theme
└── tests/                       # NEW: Add frontend test structure (framework TBD)
```

**Structure Decision**: Web application structure selected. Project has separate `backend/` and `frontend/` directories with clear separation of concerns. Backend follows Models → Services → Controllers → Routes pattern. Frontend follows Components (reusable) → Pages (routes) → Services (API) → Hooks (logic) pattern. Existing structure is well-organized and aligns with constitution principles. Will extend existing files where possible (marked "EXISTING: Extend") and add new modules for restaurant-specific features (marked "NEW").

## Complexity Tracking

> **No constitution violations - This section intentionally left empty**

All core principles are maintained:

- Single web application structure (backend + frontend)
- Standard MERN stack without additional architectural layers
- Polling for real-time updates (no complex WebSocket infrastructure for MVP)
- Direct Mongoose ORM (no repository pattern over-engineering)
- Simple authentication (JWT for admin, anonymous for customers)

If future complexity is needed (e.g., WebSocket, microservices, additional databases), document here with justification.
