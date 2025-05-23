import { Hono } from 'hono';
import authRoute from './routes/auth';
import 'dotenv/config';
import customerFlights from './routes/customers/flights';
import customerTickets from './routes/customers/tickets';
import adminFlights from './routes/admin/flights';
import adminPromotions from './routes/admin/promotions';
import adminNews from './routes/admin/news';
import { errorHandler } from './utils/errorHandler';
import cors from './middlewares/security/cors';
import { prettyJSON } from 'hono/pretty-json';
import timeout from './middlewares/perfomance/timeout';
import { logger } from './middlewares/logging/logger';
import customerAuthRoute from './routes/auth/customerAuth';
import adminAuthRoute from './routes/auth/adminAuth';
import adminAircraft from './routes/admin/aircraft';
import airportsRoute from './routes/customers/airports';
import adminBooking from './routes/admin/booking';
import change from './routes/admin/change';
// import {cors} from 'hono/cors';

const app = new Hono();

// app.use('*', cors({
//     origin: 'http://localhost:3000', // Frontend chạy trên cổng 3000
//     allowMethods: ['POST', 'GET', 'OPTIONS'],
//   }));
app.use('*', cors);
app.use(prettyJSON());// Sử dụng middleware timeout cho tất cả các route
app.use('*', timeout);
app.use('*', logger);

// Gắn các route

// Route xác thực cho khách hàng
app.route('/auth/customer', customerAuthRoute);

// Route xác thực cho admin
app.route('/auth/admin', adminAuthRoute);

app.route('/customers', customerFlights);
app.route('/customers', customerTickets);
app.route('/', airportsRoute);
app.route('/admin', adminAircraft);
app.route('/admin', adminFlights);
app.route('/admin', adminPromotions);
app.route('/admin', adminNews);
app.route('/admin', adminBooking);
app.route('/admin', change);


// Middleware xử lý lỗi tập trung
app.onError(errorHandler);
app.get('/', (c) => c.text('Hello Bun!'))
export default app;
