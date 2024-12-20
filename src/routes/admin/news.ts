import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminAuth } from '../../middlewares/adminAuth';

const prisma = new PrismaClient();
const adminNews = new Hono();

// Lấy danh sách tất cả tin tức (chỉ admin mới được phép)
adminNews.get('/news', adminAuth, async (c) => {
  try {
    const newsList = await prisma.news.findMany();
    return c.json(newsList);
  } catch (error) {
    return c.json({ error: 'Không thể lấy danh sách tin tức!', message: (error as Error).message }, 500);
  }
});

// Lấy thông tin chi tiết của một tin tức theo ID
adminNews.get('/news/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    const newsItem = await prisma.news.findUnique({
      where: { news_id: id },
    });

    if (!newsItem) {
      return c.json({ error: 'Tin tức không tồn tại!' }, 404);
    }

    return c.json(newsItem);
  } catch (error) {
    return c.json({ error: 'Không thể lấy thông tin tin tức!', message: (error as Error).message }, 500);
  }
});

// Thêm một tin tức mới
adminNews.post('/news', adminAuth, async (c) => {
  const data = await c.req.json();

  try {
    const newNews = await prisma.news.create({ data });
    return c.json(newNews);
  } catch (error) {
    return c.json({ error: 'Không thể tạo tin tức mới!', message: (error as Error).message }, 500);
  }
});

// Cập nhật thông tin tin tức theo ID
adminNews.put('/news/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();

  try {
    const updatedNews = await prisma.news.update({
      where: { news_id: id },
      data,
    });

    return c.json(updatedNews);
  } catch (error) {
    return c.json({ error: 'Không thể cập nhật tin tức!', message: (error as Error).message }, 500);
  }
});

// Xóa một tin tức theo ID
adminNews.delete('/news/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    await prisma.news.delete({
      where: { news_id: id },
    });

    return c.json({ message: 'Xóa tin tức thành công!' });
  } catch (error) {
    return c.json({ error: 'Không thể xóa tin tức!', message: (error as Error).message }, 500);
  }
});

export default adminNews;
