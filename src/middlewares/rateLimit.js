const ApiError = require("../utils/ApiError");

/**
 * In-memory rate limiter suitable for single-instance deployments.
 * @param {{ windowMs: number, max: number, keyGenerator?: (req: import("express").Request) => string }} config
 * @returns {import("express").RequestHandler}
 */
function createRateLimiter(config) {
  const hits = new Map();
  const windowMs = config.windowMs;
  const max = config.max;
  const keyGenerator = config.keyGenerator || ((req) => req.ip || "unknown");

  return function rateLimiter(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();
    const current = hits.get(key);

    if (!current || current.expiresAt <= now) {
      hits.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    current.count += 1;
    hits.set(key, current);

    const remaining = Math.max(max - current.count, 0);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.expiresAt / 1000)));

    if (current.count > max) {
      return next(new ApiError(429, "RATE_LIMIT_EXCEEDED", "Too many requests, please try again later"));
    }

    return next();
  };
}

module.exports = {
  createRateLimiter,
};
