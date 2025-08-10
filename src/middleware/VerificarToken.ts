import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  IdUsuario: number;  // o el tipo de id que uses en el token
  // otros campos que tengas en el token
}

// Para extender el tipo Request y que acepte user:
declare module "express-serve-static-core" {
  interface Request {
    usuario?: JwtPayload;
  }
}

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ msg: "No autorizado. Token faltante." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ msg: "No autorizado. Token inválido." });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(403).json({ msg: "Token inválido." });
      return;
    }

    req.usuario = decoded as JwtPayload;
    next();
  });
};
