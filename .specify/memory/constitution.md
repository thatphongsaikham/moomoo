<!--
  SYNC IMPACT REPORT - Constitution Update
  ================================================
  Version Change: 0.0.0 → 1.0.0 (Initial Release)
  Ratification Date: 2025-11-15
  Last Amended: 2025-11-15
  
  Modified Principles:
  - NEW: I. Full-Stack Integration (Frontend ↔ Backend)
  - NEW: II. User-Centric Design (Dual Interface)
  - NEW: III. Real-Time Operations
  - NEW: IV. Bilingual Support (Thai/English)
  - NEW: V. Responsive Design
  - NEW: VI. Code Organization & Modularity
  
  Added Sections:
  - Technology Stack Standards
  - Development Workflow
  - Governance
  
  Templates Requiring Updates:
  ✅ plan-template.md - Updated with web app structure validation
  ✅ spec-template.md - Updated with restaurant-specific requirements
  ✅ tasks-template.md - Updated with frontend/backend task organization
  
  Follow-up TODOs:
  - None - All placeholders filled
  
  Commit Message:
  docs: establish constitution v1.0.0 (initial restaurant management system governance)
-->

# MOOMOO Restaurant Management System Constitution

**Project**: มูคระทา (MOOMOO) - Thai BBQ/Hotpot Restaurant Management System

## Core Principles

### I. Full-Stack Integration (Frontend ↔ Backend)

The system MUST maintain seamless integration between frontend and backend components:

- All frontend API calls MUST use defined service layers (menuService.js, userService.js)
- Backend MUST expose RESTful endpoints with consistent response formats
- Changes to API contracts MUST be reflected in both frontend services and backend routes
- Error handling MUST be consistent: backend returns structured errors → frontend displays user-friendly messages
- State management MUST be predictable: API responses drive UI state updates

**Rationale**: As a restaurant management system serving real-time orders, tight coupling between frontend and backend ensures data consistency and prevents order processing errors that could impact customer experience.

### II. User-Centric Design (Dual Interface)

The system MUST provide distinct, optimized experiences for two user types:

- **Customer Interface** (`/` routes via UserLayout): Menu browsing, ordering, table reservation, order history
- **Admin Interface** (`/admin` routes via AdminLayout): Order queue management, table management, billing, waitlist
- Each interface MUST be independently navigable without cross-contamination
- Design language MUST be consistent: Black/red color scheme, classic typography, glass morphism effects
- Routing MUST clearly separate concerns: user routes at root level, admin routes under `/admin` prefix

**Rationale**: Restaurant staff and customers have fundamentally different needs. Mixing interfaces creates confusion and slows operations during busy service periods.

### III. Real-Time Operations

The system MUST support real-time data updates for time-sensitive operations:

- Order queue MUST display current pending orders without manual refresh
- Table status changes MUST propagate to all relevant views
- Order status updates (pending → done) MUST be immediately visible
- Admin panels MUST show live statistics (total orders, active tables, revenue)
- Order completion timestamps MUST be accurate and timezone-aware

**Rationale**: Restaurant operations are time-critical. Delayed order information can result in poor service quality, incorrect billing, and customer dissatisfaction.

### IV. Bilingual Support (Thai/English)

All user-facing text MUST be presented in both Thai and English:

- UI labels, buttons, and navigation MUST display Thai (primary) with English context
- Menu items MUST support both Thai and English names
- Error messages and notifications MUST be bilingual
- Admin interface MUST maintain bilingual consistency
- Date/time formatting MUST use Thai locale standards where appropriate

**Rationale**: Serves Thai-speaking customers and staff while remaining accessible to international customers and future expansion.

### V. Responsive Design

The system MUST function seamlessly across all device sizes:

- Mobile-first approach: Design for phones, scale up to tablets and desktops
- Breakpoints: Mobile (< 640px), Tablet (641px-1024px), Desktop (> 1024px)
- Touch-friendly targets: Minimum 44x44px for interactive elements on mobile
- Navigation MUST adapt: Collapsible menus on mobile, full navigation on desktop
- Admin panels MUST be usable on tablets for tableside order management

**Rationale**: Staff use tablets for order management while customers often browse menus on phones. Multi-device support is essential for modern restaurant operations.

### VI. Code Organization & Modularity

Code MUST be organized following established architectural patterns:

- **Backend**: Models → Services → Controllers → Routes separation
- **Frontend**: Components (reusable) → Pages (route-specific) → Services (API) → Hooks (logic)
- Related files MUST be grouped by feature (e.g., order/, user/, admin/)
- Shared utilities and middleware MUST be clearly identified
- Configuration MUST be centralized (db.js, environment variables)
- No business logic in route handlers or components - MUST be extracted to services

**Rationale**: As restaurant features expand (delivery, loyalty programs, analytics), clear separation of concerns prevents technical debt and enables parallel development.

## Technology Stack Standards

