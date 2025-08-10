import type { Request } from "express";
import type { Server as IOServer } from "socket.io";

export interface CustomRequest extends Request {
  io?: IOServer;
}
