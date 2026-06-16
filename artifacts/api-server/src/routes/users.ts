import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function requireOwnerOrAdmin(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, userId))
    .then(([user]) => {
      if (!user || (user.role !== "admin" && user.role !== "owner")) {
        res.status(403).json({ error: "Admin access required" }); return;
      }
      (req as any).currentUser = user;
      next();
    })
    .catch(() => res.status(500).json({ error: "Server error" }));
}

router.get("/admin/users", requireOwnerOrAdmin, async (req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);

  res.json(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
});

router.patch("/admin/users/:id", requireOwnerOrAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const { role } = req.body;
  const validRoles = ["user", "admin", "owner"];
  if (!role || !validRoles.includes(role)) {
    res.status(400).json({ error: "Invalid role" }); return;
  }

  const currentUser = (req as any).currentUser;
  if (currentUser.role !== "owner" && role === "owner") {
    res.status(403).json({ error: "Only owners can promote to owner" }); return;
  }

  const [updated] = await db.update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/admin/users/:id", requireOwnerOrAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const currentUser = (req as any).currentUser;
  if (id === currentUser.id) {
    res.status(400).json({ error: "Cannot delete your own account" }); return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "User not found" }); return; }

  res.sendStatus(204);
});

export default router;
