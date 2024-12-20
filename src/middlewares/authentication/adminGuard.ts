// middlewares/auth/adminAuth.ts
import { MiddlewareHandler } from 'hono';
import { jwtValidator } from './jwtValidator';

export const adminGuard: MiddlewareHandler = async (c, next) => {
  // Chạy jwtAuth và dừng lại nếu có lỗi
  const authResult = await jwtValidator(c, next);
  if (authResult) return authResult;

  const user = c.get('user');
  if (user?.role !== 'ADMIN') {
    return c.json({ error: 'Bạn không có quyền truy cập! Chỉ admin được phép.' }, 403);
  }

  await next();
};
