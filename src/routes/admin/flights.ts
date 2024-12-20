import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';


const prisma = new PrismaClient();
const adminFlights = new Hono();

// Lấy danh sách tất cả chuyến bay (chỉ admin mới được phép)
adminFlights.get('/flights', adminGuard, async (c) => {
  try {
    const flights = await prisma.flights.findMany({
      include: {
        airports_flights_departure_airportToairports: true,
        airports_flights_arrival_airportToairports: true,
        aircrafts: true,
      },
    });
    return c.json(flights);
  } catch (error) {
    return c.json({ error: 'Không thể lấy danh sách chuyến bay!', message: (error as Error).message }, 500);
  }
});

// Lấy thông tin chi tiết của một chuyến bay theo ID
adminFlights.get('/flights/:id', adminGuard, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    const flight = await prisma.flights.findUnique({
      where: { flight_id: id },
      include: {
        airports_flights_departure_airportToairports: true,
        airports_flights_arrival_airportToairports: true,
        aircrafts: true,
      },
    });

    if (!flight) {
      return c.json({ error: 'Chuyến bay không tồn tại!' }, 404);
    }

    return c.json(flight);
  } catch (error) {
    return c.json({ error: 'Không thể lấy thông tin chuyến bay!', message: (error as Error).message }, 500);
  }
});

// Thêm một chuyến bay mới
adminFlights.post('/flights', adminGuard, async (c) => {
  const data = await c.req.json();

  try {
    const flight = await prisma.flights.create({ data });
    return c.json(flight);
  } catch (error) {
    return c.json({ error: 'Không thể tạo chuyến bay mới!', message: (error as Error).message }, 500);
  }
});

// Cập nhật thông tin chuyến bay theo ID
adminFlights.put('/flights/:id', adminGuard, async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();

  try {
    const updatedFlight = await prisma.flights.update({
      where: { flight_id: id },
      data,
    });

    return c.json(updatedFlight);
  } catch (error) {
    return c.json({ error: 'Không thể cập nhật chuyến bay!', message: (error as Error).message }, 500);
  }
});

// Xóa một chuyến bay theo ID
adminFlights.delete('/flights/:id', adminGuard, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    await prisma.flights.delete({
      where: { flight_id: id },
    });

    return c.json({ message: 'Xóa chuyến bay thành công!' });
  } catch (error) {
    return c.json({ error: 'Không thể xóa chuyến bay!', message: (error as Error).message }, 500);
  }
});

export default adminFlights;
