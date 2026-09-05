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
  await app.register(cors);
  await app.register(helmet);
  await app.register(rateLimit, {
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
    // DEV ONLY: Generate a token for Sarah Admin to bypass login on frontend
    api.get('/dev/token', async (request, reply) => {
      const adminUser = await prisma.user.findFirst({
        where: { role: { name: 'SUPER_ADMIN' } },
        include: { role: true }
      });

      if (!adminUser) {
        return reply.code(404).send({ error: 'Super Admin not found in DB. Did you run the seed?' });
      }

      const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
      const token = jwt.sign({
        id: adminUser.id,
        orgId: adminUser.orgId,
        email: adminUser.email,
        roleId: adminUser.roleId,
        permissions: adminUser.role.permissions
      }, secret, { expiresIn: '1d' });

      return { token, user: { email: adminUser.email, name: 'Sarah Admin' } };
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
    api.register(dashboardRoutes, { prefix: '/dashboard' });
    
    api.get('/', async () => {
      return { message: 'PeoplePay360 API v1' };
    });
  }, { prefix: '/api/v1' });

  return app;
};

export default buildApp;
