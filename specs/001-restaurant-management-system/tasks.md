# Tasks: MOOMOO Restaurant Management System

**Input**: Design documents from `/specs/001-restaurant-management-system/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Tests**: Tests are OPTIONAL and not included per spec.md requirements (no test framework requested)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**Web app structure** (MOOMOO):
- Backend: `backend/src/models/`, `backend/src/services/`, `backend/src/controllers/`, `backend/src/routes/`
- Frontend: `frontend/src/components/`, `frontend/src/page/`, `frontend/src/services/`, `frontend/src/hook/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database seeding

- [X] T001 Create database seed script for 10 tables in backend/src/config/seed.js
- [X] T002 Add sample menu items seed data (Starter/Premium/Special categories) in backend/src/config/seed.js
- [X] T003 Create environment variables template .env.example with MONGODB_URI, JWT_SECRET, PORT
- [X] T004 Update backend/package.json dependencies with mongoose@8.19, express-async-handler, node-cron
- [X] T005 Update frontend/package.json dependencies with axios@1.13, lucide-react, react-i18next

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create Table model schema in backend/src/models/Table.js
- [X] T007 Create MenuItem model schema in backend/src/models/MenuItem.js
- [X] T008 Create Order model schema with queueType field in backend/src/models/Order.js
- [X] T009 Create Bill model schema with VAT calculation in backend/src/models/Bill.js
- [X] T010 [P] Create base error handling middleware in backend/src/middleware/errorHandler.js (already exists, verify)
- [X] T011 [P] Create admin authentication middleware in backend/src/middleware/authMiddleware.js
- [X] T012 [P] Setup CORS configuration in backend/src/server.js
- [X] T013 [P] Create bilingual translation files in frontend/src/locales/th.json and frontend/src/locales/en.json
- [X] T014 [P] Setup i18next configuration in frontend/src/i18n.js
- [X] T015 Create base API client configuration in frontend/src/services/api.js with axios interceptors
- [X] T016 Create useBilingual hook for language switching in frontend/src/hook/useBilingual.js
- [X] T017 Update UserLayout component to add language toggle in frontend/src/components/layout/UserLayout.jsx
- [X] T018 Update AdminLayout component to add language toggle in frontend/src/components/layout/AdminLayout.jsx
- [X] T019 Run database seed script to initialize 10 tables and sample menu (✅ COMPLETED: 10 tables + 16 menu items)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Customer Anonymous Ordering (Priority: P1) 🎯 MVP

**Goal**: Customers can browse menu and place orders using table number without login

**Independent Test**: Open table via admin panel, access menu as customer using table number, place orders with buffet and special items, verify orders appear in kitchen queue

### Implementation for User Story 1

#### Backend - Orders

- [X] T020 [P] [US1] Create OrderService with placeOrder and queue assignment logic in backend/src/services/OrderService.js
- [X] T021 [P] [US1] Create orderController with createOrder endpoint in backend/src/controllers/orderController.js
- [X] T022 [US1] Create order routes in backend/src/routes/orderRoutes.js (POST /api/orders)
- [X] T023 [US1] Register order routes in backend/src/server.js

#### Frontend - Menu Browsing

- [X] T024 [P] [US1] Create MenuService with getMenuItems API call in frontend/src/services/menuService.js (extend existing)
- [X] T025 [P] [US1] Create MenuItemCard component with bilingual display in frontend/src/components/menu/MenuItemCard.jsx
- [X] T026 [P] [US1] Create MenuCategory component for category sections in frontend/src/components/menu/MenuCategory.jsx
- [X] T027 [US1] Update MenuPage to display categories and availability in frontend/src/page/user/MenuPage.jsx

#### Frontend - Ordering

- [X] T028 [P] [US1] Create orderService with placeOrder API call in frontend/src/services/orderService.js
- [X] T029 [US1] Update CartPage to submit orders with table number in frontend/src/page/user/CartPage.jsx
- [X] T030 [US1] Update Home page to add table number entry form in frontend/src/page/user/Home.jsx

