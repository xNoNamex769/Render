import { Router } from "express";
import { EventoActividadController } from "../controllers/EventoActividadController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post(
  "/asociar",
  body("IdPlanificarE").isInt().withMessage("IdPlanificarE es requerido y debe ser entero"),
  body("actividades").isArray({ min: 1 }).withMessage("actividades debe ser un array con al menos una actividad"),
  handleInputErrors,
  EventoActividadController.asociarActividades
);

export default router;
