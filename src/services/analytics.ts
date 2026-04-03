import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { analyticsEvents } from "../db/schema";

export type AnalyticsEvent =
  | { event: "ingredients_selected"; ingredient_ids: number[] }
  | { event: "drink_viewed"; drink_id: number }
  | { event: "search"; query: string };

export async function trackEvent(eventData: AnalyticsEvent): Promise<void> {
  const { event, ...payload } = eventData;
  try {
    await db.insert(analyticsEvents).values({
      eventType: event,
      payload,
    });
  } catch (err) {
    // Non-blocking — don't fail the request if analytics fails
    console.error("Analytics tracking error:", err);
  }
}

export async function getRecentlyViewedDrinkIds(limit = 10): Promise<number[]> {
  const rows = await db
    .select({ payload: analyticsEvents.payload })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.eventType, "drink_viewed"))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(50);

  // Count frequency and return top N unique drink IDs
  const counts = new Map<number, number>();
  for (const row of rows) {
    const id = (row.payload as any)?.drink_id;
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