**Checkpoint**: ✅ User Story 1 is now fully functional and testable independently - complete ordering flow (table entry → menu browsing → cart → order submission with queue assignment)

---

## Phase 4: User Story 2 - Admin Table Management (Priority: P1)

**Goal**: Admin can open tables, monitor dining timers, view bills, print bills, and close tables

**Independent Test**: Admin opens table with customer count and buffet tier, system starts 90-minute timer, admin views/prints bill in real-time, closes table after payment

### Implementation for User Story 2

#### Backend - Tables

- [X] T031 [P] [US2] Create TableService with lifecycle methods (open, reserve, close, reset) in backend/src/services/TableService.js
- [X] T032 [P] [US2] Create tableController with all endpoints in backend/src/controllers/tableController.js
- [X] T033 [US2] Create table routes in backend/src/routes/tableRoutes.js (7 endpoints from tables-api.md)
- [X] T034 [US2] Register table routes in backend/src/server.js

#### Backend - Bills

- [X] T035 [P] [US2] Create BillingService with VAT calculation utility in backend/src/services/BillingService.js
- [X] T036 [P] [US2] Create billController with bill endpoints in backend/src/controllers/billController.js
- [X] T037 [US2] Create bill routes in backend/src/routes/billRoutes.js (6 endpoints from bills-api.md)
- [X] T038 [US2] Register bill routes in backend/src/server.js

#### Backend - Timers

- [X] T039 [US2] Create TimerService with cron job for 90-min dining timer in backend/src/services/TimerService.js
- [X] T040 [US2] Initialize cron job in backend/src/server.js (runs every 30 seconds)

#### Frontend - Table Management

- [X] T041 [P] [US2] Create tableService with API calls in frontend/src/services/tableService.js
- [X] T042 [P] [US2] Create TableCard component for table status display in frontend/src/components/table/TableCard.jsx
- [X] T043 [P] [US2] Create TableGrid component for all tables in frontend/src/components/table/TableGrid.jsx
- [X] T044 [P] [US2] Create useTableTimer hook for timer display in frontend/src/hook/useTableTimer.js
- [X] T045 [US2] Update tableManagement page with open/reserve/close actions in frontend/src/page/admin/tableManagement.jsx

#### Frontend - Billing

- [X] T046 [P] [US2] Create billService with API calls in frontend/src/services/billService.js
- [X] T047 [P] [US2] Create BillSummary component for breakdown display in frontend/src/components/bill/BillSummary.jsx
- [X] T048 [P] [US2] Create BillPrint component for printable format in frontend/src/components/bill/BillPrint.jsx
- [X] T049 [US2] Update billingManagement page with bill view/print/close in frontend/src/page/admin/billingManagement.jsx

**Checkpoint**: ✅ User Stories 1 AND 2 are now fully functional and independently testable (Customer ordering + Admin table/billing management)

---

## Phase 5: User Story 3 - Admin Order Queue Management (Priority: P1)

**Goal**: Kitchen staff view dual queues (Normal/Special), process orders in FIFO, mark as completed

**Independent Test**: Place multiple orders to both queues, kitchen staff views queues separately, marks orders completed, verifies real-time updates

### Implementation for User Story 3

#### Backend - Queue Management

- [X] T050 [P] [US3] Extend OrderService with getNormalQueue and getSpecialQueue methods in backend/src/services/OrderService.js
- [X] T051 [P] [US3] Extend orderController with completeOrder endpoint in backend/src/controllers/orderController.js
- [X] T052 [US3] Add queue routes to backend/src/routes/orderRoutes.js (GET /api/orders/queue/normal, /queue/special, PATCH /:id/complete)

#### Frontend - Queue Display

- [X] T053 [P] [US3] Extend orderService with queue API calls in frontend/src/services/orderService.js
- [X] T054 [P] [US3] Update useOrderQueue hook for dual queue polling in frontend/src/hook/useOrderQueue.js
- [X] T055 [P] [US3] Update OrderCard component with queue type display in frontend/src/components/order/OrderCard.jsx
- [X] T056 [P] [US3] Update OrderList component for queue-specific rendering in frontend/src/components/order/OrderList.jsx
- [X] T057 [US3] Update orderQueue page with dual queue view and complete action in frontend/src/page/admin/orderQueue.jsx

