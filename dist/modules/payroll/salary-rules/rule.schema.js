"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRuleSchema = exports.CreateRuleSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateRuleSchema = zod_1.default.object({
    structureId: zod_1.default.string().min(1),
    code: zod_1.default.string().min(1),
    name: zod_1.default.string().min(1),
    category: zod_1.default.enum(['BASIC', 'ALLOWANCE', 'DEDUCTION', 'GROSS', 'NET']),
    computationType: zod_1.default.enum(['FIXED', 'PERCENTAGE', 'FORMULA']),
    sequence: zod_1.default.number().int().min(1),
    value: zod_1.default.number().optional().nullable(), // Nullable for pure formulas that rely only on deps
    dependsOn: zod_1.default.array(zod_1.default.string()).default([]),
});
exports.UpdateRuleSchema = exports.CreateRuleSchema.omit({ structureId: true, code: true }).partial();
