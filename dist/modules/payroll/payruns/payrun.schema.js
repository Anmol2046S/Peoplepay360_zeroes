"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePayrunSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreatePayrunSchema = zod_1.default.object({
    periodStart: zod_1.default.string().datetime().or(zod_1.default.date()),
    periodEnd: zod_1.default.string().datetime().or(zod_1.default.date()),
});
