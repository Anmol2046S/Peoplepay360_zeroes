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
    userId: zod_1.default.string().optional(),
    status: zod_1.default.enum(['ACTIVE', 'TERMINATED']).default('ACTIVE'),
});
exports.UpdateEmployeeSchema = exports.CreateEmployeeSchema.partial();
