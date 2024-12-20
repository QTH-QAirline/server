import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lấy secret key từ biến môi trường
const SECRET_KEY = process.env.JWT_SECRET || 'your_default_secret_key';

// Middleware xác thực quyền admin
export async function adminAuth(c: Context, next: Next) {
  try {
    // Lấy token từ header Authorization
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Không có token cung cấp!' }, 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Token không hợp lệ!' }, 401);
    }

    // Xác minh token
    const decoded = await verify(token, SECRET_KEY).catch(() => null);
    if (!decoded) {
      return c.json({ error: 'Token không hợp lệ hoặc đã hết hạn!' }, 401);
    }

    // Giải mã payload từ token
    const { adminId, email } = decoded as { adminId: number; email: string };

    // Tìm admin trong bảng admin_users
    const admin = await prisma.admin_users.findUnique({
      where: { admin_id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return c.json({ error: 'Bạn không có quyền truy cập!' }, 403);
    }

    // Gắn thông tin admin vào context để sử dụng trong các route
    c.set('admin', { id: admin.admin_id, email: admin.email, role: admin.role });

    // Chuyển sang middleware hoặc route tiếp theo
    await next();
  } catch (err) {
    return c.json({ error: 'Xác thực thất bại!', message: (err as Error).message }, 401);
  }
}
