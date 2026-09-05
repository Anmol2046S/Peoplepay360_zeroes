# PeoplePay360 / HRMS OXP - Backend System Architecture & API Documentation

## 1. Executive Summary & Technology Stack

The **PeoplePay360 / HRMS OXP Backend** is built as an enterprise-grade RESTful web API service designed to power an integrated Human Resource and Payroll Operations Platform. It manages the complete lifecycle of employees, contracts, working schedules, daily attendance records, leave allocations/requests, configurable salary calculation rules, batch payrun execution, PDF payslip generation, bulk email delivery, and multi-dimensional analytics.

### Core Technology Stack
- **Runtime Environment**: Node.js (v20+ LTS)
- **Language**: TypeScript (v5.0+)
- **Web Framework**: Express.js (v4.19+)
- **Database**: PostgreSQL (v15+)
- **Object-Relational Mapping (ORM)**: Prisma ORM (v5.12+)
- **Authentication & Security**: JSON Web Tokens (JWT), bcryptjs (Password hashing), Helmet (HTTP security headers), CORS, Express Rate Limit
- **Data Validation**: Zod (v3.23+) schema validation
- **Document & Media Services**: PDFKit (v0.15+) for server-side PDF payslip rendering
- **Email Delivery Service**: Nodemailer (v6.9+) for bulk background email dispatch
- **Containerization & Deployment**: Docker, Docker Compose

---

## 2. Complete Backend Folder Structure

