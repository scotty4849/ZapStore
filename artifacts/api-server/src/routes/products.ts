import { Router } from "express";
import { db, productsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, userId))
    .then(([user]) => {
      if (!user || (user.role !== "admin" && user.role !== "owner")) {
        res.status(403).json({ error: "Admin access required" }); return;
      }
      next();
    })
    .catch(() => res.status(500).json({ error: "Server error" }));
}

function serializeProduct(p: typeof productsTable.$inferSelect) {
  return {
    ...p,
    price: p.price.toString(),
    status: p.status ?? "active",
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const showAll = req.query["all"] === "true";
  const category = req.query["category"] as string | undefined;

  const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);

  const filtered = products.filter((p) => {
    if (!showAll && p.status !== "active") return false;
    if (category && p.category !== category) return false;
    return true;
  });

  const response = ListProductsResponse.parse(filtered.map(serializeProduct));
  res.json(response);
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [product] = await db.insert(productsTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    category: parsed.data.category,
    imageUrl: parsed.data.imageUrl ?? null,
    status: parsed.data.status ?? "active",
    active: parsed.data.status === "active",
    featured: parsed.data.featured ?? false,
  }).returning();

  res.status(201).json(GetProductResponse.parse(serializeProduct(product)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  res.json(GetProductResponse.parse(serializeProduct(product)));
});

router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData["name"] = parsed.data.name;
  if (parsed.data.description !== undefined) updateData["description"] = parsed.data.description;
  if (parsed.data.price !== undefined) updateData["price"] = parsed.data.price;
  if (parsed.data.category !== undefined) updateData["category"] = parsed.data.category;
  if (parsed.data.imageUrl !== undefined) updateData["imageUrl"] = parsed.data.imageUrl;
  if (parsed.data.featured !== undefined) updateData["featured"] = parsed.data.featured;
  if (parsed.data.status !== undefined) {
    updateData["status"] = parsed.data.status;
    updateData["active"] = parsed.data.status === "active";
  }

  const [product] = await db.update(productsTable).set(updateData)
    .where(eq(productsTable.id, params.data.id)).returning();

  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  res.json(UpdateProductResponse.parse(serializeProduct(product)));
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  res.sendStatus(204);
});

export default router;
