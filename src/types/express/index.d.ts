import { Usuario } from "../../models/Usuario";

declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario;  // Aquí defines que `req.usuario` es tipo Usuario (o undefined)
    }
  }
}
