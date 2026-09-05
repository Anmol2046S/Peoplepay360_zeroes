import z from 'zod';

export const CreateContractSchema = z.object({
  employeeId: z.string().min(1),
  salaryStructureId: z.string().min(1),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional().nullable(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED']).default('ACTIVE'),
  workingSchedule: z.object({
    days: z.array(z.string()).min(1),
    hours: z.number().positive(),
  }),
});

export type CreateContractInput = z.infer<typeof CreateContractSchema>;