```
backend/
├── docker/
│   └── Dockerfile
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   ├── jwt.ts
│   │   └── mailer.ts
│   ├── controllers/
│   │   ├── attendance.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── contract.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── employee.controller.ts
│   │   ├── payrun.controller.ts
│   │   ├── payslip.controller.ts
│   │   ├── salaryRule.controller.ts
│   │   ├── salaryStructure.controller.ts
│   │   ├── schedule.controller.ts
│   │   ├── timeOff.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   └── validate.middleware.ts
│   ├── models/
│   │   └── types.ts
│   ├── routes/
│   │   ├── attendance.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── contract.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── employee.routes.ts
│   │   ├── index.ts
│   │   ├── payrun.routes.ts
│   │   ├── payslip.routes.ts
│   │   ├── salaryRule.routes.ts
│   │   ├── salaryStructure.routes.ts
│   │   ├── schedule.routes.ts
│   │   ├── timeOff.routes.ts
│   │   └── user.routes.ts
│   ├── services/
│   │   ├── attendance.service.ts
│   │   ├── auth.service.ts
│   │   ├── contract.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── employee.service.ts
│   │   ├── email.service.ts
│   │   ├── payrun.service.ts
│   │   ├── pdf.service.ts
│   │   ├── salaryEngine.service.ts
│   │   ├── schedule.service.ts
│   │   ├── timeOff.service.ts
│   │   └── user.service.ts
│   ├── utils/
│   │   ├── apiResponse.ts
│   │   ├── formulaEvaluator.ts
│   │   ├── logger.ts
│   │   └── payrunWarnings.ts
│   └── app.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Responsibility Breakdown
- `prisma/schema.prisma`: Single source of truth for database schema definitions, relations, indices, and enums.
- `src/controllers/`: Express request handlers responsible for parsing input, delegating to services, and returning formatted JSON responses.
- `src/services/`: Pure business logic tier handling database queries via Prisma, complex payroll rule evaluation, PDF creation, and authorization validations.
- `src/middleware/`: Express middleware for JWT authentication, Role-Based Access Control (RBAC), Zod request validation, rate limiting, and global error handling.
- `src/routes/`: Modular REST API endpoint declarations binding paths, middleware, and controller methods.
- `src/utils/formulaEvaluator.ts`: Custom math & logic expression engine to calculate salary rules defined in percentage or custom formula syntax.
- `src/utils/payrunWarnings.ts`: Automated validation rules generator that detects missing bank data, duplicate payslips, unvalidated drafts, and expiring contracts before payrun completion.

---

## 3. Database Architecture & Prisma ORM Schema

The database model is designed around an **Employee-centric relational graph**. The `Employee` model is connected to `User` accounts, `Contract` histories, `WorkingSchedule` rules, daily `Attendance` punches, `TimeOffAllocation` balances, `TimeOffRequest` leaves, and generated `Payslip` records.

### Complete `schema.prisma` Definition

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SystemRole {
  EMPLOYEE
  HR_MANAGER
  HR_PAYROLL_USER
  HR_PAYROLL_MANAGER
  ADMIN
}

enum AccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum ContractStatus {
  DRAFT
  RUNNING
  EXPIRED
  CANCELLED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  OVERTIME
}

enum TimeOffUnit {
  DAYS
  HOURS
}

enum TimeOffApprovalType {
  MANAGER
  OFFICER
  NO_VALIDATION
}

enum TimeOffRequestStatus {
  DRAFT
  TO_APPROVE
  APPROVED
  REFUSED
}

enum TimeOffAllocationStatus {
  DRAFT
  TO_APPROVE
  APPROVED
  REFUSED
}

enum SalaryRuleCategory {
  BASIC
  ALLOWANCE
  GROSS
  DEDUCTION
  NET
}

enum ComputationMethod {
  FIXED
  PERCENTAGE
  FORMULA
}

enum PayrunStatus {
  DRAFT
  COMPUTED
  VALIDATED
  PAID
}

enum PayslipStatus {
  DRAFT
  DONE
  CANCELLED
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  name         String
  role         SystemRole    @default(EMPLOYEE)
  status       AccountStatus @default(ACTIVE)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  employeeId   String?       @unique
  employee     Employee?     @relation(fields: [employeeId], references: [id], onDelete: SetNull)

  auditLogs    AuditLog[]

  @@map("users")
}

model Department {
  id          String     @id @default(uuid())
  name        String     @unique
  code        String     @unique
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  employees   Employee[]
  contracts   Contract[]

  @@map("departments")
}

model WorkingSchedule {
  id           String        @id @default(uuid())
  name         String
  company      String        @default("My Company")
  daysPerWeek  Int           @default(5)
  hoursPerWeek Float         @default(40.0)
  timezone     String        @default("Asia/Kolkata")
  status       AccountStatus @default(ACTIVE)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  days         ScheduleDay[]
  employees    Employee[]
  contracts    Contract[]

  @@map("working_schedules")
}

model ScheduleDay {
  id         String          @id @default(uuid())
  scheduleId String
  schedule   WorkingSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  dayOfWeek  String          // MONDAY, TUESDAY, etc.
  startTime  String          // "09:00"
  endTime    String          // "18:00"
  breakHours Float           @default(1.0)
  workHours  Float           @default(8.0)

  @@map("schedule_days")
}

model Employee {
  id                String          @id @default(uuid())
  employeeCode      String          @unique
  firstName         String
  lastName          String
  workEmail         String          @unique
  workPhone         String?
  jobPosition       String
  status            AccountStatus   @default(ACTIVE)
  workLocation      String          @default("Mumbai")
  bankAccountNumber String?
  bankName          String?
  ifscCode          String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  departmentId      String
  department        Department      @relation(fields: [departmentId], references: [id])
  
  managerId         String?
  manager           Employee?       @relation("ManagerSubordinates", fields: [managerId], references: [id])
  subordinates      Employee[]      @relation("ManagerSubordinates")

  workingScheduleId String?
  workingSchedule   WorkingSchedule? @relation(fields: [workingScheduleId], references: [id])

  user              User?
  contracts         Contract[]
  attendances       Attendance[]
  allocations       TimeOffAllocation[]
  leaveRequests     TimeOffRequest[]
  payslips          Payslip[]

  @@map("employees")
}

model Contract {
  id                 String            @id @default(uuid())
  contractReference  String            @unique // e.g. CON/2026/0042
  startDate          DateTime
  endDate            DateTime?
  monthlyWage        Float
  status             ContractStatus    @default(DRAFT)
  structureTypeId    String?
  salaryStructure    SalaryStructure?  @relation(fields: [salaryStructureId], references: [id])
  salaryStructureId  String?
  notes              String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  employeeId         String
  employee           Employee          @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  departmentId       String?
  department         Department?       @relation(fields: [departmentId], references: [id])

  workingScheduleId  String?
  workingSchedule    WorkingSchedule?  @relation(fields: [workingScheduleId], references: [id])

  payslips           Payslip[]

  @@map("contracts")
}

model Attendance {
  id           String           @id @default(uuid())
  date         DateTime
  checkIn      DateTime
  checkOut     DateTime?
  workedHours  Float            @default(0.0)
  overtimeHours Float           @default(0.0)
  status       AttendanceStatus @default(PRESENT)
  notes        String?
  isManualEdit Boolean          @default(false)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  employeeId   String
  employee     Employee         @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@unique([employeeId, date])
  @@map("attendances")
}

model TimeOffType {
  id                 String              @id @default(uuid())
  name               String              @unique // Paid Time Off, Sick Leave, Comp Off
  unit               TimeOffUnit         @default(DAYS)
  requiresAllocation Boolean             @default(true)
  approvalType       TimeOffApprovalType @default(MANAGER)
  displayColor       String              @default("#3B82F6")
  status             AccountStatus       @default(ACTIVE)
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  allocations        TimeOffAllocation[]
  requests           TimeOffRequest[]

  @@map("time_off_types")
}

model TimeOffAllocation {
  id            String                  @id @default(uuid())
  allocatedDays Float
  takenDays     Float                   @default(0.0)
  remainingDays Float
  validityYear  Int                     @default(2026)
  description   String?
  status        TimeOffAllocationStatus @default(DRAFT)
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @updatedAt

  employeeId    String
  employee      Employee                @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  timeOffTypeId String
  timeOffType   TimeOffType             @relation(fields: [timeOffTypeId], references: [id])

  requests      TimeOffRequest[]

  @@map("time_off_allocations")
}

model TimeOffRequest {
  id           String               @id @default(uuid())
  startDate    DateTime
  endDate      DateTime
  durationDays Float
  reason       String?
  status       TimeOffRequestStatus @default(DRAFT)
  approverName String?
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  employeeId   String
  employee     Employee             @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  timeOffTypeId String
  timeOffType  TimeOffType          @relation(fields: [timeOffTypeId], references: [id])

  allocationId String?
  allocation   TimeOffAllocation?   @relation(fields: [allocationId], references: [id])

  @@map("time_off_requests")
}

model SalaryStructure {
  id          String        @id @default(uuid())
  name        String        @unique // e.g., Regular Salary, Intern Salary
  code        String        @unique
  description String?
  status      AccountStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  rules       SalaryRule[]
  contracts   Contract[]
  payruns     Payrun[]

  @@map("salary_structures")
}

model SalaryRule {
  id                String             @id @default(uuid())
  name              String             // e.g., Basic Salary, HRA, Provident Fund
  code              String             // BASIC, HRA, GROSS, PF, PT, NET
  category          SalaryRuleCategory
  sequence          Int                // Execution order (1, 10, 20, 30...)
  computationMethod ComputationMethod  @default(PERCENTAGE)
  amount            Float?             // For FIXED method
  percentage        Float?             // For PERCENTAGE method
  percentageBase    String?            // WAGE, BASIC, GROSS
  formula           String?            // Dynamic JS/Python expression
  status            AccountStatus      @default(ACTIVE)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  salaryStructureId String
  salaryStructure   SalaryStructure    @relation(fields: [salaryStructureId], references: [id], onDelete: Cascade)

  @@map("salary_rules")
}

model Payrun {
  id                String        @id @default(uuid())
  name              String        // e.g., February 2026
  startDate         DateTime
  endDate           DateTime
  status            PayrunStatus  @default(DRAFT)
  totalGross        Float         @default(0.0)
  totalNet          Float         @default(0.0)
  warningsCount     Int           @default(0)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  salaryStructureId String
  salaryStructure   SalaryStructure @relation(fields: [salaryStructureId], references: [id])

  payslips          Payslip[]

  @@map("payruns")
}

model Payslip {
  id                 String        @id @default(uuid())
  payslipNumber      String        @unique // SLIP/2026/02/001
  startDate          DateTime
  endDate            DateTime
  workedDays         Float         @default(22.0)
  basicWage          Float
  grossWage          Float
  netWage            Float
  status             PayslipStatus @default(DRAFT)
  warningMessage     String?
  pdfPath            String?
  sentEmail          Boolean       @default(false)
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  employeeId         String
  employee           Employee      @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  contractId         String
  contract           Contract      @relation(fields: [contractId], references: [id])

  payrunId           String
  payrun             Payrun        @relation(fields: [payrunId], references: [id], onDelete: Cascade)

  lines              PayslipLine[]

  @@map("payslips")
}

model PayslipLine {
  id         String             @id @default(uuid())
  code       String
  name       String
  category   SalaryRuleCategory
  amount     Float
  sequence   Int
  
  payslipId  String
  payslip    Payslip            @relation(fields: [payslipId], references: [id], onDelete: Cascade)

  @@map("payslip_lines")
}

model AuditLog {
  id         String   @id @default(uuid())
  action     String
  entity     String
  entityId   String
  details    String?
  createdAt  DateTime @default(now())

  userId     String?
  user       User?    @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}
```

