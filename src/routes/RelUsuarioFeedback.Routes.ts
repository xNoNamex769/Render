import { Router } from "express";
import { body, param} from 'express-validator'
import { RelusuarioFeedbackController } from "../controllers/RelUsuarioFeedbackController";
import { validateRelUsuarioFeedbackBody, validateRelUsuarioFeedbackYaExiste,  } from "../middleware/RelUsuarioFeedback";
import { handleInputErrors } from "../middleware/validation";

const router = Router();


router.get('/', 
    RelusuarioFeedbackController.getAll);

router.get('/:IdUsuario/:IdFeedback',
    validateRelUsuarioFeedbackBody,
    handleInputErrors,
    RelusuarioFeedbackController.getRelUsuarioFeedbakcId)


router.post(
  '/',
  validateRelUsuarioFeedbackYaExiste,
  validateRelUsuarioFeedbackBody,
  handleInputErrors,
  RelusuarioFeedbackController.CrearRelusuarios_Feedback
);


router.put(
  '/:IdUsuario/:IdFeedback',
  validateRelUsuarioFeedbackBody,
    handleInputErrors,
  RelusuarioFeedbackController.ActualizarRelusuarios_Feedback
);


router.delete(
  '/:IdUsuario/:IdFeedback',
  param('IdUsuario').isInt().withMessage('El IdUsuario debe ser un número entero')
  .custom(value => value >0).withMessage('El IdUsuario debe ser mayor que 0'),
  param('IdFeedback').isInt().withMessage('El IdFeedback debe ser un número entero')
  .custom(value => value > 0).withMessage('El IdFeedback debe ser mayor que 0'),
  handleInputErrors,
  RelusuarioFeedbackController.EliminarRelusuarios_Feedback
);

export default router;