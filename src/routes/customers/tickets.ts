// src/routes/customers/tickets.ts
import { Hono } from 'hono';
import * as query from '../../prisma/query.js';
import { customerGuard } from '../../middlewares/authentication/customerGuard.js';

const ticketsRoute = new Hono();

/**
 * Hiển thị vé của khách hàng
 */
ticketsRoute.get('/tickets/:customer_id',customerGuard, async (c) => {
  try {
    const customer_id = parseInt(c.req.param('customer_id'), 10);
    if (isNaN(customer_id)) {
      return c.text('Customer ID không đúng định dạng');
    }
    const response = await query.getTicketOfCustomer(customer_id);
    return c.json(response);
  } catch (error) {
    if (error instanceof Error) {
      return c.text(error.message);
    }
  }
});

/**
 * Hủy vé
 */
ticketsRoute.put('/tickets/:reservation_id',customerGuard, async (c) => {
  try {
    const reservation_id = parseInt(c.req.param('reservation_id'), 10);
    if (isNaN(reservation_id)) {
      return c.text('Reservation ID không đúng định dạng');
    }
    await query.cancelTicket(reservation_id);
    return c.text('Hủy vé thành công');
  } catch (error) {
    if (error instanceof Error) {
      return c.text(error.message);
    }
  }
});

/**
 * Đặt vé
 */
ticketsRoute.post('/tickets', async (c) => {
  try {
    const { customer_id, flight_id, seat_number, ticket_class, ticket_price, booking_date } = await c.req.json();
    if (!customer_id || !flight_id || !seat_number || !ticket_class || !ticket_price || !booking_date) {
      return c.text('Thiếu tham số');
    }
    await query.bookTicket(customer_id, flight_id, seat_number, ticket_class, ticket_price, booking_date);
    return c.text('Đặt vé thành công');
  } catch (error) {
    if (error instanceof Error) {
      return c.text(error.message);
    }
  }
});

export default ticketsRoute;
