import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

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
  const { errorHandler } = await import('./middleware/errorHandler');
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

  // Placeholder for API routes
  app.register(async (api) => {
    // DEV ONLY: Generate a token for any requested demo role
    api.get('/dev/token', async (request, reply) => {
      const { prisma } = await import('./database/db');
      const jwt = (await import('jsonwebtoken')).default || (await import('jsonwebtoken'));
      
      const queryRole = String((request.query as any)?.role || 'ADMIN').toUpperCase();
      const roleNameMap: Record<string, string> = {
        ADMIN: 'SUPER_ADMIN',
        SUPER_ADMIN: 'SUPER_ADMIN',
        HR_MANAGER: 'HR_MANAGER',
        HR_PAYROLL_MANAGER: 'HR_PAYROLL_MANAGER',
        HR_PAYROLL_USER: 'HR_PAYROLL_USER',
        EMPLOYEE: 'EMPLOYEE',
      };
      const targetRole = roleNameMap[queryRole] || 'SUPER_ADMIN';

      let user = await prisma.user.findFirst({
        where: targetRole === 'EMPLOYEE'
          ? { email: 'employee@techcorp.com' }
          : { role: { name: targetRole } },
        include: { role: true, employees: true },
      });

      if (!user) {
        user = await prisma.user.findFirst({
          where: { role: { name: 'SUPER_ADMIN' } },
          include: { role: true, employees: true },
        });
      }

      if (!user) {
        return reply.code(404).send({ error: 'User not found in DB. Did you run the seed?' });
      }

      const emp = user.employees?.[0];
      const userName = emp ? `${emp.firstName} ${emp.lastName}` : (user.email.split('@')[0]);

      const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
      const token = jwt.sign({
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        roleId: user.roleId,
        permissions: user.role.permissions || [],
      }, secret, { expiresIn: '1d' });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: userName,
          role: user.role.name === 'SUPER_ADMIN' ? 'ADMIN' : user.role.name,
          employeeId: emp?.id || null,
        },
      };
    });

    // Users & RBAC
    api.get('/users', async (request, reply) => {
      const { prisma } = await import('./database/db');
      const users = await prisma.user.findMany({
        include: { role: true, employees: true },
        orderBy: { createdAt: 'asc' },
      });
      const data = users.map((u) => {
        const emp = u.employees?.[0];
        return {
          id: u.id,
          name: emp ? `${emp.firstName} ${emp.lastName}` : u.email.split('@')[0],
          email: u.email,
          role: u.role.name === 'SUPER_ADMIN' ? 'ADMIN' : u.role.name,
          status: u.status,
          createdAt: u.createdAt.toISOString(),
          employee: emp ? { firstName: emp.firstName, lastName: emp.lastName } : null,
        };
      });
      return reply.send({ success: true, data });
    });

    api.post('/users', async (request, reply) => {
      const { prisma } = await import('./database/db');
      const bcrypt = (await import('bcryptjs')).default || (await import('bcryptjs'));
      const body = request.body as any;
      const org = await prisma.organization.findFirst();
      if (!org) return reply.code(400).send({ success: false, error: { message: 'No org found' } });
      
      const roleObj = await prisma.role.findFirst({ where: { name: body.role || 'EMPLOYEE' } }) ||
                      await prisma.role.findFirst();
      const passwordHash = await bcrypt.hash(body.password || 'password123', 10);

      const created = await prisma.user.create({
        data: {
          orgId: org.id,
          roleId: roleObj!.id,
          email: body.email,
          passwordHash,
          status: 'ACTIVE',
        },
        include: { role: true },
      });

      return reply.status(201).send({
        success: true,
        data: {
          id: created.id,
          name: body.name || created.email,
          email: created.email,
          role: created.role.name,
          status: created.status,
          createdAt: created.createdAt.toISOString(),
        },
      });
    });

    api.post<{ Params: { id: string } }>('/users/:id/reset-password', async (request, reply) => {
      const { prisma } = await import('./database/db');
      const bcrypt = (await import('bcryptjs')).default || (await import('bcryptjs'));
      const { id } = request.params;
      const { newPassword } = request.body as any;
      const passwordHash = await bcrypt.hash(newPassword || 'password123', 10);
      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
      return reply.send({ success: true, message: 'Password reset successfully' });
    });

    const { default: authRoutes } = await import('./modules/auth/auth.routes');
    const { default: employeeRoutes } = await import('./modules/employees/employee.routes');
    const { default: contractRoutes } = await import('./modules/contracts/contract.routes');
    const { default: attendanceRoutes } = await import('./modules/attendance/attendance.routes');
    const { default: timeOffRoutes } = await import('./modules/timeoff/timeoff.routes');
    const { default: structureRoutes } = await import('./modules/payroll/salary-structures/structure.routes');
    const { default: ruleRoutes } = await import('./modules/payroll/salary-rules/rule.routes');
    const { default: payrunRoutes } = await import('./modules/payroll/payruns/payrun.routes');
    const { default: engineRoutes } = await import('./modules/payroll/engine/engine.routes');
    const { default: reportRoutes } = await import('./modules/reports/report.routes');
    const { default: dashboardRoutes } = await import('./modules/dashboard/dashboard.routes');
    
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
