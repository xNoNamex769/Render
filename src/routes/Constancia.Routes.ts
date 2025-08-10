import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { validateConstanciaBody, validateIdConstancia, validateIdConstanciaYaExiste } from '../middleware/Constancia';
import { ConstanciaControllers } from '../controllers/ConstanciaController';
import { verificarToken } from "../middleware/VerificarToken";
const router = Router();

// Obtener todas las constancias
router.get('/', ConstanciaControllers.getConstanciaAll);

// Obtener una constancia por ID
router.get(
  '/:ConstanciaId',
  validateIdConstancia,  // Validación para el ID de constancia
  handleInputErrors,      // Middleware para manejar los errores de validación
  ConstanciaControllers.getIdConstancia
);

// Crear una nueva constancia
router.post("/", verificarToken, ConstanciaControllers.crearConstancia);

// Actualizar una constancia por ID
router.put(
  '/:ConstanciaId',
  validateIdConstancia,         // Validación para el ID de constancia
  validateConstanciaBody,       // Validación para los datos del cuerpo
  handleInputErrors,            // Middleware para manejar los errores de validación
  ConstanciaControllers.actualizarIdConstancia
);

router.get("/usuario/:idUsuario", ConstanciaControllers.obtenerPorUsuario);

router.get("/api/constancias", ConstanciaControllers.listarConstancias);
router.put("/aprobar/:id", ConstanciaControllers.aprobarConstancia);
router.get("/admin/todas", ConstanciaControllers.listarTodas);

// Eliminar una constancia por ID
router.delete(
  '/:ConstanciaId',
  validateIdConstancia,         // Validación para el ID de constancia
  handleInputErrors,            // Middleware para manejar los errores de validación
  ConstanciaControllers.eliminarIdConstancia
);




export default router;
