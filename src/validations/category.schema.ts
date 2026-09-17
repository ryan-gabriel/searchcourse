import { z } from "zod";
import { slugPattern, pageField, limitField } from "./shared";

export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(slugPattern),
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
  page: pageField,
  limit: limitField(500, 20),
});
export type CategorySearchParams = z.infer<typeof CategorySearchSchema>;
