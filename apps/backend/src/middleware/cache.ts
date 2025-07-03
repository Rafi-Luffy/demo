import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { AuthenticatedRequest } from '../types/index.js';

// In-memory cache for demonstration (in production, use Redis)
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to implement hit/miss tracking
      misses: 0
    };
  }
}

const cache = new MemoryCache();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Generate cache key from request
function generateCacheKey(req: Request): string {
  const { method, path, query, params } = req;
  const authReq = req as AuthenticatedRequest;
  const keyData = {
    method,
    path,
    query,
    params,
    user: authReq.user?.id || 'anonymous'
  };
  
  return createHash('md5')
    .update(JSON.stringify(keyData))
    .digest('hex');
}

// Cache middleware for GET requests
export function cacheMiddleware(ttl = 5 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', cacheKey);
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data: any) {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, ttl);
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

// Cache invalidation middleware for write operations
export function invalidateCacheMiddleware(patterns: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json;

    res.json = function(data: any) {
      // Invalidate cache on successful write operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Clear specific cache patterns
        if (patterns.length > 0) {
          // Implementation would depend on more sophisticated cache key management
          // For now, clear all cache
          cache.clear();
        } else {
          cache.clear();
        }
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

// Polygon-specific cache for blockchain data
export function polygonCacheMiddleware(ttl = 30 * 1000) { // 30 seconds for blockchain data
  return cacheMiddleware(ttl);
}

// Campaign cache for frequently accessed campaigns
export function campaignCacheMiddleware(ttl = 2 * 60 * 1000) { // 2 minutes
  return cacheMiddleware(ttl);
}

// Donation cache for analytics
export function donationCacheMiddleware(ttl = 1 * 60 * 1000) { // 1 minute
  return cacheMiddleware(ttl);
}

export { cache };
