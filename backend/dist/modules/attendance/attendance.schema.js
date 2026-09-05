"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOutSchema = exports.CheckInSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const dateSchema = zod_1.default.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).or(zod_1.default.date());
exports.CheckInSchema = zod_1.default.object({
    employeeId: zod_1.default.string().min(1),
    date: dateSchema,
    checkIn: dateSchema,
});
exports.CheckOutSchema = zod_1.default.object({
    checkOut: dateSchema,
});