The following technologies define the project foundation and MUST be maintained consistently:

### Backend Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcryptjs for password hashing
- **Middleware**: cors, cookie-parser, morgan (logging), express-async-handler
- **Development**: nodemon for hot reload

### Frontend Stack

- **Framework**: React v19.x with React Router DOM v7.x
- **Build Tool**: Vite v7.x
- **Styling**: Tailwind CSS v4.x with custom utilities
- **HTTP Client**: Axios v1.x
- **Icons**: Lucide React
- **Code Quality**: ESLint v9.x

### Development Standards

- **Module System**: ES Modules (type: "module" in package.json) for both frontend and backend
- **Code Style**: ESLint rules enforced, consistent formatting
- **Environment Configuration**: dotenv for backend, Vite env vars for frontend
- **Version Control**: Git with meaningful commit messages
- **Package Management**: npm (no mixing with yarn/pnpm)

### Prohibited Patterns

- No inline styles in JSX (use Tailwind utilities or CSS modules)
- No direct DOM manipulation (React manages virtual DOM)
- No blocking database operations (use async/await with proper error handling)
- No hardcoded URLs (use environment variables for API endpoints)
- No console.log in production code (use morgan/structured logging)

**Rationale**: Technology consistency prevents dependency conflicts, ensures team members can context-switch between frontend/backend, and simplifies deployment and maintenance.

## Development Workflow

### Feature Development Process

1. **Specification**: Document requirements in `.specify/specs/[feature]/spec.md`
2. **Planning**: Generate implementation plan using `/speckit.plan`
3. **Task Breakdown**: Create task list with `/speckit.tasks`
4. **Implementation**: Follow task order, commit frequently
5. **Testing**: Verify functionality in both user and admin interfaces
6. **Review**: Check constitution compliance before merge

### File Creation Standards

- **Backend Routes**: `backend/src/routes/[resource]Routes.js` exports router
- **Backend Controllers**: `backend/src/controllers/[resource]Controller.js` handles logic
- **Backend Models**: `backend/src/models/[Entity].js` defines schema
- **Frontend Pages**: `frontend/src/page/[user|admin]/[PageName].jsx` for route components
- **Frontend Components**: `frontend/src/components/[category]/[ComponentName].jsx` for reusables
- **Frontend Services**: `frontend/src/services/[resource]Service.js` for API calls

### Code Review Checklist

- [ ] Follows dual-interface principle (user/admin separation maintained)
- [ ] API contracts match between frontend service and backend route
- [ ] Bilingual text included (Thai/English)
- [ ] Responsive design verified (mobile/tablet/desktop)
- [ ] Error handling implemented (backend + frontend)
- [ ] No business logic in components/routes (extracted to services)
- [ ] Environment variables used for configuration
- [ ] ESLint passes with no warnings

### Constitution Compliance Gates

**Phase 0 - Before Research**:

- [ ] Feature specification includes both user and admin interface requirements (if applicable)
- [ ] Bilingual requirements documented
- [ ] Responsive design considerations noted

**Phase 1 - After Design**:

- [ ] API contracts defined for frontend ↔ backend integration
- [ ] Component architecture respects user/admin separation
- [ ] Real-time update strategy documented (if applicable)

**Phase 2 - Before Implementation**:

- [ ] Tasks organized by frontend/backend with clear dependencies
- [ ] Modular code organization plan follows backend/frontend structure standards

## Governance

### Amendment Process

1. **Proposal**: Document proposed change with rationale
2. **Impact Analysis**: Identify affected templates, code, and dependencies
3. **Sync Plan**: Update constitution.md, templates, and related documentation
4. **Version Bump**: Follow semantic versioning (MAJOR.MINOR.PATCH)
   - **MAJOR**: Principle removal, architectural changes, technology stack changes
   - **MINOR**: New principle added, expanded guidelines, new standards
   - **PATCH**: Clarifications, typo fixes, wording improvements
5. **Validation**: Re-check existing features for compliance with new rules

### Versioning Policy

- Version format: **MAJOR.MINOR.PATCH**
- All amendments MUST update `Last Amended` date to current date (YYYY-MM-DD)
- `Ratified` date MUST remain unchanged (represents initial adoption)
- Sync Impact Report MUST be added as HTML comment at top of file

### Complexity Justification

If a feature requires violating core principles, it MUST be documented:

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *Example: Adding GraphQL alongside REST* | *Complex reporting requirements* | *REST endpoint chaining insufficient for nested data* |

Such violations require explicit approval and MUST be revisited in future refactoring.

### Compliance Review

- All new features MUST reference this constitution during planning phase
- Template updates (plan-template.md, spec-template.md, tasks-template.md) MUST align with principles
- Constitution principles supersede ad-hoc development practices
- When in doubt, favor simplicity and user experience over technical elegance

**Version**: 1.0.0 | **Ratified**: 2025-11-15 | **Last Amended**: 2025-11-15
