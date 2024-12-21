import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Lấy vé của khách hàng
 */
export async function getTicketOfCustomer(customer_id: number) {
    
  const Ticket = await prisma.reservations.findMany({
      where: {customer_id: customer_id},
      select: {
          reservation_id: true,
          flights: {
              include: {
                  airports_flights_departure_airportToairports: true,
                  airports_flights_arrival_airportToairports: true
              }
          },
      }
  });
  if(Ticket.length === 0) throw new Error("Chưa có chuyến bay nào");
  return Ticket;
}

/**
 * Hủy vé đặt
 */
export async function cancelTicket(reservation_id: number) {
  const reservation = await prisma.reservations.findUnique({
      where: { reservation_id },
  });

  // Nếu không tìm thấy bản ghi, trả về thông báo lỗi
  if (!reservation) {
      throw new Error("Huỷ vé thất bại do không tồn tại mã đặt chỗ là " + reservation_id);
  }
  const flight_id = reservation.flight_id;
  console.log(flight_id);
  const seat = await prisma.tickets.findMany({
      where: {
          reservation_id: reservation_id,
      },
      select: {
          seat_number: true,
          price: true,
      }
  });
  let sum: number = 0;
  for(const x of seat) {
      sum += x.price.toNumber();
  }
  let array = [];
  for(var x of seat) {
      array.push(x.seat_number);
  }
  // Thực hiện xóa bản ghi nếu tồn tại
  await prisma.reservations.update({
      where: { reservation_id },
      data: {
          status: "Cancelled",
      }
  });

  await prisma.tickets.updateMany({
      where: { reservation_id: reservation_id },
      data: {
          status: "Cancelled",
      }
  });



  await prisma.seat_assignments.updateMany({
      where: {
          flight_id: flight_id,
          seat_number: {
              in: array,
          }
      },
      data: {
          status: "Available",
      }
  });

  await prisma.flight_stats.updateMany({
      where: {
          flight_id: flight_id,
      },
      data: {
          total_tickets: {
              increment: - seat.length,
          },
          total_revenue: {
              increment: - sum,
          }
      }
  });


}

/**
 * Đặt vé
 */
