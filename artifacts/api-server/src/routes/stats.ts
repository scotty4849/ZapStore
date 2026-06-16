import { Router } from "express";
import { db, productsTable, ticketsTable, usersTable, newsUpdatesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { GetStatsResponse } from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const [productCount] = await db
    .select({ count: count() })
    .from(productsTable)
    .where(eq(productsTable.active, true));

  const [openTicketCount] = await db
    .select({ count: count() })
    .from(ticketsTable)
    .where(eq(ticketsTable.status, "open"));

  const [userCount] = await db
    .select({ count: count() })
    .from(usersTable);

  const [latestUpdate] = await db
    .select({ title: newsUpdatesTable.title })
    .from(newsUpdatesTable)
    .orderBy(desc(newsUpdatesTable.createdAt))
    .limit(1);

  const response = GetStatsResponse.parse({
    totalProducts: Number(productCount?.count ?? 0),
    openTickets: Number(openTicketCount?.count ?? 0),
    totalUsers: Number(userCount?.count ?? 0),
    latestUpdate: latestUpdate?.title ?? null,
  });

  res.json(response);
});

export default router;
