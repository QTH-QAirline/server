import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { zValidator } from '@hono/zod-validator';
import { SignJWT, JWTPayload } from 'jose';
import { loginSchema } from '../../utils/validators';

const prisma = new PrismaClient();
const adminAuthRoute = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

/**
 * Hàm tạo token JWT cho admin
 */


const createToken = async (payload: JWTPayload, expiresIn: string) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(JWT_SECRET));
};

/**
 * Đăng nhập admin và tạo token JWT
 */
adminAuthRoute.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');

    const admin = await prisma.admin_users.findUnique({ where: { email } });
    if (!admin || !(await Bun.password.verify(password, admin.password_hash))) {
      return c.json({ error: 'Email hoặc mật khẩu không chính xác!' }, 400);
    }

    // Tạo token JWT với thời gian hết hạn 1 giờ
    const token = await createToken(
      { admin_id: admin.admin_id, email: admin.email, role: 'ADMIN' },
      '1h' // Token hết hạn sau 1 giờ
    );

    return c.json({ message: 'Đăng nhập thành công!', token });
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi đăng nhập!', details: (error as Error).message }, 500);
  }
});

export default adminAuthRoute;
