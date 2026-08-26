import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.routes.js";
import satelliteRoutes from "./routes/satellite.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import messageRoutes from "./routes/message.routes.js";
import recycleRoutes from "./routes/recycle.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/satellite", satelliteRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/recycle", recycleRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`GreenVerse server running on port ${PORT}`);
  });
}

start().catch(console.error);
