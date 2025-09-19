import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import {
  validateAlquilerBody,
  validateIdAlquiler,
  validateIdAlquilerYaExiste,
  validateIdUsuario
} from '../middleware/AlquilerElementos';
import { verificarToken } from '../middleware/VerificarToken'; 
import { PrestamoElementosControllers } from '../controllers/PrestamoElementosControllers';
import { CatalogoController } from '../controllers/CatalogoAlquiler';
// 👇 Usa tu middleware de memoria
import { upload } from '../middleware/uploadConfig';

const router = Router();

// Obtener todos los alquileres
router.get('/', PrestamoElementosControllers.getPrestamoElementosAll);

// Crear un alquiler
router.post(
  '/',
  validateIdAlquilerYaExiste,
  validateAlquilerBody,
  handleInputErrors,
  PrestamoElementosControllers.crearAlquiler
);

// Actualizar un alquiler por ID
router.put(
  '/:IdAlquiler',
  validateIdAlquiler,
  validateAlquilerBody,
  handleInputErrors,
  PrestamoElementosControllers.actualizarIdAlquiler
);

// Eliminar un alquiler por ID
router.delete(
  '/:IdAlquiler',
  validateIdAlquiler,
  handleInputErrors,
  PrestamoElementosControllers.eliminarIdAlquiler
);

// Obtener alquileres por usuario
router.get(
  '/usuario/:IdUsuario',
  validateIdUsuario,
  handleInputErrors,
  PrestamoElementosControllers.getAlquileresPorUsuario
);

// Marcar devolución
router.put("/alquiler/:IdAlquiler/devolver", PrestamoElementosControllers.devolverElemento);

// Marcar cumplido
router.put("/alquiler/:IdAlquiler/cumplido", PrestamoElementosControllers.marcarComoCumplido);

// Registrar alquiler desde QR
router.post(
  '/desde-qr',
  verificarToken,
  PrestamoElementosControllers.registrarDesdeQR
);

router.post('/qr', verificarToken, PrestamoElementosControllers.registrarDesdeQR);

// 👇 Subir elementos al catálogo con Cloudinary (memoria)
router.post('/catalogo', upload.single('imagen'), (req, res) => {
  const io = req.app.get('io');
  (req as any).io = io;
  CatalogoController.subirElemento(req as any, res);
});

router.get('/catalogo', CatalogoController.getCatalogo);

router.put(
  '/catalogo/:IdAlquiler/imagen',
  upload.single('imagen'),
  CatalogoController.actualizarImagen
);

router.delete('/catalogo/:IdAlquiler', CatalogoController.eliminarElemento);

export default router;
