import z from 'zod';

export const CheckInSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().datetime().or(z.date()), // Logical date of the shift
  checkIn: z.string().datetime().or(z.date()), // Actual time
});

export const CheckOutSchema = z.object({
  checkOut: z.string().datetime().or(z.date()), // Actual time
});

export type CheckInInput = z.infer<typeof CheckInSchema>;
export type CheckOutInput = z.infer<typeof CheckOutSchema>;
