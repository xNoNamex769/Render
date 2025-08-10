import { Router } from "express";
import { HistorialSolicitudController } from "../controllers/HistorialSolicitudController";

const router = Router();

router.get('/solicitud/:idSolicitud', HistorialSolicitudController.obtenerHistorialPorSolicitud);
router.post('/', HistorialSolicitudController.crearHistorial);

export default router;
