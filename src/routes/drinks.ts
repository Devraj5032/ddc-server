import { Router, Request, Response } from "express";
import {
  eq,
  inArray,
  ilike,
  lte,
  desc,
  asc,
  sql,
} from "drizzle-orm";
import { db } from "../db";
import {
  drinks,
  drinkImages,
  drinkIngredients,
  drinkSteps,
  drinkTagMap,
  drinkTags,
  ingredients,
} from "../db/schema";
import { cache } from "../services/cache";
import { trackEvent, getRecentlyViewedDrinkIds } from "../services/analytics";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────

function parseParams(req: Request) {
  const alcoholicParam = req.query.alcoholic as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  return {
    alcoholic: alcoholicParam !== undefined ? alcoholicParam === "true" : undefined,
    page,
    limit,
    offset,
  };
}

type IngredientRow = {
  drinkId: number;
  ingredientId: number;
  quantity: string | null;
  isOptional: boolean | null;
  ingredientName: string;
  ingredientType: string | null;
  ingredientIsAlcoholic: boolean | null;
};

type StepRow = {
  id: number;
  drinkId: number;
  stepNumber: number;
  instruction: string | null;
};

type TagRow = {
  drinkId: number;
  tagName: string | null;
};

/** Load full drink details (ingredients, steps, tags) for a list of drink IDs */
async function loadDrinkDetails(drinkIds: number[]) {
  if (drinkIds.length === 0) {
    return {
      ingredientsMap: new Map<number, IngredientRow[]>(),
      stepsMap: new Map<number, StepRow[]>(),
      tagsMap: new Map<number, string[]>(),
      imagesMap: new Map<number, string[]>(),
    };
  }

  const [allIngredients, allSteps, allTagMaps, allImages] = await Promise.all([
    db
      .select({
        drinkId: drinkIngredients.drinkId,
        ingredientId: drinkIngredients.ingredientId,
        quantity: drinkIngredients.quantity,
        isOptional: drinkIngredients.isOptional,
        ingredientName: ingredients.name,
        ingredientType: ingredients.type,
        ingredientIsAlcoholic: ingredients.isAlcoholic,
      })
      .from(drinkIngredients)
      .innerJoin(ingredients, eq(drinkIngredients.ingredientId, ingredients.id))
      .where(inArray(drinkIngredients.drinkId, drinkIds)),

    db
      .select()
      .from(drinkSteps)
      .where(inArray(drinkSteps.drinkId, drinkIds))
      .orderBy(asc(drinkSteps.stepNumber)),

    db
      .select({
        drinkId: drinkTagMap.drinkId,
        tagName: drinkTags.name,
      })
      .from(drinkTagMap)
      .innerJoin(drinkTags, eq(drinkTagMap.tagId, drinkTags.id))
      .where(inArray(drinkTagMap.drinkId, drinkIds)),

    db
      .select({
        drinkId: drinkImages.drinkId,
        imageUrl: drinkImages.imageUrl,
        sortOrder: drinkImages.sortOrder,
      })
      .from(drinkImages)
      .where(inArray(drinkImages.drinkId, drinkIds))
      .orderBy(asc(drinkImages.sortOrder)),
  ]);

  // Group by drink ID
  const ingredientsMap = new Map<number, typeof allIngredients>();
  for (const row of allIngredients) {
    const arr = ingredientsMap.get(row.drinkId) || [];
    arr.push(row);
    ingredientsMap.set(row.drinkId, arr);
  }

  const stepsMap = new Map<number, typeof allSteps>();
  for (const row of allSteps) {
    const arr = stepsMap.get(row.drinkId) || [];
    arr.push(row);
    stepsMap.set(row.drinkId, arr);
  }

  const tagsMap = new Map<number, string[]>();
  for (const row of allTagMaps) {
    const arr = tagsMap.get(row.drinkId) || [];
    if (row.tagName) arr.push(row.tagName);
    tagsMap.set(row.drinkId, arr);
  }

  const imagesMap = new Map<number, string[]>();
  for (const row of allImages) {
    const arr = imagesMap.get(row.drinkId) || [];
    arr.push(row.imageUrl);
    imagesMap.set(row.drinkId, arr);
  }

  return { ingredientsMap, stepsMap, tagsMap, imagesMap };
}

/** Format drink rows with their related data */
function formatDrinks(
  drinkRows: (typeof drinks.$inferSelect)[],
  details: Awaited<ReturnType<typeof loadDrinkDetails>>
) {
  return drinkRows.map((d) => ({
    ...d,
    images: details.imagesMap.get(d.id) || [],
    drink_ingredients: (details.ingredientsMap.get(d.id) || []).map((i) => ({
      ingredient_id: i.ingredientId,
      quantity: i.quantity,
      is_optional: i.isOptional,
      ingredients: {
        id: i.ingredientId,
        name: i.ingredientName,
        type: i.ingredientType,
        is_alcoholic: i.ingredientIsAlcoholic,
      },
    })),
    drink_steps: (details.stepsMap.get(d.id) || []).map((s) => ({
      step_number: s.stepNumber,
      instruction: s.instruction,
    })),
    drink_tag_map: (details.tagsMap.get(d.id) || []).map((name) => ({
      drink_tags: { name },
    })),
  }));
}

