const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "socket-server" });
});

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware to authenticate socket connections
io.use((socket, next) => {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;
    next();
  } catch {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Track presence: userId -> Set of rooms
const userRooms = new Map();

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join experiment room
  socket.on("join-experiment", (data) => {
    const { experimentId } = data;
    if (!experimentId) {
      socket.emit("error", { message: "experimentId is required" });
      return;
    }

    const room = `experiment:${experimentId}`;
    socket.join(room);

    // Track user's rooms
    if (!userRooms.has(socket.userId)) {
      userRooms.set(socket.userId, new Set());
    }
    userRooms.get(socket.userId).add(room);

    // Notify others in the room
    socket.to(room).emit("user-joined", {
      userId: socket.userId,
      experimentId,
    });

    // Send current presence in room
    const clients = io.sockets.adapter.rooms.get(room);
    if (clients) {
      const userIds = Array.from(clients)
        .map((id) => {
          const s = io.sockets.sockets.get(id);
          return s?.userId;
        })
        .filter(Boolean);

      socket.emit("presence-update", {
        experimentId,
        userIds,
      });
    }
  });

  // Leave experiment room
  socket.on("leave-experiment", (data) => {
    const { experimentId } = data;
    if (!experimentId) {
      return;
    }

    const room = `experiment:${experimentId}`;
    socket.leave(room);

    if (userRooms.has(socket.userId)) {
      userRooms.get(socket.userId).delete(room);
    }

    socket.to(room).emit("user-left", {
      userId: socket.userId,
      experimentId,
    });
  });

  // Cursor update for real-time collaboration
  socket.on("cursor-update", (data) => {
    const { experimentId, x, y } = data;
    if (!experimentId) {
      return;
    }

    const room = `experiment:${experimentId}`;
    socket.to(room).emit("cursor-update", {
      userId: socket.userId,
      x,
      y,
    });
  });

  // Experiment updated event (broadcast to room)
  socket.on("experiment-updated", (data) => {
    const { experimentId, delta } = data;
    if (!experimentId) {
      return;
    }

    const room = `experiment:${experimentId}`;
    io.to(room).emit("experiment-updated", {
      experimentId,
      delta,
      updatedBy: socket.userId,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);

    // Leave all rooms and notify
    if (userRooms.has(socket.userId)) {
      userRooms.get(socket.userId).forEach((room) => {
        socket.to(room).emit("user-left", {
          userId: socket.userId,
          experimentId: room.replace("experiment:", ""),
        });
      });
      userRooms.delete(socket.userId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
