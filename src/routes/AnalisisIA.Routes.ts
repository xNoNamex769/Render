// src/routes/ia.routes.ts (por ejemplo)
import { Router } from 'express';

import { obtenerAnalisisUnificado } from '../controllers/obtenerAnalisisUnificado';
const router = Router();


router.get('/inteligencia/resumen', obtenerAnalisisUnificado)

export default router;
