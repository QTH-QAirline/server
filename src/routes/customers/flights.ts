import { Hono } from 'hono';
import * as query from '../../prisma/query.js';



const flightsRoute = new Hono();

/**
 * Tìm kiếm chuyến bay (bảo vệ bởi customerGuard)
 */
flightsRoute.post('/flights', async (c) => {
  try {
    const { kind, from, to, departure_time, arrival_time, person, ticket_class } = await c.req.json();
    if (!from || !to || !departure_time || !person || !ticket_class) {
      return c.text('Thiếu tham số');
    }
    const departure = await query.searchFlights(from, to, departure_time, person, ticket_class);
    if (kind === 'One-way') {
      return c.json(departure);
    }
    const arrival = await query.searchFlights(to, from, arrival_time, person, ticket_class);
    return c.json({ departure, arrival });
  } catch (error) {
    if (error instanceof Error) {
      return c.text(error.message);
    }
  }
});

/**
 * Gợi ý chuyến bay (bảo vệ bởi customerGuard)
 */
flightsRoute.get('/flights/:from', async (c) => {
  try {
    const from = c.req.param('from');
    if (!from) {
      return c.text('Thiếu tham số "from"');
    }
    const response = await query.suggestion(from);
    return c.json(response);
  } catch (error) {
    if (error instanceof Error) {
      return c.text(error.message);
    }
  }
});

export default flightsRoute;
