import { cors } from 'hono/cors';

/**
 * Middleware CORS để cấu hình Cross-Origin Resource Sharing
 */
export default cors({
  origin: (origin) => {
    // Lấy danh sách origin từ biến môi trường, mặc định cho phép tất cả ('*')
    const allowedOrigins = ['http://localhost:3000'];

    // Nếu origin không có hoặc nằm trong danh sách được phép thì cho phép
    if (!origin || allowedOrigins.includes(origin)) {
      return origin;
    }

    // Nếu origin không được phép, trả về null (ngăn chặn request)
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
