import { Router } from 'express';
import { EventoControllers } from '../controllers/EventoController';
import {validateEventoBody,validateIdEvento,validateNombreEventoUnico} from '../middleware/Evento';
import { handleInputErrors } from '../middleware/validation';
import { verificarToken } from "../middleware/VerificarToken"; // si usas token
import { authenticate } from '../middleware/auth';
import { AsistenciaControllers } from "../controllers/AsistenciaController";
const router = Router();

// Obtener todos los eventos
router.get('/', EventoControllers.getEventoAll);

// Obtener un evento por ID

router.get("/publicos", EventoControllers.obtenerEventosPublicos);
router.get("/usuario/:id", verificarToken, EventoControllers.obtenerEventosPorUsuario);
router.get('/:IdEvento',
  validateIdEvento,
  handleInputErrors,
  EventoControllers.getIdEvento
);
// Crear un nuevo evento (valida campos y nombre único)
router.post('/',
  validateEventoBody,
  validateNombreEventoUnico,
  handleInputErrors,
  EventoControllers.crearEvento
);

// Actualizar un evento por ID (valida campos, pero no verifica duplicados)
router.put('/:IdEvento',
  validateIdEvento,
  validateEventoBody,
  handleInputErrors,
  EventoControllers.actualizarIdEvento
);
router.get('/evento/mis-eventos', authenticate, EventoControllers.obtenerMisEventos);
router.post("/evento/qr", verificarToken, AsistenciaControllers.registrarDesdeQREvento);
// Eliminar un evento por ID
router.delete('/:IdEvento',
  validateIdEvento,
  handleInputErrors,
  EventoControllers.eliminarIdEvento
);

export default router;
