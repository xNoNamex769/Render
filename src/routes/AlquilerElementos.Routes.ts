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
import { PrestamoElementosControllers } from '../controllers/PrestamoElementosControllers'; // <-- corregido import
import multer from 'multer';
import { CatalogoController } from '../controllers/CatalogoAlquiler';

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
  verificarToken, // extrae IdUsuario desde token
  PrestamoElementosControllers.registrarDesdeQR
);

router.post('/qr', verificarToken, PrestamoElementosControllers.registrarDesdeQR);

// Configuración Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Subir elementos al catálogo
router.post('/catalogo', upload.single('imagen'), (req, res) => {
  const io = req.app.get('io');
  (req as any).io = io; // inyectamos socket.io si usas
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
