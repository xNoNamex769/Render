import { Request, Response, NextFunction } from "express";
import { param, body, validationResult } from "express-validator";
import { Feedback } from "../models/Feedback";

// Validar que el ID sea un número válido
export const validateIdFeedback = async (req: Request, res: Response, next: NextFunction) => {
  await param('IdFeedback')
    .isInt({ min: 1 }).withMessage('El ID del feedback debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  next();
};

// Validar que no exista un feedback duplicado (opcional si no quieres permitir duplicados)
export const validateComentarioFeedbackUnico = async (req: Request, res: Response, next: NextFunction) => {
  await body('ComentarioFeedback')
    .custom(async (value) => {
      const existente = await Feedback.findOne({
        where: { ComentarioFeedback: value }
      });
      if (existente) {
        throw new Error('Ya existe un feedback con el mismo comentario');
      }
      return true;
    })
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};

// Validar el cuerpo (body) del feedback
export const validateFeedbackBody = async (req: Request, res: Response, next: NextFunction) => {
  await body('ComentarioFeedback')
    .notEmpty().withMessage('El comentario no puede estar vacío')
    .isLength({ max: 500 }).withMessage('El comentario no puede tener más de 500 caracteres')
    .run(req);

  await body('FechaEnvio')
    .notEmpty().withMessage('La fecha de envío no puede estar vacía')
    .isISO8601().withMessage('La fecha de envío debe tener un formato válido (YYYY-MM-DD)')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  next();
};
