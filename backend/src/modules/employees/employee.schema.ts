import z from 'zod';

export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email address is required'),
  password: z.string().optional().default('password123'),
  department: z.string().optional().default('Engineering'),
  jobTitle: z.string().optional().default('Software Engineer'),
  salary: z.number().optional().default(85000),
  phone: z.string().optional().default('+1 (555) 432-8765'),
  location: z.string().optional().default('San Francisco HQ'),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']).default('ACTIVE'),
  startDate: z.string().optional(),
  userId: z.string().optional(),
});

export const UpdateEmployeeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  salary: z.number().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']).optional(),
  startDate: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