**Checkpoint**: ✅ All P1 user stories (MVP core) are now fully functional and independently testable! Customer ordering (Phase 3), Admin table/billing management (Phase 4), and Kitchen order queue management (Phase 5) complete.

---

## Phase 6: User Story 4 - Table Reservation with Auto-Release (Priority: P2)

**Goal**: Admin can reserve tables for 15 minutes with automatic release if customers don't arrive

**Independent Test**: Admin reserves table, system tracks 15-minute timer, table auto-releases if timer expires, or opens normally if customers arrive

### Implementation for User Story 4

#### Backend - Reservation

- [X] T058 [US4] Extend TimerService with reservation auto-release cron job in backend/src/services/TimerService.js
- [X] T059 [US4] Add reservation timer logic to cron job initialization in backend/src/server.js (already created in T040, extend)

#### Frontend - Reservation

- [X] T060 [US4] Update tableService with reserve/cancelReservation calls in frontend/src/services/tableService.js (already created in T041, extend)
- [X] T061 [US4] Update TableCard component to show reservation timer in frontend/src/components/table/TableCard.jsx (already created in T042, extend)
- [X] T062 [US4] Update tableManagement page with reserve/cancel buttons in frontend/src/page/admin/tableManagement.jsx (already created in T045, extend)
- [X] T063 [US4] Update waitlistManagement page with reservation view in frontend/src/page/admin/waitlistManagement.jsx

**Checkpoint**: ✅ User Story 4 complete (already implemented in Phase 4) - reservation with 15-min auto-release fully functional

---

## Phase 7: User Story 5 - Admin Menu Management (Priority: P2)

**Goal**: Admin can add, edit, mark unavailable, and delete menu items

**Independent Test**: Admin creates new menu item with bilingual names, marks item unavailable, deletes unused item

### Implementation for User Story 5

#### Backend - Menu CRUD

- [X] T064 [P] [US5] Create MenuService with CRUD operations in backend/src/services/MenuService.js
- [X] T065 [P] [US5] Create menuController with all endpoints in backend/src/controllers/menuController.js
- [X] T066 [US5] Create menu routes in backend/src/routes/menuRoutes.js (6 endpoints from menu-api.md)
- [X] T067 [US5] Register menu routes in backend/src/server.js

#### Frontend - Menu Management

- [X] T068 [US5] Extend menuService with CRUD API calls in frontend/src/services/menuService.js (already created in T024, extend)
- [X] T069 [US5] Update menu page with add/edit/delete/toggle availability actions in frontend/src/page/admin/menu.jsx

**Checkpoint**: ✅ User Story 5 complete and testable independently - Full menu CRUD with bilingual support, category filtering, and availability toggle

---

## Phase 8: User Story 6 - Billing with VAT Calculation (Priority: P2)

**Goal**: System calculates bills with buffet charges, special items, and VAT breakdown (7%)

**Independent Test**: Open table with customers, place orders, verify bill shows correct buffet charges + special items with VAT breakdown

**Note**: Most billing logic already implemented in Phase 4 (User Story 2). This phase adds validation and edge case handling.

### Implementation for User Story 6

- [X] T070 [US6] Add VAT calculation validation tests to BillingService in backend/src/services/BillingService.js (verify preVatSubtotal + vatAmount === total)
- [X] T071 [US6] Add edge case handling for zero special items in backend/src/services/BillingService.js
- [X] T072 [US6] Verify BillSummary component displays VAT breakdown correctly in frontend/src/components/bill/BillSummary.jsx (already created in T047, verify)

**Checkpoint**: ✅ User Story 6 complete (already implemented in Phase 4) - VAT calculation with drift adjustment fully functional

---

## Phase 9: User Story 7 - Historical Bill Access (Priority: P3)

**Goal**: Admin can access archived bills for reporting and auditing

