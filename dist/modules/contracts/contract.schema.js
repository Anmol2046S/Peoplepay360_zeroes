"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContractSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateContractSchema = zod_1.default.object({
    employeeId: zod_1.default.string().min(1),
    salaryStructureId: zod_1.default.string().min(1),
    startDate: zod_1.default.string().datetime().or(zod_1.default.date()),
    endDate: zod_1.default.string().datetime().or(zod_1.default.date()).optional().nullable(),
    status: zod_1.default.enum(['ACTIVE', 'EXPIRED', 'TERMINATED']).default('ACTIVE'),
    workingSchedule: zod_1.default.object({
        days: zod_1.default.array(zod_1.default.string()).min(1),
        hours: zod_1.default.number().positive(),
    }),
});
