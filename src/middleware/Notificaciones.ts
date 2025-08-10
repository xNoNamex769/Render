import { Request, Response, NextFunction } from "express";
import { param, body, validationResult } from "express-validator";
import { Notificaciones } from "../models/Notificaciones";

// Validar el ID de la notificación
export const validateIdNotificacion = async (req: Request, res: Response, next: NextFunction) => {
  await param('IdNotificacion')
    .isInt({ min: 1 }).withMessage('El ID de la notificación debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  next();
};

// Validar el cuerpo de la notificación
export const validateNotificacionBody = async (req: Request, res: Response, next: NextFunction) => {
  await body('Mensaje')
    .notEmpty().withMessage('El mensaje no puede estar vacío')
    .isLength({ max: 500 }).withMessage('El mensaje no puede tener más de 500 caracteres')
    .run(req);

  await body('TiposNotificacion')
    .notEmpty().withMessage('El tipo de notificación no puede estar vacío')
    .isString().withMessage('El tipo de notificación debe ser un texto')
    .isLength({ max: 100 }).withMessage('El tipo de notificación no puede tener más de 100 caracteres')
    .run(req);

  await body('FechaDeEnvio')
    .notEmpty().withMessage('La fecha de envío no puede estar vacía')
    .isISO8601().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
    .run(req);

  await body('IdEvento')
    .notEmpty().withMessage('El ID del evento no puede estar vacío')
    .isInt({ min: 1 }).withMessage('El ID del evento debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  next();
};
