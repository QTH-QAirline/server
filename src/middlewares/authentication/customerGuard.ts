// middlewares/auth/customerAuth.ts
import { MiddlewareHandler } from 'hono';
import { jwtValidator } from './jwtValidator';

export const customerGuard: MiddlewareHandler = async (c, next) => {
  // Chạy jwtAuth và dừng lại nếu có lỗi
  const authResult = await jwtValidator(c, next);
  if (authResult) return authResult;

  const user = c.get('user');
  if (user?.role !== 'CUSTOMER') {
    return c.json({ error: 'Bạn không có quyền truy cập! Chỉ khách hàng được phép.' }, 403);
  }

  await next();
};
