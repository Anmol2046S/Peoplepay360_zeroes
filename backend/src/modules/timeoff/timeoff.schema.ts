import z from 'zod';

export const RequestTimeOffSchema = z.object({
  employeeId: z.string().min(1),
  typeId: z.string().min(1),
  startDate: z.string().datetime().or(z.date()).or(z.string()),
  endDate: z.string().datetime().or(z.date()).or(z.string()),
  reason: z.string().optional(),
});

export const ApproveTimeOffSchema = z.object({
  // No payload needed, just the action, but keeping extensible
});

export type RequestTimeOffInput = z.infer<typeof RequestTimeOffSchema>;
