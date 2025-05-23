import { MiddlewareHandler } from 'hono';

/**
 * Middleware ghi log request và response với thông tin chi tiết
 */
export const logger: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const ip = c.req.header('X-Forwarded-For') || c.req.raw.headers['x-real-ip'];

  await next();

  const duration = Date.now() - startTime;
  const status = c.res.status;

  console.log(`[${new Date().toISOString()}] ${method} ${url} ${status} ${duration}ms - IP: ${ip}`);
};
