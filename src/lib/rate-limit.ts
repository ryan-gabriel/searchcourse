import { LRUCache } from "lru-cache";
import { RATE_LIMIT } from "@/lib/constants";

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

const defaultConfig: RateLimitConfig = {
  limit: RATE_LIMIT.DEFAULT_LIMIT,
  windowMs: RATE_LIMIT.WINDOW_MS,
};

const caches = new Map<string, LRUCache<string, number[]>>();

function getCache(endpoint: string) {
  let cache = caches.get(endpoint);
  if (!cache) {
    cache = new LRUCache<string, number[]>({
      max: RATE_LIMIT.CACHE_MAX,
      ttl: RATE_LIMIT.WINDOW_MS,
    });
    caches.set(endpoint, cache);
  }
  return cache;
}

export function rateLimit(
  identifier: string,
  endpoint: string = "default",
  config: RateLimitConfig = defaultConfig
): RateLimitResult {
  const cache = getCache(endpoint);
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const hits = (cache.get(identifier) ?? []).filter((t) => t > windowStart);
  const remaining = Math.max(0, config.limit - hits.length);
  const resetTime = hits.length ? Math.max(...hits) + config.windowMs : now + config.windowMs;
  if (hits.length >= config.limit) {
    cache.set(identifier, hits);
    return { success: false, limit: config.limit, remaining: 0, resetTime };
  }
  hits.push(now);
  cache.set(identifier, hits);
  return { success: true, limit: config.limit, remaining, resetTime };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetTime),
  };
}

function rateLimitSearch(identifier: string) {
  return rateLimit(identifier, "search", {
    limit: RATE_LIMIT.SEARCH_LIMIT,
    windowMs: RATE_LIMIT.WINDOW_MS,
  });
}

function rateLimitClick(identifier: string) {
  return rateLimit(identifier, "click", {
    limit: RATE_LIMIT.CLICK_LIMIT,
    windowMs: RATE_LIMIT.WINDOW_MS,
  });
}

export const rateLimiters = {
  search: rateLimitSearch,
  click: rateLimitClick,
};
