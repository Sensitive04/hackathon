import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const isDev = process.env.NODE_ENV !== "production";

function extractUserId(req: any): string | null {
  try {
    const auth = req.headers?.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
    return decoded.id || null;
  } catch {
    return null;
  }
}

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: isDev ? 1000 : parseInt(process.env.RATE_LIMIT_MAX || "100"),
  keyGenerator: (req) => {
    return extractUserId(req) || req.ip || "unknown";
  },
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "AI rate limit exceeded. Max 10 requests per minute." },
  standardHeaders: true,
  legacyHeaders: false,
});
