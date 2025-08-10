import { Router } from 'express';
import { handleInputErrors } from '../middleware/validation';
import {
  validateAsistenciaBody,
  validateIdAsistencia,
  validateIdAsistenciaYaExiste,
} from '../middleware/Asistencia';
import { validateTipoQR } from '../middleware/ValidarTipoQR'; 
import { verificarToken } from '../middleware/VerificarToken';
import { AsistenciaControllers } from '../controllers/AsistenciaController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Obtener todas las asistencias
router.get('/', AsistenciaControllers.getAsistenciaAll);

// Obtener una asistencia por ID
router.get(
  '/:AsiId',
  validateIdAsistencia,
  handleInputErrors,
  AsistenciaControllers.getIdAsistencia
);

// Crear una asistencia
router.post(
  '/',
  validateIdAsistenciaYaExiste,
  validateAsistenciaBody,
  handleInputErrors,
  AsistenciaControllers.crearAsistencia
);

// Actualizar una asistencia por ID
router.put(
  '/:AsiId',
  validateIdAsistencia,
  validateAsistenciaBody,
  handleInputErrors,
  AsistenciaControllers.actualizarIdAsistencia
);

// Eliminar una asistencia
router.delete(
  '/:AsiId',
  validateIdAsistencia,
  handleInputErrors,
  AsistenciaControllers.eliminarIdAsistencia
);
router.get("/usuario/:id", AsistenciaControllers.getAsistenciasPorUsuario); // << esta


// 📌 Registrar por QR con token y validación de tipo
router.post(
  '/qr',
  verificarToken,
  validateTipoQR,        
  handleInputErrors,
  AsistenciaControllers.registrarDesdeQR
);

// 🧾 Historial por usuario
router.get("/historial/:IdUsuario", AsistenciaControllers.getHistorialAsistenciaPorUsuario);
router.get("/actividad/:IdActividad",authenticate,AsistenciaControllers.obtenerAsistenciasPorActividad);
router.post("/evento/qr", verificarToken, AsistenciaControllers.registrarDesdeQREvento);

router.get("/evento/:idEvento", AsistenciaControllers.getAsistenciaPorEvento);

export default router;
