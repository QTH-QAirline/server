import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { zValidator } from '@hono/zod-validator';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../utils/validators';
import { sendResetPasswordEmail } from '../../utils/email/templates/resetPassword';
import { SignJWT, JWTPayload } from 'jose';

const prisma = new PrismaClient();
const customerAuthRoute = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

/**
 * Hàm tạo token JWT
 */


const createToken = async (payload: JWTPayload, expiresIn: string) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(JWT_SECRET));
};

/**
 * Đăng ký khách hàng mới
 */
customerAuthRoute.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { name, email, password, phone } = c.req.valid('json');

    const existingUser = await prisma.customers.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ error: 'Email đã tồn tại!' }, 400);
    }

    const hashedPassword = await Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    const newUser = await prisma.customers.create({
      data: { name, email, password_hash: hashedPassword, phone },
    });

    return c.json({ message: 'Tạo tài khoản thành công!', user: newUser });
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi đăng ký!', details: (error as Error).message }, 500);
  }
});

/**
 * Đăng nhập khách hàng và tạo token JWT
 */
customerAuthRoute.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');

    const user = await prisma.customers.findUnique({ where: { email } });
    if (!user || !(await Bun.password.verify(password, user.password_hash))) {
      return c.json({ error: 'Email hoặc mật khẩu không chính xác!' }, 400);
    }

    // Tạo token JWT với thời gian hết hạn 7 ngày
    const token = await createToken({ customer_id: user.customer_id, email: user.email, role: 'CUSTOMER' }, '7d');

    return c.json({ message: 'Đăng nhập thành công!', token });
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi đăng nhập!', details: (error as Error).message }, 500);
  }
});

/**
 * Yêu cầu đặt lại mật khẩu
 */
customerAuthRoute.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  try {
    const { email } = c.req.valid('json');

    const user = await prisma.customers.findUnique({ where: { email } });
    if (!user) {
      return c.json({ error: 'Email không tồn tại!' }, 404);
    }

    const resetToken = Bun.randomUUIDv7();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // Token hết hạn sau 1 giờ

    await prisma.customers.update({
      where: { email },
      data: { reset_token: resetToken, reset_token_expires: resetTokenExpires },
    });

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    if (!process.env.SUPPORT_EMAIL) {
      return c.json({ error: 'Support email is not configured!' }, 500);
    }

    await sendResetPasswordEmail({ toEmail: email, toName: user.name, resetLink, supportEmail: process.env.SUPPORT_EMAIL });

    return c.json({ message: 'Email đặt lại mật khẩu đã được gửi!' });
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu!', details: (error as Error).message }, 500);
  }
});

/**
 * Đặt lại mật khẩu mới
 */
customerAuthRoute.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  try {
    const { token, newPassword } = c.req.valid('json');

    const user = await prisma.customers.findFirst({
      where: { reset_token: token, reset_token_expires: { gt: new Date() } },
    });

    if (!user) {
      return c.json({ error: 'Token không hợp lệ hoặc đã hết hạn!' }, 400);
    }

    const hashedPassword = await Bun.password.hash(newPassword, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    await prisma.customers.update({
      where: { customer_id: user.customer_id },
      data: { password_hash: hashedPassword, reset_token: null, reset_token_expires: null },
    });

    return c.json({ message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi đặt lại mật khẩu!', details: (error as Error).message }, 500);
  }
});

export default customerAuthRoute;
