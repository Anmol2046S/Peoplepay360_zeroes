"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOutSchema = exports.CheckInSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CheckInSchema = zod_1.default.object({
    employeeId: zod_1.default.string().min(1),
    date: zod_1.default.string().datetime().or(zod_1.default.date()), // Logical date of the shift
    checkIn: zod_1.default.string().datetime().or(zod_1.default.date()), // Actual time
});
exports.CheckOutSchema = zod_1.default.object({
    checkOut: zod_1.default.string().datetime().or(zod_1.default.date()), // Actual time
});
