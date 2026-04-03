import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ingredientRoutes } from "./routes/ingredients";
import { drinkRoutes } from "./routes/drinks";
import { analyticsRoutes } from "./routes/analytics";
import { authRoutes } from "./routes/auth";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ingredients", ingredientRoutes);
app.use("/api/drinks", drinkRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