export async function bookTicket(customer_id: number, flight_id: number, seat_number: string, ticket_class: string, ticket_price: number, booking_date: Date) {
    
  const reservation = await prisma.reservations.create({
      data: {
          customer_id: customer_id,
          flight_id: flight_id,
          booking_date: booking_date,
          status: 'Confirmed', // Hoặc trạng thái khác tùy theo yêu cầu
      },
  });
  console.log(reservation.reservation_id);
  const ticket = await prisma.tickets.create({
      data: {
          reservation_id: reservation.reservation_id,
          seat_number: seat_number,
          class: ticket_class,
          price: ticket_price,
          status: 'Active', // Trạng thái vé (ví dụ: Active, Cancelled)
      },
  });

  const seat = await prisma.seat_assignments.updateMany({
      where: {
          AND:[
              {flight_id: flight_id},
              {seat_number: seat_number},
              {class: ticket_class}
          ]
      },
      data: {
          status: "Booked",
      }
  });

  await prisma.flight_stats.updateMany({
      where: {
          flight_id: flight_id,
      },
      data: {
          total_tickets: {
              increment: 1,
          },
          total_revenue: {
              increment: ticket_price,
          },
          last_updated: booking_date,
      }
  });

  return {
      reservation,
      ticket,
  };
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
      by: ["flight_id"],  // Nhóm theo flight_id
      where: {
        class: ticket_class  // Điều kiện lọc theo class
      },
      _count: {  // Đếm số lượng bản ghi trong mỗi nhóm
        flight_id: true
      },
      having: {
        flight_id: {
          _count: {
            gte: person  // Lọc các nhóm có số lượng flight_id lớn hơn person
          }
        }
      }
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



    if(!flights) {
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
export async function suggestion(from: string, date: Date) {
  const places = await prisma.flights.findMany({
    where: {
      airports_flights_departure_airportToairports: { iata_code: from },
      updated_departure_time: {
        gte: date,
      }
    },
    orderBy: {
      arrival_airport: 'desc',
    },
    select: {
      base_price: true,
      airports_flights_arrival_airportToairports: {
          select: {
              location: true,
              country: true,
          }
      },
      promotions: {
          take: 1,
          where: {
              start_date: {
                  lt: date, 
              },
              end_date: {
                  gt: date,
              }
          },
          orderBy: {
              discount_rate: 'desc',
          },
          select: {
              discount_rate: true
          }
      }
  }
  });

  if(places.length === 0) throw new Error("Không có chuyến bay nào bắt đầu từ " + from);
    let id = 0;
    let result = []; 
    for(var i = 0; i < places.length; ++i) {
        if(places[i].airports_flights_arrival_airportToairports.location == places[id].airports_flights_arrival_airportToairports.location) {
            let number_i = places[i].base_price.toNumber();
            if(places[i].promotions.length != 0) number_i *= (100 - places[i].promotions[0].discount_rate.toNumber()) / 100;
            let number_id = places[id].base_price.toNumber();
            if(places[id].promotions.length != 0) number_id *= (100 - places[id].promotions[0].discount_rate.toNumber()) / 100;
            if(number_i < number_id) id = i;
        }
        if(i+1 === places.length || places[i+1].airports_flights_arrival_airportToairports.location !== places[id].airports_flights_arrival_airportToairports.location) {
            result.push(places[id]);
            id = i + 1;
        }
    }
    result = result.slice(0, 7);
    return result;
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

export async function addNews(title: string, content: string, category: string, date: Date) {
  const news = await prisma.news.create({
      data: {
          title: title,
          content: content,
          category: category,
          created_at: date,
          updated_at: date,
      }
  });
  console.log(news.news_id);
  return news.news_id;
}

export async function updateNews(news_id: number, title: string, content: string, category: string, date: Date) {
  const check = await prisma.news.findUnique({
      where: {
          news_id: news_id,
      }
  })
  if(!check) {
      throw new Error("Không tồn tại tin tức nào với mã tin tức là news_id");
  }

  await prisma.news.update({
      where: {
          news_id: news_id,
      },
      data: {
          title: title,
          content: content,
          category: category,
          updated_at: date,
      }
  });
}


export async function deleteNews(news_id: number) {
  const check = await prisma.news.findUnique({
      where: {
          news_id: news_id,
      }
  });
  if(!check) {
      throw new Error("Không tồn tại tin tức nào với mã tin tức là news_id");
  }
  await prisma.news.delete({
      where: {
          news_id: news_id,
      }
  });
}

export async function addAircraft(manufacturer: string, model: string, capacity: number, economy_seats: number, business_seats: number, first_seats: number) {
  const aircraft = await prisma.aircrafts.create({
      data: {
          manufacturer: manufacturer,
          model: model, 
          capacity: capacity, 
          economy_seats: economy_seats, 
          business_seats: business_seats, 
          first_class_seats: first_seats
      }
  });
  return aircraft.aircraft_id;
}

export async function addFlight(aircraft_id: number, departure_airport: number, arrival_airport: number, departure_time: Date, arrival_time: Date, base_price: number, created_at: Date) {
  const aircraft = await prisma.aircrafts.findUnique({
      where: {
          aircraft_id: aircraft_id,
      }
  });
  if(!aircraft) {
      throw new Error("Không tồn tại máy bay nào có mã số là " + aircraft_id);
  }
  const flight = await prisma.flights.create({
      data: {
          aircraft_id: aircraft_id,
          departure_airport: departure_airport,
          arrival_airport: arrival_airport,
          departure_time: departure_time,
          arrival_time: arrival_time,
          base_price: base_price,
          updated_departure_time: departure_time,
          created_at: created_at,
      }
  });
  let economy_seats: number = aircraft['economy_seats'];
  let business_seats: number = aircraft['business_seats'];
  let first_seats: number = aircraft['first_class_seats'];
  for(var i: number = 0 ; i < economy_seats; ++i) {
      var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/6)) + (i%6+1);
      var seat_type: string;
      if((i%6+1) == 1 || (i%6+1) == 1) seat_type = "Window";
      else if((i%6+1) == 2 || (i%6+1) == 5) seat_type = "Middle";
      else seat_type = "Aisle";
      await prisma.seat_assignments.create({
          data: {
              flight_id: flight.flight_id,
              seat_number: seat_number,
              class: "Economy",
              seat_type: seat_type,
              status: "Available",
          }
      })
  }
  for(var i: number = 0 ; i < business_seats; ++i) {
      var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/3)) + (i%3+1);
      var seat_type: string;
      if((i%3+1) == 1 || (i%3+1) == 3) seat_type = "Window";
      else seat_type = "Middle";
      await prisma.seat_assignments.create({
          data: {
              flight_id: flight.flight_id,
              seat_number: seat_number,
              class: "Business",
              seat_type: seat_type,
              status: "Available",
          }
      })
  }
  for(var i: number = 0 ; i < first_seats; ++i) {
      var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/2)) + (i%2+1);
      var seat_type: string = "Window";
      await prisma.seat_assignments.create({
          data: {
              flight_id: flight.flight_id,
              seat_number: seat_number,
              class: "First",
              seat_type: seat_type,
              status: "Available",
          }
      })
  }
  await prisma.flight_stats.create({
      data: {
          flight_id: flight.flight_id,
          total_tickets: 0,
          total_revenue: 0,
          last_updated: created_at,
      }
  })
  return flight.flight_id;
}

export async function addPromotions(flight_id: number, title: string, description: string, discount_rate: number, start_date: Date, end_date: Date){
  const promotion = await prisma.promotions.create({
      data: {
          title: title,
          description: description,
          discount_rate: discount_rate,
          start_date: start_date,
          end_date: end_date,
          flight_id: flight_id,
      }
  });
  console.log(promotion.promotion_id);
}

export async function deletePromotion(promotion_id: number){
  await prisma.promotions.delete({
      where: {
          promotion_id: promotion_id,
      }
  });
}

export async function summarizeFlight(flight_id: number){
  const response = await prisma.flight_stats.findMany({
      where: {
          flight_id: flight_id,
      }
  });
  return response;
}


export async function delay(flight_id:number, reason: string, delay_date: Date) {
  await prisma.flights.update({
      where: {
          flight_id: flight_id,
      },
      data: {
          delay_reason: reason,
          updated_departure_time: delay_date,
      }
  });
}

export async function test() {
  const test = await prisma.flights.findMany({
      where: {
        flight_id: 6,
      },
      include: {
        airports_flights_departure_airportToairports: true,
        airports_flights_arrival_airportToairports: true,
      }
  })
  console.log(test);
  return test;
}