---

## 4. Authentication, Authorization & RBAC Middleware

The application enforces strict **Role-Based Access Control (RBAC)** across 5 system roles:

| Module / Resource | Employee | HR Manager | HR Payroll User | HR Payroll Manager | Admin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Management** | None | None | None | None | Full CRUD |
| **Employee Master** | View Own | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| **Contracts** | None | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| **Working Schedules** | Read Only | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| **Attendance** | Own Check-in/out | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| **Time Off Requests** | Own Requests | Approve/Refuse | Approve/Refuse | Approve/Refuse | Full CRUD |
| **Time Off Allocations** | View Own | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| **Time Off Types** | Read Only | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| **Payruns & Payslips** | View Own Payslip | None | Create, Read, Update | Full CRUD | Full CRUD |
| **Salary Structures & Rules**| None | None | Read Only | Full CRUD | Full CRUD |
| **Payroll Dashboard** | None | Operational Metrics | Full Access | Full Access | Full Access |

---

## 5. Business Logic Engines & Calculation Algorithms

### 5.1 Active Contract Selection Algorithm
Payroll execution **must** resolve a single active `Contract` for an employee during the payrun period (`startDate` to `endDate`).
```typescript
async function resolveActiveContract(employeeId: string, periodStart: Date, periodEnd: Date) {
  const runningContracts = await prisma.contract.findMany({
    where: {
      employeeId,
      status: 'RUNNING',
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
    },
  });

  if (runningContracts.length === 0) {
    throw new Error(`No active RUNNING contract found for employee ${employeeId} in period.`);
  }
  if (runningContracts.length > 1) {
    throw new Error(`Conflict: Employee ${employeeId} has multiple RUNNING contracts for the period.`);
  }
  return runningContracts[0];
}
```

