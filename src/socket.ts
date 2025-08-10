import { Server } from "socket.io";

import { createServer } from "http";
import app from "./server"; // este es tu `express()` exportado en server.ts

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  const usuarioId = socket.handshake.query.usuarioId as string;

  if (usuarioId) {
    socket.join(`usuario_${usuarioId}`);
    console.log(`Socket ${socket.id} unido a room usuario_${usuarioId}`);
  }

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} desconectado`);
  });
});


export { io, httpServer };
