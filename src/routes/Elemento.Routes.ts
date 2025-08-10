import { Router } from 'express';
import { ElementoController } from '../controllers/ElementoController';
import multer from 'multer';

const router = Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/', upload.single('imagen'), ElementoController.crearElemento);
router.get('/', ElementoController.getCatalogo);
router.delete('/:IdElemento', ElementoController.eliminarElemento);

export default router;
