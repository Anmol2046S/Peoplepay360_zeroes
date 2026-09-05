"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
exports.transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: parseInt(env_1.env.SMTP_PORT, 10),
    secure: env_1.env.SMTP_PORT === '465',
    auth: env_1.env.SMTP_USER ? {
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS,
    } : undefined,
});
//# sourceMappingURL=mailer.js.map