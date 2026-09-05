import z from 'zod';

export const CreateStructureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const UpdateStructureSchema = CreateStructureSchema.partial();

export type CreateStructureInput = z.infer<typeof CreateStructureSchema>;
export type UpdateStructureInput = z.infer<typeof UpdateStructureSchema>;
