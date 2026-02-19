// src/sockets/socketServer.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173", // ← добавь в .env CLIENT_URL=http://localhost:5173
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // 60 секунд — таймаут без ответа
    pingInterval: 25000, // пинг каждые 25 сек
  });

  // Middleware авторизации для всех сокет-подключений
  io.use((socket, next) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: token required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, email, displayName } — как в твоём JWT
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // Базовое логирование подключений
  io.on("connection", (socket) => {
    console.log(
      `[SOCKET] Пользователь подключился: ${socket.user?.id || "аноним"} (${socket.id})`,
    );
  });

  return io;
};
