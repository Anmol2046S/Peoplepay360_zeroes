# PeoplePay360: Integrated HR & Payroll Operations Platform (HRMS OXP)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20PostgreSQL%20%7C%20Prisma%20%7C%20Docker-blue)](#technology-stack)

**PeoplePay360 / HRMS OXP** is an integrated, enterprise-grade Human Resource and Payroll Operations Platform designed to streamline the complete employee lifecycle—from master data onboarding, contract management, and working schedules to daily attendance tracking, leave allocation/request approvals, ordered salary rule engine computations, batch payrun execution, PDF payslip generation, bulk email dispatch, and real-time executive reporting dashboards.

---

## 1. Executive Summary & Problem Statement

### Existing Industry Challenges
In traditional HR software environments, employee demographic data, contract terms, attendance punches, leave balances, and payroll calculations exist in disconnected silos:
- **Disjointed Master Data**: Changes in employment contracts or department allocations fail to propagate to active payroll periods.
- **Concurrent Contract Confusion**: Employees accumulating multiple active contract records leads to erroneous double payouts or outdated wage calculations during payruns.
- **Manual Attendance & Leave Deduction**: Hours worked and approved leave days are manually calculated on spreadsheets, introducing human error into final gross and net salary payouts.
- **Opaque Salary Calculations**: Fixed and percentage-based earnings or statutory deductions are calculated without clear execution order, making auditability difficult.
- **Payrun Validation Blindspots**: Payroll teams execute payments without proactive automated checks for missing bank account data, duplicate payslips, or unvalidated draft records.

### The PeoplePay360 Solution
PeoplePay360 bridges these gaps by establishing a unified operational workflow anchored around the **Employee Master Record**:
1. **Period-Aware Contract Validation**: Ensures payroll processes only the single active `RUNNING` contract valid for the specific payroll window.
2. **Automated Operational Tracking**: Integrates weekly `WorkingSchedule` patterns with live `Attendance` check-in/out widgets and automatic `TimeOffAllocation` balance deductions upon leave approval.
3. **Sequenced Salary Rule Engine**: Processes salary rules in explicit numerical order (`Sequence 1..N`), dynamically calculating earnings, statutory allowances, deductions, gross, and net wages.
4. **Two-Step Payrun Creation Wizard**: Separates payrun scope definition from explicit employee selection, preventing accidental payouts to unselected staff.
5. **Automated Validation Warnings & Reporting**: Highlights missing bank details, duplicate payslip attempts, and unvalidated drafts prior to payment finalization while powering live analytics dashboards.

---

## 2. Technology Stack & Ecosystem

The platform is engineered using modern, open-source technologies:

| Layer | Technology / Library | Purpose & Responsibility |
| :--- | :--- | :--- |
| **Frontend Framework** | **React (v18.3+)** | Component-based UI for Single Page Application |
| **Language Tier** | **TypeScript (v5.0+)** | End-to-end type safety across client and server |
| **Build & Tooling** | **Vite (v5.2+)** | Lightning-fast HMR frontend bundling |
| **Backend Server** | **Express.js (v4.19+)** | High-performance RESTful API micro-framework |
| **Database** | **PostgreSQL (v15+)** | Relational data store for ACID-compliant payroll transactions |
| **ORM & Migrations** | **Prisma ORM (v5.12+)** | Type-safe schema management, queries, and automated migrations |
| **Containerization** | **Docker & Docker Compose**| Multi-container orchestration (Web, API, DB) |
| **Authentication** | **JWT & bcryptjs** | Stateless JSON Web Token auth & password hashing |
| **Data Validation** | **Zod (v3.23+)** | Runtime schema validation for request payloads |
| **Document Generation**| **PDFKit (v0.15+)** | Server-side binary PDF generation for printable payslips |
| **Email Delivery** | **Nodemailer (v6.9+)** | Asynchronous bulk email dispatch for payslips |
| **Data Visualization** | **Recharts (v2.12+)** | Dynamic bar charts and trend lines for Payroll Dashboard |
| **Icons & Design** | **Lucide Icons** | Modern UI icons matching Excalidraw designs |

---

## 3. User Roles & Permission Matrix (RBAC)

The system enforces strict Role-Based Access Control across **5 system user roles**:

