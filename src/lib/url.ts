/**
 * Secure URL validation helpers.
 *
 * `z.string().url()` accepts unsafe schemes (javascript:, data:, vbscript:).
 * These helpers restrict URL-ish fields to http(s) only, and (optionally) to a
 * configurable browser-visible target used for redirects.
 */

import { z } from "zod";

export const httpUrlSchema = z
  .string()
  .refine((value) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be a valid http(s) URL");

export const httpUrlOptionalSchema = httpUrlSchema.nullable().optional();
