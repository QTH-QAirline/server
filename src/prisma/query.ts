import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Lấy vé của khách hàng
 */
export async function getTicketOfCustomer(customer_id: number) {
  const tickets = await prisma.reservations.findMany({
    where: { customer_id },
    include: {
      flights: {
        include: {
          airports_flights_departure_airportToairports: true,
          airports_flights_arrival_airportToairports: true,
        },
      },
      tickets: true,
    },
  });

  if (tickets.length === 0) {
    throw new Error("Chưa có chuyến bay nào");
  }

  return tickets;
}

/**
 * Hủy vé đặt
 */
export async function cancelTicket(reservation_id: number) {
  const reservation = await prisma.reservations.findUnique({
    where: { reservation_id },
  });

  if (!reservation) {
    throw new Error(
      `Huỷ vé thất bại do không tồn tại mã đặt chỗ là ${reservation_id}`
    );
  }

  const flight_id = reservation.flight_id;

  const seats = await prisma.tickets.findMany({
    where: { reservation_id },
    select: { seat_number: true },
  });

  await prisma.reservations.update({
    where: { reservation_id },
    data: { status: "Cancelled" },
  });

  await prisma.tickets.updateMany({
    where: { reservation_id },
    data: { status: "Cancelled" },
  });

  for (const seat of seats) {
    await prisma.seat_assignments.updateMany({
      where: {
        flight_id,
        seat_number: seat.seat_number,
      },
      data: { status: "Available" },
    });
  }
}

/**
 * Đặt vé
 */
export async function bookTicket(
  customer_id: number,
  flight_id: number,
  seat_number: string,
  ticket_class: string,
  ticket_price: number,
  booking_date: Date
) {
  const reservation = await prisma.reservations.create({
    data: {
      customer_id,
      flight_id,
      booking_date,
      status: "Confirmed",
    },
  });

  const ticket = await prisma.tickets.create({
    data: {
      reservation_id: reservation.reservation_id,
      seat_number,
      class: ticket_class,
      price: ticket_price,
      status: "Active",
    },
  });

  await prisma.seat_assignments.updateMany({
    where: {
      flight_id,
      seat_number,
      class: ticket_class,
    },
    data: { status: "Booked" },
  });

  return { reservation, ticket };
}

/**
 * Tìm kiếm chuyến bay
 */
export async function searchFlights(
  from: string,
  to: string,
  date: string, // Định dạng 'YYYY-MM-DD'
  person: number,
  ticket_class: string
) {
  try {
    // Chuyển đổi ngày thành khoảng thời gian từ đầu ngày đến cuối ngày
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);


    // Tìm danh sách flight_id có đủ ghế trống
    const list_id = await prisma.seat_assignments.groupBy({
      by: ["flight_id"],
      where: { class: ticket_class, status: "Available" },
      _count: { flight_id: true },
      having: {
        flight_id: {
          _count: { gte: person },
        },
      },
    });

    const flightIds = list_id.map((x) => x.flight_id);

    // Tìm các chuyến bay khớp với ngày khởi hành
    const flights = await prisma.flights.findMany({
      where: {
        flight_id: { in: flightIds },
        airports_flights_departure_airportToairports: { iata_code: from },
        airports_flights_arrival_airportToairports: { iata_code: to },
        departure_time: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        airports_flights_departure_airportToairports: true,
        airports_flights_arrival_airportToairports: true,
        promotions: {
          take: 1,
          where: {
            start_date: { lte: endDate },
            end_date: { gte: startDate },
          },
          orderBy: { discount_rate: "desc" },
          select: { discount_rate: true },
        },
      },
    });



    if (flights.length === 0) {
      throw new Error("Không có chuyến bay nào như bạn yêu cầu");
    }

    return flights;
  } catch (error) {
    throw new Error(`Lỗi tìm kiếm chuyến bay: ${(error as Error).message}`);
  }
}

/**
 * Gợi ý chuyến bay
 */
export async function suggestion(from: string) {
  const places = await prisma.flights.findMany({
    where: {
      airports_flights_departure_airportToairports: { iata_code: from },
    },
    select: {
      base_price: true,
      airports_flights_arrival_airportToairports: {
        select: {
          location: true,
          country: true,
        },
      },
      promotions: {
        take: 1,
        where: {
          start_date: { lt: new Date() },
          end_date: { gt: new Date() },
        },
        orderBy: { discount_rate: "desc" },
        select: { discount_rate: true },
      },
    },
  });

  if (places.length === 0) {
    throw new Error(`Không có chuyến bay nào bắt đầu từ ${from}`);
  }

  return places;
}

/**
 * Lấy tin tức và khuyến mãi
 */
export async function news() {
  const news = await prisma.news.findMany({});
  const promotions = await prisma.promotions.findMany({});
  return { news, promotions };
}

/**
 * Đăng ký khách hàng mới
 */
export async function signUp(
  name: string,
  email: string,
  password: string,
  phone: string,
  created_at: Date
) {
  const existingUser = await prisma.customers.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("Email đã tồn tại!");
  }

  // Băm mật khẩu
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const customer = await prisma.customers.create({
    data: {
      name,
      email,
      password_hash: hashedPassword,
      phone,
      created_at,
    },
  });

  return customer;
}
