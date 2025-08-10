import { Request, Response, NextFunction } from "express";
import { Usuario } from "../models/Usuario";
import { RolUsuario } from "../models/RolUsuario";

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const IdUsuario = req.usuario?.IdUsuario;

    if (!IdUsuario) {
       res.status(401).json({ error: "No autenticado" });
       return;
    }

    // Buscar al usuario e incluir su rol
    const usuario = await Usuario.findByPk(IdUsuario, {
      include: [{ model: RolUsuario, as: "rol" }],
    });

    if (!usuario || usuario.rol?.NombreRol !== "Administrador") {
       res.status(403).json({ error: "No autorizado. Solo administradores." });
       return;
    }

    next();
  } catch (error) {
    console.error("Error en authorizeAdmin:", error);
     res.status(500).json({ error: "Error interno en la autorización." });
     return;
  }
};
