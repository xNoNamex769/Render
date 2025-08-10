import { Router } from "express";
import { LudicaController } from "../controllers/LudicaController";
import { upload } from '../Uploads/Upload';
import { verificarToken } from "../middleware/VerificarToken";

const router = Router();


router.get('/ludica-del-dia', LudicaController.getLudicaDelDia);
router.get("/", LudicaController.getTodasLasLudicas);

router.post("/", upload.single("Imagen"), LudicaController.crearLudica);
router.get("/mis-ludicas", verificarToken, LudicaController.getLudicasDelInstructor);
router.get("/asistentes/:id", verificarToken, LudicaController.getAsistentesPorLudica);
router.get("/horas/:idUsuario", LudicaController.getHorasLudicasPorUsuario);
router.get("/admin/resumen-ludicas", LudicaController.getResumenInteresPorLudica);


export default router;
