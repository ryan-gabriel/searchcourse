import { z } from "zod";

export const SettingsSchema = z.object({
  coursesVerified: z.string().max(100).optional(),
  studentSavings: z.string().max(100).optional(),
  uptime: z.string().max(100).optional(),
  acceptanceRate: z.string().max(100).optional(),
  hostingCost: z.string().max(100).optional(),
  priceMonitoring: z.string().max(100).optional(),
  missionTitle: z.string().max(200).optional(),
  missionSubtitle: z.string().max(255).optional(),
  missionDescription: z.string().max(5000).optional(),
});
export type SiteSettingsUpdateInput = z.infer<typeof SettingsSchema>;