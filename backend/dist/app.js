"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
const db_1 = require("./database/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const employee_routes_1 = __importDefault(require("./modules/employees/employee.routes"));
const contract_routes_1 = __importDefault(require("./modules/contracts/contract.routes"));
const attendance_routes_1 = __importDefault(require("./modules/attendance/attendance.routes"));
const timeoff_routes_1 = __importDefault(require("./modules/timeoff/timeoff.routes"));
const structure_routes_1 = __importDefault(require("./modules/payroll/salary-structures/structure.routes"));
const rule_routes_1 = __importDefault(require("./modules/payroll/salary-rules/rule.routes"));
const payrun_routes_1 = __importDefault(require("./modules/payroll/payruns/payrun.routes"));
const engine_routes_1 = __importDefault(require("./modules/payroll/engine/engine.routes"));
const report_routes_1 = __importDefault(require("./modules/reports/report.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
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
    app.setErrorHandler(errorHandler_1.errorHandler);
    // Register plugins
    await app.register(cors_1.default, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    });
    await app.register(helmet_1.default, {
        crossOriginResourcePolicy: false,
    });
    await app.register(rate_limit_1.default, {
        max: 100, // 100 requests per minute
        timeWindow: '1 minute',
    });
    // Health check route
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
    // Root route for browsers
    app.get('/', async () => {
        return {
            message: 'Welcome to PeoplePay360 API',
            status: 'Running',
            docs: '/api/v1'
        };
    });
    // API routes
    app.register(async (api) => {
        // DEV ONLY: Generate a token for requested role or default to Super Admin
        api.get('/dev/token', async (request, reply) => {
            const query = request.query;
            const requestedRole = query?.role?.toUpperCase();
            let targetRoleName = 'SUPER_ADMIN';
            if (requestedRole === 'EMPLOYEE') {
                targetRoleName = 'EMPLOYEE';
            }
            else if (requestedRole === 'HR') {
                targetRoleName = 'HR_MANAGER';
            }
            let user = await db_1.prisma.user.findFirst({
                where: { role: { name: targetRoleName } },
                include: { role: true }
            });
            if (!user) {
                user = await db_1.prisma.user.findFirst({
                    include: { role: true }
                });
            }
            if (!user) {
                return reply.code(404).send({ error: 'No user found in DB. Did you run the seed?' });
            }
            const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                orgId: user.orgId,
                email: user.email,
                roleId: user.roleId,
                permissions: user.role.permissions
            }, secret, { expiresIn: '1d' });
            return { token, user: { id: user.id, email: user.email, name: user.name || user.email.split('@')[0] || 'Demo User' } };
        });
        api.register(auth_routes_1.default, { prefix: '/auth' });
        api.register(employee_routes_1.default, { prefix: '/employees' });
        api.register(contract_routes_1.default, { prefix: '/contracts' });
        api.register(attendance_routes_1.default, { prefix: '/attendance' });
        api.register(timeoff_routes_1.default, { prefix: '/time-off' });
        api.register(structure_routes_1.default, { prefix: '/payroll/structures' });
        api.register(rule_routes_1.default, { prefix: '/payroll/rules' });
        api.register(payrun_routes_1.default, { prefix: '/payroll/payruns' });
        api.register(engine_routes_1.default, { prefix: '/payroll/engine' });
        api.register(report_routes_1.default, { prefix: '/reports' });
        api.register(user_routes_1.default, { prefix: '/users' });
        api.register(dashboard_routes_1.default, { prefix: '/dashboard' });
        api.get('/', async () => {
            return { message: 'PeoplePay360 API v1' };
        });
    }, { prefix: '/api/v1' });
    return app;
};
exports.default = buildApp;
