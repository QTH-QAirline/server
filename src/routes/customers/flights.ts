import { Hono } from 'hono';
import * as query from '../../prisma/query.js';



const flightsRoute = new Hono();

/**
 * Tìm kiếm chuyến bay (bảo vệ bởi customerGuard)
 */
flightsRoute.post('/flights', async (c) => {
  try {
    const {from, to, departure_time, person, ticket_class } = await c.req.json();

    if (!from || !to || !departure_time || !person || !ticket_class) {
      return c.text("Thiếu tham số"); 
    }

    const departure = await query.searchFlights(from, to, departure_time, person, ticket_class);

    return c.json(departure); 
  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});

/**
 * Gợi ý chuyến bay (bảo vệ bởi customerGuard)
 */
flightsRoute.put("/flights", async (c) => {
  try {
    const {from, date} = await c.req.json();

    if (!from || !date) {
      return c.text("Thiếu tham số"); 
    }

    const response = await query.suggestion(from, date);

    return c.json(response); 

  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});
export default flightsRoute;