```
+---------------------+-------------------------------------------------------------------+
| System Role         | Core Operational Capabilities                                     |
+---------------------+-------------------------------------------------------------------+
| 1. Employee         | View own profile, attendance records, leave balances. Check-in/out|
|                     | timer widget access. Submit time off requests. View own payslips. |
| 2. HR Manager       | Full CRUD on Employees, Contracts, Schedules, Attendance, Time    |
|                     | Off Allocations & Types. Approve/Refuse leaves. No payroll access.|
| 3. HR Payroll User  | All HR Manager permissions + Create, Read, Update on Payruns and  |
|                     | Payslips. Read-only access to Salary Structures and Rules.        |
| 4. HR Payroll Manager| All HR Payroll User permissions + full CRUD on Payruns, Payslips,  |
|                     | Salary Structures, and Salary Rules. Full payroll execution control|
| 5. Admin            | Complete system access. User management, role assignments, global |
|                     | settings, audit logs, and database maintenance.                   |
+---------------------+-------------------------------------------------------------------+
```

---

## 4. High-Level System Architecture & Flow

### System Architecture Overview

```mermaid
graph TD
    subgraph Client Layer (React SPA)
        Nav[Navigation Header & Attendance Widget]
        EmpModule[Employee & Contract Views]
        LeaveModule[Time Off Requests & Allocations]
        PayModule[Payrun Wizard & Payslip Viewer]
        DashModule[Payroll Analytics Dashboard]
    end

    subgraph API Layer (Node.js / Express.js)
        AuthMW[JWT & RBAC Middleware]
        Controllers[API Route Controllers]
        Services[Business Logic & Salary Engine]
        PDFService[PDFKit Document Generator]
        MailService[Nodemailer Email Worker]
    end

    subgraph Data Tier
        Prisma[Prisma ORM Client]
        PG[(PostgreSQL Database)]
    end

    Nav --> AuthMW
    EmpModule --> AuthMW
    LeaveModule --> AuthMW
    PayModule --> AuthMW
    DashModule --> AuthMW

    AuthMW --> Controllers
    Controllers --> Services
    Services --> Prisma
    Services --> PDFService
    Services --> MailService
    Prisma --> PG
```

### End-to-End Operational Application Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as HR / Payroll User
    participant EMP as Employee Module
    participant ATT as Attendance & Leave
    participant PAY as Payrun Wizard
    participant ENG as Salary Calculation Engine
    participant DB as PostgreSQL DB

    Admin->>EMP: Create Employee & Assign Contract (RUNNING)
    Admin->>ATT: Employee marks Attendance & Requests Leave
    Admin->>ATT: Manager Approves Leave -> Balance Auto-Deducted
    Admin->>PAY: Launch Payrun Wizard -> Step 1 Scope -> Step 2 Select Employees
    PAY->>DB: Initialize Payrun & Draft Payslips
    Admin->>PAY: Click "COMPUTE"
    PAY->>ENG: Execute Salary Rules (Sequence 1..N) on Active Contract
    ENG->>DB: Store Computed Lines (Basic, HRA, Gross, Deductions, Net)
    Admin->>PAY: Review Validation Warnings -> Click "VALIDATE"
    Admin->>PAY: Click "MARK PAID" & "SEND PAYSLIPS"
    PAY->>DB: Generate PDF Payslips & Dispatch Emails to Employees
```

---

## 5. Database Overview & Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| Employee : "linked to"
    Department ||--o{ Employee : "has"
    Department ||--o{ Contract : "governs"
    WorkingSchedule ||--o{ ScheduleDay : "contains"
    WorkingSchedule ||--o{ Employee : "assigned"
    WorkingSchedule ||--o{ Contract : "defines"
    
    Employee ||--o{ Contract : "possesses"
    Employee ||--o{ Attendance : "records"
    Employee ||--o{ TimeOffAllocation : "granted"
    Employee ||--o{ TimeOffRequest : "submits"
    Employee ||--o{ Payslip : "receives"
    
    TimeOffType ||--o{ TimeOffAllocation : "categorizes"
    TimeOffType ||--o{ TimeOffRequest : "classifies"
    TimeOffAllocation ||--o{ TimeOffRequest : "deducts"
    
    SalaryStructure ||--o{ SalaryRule : "contains"
    SalaryStructure ||--o{ Contract : "applies"
    SalaryStructure ||--o{ Payrun : "guides"
    
    Payrun ||--o{ Payslip : "groups"
    Contract ||--o{ Payslip : "provides wage"
    Payslip ||--o{ PayslipLine : "details"
```

---

## 6. Complete Project Directory Structures

### Combined System Repository Map

