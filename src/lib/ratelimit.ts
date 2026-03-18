import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter for the /api/auth/login endpoint.
 * Allows 5 login attempts per 15-minute sliding window per IP.
 *
 * Falls back gracefully if Upstash env vars are not set (dev mode).
 */
function createRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[ratelimit] Upstash env vars not set — rate limiting is DISABLED. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production."
    );
    return null;
  }

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: false,
    prefix: "clinic:ratelimit:login",
  });
}

export const loginRateLimiter = createRateLimiter();

/**
 * Check the rate limit for a given identifier (IP address).
 * Returns { success: true } if allowed, { success: false, reset } if blocked.
 */
export async function checkLoginRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining?: number;
  reset?: Date;
}> {
  if (!loginRateLimiter) {
    // Dev mode — always allow
    return { success: true };
  }

  const result = await loginRateLimiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: new Date(result.reset),
  };
}

/**
 * General-purpose rate limiter for public form submissions
 * (contact form, appointment booking): 10 requests per hour per IP.
 */
function createFormRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 m"),
    analytics: false,
    prefix: "clinic:ratelimit:form",
  });
}

export const formRateLimiter = createFormRateLimiter();

export async function checkFormRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining?: number;
}> {
  if (!formRateLimiter) return { success: true };

  const result = await formRateLimiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