**Independent Test**: Close multiple tables, access historical bills section, search by date/table, view complete bill details

### Implementation for User Story 7

#### Backend - Historical Bills

- [X] T073 [US7] Extend BillingService with getHistoricalBills method in backend/src/services/BillingService.js (already created in T035, extend)
- [X] T074 [US7] Extend billController with getHistoricalBills endpoint in backend/src/controllers/billController.js (already created in T036, extend)

#### Frontend - Historical Bills

- [X] T075 [US7] Extend billService with getHistoricalBills API call in frontend/src/services/billService.js (already created in T046, extend)
- [X] T076 [US7] Update billingManagement with bill history tab, search filters, and display in frontend/src/page/admin/billingManagement.jsx

**Checkpoint**: ✅ User Story 7 complete - Historical bill access with search filters (table number, date range, payment method) fully functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T077 [P] Add loading states to all API calls in frontend services (✅ VERIFIED: All services and pages have loading states)
- [X] T078 [P] Add error handling and toast notifications in frontend components (✅ VERIFIED: Comprehensive try-catch blocks with user-friendly error messages)
- [X] T079 [P] Verify responsive design on mobile/tablet/desktop breakpoints (✅ VERIFIED: md:, lg:, xl: breakpoints used throughout with grid-cols responsive layouts)
- [X] T080 [P] Verify bilingual support for all UI text (Thai/English language toggle) (✅ VERIFIED: useBilingual hook used in all components with isThai conditional rendering)
- [X] T081 Add API request logging with morgan in backend/src/server.js (already configured, verified)
- [ ] T082 Add rate limiting middleware for order endpoints in backend/src/middleware/rateLimiter.js
- [ ] T083 Optimize database indexes for query performance (Table, MenuItem, Order, Bill collections)
- [ ] T084 Run quickstart.md validation (6-step manual testing scenario)
- [ ] T085 Document API endpoints in backend/README.md
- [ ] T086 Create deployment guide for production environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - No dependencies on other stories (parallel with US1)
  - User Story 3 (Phase 5): Can start after Foundational - No dependencies on other stories (parallel with US1/US2)
  - User Story 4 (Phase 6): Extends User Story 2 (TableService, TimerService) - Start after US2 or in parallel if careful
  - User Story 5 (Phase 7): Can start after Foundational - No dependencies on other stories
  - User Story 6 (Phase 8): Extends User Story 2 (BillingService) - Start after US2 complete
  - User Story 7 (Phase 9): Extends User Story 2 (BillingService) - Start after US2 complete
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Can start after Foundational
- **User Story 2 (P1)**: Independent - Can start after Foundational (parallel with US1)
- **User Story 3 (P1)**: Independent - Can start after Foundational (parallel with US1/US2)
- **User Story 4 (P2)**: Extends US2 (TableService, TimerService) - Recommend after US2 complete
- **User Story 5 (P2)**: Independent - Can start after Foundational
- **User Story 6 (P2)**: Extends US2 (BillingService) - Start after US2 complete
- **User Story 7 (P3)**: Extends US2 (BillingService) - Start after US2 complete

### Within Each User Story

- Models before services (T006-T009 must complete before T020, T031, T035, etc.)
- Services before controllers (e.g., T020 before T021, T031 before T032)
- Controllers before routes (e.g., T021 before T022, T032 before T033)
- Routes before frontend services (e.g., T022-T023 before T024-T030)
- Frontend services before components/pages (e.g., T024 before T025-T027)

### Parallel Opportunities

- **Setup Phase**: All tasks (T001-T005) can run in parallel
- **Foundational Phase**: 
  - Models (T006-T009) can run in parallel
  - Middleware (T010-T012) can run in parallel
  - Translation setup (T013-T014) can run in parallel
  - Hooks/components (T015-T018) can run in parallel after T014
