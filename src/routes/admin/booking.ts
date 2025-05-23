import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';
import * as query from '../../prisma/query.js';



const prisma = new PrismaClient();
const adminBooking = new Hono();
adminBooking.get("/booking", adminGuard, async(c) => {
    const response = await query.getBooking();
    console.log(response);
    return c.json(response);
});
export default adminBooking;