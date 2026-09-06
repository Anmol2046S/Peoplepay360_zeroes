"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveTimeOffSchema = exports.RequestTimeOffSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.RequestTimeOffSchema = zod_1.default.object({
    employeeId: zod_1.default.string().min(1),
    typeId: zod_1.default.string().min(1),
    startDate: zod_1.default.string().datetime().or(zod_1.default.date()).or(zod_1.default.string()),
    endDate: zod_1.default.string().datetime().or(zod_1.default.date()).or(zod_1.default.string()),
    reason: zod_1.default.string().optional(),
});
exports.ApproveTimeOffSchema = zod_1.default.object({
// No payload needed, just the action, but keeping extensible
});