- **User Story 1 Backend**: T020, T021 can run in parallel (different files)
- **User Story 1 Frontend Menu**: T024, T025, T026 can run in parallel
- **User Story 1 Frontend Order**: T028 parallel with T024-T026
- **User Story 2 Backend**: T031-T032 (tables), T035-T036 (bills), T039 (timers) can run in parallel
- **User Story 2 Frontend**: T041-T044 (tables), T046-T048 (bills) can run in parallel
- **User Story 3 Backend**: T050, T051 can run in parallel
- **User Story 3 Frontend**: T053, T054, T055, T056 can run in parallel
- **User Story 5 Backend**: T064, T065 can run in parallel
- **Polish Phase**: T077, T078, T079, T080, T082, T083 can run in parallel

---

## Parallel Example: User Story 1 Backend

```bash
# Launch all backend tasks for User Story 1 together:
Task: "Create OrderService with placeOrder and queue assignment logic in backend/src/services/OrderService.js"
Task: "Create orderController with createOrder endpoint in backend/src/controllers/orderController.js"
```

---

## Parallel Example: User Story 1 Frontend

```bash
# Launch all frontend tasks for User Story 1 together:
Task: "Create MenuService with getMenuItems API call in frontend/src/services/menuService.js"
Task: "Create MenuItemCard component with bilingual display in frontend/src/components/menu/MenuItemCard.jsx"
Task: "Create MenuCategory component for category sections in frontend/src/components/menu/MenuCategory.jsx"
Task: "Create orderService with placeOrder API call in frontend/src/services/orderService.js"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T019) - CRITICAL
3. Complete Phase 3: User Story 1 (T020-T030) - Customer Ordering
4. Complete Phase 4: User Story 2 (T031-T049) - Table & Billing Management
5. Complete Phase 5: User Story 3 (T050-T057) - Order Queue Management
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo MVP

**MVP Scope**: 86 tasks total
- Setup: 5 tasks
- Foundational: 14 tasks
- User Story 1: 11 tasks
- User Story 2: 19 tasks
- User Story 3: 8 tasks
- Validation: Manual testing per quickstart.md

### Incremental Delivery

1. Complete Setup + Foundational (T001-T019) → Foundation ready
2. Add User Story 1 (T020-T030) → Test independently → Deploy/Demo
3. Add User Story 2 (T031-T049) → Test independently → Deploy/Demo
4. Add User Story 3 (T050-T057) → Test independently → Deploy/Demo (MVP!)
5. Add User Story 4 (T058-T063) → Test independently → Deploy/Demo
6. Add User Story 5 (T064-T069) → Test independently → Deploy/Demo
7. Add User Story 6 (T070-T072) → Test independently → Deploy/Demo
8. Add User Story 7 (T073-T076) → Test independently → Deploy/Demo
9. Add Polish (T077-T086) → Final validation → Production

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T019)
2. Once Foundational is done:
   - Developer A: User Story 1 (T020-T030)
   - Developer B: User Story 2 (T031-T049)
   - Developer C: User Story 3 (T050-T057)
3. Stories complete and integrate independently
4. Move to P2 stories (US4, US5, US6) in parallel
5. Finish with US7 and Polish

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **No tests included**: Per spec.md requirements (no test framework requested)
- **Edge cases**: Handled in service layer logic (OrderService queue assignment, BillingService VAT validation)
- **Real-time updates**: Polling strategy (2s intervals) implemented in frontend hooks
- **Timers**: Server-authoritative with cron job (30s interval) for auto-release

---

## Task Count Summary

- **Total Tasks**: 86
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 14 tasks
- **User Story 1 (P1)**: 11 tasks
- **User Story 2 (P1)**: 19 tasks
- **User Story 3 (P1)**: 8 tasks
- **User Story 4 (P2)**: 6 tasks
- **User Story 5 (P2)**: 6 tasks
- **User Story 6 (P2)**: 3 tasks
- **User Story 7 (P3)**: 4 tasks
- **Polish (Phase 10)**: 10 tasks

**MVP Scope (P1 only)**: 57 tasks (Setup + Foundational + US1 + US2 + US3)

**Parallelizable Tasks**: 42 tasks marked with [P] (48.8% of total)

---

**Status**: Task breakdown complete ✅
