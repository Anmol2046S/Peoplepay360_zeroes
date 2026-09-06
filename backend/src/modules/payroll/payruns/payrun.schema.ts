import z from 'zod';

export const CreatePayrunSchema = z.object({
  periodStart: z.string().or(z.date()).optional(),
  periodEnd: z.string().or(z.date()).optional(),
  name: z.string().optional(),
});

export type CreatePayrunInput = z.infer<typeof CreatePayrunSchema>;

