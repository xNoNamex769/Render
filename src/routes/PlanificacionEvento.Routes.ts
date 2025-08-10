import { Router } from 'express';
import { PlanificacionEventoControllers } from '../controllers/PlanificacionEventoController';
import { body } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth'; // <-- aquí usas tu middleware
 import { upload } from '../Uploads/Upload';
import { verificarToken } from '../middleware/VerificarToken';
const router = Router();
router.get('/',PlanificacionEventoControllers.getPlanificarEventoAll)
router.post(
  '/',
  authenticate,
  upload.single("ImagenEvento"), 
  body('NombreEvento').notEmpty().withMessage('El nombre del evento es requerido'),
  body('FechaEvento').notEmpty().withMessage('La fecha es requerida'),
  body('LugarDeEvento').notEmpty().withMessage('La ubicación es requerida'),
  handleInputErrors,
  PlanificacionEventoControllers.crearPlanificacion
);

router.get("/mis-eventos", verificarToken, PlanificacionEventoControllers.getMisEventos);
router.post(
  "/masivo",
  verificarToken,
  PlanificacionEventoControllers.crearEventosMasivos
);
router.get(
  "/trimestre/:anio/:trimestre",
  verificarToken,
  PlanificacionEventoControllers.obtenerEventosPorTrimestre
);
export default router;
