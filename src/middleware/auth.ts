import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {Usuario} from "../models/Usuario"; // usa `default` si exportaste así


declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario;
    }
  }
}

interface JwtPayload {
  IdUsuario: number;
  iat?: number;
  exp?: number;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
   res.status(401).json({ error: "No Autorizado" });
   return;
  }

  const token = bearer.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token no válido" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no está definido");

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (decoded && decoded.IdUsuario) {
      const usuario = await Usuario.findByPk(decoded.IdUsuario, {
        attributes: ["IdUsuario", "Nombre", "Correo"]
      });

      if (!usuario) {
         res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      req.usuario = usuario;
      return next();
    } else {
       res.status(401).json({ error: "Token inválido" });
       return;
    }
  } catch (error) {
   res.status(401).json({ error: "Token no válido o expirado" });
   return;
  }
};