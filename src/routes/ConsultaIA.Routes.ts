import { Router } from 'express';
import { body, param } from 'express-validator';
import { ConsultaIAControllers } from '../controllers/ConsultaIAController'; 
import { handleInputErrors } from '../middleware/validation';
import { validateConsultaIABody, validateIdConsultaIA, validateConsultaIAYaExiste } from '../middleware/ConsultaIA';

const router = Router();

// Obtener todas las consultas IA
router.get('/', ConsultaIAControllers.getConsultaIAAll);

// Obtener una consulta IA por ID
router.get(
  '/:IdConsultaIA',
  validateIdConsultaIA,   // Validar que el ID de consulta IA es correcto
  handleInputErrors,      // Manejar errores de validación
  ConsultaIAControllers.getIdConsultaIA
);

// Crear una consulta IA
router.post(
  '/',
  validateConsultaIAYaExiste, // Validar si la consulta IA con esa pregunta ya existe
  validateConsultaIABody,     // Validar los campos de la consulta IA
  handleInputErrors,          // Manejar errores de validación
  ConsultaIAControllers.crearConsultaIA
);

// Actualizar una consulta IA por ID
router.put(
  '/:IdConsultaIA',
  validateIdConsultaIA,   // Validar que el ID de consulta IA es correcto
  validateConsultaIABody, // Validar los campos de la consulta IA
  handleInputErrors,      // Manejar errores de validación
  ConsultaIAControllers.actualizarIdconsultaIa
);

// Eliminar una consulta IA por ID
router.delete(
  '/:IdConsultaIA',
  validateIdConsultaIA,   // Validar que el ID de consulta IA es correcto
  handleInputErrors,      // Manejar errores de validación
  ConsultaIAControllers.eliminarIdconsultaIa
);

export default router;