// ─── MATCHING ENGINE ─────────────────────────────────────────────────
// GET /api/drinks/match?ingredients=1,2,3&alcoholic=true&max_ingredients=3&max_time=2
router.get("/match", async (req: Request, res: Response) => {
  const { alcoholic, limit } = parseParams(req);

  const ingredientIds = (req.query.ingredients as string || "")
    .split(",")
    .map(Number)
    .filter(Boolean);

  const maxIngredients = parseInt(req.query.max_ingredients as string) || undefined;
  const maxTime = parseInt(req.query.max_time as string) || undefined;

  if (ingredientIds.length === 0) {
    return res.status(400).json({ error: "Provide at least one ingredient id" });
  }

  // Track analytics (non-blocking)
  trackEvent({ event: "ingredients_selected", ingredient_ids: ingredientIds });

  const cacheKey = `match:${ingredientIds.sort().join(",")}_alc:${alcoholic}_mi:${maxIngredients}_mt:${maxTime}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  // Find drink IDs that have at least one matching ingredient
  const matchedRows = await db
    .select({
      drinkId: drinkIngredients.drinkId,
      ingredientId: drinkIngredients.ingredientId,
      isOptional: drinkIngredients.isOptional,
    })
    .from(drinkIngredients)
    .where(inArray(drinkIngredients.ingredientId, ingredientIds));

  if (matchedRows.length === 0) return res.json([]);

  const matchedDrinkIds = [...new Set(matchedRows.map((r) => r.drinkId))];

  // Build conditions for drink query
  const conditions = [inArray(drinks.id, matchedDrinkIds)];
  if (alcoholic !== undefined) conditions.push(eq(drinks.isAlcoholic, alcoholic));
  if (maxIngredients) conditions.push(lte(drinks.ingredientCount, maxIngredients));
  if (maxTime) conditions.push(lte(drinks.prepTimeMinutes, maxTime));

  const drinkRows = await db
    .select()
    .from(drinks)
    .where(sql`${sql.join(conditions, sql` AND `)}`);

  if (drinkRows.length === 0) return res.json([]);

  const filteredDrinkIds = drinkRows.map((d) => d.id);

  // Get ALL ingredients for these drinks (for scoring)
  const allDrinkIngs = await db
    .select({
      drinkId: drinkIngredients.drinkId,
      ingredientId: drinkIngredients.ingredientId,
      isOptional: drinkIngredients.isOptional,
      ingredientName: ingredients.name,
    })
    .from(drinkIngredients)
    .innerJoin(ingredients, eq(drinkIngredients.ingredientId, ingredients.id))
    .where(inArray(drinkIngredients.drinkId, filteredDrinkIds));

  // Load details for formatted response
  const details = await loadDrinkDetails(filteredDrinkIds);

  // Score each drink
  const formatted = formatDrinks(drinkRows, details);
  const scored = formatted.map((drink) => {
    const totalRequired = drink.ingredientCount || 1;
    const drinkIngs = allDrinkIngs.filter((di) => di.drinkId === drink.id);
    const requiredIngs = drinkIngs.filter((di) => !di.isOptional);
    const matchedRequired = requiredIngs.filter((di) => ingredientIds.includes(di.ingredientId));

    const matchedCount = matchedRequired.length;
    const missingCount = totalRequired - matchedCount;
    const matchPercentage = Math.round((matchedCount / totalRequired) * 100);

    const missingIngredients = requiredIngs
      .filter((di) => !ingredientIds.includes(di.ingredientId))
      .map((di) => di.ingredientName)
      .filter(Boolean);

    return {
      ...drink,
      match_percentage: matchPercentage,
      missing_count: missingCount,
      total_required: totalRequired,
      is_one_ingredient_away: missingCount === 1,
      missing_ingredients: missingIngredients,
    };
  });

  // Sort: match % DESC, then popularity DESC
  scored.sort((a, b) => {
    if (b.match_percentage !== a.match_percentage) return b.match_percentage - a.match_percentage;
    return (b.popularityScore || 0) - (a.popularityScore || 0);
  });

  const result = scored.slice(0, limit);
  cache.set(cacheKey, result, 60);
  res.json(result);
});

// ─── QUICK DRINKS ────────────────────────────────────────────────────
router.get("/quick", async (req: Request, res: Response) => {
  const { alcoholic, limit, offset } = parseParams(req);
  const cacheKey = `quick:alc:${alcoholic}_l:${limit}_o:${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const conditions = [lte(drinks.prepTimeMinutes, 2)];
  if (alcoholic !== undefined) conditions.push(eq(drinks.isAlcoholic, alcoholic));

  const drinkRows = await db
    .select()
    .from(drinks)
    .where(sql`${sql.join(conditions, sql` AND `)}`)
    .orderBy(desc(drinks.popularityScore))
    .limit(limit)
    .offset(offset);

  const ids = drinkRows.map((d) => d.id);
  const details = await loadDrinkDetails(ids);
  const result = formatDrinks(drinkRows, details);

  cache.set(cacheKey, result, 90);
  res.json(result);
});

// ─── POPULAR DRINKS ──────────────────────────────────────────────────
router.get("/popular", async (req: Request, res: Response) => {
  const { alcoholic, limit, offset } = parseParams(req);
  const cacheKey = `popular:alc:${alcoholic}_l:${limit}_o:${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const conditions = [];
  if (alcoholic !== undefined) conditions.push(eq(drinks.isAlcoholic, alcoholic));

  let query = db
    .select()
    .from(drinks)
    .orderBy(desc(drinks.popularityScore))
    .limit(limit)
    .offset(offset);

  const drinkRows = conditions.length > 0
    ? await query.where(sql`${sql.join(conditions, sql` AND `)}`)
    : await query;

  const ids = drinkRows.map((d) => d.id);
  const details = await loadDrinkDetails(ids);
  const result = formatDrinks(drinkRows, details);

  cache.set(cacheKey, result, 90);
  res.json(result);
});

// ─── RANDOM (WEIGHTED BY POPULARITY) ─────────────────────────────────
router.get("/random", async (req: Request, res: Response) => {
  const { alcoholic } = parseParams(req);

  const conditions = [];
  if (alcoholic !== undefined) conditions.push(eq(drinks.isAlcoholic, alcoholic));

  let query = db
    .select()
    .from(drinks)
    .orderBy(desc(drinks.popularityScore))
    .limit(20);

  const drinkRows = conditions.length > 0
    ? await query.where(sql`${sql.join(conditions, sql` AND `)}`)
    : await query;

  if (drinkRows.length === 0) return res.json(null);

  // Weighted random selection
  const totalScore = drinkRows.reduce((sum, d) => sum + (d.popularityScore || 1), 0);
  let rand = Math.random() * totalScore;
  let selected = drinkRows[0];

  for (const drink of drinkRows) {
    rand -= drink.popularityScore || 1;
    if (rand <= 0) {
      selected = drink;
      break;
    }
  }

  const details = await loadDrinkDetails([selected.id]);
  const [result] = formatDrinks([selected], details);

  res.json(result);
});

// ─── SEARCH (FULL-TEXT) ──────────────────────────────────────────────
router.get("/search", async (req: Request, res: Response) => {
  const q = (req.query.q as string || "").trim();
  const { alcoholic, limit, offset } = parseParams(req);

  if (!q) return res.json([]);

  // Track analytics (non-blocking)
  trackEvent({ event: "search", query: q });

  // Try full-text search first
  const ftsConditions = [sql`search_vector @@ websearch_to_tsquery('english', ${q})`];
  if (alcoholic !== undefined) ftsConditions.push(eq(drinks.isAlcoholic, alcoholic));

  let drinkRows = await db
    .select()
    .from(drinks)
    .where(sql`${sql.join(ftsConditions, sql` AND `)}`)
    .orderBy(desc(drinks.popularityScore))
    .limit(limit)
    .offset(offset);

  // Fallback to ilike if full-text returns nothing
  if (drinkRows.length === 0) {
    const ilikeConditions = [ilike(drinks.name, `%${q}%`)];
    if (alcoholic !== undefined) ilikeConditions.push(eq(drinks.isAlcoholic, alcoholic));

    drinkRows = await db
      .select()
      .from(drinks)
      .where(sql`${sql.join(ilikeConditions, sql` AND `)}`)
      .orderBy(desc(drinks.popularityScore))
      .limit(limit)
      .offset(offset);
  }

  const ids = drinkRows.map((d) => d.id);
  const details = await loadDrinkDetails(ids);
  res.json(formatDrinks(drinkRows, details));
});

// ─── USAGE-BASED SUGGESTIONS ─────────────────────────────────────────
router.get("/for-you", async (_req: Request, res: Response) => {
  const recentIds = await getRecentlyViewedDrinkIds(10);

  if (recentIds.length === 0) {
    // Fallback to popular
    const drinkRows = await db
      .select()
      .from(drinks)
      .orderBy(desc(drinks.popularityScore))
      .limit(10);

    const ids = drinkRows.map((d) => d.id);
    const details = await loadDrinkDetails(ids);
    return res.json(formatDrinks(drinkRows, details));
  }

  const drinkRows = await db
    .select()
    .from(drinks)
    .where(inArray(drinks.id, recentIds));

  const details = await loadDrinkDetails(recentIds);
  const formatted = formatDrinks(drinkRows, details);

  // Preserve order from recentIds
  const ordered = recentIds
    .map((id) => formatted.find((d) => d.id === id))
    .filter(Boolean);

  res.json(ordered);
});

// ─── DRINK DETAIL ────────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  // Track analytics (non-blocking)
  trackEvent({ event: "drink_viewed", drink_id: id });

  const [drinkRow] = await db
    .select()
    .from(drinks)
    .where(eq(drinks.id, id))
    .limit(1);

  if (!drinkRow) return res.status(404).json({ error: "Drink not found" });

  const details = await loadDrinkDetails([id]);
  const [result] = formatDrinks([drinkRow], details);

  res.json(result);
});

export { router as drinkRoutes };
