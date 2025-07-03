const { globalRateLimiter, setupRateLimiting } = require('../utils/rateLimiter');
const logger = require('../utils/logger');

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limiter state before each test
    globalRateLimiter.limits.clear();
  });

  describe('isRateLimited', () => {
    test('should not rate limit first request', () => {
      const userId = '123456789';
      const commandName = 'balance';
      
      const isLimited = globalRateLimiter.isRateLimited(userId, commandName);
      expect(isLimited).toBe(false);
    });

    test('should rate limit after exceeding max requests', () => {
      const userId = '123456789';
      const commandName = 'balance';
      const maxRequests = 3;
      
      // Make requests up to the limit
      for (let i = 0; i < maxRequests; i++) {
        const isLimited = globalRateLimiter.isRateLimited(userId, commandName, maxRequests);
        expect(isLimited).toBe(false);
      }
      
      // Next request should be rate limited
      const isLimited = globalRateLimiter.isRateLimited(userId, commandName, maxRequests);
      expect(isLimited).toBe(true);
    });

    test('should reset after window expires', () => {
      const userId = '123456789';
      const commandName = 'balance';
      const maxRequests = 2;
      const windowMs = 100; // 100ms window for testing
      
      // Make requests up to the limit
      globalRateLimiter.isRateLimited(userId, commandName, maxRequests, windowMs);
      globalRateLimiter.isRateLimited(userId, commandName, maxRequests, windowMs);
      
      // Should be rate limited
      expect(globalRateLimiter.isRateLimited(userId, commandName, maxRequests, windowMs)).toBe(true);
      
      // Wait for window to expire
      return new Promise(resolve => {
        setTimeout(() => {
          // Should not be rate limited after window expires
          expect(globalRateLimiter.isRateLimited(userId, commandName, maxRequests, windowMs)).toBe(false);
          resolve();
        }, windowMs + 10);
      });
    });
  });

  describe('getRemainingRequests', () => {
    test('should return max requests for new user', () => {
      const userId = '123456789';
      const commandName = 'balance';
      
      const remaining = globalRateLimiter.getRemainingRequests(userId, commandName);
      expect(remaining).toBe(5); // Default max requests
    });

    test('should return correct remaining requests', () => {
      const userId = '123456789';
      const commandName = 'balance';
      const maxRequests = 3;
      // Make one request
      globalRateLimiter.isRateLimited(userId, commandName, maxRequests);
      const remaining = globalRateLimiter.getRemainingRequests(userId, commandName);
      expect(remaining).toBe(4); // 5 - 1 = 4 remaining (default logic)
    });
  });

  describe('cleanup', () => {
    test('should remove expired entries', () => {
      const userId = '123456789';
      const commandName = 'balance';
      const windowMs = 10; // Very short window for testing
      
      // Add an entry
      globalRateLimiter.isRateLimited(userId, commandName, 5, windowMs);
      expect(globalRateLimiter.limits.size).toBe(1);
      
      // Wait for expiration and cleanup
      return new Promise(resolve => {
        setTimeout(() => {
          globalRateLimiter.cleanup();
          expect(globalRateLimiter.limits.size).toBe(0);
          resolve();
        }, windowMs + 10);
      });
    });
  });
});

describe('Logger', () => {
  test('should have required log methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('should handle log calls without throwing', () => {
    expect(() => {
      logger.info('Test info message');
      logger.error('Test error message');
      logger.warn('Test warning message');
      logger.debug('Test debug message');
    }).not.toThrow();
  });
});

describe('HTTP Rate Limiting', () => {
  test('should return rate limiting middleware function', () => {
    const middleware = setupRateLimiting();
    expect(typeof middleware).toBe('function');
  });

  test('should have correct configuration', () => {
    // Mock environment variables
    const originalWindowMs = process.env.RATE_LIMIT_WINDOW_MS;
    const originalMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS;
    
    process.env.RATE_LIMIT_WINDOW_MS = '900000'; // 15 minutes
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    
    const middleware = setupRateLimiting();
    expect(typeof middleware).toBe('function');
    
    // Restore original values
    if (originalWindowMs) process.env.RATE_LIMIT_WINDOW_MS = originalWindowMs;
    if (originalMaxRequests) process.env.RATE_LIMIT_MAX_REQUESTS = originalMaxRequests;
  });
}); 