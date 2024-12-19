import { Hono } from 'hono';
import user from './routes/user';
//import admin from './routes/admin';


const app = new Hono();

app.get("", (c) => {
    return c.text("Backend of Booking Flights App");
});
app.route('/user', user);
//app.route('/admin', admin);

export default app;