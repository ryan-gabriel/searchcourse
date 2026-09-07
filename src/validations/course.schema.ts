import { z } from "zod";
import { httpUrlOptionalSchema, httpUrlSchema } from "@/lib/url";

export const CourseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]);
export type CourseLevel = z.infer<typeof CourseLevelEnum>;

export const CourseLearningOutcomeSchema = z.object({
  id: z.string().cuid().optional(),
  text: z.string().min(1).max(500),
  sortOrder: z.number().int().default(0),
});

export const CourseSyllabusItemSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1).max(500),
  sortOrder: z.number().int().default(0),
});

export const CourseSyllabusSectionSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1).max(500),
  duration: z.string().max(100).optional(),
  sortOrder: z.number().int().default(0),
  items: z.array(CourseSyllabusItemSchema).max(500).default([]),
});

export const CourseOutcomeUpdateSchema = z.object({
  outcomes: z.array(z.object({
    text: z.string().min(1).max(500),
    sortOrder: z.number().int(),
  })).max(500),
});

export const CourseSyllabusUpdateSchema = z.object({
  sections: z.array(z.object({
    title: z.string().min(1).max(500),
    duration: z.string().max(100).optional(),
    sortOrder: z.number().int(),
    items: z.array(z.object({
      title: z.string().min(1).max(500),
      sortOrder: z.number().int(),
    })).max(500),
  })).max(500),
});

export const CourseSearchSchema = z.object({
  query: z.string().max(200).optional(),
  platform: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  level: CourseLevelEnum.optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().min(0).optional(),
  hasDiscount: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(12),
  sortBy: z.enum(["rating", "price", "date", "discount", "popular"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type CourseSearchParams = z.infer<typeof CourseSearchSchema>;

export const CourseCreateSchema = z.object({
  externalId: z.string().max(100).optional().nullable(),
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(10000).optional().nullable(),
  shortDescription: z.string().max(320).optional().nullable(),
  headline: z.string().max(500).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
  instructorName: z.string().max(100).optional().nullable(),
  instructorBio: z.string().max(5000).optional().nullable(),
  thumbnailUrl: httpUrlOptionalSchema,
  originalPrice: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  level: CourseLevelEnum.default("ALL_LEVELS"),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().int().min(0).default(0),
  studentCount: z.number().int().min(0).default(0),
  duration: z.string().max(20).optional().nullable(),
  lectureCount: z.number().int().min(0).optional().nullable(),
  directUrl: httpUrlSchema,
  affiliateUrl: httpUrlOptionalSchema,
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPosted: z.boolean().default(false),
  platformId: z.string().cuid(),
  categoryId: z.string().cuid().nullable().optional(),
});
export type CourseCreateInput = z.infer<typeof CourseCreateSchema>;

export const CourseUpdateSchema = CourseCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type CourseUpdateInput = z.infer<typeof CourseUpdateSchema>;

export const CourseResponseSchema = CourseCreateSchema.extend({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastVerifiedAt: z.date(),
  platform: z.object({ id: z.string().cuid(), name: z.string(), slug: z.string() }).optional(),
  category: z.object({ id: z.string().cuid(), name: z.string(), slug: z.string() }).nullable().optional(),
  activeCoupon: z
    .object({
      id: z.string().cuid(),
      finalPrice: z.number(),
      discountValue: z.number(),
      code: z.string().nullable(),
    })
    .nullable()
    .optional(),
});
export type CourseResponse = z.infer<typeof CourseResponseSchema>;
