import { z } from "zod";
import { slugPattern, pageField, limitField } from "./shared";

export const RoadmapCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(slugPattern),
  description: z.string().max(5000).optional().nullable(),
  iconName: z.string().max(50).optional().nullable(),
  estimatedHours: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).default("ALL_LEVELS"),
  hasJobGuarantee: z.boolean().default(false),
  hasCertificate: z.boolean().default(false),
  hasFreeResources: z.boolean().default(false),
  isShortPath: z.boolean().default(false),
  skillTags: z.array(z.string().max(50)).max(50).default([]),
});
export type RoadmapCreateInput = z.infer<typeof RoadmapCreateSchema>;

export const RoadmapUpdateSchema = RoadmapCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type RoadmapUpdateInput = z.infer<typeof RoadmapUpdateSchema>;

export const RoadmapStepCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  orderIndex: z.number().int().min(0),
  roadmapId: z.string().cuid(),
  courseId: z.string().cuid(),
});
export type RoadmapStepCreateInput = z.infer<typeof RoadmapStepCreateSchema>;

export const RoadmapStepUpdateSchema = RoadmapStepCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type RoadmapStepUpdateInput = z.infer<typeof RoadmapStepUpdateSchema>;

export const StepOrderSchema = z.object({
  stepOrder: z.array(
    z.object({
      id: z.string().cuid(),
      orderIndex: z.number().int().min(0),
    })
  ),
});
export type StepOrderInput = z.infer<typeof StepOrderSchema>;

export const RoadmapSearchSchema = z.object({
  query: z.string().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  category: z.string().optional(),
  hasJobGuarantee: z.coerce.boolean().optional(),
  hasCertificate: z.coerce.boolean().optional(),
  hasFreeResources: z.coerce.boolean().optional(),
  isShortPath: z.coerce.boolean().optional(),
  hasCourses: z.coerce.boolean().optional(),
  page: pageField,
  limit: limitField(20, 10),
});
export type RoadmapSearchParams = z.infer<typeof RoadmapSearchSchema>;
