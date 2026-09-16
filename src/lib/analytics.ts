export const ANALYTICS_RANGES = ["1d", "7d", "30d"] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const RANGE_TO_DAYS: Record<AnalyticsRange, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
};

export function isAnalyticsRange(
  value: string | undefined
): value is AnalyticsRange {
  return !!value && (ANALYTICS_RANGES as readonly string[]).includes(value);
}

export function analyticsDaysFor(
  value: string | undefined,
  fallback: AnalyticsRange | null = null
): number | undefined {
  if (isAnalyticsRange(value)) return RANGE_TO_DAYS[value];
  return fallback ? RANGE_TO_DAYS[fallback] : undefined;
}