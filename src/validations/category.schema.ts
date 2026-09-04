import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).nullable().optional(),
  iconName: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().default(0),
});
export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;

export const CategoryUpdateSchema = CategoryCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;

export const CategorySearchSchema = z.object({
  query: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});
export type CategorySearchParams = z.infer<typeof CategorySearchSchema>;
