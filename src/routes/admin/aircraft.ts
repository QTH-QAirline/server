import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';
import * as query from '../../prisma/query.js';



const prisma = new PrismaClient();
const adminAircraft = new Hono();

/**
 * Nhập dữ liệu tàu bay
 */
adminAircraft.post("/aircraft", adminGuard, async (c) => {
    try {
        const {manufacturer, model, capacity, economy_seats, business_seats, first_seats} = await c.req.json();
        if(!manufacturer || !model || !capacity || !economy_seats || !business_seats || !first_seats) {
            console.log(manufacturer + " " + model + " " + capacity + " " + economy_seats + " " + business_seats + " " + first_seats);
            return c.text("Thiếu tham số");
        }
        const response = await query.addAircraft(manufacturer, model, capacity, economy_seats, business_seats, first_seats);
        return c.text("Nhập dữ liệu tàu bay thành công với aircraft_id là " + response);
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

export default adminAircraft;

