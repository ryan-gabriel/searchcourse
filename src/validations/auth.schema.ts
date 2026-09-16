import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(1024),
});
export type LoginInput = z.infer<typeof LoginSchema>;