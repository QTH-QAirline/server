import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminAuth } from '../../middlewares/adminAuth';

const prisma = new PrismaClient();
const adminCustomers = new Hono();

// Lấy danh sách tất cả khách hàng (chỉ admin mới được phép)
adminCustomers.get('/customers', adminAuth, async (c) => {
  try {
    const customers = await prisma.customers.findMany();
    return c.json(customers);
  } catch (error) {
    return c.json({ error: 'Không thể lấy danh sách khách hàng!', message: (error as Error).message }, 500);
  }
});

// Lấy thông tin chi tiết của một khách hàng theo ID
adminCustomers.get('/customers/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    const customer = await prisma.customers.findUnique({
      where: { customer_id: id },
    });

    if (!customer) {
      return c.json({ error: 'Khách hàng không tồn tại!' }, 404);
    }

    return c.json(customer);
  } catch (error) {
    return c.json({ error: 'Không thể lấy thông tin khách hàng!', message: (error as Error).message }, 500);
  }
});

// Xóa một khách hàng theo ID
adminCustomers.delete('/customers/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    await prisma.customers.delete({
      where: { customer_id: id },
    });

    return c.json({ message: 'Xóa khách hàng thành công!' });
  } catch (error) {
    return c.json({ error: 'Không thể xóa khách hàng!', message: (error as Error).message }, 500);
  }
});

// Cập nhật thông tin khách hàng theo ID
adminCustomers.put('/customers/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();

  try {
    const updatedCustomer = await prisma.customers.update({
      where: { customer_id: id },
      data,
    });

    return c.json(updatedCustomer);
  } catch (error) {
    return c.json({ error: 'Không thể cập nhật khách hàng!', message: (error as Error).message }, 500);
  }
});

export default adminCustomers;
