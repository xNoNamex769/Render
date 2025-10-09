import { Router } from "express";
import { sendEmail } from "../controllers/SendEmailController";

const router = Router();

// Ruta POST para enviar el correo
router.post("/enviar-correo", sendEmail);

export default router;
