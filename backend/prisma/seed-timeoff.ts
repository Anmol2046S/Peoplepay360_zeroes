import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/peoplepay360?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding TimeOffTypes and Allocations...');
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('No org found');

  const employees = await prisma.employee.findMany();

  const types = [
    { name: 'ANNUAL', isPaid: true },
    { name: 'SICK', isPaid: true },
    { name: 'PARENTAL', isPaid: true },
    { name: 'UNPAID', isPaid: false },
  ];

  for (const t of types) {
    const timeOffType = await prisma.timeOffType.create({
      data: {
        orgId: org.id,
        name: t.name,
        isPaid: t.isPaid,
      }
    });

    for (const e of employees) {
      await prisma.timeOffAllocation.create({
        data: {
          employeeId: e.id,
          typeId: timeOffType.id,
          totalDays: 20,
          usedDays: 0,
        }
      });
    }
  }

  console.log('Done seeding time off types');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
