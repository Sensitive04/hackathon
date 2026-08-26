import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Unhandled error:", err);

  if (err.name === "ValidationError") {
    res.status(400).json({ error: "Database validation error" });
    return;
  }

  if (err.name === "CastError") {
    res.status(400).json({ error: "Invalid ID format" });
    return;
  }

  if ((err as any).code === 11000) {
    res.status(409).json({ error: "Duplicate entry" });
    return;
  }

  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
