const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for analyze endpoint
 * Limits to 3 requests per minute per IP address
 */
const analyzeRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: "Too many analysis requests",
    message:
      "You have exceeded the rate limit of 3 requests per minute. Please try again later.",
    retryAfter: "60 seconds",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    console.log(
      `🚫 Rate limit exceeded for IP: ${req.ip} at ${new Date().toISOString()}`
    );
    res.status(429).json({
      error: "Too many analysis requests",
      message:
        "You have exceeded the rate limit of 3 requests per minute. Please try again later.",
      retryAfter: "60 seconds",
      limit: 3,
      windowMs: 60000,
      ip: req.ip,
    });
  },
  // Skip requests that should not be rate limited
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (
      process.env.NODE_ENV === "development" &&
      (req.ip === "127.0.0.1" ||
        req.ip === "::1" ||
        req.ip === "::ffff:127.0.0.1")
    ) {
      return true;
    }
    return false;
  },
});

/**
 * General API rate limiter
 * More lenient rate limiting for other endpoints
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests",
    message:
      "You have exceeded the general rate limit. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(
      `🚫 General rate limit exceeded for IP: ${
        req.ip
      } at ${new Date().toISOString()}`
    );
    res.status(429).json({
      error: "Too many requests",
      message:
        "You have exceeded the general rate limit of 100 requests per 15 minutes. Please try again later.",
      retryAfter: "15 minutes",
      limit: 100,
      windowMs: 900000,
      ip: req.ip,
    });
  },
});

/**
 * Strict rate limiter for sensitive operations
 */
const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // Limit each IP to 1 request per minute
  message: {
    error: "Rate limit exceeded",
    message: "This endpoint is strictly rate limited to 1 request per minute.",
    retryAfter: "60 seconds",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  analyzeRateLimit,
  generalRateLimit,
  strictRateLimit,
};
