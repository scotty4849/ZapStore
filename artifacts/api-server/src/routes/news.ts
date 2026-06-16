import { Router } from "express";
import { db, newsUpdatesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListUpdatesResponse,
  CreateUpdateBody,
  GetUpdateParams,
  GetUpdateResponse,
  DeleteUpdateParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/updates", async (req, res): Promise<void> => {
  const updates = await db
    .select()
    .from(newsUpdatesTable)
    .orderBy(newsUpdatesTable.createdAt);

  const enriched = await Promise.all(
    updates.map(async (update) => {
      const [author] = await db
        .select({ username: usersTable.username })
        .from(usersTable)
        .where(eq(usersTable.id, update.authorId));

      return {
        ...update,
        authorUsername: author?.username ?? null,
        createdAt: update.createdAt.toISOString(),
      };
    })
  );

  const response = ListUpdatesResponse.parse(enriched);
  res.json(response);
});

router.post("/updates", async (req, res): Promise<void> => {
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

  const parsed = CreateUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [update] = await db
    .insert(newsUpdatesTable)
    .values({
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: userId,
    })
    .returning();

  const response = GetUpdateResponse.parse({
    ...update,
    authorUsername: currentUser.username,
    createdAt: update.createdAt.toISOString(),
  });

  res.status(201).json(response);
});

router.get("/updates/:id", async (req, res): Promise<void> => {
  const params = GetUpdateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [update] = await db
    .select()
    .from(newsUpdatesTable)
    .where(eq(newsUpdatesTable.id, params.data.id));

  if (!update) {
    res.status(404).json({ error: "Update not found" });
    return;
  }

  const [author] = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, update.authorId));

  const response = GetUpdateResponse.parse({
    ...update,
    authorUsername: author?.username ?? null,
    createdAt: update.createdAt.toISOString(),
  });

  res.json(response);
});

router.delete("/updates/:id", async (req, res): Promise<void> => {
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

  const params = DeleteUpdateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [update] = await db
    .delete(newsUpdatesTable)
    .where(eq(newsUpdatesTable.id, params.data.id))
    .returning();

  if (!update) {
    res.status(404).json({ error: "Update not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
