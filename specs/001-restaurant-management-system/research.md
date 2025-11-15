# Research: MOOMOO Restaurant Management System

**Phase**: 0 (Outline & Research)  
**Date**: 2025-11-15  
**Purpose**: Resolve all NEEDS CLARIFICATION items from Technical Context and establish best practices for implementation

## Unknowns from Technical Context

### 1. Testing Framework Selection

**Unknown**: No test framework currently configured for backend or frontend

**Research Task**: Determine appropriate testing frameworks for Node.js/Express backend and React frontend

**Decision**: 
- **Backend**: Jest v29+ with Supertest for API testing
- **Frontend**: Vitest + React Testing Library

**Rationale**:
- Jest is industry standard for Node.js testing with excellent Mongoose mocking support
- Supertest integrates seamlessly with Express for HTTP endpoint testing
- Vitest is Vite-native (already using Vite 7.1), faster than Jest for frontend
- React Testing Library aligns with React 19 best practices (user-centric testing)
- Both frameworks support ES Modules (matches project's `"type": "module"`)

**Alternatives Considered**:
- Mocha/Chai: Rejected due to more verbose setup and less integrated ecosystem
- Jest for frontend: Rejected because Vitest has better Vite integration and faster execution
- Cypress for integration: Deferred to future iteration (E2E testing not in MVP scope)

**Implementation Notes**:
- Backend: Install `jest`, `supertest`, `@types/jest` as devDependencies
- Frontend: Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- Create `jest.config.js` for backend, `vitest.config.js` for frontend
- Add test scripts to package.json: `"test": "jest"` (backend), `"test": "vitest"` (frontend)

---

### 2. Real-Time Update Strategy

**Unknown**: How to implement real-time updates for order queue, table status, and bill updates

**Research Task**: Evaluate polling vs WebSocket for real-time operations

**Decision**: 
- **Polling** with 2-second intervals for MVP (Phase 1-2)
- **WebSocket (Socket.io)** for future optimization (Phase 3)

**Rationale**:
- Polling is simpler to implement and debug, aligns with "start simple" principle
- 2-second polling meets SC-003 requirement (orders appear within 2 seconds)
- 10 concurrent tables × 3 components (queue, table status, bill) = 30 polling requests/2s = 15 req/s (acceptable load)
- WebSocket adds complexity (connection management, reconnection logic, state sync) not justified for 10-table scale
- Polling works reliably across all networks (firewalls, proxies) without special configuration

**Alternatives Considered**:
- Server-Sent Events (SSE): Rejected due to limited browser support and unidirectional nature
- Long polling: Rejected as it offers no advantage over short polling at this scale
- WebSocket (Socket.io): Deferred to future optimization when scale exceeds 50 concurrent users

**Implementation Notes**:
- Frontend: Use `setInterval` in hooks (useOrderQueue, useTableTimer) with cleanup
- Backend: Add `updatedAt` timestamp to Order, Table, Bill models for change detection
- Consider `If-Modified-Since` headers to reduce response payload when no changes
- Monitor performance: If polling causes issues, switch to WebSocket in Phase 3

---

### 3. Responsive Design Breakpoints

**Unknown**: Specific breakpoints for mobile/tablet/desktop layouts not defined in spec

**Research Task**: Define Tailwind CSS breakpoints aligned with constitution principle V

**Decision**:
- **Mobile**: Default (< 640px) - Customer menu browsing, vertical card layouts
- **Tablet**: `md:` (641px - 1024px) - Admin table management, side-by-side layouts
- **Desktop**: `lg:` (> 1024px) - Full admin dashboard, multi-column layouts

**Rationale**:
- Tailwind CSS default breakpoints align with constitution's mobile/tablet/desktop definitions
- Customer interface prioritizes mobile (most customers browse on phones)
- Admin interface prioritizes tablet (staff use tablets for tableside management)
- Desktop provides maximum information density for back-office operations

**Alternatives Considered**:
- Custom breakpoints: Rejected as Tailwind defaults are industry-standard and well-tested
- Mobile-only approach: Rejected as admin needs tablet/desktop for complex operations

**Implementation Notes**:
- Customer pages (MenuPage, OrderPage): Default mobile-first, `md:grid-cols-2`, `lg:grid-cols-3`
- Admin pages (tableManagement, orderQueue): `md:flex`, `lg:grid-cols-3` for multi-column layouts
- Touch targets: Minimum 44x44px on mobile (Tailwind `p-3` for buttons)
- Test on devices: iPhone SE (375px), iPad (768px), Desktop (1440px)

---

### 4. Timer Implementation Strategy

**Unknown**: How to implement 90-minute dining timer and 15-minute reservation timer with ±10 second accuracy

**Research Task**: Evaluate client-side vs server-side timer strategies

**Decision**:
- **Hybrid approach**: Server-side authoritative time, client-side countdown display

**Rationale**:
- Server stores `openedAt` timestamp (ISO 8601) in Table document
- Client calculates remaining time from server timestamp (avoids clock skew)
- Server checks timers on every API call (table status, bill fetch) and triggers actions
- Background cron job (node-cron) checks timers every 30 seconds for auto-release
- Accuracy: Server timestamp precision + 30s cron = within ±10s requirement (SC-007)

**Alternatives Considered**:
- Client-only timers: Rejected due to clock drift, tab sleep, and unreliable execution
- Server-only timers: Rejected as it requires constant server push (WebSocket overhead)
- Database TTL indexes: Rejected as MongoDB TTL runs every 60 seconds (exceeds ±10s requirement)

**Implementation Notes**:
- Backend: Install `node-cron`, create `TimerService.js` with cron job
- Table model fields: `openedAt` (Date), `reservedAt` (Date), `reservationExpiresAt` (Date)
- Frontend: `useTableTimer` hook calculates `Math.max(0, expiryTime - Date.now())` every second
- Notification: When remaining time < 15 minutes, show warning (FR-010)
- Auto-release: Cron job checks `reservationExpiresAt < Date.now()` and sets status to "Available"

---

### 5. VAT Calculation Precision

**Unknown**: How to ensure VAT calculation at 7% handles rounding correctly for Thai tax compliance

**Research Task**: Research Thai VAT calculation standards and JavaScript precision handling

**Decision**:
- **Formula**: `preVatSubtotal = total / 1.07`, `vatAmount = total - preVatSubtotal`
- **Rounding**: Round to 2 decimal places using `Math.round(value * 100) / 100`
- **Validation**: Ensure `preVatSubtotal + vatAmount = total` (no rounding drift)

**Rationale**:
- Thai VAT is included in displayed prices (259 THB, 299 THB already include 7% VAT)
- Must extract VAT from total: Total = Base × 1.07, so Base = Total / 1.07
- JavaScript `toFixed(2)` returns string; use Math.round for numeric precision
- 2 decimal places matches Thai Baht currency standard (no smaller denominations)
- Edge case: Ensure rounding doesn't cause total to mismatch (validate before saving)

**Alternatives Considered**:
- Calculate VAT as 7% of base: Rejected as prices already include VAT (work backwards)
- Use decimal.js library: Rejected as overkill for 2-decimal precision (native Math.round sufficient)
- Round at display only: Rejected as stored values must be precise for auditing

**Implementation Notes**:
- Create `calculateVAT(total)` utility in `BillingService.js`
- Unit tests: Verify edge cases (0 THB, 0.01 THB, large amounts like 10000 THB)
- Example: 718 THB total → preVat = 670.09 THB, VAT = 47.91 THB (from spec acceptance scenario)
- Store all monetary values as Numbers in MongoDB (not strings)

---

### 6. Bilingual Data Storage

**Unknown**: How to store Thai/English menu item names and UI translations

**Research Task**: Evaluate storage strategies for bilingual content

**Decision**:
- **Menu Items**: Store both languages in model fields (`nameThai`, `nameEnglish`, `descriptionThai`, `descriptionEnglish`)
- **UI Text**: Use i18n library (react-i18next) with JSON translation files

**Rationale**:
- Menu items are database entities requiring both languages for search/filtering
- Storing as separate fields enables queries like "find items where nameThai contains X"
- UI text (buttons, labels, errors) is static and better suited for translation files
- react-i18next is industry standard with 100% React 19 compatibility
- Separate concerns: Database for content, i18n for interface

**Alternatives Considered**:
- Single `name` field with JSON: Rejected as it complicates queries and indexing
- All text in i18n files: Rejected as menu items are dynamic user-generated content
- Separate MenuItem documents per language: Rejected due to data duplication and sync issues

**Implementation Notes**:
- MenuItem model: `nameThai: String, nameEnglish: String, descriptionThai: String, descriptionEnglish: String`
- Frontend: Install `react-i18next`, `i18next`
- Create `frontend/src/locales/th.json` and `en.json` for UI text
- Language switcher: Store preference in localStorage, default to Thai
- Admin forms: Provide separate input fields for Thai and English names

---

### 7. Order Queue Data Structure

**Unknown**: How to efficiently manage two separate queues (Normal and Special) with FIFO processing

**Research Task**: Evaluate data structure for dual queue management

**Decision**:
- **Single Order collection** with `queueType` field ("Normal" | "Special")
- **Queries**: Filter by `queueType` and sort by `createdAt` ASC for FIFO
- **Indexing**: Compound index on `{queueType: 1, status: 1, createdAt: 1}`

**Rationale**:
- Single collection simplifies data model (one schema, one controller)
- Filtering by `queueType` is efficient with proper indexing
- FIFO guaranteed by sorting on `createdAt` (MongoDB IDs also encode timestamp)
- Status field enables filtering pending vs completed orders
- No need for separate NormalQueue/SpecialQueue collections (over-engineering)

**Alternatives Considered**:
- Separate collections: Rejected due to code duplication and harder cross-queue analytics
- Array fields in Table document: Rejected as it prevents global queue view
- Redis queue: Rejected as overkill for 10 tables (MongoDB query is sufficient)

**Implementation Notes**:
- Order model fields: `queueType: {type: String, enum: ['Normal', 'Special']}`
- Status field: `status: {type: String, enum: ['Pending', 'Completed']}`
- Index: `Order.index({queueType: 1, status: 1, createdAt: 1})`
- Query: `Order.find({queueType: 'Normal', status: 'Pending'}).sort({createdAt: 1})`
- Frontend: Separate components for each queue, but same API endpoint with filter params

---

## Best Practices Summary

### Technology Decisions Matrix

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| Backend Testing | Jest + Supertest | ES Module support, Express integration |
| Frontend Testing | Vitest + RTL | Vite-native, React 19 best practices |
| Real-Time Updates | Polling (2s) | Simplicity, meets performance requirements |
| Timers | Server-authoritative + node-cron | Accuracy, reliability, no client drift |
| Responsive Design | Tailwind breakpoints | Industry standard, constitution-aligned |
| VAT Calculation | Math.round precision | Thai tax compliance, 2-decimal accuracy |
| Bilingual Storage | Model fields + i18n | Content vs UI separation |
| Queue Management | Single collection + filter | Efficient, simple, scalable |

### Implementation Priority

**Phase 1 (MVP - P1 Features)**:
1. Polling-based real-time updates
2. Server-side timers with cron jobs
3. Bilingual model fields
4. Single-collection queue structure

**Phase 2 (Enhanced - P2 Features)**:
5. VAT calculation utilities
6. Responsive breakpoint implementation
7. i18n integration for UI text

**Phase 3 (Future Optimization)**:
8. Jest/Vitest test suites
9. WebSocket migration (if scale requires)
10. Performance monitoring and optimization

### Risk Mitigation

- **Timer accuracy**: Cron job frequency (30s) + server timestamp ensures ±10s requirement
- **Polling overhead**: Monitor request volume; 15 req/s is well within Express capacity
- **VAT rounding**: Unit tests validate all edge cases before production
- **Queue ordering**: MongoDB timestamp precision guarantees FIFO within millisecond accuracy

---

**Status**: All NEEDS CLARIFICATION items resolved ✅  
**Next Phase**: Phase 1 - Design (data-model.md, contracts/, quickstart.md)
