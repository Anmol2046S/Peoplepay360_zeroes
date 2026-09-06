import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { prisma } from './database/db';
import jwt from 'jsonwebtoken';

import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employees/employee.routes';
import contractRoutes from './modules/contracts/contract.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import timeOffRoutes from './modules/timeoff/timeoff.routes';
import structureRoutes from './modules/payroll/salary-structures/structure.routes';
import ruleRoutes from './modules/payroll/salary-rules/rule.routes';
import payrunRoutes from './modules/payroll/payruns/payrun.routes';
import engineRoutes from './modules/payroll/engine/engine.routes';
import reportRoutes from './modules/reports/report.routes';
import userRoutes from './modules/users/user.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const buildApp = async () => {
  const app = fastify({
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
  app.setErrorHandler(errorHandler);

  // Register plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  });
  await app.register(helmet, {
    crossOriginResourcePolicy: false,
  });
  await app.register(rateLimit, {
    max: 10000, // 10000 requests per minute to support live sync & polling
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
      const query = request.query as { role?: string };
      const requestedRole = query?.role?.toUpperCase();

      let targetRoleName = requestedRole || 'ADMIN';
      if (requestedRole === 'SUPER_ADMIN') targetRoleName = 'ADMIN';
      if (requestedRole === 'HR') targetRoleName = 'HR_MANAGER';
      if (requestedRole === 'PAYROLL') targetRoleName = 'HR_PAYROLL_MANAGER';

      let user = await prisma.user.findFirst({
        where: { role: { name: targetRoleName } },
        include: { role: true }
      });

      if (!user) {
        user = await prisma.user.findFirst({
          include: { role: true }
        });
      }

      if (!user) {
        return reply.code(404).send({ error: 'No user found in DB. Did you run the seed?' });
      }

      const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
      const token = jwt.sign({
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        roleId: user.roleId,
        permissions: user.role.permissions
      }, secret, { expiresIn: '1d' });

      return { token, user: { id: user.id, email: user.email, name: (user as any).name || user.email.split('@')[0] || 'Demo User' } };
    });

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
    api.register(userRoutes, { prefix: '/users' });
    api.register(dashboardRoutes, { prefix: '/dashboard' });
    
    api.get('/', async () => {
      return { message: 'PeoplePay360 API v1' };
    });
  }, { prefix: '/api/v1' });

  return app;
};

export default buildApp;
