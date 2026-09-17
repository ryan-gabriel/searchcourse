import { z } from "zod";
import { pageField, limitField } from "./shared";

export const ClickSourceEnum = z.enum(["WEB", "TELEGRAM"]);
export type ClickSource = z.infer<typeof ClickSourceEnum>;

export const ClickCreateSchema = z.object({
  courseId: z.string().cuid(),
  source: ClickSourceEnum.default("WEB"),
  userAgent: z.string().max(512).optional(),
  referer: z.string().max(512).optional(),
  ipHash: z.string().max(64).optional(),
  country: z.string().length(2).optional(),
});
export type ClickCreateInput = z.infer<typeof ClickCreateSchema>;

export const ClickAnalyticsSchema = z.object({
  courseId: z.string().cuid().optional(),
  source: ClickSourceEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  groupBy: z.enum(["day", "week", "month", "source", "country"]).default("day"),
});
export type ClickAnalyticsParams = z.infer<typeof ClickAnalyticsSchema>;

export const EventsSearchSchema = z.object({
  page: pageField,
  limit: limitField(200, 20),
});
export type EventsSearchParams = z.infer<typeof EventsSearchSchema>;
