// middlewares/auth/customerAuth.ts
import { MiddlewareHandler } from 'hono';
import { jwtValidator } from './jwtValidator';

export const customerGuard: MiddlewareHandler = async (c, next) => {
  console.log('customerGuard được gọi');
  const authResult = await jwtValidator(c, next);
  if (authResult) {
    console.log('jwtValidator đã trả về response');
    return authResult;
  }

  const user = c.get('user');
  console.log('User:', user);

  if (user?.role !== 'CUSTOMER') {
    console.log('Không phải khách hàng');
    return c.json({ error: 'Bạn không có quyền truy cập! Chỉ khách hàng được phép.' }, 403);
  }

  console.log('Xác thực thành công');
  await next();
};
