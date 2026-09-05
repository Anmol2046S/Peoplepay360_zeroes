# PeoplePay360

PeoplePay360 is a robust, modular, and reliable multi-tenant payroll engine designed to run end-to-end payroll cycles precisely and securely. Built during a 24-hour hackathon, this repository strips away unnecessary bloat to deliver a pure, transactionally-safe, scalable backend.

## Tech Stack
- **Framework**: Fastify (Node.js) - Chosen for maximum throughput and minimal overhead.
- **Language**: TypeScript - Strict mode enforced across all layers.
- **Database**: PostgreSQL with Prisma ORM v7 - Leveraging advanced adapter capabilities and deep type safety.
- **Math**: `decimal.js` for zero-drift financial calculations, `expr-eval` for custom formula resolution.
- **Security**: `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`, BCrypt, JWT, granular RBAC.

## Architecture: Modular Monolith
The codebase is structured into isolated domain boundaries. This guarantees easy extraction to microservices later without suffering the distributed computing tax today.

### Core Modules:
1. **Auth (`src/modules/auth`)**: JWT issuance and Role-Based Access Control verification.
2. **Employees (`src/modules/employees`)**: Core HR records.
3. **Contracts (`src/modules/contracts`)**: Time-bound, non-overlapping active engagements.
4. **Attendance & Time-Off (`src/modules/attendance` & `src/modules/timeoff`)**: Safe allocation deduction and prorated standard days logic.
5. **Payroll Engine (`src/modules/payroll`)**:
   - `salary-structures`: Templates linking categories of compensation.
   - `salary-rules`: Sequentially evaluated math (Fixed, Percentage, Formula).
   - `payruns`: Initialization and Approval state machines.
   - `engine`: The immutable calculation loop resolving dependencies.
6. **Reports (`src/modules/reports`)**: Fast aggregations of liability.

## Key Engineering Decisions
- **Zero-Floating-Point**: JS `number` is banned for money. Everything uses `Decimal.js`.
- **Atomic Operations**: All state changes (e.g. deductions, finalization of payslips) run in strict Prisma `$transaction` blocks.
- **State Machine Protection**: Payruns cannot be calculated if `APPROVED`; payslips are regenerated cleanly on recalculation while `DRAFT`.
- **Immutable Audit Logs**: Key governance actions (`APPROVE`, `FINALIZE`) are synchronously written to an append-only `AuditLog` table.

## Quickstart

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start PostgreSQL Database**:
   ```bash
   docker-compose up -d
   ```
3. **Sync Schema**:
   ```bash
   npx prisma db push
   ```
4. **Seed Demo Data**:
   ```bash
   npx prisma db seed
   ```
   *Seed creates:*
   - Organization: TechCorp Industries
   - Admin Login: `admin@techcorp.com` / `password123`
   - Employees: Alice Smith, Bob Jones
   - Contracts: Active contracts mapped to a 'Standard Developer' salary structure.
   
5. **Run the Server**:
   ```bash
   npm run dev
   ```

## Demo Flow
1. Login with Admin credentials to get JWT.
2. POST `/api/v1/payroll/payruns` to initialize the cycle.
3. POST `/api/v1/payroll/engine/:id/calculate` to run the math.
4. GET `/api/v1/reports/payruns/:id/summary` to verify totals.
5. POST `/api/v1/payroll/payruns/:id/submit` -> `approve` -> `finalize` to commit the run.

## Author
Built with extreme focus and precision.
