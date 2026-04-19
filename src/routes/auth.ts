import { Router, Request, Response } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../db";
import { users, otpCodes } from "../db/schema";
import { sendOtpEmail } from "../services/email";
import { signToken, authenticate } from "../middleware/auth";

const router = Router();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    preferenceAlcoholic: user.isAlcoholic,
  };
}

// POST /api/auth/send-otp
router.post("/send-otp", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(otpCodes).values({
    email: email.toLowerCase().trim(),
    code,
    expiresAt,
  });

  try {
    await sendOtpEmail(email, code);
    res.json({ ok: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send email. Try again." });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, normalizedEmail),
        eq(otpCodes.code, code),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!otp) {
    return res.status(401).json({ error: "Invalid or expired code" });
  }

  await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({ email: normalizedEmail })
      .returning();
    user = newUser;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ ok: true, user: formatUser(user), token });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: Request, res: Response) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user!.userId))
    .limit(1);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(formatUser(user));
});

// PUT /api/auth/profile
router.put("/profile", authenticate, async (req: Request, res: Response) => {
  const { name, phone, dateOfBirth, bio, avatarUrl, preferenceAlcoholic } = req.body;

  const updateData: any = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
  if (bio !== undefined) updateData.bio = bio;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  if (preferenceAlcoholic !== undefined) updateData.isAlcoholic = preferenceAlcoholic;

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, req.user!.userId))
    .returning();

  if (!updated) return res.status(404).json({ error: "User not found" });

  res.json(formatUser(updated));
});

export { router as authRoutes };
