import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';


const prisma = new PrismaClient();
const adminPromotions = new Hono();

// Lấy danh sách tất cả khuyến mãi (chỉ admin mới được phép)
adminPromotions.get('/promotions', adminGuard, async (c) => {
  try {
    const promotions = await prisma.promotions.findMany();
    return c.json(promotions);
  } catch (error) {
    return c.json({ error: 'Không thể lấy danh sách khuyến mãi!', message: (error as Error).message }, 500);
  }
});

// Lấy thông tin chi tiết của một khuyến mãi theo ID
adminPromotions.get('/promotions/:id', adminGuard, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    const promotion = await prisma.promotions.findUnique({
      where: { promotion_id: id },
    });

    if (!promotion) {
      return c.json({ error: 'Khuyến mãi không tồn tại!' }, 404);
    }

    return c.json(promotion);
  } catch (error) {
    return c.json({ error: 'Không thể lấy thông tin khuyến mãi!', message: (error as Error).message }, 500);
  }
});

// Thêm một khuyến mãi mới
adminPromotions.post('/promotions', adminGuard, async (c) => {
  const data = await c.req.json();

  try {
    const newPromotion = await prisma.promotions.create({ data });
    return c.json(newPromotion);
  } catch (error) {
    return c.json({ error: 'Không thể tạo khuyến mãi mới!', message: (error as Error).message }, 500);
  }
});

// Cập nhật thông tin khuyến mãi theo ID
adminPromotions.put('/promotions/:id', adminGuard, async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();

  try {
    const updatedPromotion = await prisma.promotions.update({
      where: { promotion_id: id },
      data,
    });

    return c.json(updatedPromotion);
  } catch (error) {
    return c.json({ error: 'Không thể cập nhật khuyến mãi!', message: (error as Error).message }, 500);
  }
});

// Xóa một khuyến mãi theo ID
adminPromotions.delete('/promotions/:id', adminGuard, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    await prisma.promotions.delete({
      where: { promotion_id: id },
    });

    return c.json({ message: 'Xóa khuyến mãi thành công!' });
  } catch (error) {
    return c.json({ error: 'Không thể xóa khuyến mãi!', message: (error as Error).message }, 500);
  }
});

export default adminPromotions;
