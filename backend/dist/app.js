"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const buildApp = async () => {
    const app = (0, fastify_1.default)({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
        },
    });
    // Register centralized error handler
    const { errorHandler } = await Promise.resolve().then(() => __importStar(require('./middleware/errorHandler')));
    app.setErrorHandler(errorHandler);
    // Register plugins
    await app.register(cors_1.default);
    await app.register(helmet_1.default);
    await app.register(rate_limit_1.default, {
        max: 100, // 100 requests per minute
        timeWindow: '1 minute',
    });
    // Health check route
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
    // Placeholder for API routes
    app.register(async (api) => {
        const { default: authRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/auth/auth.routes')));
        const { default: employeeRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/employees/employee.routes')));
        const { default: contractRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/contracts/contract.routes')));
        const { default: attendanceRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/attendance/attendance.routes')));
        const { default: timeOffRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/timeoff/timeoff.routes')));
        const { default: structureRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/payroll/salary-structures/structure.routes')));
        const { default: ruleRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/payroll/salary-rules/rule.routes')));
        const { default: payrunRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/payroll/payruns/payrun.routes')));
        const { default: engineRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/payroll/engine/engine.routes')));
        const { default: reportRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/reports/report.routes')));
        api.register(authRoutes, { prefix: '/auth' });
        api.register(employeeRoutes, { prefix: '/employees' });
        api.register(contractRoutes, { prefix: '/contracts' });
        api.register(attendanceRoutes, { prefix: '/attendance' });
        api.register(timeOffRoutes, { prefix: '/time-off' });
        api.register(structureRoutes, { prefix: '/payroll/structures' });
        api.register(ruleRoutes, { prefix: '/payroll/rules' });
        api.register(payrunRoutes, { prefix: '/payroll/payruns' });
        api.register(engineRoutes, { prefix: '/payroll/engine' });
        api.register(reportRoutes, { prefix: '/reports' });
        api.get('/', async () => {
            return { message: 'PeoplePay360 API v1' };
        });
    }, { prefix: '/api/v1' });
    return app;
};
exports.default = buildApp;
