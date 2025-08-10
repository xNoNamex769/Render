import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController';
import { handleInputErrors } from '../middleware/validation';
import {validateIdFeedback,validateComentarioFeedbackUnico,validateFeedbackBody} from '../middleware/Feedback';

import { authFeedback } from '../middleware/authFeedback';

const router = Router();

// Obtener todos los feedbacks
router.get('/', FeedbackController.getAllFeedbacks);

// Obtener un feedback por ID
router.get(
  '/:IdFeedback',
  validateIdFeedback,
  handleInputErrors,
  FeedbackController.getFeedbackById 
);

// Crear un nuevo feedback
router.post(
  '/',
  validateComentarioFeedbackUnico,
  validateFeedbackBody,
  handleInputErrors,
  FeedbackController.crearFeedback
);

// Actualizar un feedback por ID
router.put(
  '/:IdFeedback',
  validateIdFeedback,
  validateFeedbackBody,
  handleInputErrors,
  FeedbackController.actualizarFeedbackById
);

// Eliminar un feedback por ID
router.delete(
  '/:IdFeedback',
  validateIdFeedback,
  handleInputErrors,
  FeedbackController.eliminarFeedbackById
);
// ----------------- RUTAS NUEVAS -----------------

// Obtener feedbacks por IdActividad (para mostrar en detalle de la actividad)
router.get(
  "/actividad/:IdActividad",
  handleInputErrors, // opcional: puedes omitir si no haces validación
  FeedbackController.getFeedbacksByActividad
);

// Obtener feedbacks de las actividades creadas por un usuario
router.get(
  '/mis-feedbacks/:IdUsuario',
  FeedbackController.getFeedbacksDeMisActividades
);

// Crear feedback asociado a una actividad
router.post(
  '/actividad',
  authFeedback,
  FeedbackController.crearFeedbackActividad
);
// Feedbacks para eventos
router.get('/evento/:IdEvento', FeedbackController.getFeedbacksByEvento);
router.post('/evento', authFeedback, FeedbackController.crearFeedbackEvento);


router.post("/solicitud", FeedbackController.crearFeedbackSolicitud);
router.get("/solicitud/:IdSolicitud", FeedbackController.obtenerPorSolicitud);
router.get('/estadisticas/promedio-tipo-ayuda', FeedbackController.getPromedioPorTipoAyuda);

export default router;