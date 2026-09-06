"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeSchema = exports.CreateEmployeeSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateEmployeeSchema = zod_1.default.object({
    firstName: zod_1.default.string().min(1, 'First name is required'),
    lastName: zod_1.default.string().min(1, 'Last name is required'),
    email: zod_1.default.string().email('Valid email address is required'),
    password: zod_1.default.string().optional().default('password123'),
    department: zod_1.default.string().optional().default('Engineering'),
    jobTitle: zod_1.default.string().optional().default('Software Engineer'),
    salary: zod_1.default.number().optional().default(85000),
    phone: zod_1.default.string().optional().default('+1 (555) 432-8765'),
    location: zod_1.default.string().optional().default('San Francisco HQ'),
    status: zod_1.default.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']).default('ACTIVE'),
    startDate: zod_1.default.string().optional(),
    userId: zod_1.default.string().optional(),
});
exports.UpdateEmployeeSchema = zod_1.default.object({
    firstName: zod_1.default.string().optional(),
    lastName: zod_1.default.string().optional(),
    email: zod_1.default.string().email().optional(),
    password: zod_1.default.string().optional(),
    department: zod_1.default.string().optional(),
    jobTitle: zod_1.default.string().optional(),
    salary: zod_1.default.number().optional(),
    phone: zod_1.default.string().optional(),
    location: zod_1.default.string().optional(),
    status: zod_1.default.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']).optional(),
    startDate: zod_1.default.string().optional(),
});
