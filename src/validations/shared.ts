import { z } from "zod";

export const slugPattern = /^[a-z0-9-]+$/;

export const pageField = z.coerce.number().int().min(1).max(1_000_000).default(1);

export const limitField = (max: number, defaultValue: number) =>
  z.coerce.number().int().min(1).max(max).default(defaultValue);