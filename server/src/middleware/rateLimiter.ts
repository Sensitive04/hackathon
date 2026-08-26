import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
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
