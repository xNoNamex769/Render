import { Router } from 'express';
import { IAcomentarioController } from '../controllers/IAcomentarioController';

const router = Router();

// Usamos el método de la clase, no la función directamente
router.post('/comentario', IAcomentarioController.generarComentario);
router.get("/recomendaciones/:IdEvento", IAcomentarioController.generarRecomendaciones);
export default router;
