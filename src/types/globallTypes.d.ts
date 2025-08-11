
import { Usuario } from "../models/Usuario"; // ajusta si tu modelo tiene más o menos campos

// src/globaltypes.d.ts
declare global {
  namespace Express {
    interface Request {
      Usuario?: {
        IdUsuario: number;
        IdRol: number; // <-- asegúrate de que esto esté
      };
    }
  }
}
