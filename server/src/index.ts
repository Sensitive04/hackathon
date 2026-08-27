import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.routes.js";
import satelliteRoutes from "./routes/satellite.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import messageRoutes from "./routes/message.routes.js";
import postRoutes from "./routes/post.routes.js";
import knowledgeRoutes from "./routes/knowledge.routes.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  },
});
const PORT = process.env.PORT || 5000;

// Make io accessible in controllers
app.use((_req, res, next) => {
  (res as any).io = io;
  (_req as any).io = io;
  next();
});

// Socket.io auth + events
const connectedUsers = new Map<string, Set<string>>();

function broadcastOnlineUsers() {
  io.emit("online-users", [...connectedUsers.keys()]);
}

io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.disconnect();
    return;
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
    userId = decoded.id;
  } catch {
    socket.disconnect();
    return;
  }

  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId)!.add(socket.id);
  broadcastOnlineUsers();

  console.log(`Socket connected: ${userId} (${socket.id})`);

  socket.join(`user:${userId}`);

  socket.on("join", (room: string) => {
    socket.join(room);
  });

  socket.on("leave", (room: string) => {
    socket.leave(room);
  });

  socket.on("typing:start", (data: { conversationId: string }) => {
    if (data.conversationId) {
      socket.to(data.conversationId).emit("typing:start", {
        conversationId: data.conversationId,
        userId,
      });
    }
  });

  socket.on("typing:stop", (data: { conversationId: string }) => {
    if (data.conversationId) {
      socket.to(data.conversationId).emit("typing:stop", {
        conversationId: data.conversationId,
        userId,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${userId} (${socket.id})`);
    const sockets = connectedUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        connectedUsers.delete(userId);
      }
    }
    broadcastOnlineUsers();
  });
});

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
app.use("/api/posts", postRoutes);
app.use("/api/knowledge", knowledgeRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Smart & Green City server running on port ${PORT}`);
  });
}

start().catch(console.error);
