import z from 'zod';

export const CreateRuleSchema = z.object({
  structureId: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['BASIC', 'ALLOWANCE', 'DEDUCTION', 'GROSS', 'NET']),
  computationType: z.enum(['FIXED', 'PERCENTAGE', 'FORMULA']),
  sequence: z.number().int().min(1),
  value: z.number().optional().nullable(), // Nullable for pure formulas that rely only on deps
  dependsOn: z.array(z.string()).default([]),
});

export const UpdateRuleSchema = CreateRuleSchema.omit({ structureId: true, code: true }).partial();

export type CreateRuleInput = z.infer<typeof CreateRuleSchema>;
export type UpdateRuleInput = z.infer<typeof UpdateRuleSchema>;
