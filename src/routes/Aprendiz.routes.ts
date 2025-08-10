import { Router } from "express";
import { AprendizController } from "../controllers/AprendizController";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/subir-excel", upload.single("archivo"), AprendizController.subirDesdeExcel);
router.get("/listar", AprendizController.listarAprendices);

export default router;
