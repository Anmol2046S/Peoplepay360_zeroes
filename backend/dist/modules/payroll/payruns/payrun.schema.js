"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePayrunSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreatePayrunSchema = zod_1.default.object({
    periodStart: zod_1.default.string().or(zod_1.default.date()).optional(),
    periodEnd: zod_1.default.string().or(zod_1.default.date()).optional(),
    name: zod_1.default.string().optional(),
});
