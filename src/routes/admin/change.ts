import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../../middlewares/authentication/adminGuard';
import * as query from '../../prisma/query.js';


const prisma = new PrismaClient();
const change = new Hono();
change.get("/change/:code", adminGuard, async(c) => {
   
        const code = String(c.req.param("code"));
        const response = await query.getChange(code);
        return c.json(response);
  })
export default change;