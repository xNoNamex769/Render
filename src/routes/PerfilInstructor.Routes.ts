import { Router } from 'express';
import { PerfilInstructorController } from '../controllers/PerfilInstructorController';

const router = Router();

router.post('/', PerfilInstructorController.crearPerfil);
router.get('/:UsuarioId', PerfilInstructorController.obtenerPorUsuarioId); // NUEVA
router.put('/:UsuarioId', PerfilInstructorController.actualizarPerfil);    
router.get('/instructores', PerfilInstructorController.listarInstructores);
router.get('/', PerfilInstructorController.listarInstructores);

export default router;
