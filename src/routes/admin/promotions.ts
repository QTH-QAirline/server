import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';
import * as query from '../../prisma/query.js';



const prisma = new PrismaClient();
const adminPromotions = new Hono();

/**
 * Tạo khuyến mại cho chuyến bay
 */
adminPromotions.post("/promotion",adminGuard, async(c) => {
  try {
      const {flight_id, title, description, discount_rate, start_date, end_date} = await c.req.json();
      if(!flight_id || !title || !description || !discount_rate || !start_date || !end_date) {
          return c.text("Thiếu tham số");
      }
      const response = await query.addPromotions(flight_id, title, description, discount_rate, start_date, end_date);
      return c.text("Tạo mã khuyễn mại cho chuyến bay mã " + flight_id + " thành công");
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
});

/**
* Xoá mã khuyến mại
*/
adminPromotions.delete("/promotion/:id",adminGuard, async(c) => {
  try {
      const id = parseInt(c.req.param("id"), 10);
      query.deletePromotion(id);
      return c.text("Xoá mã khuyến mại thành công");
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
});

export default adminPromotions;