### 5.2 Salary Computation Engine
Calculates payslip line items by sequentially processing `SalaryRule` entries (`Sequence 1..N`).

```typescript
export function computeSalaryLines(wage: Float, rules: SalaryRule[], workedDays: number = 22) {
  const categoryTotals: Record<string, number> = { WAGE: wage };
  const lines = [];

  // Sort rules by sequence ASC
  const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

  for (const rule of sortedRules) {
    let computedAmount = 0;

    if (rule.computationMethod === 'FIXED') {
      computedAmount = rule.amount || 0;
    } else if (rule.computationMethod === 'PERCENTAGE') {
      const baseValue = categoryTotals[rule.percentageBase || 'WAGE'] || wage;
      computedAmount = (baseValue * (rule.percentage || 0)) / 100;
    } else if (rule.computationMethod === 'FORMULA') {
      // Dynamic evaluator supporting variables: categories, wage, workedDays
      computedAmount = evaluateFormula(rule.formula || '0', categoryTotals, workedDays);
    }

    // Save line and category total
    categoryTotals[rule.code] = computedAmount;
    lines.push({
      code: rule.code,
      name: rule.name,
      category: rule.category,
      amount: Math.round(computedAmount),
      sequence: rule.sequence,
    });
  }

  return lines;
}
```

### 5.3 Automated Payrun Validation & Warning System
Surfaces validation warnings prior to payrun finalization:
1. **Missing Bank Account**: `employee.bankAccountNumber == null || employee.ifscCode == null`.
2. **Duplicate Payslip Warning**: Payslip already exists for `(employeeId, payrunId)` or overlaps period.
3. **Expiring Contract Warning**: Active contract `endDate` falls within the payrun period.
4. **Draft Status Warning**: Unvalidated draft payslips present before marking payrun as paid.

---

## 6. Complete API Reference & Frontend Mapping Catalog

### 6.1 Auth & User Management APIs

