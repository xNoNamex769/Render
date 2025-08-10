import { Router } from "express";

import { GestionEventoController } from "../controllers/GestionEventoController";
import { handleInputErrors } from "../middleware/validation";
import { validateGestionEventoBody, validateGestionId } from "../middleware/GestionEvento";
import { verificarToken } from "../middleware/VerificarToken";
const GestionEventoRoute  = Router()

GestionEventoRoute.get("/",
    handleInputErrors,
    GestionEventoController.getAll)

GestionEventoRoute.get("/:id", 
    validateGestionId,
    handleInputErrors,
    GestionEventoController.getGestionEventoId)

GestionEventoRoute.post("/", 
    validateGestionEventoBody,
    handleInputErrors,
    GestionEventoController.crearGestioEvento)

GestionEventoRoute.put("/:id", 
    validateGestionId,
    validateGestionEventoBody,
    handleInputErrors,
    GestionEventoController.actualizarGestionEventoId)

GestionEventoRoute.delete("/:id",
    validateGestionId,
    handleInputErrors,
    GestionEventoController.eliminarGestionEventoId)

GestionEventoRoute.put("/aprobar/:id", verificarToken, GestionEventoController.aprobarGestionEvento);

GestionEventoRoute.put("/rechazar/:id",verificarToken, GestionEventoController.rechazarEvento);

export default GestionEventoRoute