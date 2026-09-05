

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const onlineUsers = new Map(); 

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("identify", (userId) => {
      if (!userId) return;
      socket.data.userId = userId;
      onlineUsers.set(userId, socket.id);
      io.emit("presence:update", Array.from(onlineUsers.keys()));
    });

    socket.on("room:join", (roomId) => {
      socket.join(roomId);
    });

    socket.on("room:leave", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("message:send", (payload) => {
      if (!payload?.roomId || !payload?.message) return;
      socket.to(payload.roomId).emit("message:new", payload.message);
    });

    socket.on("typing:start", ({ roomId, userId }) => {
      socket.to(roomId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ roomId, userId }) => {
      socket.to(roomId).emit("typing:stop", { userId });
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("presence:update", Array.from(onlineUsers.keys()));
      }
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

;