#### `POST /api/v1/auth/login`
- **Purpose**: Authenticate user and issue JWT token.
- **Access**: Public
- **Request Body**:
  ```json
  { "email": "aarav@oxp.com", "password": "Password123!" }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "u1", "email": "aarav@oxp.com", "name": "Aarav Mehta", "role": "HR_PAYROLL_MANAGER", "employeeId": "emp1" }
  }
  ```
- **Consuming Component**: `LoginPage` (`src/pages/LoginPage.tsx`) - Visual Frame `s1.png`

#### `GET /api/v1/users`
- **Purpose**: List all system user accounts.
- **Access**: `ADMIN`
- **Response**: Array of User objects with linked Employee info.
- **Consuming Component**: `UserManagementPage` (`src/pages/UserManagementPage.tsx`) - Visual Frame `s2.png`

#### `POST /api/v1/users`
- **Purpose**: Create user account and assign roles/link to employee.
- **Access**: `ADMIN`
- **Request Body**:
  ```json
  { "name": "Aarav Mehta", "email": "aarav@oxp.com", "role": "HR_PAYROLL_MANAGER", "employeeId": "emp1" }
  ```
- **Consuming Component**: `CreateUserModal` (`src/components/users/CreateUserModal.tsx`) - Visual Frame `s2.png`

---

### 6.2 Employee Management APIs

#### `GET /api/v1/employees`
- **Purpose**: Fetch employee directory supporting Kanban or List view parameters.
- **Access**: `EMPLOYEE` (View self), `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Query Params**: `view=kanban|list`, `search=aarav`, `departmentId=dept1`, `status=ACTIVE`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "emp1",
        "employeeCode": "EMP001",
        "firstName": "Aarav",
        "lastName": "Mehta",
        "workEmail": "aarav@oxp.com",
        "jobPosition": "Payroll Specialist",
        "status": "ACTIVE",
        "department": { "name": "Finance" },
        "smartCounts": { "contracts": 2, "attendance": 14, "timeOff": 3, "allocations": 1 }
      }
    ]
  }
  ```
- **Consuming Components**: `EmployeeKanbanView` (`s4.png`), `EmployeeListView` (`s5.png`)

#### `GET /api/v1/employees/:id`
- **Purpose**: Detailed employee form data with smart-button counters.
- **Access**: `EMPLOYEE` (Self only), `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `EmployeeFormPage` (`src/pages/EmployeeFormPage.tsx`) - Visual Frame `s6.png`

#### `POST /api/v1/employees`
- **Purpose**: Create a new employee master record.
- **Access**: `HR_MANAGER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `EmployeeFormPage` (`src/pages/EmployeeFormPage.tsx`)

---

### 6.3 Contract Management APIs

#### `GET /api/v1/contracts`
- **Purpose**: Fetch employment contract list with filters.
- **Access**: `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Query Params**: `employeeId=emp1`, `status=RUNNING`
- **Consuming Component**: `ContractListPage` (`src/pages/ContractListPage.tsx`) - Visual Frame `s7.png`

#### `POST /api/v1/contracts`
- **Purpose**: Create a new employment contract.
- **Access**: `HR_MANAGER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Request Body**:
  ```json
  {
    "contractReference": "CON/2026/0042",
    "employeeId": "emp1",
    "startDate": "2026-01-01",
    "monthlyWage": 85000,
    "salaryStructureId": "struct1",
    "workingScheduleId": "sched1",
    "status": "RUNNING"
  }
  ```
- **Consuming Component**: `ContractFormPage` (`src/pages/ContractFormPage.tsx`) - Visual Frame `s8.png`

---

### 6.4 Working Schedule APIs

#### `GET /api/v1/schedules`
- **Purpose**: Get all working schedules and weekly pattern details.
- **Access**: All authenticated users.
- **Consuming Components**: `WorkingScheduleListPage` (`s9.png`), `WorkingScheduleFormPage` (`s10.png`)

#### `POST /api/v1/schedules`
- **Purpose**: Create schedule with days pattern.
- **Access**: `HR_MANAGER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `WorkingScheduleFormPage` (`src/pages/WorkingScheduleFormPage.tsx`) - Visual Frame `s10.png`

---

### 6.5 Attendance APIs

#### `GET /api/v1/attendance`
- **Purpose**: Retrieve list of employee attendance records.
- **Access**: `EMPLOYEE` (Own only), `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `AttendanceListPage` (`src/pages/AttendanceListPage.tsx`) - Visual Frame `s11.png`

