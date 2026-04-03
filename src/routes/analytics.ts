import { Router, Request, Response } from "express";
import { trackEvent } from "../services/analytics";

const router = Router();

// POST /api/analytics/track
router.post("/track", async (req: Request, res: Response) => {
  const { event, ...payload } = req.body;

  if (!event) {
    return res.status(400).json({ error: "Missing event type" });
  }

  const validEvents = ["ingredients_selected", "drink_viewed", "search"];
  if (!validEvents.includes(event)) {
    return res.status(400).json({ error: "Invalid event type" });
  }

  await trackEvent({ event, ...payload } as any);
  res.json({ ok: true });
});

export { router as analyticsRoutes };
