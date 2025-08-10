import { Router } from 'express';
import { ResumenEventoIAController } from '../controllers/ResumenEventoIAController';

const router = Router();

router.post('/resumen', ResumenEventoIAController.generar);

export default router;
