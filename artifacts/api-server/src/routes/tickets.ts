import { Router } from "express";
import { db, ticketsTable, usersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListTicketsResponse,
  CreateTicketBody,
  GetTicketParams,
  GetTicketResponse,
  UpdateTicketParams,
  UpdateTicketBody,
  UpdateTicketResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/tickets", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [currentUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!currentUser) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const isAdmin = currentUser.role === "admin" || currentUser.role === "owner";

  let tickets;
  if (isAdmin) {
    tickets = await db.select().from(ticketsTable).orderBy(ticketsTable.createdAt);
  } else {
    tickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.userId, userId))
      .orderBy(ticketsTable.createdAt);
  }

  const enriched = await Promise.all(
    tickets.map(async (ticket) => {
      const [user] = await db
        .select({ username: usersTable.username })
        .from(usersTable)
        .where(eq(usersTable.id, ticket.userId));
      const [product] = await db
        .select({ name: productsTable.name })
        .from(productsTable)
        .where(eq(productsTable.id, ticket.productId));

      return {
        ...ticket,
        username: user?.username ?? null,
        productName: product?.name ?? null,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      };
    })
  );

  const response = ListTicketsResponse.parse(enriched);
  res.json(response);
});

router.post("/tickets", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.productId));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [ticket] = await db
    .insert(ticketsTable)
    .values({
      userId,
      productId: parsed.data.productId,
      message: parsed.data.message,
      status: "open",
    })
    .returning();

  const [user] = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  const response = GetTicketResponse.parse({
    ...ticket,
    username: user?.username ?? null,
    productName: product.name,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  });

  res.status(201).json(response);
});

router.get("/tickets/:id", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [currentUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "owner";

  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.id, params.data.id));

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (!isAdmin && ticket.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [user] = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, ticket.userId));

  const [product] = await db
    .select({ name: productsTable.name })
    .from(productsTable)
    .where(eq(productsTable.id, ticket.productId));

  const response = GetTicketResponse.parse({
    ...ticket,
    username: user?.username ?? null,
    productName: product?.name ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  });

  res.json(response);
});

router.patch("/tickets/:id", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [currentUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "owner")) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  const params = UpdateTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData["status"] = parsed.data.status;
  if (parsed.data.adminNotes !== undefined) updateData["adminNotes"] = parsed.data.adminNotes;

  const [ticket] = await db
    .update(ticketsTable)
    .set(updateData)
    .where(eq(ticketsTable.id, params.data.id))
    .returning();

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const [user] = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, ticket.userId));

  const [product] = await db
    .select({ name: productsTable.name })
    .from(productsTable)
    .where(eq(productsTable.id, ticket.productId));

  const response = UpdateTicketResponse.parse({
    ...ticket,
    username: user?.username ?? null,
    productName: product?.name ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  });

  res.json(response);
});

export default router;
