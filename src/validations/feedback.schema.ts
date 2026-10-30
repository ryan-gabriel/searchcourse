import { z } from "zod";
import { pageField, limitField } from "./shared";

export const FeedbackTypeSchema = z.enum(["REVIEW", "SUGGESTION"]);
export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;

export const FeedbackSourceSchema = z.enum(["WEB", "TELEGRAM"]);
export type FeedbackSource = z.infer<typeof FeedbackSourceSchema>;

export const FeedbackCreateSchema = z.object({
  type: FeedbackTypeSchema.default("SUGGESTION"),
  message: z.string().trim().min(3).max(2000),
  name: z.string().trim().max(100).nullable().optional(),
  email: z.string().trim().email().max(254).nullable().optional(),
  pageUrl: z.string().trim().max(512).nullable().optional(),
});
export type FeedbackCreateInput = z.infer<typeof FeedbackCreateSchema>;

export const FeedbackSearchSchema = z.object({
  type: FeedbackTypeSchema.optional(),
  source: FeedbackSourceSchema.optional(),
  page: pageField,
  limit: limitField(100, 20),
});
export type FeedbackSearchParams = z.infer<typeof FeedbackSearchSchema>;
