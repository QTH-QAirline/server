import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';
import * as query from '../../prisma/query.js';


const prisma = new PrismaClient();
const adminFlights = new Hono();

/**
 * Nhập dữ liệu chuyến bay
 */
adminFlights.post("/flight", adminGuard, async (c) => {
  try {
      const {aircraft_id, departure_airport, arrival_airport, departure_time, arrival_time, base_price, created_at} = await c.req.json();
      if(!aircraft_id || !departure_airport || !arrival_airport || !departure_time || !arrival_time || !base_price || !created_at) 
          return c.text("Thiếu tham số");
      const response = await query.addFlight(aircraft_id, departure_airport, arrival_airport, departure_time, arrival_time, base_price, created_at);
      return c.json(response);
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
});

/**
 * Delay
 */
adminFlights.put("/flight", adminGuard, async (c) => {
  try {
      const {flight_id, reason, delay_date} = await c.req.json();
      if(!flight_id || !reason || !delay_date) 
          return c.text("Thiếu tham số");
      const response = await query.delay(flight_id, reason, delay_date);
      return c.text("Cập nhật thay đổi giờ bay thành công");
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
});

/**
 * Thống kê đặt vé của chuyến bay
 */
adminFlights.get("/flight/:id", adminGuard, async(c) => {
  try{
      const id = parseInt(c.req.param("id"), 10);
      const response = await query.summarizeFlight(id);
      return c.json(response);
  } catch(error) {
      if (error instanceof Error) {
          return c.text(error.message);
      }
  }
})

adminFlights.get("/flight", adminGuard, async(c) => {
    const response = await query.getFlight();
    return c.json(response);
});
/**
 * test
 */
adminFlights.get("/test", async(c) => {
  const response = await query.test();
  var i = 10;
  var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/6)) + (i%6+1);
  console.log(seat_number);
  return c.json(response);
});

export default adminFlights;
