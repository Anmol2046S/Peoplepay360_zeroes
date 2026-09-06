"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const decimal_js_1 = require("decimal.js");
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
const apiResponse_1 = require("../../utils/apiResponse");
class EmployeeService {
    formatEmployee(employee, rawPassword) {
        const wage = employee.contracts?.[0]?.monthlyWage ? Number(employee.contracts[0].monthlyWage) : 7083.33;
        const annualSalary = Math.round(wage * 12) || 85000;
        return {
            id: employee.id,
            employeeId: `EMP-${employee.id.slice(-4).toUpperCase()}`,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.user?.email || `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}@company.com`,
            phone: employee.phoneNumber || '+1 (555) 432-8765',
            location: employee.address || 'San Francisco HQ',
            jobTitle: employee.jobTitle || 'Software Engineer',
            department: employee.department?.name || 'Engineering',
            status: employee.status || 'ACTIVE',
            startDate: employee.contracts?.[0]?.startDate?.toISOString() || employee.createdAt?.toISOString() || new Date().toISOString(),
            salary: annualSalary,
            bank: 'Silicon Valley Commercial Bank',
            accountEnd: '8492',
            manager: 'Sarah Admin',
            userId: employee.userId,
            contracts: employee.contracts || [],
            timeOffAllocations: employee.timeOffAllocations || [],
            timeOffRequests: employee.timeOffRequests || [],
            attendance: employee.attendance || [],
            credentials: {
                email: employee.user?.email || `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}@company.com`,
                password: rawPassword || 'password123',
            }
        };
    }
    async create(orgId, input) {
        // 1. Check if user already exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: input.email }
        });
        if (existingUser) {
            throw new apiResponse_1.AppError(`User with email ${input.email} already exists.`, 400, 'USER_EXISTS');
        }
        // 2. Find or create department
        let department = await db_1.prisma.department.findFirst({
            where: {
                orgId,
                name: { equals: input.department, mode: 'insensitive' }
            }
        });
        if (!department) {
            const deptName = input.department || 'Engineering';
            const deptCode = (deptName.slice(0, 4) + '-' + Math.random().toString(36).slice(2, 6)).toUpperCase();
            department = await db_1.prisma.department.create({
                data: {
                    orgId,
                    name: deptName,
                    code: deptCode,
                }
            });
        }
        // 3. Find or create EMPLOYEE role
        let role = await db_1.prisma.role.findFirst({
            where: { name: 'EMPLOYEE' }
        });
        if (!role) {
            role = await db_1.prisma.role.create({
                data: {
                    name: 'EMPLOYEE',
                    permissions: ['ATTENDANCE_SELF', 'TIMEOFF_REQUEST_SELF', 'PAYSLIP_READ_SELF']
                }
            });
        }
        // 4. Create User account
        const rawPassword = input.password || 'password123';
        const passwordHash = await bcryptjs_1.default.hash(rawPassword, 10);
        const user = await db_1.prisma.user.create({
            data: {
                orgId,
                name: `${input.firstName} ${input.lastName}`,
                email: input.email,
                passwordHash,
                roleId: role.id,
                status: 'ACTIVE',
            }
        });
        // 5. Create Employee record
        const employee = await db_1.prisma.employee.create({
            data: {
                orgId,
                userId: user.id,
                departmentId: department.id,
                firstName: input.firstName,
                lastName: input.lastName,
                jobTitle: input.jobTitle || 'Software Engineer',
                phoneNumber: input.phone || '+1 (555) 432-8765',
                address: input.location || 'San Francisco HQ',
                status: input.status || 'ACTIVE',
            },
            include: {
                user: true,
                department: true,
            }
        });
        // 6. Create initial EmploymentContract
        let salaryStructure = await db_1.prisma.salaryStructure.findFirst({ where: { orgId } });
        if (!salaryStructure) {
            salaryStructure = await db_1.prisma.salaryStructure.create({
                data: {
                    orgId,
                    name: 'Standard Salary Structure',
                }
            });
        }
        const monthlyWage = new decimal_js_1.Decimal((input.salary || 85000) / 12);
        const contract = await db_1.prisma.employmentContract.create({
            data: {
                employeeId: employee.id,
                salaryStructureId: salaryStructure.id,
                startDate: input.startDate ? new Date(input.startDate) : new Date(),
                monthlyWage,
                status: 'ACTIVE',
            }
        });
        // 7. Seed initial TimeOffAllocations for new employee
        const timeOffTypes = await db_1.prisma.timeOffType.findMany({ where: { orgId } });
        if (timeOffTypes.length > 0) {
            await db_1.prisma.timeOffAllocation.createMany({
                data: timeOffTypes.map(t => ({
                    employeeId: employee.id,
                    typeId: t.id,
                    totalDays: new decimal_js_1.Decimal(20),
                    usedDays: new decimal_js_1.Decimal(0),
                    remainingDays: new decimal_js_1.Decimal(20),
                })),
                skipDuplicates: true,
            });
        }
        const createdFull = await db_1.prisma.employee.findUnique({
            where: { id: employee.id },
            include: {
                user: true,
                department: true,
                contracts: true,
                timeOffAllocations: { include: { timeOffType: true } },
            }
        });
        return this.formatEmployee(createdFull, rawPassword);
    }
    async getAll(orgId) {
        const employees = await db_1.prisma.employee.findMany({
            where: { orgId },
            include: {
                user: true,
                department: true,
                contracts: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return employees.map(emp => this.formatEmployee(emp));
    }
    async getById(orgId, id) {
        const employee = await db_1.prisma.employee.findFirst({
            where: {
                orgId,
                OR: [
                    { id },
                    { userId: id },
                ]
            },
            include: {
                user: true,
                department: true,
                contracts: true,
                timeOffAllocations: { include: { timeOffType: true } },
                timeOffRequests: { include: { timeOffType: true } },
                attendance: true,
            },
        });
        if (!employee) {
            throw new errors_1.NotFoundError(`Employee with id ${id} not found`);
        }
        return this.formatEmployee(employee);
    }
    async update(orgId, id, input) {
        const existing = await db_1.prisma.employee.findFirst({
            where: {
                orgId,
                OR: [
                    { id },
                    { userId: id },
                ]
            },
            include: { user: true, department: true, contracts: true },
        });
        if (!existing) {
            throw new errors_1.NotFoundError(`Employee with id ${id} not found`);
        }
        let departmentId = existing.departmentId;
        if (input.department) {
            let dept = await db_1.prisma.department.findFirst({
                where: { orgId, name: { equals: input.department, mode: 'insensitive' } }
            });
            if (!dept) {
                const deptCode = (input.department.slice(0, 4) + '-' + Math.random().toString(36).slice(2, 6)).toUpperCase();
                dept = await db_1.prisma.department.create({ data: { orgId, name: input.department, code: deptCode } });
            }
            departmentId = dept.id;
        }
        if (existing.userId && (input.email || input.firstName || input.lastName || input.password)) {
            const userUpdate = {};
            if (input.email)
                userUpdate.email = input.email;
            if (input.firstName || input.lastName) {
                const fn = input.firstName || existing.firstName;
                const ln = input.lastName || existing.lastName;
                userUpdate.name = `${fn} ${ln}`;
            }
            if (input.password) {
                userUpdate.passwordHash = await bcryptjs_1.default.hash(input.password, 10);
            }
            await db_1.prisma.user.update({
                where: { id: existing.userId },
                data: userUpdate,
            });
        }
        await db_1.prisma.employee.update({
            where: { id: existing.id },
            data: {
                firstName: input.firstName !== undefined ? input.firstName : existing.firstName,
                lastName: input.lastName !== undefined ? input.lastName : existing.lastName,
                jobTitle: input.jobTitle !== undefined ? input.jobTitle : existing.jobTitle,
                phoneNumber: input.phone !== undefined ? input.phone : existing.phoneNumber,
                address: input.location !== undefined ? input.location : existing.address,
                status: input.status !== undefined ? input.status : existing.status,
                departmentId,
            },
        });
        if (input.salary && existing.contracts.length > 0) {
            await db_1.prisma.employmentContract.update({
                where: { id: existing.contracts[0].id },
                data: {
                    monthlyWage: new decimal_js_1.Decimal(input.salary / 12),
                }
            });
        }
        return this.getById(orgId, existing.id);
    }
}
exports.EmployeeService = EmployeeService;
