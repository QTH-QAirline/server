import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';
import * as query from '../../prisma/query.js';



const prisma = new PrismaClient();
const adminNews = new Hono();

/**
 * Đăng tin tức
 */
adminNews.post("/news",adminGuard, async (c) => {
  try {
      const {title, content, category, date} = await c.req.json();
      if(!title || !content || !category || !date) 
          return c.text("Thiếu tham số");
      const response = await query.addNews(title, content, category, date);
      return c.text("Đăng thông tin thành công với newId là " + response);
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
});

/**
* Sửa tin 
*/
adminNews.put("/news",adminGuard, async (c) => {
  try {
      const {news_id, title, content, category, date} = await c.req.json();
      if(!news_id || !title || !content || !category || !date) 
          return c.text("Thiếu tham số");
      const response = await query.updateNews(news_id, title, content, category, date);
      return c.text("Sửa thông tin thành công");
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
});

/**
* Xoá tin
*/
adminNews.delete("/news/:news_id",adminGuard, async (c) => {
  try {
      const news_id = parseInt(c.req.param("news_id"), 10);
      if (isNaN(news_id)) {
          return c.text("NewsId không đúng định dạng");
        }
      const response = await query.deleteNews(news_id);
      return c.text("Gỡ thông tin thành công");
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
});
export default adminNews;
