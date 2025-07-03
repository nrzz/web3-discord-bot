const rateLimit = require('express-rate-limit');
const logger = require('./logger');

// In-memory store for rate limiting (in production, use Redis)
// const rateLimitStore = new Map();

class RateLimiter {
  constructor () {
    this.limits = new Map();
  }

  // Check if user is rate limited
  isRateLimited (userId, commandName, maxRequests = 5, windowMs = 60000) {
    const key = `${userId}:${commandName}`;
    const now = Date.now();

    if (!this.limits.has(key)) {
      this.limits.set(key, {
        requests: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    const limit = this.limits.get(key);

    // Reset if window has passed
    if (now > limit.resetTime) {
      this.limits.set(key, {
        requests: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    // Check if limit exceeded
    if (limit.requests >= maxRequests) {
      logger.warn(`Rate limit exceeded for user ${userId} on command ${commandName}`);
      return true;
    }

    // Increment request count
    limit.requests++;
    return false;
  }

  // Get remaining requests for user
  getRemainingRequests (userId, commandName) {
    const key = `${userId}:${commandName}`;
    const limit = this.limits.get(key);

    if (!limit) {
      return 5; // Default max requests
    }

    const now = Date.now();
    if (now > limit.resetTime) {
      return 5;
    }

    return Math.max(0, 5 - limit.requests);
  }

  // Get reset time for user
  getResetTime (userId, commandName) {
    const key = `${userId}:${commandName}`;
    const limit = this.limits.get(key);

    if (!limit) {
      return Date.now() + 60000;
    }

    return limit.resetTime;
  }

  // Clean up expired entries
  cleanup () {
    const now = Date.now();
    for (const [key, limit] of this.limits.entries()) {
      if (now > limit.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Create global rate limiter instance
const globalRateLimiter = new RateLimiter();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  globalRateLimiter.cleanup();
}, 5 * 60 * 1000);

// Setup rate limiting for HTTP endpoints
function setupRateLimiting () {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000)
      });
    }
  });
}

module.exports = {
  globalRateLimiter,
  setupRateLimiting
};
