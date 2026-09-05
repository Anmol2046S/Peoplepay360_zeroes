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

export default buildApp;
