import z from 'zod';

export const CreatePayrunSchema = z.object({
  periodStart: z.string().datetime().or(z.date()),
  periodEnd: z.string().datetime().or(z.date()),
});

export type CreatePayrunInput = z.infer<typeof CreatePayrunSchema>;
