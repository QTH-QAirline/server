import { Hono } from 'hono';
import authRoute from './routes/auth';
import customerFlights from './routes/customers/flights';
import customerTickets from './routes/customers/tickets';
import adminFlights from './routes/admin/flights';
import adminPromotions from './routes/admin/promotions';
import adminNews from './routes/admin/news';
import adminCustomers from './routes/admin/customers';
import { errorHandler } from './utils/errorHandler';

const app = new Hono();

// Gắn các route
app.route('/auth', authRoute);
app.route('/customers', customerFlights);
app.route('/customers', customerTickets);
app.route('/admin', adminFlights);
app.route('/admin', adminPromotions);
app.route('/admin', adminNews);
app.route('/admin', adminCustomers);

// Middleware xử lý lỗi tập trung
app.onError(errorHandler);
app.get('/', (c) => c.text('Hello Bun!'))
export default app;
