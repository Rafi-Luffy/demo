import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  requestCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  slowRequests: number;
  errorCount: number;
  routes: Map<string, {
    count: number;
    totalTime: number;
    averageTime: number;
    errors: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    slowRequests: 0,
    errorCount: 0,
    routes: new Map()
  };

  private slowRequestThreshold = 1000; // 1 second

  updateMetrics(req: Request, responseTime: number, isError: boolean = false): void {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;

    if (responseTime > this.slowRequestThreshold) {
      this.metrics.slowRequests++;
    }

    if (isError) {
      this.metrics.errorCount++;
    }

    // Track per-route metrics
    const routeKey = `${req.method} ${req.route?.path || req.path}`;
    const routeMetrics = this.metrics.routes.get(routeKey) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      errors: 0
    };

    routeMetrics.count++;
    routeMetrics.totalTime += responseTime;
    routeMetrics.averageTime = routeMetrics.totalTime / routeMetrics.count;

    if (isError) {
      routeMetrics.errors++;
    }

    this.metrics.routes.set(routeKey, routeMetrics);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getSlowestRoutes(limit = 10): Array<{ route: string; averageTime: number; count: number; errorRate: number }> {
    return Array.from(this.metrics.routes.entries())
      .map(([route, metrics]) => ({
        route,
        averageTime: metrics.averageTime,
        count: metrics.count,
        errorRate: (metrics.errors / metrics.count) * 100
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, limit);
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorCount: 0,
      routes: new Map()
    };
  }
}

const performanceMonitor = new PerformanceMonitor();

// Performance monitoring middleware
export function performanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = performance.now();

  // Store original end method
  const originalEnd = res.end;

  // Override end method to capture response time
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const isError = res.statusCode >= 400;

    performanceMonitor.updateMetrics(req, responseTime, isError);

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`🐌 Slow request detected: ${req.method} ${req.path} took ${responseTime.toFixed(2)}ms`);
    }

    // Add performance headers
    res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
    res.setHeader('X-Request-ID', req.headers['x-request-id'] || 'unknown');

    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
}

// Middleware to expose performance metrics endpoint
export function performanceMetricsEndpoint(req: Request, res: Response): void {
  const metrics = performanceMonitor.getMetrics();
  const slowestRoutes = performanceMonitor.getSlowestRoutes();

  res.json({
    success: true,
    data: {
      overview: {
        totalRequests: metrics.requestCount,
        averageResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
        slowRequests: metrics.slowRequests,
        errorCount: metrics.errorCount,
        errorRate: `${((metrics.errorCount / metrics.requestCount) * 100).toFixed(2)}%`,
        uptime: process.uptime()
      },
      slowestRoutes,
      systemMetrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    }
  });
}

// Blockchain-specific performance tracking
export function blockchainPerformanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = performance.now();

  // Store original json method
  const originalJson = res.json;

  res.json = function(data: any) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Log blockchain operation performance
    console.log(`⛓️  Blockchain operation: ${req.method} ${req.path} completed in ${responseTime.toFixed(2)}ms`);

    // Add blockchain-specific headers
    res.setHeader('X-Blockchain-Response-Time', `${responseTime.toFixed(2)}ms`);
    res.setHeader('X-Network', (req.query.network as string) || 'polygon');

    return originalJson.call(this, data);
  };

  next();
}

export { performanceMonitor };
