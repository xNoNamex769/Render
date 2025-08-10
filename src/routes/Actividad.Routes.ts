import { Router } from 'express';
import { body,param } from 'express-validator';
import {ActividadControllers} from '../controllers/ActividadController';
import {handleInputErrors} from '../middleware/validation'
import {validateActividadBody,validateIdActividad, validateIdActividadYaExiste, } from '../middleware/Actividad';
import { upload } from '../Uploads/Upload';


const router = Router();

// Obtener todas las actividades
router.get('/', ActividadControllers.getActividadAll);
router.get('/noticias',ActividadControllers.getNoticias);
// Obtener una actividad por ID
router.get('/:IdActividad',
  validateIdActividad,
  handleInputErrors,
  ActividadControllers.getIdActividad
);

// Crear una actividad (nombre único)
router.post(
  '/',
  upload.single("Imagen"),
  (req, res, next) => {
    console.log("💡 Middleware alcanzado");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    next();
  },
 
  
  handleInputErrors,
  ActividadControllers.crearActividad
);


// Actualizar una actividad por ID (no se valida si el nombre ya existe)
router.put(
  '/:IdActividad',
  validateIdActividad,
  validateActividadBody,
  upload.single("Imagen") ,// si vas a permitir cambiar la imagen en el update

  handleInputErrors,
  ActividadControllers.actualizarIdActividad
);
router.get(
  '/evento/:IdEvento',
  param('IdEvento').isInt().withMessage('IdEvento debe ser un número entero'),
  handleInputErrors,
  ActividadControllers.getActividadesPorEvento
);

// Eliminar una actividad por ID
router.delete(
  '/:IdActividad',
  validateIdActividad,
  handleInputErrors,
  ActividadControllers.eliminarIdActividad
);


export default router;