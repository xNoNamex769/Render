// src/middleware/authFeedback.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  IdUsuario: number;
  rol: number;
  iat?: number;
  exp?: number;
}

export const authFeedback = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(401).json({ error: "Token no proporcionado" });
     return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

   req.usuario = {
  IdUsuario: decoded.IdUsuario,
  IdRol: decoded.rol,
} as typeof req.usuario;


    next();
  } catch (err) {
     res.status(401).json({ error: "Token inválido o expirado" });
     return;
  }
};
