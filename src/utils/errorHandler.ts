import { Context } from 'hono';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Middleware xử lý lỗi tập trung cho ứng dụng Hono
 */
export const errorHandler = (err: unknown, c: Context) => {
  console.error(err); // Ghi log lỗi ra console để debug

  // Xử lý lỗi từ Zod (Validation Error)
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'Dữ liệu không hợp lệ!',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      400
    );
  }

  // Xử lý lỗi từ Prisma (Database Error)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return c.json(
      {
        success: false,
        error: 'Lỗi cơ sở dữ liệu!',
        code: err.code,
        message: err.message,
      },
      500
    );
  }

  // Xử lý lỗi không mong muốn khác
  return c.json(
    {
      success: false,
      error: 'Đã xảy ra lỗi!',
      message: (err as Error).message || 'Lỗi không xác định',
    },
    500
  );
};
