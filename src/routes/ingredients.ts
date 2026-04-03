import { Router, Request, Response } from "express";
import { ilike, sql, asc, inArray } from "drizzle-orm";
import { db } from "../db";
import { ingredients } from "../db/schema";
import { cache } from "../services/cache";

const router = Router();

// GET /api/ingredients — list all (cached)
router.get("/", async (_req: Request, res: Response) => {
  const cacheKey = "ingredients:all";
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const data = await db
    .select()
    .from(ingredients)
    .orderBy(asc(ingredients.name));

  cache.set(cacheKey, data, 120);
  res.json(data);
});

// GET /api/ingredients/search?q=nimbu — fuzzy search name + aliases
router.get("/search", async (req: Request, res: Response) => {
  const q = (req.query.q as string || "").toLowerCase().trim();
  if (!q) return res.json([]);

  // Search by name
  const byName = await db
    .select()
    .from(ingredients)
    .where(ilike(ingredients.name, `%${q}%`))
    .orderBy(asc(ingredients.name))
    .limit(20);

  // Search aliases — use array overlap with pattern match
  // Drizzle doesn't have native array ilike, so we use raw SQL for alias matching
  const byAlias = await db
    .select()
    .from(ingredients)
    .where(sql`EXISTS (
      SELECT 1 FROM unnest(${ingredients.aliases}) AS alias
      WHERE lower(alias) LIKE ${`%${q}%`}
    )`)
    .orderBy(asc(ingredients.name))
    .limit(20);

  // Merge, dedup
  const nameIds = new Set(byName.map((i) => i.id));
  const combined = [...byName, ...byAlias.filter((i) => !nameIds.has(i.id))];

  res.json(combined.slice(0, 20));
});

// GET /api/ingredients/suggested — common starting ingredients (cached)
router.get("/suggested", async (_req: Request, res: Response) => {
  const cacheKey = "ingredients:suggested";
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const suggestedNames = [
    "lemon", "lime", "soda_water", "sugar", "mint", "ice",
    "milk", "coffee", "cola", "orange_juice", "vodka", "white_rum",
  ];

  const data = await db
    .select()
    .from(ingredients)
    .where(inArray(ingredients.normalizedName, suggestedNames))
    .orderBy(asc(ingredients.name));

  cache.set(cacheKey, data, 300);
  res.json(data);
});

export { router as ingredientRoutes };
