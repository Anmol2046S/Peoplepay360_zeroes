import z from 'zod';

export const RequestTimeOffSchema = z.object({
  employeeId: z.string().min(1).optional(),
  typeId: z.string().min(1),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
});

export const ApproveTimeOffSchema = z.object({
  // No payload needed, just the action, but keeping extensible
});

export type RequestTimeOffInput = z.infer<typeof RequestTimeOffSchema>;
