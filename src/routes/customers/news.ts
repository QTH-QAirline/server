import { Hono } from "hono";
import * as query from '../../prisma/query.js';

const news = new Hono();

/**
 * Tin tức
 */
news.get("/news", async (c) => {
  try {
    const response = await query.news();
    return c.json(response); 
  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});
export default news;
