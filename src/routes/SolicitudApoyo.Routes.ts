import { Router } from "express";
import { SolicitudApoyoController } from "../controllers/SolicitudApoyoController";
import { handleInputErrors } from "../middleware/validation";
import {
  validateIdSolicitudApoyo,
  validateDescripcionSolicitudApoyoYaExiste,
  validateSolicitudApoyoBody,
} from "../middleware/SolicitudApoyo";

const router = Router();

router.get("/", SolicitudApoyoController.getAllSolicitudApoyo);

router.get(
  "/:IdSolicitud",
  validateIdSolicitudApoyo,
  handleInputErrors,
  SolicitudApoyoController.getSolicitudApoyoId
);
router.get(
  "/encargados/:tipoAyuda",
  SolicitudApoyoController.getEncargadosPorTipoAyuda
);

router.post(
  "/",
  validateDescripcionSolicitudApoyoYaExiste,

  handleInputErrors,
  SolicitudApoyoController.CrearSolicitudApoyo
);

router.put(
  "/:IdSolicitud",
  validateIdSolicitudApoyo,

  handleInputErrors,
  SolicitudApoyoController.actualizarSolicitudAopoyo
);

router.delete(
  "/:IdSolicitud",
  validateIdSolicitudApoyo,
  handleInputErrors,
  SolicitudApoyoController.eliminarSolicitudApoyo
);

export default router;