#### `POST /api/v1/attendance/check-in`
- **Purpose**: Mark current user check-in timestamp.
- **Access**: Authenticated User.
- **Consuming Component**: `AttendanceWidget` (`src/components/attendance/AttendanceWidget.tsx`) - Visual Frame `s13.png`

#### `POST /api/v1/attendance/check-out`
- **Purpose**: Mark check-out, calculates worked & overtime hours.
- **Access**: Authenticated User.
- **Consuming Component**: `AttendanceWidget` (`src/components/attendance/AttendanceWidget.tsx`) - Visual Frame `s13.png`

---

### 6.6 Time Off APIs

#### `GET /api/v1/time-off/requests`
- **Purpose**: List leave requests.
- **Access**: `EMPLOYEE` (Own), `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `TimeOffRequestsPage` (`src/pages/TimeOffRequestsPage.tsx`) - Visual Frame `s14.png`

#### `POST /api/v1/time-off/requests`
- **Purpose**: Submit leave request.
- **Access**: Authenticated User.
- **Consuming Component**: `TimeOffRequestFormPage` (`src/pages/TimeOffRequestFormPage.tsx`) - Visual Frame `s15.png`

#### `PUT /api/v1/time-off/requests/:id/approve`
- **Purpose**: Approve leave request and deduct allocation balance.
- **Access**: `HR_MANAGER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `TimeOffRequestFormPage` (`s15.png`)

#### `GET /api/v1/time-off/allocations`
- **Purpose**: List employee leave balances and allocations.
- **Access**: `EMPLOYEE` (Own), `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `TimeOffAllocationsPage` (`src/pages/TimeOffAllocationsPage.tsx`) - Visual Frame `s16.png`

---

### 6.7 Payrun & Payslip APIs

#### `GET /api/v1/payruns`
- **Purpose**: List payruns.
- **Access**: `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayrunsListPage` (`src/pages/PayrunsListPage.tsx`) - Visual Frame `s20.png`

#### `POST /api/v1/payruns/eligible-employees`
- **Purpose**: Step 2 of wizard: returns eligible employees for payrun scope.
- **Access**: `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayrunWizardStep2Modal` (`s22.png`)

#### `POST /api/v1/payruns`
- **Purpose**: Initialize Payrun batch with selected employee IDs.
- **Access**: `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayrunWizardStep2Modal` (`s22.png`)

#### `POST /api/v1/payruns/:id/compute`
- **Purpose**: Trigger salary rule calculation for all payslips in payrun.
- **Access**: `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayrunProcessingPage` (`src/pages/PayrunProcessingPage.tsx`) - Visual Frame `s23.png`

#### `POST /api/v1/payruns/:id/validate`
- **Purpose**: Validate computed payrun, transition status to `VALIDATED`.
- **Access**: `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayrunProcessingPage` (`s23.png`)

#### `POST /api/v1/payruns/:id/mark-paid`
- **Purpose**: Mark payrun paid (`PAID` status).
- **Access**: `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayrunProcessingPage` (`s23.png`)

#### `POST /api/v1/payruns/:id/send-payslips`
- **Purpose**: Bulk email PDF payslips to employees via Nodemailer background task.
- **Access**: `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayrunProcessingPage` (`s23.png`)

#### `GET /api/v1/payslips/:id/pdf`
- **Purpose**: Streams binary PDF file of employee payslip rendered via PDFKit.
- **Access**: `EMPLOYEE` (Own), `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Consuming Component**: `PayslipPdfModal` (`s26.png`)

---

### 6.8 Payroll Dashboard APIs

#### `GET /api/v1/dashboard/metrics`
- **Purpose**: Aggregated KPIs (Total Net Salary, Payslips Count, Average Salary, Time Off Days, Attendance Health %).
- **Access**: `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`
- **Query Params**: `period=Sep 2026`, `departmentId=all`, `employeeType=all`, `company=OXP`
- **Consuming Component**: `PayrollDashboardPage` (`src/pages/PayrollDashboardPage.tsx`) - Visual Frames `s31.png` - `s37.png`

---

## 7. Error Handling & Standard API Responses

All API endpoints return standard structured JSON payloads:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "CONTRACT_CONFLICT",
    "message": "Employee has multiple RUNNING contracts for the selected period.",
    "details": []
  }
}
```
