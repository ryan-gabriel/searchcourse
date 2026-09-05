import { z } from "zod";
import { httpUrlOptionalSchema, httpUrlSchema } from "@/lib/url";

export const PlatformCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  logoUrl: httpUrlOptionalSchema,
  baseUrl: httpUrlSchema,
  isActive: z.boolean().default(true),
});
export type PlatformCreateInput = z.infer<typeof PlatformCreateSchema>;

export const PlatformUpdateSchema = PlatformCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type PlatformUpdateInput = z.infer<typeof PlatformUpdateSchema>;

export const PlatformSearchSchema = z.object({
  query: z.string().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});
export type PlatformSearchParams = z.infer<typeof PlatformSearchSchema>;