```
Peoplepay360/
├── backend/
│   ├── docker/
│   │   └── Dockerfile
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/ (database.ts, env.ts, jwt.ts, mailer.ts)
│   │   ├── controllers/ (auth, employee, contract, payrun, payslip...)
│   │   ├── middleware/ (auth, rbac, error, rateLimiter)
│   │   ├── routes/ (auth, employee, contract, payrun, dashboard...)
│   │   ├── services/ (auth, employee, salaryEngine, pdf, email...)
│   │   └── utils/ (formulaEvaluator, payrunWarnings, logger)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ (attendance, dashboard, employees, payrun, payslip...)
│   │   ├── context/ (AuthContext, PayrunContext)
│   │   ├── hooks/ (useAttendanceTimer, useAuth, usePayrunWizard)
│   │   ├── pages/ (LoginPage, EmployeeFormPage, PayrunProcessingPage...)
│   │   ├── services/ (apiClient, employee.service, payrun.service)
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── imagies/ (s1.png to s39.png screen mockups)
├── HRMS OXP - 24 hours.excalidraw
├── PeoplePay360 HR & Payroll.pdf
├── docker-compose.yml
├── backend.md
├── frontend.md
├── README.md
└── LICENSE
```

---

## 7. Development Setup & Local Installation Guide

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v15.x or higher running locally OR via Docker
- **Docker & Docker Compose**: (Optional, for containerized run)

---

### Step 1: Clone Repository & Setup Environment Files

```bash
git clone https://github.com/Anmol2046S/Peoplepay360_zeroes.git
cd Peoplepay360_zeroes
```

#### Backend Environment Variables Configuration (`backend/.env`)
Create `backend/.env` based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/peoplepay360?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1d"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_password"
SMTP_FROM="noreply@peoplepay360.com"
```

#### Frontend Environment Variables Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL="http://localhost:5000/api/v1"
```

---

### Step 2: Install Dependencies & Setup Database

#### Backend Setup
```bash
cd backend
npm install

# Run Prisma Database Migrations
npx prisma migrate dev --name init

# Seed Database with Initial Roles, Admin User, and Sample Data
npx prisma db seed
```

#### Frontend Setup
```bash
cd ../frontend
npm install
```

---

### Step 3: Run Application Locally

#### Start Backend API Server
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

#### Start Frontend React Application
```bash
cd frontend
npm run dev
# Client running at http://localhost:5173
```

---

## 8. Docker Deployment Setup

You can launch the full production environment (PostgreSQL DB, Express Backend, React Frontend) using Docker Compose:

### `docker-compose.yml` Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: peoplepay360-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: peoplepay360
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: docker/Dockerfile
    container_name: peoplepay360-api
    environment:
      DATABASE_URL: "postgresql://postgres:postgrespassword@postgres:5432/peoplepay360?schema=public"
      PORT: 5000
      JWT_SECRET: "docker-production-secret"
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
    container_name: peoplepay360-ui
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

### Run with Docker Compose
```bash
docker-compose up --build -d
```
Access the application at:
- **Frontend SPA**: `http://localhost`
- **Backend API**: `http://localhost:5000/api/v1`

---

## 9. Feature Implementation Status Matrix

| Component / Feature | Asset Confirmed Specification | Architectural Specification Status |
| :--- | :--- | :--- |
| **Employee Kanban & List Views** | Fully detailed in PDF & Excalidraw (`s4`, `s5`) | Verified Specification |
| **Employee Smart Buttons** | Smart counters for Contracts, Attendance, Leaves (`s6`) | Verified Specification |
| **Contract Period Selection** | Active running contract rule for payroll | Verified Specification |
| **Working Schedule Auto-Hours** | Weekly hours automatically derived from pattern (`s10`) | Verified Specification |
| **Attendance Header Widget** | Floating timer popup with Check-In/Out toggle (`s13`) | Verified Specification |
| **Leave Balance Consumption** | Automatic deduction from allocation on approval (`s15`)| Verified Specification |
| **2-Step Payrun Wizard** | Step 1 Scope -> Step 2 Employee multi-select (`s21`, `s22`) | Verified Specification |
| **Salary Rule Computation** | Executed in sequence order (`BASIC`, `HRA`, `GROSS`, `NET`) | Verified Specification |
| **Payrun Validation Warnings** | Automated warnings for missing bank info & duplicates | Verified Specification |
| **Payslip PDF & Email** | Server-side PDF generation & bulk Nodemailer dispatch | Verified Specification |
| **Payroll Analytics Dashboard** | Multi-filter KPIs, Department bar chart & Salary trends | Verified Specification |

---

## 10. License & Author Information

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

Developed for the **PeoplePay360 / HRMS OXP Hackathon**.
- **Repository**: [Anmol2046S/Peoplepay360_zeroes](https://github.com/Anmol2046S/Peoplepay360_zeroes)
