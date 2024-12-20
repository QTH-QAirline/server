import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const airportsRoute = new Hono();

/**
 * Lấy danh sách tất cả sân bay
 */
airportsRoute.get('/airports', async (c) => {
  try {
    const airports = await prisma.airports.findMany();
    return c.json(airports);
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi lấy danh sách sân bay!', details: (error as Error).message }, 500);
  }
});

/**
 * Lấy thông tin chi tiết một sân bay theo airport_id
 */
airportsRoute.get('/airports/:airport_id', async (c) => {
  try {
    const airport_id = parseInt(c.req.param('airport_id'), 10);
    if (isNaN(airport_id)) {
      return c.json({ error: 'Airport ID không đúng định dạng!' }, 400);
    }

    const airport = await prisma.airports.findUnique({
      where: { airport_id },
    });

    if (!airport) {
      return c.json({ error: 'Không tìm thấy sân bay!' }, 404);
    }

    return c.json(airport);
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi lấy thông tin sân bay!', details: (error as Error).message }, 500);
  }
});

/**
 * Tìm kiếm sân bay theo tên hoặc mã IATA
 */
airportsRoute.get('/airports/search', async (c) => {
  try {
    const query = c.req.query('q');
    if (!query) {
      return c.json({ error: 'Vui lòng cung cấp từ khóa tìm kiếm!' }, 400);
    }

    const airports = await prisma.airports.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { iata_code: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    if (airports.length === 0) {
      return c.json({ message: 'Không tìm thấy sân bay phù hợp!' }, 404);
    }

    return c.json(airports);
  } catch (error) {
    return c.json({ error: 'Đã xảy ra lỗi khi tìm kiếm sân bay!', details: (error as Error).message }, 500);
  }
});

export default airportsRoute;
