// middlewares/auth/jwtAuth.ts
import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export const jwtValidator: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token không tồn tại hoặc không hợp lệ!' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = await verify(token, JWT_SECRET);
    c.set('user', payload); // Lưu payload vào context
    await next();
  } catch (error) {
    return c.json({ error: 'Token không hợp lệ hoặc đã hết hạn!' }, 401);
  }
};
