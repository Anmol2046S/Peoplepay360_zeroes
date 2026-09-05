import z from 'zod';

const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).or(z.date());

export const CheckInSchema = z.object({
  employeeId: z.string().min(1),
  date: dateSchema,
  checkIn: dateSchema,
});

export const CheckOutSchema = z.object({
  checkOut: dateSchema,
});

export type CheckInInput = z.infer<typeof CheckInSchema>;
export type CheckOutInput = z.infer<typeof CheckOutSchema>;
